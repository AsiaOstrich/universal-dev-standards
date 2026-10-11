---
source: ../../../../skills/commands/derive-all.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: df78a557d100
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

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/derive-all` | 列出 status=Approved 的 spec 供选择 |
| `/derive-all <spec-file>` | 直接对指定 spec 执行完整推演 |

### 交互脚本

1. 读取并验证 spec（status = Approved）
2. 依序执行：`/derive-bdd` → `/derive-tdd` → 询问是否需要 `/derive-atdd`

**Decision: ATDD 推演**
- IF 用户要求 → 执行 `/derive-atdd`
- ELSE → 跳过 ATDD

🛑 **STOP**: BDD + TDD 推演完成后，询问是否需要 ATDD 推演

3. 生成 `DERIVATION-REPORT.md` 汇总所有输出
4. 展示报告摘要

🛑 **STOP**: 展示所有生成文件清单后等待用户确认写入

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 所有推演完成后 | 确认写入所有文件 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| Spec status ≠ Approved | 引导到 `/sdd approve` |
| 子命令推演失败 | 报告哪个推演失败，已成功的仍保留，询问是否继续 |

## 参考

- 父命令: [/derive](../spec-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
- 子命令: [/derive-bdd](./derive-bdd.md), [/derive-tdd](./derive-tdd.md), [/derive-atdd](./derive-atdd.md)
