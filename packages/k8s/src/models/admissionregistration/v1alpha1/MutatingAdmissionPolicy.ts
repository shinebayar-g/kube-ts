import type { MutatingAdmissionPolicySpec } from './types/MutatingAdmissionPolicySpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface MutatingAdmissionPolicyArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: MutatingAdmissionPolicySpec;
}

/**
 * MutatingAdmissionPolicy describes the definition of an admission mutation policy that mutates the object coming into admission chain.
 */
export class MutatingAdmissionPolicy extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'admissionregistration.k8s.io/v1alpha1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'MutatingAdmissionPolicy';
  /**
   * Standard object metadata; More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata.
   */
  declare readonly metadata: ClusterResourceMeta;
  /**
   * Specification of the desired behavior of the MutatingAdmissionPolicy.
   */
  declare readonly spec?: MutatingAdmissionPolicySpec;

  constructor(scope: Scope, name: string, args: MutatingAdmissionPolicyArgs = {}) {
    super(scope, name, { apiVersion: 'admissionregistration.k8s.io/v1alpha1', kind: 'MutatingAdmissionPolicy', ...args });
  }
}
