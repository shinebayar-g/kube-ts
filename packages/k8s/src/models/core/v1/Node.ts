import type { NodeSpec } from './types/NodeSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface NodeArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: NodeSpec;
}

/**
 * Node is a worker node in Kubernetes. Each node will have a unique identifier in the cache (i.e. in etcd).
 */
export class Node extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'Node';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: ClusterResourceMeta;
  /**
   * Spec defines the behavior of a node. https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: NodeSpec;

  constructor(scope: Scope, name: string, args: NodeArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'Node', ...args });
  }
}
