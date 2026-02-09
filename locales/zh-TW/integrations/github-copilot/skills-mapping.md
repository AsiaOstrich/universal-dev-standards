---
source: ../../../integrations/github-copilot/skills-mapping.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-02-05
status: current
---

# Skills 移植指南

本文件將 Claude Code 的 skills 對應到 GitHub Copilot 的等效實作和替代方案。

---

## 概述

Claude Code 提供 25 個 skills 和 17 個斜線命令。GitHub Copilot 不支援斜線命令，但大部分功能可透過 Chat 提示和 `copilot-instructions.md` 檔案實現。

---

## Skills 對照表

| Claude Code Skill | Copilot 實作 | 狀態 |
|-------------------|--------------|------|
| **ai-collaboration-standards** | copilot-instructions.md 第 1 節 | ✅ 完整 |
| **commit-standards** | copilot-instructions.md 第 2 節 | ✅ 完整 |
| **code-review-assistant** | copilot-instructions.md 第 3 節 | ✅ 完整 |
| **tdd-assistant** | copilot-instructions.md 第 4 節 | ✅ 完整 |
| **test-coverage-assistant** | copilot-instructions.md 第 5 節 | ✅ 完整 |
| **checkin-assistant** | copilot-instructions.md 第 6 節 | ✅ 完整 |
| **requirement-assistant** | copilot-instructions.md 第 7 節 | ✅ 完整 |
| **spec-driven-dev** | copilot-instructions.md 第 8 節 | ✅ 完整 |
| **testing-guide** | 透過 copilot-instructions.md | ⚠️ 部分 |
| **release-standards** | 僅 Chat 提示 | ⚠️ 部分 |
| **changelog-guide** | 僅 Chat 提示 | ⚠️ 部分 |
| **git-workflow-guide** | 僅 Chat 提示 | ⚠️ 部分 |
| **documentation-guide** | 僅 Chat 提示 | ⚠️ 部分 |
| **methodology-system** | 不可用 | ❌ 無 |
| **refactoring-assistant** | COPILOT-CHAT-REFERENCE.md §9 | ✅ 完整 |
| **error-code-guide** | 僅 Chat 提示 | ⚠️ 部分 |
| **project-structure-guide** | 僅 Chat 提示 | ⚠️ 部分 |
| **logging-guide** | 僅 Chat 提示 | ⚠️ 部分 |
| **bdd-assistant** | 僅 Chat 提示 | ⚠️ 部分 |
| **atdd-assistant** | 僅 Chat 提示 | ⚠️ 部分 |
| **docs-generator** | 僅 Chat 提示 | ⚠️ 部分 |
| **forward-derivation** | 僅 Chat 提示 | ⚠️ 部分 |
| **reverse-engineer** | 僅 Chat 提示 | ⚠️ 部分 |
| **ai-friendly-architecture** | 僅 Chat 提示 | ⚠️ 部分 |
| **ai-instruction-standards** | 僅 Chat 提示 | ⚠️ 部分 |

### 狀態說明

| 狀態 | 意義 |
|------|------|
| ✅ 完整 | 完整實作於 copilot-instructions.md |
| ⚠️ 部分 | 可透過 Chat 提示使用，未在指令檔案中 |
| ❌ 無 | 無法在 Copilot 中複製 |

---

## 斜線命令等效提示

