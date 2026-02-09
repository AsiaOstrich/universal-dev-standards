---
source: ../../../../skills/reverse-engineer/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-02-10
status: current
description: |
  将现有代码反向工程为规格文件、BDD 场景或 TDD 覆盖率报告。
  使用时机：从代码提取规格、生成 Gherkin 场景、分析测试覆盖率。
  关键字：reverse engineering, spec, bdd, tdd, 反向工程, 规格, 覆盖率。
---

# 反向工程助手

> **语言**: [English](../../../../skills/reverse-engineer/SKILL.md) | 简体中文

将现有代码反向工程为规格文件、BDD 场景或 TDD 覆盖率报告。

## 子命令

| 子命令 | 输入 | 输出 | 说明 |
|--------|------|------|------|
| `spec` | 代码文件/目录 | `SPEC-XXX.md` | 从代码提取规格 |
| `bdd` | `SPEC-XXX.md` | `.feature` | 将 AC 转为 Gherkin |
| `tdd` | `.feature` | 覆盖率报告 | 分析测试覆盖率 |

## 工作流程

### spec：代码转规格

1. **扫描** - 读取源代码文件，识别公开 API、数据流和业务逻辑
2. **分类** - 将每个发现标记为 `[Confirmed]`、`[Inferred]` 或 `[Unknown]`
3. **结构化** - 整理为 SDD 规格格式，包含验收条件
4. **引用来源** - 每个反向结果皆引用 `file:line` 来源参考

### bdd：规格转 Gherkin

1. **解析** - 读取 SPEC-XXX.md 并提取验收条件
2. **转换** - 将每个 AC 对应为一个 Gherkin Scenario（1:1 对应）
3. **标记** - 加入 `@SPEC-XXX` 和 `@AC-N` 标签以确保可追溯性
4. **输出** - 生成 `.feature` 文件，包含 `# [Source: path:AC-N]` 注释

### tdd：Feature 转覆盖率报告

1. **解析** - 读取 `.feature` 文件中的场景
2. **搜索** - 使用 Grep/Glob 寻找对应的测试文件
3. **对应** - 将场景与现有单元测试进行配对
4. **报告** - 输出覆盖率矩阵（已覆盖 / 缺失 / 部分覆盖）

## 防幻觉规则

| 规则 | 要求 |
|------|------|
| **确定性标签** | 所有发现须使用 `[Confirmed]`、`[Inferred]`、`[Unknown]` 标注 |
| **来源引用** | 每项反向结果须引用 `file:line` 来源 |
| **禁止捏造** | 不得捏造代码中不存在的 API 或行为 |

## 使用方式

- `/reverse spec src/auth/` - 从 auth 模块提取规格
- `/reverse bdd specs/SPEC-AUTH.md` - 将规格 AC 转为 Gherkin 场景
- `/reverse tdd features/auth.feature` - 分析 feature 文件的测试覆盖率

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[reverse-engineering-standards.md](../../../../core/reverse-engineering-standards.md)
