# Universal Development Standards - Project Context

> **Language**: English | [繁體中文](locales/zh-TW/integrations/gemini-cli/GEMINI.md) | [简体中文](locales/zh-CN/integrations/gemini-cli/GEMINI.md)

This document defines the development standards and context for the Universal Development Standards project.

## Project Overview

Universal Development Standards is a language-agnostic, framework-agnostic documentation standards framework. It provides:

- **Core Standards** (`core/`): 23 fundamental development standards
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
## Standards Compliance Instructions

**MUST follow** (always required):
| Task | Standard | When |
|------|----------|------|
| Writing commits | [commit-message.ai.yaml](.standards/commit-message.ai.yaml) | Every commit |

**SHOULD follow** (when relevant):
| Task | Standard | When |
|------|----------|------|
| Git workflow | [git-workflow.ai.yaml](.standards/git-workflow.ai.yaml) | Branch/merge decisions |
| Writing tests | [testing.ai.yaml](.standards/testing.ai.yaml) | When creating tests |


## Installed Standards Index

This project has adopted **Level 3** (Enterprise) standards. All standards are located in `.standards/`:

### Core Standards
- `anti-hallucination.ai.yaml` - Anti-Hallucination Guidelines
- `ai-friendly-architecture.ai.yaml` - AI-Friendly Architecture
- `commit-message.ai.yaml` - Conventional Commits
- `checkin-standards.ai.yaml` - Code Check-in Quality Gates
- `spec-driven-development.ai.yaml` - Spec-Driven Development
- `code-review.ai.yaml` - Code Review Checklist
- `git-workflow.ai.yaml` - Git Workflow & Branching
- `versioning.ai.yaml` - Semantic Versioning
- `changelog.ai.yaml` - Changelog Standards
- `testing.ai.yaml` - Testing Pyramid & Standards
- `documentation-structure.ai.yaml` - Documentation Structure
- `documentation-writing-standards.ai.yaml` - Documentation Writing
- `ai-instruction-standards.ai.yaml` - AI Instruction Files
- `project-structure.ai.yaml` - Project Directory Structure
- `error-codes.ai.yaml` - Error Code Standards
- `logging.ai.yaml` - Logging Standards
- `test-completeness-dimensions.ai.yaml` - Test Completeness
- `test-driven-development.ai.yaml` - TDD Workflow
- `behavior-driven-development.ai.yaml` - BDD Workflow
- `acceptance-test-driven-development.ai.yaml` - ATDD Workflow
- `reverse-engineering-standards.ai.yaml` - Reverse Engineering
- `forward-derivation-standards.ai.yaml` - Forward Derivation
- `ai-agreement-standards.ai.yaml` - AI Agreement Protocols
- `virtual-organization-standards.ai.yaml` - Virtual Organization
- `refactoring-standards.ai.yaml` - Refactoring Standards
- `requirement-engineering.ai.yaml` - Requirement Engineering
- `security-standards.ai.yaml` - Security Standards
- `performance-standards.ai.yaml` - Performance Standards
- `accessibility-standards.ai.yaml` - Accessibility Standards

### Templates & Checklists
- `requirement-checklist.md` - Requirement Checklist
- `requirement-template.md` - User Story Template
- `requirement-document-template.md` - Requirement Document Template

<!-- UDS:STANDARDS:END -->
