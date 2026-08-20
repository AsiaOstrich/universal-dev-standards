---
name: project-structure-guide
scope: universal
description: |
  Guide for organizing project directories following language-specific best practices.
  Use when: creating projects, reorganizing structure, adding modules, setting up builds, deciding file placement.
  Not for: structuring specifically for AI navigation — use /ai-friendly-architecture; restructuring existing code in place — use /refactor.
  Keywords: project, structure, directory, layout, gitignore, scaffold, file placement, utils, helpers, shared, where to put.
---

# Project Structure Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/project-structure-guide/SKILL.md)

**Version**: 1.1.0
**Last Updated**: 2026-03-04
**Applicability**: Claude Code Skills

---

## Purpose

This skill provides guidance on structuring projects according to language and framework conventions. It helps create consistent, maintainable directory layouts.

# [Physical Binding]
## Reality Check
Before confirming the project structure is valid, you MUST:
1. Run the validator: `uds check --standard project-structure`
2. IF exit_code != 0:
   - Read the error message (e.g., "Missing required directories").
   - Report the violation to the user.
   - Suggest specific commands (`mkdir ...`) to fix it.
   - RETRY validation after fixes are applied.

## Trigger

Use this skill when:
- Creating a new project
- Reorganizing existing project structure
- Adding new modules or features
- Setting up build configuration
- Creating .gitignore files
- Deciding where to place a file (code, docs, config, asset)
- Choosing between utils/, helpers/, shared/, lib/, or internal/
- Placing development artifacts (brainstorms, RFCs, POCs, investigations)

## Supported Languages

| Language | Frameworks/Patterns |
|----------|---------------------|
| Node.js | Express, NestJS, Next.js |
| Python | Django, Flask, FastAPI |
| Java | Spring Boot, Maven, Gradle |
| .NET | ASP.NET Core, Console |
| Go | Standard layout, cmd/pkg |
| Rust | Binary, Library, Workspace |
| Kotlin | Gradle, Android, Multiplatform |
| PHP | Laravel, Symfony, PSR-4 |
| Ruby | Rails, Gem, Sinatra |
| Swift | SPM, iOS App, Vapor |

## Common Structure Patterns

### Standard Directories

```
project-root/
├── src/              # Source code
├── tests/            # Test files
├── docs/             # Documentation
├── tools/            # Build/deployment scripts
├── examples/         # Usage examples
├── config/           # Configuration files
└── .github/          # GitHub configuration
```

### Build Output (Always gitignore)

```
dist/                 # Distribution output
build/                # Compiled artifacts
out/                  # Output directory
bin/                  # Binary executables
```

## Language-Specific Guidelines

### Node.js

```
project/
├── src/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── models/
├── tests/
├── package.json
└── .gitignore
```

### Python

```
project/
├── src/
│   └── package_name/
│       ├── __init__.py
│       └── main.py
├── tests/
├── pyproject.toml
└── .gitignore
```

### Go

```
project/
├── cmd/
│   └── appname/
│       └── main.go
├── internal/
├── pkg/
├── go.mod
└── .gitignore
```

## Quick Actions

### Create Project Structure

When asked to create a project:
1. Ask for language/framework
2. Generate appropriate directory structure
3. Create essential config files
4. Generate .gitignore

### Review Structure

When reviewing existing structure:
1. Check language conventions
2. Verify gitignore patterns
3. Suggest improvements
4. Identify misplaced files

## Rules

1. **Follow language conventions** - Each language has established patterns
2. **Separate concerns** - Keep source, tests, docs separate
3. **Gitignore build outputs** - Never commit dist/, build/, out/
4. **Consistent naming** - Use language-appropriate casing
5. **Config at root** - Place config files at project root
6. **Disambiguate directories** - utils/ (stateless, generic), helpers/ (layer-bound), shared/ (cross-module), lib/ (wrapped deps)
7. **Working docs in docs/working/** - Brainstorms, RFCs, POCs, investigations go in docs/working/ with lifecycle management
8. **Generated code separated** - Place in src/generated/{type}/, never mix with hand-written code

## Next Steps Guidance | 下一步引導

After `/project-structure` completes, the AI assistant should suggest:

> **專案結構已建立或審查完成。建議下一步 / Project structure created or reviewed. Suggested next steps:**
> - 執行 `/sdd` 開始規格驅動開發，將專案結構納入正式規格 ⭐ **Recommended / 推薦** — 確保結構決策有規格追蹤 / Ensures structure decisions are tracked in specs
> - 執行 `/docs` 產生專案文件（README、ARCHITECTURE.md 等） — 讓結構決策有文件記錄 / Document structure decisions
> - 執行 `/ai-friendly-architecture` 設定 AI 上下文配置 — 讓 AI 助手更好地理解專案結構 / Help AI assistants understand the project structure

---

## Related Standards

- [Core: Project Structure](../../core/project-structure.md)
- [Core: Documentation Structure](../../core/documentation-structure.md)
- [Guide: File Placement Decision Guide](../../core/guides/file-placement-guide.md)
- [AI: Project Structure Options](../../ai/options/project-structure/)
