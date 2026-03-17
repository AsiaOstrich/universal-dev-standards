# Universal Development Standards - Project Context

> **Language**: English | [繁體中文](locales/zh-TW/integrations/gemini-cli/GEMINI.md) | [简体中文](locales/zh-CN/integrations/gemini-cli/GEMINI.md)

This document defines the development standards and context for the Universal Development Standards project.

## Project Overview

Universal Development Standards is a language-agnostic, framework-agnostic documentation standards framework. It provides:

- **Core Standards** (`core/`): 36 fundamental development standards
- **AI Skills** (`skills/`): AI skills for assisted development
- **CLI Tool** (`cli/`): Node.js CLI for adopting standards
- **Integrations** (`integrations/`): Configurations for various AI tools
- **Localization** (`locales/`): Multi-language support (English, Traditional Chinese)

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | >= 18.0.0 |
| Module System | ES Modules | - |
| Testing | Vitest | ^4.0.16 |
| Linting | ESLint | ^8.56.0 |
| CLI Framework | Commander.js | ^12.1.0 |
| Interactive Prompts | Inquirer.js | ^9.2.12 |

## Core Mandates & Anti-Hallucination

Reference: `core/anti-hallucination.md`

1.  **Evidence-Based Analysis**: You MUST read files before analyzing them. Do NOT guess APIs or versions. If you haven't seen the code, state: "I need to read [file] to confirm".
2.  **Source Attribution**: Every factual claim about the code MUST cite sources (e.g., `[Source: Code] path/to/file:line`).
3.  **Spec-Driven Development (SDD)**: When SDD tools (OpenSpec, Spec Kit) are present, prioritize using their commands (e.g., `/openspec`, `/spec`) over manual editing.
4.  **Language**: All conversations with AI assistants should be conducted in **Traditional Chinese (繁體中文)** unless otherwise requested.

## Development Standards

### 1. Commit Message Format

