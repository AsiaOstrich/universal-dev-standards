# Universal Development Standards - Project Guidelines

This document defines the development standards for the Universal Development Standards project itself. As a framework that provides development standards to other projects, we practice what we preach ("dogfooding").

## Project Overview

Universal Development Standards is a language-agnostic, framework-agnostic development standards framework. It provides:

- **Core Standards** (`core/`): 70+ fundamental development standards
- **AI Skills** (`skills/`): Claude Code skills for AI-assisted development
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

## Development Standards

> **Core Standards Usage Rule**:
> When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the concise rules in `core/` (e.g., `core/testing-standards.md`).
> **ONLY** read `core/guides/` or `methodologies/guides/` when explicitly asked for educational content, detailed explanations, or tutorials.
> This ensures token efficiency and focused context.

> **Source-of-Truth Precedence (Source Repo Only)**:
> In this UDS source repo, `core/*.md` is the **live source of truth**.
> The `.standards/*.ai.yaml` files inside the `<!-- UDS:STANDARDS:START -->` block are an **adopter dogfooding snapshot** maintained by `npx uds install/update` — by DEC-044, `uds update` cannot run inside the source repo, so this snapshot will lag behind `core/`.
> When the two diverge, **always prefer `core/`**. Subagents launched from this repo's CWD MUST treat `core/*.md` as authoritative.

### 1. Commit Message Format

Follow the Conventional Commits specification defined in `core/commit-message-guide.md`:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature or standard
- `fix`: Bug fix or error correction
- `docs`: Documentation updates
- `chore`: Maintenance tasks
- `test`: Test-related changes
- `refactor`: Code refactoring
- `style`: Formatting changes

**Examples:**
```bash
feat(core): add new testing completeness dimensions
docs(skills): update Claude Code skill documentation
fix(cli): resolve path resolution issue on Windows
chore(i18n): sync translations with source files
```

### 2. Branch Strategy

Follow the Git workflow defined in `core/git-workflow.md`:

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready releases |
| `feature/*` | New features and enhancements |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation updates |
| `chore/*` | Maintenance tasks |

### 3. Code Style

**JavaScript:**
- Use single quotes for strings
- End statements with semicolons
- Use ES Module syntax (`import`/`export`)
- Follow ESLint configuration in `cli/.eslintrc.json`

**Markdown:**
- Use ATX-style headers (`#`, `##`, `###`)
- Include blank lines before and after headers
- Use fenced code blocks with language specification

### 4. Testing Requirements

- All CLI features must have corresponding tests
- Run tests before committing: `npm test` (in `cli/` directory)
- Run linting: `npm run lint` (in `cli/` directory)
- Test coverage reports: `npm run test:coverage`

### 5. Translation Sync

When modifying core standards:
1. Update the English source file first
2. Sync changes to `locales/zh-TW/` directory
3. Run translation check: `./scripts/check-translation-sync.sh`

## Quick Commands

### macOS / Linux

```bash
# CLI development (run from cli/ directory)
cd cli
npm install          # Install dependencies
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run test:coverage # Generate coverage report

# Translation sync check (run from root)
./scripts/check-translation-sync.sh

# Version sync check (run from root)
./scripts/check-version-sync.sh

# Standards consistency check (run from root)
./scripts/check-standards-sync.sh

# Pre-release check (run all checks at once)
./scripts/pre-release-check.sh

# Local CLI testing
node cli/bin/uds.js list
node cli/bin/uds.js init --help

# Health score (self-diagnosis)
node cli/bin/uds.js audit --score --self
node cli/bin/uds.js audit --score --self --format json

# External reference check
node scripts/check-external-references.mjs

# Hook statistics analysis (requires opt-in: .uds/config.json {"hookStats": true})
node scripts/analyze-hook-stats.mjs
```

### Windows (PowerShell)

```powershell
# CLI development (run from cli\ directory)
cd cli
npm install          # Install dependencies
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run test:coverage # Generate coverage report

# Translation sync check (run from root)
.\scripts\check-translation-sync.ps1

# Version sync check (run from root)
.\scripts\check-version-sync.ps1

# Standards consistency check (run from root)
.\scripts\check-standards-sync.ps1

# Pre-release check (run all checks at once)
.\scripts\pre-release-check.ps1

# Local CLI testing
node cli\bin\uds.js list
node cli\bin\uds.js init --help
```

### Windows (Git Bash)

```bash
# Same commands as macOS / Linux work in Git Bash
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
./scripts/check-standards-sync.sh
./scripts/pre-release-check.sh
```

## Testing Workflow / 測試工作流程

### When to Run Tests / 何時執行測試

