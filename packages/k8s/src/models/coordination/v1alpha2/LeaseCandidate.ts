import type { LeaseCandidateSpec } from './types/LeaseCandidateSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface LeaseCandidateArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: LeaseCandidateSpec;
}

/**
 * LeaseCandidate defines a candidate for a Lease object. Candidates are created such that coordinated leader election will pick the best leader from the list of candidates.
 */
export class LeaseCandidate extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'coordination.k8s.io/v1alpha2';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'LeaseCandidate';
  /**
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
   */
  declare readonly metadata: NamespacedResourceMeta;
  /**
   * spec contains the specification of the Lease. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: LeaseCandidateSpec;

  constructor(scope: Scope, name: string, args: LeaseCandidateArgs = {}) {
    super(scope, name, { apiVersion: 'coordination.k8s.io/v1alpha2', kind: 'LeaseCandidate', ...args });
  }
}
