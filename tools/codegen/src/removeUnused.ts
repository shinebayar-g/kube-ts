import { log } from 'node:console';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { styleText } from 'node:util';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { targetPackagePath } from './paths.ts';

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

    const unusedInterfaceFiles: string[] = [];
    for (const sourceFile of project.getSourceFiles()) {
        if (sourceFile.getDirectoryPath().startsWith(modelsPath)) {
            const i = sourceFile.getInterfaces()[0];
            if (i?.findReferencesAsNodes().length === 0) {
                log(`Found unused interface ${styleText('cyan', i.getName())}`);
                unusedInterfaceFiles.push(sourceFile.getFilePath());
            }
        }
    }

    log(`Unused interfaces: ${unusedInterfaceFiles.length}`);

    for (const sourceFile of unusedInterfaceFiles) {
        fs.rmSync(sourceFile);
    }
}

main();
