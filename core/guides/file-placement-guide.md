# File Placement Decision Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/core/guides/file-placement-guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-04
**Applicability**: All software projects
**Scope**: universal
**Parent Standards**: [Project Structure](../project-structure.md), [Documentation Structure](../documentation-structure.md)

---

## Purpose

This guide answers the question: **"Where should this file go?"**

It provides a master decision tree, reverse lookup index, code organization deep dive, and development artifact lifecycle management. Use this guide when you're unsure where to place a new file in your project.

For the canonical directory definitions, see the parent standards linked above. This guide focuses on the **decision process**, not the directory catalog.

---

## 1. Master Decision Tree

Start here. Identify your file's primary category, then follow the branch.

```
What kind of file are you placing?
│
├── CODE (source, test, script, generated)
│   ├── Application logic? → src/{module}/
│   ├── Test file? → tests/ (or alongside source, per language convention)
│   ├── Script/tool? → tools/ or scripts/
│   ├── Generated code? → src/generated/{type}/
│   └── Utility/helper? → See §3 Code Organization Deep Dive
│
├── DOCUMENTATION (formal, working, reference)
│   ├── Formal (stable, versioned)?
│   │   ├── Architecture decision → docs/ADR/NNN-title.md
│   │   ├── Specification → docs/specs/
│   │   ├── API reference → docs/api-reference.md
│   │   ├── User guide → docs/
│   │   └── Flow/diagram → docs/flows/ or docs/diagrams/
│   └── Working (in-progress, temporary)?
│       ├── Brainstorm → docs/working/brainstorms/
│       ├── RFC → docs/working/rfcs/
│       ├── Investigation → docs/working/investigations/
│       ├── POC → docs/working/poc/{name}/
│       └── Meeting notes → docs/working/meeting-notes/
│
├── CONFIGURATION
│   ├── Tool config (linter, formatter, bundler) → Project root /
│   ├── App runtime config → config/ or src/config/
│   ├── Environment variables → .env (gitignored)
│   ├── CI/CD pipeline → .github/workflows/ or .gitlab-ci.yml
│   └── Infrastructure as Code → infra/ or deploy/
│
└── ASSET (static files, media)
    ├── Web public assets → public/ or static/
    ├── Source assets (needs processing) → assets/ or src/assets/
    └── Documentation images → docs/images/ or docs/diagrams/
```

---

## 2. Reverse Lookup Index

Look up your file type to find its destination.

### Code Files

| File Type | Destination | Notes |
|-----------|-------------|-------|
| Utility function | `src/utils/` | Stateless, generic, cross-module |
| Helper function | `{layer}/helpers/` | Layer-specific (e.g., `tests/helpers/`) |
| Middleware | `src/middleware/` | HTTP/request pipeline handlers |
| Type definition | `src/types/` or `shared/types/` | Global types in shared/, module types in module/ |
| Constant | `src/constants/` or `shared/constants/` | Config-like values that don't change |
| Test fixture | `tests/fixtures/` | Test data files |
| Test helper | `tests/helpers/` | Test-specific utility functions |
| Migration | `migrations/` or `db/migrations/` | Database schema changes |
| Seed data | `db/seeds/` or `seeds/` | Database seed scripts |
| Route definition | `src/routes/` | API/page route handlers |
| Config module | `src/config/` | Runtime configuration loaders |
| Generated API client | `src/generated/api/` | Auto-generated from OpenAPI/GraphQL |
| Generated DB types | `src/generated/db/` | Auto-generated from ORM schema |
| Generated protobuf | `src/generated/proto/` | Auto-generated from .proto files |
| Script/tool | `tools/` or `scripts/` | Build, deploy, maintenance scripts |
| Build config | Project root | `webpack.config.js`, `vite.config.ts`, etc. |
| Entry point | `src/index.*` or `src/main.*` | Application entry file |

### Document Files

| File Type | Destination | Notes |
|-----------|-------------|-------|
| ADR | `docs/ADR/NNN-title.md` | Numbered, permanent |
| Specification | `docs/specs/` | Organized by category |
| Brainstorm | `docs/working/brainstorms/` | Date-prefixed, temporary |
| RFC | `docs/working/rfcs/RFC-NNN-title.md` | Numbered, lifecycle-managed |
| Investigation | `docs/working/investigations/` | Technical research, date-prefixed |
| POC report | `docs/working/poc/{name}/` | Subdirectory with README.md |
| Meeting notes | `docs/working/meeting-notes/` | Date-prefixed |
| Flow documentation | `docs/flows/` | Process and data flows |
| Architecture diagram | `docs/diagrams/` | .mmd, .puml, .drawio files |
| Troubleshooting | `docs/troubleshooting.md` | Common issues and solutions |
| CHANGELOG | Root `/CHANGELOG.md` | Keep a Changelog format |
| README | Root `/README.md` or directory `README.md` | Every significant directory gets one |

