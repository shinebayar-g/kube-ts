import type { ResourceQuotaSpec } from './types/ResourceQuotaSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface ResourceQuotaArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: ResourceQuotaSpec;
}

/**
 * ResourceQuota sets aggregate quota restrictions enforced per namespace
 */
export class ResourceQuota extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ResourceQuota';
  /**
   * Spec defines the desired quota. https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: ResourceQuotaSpec;

  constructor(scope: Scope, name: string, args: ResourceQuotaArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'ResourceQuota', ...args });
  }
}
