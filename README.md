# Universal Development Standards

> **Language**: English | [繁體中文](locales/zh-TW/README.md) | [简体中文](locales/zh-CN/README.md)

**Version**: 3.2.2
**Last Updated**: 2026-01-06
**License**: [Dual License](LICENSE) (CC BY 4.0 + MIT)

---

## 📋 Purpose

This repository provides **language-agnostic, framework-agnostic, domain-agnostic** documentation standards for software projects. These standards ensure consistency, quality, and maintainability across diverse technology stacks.

---

## 🎯 Core Principles

1. **Universal Applicability** - Standards work for any programming language, framework, or domain

2. **Modular Design** - Pick and choose standards relevant to your project

3. **Extensible Architecture** - Extend with language-specific, framework-specific, or domain-specific rules

4. **Evidence-Based** - Standards derived from industry best practices and real-world validation

5. **Self-Contained** - Each standard is independently usable without dependencies

---

## 📦 What's Inside

```
universal-dev-standards/
├── core/                           # Core universal standards (Markdown)
│   ├── anti-hallucination.md      # AI collaboration guidelines
│   ├── checkin-standards.md       # Code check-in quality gates
│   ├── commit-message-guide.md    # Commit message conventions
│   ├── spec-driven-development.md # SDD methodology & standards
│   ├── git-workflow.md            # Git branching strategies
│   ├── code-review-checklist.md   # Code review guidelines
│   ├── documentation-structure.md # Documentation organization
│   ├── project-structure.md       # Project directory conventions
│   ├── versioning.md              # Semantic versioning guide
│   ├── changelog-standards.md     # Changelog writing guide
│   └── testing-standards.md       # Testing standards (UT/IT/ST/E2E)
│
├── ai/                             # ✅ NEW: AI-optimized standards (v2.3.0)
│   ├── standards/                 # Token-efficient YAML format (~80% reduction)
│   │   ├── git-workflow.ai.yaml
│   │   ├── commit-message.ai.yaml
│   │   ├── testing.ai.yaml
│   │   └── ...
│   └── options/                   # Configurable options
│       ├── git-workflow/          # github-flow, gitflow, trunk-based, etc.
│       ├── commit-message/        # english, traditional-chinese, bilingual
│       ├── testing/               # unit, integration, system, e2e
│       └── project-structure/     # nodejs, python, dotnet, java, go
│
├── options/                        # Human-readable option guides (Markdown)
│   ├── git-workflow/              # Detailed workflow documentation
│   ├── commit-message/            # Commit language guides
│   ├── testing/                   # Testing level guides
│   └── project-structure/         # Language-specific project structures
│
├── skills/                         # AI tool skills (v2.1.0)
│   ├── claude-code/               # Claude Code Skills
│   ├── cursor/                    # Cursor Rules (planned)
│   ├── windsurf/                  # Windsurf Rules (planned)
│   ├── cline/                     # Cline Rules (planned)
│   ├── copilot/                   # GitHub Copilot (planned)
│   └── _shared/                   # Shared templates
│
├── extensions/                     # Optional extensions
│   ├── languages/                 # Language-specific standards
│   │   ├── csharp-style.md        # C# coding conventions
│   │   └── php-style.md           # PHP 8.1+ style guide
│   ├── frameworks/                # Framework-specific standards
│   │   └── fat-free-patterns.md   # Fat-Free Framework patterns
│   ├── locales/                   # Locale-specific standards
│   │   └── zh-tw.md               # Traditional Chinese
│   └── domains/                   # Domain-specific standards
│       └── (coming soon)
│
├── templates/                      # Project document templates
│   ├── requirement-*.md           # Requirement templates
│   └── migration-template.md      # Migration plan template
│
├── integrations/                   # Tool configuration files
│   ├── cline/                     # Cline .clinerules
│   ├── cursor/                    # Cursor .cursorrules
│   ├── github-copilot/            # Copilot instructions
│   ├── google-antigravity/        # Antigravity integration
│   ├── windsurf/                  # Windsurf .windsurfrules
│   └── openspec/                  # OpenSpec framework
│
├── cli/                           # CLI tool
│   └── (uds command)
│
└── adoption/                       # Adoption guides
    └── ADOPTION-GUIDE.md
```

