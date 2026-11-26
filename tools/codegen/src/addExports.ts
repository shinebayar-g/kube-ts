import { log } from 'node:console';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { styleText } from 'node:util';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { targetPackagePath } from './paths.ts';

interface ApiResources {
    [apiGroup: string]: {
        [apiVersion: string]: string[];
    };
}

function getApiResources(modelsPath: string, apiResources: ApiResources): void {
    for (const apiGroup of fs.readdirSync(modelsPath, { withFileTypes: true })) {
        if (apiGroup.isDirectory()) {
            const versions: ApiResources[string] = {};
            apiResources[apiGroup.name] = versions;

            for (const apiVersion of fs.readdirSync(path.join(apiGroup.parentPath, apiGroup.name), {
                withFileTypes: true,
            })) {
                if (apiVersion.isDirectory()) {
                    const files: string[] = [];
                    versions[apiVersion.name] = files;

                    for (const file of fs.readdirSync(
                        path.join(apiVersion.parentPath, apiVersion.name),
                        {
                            withFileTypes: true,
                        },
                    )) {
                        if (file.isFile()) {
                            files.push(file.name);
                        }
                    }
                }
            }
        }
    }
}

function main() {
    const corePath = targetPackagePath;
    const modelsPath = path.join(corePath, 'src/models');

    const project = new Project({
        tsConfigFilePath: path.join(corePath, 'tsconfig.json'),
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            quoteKind: QuoteKind.Single,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            useTrailingCommas: true,
        },
    });

    const apiResources: ApiResources = {};
    getApiResources(modelsPath, apiResources);

    // Runtime pieces (App, base classes, Helm, ObjectMeta) live in @kube-ts/core.
    let indexFileContent = '';

    for (const [apiGroup, versions] of Object.entries(apiResources)) {
        let apiGroupFileContent = '';
        for (const [apiVersion, apiResourceList] of Object.entries(versions)) {
            if (apiResourceList.length > 0) {
                apiGroupFileContent += `export * as ${apiVersion} from './${apiGroup}/${apiVersion}.ts';\n`;

                let apiVersionFileContent = '';
                for (const apiResource of apiResourceList) {
                    apiVersionFileContent += `export * from './${apiVersion}/${apiResource}';\n`;
                }
                const apiVersionFilePath = path.join(modelsPath, apiGroup, `${apiVersion}.ts`);
                log(`Creating file ${styleText('cyan', apiVersionFilePath)}`);
                project.createSourceFile(apiVersionFilePath, apiVersionFileContent, {
                    overwrite: true,
                });
            }
        }

        if (apiGroupFileContent) {
            const apiGroupFilePath = path.join(modelsPath, `${apiGroup}.ts`);
            log(`Creating file ${styleText('cyan', apiGroupFilePath)}`);
            project.createSourceFile(apiGroupFilePath, apiGroupFileContent, {
                overwrite: true,
            });
            indexFileContent += `export * as ${apiGroup} from './models/${apiGroup}.ts';\n`;
        }
    }

    project.createSourceFile(path.join(corePath, 'src', 'index.ts'), indexFileContent, {
        overwrite: true,
    });

    project.saveSync();
}

main();
