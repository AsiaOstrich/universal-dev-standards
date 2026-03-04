# Project Structure Standard

**Version**: 1.2.0
**Last Updated**: 2026-03-04
**Applicability**: All software projects
**Scope**: partial
**Industry Standards**: Maven Standard Directory Layout
**References**: [github.com](https://github.com/golang-standards/project-layout)

**English** | [繁體中文](../locales/zh-TW/core/project-structure.md)

---

## Purpose

This standard defines conventions for project directory structure beyond documentation files. It covers common directories for tools, build outputs, and language-specific conventions.

---

## Common Project Directories

### Recommended Directory Structure

```
project-root/
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── LICENSE                      # License file
│
├── .standards/ or .claude/      # Development standards
│   └── ...
│
├── docs/                        # Documentation
│   └── ...
│
├── src/                         # Source code (language-dependent)
│   └── ...
│
├── tests/                       # Test files (if separate from src)
│   └── ...
│
├── tools/                       # Development/deployment scripts
│   ├── deployment/              # Deployment scripts
│   ├── migration/               # Database migration tools
│   └── scripts/                 # Utility scripts
│
├── examples/                    # Usage examples
│   └── ...
│
├── dist/                        # Build output (gitignored)
├── build/                       # Compiled artifacts (gitignored)
└── publish/                     # Release packages (partially gitignored)
```

---

## Directory Definitions

### Source and Build Directories

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `src/` | Source code | No | Language-dependent; see conventions below |
| `lib/` | Library/dependency code | Depends | Vendored deps may be committed |
| `dist/` | Distribution/build output | **Yes** | Generated files, never commit |
| `build/` | Compiled artifacts | **Yes** | Intermediate build files |
| `out/` | Output directory | **Yes** | Alternative to dist/build |
| `bin/` | Binary executables | **Yes** | Compiled binaries |
| `obj/` | Object files | **Yes** | .NET intermediate files |

### Tool and Script Directories

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `tools/` | Development/deployment tools | No | Shell scripts, Python tools, etc. |
| `scripts/` | Build/CI scripts | No | Often at root or under tools/ |
| `.github/` | GitHub-specific configs | No | Actions, templates, workflows |
| `.gitlab/` | GitLab-specific configs | No | CI templates |

### Data and Configuration Directories

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `data/` | Test/seed data | Depends | Large files should be gitignored |
| `config/` | Configuration files | Depends | Secrets must be gitignored |
| `assets/` | Static assets | No | Images, templates, etc. |
| `resources/` | Resource files | No | Alternative to assets/ |

### Release and Publish Directories

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `publish/` | Release packages | Partial | May keep release notes, gitignore binaries |
| `release/` | Release artifacts | **Yes** | Generated release files |
| `packages/` | Monorepo packages | No | For monorepo projects |

---

## Language-Specific Conventions

### .NET / C#

```
project-root/
├── ProjectName.sln              # Solution file at root
├── ProjectName/                 # Main project
│   ├── ProjectName.csproj
│   ├── Program.cs
│   ├── Controllers/
│   └── ...
├── ProjectName.Domain/          # Domain layer (Clean Architecture)
├── ProjectName.Application/     # Application layer
├── ProjectName.Infrastructure/  # Infrastructure layer
├── ProjectName.Tests/           # Test project
└── docs/
```

**Convention**: Projects are subdirectories of root, not under `src/`. Solution file (`.sln`) stays at root.

---

### Node.js / TypeScript

```
project-root/
├── package.json
├── tsconfig.json               # If TypeScript
├── src/                        # Source code
│   ├── index.ts
│   ├── controllers/
│   └── services/
├── dist/                       # Compiled output (gitignored)
├── tests/ or __tests__/        # Test files
├── node_modules/               # Dependencies (gitignored)
└── docs/
```

**Convention**: Source in `src/`, compiled output in `dist/`. Tests can be in `tests/`, `__tests__/`, or colocated with source.

---

### Python

```
project-root/
├── pyproject.toml or setup.py
├── src/                        # src-layout (recommended)
│   └── package_name/
│       ├── __init__.py
│       └── module.py
├── tests/
│   └── test_module.py
├── docs/
├── .venv/                      # Virtual environment (gitignored)
└── dist/                       # Built packages (gitignored)
```

**Convention**: Use src-layout (`src/package_name/`) for libraries. Flat layout (`package_name/` at root) acceptable for applications.

---

### Java / Maven

```
project-root/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   └── resources/
│   └── test/
│       ├── java/
│       └── resources/
├── target/                     # Build output (gitignored)
└── docs/
```

**Convention**: Maven standard directory layout. Do not deviate.

---

### Go

```
project-root/
├── go.mod
├── go.sum
├── main.go                     # Or cmd/app/main.go for multiple binaries
├── cmd/                        # Application entry points
│   └── myapp/
│       └── main.go
├── pkg/                        # Public library code
│   └── mylib/
├── internal/                   # Private application code
│   └── ...
├── api/                        # API definitions (protobuf, OpenAPI)
└── docs/
```

**Convention**: Use `cmd/` for binaries, `internal/` for private code, `pkg/` for public libraries.

---

## Monorepo Structure

For projects with multiple packages/applications:

```
project-root/
├── package.json                # Root package.json (if using npm/yarn workspaces)
├── packages/                   # Shared packages
│   ├── shared-utils/
│   ├── ui-components/
│   └── api-client/
├── apps/                       # Applications
│   ├── web/
│   ├── mobile/
│   └── api-server/
├── tools/                      # Shared build tools
├── docs/                       # Shared documentation
└── README.md
```

---

## Monorepo vs Polyrepo Decision Guide

### Decision Matrix

Use this matrix to determine which approach fits your project:

| Factor | Monorepo Favored | Polyrepo Favored |
|--------|------------------|------------------|
| **Code Sharing** | High (shared libs, components) | Low (independent services) |
| **Team Structure** | Single team or tight collaboration | Autonomous teams |
| **Release Cadence** | Coordinated releases | Independent releases |
| **CI/CD Complexity** | Unified pipeline acceptable | Need isolated pipelines |
| **Repository Size** | < 5GB, < 1M files | Large assets, long history |
| **Dependency Management** | Centralized version control | Team-specific versions OK |
| **Tooling Investment** | Willing to invest in tooling | Prefer simple git workflow |

### Decision Flowchart

```
┌─────────────────────────────────────────┐
│ Do multiple projects share significant  │
│ code or dependencies?                   │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
       YES              NO
        │               │
        ▼               ▼
┌───────────────┐ ┌─────────────────────┐
│ Consider      │ │ Do teams need       │
│ MONOREPO      │ │ release independence│
└───────┬───────┘ └──────────┬──────────┘
        │                    │
        ▼            ┌───────┴───────┐
┌───────────────┐    ▼               ▼
│ Can you invest│   YES              NO
│ in tooling?   │    │               │
└───────┬───────┘    ▼               ▼
        │      ┌──────────┐   ┌──────────┐
┌───────┴───────┐│ POLYREPO │   │ MONOREPO │
▼               ▼└──────────┘   │ may work │
YES            NO               └──────────┘
│               │
▼               ▼
┌──────────┐  ┌──────────┐
│ MONOREPO │  │ POLYREPO │
│ (full)   │  │ (simpler)│
└──────────┘  └──────────┘
```

---

## Monorepo Tools Comparison

### Tool Selection Matrix

| Feature | Turborepo | Nx | Lerna | Rush |
|---------|-----------|----|----|------|
| **Primary Use** | Task running | Full framework | Publishing | Enterprise |
| **Learning Curve** | Low | Medium-High | Low | High |
| **Build Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Remote Caching** | ✅ Built-in | ✅ Nx Cloud | ❌ Manual | ✅ Built-in |
| **Code Generation** | ❌ | ✅ Extensive | ❌ | ❌ |
| **Affected Detection** | ✅ | ✅ | ✅ | ✅ |
| **Framework Support** | Framework-agnostic | React, Angular, etc. | Any | Any |
| **Maintenance** | Vercel | Nrwl | Lerna-Lite fork | Microsoft |
| **Best For** | Small-medium teams | Large teams, enterprise | Simple publishing | Enterprise-scale |

### Quick Selection Guide

**Choose Turborepo if**:
- You want minimal configuration
- Primary need is fast builds with caching
- Team is small to medium (< 50 developers)
- You prefer convention over configuration

**Choose Nx if**:
- You need code generation and scaffolding
- You want built-in framework integrations
- Team is large or enterprise-scale
- You need advanced dependency graph visualization

**Choose Lerna if**:
- Primary need is npm package publishing
- You want simple, familiar tooling
- You're migrating from individual packages

**Choose Rush if**:
- You're in an enterprise environment
- You need strict dependency isolation
- You have complex approval workflows
- You're using pnpm at scale

### Turborepo Example

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**", "test/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Nx Example

```json
// nx.json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "test": {
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["default", "!{projectRoot}/**/*.spec.ts"]
  },
  "defaultBase": "main"
}
```

---

## Workspace Configuration

### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### Yarn Workspaces

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "yarn workspaces foreach -pt run build",
    "test": "yarn workspaces foreach run test"
  }
}
```

### npm Workspaces

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces --if-present"
  }
}
```

