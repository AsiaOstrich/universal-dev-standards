---
description: "[UDS] Generate AC-to-test traceability matrix and coverage report"
allowed-tools: Read, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# AC Coverage | AC 覆蓋率

Generate an Acceptance Criteria (AC) to test traceability matrix and coverage report from a specification file.

從規格檔案產生驗收條件（AC）與測試的追蹤矩陣及覆蓋率報告。

## Usage | 用法

```bash
/ac-coverage specs/SPEC-001.md            # Analyze specific SPEC
/ac-coverage specs/SPEC-001.md --threshold 90   # Custom threshold
/ac-coverage specs/SPEC-001.md --test-dir tests/ # Specify test directory
```

## Workflow | 工作流程

1. **Parse SPEC** — Read the specification file and extract all AC definitions (AC-1, AC-2, ...)
2. **Scan tests** — Search test files for `@AC` and `@SPEC` annotations
3. **Build matrix** — Map each AC to its corresponding test references
4. **Classify status** — ✅ covered | ⚠️ partial | ❌ uncovered
5. **Calculate coverage** — `Coverage % = (covered + partial × 0.5) / total × 100`
6. **Generate report** — Output standardized Markdown report

## How This Differs from `/coverage` | 與 `/coverage` 的區別

| | `/coverage` | `/ac-coverage` |
|-|-------------|----------------|
| **Level** | Code (line/branch/function) | Requirements (AC-to-test) |
| **Question** | "How much code is tested?" | "Which AC have tests?" |
| **Input** | Source code + test runner | SPEC file + test annotations |

Both are complementary — use `/coverage` for code quality, `/ac-coverage` for requirement verification.

兩者互補 — 使用 `/coverage` 確保程式碼品質，使用 `/ac-coverage` 確保需求驗證。

## Quality Thresholds | 品質門檻

| Context | Default Threshold | Configurable |
|---------|-------------------|--------------|
| **Check-in** | 80% | `--threshold N` |
| **Release** | 100% | `--threshold N` |
| **Warning** | 60% | `--threshold N` |

## Output Format | 輸出格式

```markdown
# AC Coverage Report

**Specification**: SPEC-001 — Feature Name
**Generated**: 2026-03-18
**Coverage**: 75% (6/8 AC)

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Covered | 5 | 62.5% |
| ⚠️ Partial | 2 | 25.0% |
| ❌ Uncovered | 1 | 12.5% |

## Traceability Matrix

| AC-ID | Description | Status | Test Reference |
|-------|-------------|--------|----------------|
| AC-1 | ... | ✅ | test-file.ts:15 |

## Gaps
- **AC-8**: Blocked by external dependency

## Action Items
1. [ ] AC-8: Resolve blocker
```

## Next Steps Guidance | 下一步引導

After `/ac-coverage` completes, the AI assistant should suggest:

> **AC 覆蓋率分析完成。建議下一步 / AC coverage analysis complete. Suggested next steps:**
> - 覆蓋率達標 → 執行 `/checkin` 品質關卡 — Coverage meets threshold → Run `/checkin` quality gates
> - 有未覆蓋 AC → 執行 `/derive-tdd` 補齊測試 — Uncovered AC found → Run `/derive-tdd` to add tests
> - 有部分覆蓋 AC → 檢查缺少的邊界情況 — Partial AC → Review missing edge cases

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/ac-coverage` | 列出可用的 spec 檔案供選擇 |
| `/ac-coverage <spec-file>` | 直接分析指定 spec 的 AC 覆蓋率 |
| `/ac-coverage <spec-file> --threshold N` | 使用自訂門檻 |

### Interaction Script | 互動腳本

1. 讀取 spec 檔案，擷取所有 AC
2. 掃描測試檔案中的 `@AC` 和 `@SPEC` 註解
3. 建立 AC → Test 追蹤矩陣
4. 計算覆蓋率
5. 生成報告

**Decision: 覆蓋率結果**
- IF 覆蓋率 ≥ 門檻 → 標記 ✅，建議 `/checkin`
- IF 有未覆蓋 AC → 列出並建議 `/derive-tdd` 補測試
- IF 有部分覆蓋 AC → 建議檢查缺少的邊界情況

🛑 **STOP**: 報告展示後等待使用者決定下一步

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 報告展示後 | 使用者決定補測試或繼續 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| Spec 檔案不存在 | 列出可用的 spec 檔案 |
| Spec 無 AC 定義 | 告知並引導修改 spec |
| 測試檔案無 `@AC` 註解 | 嘗試以命名慣例匹配，標記 `[Inferred]` |

## References | 參考

- [AC Coverage Assistant Skill](../ac-coverage-assistant/SKILL.md)
- [Core Standard: Acceptance Criteria Traceability](../../core/acceptance-criteria-traceability.md)
- Related: [/coverage](./coverage.md) (code-level coverage)
- Related: [/checkin](./checkin.md) (quality gates)
