# kube-ts

Write Kubernetes manifests in TypeScript.

Packages

- `@kube-ts/core` - Minimal core library that provides basic building blocks for organizing your kube-ts applications.
- `@kube-ts/k8s` - Ready to use Kubernetes core schema in TypeScript.
- `@kube-ts/cli` - CLI tool to generate TypeScript code for Kubernetes core schema and Custom Resource Definitions (CRDs).

## Usage

### Example

```ts
import { K8sApp } from '@kube-ts/core';
import { Deployment } from '@kube-ts/k8s/apps/v1';
// Or you can import like this:
// import { apps } from '@kube-ts/k8s';
// and then
// new apps.v1.Deployment();

const app = new K8sApp('my-k8s-app', { namespace: 'my-app' });

new Deployment(app, 'my-nginx-deployment', {
    /**
     * Metadata is completely optional.
     * If not provided:
     * - metadata.name will be inferred from the resource id ('my-nginx-deployment' in this case).
     * - metadata.namespace will be inferred from the K8sApp namespace ('my-app' in this case).
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

## @kube-ts/cli

This package provides the command-line interface (CLI) for kube-ts.

It has 2 main functionalities:

- Generate TypeScript code for Kubernetes core schema
- Generate TypeScript code for Kubernetes Custom Resource Definitions (CRDs)

### CLI

```sh
npx @kube-ts/cli --help
```

Generate TypeScript code for Kubernetes core schema

```sh
npx @kube-ts/cli k8s@1.33
```

Generate TypeScript code for Kubernetes CRDs

```sh
# From a YAML file
npx @kube-ts/cli path/to/crd.yaml

# From a URL
npx @kube-ts/cli https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.2/manifests/crds/application-crd.yaml

```

### Configuration File

```yaml
# kube-ts.yaml
crds:
  argocd:
    - https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.2/manifests/crds/application-crd.yaml
    - https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.2/manifests/crds/applicationset-crd.yaml
    - https://raw.githubusercontent.com/argoproj/argo-cd/refs/tags/v2.13.2/manifests/crds/appproject-crd.yaml
  external-secrets:
    - https://raw.githubusercontent.com/external-secrets/external-secrets/refs/tags/v0.12.1/deploy/crds/bundle.yaml
  moco:
    - moco/CustomResourceDefinition.mysqlclusters.moco.cybozu.com.yaml # local path to the yaml file

k8sVersion: 1.33

outDir:
  crds: ./src/generated/crds
  k8s: ./src/generated/k8s

# CRD yaml files are downloaded to this directory
cacheDir: ~/.cache/kube-ts
```

Run

```sh
npx @kube-ts/cli # It will look for kube-ts.yaml in the current directory

# or
npx @kube-ts/cli -c path/to/kube-ts.yaml
npx @kube-ts/cli --config path/to/kube-ts.yaml
```