---

## 🤖 AI-Optimized Standards

### Dual-Format Architecture

This project now provides standards in two formats for different use cases:

| Format | Location | Use Case | Token Usage |
|--------|----------|----------|-------------|
| **Human-Readable** | `core/`, `options/` | Documentation, onboarding, reference | Standard |
| **AI-Optimized** | `ai/` | AI assistants, automation, CLAUDE.md | ~80% reduction |

### Using AI-Optimized Standards

**For AI Assistants (Claude, Cursor, etc.)**:
```yaml
# Reference in CLAUDE.md or system prompts
standards:
  source: ai/standards/
  options:
    workflow: ai/options/git-workflow/github-flow.ai.yaml
    commit_language: ai/options/commit-message/english.ai.yaml
    test_levels:
      - ai/options/testing/unit-testing.ai.yaml
      - ai/options/testing/integration-testing.ai.yaml
```

**Using CLI for Format Selection**:
```bash
# Initialize with AI format (recommended for AI-assisted projects)
uds init --format ai

# Initialize with both formats
uds init --format both

# Configure specific options
uds init --workflow github-flow --commit-lang english --test-levels unit,integration
```

### Available Options

| Category | Options |
|----------|---------|
| **Git Workflow** | `github-flow`, `gitflow`, `trunk-based`, `squash-merge`, `merge-commit`, `rebase-ff` |
| **Commit Language** | `english`, `traditional-chinese`, `bilingual` |
| **Testing Levels** | `unit`, `integration`, `system`, `e2e` |
| **Project Structure** | `nodejs`, `python`, `dotnet`, `java`, `go` |

### Translations

AI-optimized standards are available in:
- English: `ai/`
- Traditional Chinese: `locales/zh-TW/ai/`

---

## 🔗 Standards Adoption

### Using with Claude Code (Recommended)

Install all 15 comprehensive development skills with a single command:

#### Method 1: Plugin Marketplace (Recommended)

**One-time setup:**
```bash
# Add the marketplace
/plugin marketplace add AsiaOstrich/universal-dev-standards

# Install the plugin with all 15 skills
/plugin install universal-dev-standards@asia-ostrich
```

**Benefits:**
- ✅ Single command installation
- ✅ Automatic updates when new versions are released
- ✅ All 15 skills loaded instantly
- ✅ No manual git clone required

**Skills included:** ai-collaboration-standards, changelog-guide, code-review-assistant, commit-standards, documentation-guide, error-code-guide, git-workflow-guide, logging-guide, project-structure-guide, release-standards, requirement-assistant, spec-driven-dev, tdd-assistant, test-coverage-assistant, testing-guide

**Migrating from v3.2.x or earlier? | 從 v3.2.x 或更早版本遷移？**

If you installed using the old marketplace name (`universal-dev-standards@universal-dev-standards`), please migrate:
如果你使用舊的 marketplace 名稱安裝，請進行遷移：

```bash
# Uninstall old version | 卸載舊版本
/plugin uninstall universal-dev-standards@universal-dev-standards

# Install new version | 安裝新版本
/plugin install universal-dev-standards@asia-ostrich
```

---

#### Method 2: Script Installation (Deprecated)

> ⚠️ **Deprecation Notice**: Script installation is being phased out in favor of Plugin Marketplace.
> Existing users should migrate to Method 1 for automatic updates and easier management.

For users who need local installation or offline environments:

**macOS / Linux:**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/skills/claude-code
./install.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\skills\claude-code
.\install.ps1
```

**Windows (Git Bash):**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/skills/claude-code
./install.sh
```

**Migration to Plugin Marketplace:**
```bash
# 1. Install via Marketplace
/plugin install universal-dev-standards@asia-ostrich

# 2. Remove local skills
rm -rf ~/.claude/skills/

# 3. Reinitialize your project
uds init --yes
```

### Multi-AI Tool Support (Coming Soon)

