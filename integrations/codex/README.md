# OpenAI Codex Integration
# OpenAI Codex 整合

This directory provides resources for integrating Universal Dev Standards with OpenAI Codex CLI.

本目錄提供將通用開發規範與 OpenAI Codex CLI 整合的資源。

## Overview | 概述

OpenAI Codex is a cloud-based AI coding agent that can run as a CLI, IDE extension, or web interface. It reads AGENTS.md files before executing tasks, making it easy to enforce project standards automatically.

OpenAI Codex 是雲端 AI 編碼代理，可作為 CLI、IDE 擴充或網頁介面運行。它會在執行任務前讀取 AGENTS.md 檔案，方便自動執行專案規範。

## Resources | 資源

- **[AGENTS.md](./AGENTS.md)** (Required | 必要):
  Project-level rules file, automatically loaded by Codex.
  專案級規則檔，Codex 會自動載入。

- **[config.toml.example](./config.toml.example)** (Optional | 可選):
  Configuration example for Codex settings.
  Codex 設定的配置範例。

## Configuration Hierarchy | 配置層級

Codex builds an instruction chain with the following precedence:

| Level | File Location | Description |
|-------|--------------|-------------|
| Global Override | `~/.codex/AGENTS.override.md` | Temporary global override |
| Global Default | `~/.codex/AGENTS.md` | Personal rules for all projects |
| Project Root | `AGENTS.md` | Project-level rules |
| Subdirectory | `services/*/AGENTS.md` | Service-specific rules |
| Subdirectory Override | `services/*/AGENTS.override.md` | Temporary service override |

Codex 會依以下優先順序建立指令鏈：

| 層級 | 檔案位置 | 說明 |
|------|---------|------|
| 全域覆蓋 | `~/.codex/AGENTS.override.md` | 臨時全域覆蓋 |
| 全域預設 | `~/.codex/AGENTS.md` | 個人規則，適用所有專案 |
| 專案根目錄 | `AGENTS.md` | 專案級規則 |
| 子目錄 | `services/*/AGENTS.md` | 服務專屬規則 |
| 子目錄覆蓋 | `services/*/AGENTS.override.md` | 臨時服務覆蓋 |

**Note**: Files closer to the working directory take precedence. Use `AGENTS.override.md` for temporary adjustments without modifying the base file.

**注意**：越接近工作目錄的檔案優先級越高。使用 `AGENTS.override.md` 進行臨時調整，無需修改基礎檔案。

## Quick Start | 快速開始

### Option 1: Copy Rules File (Recommended) | 方式一：複製規則檔（推薦）

```bash
# Copy to your project root
cp integrations/codex/AGENTS.md AGENTS.md

# Optional: Set up global config
mkdir -p ~/.codex
cp integrations/codex/config.toml.example ~/.codex/config.toml
```

### Option 2: Use curl | 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/codex/AGENTS.md
```

### Option 3: Verify Instructions | 方式三：驗證指令

After setup, verify Codex loaded your instructions:

設定完成後，驗證 Codex 是否載入指令：

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

## Configuration Options | 配置選項

### ~/.codex/config.toml

```toml
# Maximum bytes to read from each AGENTS.md file (default: 32768)
project_doc_max_bytes = 65536

# Fallback filenames when AGENTS.md is missing
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

**Key Options | 主要選項**:
- `project_doc_max_bytes`: Increase for larger instruction files | 較大的指令檔可增加此值
- `project_doc_fallback_filenames`: Support alternative filenames | 支援替代檔案名稱

## Rules Merging Behavior | 規則合併行為

Codex merges instructions from root to working directory:

| Situation | Behavior |
|-----------|----------|
| Global + Project rules both exist | **Merge** both, project rules take precedence |
| Override file exists | **Replace** the base file at that level |
| Instructions truncated | Raise `project_doc_max_bytes` or split into subdirectories |

Codex 會從根目錄到工作目錄合併指令：

| 情況 | 行為 |
|------|------|
| 全域 + 專案規則同時存在 | **合併**兩者，專案規則優先 |
| 存在覆蓋檔案 | **取代**該層級的基礎檔案 |
| 指令被截斷 | 提高 `project_doc_max_bytes` 或分散到子目錄 |

---

## Related Standards | 相關標準

- [Anti-Hallucination Standards](../../core/anti-hallucination.md) - 防幻覺標準
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit 訊息指南
- [Code Review Checklist](../../core/code-review-checklist.md) - 程式碼審查清單
- [Spec-Driven Development](../../core/spec-driven-development.md) - 規格驅動開發

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial OpenAI Codex integration |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
