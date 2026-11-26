import * as fs from 'node:fs';
import * as path from 'node:path';
import pc from 'picocolors';
import { kindWithGroup } from './resource/clusterScopedKinds.ts';
import type { NamespacedResourceMeta, Resource, Scope } from './resource/Resource.ts';

/**
 * Identifies a resource the way Kubernetes does: group, kind, namespace and name
 * (the version doesn't matter), e.g. `Deployment.apps web/nginx`.
 */
function describe(resource: Resource): string {
    const kind = kindWithGroup(resource.apiVersion, resource.kind);
    const namespace = (resource.metadata as NamespacedResourceMeta).namespace;
    return `${kind} ${namespace ? `${namespace}/` : ''}${resource.name}`;
}

export interface AppArgs {
    readonly namespace?: string;
    /**
     * @default 'filePerResource'
     */
    readonly outputType?: 'singleFile' | 'filePerResource';
}

/**
 * Each Kubernetes Api Object must belong to an instance of this class.
 * So we know where to save the resources.
 */
export class App implements Scope {
    readonly namespace?: string;
    readonly outputName: string;
    private readonly args?: AppArgs;
    /** Resources by `describe()` id, in creation order. */
    private readonly byId = new Map<string, Resource>();

    constructor(outputName: string, args?: AppArgs) {
        this.namespace = args?.namespace;
        this.outputName = outputName;
        this.args = args;
    }

    /**
     * Every resource added to this app, in creation order. Read-only: change the resources
     * themselves (e.g. labels), or leave objects out up front (e.g. Helm's `filter`).
     */
    get resources(): readonly Resource[] {
        return [...this.byId.values()];
    }

    /**
     * Called by the Resource constructor. You don't need to call this yourself.
     * Throws if a resource with the same group, kind, namespace and name was already added.
     */
    addResource(resource: Resource) {
        const id = describe(resource);
        if (this.byId.has(id)) {
            throw new Error(`Duplicate resource in app '${this.outputName}': ${id}`);
        }
        this.byId.set(id, resource);
    }

    toYaml() {
        return `---\n${[...this.byId.values()].map((resource) => resource.toYaml()).join('---\n')}`;
    }

    save() {
        if (this.args?.outputType === 'singleFile') {
            console.log(pc.blueBright(`Saving to ${this.outputName}.yaml`));
            fs.writeFileSync(`${this.outputName}.yaml`, this.toYaml());
        } else {
            // Check file names before touching the output directory, so a failed save
            // doesn't delete the previous output. Different namespaces or API groups can
            // share a kind and name, but not a file.
            const files = new Map<string, Resource>();
            for (const r of this.byId.values()) {
                const file = path.join(this.outputName, `${r.kind}.${r.name}.yaml`);
                const existing = files.get(file);
                if (existing) {
                    throw new Error(
                        `${describe(existing)} and ${describe(r)} would both be saved to ${file}. ` +
                            `Give them different names or use outputType: 'singleFile'.`,
                    );
                }
                files.set(file, r);
            }

            // The output directory is deleted below; never let that be the working directory or a parent.
            const outDir = path.resolve(this.outputName);
            const cwdFromOut = path.relative(outDir, process.cwd());
            if (
                cwdFromOut !== '..' &&
                !cwdFromOut.startsWith(`..${path.sep}`) &&
                !path.isAbsolute(cwdFromOut)
            ) {
                throw new Error(
                    `App '${this.outputName}' would save to ${outDir}, which contains the current directory. ` +
                        `Pick a dedicated output directory, e.g. 'dist/${path.basename(outDir) || 'app'}'.`,
                );
            }
            if (fs.existsSync(this.outputName)) {
                fs.rmSync(this.outputName, { recursive: true });
            }
            fs.mkdirSync(this.outputName, { recursive: true });
            for (const [file, r] of files) {
                console.log(pc.blueBright(`Saving to ${file}`));
                fs.writeFileSync(file, r.toYaml());
            }
        }
    }
}
