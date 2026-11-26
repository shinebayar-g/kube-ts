import type { CronJobSpec } from './types/CronJobSpec.ts';
import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface CronJobArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: CronJobSpec;
}

/**
 * CronJob represents the configuration of a single cron job.
 */
export class CronJob extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'batch/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'CronJob';
  /**
   * Specification of the desired behavior of a cron job, including the schedule. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: CronJobSpec;

  constructor(scope: Scope, name: string, args: CronJobArgs = {}) {
    super(scope, name, { apiVersion: 'batch/v1', kind: 'CronJob', ...args });
  }
}
