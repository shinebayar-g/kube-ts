import type { MutatingAdmissionPolicyBindingSpec } from './types/MutatingAdmissionPolicyBindingSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface MutatingAdmissionPolicyBindingArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: MutatingAdmissionPolicyBindingSpec;
}

/**
 * MutatingAdmissionPolicyBinding binds the MutatingAdmissionPolicy with parametrized resources. MutatingAdmissionPolicyBinding and the optional parameter resource together define how cluster administrators configure policies for clusters.
 *
 * For a given admission request, each binding will cause its policy to be evaluated N times, where N is 1 for policies/bindings that don't use params, otherwise N is the number of parameters selected by the binding. Each evaluation is constrained by a [runtime cost budget](https://kubernetes.io/docs/reference/using-api/cel/#runtime-cost-budget).
 *
 * Adding/removing policies, bindings, or params can not affect whether a given (policy, binding, param) combination is within its own CEL budget.
 */
export class MutatingAdmissionPolicyBinding extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'admissionregistration.k8s.io/v1alpha1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'MutatingAdmissionPolicyBinding';
  /**
   * Specification of the desired behavior of the MutatingAdmissionPolicyBinding.
   */
  declare readonly spec?: MutatingAdmissionPolicyBindingSpec;

  constructor(scope: Scope, name: string, args: MutatingAdmissionPolicyBindingArgs = {}) {
    super(scope, name, { apiVersion: 'admissionregistration.k8s.io/v1alpha1', kind: 'MutatingAdmissionPolicyBinding', ...args });
  }
}
