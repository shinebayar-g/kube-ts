import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

/**
 * Password generates a random password based on the
 * configuration parameters in spec.
 * You can specify the length, characterset and other attributes.
 */
export interface PasswordArgs {
  readonly metadata?: NamespacedResourceMeta;
  /**
   * PasswordSpec controls the behavior of the password generator.
   */
  readonly spec?: {
    /**
     * set AllowRepeat to true to allow repeating characters.
     */
    allowRepeat: boolean;
    /**
     * Digits specifies the number of digits in the generated
     * password. If omitted it defaults to 25% of the length of the password
     */
    digits?: number;
    /**
     * Length of the password to be generated.
     * Defaults to 24
     */
    length: number;
    /**
     * Set NoUpper to disable uppercase characters
     */
    noUpper: boolean;
    /**
     * SymbolCharacters specifies the special characters that should be used
     * in the generated password.
     */
    symbolCharacters?: string;
    /**
     * Symbols specifies the number of symbol characters in the generated
     * password. If omitted it defaults to 25% of the length of the password
     */
    symbols?: number;
  };
}

export class Password extends NamespacedResource {
  declare readonly apiVersion: 'generators.external-secrets.io/v1alpha1';
  declare readonly kind: 'Password';
  declare readonly metadata: NamespacedResourceMeta;
  declare readonly spec: PasswordArgs['spec'];

  constructor(scope: Scope, name: string, args: PasswordArgs = {}) {
    super(scope, name, { apiVersion: 'generators.external-secrets.io/v1alpha1', kind: 'Password', ...args });
  }
}
