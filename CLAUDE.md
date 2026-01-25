# Universal Development Standards - Project Guidelines

This document defines the development standards for the Universal Development Standards project itself. As a framework that provides development standards to other projects, we practice what we preach ("dogfooding").

## Project Overview

Universal Development Standards is a language-agnostic, framework-agnostic documentation standards framework. It provides:

- **Core Standards** (`core/`): 23 fundamental development standards
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
   - [ ] CHANGELOG updated for user-facing changes (follow [changelog-standards.md](core/changelog-standards.md))

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
| Writing AI instructions | AI Instruction Standards | [core/ai-instruction-standards.md](core/ai-instruction-standards.md) |
| Writing documentation | Documentation Writing | [core/documentation-writing-standards.md](core/documentation-writing-standards.md) |
| Project architecture for AI | AI-Friendly Architecture | [core/ai-friendly-architecture.md](core/ai-friendly-architecture.md) |

---

## Post-Modification Verification / 修改後驗證

**IMPORTANT**: After completing any of the following modifications, AI assistants MUST read and follow the verification steps in [docs/OPERATION-WORKFLOW.md](docs/OPERATION-WORKFLOW.md):

| Modification Type | Reference Section |
|-------------------|-------------------|
| Add/modify core standard | §8.1 Adding a New Core Standard |
| Add/modify skill | §8.2 Adding a New Skill |
| Add/modify AI tool integration | §8.3 Adding a New AI Tool Integration |
| Prepare release | §9 Release Process |
| Any multi-file change | §7 Maintenance Workflow |
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
cd cli && npm test && npm run lint
```

### Cross-Platform Command Sync (UDS-specific) / 跨平台指令同步

> ⚠️ This section is UDS project-specific. Not all projects require maintaining bilingual translations with cross-platform commands.

#### When to Check / 何時檢查

After modifying these UDS project files, verify cross-platform command sync:
- Adoption guides (`adoption/`)
- Skills installation instructions (`skills/*/README.md`)
- Maintenance guides (`MAINTENANCE.md`, `ai/MAINTENANCE.md`)
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

- **Complete Release Workflow**: [skills/claude-code/release-standards/release-workflow.md](skills/claude-code/release-standards/release-workflow.md)
- **Semantic Versioning**: [skills/claude-code/release-standards/semantic-versioning.md](skills/claude-code/release-standards/semantic-versioning.md)
- **Versioning Standards**: [core/versioning.md](core/versioning.md)
- **CHANGELOG Format**: [skills/claude-code/release-standards/changelog-format.md](skills/claude-code/release-standards/changelog-format.md)

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
3. **Update ALL version files** (see UDS-specific section below)
4. **Update CHANGELOG.md**: Follow the format in release-workflow.md
5. **Create git tag**: Format `vX.Y.Z` or `vX.Y.Z-beta.N`
6. **Commit and push**: Git commit and push tags
7. **Create GitHub Release**: Use `gh release create` command

### UDS Project-Specific Release Steps

> ⚠️ **IMPORTANT**: This section contains UDS-specific requirements that MUST be followed in addition to the standard release workflow.

#### Version Files to Update (6 files)

When updating version, **ALL** of the following files must be synchronized:

| File | Field | Required For |
|------|-------|--------------|
| `cli/package.json` | `"version"` | All releases |
| `cli/standards-registry.json` | `"version"` (3 places) | All releases |
| `.claude-plugin/plugin.json` | `"version"` | All releases |
| `.claude-plugin/marketplace.json` | `"version"` | All releases |
| `README.md` | `**Version**:` | Stable releases only |

#### Pre-release Verification Scripts

```bash
# macOS / Linux
./scripts/pre-release-check.sh

# Windows PowerShell
.\scripts\pre-release-check.ps1
```

This runs 7 checks:
1. Git working directory status
2. Version sync (`check-version-sync.sh`)
3. Standards sync (`check-standards-sync.sh`)
4. Translation sync (`check-translation-sync.sh`)
5. Install scripts sync (`check-install-scripts-sync.sh`)
6. Linting
7. Tests

#### Translation Sync (Stable Releases)

For stable releases, ensure translations are synchronized:
```bash
./scripts/check-translation-sync.sh      # zh-TW
./scripts/check-translation-sync.sh zh-CN # zh-CN
```

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
├── core/                  # Core standards (22 files)
├── skills/                # AI tool skills
│   └── claude-code/       # Claude Code skills (23 skills)
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
