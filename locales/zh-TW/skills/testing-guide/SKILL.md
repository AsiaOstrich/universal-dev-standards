---
source: ../../../../skills/testing-guide/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-06-02
source_hash: 49b6f9e0c6a4
status: current
name: testing
description: "[UDS] 測試金字塔與 UT/IT/ST/E2E 測試撰寫標準"
---

# 測試指南

> **語言**: [English](../../../../skills/testing-guide/SKILL.md) | 繁體中文

**版本**: 1.2.0
**最後更新**: 2026-01-29
**適用範圍**: Claude Code Skills

---

## 目的

本 Skill 提供測試金字塔標準和系統化測試的最佳實踐，同時支援 ISTQB 和業界通行金字塔框架。

## 測試技能導航 | Testing Skills Navigator

UDS 提供 6 個與測試相關的 Skill。請使用以下決策樹找到合適的工具：

```
你想做什麼？ | What do you want to do?
├── 測量程式碼覆蓋率（行/分支/函式）                  → /coverage
├── 追蹤哪些需求有測試（AC 可追蹤性）                → /ac-coverage
├── 以測試驅動開發進行開發（紅-綠-重構）             → /tdd
├── 撰寫 BDD 場景（Given-When-Then）               → /bdd
├── 與利害關係人定義驗收測試                         → /atdd
└── 學習測試標準與最佳實踐                           → /testing（本 Skill）
```

| Skill | 焦點 | Focus |
|-------|------|-------|
| `/testing` | 測試標準與最佳實踐參考 | Standards and best practices reference |
| `/coverage` | 程式碼層級覆蓋率分析 | Code-level coverage analysis |
| `/ac-coverage` | 需求層級 AC 可追蹤性 | Requirement-level AC traceability |
| `/tdd` | 紅-綠-重構開發循環 | Red-Green-Refactor development cycle |
| `/bdd` | Given-When-Then 行為場景 | Behavior scenarios with Given-When-Then |
| `/atdd` | 與利害關係人定義驗收條件 | Acceptance criteria with stakeholders |

## 框架選擇

| 框架 | 層級 | 適用場景 |
|-----------|--------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企業級、合規性、正式 QA |
| **業界通行金字塔** | UT (70%) → IT (20%) → E2E (10%) | 敏捷、DevOps、CI/CD |

**整合測試縮寫說明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用
- **SIT** (System Integration Testing)：企業/ISTQB 環境常用
- 兩者指的是相同的測試層級

## 快速參考

### 測試金字塔（業界標準）

```
              ┌─────────┐
              │   E2E   │  ← 10%（較少、較慢）
             ─┴─────────┴─
            ┌─────────────┐
            │   IT/SIT    │  ← 20%（整合測試）
           ─┴─────────────┴─
          ┌─────────────────┐
          │       UT        │  ← 70%（單元測試）
          └─────────────────┘
```

### 測試層級概覽

| 層級 | 範圍 | 速度 | 相依性 |
|-------|-------|-------|-------------|
| **UT** | 單一函式/類別 | < 100ms | Mock |
| **IT/SIT** | 元件互動 | 1-10秒 | 真實資料庫（容器化） |
| **ST** | 完整系統（ISTQB） | 分鐘級 | 類生產環境 |
| **E2E** | 使用者旅程 | 30秒+ | 所有真實環境 |
| **AT/UAT** | 業務驗證（ISTQB） | 視情況 | 所有真實環境 |

### 覆蓋率目標

| 指標 | 最低要求 | 建議值 |
|--------|---------|-------------|
| 行覆蓋率 | 70% | 85% |
| 分支覆蓋率 | 60% | 80% |
| 函式覆蓋率 | 80% | 90% |

## 詳細指南

完整標準請參考：
- [測試標準](../../core/testing-standards.md) - 可執行的規則
- [測試理論](./testing-theory.md) - 教學知識庫
- [測試金字塔](./testing-pyramid.md) - 詳細的金字塔比例
- [測試骨架範本](./test-skeleton-templates.md) - UT/IT/ST/Perf/Contract 的多語言骨架

### AI 優化格式（Token 高效）

