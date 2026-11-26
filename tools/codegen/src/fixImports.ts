import { log } from 'node:console';
import * as path from 'node:path';
import { styleText } from 'node:util';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { targetPackagePath } from './paths.ts';

/**
 * openapi-generator emits JSDoc continuation lines without the leading space
 * (`* text` instead of ` * text`), and formatText() doesn't touch comments.
 */
function alignJsDocs(text: string): string {
    let docIndent: string | undefined;
    return text
        .split('\n')
        .map((line) => {
            const trimmed = line.trimStart();
            if (trimmed.startsWith('/**')) {
                docIndent = trimmed.includes('*/')
                    ? undefined
                    : line.slice(0, line.length - trimmed.length);
                return line;
            }
            if (docIndent !== undefined && trimmed.startsWith('*')) {
                const aligned = `${docIndent} ${trimmed}`;
                if (trimmed.startsWith('*/')) {
                    docIndent = undefined;
                }
                return aligned;
            }
            return line;
        })
        .join('\n');
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

    for (const sourceFile of project.getSourceFiles()) {
        /**
         * Only process files in the src/models directory.
         */
        if (sourceFile.getDirectoryPath().startsWith(modelsPath)) {
            log(`Fixing imports in file: ${styleText('cyan', sourceFile.getBaseName())}`);
            for (const b of sourceFile.getImportDeclarations()) {
                // Only relative imports need an extension; leave package imports like '@kube-ts/core' alone.
                if (!b.getModuleSpecifierValue().startsWith('.')) {
                    continue;
                }
                if (!b.getModuleSpecifierValue().endsWith('.ts')) {
                    b.setModuleSpecifier(`${b.getModuleSpecifierValue()}.ts`);
                }
                // Relative imports between models are always interfaces/types (verbatimModuleSyntax).
                b.setIsTypeOnly(true);
            }
            sourceFile.formatText({ indentSize: 2, convertTabsToSpaces: true });
            const text = alignJsDocs(sourceFile.getFullText().trimStart())
                // openapi-generator writes map types as `{ [key: string]: string; }`.
                .replaceAll(/(\{ \[key: string\]: [^;{}]+); \}/g, '$1 }');
            if (text !== sourceFile.getFullText()) {
                sourceFile.replaceWithText(text);
            }
        }
    }

    project.saveSync();
}

main();
