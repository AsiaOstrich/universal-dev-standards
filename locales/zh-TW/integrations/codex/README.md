---
source: ../../../../integrations/codex/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenAI Codex 整合

本目錄提供將通用開發規範與 OpenAI Codex CLI 整合的資源。

## 概述

OpenAI Codex 是雲端 AI 編碼代理，可作為 CLI、IDE 擴充或網頁介面運行。它會在執行任務前讀取 AGENTS.md 檔案，方便自動執行專案規範。

## 資源

- **[AGENTS.md](./AGENTS.md)**（必要）：
  專案級規則檔，Codex 會自動載入。

- **[config.toml.example](../../../integrations/codex/config.toml.example)**（可選）：
  Codex 設定的配置範例。

## 配置層級

Codex 會依以下優先順序建立指令鏈：

| 層級 | 檔案位置 | 說明 |
|------|---------|------|
| 全域覆蓋 | `~/.codex/AGENTS.override.md` | 臨時全域覆蓋 |
| 全域預設 | `~/.codex/AGENTS.md` | 個人規則，適用所有專案 |
| 專案根目錄 | `AGENTS.md` | 專案級規則 |
| 子目錄 | `services/*/AGENTS.md` | 服務專屬規則 |
| 子目錄覆蓋 | `services/*/AGENTS.override.md` | 臨時服務覆蓋 |

**注意**：越接近工作目錄的檔案優先級越高。使用 `AGENTS.override.md` 進行臨時調整，無需修改基礎檔案。

## 快速開始

### 方式一：複製規則檔（推薦）

```bash
# 複製到專案根目錄
cp integrations/codex/AGENTS.md AGENTS.md

# 可選：設定全域配置
mkdir -p ~/.codex
cp integrations/codex/config.toml.example ~/.codex/config.toml
```

### 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/codex/AGENTS.md
```

### 方式三：驗證指令

設定完成後，驗證 Codex 是否載入指令：

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

## 配置選項

### ~/.codex/config.toml

```toml
# 每個 AGENTS.md 檔案的最大位元組數（預設：32768）
project_doc_max_bytes = 65536

# AGENTS.md 不存在時的備用檔名
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

**主要選項**：
- `project_doc_max_bytes`：較大的指令檔可增加此值
- `project_doc_fallback_filenames`：支援替代檔案名稱

## 規則合併行為

Codex 會從根目錄到工作目錄合併指令：

| 情況 | 行為 |
|------|------|
| 全域 + 專案規則同時存在 | **合併**兩者，專案規則優先 |
| 存在覆蓋檔案 | **取代**該層級的基礎檔案 |
| 指令被截斷 | 提高 `project_doc_max_bytes` 或分散到子目錄 |

---

## 相關標準

- [防幻覺標準](../../core/anti-hallucination.md)
- [Commit 訊息指南](../../core/commit-message-guide.md)
- [程式碼審查清單](../../core/code-review-checklist.md)
- [規格驅動開發](../../core/spec-driven-development.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 OpenAI Codex 整合 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
