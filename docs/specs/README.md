# Specification Index / 規格索引

> **Language**: English | 繁體中文

**Version**: 1.2.0
**Last Updated**: 2026-01-28

This directory contains all specification documents for the Universal Development Standards project.

本目錄包含 Universal Development Standards 專案的所有規格文件。

---

## Directory Structure / 目錄結構

```
docs/specs/
├── README.md                       # This index file
├── system/                         # System design specifications
│   ├── agents-workflows-system.md  # Agent & Workflow system design
│   ├── core-standard-workflow.md   # Core standard creation workflow
│   ├── forward-derivation.md       # Forward derivation methodology
│   ├── vibe-coding-integration.md  # [NEW] Vibe Coding integration (P0)
│   ├── custom-agent-creation.md    # [NEW] Custom agent creation (P1)
│   ├── cascading-config.md         # [NEW] Cascading configuration (P1)
│   ├── self-healing-cli.md         # [NEW] Self-healing CLI (P1)
│   ├── hitl-protocol.md            # [NEW] Human-in-the-loop protocol (P1)
│   ├── i18n-standards.md           # [NEW] i18n standards (P1)
│   ├── agent-sandbox.md            # [NEW] Agent sandbox (P1)
│   ├── workflow-rollback.md        # [NEW] Workflow rollback (P1)
│   ├── agent-marketplace.md        # [NEW] Agent marketplace (P2)
│   ├── workflow-visualization.md   # [NEW] Workflow visualization (P2)
│   ├── folder-restructure.md       # [NEW] Folder restructure (P2)
│   ├── telemetry-feedback.md       # [NEW] Telemetry & feedback (P2)
│   ├── skills-api.md               # [NEW] Skills as a Service (P2)
│   └── ai-tool-detection.md        # [NEW] AI tool auto-detection (P2)
└── cli/                            # CLI implementation specifications
    ├── 00-overview.md              # CLI architecture overview
    ├── design/                     # Design specifications
    │   ├── ui-language-option.md   # --ui-lang option design
    │   └── skills-installation.md  # Skills installation mechanism
    ├── shared/                     # Shared specifications
    │   ├── ui-lang-consistency.md  # UI language consistency
    │   ├── i18n-system.md          # i18n message system [SHARED-08]
    │   ├── error-handling.md       # Error handling system [SHARED-09]
    │   └── ...                     # Other shared specs
    ├── publishing/                 # Publishing specifications
    │   └── npm-release.md          # npm release automation [PUBLISH-00]
    ├── testing/                    # Testing specifications
    │   └── test-strategy.md        # CLI test strategy [TEST-00]
    ├── upgrade/                    # [NEW] Upgrade command specs
    │   └── 00-upgrade-overview.md  # UDS upgrade command (P0)
    ├── rules/                      # [NEW] Rules command specs
    │   └── 00-rules-overview.md    # Rules management (P1)
    └── {command}/                  # Command implementation specs
        └── ...
```

---

## Future Features / 未來功能規格

Specifications for planned features, organized by priority. These specs are not tied to specific versions.

計劃功能的規格，按優先級組織。這些規格不綁定特定版本。

### Priority P0 - Core Features / 核心功能

| Document | Description | Status |
|----------|-------------|--------|
| [upgrade-overview.md](cli/upgrade/00-upgrade-overview.md) | `uds upgrade` 無痛升級命令 | Draft |
| [vibe-coding-integration.md](system/vibe-coding-integration.md) | Vibe Coding 整合（意圖導航+品質守門） | Draft |

### Priority P1 - Enhanced Features / 增強功能

| Document | Description | Status |
|----------|-------------|--------|
| [custom-agent-creation.md](system/custom-agent-creation.md) | `uds agent create` 互動式精靈 | Draft |
| [cascading-config.md](system/cascading-config.md) | Global → Org → Project 三層配置 | Draft |
| [rules-overview.md](cli/rules/00-rules-overview.md) | `uds rules` 規則管理命令 | Draft |
| [self-healing-cli.md](system/self-healing-cli.md) | `uds fix --auto` 自動修正功能 | Draft |
| [hitl-protocol.md](system/hitl-protocol.md) | 人機協作協議（HITL） | Draft |
| [i18n-standards.md](system/i18n-standards.md) | 多語言支援規範 | Draft |
| [agent-sandbox.md](system/agent-sandbox.md) | Agent 執行沙盒環境 | Draft |
| [workflow-rollback.md](system/workflow-rollback.md) | 工作流程失敗回溯機制 | Draft |

### Priority P2 - Future Vision / 未來願景

| Document | Description | Status |
|----------|-------------|--------|
| [agent-marketplace.md](system/agent-marketplace.md) | Git-based 去中心化代理市場 | Draft |
| [workflow-visualization.md](system/workflow-visualization.md) | Mermaid 圖表生成 | Draft |
| [folder-restructure.md](system/folder-restructure.md) | 目錄結構重構 | Draft |
| [telemetry-feedback.md](system/telemetry-feedback.md) | 遙測與回饋循環 | Draft |
| [skills-api.md](system/skills-api.md) | Skills as a Service API | Draft |
| [ai-tool-detection.md](system/ai-tool-detection.md) | AI 工具自動偵測 | Draft |