| Timing | Command | Purpose |
|--------|---------|---------|
| During development | `npm run test:watch` | Instant feedback |
| Before commit | Automatic (git hook) | Prevent regressions |
| Before PR | `./scripts/pre-release-check.sh` | Full verification |
| CI/CD | Automatic (GitHub Actions) | Continuous integration |

### Git Hooks (Automatic) / Git Hooks（自動執行）

Pre-commit hook (`cli/.husky/pre-commit`) automatically runs:
- `npm run test:unit` - Unit tests only, excludes E2E (fast, < 5 seconds)
- `eslint --fix` - Code style auto-fix via lint-staged
- `check-standards-sync.sh` - If core/*.md files modified
- `check-cli-docs-sync.sh` - If cli/bin/*.js files modified

> **Note**: If any check fails, the commit is aborted.

### Manual Testing Commands / 手動測試指令

```bash
# In cli/ directory
npm test              # Run all tests once
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
npm run lint          # Check code style
```

### AI Assistant Testing Guidelines / AI 助手測試指南

> **Important**: This section provides guidance for AI assistants (Claude Code, etc.) on how to efficiently run tests in this project.

**Test Suite Characteristics / 測試套件特性：**
- Full test suite: ~1,000 tests across 30+ files (unit + E2E)
- Unit tests: < 10 seconds execution time
- E2E tests: ~6 minutes (spawn CLI subprocesses)
- Full suite runtime: ~6 minutes

**🚀 Recommended AI Agent Commands / 推薦的 AI Agent 指令：**

| Scenario | Command | Execution Time |
|----------|---------|----------------|
| **Quick Development** | `cd cli && npm run test:quick` | < 6 seconds (864 tests) |
| **Test Discovery** | `cd cli && npm run test:discover` | < 1 second |
| **Unit Tests Only** | `cd cli && npm run test:unit` | < 3 seconds |
| **Exclude E2E Tests** | `cd cli && npm run test:fast` | < 5 seconds |
| **Specific Changes** | `npm test -- tests/unit/core/ tests/commands/` | < 2 seconds |

**📋 Test Discovery Tool / 測試發現工具：**
```bash
# Discover all tests and get execution commands
cd cli && npm run test:discover

# Show commands for different scenarios
cd cli && node scripts/test-discovery.mjs commands development
```

**⚠️ Avoid / 避免：**
- Using `--reporter=summary` or custom reporters (compatibility issues)
- Running tests without checking current working directory

**✅ Best Practice / 最佳實踐：**
```bash
# ✅ Recommended: Quick development testing
cd cli && npm run test:quick

# ✅ Good: Test specific modules
npm test -- tests/commands/ai-context.test.js tests/unit/utils/workflows-installer.test.js

# ✅ Good: Use test discovery for targeted testing
cd cli && npm run test:discover

# ✅ Full test suite is now fast enough to run directly
cd cli && npm test  # ~6 minutes
```

### Test Certificate System (Optional) / 測試憑證系統（可選）

The test certificate system is available for advanced workflows but is not used by default in pre-release checks since the full test suite runs quickly (~6 minutes).

**Commands / 指令：**
```bash
# Generate certificate after passing tests (optional)
cd cli && npm run test:with-cert

# Verify existing certificate
cd cli && npm run test:verify
```

> **Note**: Pre-release checks (`pre-release-check.sh`) always run the full test suite. The certificate system is available for custom CI/CD workflows if needed.

## Code Check-in Standards (Mandatory)

Every commit MUST pass these quality gates before committing:

### Core Philosophy

Every commit should:
- ✅ Be a complete logical unit of work
- ✅ Leave the codebase in a working state
- ✅ Be reversible without breaking functionality
- ✅ Contain its own tests (for new features)

### Mandatory Checklist

Before EVERY commit, verify:

1. **Build Verification**
   - [ ] Code compiles successfully (zero errors)
   - [ ] All dependencies satisfied

2. **Test Verification**
   - [ ] All existing tests pass (100% pass rate)
   - [ ] New code has corresponding tests
   - [ ] Test coverage not decreased

3. **Code Quality**
   - [ ] Follows coding standards
   - [ ] No hardcoded secrets (passwords, API keys)
   - [ ] No security vulnerabilities

4. **Documentation**
   - [ ] API documentation updated (if applicable)
   - [ ] CHANGELOG updated at pre-release only, not per commit (follow [changelog-standards.md](core/changelog-standards.md))

5. **Workflow Compliance**
   - [ ] Branch naming correct (`feature/`, `fix/`, `docs/`, `chore/`)
   - [ ] Commit message follows conventional commits
   - [ ] Synchronized with target branch

### ❌ Never Commit When

- Build has errors
- Tests are failing
- Feature is incomplete and would break functionality
- Contains WIP/TODO comments for critical logic
- Contains debugging code (console.log, print statements)
- Contains commented-out code blocks

### Quick Verification Commands

```bash
# In cli/ directory
npm run lint         # Check code style
npm test             # Run all tests
npm run build        # Verify build (if applicable)
```

### Reference

For complete check-in standards, see [core/checkin-standards.md](core/checkin-standards.md)

---

## AI Collaboration Guidelines

When using AI assistants (Claude Code, Cursor, etc.) with this project:

### Conversation Language / 對話語言

- **All conversations with AI assistants should be conducted in Traditional Chinese (繁體中文)**
- AI 助手應以繁體中文回覆使用者的問題與請求

### DO:
- Reference existing standards in `core/` for consistency
- Follow the bilingual format (English + Traditional Chinese) for documentation
- Check translation sync after modifying core standards
- Run tests and linting before committing

### DON'T:
- Create new standards without following existing template structure
- Modify translated files without updating source files
- Skip the code review checklist for PRs
- Introduce language-specific or framework-specific content in core standards
- Make claims about code without reading it first (see Anti-Hallucination Standards)
- Commit code without running tests first

### Project-Specific Context:
- This project uses ES Modules (not CommonJS)
- All core standards should remain language/framework agnostic
- Bilingual documentation is required (English primary, zh-TW translation)
- CLI tool is the primary code component; most content is Markdown

### BDD/TDD Output Directories / BDD/TDD 輸出目錄

When generating BDD and TDD files from SDD specifications:

| Type | Directory | Description |
|------|-----------|-------------|
| BDD Features | `tests/features/` | Gherkin .feature files |
| TDD Unit Tests | `cli/tests/unit/` | Vitest unit tests |
| SDD Specs | `docs/specs/` | Specification documents |

**BDD Feature File Format:**
- Include `@SPEC-XXX` and `@AC-N` tags for traceability
- Include `# [Source: path:AC-N]` comments for source attribution
- One Scenario per AC (1:1 mapping)

**TDD Test File Format:**
- Nested describe: SPEC level → AC level
- AAA pattern comments (Arrange-Act-Assert)
- Use `[TODO]` markers for implementation placeholders

### Anti-Hallucination Standards / 反幻覺規範

When working on this project, AI assistants MUST follow [core/anti-hallucination.md](core/anti-hallucination.md):

| Requirement | Description |
|-------------|-------------|
| **Evidence-Based** | Only analyze content that has been explicitly read |
| **Source Attribution** | Use `[Source: Code]`, `[Source: Docs]` tags with file:line references |
| **Certainty Classification** | Use `[Confirmed]`, `[Inferred]`, `[Assumption]`, `[Unknown]` tags |
| **Recommendations** | Always include recommended option with reasoning when presenting choices |
| **No Fabrication** | Never invent APIs, configs, or requirements without verification |

### Code Review Standards / 程式碼審查規範

When reviewing code or PRs, follow [core/code-review-checklist.md](core/code-review-checklist.md):

**Review Checklist Categories:**
1. Functionality - Does it work correctly?
2. Design & Architecture - Follows project patterns?
3. Code Quality - Clean, DRY, SOLID?
4. Readability - Easy to understand?
5. Testing - Adequate coverage?
6. Security - No vulnerabilities?
7. Performance - Efficient?
8. Error Handling - Properly handled?
9. Documentation - Updated?
10. Dependencies - Justified?

**Comment Prefixes:**

| Prefix | Meaning |
|--------|---------|
| ❗ BLOCKING | Must fix before merge |
| ⚠️ IMPORTANT | Should fix |
| 💡 SUGGESTION | Nice-to-have |
| ❓ QUESTION | Need clarification |

### Testing Standards / 測試規範

For testing requirements, follow [core/testing-standards.md](core/testing-standards.md):

**Testing Pyramid (Default Ratios):**

| Level | Ratio | Purpose |
|-------|-------|---------|
| Unit Tests (UT) | 70% | Test individual functions/methods |
| Integration Tests (IT) | 20% | Test component interactions |
| E2E Tests | 10% | Test user workflows |

**Key Requirements:**
- All new features must have corresponding tests
- Run tests before committing
- Maintain or improve test coverage
- Use descriptive test names following `should_[expected]_when_[condition]` pattern

### Standards Compliance Reference / 規範合規參考

| Task | MUST Follow | Reference |
|------|-------------|-----------|
| Code analysis | Anti-hallucination | [core/anti-hallucination.md](core/anti-hallucination.md) |
| PR review | Code Review Checklist | [core/code-review-checklist.md](core/code-review-checklist.md) |
| Adding features | Testing Standards | [core/testing-standards.md](core/testing-standards.md) |
| Any commit | Check-in Standards | [core/checkin-standards.md](core/checkin-standards.md) |
| New feature design | Spec-Driven Development | [core/spec-driven-development.md](core/spec-driven-development.md) |
| Adding/modifying Core↔Skill | /sdd + Sync Check | See "Core↔Skill Sync Rules" below |
| Retroactive spec tracking | /sdd-retro | See "Spec Tracking" below |
| Writing AI instructions | AI Instruction Standards | [core/ai-instruction-standards.md](core/ai-instruction-standards.md) |
| Writing documentation | Documentation Writing | [core/documentation-writing-standards.md](core/documentation-writing-standards.md) |
| Project architecture for AI | AI-Friendly Architecture | [core/ai-friendly-architecture.md](core/ai-friendly-architecture.md) |
| Standard loading strategy | Context-Aware Loading | [core/context-aware-loading.md](core/context-aware-loading.md) |
| Cross-session state | Project Context Memory | [core/project-context-memory.md](core/project-context-memory.md) |

---

## 採用層整合策略

UDS 定位為**純標準庫**（Standards Definition Library）。它定義「該做什麼」，並透過 `.standards/` 由任意採用層（Adapters / Pipelines / Agents / IDE）讀取與執行。UDS 本身**不綁定**任何特定下游產品、不提供 runtime、不指定授權模式。

```
UDS（標準定義；MIT + CC BY 4.0）──→ 採用層（任意 Adapter / Pipeline / Agent / IDE）
```

### UDS 的角色

1. **標準來源**：UDS 定義 70+ 項標準供任意採用層消費
2. **工具無關**：UDS 支援 12+ 種 AI 工具與一般 CI / IDE 整合
3. **授權獨立**：UDS 採 MIT + CC BY 4.0；採用層的授權選擇與 UDS 無關

### 標準如何流向採用層

| 流向 | 機制 | 說明 |
|------|------|------|
| UDS → 採用層 | `.standards/` copy-once | 採用層透過 `uds init` 安裝標準，於 Quality Gate / Agent prompt / IDE rule 中讀取 |
| UDS → CI 整合 | `.standards/` 引用 | CI / pre-commit hook 讀取對應 `.ai.yaml` 進行驗證 |
| UDS → 採用層 bridges | 例如 TestPolicy 格式 | 採用層在 UDS 之上建立特定 bridge（如 test-governance → TestPolicy）|

### 對 UDS 開發的影響

- 新增/修改標準時，需考慮**通用採用場景**（不假設特定下游產品的內部結構）
- 標準格式需保持中性、可攜（不嵌入採用層的實作細節）
- 標準的 scope 標記（universal/partial/uds-specific）影響可攜性

---

<!-- UDS:STANDARDS:START -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx uds install' or 'npx uds update' to modify. -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx uds install' or 'npx uds update' to modify. -->
## Commit Message Language
Write commit messages in **bilingual** format (English + 繁體中文).
Format: `<type>(<scope>): <English>. <中文>.`
Body MUST be bilingual: English first → blank line → Chinese second. NEVER mix languages in one paragraph.

## Standards Compliance Instructions

**MUST follow** (每次都要遵守):
| Task | Standard | When |
|------|----------|------|
| Writing commits | [commit-message.ai.yaml](.standards/commit-message.ai.yaml) | Every commit |
| Project context | [project-context-memory.ai.yaml](.standards/project-context-memory.ai.yaml) | Planning & Coding |
| Workflow gates | [workflow-enforcement.ai.yaml](.standards/workflow-enforcement.ai.yaml) | Before any workflow phase |

**SHOULD follow** (相關任務時參考):
| Task | Standard | When |
|------|----------|------|
| Git workflow | [git-workflow.ai.yaml](.standards/git-workflow.ai.yaml) | Branch/merge decisions |
| Writing tests | [testing.ai.yaml](.standards/testing.ai.yaml) | When creating tests |
| Developer memory | [developer-memory.ai.yaml](.standards/developer-memory.ai.yaml) | Always (protocol) |


## Installed Standards Index

本專案採用 UDS 標準。所有規範位於 `.standards/`：

### Core (63 standards)
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
- `pipeline-integration-standards.ai.yaml` - pipeline-integration-standards.ai.yaml
- `acceptance-criteria-traceability.ai.yaml` - acceptance-criteria-traceability.ai.yaml
- `change-batching-standards.ai.yaml` - change-batching-standards.ai.yaml
- `api-design-standards.ai.yaml` - api-design-standards.ai.yaml
- `database-standards.ai.yaml` - database-standards.ai.yaml
- `workflow-enforcement.ai.yaml` - 工作流程強制執行
- `systematic-debugging.ai.yaml` - systematic-debugging.ai.yaml
- `agent-dispatch.ai.yaml` - agent-dispatch.ai.yaml
- `model-selection.ai.yaml` - model-selection.ai.yaml
- `git-worktree.ai.yaml` - git-worktree.ai.yaml
- `branch-completion.ai.yaml` - branch-completion.ai.yaml
- `verification-evidence.ai.yaml` - verification-evidence.ai.yaml
- `ai-command-behavior.ai.yaml` - ai-command-behavior.ai.yaml
- `ai-response-navigation.ai.yaml` - ai-response-navigation.ai.yaml
- `documentation-lifecycle.ai.yaml` - documentation-lifecycle.ai.yaml
- `adr-standards.ai.yaml` - adr-standards.ai.yaml
- `retrospective-standards.ai.yaml` - retrospective-standards.ai.yaml
- `execution-history.ai.yaml` - execution-history.ai.yaml
- `agent-communication-protocol.ai.yaml` - agent-communication-protocol.ai.yaml
- `dual-phase-output.ai.yaml` - 雙階段 LLM 輸出標準（<analysis> 丟棄 + <summary> 保留）
- `circuit-breaker.ai.yaml` - 通用斷路器（三態 CLOSED/HALF_OPEN/OPEN，防 API 雪崩）
- `token-budget.ai.yaml` - Token 閾值四區模型（安全/警告/危險/阻塞）
- `security-decision.ai.yaml` - 安全決策鐵律（deny > ask > allow 優先級仲裁）
- `capability-declaration.ai.yaml` - Fail-Closed 能力聲明（工具/Adapter 預設不安全）
<!-- UDS:STANDARDS:END -->

---

## Post-Modification Verification / 修改後驗證

**IMPORTANT**: After completing any of the following modifications, AI assistants MUST verify that all relevant files have been updated (see sections below for specifics). The full maintenance workflow is tracked internally in the AsiaOstrich dev-platform planning hub (`cross-project/ops/uds-operation.md`).

| Modification Type | Key Checks |
|-------------------|-----------|
| Add/modify core standard | Update registry, translations, Related Standards sections |
| Add/modify skill | Update skillFiles mapping, skill count tests |
| Add/modify AI tool integration | Update ai-agent-paths.js, CLAUDE.md integrations list |
| Prepare release | Run bump-version.sh, update CHANGELOG, verify sync scripts |
| Any multi-file change | Run check-standards-sync.sh + check-translation-sync.sh |
| Add/modify installation commands | Cross-Platform Command Sync (below) |

### Quick Verification (All Changes)

After ANY modification, run:
```bash
# Run all checks at once (recommended)
./scripts/pre-release-check.sh

# Or run individual checks:
./scripts/check-standards-sync.sh
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
./scripts/check-ai-agent-sync.sh
./scripts/check-spec-sync.sh        # Core↔Skill sync
./scripts/check-scope-sync.sh       # Scope universality check
./scripts/check-docs-integrity.sh   # Documentation integrity
./scripts/check-orphan-specs.sh     # Orphan spec detection
./scripts/check-ai-behavior-sync.sh # AI Agent Behavior coverage
cd cli && npm test && npm run lint
```

> **AI Agent 同步檢查 SOP**: AI Agent sync SOP is maintained internally in the dev-platform planning hub (`cross-project/ops/uds-ai-agent-sync-sop.md`).

### Core↔Skill Sync Rules (UDS-specific) / Core↔Skill 同步規則

> ⚠️ This section is UDS project-specific. The UDS project maintains bidirectional relationships between Core Standards, Skills, and Commands.

#### Sync Architecture / 同步架構

```
Core Standard ◄──────────► Skill ◄──────────► Command
      │                       │                   │
      └───────────────────────┴───────────────────┘
                          ▼
                    Translations
```

#### Sync Matrix / 同步矩陣

| Change Origin | MUST Evaluate Sync To |
|---------------|----------------------|
| Core Standard | → Skill, Command, AI YAML, Translations |
| Skill | → Core Standard (if applicable), Command, Translations |
| Command | → Skill, Translations |

#### Core↔Skill Mapping / Core↔Skill 對應

| Category | Description | Examples |
|----------|-------------|----------|
| **Has Core Standard** | Skill implements a Core Standard | `commit-standards` ↔ `commit-message-guide.md` |
| **Utility Skill** | No Core Standard needed (tool/generator) | `docs-generator`, `code-formatter` |
| **Static Skill** | Reference only, no interaction | Skills that only link to standards |

#### Mandatory /sdd Workflow | 強制 /sdd 工作流程

**ANY of the following changes MUST use `/sdd` first:**

1. **Adding Features | 新增功能**
   - New Core Standard
   - New Skill
   - New Slash Command

2. **Modifying Features | 修改功能**
   - Modifying Core Standard content
   - Modifying Skill behavior
   - Modifying Command functionality

3. **Removing Features | 移除功能**
   - Removing standards
   - Removing Skills/Commands

**Exceptions (can skip /sdd):**
- Typo fixes
- Formatting changes
- Pure translation updates
- Emergency hotfixes (must document retroactively)

#### Sync Check Script / 同步檢查腳本

**macOS / Linux:**
```bash
./scripts/check-spec-sync.sh
```

**Windows PowerShell:**
```powershell
.\scripts\check-spec-sync.ps1
```

Expected output:
```
✓ commit-standards ↔ core/commit-message-guide.md
✓ testing-guide ↔ core/testing-standards.md
⚠ docs-generator (utility, no core standard required)
✓ All Skills synced with Core Standards
```

### Spec Tracking / Spec 追蹤

Three mechanisms ensure spec traceability:

1. **`/commit` spec assessment** — For `feat`/`fix` commits, the AI suggests creating or linking a spec. Details in [`skills/commands/commit.md`](skills/commands/commit.md).
2. **`/sdd-retro`** — Retroactively create specs for untracked commits (e.g., emergency hotfixes). Details in [`skills/commands/sdd-retro.md`](skills/commands/sdd-retro.md).
3. **Orphan spec detection** — `check-orphan-specs.sh` flags specs stuck in non-terminal states. Integrated into `pre-release-check.sh` as step 15 (warning only).

### Scope Universality System / Scope 通用性標記系統

All Core Standards and Skills are marked with a `scope` field indicating their universality:

| Scope | Description | Usage |
|-------|-------------|-------|
| `universal` | Fully universal, usable by any project | Can be adopted as-is |
| `partial` | Concept is universal but contains UDS-specific details | Review before adopting |
| `uds-specific` | UDS project-specific tool or workflow | For internal use only |

#### Scope Distribution / 分布統計

**Current distribution:**
- **Core Standards**: 14 universal (61%), 7 partial (30%), 2 uds-specific (9%)
- **Skills**: 12 universal (48%), 10 partial (40%), 3 uds-specific (12%)

#### Where to Find Scope Markers / 標記位置

- **Skills**: In YAML frontmatter of `SKILL.md`
  ```yaml
  ---
  name: skill-name
  scope: universal
  description: ...
  ---
  ```

- **Core Standards**: In markdown metadata
  ```markdown
  **Applicability**: All software projects
  **Scope**: universal
  ```

#### Scope Check Script / 範圍檢查腳本

**macOS / Linux:**
```bash
./scripts/check-scope-sync.sh
```

**Windows PowerShell:**
```powershell
.\scripts\check-scope-sync.ps1
```

### Cross-Platform Command Sync (UDS-specific) / 跨平台指令同步

> ⚠️ This section is UDS project-specific. Not all projects require maintaining bilingual translations with cross-platform commands.

#### When to Check / 何時檢查

After modifying these UDS project files, verify cross-platform command sync:
- Adoption guides (`adoption/`)
- Skills installation instructions (`skills/*/README.md`)
- Maintenance guides (`ai/MAINTENANCE.md`)
- Checklists (`adoption/checklists/`)

#### Files Requiring Sync / 需要同步的檔案

33 files require cross-platform command maintenance:
- English sources: 11 files
- zh-TW translations: 11 files
- zh-CN translations: 11 files

#### Standard Command Equivalents / 標準指令對照

| Bash | PowerShell | Purpose / 用途 |
|------|-----------|----------------|
| `cp file dest/` | `Copy-Item file dest\` | Copy file / 複製檔案 |
| `cp -r dir/ dest/` | `Copy-Item -Recurse dir\ dest\` | Recursive copy / 遞迴複製 |
| `mkdir -p dir` | `New-Item -ItemType Directory -Force -Path dir` | Create directory / 建立目錄 |
| `~/` | `$env:USERPROFILE\` | User home / 使用者目錄 |
| `./script.sh` | `.\script.ps1` | Run script / 執行腳本 |

#### Labeling Convention / 標籤慣例

Use these labels for platform-specific code blocks:
- `**macOS / Linux:**` followed by bash code block
- `**Windows PowerShell:**` followed by powershell code block

---

## Release Process

When preparing releases or helping with version management:

### Reference Documentation

- **Complete Release Workflow**: [skills/release-standards/release-workflow.md](skills/release-standards/release-workflow.md)
- **Semantic Versioning**: [skills/release-standards/semantic-versioning.md](skills/release-standards/semantic-versioning.md)
- **Versioning Standards**: [core/versioning.md](core/versioning.md)
- **CHANGELOG Format**: [skills/release-standards/changelog-format.md](skills/release-standards/changelog-format.md)

### Key Points for AI Assistants

1. **Never manually run `npm publish`**: GitHub Actions handles this automatically
2. **Version Detection is Automatic**: `.github/workflows/publish.yml` detects version type and uses correct npm tag
3. **Always follow the checklist**: Pre-release checks in release-workflow.md
4. **CHANGELOG first**: Update CHANGELOG.md before creating releases

### Release Types

| Type | Version Pattern | npm Tag | Auto-detected |
|------|----------------|---------|---------------|
| Stable | `X.Y.Z` | `@latest` | ✅ Yes |
| Beta | `X.Y.Z-beta.N` | `@beta` | ✅ Yes |
| Alpha | `X.Y.Z-alpha.N` | `@alpha` | ✅ Yes |
| RC | `X.Y.Z-rc.N` | `@rc` | ✅ Yes |

### AI Assistant Workflow

When user asks to prepare a release:

1. **Ask for release type**: beta, alpha, rc, or stable
2. **Run pre-release checks**: Tests, linting, git status
3. **Run `bump-version.sh`** — updates ALL version files atomically (see UDS-specific section below)
4. **Update CHANGELOG.md** (EN + zh-TW + zh-CN): Follow the format in release-workflow.md
5. **Commit, tag, push**: `git add -A && git commit && git tag vX.Y.Z && git push origin main vX.Y.Z`
6. **Create GitHub Release**: Use `gh release create` command

> ⚠️ **Never manually update individual version files**. Always use `scripts/bump-version.sh` to avoid missing files.

### UDS Project-Specific Release Steps

> ⚠️ **IMPORTANT**: This section contains UDS-specific requirements that MUST be followed in addition to the standard release workflow.

#### Step 0: Run bump-version.sh (MANDATORY)

**Always use the version bump script** — it updates all files atomically and runs verification:

```bash
# macOS / Linux
./scripts/bump-version.sh 5.2.0-beta.1   # Pre-release
./scripts/bump-version.sh 5.2.0          # Stable

