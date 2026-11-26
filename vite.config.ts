import { defineConfig } from 'vite-plus';

/** Generated code: shaped by tools/codegen and the CLI, not by the formatter/linter. */
const generated = ['packages/k8s/src/**', 'apps/examples/src/crds/**'];

export default defineConfig({
    fmt: {
        ignorePatterns: ['*.json', '*.yaml', '*.yml', '*.md', ...generated],
        singleQuote: true,
        tabWidth: 4,
    },
    lint: {
        ignorePatterns: generated,
        jsPlugins: [
            {
                name: 'vite-plus',
                specifier: 'vite-plus/oxlint-plugin',
            },
        ],
        rules: {
            'vite-plus/prefer-vite-plus-imports': 'error',
            'typescript/no-import-type-side-effects': 'error',
            'typescript/no-misused-promises': 'error',
        },
        options: {
            typeAware: true,
            typeCheck: true,
        },
    },
    run: {
        cache: true,
    },
});
