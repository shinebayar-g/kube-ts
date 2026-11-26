import type { StorageVersionMigrationSpec } from './types/StorageVersionMigrationSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface StorageVersionMigrationArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: StorageVersionMigrationSpec;
}

/**
 * StorageVersionMigration represents a migration of stored data to the latest storage version.
 */
export class StorageVersionMigration extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'storagemigration.k8s.io/v1alpha1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'StorageVersionMigration';
  /**
   * Specification of the migration.
   */
  declare readonly spec?: StorageVersionMigrationSpec;

  constructor(scope: Scope, name: string, args: StorageVersionMigrationArgs = {}) {
    super(scope, name, { apiVersion: 'storagemigration.k8s.io/v1alpha1', kind: 'StorageVersionMigration', ...args });
  }
}
