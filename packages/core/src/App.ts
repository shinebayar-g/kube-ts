import * as fs from 'node:fs';
import * as path from 'node:path';
import pc from 'picocolors';
import type { NamespacedResourceMeta, Resource, Scope } from './resource/Resource.ts';

/**
 * Identifies a resource the way Kubernetes does: group, kind, namespace and name
 * (the version doesn't matter). Formatted like kubectl, e.g. `deployment.apps web/nginx`.
 */
function describe(resource: Resource): string {
    const [group, version] = resource.apiVersion.split('/');
    const kind = version ? `${resource.kind}.${group}` : resource.kind;
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
    readonly resources: Resource[] = [];
    readonly namespace?: string;
    readonly outputName: string;
    private readonly args?: AppArgs;
    private readonly resourceIds = new Set<string>();

    constructor(outputName: string, args?: AppArgs) {
        this.namespace = args?.namespace;
        this.outputName = outputName;
        this.args = args;
    }

    /**
     * Called by the Resource constructor. You don't need to call this yourself.
     * Throws if a resource with the same group, kind, namespace and name was already added.
     */
    addResource(resource: Resource) {
        const id = describe(resource);
        if (this.resourceIds.has(id)) {
            throw new Error(`Duplicate resource in app '${this.outputName}': ${id}`);
        }
        this.resourceIds.add(id);
        this.resources.push(resource);
    }

    toYaml() {
        return `---\n${this.resources.map((resource) => resource.toYaml()).join('---\n')}`;
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
            for (const r of this.resources) {
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
