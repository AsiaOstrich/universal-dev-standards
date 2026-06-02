---
source: ../../../../skills/testing-guide/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-06-02
source_hash: 49b6f9e0c6a4
status: current
name: testing
description: |
  面向 UT/IT/ST/E2E 的测试金字塔与测试编写标准。
  支持 ISTQB 与业界通行金字塔两种框架。
  使用时机：编写测试、讨论测试覆盖率、测试策略或测试命名时。
  关键词：test, unit, integration, e2e, coverage, mock, ISTQB, SIT, 测试, 单元, 集成, 端对端。
---

# 测试指南

> **语言**: [English](../../../../skills/testing-guide/SKILL.md) | 简体中文

**版本**: 1.2.0
**最后更新**: 2026-01-29
**适用范围**: Claude Code Skills

---

## 目的

本 Skill 提供测试金字塔标准和系统化测试的最佳实践，同时支持 ISTQB 与业界通行金字塔两种框架。

## 测试技能导航 | Testing Skills Navigator

UDS 提供 6 个与测试相关的 Skill。使用以下决策树找到合适的那一个：

```
你想做什么？ | What do you want to do?
├── 测量代码覆盖率（行/分支/函数）             → /coverage
├── 追踪哪些需求已有测试（AC 可追溯性）         → /ac-coverage
├── 以测试驱动开发进行（红-绿-重构）           → /tdd
├── 编写 BDD 场景（Given-When-Then）           → /bdd
├── 与利益相关者定义验收测试                   → /atdd
└── 学习测试标准与最佳实践                     → /testing（本 Skill）
```

| Skill | 焦点 | Focus |
|-------|------|-------|
| `/testing` | 测试标准与最佳实践参考 | Standards and best practices reference |
| `/coverage` | 代码层级覆盖率分析 | Code-level coverage analysis |
| `/ac-coverage` | 需求层级 AC 可追溯性 | Requirement-level AC traceability |
| `/tdd` | 红-绿-重构开发循环 | Red-Green-Refactor development cycle |
| `/bdd` | Given-When-Then 行为场景 | Behavior scenarios with Given-When-Then |
| `/atdd` | 与利益相关者定义验收条件 | Acceptance criteria with stakeholders |

## 框架选择

| 框架 | 层级 | 适用场景 |
|-----------|--------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企业级、合规性、正式 QA |
| **业界通行金字塔** | UT (70%) → IT (20%) → E2E (10%) | 敏捷、DevOps、CI/CD |

**集成测试缩写说明：**
- **IT** (Integration Testing)：敏捷/DevOps 社区常用
- **SIT** (System Integration Testing)：企业/ISTQB 环境常用
- 两者指的是相同的测试层级

## 快速参考

### 测试金字塔（业界标准）

```
              ┌─────────┐
              │   E2E   │  ← 10%（较少、较慢）
             ─┴─────────┴─
            ┌─────────────┐
            │   IT/SIT    │  ← 20%（集成测试）
           ─┴─────────────┴─
          ┌─────────────────┐
          │       UT        │  ← 70%（单元测试）
          └─────────────────┘
```

### 测试层级概览

| 层级 | 范围 | 速度 | 依赖 |
|-------|-------|-------|-------------|
| **UT** | 单一函数/类 | < 100ms | Mock |
| **IT/SIT** | 组件交互 | 1-10秒 | 真实数据库（容器化） |
| **ST** | 完整系统（ISTQB） | 分钟级 | 类生产环境 |
| **E2E** | 用户旅程 | 30秒+ | 一切均为真实 |
| **AT/UAT** | 业务验证（ISTQB） | 视情况 | 一切均为真实 |

### 覆盖率目标

| 指标 | 最低要求 | 建议值 |
|--------|---------|-------------|
| 行覆盖率 | 70% | 85% |
| 分支覆盖率 | 60% | 80% |
| 函数覆盖率 | 80% | 90% |

## 详细指南

完整标准请参考：
- [测试标准](../../core/testing-standards.md) - 可执行的规则
- [测试理论](./testing-theory.md) - 教学型知识库
- [测试金字塔](./testing-pyramid.md) - 详细的金字塔比例
- [测试骨架模板](./test-skeleton-templates.md) - 面向 UT/IT/ST/Perf/Contract 的多语言骨架

### AI 优化格式（Token 高效）

