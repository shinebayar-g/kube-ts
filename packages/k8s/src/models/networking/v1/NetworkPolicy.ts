import type { NetworkPolicySpec } from './types/NetworkPolicySpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface NetworkPolicyArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: NetworkPolicySpec;
}

/**
 * NetworkPolicy describes what network traffic is allowed for a set of Pods
 */
export class NetworkPolicy extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'networking.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'NetworkPolicy';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * spec represents the specification of the desired behavior for this NetworkPolicy.
   */
  declare readonly spec?: NetworkPolicySpec;

  constructor(scope: Scope, name: string, args: NetworkPolicyArgs = {}) {
    super(scope, name, { apiVersion: 'networking.k8s.io/v1', kind: 'NetworkPolicy', ...args });
  }
}
