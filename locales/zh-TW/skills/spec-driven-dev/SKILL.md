---
source: ../../../../skills/spec-driven-dev/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-02-10
status: current
description: |
  在撰寫程式碼前，建立、審查和管理規格文件。
  使用時機：建立規格、審查設計、規格驅動開發流程。
  關鍵字：spec, specification, SDD, design, review, 規格, 設計, 審查, 驗證。
---

# 規格驅動開發助手

> **語言**: [English](../../../../skills/spec-driven-dev/SKILL.md) | 繁體中文

在撰寫程式碼前，建立、審查和管理規格文件。

## 工作流程

CREATE ──► REVIEW ──► APPROVE ──► IMPLEMENT ──► VERIFY

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
# Feature: [Name]
## Overview
Brief description.
## Requirements
- REQ-001: [Description]
## Acceptance Criteria
- AC-1: Given [context], when [action], then [result]
## Technical Design
[Architecture, API changes, database changes]
## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]
```

## 使用方式

- `/spec` - 互動式規格建立精靈
- `/spec auth-flow` - 為特定功能建立規格
- `/spec review` - 審查現有規格
- `/spec --sync-check` - 檢查同步狀態

## 參考

- 詳細指南：[guide.md](./guide.md)
- 核心規範：[spec-driven-development.md](../../../../core/spec-driven-development.md)
