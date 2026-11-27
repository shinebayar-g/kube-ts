SHELL := /bin/bash
.SHELLFLAGS += -euo pipefail


k8sVersion := v1.32.0
k8sUnusedOpenApiFiles := \
	".well-known__openid-configuration_openapi.json" \
	"openid__v1__jwks_openapi.json" \
	"logs_openapi.json" \
	"version_openapi.json"


# Download Kubernetes OpenAPI schemas to tools/codegen/openapi-spec/$(k8sVersion)/*.json
.PHONY: download-schema
download-schema:
	@echo "Downloading Kubernetes schema version $(k8sVersion)"
	@git clone --depth 1 --branch $(k8sVersion) --filter=blob:none --sparse https://github.com/kubernetes/kubernetes.git temp-k8s && \
		cd temp-k8s && \
		git sparse-checkout set --no-cone /api/openapi-spec/v3
	@rsync -a --delete temp-k8s/api/openapi-spec/v3/ tools/codegen/openapi-spec/$(k8sVersion)/
	@rm -rf temp-k8s
	@cd tools/codegen/openapi-spec/$(k8sVersion)/ && rm -f $(k8sUnusedOpenApiFiles)


# Reads tools/codegen/openapi-spec/$(k8sVersion)/*.json files
# Generates tools/codegen/gen/$(k8sVersion)/models/*.ts files (json-schema-to-typescript):
# one interface or type per schema in components.schemas, one file each.
.PHONY: models
models:
	@echo "Generating Kubernetes models"
	@cd tools/codegen && pnpm gen


# Copy generated models to packages/k8s/src/models/
# We will later process these files to create proper classes and interfaces,
# and organize them into subdirectories based on their group, version, and kind.
.PHONY: copy-models
copy-models:
	@echo "Copying Kubernetes models"
	@rsync -a --delete tools/codegen/gen/$(k8sVersion)/models/ packages/k8s/src/models/


# Generates "schemas.json"
# Analyzes tools/codegen/openapi-spec/$(k8sVersion)/*.json files
# and, for each schema, determines:
# - Resource or property
# - Group, version, kind
# - Cluster or namespaced scope
.PHONY: parse-schema
parse-schema:
	@cd tools/codegen && node src/parseSchemas.ts


# Requires "schemas.json"
# Updates packages/k8s/src/models/*.ts files.
# - Remove unused files. E.g: List, Status, State etc.
# - Replace IoK8sApimachineryPkgApiResourceQuantity, IoK8sApimachineryPkgUtilIntstrIntOrString with `number | string`
# - Remove unused imports and clean up the class.
# - Based on the schema info, convert classes to interfaces where applicable.
# No new files are created here.
.PHONY: k8s
k8s: copy-models
	@echo "Generating @kube-ts/k8s package"
	@cd tools/codegen && node src/generateCore.ts


# Note: It seems I need to run this multiple times to remove all the unused interfaces.
# Because on the first pass, it will remove some unused interfaces,
# but it also could leave some interfaces orphaned.
.PHONY: remove-unused
remove-unused:
	@cd tools/codegen && node src/removeUnused.ts


# Requires "schemas.json"
.PHONY: move-core
move-core:
	@echo "Moving models to subdirs"
	@cd tools/codegen && node src/moveCore.ts


.PHONY: add-exports
add-exports:
	@echo "Adding model exports"
	@cd tools/codegen && node src/addExports.ts


# Workaround until https://github.com/dsherret/ts-morph/issues/1612 is fixed.
.PHONY: fix-imports
fix-imports:
	@echo "Fixing import extensions"
	@cd tools/codegen && node src/fixImports.ts


.PHONY: lint
lint:
	@vp check --fix
