import type { PersistentVolumeClaimSpec } from './types/PersistentVolumeClaimSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface PersistentVolumeClaimArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: PersistentVolumeClaimSpec;
}

/**
 * PersistentVolumeClaim is a user's request for and claim to a persistent volume
 */
export class PersistentVolumeClaim extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'PersistentVolumeClaim';
  /**
   * spec defines the desired characteristics of a volume requested by a pod author. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims
   */
  declare readonly spec?: PersistentVolumeClaimSpec;

  constructor(scope: Scope, name: string, args: PersistentVolumeClaimArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'PersistentVolumeClaim', ...args });
  }
}
