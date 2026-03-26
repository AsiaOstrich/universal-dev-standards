# [SPEC-AC-002] Feature: Four-Layer Traceability Matrix

- **Status**: Implemented
- **Created**: 2026-03-26
- **Priority**: High
- **Scope**: universal

## Overview

擴展 `/ac-coverage` 技能，從目前的 2 層追溯（AC→Test）擴展為 4 層追溯（Requirement→AC→Test→Code），提供完整的需求到程式碼追溯鏈。對應 IEEE 830 §5.3 和 ISO/IEC 29119-3。

## Requirements

### REQ-1: 四層追溯矩陣

#### Scenario: 產生四層追溯報告
- **GIVEN** 使用者執行 `/ac-coverage --full`
- **WHEN** AI 分析 specs、tests、source code
- **THEN** 產生四層追溯矩陣：Requirement → AC → Test → Code

### REQ-2: 追溯缺口報告

#### Scenario: 識別追溯缺口
- **GIVEN** 四層追溯矩陣已建立
- **WHEN** AI 分析缺口
- **THEN** 報告未被測試覆蓋的 AC、未被程式碼實作的 AC、沒有需求來源的 AC

### REQ-3: 反向追溯

#### Scenario: 從程式碼追溯到需求
- **GIVEN** 使用者執行 `/ac-coverage --trace-code path/to/file.ts`
- **WHEN** AI 分析檔案中的 AC 標記
- **THEN** 顯示該檔案實作了哪些 AC，以及對應的需求

## Acceptance Criteria

- **AC-1**: `/ac-coverage --full` 顯示四層追溯矩陣
- **AC-2**: 缺口報告識別出每層的缺失連結
- **AC-3**: 反向追溯（Code → AC → Requirement）可用
- **AC-4**: 向後相容：預設行為（無 --full）不變
- **AC-5**: 翻譯同步通過

## Technical Design

### 四層追溯結構

```
Layer 0: Requirement / User Story
    ↓ (references)
Layer 1: Acceptance Criteria (AC)
    ↓ (@AC-N annotations)
Layer 2: Test Cases
    ↓ (test covers code)
Layer 3: Source Code
```

### 追溯矩陣報告格式

```markdown
## Four-Layer Traceability Matrix

| Requirement | AC | Test | Code | Status |
|-------------|-----|------|------|--------|
| REQ-1 User login | AC-1 | auth.test.ts:15 | auth.ts:42 | ✅ Full |
| REQ-1 User login | AC-2 | auth.test.ts:30 | auth.ts:58 | ✅ Full |
| REQ-2 Dashboard | AC-3 | — | dashboard.ts:10 | ⚠️ No test |
| REQ-3 Export | AC-4 | export.test.ts:5 | — | ⚠️ No code |

### Gap Summary
- Layer 0→1: 3 requirements without AC
- Layer 1→2: 2 AC without tests
- Layer 2→3: 1 test without code mapping
- Layer 3→1: 5 code files without AC mapping
```

### 連結慣例

```typescript
// Layer 3→1: Code referencing AC
// @implements AC-1, AC-2
function authenticate(user: string, pass: string) { ... }
```

```typescript
// Layer 2→1: Test referencing AC (existing)
// @AC-1 @SPEC-AUTH-001
test('should authenticate valid user', () => { ... });
```

```markdown
<!-- Layer 0→1: Requirement referencing AC (in SPEC) -->
## AC-1: Given valid credentials, when login, then authenticated
Source: REQ-1 (User Authentication Story)
```

## Implementation Tasks

| # | 任務 |
|---|------|
| T1 | 修改 `skills/ac-coverage-assistant/SKILL.md` |
| T2 | 同步更新 `.claude/skills/` 和翻譯 |
| T3 | 驗證同步檢查 |
