---
source: ../../../../skills/commands/derive.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 2f9bbee08f05
status: current
---

---
name: derive
description: [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications.
argument-hint: "[all|bdd|tdd|it|e2e|atdd] <spec-file> [--lang <lang>] [--framework <fw>] [--output-dir <dir>]"
---

# 推演测试结构

从已批准的 SDD 规格生成衍生产物（BDD 场景、TDD 骨架、ATDD 表格）。

## 用法

```bash
/derive [subcommand] <spec-file> [options]
```

### 子命令

| Subcommand | Description | Output |
|------------|-------------|--------|
| `all` | 完整推演流水线（BDD + TDD + IT + E2E + ATDD + Contracts） | 所有格式 |
| `bdd` | 仅生成 BDD 场景 | `.feature` |
| `tdd` | 仅生成 TDD 骨架 | `.test.*` |
| `it` | 生成集成测试骨架 | `.it.test.*` |
| `e2e` | 生成 E2E 测试骨架 | `.e2e.test.*` |
| `atdd` | 生成 ATDD 测试表格 | `.md`（Markdown 表格） |

### 选项

| Option | Description | Default |
|--------|-------------|---------|
| `--lang` | 目标语言（ts, python 等） | 自动检测或 `ts` |
| `--framework` | 测试框架（vitest, pytest 等） | 自动检测或 `vitest` |
| `--output-dir` | 输出目录 | `./generated` |
| `--dry-run` | 预览输出而不写入文件 | `false` |

## 工作流程

1.  **读取规格**: 分析输入的 `SPEC-XXX.md` 文件。
2.  **提取 AC**: 解析所有验收标准。
3.  **生成产物**:
    *   **BDD**: 将 AC 转换为 Gherkin `Scenario` 格式。
    *   **TDD**: 创建包含 `describe`/`it` 区块的测试文件骨架，与 AC 对应。
    *   **ATDD**: 创建包含输入/输出/通过-失败列的 Markdown 表格。
4.  **验证**: 确保 AC 与生成项目之间为 1:1 映射。

## 防幻觉

*   **1:1 映射**: 每个 AC 必须恰好对应一个测试/场景。
*   **可追溯性**: 所有生成的产物必须引用来源规格 ID 和 AC ID。
*   **禁止捏造**: 不得添加规格中不存在的场景。

## 范例

```bash
# 完整推演流水线（BDD + TDD + IT + E2E + ATDD + Contracts）
/derive all specs/SPEC-001.md

# 仅推演 BDD 场景
/derive bdd specs/SPEC-001.md

# 为 Python 推演 TDD
/derive tdd specs/SPEC-001.md --lang python --framework pytest

# 推演集成测试骨架
/derive it specs/SPEC-001.md

# 推演 E2E 测试骨架
/derive e2e specs/SPEC-001.md

# 推演 ATDD 表格供手动测试
/derive atdd specs/SPEC-001.md
```

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/derive` | 列出 `docs/specs/` 中 status=Approved 的 spec，问用户选择 spec 和子命令 |
| `/derive <subcommand> <spec-file>` | 直接对指定 spec 执行指定子命令 |
| `/derive <subcommand>` | 执行指定子命令，列出可用 spec 供选择 |
| `/derive <spec-file>` | 对指定 spec 执行 `all`（默认子命令） |

### 交互脚本

1. 读取 spec 文件，验证 status = Approved
2. 提取所有 AC，确认使用 GWT 格式

**Decision: AC 格式**
- IF AC 使用 GWT 格式 → 直接推演
- IF AC 不是 GWT 格式 → 尝试转换，标记 `[Derived]`，展示转换结果
- IF AC 无法转换 → 🛑 STOP，请用户先修改 spec 中的 AC 格式

🛑 **STOP**: AC 格式转换后展示结果，等待用户确认转换正确再继续

3. 依子命令分派到 `/derive-bdd`、`/derive-tdd`、`/derive-it`、`/derive-e2e`、`/derive-atdd`
4. 验证 1:1 对应（每个 AC 恰好一个测试/场景）
5. 展示推演摘要

🛑 **STOP**: 展示生成的测试产物后等待用户确认写入

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| AC 格式转换后 | 确认转换结果 |
| 测试产物生成后 | 确认写入文件 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| Spec status ≠ Approved | 告知当前 status，引导到 `/sdd approve` |
| Spec 文件不存在 | 列出可用 spec，或引导到 `/sdd create` |
| AC 数量为 0 | 告知 spec 无 AC，引导修改 spec |
| 1:1 对应验证失败 | 列出不对应项目，停止并报告 |

## 参考

*   [正向推演规范](../spec-derivation/SKILL.md)
*   [核心规范](../../core/forward-derivation-standards.md)