### Infrastructure & Configuration Files

| File Type | Destination | Notes |
|-----------|-------------|-------|
| Dockerfile | Root `/` or `deploy/` | Single service: root; multi-service: deploy/ |
| docker-compose.yml | Root `/` or `deploy/` | Development vs production compose files |
| CI pipeline | `.github/workflows/` | GitHub Actions YAML |
| .env file | Root `/` (gitignored) | Environment-specific variables |
| IDE settings | Root `/` (mostly gitignored) | `.vscode/`, `.idea/` |
| Git hooks | `.husky/` or `.githooks/` | Pre-commit, pre-push scripts |
| License | Root `/LICENSE` | UPPERCASE, no extension |
| IaC (Terraform) | `infra/` | Terraform, Pulumi, CloudFormation |
| Kubernetes manifests | `deploy/k8s/` or `infra/k8s/` | Deployment manifests |

---

## 3. Code Organization Deep Dive

### utils/ vs helpers/ vs shared/ vs common/ vs lib/ vs internal/

This is the most common source of confusion. Here's the complete disambiguation:

#### Quick Reference

| Directory | Key Trait | Example Contents |
|-----------|-----------|-----------------|
| `utils/` | **Stateless + Generic** | `formatDate()`, `slugify()`, `retry()` |
| `helpers/` | **Layer-bound** | `tests/helpers/mockUser()`, `views/helpers/formatCurrency()` |
| `shared/` | **Cross-module boundary** | `shared/types/User.ts`, `shared/constants/` |
| `common/` | Alias for shared/ | Avoid; use `shared/` for clarity |
| `lib/` | **Wrapped dependency** | `lib/http-client/` (wraps axios), `lib/logger/` |
| `internal/` | **Package-private** (Go convention) | `internal/parser/` (not importable outside module) |

#### Decision Diagram

```
                    ┌─────────────────────┐
                    │   New shared code    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Is it stateless and  │
                    │ has no business      │
                    │ logic?               │
                    └──────────┬──────────┘
                          YES/ \NO
                           /     \
              ┌───────────▼┐   ┌─▼───────────────┐
              │ Reusable   │   │ Used by 2+       │
              │ across the │   │ modules?          │
              │ project?   │   └──────┬───────────┘
              └─────┬──────┘     YES/ \NO
                YES/ \NO          /     \
                 /     \   ┌─────▼──┐  ┌─▼──────────────┐
          ┌─────▼──┐  ┌─▼─────┐│shared/│  │ Wrapping a     │
          │utils/  │  │Tied to││       │  │ third-party    │
          │        │  │layer? │└────────┘  │ dependency?    │
          └────────┘  └──┬───┘            └──────┬─────────┘
                    YES/ \NO                YES/ \NO
                     /     \                 /     \
              ┌─────▼───┐  ┌▼────────┐┌────▼──┐  ┌─▼──────────┐
              │helpers/  │  │module/  ││lib/   │  │owning      │
              │(in layer)│  │        │└───────┘  │module/      │
              └──────────┘  └────────┘           └─────────────┘
```

#### Detailed Criteria

**`utils/`** — Pure Utility Functions
- No side effects, no state, no business logic
- Could be extracted to an npm package / pip package
- Examples: `formatDate()`, `deepClone()`, `slugify()`, `retry()`
- Anti-pattern: `utils/userService.js` (has business logic → belongs in `services/`)

