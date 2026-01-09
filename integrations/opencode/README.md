# OpenCode Integration
# OpenCode 整合

This directory provides resources for integrating Universal Dev Standards with OpenCode.

本目錄提供將通用開發規範與 OpenCode 整合的資源。

## Overview | 概述

OpenCode is an open-source AI coding agent that can run as a terminal interface, desktop app, or IDE extension. This integration helps OpenCode understand your project and follow development standards.

OpenCode 是開源 AI 編碼代理，可作為終端介面、桌面應用或 IDE 擴充。此整合協助 OpenCode 理解您的專案並遵循開發規範。

## Resources | 資源

- **[AGENTS.md](./AGENTS.md)** (Required | 必要):
  Project-level rules file, automatically loaded by OpenCode.
  專案級規則檔，OpenCode 會自動載入。

- **[opencode.json](./opencode.json)** (Optional | 可選):
  Configuration example with permission settings and custom agents.
  配置範例，包含權限設定和自訂 agent。

## Configuration Levels | 配置層級

OpenCode supports multiple configuration levels:

| Type | File Location | Description |
|------|--------------|-------------|
| Project Rules | `AGENTS.md` | Project root, auto-loaded |
| Global Rules | `~/.config/opencode/AGENTS.md` | Personal rules for all projects |
| Project Config | `opencode.json` | JSON configuration |
| Global Config | `~/.config/opencode/opencode.json` | Global JSON config |
| Custom Agents | `.opencode/agent/*.md` | Project-level agents |
| Global Agents | `~/.config/opencode/agent/*.md` | Global agents |

OpenCode 支援多層配置：

| 類型 | 檔案位置 | 說明 |
|------|---------|------|
| 專案規則 | `AGENTS.md` | 專案根目錄，自動載入 |
| 全域規則 | `~/.config/opencode/AGENTS.md` | 個人規則，適用所有專案 |
| 專案配置 | `opencode.json` | JSON 格式配置 |
| 全域配置 | `~/.config/opencode/opencode.json` | 全域 JSON 配置 |
| 自訂 Agent | `.opencode/agent/*.md` | 專案級 agent |
| 全域 Agent | `~/.config/opencode/agent/*.md` | 全域 agent |

## Quick Start | 快速開始

### Option 1: Copy Rules File (Recommended) | 方式一：複製規則檔（推薦）

```bash
# Copy to your project root
cp integrations/opencode/AGENTS.md AGENTS.md

# Optional: Copy config file
cp integrations/opencode/opencode.json opencode.json
```

### Option 2: Use curl | 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/opencode/AGENTS.md
```

### Option 3: Use /init (Append Mode) | 方式三：使用 /init（追加模式）

```bash
opencode
/init
```

Note: `/init` will **append** to existing AGENTS.md, not overwrite.

注意：`/init` 會**追加**到現有 AGENTS.md，而非覆蓋。

## Rules Merging Behavior | 規則合併行為

OpenCode's rule merging mechanism:

| Situation | Behavior |
|-----------|----------|
| `/init` with existing AGENTS.md | **Append** new content, don't overwrite |
| Global + Project rules both exist | **Merge** both, project rules take precedence |
| Config files (opencode.json) | **Merge**, only conflicting keys are overwritten |

OpenCode 的規則合併機制：

| 情況 | 行為 |
|------|------|
| `/init` 且已有 AGENTS.md | **追加**新內容，不覆蓋 |
| 全域 + 專案規則同時存在 | **合併**兩者，專案規則優先 |
| 配置檔（opencode.json） | **合併**，只有衝突的鍵才覆蓋 |

## Configuration Options | 配置選項

### opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md", "CONTRIBUTING.md"],
  "permission": {
    "edit": "ask",
    "bash": "ask"
  },
  "agent": {
    "code-reviewer": {
      "description": "Reviews code following standards",
      "mode": "subagent",
      "tools": {"write": false, "edit": false}
    }
  }
}
```

**Key Options | 主要選項**:
- `instructions`: Reference additional rule files (useful for monorepos) | 引用額外規則檔（適合 monorepo）
- `permission`: Require user confirmation for edits and bash | 編輯和 bash 需使用者確認
- `agent`: Define custom agents with specific capabilities | 定義具特定能力的自訂 agent

---

## Related Standards | 相關標準

- [Anti-Hallucination Standards](../../core/anti-hallucination.md) - 防幻覺標準
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit 訊息指南
- [Code Review Checklist](../../core/code-review-checklist.md) - 程式碼審查清單

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial OpenCode integration |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
