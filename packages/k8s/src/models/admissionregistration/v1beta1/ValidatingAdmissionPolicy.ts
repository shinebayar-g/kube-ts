import type { ValidatingAdmissionPolicySpec } from './types/ValidatingAdmissionPolicySpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface ValidatingAdmissionPolicyArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: ValidatingAdmissionPolicySpec;
}

/**
 * ValidatingAdmissionPolicy describes the definition of an admission validation policy that accepts or rejects an object without changing it.
 */
export class ValidatingAdmissionPolicy extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'admissionregistration.k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ValidatingAdmissionPolicy';
  /**
   * Specification of the desired behavior of the ValidatingAdmissionPolicy.
   */
  declare readonly spec?: ValidatingAdmissionPolicySpec;

  constructor(scope: Scope, name: string, args: ValidatingAdmissionPolicyArgs = {}) {
    super(scope, name, { apiVersion: 'admissionregistration.k8s.io/v1beta1', kind: 'ValidatingAdmissionPolicy', ...args });
  }
}
