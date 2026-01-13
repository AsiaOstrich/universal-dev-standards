---
source: ../../../../integrations/opencode/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenCode 整合

本目錄提供將通用開發規範與 OpenCode 整合的資源。

## 概述

OpenCode 是開源 AI 編碼代理，可作為終端介面、桌面應用或 IDE 擴充。此整合協助 OpenCode 理解您的專案並遵循開發規範。

## 資源

- **[AGENTS.md](./AGENTS.md)**（必要）：
  專案級規則檔，OpenCode 會自動載入。

- **[opencode.json](../../../../integrations/opencode/opencode.json)**（可選）：
  配置範例，包含權限設定和自訂 agent。

## 配置層級

OpenCode 支援多層配置：

| 類型 | 檔案位置 | 說明 |
|------|---------|------|
| 專案規則 | `AGENTS.md` | 專案根目錄，自動載入 |
| 全域規則 | `~/.config/opencode/AGENTS.md` | 個人規則，適用所有專案 |
| 專案配置 | `opencode.json` | JSON 格式配置 |
| 全域配置 | `~/.config/opencode/opencode.json` | 全域 JSON 配置 |
| 自訂 Agent | `.opencode/agent/*.md` | 專案級 agent |
| 全域 Agent | `~/.config/opencode/agent/*.md` | 全域 agent |

## 快速開始

### 方式一：複製規則檔（推薦）

```bash
# 複製到專案根目錄
cp integrations/opencode/AGENTS.md AGENTS.md

# 可選：複製配置檔
cp integrations/opencode/opencode.json opencode.json
```

### 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/opencode/AGENTS.md
```

### 方式三：使用 /init（追加模式）

```bash
opencode
/init
```

注意：`/init` 會**追加**到現有 AGENTS.md，而非覆蓋。

## 規則合併行為

OpenCode 的規則合併機制：

| 情況 | 行為 |
|------|------|
| `/init` 且已有 AGENTS.md | **追加**新內容，不覆蓋 |
| 全域 + 專案規則同時存在 | **合併**兩者，專案規則優先 |
| 配置檔（opencode.json） | **合併**，只有衝突的鍵才覆蓋 |

---

## 相關標準

- [防幻覺標準](../../core/anti-hallucination.md)
- [Commit 訊息指南](../../core/commit-message-guide.md)
- [程式碼審查清單](../../core/code-review-checklist.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 OpenCode 整合 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