# After bump-version.sh:
# → Update CHANGELOG.md (EN + zh-TW + zh-CN) manually
# → git add -A && git commit -m "chore(release): X.Y.Z"
# → git tag vX.Y.Z && git push origin main vX.Y.Z
```

The script handles these files automatically:

| File | Field | Alpha/Beta/RC | Stable |
|------|-------|---------------|--------|
| `cli/package.json` | `"version"` | ✅ Auto | ✅ Auto |
| `cli/standards-registry.json` | `"version"` (3 places) | ✅ Auto | ✅ Auto |
| `uds-manifest.json` | `"version"` + `"last_updated"` | ✅ Auto | ✅ Auto |
| `README.md` | `**Version**:` | ✅ Auto | ✅ Auto |
| `locales/zh-TW/README.md` | `**版本**:` | ✅ Auto | ✅ Auto |
| `locales/zh-CN/README.md` | `**版本**:` | ✅ Auto | ✅ Auto |
| `locales/zh-TW/CHANGELOG.md` | frontmatter | ✅ Auto | ✅ Auto |
| `locales/zh-CN/CHANGELOG.md` | frontmatter | ✅ Auto | ✅ Auto |
| `.claude-plugin/plugin.json` | `"version"` | ❌ Skip | ✅ Auto |
| `.claude-plugin/marketplace.json` | `"version"` | ❌ Skip | ✅ Auto |

> **Marketplace Version Strategy**: `.claude-plugin/` files are only updated for stable releases. This prevents beta/alpha versions from being automatically pushed to Claude Plugin Marketplace users. Marketplace users will only receive stable versions.

#### Pre-release Verification Scripts

```bash
# macOS / Linux
./scripts/pre-release-check.sh

