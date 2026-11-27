import * as fs from 'node:fs';
import * as path from 'node:path';
import type { JSONSchema } from 'json-schema-to-typescript';
import { specDir } from './config.ts';

export interface K8sOpenApiSpec {
    components: {
        schemas: {
            [model: string]: {
                description: string;
                properties?: {
                    [property: string]: {
                        description?: string;
                        [key: string]: any;
                    };
                };
                type: string;
                required?: string[];
                'x-kubernetes-map-type'?: string;
                'x-kubernetes-group-version-kind'?: {
                    group: string;
                    kind: string;
                    version: string;
                }[];
            };
        };
    };
    paths: {
        [path: string]: {
            post?: {
                requestBody?: {
                    content: {
                        // Should be */*
                        [contentType: string]: {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                'x-kubernetes-group-version-kind': {
                    group: string;
                    kind: string;
                    version: string;
                };
            };
        };
    };
}

interface Schema {
    /**
     * Schema name appears in the OpenAPI spec's components.schemas
     * @example "io.k8s.api.apps.v1.Deployment"
     */
    schemaName: string;
    /**
     * API group this schema belongs to.
     * @example "apps"
     */
    group: string;
    /**
     * If the schema is not a Kubernetes API object,
     * it represents the interface name.
     * @example "Deployment"
     * @example "DeploymentSpec"
     */
    kind: string;
    /**
     * API version this schema belongs to.
     * @example "v1"
     */
    version: string;
}

interface ResourceSchema extends Schema {
    namespaced: boolean;
}

export interface Schemas {
    /**
     * Kubernetes API objects (POSTed in the spec's paths). These become classes.
     */
    resources: {
        /**
         * @example "IoK8sApiAppsV1Deployment"
         */
        [name: string]: ResourceSchema;
    };
    /**
     * Everything else. These become interfaces.
     */
    types: {
        /**
         * @example "IoK8sApiAppsV1DeploymentSpec"
         */
        [name: string]: Schema;
    };
}

/**
 * @example "io.k8s.api.apps.v1.Deployment" -> "IoK8sApiAppsV1Deployment"
 */
export function normalizeSchemaName(schemaName: string): string {
    return schemaName
        .replace(/-(.)/g, (_, letter) => letter.toUpperCase())
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function parseSchemas(spec: K8sOpenApiSpec, schemas: Schemas): void {
    for (const [pathName, pathBody] of Object.entries(spec.paths)) {
        if (pathBody.post?.['x-kubernetes-group-version-kind']) {
            const schemaRef = pathBody.post?.requestBody?.content['*/*']?.schema.$ref;
            const schemaName = schemaRef?.split('#/components/schemas/')[1];
            if (schemaName) {
                const className = normalizeSchemaName(schemaName);
                schemas.resources[className] ??= {
                    schemaName,
                    group: pathBody.post['x-kubernetes-group-version-kind'].group,
                    version: pathBody.post['x-kubernetes-group-version-kind'].version,
                    kind: pathBody.post['x-kubernetes-group-version-kind'].kind,
                    namespaced: pathName.includes('{namespace}'),
                };
            }
        }
    }
    for (const schemaName of Object.keys(spec.components.schemas)) {
        const interfaceName = normalizeSchemaName(schemaName);
        /**
         * If the schema is already considered a class, skip it
         */
        if (schemas.resources[interfaceName]) {
            continue;
        }
        if (!schemas.types[interfaceName]) {
            const parts = schemaName.split('.');
            const kind = parts.pop() || '';
            const version = parts.pop() || '';
            let group: string;
            if (version && !version.startsWith('v')) {
                group = version;
            } else {
                group = parts.pop() || '';
            }
            schemas.types[interfaceName] = {
                schemaName,
                group,
                kind,
                version,
            };
        }
    }
}

/**
 * Reads openapi-spec/<version>/*.json once and returns:
 * - `components`: the JSON schemas of every spec file merged
 *   (shared schemas such as ObjectMeta appear in many files);
 * - `schemas`: for each schema, resource or type, group/version/kind,
 *   and cluster or namespaced scope.
 */
export function loadSpec(): { components: Record<string, JSONSchema>; schemas: Schemas } {
    if (!fs.existsSync(specDir)) {
        throw new Error(`${specDir} not found. Run \`pnpm download\` first.`);
    }
    const components: Record<string, JSONSchema> = {};
    const schemas: Schemas = { resources: {}, types: {} };
    for (const file of fs.readdirSync(specDir)) {
        const spec: K8sOpenApiSpec = JSON.parse(fs.readFileSync(path.join(specDir, file), 'utf-8'));
        Object.assign(components, spec.components.schemas);
        parseSchemas(spec, schemas);
    }
    return { components, schemas };
}

/**
 * Where a schema's file goes in @kube-ts/k8s: `<group>/<version>/<Kind>.ts` for resources,
 * `<group>/<version>/types/<Kind>.ts` for the rest.
 * @example "IoK8sApiAppsV1Deployment" -> "<modelsPath>/apps/v1/Deployment.ts"
 */
export function modelFilePath(schemas: Schemas, modelsPath: string, name: string): string {
    const resourceSchema = schemas.resources[name];
    const schema = resourceSchema ?? schemas.types[name];
    if (!schema) {
        throw new Error(`Unknown schema ${name}`);
    }
    /**
     * In the OpenAPI spec file, resource groups contain ".k8s.io", type groups don't.
     * "flowcontrol.apiserver.k8s.io" is used in resources, but just "flowcontrol" in types.
     * "rbac.authorization.k8s.io" is used in resources, but just "rbac" in types.
     *
     * Following the same logic, "core" is used for core resources, but it's empty in the types.
     */
    const group = (schema.group || 'core')
        .replace('.k8s.io', '')
        .replace('flowcontrol.apiserver', 'flowcontrol')
        .replace('rbac.authorization', 'rbac');
    return path.join(
        modelsPath,
        group,
        schema.version,
        resourceSchema ? '' : 'types',
        `${schema.kind}.ts`,
    );
}
