---
name: derive
scope: partial
description: "[UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[all|bdd|tdd|it|e2e|atdd] <spec-file>"
prerequisites: ["spec-approved"]
disable-model-invocation: true
---

# Forward Derivation | 正向推演

Generate derived artifacts (BDD scenarios, TDD skeletons, ATDD tables) from approved SDD specifications.

從已批准的 SDD 規格生成衍生工件（BDD 場景、TDD 骨架、ATDD 表格）。

## Subcommands | 子命令

| Subcommand | Description | Output |
|------------|-------------|--------|
| `all` | Full derivation pipeline (BDD + TDD + IT + E2E + ATDD + Contracts) | `.feature` + `.test.*` + `.it.test.*` + `.e2e.test.*` + `.md` + `.json` |
| `bdd` | Generate BDD scenarios only | `.feature` |
| `tdd` | Generate TDD skeletons only | `.test.*` |
| `it` | Generate Integration test skeletons | `.it.test.*` |
| `e2e` | Generate E2E test skeletons | `.e2e.test.*` |
| `atdd` | Generate ATDD test tables | `.md` (Markdown tables) |

## Workflow | 工作流程

1. **Read Spec** - Analyze the input `SPEC-XXX.md` file | 分析規格檔案
2. **Extract AC** - Parse all Acceptance Criteria | 解析所有驗收條件
3. **Generate Artifacts** - Create BDD/TDD/ATDD outputs | 產生衍生工件
4. **Verify** - Ensure 1:1 mapping between AC and generated items | 驗證一對一對應

## Anti-Hallucination Rules | 防幻覺規則

| Rule | Description | 說明 |
|------|-------------|------|
| **1:1 Mapping** | Every AC has exactly one test/scenario | 每個 AC 對應一個測試 |
| **Traceability** | All artifacts reference Spec ID and AC ID | 所有工件引用規格與 AC 編號 |
| **No Invention** | Do not add scenarios not in the spec | 不新增規格外的場景 |

## Generated Artifact Tags | 產生工件標籤

| Tag | Meaning | 含義 |
|-----|---------|------|
| `[Source]` | Direct content from spec | 直接來自規格 |
| `[Derived]` | Transformed from source | 從來源轉換 |
| `[Generated]` | AI-generated structure | AI 產生的結構 |
| `[TODO]` | Requires human implementation | 需人工實作 |

## Usage | 使用方式

```
/derive all specs/SPEC-001.md           - Full derivation pipeline | 完整推演管線
/derive bdd specs/SPEC-001.md           - Derive BDD scenarios only | 僅推演 BDD 場景
/derive tdd specs/SPEC-001.md           - Derive TDD skeletons only | 僅推演 TDD 骨架
/derive it specs/SPEC-001.md            - Derive Integration test skeletons | 推演整合測試骨架
/derive e2e specs/SPEC-001.md           - Derive E2E test skeletons | 推演 E2E 測試骨架
/derive atdd specs/SPEC-001.md          - Derive ATDD tables | 推演 ATDD 表格
```

## Next Steps Guidance | 下一步引導

After `/derive` completes, the AI assistant should suggest:

> **測試工件已產生。建議下一步 / Test artifacts generated. Suggested next steps:**
> - 執行 `/tdd` 開始紅綠重構循環 ⭐ **Recommended / 推薦** — Start Red-Green-Refactor cycle
> - 執行 `/bdd` 細化 Gherkin 場景 — Refine Gherkin scenarios
> - 檢查產生的 `[TODO]` 標記並補齊實作 — Review `[TODO]` markers and fill in implementations

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/derive`](../commands/derive.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/derive`](../commands/derive.md#ai-agent-behavior--ai-代理行為)
