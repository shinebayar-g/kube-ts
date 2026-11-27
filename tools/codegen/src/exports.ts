import * as path from 'node:path';
import type { Project } from 'ts-morph';

// Same order as `Array.prototype.sort()`: by UTF-16 code unit, not locale.
const byCodeUnit = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

interface VersionFiles {
    /** `<group>/<version>/<Kind>.ts` */
    resources: string[];
    /** `<group>/<version>/types/<Kind>.ts` */
    types: string[];
}

/**
 * Writes the barrel files for `<packageDir>/src/models/<group>/<version>/`:
 * - `<group>/<version>/index.ts`: `export * from './<Kind>.ts'` for resources,
 *   `export type * from './types/<Kind>.ts'` for types.
 *   These are the public entry points: package.json maps `./*` to `./src/models/*\/index.ts`,
 *   so `@kube-ts/k8s/apps/v1` resolves and deeper paths don't.
 * - `<group>.ts`: `export * as <version> from './<group>/<version>/index.ts'`
 * - `src/index.ts`: `export * as <group> from './models/<group>.ts'`
 *
 * Group barrels exist only for the root namespaces (`k8s.apps.v1`); they aren't importable on their own.
 * Groups without resources (`meta`) only get their version barrels.
 * Runtime pieces (App, base classes, Helm, ObjectMeta) live in @kube-ts/core.
 */
export function addExports(project: Project, packageDir: string) {
    const modelsPath = path.join(packageDir, 'src/models');
    const groups = new Map<string, Map<string, VersionFiles>>();
    for (const file of project.getSourceFiles()) {
        const parts = path.relative(modelsPath, file.getFilePath()).split(path.sep);
        const [group = '', version = '', ...rest] = parts;
        const isResource = rest.length === 1;
        const isType = rest.length === 2 && rest[0] === 'types';
        if (group === '..' || !(isResource || isType)) {
            continue;
        }
        const versions = groups.get(group) ?? new Map<string, VersionFiles>();
        groups.set(group, versions);
        const files = versions.get(version) ?? { resources: [], types: [] };
        versions.set(version, files);
        (isResource ? files.resources : files.types).push(rest.at(-1) ?? '');
    }

    let indexFileContent = '';
    for (const group of [...groups.keys()].sort(byCodeUnit)) {
        const versions = groups.get(group) ?? new Map<string, VersionFiles>();
        let groupFileContent = '';
        for (const version of [...versions.keys()].sort(byCodeUnit)) {
            const { resources, types } = versions.get(version) ?? { resources: [], types: [] };
            const versionFileContent = [
                ...resources.sort(byCodeUnit).map((file) => `export * from './${file}';\n`),
                ...types.sort(byCodeUnit).map((file) => `export type * from './types/${file}';\n`),
            ].join('');
            project.createSourceFile(
                path.join(modelsPath, group, version, 'index.ts'),
                versionFileContent,
                { overwrite: true },
            );
            if (resources.length > 0) {
                groupFileContent += `export * as ${version} from './${group}/${version}/index.ts';\n`;
            }
        }
        if (groupFileContent) {
            project.createSourceFile(path.join(modelsPath, `${group}.ts`), groupFileContent, {
                overwrite: true,
            });
            indexFileContent += `export * as ${group} from './models/${group}.ts';\n`;
        }
    }
    project.createSourceFile(path.join(packageDir, 'src/index.ts'), indexFileContent, {
        overwrite: true,
    });
}
