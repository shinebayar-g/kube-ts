import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

/**
 * GithubAccessToken generates ghs_ accessToken
 */
export interface GithubAccessTokenArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly spec?: {
    appID: string;
    /**
     * Auth configures how ESO authenticates with a Github instance.
     */
    auth: {
      privateKey: {
        /**
         * A reference to a specific 'key' within a Secret resource.
         * In some instances, `key` is a required field.
         */
        secretRef: {
          /**
           * A key in the referenced Secret.
           * Some instances of this field may be defaulted, in others it may be required.
           */
          key?: string;
          /**
           * The name of the Secret resource being referred to.
           */
          name?: string;
          /**
           * The namespace of the Secret resource being referred to.
           * Ignored if referent is not cluster-scoped, otherwise defaults to the namespace of the referent.
           */
          namespace?: string;
        };
      };
    };
    installID: string;
    /**
     * Map of permissions the token will have. If omitted, defaults to all permissions the GitHub App has.
     */
    permissions?: {
      [k: string]: string;
    };
    /**
     * List of repositories the token will have access to. If omitted, defaults to all repositories the GitHub App
     * is installed to.
     */
    repositories?: string[];
    /**
     * URL configures the Github instance URL. Defaults to https://github.com/.
     */
    url?: string;
  };
}

export class GithubAccessToken extends NamespacedResource {
  declare readonly apiVersion: 'generators.external-secrets.io/v1alpha1';
  declare readonly kind: 'GithubAccessToken';
  declare readonly spec: GithubAccessTokenArgs['spec'];

  constructor(scope: Scope, name: string, args: GithubAccessTokenArgs = {}) {
    super(scope, name, { apiVersion: 'generators.external-secrets.io/v1alpha1', kind: 'GithubAccessToken', ...args });
  }
}
