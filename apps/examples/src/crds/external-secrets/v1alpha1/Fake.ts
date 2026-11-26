import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

/**
 * Fake generator is used for testing. It lets you define
 * a static set of credentials that is always returned.
 */
export interface FakeArgs {
  readonly metadata?: NamespacedResourceMeta;
  /**
   * FakeSpec contains the static data.
   */
  readonly spec?: {
    /**
     * Used to select the correct ESO controller (think: ingress.ingressClassName)
     * The ESO controller is instantiated with a specific controller name and filters VDS based on this property
     */
    controller?: string;
    /**
     * Data defines the static data returned
     * by this generator.
     */
    data?: {
      [k: string]: string;
    };
  };
}

export class Fake extends NamespacedResource {
  declare readonly apiVersion: 'generators.external-secrets.io/v1alpha1';
  declare readonly kind: 'Fake';
  declare readonly metadata: NamespacedResourceMeta;
  declare readonly spec: FakeArgs['spec'];

  constructor(scope: Scope, name: string, args: FakeArgs = {}) {
    super(scope, name, { apiVersion: 'generators.external-secrets.io/v1alpha1', kind: 'Fake', ...args });
  }
}