---

## Implemented Specifications / 已實作規格

### System Design Specifications / 系統設計規格

High-level architecture and design documents that define cross-cutting concerns and methodologies.

定義跨領域關注點和方法論的高階架構與設計文件。

| Document | Description | Status |
|----------|-------------|--------|
| [agents-workflows-system.md](system/agents-workflows-system.md) | Agent & Workflow 系統設計 | Implemented |
| [core-standard-workflow.md](system/core-standard-workflow.md) | 核心標準建立/更新工作流程 | Approved |
| [forward-derivation.md](system/forward-derivation.md) | 正向推演規格（SDD → BDD/TDD/ATDD） | Approved |

---

## CLI Specifications / CLI 規格

Implementation specifications for the UDS CLI tool.

UDS CLI 工具的實作規格。

### Overview / 概覽

- [CLI Architecture Overview](cli/00-overview.md) - 31 個規格文件的架構總覽

### Design Specifications / 設計規格

Design-level specifications that define how features should work before implementation.

定義功能在實作前應如何運作的設計層級規格。

| Document | Description | Status |
|----------|-------------|--------|
| [ui-language-option.md](cli/design/ui-language-option.md) | `--ui-lang` 全域選項設計 | Implemented |
| [skills-installation.md](cli/design/skills-installation.md) | Skills 安裝機制設計 | Implemented |

### Command Specifications / 命令規格

Implementation specifications organized by command.

按命令組織的實作規格。

| Command | Overview | Specs |
|---------|----------|-------|
| `init` | [00-init-overview.md](cli/init/00-init-overview.md) | 4 files |
| `check` | [00-check-overview.md](cli/check/00-check-overview.md) | 4 files |
| `update` | [00-update-overview.md](cli/update/00-update-overview.md) | 4 files |
| `configure` | [00-configure-overview.md](cli/configure/00-configure-overview.md) | 3 files |
| `list` | [00-list-overview.md](cli/list/00-list-overview.md) | 1 file |
| `skills` | [00-skills-overview.md](cli/skills/00-skills-overview.md) | 1 file |
| `agent` | [00-agent-overview.md](cli/agent/00-agent-overview.md) | 2 files |
| `workflow` | [00-workflow-overview.md](cli/workflow/00-workflow-overview.md) | 2 files |
| `ai-context` | [00-ai-context-overview.md](cli/ai-context/00-ai-context-overview.md) | 2 files |

### Shared Specifications / 共用規格

Cross-cutting specifications used by multiple commands.

多個命令共用的跨領域規格。

| Document | Description |
|----------|-------------|
| [ui-lang-consistency.md](cli/shared/ui-lang-consistency.md) | UI 語言一致性規範 |
| [file-operations.md](cli/shared/file-operations.md) | 檔案操作規範 |
| [hash-tracking.md](cli/shared/hash-tracking.md) | Hash 追蹤機制 |
| [manifest-schema.md](cli/shared/manifest-schema.md) | Manifest Schema |
| [prompts.md](cli/shared/prompts.md) | 互動提示規範 |
| [ai-agent-paths.md](cli/shared/ai-agent-paths.md) | AI 工具路徑配置 |
| [i18n-system.md](cli/shared/i18n-system.md) | 國際化訊息系統 [SHARED-08] |
| [error-handling.md](cli/shared/error-handling.md) | 錯誤處理系統 [SHARED-09] |

### Publishing Specifications / 發布規格

| Document | Description |
|----------|-------------|
| [npm-release.md](cli/publishing/npm-release.md) | npm 發布自動化 [PUBLISH-00] |

### Testing Specifications / 測試規格

| Document | Description |
|----------|-------------|
| [test-strategy.md](cli/testing/test-strategy.md) | CLI 測試策略 [TEST-00] |

---

## Specification Types / 規格類型

| Type | Purpose | Audience | Location |
|------|---------|----------|----------|
| **System Spec** | Cross-cutting architecture | Architects, Senior Devs | `system/` |
| **Design Spec** | Feature design decisions | Developers | `cli/design/` |
| **Implementation Spec** | Module implementation details | Developers | `cli/{command}/` |
| **Shared Spec** | Cross-command utilities | Developers | `cli/shared/` |

---

## Related Documentation / 相關文件

- [Documentation Structure Standard](../../core/documentation-structure.md) - 文件結構規範
- [Spec-Driven Development](../../core/spec-driven-development.md) - 規格驅動開發
- [CLI README](../../cli/README.md) - CLI 使用說明

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-01-28 | Added 16 future feature specs (P0: 2, P1: 8, P2: 6); Reorganized into priority sections |
| 1.1.0 | 2026-01-25 | Added SHARED-08, SHARED-09, PUBLISH-00, TEST-00; Updated system specs to Approved |
| 1.0.0 | 2026-01-24 | Initial consolidation of specs directories |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
