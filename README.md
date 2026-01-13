# Universal Development Standards

> **Language**: English | [繁體中文](locales/zh-TW/README.md) | [简体中文](locales/zh-CN/README.md)

**Version**: 3.5.0-beta.11
**Last Updated**: 2026-01-12
**License**: [Dual License](LICENSE) (CC BY 4.0 + MIT)

> **🧪 Beta Notice**: This version contains experimental features. APIs may change before stable release.
> For stable version: `npm install universal-dev-standards@3.4.2`

### Feature Availability

| Feature | Stable (3.4.2) | Beta (3.5.x) |
|---------|:--------------:|:------------:|
| **Core Standards** (16 files) | ✅ | ✅ |
| **Claude Code Skills** (15 skills) | ✅ | ✅ |
| **CLI Tool** (`uds init`, `check`, `update`) | ✅ | ✅ |
| Hash-based integrity checking | ✅ | ✅ |
| Plugin Marketplace support | ✅ | ✅ |
| **Methodology System** | ❌ | ✅ 🧪 |
| `/methodology` command | ❌ | ✅ 🧪 |
| `/bdd` command | ❌ | ✅ 🧪 |
| TDD/BDD/SDD/ATDD workflows | ❌ | ✅ 🧪 |

> 🧪 = Experimental feature, API may change

---

## Purpose

This repository provides **language-agnostic, framework-agnostic, domain-agnostic** documentation standards for software projects. These standards ensure consistency, quality, and maintainability across diverse technology stacks.

---

## Quick Start

### Install via npm (Recommended)

```bash
# Install globally
npm install -g universal-dev-standards

# Initialize your project
uds init
```

### Or use npx (No installation required)

```bash
npx universal-dev-standards init
```

### Manual Setup

Copy essential standards to your project:

```bash
cp core/anti-hallucination.md your-project/.standards/
cp core/checkin-standards.md your-project/.standards/
cp core/commit-message-guide.md your-project/.standards/
```

> **Important**: Copying standards alone won't enable AI assistance. You must also reference them in your AI tool's configuration file (e.g., `CLAUDE.md`, `.cursorrules`). Use `uds init` for automatic configuration.

### AI Tool Extensions (Optional)

After installing UDS, optionally enable AI-assisted features for your preferred tools:

| AI Tool | How to Enable |
|---------|---------------|
| Claude Code | `uds init` generates `CLAUDE.md` + `/plugin install universal-dev-standards@asia-ostrich` for Skills |
| Cursor | `uds init` generates `.cursorrules` |
| Windsurf | `uds init` generates `.windsurfrules` |
| Cline | `uds init` generates `.clinerules` |
| GitHub Copilot | `uds init` generates `.github/copilot-instructions.md` |
| Google Antigravity | `uds init` generates `INSTRUCTIONS.md` |
| OpenAI Codex | `uds init` generates `AGENTS.md` |
| OpenCode | `uds init` generates `AGENTS.md` |
| Gemini CLI | `uds init` generates `GEMINI.md` |

> **Note**: `uds init` can configure multiple AI tools during interactive setup.

---

## Installation Methods

### CLI Tool (Primary Installation)

The CLI tool is the primary way to adopt UDS in your projects.

**npm (Recommended)**
```bash
npm install -g universal-dev-standards
uds init    # Interactive initialization
uds check   # Check adoption status
uds update  # Update to latest version
uds skills  # List installed skills
```

**npx (No installation)**
```bash
npx universal-dev-standards init
```

**Clone and Link (Development)**

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

See [CLI README](cli/README.md) for detailed usage, [Windows Guide](docs/WINDOWS-GUIDE.md) for Windows-specific instructions, and [Operation Workflow](docs/OPERATION-WORKFLOW.md) for project maintenance and development workflow.

---

### AI Tool Extensions (Optional)

Enable AI-assisted features for your preferred tools. Each tool has its own integration method.

#### Claude Code

Claude Code has two components:
1. **Configuration file**: `uds init` generates `CLAUDE.md` with project-specific rules
2. **Skills (Optional)**: Interactive commands like `/commit`, `/tdd`, `/review`

**Install Skills via Plugin Marketplace (Recommended)**

```bash
/plugin install universal-dev-standards@asia-ostrich
```

**Benefits:**
- Single command installation
- Automatic updates when new versions are released
- All 15 skills loaded instantly

**Skills included:** ai-collaboration-standards, changelog-guide, code-review-assistant, commit-standards, documentation-guide, error-code-guide, git-workflow-guide, logging-guide, project-structure-guide, release-standards, requirement-assistant, spec-driven-dev, tdd-assistant, test-coverage-assistant, testing-guide

