# [SPEC-DISCOVER-002] Feature: Persistent Risk Register

- **Status**: Implemented
- **Created**: 2026-03-26
- **Priority**: High
- **Scope**: universal

## Overview

擴展 `/discover` 技能，新增持續性風險登記簿（Risk Register），支援風險矩陣（機率×影響）、風險負責人、緩解計畫追蹤和風險趨勢分析。對應 ISO 31000 風險管理。

## Requirements

### REQ-1: 風險登記簿模板

#### Scenario: 產生風險登記簿
- **GIVEN** `/discover` 完成初始評估
- **WHEN** AI 識別到風險項目
- **THEN** 產生結構化的風險登記簿（ID、類別、描述、機率、影響、等級、負責人、緩解計畫、狀態）

### REQ-2: 風險查詢

#### Scenario: 查看當前風險
- **GIVEN** 使用者執行 `/discover --risks`
- **WHEN** AI 搜尋 `docs/risks/` 目錄
- **THEN** 列出所有開放風險，按等級排序

### REQ-3: 風險更新

#### Scenario: 更新風險狀態
- **GIVEN** 使用者執行 `/discover --update-risk RISK-NNN`
- **WHEN** AI 引導更新風險狀態
- **THEN** 風險登記簿中的對應項目被更新

## Acceptance Criteria

- **AC-1**: `/discover` 產出包含風險登記簿
- **AC-2**: `/discover --risks` 列出開放風險
- **AC-3**: 風險使用機率×影響矩陣分級
- **AC-4**: 翻譯同步通過

## Technical Design

### 風險登記簿模板

```markdown
# Risk Register

| ID | Category | Description | Likelihood | Impact | Level | Owner | Mitigation | Status |
|----|----------|-------------|-----------|--------|-------|-------|------------|--------|
| RISK-001 | Security | Outdated deps with CVEs | High | High | Critical | @dev | Run npm audit fix | Open |
| RISK-002 | Performance | No load testing | Medium | High | High | @ops | Add k6 tests | Open |
```

### 風險矩陣

```
              Impact
         Low    Med    High
High   [ Med ] [High] [Crit]
Med    [ Low ] [Med ] [High]   Likelihood
Low    [ Low ] [Low ] [Med ]
```

### 存放

```
docs/risks/
├── RISK-REGISTER-2026-03-26.md
└── README.md
```

## Implementation Tasks

| # | 任務 |
|---|------|
| T1 | 修改 `skills/project-discovery/SKILL.md` |
| T2 | 同步更新 `.claude/skills/` 和翻譯 |
| T3 | 驗證同步檢查 |
