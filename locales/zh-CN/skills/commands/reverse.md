---
source: ../../../../skills/commands/reverse.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 32adc0c367f3
status: current
---

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

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/reverse` | 询问用户要执行哪个子命令（spec/bdd/tdd）和目标 |
| `/reverse <subcommand> <input>` | 直接对指定目标执行指定子命令 |
| `/reverse <subcommand>` | 执行子命令，询问目标文件/目录 |

### Interaction Script | 交互脚本

1. 确认子命令和输入目标
2. 分派到对应的 `/reverse-sdd`、`/reverse-bdd`、`/reverse-tdd`
3. 收集子命令结果
4. 展示结果摘要

**Decision: 子命令选择**
- IF `spec` → 分派到 `/reverse-sdd`
- IF `bdd` → 分派到 `/reverse-bdd`
- IF `tdd` → 分派到 `/reverse-tdd`
- IF 未指定 → 问用户选择

🛑 **STOP**: 结果展示后等待用户确认

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 逆向工程结果展示后 | 确认结果正确并写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 目标文件/目录不存在 | 告知并询问正确路径 |
| 子命令无效 | 列出可用子命令（spec/bdd/tdd） |
| 目标为空目录或空文件 | 告知无内容可分析 |

## References | 参考

*   [Reverse Engineering Skill](../reverse-engineer/SKILL.md)
*   [Core Standard](../../core/reverse-engineering-standards.md)
