---
description: Guide through Test-Driven Development workflow | 引導測試驅動開發流程
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: [feature or function to implement | 要實作的功能]
---

# TDD Assistant | TDD 助手

Guide through the Test-Driven Development (TDD) workflow: Red-Green-Refactor.

引導測試驅動開發（TDD）流程：紅-綠-重構。

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

- `/uds:tdd` - Start interactive TDD session
- `/uds:tdd calculateTotal` - TDD for specific function
- `/uds:tdd "user can login"` - TDD for user story

## Reference | 參考

- Full standard: [tdd-assistant](../../tdd-assistant/SKILL.md)
- Core guide: [testing-standards](../../../../core/testing-standards.md)
