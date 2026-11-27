import { log } from 'node:console';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { styleText } from 'node:util';
import { normalizeSchemaName } from './utils.ts';

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
     * Files this schema appears in.
     * A schema can appear in multiple files.
     * @example ["apis__apps__v1_openapi.json"]
     */
    files: string[];
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

interface ClassSchema extends Schema {
    /**
     * Paths this schema used
     * @example "/apis/apps/v1/namespaces/{namespace}/deployments"
     */
    paths: string[];
    namespaced: boolean;
}

export interface Schemas {
    classes: {
        /**
         * @example "IoK8sApiAppsV1Deployment"
         */
        [className: string]: ClassSchema;
    };
    interfaces: {
        /**
         * @example "IoK8sApiAppsV1DeploymentSpec"
         */
        [interfaceName: string]: Schema;
    };
}

function parseSchemas(fileName: string, spec: K8sOpenApiSpec, schemas: Schemas): void {
    for (const [pathName, pathBody] of Object.entries(spec.paths)) {
        if (pathBody.post?.['x-kubernetes-group-version-kind']) {
            const schemaRef = pathBody.post?.requestBody?.content['*/*']?.schema.$ref;
            const schemaName = schemaRef?.split('#/components/schemas/')[1];
            if (schemaName) {
                const className = normalizeSchemaName(schemaName);
                const existing = schemas.classes[className];
                if (existing) {
                    existing.files.push(fileName);
                    existing.paths.push(pathName);
                } else {
                    schemas.classes[className] = {
                        schemaName,
                        files: [fileName],
                        paths: [pathName],
                        group: pathBody.post['x-kubernetes-group-version-kind'].group,
                        version: pathBody.post['x-kubernetes-group-version-kind'].version,
                        kind: pathBody.post['x-kubernetes-group-version-kind'].kind,
                        namespaced: pathName.includes('{namespace}'),
                    };
                }
            }
        }
    }
    for (const schemaName of Object.keys(spec.components.schemas)) {
        const interfaceName = normalizeSchemaName(schemaName);
        /**
         * If the schema is already considered a class, skip it
         */
        if (schemas.classes[interfaceName]) {
            continue;
        }
        if (schemas.interfaces[interfaceName]) {
            schemas.interfaces[interfaceName].files.push(fileName);
        } else {
            const parts = schemaName.split('.');
            const kind = parts.pop() || '';
            const version = parts.pop() || '';
            let group: string;
            if (version && !version.startsWith('v')) {
                group = version;
            } else {
                group = parts.pop() || '';
            }
            schemas.interfaces[interfaceName] = {
                schemaName,
                files: [fileName],
                group,
                kind,
                version,
            };
        }
    }
}

function saveSchemas(schemas: Schemas, outputPath: string) {
    // Same order as `Object.keys(...).sort()`: by UTF-16 code unit, not locale.
    const byKey = ([a]: [string, unknown], [b]: [string, unknown]) => (a < b ? -1 : a > b ? 1 : 0);
    const sortedSchemas: Schemas = {
        classes: Object.fromEntries(Object.entries(schemas.classes).sort(byKey)),
        interfaces: Object.fromEntries(Object.entries(schemas.interfaces).sort(byKey)),
    };

    fs.writeFileSync(
        outputPath,
        JSON.stringify(
            sortedSchemas,
            (_key, value) => {
                if (value instanceof Set) {
                    return Array.from(value).map((item) => JSON.parse(item));
                }
                return value;
            },
            2,
        ),
    );
}

function main() {
    const v3Path = path.join(import.meta.dirname, '../openapi-spec/v1.32.0');
    const skipList = [
        '.well-known__openid-configuration_openapi.json',
        'openid__v1__jwks_openapi.json',
        'logs_openapi.json',
        'version_openapi.json',
    ];
    const schemas: Schemas = {
        classes: {},
        interfaces: {},
    };
    log('Parsing Kubernetes schemas...');

    for (const file of fs.readdirSync(v3Path, { withFileTypes: true })) {
        if (skipList.includes(file.name)) {
            continue;
        }

        const spec: K8sOpenApiSpec = JSON.parse(
            fs.readFileSync(path.join(v3Path, file.name), 'utf-8'),
        );
        parseSchemas(file.name, spec, schemas);
    }

    log(`Saving to ${styleText('blueBright', 'schemas.json')}`);
    saveSchemas(schemas, 'schemas.json');
}

main();
