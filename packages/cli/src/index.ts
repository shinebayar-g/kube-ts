#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';
import { generateCRDs, readConfig } from './generateCRDs.ts';

const usage = `Usage: kube-ts [options] [crd-path-or-url]

Generates TypeScript classes from CRDs. Without an argument, reads ./kube-ts.yaml.

Arguments:
  crd-path-or-url  CRD path or URL

Options:
  -V, --version    output the version number
  -h, --help       display help for command`;

async function main() {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            version: { type: 'boolean', short: 'V' },
            help: { type: 'boolean', short: 'h' },
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

    const crdPathOrUrl = positionals[0];
    if (crdPathOrUrl) {
        await generateCRDs(crdPathOrUrl);
    } else {
        const config = readConfig('./kube-ts.yaml');
        await generateCRDs(crdPathOrUrl, config);
    }
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
