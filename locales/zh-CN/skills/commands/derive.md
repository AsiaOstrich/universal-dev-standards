---
source: ../../../../skills/commands/derive.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
name: derive
description: [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications.
argument-hint: "[all|bdd|tdd|atdd] <spec-file> [--lang <lang>] [--framework <fw>] [--output-dir <dir>]"
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
| `all` | 生成 BDD + TDD（默认） | `.feature` + `.test.*` |
| `bdd` | 仅生成 BDD 场景 | `.feature` |
| `tdd` | 仅生成 TDD 骨架 | `.test.*` |
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
# 推演所有产物（BDD + TDD）
/derive all specs/SPEC-001.md

# 仅推演 BDD 场景
/derive bdd specs/SPEC-001.md

# 为 Python 推演 TDD
/derive tdd specs/SPEC-001.md --lang python --framework pytest

# 推演 ATDD 表格供手动测试
/derive atdd specs/SPEC-001.md
```

## 参考

*   [正向推演规范](../forward-derivation/SKILL.md)
*   [核心规范](../../core/forward-derivation-standards.md)
