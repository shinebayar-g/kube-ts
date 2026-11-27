import * as path from 'node:path';
import type { Project } from 'ts-morph';

// Same order as `Array.prototype.sort()`: by UTF-16 code unit, not locale.
const byCodeUnit = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Writes the barrel files for the resources in `<corePath>/src/models/<group>/<version>/<Kind>.ts`:
 * - `src/models/<group>/<version>.ts`: `export * from './<version>/<Kind>.ts'`
 * - `src/models/<group>.ts`: `export * as <version> from './<group>/<version>.ts'`
 * - `src/index.ts`: `export * as <group> from './models/<group>.ts'`
 *
 * Types (`<version>/types/`) aren't exported; they're reachable through the resources.
 * Runtime pieces (App, base classes, Helm, ObjectMeta) live in @kube-ts/core.
 */
export function addExports(project: Project, corePath: string) {
    const modelsPath = path.join(corePath, 'src/models');
    const resources = new Map<string, Map<string, string[]>>();
    for (const file of project.getSourceFiles()) {
        const parts = path.relative(modelsPath, file.getFilePath()).split(path.sep);
        if (parts.length !== 3 || parts[0] === '..') {
            continue;
        }
        const [group = '', version = '', fileName = ''] = parts;
        const versions = resources.get(group) ?? new Map<string, string[]>();
        resources.set(group, versions);
        versions.set(version, [...(versions.get(version) ?? []), fileName]);
    }

    let indexFileContent = '';
    for (const group of [...resources.keys()].sort(byCodeUnit)) {
        const versions = resources.get(group) ?? new Map<string, string[]>();
        let groupFileContent = '';
        for (const version of [...versions.keys()].sort(byCodeUnit)) {
            groupFileContent += `export * as ${version} from './${group}/${version}.ts';\n`;
            const versionFileContent = (versions.get(version) ?? [])
                .sort(byCodeUnit)
                .map((fileName) => `export * from './${version}/${fileName}';\n`)
                .join('');
            project.createSourceFile(
                path.join(modelsPath, group, `${version}.ts`),
                versionFileContent,
                {
                    overwrite: true,
                },
            );
        }
        project.createSourceFile(path.join(modelsPath, `${group}.ts`), groupFileContent, {
            overwrite: true,
        });
        indexFileContent += `export * as ${group} from './models/${group}.ts';\n`;
    }
    project.createSourceFile(path.join(corePath, 'src/index.ts'), indexFileContent, {
        overwrite: true,
    });
}
