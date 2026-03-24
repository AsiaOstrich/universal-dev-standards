---
name: reverse
description: [UDS] Reverse engineer code to Specs, BDD, or TDD coverage.
argument-hint: "[spec|bdd|tdd] <input> [--output <file>]"
---

# Reverse Engineering | 反向工程

Reverse engineer existing code or tests into specifications and scenarios.

將現有代碼或測試反向工程為規格和場景。

## Usage | 用法

```bash
/reverse [subcommand] <input> [options]
```

### Subcommands | 子命令

| Subcommand | Input | Output | Description |
|------------|-------|--------|-------------|
| `spec` | Code files/dirs | `SPEC-XXX.md` | Create SDD Spec from code |
| `bdd` | `SPEC-XXX.md` | `.feature` | Convert Spec ACs to Gherkin |
| `tdd` | `.feature` | Coverage Report | Analyze TDD coverage of features |

### Options | 選項

| Option | Description |
|--------|-------------|
| `--output` | Output file path |
| `--include-tests` | Include test files in analysis (for `spec`) |
| `--review` | Trigger review after generation |

## Workflows | 工作流程

### 1. Code to Spec (Legacy Recovery)
```bash
/reverse spec src/auth/ --output specs/SPEC-AUTH.md
```
Analyzes code logic to create a functional specification.

### 2. Spec to BDD (Scenario Generation)
```bash
/reverse bdd specs/SPEC-AUTH.md --output features/auth.feature
```
Converts Acceptance Criteria from the spec into Gherkin scenarios.

### 3. BDD to TDD (Coverage Analysis)
```bash
/reverse tdd features/auth.feature
```
Checks if the scenarios in the feature file have corresponding unit tests.

## Anti-Hallucination | 防幻覺

*   **Certainty Tags**: Use `[Confirmed]`, `[Inferred]`, `[Unknown]` tags in output.
*   **Source Attribution**: Cite `file:line` for all reversed logic.

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/reverse` | 詢問使用者要執行哪個子命令（spec/bdd/tdd）和目標 |
| `/reverse <subcommand> <input>` | 直接對指定目標執行指定子命令 |
| `/reverse <subcommand>` | 執行子命令，詢問目標檔案/目錄 |

### Interaction Script | 互動腳本

1. 確認子命令和輸入目標
2. 分派到對應的 `/reverse-sdd`、`/reverse-bdd`、`/reverse-tdd`
3. 收集子命令結果
4. 展示結果摘要

**Decision: 子命令選擇**
- IF `spec` → 分派到 `/reverse-sdd`
- IF `bdd` → 分派到 `/reverse-bdd`
- IF `tdd` → 分派到 `/reverse-tdd`
- IF 未指定 → 問使用者選擇

🛑 **STOP**: 結果展示後等待使用者確認

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 反向工程結果展示後 | 確認結果正確並寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 目標檔案/目錄不存在 | 告知並詢問正確路徑 |
| 子命令無效 | 列出可用子命令（spec/bdd/tdd） |
| 目標為空目錄或空檔案 | 告知無內容可分析 |

## References | 參考

*   [Reverse Engineering Skill](../reverse-engineer/SKILL.md)
*   [Core Standard](../../core/reverse-engineering-standards.md)
