import type { DeploymentSpec } from './types/DeploymentSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface DeploymentArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: DeploymentSpec;
}

/**
 * Deployment enables declarative updates for Pods and ReplicaSets.
 */
export class Deployment extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'apps/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'Deployment';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * Specification of the desired behavior of the Deployment.
   */
  declare readonly spec?: DeploymentSpec;

  constructor(scope: Scope, name: string, args: DeploymentArgs = {}) {
    super(scope, name, { apiVersion: 'apps/v1', kind: 'Deployment', ...args });
  }
}
