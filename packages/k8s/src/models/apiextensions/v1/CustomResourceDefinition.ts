import type { CustomResourceDefinitionSpec } from './types/CustomResourceDefinitionSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface CustomResourceDefinitionArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec: CustomResourceDefinitionSpec;
}

/**
 * CustomResourceDefinition represents a resource that should be exposed on the API server.  Its name MUST be in the format <.spec.name>.<.spec.group>.
 */
export class CustomResourceDefinition extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'apiextensions.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'CustomResourceDefinition';
  /**
   * spec describes how the user wants the resources to appear
   */
  declare readonly spec: CustomResourceDefinitionSpec;

  constructor(scope: Scope, name: string, args: CustomResourceDefinitionArgs) {
    super(scope, name, { apiVersion: 'apiextensions.k8s.io/v1', kind: 'CustomResourceDefinition', ...args });
  }
}