---

## Package-based Architecture

### Concept

Package-based architecture organizes code by **feature boundaries** rather than technical layers. Each package is a self-contained unit with clear interfaces.

```
Traditional (Layer-based)          Package-based (Feature-based)
─────────────────────────          ────────────────────────────
src/                               packages/
├── controllers/                   ├── authentication/
│   ├── userController.js         │   ├── api/
│   └── orderController.js        │   ├── domain/
├── services/                      │   ├── infrastructure/
│   ├── userService.js            │   └── index.ts
│   └── orderService.js           ├── orders/
├── models/                        │   ├── api/
│   ├── user.js                   │   ├── domain/
│   └── order.js                  │   ├── infrastructure/
└── repositories/                  │   └── index.ts
    ├── userRepository.js         └── shared/
    └── orderRepository.js            ├── database/
                                      └── utils/
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **Clear Boundaries** | Each package has explicit public API |
| **Independent Testing** | Test packages in isolation |
| **Parallel Development** | Teams work on separate packages |
| **Selective Deployment** | Deploy only changed packages |
| **Code Ownership** | Clear ownership per package |

### Package Structure Template

```
packages/feature-name/
├── package.json          # Package metadata
├── tsconfig.json         # TypeScript config (if applicable)
├── src/
│   ├── index.ts          # Public API exports
│   ├── api/              # External interfaces (REST, GraphQL, etc.)
│   ├── domain/           # Business logic
│   │   ├── entities/
│   │   ├── services/
│   │   └── events/
│   └── infrastructure/   # External integrations
│       ├── database/
│       └── external-services/
├── tests/
│   ├── unit/
│   └── integration/
└── README.md             # Package documentation
```

### Public API Design

```typescript
// packages/authentication/src/index.ts
// Only export what other packages need