**Migrating from v3.2.x?** If you used the old marketplace name:

```bash
# Uninstall old version
/plugin uninstall universal-dev-standards@universal-dev-standards

# Install new version
/plugin install universal-dev-standards@asia-ostrich
```

**Script Installation (Deprecated)**

> Script installation is being phased out. Migrate to Plugin Marketplace for automatic updates.

macOS / Linux:
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/skills/claude-code
./install.sh
```

Windows (PowerShell):
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\skills\claude-code
.\install.ps1
```

#### Other AI Tools

These tools are configured automatically during `uds init`:

| Tool | Configuration File | Location |
|------|-------------------|----------|
| Cursor | `.cursorrules` | Project root |
| Windsurf | `.windsurfrules` | Project root |
| Cline | `.clinerules` | Project root |
| GitHub Copilot | `copilot-instructions.md` | `.github/` |
| Google Antigravity | `INSTRUCTIONS.md` | Project root |
| OpenAI Codex | `AGENTS.md` | Project root |
| OpenCode | `AGENTS.md` | Project root |
| Gemini CLI | `GEMINI.md` | Project root |

Or manually copy from `integrations/` directory.

---

### Multi-AI Tool Support

| AI Tool | Status | Path |
|---------|--------|------|
| Claude Code | ✅ Complete | `skills/claude-code/` |
| OpenCode | 🧪 Testing | `integrations/opencode/` |
| GitHub Copilot | 🧪 Testing | `integrations/github-copilot/` |
| Cursor | ⏳ Planned | `integrations/cursor/` |
| Windsurf | ⏳ Planned | `integrations/windsurf/` |
| Cline | ⏳ Planned | `integrations/cline/` |
| Google Antigravity | ⏳ Planned | `integrations/google-antigravity/` |
| OpenAI Codex | ⏳ Planned | `integrations/codex/` |
| Gemini CLI | ⏳ Planned | `integrations/gemini-cli/` |

---

## Core Principles

1. **Universal Applicability** - Standards work for any programming language, framework, or domain
2. **Modular Design** - Pick and choose standards relevant to your project
3. **Extensible Architecture** - Extend with language-specific, framework-specific, or domain-specific rules
4. **Evidence-Based** - Standards derived from industry best practices and real-world validation
5. **Self-Contained** - Each standard is independently usable without dependencies

---

## What's Inside

```
universal-dev-standards/
├── core/                    # Core universal standards (16 files)
├── ai/                      # AI-optimized standards (.ai.yaml)
├── options/                 # Human-readable option guides
├── skills/                  # AI tool skills (Claude Code, etc.)
├── extensions/              # Language/framework/domain-specific
├── templates/               # Document templates
├── integrations/            # Tool configurations
├── cli/                     # CLI tool (uds command)
├── locales/                 # Translations (zh-TW, zh-CN)
└── adoption/                # Adoption guides
```

