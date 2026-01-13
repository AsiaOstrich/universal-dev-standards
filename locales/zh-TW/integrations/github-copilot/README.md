---
source: ../../../../integrations/github-copilot/README.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-01-13
status: current
---

# GitHub Copilot 整合

本目錄提供將通用開發規範與 [GitHub Copilot](https://github.com/features/copilot) 整合的資源。

## 概述

GitHub Copilot 是內建於 GitHub 和主流 IDE 的 AI 編程助手。此整合提供自訂指令，協助 Copilot 生成更高品質、符合規範的程式碼與文件。

## 資源

| 檔案 | 說明 |
|------|------|
| **[copilot-instructions.md](./copilot-instructions.md)** | Copilot Chat 自訂指令 |
| **[COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md)** | Chat 提示範本 |
| **[skills-mapping.md](./skills-mapping.md)** | Skills 對照表 |

## 快速開始

### 方式一：專案層級（推薦）

將指令檔案複製到專案：

```bash
# 建立 .github 目錄（如果不存在）
mkdir -p .github

# 複製指令檔案
cp integrations/github-copilot/copilot-instructions.md .github/copilot-instructions.md
```

### 方式二：使用 curl 下載

```bash
mkdir -p .github
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/github-copilot/copilot-instructions.md
```

### 方式三：使用 UDS CLI

```bash
# 安裝 UDS CLI
npm install -g universal-dev-standards

# 初始化並選擇 Copilot 整合
uds init
# 在提示時選擇 "GitHub Copilot"
```

## 配置方式

### VS Code

1. 安裝 [GitHub Copilot 擴充套件](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
2. 確保專案根目錄有 `.github/copilot-instructions.md`
3. Copilot Chat 會自動使用這些指令

### GitHub Web (github.com)

1. 導航到您的儲存庫
2. 確保存在 `.github/copilot-instructions.md`
3. 在 GitHub 網頁介面使用 Copilot Chat

### JetBrains IDE

1. 安裝 GitHub Copilot 外掛
2. 確保專案根目錄有 `.github/copilot-instructions.md`
3. Copilot Chat 會自動使用這些指令

## 限制說明

GitHub Copilot 相較於其他 AI 編程工具有一些限制：

### 配置層級

| 層級 | 位置 | 支援 |
|------|------|------|
| 專案 | `.github/copilot-instructions.md` | ✅ 支援 |
| 全域 | 使用者設定 | ❌ 不支援 |
| 子目錄 | N/A | ❌ 不支援 |
| 執行時覆蓋 | N/A | ❌ 不支援 |

### 功能比較

| 功能 | Copilot | Claude Code | Gemini CLI |
|------|---------|-------------|------------|
| 專案指令 | ✅ | ✅ | ✅ |
| 全域配置 | ❌ | ✅ | ✅ |
| 斜線命令 | ❌ | ✅ (18 skills) | ❌ |
| MCP 支援 | ❌ | ✅ | ❌ |
| 自訂 Skills | ❌ | ✅ | ✅ |
| 多檔案上下文 | ⚠️ 有限 | ✅ | ✅ |
| 程式碼生成 | ✅ | ✅ | ✅ |
| Chat 介面 | ✅ | ✅ | ✅ |

### 替代方案

由於 Copilot 不支援斜線命令，請改用 Chat 提示：

```
Claude Code: /commit
Copilot:     "Generate a commit message following Conventional Commits..."

Claude Code: /review
Copilot:     "Review this code following the code review checklist..."

Claude Code: /tdd
Copilot:     "Help me implement using TDD (Red-Green-Refactor)..."
```

完整提示範本請參閱 [COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md)。

## 包含的規範

`copilot-instructions.md` 檔案包含以下規範：

| 規範 | 說明 |
|------|------|
| 防幻覺 | 證據導向分析、來源標註 |
| Commit 規範 | Conventional Commits 格式 |
| 程式碼審查 | 10 類別檢查清單、評論前綴 |
| TDD 指南 | 紅綠重構循環、FIRST 原則 |
| 測試覆蓋 | 7 維度框架 |
| 簽入規範 | 簽入前品質關卡 |
| 需求撰寫 | INVEST 條件、使用者故事格式 |

## 驗證整合

驗證指令是否已載入：

1. 在 IDE 中開啟 Copilot Chat
2. 詢問：「我應該遵循什麼 commit 訊息標準？」
3. Copilot 應該參考 Conventional Commits 格式

---

## 相關標準

- [防幻覺標準](../../core/anti-hallucination.md)
- [Commit 訊息指南](../../core/commit-message-guide.md)
- [程式碼審查檢查清單](../../core/code-review-checklist.md)
- [測試規範](../../core/testing-standards.md)
- [簽入規範](../../core/checkin-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.0.0 | 2026-01-13 | 重大增強：新增 README、Chat 參考、skills 對照；增強指令內容 |
| 1.0.1 | 2025-12-24 | 新增：相關標準、版本歷史、授權章節 |
| 1.0.0 | 2025-12-23 | 初始 GitHub Copilot 整合 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
