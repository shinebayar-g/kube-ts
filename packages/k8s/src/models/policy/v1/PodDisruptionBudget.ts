import type { PodDisruptionBudgetSpec } from './types/PodDisruptionBudgetSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface PodDisruptionBudgetArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: PodDisruptionBudgetSpec;
}

/**
 * PodDisruptionBudget is an object to define the max disruption that can be caused to a collection of pods
 */
export class PodDisruptionBudget extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'policy/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'PodDisruptionBudget';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * Specification of the desired behavior of the PodDisruptionBudget.
   */
  declare readonly spec?: PodDisruptionBudgetSpec;

  constructor(scope: Scope, name: string, args: PodDisruptionBudgetArgs = {}) {
    super(scope, name, { apiVersion: 'policy/v1', kind: 'PodDisruptionBudget', ...args });
  }
}
