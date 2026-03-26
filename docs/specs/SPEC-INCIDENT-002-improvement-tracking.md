# [SPEC-INCIDENT-002] Feature: Incident Improvement Tracking

- **Status**: Implemented
- **Created**: 2026-03-26
- **Priority**: High
- **Scope**: universal

## Overview

擴展 `/incident` 技能，在 POST-MORTEM 階段後新增第 6 階段 IMPROVE，實現行動項目狀態追蹤、事故趨勢分析，以及與 `/retrospective` 的整合。對應 ISO/IEC 12207 §6.3.6 改善過程。

## Motivation

目前 `/incident` 在 POST-MORTEM 產生行動項目後就結束了，缺少：
1. 行動項目是否被執行的追蹤機制
2. 跨事故的模式分析（重複根因）
3. MTTR 等指標收集
4. 與 `/retrospective` 的改善循環整合

## Requirements

### REQ-1: IMPROVE 階段

系統 SHALL 在 POST-MORTEM 後新增 IMPROVE 階段。

#### Scenario: 事故後改善追蹤
- **GIVEN** POST-MORTEM 已完成且產生行動項目
- **WHEN** 進入 IMPROVE 階段
- **THEN** 行動項目被記錄並可追蹤狀態（Open → In Progress → Done → Verified）

### REQ-2: 行動項目查詢

#### Scenario: 查詢未完成的事故行動項目
- **GIVEN** 使用者執行 `/incident --actions`
- **WHEN** AI 搜尋 `docs/incidents/` 目錄
- **THEN** 列出所有未完成的行動項目及來源事故

### REQ-3: 事故指標

#### Scenario: 查看事故趨勢
- **GIVEN** 使用者執行 `/incident --metrics`
- **WHEN** AI 分析歷史事故報告
- **THEN** 顯示 MTTR、事故頻率、重複根因等指標

### REQ-4: 與 /retrospective 整合

#### Scenario: 事故後建議回顧
- **GIVEN** 一個 SEV-1 或 SEV-2 事故已解決
- **WHEN** POST-MORTEM 完成
- **THEN** AI 建議執行 `/retrospective` 進行團隊回顧

## Acceptance Criteria

- **AC-1**: 工作流程圖更新為 6 階段（含 IMPROVE）
- **AC-2**: `/incident --actions` 列出未完成行動項目
- **AC-3**: `/incident --metrics` 顯示事故趨勢指標
- **AC-4**: POST-MORTEM 後建議 `/retrospective`（SEV-1/2）
- **AC-5**: 翻譯同步通過

## Technical Design

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `skills/incident-response-assistant/SKILL.md` | 新增 IMPROVE 階段、--actions、--metrics 指令 |
| `.claude/skills/incident-response-assistant/SKILL.md` | 同步翻譯更新 |
| `locales/zh-TW/skills/incident-response-assistant/SKILL.md` | 同步翻譯 |
| `locales/zh-CN/skills/incident-response-assistant/SKILL.md` | 同步翻譯 |

### 行動項目追蹤格式

在 Post-Mortem 模板的 Action Items 表格新增 Status 欄：

```markdown
| Action | Owner | Due Date | Priority | Status |
|--------|-------|----------|----------|--------|
| [Fix] | @name | YYYY-MM-DD | P0 | Open |
```

Status: `Open → In Progress → Done → Verified`

### 事故存放

```
docs/incidents/
├── INC-2026-03-15-api-outage.md
├── INC-2026-03-20-db-connection-pool.md
└── README.md
```

## Implementation Tasks

| # | 任務 |
|---|------|
| T1 | 修改 `skills/incident-response-assistant/SKILL.md` |
| T2 | 同步更新 `.claude/skills/` 和翻譯 |
| T3 | 驗證同步檢查 |
