# SPEC-STD-06: Superpowers-Inspired Standards

> **Status**: Archived
> **Author**: AI Assistant
> **Date**: 2026-03-20
> **Type**: Feature
> **Scope**: universal
> **Retroactive**: Yes — 已合併 PR #34 後追溯建立
> **Commit**: `e99f8f4` feat(standards): add 6 Superpowers-inspired standards
> **PR**: #34

---

## Objective / 目標

新增 6 個借鑑 [Superpowers](https://github.com/superpowers) 專案（MIT 授權）的開發標準，涵蓋 AI 代理工作流中的除錯、派遣、模型選擇、隔離開發、分支完成與驗證證據。

## Problem Statement / 問題陳述

| 面向 | 說明 |
|------|------|
| **當前行為** | UDS 缺乏 AI 代理運作層面的標準化指引（如並行代理協調、模型分級） |
| **期望行為** | 提供結構化標準，讓 AI 代理能遵循一致的工作流程 |
| **缺口** | 除錯靠猜測、代理無狀態回報、模型選擇無策略、完成無證據 |

## Requirements / 需求

| ID | 描述 | 優先級 |
|----|------|--------|
| REQ-001 | 定義四階段系統化除錯流程（根因→模式→假設→修復） | P0 |
| REQ-002 | 定義子代理並行派遣與狀態回報協定 | P0 |
| REQ-003 | 定義三層模型分級選擇策略（Fast→Standard→Capable） | P1 |
| REQ-004 | 定義 Git Worktree 隔離開發生命週期管理 | P1 |
| REQ-005 | 定義分支完成工作流（前置檢查+四選項+安全丟棄） | P1 |
| REQ-006 | 定義驗證證據標準（無證據不可聲稱完成） | P0 |

## Acceptance Criteria / 驗收條件

### AC-1: Systematic Debugging（系統化除錯）
- **Given** 開發者遇到 bug
- **When** 啟動除錯流程
- **Then** 必須先完成根因分析才能嘗試修復；連續 3 次失敗觸發架構審查

### AC-2: Agent Dispatch（代理派遣）
- **Given** 需要並行處理多個任務
- **When** 派遣子代理
- **Then** 每個代理在獨立域工作、回報標準化狀態碼（DONE/BLOCKED/...）、完成後執行整合測試

### AC-3: Model Selection（模型選擇）
- **Given** 需要選擇 AI 模型執行任務
- **When** 評估任務複雜度
- **Then** 根據複雜度信號選擇最低成本能勝任的模型層級；BLOCKED 時自動升級

### AC-4: Git Worktree（Worktree 隔離）
- **Given** 需要在隔離環境中開發
- **When** 建立 Worktree
- **Then** 遵循五階段生命週期（Setup→Baseline→Execute→Merge→Cleanup）；目錄在 .gitignore 中

### AC-5: Branch Completion（分支完成）
- **Given** 分支工作完成
- **When** 執行完成流程
- **Then** 必須通過前置檢查（測試/lint/type check）；提供四個完成選項；丟棄需明確確認

### AC-6: Verification Evidence（驗證證據）
- **Given** 代理聲稱任務完成
- **When** 提交完成報告
- **Then** 必須附帶 verification_evidence（command/exit_code/output/timestamp）；Bug fix 需 RED→GREEN 循環

## Deliverables / 交付物

| 類型 | 檔案 | 狀態 |
|------|------|------|
| Core Standard | `core/systematic-debugging.md` | ✅ 已交付 |
| Core Standard | `core/agent-dispatch.md` | ✅ 已交付 |
| Core Standard | `core/model-selection.md` | ✅ 已交付 |
| Core Standard | `core/git-worktree.md` | ✅ 已交付 |
| Core Standard | `core/branch-completion.md` | ✅ 已交付 |
| Core Standard | `core/verification-evidence.md` | ✅ 已交付 |
| AI YAML | `ai/standards/*.ai.yaml`（6 檔） | ✅ 已交付 |
| Registry | `cli/standards-registry.json`（6 入口） | ✅ 已交付 |
| 繁中翻譯 | `locales/zh-TW/core/*.md` | ❌ 待補充 |
| Skill 實作 | 對應 Skill（如適用） | ❌ 待評估 |

## Technical Design / 技術設計

### 架構決策

1. **全為 universal scope** — 不含 UDS 專案特定邏輯，任何專案可直接採用
2. **Rule Matrix 格式** — 每個標準包含 ID/觸發/行動/優先級 的規則矩陣
3. **AI YAML 雙版本** — Markdown 供人閱讀，YAML 供 AI 代理遵循
4. **Registry 分類** — debugging/dispatch/evidence 歸類 `skill`；worktree/branch 歸類 `reference`

### 檔案清單（13 檔案，+1,457 行）

```
core/systematic-debugging.md          # 156 行
core/agent-dispatch.md                # 149 行
core/model-selection.md               # 153 行
core/git-worktree.md                  # 131 行
core/branch-completion.md             # 158 行
core/verification-evidence.md         # 172 行
ai/standards/systematic-debugging.ai.yaml
ai/standards/agent-dispatch.ai.yaml
ai/standards/model-selection.ai.yaml
ai/standards/git-worktree.ai.yaml
ai/standards/branch-completion.ai.yaml
ai/standards/verification-evidence.ai.yaml
cli/standards-registry.json           # +72 行（6 入口）
```

## Sync Checklist / 同步清單

| 項目 | 狀態 | 說明 |
|------|------|------|
| Core Standard ↔ AI YAML | ✅ | 6 對 6，完整對應 |
| Core Standard ↔ Registry | ✅ | 6 個入口已新增 |
| Core Standard ↔ Skill | ⚠️ | 未評估是否需要對應 Skill |
| Core Standard ↔ 繁中翻譯 | ❌ | 待補充 `locales/zh-TW/core/` |
| Core Standard ↔ .standards/ | ⚠️ | 未透過 `uds init` 安裝 |

## Outstanding Items / 待辦事項

1. **繁中翻譯** — 6 個 core standard 的 `locales/zh-TW/` 翻譯
2. **Skill 評估** — 評估是否需要建立對應的 Claude Code Skill
3. **CLAUDE.md 更新** — 考慮將新標準加入 Installed Standards Index
4. **跨採用層影響** — 評估對各採用層的消費影響

## Version History / 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-03-20 | 追溯建立規格（PR #34 已合併） |