// Domain types
export type { User, AuthToken, AuthResult } from './domain/types';

// Service interfaces
export { AuthService } from './domain/services/auth-service';

// API handlers (if needed by other packages)
export { createAuthRouter } from './api/routes';

// Do NOT export internal implementation details
// ❌ export { hashPassword } from './infrastructure/crypto';
```

### Inter-Package Dependencies

```json
// packages/orders/package.json
{
  "name": "@myorg/orders",
  "version": "1.0.0",
  "dependencies": {
    "@myorg/authentication": "workspace:*",
    "@myorg/shared": "workspace:*"
  }
}
```

---

## IDE and Editor Artifacts

### Common Artifacts to Gitignore

```gitignore
# IDE - JetBrains (IntelliJ, Rider, WebStorm)
.idea/
*.iml

# IDE - Visual Studio
.vs/
*.user
*.suo

# IDE - VS Code (optional, some teams commit .vscode/)
.vscode/
!.vscode/settings.json    # May commit shared settings
!.vscode/extensions.json  # May commit recommended extensions

# IDE - Eclipse
.project
.classpath
.settings/

# macOS
.DS_Store

# Windows
Thumbs.db
desktop.ini
```

### Detecting Uncommitted Artifacts

Before committing, verify no IDE artifacts are tracked:

```bash
# Check for common IDE artifacts in git
git ls-files | grep -E '^\$|^\.idea|^\.vs/|\.user$|\.suo$'
```

**Known Issue**: VSCode variable expansion errors can create directories like `${workspaceFolder}/`. If found, remove them:

```bash
# Remove if exists and not tracked
rm -rf '${workspaceFolder}'
```

---

## Source Code Organization Terminology

### Directory Purpose Guide

When organizing source code, these directories serve distinct purposes:

| Directory | Purpose | When to Use | Stateless? | Reusable Scope |
|-----------|---------|-------------|------------|----------------|
| `utils/` | Pure utility functions | Stateless, no business logic, cross-module reusable | Yes | Global |
| `helpers/` | Context-specific assistants | Bound to a specific layer (test, view, controller) | Varies | Layer-specific |
| `shared/` | Cross-module shared code | Used by 2+ modules, may have package boundary | Varies | Cross-module |
| `common/` | Alias for shared/ | Less recommended; use `shared/` instead | Varies | Cross-module |
| `lib/` | Wrapped/vendored libraries | Wrapping third-party dependencies, internal libraries | Varies | Project-wide |
| `internal/` | Private module code (Go convention) | Module/package internals not exposed to consumers | Varies | Package-internal |

### Decision Flow

```
Is it stateless and has no business logic?
├── YES: Is it reusable across the entire project?
│   ├── YES → utils/
│   └── NO: Is it tied to a specific layer (tests, views)?
│       ├── YES → helpers/  (e.g., tests/helpers/, views/helpers/)
│       └── NO → Place in the module that uses it
└── NO: Is it used by 2+ modules?
    ├── YES → shared/
    └── NO: Is it wrapping a third-party dependency?
        ├── YES → lib/
        └── NO → Place in the owning module
