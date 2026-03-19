---
description: [UDS] Guide through Test-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[feature or function to implement | 要實作的功能]"
status: experimental
---

# TDD Assistant | TDD 助手

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Guide through the Test-Driven Development (TDD) workflow: Red-Green-Refactor.

引導測試驅動開發（TDD）流程：紅-綠-重構。

## Pre-Flight Checks | 前置檢查

Before executing TDD phases, the AI assistant MUST verify prerequisites. If a check fails, STOP and guide the user.

在執行 TDD 階段前，AI 助手必須驗證前置條件。如果檢查失敗，停止並引導使用者。

### Phase Gate Matrix | 階段閘門矩陣

| Target Phase | Pre-Flight Check | On Failure |
|-------------|-----------------|------------|
| `RED` | 1. Feature/function clearly defined | → Ask user to describe the behavior |
| | 2. If SDD project: spec exists and is Approved | → Guide to `/sdd` |
| `GREEN` | 1. At least one failing test exists | → Guide back to RED phase |
| | 2. Run tests → confirm failure (not error) | → Fix test syntax/setup first |
| `REFACTOR` | 1. All tests passing (GREEN confirmed) | → Stay in GREEN phase |
| | 2. No failing tests from previous RED cycle | → Complete GREEN first |

### Red-Before-Green Enforcement | 紅燈優先強制

```
🔴 RED: Write test → run → MUST fail
   ↓ (only proceed if test fails with expected assertion failure)
🟢 GREEN: Write minimal code → run → MUST pass
   ↓ (only proceed if ALL tests pass)
🔵 REFACTOR: Clean up → run → MUST still pass
```

**Critical Rule**: The AI MUST NOT write implementation code before a failing test exists. If the user asks to "just write the code", remind them of the TDD contract and offer to write the test first.

**關鍵規則**：AI 不得在失敗測試存在之前撰寫實作程式碼。如果使用者要求「直接寫程式碼」，提醒 TDD 契約並建議先寫測試。

---

## Methodology Integration | 方法論整合

When `/tdd` is invoked:
1. **Automatically activate TDD methodology** if not already active
2. **Set current phase to RED** (writing failing test)
3. **Track phase transitions** as work progresses
4. **Show phase indicators** in responses (🔴 RED, 🟢 GREEN, 🔵 REFACTOR)

當調用 `/tdd` 時：
1. **自動啟用 TDD 方法論**（如果尚未啟用）
2. **將當前階段設為紅燈**（撰寫失敗的測試）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🔴 紅燈、🟢 綠燈、🔵 重構）

See [methodology-system](../methodology-system/SKILL.md) for full methodology tracking.

## TDD Cycle | TDD 循環

```
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────┐     ┌─────┐     ┌─────────┐ │
│    │ RED │ ──► │GREEN│ ──► │REFACTOR │ │
│    └─────┘     └─────┘     └─────────┘ │
│       ▲                          │      │
│       └──────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

## Workflow | 工作流程

### 1. RED - Write Failing Test
- Write a test for the desired behavior
- Run test - it should fail
- Confirms test is valid

### 2. GREEN - Make Test Pass
- Write minimal code to pass the test
- No extra functionality
- Run test - it should pass

### 3. REFACTOR - Improve Code
- Clean up the code
- Remove duplication
- All tests should still pass

## FIRST Principles | FIRST 原則

| Principle | Description | 說明 |
|-----------|-------------|------|
| **F**ast | Tests run quickly | 快速執行 |
| **I**ndependent | No test dependencies | 無相依性 |
| **R**epeatable | Same result every time | 可重複 |
| **S**elf-validating | Pass/fail is clear | 自我驗證 |
| **T**imely | Written before code | 及時撰寫 |

## Usage | 使用方式

- `/tdd` - Start interactive TDD session
- `/tdd calculateTotal` - TDD for specific function
- `/tdd "user can login"` - TDD for user story

## Reference | 參考

- Full standard: [tdd-assistant](../tdd-assistant/SKILL.md)
- Core guide: [testing-standards](../../core/testing-standards.md)
