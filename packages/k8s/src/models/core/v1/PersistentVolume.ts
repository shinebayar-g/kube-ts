import type { PersistentVolumeSpec } from './types/PersistentVolumeSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface PersistentVolumeArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: PersistentVolumeSpec;
}

/**
 * PersistentVolume (PV) is a storage resource provisioned by an administrator. It is analogous to a node. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes
 */
export class PersistentVolume extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'PersistentVolume';
  /**
   * spec defines a specification of a persistent volume owned by the cluster. Provisioned by an administrator. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistent-volumes
   */
  declare readonly spec?: PersistentVolumeSpec;

  constructor(scope: Scope, name: string, args: PersistentVolumeArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'PersistentVolume', ...args });
  }
}