供 AI 助理使用，请采用 YAML 格式文件以减少 Token 用量：
- 基础标准：`ai/standards/testing.ai.yaml`
- 框架选项：
  - ISTQB 框架：`ai/options/testing/istqb-framework.ai.yaml`
  - 业界通行金字塔：`ai/options/testing/industry-pyramid.ai.yaml`
- 测试层级选项：
  - 单元测试：`ai/options/testing/unit-testing.ai.yaml`
  - 集成测试：`ai/options/testing/integration-testing.ai.yaml`
  - 系统测试：`ai/options/testing/system-testing.ai.yaml`
  - E2E 测试：`ai/options/testing/e2e-testing.ai.yaml`
  - 安全测试：`ai/options/testing/security-testing.ai.yaml`
  - 性能测试：`ai/options/testing/performance-testing.ai.yaml`
  - 契约测试：`ai/options/testing/contract-testing.ai.yaml`
- 骨架模板（涵盖所有层级、多语言）：[test-skeleton-templates.md](./test-skeleton-templates.md)

## 命名惯例

### 文件命名

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

## 测试替身

| 类型 | 用途 | 使用时机 |
|------|---------|-------------|
| **Stub** | 返回预定义值 | 固定的 API 响应 |
| **Mock** | 验证交互 | 检查方法是否被调用 |
| **Fake** | 简化实现 | 内存数据库 |
| **Spy** | 记录调用、委派 | 部分 Mock |

### 何时使用何种

- **UT**：对所有外部依赖使用 mock/stub
- **IT**：数据库使用 fake，外部 API 使用 stub
- **ST**：真实组件，仅对外部服务使用 fake
- **E2E**：一切均为真实

## AAA 模式

```typescript
test('method_scenario_expected', () => {
    // Arrange - Setup test data
    const input = createTestInput();
    const sut = new SystemUnderTest();

    // Act - Execute behavior
    const result = sut.execute(input);

    // Assert - Verify result
    expect(result).toBe(expected);
});
```

## FIRST 原则

- **F**ast（快速） - 测试执行迅速
- **I**ndependent（独立） - 测试之间互不影响
- **R**epeatable（可重复） - 每次执行结果相同
- **S**elf-validating（自我验证） - 明确的通过/失败
- **T**imely（及时） - 与生产代码一起编写

## 应避免的反模式

- ❌ 测试相互依赖（测试必须按顺序执行）
- ❌ 不稳定测试（有时通过、有时失败）
- ❌ 测试实现细节
- ❌ 过度 Mock
- ❌ 缺少断言
- ❌ 魔术数字/字符串

---

## 测试理论要点（YAML 压缩）

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

## 设置侦测

本 Skill 支持项目特定的设置。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 的「Disabled Skills」（停用 Skills）区段
   - 如果列出此 Skill，则其在该项目被停用
2. 检查 `CONTRIBUTING.md` 的「Testing Standards」（测试标准）区段
3. 若未找到，**默认使用标准覆盖率目标**

### 首次设置

若未找到设置且上下文不清楚时：

1. 询问用户：「此项目尚未配置测试标准。您想要自定义覆盖率目标吗？」
2. 用户选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Testing Standards

### Coverage Targets
| Metric | Target |
|--------|--------|
| Line | 80% |
| Branch | 70% |
| Function | 85% |
```

### 设置示例

在项目的 `CONTRIBUTING.md` 中：

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

## 下一步引导 | Next Steps Guidance

`/testing` 完成后，AI 助理应建议：

> **测试标准与最佳实践已掌握。建议下一步 / Testing standards and best practices understood. Suggested next steps:**
> - 执行 `/tdd` 开始测试驱动开发（红-绿-重构循环） ⭐ **推荐 / Recommended** — 将测试知识立即转化为实践 / Turn testing knowledge into practice immediately
> - 执行 `/coverage` 分析当前代码覆盖率 — 找出测试缺口 / Identify testing gaps
> - 执行 `/bdd` 编写行为驱动的 Given-When-Then 场景 — 从用户角度定义测试 / Define tests from user perspective

---

## 相关标准

- [测试标准](../../core/testing-standards.md) - 可执行的规则
- [测试理论](./testing-theory.md) - 教学型知识库
- [代码审查检查清单](../../core/code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.2.0 | 2026-01-29 | 新增指向新建 testing-theory.md 知识库的链接 |
| 1.1.0 | 2025-12-29 | 新增测试理论要点 YAML 区段 |
| 1.0.0 | 2025-12-24 | 初版：标准区段（目的、相关标准、版本历史、授权） |

---

## 授权

本 Skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
