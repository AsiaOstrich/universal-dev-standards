---
source: ../../../../skills/spec-driven-dev/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-03-23
status: current
description: "[UDS] 在撰寫程式碼前，建立、審查和管理規格文件"
name: sdd
allowed-tools: Read, Write, Grep, Glob, Bash(git:*)
scope: universal
argument-hint: "[spec name or feature | 規格名稱或功能]"
---

# 規格驅動開發助手

> **語言**: [English](../../../../skills/spec-driven-dev/SKILL.md) | 繁體中文

在撰寫程式碼前，建立、審查和管理規格文件。

## 快速檢查清單

- 搜尋現有規格：查看 `specs/`、`docs/specs/` 或專案規格目錄
- 決定範圍：新功能 vs 修改現有功能
- 選擇唯一的規格 ID：`SPEC-NNN` 或 kebab-case 變更 ID
- 撰寫包含明確 AC（Given/When/Then 格式）的提案
- 實作前取得核准
- 依序實作任務，對照規格驗證
- 完成後歸檔規格

## 決策樹

```
新需求？
├─ 修復符合規格行為的 Bug？ → 直接修復
├─ 錯字/格式/註解？ → 直接修復
├─ 相依套件更新（不破壞相容性）？ → 直接修復
├─ 新功能/能力？ → 建立提案
├─ 破壞性變更？ → 建立提案
├─ 架構變更？ → 建立提案
└─ 不確定？ → 建立提案（較安全）
```

## 工作流程

```
DISCUSS ──► CREATE ──► REVIEW ──► APPROVE ──► IMPLEMENT ──► VERIFY ──► ARCHIVE
```

### 0. Discuss - 釐清範圍
在撰寫規格前，捕捉模糊地帶、建立治理原則、解決歧義。

### 1. Create - 撰寫規格
定義需求、技術設計、驗收條件和測試計畫。

### 2. Review - 審查驗證
與利害關係人檢查完整性、一致性和可行性。

### 3. Approve - 核准
在實作開始前取得利害關係人簽核。

### 4. Implement - 實作
依據已核准的規格進行開發，參照需求和驗收條件。

### 5. Verify - 驗證
確保實作符合規格，所有測試通過，驗收條件已滿足。

### 6. Archive - 歸檔
歸檔已完成的規格，連結至 commits/PRs。

## 規格狀態

| 狀態 | 說明 | State | Description |
|------|------|-------|-------------|
| **Draft** | 草稿中 | Draft | Work in progress |
| **Review** | 審查中 | Review | Under review |
| **Approved** | 已核准 | Approved | Ready for implementation |
| **Implemented** | 已實作 | Implemented | Code complete |
| **Archived** | 已歸檔 | Archived | Completed or deprecated |

## 規格結構

```markdown
# [SPEC-ID] Feature: [Name]

## Overview
簡短描述提案變更。

## Motivation
為什麼需要這個變更？解決什麼問題？

## Requirements
### Requirement: [Name]
系統 SHALL [行為描述]。

#### Scenario: [成功案例]
- **GIVEN** [初始情境]
- **WHEN** [執行動作]
- **THEN** [預期結果]

## Acceptance Criteria
- AC-1: Given [context], when [action], then [result]

## Technical Design
[架構、API 變更、資料庫變更]

## Test Plan
- [ ] [元件] 的單元測試
- [ ] [流程] 的整合測試
```

### 場景格式規則

- 使用 `#### Scenario:` (h4 標題) 撰寫每個場景
- 每個需求必須至少有一個場景
- 使用 **GIVEN/WHEN/THEN** 格式描述結構化行為
- 使用 **SHALL/MUST** 表達強制需求，**SHOULD** 表達建議

## 變更操作

修改現有規格時，使用 delta 區段：

| 操作 | 說明 |
|------|------|
| `## ADDED Requirements` | 新增功能 |
| `## MODIFIED Requirements` | 修改行為 |
| `## REMOVED Requirements` | 移除功能 |
| `## RENAMED Requirements` | 重新命名 |

## 使用方式

- `/sdd` - 互動式規格建立精靈
- `/sdd auth-flow` - 為特定功能建立規格
- `/sdd review` - 審查現有規格
- `/sdd --sync-check` - 檢查同步狀態

## 下一步引導

`/sdd` 完成後，AI 助手應建議：

> **規格文件已建立。建議下一步：**
> - 執行 `/derive` 從規格推導測試工件
> - 執行 `/derive bdd` 僅推導 BDD 場景
> - 執行 `/derive tdd` 僅推導 TDD 骨架
> - 審查 AC 完整性，確保所有驗收條件可測試
> - 檢查 UDS 規範覆蓋率 → 執行 `/audit --patterns`

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[spec-driven-development.md](../../../../core/spec-driven-development.md)
