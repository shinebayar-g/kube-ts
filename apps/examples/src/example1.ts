import { log } from 'node:console';
import { App } from '@kube-ts/core';
import { ConfigMap } from '@kube-ts/k8s/core/v1/ConfigMap';
import { Deployment } from '@kube-ts/k8s/apps/v1/Deployment';

const app = new App('my-k8s-app', { namespace: 'my-app-namespace' });

const cm = new ConfigMap(app, 'my-config-map', {
    metadata: {
        // name: 'my-config-map2', // inferred from resource name
        namespace: 'fooo',
    },
    data: {
        key1: 'value1',
        key2: 'value2',
    },
});

console.log('configmap name:', cm.name);

const d = new Deployment(app, 'my-nginx-deployment', {
    metadata: {
        // name: 'my-nginx-deployment2', // inferred from resource name
        // namespace: 'fooo', // inferred from app namespace
    },
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

log('name is:', d.name);

app.save();
