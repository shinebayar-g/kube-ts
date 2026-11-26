import type { RoleRef } from './types/RoleRef.ts';
import type { Subject } from './types/Subject.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface ClusterRoleBindingArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly roleRef: RoleRef;
  readonly subjects?: Array<Subject>;
}

/**
 * ClusterRoleBinding references a ClusterRole, but not contain it.  It can reference a ClusterRole in the global namespace, and adds who information via Subject.
 */
export class ClusterRoleBinding extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'rbac.authorization.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ClusterRoleBinding';
  /**
   * RoleRef can only reference a ClusterRole in the global namespace. If the RoleRef cannot be resolved, the Authorizer must return an error. This field is immutable.
   */
  declare readonly roleRef: RoleRef;
  /**
   * Subjects holds references to the objects the role applies to.
   */
  declare readonly subjects?: Array<Subject>;

  constructor(scope: Scope, name: string, args: ClusterRoleBindingArgs) {
    super(scope, name, { apiVersion: 'rbac.authorization.k8s.io/v1', kind: 'ClusterRoleBinding', ...args });
  }
}
