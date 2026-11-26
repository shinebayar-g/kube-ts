import type { ResourceClaimTemplateSpec } from './types/ResourceClaimTemplateSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface ResourceClaimTemplateArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec: ResourceClaimTemplateSpec;
}

/**
 * ResourceClaimTemplate is used to produce ResourceClaim objects.  This is an alpha type and requires enabling the DynamicResourceAllocation feature gate.
 */
export class ResourceClaimTemplate extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'resource.k8s.io/v1alpha3';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ResourceClaimTemplate';
  /**
   * Describes the ResourceClaim that is to be generated.  This field is immutable. A ResourceClaim will get created by the control plane for a Pod when needed and then not get updated anymore.
   */
  declare readonly spec: ResourceClaimTemplateSpec;

  constructor(scope: Scope, name: string, args: ResourceClaimTemplateArgs) {
    super(scope, name, { apiVersion: 'resource.k8s.io/v1alpha3', kind: 'ResourceClaimTemplate', ...args });
  }
}
