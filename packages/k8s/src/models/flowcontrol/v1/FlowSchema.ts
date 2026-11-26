import type { FlowSchemaSpec } from './types/FlowSchemaSpec.ts';
import { type Scope, ClusterResource, type ClusterResourceMeta } from '@kube-ts/core';

export interface FlowSchemaArgs {
  readonly metadata?: ClusterResourceMeta;
  readonly spec?: FlowSchemaSpec;
}

/**
 * FlowSchema defines the schema of a group of flows. Note that a flow is made up of a set of inbound API requests with similar attributes and is identified by a pair of strings: the name of the FlowSchema and a \"flow distinguisher\".
 */
export class FlowSchema extends ClusterResource {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  declare readonly apiVersion: 'flowcontrol.apiserver.k8s.io/v1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  declare readonly kind: 'FlowSchema';
  /**
   * `spec` is the specification of the desired behavior of a FlowSchema. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  declare readonly spec?: FlowSchemaSpec;

  constructor(scope: Scope, name: string, args: FlowSchemaArgs = {}) {
    super(scope, name, { apiVersion: 'flowcontrol.apiserver.k8s.io/v1', kind: 'FlowSchema', ...args });
  }
}
