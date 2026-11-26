import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as yaml from 'yaml';
import { clusterScopedKinds, kindWithGroup } from './resource/clusterScopedKinds.ts';
import {
    type NamespacedResourceMeta,
    Resource,
    type ResourceArgs,
    type Scope,
} from './resource/Resource.ts';

/**
 * A rendered chart object. Any top-level field (e.g. `webhooks`, `rules`) is accessible.
 */
export type HelmResource = Resource & { readonly [key: string]: any };

export interface HelmArgs {
    /**
     * Chart repository URL. Equivalent to `helm template --repo`.
     * @example "https://argoproj.github.io/argo-helm"
     */
    readonly repo?: string;
    /**
     * Chart URL or path.
     * @example "argo-cd"
     */
    readonly chart: string;
    /**
     * Chart version to use. Equivalent to `helm template --version`.
     * @example "1.2.3" or "^2.0.0"
     * @default "latest"
     */
    readonly version?: string;
    /**
     * Namespace to render the chart into. Equivalent to `helm template --namespace`.
     * Many charts don't set `metadata.namespace` (`helm install` adds it when applying),
     * so it's also filled in on rendered namespaced objects that don't have one.
     * @default the scope's namespace (e.g. the App's)
     */
    readonly namespace?: string;
    /**
     * Kubernetes version charts see as `.Capabilities.KubeVersion`.
     * Equivalent to `helm template --kube-version`.
     * @example "1.33.0"
     * @default helm's built-in default
     */
    readonly kubeVersion?: string;
    /**
     * Extra API versions charts see in `.Capabilities.APIVersions`.
     * Equivalent to `helm template --api-versions`.
     * @example ["monitoring.coreos.com/v1", "cert-manager.io/v1"]
     */
    readonly apiVersions?: string[];
    /**
     * Include the chart's CRDs (its `crds/` directory) in the output.
     * Equivalent to `helm template --include-crds`.
     * @default false
     */
    readonly includeCrds?: boolean;
    /**
     * Leave out the chart's test hooks (`helm test` resources).
     * Equivalent to `helm template --skip-tests`.
     * @default false
     */
    readonly skipTests?: boolean;
    /**
     * Values files to pass to the chart, in order (later files win).
     * Equivalent to `helm template --values`. `valuesObject` is applied after these.
     * @example ["./values.yaml", "./values.prod.yaml"]
     */
    readonly valuesFiles?: string[];
    /**
     * Values to pass to the chart. Equivalent to `helm template --values values.yaml`.
     * Content should be yaml parsable.
     * Temporary `values.yaml` file will be created and passed to `helm template`.
     */
    readonly valuesObject?: { [key: string]: any };
    /**
     * Kinds from this chart that are cluster-scoped but unknown to kube-ts, as `Kind.group`
     * (like kubectl). Built-in kinds and kinds whose CRD is in the chart's output are
     * detected automatically; any other kind is treated as namespaced.
     * @example ["ClusterIssuer.cert-manager.io"]
     */
    readonly clusterScopedKinds?: string[];
    /**
     * Decides which rendered objects are kept. Return `false` to leave an object out,
     * e.g. a Namespace you create yourself or the chart's test pods.
     * Runs before namespace defaulting.
     * @example (obj) => obj.kind !== 'Namespace'
     */
    readonly filter?: (obj: ResourceArgs) => boolean;
    /**
     * Additional arguments for `helm template`, one item per argument.
     * @example ["--set", "key1=val1", "--set", "key2=val2", "--no-hooks"]
     */
    readonly helmFlags?: string[];
}

/**
 * @link https://helm.sh/docs/helm/helm_install/
 * @link https://helm.sh/docs/helm/helm_template/
 */
export class Helm {
    /**
     * The rendered objects that were kept, in chart order. They're the same objects the
     * scope saves, so changing one changes the output. Use `filter` to leave objects out.
     */
    readonly resources: readonly HelmResource[];