```

### Examples

```
src/
├── utils/              # formatDate(), slugify(), deepClone()
├── helpers/            # (uncommon at src/ level; prefer layer-specific)
├── shared/
│   ├── types/          # Cross-module TypeScript types
│   └── constants/      # Shared constants
├── lib/
│   └── http-client/    # Wrapped axios with project defaults
└── modules/
    └── auth/
        └── helpers/    # Auth-specific helper functions
```

---

## Configuration Files Placement

### Standard Locations

| Category | Location | Examples |
|----------|----------|---------|
| **Root configs** | Project root `/` | `package.json`, `tsconfig.json`, `pyproject.toml`, `.eslintrc.json` |
| **App configs** | `config/` or `src/config/` | Database config, feature flags, app settings |
| **Environment** | `.env` files (gitignored) | `.env`, `.env.local`, `.env.production` |
| **CI/CD** | `.github/workflows/` or `.gitlab-ci.yml` | CI pipeline definitions |
| **Infrastructure** | `infra/` or `deploy/` | Terraform, Kubernetes manifests, Docker Compose |
| **IDE/Editor** | Root (mostly gitignored) | `.vscode/`, `.idea/`, `.editorconfig` |

### Decision Rules

1. **Tool configs** → Project root (tools expect them there)
2. **App runtime configs** → `config/` or `src/config/`
3. **Secrets** → `.env` files, **always gitignored**
4. **CI/CD** → Platform-specific directory (`.github/`, `.gitlab/`)
5. **Infrastructure as Code** → `infra/` or `deploy/`

---

## Generated Code Placement

### Standard Locations

| Type | Location | Gitignore? |
|------|----------|------------|
| **API client stubs** | `src/generated/` | Depends on workflow |
| **Protobuf/gRPC** | `src/generated/proto/` | Yes (regenerated from .proto) |
| **Database types** (ORM) | `src/generated/db/` | Depends on ORM |
| **OpenAPI types** | `src/generated/api/` | Depends on workflow |
| **Build artifacts** | `dist/`, `build/` | Yes |
| **Compiled assets** | `out/`, `bin/` | Yes |

### Rules

1. **Always separate** generated code from hand-written code
2. **Use `src/generated/`** as the standard parent directory
3. **Gitignore if reproducible** — If the code can be regenerated from a source file (`.proto`, `.graphql`, schema), gitignore it
4. **Commit if critical** — If the generation tool is not in CI or generation is non-deterministic, commit the output
5. **Never edit generated files** — Add a header comment: `// DO NOT EDIT — generated by [tool]`

