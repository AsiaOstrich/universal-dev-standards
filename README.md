# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **Language**: English | [繁體中文](locales/zh-TW/README.md) | [简体中文](locales/zh-CN/README.md)

**Version**: 5.0.0-rc.16 (Pre-release) | **Released**: 2026-03-24 | **License**: [Dual License](LICENSE) (CC BY 4.0 + MIT)

Language-agnostic, framework-agnostic development standards for software projects. Ensure consistency, quality, and maintainability across diverse technology stacks with AI-native workflows.

---

## 🚀 Quick Start

### Install via npm (Recommended)

```bash
# Install globally (stable)
npm install -g universal-dev-standards

# Initialize your project
uds init
```

> Looking for beta or RC versions? See [Pre-release Versions](docs/PRE-RELEASE.md).

### Or use npx (No installation required)

```bash
npx universal-dev-standards init
```

> **Note**: Copying standards alone won't enable AI assistance. Use `uds init` to automatically configure your AI tool or manually reference standards in your tool's configuration file.

### 🗺️ What's Next?

| I want to... | Command |
| :--- | :--- |
| **Understand an existing codebase** | `/discover` |
| **Build a new feature with specs** | `/sdd` |
| **Work with legacy code** | `/reverse` |
| **Choose a development methodology** | `/methodology` |
| **Make a clean commit** | `/commit` |

> **Tip**: Type `/dev-workflow` for a complete guide to all development phases and available commands.
>
> See also: [Daily Workflow Guide](adoption/DAILY-WORKFLOW-GUIDE.md)

---

## ✨ Features

<!-- UDS_STATS_TABLE_START -->
| Category | Count | Description |
|----------|-------|-------------|
| **Core Standards** | 48 | Universal development guidelines |
| **AI Skills** | 40 | Interactive skills |
| **Slash Commands** | 30 | Quick actions |
| **CLI Commands** | 6 | list, init, configure, check, update, skills |
<!-- UDS_STATS_TABLE_END -->

> **What's New in 5.0?** See [Pre-release Notes](docs/PRE-RELEASE.md) for details on new features.

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
uds init        # Interactive initialization
uds check       # Check adoption status
uds update      # Update to latest version
uds config      # Manage preferences (language, mode)
uds uninstall   # Remove standards from project
```

---

## ⚙️ Configuration

Use `uds config` to manage your preferences:

| Parameter | Command | Description |
| :--- | :--- | :--- |
| **Commit Language** | `uds config --lang zh-TW` | Set preferred language for AI commits |
| **Standards** | `uds init` | Install all available standards |
| **Tool Mode** | `uds config --mode skills` | Choose between Skills, Standards, or Both |

---

## 👥 Contributing

1. **Suggest Improvements**: Open an issue with problem and solution.
2. **Add Examples**: Submit real-world usage examples.
3. **Extend Standards**: Contribute language/framework extensions.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🌐 Ecosystem

UDS is the **standards definition layer** in the AsiaOstrich three-layer product architecture:

```
UDS (What to do) → DevAP (How agents do it) → VibeOps (Full lifecycle)
```

| Layer | Product | Role | License |
|-------|---------|------|---------|
| Standards | **UDS** | Development methodology framework | MIT + CC BY 4.0 |
| Orchestration | [DevAP](https://github.com/AsiaOstrich/dev-autopilot) | Agent-agnostic orchestration engine | Apache-2.0 |
| Lifecycle | [VibeOps](https://github.com/AsiaOstrich/vibeops360) | AI-driven software factory | AGPL-3.0-only |

- **UDS** defines development standards → consumed by DevAP (quality gates) and VibeOps (agent pipeline)
- **DevAP** orchestrates AI agents using UDS standards → VibeOps is one of its consumers
- **VibeOps** provides full software lifecycle → integrates UDS via `uds init` (copy-once)

UDS remains **tool-agnostic**: it supports Claude Code, OpenCode, Gemini CLI, Cursor, Cline, and Windsurf. DevAP and VibeOps are consumers, not requirements.

---

## 📄 License

| Component | License |
| :--- | :--- |
| **Documentation** | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| **CLI Tool** | [MIT](cli/LICENSE) |

## Acknowledgments

UDS draws architectural inspiration from these outstanding open-source projects:

| Project | Inspiration | License |
|---------|------------|---------|
| [Superpowers](https://github.com/obra/superpowers) | Systematic debugging, agent dispatch, verification evidence | MIT |
| [GSD](https://github.com/gsd-build/get-shit-done) | Structured task definition, traceability matrix, verification loop cap | MIT |
| [PAUL](https://github.com/ChristopherKahler/paul) | Plan-Apply-Unify loop, acceptance-driven development | MIT |
| [CARL](https://github.com/ChristopherKahler/carl) | Context-aware loading, dynamic rule injection | MIT |
| [CrewAI](https://github.com/crewAIInc/crewAI) | Multi-agent communication protocol, context budget tracking | MIT |
| [LangGraph](https://github.com/langchain-ai/langgraph) | Workflow state protocol, HITL interrupt checkpoints | MIT |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Event sourcing, action-observation stream patterns | MIT |
| [DSPy](https://github.com/stanfordnlp/dspy) | Agent signatures, structured I/O contracts | MIT |

> **Note**: UDS adopts concepts and methodologies only — no source code from these projects is included.

---

**Maintained with ❤️ by the open-source community**
