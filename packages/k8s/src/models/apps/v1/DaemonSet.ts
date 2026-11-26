import type { DaemonSetSpec } from './types/DaemonSetSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface DaemonSetArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: DaemonSetSpec;
}

/**
 * DaemonSet represents the configuration of a daemon set.
 */
export class DaemonSet extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'apps/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'DaemonSet';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * The desired behavior of this daemon set. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: DaemonSetSpec;

  constructor(scope: Scope, name: string, args: DaemonSetArgs = {}) {
    super(scope, name, { apiVersion: 'apps/v1', kind: 'DaemonSet', ...args });
  }
}
