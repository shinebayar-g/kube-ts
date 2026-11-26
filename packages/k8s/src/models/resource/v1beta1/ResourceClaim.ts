import type { ResourceClaimSpec } from './types/ResourceClaimSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface ResourceClaimArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec: ResourceClaimSpec;
}

/**
 * ResourceClaim describes a request for access to resources in the cluster, for use by workloads. For example, if a workload needs an accelerator device with specific properties, this is how that request is expressed. The status stanza tracks whether this claim has been satisfied and what specific resources have been allocated.  This is an alpha type and requires enabling the DynamicResourceAllocation feature gate.
 */
export class ResourceClaim extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'resource.k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ResourceClaim';
  /**
   * Spec describes what is being requested and how to configure it. The spec is immutable.
   */
  declare readonly spec: ResourceClaimSpec;

  constructor(scope: Scope, name: string, args: ResourceClaimArgs) {
    super(scope, name, { apiVersion: 'resource.k8s.io/v1beta1', kind: 'ResourceClaim', ...args });
  }
}
