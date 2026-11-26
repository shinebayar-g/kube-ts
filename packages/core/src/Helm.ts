import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as yaml from 'yaml';
import { Resource, type Scope } from './resource/Resource.ts';

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
     * Namespace scope for this request.
     * Equivalent to `helm template --namespace`.
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
    readonly resources: HelmResource[] = [];

    /**
     * Renders the chart with `helm template` and adds every rendered object to `scope`.
     * Throws if helm isn't installed or rendering fails.
     */
    constructor(scope: Scope, name: string, args: HelmArgs) {
        const helmArgs = ['template', name, args.chart];
        if (args.repo) {
            helmArgs.push('--repo', args.repo);
        }
        if (args.version) {
            helmArgs.push('--version', args.version);
        }
        if (args.namespace) {
            helmArgs.push('--namespace', args.namespace);
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

            const output = runHelm(helmArgs);
            for (const doc of yaml.parseAllDocuments(output)) {
                if (doc.errors.length) {
                    throw new Error(
                        `Failed to parse helm output for '${name}': ${doc.errors.join('; ')}`,
                    );
                }
                const helmObj = doc.toJS();
                if (helmObj !== null) {
                    // Plain Resource: Helm already rendered the namespace (if any), so don't default it.
                    this.resources.push(new Resource(scope, helmObj.metadata.name, helmObj));
                }
            }
        } finally {
            if (tmpValuesDir) {
                fs.rmSync(tmpValuesDir, { recursive: true, force: true });
            }
        }
    }
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
