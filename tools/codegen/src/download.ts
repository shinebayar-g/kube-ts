/**
 * `pnpm download`: downloads the Kubernetes OpenAPI v3 spec of `k8sVersion`
 * to openapi-spec/<version>/*.json.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { k8sVersion, specDir } from './config.ts';

/**
 * Spec files without any Kubernetes resources.
 */
const unusedSpecFiles = [
    '.well-known__openid-configuration_openapi.json',
    'openid__v1__jwks_openapi.json',
    'logs_openapi.json',
    'version_openapi.json',
];

function main() {
    const cloneDir = mkdtempSync(path.join(tmpdir(), 'kube-ts-k8s-'));
    try {
        console.log(`Downloading Kubernetes ${k8sVersion} OpenAPI spec`);
        // Shallow, blobless, sparse clone: only api/openapi-spec/v3 is downloaded.
        const git = (...args: string[]) =>
            execFileSync('git', args, { cwd: cloneDir, stdio: 'inherit' });
        git(
            'clone',
            '--depth=1',
            `--branch=${k8sVersion}`,
            '--filter=blob:none',
            '--sparse',
            'https://github.com/kubernetes/kubernetes.git',
            '.',
        );
        git('sparse-checkout', 'set', '--no-cone', '/api/openapi-spec/v3');

        rmSync(specDir, { recursive: true, force: true });
        cpSync(path.join(cloneDir, 'api/openapi-spec/v3'), specDir, { recursive: true });
        for (const file of unusedSpecFiles) {
            rmSync(path.join(specDir, file), { force: true });
        }
        console.log(`Saved to ${specDir}`);
    } finally {
        rmSync(cloneDir, { recursive: true, force: true });
    }
}

main();
