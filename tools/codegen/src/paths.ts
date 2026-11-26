import * as path from 'node:path';

/**
 * Package the generated Kubernetes models are written into.
 */
export const targetPackagePath = path.join(import.meta.dirname, '../../../packages/k8s');
