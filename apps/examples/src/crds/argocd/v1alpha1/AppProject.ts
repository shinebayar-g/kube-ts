import { type Scope, NamespacedResource, type NamespacedResourceMeta } from '@kube-ts/core';

/**
 * AppProject provides a logical grouping of applications, providing controls for:
 * * where the apps may deploy to (cluster whitelist)
 * * what may be deployed (repository whitelist, resource whitelist/blacklist)
 * * who can access these applications (roles, OIDC group claims bindings)
 * * and what they can do (RBAC policies)
 * * automation access to these roles (JWT tokens)
 */
export interface AppProjectArgs {
  readonly metadata?: NamespacedResourceMeta;
  /**
   * AppProjectSpec is the specification of an AppProject
   */
  readonly spec: {
    /**
     * ClusterResourceBlacklist contains list of blacklisted cluster level resources
     *
     * Items: GroupKind specifies a Group and a Kind, but does not force a version.  This is useful for identifying
     * concepts during lookup stages without having partially valid types
     */
    clusterResourceBlacklist?: {
      group: string;
      kind: string;
    }[];
    /**
     * ClusterResourceWhitelist contains list of whitelisted cluster level resources
     *
     * Items: GroupKind specifies a Group and a Kind, but does not force a version.  This is useful for identifying
     * concepts during lookup stages without having partially valid types
     */
    clusterResourceWhitelist?: {
      group: string;
      kind: string;
    }[];
    /**
     * Description contains optional project description
     */
    description?: string;
    /**
     * DestinationServiceAccounts holds information about the service accounts to be impersonated for the application sync operation for each destination.
     *
     * Items: ApplicationDestinationServiceAccount holds information about the service account to be impersonated for the application sync operation.
     */
    destinationServiceAccounts?: {
      /**
       * DefaultServiceAccount to be used for impersonation during the sync operation
       */
      defaultServiceAccount: string;
      /**
       * Namespace specifies the target namespace for the application's resources.
       */
      namespace?: string;
      /**
       * Server specifies the URL of the target cluster's Kubernetes control plane API.
       */
      server: string;
    }[];
    /**
     * Destinations contains list of destinations available for deployment
     *
     * Items: ApplicationDestination holds information about the application's destination
     */
    destinations?: {
      /**
       * Name is an alternate way of specifying the target cluster by its symbolic name. This must be set if Server is not set.
       */
      name?: string;
      /**
       * Namespace specifies the target namespace for the application's resources.
       * The namespace will only be set for namespace-scoped resources that have not set a value for .metadata.namespace
       */
      namespace?: string;
      /**
       * Server specifies the URL of the target cluster's Kubernetes control plane API. This must be set if Name is not set.
       */
      server?: string;
    }[];
    /**
     * NamespaceResourceBlacklist contains list of blacklisted namespace level resources
     *
     * Items: GroupKind specifies a Group and a Kind, but does not force a version.  This is useful for identifying
     * concepts during lookup stages without having partially valid types
     */
    namespaceResourceBlacklist?: {
      group: string;
      kind: string;
    }[];
    /**
     * NamespaceResourceWhitelist contains list of whitelisted namespace level resources
     *
     * Items: GroupKind specifies a Group and a Kind, but does not force a version.  This is useful for identifying
     * concepts during lookup stages without having partially valid types
     */
    namespaceResourceWhitelist?: {
      group: string;
      kind: string;
    }[];
    /**
     * OrphanedResources specifies if controller should monitor orphaned resources of apps in this project
     */
    orphanedResources?: {
      /**
       * Ignore contains a list of resources that are to be excluded from orphaned resources monitoring
       *
       * Items: OrphanedResourceKey is a reference to a resource to be ignored from
       */
      ignore?: {
        group?: string;
        kind?: string;
        name?: string;
      }[];
      /**
       * Warn indicates if warning condition should be created for apps which have orphaned resources
       */
      warn?: boolean;
    };
    /**
     * PermitOnlyProjectScopedClusters determines whether destinations can only reference clusters which are project-scoped
     */
    permitOnlyProjectScopedClusters?: boolean;
    /**
     * Roles are user defined RBAC roles associated with this project
     *
     * Items: ProjectRole represents a role that has access to a project
     */
    roles?: {
      /**
       * Description is a description of the role
       */
      description?: string;
      /**
       * Groups are a list of OIDC group claims bound to this role
       */
      groups?: string[];
      /**
       * JWTTokens are a list of generated JWT tokens bound to this role
       *
       * Items: JWTToken holds the issuedAt and expiresAt values of a token
       */
      jwtTokens?: {
        exp?: number;
        iat: number;
        id?: string;
      }[];
      /**
       * Name is a name for this role
       */
      name: string;
      /**
       * Policies Stores a list of casbin formatted strings that define access policies for the role in the project
       */
      policies?: string[];
    }[];
    /**
     * SignatureKeys contains a list of PGP key IDs that commits in Git must be signed with in order to be allowed for sync
     *
     * Items: SignatureKey is the specification of a key required to verify commit signatures with
     */
    signatureKeys?: {
      /**
       * The ID of the key in hexadecimal notation
       */
      keyID: string;
    }[];
    /**
     * SourceNamespaces defines the namespaces application resources are allowed to be created in
     */
    sourceNamespaces?: string[];
    /**
     * SourceRepos contains list of repository URLs which can be used for deployment
     */
    sourceRepos?: string[];
    /**
     * SyncWindows controls when syncs can be run for apps in this project
     *
     * Items: SyncWindow contains the kind, time, duration and attributes that are used to assign the syncWindows to apps
     */
    syncWindows?: {
      /**
       * Applications contains a list of applications that the window will apply to
       */
      applications?: string[];
      /**
       * Clusters contains a list of clusters that the window will apply to
       */
      clusters?: string[];
      /**
       * Duration is the amount of time the sync window will be open
       */
      duration?: string;
      /**
       * Kind defines if the window allows or blocks syncs
       */
      kind?: string;
      /**
       * ManualSync enables manual syncs when they would otherwise be blocked
       */
      manualSync?: boolean;
      /**
       * Namespaces contains a list of namespaces that the window will apply to
       */
      namespaces?: string[];
      /**
       * Schedule is the time the window will begin, specified in cron format
       */
      schedule?: string;
      /**
       * TimeZone of the sync that will be applied to the schedule
       */
      timeZone?: string;
    }[];
  };
}

export class AppProject extends NamespacedResource {
  declare readonly apiVersion: 'argoproj.io/v1alpha1';
  declare readonly kind: 'AppProject';
  declare readonly spec: AppProjectArgs['spec'];

  constructor(scope: Scope, name: string, args: AppProjectArgs) {
    super(scope, name, { apiVersion: 'argoproj.io/v1alpha1', kind: 'AppProject', ...args });
  }
}
