import type { CSIDriverSpec } from './types/CSIDriverSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface CSIDriverArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec: CSIDriverSpec;
}

/**
 * CSIDriver captures information about a Container Storage Interface (CSI) volume driver deployed on the cluster. Kubernetes attach detach controller uses this object to determine whether attach is required. Kubelet uses this object to determine whether pod information needs to be passed on mount. CSIDriver objects are non-namespaced.
 */
export class CSIDriver extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'storage.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'CSIDriver';
  /**
   * spec represents the specification of the CSI Driver.
   */
  declare readonly spec: CSIDriverSpec;

  constructor(scope: Scope, name: string, args: CSIDriverArgs) {
    super(scope, name, { apiVersion: 'storage.k8s.io/v1', kind: 'CSIDriver', ...args });
  }
}
