# Changelog

## [0.2.0](https://github.com/shinebayar-g/kube-ts/compare/@kube-ts/cli@0.1.0...@kube-ts/cli@0.2.0) (2026-11-28)


### ⚠ BREAKING CHANGES

* **cli:** only replace generated package dirs, never the whole outDir ([#336](https://github.com/shinebayar-g/kube-ts/issues/336))

### Bug Fixes

* **cli:** only replace generated package dirs, never the whole outDir ([#336](https://github.com/shinebayar-g/kube-ts/issues/336)) ([1d52a6a](https://github.com/shinebayar-g/kube-ts/commit/1d52a6a3c4ca558aa7f1bafee8b9ef60c3c23f86))

## 0.1.0 (2026-11-27)


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
* **helm:** assign namespaces for templated objects ([#310](https://github.com/shinebayar-g/kube-ts/issues/310)) ([2b22a51](https://github.com/shinebayar-g/kube-ts/commit/2b22a51c0daad69eee28cbaf7aa99f163982bd87))
* lint issues ([#313](https://github.com/shinebayar-g/kube-ts/issues/313)) ([f5dd034](https://github.com/shinebayar-g/kube-ts/commit/f5dd03411c8536b0287516eee74562f5da7d50b3))


### Refactoring

* split k8s codegen to local tool package, rename K8sApp to App, receive Scope in constructor ([#308](https://github.com/shinebayar-g/kube-ts/issues/308)) ([7cb2a63](https://github.com/shinebayar-g/kube-ts/commit/7cb2a630278bc08678304401de7b548c1443bf17))
