import type { StatefulSetSpec } from './types/StatefulSetSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface StatefulSetArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: StatefulSetSpec;
}

/**
 * StatefulSet represents a set of pods with consistent identities. Identities are defined as:
 *   - Network: A single stable DNS and hostname.
 *   - Storage: As many VolumeClaims as requested.
 *
 * The StatefulSet guarantees that a given network identity will always map to the same storage identity.
 */
export class StatefulSet extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'apps/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'StatefulSet';
  /**
   * Spec defines the desired identities of pods in this set.
   */
  declare readonly spec?: StatefulSetSpec;

  constructor(scope: Scope, name: string, args: StatefulSetArgs = {}) {
    super(scope, name, { apiVersion: 'apps/v1', kind: 'StatefulSet', ...args });
  }
}
