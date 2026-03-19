---
source: ../../../../skills/commands/derive-all.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Derive all test structures (BDD, TDD, ATDD) from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[规格文件路径 | spec file path]"
---

# /derive-all — 完整正向推演

从已核准的 SDD 规格推演所有测试结构（BDD + TDD + 可选 ATDD）。

## 工作流程

```
SPEC-XXX.md ──► /derive-bdd ──► /derive-tdd ──► [/derive-atdd] ──► Report
```

1. **解析** SDD 规格并验证其已核准
2. **运行** `/derive-bdd` 生成 Gherkin 场景
3. **运行** `/derive-tdd` 生成测试骨架
4. **可选** 运行 `/derive-atdd` 生成验收测试表格
5. **生成** `DERIVATION-REPORT.md` 汇总所有输出

## 输出文件

| 文件 | 内容 |
|------|------|
| `features/SPEC-XXX.feature` | BDD Gherkin 场景 |
| `tests/SPEC-XXX.test.ts` | TDD 测试骨架 |
| `DERIVATION-REPORT.md` | 摘要与统计 |

## 使用方式

| 命令 | 用途 |
|------|------|
| `/derive-all specs/SPEC-001.md` | 从规格完整推演 |
| `/derive-all` | 互动式 — 询问规格文件 |

## 典型 SDD 工作流程

```bash
/sdd user-authentication          # Step 1: Create spec
/sdd review specs/SPEC-001.md     # Step 2: Review
/derive-all specs/SPEC-001.md     # Step 3: Derive tests
# Step 4: Implement — fill [TODO] markers
```

## 参考

- 父命令: [/derive](../forward-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
- 子命令: [/derive-bdd](./derive-bdd.md), [/derive-tdd](./derive-tdd.md), [/derive-atdd](./derive-atdd.md)
