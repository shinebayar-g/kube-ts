/**
 * Replaces the old `make models` step (openapi-generator):
 * reads openapi-spec/<version>/*.json and writes one file per schema
 * to gen/<version>/models/<Name>.ts, a flat list.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { compile, type JSONSchema } from 'json-schema-to-typescript';
import { Project, SyntaxKind } from 'ts-morph';
import { normalizeSchemaName } from './utils.ts';

const k8sVersion = 'v1.32.0';
const specDir = path.join(import.meta.dirname, '../openapi-spec', k8sVersion);
const outDir = path.join(import.meta.dirname, '../gen', k8sVersion, 'models');

// 1. Merge the schemas of every spec file. Shared schemas (e.g. ObjectMeta) appear in many files.
const schemas: Record<string, JSONSchema> = {};
for (const file of readdirSync(specDir)) {
    const spec = JSON.parse(readFileSync(path.join(specDir, file), 'utf-8'));
    Object.assign(schemas, spec.components?.schemas);
}

// 2. Compile them all at once. json-schema-to-typescript resolves `$ref`s under `#/definitions/`,
// and only generates what's reachable from the root, so the root references every schema.
const definitions = JSON.parse(
    JSON.stringify(schemas).replaceAll('#/components/schemas/', '#/definitions/'),
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

// 3. json-schema-to-typescript capitalizes letters after digits (`K8s` -> `K8S`, `V1alpha1` -> `V1Alpha1`).
// Rename to the names the rest of the pipeline uses.
const generatedName = (key: string) =>
    normalizeSchemaName(key).replace(/\d+[a-z]/g, (match) => match.toUpperCase());
const names = new Map(
    Object.keys(schemas).map((key) => [generatedName(key), normalizeSchemaName(key)]),
);

const renamed = output
    .replace(/\b[A-Z][A-Za-z0-9]*\b/g, (name) => names.get(name) ?? name)
    // json-schema-to-typescript names index signatures `k`; `key` reads better and matches @kube-ts/core.
    .replaceAll('[k: string]', '[key: string]');

// 4. Split into one file per declaration, importing the declarations it references.
const declarationNames = new Set(names.values());
const project = new Project({ useInMemoryFileSystem: true });
const sourceFile = project.createSourceFile('all.ts', renamed);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
let fileCount = 0;
for (const declaration of [...sourceFile.getInterfaces(), ...sourceFile.getTypeAliases()]) {
    const name = declaration.getName();
    if (!declarationNames.has(name)) {
        continue; // `Root`
    }
    const referenced = new Set(
        declaration
            .getDescendantsOfKind(SyntaxKind.TypeReference)
            .map((ref) => ref.getTypeName().getText())
            .filter((ref) => ref !== name && declarationNames.has(ref)),
    );
    const imports = [...referenced]
        .sort()
        .map((ref) => `import type { ${ref} } from './${ref}.ts';\n`)
        .join('');
    const body = declaration.getFullText().trimStart();
    writeFileSync(path.join(outDir, `${name}.ts`), `${imports}${imports ? '\n' : ''}${body}\n`);
    fileCount++;
}
console.log(`Wrote ${fileCount} files to ${outDir}`);