# Windows PowerShell
.\scripts\pre-release-check.ps1
```

This runs 19 checks including:
1. Git working directory status
2. Version sync (`check-version-sync.sh`)
3. Standards sync (`check-standards-sync.sh`)
4. Translation sync (`check-translation-sync.sh`)
5-11. CLI-docs, docs, AI agent, usage docs, spec, scope, commands sync checks
12. Documentation integrity (`check-docs-integrity.sh`)
13. Skill next steps sync (`check-skill-next-steps-sync.sh`)
14. Linting
15. Orphan spec detection (`check-orphan-specs.sh`)
16. AI Agent Behavior coverage (`check-ai-behavior-sync.sh`)
17. Workflow compliance
18. Unit Tests
19. E2E Tests (Bug Regression)

#### Translation Sync (Stable Releases)

For stable releases, ensure translations are synchronized:
```bash
./scripts/check-translation-sync.sh      # zh-TW
./scripts/check-translation-sync.sh zh-CN # zh-CN
```

#### UDS Three-Phase Release Workflow (Alpha→Beta→Stable)

> **Note**: This workflow is specific to the UDS project. The generic release workflow (see `release-workflow.md`) uses a simpler Beta→Stable pattern suitable for most projects.

**Workflow Philosophy**: Version first, then validate. Assign version number before testing to ensure validation targets the exact release version.

**Phase Overview:**

| Phase | Version Pattern | npm Tag | Purpose |
|-------|-----------------|---------|---------|
| Phase 1: Alpha | `X.Y.Z-alpha.N` | `@alpha` | Internal validation, pre-release checks |
| Phase 2: Beta | `X.Y.Z-beta.N` | `@beta` | Public testing, early adopter feedback |
| Phase 3: Stable | `X.Y.Z` | `@latest` | Production release |

**Detailed Steps:**

**Phase 1: Alpha Release (Internal)**
1. Update version to alpha: `npm version X.Y.Z-alpha.1 --no-git-tag-version`
2. Update CLI version files only (2 files):
   - `cli/package.json`
   - `cli/standards-registry.json`
3. **Do NOT update** `.claude-plugin/` files (keep previous stable version)
4. Run pre-release checks: `./scripts/pre-release-check.sh`
5. Update CHANGELOG with alpha notes
6. Commit: `chore(release): X.Y.Z-alpha.1`
7. Create tag: `vX.Y.Z-alpha.1`
8. Push and create GitHub Release (mark as pre-release)

**Phase 2: Beta Release (Public Testing)**
1. After alpha validation passes, update to beta: `npm version X.Y.Z-beta.1 --no-git-tag-version`
2. Update CLI version files only (2 files):
   - `cli/package.json`
   - `cli/standards-registry.json`
3. **Do NOT update** `.claude-plugin/` files (keep previous stable version)
4. Run full test suite
5. Update CHANGELOG with beta notes
6. Commit: `chore(release): X.Y.Z-beta.1`
7. Create tag: `vX.Y.Z-beta.1`
8. Push and create GitHub Release (mark as pre-release)
9. Announce to early adopters for feedback

**Phase 3: Stable Release (Production)**
1. After beta testing completes, update to stable: `npm version X.Y.Z --no-git-tag-version`
2. Update **ALL** version files (5 files):
   - `cli/package.json`
   - `cli/standards-registry.json`
   - `.claude-plugin/plugin.json` ← Marketplace updated here
   - `.claude-plugin/marketplace.json` ← Marketplace updated here
   - `README.md`
3. Finalize CHANGELOG (remove beta warnings, add stable notes)
4. Sync translations: `./scripts/check-translation-sync.sh`
5. Run final pre-release checks
6. Commit: `chore(release): X.Y.Z`
7. Create tag: `vX.Y.Z`
8. Push and create GitHub Release
9. Verify npm publication: `npm view universal-dev-standards dist-tags`

**When to Use This Workflow:**
- Major releases with breaking changes
- Features requiring extensive testing
- Releases needing early adopter validation

**When to Skip Alpha (Beta→Stable only):**
- Patch releases (bug fixes only)
- Minor releases with low-risk changes
- Urgent security fixes

### Example Interaction

```
User: "我想發布 beta 版本"