**`helpers/`** — Context-Specific Assistants
- Bound to a specific layer or domain
- Usually placed inside the layer directory: `tests/helpers/`, `views/helpers/`
- Rarely at `src/helpers/` (if you need it at src level, it's probably `utils/`)
- Examples: `tests/helpers/createMockUser()`, `views/helpers/formatPrice()`

**`shared/`** — Cross-Module Shared Code
- Used by 2 or more modules
- May contain types, constants, validation rules, or simple services
- Has a clear module boundary (consumers import from `shared/`)
- Examples: `shared/types/User.ts`, `shared/validation/email.ts`

**`lib/`** — Wrapped/Vendored Libraries
- Wraps a third-party dependency with project-specific defaults
- Provides a stable internal interface even if the external library changes
- Examples: `lib/http-client/` (wraps axios), `lib/logger/` (wraps winston)

**`internal/`** — Package-Private (Go Convention)
- Go-specific: code under `internal/` cannot be imported by external packages
- For other languages: use access modifiers or module boundaries instead
- Examples: `internal/parser/`, `internal/codec/`

---

## 4. Development Artifacts Lifecycle

Working documents follow a lifecycle from creation to graduation (or archival).

### State Diagram

```
  ┌──────────┐
  │  draft   │ ← Initial creation
  └────┬─────┘
       │ Start active work
  ┌────▼─────┐
  │  active  │ ← Under discussion / development
  └────┬─────┘
       │
  ┌────┴─────────────────┐
  │                      │
  ▼                      ▼
┌──────────┐      ┌──────────┐
│graduated │      │ archived │
│          │      │          │
└──────────┘      └──────────┘
Creates formal     No longer
document           relevant
```

### Graduation Paths

| From | To | Trigger |
|------|----|---------|
| Brainstorm | Spec (`docs/specs/`) | Ideas solidified into requirements |
| RFC | ADR (`docs/ADR/`) | Decision made and accepted |
| Investigation | ADR or knowledge base | Root cause found, decision needed |
| POC | Feature implementation | POC validated, proceed to build |
| Meeting notes | Action items (in issue tracker) | Decisions extracted |

### Retention Guidelines

| Status | Retention |
|--------|-----------|
| `draft` | Auto-archive after 3 months of inactivity |
| `active` | Keep until resolved |
| `graduated` | Keep indefinitely (historical reference) |
| `archived` | Review annually, delete if no longer useful |

---

## 5. Migration Guide

If your project has files in non-standard locations, follow this process:

### Step 1: Inventory

List all files that may be misplaced:

```bash
# Find files at unexpected depths
find . -maxdepth 1 -name "*.md" ! -name "README.md" ! -name "CONTRIBUTING.md" \
  ! -name "CHANGELOG.md" ! -name "LICENSE" ! -name "SECURITY.md" ! -name "CODE_OF_CONDUCT.md"

# Find orphaned docs not in docs/
find . -name "*.md" -not -path "./docs/*" -not -path "./node_modules/*" \
  -not -path "./.git/*" | head -20
```

### Step 2: Classify

Use the Reverse Lookup Index (§2) to determine the correct destination for each file.

### Step 3: Move

```bash
# Create target directories
mkdir -p docs/working/{brainstorms,investigations,rfcs,meeting-notes,poc}
mkdir -p src/generated

# Move files (update imports/references after)
git mv old/path/file.md new/path/file.md
```

### Step 4: Update References

After moving files, update all references:
- Import paths in code
- Links in documentation
- CI/CD pipeline paths
- IDE configuration paths

---

## 6. Anti-Patterns

### ❌ Root directory clutter

```
❌ project/
   ├── package.json
   ├── brainstorm.md          # Should be in docs/working/brainstorms/
   ├── investigation-oom.md   # Should be in docs/working/investigations/
   ├── TODO.md                # Should be in issue tracker
   └── notes.md               # Should be in docs/working/
```

### ❌ docs/ as a dumping ground

```
❌ docs/
   ├── architecture.md        # ✓ Correct
   ├── brainstorm-2024.md     # → docs/working/brainstorms/
   ├── meeting-jan-15.md      # → docs/working/meeting-notes/
   ├── poc-redis.md           # → docs/working/poc/redis/
   └── random-thoughts.md     # → docs/working/brainstorms/ or delete
```

### ❌ utils/ as a catch-all

```
❌ src/utils/
   ├── formatDate.js          # ✓ Correct (pure utility)
   ├── userService.js         # → src/services/ (has business logic)
   ├── database.js            # → src/config/ or lib/ (infrastructure)
   └── authMiddleware.js      # → src/middleware/ (layer-specific)
```

### ❌ Directories without README

```
❌ docs/working/poc/redis-cache/
   ├── benchmark-results.txt
   ├── test-script.sh
   └── (no README.md — what was the conclusion?)

✅ docs/working/poc/redis-cache/
   ├── README.md              # Purpose, findings, conclusion, next steps
   ├── benchmark-results.txt
   └── test-script.sh
```

### ❌ Generated code mixed with source

```
❌ src/
   ├── api-client.ts          # Hand-written
   ├── api-client.generated.ts # Generated — hard to tell apart
   └── models/
       ├── User.ts            # Hand-written
       └── User.generated.ts  # Generated

✅ src/
   ├── api-client.ts
   ├── models/User.ts
   └── generated/
       ├── api-client.ts      # Clearly separated
       └── models/User.ts
```

---

## Related Standards

- [Project Structure Standard](../project-structure.md) — Canonical directory definitions
- [Documentation Structure Standard](../documentation-structure.md) — Documentation directory rules
- [Code Check-in Standards](../checkin-standards.md) — Pre-commit verification
- [AI-Friendly Architecture](../ai-friendly-architecture.md) — Structure for AI collaboration

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-04 | Initial file placement decision guide |

---

## License

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
