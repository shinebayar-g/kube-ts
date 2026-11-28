#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';
import { generateCRDs, readConfig } from './generateCRDs.ts';

const usage = `Usage: kube-ts [options] [crd-path-or-url]

Generates TypeScript classes from CRDs. Without an argument, reads ./kube-ts.yaml.

Arguments:
  crd-path-or-url      CRD path or URL, written to <out-dir>/<name>

Options:
  -n, --name <name>    package directory name, required with crd-path-or-url
  -o, --out-dir <dir>  output directory (default: ./crds)
  -V, --version        output the version number
  -h, --help           display help for command`;

async function main() {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            version: { type: 'boolean', short: 'V' },
            help: { type: 'boolean', short: 'h' },
            name: { type: 'string', short: 'n' },
            'out-dir': { type: 'string', short: 'o' },
        },
    });
    if (values.help) {
        console.log(usage);
        return;
    }
    if (values.version) {
        const pkg = path.join(import.meta.dirname, '..', 'package.json');
        console.log(JSON.parse(fs.readFileSync(pkg, 'utf-8')).version);
        return;
    }
    if (positionals.length > 1) {
        usageError(`expected at most one CRD path or URL, got ${positionals.length}`);
    }

    const [crdPathOrUrl] = positionals;
    const { name, 'out-dir': outDir } = values;

    if (!crdPathOrUrl) {
        if (name) usageError('--name only applies with a CRD path or URL');
        const config = readConfig('./kube-ts.yaml');
        return generateCRDs({ ...config, outDir: outDir ?? config.outDir });
    }
    if (!name) usageError('--name is required with a CRD path or URL');
    await generateCRDs({ outDir, crds: { [name]: [crdPathOrUrl] } });
}

function usageError(message: string): never {
    console.error(`error: ${message}\n\n${usage}`);
    process.exit(1);
}

try {
    await main();
} catch (e) {
    if ((e as NodeJS.ErrnoException).code?.startsWith('ERR_PARSE_ARGS')) {
        usageError((e as Error).message);
    }
    throw e;
}
