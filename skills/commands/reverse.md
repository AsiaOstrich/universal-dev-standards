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

## References | 參考

*   [Reverse Engineering Skill](../reverse-engineer/SKILL.md)
*   [Core Standard](../../core/reverse-engineering-standards.md)
