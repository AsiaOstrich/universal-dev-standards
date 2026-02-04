# Specification Index / 規格索引

> **Language**: English | 繁體中文

**Version**: 1.3.0
**Last Updated**: 2026-02-04

This directory contains all specification documents for the Universal Development Standards project, organized by architectural layer.

本目錄包含 Universal Development Standards 專案的所有規格文件，按架構層級組織。

---

## Directory Structure / 目錄結構

```
docs/specs/
├── README.md               # This index file
├── architecture/           # [NEW] Core architectural decisions
│   ├── dual-layer-architecture.md  # Dual-Layer (Physical vs Imagination) Architecture
│   └── SPEC-009-architecture-redesign.md
├── system/                 # Cross-component system designs
│   ├── agents-workflows-system.md
│   └── ... (Other system specs)
├── standards/              # [NEW] Meta-Standards (Defining standards)
├── cli/                    # CLI implementation specifications
│   ├── init/               # Init command specs
│   ├── check/              # Check command specs
│   ├── design/             # Design specs (UX, etc.)
│   ├── shared/             # Shared utilities (i18n, errors)
│   └── ...
└── archive/                # [NEW] Archived or deprecated specs
```

---

## Architecture Specifications / 架構規格

Foundational decisions that shape the entire project strategy.

影響整個專案策略的基礎決策。

| Document | Description | Status |
|----------|-------------|--------|
| [dual-layer-architecture.md](architecture/dual-layer-architecture.md) | **[CRITICAL]** Dual-Layer Architecture: Physical Constraints & Imagination Guidance | Draft |
| [SPEC-009-architecture-redesign.md](architecture/SPEC-009-architecture-redesign.md) | CLI Architecture Redesign | Draft |

---

## System Design Specifications / 系統設計規格

High-level designs for cross-cutting concerns (Agents, Workflows, Derivation).

針對跨領域關注點（代理、工作流、推演）的高階設計。

| Document | Description | Status |
|----------|-------------|--------|
| [agents-workflows-system.md](system/agents-workflows-system.md) | Agent & Workflow System | Implemented |
| [forward-derivation.md](system/forward-derivation.md) | Forward Derivation Methodology | Approved |
| [core-standard-workflow.md](system/core-standard-workflow.md) | Core Standard Creation Workflow | Approved |
| ... | (See system/ directory for full list) | |

---

## CLI Specifications / CLI 規格

Implementation details for the UDS CLI tool.

UDS CLI 工具的實作細節。

### Design & UX

| Document | Description |
|----------|-------------|
| [SPEC-004-cli-ux-refinement.md](cli/design/SPEC-004-cli-ux-refinement.md) | CLI UX Refinement |
| [SPEC-006-cli-ux-final-polish.md](cli/design/SPEC-006-cli-ux-final-polish.md) | CLI UX Final Polish |
| [ui-language-option.md](cli/design/ui-language-option.md) | UI Language Option |

### Shared Utilities

| Document | Description |
|----------|-------------|
| [SPEC-003-cli-i18n-cleanup.md](cli/shared/SPEC-003-cli-i18n-cleanup.md) | i18n Cleanup |
| [error-handling.md](cli/shared/error-handling.md) | Error Handling System |

### Command Implementation

| Command | Specs |
|---------|-------|
| `init` | [SPEC-002-init-refactor.md](cli/init/SPEC-002-init-refactor.md) |
| ... | (See cli/ subdirectories) |

---

## Future Features Roadmap / 未來功能路徑圖

### Priority P0
| Document | Description |
|----------|-------------|
| [upgrade-overview.md](cli/upgrade/00-upgrade-overview.md) | `uds upgrade` command |
| [vibe-coding-integration.md](system/vibe-coding-integration.md) | Vibe Coding Integration |

### Priority P1
| Document | Description |
|----------|-------------|
| [custom-agent-creation.md](system/custom-agent-creation.md) | `uds agent create` wizard |
| [cascading-config.md](system/cascading-config.md) | 3-Layer Configuration |
| [self-healing-cli.md](system/self-healing-cli.md) | Self-healing capabilities |
| [agent-delegation.md](system/agent-delegation.md) | **Real Agent Delegation** (Enable actual write-capable sub-agents) |

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2026-02-04 | Reorganized into Architecture/System/CLI structure; Added Dual-Layer Architecture spec |
| 1.2.0 | 2026-01-28 | Added future feature specs |
| 1.1.0 | 2026-01-25 | Added SHARED/PUBLISH/TEST specs |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).