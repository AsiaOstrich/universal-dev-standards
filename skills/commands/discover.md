---
name: discover
description: "[UDS] Assess project health, architecture, and risks before adding features"
argument-hint: "[feature area | 功能範圍]"
---

# Project Discovery | 專案現況評估

Phase 0 assessment before adding features to existing codebases. Evaluate project health, architecture, and risks.

在既有程式碼庫新增功能前的 Phase 0 評估。評估專案健康度、架構與風險。

## Usage | 用法

```bash
/discover [feature area]
```

## Assessment Dimensions | 評估維度

| Dimension | What to Check | 檢查項目 |
|-----------|--------------|----------|
| **Architecture** | Module structure, dependency graph, entry points | 模組結構、相依圖、進入點 |
| **Dependencies** | Outdated packages, known vulnerabilities, license risks | 過時套件、已知漏洞、授權風險 |
| **Test Coverage** | Existing test suite, coverage gaps, test quality | 現有測試、覆蓋率缺口、測試品質 |
| **Security** | `npm audit` findings, hardcoded secrets, exposed endpoints | 安全稽核、硬編碼密鑰、暴露端點 |
| **Technical Debt** | TODOs, code duplication, complexity hotspots | TODO 標記、程式碼重複、複雜度熱點 |

## Workflow | 工作流程

1. **Scan project** - Read package.json, directory structure, config files
2. **Analyze architecture** - Map modules, dependencies, and data flow
3. **Check dependencies** - Run `npm outdated`, `npm audit` for health signals
4. **Assess risks** - Identify complexity hotspots, missing tests, security issues
5. **Generate report** - Output health score with actionable recommendations
6. **Decide next step** - GO / NO-GO / CONDITIONAL based on findings

## Examples | 範例

```bash
/discover                # Full project health assessment
/discover auth           # Focused assessment of auth-related modules
/discover payments       # Assess risks before adding payment features
```

## Output Format | 輸出格式

```
Project Health Report
=====================
Overall Score: 7.2 / 10

| Dimension       | Score | Status  | Key Finding            |
|-----------------|-------|---------|------------------------|
| Architecture    | 8/10  | Good    | Clean module boundaries |
| Dependencies    | 6/10  | Warning | 5 outdated, 1 critical |
| Test Coverage   | 7/10  | Fair    | 72% line coverage      |
| Security        | 8/10  | Good    | No critical vulns      |
| Technical Debt  | 6/10  | Warning | 23 TODOs, 3 hotspots   |

Verdict: CONDITIONAL
Recommendations:
1. [HIGH] Update lodash to fix CVE-2024-XXXX
2. [MED]  Add tests for src/payments/ (0% coverage)
3. [LOW]  Resolve TODO backlog in src/utils/
```

## Next Steps | 後續步驟

After discovery, the typical brownfield workflow is:

1. `/discover` - Assess project health (this command)
2. `/reverse spec` - Reverse engineer existing code to specs
3. `/sdd` - Write specification for new features
4. `/tdd` or `/bdd` - Implement with test protection

## References | 參考

*   [Project Discovery Skill](../project-discovery/SKILL.md)
*   [Reverse Engineering Standards](../../core/reverse-engineering-standards.md)
