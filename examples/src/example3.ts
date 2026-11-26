import { K8sApp } from '@kube-ts/core';
import { Application } from './crds/argocd/v1alpha1/Application.ts';
import { v1alpha1 } from './crds/argocd/index.ts';
import { AppProject } from './crds/argocd/v1alpha1.ts';

import * as k8s from '@kube-ts/core';
import { core } from '@kube-ts/core';
import { Deployment } from '@kube-ts/core/apps/v1';
import { DaemonSet } from '@kube-ts/core/apps/v1/DaemonSet';
import { Namespace } from '@kube-ts/core/core/v1';
import { ClusterRole } from '@kube-ts/core/rbac/v1';

const app = new K8sApp('example3', { namespace: 'example3' });

new Namespace(app, 'foo', {
    metadata: {
        name: 'foo',
    },
});

new ClusterRole(app, 'foo', {
    metadata: {
        name: 'foo2',
    },
});

new core.v1.ConfigMap(app, 'foo', {
    metadata: {
        name: 'foo2',
    },
    data: {
        foo: 'bar',
    },
});

const p = new AppProject(app, 'foo', {
    spec: {},
});
new v1alpha1.Application(app, 'foo', {
    spec: {
        destination: {},
        project: p.name,
    },
});

new k8s.core.v1.ConfigMap(app, 'foo2', {});

new Deployment(app, 'foo', {});
new DaemonSet(app, 'foo', {});
new Application(app, 'foo', {
    spec: {
        destination: {
            name: 'in-cluster',
        },
        project: 'default',
    },
});

app.save();
