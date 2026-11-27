import type { APIServiceSpec } from './types/APIServiceSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface APIServiceArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: APIServiceSpec;
}

/**
 * APIService represents a server for a particular GroupVersion. Name must be "version.group".
 */
export class APIService extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'apiregistration.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'APIService';
  /**
   * Spec contains information for locating and communicating with a server
   */
  declare readonly spec?: APIServiceSpec;

  constructor(scope: Scope, name: string, args: APIServiceArgs = {}) {
    super(scope, name, { apiVersion: 'apiregistration.k8s.io/v1', kind: 'APIService', ...args });
  }
}