---

## Anti-Patterns

### ❌ Avoid These Patterns

1. **Nested src directories without purpose**
   ```
   ❌ project/src/src/main/...
   ```

2. **Mixing build outputs with source**
   ```
   ❌ src/
       ├── app.ts
       └── app.js      # Compiled file mixed with source
   ```

3. **Multiple unrelated projects in one repo without monorepo structure**
   ```
   ❌ project/
       ├── backend/    # Unrelated project
       └── frontend/   # Another unrelated project
       # No shared tooling, no workspace config
   ```

4. **Committing generated files**
   ```
   ❌ dist/ tracked in git
   ❌ node_modules/ tracked in git
   ```

5. **Secrets in repository**
   ```
   ❌ config/secrets.json committed
   ❌ .env with real credentials committed
   ```

---

## Verification Checklist

Before committing, verify:

- [ ] Build outputs (`dist/`, `build/`, `bin/`, `obj/`) are gitignored
- [ ] Dependencies (`node_modules/`, `.venv/`, `vendor/`) are gitignored
- [ ] IDE artifacts (`.idea/`, `.vs/`) are gitignored
- [ ] No secrets in committed files
- [ ] Source structure follows language conventions
- [ ] No abnormal directories (e.g., `${workspaceFolder}/`)

---

## Related Standards

- [Documentation Structure Standard](documentation-structure.md)
- [Code Check-in Standards](checkin-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-04 | Added: Source Code Organization Terminology (utils/helpers/shared/lib), Configuration Files Placement, Generated Code Placement |
| 1.1.0 | 2026-01-24 | Added: Monorepo vs Polyrepo decision guide, Monorepo tools comparison (Turborepo, Nx, Lerna, Rush), Workspace configuration examples, Package-based Architecture |
| 1.0.1 | 2025-12-24 | Added: Related Standards section |
| 1.0.0 | 2025-12-11 | Initial project structure standard |

---

## References

- [.NET Project Structure](https://docs.microsoft.com/en-us/dotnet/core/porting/project-structure)
- [Node.js Project Structure Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Python Packaging User Guide](https://packaging.python.org/en/latest/)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Maven Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
- [Turborepo Documentation](https://turbo.build/repo/docs) - Modern build system for JavaScript/TypeScript monorepos
- [Nx Documentation](https://nx.dev/getting-started/intro) - Smart monorepo tool with advanced features
- [pnpm Workspaces](https://pnpm.io/workspaces) - Fast, disk-efficient package manager workspaces
- [Monorepo Explained](https://monorepo.tools/) - Comprehensive guide to monorepo tools

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
