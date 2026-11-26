import type { HorizontalPodAutoscalerSpec } from './types/HorizontalPodAutoscalerSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface HorizontalPodAutoscalerArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: HorizontalPodAutoscalerSpec;
}

/**
 * HorizontalPodAutoscaler is the configuration for a horizontal pod autoscaler, which automatically manages the replica count of any resource implementing the scale subresource based on the metrics specified.
 */
export class HorizontalPodAutoscaler extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'autoscaling/v2';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'HorizontalPodAutoscaler';
  /**
   * metadata is the standard object metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * spec is the specification for the behaviour of the autoscaler. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status.
   */
  declare readonly spec?: HorizontalPodAutoscalerSpec;

  constructor(scope: Scope, name: string, args: HorizontalPodAutoscalerArgs = {}) {
    super(scope, name, { apiVersion: 'autoscaling/v2', kind: 'HorizontalPodAutoscaler', ...args });
  }
}
