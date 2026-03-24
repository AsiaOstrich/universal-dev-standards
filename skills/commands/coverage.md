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

## AC Coverage (Requirement-Level) | AC 覆蓋率（需求層級）

This command (`/coverage`) analyzes **code-level** coverage (line/branch/function). For **requirement-level** coverage — tracking which Acceptance Criteria have corresponding tests — use [`/ac-coverage`](./ac-coverage.md).

本命令（`/coverage`）分析**程式碼層級**覆蓋率。若需**需求層級**覆蓋率 — 追蹤哪些 AC 有對應測試 — 請使用 [`/ac-coverage`](./ac-coverage.md)。

| | `/coverage` | `/ac-coverage` |
|-|-------------|----------------|
| **Level** | Code (line/branch/function) | Requirements (AC-to-test) |
| **Question** | "How much code is tested?" | "Which AC have tests?" |

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/coverage` | 偵測測試框架，執行全專案覆蓋率分析 |
| `/coverage <path>` | 僅分析指定模組/路徑 |
| `/coverage --recommend` | 分析後重點輸出測試建議 |

### Interaction Script | 互動腳本

1. 偵測專案測試框架和覆蓋率工具
2. 執行覆蓋率報告
3. 解析結果，識別低覆蓋率區域
4. 依風險和重要性排序
5. 提出具體測試建議

**Decision: 覆蓋率結果**
- IF 覆蓋率 ≥ 目標 → 展示摘要，標記 ✅
- IF 覆蓋率 < 目標但 ≥ 60% → 展示差距，建議優先補測試的區域
- IF 覆蓋率 < 60% → 警告，建議系統性補強計畫

🛑 **STOP**: 報告展示後等待使用者決定是否補寫測試

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 覆蓋率報告展示後 | 使用者決定是否補測試 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無測試框架 | 詢問使用者選擇框架 |
| 覆蓋率工具執行失敗 | 報告錯誤，建議手動檢查配置 |
| 指定路徑不存在 | 列出可用路徑 |

## Reference | 參考

- Full standard: [test-coverage-assistant](../test-coverage-assistant/SKILL.md)
- Core guide: [testing-standards](../../core/testing-standards.md)
- AC coverage: [/ac-coverage](./ac-coverage.md) — requirement-level traceability
