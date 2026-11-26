import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface PriorityClassArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly description?: string;
  readonly globalDefault?: boolean;
  readonly preemptionPolicy?: string;
  readonly value: number;
}

/**
 * PriorityClass defines mapping from a priority class name to the priority integer value. The value can be any valid integer.
 */
export class PriorityClass extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'scheduling.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'PriorityClass';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: ClusterResourceMeta;
  /**
   * description is an arbitrary string that usually provides guidelines on when this priority class should be used.
   */
  declare readonly description?: string;
  /**
   * globalDefault specifies whether this PriorityClass should be considered as the default priority for pods that do not have any priority class. Only one PriorityClass can be marked as `globalDefault`. However, if more than one PriorityClasses exists with their `globalDefault` field set to true, the smallest value of such global default PriorityClasses will be used as the default priority.
   */
  declare readonly globalDefault?: boolean;
  /**
   * preemptionPolicy is the Policy for preempting pods with lower priority. One of Never, PreemptLowerPriority. Defaults to PreemptLowerPriority if unset.
   */
  declare readonly preemptionPolicy?: string;
  /**
   * value represents the integer value of this priority class. This is the actual priority that pods receive when they have the name of this class in their pod spec.
   */
  declare readonly value: number;

  constructor(scope: Scope, name: string, args: PriorityClassArgs) {
    super(scope, name, { apiVersion: 'scheduling.k8s.io/v1', kind: 'PriorityClass', ...args });
  }
}
