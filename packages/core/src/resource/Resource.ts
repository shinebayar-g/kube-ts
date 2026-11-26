import * as yaml from 'yaml';
import type { ObjectMeta } from './ObjectMeta.ts';

export interface Scope {
    /**
     * Default namespace for namespaced resources created in this scope.
     */
    readonly namespace?: string;
    addResource(resource: Resource): void;
}

export interface NamespacedResourceMeta extends ObjectMeta {
    /**
     * Namespace defines the space within which each name must be unique.
     * An empty namespace is equivalent to the "default" namespace,
     * but "default" is the canonical representation.
     * Must be a DNS_LABEL. Cannot be updated.
     * More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces
     */
    namespace?: string;
}

// `type ClusterResourceMeta = ObjectMeta` cannot be used here because
// typescript was using `ObjectMeta` as a type identifier instead of `ClusterResourceMeta`
// which makes code completion, error messages look confusing.
export interface ClusterResourceMeta extends ObjectMeta {}

export interface ResourceArgs {
    readonly apiVersion: string;
    readonly kind: string;
    readonly metadata?: ClusterResourceMeta | NamespacedResourceMeta;
    readonly spec?: any;
    readonly [key: string]: any;
}

export interface ClusterResourceArgs extends ResourceArgs {
    readonly metadata?: ClusterResourceMeta;
}

export interface NamespacedResourceArgs extends ResourceArgs {
    readonly metadata?: NamespacedResourceMeta;
}

/**
 * Resource is the base class for all Kubernetes API resources.
 * Kubernetes resources can be either a ClusterResource or a NamespacedResource,
 * depending on the scope of the resource.
 *
 * Contract with @kube-ts/k8s: the generated models extend ClusterResource and
 * NamespacedResource and call their constructors. Changing these constructors or
 * the metadata types is a breaking change: bump core's minor version (0.x) and
 * republish @kube-ts/k8s with the new peer range.
 *
 * Can also be used directly as an escape hatch, e.g. for CRDs without generated code.
 */
export class Resource {
    readonly apiVersion: string;
    readonly kind: string;
    readonly metadata: ClusterResourceMeta | NamespacedResourceMeta;

    constructor(scope: Scope, name: string, args: ResourceArgs) {
        const { apiVersion, kind, metadata, ...rest } = args;
        this.apiVersion = apiVersion;
        this.kind = kind;
        // Keep the caller's key order when it set a name (e.g. Helm output); otherwise put `name` first.
        const resourceMeta = metadata?.name ? { ...metadata } : { name, ...metadata };
        resourceMeta.name ||= name;
        this.metadata = resourceMeta;
        // Everything else (spec, data, rules, ...) is copied as-is.
        Object.assign(this, rest);
        scope.addResource(this);
    }

    /**
     * The `metadata.name` of the resource.
     * A getter, so it isn't serialized into the manifest.
     */
    get name(): string {
        return this.metadata.name as string;
    }

    toYaml(): string {
        return yaml.stringify({ ...this }, { schema: 'yaml-1.1', aliasDuplicateObjects: false });
    }
}

/**
 * ClusterResource is the base class for all Kubernetes API
 * resources that are cluster-scoped.
 */
export class ClusterResource extends Resource {
    declare readonly metadata: ClusterResourceMeta;

    constructor(scope: Scope, name: string, args: ClusterResourceArgs) {
        super(scope, name, args);
    }
}

/**
 * NamespacedResource is the base class for all Kubernetes API
 * resources that are namespace-scoped.
 * `metadata.namespace` defaults to the scope's namespace (e.g. the App's).
 */
export class NamespacedResource extends Resource {
    declare readonly metadata: NamespacedResourceMeta;

    constructor(scope: Scope, name: string, args: NamespacedResourceArgs) {
        super(scope, name, {
            ...args,
            metadata: { ...args.metadata, namespace: args.metadata?.namespace ?? scope.namespace },
        });
    }
}
