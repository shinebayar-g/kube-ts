import * as path from 'node:path';

export const k8sVersion = 'v1.32.0';
export const specDir = path.join(import.meta.dirname, '../openapi-spec', k8sVersion);

/**
 * Package the generated Kubernetes models are written into.
 */
export const packageDir = path.join(import.meta.dirname, '../../../packages/k8s');

/**
 * Resources left out of @kube-ts/k8s, with the types only they use (see removeUnused).
 * They're mostly intended to be used programmatically (e.g. reviews, requests),
 * rather than applied as manifests.
 */
export const unpublishedResources = new Set([
    'IoK8sApiCoreV1Binding',
    'IoK8sApiCoreV1Event',
    'IoK8sApiEventsV1Event',
    'IoK8sApiPolicyV1Eviction',
    // internal.apiserver.k8s.io
    'IoK8sApiApiserverinternalV1alpha1StorageVersion',
    // authorization.k8s.io
    'IoK8sApiAuthorizationV1LocalSubjectAccessReview',
    'IoK8sApiAuthorizationV1SelfSubjectAccessReview',
    'IoK8sApiAuthorizationV1SelfSubjectRulesReview',
    'IoK8sApiAuthorizationV1SubjectAccessReview',
    // authentication.k8s.io
    'IoK8sApiAuthenticationV1beta1SelfSubjectReview',
    'IoK8sApiAuthenticationV1SelfSubjectReview',
    'IoK8sApiAuthenticationV1TokenRequest',
    'IoK8sApiAuthenticationV1TokenReview',
]);
