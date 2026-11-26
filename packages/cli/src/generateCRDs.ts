import { log } from 'node:console';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { compile } from 'json-schema-to-typescript';
import { styleText } from 'node:util';
import {
    type ClassDeclarationStructure,
    IndentationText,
    Project,
    QuoteKind,
    StructureKind,
} from 'ts-morph';
import * as yaml from 'yaml';

interface CRD {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
    };
    spec: {
        group: string;
        versions: {
            name: string;
            schema?: {
                openAPIV3Schema?: any;
            };
        }[];
        names: {
            categories?: string[];
            kind: string;
            listKind?: string;
            plural: string;
            shortNames?: string[];
            singular?: string;
        };
        scope: 'Namespaced' | 'Cluster';
    };
}

interface K8sList {
    apiVersion: string;
    kind: 'List';
    items: CRD[];
    metadata: {
        resourceVersion: string;
    };
}

function isK8sList(o: unknown): o is K8sList {
    return typeof o === 'object' && o !== null && 'kind' in o && o.kind === 'List';
}

interface KubeTsConfig {
    /**
     * @default "./crds"
     */
    outDir?: string;
    crds?: {
        [pkg: string]: string[];
    };
}

const cacheHome = path.join(os.homedir(), '.cache', 'kube-ts');

export function readConfig(configPath: string) {
    const config: KubeTsConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
}

function parseCRDs(crds: CRD[], data: string) {
    yaml.parseAllDocuments(data).forEach((c) => {
        const json = c.toJS();
        if (isK8sList(json)) {
            json.items.forEach((subC) => {
                crds.push(subC);
            });
        } else crds.push(json);
    });
}

async function fetchAndParseCRDs(crds: CRD[], url: string, cacheDir: string) {
    const cacheId = crypto.createHash('sha1').update(url).digest('hex');
    const yamlSavePath = path.join(cacheDir, `${cacheId}-${path.basename(url)}`);
    if (!fs.existsSync(yamlSavePath)) {
        log(`Fetching CRDs from ${styleText('yellowBright', url.toString())}`);
        const req = await fetch(url);
        const data = await req.text();
        fs.writeFileSync(yamlSavePath, data);
    } else {
        log(`Reading CRDs from ${styleText('yellowBright', url)} (cached)`);
    }
    parseCRDs(crds, fs.readFileSync(yamlSavePath, 'utf-8'));
}

interface Output {
    [dir: string]: CRD[];
}

