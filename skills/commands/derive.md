---
name: derive
description: [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications.
argument-hint: "[all|bdd|tdd|atdd] <spec-file> [--lang <lang>] [--framework <fw>] [--output-dir <dir>]"
---

# Derive Test Structures | 推演測試結構

Generate derived artifacts (BDD scenarios, TDD skeletons, ATDD tables) from approved SDD specifications.

從已批准的 SDD 規格生成衍生工件（BDD 場景、TDD 骨架、ATDD 表格）。

## Usage | 用法

```bash
/derive [subcommand] <spec-file> [options]
```

### Subcommands | 子命令

| Subcommand | Description | Output |
|------------|-------------|--------|
| `all` | Generate BDD + TDD (Default) | `.feature` + `.test.*` |
| `bdd` | Generate BDD scenarios only | `.feature` |
| `tdd` | Generate TDD skeletons only | `.test.*` |
| `atdd` | Generate ATDD test tables | `.md` (Markdown tables) |

### Options | 選項

| Option | Description | Default |
|--------|-------------|---------|
| `--lang` | Target language (ts, python, etc.) | Detected or `ts` |
| `--framework` | Test framework (vitest, pytest, etc.) | Detected or `vitest` |
| `--output-dir` | Output directory | `./generated` |
| `--dry-run` | Preview output without writing | `false` |

## Workflow | 工作流程

1.  **Read Spec**: Analyze the input `SPEC-XXX.md` file.
2.  **Extract AC**: Parse all Acceptance Criteria.
3.  **Generate Artifacts**:
    *   **BDD**: Convert AC to Gherkin `Scenario` format.
    *   **TDD**: Create test file skeleton with `describe`/`it` blocks matching ACs.
    *   **ATDD**: Create a Markdown table with inputs/outputs/pass-fail columns.
4.  **Verify**: Ensure 1:1 mapping between ACs and generated items.

## Anti-Hallucination | 防幻覺

*   **1:1 Mapping**: Every AC must have exactly one corresponding test/scenario.
*   **Traceability**: All generated artifacts must reference the Source Spec ID and AC ID.
*   **No Invention**: Do not add scenarios not present in the spec.

## Examples | 範例

```bash
# Derive everything (BDD + TDD)
/derive all specs/SPEC-001.md

# Derive BDD scenarios only
/derive bdd specs/SPEC-001.md

# Derive TDD for Python
/derive tdd specs/SPEC-001.md --lang python --framework pytest

# Derive ATDD tables for manual testing
/derive atdd specs/SPEC-001.md
```

## References | 參考

*   [Forward Derivation Standard](../forward-derivation/SKILL.md)
*   [Core Standard](../../core/forward-derivation-standards.md)