供 AI 助理使用，請採用 YAML 格式檔案以減少 Token 使用量：
- 基礎標準：`ai/standards/testing.ai.yaml`
- 框架選項：
  - ISTQB 框架：`ai/options/testing/istqb-framework.ai.yaml`
  - 業界通行金字塔：`ai/options/testing/industry-pyramid.ai.yaml`
- 測試層級選項：
  - 單元測試：`ai/options/testing/unit-testing.ai.yaml`
  - 整合測試：`ai/options/testing/integration-testing.ai.yaml`
  - 系統測試：`ai/options/testing/system-testing.ai.yaml`
  - E2E 測試：`ai/options/testing/e2e-testing.ai.yaml`
  - 安全測試：`ai/options/testing/security-testing.ai.yaml`
  - 效能測試：`ai/options/testing/performance-testing.ai.yaml`
  - 合約測試：`ai/options/testing/contract-testing.ai.yaml`
- 骨架範本（所有層級、多語言）：[test-skeleton-templates.md](./test-skeleton-templates.md)

## 命名慣例

### 檔案命名

```
[ClassName]Tests.cs       # C#
[ClassName].test.ts       # TypeScript
[class_name]_test.py      # Python
[class_name]_test.go      # Go
```

### 方法命名

```
[MethodName]_[Scenario]_[ExpectedResult]()
should_[behavior]_when_[condition]()
test_[method]_[scenario]_[expected]()
```

## 測試替身

| 類型 | 用途 | 使用時機 |
|------|---------|-------------|
| **Stub** | 回傳預定義值 | 固定 API 回應 |
| **Mock** | 驗證互動 | 檢查方法是否被呼叫 |
| **Fake** | 簡化實作 | 記憶體資料庫 |
| **Spy** | 記錄呼叫、委派 | 部分 Mock |

### 何時使用

- **UT**: 對所有外部相依使用 mock/stub
- **IT**: 資料庫使用 fake，外部 API 使用 stub
- **ST**: 真實元件，僅對外部服務使用 fake
- **E2E**: 全部使用真實環境

## AAA 模式

```typescript
test('method_scenario_expected', () => {
    // Arrange - 設定測試資料
    const input = createTestInput();
    const sut = new SystemUnderTest();

    // Act - 執行行為
    const result = sut.execute(input);

    // Assert - 驗證結果
    expect(result).toBe(expected);
});
```

## FIRST 原則

- **F**ast（快速） - 測試執行快速
- **I**ndependent（獨立） - 測試之間不互相影響
- **R**epeatable（可重複） - 每次執行結果相同
- **S**elf-validating（自我驗證） - 明確的通過/失敗
- **T**imely（及時） - 與產品代碼一起撰寫

## 應避免的反模式

- ❌ 測試相依（測試必須按順序執行）
- ❌ 不穩定測試（有時通過、有時失敗）
- ❌ 測試實作細節
- ❌ 過度 Mock
- ❌ 缺少斷言
- ❌ 魔術數字/字串

---

## 測試理論精要（YAML 壓縮）

