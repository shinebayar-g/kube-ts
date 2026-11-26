import type { PodTemplateSpec } from './types/PodTemplateSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface PodTemplateArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly template?: PodTemplateSpec;
}

/**
 * PodTemplate describes a template for creating copies of a predefined pod.
 */
export class PodTemplate extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'PodTemplate';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * Template defines the pods that will be created from this pod template. https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly template?: PodTemplateSpec;

  constructor(scope: Scope, name: string, args: PodTemplateArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'PodTemplate', ...args });
  }
}
