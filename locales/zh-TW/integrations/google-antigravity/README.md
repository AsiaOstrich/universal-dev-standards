---
source: ../../../../integrations/google-antigravity/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-13
status: current
---

# Google Antigravity 整合

本目錄提供將通用文件規範與 Google Antigravity 整合的資源。

## 概述

Google Antigravity 是一個先進的代理程式碼開發助理。此整合協助 Antigravity 代理利用通用文件規範來生成更高品質、無幻覺的程式碼與文件。

## 資源

- **[.antigravity/rules.md](../../../../integrations/google-antigravity/.antigravity/rules.md)**（推薦）：
  專案級規則檔，Antigravity 會自動載入。

- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**：
  用於手動配置的系統提示詞片段。

## 規則配置

Google Antigravity 支援兩層規則配置：

| 類型 | 檔案位置 | 說明 |
|------|---------|------|
| 全域規則 | `~/.gemini/GEMINI.md` | 適用於所有專案 |
| 專案規則 | `.antigravity/rules.md` | 專案特定規則（自動載入） |

## 快速開始

### 方式一：專案規則（推薦）

將專案規則檔複製到您的專案：

```bash
# 建立目錄並複製規則檔
mkdir -p .antigravity
cp integrations/google-antigravity/.antigravity/rules.md .antigravity/

# 或使用 curl
mkdir -p .antigravity
curl -o .antigravity/rules.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/google-antigravity/.antigravity/rules.md
```

### 方式二：手動配置

1. **安裝規範**：
   確保 `core/` 規範已複製到您的專案（例如 `.standards/`）。

2. **配置代理**：
   將 `INSTRUCTIONS.md` 的內容複製到您的 Antigravity「使用者規則」或特定任務指令中。

### 驗證合規性

要求代理「遵循防幻覺標準審查此程式碼」。

---

## 相關標準

- [防幻覺標準](../../core/anti-hallucination.md)
- [Commit 訊息指南](../../core/commit-message-guide.md)
- [INSTRUCTIONS.md](./INSTRUCTIONS.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-01-09 | 新增：`.antigravity/rules.md` 專案規則檔、規則配置章節 |
| 1.0.1 | 2025-12-24 | 新增：相關標準、版本歷史、授權章節 |
| 1.0.0 | 2025-12-23 | 初始 Google Antigravity 整合 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