See the full [directory structure](#detailed-directory-structure) below.

---

## Standard Levels

### Level 1: Essential (Minimum Viable Standards)

**Every project MUST have**:
- `anti-hallucination.md` - AI collaboration guidelines
- `checkin-standards.md` - Quality gates before commit
- `commit-message-guide.md` - Standardized commit format
- `spec-driven-development.md` - Spec-Driven Development standards

**Estimated Setup Time**: 30 minutes

---

### Level 2: Recommended (Professional Quality)

**Include Level 1 +**:
- `git-workflow.md` - Branching strategy
- `code-review-checklist.md` - Review guidelines
- `versioning.md` - Version management
- `changelog-standards.md` - Changelog writing guide
- `testing-standards.md` - Testing pyramid (UT/IT/ST/E2E)
- Language-specific style guide (e.g., `csharp-style.md`)

**Estimated Setup Time**: 2 hours

---

### Level 3: Comprehensive (Enterprise Grade)

**Include Level 2 +**:
- `documentation-structure.md` - Docs organization
- Framework-specific standards (e.g., `dotnet.md`)
- Domain-specific standards (e.g., `fintech.md`)
- OpenSpec integration for spec-driven development
- Full template suite

**Estimated Setup Time**: 1-2 days

---

## AI-Optimized Standards

### Dual-Format Architecture

| Format | Location | Use Case | Token Usage |
|--------|----------|----------|-------------|
| **Human-Readable** | `core/`, `options/` | Documentation, onboarding, reference | Standard |
| **AI-Optimized** | `ai/` | AI assistants, automation, CLAUDE.md | ~80% reduction |

### Using AI-Optimized Standards

```yaml
# Reference in CLAUDE.md or system prompts
standards:
  source: ai/standards/
  options:
    workflow: ai/options/git-workflow/github-flow.ai.yaml
    commit_language: ai/options/commit-message/english.ai.yaml
```

### Available Options

| Category | Options |
|----------|---------|
| **Git Workflow** | `github-flow`, `gitflow`, `trunk-based`, `squash-merge`, `merge-commit`, `rebase-ff` |
| **Commit Language** | `english`, `traditional-chinese`, `bilingual` |
| **Testing Levels** | `unit`, `integration`, `system`, `e2e` |
| **Project Structure** | `nodejs`, `python`, `dotnet`, `java`, `go` |

---

## Standards Coverage

| Standard | Skill Available | Adoption |
|----------|----------------|----------|
| anti-hallucination.md | ai-collaboration-standards | Install Skill |
| commit-message-guide.md | commit-standards | Install Skill |
| code-review-checklist.md | code-review-assistant | Install Skill |
| git-workflow.md | git-workflow-guide | Install Skill |
| versioning.md + changelog-standards.md | release-standards | Install Skill |
| testing-standards.md | testing-guide | Install Skill |
| documentation-structure.md | documentation-guide | Install Skill |
| requirement templates | requirement-assistant | Install Skill |
| error-code-standards.md | error-code-guide | Install Skill |
| logging-standards.md | logging-guide | Install Skill |
| test-driven-development.md | tdd-assistant | Install Skill |
| test-completeness-dimensions.md | test-coverage-assistant | Install Skill |
| **checkin-standards.md** | - | Copy to project |
| **spec-driven-development.md** | - | Copy to project |
| **project-structure.md** | - | Copy to project |
| **documentation-writing-standards.md** | - | Copy to project |

> **Important**: For standards with Skills available, use the Skill OR copy the source document - **never both**.

See [Adoption Guide](adoption/ADOPTION-GUIDE.md) for complete guidance.

---

## Usage Modes Comparison

When using UDS, you can choose between three usage modes:

| Mode | Best For | Key Advantage |
|------|----------|---------------|
| **Skills Only** | Individual developers + Claude Code | Lowest token usage, best interactive experience |
| **Standards Only** | Multi-tool teams / Enterprise | Full customization, version control |
| **Skills + Standards** | Complete experience / Learning | 100% feature coverage |

### Quick Decision Guide

- **Personal projects with Claude Code?** → Skills Only (`standardsScope: minimal`)
- **Team with multiple AI tools?** → Skills + Standards (`standardsScope: full`)
- **Enterprise compliance needs?** → Standards Only (no Skills dependency)

See [Usage Modes Comparison](docs/USAGE-MODES-COMPARISON.md) for detailed analysis including feature coverage, token efficiency, and recommendations.

---

## Customization Guide

### Where to Write Customizations

| Customization Type | File | Location |
|--------------------|------|----------|
| AI tool rules & exclusions | `CLAUDE.md`, `.cursorrules`, etc. | Project root |
| Project standard overrides | `PROJECT-STANDARDS.md` | Project root |
| Copied core standards | `docs/standards/` | Your project |

### Adapting Standards

1. **Language Choice**: English, Traditional Chinese, Spanish, Japanese commit types
2. **Tool Configuration**: `npm run build`, `dotnet build`, `mvn package`
3. **Threshold Adjustment**: Test coverage 80%, max method length 50 lines
4. **Scope Definition**: Define allowed commit scopes for your modules

### Excluding Standards

1. **During `uds init`**: Select only needed standards interactively
2. **Selective Adoption**: Copy only specific files
3. **AI Tool Exclusions**: Add exclusion patterns to `CLAUDE.md` or `.cursorrules`
4. **Project-Level Overrides**: Create `PROJECT-STANDARDS.md` to document deviations

---

## Multi-Language Support

### Commit Message Language Examples

**English**:
```
feat(auth): Add OAuth2 support
fix(api): Resolve memory leak
```

**Traditional Chinese**:
```
新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏
```

**Spanish**:
```
característica(auth): Agregar soporte OAuth2
corrección(api): Resolver fuga de memoria
```

**Japanese**:
```
機能(認証): OAuth2サポートを追加
修正(API): メモリリークを解決
```

---

## Tool Integration

### Git Hooks

```bash
npm install --save-dev @commitlint/{cli,config-conventional} husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

### CI/CD Integration

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx commitlint --from HEAD~1 --to HEAD --verbose
      - run: npm run build
      - run: npm test -- --coverage
      - run: npm run lint
```

### OpenSpec Integration

```bash
cp -r integrations/openspec/ your-project/openspec/
mkdir -p your-project/.claude/commands/
cp integrations/openspec/commands/* your-project/.claude/commands/
```

---

## Examples

### Example 1: .NET Web API Project

```
Core Standards: anti-hallucination.md, checkin-standards.md, commit-message-guide.md, git-workflow.md (GitFlow)
Extensions: languages/csharp-style.md, frameworks/dotnet.md
Templates: CLAUDE.md (customized for .NET), README.md, CONTRIBUTING.md
```

### Example 2: React SPA Project

```
Core Standards: anti-hallucination.md, checkin-standards.md, commit-message-guide.md, git-workflow.md (GitHub Flow)
Extensions: languages/typescript-style.md, frameworks/react.md
Tools: ESLint + Prettier, Husky + commitlint, Jest + React Testing Library
```

### Example 3: Python ML Project

```
Core Standards: anti-hallucination.md, checkin-standards.md, commit-message-guide.md, git-workflow.md (Trunk-Based)
Extensions: languages/python-style.md, domains/machine-learning.md
Tools: Black, pylint, pytest, mypy
```

---

## Contributing

### How to Contribute

1. **Suggest Improvements**: Open an issue describing the problem and proposed solution
2. **Add Examples**: Submit examples of how you've applied these standards
3. **Extend Standards**: Contribute new language/framework/domain extensions
4. **Translate**: Help translate standards to other languages

### Contribution Guidelines

All contributions must:
- Maintain language/framework/domain agnosticism (for core standards)
- Include examples in at least 2 different contexts
- Follow the existing documentation structure
- Be licensed under CC BY 4.0

---

## Further Reading

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

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 3.2.2 | 2026-01-06 | Added `uds skills` command; Deprecated manual installation scripts |
| 3.2.0 | 2026-01-02 | Plugin Marketplace support; CLI enhancements |
| 3.0.0 | 2025-12-30 | Full Windows support; AI-optimized standards; npm publish |

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

## License

| Component | License |
|-----------|---------|
| Documentation (`core/`, `extensions/`, `templates/`, etc.) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| CLI Tool (`cli/`) | [MIT](cli/LICENSE) |

Both licenses are permissive and allow commercial use, modification, and redistribution. See [LICENSE](LICENSE) for full details.

---

## Community

- **Issues**: Report bugs or suggest improvements
- **Discussions**: Share how you're using these standards
- **Examples**: Submit your project as an example

---

## Checklist for Adopting Standards

- [ ] Choose installation method (Marketplace / npm / manual)
- [ ] Run `uds init` or copy core standards
- [ ] Add language/framework extensions if needed
- [ ] Configure project-specific settings in CONTRIBUTING.md
- [ ] Set up Git hooks (commitlint, pre-commit)
- [ ] Integrate quality gates in CI/CD
- [ ] Train team on standards
- [ ] Create first commit following standards

---

**Ready to improve your project's quality?** Start with Quick Start above!

---

**Maintained with love by the open-source community**

---

## Detailed Directory Structure

```
universal-dev-standards/
├── core/                                  # Core universal standards (16 files)
│   ├── anti-hallucination.md             # AI collaboration guidelines
│   ├── changelog-standards.md            # Changelog writing guide
│   ├── checkin-standards.md              # Code check-in quality gates
│   ├── code-review-checklist.md          # Code review guidelines
│   ├── commit-message-guide.md           # Commit message conventions
│   ├── documentation-structure.md        # Documentation organization
│   ├── documentation-writing-standards.md # Documentation writing guide
│   ├── error-code-standards.md           # Error code conventions
│   ├── git-workflow.md                   # Git branching strategies
│   ├── logging-standards.md              # Logging standards
│   ├── project-structure.md              # Project directory conventions
│   ├── spec-driven-development.md        # SDD methodology & standards
│   ├── test-completeness-dimensions.md   # Test completeness dimensions
│   ├── test-driven-development.md        # TDD methodology
│   ├── testing-standards.md              # Testing standards (UT/IT/ST/E2E)
│   └── versioning.md                     # Semantic versioning guide
│
├── ai/                             # AI-optimized standards (v2.3.0)
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
│   ├── claude-code/               # Claude Code Skills (15 skills)
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
├── locales/                       # Translations
│   ├── zh-TW/                     # Traditional Chinese
│   └── zh-CN/                     # Simplified Chinese
│
└── adoption/                       # Adoption guides
    └── ADOPTION-GUIDE.md
```
