import type { PolicyRule } from './types/PolicyRule.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface RoleArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly rules?: Array<PolicyRule>;
}

/**
 * Role is a namespaced, logical grouping of PolicyRules that can be referenced as a unit by a RoleBinding.
 */
export class Role extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'rbac.authorization.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'Role';
  /**
   * Rules holds all the PolicyRules for this Role
   */
  declare readonly rules?: Array<PolicyRule>;

  constructor(scope: Scope, name: string, args: RoleArgs = {}) {
    super(scope, name, { apiVersion: 'rbac.authorization.k8s.io/v1', kind: 'Role', ...args });
  }
}
