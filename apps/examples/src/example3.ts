import { App } from '@kube-ts/core';
// Root namespaces: k8s.<group>.<version>.<Kind>
import * as k8s from '@kube-ts/k8s';
import { core } from '@kube-ts/k8s';
// One <group>/<version> per import
import { DaemonSet, Deployment } from '@kube-ts/k8s/apps/v1';
import { Namespace } from '@kube-ts/k8s/core/v1';
import { ClusterRole } from '@kube-ts/k8s/rbac/v1';
// Generated CRDs (kube-ts.yaml), via package.json "imports" or relative paths
import { Application } from '#crds/argocd/v1alpha1';
import { v1alpha1 } from './crds/argocd/index.ts';
import { AppProject } from './crds/argocd/v1alpha1/index.ts';

const app = new App('example3', { namespace: 'example3' });

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

new k8s.core.v1.ConfigMap(app, 'foo3', {});

new Deployment(app, 'foo', {});
new DaemonSet(app, 'foo', {});
new Application(app, 'bar', {
    spec: {
        destination: {
            name: 'in-cluster',
        },
        project: 'default',
    },
});

app.save();
