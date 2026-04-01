# [SPEC-CHECKIN-002] Feature: Linting Strategy Extension for checkin-standards

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Medium (P2)
- **Scope**: universal
- **Related**: `core/checkin-standards.md` (擴展)

## Overview

擴展現有 `core/checkin-standards.md`，新增語言無關的 Linting 策略段落。定義 Lint 規則分級、auto-fix 策略、團隊一致性原則和 CI 整合方式。

## Motivation

### 問題陳述

1. **無 Lint 策略指引** — UDS 有 checkin 標準但未定義 Linting 策略
2. **規則分級不清** — 不區分 Error（阻斷）和 Warning（建議），導致全部忽略或全部阻斷
3. **Auto-fix 邊界模糊** — 哪些規則可自動修復、哪些需人工判斷缺乏定義
4. **團隊不一致** — 個人偏好凌駕團隊規範

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `checkin-standards` | **擴展**：在現有文件中新增 Linting Strategy 段落 |
| `code-review-checklist` | **互補**：Lint 自動檢查 + Review 人工檢查 |
| `ci-cd-assistant` | **銜接**：Lint 作為 CI pipeline 的一環 |

## Requirements

### REQ-1: Lint 規則分級

系統 SHALL 定義 Lint 規則的嚴重程度分級。

#### Scenario: 三級 Lint 規則分級
- **GIVEN** 團隊設定 Lint 規則
- **WHEN** 查閱分級指引
- **THEN** 使用三級分級：

| 等級 | CI 行為 | 適用場景 | 範例 |
|------|---------|---------|------|
| **Error** | 阻斷（CI 失敗） | 可能導致 bug 或安全問題 | 未使用變數、未處理 Promise、eval 使用 |
| **Warning** | 通過但報告 | 品質建議，應修復但不緊急 | 函式過長、嵌套過深、TODO 標記 |
| **Info** | 通過不報告 | 風格偏好，供參考 | 行尾空格、import 排序 |

#### Scenario: 規則分級決策指引
- **GIVEN** 團隊要決定某個 Lint 規則的等級
- **WHEN** 使用決策指引
- **THEN** 按以下判斷：
  ```
  這個規則違反可能導致 bug？
  ├─ Yes → Error
  └─ No
     ├─ 這個規則違反會降低可維護性？
     │  ├─ Yes → Warning
     │  └─ No → Info
     └─ 這個規則涉及安全？
        └─ Yes → Error
  ```

### REQ-2: Auto-fix 策略

系統 SHALL 定義哪些 Lint 規則可自動修復。

#### Scenario: Auto-fix 分類
- **GIVEN** 團隊配置 Lint auto-fix
- **WHEN** 查閱 auto-fix 策略
- **THEN** 按以下分類：

| 可否 Auto-fix | 條件 | 範例 |
|-------------|------|------|
| **✅ 可自動修復** | 修復結果確定且不改變語義 | 縮排修正、分號增減、import 排序、尾逗號 |
| **⚠️ 需確認** | 修復可能改變語義 | 變數重命名、型別推斷 |
| **❌ 禁止自動修復** | 修復需要理解上下文 | 未使用變數移除、程式碼重構 |

#### Scenario: Auto-fix 在 CI 中的位置
- **GIVEN** CI pipeline 包含 Lint
- **WHEN** 決定 auto-fix 時機
- **THEN** 標準建議：
  - **Pre-commit hook**：auto-fix 安全規則（格式化）
  - **CI pipeline**：僅檢查不修復（確保開發者意識到問題）
  - **PR 自動建議**：以 review comment 形式建議修復

### REQ-3: 團隊一致性原則

系統 SHALL 定義「統一不如一致」的團隊規範原則。

#### Scenario: 一致性原則
- **GIVEN** 團隊成員對程式碼風格有不同偏好
- **WHEN** 查閱一致性原則
- **THEN** 看到以下規範：

| 原則 | 說明 |
|------|------|
| **團隊決定** | 風格選擇由團隊投票決定，非個人偏好 |
| **配置入版控** | Lint 配置檔 MUST 提交到 Git |
| **一旦決定不爭論** | 採用後所有人遵守，減少 bikeshedding |
| **自動化優先** | 能用工具強制的規則就不靠人工 |
| **新專案用嚴格規則** | 既有專案可漸進採用 |

#### Scenario: 漸進式採用
- **GIVEN** 既有專案想採用 Lint
- **WHEN** 查閱漸進策略
- **THEN** 按以下步驟：
  1. 只對新/修改的檔案啟用嚴格規則
  2. 允許 `// eslint-disable-next-line` 標記既有違規（設上限）
  3. 每季減少 disable 數量
  4. 最終全面啟用

### REQ-4: Lint 配置範本

系統 SHALL 提供語言無關的 Lint 配置策略範本。

#### Scenario: 配置策略範本
- **GIVEN** 團隊設定 Lint 配置
- **WHEN** 使用策略範本
- **THEN** 配置遵循以下結構：

```yaml
# Lint Configuration Strategy (language-agnostic)
rules:
  # Error-level: Block CI
  security:          error   # Security-related checks
  possible-bugs:     error   # Likely bug patterns
  type-safety:       error   # Type-related issues

  # Warning-level: Report but pass
  maintainability:   warning # Complexity, duplication
  naming:            warning # Naming conventions
  documentation:     warning # Missing docs for public APIs

  # Info-level: Silent
  style:             info    # Formatting preferences
  import-order:      info    # Import organization

auto_fix:
  on_save: true              # Format on save in editor
  on_commit: true            # Fix safe rules in pre-commit
  on_ci: false               # CI only checks, never fixes
```

## Acceptance Criteria

- **AC-1**: Given Lint 規則, when 查閱分級, then 有 Error/Warning/Info 三級定義含 CI 行為
- **AC-2**: Given 分級決策, when 使用決策指引, then 有以 bug/維護性/安全性為判斷的決策樹
- **AC-3**: Given Auto-fix, when 查閱策略, then 有可修復/需確認/禁止三類含範例
- **AC-4**: Given Auto-fix 時機, when 查閱 CI 整合, then 有 pre-commit/CI/PR 三個時機的建議
- **AC-5**: Given 團隊一致性, when 查閱原則, then 有 5 個核心原則
- **AC-6**: Given 既有專案, when 查閱漸進策略, then 有 4 步漸進式採用步驟
- **AC-7**: Given 配置範本, when 查閱策略, then 有語言無關的分級配置範本

## Technical Design

### 變更方式

此規格為**擴展**現有 `core/checkin-standards.md`，新增以下段落：

```markdown
## Linting Strategy

### Rule Severity Classification
### Auto-fix Strategy
### Team Consistency Principles
### Gradual Adoption
### Configuration Template
```

### 不建立獨立檔案

理由：Linting 是 check-in 流程的一環，內容不足以獨立成標準（約 100-150 行新增內容）。

## Test Plan

- [ ] 三級 Lint 規則分級有定義
- [ ] Auto-fix 有三種分類含範例
- [ ] 團隊一致性有 5 個原則
- [ ] 漸進式採用有 4 步驟
- [ ] 配置範本為語言無關格式
- [ ] checkin-standards.md 其他段落未被修改

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
