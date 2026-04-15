# Packaging Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/packaging-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-15
**Applicability**: Projects using UDS/DevAP toolchain
**Scope**: universal

---

## Purpose

This standard defines a Recipe-based packaging framework that enables user projects to declare packaging targets in `.devap/packaging.yaml`. UDS provides the Recipe definitions and built-in Recipe library; DevAP executes the orchestration at pipeline time.

The framework separates concerns:
- **User project**: declares *what* to package (targets + config overrides)
- **UDS**: defines *how* to package (Recipe structure + built-in Recipes)
- **DevAP**: executes *when* to package (pipeline stage between Review and Deploy)

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Recipe-based** | Every packaging target references a named Recipe; no ad-hoc scripts in pipeline YAML |
| **Declarative targets** | Projects declare targets in `.devap/packaging.yaml`; DevAP resolves and executes |
| **Customizable** | Four customization layers allow config overrides, hook injection, custom Recipes, and escape hatches |
| **Pipeline-integrated** | Packaging runs as a named stage between Review and Deploy in the VibeOps pipeline |

---

## Recipe Structure

A Recipe is a YAML file that defines how to package a project. The following fields are defined:

```yaml
# Recipe: <name>.yaml
name: <string>            # REQUIRED — unique recipe identifier (kebab-case)
description: <string>     # OPTIONAL — human-readable description
requires:                 # OPTIONAL — files that must exist before execution
  - <file-path>
steps:                    # REQUIRED — ordered list of build/package steps
  - run: <shell-command>
    description: <string> # OPTIONAL — human-readable step description
config:                   # OPTIONAL — default configuration values (overridable)
  <key>: <value>
hooks:                    # OPTIONAL — lifecycle hooks (null = no-op)
  preBuild: ~
  postBuild: ~
  prePublish: ~
  postPublish: ~
```

### Required vs Optional Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique recipe identifier, kebab-case |
| `steps` | Yes | At least one step must be defined |
| `description` | No | Human-readable description |
| `requires` | No | Pre-condition file checks |
| `config` | No | Default config values; all keys are overridable by user project |
| `hooks` | No | Lifecycle hook points; `~` means no-op |

### Step Variables

Config values and runtime context are available as `{variable}` placeholders in `run` commands:

| Variable | Source | Example |
|----------|--------|---------|
| `{registry}` | `config.registry` | `ghcr.io` |
| `{name}` | `package.json#name` or `config.name` | `my-app` |
| `{version}` | `package.json#version` or `config.version` | `1.2.3` |
| `{platforms}` | `config.platforms` | `linux/amd64,linux/arm64` |
| `{output_dir}` | `config.output_dir` | `dist/installers` |

---

## Built-in Recipes

UDS ships four built-in Recipes located in the `recipes/` directory:

| Recipe | File | Use Case |
|--------|------|----------|
| `npm-library` | `recipes/npm-library.yaml` | npm package without a binary entry point |
| `npm-cli` | `recipes/npm-cli.yaml` | npm package with a `bin` field (CLI tool) |
| `docker-service` | `recipes/docker-service.yaml` | Docker container image build and push |
| `windows-installer` | `recipes/windows-installer.yaml` | Windows installer (.msi / .exe) via user script |

### When to Use Each Recipe

```
Is the output an npm package?
├── Yes → Does package.json contain a "bin" field?
│         ├── Yes → npm-cli
│         └── No  → npm-library
└── No  → Is the output a container image?
          ├── Yes → docker-service
          └── No  → Is the output a Windows installer?
                    ├── Yes → windows-installer
                    └── No  → write a custom recipe (see Customization Layers)
```

---

## Customization Layers

Projects that need to deviate from built-in Recipe defaults should use the lowest applicable layer:

| Layer | Mechanism | When to Use |
|-------|-----------|-------------|
| **L1 — Config Override** | `config:` block in `.devap/packaging.yaml` | Change default values (registry URL, tag, output dir) |
| **L2 — Hook Injection** | `hooks:` block in `.devap/packaging.yaml` | Run extra commands before/after build or publish |
| **L3 — Custom Recipe** | New `.yaml` file in project's `.devap/recipes/` | Entirely different build process; built-ins don't apply |
| **L4 — Escape Hatch** | `script:` key replacing `recipe:` in target definition | Raw shell script when no Recipe abstraction is suitable |

### L1 Example — Config Override

```yaml
# .devap/packaging.yaml
targets:
  - name: publish-npm
    recipe: npm-library
    config:
      registry: https://npm.pkg.github.com
      access: restricted
      tag: beta
```

### L2 Example — Hook Injection

```yaml
# .devap/packaging.yaml
targets:
  - name: docker-push
    recipe: docker-service
    hooks:
      postPush: |
        curl -X POST https://hooks.example.com/deploy-notify \
          -d "{\"version\": \"{version}\"}"
```

### L3 Example — Custom Recipe

```yaml
# .devap/recipes/electron-app.yaml
name: electron-app
description: Build Electron desktop application
requires:
  - package.json
  - electron-builder.yml
steps:
  - run: npm run build
  - run: npx electron-builder --publish never
config:
  output_dir: dist
```

### L4 Example — Escape Hatch

```yaml
# .devap/packaging.yaml
targets:
  - name: legacy-bundle
    script: |
      ./scripts/legacy-bundle.sh
      mv output/ dist/bundle/
```

---

## Acceptance Criteria for Packaging

A packaging run is considered **successful** when ALL of the following conditions are met:

| Criterion | Threshold | Notes |
|-----------|-----------|-------|
| All `requires` files exist | 100% | Checked before any step runs |
| All steps exit with code 0 | 100% | Any non-zero exit fails the run |
| `postBuild` artifact exists | Present in expected path | Verified by DevAP after build step |
| Hook commands exit with code 0 | 100% | Hook failure propagates as step failure |
| Published artifact is retrievable | HTTP 200 / registry query succeeds | Verified by DevAP post-publish smoke check |

### Failure Handling

| Failure Type | Action | Retry? |
|--------------|--------|--------|
| Missing `requires` file | Fail immediately, report missing path | No |
| Step non-zero exit | Fail immediately, run `postBuild` hook if defined | Configurable (default: no) |
| Hook non-zero exit | Fail immediately | No |
| Publish unreachable | Retry up to 3 times with exponential backoff | Yes (3×) |

---

## Related Standards

- [Deployment Standards](deployment-standards.md) — Deploy stage that follows packaging
- [Pipeline Integration Standards](pipeline-integration-standards.md) — CI/CD pipeline configuration
- [Checkin Standards](checkin-standards.md) — Quality gates before packaging
- [Versioning Standards](versioning.md) — Version numbers used in package artifacts

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-15 | Initial release — XSPEC-034 Phase 1 |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
