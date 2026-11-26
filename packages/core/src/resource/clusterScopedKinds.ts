/**
 * Built-in cluster-scoped kinds, as `Kind.group` (core group: just `Kind`), the same
 * format kubectl uses. Every other built-in kind is namespaced.
 *
 * From the Kubernetes 1.32 API (tools/codegen/schemas.json). Add new cluster-scoped
 * kinds here when newer Kubernetes versions introduce them.
 */
export const clusterScopedKinds: ReadonlySet<string> = new Set([
    'Namespace',
    'Node',
    'PersistentVolume',
    'ComponentStatus',
    'MutatingAdmissionPolicy.admissionregistration.k8s.io',
    'MutatingAdmissionPolicyBinding.admissionregistration.k8s.io',
    'MutatingWebhookConfiguration.admissionregistration.k8s.io',
    'ValidatingAdmissionPolicy.admissionregistration.k8s.io',
    'ValidatingAdmissionPolicyBinding.admissionregistration.k8s.io',
    'ValidatingWebhookConfiguration.admissionregistration.k8s.io',
    'CustomResourceDefinition.apiextensions.k8s.io',
    'APIService.apiregistration.k8s.io',
    'SelfSubjectReview.authentication.k8s.io',
    'TokenReview.authentication.k8s.io',
    'SelfSubjectAccessReview.authorization.k8s.io',
    'SelfSubjectRulesReview.authorization.k8s.io',
    'SubjectAccessReview.authorization.k8s.io',
    'CertificateSigningRequest.certificates.k8s.io',
    'ClusterTrustBundle.certificates.k8s.io',
    'FlowSchema.flowcontrol.apiserver.k8s.io',
    'PriorityLevelConfiguration.flowcontrol.apiserver.k8s.io',
    'StorageVersion.internal.apiserver.k8s.io',
    'IPAddress.networking.k8s.io',
    'IngressClass.networking.k8s.io',
    'ServiceCIDR.networking.k8s.io',
    'RuntimeClass.node.k8s.io',
    'ClusterRole.rbac.authorization.k8s.io',
    'ClusterRoleBinding.rbac.authorization.k8s.io',
    'DeviceClass.resource.k8s.io',
    'ResourceSlice.resource.k8s.io',
    'PriorityClass.scheduling.k8s.io',
    'CSIDriver.storage.k8s.io',
    'CSINode.storage.k8s.io',
    'StorageClass.storage.k8s.io',
    'VolumeAttachment.storage.k8s.io',
    'VolumeAttributesClass.storage.k8s.io',
    'StorageVersionMigration.storagemigration.k8s.io',
]);

/**
 * `Kind.group` for an apiVersion and kind, e.g. `('apps/v1', 'Deployment')` → `Deployment.apps`.
 */
export function kindWithGroup(apiVersion: string, kind: string): string {
    const [group, version] = apiVersion.split('/');
    return version ? `${kind}.${group}` : kind;
}
