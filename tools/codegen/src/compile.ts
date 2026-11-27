import * as path from 'node:path';
import { compile, type JSONSchema } from 'json-schema-to-typescript';
import { Project, SyntaxKind } from 'ts-morph';
import { unpublishedResources } from './config.ts';
import { modelFilePath, normalizeSchemaName, type Schemas } from './spec.ts';

/**
 * Compiles every JSON schema to TypeScript in one go (json-schema-to-typescript),
 * named like `normalizeSchemaName`, e.g. `IoK8sApiAppsV1Deployment`.
 */
async function compileAll(components: Record<string, JSONSchema>): Promise<string> {
    // json-schema-to-typescript resolves `$ref`s under `#/definitions/`,
    // and only generates what's reachable from the root, so the root references every schema.
    const definitions = JSON.parse(
        JSON.stringify(components).replaceAll('#/components/schemas/', '#/definitions/'),
    );
    const root = {
        title: 'Root',
        type: 'object',
        definitions,
        properties: Object.fromEntries(
            Object.keys(definitions).map((key) => [key, { $ref: `#/definitions/${key}` }]),
        ),
    } as JSONSchema;
    const output = await compile(root, 'Root', { bannerComment: '', additionalProperties: false });

    // json-schema-to-typescript capitalizes letters after digits (`K8s` -> `K8S`, `V1alpha1` -> `V1Alpha1`).
    // Rename back to `normalizeSchemaName`.
    const generatedName = (key: string) =>
        normalizeSchemaName(key).replace(/\d+[a-z]/g, (match) => match.toUpperCase());
    const names = new Map(
        Object.keys(components).map((key) => [generatedName(key), normalizeSchemaName(key)]),
    );
    return (
        output
            .replace(/\b[A-Z][A-Za-z0-9]*\b/g, (name) => names.get(name) ?? name)
            // json-schema-to-typescript names index signatures `k`; `key` reads better and matches @kube-ts/core.
            .replaceAll('[k: string]', '[key: string]')
    );
}

/**
 * Adds one file per schema to `project`, at its final path (see `modelFilePath`),
 * importing the declarations it references. Unpublished resources are left out.
 */
export async function compileModels(
    project: Project,
    modelsPath: string,
    components: Record<string, JSONSchema>,
    schemas: Schemas,
) {
    const declarationNames = new Set(Object.keys(components).map(normalizeSchemaName));
    const filePath = (name: string) => modelFilePath(schemas, modelsPath, name);
    const sourceFile = new Project({ useInMemoryFileSystem: true }).createSourceFile(
        'all.ts',
        await compileAll(components),
    );

    for (const declaration of [...sourceFile.getInterfaces(), ...sourceFile.getTypeAliases()]) {
        const name = declaration.getName();
        if (!declarationNames.has(name) || unpublishedResources.has(name)) {
            continue; // `Root`, or left out of @kube-ts/k8s
        }
        const file = filePath(name);
        const referenced = new Set(
            declaration
                .getDescendantsOfKind(SyntaxKind.TypeReference)
                .map((ref) => ref.getTypeName().getText())
                .filter((ref) => ref !== name && declarationNames.has(ref)),
        );
        const imports = [...referenced]
            .sort()
            .map((ref) => {
                const specifier = path.relative(path.dirname(file), filePath(ref));
                return `import type { ${ref} } from '${specifier.startsWith('.') ? '' : './'}${specifier}';\n`;
            })
            .join('');
        const body = declaration.getFullText().trimStart();
        // Throws if two schemas share a path.
        project.createSourceFile(file, `${imports}${imports ? '\n' : ''}${body}\n`);
    }
}
