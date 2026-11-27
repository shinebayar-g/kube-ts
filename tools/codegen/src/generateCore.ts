import { log } from 'node:console';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { styleText } from 'node:util';
import {
    type ConstructorDeclarationStructure,
    IndentationText,
    type InterfaceDeclaration,
    type InterfaceDeclarationStructure,
    Project,
    type PropertySignatureStructure,
    QuoteKind,
    type SourceFile,
    StructureKind,
    SyntaxKind,
} from 'ts-morph';
import { targetPackagePath } from './paths.ts';
import type { Schemas } from './parseSchemas.ts';
import { removeUnusedFiles } from './utils.ts';

function cleanupDeclaration(
    sourceFile: SourceFile,
    declaration: InterfaceDeclaration,
    className: string,
) {
    declaration.getProperty('status')?.remove();

    if (className === 'IoK8sApimachineryPkgApisMetaV1ObjectMeta') {
        for (const field of [
            'creationTimestamp',
            'deletionGracePeriodSeconds',
            'deletionTimestamp',
            'generation',
            'managedFields',
            'resourceVersion',
            'selfLink',
            'uid',
            /**
             * ObjectMeta class is considered as cluster-scoped.
             * NamespacedObjectMeta will be used for namespaced resources.
             */
            'namespace',
        ]) {
            declaration.getProperty(field)?.remove();
        }
    }
    removeUnusedImports(sourceFile);
}

/**
 * Drops imports whose names no longer appear in the file, e.g. `DeploymentStatus`
 * after `status` was removed, or `Time` after ObjectMeta's timestamps were.
 */
function removeUnusedImports(sourceFile: SourceFile) {
    const used = new Set(
        sourceFile
            .getDescendantsOfKind(SyntaxKind.TypeReference)
            .map((ref) => ref.getTypeName().getText()),
    );
    for (const importDeclaration of sourceFile.getImportDeclarations()) {
        if (importDeclaration.getNamedImports().every((named) => !used.has(named.getName()))) {
            importDeclaration.remove();
        }
    }
}

/**
 * The generated files (generate.ts) declare an interface per schema.
 * Resources become classes: same name, docs and properties.
 */
function interfaceToClass(sourceFile: SourceFile, declaration: InterfaceDeclaration) {
    const classDeclaration = sourceFile.addClass({
        name: declaration.getName(),
        isExported: true,
        docs: declaration.getJsDocs().map((doc) => doc.getStructure()),
        properties: declaration.getProperties().map((prop) => ({
            name: prop.getName(),
            type: prop.getTypeNode()?.getText(),
            hasQuestionToken: prop.hasQuestionToken(),
            docs: prop.getJsDocs().map((doc) => doc.getStructure()),
        })),
    });
    declaration.remove();
    return classDeclaration;
}

/**
 * Schemas that become a plain type at every use instead of a type of their own.
 * Most have no properties in the spec, so the generated type says little (`{}`, `unknown` map).
 */
const inlinedTypes: Record<string, string> = {
    IoK8sApimachineryPkgApiResourceQuantity: 'number | string',
    IoK8sApimachineryPkgUtilIntstrIntOrString: 'number | string',
    // RFC 3339 timestamps, written as strings in YAML.
    IoK8sApimachineryPkgApisMetaV1Time: 'string',
    IoK8sApimachineryPkgApisMetaV1MicroTime: 'string',
    // Any embedded object.
    IoK8sApimachineryPkgRuntimeRawExtension: '{ [key: string]: unknown }',
    // CRD validation schemas (CustomResourceDefinition's JSONSchemaProps).
    IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSON: 'unknown',
    IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSONSchemaPropsOrBool:
        'IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSONSchemaProps | boolean',
    IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSONSchemaPropsOrArray:
        'IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSONSchemaProps | IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSONSchemaProps[]',
    IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSONSchemaPropsOrStringArray:
        'IoK8sApiextensionsApiserverPkgApisApiextensionsV1JSONSchemaProps | string[]',
};

/**
 * Replaces every reference to the declaration in `sourceFile` with `type`,
 * removes the now-unused imports, and deletes the file.
 */
function inlineType(sourceFile: SourceFile, type: string) {
    const name = sourceFile.getBaseNameWithoutExtension();
    const declaration = sourceFile.getTypeAlias(name) ?? sourceFile.getInterface(name);
    for (const node of declaration?.findReferencesAsNodes() ?? []) {
        const srcFile = node.getSourceFile();
        const srcFileName = srcFile.getBaseName();
        const typeRef = node.getFirstAncestorByKind(SyntaxKind.TypeReference);
        const importRef = srcFile.getImportDeclaration(`./${sourceFile.getBaseName()}`);
        if (typeRef) {
            // `A | B` inside an array type needs parentheses: `(A | B)[]`, not `A | B[]`.
            const needsParens =
                type.includes('|') && typeRef.getParent()?.getKind() === SyntaxKind.ArrayType;
            const text = needsParens ? `(${type})` : type;
            log(
                `${styleText('cyan', srcFileName)}: Replacing ${styleText('gray', typeRef.getText())} with ${styleText('yellowBright', text)}`,
            );
            typeRef.replaceWithText(text);
        }
        if (importRef) {
            log(
                `${styleText('cyan', srcFileName)}: Removing ${styleText('gray', importRef.getText())}`,
            );
            importRef.remove();
        }
    }
    sourceFile.delete();
}

function inlineTypes(project: Project, modelsPath: string) {
    for (const [name, type] of Object.entries(inlinedTypes)) {
        const sourceFile = project.getSourceFile(path.join(modelsPath, `${name}.ts`));
        if (sourceFile) {
            inlineType(sourceFile, type);
        }
    }
}

