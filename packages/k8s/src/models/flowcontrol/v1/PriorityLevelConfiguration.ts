import type { PriorityLevelConfigurationSpec } from './types/PriorityLevelConfigurationSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface PriorityLevelConfigurationArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: PriorityLevelConfigurationSpec;
}

/**
 * PriorityLevelConfiguration represents the configuration of a priority level.
 */
export class PriorityLevelConfiguration extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'flowcontrol.apiserver.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'PriorityLevelConfiguration';
  /**
   * `metadata` is the standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: ClusterResourceMeta;
  /**
   * `spec` is the specification of the desired behavior of a \"request-priority\". More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: PriorityLevelConfigurationSpec;

  constructor(scope: Scope, name: string, args: PriorityLevelConfigurationArgs = {}) {
    super(scope, name, { apiVersion: 'flowcontrol.apiserver.k8s.io/v1', kind: 'PriorityLevelConfiguration', ...args });
  }
}
