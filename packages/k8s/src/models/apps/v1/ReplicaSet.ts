import type { ReplicaSetSpec } from './types/ReplicaSetSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface ReplicaSetArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: ReplicaSetSpec;
}

/**
 * ReplicaSet ensures that a specified number of pod replicas are running at any given time.
 */
export class ReplicaSet extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'apps/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ReplicaSet';
  /**
   * Spec defines the specification of the desired behavior of the ReplicaSet. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: ReplicaSetSpec;

  constructor(scope: Scope, name: string, args: ReplicaSetArgs = {}) {
    super(scope, name, { apiVersion: 'apps/v1', kind: 'ReplicaSet', ...args });
  }
}
