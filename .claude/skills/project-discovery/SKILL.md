---
name: discover
scope: universal
description: "[UDS] Assess project health, architecture, and risks before adding features"
allowed-tools: Read, Grep, Glob, Bash(npm test:*), Bash(npm audit:*), Bash(npm outdated:*)
argument-hint: "[feature area | 功能範圍]"
disable-model-invocation: true
---

# Project Discovery | 專案現況評估

Phase 0 assessment before adding features to existing codebases. Evaluate project health, architecture, and risks.

在既有程式碼庫新增功能前的 Phase 0 評估。評估專案健康度、架構與風險。

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

Recommendations:
1. [HIGH] Update lodash to fix CVE-2024-XXXX
2. [MED]  Add tests for src/payments/ (0% coverage)
3. [LOW]  Resolve TODO backlog in src/utils/
```

## Usage | 使用方式

- `/discover` - Full project health assessment
- `/discover auth` - Focused assessment of auth-related modules
- `/discover payments` - Assess risks before adding payment features

## Next Steps Guidance | 下一步引導

After `/discover` completes, the AI assistant should suggest based on the assessment:

> **根據評估結果，建議下一步 / Based on assessment, suggested next steps:**
> - **New feature / 新功能** → `/sdd` to create a specification
> - **Legacy code / 遺留程式碼** → `/reverse spec` to extract existing behavior
> - **Refactoring / 重構** → `/refactor decide` to choose a strategy
> - **Quick fix / 快速修復** → `/tdd` to write a targeted test and fix

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
