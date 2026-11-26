import type { ReplicationControllerSpec } from './types/ReplicationControllerSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface ReplicationControllerArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: ReplicationControllerSpec;
}

/**
 * ReplicationController represents the configuration of a replication controller.
 */
export class ReplicationController extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ReplicationController';
  /**
   * If the Labels of a ReplicationController are empty, they are defaulted to be the same as the Pod(s) that the replication controller manages. Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * Spec defines the specification of the desired behavior of the replication controller. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: ReplicationControllerSpec;

  constructor(scope: Scope, name: string, args: ReplicationControllerArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'ReplicationController', ...args });
  }
}
