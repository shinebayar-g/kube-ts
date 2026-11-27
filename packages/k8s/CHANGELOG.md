# Changelog

## [1.32.0](https://github.com/shinebayar-g/kube-ts/compare/@kube-ts/k8s@1.32.0...@kube-ts/k8s@1.32.0) (2026-11-27)


### ⚠ BREAKING CHANGES

* disallow deep import paths ([#317](https://github.com/shinebayar-g/kube-ts/issues/317))
* drop openapi-generator ([#315](https://github.com/shinebayar-g/kube-ts/issues/315))
* split k8s codegen to local tool package, rename K8sApp to App, receive Scope in constructor ([#308](https://github.com/shinebayar-g/kube-ts/issues/308))
* rename to kube-ts ([#307](https://github.com/shinebayar-g/kube-ts/issues/307))

### New Features

* drop openapi-generator ([#315](https://github.com/shinebayar-g/kube-ts/issues/315)) ([46a5586](https://github.com/shinebayar-g/kube-ts/commit/46a55865bc75c01045ac67074efb5fd72316d499))
* rename to kube-ts ([#307](https://github.com/shinebayar-g/kube-ts/issues/307)) ([3759eef](https://github.com/shinebayar-g/kube-ts/commit/3759eef747bb2fcd6f27c0017132c60ea889d4cf))


### Bug Fixes

* disallow deep import paths ([#317](https://github.com/shinebayar-g/kube-ts/issues/317)) ([134a792](https://github.com/shinebayar-g/kube-ts/commit/134a7922edc50798f12dc39feeeb833c5091d64e))
* drop generated object metadata, owner references, managed fields ([#318](https://github.com/shinebayar-g/kube-ts/issues/318)) ([b07ada1](https://github.com/shinebayar-g/kube-ts/commit/b07ada153d106d50f150e797a88e99b4ceba47d0))
* **helm:** assign namespaces for templated objects ([#310](https://github.com/shinebayar-g/kube-ts/issues/310)) ([2b22a51](https://github.com/shinebayar-g/kube-ts/commit/2b22a51c0daad69eee28cbaf7aa99f163982bd87))


### Refactoring

* split k8s codegen to local tool package, rename K8sApp to App, receive Scope in constructor ([#308](https://github.com/shinebayar-g/kube-ts/issues/308)) ([7cb2a63](https://github.com/shinebayar-g/kube-ts/commit/7cb2a630278bc08678304401de7b548c1443bf17))
