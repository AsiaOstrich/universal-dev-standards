---
source: ../../../../skills/forward-derivation/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-02-10
status: current
description: |
  从已批准的 SDD 规格生成衍生工件（BDD 场景、TDD 骨架、ATDD 表格）。
  使用时机：从规格推导测试、生成 BDD/TDD/ATDD 工件。
  关键字：derive, forward, BDD, TDD, ATDD, spec, 推演, 衍生, 规格, 场景。
---

# 正向推演

> **语言**: [English](../../../../skills/forward-derivation/SKILL.md) | 简体中文

从已批准的 SDD 规格生成衍生工件（BDD 场景、TDD 骨架、ATDD 表格）。

## 子命令

| 子命令 | 说明 | 输出 | Output |
|--------|------|------|--------|
| `all` | 生成 BDD + TDD（默认） | `.feature` + `.test.*` | `.feature` + `.test.*` |
| `bdd` | 仅生成 BDD 场景 | `.feature` | `.feature` |
| `tdd` | 仅生成 TDD 骨架 | `.test.*` | `.test.*` |
| `atdd` | 生成 ATDD 测试表格 | `.md`（Markdown 表格） | `.md` (Markdown tables) |

## 工作流程

1. **读取规格** - 分析输入的 `SPEC-XXX.md` 文件
2. **提取 AC** - 解析所有验收条件
3. **生成工件** - 建立 BDD/TDD/ATDD 输出
4. **验证** - 确保 AC 与生成项目之间的 1:1 对应

## 防幻觉规则

| 规则 | 说明 | Rule | Description |
|------|------|------|-------------|
| **1:1 对应** | 每个 AC 对应一个测试/场景 | 1:1 Mapping | Every AC has exactly one test/scenario |
| **可追溯性** | 所有工件引用规格与 AC 编号 | Traceability | All artifacts reference Spec ID and AC ID |
| **禁止捏造** | 不新增规格外的场景 | No Invention | Do not add scenarios not in the spec |

## 生成工件标签

| 标签 | 含义 | Tag | Meaning |
|------|------|-----|---------|
| `[Source]` | 直接来自规格 | Source | Direct content from spec |
| `[Derived]` | 从来源转换 | Derived | Transformed from source |
| `[Generated]` | AI 生成的结构 | Generated | AI-generated structure |
| `[TODO]` | 需人工实现 | TODO | Requires human implementation |

## 使用方式

- `/derive all specs/SPEC-001.md` - 推演 BDD + TDD
- `/derive bdd specs/SPEC-001.md` - 仅推演 BDD 场景
- `/derive tdd specs/SPEC-001.md` - 仅推演 TDD 骨架
- `/derive atdd specs/SPEC-001.md` - 推演 ATDD 表格

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[forward-derivation-standards.md](../../../../core/forward-derivation-standards.md)
