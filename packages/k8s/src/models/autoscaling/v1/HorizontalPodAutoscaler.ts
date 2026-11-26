import type { HorizontalPodAutoscalerSpec } from './types/HorizontalPodAutoscalerSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface HorizontalPodAutoscalerArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: HorizontalPodAutoscalerSpec;
}

/**
 * configuration of a horizontal pod autoscaler.
 */
export class HorizontalPodAutoscaler extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'autoscaling/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'HorizontalPodAutoscaler';
  /**
   * Standard object metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * spec defines the behaviour of autoscaler. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status.
   */
  declare readonly spec?: HorizontalPodAutoscalerSpec;

  constructor(scope: Scope, name: string, args: HorizontalPodAutoscalerArgs = {}) {
    super(scope, name, { apiVersion: 'autoscaling/v1', kind: 'HorizontalPodAutoscaler', ...args });
  }
}
