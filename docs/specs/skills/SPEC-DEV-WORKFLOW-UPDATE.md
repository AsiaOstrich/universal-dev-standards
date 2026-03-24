# [SPEC-DEV-WORKFLOW-UPDATE] Feature: Dev Workflow 命令更新 — 納入 11 個新命令

**Status**: Archived

## Metadata

```yaml
spec-id: SPEC-DEV-WORKFLOW-UPDATE
title: Dev Workflow 命令更新
status: Archived
created: 2026-03-24
approved-date: 2026-03-24
approved-by: alberthsu
author: AI-assisted
scope: universal
sync-to:
  core-standard: N/A
  skill: pending
  command: pending
  translations: pending
```

## Overview | 概述

將 11 個新建的斜線命令納入 dev-workflow 的階段對照表、場景工作流程和決策樹，使使用者能完整了解所有 45 個命令的使用時機。

## Motivation | 動機

新增了 `/api-design`, `/audit`, `/ci-cd`, `/database`, `/durable`, `/incident`, `/metrics`, `/migrate`, `/pr`, `/scan`, `/security` 共 11 個命令，但 dev-workflow 仍只列出原本的 34 個。使用者查詢工作流程時會遺漏這些命令。

## Requirements | 需求

### REQ-001: Quick Reference 表更新

dev-workflow 的 Quick Reference 表 SHALL 包含所有 45 個命令的 Phase 歸類。

#### Scenario: 新命令歸類

- **GIVEN** 11 個新命令
- **WHEN** 使用者查看 Quick Reference 表
- **THEN** 每個新命令都有對應的 Phase 歸類

### REQ-002: workflow-phases.md 更新

每個 Phase 的命令表 SHALL 包含新歸入的命令及其說明。

#### Scenario: Phase 命令表完整

- **GIVEN** `/api-design` 歸入 Phase I
- **WHEN** 使用者查看 Phase I 詳細說明
- **THEN** 能看到 `/api-design` 的用途和使用時機

### REQ-003: 新增場景

SHALL 新增至少 2 個常見場景覆蓋新命令。

#### Scenario: Security Review 場景

- **GIVEN** 使用者需要進行安全審查
- **WHEN** 查看 Common Scenarios
- **THEN** 能看到完整的安全審查工作流程（`/scan` → `/security` → `/checkin` → `/commit`）

### REQ-004: 決策樹更新

Decision Tree SHALL 包含新命令的決策路徑。

#### Scenario: 使用者不確定用哪個命令

- **GIVEN** 使用者問「我需要設計 API」
- **WHEN** 查看決策樹
- **THEN** 能找到 `/api-design` 的入口

### REQ-005: 同步更新

SKILL.md（產品層）和 skills/commands/dev-workflow.md SHALL 同步更新。

## Acceptance Criteria | 驗收標準

- AC-1: Given Quick Reference 表, When 計算命令數, Then 覆蓋所有 45 個命令
- AC-2: Given workflow-phases.md, When 檢查每個 Phase, Then 新命令已歸入對應 Phase
- AC-3: Given Common Scenarios, When 查看場景列表, Then 至少有 5 個場景（原 3 + 新 2）
- AC-4: Given Decision Tree, When 查看決策路徑, Then 新命令都有對應入口
- AC-5: Given SKILL.md 和 commands/dev-workflow.md, When 比對, Then 內容一致

## Technical Design | 技術設計

### 新命令 Phase 歸類

| Phase | 現有命令 | 新增命令 |
|-------|---------|---------|
| I. Planning | `/brainstorm` `/requirement` `/sdd` `/reverse` | **`/api-design`** **`/database`** |
| II. Testing | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | （無新增） |
| III. Implementation | `/refactor` `/reverse` | **`/migrate`** **`/durable`** |
| IV. Quality Gates | `/checkin` `/review` | **`/security`** **`/scan`** **`/incident`** |
| V. Release | `/commit` `/changelog` `/release` | **`/pr`** **`/ci-cd`** |
| VI. Documentation | `/docs` `/docgen` `/struct` | （無新增） |
| VII. Standards | `/discover` `/guide` | **`/metrics`** **`/audit`** |
| VIII. Advanced | `/methodology` | （無新增） |

### 新場景

| # | 場景 | 流程 |
|---|------|------|
| 4 | Security Review | `/scan` → `/security` → `/checkin` → `/commit` |
| 5 | API Design | `/brainstorm` → `/api-design` → `/sdd` → `/derive` → `/tdd` |

### 修改檔案

| 檔案 | 動作 |
|------|------|
| `skills/dev-workflow-guide/SKILL.md` | 更新 Quick Reference、場景、決策樹 |
| `skills/dev-workflow-guide/workflow-phases.md` | 各 Phase 加入新命令 |
| `skills/commands/dev-workflow.md` | 同步更新 |

## Test Plan | 測試計畫

- [ ] Quick Reference 表命令數 = 45
- [ ] workflow-phases.md 每個 Phase 命令表包含新命令
- [ ] 場景數 ≥ 5
- [ ] 決策樹包含所有新命令入口
- [ ] SKILL.md 與 commands/dev-workflow.md 一致
