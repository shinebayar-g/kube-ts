import type { VolumeAttachmentSpec } from './types/VolumeAttachmentSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface VolumeAttachmentArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec: VolumeAttachmentSpec;
}

/**
 * VolumeAttachment captures the intent to attach or detach the specified volume to/from the specified node.
 *
 * VolumeAttachment objects are non-namespaced.
 */
export class VolumeAttachment extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'storage.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'VolumeAttachment';
  /**
   * spec represents specification of the desired attach/detach volume behavior. Populated by the Kubernetes system.
   */
  declare readonly spec: VolumeAttachmentSpec;

  constructor(scope: Scope, name: string, args: VolumeAttachmentArgs) {
    super(scope, name, { apiVersion: 'storage.k8s.io/v1', kind: 'VolumeAttachment', ...args });
  }
}
