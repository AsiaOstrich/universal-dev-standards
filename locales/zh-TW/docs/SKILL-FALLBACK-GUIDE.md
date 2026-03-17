---
source: ../../../docs/SKILL-FALLBACK-GUIDE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-17
status: current
---

# Skill 備援指南

> **Language**: [English](../../../docs/SKILL-FALLBACK-GUIDE.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-01-28

---

## 目的

本指南說明當 Claude Code Skills 無法使用時，如何維持 UDS 功能。Skills 提供 AI 最佳化的執行方式，但 Core Standards 確保在 Skills 無法使用時的持續性。

---

## Skills 無法使用的情況

Skills 在以下情況可能無法使用：

| 情境 | 原因 | 備援策略 |
|------|------|----------|
| **非 Claude Code AI** | 使用 Cursor、Copilot 等其他 AI 工具 | 直接參考 Core Standards |
| **Claude 未載入 Skills** | Skills 未載入或已停用 | 在 CLAUDE.md 中嵌入快速參考 |
| **手動開發** | 無 AI 輔助 | 將 Core Standards 作為文件參考 |
| **新團隊到職** | 尚未採用 Skills | 從 Core Standards 開始 |

---

## 架構概覽：Skills 與 Core Standards

UDS 框架採用**雙層架構**：

```
┌─────────────────────────────────────────────────────────────────┐
│  Skills（執行層）                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  • 快速參考表與決策樹                                              │
│  • AI 最佳化、節省 Token                                          │
│  • 互動式工作流程與設定偵測                                         │
│  • 最適合：日常任務、快速查閱                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ 需要深入理解時，參考：
┌─────────────────────────────────────────────────────────────────┐
│  Core Standards（知識庫）                                         │
│  ─────────────────────────────────────────────────────────────  │
│  • 完整的理論與邊界案例涵蓋                                         │
│  • 工具設定與自動化指南                                             │
│  • 「為什麼」的說明與理由                                           │
│  • 最適合：深入理解、複雜場景                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Skills 提供但 Core Standards 未提供的功能

| 功能 | Skill 能力 | Core Standard 替代方案 |
|------|-----------|----------------------|
| YAML 格式 | 節省 Token | 完整 Markdown（較冗長） |
| 設定偵測 | 自動掃描專案 | 手動設定 |
| 互動式設定 | 首次使用精靈 | 逐步說明文件 |
| 決策樹 | 視覺化快速參考 | 詳細章節查閱 |
| 語言偵測 | 自動雙語支援 | 手動選擇 |

### Core Standards 提供但 Skills 未提供的功能

| 功能 | Core Standard 內容 | Skill 涵蓋範圍 |
|------|-------------------|---------------|
| 理論基礎 | IEEE、SWEBOK、ISO 參考 | 最少 |
| 邊界案例 | 全面涵蓋 | 僅常見案例 |
| 工具設定 | commitlint、husky、CI/CD | 參考連結 |
| 理由說明 | 「為什麼」的解釋 | 僅「做什麼」和「怎麼做」 |
| 程式碼範例 | 多語言、詳細 | 精簡片段 |

---

## 各情境的備援策略

### 情境 1：使用非 Claude Code 的 AI 工具（Cursor、Copilot 等）

**問題**：Claude Code Skills 在其他 AI 工具中無法使用。

**解決方案**：在提示中直接參考 Core Standards。

**設定步驟**：

1. **建立專案層級的 AI 指令檔**：

   建立 `.cursorrules`、`.copilot-rules` 或對應檔案：

   ```markdown
   # Project Development Standards

   This project follows Universal Development Standards.

   ## Key Standards to Follow

   1. **Commit Messages**: Follow Conventional Commits
      - Reference: core/commit-message-guide.md

   2. **Testing**: Follow Testing Standards
      - Reference: core/testing-standards.md

   3. **Requirements**: Follow Requirement Engineering Standards
      - Reference: core/requirement-engineering.md

   ## Quick Reference

   ### Commit Format
   <type>(<scope>): <subject>

   Types: feat, fix, docs, chore, test, refactor, style
   ```

2. **嵌入快速參考表**：

   將 Skills 中的關鍵表格複製到你的 AI 設定檔中。

### 情境 2：Claude Code 未載入 Skills

**問題**：Claude Code 可用但 Skills 未載入。

**解決方案**：在 CLAUDE.md 或對話中直接參考 Core Standards。

**CLAUDE.md 新增範例**：

```markdown
## Development Standards Reference

When Skills are not available, reference these Core Standards:

| Task | Core Standard |
|------|---------------|
| Writing commits | `core/commit-message-guide.md` |
| Writing requirements | `core/requirement-engineering.md` |
| Testing | `core/testing-standards.md` |
| Code review | `core/code-review-checklist.md` |
| Check-in | `core/checkin-standards.md` |
```

### 情境 3：手動開發（無 AI）

**問題**：在無 AI 輔助的情況下工作。

**解決方案**：將 Core Standards 作為參考文件使用。

**建議工作流程**：

1. **開始工作前**：閱讀相關的 Core Standard
2. **開發期間**：保持標準文件開啟以供參考
3. **提交前**：對照檢查清單確認
4. **審查期間**：參考 Code Review Checklist

---

## 可嵌入的快速參考表

當 Skills 無法使用時，將以下表格嵌入你的 CLAUDE.md 或 AI 設定檔中。

### 提交訊息快速參考

```markdown
## Commit Message Format

<type>(<scope>): <subject>

| Type | Purpose |
|------|---------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| chore | Maintenance |
| test | Testing |
| refactor | Refactoring |
| style | Formatting |

Example: `feat(auth): add OAuth2 login support`
```

### 需求撰寫快速參考

```markdown
## User Story Format

As a [role],
I want [feature],
So that [benefit].

## INVEST Criteria

| Criterion | Question |
|-----------|----------|
| Independent | Can be delivered alone? |
| Negotiable | Details flexible? |
| Valuable | Who benefits? |
| Estimable | Can estimate effort? |
| Small | Fits in one sprint? |
| Testable | How to verify? |
```

### 測試快速參考

```markdown
## Testing Pyramid (Default)

| Level | Ratio | Focus |
|-------|-------|-------|
| Unit | 70% | Functions/methods |
| Integration | 20% | Components |
| System | 7% | Subsystems |
| E2E | 3% | Workflows |

## Test Naming

Pattern: should_[expected]_when_[condition]
Example: should_return_error_when_email_invalid
```

### 程式碼審查快速參考

```markdown
## Review Comment Prefixes

| Prefix | Meaning |
|--------|---------|
| BLOCKING | Must fix |
| IMPORTANT | Should fix |
| SUGGESTION | Nice-to-have |
| QUESTION | Clarification |
```

---

## Core 與 Skill 對應參考

當 Skill 無法使用時，使用其對應的 Core Standard：

| Skill | Core Standard |
|-------|---------------|
| `commit-standards` | `core/commit-message-guide.md` |
| `testing-guide` | `core/testing-standards.md` |
| `code-review-assistant` | `core/code-review-checklist.md` |
| `requirement-assistant` | `core/requirement-engineering.md` |
| `spec-driven-dev` | `core/spec-driven-development.md` |
| `tdd-assistant` | `core/test-driven-development.md` |
| `bdd-assistant` | `core/behavior-driven-development.md` |
| `atdd-assistant` | `core/acceptance-test-driven-development.md` |
| `checkin-assistant` | `core/checkin-standards.md` |
| `documentation-guide` | `core/documentation-writing-standards.md` |
| `changelog-guide` | `core/changelog-standards.md` |
| `git-workflow-guide` | `core/git-workflow.md` |
| `refactoring-assistant` | `core/refactoring-standards.md` |
| `reverse-engineer` | `core/reverse-engineering-standards.md` |
| `forward-derivation` | `core/forward-derivation-standards.md` |
| `ai-instruction-standards` | `core/ai-instruction-standards.md` |
| `ai-friendly-architecture` | `core/ai-friendly-architecture.md` |

### 工具型 Skills（無對應 Core Standard）

這些 Skills 是工具，沒有對應的 Core Standards：

| Skill | 類型 | 替代方案 |
|-------|------|----------|
| `docs-generator` | UDS 專屬工具 | 手動建立模板 |
| `methodology-system` | 跨領域整合 | 參考個別 Core Standards |

---

## 替代工作流程

### 無 `commit-standards` Skill 時

**手動工作流程**：

1. 閱讀 `core/commit-message-guide.md`
2. 使用以下格式：
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
3. 參考 Core Standard 中的 Conventional Commits 類型表

### 無 `testing-guide` Skill 時

**手動工作流程**：

1. 閱讀 `core/testing-standards.md`
2. 遵循測試金字塔比例（70/20/7/3）
3. 使用 Core Standard 中的 ISTQB 術語
4. 參考邊界案例覆蓋檢查清單

### 無 `requirement-assistant` Skill 時

**手動工作流程**：

1. 閱讀 `core/requirement-engineering.md`
2. 使用 INVEST 準則撰寫使用者故事
3. 遵循 IEEE 830 SRS 結構撰寫正式需求
4. 套用 ISO 25010 進行非功能需求分類

---

## 在其他 AI 工具中嵌入標準

### 用於 Cursor（`.cursorrules`）

```markdown
# Cursor Rules

## Development Standards

Follow UDS Core Standards in this project:

### Commits
- Format: <type>(<scope>): <subject>
- Types: feat, fix, docs, chore, test, refactor, style
- Reference: core/commit-message-guide.md

### Testing
- Follow Testing Pyramid (70% unit, 20% integration, 7% system, 3% E2E)
- Reference: core/testing-standards.md

### Requirements
- Use INVEST criteria for user stories
- Reference: core/requirement-engineering.md
```

### 用於 GitHub Copilot

新增至倉儲的 `.github/copilot-instructions.md`：

```markdown
# Copilot Instructions

When generating code or documentation, follow these standards:

1. Commit messages: Use Conventional Commits format
2. Tests: Follow TDD, include edge cases
3. Requirements: Use INVEST criteria

See `core/` directory for detailed standards.
```

### 用於通用 AI 工具

在專案根目錄建立 `AI-INSTRUCTIONS.md`：

```markdown
# AI Development Instructions

This project follows Universal Development Standards.

## Quick Reference

[Embed quick reference tables here]

## Detailed Standards

For complete guidelines, see:
- core/commit-message-guide.md
- core/testing-standards.md
- core/requirement-engineering.md
```

---

## 備援模式最佳實踐

### 應該做的

- 保持 Core Standards 在工作區中可存取
- 在 CLAUDE.md 或對應檔案中建立專案層級快速參考
- 請求 AI 協助時參考特定章節
- 當 Core Standards 更新時同步更新快速參考

### 不應該做的

- 假設 AI 在沒有上下文的情況下了解標準
- 複製整份 Core Standards（對 AI 上下文而言過於冗長）
- 因為 Skills 不可用就跳過驗證
- 建立與 Core 衝突的自訂本地標準

---

## 版本歷程

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-28 | 初始版本：Skill 備援策略、嵌入指南、替代工作流程 |

---

## 授權條款

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
