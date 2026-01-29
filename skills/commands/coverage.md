---
description: [UDS] Analyze test coverage and provide recommendations
allowed-tools: Read, Grep, Glob, Bash(npm run test:coverage:*), Bash(npx:*)
argument-hint: "[file or module to analyze | 要分析的檔案或模組]"
---

# Test Coverage Assistant | 測試覆蓋率助手

Analyze test coverage across multiple dimensions and provide actionable recommendations.

多維度分析測試覆蓋率並提供可執行的建議。

## Coverage Dimensions | 覆蓋率維度

| Dimension | What it Measures | 測量內容 |
|-----------|------------------|----------|
| **Line** | Lines executed | 執行的行數 |
| **Branch** | Decision paths | 決策路徑 |
| **Function** | Functions called | 呼叫的函數 |
| **Statement** | Statements executed | 執行的陳述式 |

## 8-Dimension Framework | 八維度框架

1. **Code Coverage** - Lines, branches, functions
2. **Requirement Coverage** - All requirements tested
3. **Risk Coverage** - High-risk areas tested
4. **Integration Coverage** - Component interactions
5. **Edge Case Coverage** - Boundary conditions
6. **Error Coverage** - Error handling paths
7. **Permission Coverage** - Access control scenarios
8. **AI Generation Quality** - AI-generated test effectiveness

## Workflow | 工作流程

1. **Run coverage tool** - Generate coverage report
2. **Analyze gaps** - Identify untested areas
3. **Prioritize** - Rank by risk and importance
4. **Recommend tests** - Suggest specific tests to add
5. **Track progress** - Monitor coverage over time

## Coverage Targets | 覆蓋率目標

| Level | Coverage | Use Case |
|-------|----------|----------|
| Minimum | 60% | Legacy code |
| Standard | 80% | Most projects |
| High | 90% | Critical systems |
| Critical | 95%+ | Safety-critical |

## Usage | 使用方式

- `/coverage` - Run full coverage analysis
- `/coverage src/auth` - Analyze specific module
- `/coverage --recommend` - Get test recommendations

## Reference | 參考

- Full standard: [test-coverage-assistant](../test-coverage-assistant/SKILL.md)
- Core guide: [testing-standards](../../core/testing-standards.md)
