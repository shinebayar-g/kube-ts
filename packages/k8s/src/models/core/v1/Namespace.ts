import type { NamespaceSpec } from './types/NamespaceSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface NamespaceArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: NamespaceSpec;
}

/**
 * Namespace provides a scope for Names. Use of multiple namespaces is optional.
 */
export class Namespace extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'Namespace';
  /**
   * Spec defines the behavior of the Namespace. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: NamespaceSpec;

  constructor(scope: Scope, name: string, args: NamespaceArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'Namespace', ...args });
  }
}
