import { defineConfig } from 'vite-plus';

export default defineConfig({
    pack: {
        // One output file per model so `@kube-ts/k8s/apps/v1` style subpath imports keep working.
        entry: ['src/index.ts', 'src/models/**/*.ts'],
        unbundle: true,
        dts: { generator: 'tsgo' },
    },
});
