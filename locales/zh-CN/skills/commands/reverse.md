---
name: reverse
description: [UDS] Reverse engineer code to Specs, BDD, or TDD coverage.
argument-hint: "[spec|bdd|tdd] <input> [--output <file>]"
---

# Reverse Engineering | 逆向工程

Reverse engineer existing code or tests into specifications and scenarios.

将现有代码或测试逆向工程为规格和场景。

## Usage | 用法

```bash
/reverse [subcommand] <input> [options]
```

### Subcommands | 子命令

| Subcommand | Input | Output | Description |
|------------|-------|--------|-------------|
| `spec` | Code files/dirs | `SPEC-XXX.md` | 从代码创建 SDD 规格 |
| `bdd` | `SPEC-XXX.md` | `.feature` | 将规格 AC 转换为 Gherkin |
| `tdd` | `.feature` | Coverage Report | 分析 feature 的 TDD 覆盖 |

### Options | 选项

| Option | Description |
|--------|-------------|
| `--output` | 输出文件路径 |
| `--include-tests` | 分析中包含测试文件（用于 `spec`） |
| `--review` | 生成后触发审查 |

## Workflows | 工作流程

### 1. Code to Spec (Legacy Recovery)
```bash
/reverse spec src/auth/ --output specs/SPEC-AUTH.md
```
分析代码逻辑以创建功能规格。

### 2. Spec to BDD (Scenario Generation)
```bash
/reverse bdd specs/SPEC-AUTH.md --output features/auth.feature
```
将规格中的验收标准转换为 Gherkin 场景。

### 3. BDD to TDD (Coverage Analysis)
```bash
/reverse tdd features/auth.feature
```
检查 feature 文件中的场景是否有对应的单元测试。

## Anti-Hallucination | 防幻觉

*   **确定性标签**：在输出中使用 `[Confirmed]`、`[Inferred]`、`[Unknown]` 标签。
*   **来源归因**：为所有逆向逻辑引用 `file:line`。

## References | 参考

*   [Reverse Engineering Skill](../reverse-engineer/SKILL.md)
*   [Core Standard](../../core/reverse-engineering-standards.md)
