# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **Language**: English | [繁體中文](locales/zh-TW/README.md) | [简体中文](locales/zh-CN/README.md)

**Version**: 5.0.0-rc.1 (Pre-release) | **Released**: 2026-02-13 | **License**: [Dual License](LICENSE) (CC BY 4.0 + MIT)

Language-agnostic, framework-agnostic documentation standards for software projects. Ensure consistency, quality, and maintainability across diverse technology stacks with AI-native workflows.

---

## 🚀 Quick Start

### Install via npm (Recommended)

```bash
# Install globally (stable)
npm install -g universal-dev-standards

# Or install beta for latest features
npm install -g universal-dev-standards@beta

# Initialize your project
uds init
```

### Or use npx (No installation required)

```bash
npx universal-dev-standards init
```

> **Note**: Copying standards alone won't enable AI assistance. Use `uds init` to automatically configure your AI tool or manually reference standards in your tool's configuration file.

---

## ✨ Features

<!-- UDS_STATS_TABLE_START -->
| Category | Count | Description |
| :--- | :--- | :--- |
| **Core Standards** | 32 | Universal development guidelines (TDD, BDD, Security, etc.) |
| **AI Skills** | 27 | Interactive skills for Claude Code, OpenCode, etc. |
| **Slash Commands** | 30 | Quick actions (e.g., `/tdd`, `/review`, `/derive`) |
| **CLI Commands** | 6 | `list`, `init`, `configure`, `check`, `update`, `skills` |
<!-- UDS_STATS_TABLE_END -->

### What's New in 5.0 Beta

| Feature | Description |
| :--- | :--- |
| **32 Core Standards** | 10 new standards including Security, Performance, Accessibility |
| **26 Skills / 30 Commands** | New `/requirement`, `/security`, `/perf` commands |
| **Developer Memory** | Persistent memory across sessions (`.standards/developer-memory.ai.yaml`) |
| **Enhanced i18n** | Commit language preferences, improved zh-CN support |

---

## 🏗️ Architecture

UDS uses a **Dual-Layer Execution Model** designed for both high-speed interactive development and deep technical compliance.

```mermaid
graph TD
    A[AI Agent / Developer] --> B{Action Layer}
    B -- "Daily Tasks" --> C[Skills Layer (.ai.yaml)]
    B -- "Deep Review" --> D[Standards Layer (.md)]
    
    C --> C1[Token-Efficient]
    C --> C2[Interactive Wizards]
    
    D --> D1[Comprehensive Theory]
    D --> D2[Tool Configurations]
    
    C1 -. "Fallback" .-> D1
```

| Aspect | Skills (Execution) | Core Standards (Knowledge) |
| :--- | :--- | :--- |
| **Format** | YAML-optimized | Full Markdown |
| **Goal** | High-speed interactive lookup | Deep understanding & Rationale |
| **Token Usage** | Minimal (AI-Friendly) | Detailed (Reference) |

---

## 🤖 AI Tool Support

| AI Tool | Status | Skills | Slash Commands | Configuration |
| :--- | :--- | :---: | :---: | :--- |
| **Claude Code** | ✅ Complete | **26** | **30** | `CLAUDE.md` |
| **OpenCode** | ✅ Complete | **26** | **30** | `AGENTS.md` |
| **Gemini CLI** | 🧪 Preview | **18+** | **20+** | `GEMINI.md` |
| **Cursor** | ✅ Complete | **Core** | **Simulated** | `.cursorrules` |
| **Cline / Roo Code**| 🔶 Partial | **Core** | **Workflow** | `.clinerules` |
| **Windsurf** | 🔶 Partial | ✅ | **Rulebook** | `.windsurfrules` |

> **Status Legend**: ✅ Complete | 🧪 Preview | 🔶 Partial | ⏳ Planned

---

## 📦 Installation Methods

### CLI Tool (Primary)

**npm (Recommended)**
```bash
npm install -g universal-dev-standards
uds init    # Interactive initialization
uds check   # Check adoption status
uds update  # Update to latest version
```

### Pre-release Versions

```bash
# Install the latest RC (Release Candidate)
npm install -g universal-dev-standards@rc

# Install the latest Beta
npm install -g universal-dev-standards@beta
```

### Source Installation (Development)

```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

---

## ⚙️ Configuration

Use `uds config` to manage your preferences:

| Parameter | Command | Description |
| :--- | :--- | :--- |
| **Commit Language** | `uds config --lang zh-TW` | Set preferred language for AI commits |
| **Standards Level** | `uds init --level 2` | Choose adoption depth (1: Essential, 3: Full) |
| **Tool Mode** | `uds config --mode skills` | Choose between Skills, Standards, or Both |

---

## 👥 Contributing

1. **Suggest Improvements**: Open an issue with problem and solution.
2. **Add Examples**: Submit real-world usage examples.
3. **Extend Standards**: Contribute language/framework extensions.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

| Component | License |
| :--- | :--- |
| **Documentation** | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| **CLI Tool** | [MIT](cli/LICENSE) |

---

**Maintained with ❤️ by the open-source community**