function main() {
    const corePath = targetPackagePath;
    const modelsPath = path.join(corePath, 'src/models');
    /**
     * Remove some obvious unused files.
     * They're mostly intended to be used programmatically.
     * Note: Is there a better way to do this?
     */
    removeUnusedFiles(modelsPath);

    const project = new Project({
        tsConfigFilePath: path.join(corePath, 'tsconfig.json'),
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            quoteKind: QuoteKind.Single,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            useTrailingCommas: true,
        },
    });
    /**
     * Replace IntOrString, Quantity, Time etc. with plain types (see `inlinedTypes`).
     */
    inlineTypes(project, modelsPath);

    const schemas: Schemas = JSON.parse(
        fs.readFileSync(path.join(import.meta.dirname, '../schemas.json'), 'utf-8'),
    );

    for (const sourceFile of project.getSourceFiles()) {
        /**
         * Only process files in the src/models directory.
         */
        if (sourceFile.getDirectoryPath().startsWith(modelsPath)) {
            /**
             * generate.ts writes one interface per file (type aliases are left as they are).
             */
            const declaration = sourceFile.getInterfaces()[0];
            const className = declaration?.getName();
            if (declaration && className) {
                log(`Processing ${styleText('cyan', sourceFile.getBaseName())}`);
                cleanupDeclaration(sourceFile, declaration, className);
                const classSchema = schemas.classes[className];
                const interfaceSchema = schemas.interfaces[className];
                if (classSchema) {
                    const classDeclaration = interfaceToClass(sourceFile, declaration);
                    /**
                     * Resource classes extend the base classes from @kube-ts/core (peer dependency).
                     * Every property is `declare`d: the base constructor assigns the values,
                     * and the subclass only narrows the types (and keeps the docs).
                     */
                    const { group, version, kind, namespaced } = classSchema;
                    /**
                     * Kubernetes core API group has no group prefix.
                     */
                    const groupVersion = group ? `${group}/${version}` : version;
                    for (const [name, value] of [
                        ['apiVersion', groupVersion],
                        ['kind', kind],
                    ] as const) {
                        const property = classDeclaration.getProperty(name);
                        if (property) {
                            property.removeInitializer();
                            property.setType(`'${value}'`);
                            property.setHasQuestionToken(false);
                        }
                    }

                    const baseClass = namespaced ? 'NamespacedResource' : 'ClusterResource';
                    const metaType = namespaced ? 'NamespacedResourceMeta' : 'ClusterResourceMeta';
                    classDeclaration.setExtends(baseClass);
                    sourceFile
                        .getImportDeclaration('./IoK8sApimachineryPkgApisMetaV1ObjectMeta.ts')
                        ?.remove();
                    sourceFile.addImportDeclaration({
                        moduleSpecifier: '@kube-ts/core',
                        namedImports: ['type Scope', baseClass, `type ${metaType}`],
                    });

                    const interfaceProps: PropertySignatureStructure[] = [];
                    const i: InterfaceDeclarationStructure = {
                        kind: StructureKind.Interface,
                        name: `${kind}Args`,
                        isExported: true,
                        properties: interfaceProps,
                    };

                    const preferredOrder = ['apiVersion', 'kind', 'metadata', 'spec'];
                    const orderedProps = classDeclaration.getProperties().sort((a, b) => {
                        const aIndex = preferredOrder.indexOf(a.getName());
                        const bIndex = preferredOrder.indexOf(b.getName());
                        if (aIndex === -1 && bIndex === -1) return 0;
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        return aIndex - bIndex;
                    });

                    for (const [index, prop] of orderedProps.entries()) {
                        prop.setIsReadonly(true);
                        prop.setHasDeclareKeyword(true);
                        classDeclaration.getProperty(prop.getName())?.setOrder(index);
                        if (prop.getName() === 'apiVersion' || prop.getName() === 'kind') {
                            continue;
                        }
                        const interfaceProp: PropertySignatureStructure = {
                            kind: StructureKind.PropertySignature,
                            name: prop.getName(),
                            type: prop.getTypeNode()?.getText(),
                            hasQuestionToken: prop.hasQuestionToken(),
                            isReadonly: true,
                        };
                        if (prop.getName() === 'metadata') {
                            interfaceProp.type = metaType;
                            interfaceProp.hasQuestionToken = true;
                        }
                        interfaceProps.push(interfaceProp);
                    }
                    // The base class already declares `metadata` (with `name` guaranteed).
                    classDeclaration.getProperty('metadata')?.remove();
                    sourceFile.insertInterface(classDeclaration.getChildIndex(), i);

                    const argsAreOptional = interfaceProps.every((prop) => prop.hasQuestionToken);
                    const c: ConstructorDeclarationStructure = {
                        kind: StructureKind.Constructor,
                        parameters: [
                            { name: 'scope', type: 'Scope' },
                            { name: 'name', type: 'string' },
                            {
                                name: 'args',
                                type: `${kind}Args`,
                                initializer: argsAreOptional ? '{}' : undefined,
                            },
                        ],
                        statements: [
                            `super(scope, name, { apiVersion: '${groupVersion}', kind: '${kind}', ...args });`,
                        ],
                    };
                    classDeclaration.addConstructor(c);
                    classDeclaration.rename(kind);
                } else if (interfaceSchema) {
                    declaration.rename(interfaceSchema.kind);
                }
            }
        }
    }

    project.saveSync();
}

main();
