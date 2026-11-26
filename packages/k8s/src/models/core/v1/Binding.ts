import type { ObjectReference } from './types/ObjectReference.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface BindingArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly target: ObjectReference;
}

/**
 * Binding ties one object to another; for example, a pod is bound to a node by a scheduler.
 */
export class Binding extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'Binding';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * The target object that you want to bind to the standard object.
   */
  declare readonly target: ObjectReference;

  constructor(scope: Scope, name: string, args: BindingArgs) {
    super(scope, name, { apiVersion: 'v1', kind: 'Binding', ...args });
  }
}
