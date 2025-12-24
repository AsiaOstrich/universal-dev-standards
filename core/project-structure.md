# Project Structure Standard

**Version**: 1.0.1
**Last Updated**: 2025-12-24
**Applicability**: All software projects

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
| 1.0.1 | 2025-12-24 | Added: Related Standards section |
| 1.0.0 | 2025-12-11 | Initial project structure standard |

---

## References

- [.NET Project Structure](https://docs.microsoft.com/en-us/dotnet/core/porting/project-structure)
- [Node.js Project Structure Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Python Packaging User Guide](https://packaging.python.org/en/latest/)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Maven Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