AI:
我會協助你準備 beta 版本發布。

首先，讓我執行預發布檢查：
1. ✅ 執行測試
2. ✅ 執行 linting
3. ✅ 檢查 git 狀態

請提供以下資訊：
1. 版本號是多少？（例如：3.2.2-beta.1）
2. 主要包含哪些變更？

確認後，我會：
1. 更新 cli/package.json 版本號
2. 更新 CHANGELOG.md
3. 建立 git tag (vX.Y.Z-beta.N)
4. 提交並推送變更
5. 提供建立 GitHub Release 的步驟

**重要**：建立 GitHub Release 後，GitHub Actions 會自動：
- 偵測版本類型（beta）
- 發布到 npm 並標記為 @beta
- 無需手動執行 npm publish
```

---

## File Structure Reference

```
universal-dev-standards/
├── core/                  # Core standards (71 files)
├── skills/                # AI tool skills
│   └── claude-code/       # Claude Code skills (26 skills)
├── cli/                   # Node.js CLI tool
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   └── package.json       # Dependencies
├── locales/               # Translations
│   └── zh-TW/             # Traditional Chinese
├── integrations/          # AI tool configurations
├── templates/             # Document templates
├── adoption/              # Adoption guides
└── scripts/               # Maintenance scripts
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## License

- Documentation (Markdown): CC BY 4.0
- Code (JavaScript): MIT
