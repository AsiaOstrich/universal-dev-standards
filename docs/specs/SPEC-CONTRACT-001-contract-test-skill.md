# [SPEC-CONTRACT-001] Feature: Contract Test Skill

- **Status**: Archived
- **Created**: 2026-03-26
- **Priority**: Medium
- **Scope**: universal

## Overview

新增 `/contract-test` 技能作為合約測試的引導入口，整合已有的 `options/testing/contract-testing.md` 內容。提供 Pact（消費者驅動）和 OpenAPI（提供者驅動）兩種策略的互動式引導。

## Requirements

### REQ-1: 互動式合約測試引導

#### Scenario: 啟動合約測試引導
- **GIVEN** 使用者執行 `/contract-test`
- **WHEN** AI 助手引導選擇策略
- **THEN** 根據架構（微服務/單體/第三方 API）推薦策略並引導設定

### REQ-2: 合約驗證指令

#### Scenario: 驗證合約
- **GIVEN** 使用者執行 `/contract-test verify`
- **WHEN** AI 檢查合約定義檔案
- **THEN** 報告合約覆蓋率和不一致之處

## Acceptance Criteria

- **AC-1**: `/contract-test` 引導選擇 Pact 或 OpenAPI 策略
- **AC-2**: `/contract-test verify` 報告合約覆蓋率
- **AC-3**: 翻譯同步通過

## Technical Design

### 新增檔案

```
skills/contract-test-assistant/
├── SKILL.md
└── guide.md (指向 options/testing/contract-testing.md)
.claude/skills/contract-test-assistant/
├── SKILL.md
└── guide.md
locales/zh-TW/skills/contract-test-assistant/
├── SKILL.md
└── guide.md
locales/zh-CN/skills/contract-test-assistant/
├── SKILL.md
└── guide.md
```