We're expanding support for more AI coding assistants:

| AI Tool | Status | Path |
|---------|--------|------|
| Claude Code | ✅ Complete | `skills/claude-code/` |
| Cursor | 🚧 Planned | `skills/cursor/` |
| Windsurf | 🚧 Planned | `skills/windsurf/` |
| Cline | 🚧 Planned | `skills/cline/` |
| GitHub Copilot | 🚧 Planned | `skills/copilot/` |

### Standards Coverage

| Standard | Skill Available | Adoption |
|----------|----------------|----------|
| anti-hallucination.md | ✅ ai-collaboration-standards | Install Skill |
| commit-message-guide.md | ✅ commit-standards | Install Skill |
| code-review-checklist.md | ✅ code-review-assistant | Install Skill |
| git-workflow.md | ✅ git-workflow-guide | Install Skill |
| versioning.md + changelog-standards.md | ✅ release-standards | Install Skill |
| testing-standards.md | ✅ testing-guide | Install Skill |
| documentation-structure.md | ✅ documentation-guide | Install Skill |
| requirement templates | ✅ requirement-assistant | Install Skill |
| **checkin-standards.md** | ❌ | Copy to project |
| **spec-driven-development.md** | ❌ | Copy to project |
| **documentation-writing-standards.md** | ❌ | Copy to project |
| **project-structure.md** | ❌ | Copy to project |
| Language/Framework extensions | ❌ | Copy if applicable |
| AI tool integrations | ❌ | Copy to tool location |

> **Important**: For standards with Skills available, use the Skill OR copy the source document — **never both**.

📖 See [Adoption Guide](adoption/ADOPTION-GUIDE.md) for complete guidance and checklists.

### Using CLI Tool

**Option 1: npm (Recommended)**
```bash
# Install globally
npm install -g universal-dev-standards

# In your project directory
uds init    # Interactive initialization
uds check   # Check adoption status
uds update  # Update to latest version
uds skills  # List installed Claude Code skills
```

**Option 2: npx (No installation)**
```bash
npx universal-dev-standards init
npx universal-dev-standards check
```

**Option 3: Clone and Link (Development)**

macOS / Linux:
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

