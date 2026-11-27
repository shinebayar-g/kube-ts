/**
 * `pnpm gen`: generates packages/k8s/src from openapi-spec/<version>/*.json.
 */
import { rmSync } from 'node:fs';
import * as path from 'node:path';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { compileModels } from './compile.ts';
import { packageDir } from './config.ts';
import { addExports } from './exports.ts';
import { generateModels } from './models.ts';
import { removeUnused } from './removeUnused.ts';
import { loadSpec } from './spec.ts';

async function main() {
    const modelsPath = path.join(packageDir, 'src/models');
    const project = new Project({
        tsConfigFilePath: path.join(packageDir, 'tsconfig.json'),
        skipAddingFilesFromTsConfig: true,
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            quoteKind: QuoteKind.Single,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            useTrailingCommas: true,
        },
    });

    // 1. Read the spec: the merged JSON schemas, and which of them are resources.
    const { components, schemas } = loadSpec();

    // 2. One interface or type per schema, at its final path.
    // The old files are removed first: ts-morph won't create a file over one on disk.
    rmSync(modelsPath, { recursive: true, force: true });
    await compileModels(project, modelsPath, components, schemas);

    // 3. Inline plain types, drop `status`, resources become classes.
    generateModels(project, modelsPath, schemas);

    // 4. Drop what no resource uses, then write the barrel files.
    removeUnused(project, modelsPath);
    addExports(project, packageDir);

    // 5. packages/k8s/src is left out of `vp fmt`, so format here.
    for (const file of project.getSourceFiles()) {
        file.formatText({ indentSize: 2, convertTabsToSpaces: true });
    }
    project.saveSync();
    console.log(`Wrote ${project.getSourceFiles().length} files to ${modelsPath}`);
}

await main();
