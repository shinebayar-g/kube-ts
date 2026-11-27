# Changelog

## 0.1.0 (2026-11-27)


### ⚠ BREAKING CHANGES

* split k8s codegen to local tool package, rename K8sApp to App, receive Scope in constructor ([#308](https://github.com/shinebayar-g/kube-ts/issues/308))
* rename to kube-ts ([#307](https://github.com/shinebayar-g/kube-ts/issues/307))

### New Features

* rename to kube-ts ([#307](https://github.com/shinebayar-g/kube-ts/issues/307)) ([3759eef](https://github.com/shinebayar-g/kube-ts/commit/3759eef747bb2fcd6f27c0017132c60ea889d4cf))


### Bug Fixes

* drop generated object metadata, owner references, managed fields ([#318](https://github.com/shinebayar-g/kube-ts/issues/318)) ([b07ada1](https://github.com/shinebayar-g/kube-ts/commit/b07ada153d106d50f150e797a88e99b4ceba47d0))
* **helm:** always pass namespace so kubeconfig namespace isn't read ([#311](https://github.com/shinebayar-g/kube-ts/issues/311)) ([9340f7a](https://github.com/shinebayar-g/kube-ts/commit/9340f7a6326bb5c1759c6234678a737fd0414692))
* **helm:** assign namespaces for templated objects ([#310](https://github.com/shinebayar-g/kube-ts/issues/310)) ([2b22a51](https://github.com/shinebayar-g/kube-ts/commit/2b22a51c0daad69eee28cbaf7aa99f163982bd87))
* **helm:** don't wrap yaml doc, add more common flag types ([#309](https://github.com/shinebayar-g/kube-ts/issues/309)) ([fab8699](https://github.com/shinebayar-g/kube-ts/commit/fab86992ad56e7e6913be6be3f80f5e92644342b))
* lint issues ([#313](https://github.com/shinebayar-g/kube-ts/issues/313)) ([f5dd034](https://github.com/shinebayar-g/kube-ts/commit/f5dd03411c8536b0287516eee74562f5da7d50b3))


### Refactoring

* split k8s codegen to local tool package, rename K8sApp to App, receive Scope in constructor ([#308](https://github.com/shinebayar-g/kube-ts/issues/308)) ([7cb2a63](https://github.com/shinebayar-g/kube-ts/commit/7cb2a630278bc08678304401de7b548c1443bf17))
