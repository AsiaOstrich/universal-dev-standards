---
name: metrics
scope: universal
description: "[UDS] Track development metrics, code quality indicators, and project health"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:log)
argument-hint: "[metric type or module | 指標類型或模組]"
---

# Metrics Dashboard Assistant | 開發指標助手

Track development metrics, code quality indicators, and project health over time.

追蹤開發指標、程式碼品質指示器，以及專案隨時間的健康狀態。

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/metrics` | Run full project health check | 執行完整專案健康檢查 |
| `/metrics --quality` | Code quality metrics only | 僅程式碼品質指標 |
| `/metrics --debt` | Classified technical debt report | 分類技術債報告 |
| `/metrics --debt-trend` | Debt trend over time | 技術債趨勢 |
| `/metrics --test` | Test health metrics | 測試健康指標 |
| `/metrics src/` | Scope to specific module | 限定特定模組範圍 |

## Metric Categories | 指標類別

| Category | Metrics | 指標說明 |
|----------|---------|----------|
| **Code Quality** | Complexity, duplication, lint warnings | 複雜度、重複率、lint 警告 |
| **Test Health** | Coverage %, pass rate, flaky count | 覆蓋率 %、通過率、不穩定測試數 |
| **Commit Quality** | Size, frequency, conventional format | 大小、頻率、格式合規 |
| **Debt Tracking** | TODO/FIXME counts, age of issues, debt classification | TODO/FIXME 數量、問題存在時間、債務分類 |
| **Dependency Health** | Outdated packages, vulnerability count | 過時套件、漏洞數量 |

## Technical Debt Classification | 技術債分類

Based on SQALE methodology and ISO/IEC 25010 maintainability characteristics.

基於 SQALE 方法和 ISO/IEC 25010 維護性子特性。

| Category | What to Measure | 衡量項目 | Detection Method |
|----------|----------------|----------|-----------------|
| **Code Debt** | TODO/FIXME, dead code, duplications | TODO/FIXME、死碼、重複 | Grep, lint |
| **Test Debt** | Uncovered modules, low coverage areas | 未覆蓋模組、低覆蓋區域 | Coverage report |
| **Design Debt** | Complexity hotspots (cyclomatic > 15), deep nesting | 複雜度熱點、深層巢狀 | Static analysis |
| **Doc Debt** | Undocumented APIs, outdated docs | 未文件化 API、過時文件 | JSDoc/TypeDoc scan |
| **Dependency Debt** | Outdated packages, known CVEs | 過時套件、已知 CVE | npm audit/outdated |

### Debt Report Format | 債務報告格式

```markdown
## Technical Debt Report

**Date**: YYYY-MM-DD | **Debt Density**: N items per 1K lines

### Summary
| Category | Count | Severity | Est. Fix Time | Trend |
|----------|-------|----------|---------------|-------|
| Code Debt | 42 | Medium | 21h | ↑ +5 |
| Test Debt | 15 modules | High | 30h | → stable |
| Design Debt | 3 hotspots | High | 16h | ↓ -1 |
| Doc Debt | 8 APIs | Low | 8h | ↑ +2 |
| Dependency Debt | 5 outdated | Critical | 4h | → stable |

**Total Estimated Remediation**: 79 hours

### Top Priority Items
1. [CRITICAL] CVE-2024-XXXX in lodash — fix: npm update
2. [HIGH] src/parser/ complexity 28 — fix: extract methods
3. [HIGH] src/payments/ 0% coverage — fix: add IT tests
```

### Trend Tracking | 趨勢追蹤

Use `--debt-trend` to compare against previous snapshots.

使用 `--debt-trend` 與過去的快照比較。

```
User: /metrics --debt-trend
AI: Technical Debt Trend (last 3 months):

    Code Debt:   ████████░░ 42 (+5)  ↑ increasing
    Test Debt:   ██████░░░░ 15 (0)   → stable
    Design Debt: ███░░░░░░░  3 (-1)  ↓ improving
    Doc Debt:    ████░░░░░░  8 (+2)  ↑ increasing
    Dep Debt:    ██░░░░░░░░  5 (0)   → stable

    Overall: 73 items (was 67) — ⚠️ debt increasing
```

## Quick Health Score | 快速健康分數

The health score is a weighted composite:

健康分數為加權組合：

| Factor | Weight | Ideal | 理想值 |
|--------|--------|-------|--------|
| Test coverage | 30% | >= 80% | >= 80% |
| Lint pass rate | 20% | 100% | 100% |
| TODO/FIXME density | 15% | < 1 per 1K lines | < 每千行 1 個 |
| Build success | 20% | 100% | 100% |
| Dependency freshness | 15% | < 3 months | < 3 個月 |

**Score = sum(factor_score * weight)**

## Workflow | 工作流程

1. **COLLECT** - Gather raw metrics from tools and git history
2. **ANALYZE** - Compare against thresholds and historical trends
3. **REPORT** - Generate summary with actionable highlights
4. **TREND** - Show direction (improving / declining / stable)

---

1. **收集** - 從工具與 git 歷史收集原始指標
2. **分析** - 與閾值及歷史趨勢比較
3. **報告** - 產生含可行動重點的摘要
4. **趨勢** - 顯示方向（改善 / 衰退 / 穩定）

## Usage Examples | 使用範例

```
User: /metrics
AI: Analyzing project health...
    Code Quality:  B+ (complexity avg 8.2, 0 lint errors)
    Test Health:   A  (coverage 87%, 0 flaky tests)
    Debt Tracking: C  (42 TODOs, 3 FIXMEs)
    Overall Score: 78/100 (Good)
```

```
User: /metrics --debt
AI: Technical Debt Summary:
    TODO:  42 (12 in src/legacy/, 8 in src/utils/)
    FIXME: 3  (all in src/parser/)
    Oldest: 6 months (src/legacy/auth.js:45)
    Trend:  +5 since last month (increasing)
```

## Next Steps Guidance | 下一步引導

After `/metrics` completes, the AI assistant should suggest:

> **指標分析完成。建議下一步 / Metrics analysis complete. Suggested next steps:**
> - 執行 `/refactor` 處理高複雜度模組 ⭐ **Recommended / 推薦** — Address high-complexity modules
> - 執行 `/coverage` 改善低覆蓋率區域 — Improve low-coverage areas
> - 執行 `/audit` 檢視安全與依賴問題 — Review security & dependency issues
> - 執行 `/metrics --debt-trend` 追蹤技術債趨勢 — Track debt trend over time
> - 執行 `/retrospective` 在回顧中討論技術債 — Discuss tech debt in retrospective

## Version History | 版本歷史

| Version | Date | Changes | 變更 |
|---------|------|---------|------|
| 1.1.0 | 2026-03-26 | Add tech debt classification, SQALE quantification, trend tracking | 新增技術債分類、SQALE 量化、趨勢追蹤 |
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/metrics`](../commands/metrics.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/metrics`](../commands/metrics.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0