```yaml
# === ISTQB FUNDAMENTALS ===
terminology:
  error: "Human mistake in thinking"
  defect: "Bug in code (caused by error)"
  failure: "System behaves incorrectly (caused by defect)"
  chain: "Error → Defect → Failure"

oracle_problem:
  definition: "How do we know the expected result is correct?"
  approaches:
    - specification_oracle: "Compare against spec"
    - reference_oracle: "Compare against reference impl"
    - consistency_oracle: "Same input → same output"
    - heuristic_oracle: "Reasonable approximation"

# === STATIC vs DYNAMIC ===
static_testing:
  definition: "Examine without executing"
  techniques: [reviews, walkthroughs, inspections, static_analysis]
  finds: "Defects before runtime"
  examples: [ESLint, SonarQube, code_review]

dynamic_testing:
  definition: "Execute and observe behavior"
  techniques: [unit, integration, system, acceptance]
  finds: "Failures during execution"

# === TEST DESIGN TECHNIQUES ===
black_box:
  equivalence_partitioning:
    principle: "Divide inputs into equivalent classes"
    example: "Age: [<0 invalid], [0-17 minor], [18-64 adult], [65+ senior]"
  boundary_value:
    principle: "Test at boundaries of partitions"
    example: "Age: test -1, 0, 17, 18, 64, 65"
  decision_table:
    principle: "Combinations of conditions → actions"
    use: "Complex business rules"
  state_transition:
    principle: "Valid sequences of states"
    use: "Workflow, state machines"

white_box:
  statement_coverage: "Every statement executed once"
  branch_coverage: "Every decision branch taken"
  condition_coverage: "Every condition T/F"
  path_coverage: "Every possible path (often impractical)"

# === RISK-BASED TESTING ===
risk_assessment:
  likelihood: "How likely to fail?"
  impact: "How bad if fails?"
  priority: "likelihood × impact"

risk_matrix:
  high_high: "Test extensively, first priority"
  high_low: "Good coverage"
  low_high: "Good coverage"
  low_low: "Basic coverage"

# === DEFECT MANAGEMENT ===
defect_lifecycle:
  states: [new, assigned, in_progress, fixed, verified, closed]
  reopen_trigger: "Verification fails"

severity_vs_priority:
  severity: "Technical impact (critical/major/minor/trivial)"
  priority: "Business urgency (high/medium/low)"
  example: "Typo on login page: low severity, high priority (brand)"

# === TEST ENVIRONMENT ===
isolation_levels:
  unit: "In-memory, mocked deps"
  integration: "Containerized DB (Docker)"
  staging: "Production-like, isolated"
  production: "Real, feature flags for testing"

test_data_strategies:
  fixtures: "Static predefined data"
  factories: "Dynamic generation (faker)"
  snapshots: "Sanitized production copy"
  synthetic: "Algorithm-generated edge cases"
```

---

## 設定偵測

本 Skill 支援專案特定設定。

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 的「Disabled Skills」（停用 Skills）區段
   - 如果列出此 Skill，則為該專案停用
2. 檢查 `CONTRIBUTING.md` 的「Testing Standards」（測試標準）區段
3. 若未找到，**預設使用標準覆蓋率目標**

### 首次設定

若未找到設定且上下文不清楚時：

1. 詢問使用者：「此專案尚未設定測試標準。您想要自訂覆蓋率目標嗎？」
2. 使用者選擇後，建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## Testing Standards

### Coverage Targets
| Metric | Target |
|--------|--------|
| Line | 80% |
| Branch | 70% |
| Function | 85% |
```

### 設定範例

在專案的 `CONTRIBUTING.md` 中：

```markdown
## Testing Standards

### Coverage Targets
| Metric | Target |
|--------|--------|
| Line | 80% |
| Branch | 70% |
| Function | 85% |

### Testing Framework
- Unit Tests: Jest
- Integration Tests: Supertest
- E2E Tests: Playwright
```

---

## 下一步引導 | Next Steps Guidance

當 `/testing` 完成後，AI 助理應建議：

> **測試標準與最佳實踐已掌握。建議下一步 / Testing standards and best practices understood. Suggested next steps:**
> - 執行 `/tdd` 開始測試驅動開發（紅-綠-重構循環） ⭐ **Recommended / 推薦** — 將測試知識立即轉化為實踐 / Turn testing knowledge into practice immediately
> - 執行 `/coverage` 分析目前程式碼覆蓋率 — 找出測試缺口 / Identify testing gaps
> - 執行 `/bdd` 撰寫行為驅動的 Given-When-Then 場景 — 從使用者角度定義測試 / Define tests from user perspective

---

## 相關標準

- [測試標準](../../core/testing-standards.md) - 可執行的規則
- [測試理論](./testing-theory.md) - 教學知識庫
- [程式碼審查檢查清單](../../core/code-review-checklist.md)

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 1.2.0 | 2026-01-29 | 新增連結至新的 testing-theory.md 知識庫 |
| 1.1.0 | 2025-12-29 | 新增測試理論精要 YAML 區段 |
| 1.0.0 | 2025-12-24 | 初版：標準區段（目的、相關標準、版本歷史、授權） |

---

## 授權

本 Skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
