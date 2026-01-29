# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **Language**: English | [繁體中文](locales/zh-TW/README.md) | [简体中文](locales/zh-CN/README.md)

**Version**: 5.0.0-alpha.1 (Pre-release) | **Released**: 2026-01-29 | **License**: [Dual License](LICENSE) (CC BY 4.0 + MIT)

Language-agnostic, framework-agnostic documentation standards for software projects. Ensure consistency, quality, and maintainability across diverse technology stacks.

---

## Features

| Category | Count | Description |
|----------|-------|-------------|
| **Core Standards** | 23 | Universal development guidelines (Markdown) |
| **AI Skills** | 23 | Interactive Claude Code skills for AI-assisted development |
| **Slash Commands** | 24 | Quick actions (`/commit`, `/tdd`, `/review`, etc.) |
| **CLI Commands** | 6 | `list`, `init`, `configure`, `check`, `update`, `skills` |
| **Languages** | 3 | English, Traditional Chinese, Simplified Chinese |

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

For manual setup without npm, see [Installation Methods](#installation-methods) below.

> **Note**: Copying standards alone won't enable AI assistance. Use `uds init` to automatically configure your AI tool or manually reference standards in your tool's configuration file.

---

## Installation Methods

### CLI Tool (Primary)

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

**Specific Version**
```bash
npm install -g universal-dev-standards@4.1.0
npm install -g universal-dev-standards@beta  # Preview features
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

---

## AI Tool Support

| AI Tool | Status | Skills | Commands | Configuration |
|---------|--------|:------:|:--------:|---------------|
| **Claude Code** | ✅ Complete | ✅ | Built-in | `CLAUDE.md` |
| **OpenCode** | ✅ Complete | ✅ | ✅ | `AGENTS.md` |
| Cline | 🔶 Partial | ✅ | - | `.clinerules` |
| GitHub Copilot | 🔶 Partial | ✅ | ✅ | `copilot-instructions.md` |
| OpenAI Codex | 🔶 Partial | ✅ | - | `AGENTS.md` |
| Gemini CLI | 🧪 Preview | ✅ | ✅ | `GEMINI.md` |
| Roo Code | ⏳ Planned | ✅ | ✅ | `.roorules` |
| Cursor | 📄 Minimal | - | - | `.cursorrules` |
| Windsurf | 📄 Minimal | - | - | `.windsurfrules` |
| Antigravity | 📄 Minimal | - | - | `INSTRUCTIONS.md` |

> **Status Legend** (UDS CLI implementation status):
> - ✅ Complete = Full Skills + Commands support, tested
> - 🔶 Partial = Skills work, Commands limited or unsupported
> - 🧪 Preview = Functional but preview-level support
> - ⏳ Planned = Code exists, testing pending
> - 📄 Minimal = Rules file only, no Skills/Commands

### Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **macOS** | ✅ Tested | Primary development platform |
| **Linux** | ⚠️ Untested | Expected to work (Node.js based) |
| **Windows** | ⚠️ Untested | PowerShell scripts provided |

See [Windows Guide](docs/WINDOWS-GUIDE.md) for platform-specific instructions.

---

## Skills Installation

### Method 1: Claude Code Plugin Marketplace (Easiest)

```bash
/plugin install universal-dev-standards@asia-ostrich
```

**Benefits**: Single command, automatic updates, all 23 skills loaded instantly.

**Migrating from v3.x?**
```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### Method 2: UDS CLI

```bash
npm install -g universal-dev-standards
uds init  # Select your AI tool, skills auto-installed
```

Use `uds check` to verify installation status.

### Method 3: Manual Installation

macOS / Linux:
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git /tmp/uds
cp -r /tmp/uds/skills/* ~/.claude/skills/    # Global
# Or: cp -r /tmp/uds/skills/* .claude/skills/  # Project
rm -rf /tmp/uds
```

Windows (PowerShell):
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git $env:TEMP\uds
Copy-Item -Recurse $env:TEMP\uds\skills\claude-code\* $env:USERPROFILE\.claude\skills\
Remove-Item -Recurse $env:TEMP\uds
```

### Community Marketplaces

- **[n-skills](https://github.com/numman-ali/n-skills)** - Curated marketplace for Claude Code, OpenCode, Cursor
- **[claude-plugins.dev](https://claude-plugins.dev/skills)** - Auto-indexed skill discovery
- **[agentskills.io](https://agentskills.io)** - Official Agent Skills specification

---

## Usage Modes

| Mode | Best For | Key Advantage |
|------|----------|---------------|
| **Skills Only** | Individual developers + Claude Code | Lowest token usage, best interactive experience |
| **Standards Only** | Multi-tool teams / Enterprise | Full customization, version control |
| **Skills + Standards** | Complete experience / Learning | 100% feature coverage |

### Quick Decision Guide

- **Personal projects with Claude Code?** → Skills Only
- **Team with multiple AI tools?** → Skills + Standards
- **Enterprise compliance needs?** → Standards Only

See [Usage Modes Comparison](docs/USAGE-MODES-COMPARISON.md) for detailed analysis.

---

## Core Standards Overview

> **Update (v4.3.0)**: Core standards have been optimized for AI token usage.
> - **Rules (`core/*.md`)**: Concise checklists and rules for AI verification.
> - **Guides (`core/guides/*.md`)**: Detailed explanations and tutorials for humans.

### Level 1: Essential (30 minutes setup)

Every project MUST have:

| Standard | Description |
|----------|-------------|
| `anti-hallucination.md` | AI collaboration guidelines |
| `checkin-standards.md` | Quality gates before commit |
| `commit-message-guide.md` | Conventional Commits format |
| `spec-driven-development.md` | Specification-first approach |

### Level 2: Recommended (2 hours setup)

Include Level 1 plus:

| Standard | Description |
|----------|-------------|
| `git-workflow.md` | Branching strategies (GitHub Flow, GitFlow, Trunk-Based) |
| `code-review-checklist.md` | Systematic review guidelines |
| `versioning.md` | Semantic Versioning (SemVer) |
| `changelog-standards.md` | Keep a Changelog format |
| `testing-standards.md` | Testing pyramid (70/20/7/3) |
| `test-driven-development.md` | TDD methodology |
| `behavior-driven-development.md` | BDD with Given-When-Then |

### Level 3: Comprehensive (1-2 days setup)

Include Level 2 plus:

| Standard | Description |
|----------|-------------|
| `documentation-structure.md` | Documentation organization |
| `project-structure.md` | Directory conventions |
| `acceptance-test-driven-development.md` | ATDD methodology |
| `refactoring-standards.md` | Safe refactoring practices |

See [Adoption Guide](adoption/ADOPTION-GUIDE.md) for complete guidance.

---

## Customization

### Where to Write Customizations

| Type | File | Location |
|------|------|----------|
| AI tool rules | `CLAUDE.md`, `.cursorrules`, etc. | Project root |
| Project overrides | `PROJECT-STANDARDS.md` | Project root |
| Copied standards | `docs/standards/` | Your project |

### Adapting Standards

1. **Language**: English, Traditional Chinese, or Simplified Chinese commit types
2. **Tools**: Configure build commands (`npm`, `dotnet`, `mvn`, etc.)
3. **Thresholds**: Adjust test coverage, method length limits
4. **Scopes**: Define allowed commit scopes for your modules

### Excluding Standards

- **During `uds init`**: Select only needed standards interactively
- **Selective Adoption**: Copy only specific files
- **AI Tool Exclusions**: Add patterns to `CLAUDE.md` or `.cursorrules`

---

## Contributing

### How to Contribute

1. **Suggest Improvements**: Open an issue with problem and solution
2. **Add Examples**: Submit real-world usage examples
3. **Extend Standards**: Contribute language/framework/domain extensions
4. **Translate**: Help translate to other languages

### Guidelines

- Maintain language/framework agnosticism for core standards
- Include examples in at least 2 different contexts
- Follow existing documentation structure
- License under CC BY 4.0

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## FAQ

### How do I choose between Skills Only and Standards Only?

- **Skills Only**: Best for individual developers using Claude Code who want interactive AI assistance with minimal setup
- **Standards Only**: Best for teams using multiple AI tools or requiring enterprise compliance with full version control

### Can I adopt only some standards?

Yes! Run `uds init` and select only the standards you need. You can also manually copy specific files from `core/`.

### How do I update installed skills?

For Plugin Marketplace: Skills update automatically or use `/plugin update`.
For CLI installation: Run `uds update --skills`.

### Does UDS work on Windows?

Yes. The CLI is Node.js-based and works on all platforms. See [Windows Guide](docs/WINDOWS-GUIDE.md) for PowerShell-specific instructions.

### What's the difference between core standards and skills?

UDS uses a **dual-layer architecture**:

```
┌─────────────────────────────────────────────────────────┐
│  Skills (Execution Layer)                                │
│  • Quick reference tables & decision trees               │
│  • AI-optimized, token-efficient                         │
│  • Interactive workflows & configuration detection       │
│  • Best for: Daily tasks, quick lookups                  │
└────────────────────────┬────────────────────────────────┘
                         │ When depth needed:
┌────────────────────────▼────────────────────────────────┐
│  Core Standards (Knowledge Base)                         │
│  • Complete theory & edge case coverage                  │
│  • Tool configurations & automation guides               │
│  • "Why" explanations & rationale                        │
│  • Best for: Deep understanding, complex scenarios       │
└─────────────────────────────────────────────────────────┘
```

**Key Differences**:

| Aspect | Core Standards | Skills |
|--------|---------------|--------|
| **Format** | Full Markdown (verbose) | YAML-optimized (token-efficient) |
| **Coverage** | 100% including edge cases | Common cases (80/20) |
| **Content** | Theory + "Why" + "How" | Quick "What" + "How" |
| **Interactivity** | Reference documentation | Config detection, wizards |
| **Best For** | Learning, complex scenarios | Daily execution |

**When Skills are unavailable**, use Core Standards directly. See [Skill Fallback Guide](docs/SKILL-FALLBACK-GUIDE.md) for alternative workflows

### Why are some AI tools marked as "Planned"?

We provide configuration files for these tools, but full integration testing is pending. The configurations should work, but edge cases may exist.

---

## Further Reading

### Related Standards

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Google Engineering Practices](https://google.github.io/eng-practices/)

### Recommended Books

- **The Art of Readable Code** - Boswell & Foucher
- **Clean Code** - Robert C. Martin
- **The Pragmatic Programmer** - Hunt & Thomas
- **Accelerate** - Forsgren, Humble & Kim

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **4.1.0** | 2026-01-21 | Enhanced refactoring standards |
| **4.0.0** | 2026-01-20 | Bidirectional Derivation; 6 new core standards |
| 3.5.0 | 2026-01-15 | Multi-Agent Skills; Gemini CLI; i18n |
| 3.2.2 | 2026-01-06 | `uds skills` command |
| 3.0.0 | 2025-12-30 | Windows support; npm publish |

See [CHANGELOG.md](CHANGELOG.md) for complete history.

---

## What's New in 4.x

### 4.1.0 Highlights

- Enhanced refactoring standards with tactical, strategic, and legacy code safety strategies
- Decision matrix for choosing refactoring approach

### 4.0.0 Highlights

| Feature | Description |
|---------|-------------|
| **Bidirectional Derivation** | Forward Derivation + Reverse Engineering for complete spec-code lifecycle |
| **6 New Core Standards** | BDD, ATDD, Reverse Engineering, Forward Derivation, AI Instructions, Refactoring |
| **23 Skills** | 7 new skills including Forward Derivation, BDD/ATDD assistants |
| **24 Slash Commands** | 9 new commands (`/derive-*`, `/reverse-*`, `/atdd`, `/bdd`) |
| **Methodology System** | TDD/BDD/SDD/ATDD workflows now production-ready |

---

## License

| Component | License | Allows |
|-----------|---------|--------|
| Documentation | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Commercial use, modification, redistribution with attribution |
| CLI Tool | [MIT](cli/LICENSE) | Commercial use, modification, redistribution |

See [LICENSE](LICENSE) for full details.

---

## Directory Structure

```
universal-dev-standards/
├── core/                    # Core rules & checklists (lightweight)
│   ├── guides/              # Detailed guides & tutorials
│   ├── anti-hallucination.md
│   ├── commit-message-guide.md
│   ├── testing-standards.md
│   └── ...
├── methodologies/           # Methodology guides (TDD, BDD, SDD)
│   └── guides/              # Detailed methodology tutorials
├── ai/                      # AI-optimized formats (.ai.yaml)
├── skills/                  # AI tool skills
│   └── claude-code/         # 23 skill directories
├── extensions/              # Language/framework extensions
│   ├── languages/           # csharp-style.md, php-style.md
│   └── frameworks/          # fat-free-patterns.md
├── integrations/            # AI tool configurations
│   ├── cursor/              # .cursorrules
│   ├── windsurf/            # .windsurfrules
│   └── ...
├── cli/                     # CLI tool (uds command)
├── locales/                 # Translations
│   ├── zh-TW/               # Traditional Chinese
│   └── zh-CN/               # Simplified Chinese
├── templates/               # Document templates
└── adoption/                # Adoption guides
```

---

**Ready to improve your project's quality?** Start with [Quick Start](#quick-start)!

**Maintained with ❤️ by the open-source community**
