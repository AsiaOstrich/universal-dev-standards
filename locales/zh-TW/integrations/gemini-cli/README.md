---
source: ../../../../integrations/gemini-cli/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Gemini CLI 整合

本目錄提供將通用文件規範與 [Gemini CLI](https://geminicli.com/) 整合的資源。

## 概述

Gemini CLI 是 Google 的開源 AI 代理工具，將 Gemini 模型帶入終端環境。此整合協助 Gemini CLI 利用通用文件規範來生成更高品質、無幻覺的程式碼與文件。

## 資源

- **[GEMINI.md](./GEMINI.md)**（推薦）：
  專案級指令檔案，Gemini CLI 會自動載入。

- **[settings-example.json](../../../../integrations/gemini-cli/settings-example.json)**：
  用於自訂 CLI 行為的設定範例檔案。

## 配置層級

Gemini CLI 支援分層配置系統：

| 層級 | 檔案位置 | 說明 |
|------|---------|------|
| 全域 | `~/.gemini/GEMINI.md` | 適用於所有專案 |
| 專案 | `./GEMINI.md` | 專案根目錄 |
| 子目錄 | `./subdir/GEMINI.md` | 模組特定規則 |
| 設定 | `.gemini/settings.json` | 行為配置 |

## 快速開始

### 方式一：專案指令（推薦）

將指令檔案複製到專案根目錄：

```bash
# 將 GEMINI.md 複製到專案根目錄
cp integrations/gemini-cli/GEMINI.md ./GEMINI.md

# 或使用 curl
curl -o GEMINI.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/gemini-cli/GEMINI.md
```

### 方式二：全域指令

加入全域指令，適用於所有專案：

```bash
# 建立全域目錄（如果不存在）
mkdir -p ~/.gemini

# 附加或建立全域 GEMINI.md
cat integrations/gemini-cli/GEMINI.md >> ~/.gemini/GEMINI.md
```

### 方式三：自訂設定

複製設定範例以自訂 CLI 行為：

```bash
# 建立專案設定目錄
mkdir -p .gemini

# 複製設定範例
cp integrations/gemini-cli/settings-example.json .gemini/settings.json
```

## 特殊功能

### 模組化導入

Gemini CLI 支援從其他檔案導入內容：

```markdown
# 在 GEMINI.md 中
@./docs/coding-style.md
@./docs/api-guidelines.md
```

### 記憶命令

在執行時管理指令：

- `/memory show` - 顯示目前指令
- `/memory refresh` - 重新載入所有 GEMINI.md
- `/memory add <text>` - 加入全域指令

### 驗證指令

確認標準已載入：

```
/memory show
```

要求代理確認：

```
遵循防幻覺標準審查此程式碼。
```

## 與 Google Antigravity 的關係

兩個工具共用全域 `~/.gemini/` 目錄：

| 工具 | 專案規則位置 | 共用 |
|------|------------|------|
| Gemini CLI | `./GEMINI.md` | `~/.gemini/GEMINI.md` |
| Antigravity | `.antigravity/rules.md` | `~/.gemini/GEMINI.md` |

兩者可共存，使用相同的全域配置。

---

## 相關標準

- [防幻覺標準](../../core/anti-hallucination.md)
- [Commit 訊息指南](../../core/commit-message-guide.md)
- [規格驅動開發](../../core/spec-driven-development.md)
- [Gemini CLI 官方文件](https://geminicli.com/docs/)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 Gemini CLI 整合 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