    /**
     * Renders the chart with `helm template` and adds every rendered object to `scope`.
     * Throws if helm isn't installed or rendering fails.
     */
    constructor(scope: Scope, name: string, args: HelmArgs) {
        const resources: HelmResource[] = [];
        this.resources = resources;
        const namespace = args.namespace ?? scope.namespace;
        const helmArgs = ['template', name, args.chart];
        if (args.repo) {
            helmArgs.push('--repo', args.repo);
        }
        if (args.version) {
            helmArgs.push('--version', args.version);
        }
        if (namespace) {
            helmArgs.push('--namespace', namespace);
        }
        if (args.kubeVersion) {
            helmArgs.push('--kube-version', args.kubeVersion);
        }
        for (const apiVersion of args.apiVersions ?? []) {
            helmArgs.push('--api-versions', apiVersion);
        }
        if (args.includeCrds) {
            helmArgs.push('--include-crds');
        }
        if (args.skipTests) {
            helmArgs.push('--skip-tests');
        }
        for (const valuesFile of args.valuesFiles ?? []) {
            helmArgs.push('--values', valuesFile);
        }

        let tmpValuesDir: string | undefined;
        try {
            if (args.valuesObject) {
                tmpValuesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kube-ts-helm-values-'));
                const valuesFile = path.join(tmpValuesDir, 'values.yaml');
                fs.writeFileSync(
                    valuesFile,
                    yaml.stringify(args.valuesObject, {
                        schema: 'yaml-1.1',
                        aliasDuplicateObjects: false,
                        lineWidth: 0,
                    }),
                );
                helmArgs.push('--values', valuesFile);
            }
            helmArgs.push(...(args.helmFlags ?? []));

            const objects = parseHelmOutput(name, runHelm(helmArgs));
            const isClusterScoped = clusterScopeChecker(objects, args.clusterScopedKinds);
            for (const obj of objects) {
                if (args.filter && !args.filter(obj)) {
                    continue;
                }
                if (!obj.metadata?.name) {
                    const hint = obj.metadata?.generateName
                        ? ` It uses generateName, which kube-ts doesn't support; leave it out with \`filter\`.`
                        : '';
                    throw new Error(
                        `Chart '${name}' rendered ${kindWithGroup(obj.apiVersion, obj.kind)} without metadata.name.${hint}`,
                    );
                }
                const metadata = obj.metadata as NamespacedResourceMeta;
                if (namespace && !metadata.namespace && !isClusterScoped(obj)) {
                    metadata.namespace = namespace;
                }
                // Plain Resource: the namespace is settled above, so don't default it again.
                resources.push(new Resource(scope, obj.metadata.name, obj));
            }
        } finally {
            if (tmpValuesDir) {
                fs.rmSync(tmpValuesDir, { recursive: true, force: true });
            }
        }
    }
}

/**
 * Parses `helm template` output into objects. Empty documents are skipped and
 * `kind: List` documents are flattened into their items.
 */
function parseHelmOutput(name: string, output: string): ResourceArgs[] {
    const objects: ResourceArgs[] = [];
    const add = (value: unknown) => {
        if (value === null || value === undefined) {
            return;
        }
        const obj = value as Partial<ResourceArgs>;
        if (typeof obj !== 'object' || !obj.apiVersion || !obj.kind) {
            throw new Error(
                `Chart '${name}' rendered a document that isn't a Kubernetes object (missing apiVersion or kind).`,
            );
        }
        if (obj.kind.endsWith('List') && Array.isArray(obj['items'])) {
            obj['items'].forEach(add);
        } else {
            objects.push(obj as ResourceArgs);
        }
    };
    for (const doc of yaml.parseAllDocuments(output)) {
        if (doc.errors.length) {
            throw new Error(`Failed to parse helm output for '${name}': ${doc.errors.join('; ')}`);
        }
        add(doc.toJS());
    }
    return objects;
}

/**
 * Tells cluster-scoped objects apart from namespaced ones: built-in kinds, CRDs in the
 * same output (their `spec.scope`), and kinds the user listed. Anything else is namespaced.
 */
function clusterScopeChecker(objects: ResourceArgs[], extra: string[] = []) {
    const clusterScoped = new Set([...clusterScopedKinds, ...extra]);
    for (const obj of objects) {
        if (
            kindWithGroup(obj.apiVersion, obj.kind) ===
                'CustomResourceDefinition.apiextensions.k8s.io' &&
            obj['spec']?.scope === 'Cluster'
        ) {
            clusterScoped.add(`${obj['spec'].names.kind}.${obj['spec'].group}`);
        }
    }
    return (obj: ResourceArgs) => clusterScoped.has(kindWithGroup(obj.apiVersion, obj.kind));
}

function runHelm(args: string[]): string {
    try {
        return execFileSync('helm', args, {
            encoding: 'utf-8',
            // Rendered charts can be several MB; the 1 MiB default would kill helm (ENOBUFS).
            maxBuffer: Infinity,
            // Show helm's own error messages directly.
            stdio: ['ignore', 'pipe', 'inherit'],
        });
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
            throw new Error('helm is not installed or not on PATH.');
        }
        throw new Error(`helm ${args.join(' ')} failed`, { cause: e });
    }
}
