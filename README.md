# kube-ts

Write Kubernetes manifests in TypeScript.

Packages

- `@kube-ts/core` - Minimal core library that provides basic building blocks for organizing your kube-ts applications.
- `@kube-ts/k8s` - Ready to use Kubernetes core schema in TypeScript.
- `@kube-ts/cli` - CLI tool to generate TypeScript code for Custom Resource Definitions (CRDs).

`@kube-ts/k8s` is versioned after Kubernetes (`1.32.x` contains the Kubernetes 1.32 API) and has `@kube-ts/core` as a peer dependency, so install both:

```sh
npm install @kube-ts/core @kube-ts/k8s
npm install -D @kube-ts/cli # only if you generate CRD types
```

## Usage

### Example

```ts
import { App } from '@kube-ts/core';
import { Deployment } from '@kube-ts/k8s/apps/v1';

const app = new App('my-k8s-app', { namespace: 'my-app' });

new Deployment(app, 'my-nginx-deployment', {
    /**
     * Metadata is completely optional.
     * If not provided:
     * - metadata.name will be inferred from the resource id ('my-nginx-deployment' in this case).
     * - metadata.namespace will be inferred from the App namespace ('my-app' in this case).
     */
    spec: {
        selector: {
            matchLabels: {
                app: 'nginx',
            },
        },
        template: {
            metadata: {
                labels: {
                    app: 'nginx',
                },
            },
            spec: {
                containers: [
                    {
                        name: 'nginx',
                        image: 'nginx:alpine',
                        ports: [
                            {
                                containerPort: 80,
                                name: 'http',
                            },
                        ],
                    },
                ],
            },
        },
    },
});

app.save();
```

Output

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx-deployment
  namespace: my-app
spec:
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80
              name: http
```

### Imports

Each `<group>/<version>` exports its resources and their types:

```ts
import { Deployment, type DeploymentSpec } from '@kube-ts/k8s/apps/v1';
import { ConfigMap } from '@kube-ts/k8s/core/v1';
import type { LabelSelector } from '@kube-ts/k8s/meta/v1';
```

Or use the root namespaces:

```ts
import * as k8s from '@kube-ts/k8s';

new k8s.apps.v1.Deployment(app, 'nginx', { ... });
```

## @kube-ts/cli

Generates TypeScript classes from Kubernetes Custom Resource Definitions (CRDs).

```sh
# From a YAML file or a URL, written to ./crds/<name>
npx @kube-ts/cli path/to/crd.yaml --name moco
npx @kube-ts/cli https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.2/manifests/crds/application-crd.yaml --name argocd

# --out-dir changes the output directory, here to ./src/crds/argocd
npx @kube-ts/cli path/to/crd.yaml --name argocd --out-dir src/crds

# Without an argument, reads ./kube-ts.yaml
npx @kube-ts/cli
```

### Configuration file

```yaml
# kube-ts.yaml
outDir: src/crds # default: ./crds, must be inside the current directory
crds:
  argocd:
    - https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.2/manifests/crds/application-crd.yaml
    - https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.2/manifests/crds/appproject-crd.yaml
  moco:
    - moco/CustomResourceDefinition.mysqlclusters.moco.cybozu.com.yaml # local path
```

Downloaded CRDs are cached in `~/.cache/kube-ts`.

### Using generated CRDs

The output follows the same layout as `@kube-ts/k8s`: `<outDir>/<name>/<version>/index.ts`.

```ts
import { Application } from './crds/argocd/v1alpha1/index.ts';
```

For shorter paths, add an `imports` entry to your `package.json`:

```json
{ "imports": { "#crds/*": "./src/crds/*/index.ts" } }
```

```ts
import { Application } from '#crds/argocd/v1alpha1';
```

## Development

`@kube-ts/k8s` is generated from the Kubernetes OpenAPI spec by `tools/codegen`. The Kubernetes version is `k8sVersion` in `tools/codegen/src/config.ts`.

```sh
mise run download # download the spec
mise run generate # regenerate packages/k8s
```