Windows (PowerShell):
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli; npm install; npm link
```

📖 See [CLI README](cli/README.md) for detailed CLI usage and all available commands.
📖 See [Windows Guide](docs/WINDOWS-GUIDE.md) for Windows-specific instructions.

---

## 🚀 Quick Start

### Step 1: Choose Core Standards

**Minimal Setup (Required)**:
```bash
# Copy essential standards to your project
cp core/anti-hallucination.md your-project/.standards/
cp core/checkin-standards.md your-project/.standards/
cp core/commit-message-guide.md your-project/.standards/
```

**Recommended Setup**:
```bash
# Copy all core standards
cp core/*.md your-project/.standards/
```

---

### Step 2: Add Language/Framework Extensions

**For .NET Projects**:
```bash
cp extensions/languages/csharp-style.md your-project/.standards/
cp extensions/frameworks/dotnet.md your-project/.standards/
```

**For TypeScript Projects**:
```bash
cp extensions/languages/typescript-style.md your-project/.standards/
```

**For Python Projects**:
```bash
cp extensions/languages/python-style.md your-project/.standards/
```

---

### Step 3: Configure Project-Specific Settings

Edit `your-project/CONTRIBUTING.md` or `your-project/.standards/PROJECT-CONFIG.md`:

```markdown
## Documentation Standards Configuration

### Commit Message Language
- Type Language: **English** (feat, fix, refactor)
- Subject Language: **English**

### Git Workflow
- Strategy: **GitFlow**
- Main branches: `main`, `develop`
- Feature branch prefix: `feature/`
- Hotfix branch prefix: `hotfix/`

### Code Quality Tools
- Linter: ESLint
- Formatter: Prettier
- Test Framework: Jest
- Minimum Test Coverage: 80%

### Check-in Requirements
- ✅ Build must pass
- ✅ All tests must pass
- ✅ Linter must pass with 0 errors
- ✅ Test coverage ≥80%
```

---

### Step 4 (Optional): Use Templates

```bash
# Initialize project documentation
cp templates/README.md.template your-project/README.md
cp templates/CONTRIBUTING.md.template your-project/CONTRIBUTING.md
cp templates/CHANGELOG.md.template your-project/CHANGELOG.md

# Customize templates by replacing placeholders
# [PROJECT_NAME] → Your Project Name
# [DESCRIPTION] → Your project description
# etc.
```

---

## 📊 Standard Levels

### 🟢 Level 1: Essential (Minimum Viable Standards)

**Every project MUST have**:
- ✅ `anti-hallucination.md` - AI collaboration guidelines
- ✅ `checkin-standards.md` - Quality gates before commit
- ✅ `commit-message-guide.md` - Standardized commit format
- ✅ `spec-driven-development.md` - Spec-Driven Development standards

**Estimated Setup Time**: 30 minutes
**Recommended For**: All projects, especially AI-assisted development

---

### 🟡 Level 2: Recommended (Professional Quality)

**Include Level 1 +**:
- ✅ `git-workflow.md` - Branching strategy
- ✅ `code-review-checklist.md` - Review guidelines
- ✅ `versioning.md` - Version management
- ✅ `changelog-standards.md` - Changelog writing guide
- ✅ `testing-standards.md` - Testing pyramid (UT/IT/ST/E2E)
- ✅ Language-specific style guide (e.g., `csharp-style.md`)

**Estimated Setup Time**: 2 hours
**Recommended For**: Team projects, open-source projects

---

### 🔵 Level 3: Comprehensive (Enterprise Grade)

**Include Level 2 +**:
- ✅ `documentation-structure.md` - Docs organization
- ✅ Framework-specific standards (e.g., `dotnet.md`)
- ✅ Domain-specific standards (e.g., `fintech.md`)
- ✅ OpenSpec integration for spec-driven development
- ✅ Full template suite (README, CONTRIBUTING, CHANGELOG, API docs)

**Estimated Setup Time**: 1-2 days
**Recommended For**: Enterprise projects, regulated industries, large teams

---

## 🔧 Customization Guide

### Where to Write Customizations

| Customization Type | File | Location |
|--------------------|------|----------|
| AI tool rules & exclusions | `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.clinerules` | Project root |
| Project standard overrides | `PROJECT-STANDARDS.md` | Project root |
| Copied core standards | `docs/standards/` or customize location | Your project |

### Adapting Standards to Your Project

All core standards include **"Project-Specific Customization"** sections. Customize by:

1. **Language Choice**
   ```markdown
   ## Commit Message Language Choice
   - English: feat, fix, refactor
   - Traditional Chinese: 新增, 修正, 重構
   - Spanish: característica, corrección, refactorización
   ```

2. **Tool Configuration**
   ```markdown
   ## Build Command
   ```bash
   npm run build  # Node.js project
   dotnet build   # .NET project
   mvn package    # Java project
   ```
   ```

3. **Threshold Adjustment**
   ```markdown
   ## Quality Thresholds
   - Test Coverage: 80% (adjust based on project maturity)
   - Max Method Length: 50 lines (adjust based on language)
   - Max Cyclomatic Complexity: 10 (standard)
   ```

4. **Scope Definition**
   ```markdown
   ## Allowed Commit Scopes
   - auth: Authentication module
   - payment: Payment processing
   - [add your modules here]
   ```

### Excluding Standards

Not every standard fits every project. Use these approaches to exclude standards:

1. **During `uds init`**: Select only the standards you need
   ```bash
   uds init
   # Interactive prompts let you choose:
   # - Which core standards to adopt
   # - Which AI tools to configure
   # - Which Skills to install (or skip entirely)
   ```

2. **Selective Adoption**: Copy only needed files
   ```bash
   # Instead of full init, copy specific standards
   cp core/commit-message-guide.md your-project/docs/
   cp core/code-review-checklist.md your-project/docs/
   ```

3. **AI Tool Integration Exclusions**: Specify exclusion patterns in your AI tool config files

   | AI Tool | Config File | Location |
   |---------|-------------|----------|
   | Claude Code | `CLAUDE.md` | Project root |
   | Cursor | `.cursorrules` | Project root |
   | Windsurf | `.windsurfrules` | Project root |
   | Cline | `.clinerules` | Project root |

   ```markdown
   # Example: Add to CLAUDE.md or .cursorrules
   ## Excluded Standards
   SDD commands may be skipped for:
   - Trivial bug fixes (< 5 lines)
   - Documentation-only changes
   - Configuration file updates
   ```

4. **Project-Level Overrides**: Create `PROJECT-STANDARDS.md` in your project root to document deviations
   ```markdown
   # PROJECT-STANDARDS.md (in project root)

   ## Excluded Standards
   - `testing-completeness.md` - Using legacy testing framework
   - `api-spec.md` - Internal tool, no external API

   ## Modified Thresholds
   - Test coverage: 60% (legacy codebase migration)
   ```

### What Can Be Excluded

| Category | Excludable Items |
|----------|------------------|
| **Core Standards** | Any of the 13 standards based on project needs |
| **AI Skills** | Individual skills or entire skill installation |
| **Integrations** | Specific AI tool configurations |
| **Templates** | README, CHANGELOG, CONTRIBUTING templates |

---

## 🌍 Multi-Language Support

### Commit Message Language Examples

**English**:
```
feat(auth): Add OAuth2 support
fix(api): Resolve memory leak
docs(readme): Update installation guide
```

**Traditional Chinese**:
```
新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏
文件(README): 更新安裝指南
```

**Spanish**:
```
característica(auth): Agregar soporte OAuth2
corrección(api): Resolver fuga de memoria
documentación(readme): Actualizar guía de instalación
```

**Japanese**:
```
機能(認証): OAuth2サポートを追加
修正(API): メモリリークを解決
文書(README): インストールガイドを更新
```

---

## 🛠️ Tool Integration

### Git Hooks

**Install commitlint** (Node.js projects):
```bash
npm install --save-dev @commitlint/{cli,config-conventional}
npm install --save-dev husky

# Initialize husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

**Configure commitlint**:
```javascript
// .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'perf', 'build', 'ci', 'chore']
    ]
  }
};
```

---

### CI/CD Integration

**GitHub Actions Example**:
```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate Commit Messages
        run: npx commitlint --from HEAD~1 --to HEAD --verbose

      - name: Build
        run: npm run build

      - name: Test
        run: npm test -- --coverage

      - name: Lint
        run: npm run lint

      - name: Check Coverage
        run: |
          coverage=$(npx nyc report --reporter=text-summary | grep 'Lines' | awk '{print $3}' | sed 's/%//')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80%"
            exit 1
          fi
```

---

### OpenSpec Integration

For spec-driven development, integrate OpenSpec:

```bash
# Copy OpenSpec framework
cp -r integrations/openspec/ your-project/openspec/

# Create .claude/commands directory
mkdir -p your-project/.claude/commands/
cp integrations/openspec/commands/* your-project/.claude/commands/
```

**Usage**:
```bash
# Propose a new change
/openspec proposal "Add user authentication"

# Apply approved spec
/openspec apply specs/auth-feature

# Archive completed spec
/openspec archive specs/auth-feature
```

---

## 📚 Examples

### Example 1: .NET Web API Project

**Standards Configuration**:
```
✅ Core Standards
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md (English types)
   - git-workflow.md (GitFlow)

✅ Extensions
   - languages/csharp-style.md
   - frameworks/dotnet.md

✅ Templates
   - CLAUDE.md (customized for .NET)
   - README.md
   - CONTRIBUTING.md
```

See `examples/dotnet-web-api/` for full implementation.

---

### Example 2: React SPA Project

**Standards Configuration**:
```
✅ Core Standards
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md (English types)
   - git-workflow.md (GitHub Flow)

✅ Extensions
   - languages/typescript-style.md
   - frameworks/react.md

✅ Tools
   - ESLint + Prettier
   - Husky + commitlint
   - Jest + React Testing Library
```

See `examples/react-spa/` for full implementation.

---

### Example 3: Python ML Project

**Standards Configuration**:
```
✅ Core Standards
   - anti-hallucination.md
   - checkin-standards.md
   - commit-message-guide.md (English types)
   - git-workflow.md (Trunk-Based)

✅ Extensions
   - languages/python-style.md
   - domains/machine-learning.md

✅ Tools
   - Black (formatter)
   - pylint (linter)
   - pytest (testing)
   - mypy (type checking)
```

See `examples/python-ml/` for full implementation.

---

## 🤝 Contributing

We welcome contributions to improve these standards!

### How to Contribute

1. **Suggest Improvements**: Open an issue describing the problem and proposed solution
2. **Add Examples**: Submit examples of how you've applied these standards
3. **Extend Standards**: Contribute new language/framework/domain extensions
4. **Translate**: Help translate standards to other languages

### Contribution Guidelines

All contributions must:
- ✅ Maintain language/framework/domain agnosticism (for core standards)
- ✅ Include examples in at least 2 different contexts
- ✅ Follow the existing documentation structure
- ✅ Be licensed under CC BY 4.0

---

## 📖 Further Reading

### Related Standards and Frameworks

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

### Books and Articles

- **The Art of Readable Code** by Boswell & Foucher
- **Clean Code** by Robert C. Martin
- **The Pragmatic Programmer** by Hunt & Thomas
- **Accelerate** by Forsgren, Humble, and Kim

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.2.2 | 2026-01-06 | Added: `uds skills` command to list installed Claude Code skills; Deprecated: manual installation scripts (install.sh/install.ps1) |
| 3.2.0 | 2026-01-02 | Added: Plugin Marketplace distribution support, CLI Marketplace option; Fixed: CLI wildcard path handling, process hanging issues |
| 3.1.0 | 2025-12-30 | Added: Simplified Chinese (zh-CN) translation, language switcher links |
| 3.0.0 | 2025-12-30 | Added: Full Windows support, npm publish, CLI enhancements, 5 new Skills (14 total) |
| 2.3.0 | 2025-12-29 | Added: AI-optimized standards (`ai/`), configurable options (`options/`), CLI format/options support, zh-TW translations |
| 2.2.0 | 2025-12-25 | Added: CLI tool improvements, Skills updates |
| 2.1.0 | 2025-12-20 | Added: Claude Code Skills (`skills/claude-code/`) |
| 1.3.0 | 2025-12-15 | Added: changelog-standards.md; Updated: versioning.md, git-workflow.md (cross-references), zh-tw.md (terminology) |
| 1.2.0 | 2025-12-11 | Added: project-structure.md; Updated: documentation-structure.md (file naming, version alignment), checkin-standards.md (directory hygiene) |
| 1.1.0 | 2025-12-05 | Added: testing-standards.md (UT/IT/ST/E2E) |
| 1.0.0 | 2025-11-12 | Initial release with core standards |

---

## 📄 License

This project uses **dual licensing**:

| Component | License |
|-----------|---------|
| Documentation (`core/`, `extensions/`, `templates/`, etc.) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| CLI Tool (`cli/`) | [MIT](cli/LICENSE) |

Both licenses are permissive and allow commercial use, modification, and redistribution.

See [LICENSE](LICENSE) for full details.

---

## 💬 Community

- **Issues**: Report bugs or suggest improvements
- **Discussions**: Share how you're using these standards
- **Examples**: Submit your project as an example

---

## ✅ Checklist for Adopting Standards

- [ ] Copied core standards to project
- [ ] Chose language/framework extensions
- [ ] Configured project-specific settings in CONTRIBUTING.md
- [ ] Set up Git hooks (commitlint, pre-commit)
- [ ] Integrated quality gates in CI/CD
- [ ] Trained team on standards
- [ ] Updated project README to reference standards
- [ ] Created first commit following standards

---

**Ready to improve your project's documentation quality?**

Start with Level 1 (Essential Standards) today!

---

**Maintained with ❤️ by the open-source community**
