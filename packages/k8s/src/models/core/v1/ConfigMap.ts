import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

export interface ConfigMapArgs {
  readonly metadata?: NamespacedResourceMeta;
  readonly binaryData?: {
    [key: string]: string;
  };
  readonly data?: {
    [key: string]: string;
  };
  readonly immutable?: boolean;
}

/**
 * ConfigMap holds configuration data for pods to consume.
 */
export class ConfigMap extends NamespacedResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'ConfigMap';
  /**
   * BinaryData contains the binary data. Each key must consist of alphanumeric characters, '-', '_' or '.'. BinaryData can contain byte sequences that are not in the UTF-8 range. The keys stored in BinaryData must not overlap with the ones in the Data field, this is enforced during validation process. Using this field will require 1.10+ apiserver and kubelet.
   */
  declare readonly binaryData?: {
    [key: string]: string;
  };
  /**
   * Data contains the configuration data. Each key must consist of alphanumeric characters, '-', '_' or '.'. Values with non-UTF-8 byte sequences must use the BinaryData field. The keys stored in Data must not overlap with the keys in the BinaryData field, this is enforced during validation process.
   */
  declare readonly data?: {
    [key: string]: string;
  };
  /**
   * Immutable, if set to true, ensures that data stored in the ConfigMap cannot be updated (only object metadata can be modified). If not set to true, the field can be modified at any time. Defaulted to nil.
   */
  declare readonly immutable?: boolean;

  constructor(scope: Scope, name: string, args: ConfigMapArgs = {}) {
    super(scope, name, { apiVersion: 'v1', kind: 'ConfigMap', ...args });
  }
}
