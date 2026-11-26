import type { ValidatingWebhook } from './types/ValidatingWebhook.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface ValidatingWebhookConfigurationArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly webhooks?: Array<ValidatingWebhook>;
}

/**
 * ValidatingWebhookConfiguration describes the configuration of and admission webhook that accept or reject and object without changing it.
 */
export class ValidatingWebhookConfiguration extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'admissionregistration.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ValidatingWebhookConfiguration';
  /**
   * Standard object metadata; More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata.
   */
  declare readonly metadata: ClusterResourceMeta;
  /**
   * Webhooks is a list of webhooks and the affected resources and operations.
   */
  declare readonly webhooks?: Array<ValidatingWebhook>;

  constructor(scope: Scope, name: string, args: ValidatingWebhookConfigurationArgs = {}) {
    super(scope, name, { apiVersion: 'admissionregistration.k8s.io/v1', kind: 'ValidatingWebhookConfiguration', ...args });
  }
}
