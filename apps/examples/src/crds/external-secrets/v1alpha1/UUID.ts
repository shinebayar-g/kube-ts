import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

/**
 * UUID generates a version 1 UUID (e56657e3-764f-11ef-a397-65231a88c216).
 */
export interface UUIDArgs {
  readonly metadata?: NamespacedResourceMeta;
  /**
   * UUIDSpec controls the behavior of the uuid generator.
   */
  readonly spec?: {};
}

export class UUID extends NamespacedResource {
  declare readonly apiVersion: 'generators.external-secrets.io/v1alpha1';
  declare readonly kind: 'UUID';
  declare readonly spec: UUIDArgs['spec'];

  constructor(scope: Scope, name: string, args: UUIDArgs = {}) {
    super(scope, name, { apiVersion: 'generators.external-secrets.io/v1alpha1', kind: 'UUID', ...args });
  }
}
