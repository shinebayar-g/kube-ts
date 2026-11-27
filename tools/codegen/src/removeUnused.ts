import { log } from 'node:console';
import { styleText } from 'node:util';
import type { Project } from 'ts-morph';

/**
 * Keeps the resources (classes) and the types they reach through imports;
 * deletes everything else in `modelsPath`, e.g. `DeploymentStatus` once `status` is removed.
 */
export function removeUnused(project: Project, modelsPath: string) {
    const files = project
        .getSourceFiles()
        .filter((file) => file.getDirectoryPath().startsWith(modelsPath));
    const reachable = new Set(files.filter((file) => file.getClasses().length > 0));
    for (const file of reachable) {
        for (const importDeclaration of file.getImportDeclarations()) {
            const imported = importDeclaration.getModuleSpecifierSourceFile();
            if (imported) {
                reachable.add(imported); // a Set visits added items too
            }
        }
    }
    for (const file of files) {
        if (!reachable.has(file)) {
            log(`Removing unused ${styleText('gray', file.getBaseName())}`);
            file.delete();
        }
    }
}
