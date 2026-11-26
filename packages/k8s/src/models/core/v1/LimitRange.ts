import type { LimitRangeSpec } from './types/LimitRangeSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface LimitRangeArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: LimitRangeSpec;
}

/**
 * LimitRange sets resource usage limits for each kind of resource in a Namespace.
 */
export class LimitRange extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'LimitRange';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * Spec defines the limits enforced. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: LimitRangeSpec;

  constructor(scope: Scope, name: string, args: LimitRangeArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'LimitRange', ...args });
  }
}
