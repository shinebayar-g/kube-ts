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

export interface KubeTsConfig {
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

// Same order as `Array.prototype.sort()`: by UTF-16 code unit, not locale.
const byCodeUnit = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Resolves `outDir` and refuses anything outside the current directory,
 * so a bad config can't point the package replacement at `..`, `/` or `~`.
 */
function resolveOutDir(outDir: string) {
    const cwd = process.cwd();
    const resolved = path.resolve(cwd, outDir);
    const relative = path.relative(cwd, resolved);
    if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(
            `outDir must be a subdirectory of the current directory (${cwd}), got "${outDir}"`,
        );
    }
    return resolved;
}

/** Package names become a single directory under `outDir`, nothing else. */
function assertPackageName(pkg: string) {
    if (!/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(pkg)) {
        throw new Error(
            `invalid package name "${pkg}": use letters, digits, ".", "_" and "-", without path separators`,
        );
    }
}

export async function generateCRDs(config: KubeTsConfig) {
    const project = new Project({
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            quoteKind: QuoteKind.Single,
        },
    });
    const outDir = resolveOutDir(config.outDir || './crds');
    const packages = Object.entries(config.crds || {});
    for (const [pkg] of packages) assertPackageName(pkg);
    /**
     * Kinds per version per package dir, for the barrel files.
     * @example { "<tmpDir>/argocd": { v1alpha1: ["AppProject", "Application"] } }
     */
    const barrels = new Map<string, Map<string, string[]>>();
    fs.mkdirSync(cacheHome, { recursive: true });
    fs.mkdirSync(outDir, { recursive: true });
    /**
     * Files are generated here, then each package dir is swapped into `outDir`
     * only after everything succeeded.
     */
    const tmpDir = fs.mkdtempSync(path.join(outDir, '.kube-ts-'));
    try {
        await generateInto(tmpDir, packages, project, barrels);
        for (const [pkg] of packages) {
            const generated = path.join(tmpDir, pkg);
            const target = path.join(outDir, pkg);
            fs.rmSync(target, { recursive: true, force: true });
            if (fs.existsSync(generated)) {
                fs.renameSync(generated, target);
            } else {
                log(
                    styleText(
                        'yellow',
                        `No CRD with a schema found for "${pkg}", nothing generated`,
                    ),
                );
            }
        }
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}

async function generateInto(
    outDir: string,
    packages: [string, string[]][],
    project: Project,
    barrels: Map<string, Map<string, string[]>>,
) {
    const output: Output = {};
    for (const [pkg, urls] of packages) {
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
                    const versions =
                        barrels.get(path.join(outDir, pkg)) ?? new Map<string, string[]>();
                    barrels.set(path.join(outDir, pkg), versions);
                    versions.set(crdVersion.name, [
                        ...(versions.get(crdVersion.name) ?? []),
                        crd.spec.names.kind,
                    ]);
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

    /**
     * Barrel files, the same layout as @kube-ts/k8s:
     * - `<pkg>/<version>/index.ts`: `export * from './<Kind>.ts'`
     * - `<pkg>/index.ts`: `export * as <version> from './<version>/index.ts'`
     */
    for (const [pkgDir, versions] of barrels) {
        let indexFileContent = '';
        for (const version of [...versions.keys()].sort(byCodeUnit)) {
            const kinds = [...new Set(versions.get(version))].sort(byCodeUnit);
            project.createSourceFile(
                path.join(pkgDir, version, 'index.ts'),
                kinds.map((kind) => `export * from './${kind}.ts';\n`).join(''),
                { overwrite: true },
            );
            indexFileContent += `export * as ${version} from './${version}/index.ts';\n`;
        }
        project.createSourceFile(path.join(pkgDir, 'index.ts'), indexFileContent, {
            overwrite: true,
        });
    }

    log(
        `Saving generated files to the ${styleText('yellowBright', path.dirname(outDir))} directory`,
    );
    project.saveSync();
}
