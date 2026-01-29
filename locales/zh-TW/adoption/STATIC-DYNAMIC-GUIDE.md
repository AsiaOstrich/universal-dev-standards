---
source: ../../adoption/STATIC-DYNAMIC-GUIDE.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-01-07
status: current
---

# 靜態與動態規範指南

> **語言**: [English](../../adoption/STATIC-DYNAMIC-GUIDE.md) | 繁體中文

**版本**: 1.2.0
**最後更新**: 2026-01-07
**適用範圍**: 使用本規範框架與 AI 助理協作的專案

---

## 目的

本指南說明如何根據應用時機分類和部署開發規範。

---

## 分類概覽

```
┌─────────────────────────────────────────────────────────────┐
│           純靜態規範                                         │
│           隨時生效，嵌入專案 context 檔案中                   │
├─────────────────────────────────────────────────────────────┤
│  • checkin-standards    → 編譯、測試、覆蓋率檢查點            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           雙重性質規範（靜態 + 動態）                         │
│           核心規則在 context 中 + 完整指引按需觸發            │
├─────────────────────────────────────────────────────────────┤
│  • anti-hallucination   → 基礎規則隨時生效，詳細指引         │
│                           透過 ai-collaboration-standards    │
│                           技能按需觸發                       │
│  • project-structure    → 基礎慣例隨時生效，詳細指引         │
│                           透過 project-structure-guide       │
│                           技能按需觸發                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           純動態規範（15 個技能）                             │
│           關鍵字觸發，按需載入                                │
├─────────────────────────────────────────────────────────────┤
│  • ai-collaboration-standards ← "certainty", "確定性"        │
│  • changelog-guide      ← "changelog", "變更日誌"            │
│  • code-review-assistant← "review", "PR", "審查"             │
│  • commit-standards     ← "commit", "git", "提交"            │
│  • documentation-guide  ← "docs", "README", "文件"           │
│  • error-code-guide     ← "error code", "錯誤碼"             │
│  • git-workflow-guide   ← "branch", "merge", "分支"          │
│  • logging-guide        ← "logging", "日誌"                  │
│  • project-structure-guide ← "structure", "結構"             │
│  • release-standards    ← "version", "release", "版本"       │
│  • requirement-assistant← "spec", "SDD", "規格"              │
│  • spec-driven-dev      ← "spec", "proposal", "提案"         │
│  • tdd-assistant        ← "TDD", "test first", "紅綠重構"    │
│  • test-coverage-assistant ← "test coverage", "測試覆蓋"     │
│  • testing-guide        ← "test", "測試"                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 純靜態規範

### 定義

無論執行何種任務，AI 互動時都應該**隨時生效**的規範。這些是強制性規則，無需選擇。

### 特徵

- 適用於所有互動（無特定觸發）
- 內容精簡（適合放在專案 context 文件）
- 低 token 開銷
- 基礎行為準則
- 強制性規則，無需決策支援

### 純靜態規範清單

| 規範 | 核心規則 | 核心目的 |
|------|---------|---------|
| [checkin-standards](../../core/checkin-standards.md) | 編譯通過、測試通過、覆蓋率維持 | 確保 commit 前的程式碼品質 |

### 部署方式

將以下任一檔案加入專案根目錄：

- `CLAUDE.md` (Claude Code)
- `.cursorrules` (Cursor)
- `.github/copilot-instructions.md` (GitHub Copilot)
- `AI_GUIDELINES.md` (通用)

**範本**: 參見 [CLAUDE.md.template](../../templates/CLAUDE.md.template)

---

## 雙重性質規範（靜態 + 動態）

### 定義

同時具有**靜態和動態元件**的規範：
- **靜態元件**：核心規則嵌入專案 context（隨時生效）
- **動態元件**：完整技能提供詳細指引（按需觸發）

### 特徵

- 核心規則足夠精簡，可放入 context 檔案
- 詳細指引若隨時載入會使 context 膨脹
- 兩種使用模式都有效且互補

### 雙重性質規範清單

| 規範 | 靜態元件 | 動態技能 | 觸發關鍵字 |
|------|----------|----------|------------|
| [anti-hallucination](../../core/anti-hallucination.md) | 確定性標籤、建議原則 | ai-collaboration-standards | certainty, assumption, 確定性 |
| [project-structure](../../core/project-structure.md) | 目錄慣例 | project-structure-guide | structure, organization, 結構 |

### 部署方式

1. **靜態**：將核心規則摘要加入 `CLAUDE.md`
2. **動態**：安裝對應的技能以獲得詳細指引

---

## 純動態規範

### 定義

由**特定關鍵字**或任務觸發，按需載入以提供詳細指引的規範。

### 特徵

- 有特定觸發條件（關鍵字、指令）
- 內容詳細（若隨時載入會使 context 膨脹）
- 僅在相關時載入
- 任務特定的工作流程
- 需要決策支援（選擇、建議）

### 動態規範清單（15 個技能）

| 規範 | 技能 | 觸發關鍵字 |
|------|------|-----------|
| [anti-hallucination](../../core/anti-hallucination.md) | ai-collaboration-standards | certainty, assumption, 確定性 |
| [changelog-standards](../../core/changelog-standards.md) | changelog-guide | changelog, release notes, 變更日誌 |
| [code-review-checklist](../../core/code-review-checklist.md) | code-review-assistant | review, PR, 審查 |
| [commit-message-guide](../../core/commit-message-guide.md) | commit-standards | commit, git, 提交, feat, fix |
| [documentation-structure](../../core/documentation-structure.md) | documentation-guide | README, docs, 文件 |
| [documentation-writing-standards](../../core/documentation-writing-standards.md) | documentation-guide | documentation |
| [error-code-standards](../../core/error-code-standards.md) | error-code-guide | error code, error handling, 錯誤碼 |
| [git-workflow](../../core/git-workflow.md) | git-workflow-guide | branch, merge, 分支 |
| [logging-standards](../../core/logging-standards.md) | logging-guide | logging, log level, 日誌 |
| [project-structure](../../core/project-structure.md) | project-structure-guide | structure, organization, 結構 |
| [spec-driven-development](../../core/spec-driven-development.md) | requirement-assistant | spec, SDD, 規格, 新功能 |
| [spec-driven-development](../../core/spec-driven-development.md) | spec-driven-dev | spec, proposal, 提案 |
| [test-driven-development](../../core/test-driven-development.md) | tdd-assistant | TDD, test first, 紅綠重構 |
| [test-completeness-dimensions](../../core/test-completeness-dimensions.md) | test-coverage-assistant | test coverage, 7 dimensions, 測試覆蓋 |
| [testing-standards](../../core/testing-standards.md) | testing-guide | test, 測試, coverage |
| [versioning](../../core/versioning.md) | release-standards | version, release, 版本 |

### 部署方式

**推薦：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**替代方案：手動安裝（macOS / Linux）**
```bash
mkdir -p ~/.claude/skills
cp -r skills/commit-standards ~/.claude/skills/
```

**替代方案：手動安裝（Windows PowerShell）**
```powershell
Copy-Item -Recurse skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

