---
name: spec-derive
source: ../../../../skills/spec-derivation/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-08-17
source_hash: 3f875cea1cad
status: current
scope: partial
description: |
  [UDS] 从已批准的规格推导出 BDD 场景、TDD 骨架、集成与 E2E 测试，以及 ATDD 表格。
  Use when: 规格已批准且需要产出测试产物、从验收条件生成带标签的测试骨架、从规格生成契约桩。
  Not for: 从既有代码回推规格——请用 /reverse；撰写或审查规格本身——请用 /sdd。
  Keywords: forward derivation, spec to test, BDD scenario, TDD skeleton, ATDD table, 正向推演, 规格衍生, 测试生成, 契约桩.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[all|bdd|tdd|it|e2e|atdd] <spec-file>"
prerequisites: ["spec-approved"]
disable-model-invocation: true
---

# 正向推演

> **语言**: [English](../../../../skills/spec-derivation/SKILL.md) | 简体中文

从已批准的 SDD 规格生成衍生工件（BDD 场景、TDD 骨架、ATDD 表格）。

## 子命令

| 子命令 | 说明 | 输出 |
|--------|------|------|
| `all` | 完整推演管线（BDD + TDD + IT + E2E + ATDD + Contracts） | `.feature` + `.test.*` + `.it.test.*` + `.e2e.test.*` + `.md` + `.json` |
| `bdd` | 仅生成 BDD 场景 | `.feature` |
| `tdd` | 仅生成 TDD 骨架 | `.test.*` |
| `it` | 生成集成测试骨架 | `.it.test.*` |
| `e2e` | 生成 E2E 测试骨架 | `.e2e.test.*` |
| `atdd` | 生成 ATDD 测试表格 | `.md`（Markdown 表格） |

## 工作流程

1. **读取 Spec** — 分析输入的 `SPEC-XXX.md` 文件
2. **抽取 AC** — 解析所有验收条件
3. **生成工件** — 创建 BDD / TDD / ATDD 输出
4. **验证** — 确认 AC 与生成项目为一对一对应

## 防幻觉规则

| 规则 | 说明 |
|------|------|
| **1:1 对应** | 每个 AC 对应一个测试 / 场景 |
| **可追溯性** | 所有工件都引用 Spec ID 与 AC ID |
| **不发明** | 不新增规格外的场景 |

## 产生工件标签

| 标签 | 含义 |
|------|------|
| `[Source]` | 直接来自规格的内容 |
| `[Derived]` | 从来源转换而来 |
| `[Generated]` | AI 生成的结构 |
| `[TODO]` | 需人工实现 |

## 使用方式

```
/derive all specs/SPEC-001.md           - 完整推演管线
/derive bdd specs/SPEC-001.md           - 仅推演 BDD 场景
/derive tdd specs/SPEC-001.md           - 仅推演 TDD 骨架
/derive it specs/SPEC-001.md            - 推演集成测试骨架
/derive e2e specs/SPEC-001.md           - 推演 E2E 测试骨架
/derive atdd specs/SPEC-001.md          - 推演 ATDD 表格
```

## 下一步引导

`/derive` 完成后，AI 助手应建议：

> **测试工件已生成。建议下一步：**
> - 执行 `/tdd` 开始红绿重构循环 ⭐ **推荐**
> - 执行 `/bdd` 细化 Gherkin 场景
> - 检查生成的 `[TODO]` 标记并补齐实现

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心标准：[forward-derivation-standards.md](../../../../core/forward-derivation-standards.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/derive`](../../../../skills/commands/derive.md#ai-agent-behavior--ai-代理行為)