| Claude Code | Copilot Chat 等效提示 |
|-------------|----------------------|
| `/commit` | "依照 Conventional Commits 格式產生 commit 訊息" |
| `/review` | "依照程式碼審查檢查清單審查此程式碼" |
| `/tdd` | "使用 TDD（紅綠重構）幫我實作" |
| `/coverage` | "使用 7 維度分析測試覆蓋" |
| `/requirement` | "依照 INVEST 條件撰寫使用者故事" |
| `/check` | "驗證簽入前品質關卡" |
| `/release` | "依照語義化版本準備發布" |
| `/changelog` | "以 Keep a Changelog 格式產生 CHANGELOG 條目" |
| `/docs` | "為此函式/模組撰寫文件" |
| `/sdd` | "為此功能建立規格文件" |
| `/refactor` | "幫我決定是否應該重構或重寫..." |
| `/refactor tactical` | "建議戰術重構改進..." |
| `/refactor legacy` | "幫我安全地重構此遺留程式碼..." |
| `/methodology` | ❌ 不可用 |
| `/bdd` | "幫我用 Gherkin 格式撰寫 BDD 情境" |
| `/atdd` | "幫我實作 ATDD 工作流程與驗收測試" |
| `/docgen` | "為此模組產生文件" |
| `/derive` | "從此規格推導實作" |
| `/reverse` | "從此程式碼逆向工程產生文件" |
| `/config` | "為此類型應用程式建議專案結構" |
| `/update` | ❌ 不可用（需手動更新檔案） |
| `/init` | ❌ 不可用（請改用 UDS CLI） |

---

## 功能限制

### 無法移植的功能

1. **自動觸發**
   - Claude Code：Skills 根據關鍵字自動觸發
   - Copilot：必須手動使用 Chat 提示

2. **方法論系統**
   - Claude Code：追蹤開發階段（TDD/BDD/SDD/ATDD）
   - Copilot：工作階段間無狀態追蹤

3. **斜線命令**
   - Claude Code：`/commit`、`/review` 等
   - Copilot：必須在 Chat 中輸入完整提示

4. **MCP 工具整合**
   - Claude Code：可透過 MCP 連接外部工具
   - Copilot：不支援 MCP

5. **全域配置**
   - Claude Code：`~/.claude/CLAUDE.md` 適用於所有專案
   - Copilot：只有專案層級的 `.github/copilot-instructions.md`

6. **子目錄規則**
   - Claude Code：每個子目錄可有不同規則
   - Copilot：整個專案只有單一指令檔案

---

## 建議的替代方案

### 方法論追蹤

改用專案文件：
```markdown
<!-- 在您的 README.md 或 CONTRIBUTING.md 中 -->
## 開發方法論
本專案使用 TDD。目前階段：實作

### TDD 檢查清單
- [x] 寫失敗的測試
- [ ] 實作最小程式碼
- [ ] 重構
```

### 全域標準

建立包含預設 `.github/copilot-instructions.md` 的範本儲存庫：
```bash
# 從範本建立
gh repo create my-project --template my-org/project-template
```

### 自動觸發

使用 VS Code 程式碼片段或快捷鍵：
```json
// .vscode/snippets.code-snippets
{
  "Commit 訊息": {
    "prefix": "commit",
    "body": "依照 Conventional Commits 格式為這些變更產生 commit 訊息..."
  }
}
```

---

## 移植檢查清單

從 Claude Code 移植到 Copilot 時：

```
□ 將 copilot-instructions.md 複製到 .github/
□ 收藏 COPILOT-CHAT-REFERENCE.md 以便參考提示範本
□ 為常用提示建立 VS Code 程式碼片段
□ 更新團隊文件說明 Copilot 的限制
□ 考慮使用 UDS CLI 進行專案初始設定
```

---

## 混合方式

對於同時使用 Claude Code 和 Copilot 的團隊：

| 任務 | 建議工具 |
|------|----------|
| 複雜程式碼生成 | Claude Code |
| 快速行內建議 | Copilot |
| 程式碼審查 | 皆可 |
| Commit 訊息 | 皆可 |
| 專案設定 | Claude Code + UDS CLI |
| IDE 自動完成 | Copilot |

---

## 相關資源

- [copilot-instructions.md](./copilot-instructions.md) - 完整規範
- [COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md) - Chat 提示
- [Claude Code Skills](../../skills/) - 原始 skills

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.2.0 | 2026-02-05 | 更新 skills 數量（18→25），新增 7 個 skills 和 5 個斜線命令 |
| 1.1.0 | 2026-01-21 | 更新 refactoring-assistant 為完整狀態，新增 /refactor 命令對照 |
| 1.0.0 | 2026-01-13 | 初始發布 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