詳見 [Claude Code Skills README](../../skills/README.md)。

---

## 決策流程圖

```
                    ┌─────────────────┐
                    │    新規範       │
                    └────────┬────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │ 是否適用於所有           │
               │ AI 互動？               │
               └────────────┬────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
             是                           否
              │                           │
              ▼                           ▼
    ┌─────────────────┐      ┌─────────────────────────┐
    │ 靜態規範         │      │ 能否由關鍵字             │
    │ 加入專案         │      │ 觸發？                  │
    │ context 檔案    │      └────────────┬────────────┘
    └─────────────────┘                   │
                               ┌──────────┴──────────┐
                               │                     │
                              是                     否
                               │                     │
                               ▼                     ▼
                    ┌─────────────────┐   ┌─────────────────┐
                    │ 動態規範         │   │ 考慮是否應該      │
                    │ 建立為 Skill    │   │ 拆分或合併       │
                    │ 並設定關鍵字     │   └─────────────────┘
                    └─────────────────┘
```

---

## Skill 觸發機制

Skills 使用 YAML frontmatter 定義觸發條件：

```yaml
---
name: commit-standards
description: |
  遵循 conventional commits 標準格式化 commit 訊息。
  使用時機：撰寫 commit 訊息、git commit、檢閱 commit 歷史。
  關鍵字：commit, git, message, conventional, 提交, 訊息, feat, fix, refactor。
---
```

**關鍵元素**:
- `Use when:` - 描述觸發情境
- `Keywords:` - 列出觸發關鍵字（支援多語言）

---

## 最佳實踐

### 靜態規範

1. **保持精簡**：專案 context 檔案最多 100-200 行
2. **聚焦行為**：AI 應該隨時做/避免的事
3. **包含快速參考**：精簡表格，非完整文件
4. **連結詳細內容**：參考完整標準以深入了解

### 動態規範

1. **選擇清晰關鍵字**：明確、常用的術語
2. **支援多語言**：為中文使用者包含中文關鍵字
3. **群組相關規範**：如 testing-guide 涵蓋 testing-standards 與 test-completeness
4. **提供快速參考**：Skills 頂部應有精簡摘要

---

## 遷移指南

### 從完整規則到靜態+動態

如果目前所有規則都在一個檔案中：

1. **提取靜態規則**：將 anti-hallucination、checkin、結構規則移至 `CLAUDE.md`
2. **轉換動態規則為 Skills**：為任務特定規則建立或安裝 Skills
3. **移除重複內容**：從 context 檔案刪除重複的規則
4. **測試觸發**：驗證 Skills 在預期關鍵字時啟動

---

## 相關資源

- [CLAUDE.md 範本](../../templates/CLAUDE.md.template) - 可立即使用的靜態規則範本
- [Claude Code Skills](../../skills/README.md) - 技能安裝指南
- [採用指南](ADOPTION-GUIDE.md) - 整體採用策略
- [MAINTENANCE.md](../MAINTENANCE.md) - 如何新增/更新技能（維護者專用）

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.2.0 | 2026-01-07 | 新增 tdd-assistant 技能，更新至 15 個技能 |
| 1.1.0 | 2025-12-30 | 新增雙重性質規範分類，更新至 14 個技能 |
| 1.0.0 | 2025-12-24 | 初始指南 |

---

## 授權

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
