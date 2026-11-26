import type { JobSpec } from './types/JobSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface JobArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: JobSpec;
}

/**
 * Job represents the configuration of a single job.
 */
export class Job extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'batch/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'Job';
  /**
   * Specification of the desired behavior of a job. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: JobSpec;

  constructor(scope: Scope, name: string, args: JobArgs = {}) {
    super(scope, name, { apiVersion: 'batch/v1', kind: 'Job', ...args });
  }
}