export async function generateCRDs(crdPathOrUrl?: string, config?: KubeTsConfig) {
    const project = new Project({
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            quoteKind: QuoteKind.Single,
        },
    });
    const outDir = path.resolve(config?.outDir || './crds');
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(cacheHome, { recursive: true });
    const output: Output = {};

    if (crdPathOrUrl) {
        output[''] = [];
        try {
            const url = new URL(crdPathOrUrl);
            await fetchAndParseCRDs(output[''], url.toString(), cacheHome);
        } catch {
            log(`Reading CRDs from ${styleText('yellowBright', crdPathOrUrl)}`);
            parseCRDs(output[''], fs.readFileSync(crdPathOrUrl, 'utf-8'));
        }
    } else if (config) {
        for (const [pkg, urls] of Object.entries(config.crds || {})) {
            output[pkg] = [];
            const cacheDir = path.join(cacheHome, pkg);
            fs.mkdirSync(cacheDir, { recursive: true });
            for (const url of urls) {
                try {
                    new URL(url);
                    await fetchAndParseCRDs(output[pkg], url, cacheDir);
                } catch {
                    log(`Reading CRDs from ${styleText('yellowBright', url)} (local)`);
                    parseCRDs(output[pkg], fs.readFileSync(url, 'utf-8'));
                }
            }
        }
    }

    for (const [pkg, crds] of Object.entries(output)) {
        for (const crd of crds) {
            for (const crdVersion of crd.spec.versions) {
                if (crdVersion.schema?.openAPIV3Schema) {
                    if (!fs.existsSync(path.join(outDir, pkg, crdVersion.name))) {
                        fs.mkdirSync(path.join(outDir, pkg, crdVersion.name), { recursive: true });
                    }
                    const compiledInterface = await compile(
                        crdVersion.schema.openAPIV3Schema,
                        `${crd.spec.names.kind}Args`,
                        {
                            bannerComment: '',
                            additionalProperties: false,
                            style: { singleQuote: true, tabWidth: 2 },
                        },
                    );
                    const fileLocation = path.join(
                        outDir,
                        pkg,
                        crdVersion.name,
                        `${crd.spec.names.kind}.ts`,
                    );
                    const sourceFile = project.createSourceFile(fileLocation, compiledInterface, {
                        overwrite: true,
                    });
                    const isNamespaced = crd.spec.scope === 'Namespaced';

                    const interfaceDecleration = sourceFile.getInterfaces()[0];
                    if (!interfaceDecleration) {
                        throw new Error(
                            `json-schema-to-typescript produced no interface for ${crd.spec.names.kind} ${crdVersion.name}`,
                        );
                    }
                    interfaceDecleration.getProperty('apiVersion')?.remove();
                    interfaceDecleration.getProperty('kind')?.remove();
                    interfaceDecleration.getProperty('status')?.remove();
                    const metadata = interfaceDecleration.getProperty('metadata');
                    metadata?.setIsReadonly(true);
                    metadata?.setHasQuestionToken(true);
                    const spec = interfaceDecleration.getProperty('spec');
                    spec?.setIsReadonly(true);
                    const baseClass = isNamespaced ? 'NamespacedResource' : 'ClusterResource';
                    const metaType = isNamespaced
                        ? 'NamespacedResourceMeta'
                        : 'ClusterResourceMeta';
                    const apiVersion = `${crd.spec.group}/${crdVersion.name}`;
                    const kind = crd.spec.names.kind;
                    metadata?.setType(metaType);
                    sourceFile.addImportDeclaration({
                        moduleSpecifier: '@kube-ts/core',
                        namedImports: ['type Scope', baseClass, `type ${metaType}`],
                    });

                    const argsName = interfaceDecleration.getName();
                    const argsAreOptional = interfaceDecleration
                        .getProperties()
                        .every((prop) => prop.hasQuestionToken());
                    /**
                     * Properties are `declare`d: the base constructor assigns them,
                     * the class only narrows their types.
                     */
                    const classDecleration: ClassDeclarationStructure = {
                        kind: StructureKind.Class,
                        name: argsName.replace('Args', ''),
                        extends: baseClass,
                        isExported: true,
                        properties: [
                            {
                                name: 'apiVersion',
                                type: `'${apiVersion}'`,
                                isReadonly: true,
                                hasDeclareKeyword: true,
                            },
                            {
                                name: 'kind',
                                type: `'${kind}'`,
                                isReadonly: true,
                                hasDeclareKeyword: true,
                            },
                            ...(spec
                                ? [
                                      {
                                          name: 'spec',
                                          type: `${argsName}['spec']`,
                                          isReadonly: true,
                                          hasDeclareKeyword: true,
                                      },
                                  ]
                                : []),
                        ],
                        ctors: [
                            {
                                parameters: [
                                    { name: 'scope', type: 'Scope' },
                                    { name: 'name', type: 'string' },
                                    {
                                        name: 'args',
                                        type: argsName,
                                        initializer: argsAreOptional ? '{}' : undefined,
                                    },
                                ],
                                statements: [
                                    `super(scope, name, { apiVersion: '${apiVersion}', kind: '${kind}', ...args });`,
                                ],
                            },
                        ],
                    };
                    sourceFile.addClass(classDecleration);
                    // Indent the class added above to match the prettier-formatted interface.
                    sourceFile.formatText({ indentSize: 2, convertTabsToSpaces: true });
                }
            }
        }
    }

    log(`Saving generated files to the ${styleText('yellowBright', outDir)} directory`);
    project.saveSync();

    for (const crdDir of fs.readdirSync(outDir)) {
        let indexFileContent = '';
        for (const apiVersionDir of fs.readdirSync(path.join(outDir, crdDir))) {
            let apiVersionFileContent = '';
            for (const file of fs.readdirSync(path.join(outDir, crdDir, apiVersionDir))) {
                apiVersionFileContent += `export * from './${apiVersionDir}/${file}';\n`;
            }
            fs.writeFileSync(
                path.join(outDir, crdDir, `${apiVersionDir}.ts`),
                apiVersionFileContent,
                'utf-8',
            );
            indexFileContent += `export * as ${apiVersionDir} from './${apiVersionDir}.ts';\n`;
        }
        fs.writeFileSync(path.join(outDir, crdDir, 'index.ts'), indexFileContent, 'utf-8');
    }
}
