import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface VolumeAttributesClassArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly driverName: string;
  readonly parameters?: { [key: string]: string };
}

/**
 * VolumeAttributesClass represents a specification of mutable volume attributes defined by the CSI driver. The class can be specified during dynamic provisioning of PersistentVolumeClaims, and changed in the PersistentVolumeClaim spec after provisioning.
 */
export class VolumeAttributesClass extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'storage.k8s.io/v1alpha1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'VolumeAttributesClass';
  /**
   * Standard object\'s metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: ClusterResourceMeta;
  /**
   * Name of the CSI driver This field is immutable.
   */
  declare readonly driverName: string;
  /**
   * parameters hold volume attributes defined by the CSI driver. These values are opaque to the Kubernetes and are passed directly to the CSI driver. The underlying storage provider supports changing these attributes on an existing volume, however the parameters field itself is immutable. To invoke a volume update, a new VolumeAttributesClass should be created with new parameters, and the PersistentVolumeClaim should be updated to reference the new VolumeAttributesClass.  This field is required and must contain at least one key/value pair. The keys cannot be empty, and the maximum number of parameters is 512, with a cumulative max size of 256K. If the CSI driver rejects invalid parameters, the target PersistentVolumeClaim will be set to an \"Infeasible\" state in the modifyVolumeStatus field.
   */
  declare readonly parameters?: { [key: string]: string };

  constructor(scope: Scope, name: string, args: VolumeAttributesClassArgs) {
    super(scope, name, { apiVersion: 'storage.k8s.io/v1alpha1', kind: 'VolumeAttributesClass', ...args });
  }
}