Follow Conventional Commits (`core/commit-message-guide.md`):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`

### 2. Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready releases |
| `feature/*` | New features and enhancements |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation updates |
| `chore/*` | Maintenance tasks |

### 3. Code Style

**JavaScript:**
- Single quotes, Semicolons
- ES Module syntax
- Follow ESLint (`cli/.eslintrc.json`)

**Markdown:**
- ATX-style headers (`#`, `##`)
- Blank lines around headers

## Quick Commands

### Setup & Testing (Run in `cli/`)

```bash
cd cli
npm install          # Install dependencies
npm test             # Run tests (runs full suite, ~6 mins)
npm run test:quick   # Quick dev testing (recommended for AI)
npm run test:unit    # Unit tests only (< 3s)
npm run lint         # Check code style
npm run test:coverage # Generate coverage
```

### Maintenance (Run in root)

```bash
# Sync Checks
./scripts/check-translation-sync.sh   # Translations
./scripts/check-version-sync.sh       # Versions
./scripts/check-standards-sync.sh     # Standards consistency
./scripts/check-ai-agent-sync.sh      # AI integration sync
./scripts/check-spec-sync.sh          # Core↔Skill sync
./scripts/check-scope-sync.sh         # Scope universality

# Pre-release (Runs all checks)
./scripts/pre-release-check.sh
```

**Windows Users**: Use `.ps1` equivalents (e.g., `.\scripts\pre-release-check.ps1`).

## Testing Workflow

- **Development**: Use `npm run test:watch` or `npm run test:quick` for instant feedback.
- **Pre-Commit**: Git hooks will automatically run unit tests and linting.
- **Discovery**: Use `npm run test:discover` to find relevant tests.
- **Reference**: `core/testing-standards.md`

## Quality Gates (Check-in Standards)

Before finishing a task, ensure:
1.  **Build**: Code compiles with zero errors.
2.  **Tests**: All tests pass (100%). New code has tests.
3.  **Quality**: No hardcoded secrets. Follows coding standards.
4.  **Docs**: API docs and `CHANGELOG.md` updated.
5.  **Compliance**: Correct branch name and commit message format.

## Release Process

**Do NOT manually run `npm publish`.**

1.  **Ask for release type**: stable, beta, alpha, rc.
2.  **Run pre-release checks**: `./scripts/pre-release-check.sh`.
3.  **Update Version Files**:
    - `cli/package.json`
    - `cli/standards-registry.json`
    - `.claude-plugin/plugin.json`
    - `.claude-plugin/marketplace.json`
    - `README.md` (Stable only)
4.  **Update CHANGELOG.md**.
5.  **Tag & Push**: Create git tag (`vX.Y.Z`) and push.
6.  **GitHub Release**: Create release; Action handles publishing.

## Refactoring Guidelines

Reference: `core/refactoring-standards.md`

- **Tactical**: Boy Scout Rule, Preparatory Refactoring (Minutes)
- **Strategic**: Strangler Fig, Anti-Corruption Layer (Weeks-Months)
- **Safety**: Add characterization tests BEFORE refactoring legacy code.

---

<!-- UDS:STANDARDS:START -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx uds install' or 'npx uds update' to modify. -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx uds install' or 'npx uds update' to modify. -->
## 提交訊息語言
所有提交訊息必須使用**繁體中文**撰寫。
格式：`<類型>(<範圍>): <主旨>`

## Standards Compliance Instructions

**MUST follow** (每次都要遵守):
| Task | Standard | When |
|------|----------|------|
| Writing commits | [commit-message.ai.yaml](.standards/commit-message.ai.yaml) | Every commit |
| Project context | [project-context-memory.ai.yaml](.standards/project-context-memory.ai.yaml) | Planning & Coding |

**SHOULD follow** (相關任務時參考):
| Task | Standard | When |
|------|----------|------|
| Git workflow | [git-workflow.ai.yaml](.standards/git-workflow.ai.yaml) | Branch/merge decisions |
| Writing tests | [testing.ai.yaml](.standards/testing.ai.yaml) | When creating tests |
| Developer memory | [developer-memory.ai.yaml](.standards/developer-memory.ai.yaml) | Always (protocol) |


## Installed Standards Index

本專案採用 UDS 標準。所有規範位於 `.standards/`：

### Core (44 standards)
- `anti-hallucination.ai.yaml` - anti-hallucination.ai.yaml
- `ai-friendly-architecture.ai.yaml` - ai-friendly-architecture.ai.yaml
- `commit-message.ai.yaml` - 提交訊息格式
- `english.ai.yaml` - english.ai.yaml
- `checkin-standards.ai.yaml` - checkin-standards.ai.yaml
- `spec-driven-development.ai.yaml` - spec-driven-development.ai.yaml
- `code-review.ai.yaml` - code-review.ai.yaml
- `git-workflow.ai.yaml` - Git 工作流程
- `github-flow.ai.yaml` - github-flow.ai.yaml
- `squash-merge.ai.yaml` - squash-merge.ai.yaml
- `versioning.ai.yaml` - versioning.ai.yaml
- `changelog.ai.yaml` - changelog.ai.yaml
- `testing.ai.yaml` - 測試標準
- `unit-testing.ai.yaml` - unit-testing.ai.yaml
- `integration-testing.ai.yaml` - integration-testing.ai.yaml
- `documentation-structure.ai.yaml` - documentation-structure.ai.yaml
- `documentation-writing-standards.ai.yaml` - documentation-writing-standards.ai.yaml
- `ai-instruction-standards.ai.yaml` - ai-instruction-standards.ai.yaml
- `project-structure.ai.yaml` - project-structure.ai.yaml
- `error-codes.ai.yaml` - error-codes.ai.yaml
- `logging.ai.yaml` - logging.ai.yaml
- `test-completeness-dimensions.ai.yaml` - test-completeness-dimensions.ai.yaml
- `test-driven-development.ai.yaml` - test-driven-development.ai.yaml
- `behavior-driven-development.ai.yaml` - behavior-driven-development.ai.yaml
- `acceptance-test-driven-development.ai.yaml` - acceptance-test-driven-development.ai.yaml
- `reverse-engineering-standards.ai.yaml` - reverse-engineering-standards.ai.yaml
- `forward-derivation-standards.ai.yaml` - forward-derivation-standards.ai.yaml
- `ai-agreement-standards.ai.yaml` - ai-agreement-standards.ai.yaml
- `virtual-organization-standards.ai.yaml` - virtual-organization-standards.ai.yaml
- `refactoring-standards.ai.yaml` - refactoring-standards.ai.yaml
- `requirement-engineering.ai.yaml` - requirement-engineering.ai.yaml
- `security-standards.ai.yaml` - security-standards.ai.yaml
- `performance-standards.ai.yaml` - performance-standards.ai.yaml
- `accessibility-standards.ai.yaml` - accessibility-standards.ai.yaml
- `requirement-checklist.md` - requirement-checklist.md
- `requirement-template.md` - requirement-template.md
- `requirement-document-template.md` - requirement-document-template.md
- `deployment-standards.ai.yaml` - deployment-standards.ai.yaml
- `developer-memory.ai.yaml` - 開發者持久記憶
- `project-context-memory.ai.yaml` - 專案情境記憶
- `context-aware-loading.ai.yaml` - context-aware-loading.ai.yaml
- `test-governance.ai.yaml` - test-governance.ai.yaml
- `structured-task-definition.ai.yaml` - structured-task-definition.ai.yaml
- `workflow-state-protocol.ai.yaml` - workflow-state-protocol.ai.yaml
<!-- UDS:STANDARDS:END -->
