# Universal Development Standards - Project Guidelines

This document defines the development standards for the Universal Development Standards project itself. As a framework that provides development standards to other projects, we practice what we preach ("dogfooding").

## Project Overview

Universal Development Standards is a language-agnostic, framework-agnostic documentation standards framework. It provides:

- **Core Standards** (`core/`): 16 fundamental development standards
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

# Local CLI testing
node cli\bin\uds.js list
node cli\bin\uds.js init --help
```

### Windows (Git Bash)

```bash
# Same commands as macOS / Linux work in Git Bash
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
```

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
   - [ ] CHANGELOG updated for user-facing changes (add to `[Unreleased]` section)

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

### Project-Specific Context:
- This project uses ES Modules (not CommonJS)
- All core standards should remain language/framework agnostic
- Bilingual documentation is required (English primary, zh-TW translation)
- CLI tool is the primary code component; most content is Markdown

---

## Release Process

When preparing releases or helping with version management:

### Reference Documentation

- **Complete Release Workflow**: [skills/claude-code/release-standards/release-workflow.md](skills/claude-code/release-standards/release-workflow.md)
- **Semantic Versioning**: [skills/claude-code/release-standards/semantic-versioning.md](skills/claude-code/release-standards/semantic-versioning.md)
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
3. **Update version**: Use `npm version X.Y.Z-beta.N` or `npm version X.Y.Z`
4. **Update CHANGELOG.md**: Follow the format in release-workflow.md
5. **Create git tag**: Format `vX.Y.Z` or `vX.Y.Z-beta.N`
6. **Commit and push**: Git commit and push tags
7. **Remind to create GitHub Release**: User must create manually, GitHub Actions will handle npm publish

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
├── core/                  # Core standards (16 files)
├── skills/                # AI tool skills
│   └── claude-code/       # Claude Code skills (15 skills)
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
