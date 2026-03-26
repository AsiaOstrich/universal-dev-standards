# [SPEC-METRICS-002] Feature: Technical Debt Quantification

- **Status**: Implemented
- **Created**: 2026-03-26
- **Priority**: Medium
- **Scope**: universal

## Overview

擴展 `/metrics` 技能的 `--debt` 功能，新增技術債分類（設計債、測試債、文件債）、量化指標（SQALE 方法）和趨勢追蹤。對應 SQALE 方法和 ISO/IEC 25010 維護性子特性。

## Requirements

### REQ-1: 技術債分類

#### Scenario: 分類技術債
- **GIVEN** 使用者執行 `/metrics --debt`
- **WHEN** AI 分析程式碼庫
- **THEN** 技術債按類別分類：設計債、測試債、文件債、依賴債、程式碼債

### REQ-2: 量化指標

#### Scenario: 量化技術債
- **GIVEN** 技術債已分類
- **WHEN** AI 計算指標
- **THEN** 顯示修復預估工時、嚴重程度分布、債務密度（每千行）

### REQ-3: 趨勢追蹤

#### Scenario: 顯示技術債趨勢
- **GIVEN** 使用者執行 `/metrics --debt-trend`
- **WHEN** AI 比較歷史數據
- **THEN** 顯示各類別的增減趨勢和整體債務健康度

## Acceptance Criteria

- **AC-1**: `/metrics --debt` 顯示五類分類的技術債
- **AC-2**: 每類包含數量、嚴重程度、預估修復工時
- **AC-3**: `--debt-trend` 顯示趨勢方向
- **AC-4**: 翻譯同步通過

## Technical Design

### 技術債分類

```markdown
## Technical Debt Report

### Summary
| Category | Count | Severity | Est. Fix Time | Trend |
|----------|-------|----------|---------------|-------|
| Code Debt | 42 TODO/FIXME | Medium | 21h | ↑ +5 |
| Test Debt | 15 uncovered modules | High | 30h | → stable |
| Design Debt | 3 complexity hotspots | High | 16h | ↓ -1 |
| Doc Debt | 8 undocumented APIs | Low | 8h | ↑ +2 |
| Dependency Debt | 5 outdated, 1 CVE | Critical | 4h | → stable |

**Total Estimated Remediation**: 79 hours
**Debt Density**: 2.3 items per 1K lines
```

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `skills/metrics-dashboard-assistant/SKILL.md` | 新增技術債分類、量化、趨勢 |
| `.claude/skills/metrics-dashboard-assistant/SKILL.md` | 同步 |
| `locales/zh-TW/skills/metrics-dashboard-assistant/SKILL.md` | 翻譯 |
| `locales/zh-CN/skills/metrics-dashboard-assistant/SKILL.md` | 翻譯 |
