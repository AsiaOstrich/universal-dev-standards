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
| `/metrics --debt` | Technical debt summary | 技術債摘要 |
| `/metrics --test` | Test health metrics | 測試健康指標 |
| `/metrics src/` | Scope to specific module | 限定特定模組範圍 |

## Metric Categories | 指標類別

| Category | Metrics | 指標說明 |
|----------|---------|----------|
| **Code Quality** | Complexity, duplication, lint warnings | 複雜度、重複率、lint 警告 |
| **Test Health** | Coverage %, pass rate, flaky count | 覆蓋率 %、通過率、不穩定測試數 |
| **Commit Quality** | Size, frequency, conventional format | 大小、頻率、格式合規 |
| **Debt Tracking** | TODO/FIXME counts, age of issues | TODO/FIXME 數量、問題存在時間 |
| **Dependency Health** | Outdated packages, vulnerability count | 過時套件、漏洞數量 |

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
> - 執行 `/refactor` 處理高複雜度模組 — Address high-complexity modules
> - 執行 `/coverage` 改善低覆蓋率區域 — Improve low-coverage areas
> - 執行 `/audit` 檢視安全與依賴問題 — Review security & dependency issues

## Version History | 版本歷史

| Version | Date | Changes | 變更 |
|---------|------|---------|------|
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |

## License | 授權

CC BY 4.0
