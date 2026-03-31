# [SPEC-TESTDATA-001] Feature: Test Data Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/testing-standards.md`, `core/security-standards.md`

## Overview

定義測試資料管理的統一標準，涵蓋資料策略選擇、匿名化規則、fixture 同步、測試隔離、Factory Pattern 以及反模式清單，確保測試資料的可靠性、安全性與可維護性。

## Motivation

### 問題陳述

1. **資料策略無標準** — 開發者不清楚何時使用 inline data、fixture files 或 seed scripts，導致不一致的測試資料管理方式
2. **敏感資料外洩風險** — 測試中直接使用真實姓名、Email、電話等個人資料，可能導致 PII 洩漏
3. **Fixture 與 Schema 不同步** — 資料庫 schema 變更後，fixture 檔案未同步更新，導致測試假性通過或失敗
4. **測試間互相干擾** — 共享可變資料導致測試執行順序依賴，造成不穩定的測試結果
5. **資料建立方式不一致** — 缺乏統一的 Factory Pattern，導致重複的測試資料建立邏輯散落各處
6. **反模式未被識別** — 開發者不知道哪些常見做法是測試資料的反模式

## Requirements

### REQ-1: 測試資料策略對應測試層級

系統 SHALL 定義三種測試資料策略（inline、fixture files、seed scripts）並對應至適用的測試層級。

#### Scenario: 開發者選擇測試資料策略
- **GIVEN** 開發者需要為測試準備資料
- **WHEN** 開發者查閱測試資料策略指南
- **THEN** 能根據測試層級（Unit / Integration / E2E）選擇適合的資料策略

### REQ-2: 資料匿名化規則

系統 SHALL 定義至少 5 種個人資料欄位（姓名、Email、電話、地址、ID）的脫敏方式。

#### Scenario: 開發者處理測試中的敏感資料
- **GIVEN** 測試需要使用類似真實的資料
- **WHEN** 開發者查閱匿名化規則
- **THEN** 能找到每種 PII 欄位的具體脫敏方式

### REQ-3: Fixture 與 Schema Migration 同步

系統 SHALL 定義 fixture 檔案與 schema migration 的同步更新規則。

#### Scenario: 資料庫 Schema 變更後的 Fixture 更新
- **GIVEN** 資料庫 schema 發生變更
- **WHEN** 開發者依照同步規則操作
- **THEN** 所有相關 fixture 檔案同步更新，且有自動檢測機制

### REQ-4: 測試隔離原則

系統 SHALL 定義測試隔離原則，確保每個測試建立與銷毀自己的資料。

#### Scenario: 測試資料隔離
- **GIVEN** 多個測試需要存取相同的資料來源
- **WHEN** 每個測試遵循隔離原則
- **THEN** 各測試獨立建立和銷毀資料，不受其他測試影響

### REQ-5: Factory Pattern 定義

系統 SHALL 定義 Factory Pattern 用於測試資料建立，支援預設值覆寫和關聯資料建立。

#### Scenario: 使用 Factory 建立測試資料
- **GIVEN** 開發者需要建立具有特定屬性的測試資料
- **WHEN** 開發者使用 Factory Pattern
- **THEN** 能覆寫預設值並自動建立關聯資料

### REQ-6: 測試資料反模式清單

系統 SHALL 列出常見的測試資料反模式，包含共享可變資料、硬編碼 ID、依賴執行順序、使用生產資料等。

#### Scenario: 開發者檢查測試資料反模式
- **GIVEN** 開發者撰寫測試資料邏輯
- **WHEN** 開發者查閱反模式清單
- **THEN** 能識別並避免至少 4 種常見反模式

## Acceptance Criteria

- **AC-1**: Given 開發者查閱標準, when 閱讀資料策略章節, then 能找到 3 種策略（inline/fixture files/seed scripts）與測試層級的對應關係
- **AC-2**: Given 開發者處理敏感資料, when 查閱匿名化規則, then 能找到 5 種 PII 欄位（姓名/Email/電話/地址/ID）各自的脫敏方式
- **AC-3**: Given Schema 變更, when 查閱同步規則, then 能找到 fixture 與 schema migration 的同步更新規則
- **AC-4**: Given 多個測試共用資料來源, when 查閱隔離原則, then 能找到每個測試建立/銷毀自己資料的規則
- **AC-5**: Given 開發者建立測試資料, when 查閱 Factory Pattern, then 能找到可覆寫預設值及建立關聯資料的定義
- **AC-6**: Given 開發者撰寫測試, when 查閱反模式清單, then 能找到至少 4 種反模式（共享可變資料、硬編碼 ID、依賴執行順序、使用生產資料）

## Technical Design

### 文件結構

```
core/
├── test-data-standards.md    ← 新建
```

### 章節結構（test-data-standards.md）

```markdown
# Test Data Standards

## Overview
## Test Data Strategies
  ### Inline Data
  ### Fixture Files
  ### Seed Scripts
  ### Strategy Selection Guide
## Data Anonymization Rules
  ### Name
  ### Email
  ### Phone
  ### Address
  ### ID
## Fixture and Schema Migration Sync
## Test Isolation Principles
## Factory Pattern
  ### Default Overrides
  ### Associated Data
## Anti-Patterns
  ### Shared Mutable Data
  ### Hardcoded IDs
  ### Execution Order Dependency
  ### Using Production Data
## References
```

## Test Plan

- [ ] `test-data-standards.md` 符合 UDS core 標準格式驗證
- [ ] 資料策略章節包含 3 種策略的完整定義和測試層級對應
- [ ] 匿名化規則包含 5 種 PII 欄位的脫敏方式
- [ ] Fixture 同步章節包含與 schema migration 的同步規則
- [ ] 測試隔離章節包含建立/銷毀資料的原則
- [ ] Factory Pattern 章節包含預設值覆寫和關聯資料建立
- [ ] 反模式清單包含至少 4 種反模式
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
