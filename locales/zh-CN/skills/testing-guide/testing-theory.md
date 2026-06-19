---
source: skills/testing-guide/testing-theory.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Testing Theory Knowledge Base

> **语言**: [English](../../../../skills/testing-guide/testing-theory.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-29
**适用性**: 供测试人员与开发者参考的教学资料
**范围**: universal

---

## Purpose

本文档提供软件测试的理论基础、教学内容与详细示例。它作为一份完整的知识库，用以支撑 [Testing Standards](../../core/testing-standards.md) 中所定义的可执行规则。

**参考标准**:
- [ISTQB CTFL v4.0](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## Table of Contents

1. [测试基础概念](#testing-fundamentals)
2. [静态测试](#static-testing)
3. [测试设计技术](#test-design-techniques)
4. [经验导向测试](#experience-based-testing)
5. [风险导向测试](#risk-based-testing)
6. [专项测试](#specialized-testing)
7. [测试相关度量](#test-related-measures)
8. [缺陷管理](#defect-management)
9. [测试流程管理](#test-process-management)
10. [各测试层级的代码示例](#code-examples-by-test-level)
11. [快速参考卡](#quick-reference-card)

---

## Testing Fundamentals

理解软件测试的理论基础，对于有效的测试设计与执行至关重要。

**参考**: SWEBOK v4.0 第 5 章

### Faults vs Failures

```
┌─────────────────────────────────────────────────────────────┐
│              Faults, Errors, and Failures                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Error (Mistake)                                             │
│       │                                                      │
│       ▼ introduced during development                        │
│  ┌─────────┐                                                 │
│  │  Fault  │  (Defect/Bug in the code)                      │
│  └─────────┘                                                 │
│       │                                                      │
│       ▼ when executed                                        │
│  ┌─────────┐                                                 │
│  │ Failure │  (Observable incorrect behavior)               │
│  └─────────┘                                                 │
│                                                              │
│  Key Points:                                                 │
│  • A fault may exist without causing a failure              │
│  • A failure requires a fault to be executed                │
│  • Multiple faults can cause the same failure               │
│  • Testing finds failures; debugging finds faults           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### The Oracle Problem

**oracle（判定机制）** 是任何用以判断所观察到的程序行为是否正确的机制。oracle problem 探讨的是「如何得知预期结果」这一挑战。

```
┌─────────────────────────────────────────────────────────────┐
│                    Oracle Types                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Human Oracle                                                │
│  └── Manual verification by domain expert                   │
│                                                              │
│  Specification-Based Oracle                                  │
│  └── Compare against formal requirements                     │
│                                                              │
│  Reference Implementation                                    │
│  └── Compare against known-correct implementation            │
│                                                              │
│  Metamorphic Oracle                                          │
│  └── Verify relationships between outputs                   │
│      (e.g., sort(sort(x)) == sort(x))                       │
│                                                              │
│  Statistical Oracle                                          │
│  └── Validate against expected distributions                 │
│                                                              │
│  Implicit Oracle                                             │
│  └── No crash, no exception, no timeout                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Theoretical Limitations of Testing

> 「程序测试可以用来证明 bug 的存在，但永远无法证明其不存在。」 — Edsger W. Dijkstra

```
┌─────────────────────────────────────────────────────────────┐
│              Testing Limitations                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Exhaustive Testing is Impossible                            │
│  ├── Infinite input domain                                  │
│  ├── State space explosion                                  │
│  └── Timing and concurrency variations                      │
│                                                              │
│  Infeasible Paths                                            │
│  ├── Some code paths cannot be executed by any input        │
│  ├── Dead code may appear reachable in CFG                  │
│  └── 100% path coverage may be mathematically impossible    │
│                                                              │
│  Halting Problem                                             │
│  └── Cannot algorithmically determine if all tests halt     │
│                                                              │
│  Implications:                                               │
│  • Testing is sampling, not proof                           │
│  • Risk-based prioritization is essential                   │
│  • Combine testing with formal methods where critical       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Testability

Testability（可测试性）衡量软件能多容易地被有效测试。

| Factor | 说明 | 如何改善 |
|--------|-------------|----------------|
| **Controllability** | 为测试设定系统状态的能力 | 提供测试钩子、依赖注入 |
| **Observability** | 观察测试结果的能力 | 加入日志、暴露内部状态 |
| **Isolability** | 独立测试各组件的能力 | 模块化设计、清晰的接口 |
| **Understandability** | 预期行为的清晰程度 | 良好的文档、清晰的规格 |
| **Stability** | 变动频率低 | 在测试阶段前冻结功能 |
| **Simplicity** | 复杂度低 | 降低 cyclomatic complexity |

### Test Adequacy Criteria

测试充分性准则回答的是：「我们测得够不够？」

```
┌─────────────────────────────────────────────────────────────┐
│              Test Adequacy Criteria                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Coverage-Based Criteria                                     │
│  ├── Statement Coverage: % of statements executed           │
│  ├── Branch Coverage: % of branches taken                   │
│  ├── Condition Coverage: % of conditions evaluated          │
│  └── MC/DC: Modified condition/decision coverage            │
│                                                              │
│  Fault-Based Criteria                                        │
│  ├── Mutation Score: % of mutants killed                    │
│  └── Fault Seeding: % of seeded faults found                │
│                                                              │
│  Requirements-Based Criteria                                 │
│  └── Requirements Coverage: % of requirements tested         │
│                                                              │
│  Risk-Based Criteria                                         │
│  └── Risk Coverage: % of high-risk items tested             │
│                                                              │
│  Stopping Rules:                                             │
│  • Achieved target coverage level                           │
│  • Defect discovery rate drops below threshold              │
│  • Budget/time exhausted (with documented risk)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Static Testing

静态测试在不执行软件的情况下检查工作产物（代码、文档、需求）。它在 SDLC 较早阶段找出缺陷，从而补足动态测试。

**参考**: ISTQB CTFL v4.0 第 3 章, ISO/IEC/IEEE 29119-4

### Types of Static Testing

```
┌─────────────────────────────────────────────────────────────┐
│                    Static Testing Types                      │
├─────────────────────────────────────────────────────────────┤
│  Reviews (Manual)                                            │
│  ├── Informal Review: Ad-hoc, no formal process             │
│  ├── Walkthrough: Author-led, educational purpose           │
│  ├── Technical Review: Peer-led, find defects               │
│  └── Inspection: Formal, metrics-driven, most rigorous      │
├─────────────────────────────────────────────────────────────┤
│  Static Analysis (Tool-based)                                │
│  ├── Code Analysis: Linters, complexity analyzers           │
│  ├── Security Analysis: SAST tools (SonarQube, Checkmarx)   │
│  ├── Architecture Analysis: Dependency checks               │
│  └── Data Flow Analysis: Variable usage patterns            │
└─────────────────────────────────────────────────────────────┘
```

### Review Process (ISTQB)

| 阶段 | 活动 |
|-------|------------|
| Planning | 定义范围、进入准则、角色 |
| Initiate Review | 分发工作产物 |
| Individual Review | 每位评审者独立检视 |
| Issue Communication | 在会议中讨论发现 |
| Fixing & Reporting | 作者修正、收集度量 |

### Static Analysis Tools by Language

| 语言 | Linting | Security | Complexity |
|----------|---------|----------|------------|
| JavaScript/TypeScript | ESLint, Biome | npm audit, Snyk | ESLint complexity rules |
| Python | Pylint, Ruff, Flake8 | Bandit, Safety | Radon |
| Java | Checkstyle, PMD | SpotBugs, OWASP DC | JaCoCo |
| C# | StyleCop, Roslyn | Security Code Scan | NDepend |
| Go | golangci-lint | gosec | gocyclo |

### When to Use Static Testing

| 工作产物 | Review Type | 工具 |
|--------------|-------------|-------|
| Requirements | Inspection, Walkthrough | - |
| Design Documents | Technical Review | 架构工具 |
| Code | Technical Review, Tool Analysis | Linters, SAST |
| Test Plans | Walkthrough | - |
| User Documentation | Walkthrough | 拼写／语法检查器 |

### Code Review Checklist

```
┌─────────────────────────────────────────────────────────────┐
│              Code Review Focus Areas                         │
├─────────────────────────────────────────────────────────────┤
│  Functionality                                               │
│  ├── Does the code do what it's supposed to do?             │
│  ├── Are edge cases handled?                                │
│  └── Is error handling appropriate?                         │
├─────────────────────────────────────────────────────────────┤
│  Maintainability                                             │
│  ├── Is the code readable and well-organized?               │
│  ├── Are names meaningful?                                  │
│  └── Is complexity manageable?                              │
├─────────────────────────────────────────────────────────────┤
│  Security                                                    │
│  ├── Input validation present?                              │
│  ├── No hardcoded secrets?                                  │
│  └── SQL injection / XSS prevention?                        │
├─────────────────────────────────────────────────────────────┤
│  Performance                                                 │
│  ├── No obvious inefficiencies?                             │
│  ├── Resource cleanup (connections, files)?                 │
│  └── Appropriate data structures?                           │
└─────────────────────────────────────────────────────────────┘
```

### Integration with CI/CD

```yaml
# Example: Static analysis in CI pipeline
static-analysis:
  stage: test
  script:
    - npm run lint              # Linting
    - npm run lint:security     # Security analysis
    - npx sonarqube-scanner     # Quality gates
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
```

---

## Test Design Techniques

测试设计技术是用以推导与选择测试用例的方法。ISTQB 与 ISO/IEC/IEEE 29119 将其分类为三大主要途径。

**参考**: ISTQB CTFL v4.0 第 4 章, ISO/IEC/IEEE 29119-4

### Technique Categories

```
┌─────────────────────────────────────────────────────────────┐
│              Test Design Technique Categories                │
├─────────────────────────────────────────────────────────────┤
│  Specification-Based (Black-Box)                             │
│  └── Derive tests from requirements/specifications          │
├─────────────────────────────────────────────────────────────┤
│  Structure-Based (White-Box)                                 │
│  └── Derive tests from internal code structure              │
├─────────────────────────────────────────────────────────────┤
│  Experience-Based                                            │
│  └── Derive tests from tester knowledge and intuition       │
└─────────────────────────────────────────────────────────────┘
```

### Specification-Based Techniques (Black-Box)

#### 1. Equivalence Partitioning (EP)

将输入数据划分为多个分区，同一分区内的所有值应被系统以相同方式处理。

```
Input: Age (valid range: 18-65)

┌─────────────┬─────────────┬─────────────┐
│  Invalid    │    Valid    │   Invalid   │
│   < 18      │   18 - 65   │    > 65     │
├─────────────┼─────────────┼─────────────┤
│  Partition 1│  Partition 2│  Partition 3│
│  Test: 10   │  Test: 30   │  Test: 70   │
└─────────────┴─────────────┴─────────────┘

Coverage: At least 1 test case per partition
```

```python
# Python Example: Equivalence Partitioning
def test_age_validation():
    validator = AgeValidator(min_age=18, max_age=65)

    # Partition 1: Below minimum (invalid)
    assert validator.is_valid(10) == False

    # Partition 2: Valid range
    assert validator.is_valid(30) == True

    # Partition 3: Above maximum (invalid)
    assert validator.is_valid(70) == False
```

#### 2. Boundary Value Analysis (BVA)

在 equivalence partitions 的边界处测试，因为缺陷最可能出现于此。

```
Input: Quantity (valid range: 1-100)

       0      1      2    ...    99    100    101
       │      │      │           │      │      │
       ▼      ▼      ▼           ▼      ▼      ▼
    Invalid Valid  Valid      Valid  Valid  Invalid
    (boundary)(boundary)     (boundary)(boundary)

Test Values: 0, 1, 2, 99, 100, 101
```

```typescript
// TypeScript Example: Boundary Value Analysis
describe('Quantity Validation', () => {
    const validator = new QuantityValidator(1, 100);

    // Lower boundary
    it('rejects 0 (below minimum)', () => {
        expect(validator.isValid(0)).toBe(false);
    });

    it('accepts 1 (minimum boundary)', () => {
        expect(validator.isValid(1)).toBe(true);
    });

    it('accepts 2 (above minimum)', () => {
        expect(validator.isValid(2)).toBe(true);
    });

    // Upper boundary
    it('accepts 99 (below maximum)', () => {
        expect(validator.isValid(99)).toBe(true);
    });

    it('accepts 100 (maximum boundary)', () => {
        expect(validator.isValid(100)).toBe(true);
    });

    it('rejects 101 (above maximum)', () => {
        expect(validator.isValid(101)).toBe(false);
    });
});
```

#### 3. Decision Table Testing

以多个条件来捕捉复杂的业务规则。

```
Discount Rules:
- Premium member: 20% discount
- Order > $100: 10% discount
- Both conditions: 25% discount (not cumulative)

┌─────────────────┬──────┬──────┬──────┬──────┐
│ Conditions      │ TC1  │ TC2  │ TC3  │ TC4  │
├─────────────────┼──────┼──────┼──────┼──────┤
│ Premium Member  │  N   │  Y   │  N   │  Y   │
│ Order > $100    │  N   │  N   │  Y   │  Y   │
├─────────────────┼──────┼──────┼──────┼──────┤
│ Actions         │      │      │      │      │
├─────────────────┼──────┼──────┼──────┼──────┤
│ Discount %      │  0%  │ 20%  │ 10%  │ 25%  │
└─────────────────┴──────┴──────┴──────┴──────┘
```

```csharp
// C# Example: Decision Table Testing
[TestClass]
public class DiscountCalculatorTests
{
    private DiscountCalculator _calculator;

    [TestInitialize]
    public void Setup() => _calculator = new DiscountCalculator();

    [TestMethod]
    public void Calculate_NotPremium_SmallOrder_NoDiscount()
    {
        var result = _calculator.Calculate(isPremium: false, orderAmount: 50);
        Assert.AreEqual(0, result.DiscountPercent);
    }

    [TestMethod]
    public void Calculate_Premium_SmallOrder_20PercentDiscount()
    {
        var result = _calculator.Calculate(isPremium: true, orderAmount: 50);
        Assert.AreEqual(20, result.DiscountPercent);
    }

    [TestMethod]
    public void Calculate_NotPremium_LargeOrder_10PercentDiscount()
    {
        var result = _calculator.Calculate(isPremium: false, orderAmount: 150);
        Assert.AreEqual(10, result.DiscountPercent);
    }

    [TestMethod]
    public void Calculate_Premium_LargeOrder_25PercentDiscount()
    {
        var result = _calculator.Calculate(isPremium: true, orderAmount: 150);
        Assert.AreEqual(25, result.DiscountPercent);
    }
}
```

#### 4. State Transition Testing

依系统状态与状态转移来测试行为变化。

```
Order State Machine:

  ┌─────────┐    place()    ┌───────────┐   pay()    ┌────────┐
  │  Draft  │──────────────▶│  Pending  │───────────▶│  Paid  │
  └─────────┘               └───────────┘            └────────┘
       │                          │                       │
       │ cancel()                 │ cancel()              │ ship()
       ▼                          ▼                       ▼
  ┌───────────┐             ┌───────────┐           ┌──────────┐
  │ Cancelled │             │ Cancelled │           │ Shipped  │
  └───────────┘             └───────────┘           └──────────┘

State Transition Table:
┌───────────┬─────────┬───────────┬───────────┬───────────┐
│ Current   │ place() │ pay()     │ ship()    │ cancel()  │
├───────────┼─────────┼───────────┼───────────┼───────────┤
│ Draft     │ Pending │ Invalid   │ Invalid   │ Cancelled │
│ Pending   │ Invalid │ Paid      │ Invalid   │ Cancelled │
│ Paid      │ Invalid │ Invalid   │ Shipped   │ Invalid   │
│ Shipped   │ Invalid │ Invalid   │ Invalid   │ Invalid   │
│ Cancelled │ Invalid │ Invalid   │ Invalid   │ Invalid   │
└───────────┴─────────┴───────────┴───────────┴───────────┘
```

```python
# Python Example: State Transition Testing
class TestOrderStateMachine:
    def test_draft_to_pending_on_place(self):
        order = Order(state="draft")
        order.place()
        assert order.state == "pending"

    def test_pending_to_paid_on_pay(self):
        order = Order(state="pending")
        order.pay()
        assert order.state == "paid"

    def test_paid_to_shipped_on_ship(self):
        order = Order(state="paid")
        order.ship()
        assert order.state == "shipped"

    def test_invalid_transition_pay_from_draft(self):
        order = Order(state="draft")
        with pytest.raises(InvalidTransitionError):
            order.pay()

    def test_invalid_transition_cancel_from_shipped(self):
        order = Order(state="shipped")
        with pytest.raises(InvalidTransitionError):
            order.cancel()
```

#### 5. Use Case Testing

测试从头到尾的完整用户场景。

```
Use Case: User Login

Primary Flow:
1. User enters username
2. User enters password
3. User clicks login
4. System validates credentials
5. System redirects to dashboard

Alternative Flows:
A1. Invalid credentials → Show error, remain on login
A2. Account locked → Show locked message
A3. Password expired → Redirect to password change

Test Cases:
- TC1: Valid credentials → Dashboard (Primary)
- TC2: Invalid password → Error message (A1)
- TC3: Invalid username → Error message (A1)
- TC4: Locked account → Locked message (A2)
- TC5: Expired password → Password change page (A3)
```

#### 6. Pairwise Testing (Combinatorial Testing)

测试所有可能的输入参数值两两配对，在维持良好覆盖率的同时减少测试用例数。

**参考**: SWEBOK v4.0 - Input Domain-Based Techniques

```
Example: Login Form with 3 parameters, each with 3 values

Parameters:
- Browser: Chrome, Firefox, Safari
- OS: Windows, macOS, Linux
- Language: English, Spanish, French

Full Combinatorial: 3 × 3 × 3 = 27 test cases
Pairwise Coverage: 9 test cases (covers all pairs)

┌──────┬──────────┬─────────┬──────────┐
│ TC   │ Browser  │ OS      │ Language │
├──────┼──────────┼─────────┼──────────┤
│ 1    │ Chrome   │ Windows │ English  │
│ 2    │ Chrome   │ macOS   │ Spanish  │
│ 3    │ Chrome   │ Linux   │ French   │
│ 4    │ Firefox  │ Windows │ Spanish  │
│ 5    │ Firefox  │ macOS   │ French   │
│ 6    │ Firefox  │ Linux   │ English  │
│ 7    │ Safari   │ Windows │ French   │
│ 8    │ Safari   │ macOS   │ English  │
│ 9    │ Safari   │ Linux   │ Spanish  │
└──────┴──────────┴─────────┴──────────┘
```

**工具**: PICT (Microsoft), AllPairs, Jenny

```bash
# Using PICT (Pairwise Independent Combinatorial Testing)
# Input file: params.txt
# Browser: Chrome, Firefox, Safari
# OS: Windows, macOS, Linux
# Language: English, Spanish, French

pict params.txt > test_cases.txt
```

#### 7. Data Flow Testing

借由追踪变量的定义（definition）与使用（use），测试数据在程序中的流动。

**参考**: SWEBOK v4.0 - Code-Based Techniques

```
┌─────────────────────────────────────────────────────────────┐
│              Data Flow Terminology                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Definition (def): Variable is assigned a value             │
│  Use (use): Variable's value is accessed                    │
│  - c-use: Computational use (in calculation)                │
│  - p-use: Predicate use (in condition)                      │
│                                                              │
│  def-use pair: Path from definition to use                  │
│  def-clear path: No redefinition between def and use        │
│                                                              │
│  Example:                                                    │
│  1: x = 5           ← def(x)                                │
│  2: y = x + 1       ← c-use(x), def(y)                      │
│  3: if (x > 0)      ← p-use(x)                              │
│  4:   z = y * 2     ← c-use(y), def(z)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**覆盖准则**:

| 准则 | 要求 | 强度 |
|-----------|-------------|----------|
| All-Defs | 每个 def 至少抵达一个 use | 弱 |
| All-Uses | 每个 def-use pair 都被执行到 | 中 |
| All-DU-Paths | 从 def 到 use 的所有 def-clear path | 强 |

```python
# Python Example: Data Flow Testing
def calculate_discount(price, quantity, is_member):
    # def: total
    total = price * quantity

    # def: discount
    if is_member:  # p-use: is_member
        discount = 0.1  # def: discount (path 1)
    else:
        discount = 0.0  # def: discount (path 2)

    # c-use: total, discount
    if total > 100:  # p-use: total
        discount += 0.05  # c-use: discount, def: discount

    # c-use: total, discount
    return total * (1 - discount)

# Test cases for All-Uses coverage:
# TC1: is_member=True, total>100  → exercises def@line4, use@line10
# TC2: is_member=False, total>100 → exercises def@line6, use@line10
# TC3: is_member=True, total<=100 → exercises def@line4, use@line12
# TC4: is_member=False, total<=100 → exercises def@line6, use@line12
```

### Structure-Based Techniques (White-Box)

#### 1. Statement Coverage

确保每一条语句至少被执行一次。

```
Code:
1  function categorize(score) {
2      let result;
3      if (score >= 90) {
4          result = 'A';
5      } else if (score >= 70) {
6          result = 'B';
7      } else {
8          result = 'C';
9      }
10     return result;
11 }

100% Statement Coverage requires tests:
- Test 1: score = 95 → executes lines 1-4, 10
- Test 2: score = 80 → executes lines 1-3, 5-6, 10
- Test 3: score = 50 → executes lines 1-3, 5, 7-10
```

#### 2. Branch Coverage

确保每一个分支（决策结果）都被执行到。

```
Code:
if (a > 0 && b > 0) {
    doSomething();
}

Branches:
- True branch: a > 0 AND b > 0 is true
- False branch: a > 0 AND b > 0 is false

100% Branch Coverage:
- Test 1: a = 1, b = 1 → True branch
- Test 2: a = 0, b = 1 → False branch (or a = 1, b = 0)
```

#### 3. Condition Coverage

确保决策中的每个条件都被评估为 true 与 false。

```
Code:
if (a > 0 && b > 0) { ... }

Conditions: (a > 0), (b > 0)

100% Condition Coverage:
- Test 1: a = 1, b = 1 → (a > 0) = true, (b > 0) = true
- Test 2: a = 0, b = 0 → (a > 0) = false, (b > 0) = false

Note: Does not guarantee branch coverage!
```

#### 4. MC/DC (Modified Condition/Decision Coverage)

每个条件都能独立影响决策结果。安全关键系统会要求此覆盖。

```
Code:
if (a && b) { ... }

MC/DC Requirements:
1. Each condition evaluated to true and false
2. Each condition independently affects outcome

Test Cases:
- Test 1: a = true,  b = true  → Decision = true
- Test 2: a = false, b = true  → Decision = false (a changed outcome)
- Test 3: a = true,  b = false → Decision = false (b changed outcome)
```

### Technique Selection Guide

| 技术 | 最适合 | 测试层级 |
|-----------|----------|------------|
| Equivalence Partitioning | 输入验证、范围 | UT, IT |
| Boundary Value Analysis | 数值上下限、日期 | UT, IT |
| Decision Table | 复杂业务规则 | UT, IT, ST |
| State Transition | 工作流程、状态变化 | IT, ST |
| Use Case Testing | 用户场景 | ST, E2E |
| Pairwise Testing | 多参数组合 | IT, ST |
| Data Flow Testing | 变量生命周期验证 | UT |
| Statement Coverage | 基本代码覆盖 | UT |
| Branch Coverage | 决策逻辑 | UT |
| MC/DC | 安全关键系统 | UT |

---

## Experience-Based Testing

经验导向测试运用测试人员的知识、技能与直觉来设计与执行测试。它补足了系统化技术。

**参考**: ISTQB CTFL v4.0 第 4.4 节

### Types of Experience-Based Testing

#### 1. Exploratory Testing

同时进行测试设计、执行与学习。测试人员在没有预先脚本的情况下探索系统。

```
┌─────────────────────────────────────────────────────────────┐
│              Exploratory Testing Session                     │
├─────────────────────────────────────────────────────────────┤
│  Charter: "Explore the checkout process focusing on         │
│            payment failure scenarios"                        │
├─────────────────────────────────────────────────────────────┤
│  Time-box: 60 minutes                                        │
├─────────────────────────────────────────────────────────────┤
│  Notes:                                                      │
│  - Tested expired credit card → Got generic error           │
│  - Tested insufficient funds → Same generic error           │
│  - Found: No specific error messages for different failures │
│  - Bug: Retry with same card doesn't clear previous error   │
├─────────────────────────────────────────────────────────────┤
│  Bugs Found: 2                                               │
│  Areas for Further Testing: Error message specificity       │
└─────────────────────────────────────────────────────────────┘
```

**Session-Based Test Management (SBTM)**:

| 要素 | 说明 |
|---------|-------------|
| Charter | 该 session 的任务宣言 |
| Time-box | 固定时段（通常 60-90 分钟） |
| Session Notes | 观察、疑问、找到的 bug |
| Debrief | 与团队一同检视发现 |

#### 2. Error Guessing

依据对类似系统或常见错误的经验来预期缺陷。

```
Common Error Categories to Guess:

┌─────────────────────────────────────────────────────────────┐
│  Input Errors                                                │
│  ├── Empty/null inputs                                      │
│  ├── Very long strings                                      │
│  ├── Special characters (', ", <, >, &, etc.)              │
│  ├── Unicode/emoji characters                               │
│  └── Negative numbers where positive expected               │
├─────────────────────────────────────────────────────────────┤
│  Boundary Errors                                             │
│  ├── Off-by-one errors                                      │
│  ├── Integer overflow/underflow                             │
│  ├── Date boundaries (leap years, month ends)               │
│  └── Array index out of bounds                              │
├─────────────────────────────────────────────────────────────┤
│  State Errors                                                │
│  ├── Operations on deleted records                          │
│  ├── Concurrent modifications                               │
│  ├── Session timeout during operation                       │
│  └── Browser back button after submission                   │
├─────────────────────────────────────────────────────────────┤
│  Environment Errors                                          │
│  ├── Network timeout/disconnection                          │
│  ├── Low disk space                                         │
│  ├── Database connection pool exhaustion                    │
│  └── Time zone differences                                  │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Checklist-Based Testing

使用依经验与标准建立的预先检查清单。

```markdown
# API Endpoint Testing Checklist

## Authentication & Authorization
- [ ] Endpoint rejects unauthenticated requests
- [ ] Endpoint rejects expired tokens
- [ ] Endpoint enforces role-based access
- [ ] Different user roles see appropriate data

## Input Validation
- [ ] Required fields are validated
- [ ] Data types are enforced
- [ ] String length limits enforced
- [ ] Malicious input sanitized (XSS, SQL injection)

## Response Handling
- [ ] Success responses have correct status codes
- [ ] Error responses have meaningful messages
- [ ] Response format matches API documentation
- [ ] Pagination works correctly

## Performance
- [ ] Response time under load is acceptable
- [ ] No N+1 query problems
- [ ] Large datasets handled gracefully
```

### When to Use Experience-Based Testing

| 场景 | 建议技术 |
|----------|----------------------|
| 新功能探索 | Exploratory Testing |
| 无文档的遗留系统 | Exploratory Testing |
| 已知的问题区域 | Error Guessing |
| 回归测试 | Checklist-Based |
| 时间压力／快速验证 | Error Guessing |
| 合规性验证 | Checklist-Based |

### Combining with Systematic Techniques

```
┌─────────────────────────────────────────────────────────────┐
│          Optimal Testing Approach                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Systematic Techniques          Experience-Based           │
│    (70-80% of effort)            (20-30% of effort)         │
│                                                              │
│    ┌──────────────────┐          ┌──────────────────┐       │
│    │ Equivalence Part.│          │ Exploratory      │       │
│    │ Boundary Value   │    +     │ Error Guessing   │       │
│    │ Decision Tables  │          │ Checklists       │       │
│    └──────────────────┘          └──────────────────┘       │
│                                                              │
│    Provides:                     Provides:                   │
│    - Coverage                    - Edge cases                │
│    - Repeatability               - Real-world scenarios      │
│    - Documentation               - Quick feedback            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Risk-Based Testing

风险导向测试依据潜在失败的可能性与影响，来排定测试工作的优先顺序。

**参考**: ISTQB CTFL v4.0 第 5.2 节

### Risk Assessment

#### Risk Formula

```
Risk Level = Likelihood × Impact

┌─────────────────────────────────────────────────────────────┐
│                    Risk Matrix                               │
├─────────────┬───────────────────────────────────────────────┤
│             │         Impact                                 │
│ Likelihood  │   Low (1)    Medium (2)    High (3)           │
├─────────────┼───────────────────────────────────────────────┤
│ High (3)    │   Medium(3)   High(6)      Critical(9)        │
│ Medium (2)  │   Low(2)      Medium(4)    High(6)            │
│ Low (1)     │   Low(1)      Low(2)       Medium(3)          │
└─────────────┴───────────────────────────────────────────────┘
```

#### Risk Factors

**Likelihood Factors（技术风险）**:
- 功能的复杂度
- 新／不熟悉的技术
- 代码质量度量
- 开发者经验
- 变更频率
- 集成复杂度

**Impact Factors（业务风险）**:
- 营收影响
- 受影响的用户规模
- 法规合规
- 品牌声誉
- 数据安全／隐私
- 运维关键性

### Risk-Based Test Prioritization

```
Example: E-commerce Application

┌──────────────────────┬─────────┬─────────┬───────┬──────────┐
│ Feature              │Likelihood│ Impact │ Risk  │ Priority │
├──────────────────────┼─────────┼─────────┼───────┼──────────┤
│ Payment Processing   │    2    │    3    │   6   │    1     │
│ User Authentication  │    2    │    3    │   6   │    2     │
│ Shopping Cart        │    2    │    2    │   4   │    3     │
│ Product Search       │    1    │    2    │   2   │    4     │
│ Product Reviews      │    1    │    1    │   1   │    5     │
│ Wishlist            │    1    │    1    │   1   │    6     │
└──────────────────────┴─────────┴─────────┴───────┴──────────┘

Test Effort Allocation:
- Critical (Risk 6+): 50% of test effort, most thorough coverage
- Medium (Risk 3-5): 30% of test effort, standard coverage
- Low (Risk 1-2): 20% of test effort, basic coverage
```

### Risk-Based Test Planning

```markdown
# Risk-Based Test Plan Template

## 1. Risk Identification
List all features/components and their risk factors.

## 2. Risk Analysis
Calculate risk scores using Likelihood × Impact.

## 3. Test Prioritization
| Priority | Features | Test Depth |
|----------|----------|------------|
| P1 | Payment, Auth | Full coverage, all techniques |
| P2 | Cart, Checkout | Standard coverage |
| P3 | Search, Browse | Basic happy path |
| P4 | Reviews, Wishlist | Minimal, smoke tests |

## 4. Risk Mitigation
- P1 features: 100% automated tests, manual exploratory
- P2 features: 80% automated, sample manual tests
- P3 features: Key scenarios automated
- P4 features: Basic smoke tests only

## 5. Residual Risk Acceptance
Document accepted risks for low-priority features.
```

### Continuous Risk Assessment

```
┌─────────────────────────────────────────────────────────────┐
│            Continuous Risk Re-evaluation                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Sprint Start ──▶ During Sprint ──▶ Sprint End              │
│       │                │                │                    │
│       ▼                ▼                ▼                    │
│  Initial Risk     Update based on:    Review:               │
│  Assessment       - Defects found     - Actual vs Expected  │
│                   - Code changes      - Adjust for next     │
│                   - New requirements    sprint              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Specialized Testing

现代软件开发需要超越传统分类的专项测试类型。

### Contract Testing

验证各服务是否依照约定的合约正确通讯。对微服务架构而言至关重要。

```
┌─────────────────────────────────────────────────────────────┐
│              Consumer-Driven Contract Testing                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Consumer                          Provider                  │
│  (Frontend)                        (API)                     │
│      │                                │                      │
│      │  1. Define expectations        │                      │
│      │─────────────────────────────▶ │                      │
│      │                                │                      │
│      │  2. Generate contract          │                      │
│      │  (Pact file)                   │                      │
│      │                                │                      │
│      │  3. Share contract             │                      │
│      │─────────────────────────────▶ │                      │
│      │                                │                      │
│      │                    4. Provider verifies               │
│      │                       against contract                │
│      │                                │                      │
└─────────────────────────────────────────────────────────────┘
```

**工具**: Pact, Spring Cloud Contract, Postman

```typescript
// Consumer Test (Pact.js Example)
describe('User API Contract', () => {
    it('returns user by ID', async () => {
        await provider.addInteraction({
            state: 'user with ID 123 exists',
            uponReceiving: 'a request for user 123',
            withRequest: {
                method: 'GET',
                path: '/users/123'
            },
            willRespondWith: {
                status: 200,
                body: {
                    id: '123',
                    name: Matchers.string('John Doe'),
                    email: Matchers.email()
                }
            }
        });

        const user = await userClient.getUser('123');
        expect(user.id).toBe('123');
    });
});
```

### Mutation Testing

借由对代码引入微小变更（mutants），并检查测试是否能侦测到，以评估测试套件的质量。

```
┌─────────────────────────────────────────────────────────────┐
│                   Mutation Testing                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Original Code:        Mutant (change operator):            │
│  if (a > b)            if (a >= b)    ← Boundary mutant     │
│  if (a > b)            if (a < b)     ← Negation mutant     │
│  return a + b;         return a - b;  ← Arithmetic mutant   │
│  return true;          return false;  ← Return value mutant │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Mutation Score = (Killed Mutants / Total Mutants) × 100    │
│                                                              │
│  - Killed: Test failed → Good, test detected the change    │
│  - Survived: Test passed → Bad, test missed the defect     │
│                                                              │
│  Target: > 80% mutation score for critical code             │
└─────────────────────────────────────────────────────────────┘
```

**工具**: Stryker (JS/TS), PITest (Java), mutmut (Python)

```bash
# Run mutation testing with Stryker
npx stryker run

# Example output:
# Mutation score: 85.7%
# Killed: 180  Survived: 30  No coverage: 10
```

### Chaos Engineering

借由在生产或预备环境中注入故障，主动测试系统的韧性。

```
┌─────────────────────────────────────────────────────────────┐
│              Chaos Engineering Principles                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Define "steady state" (normal behavior metrics)         │
│  2. Hypothesize steady state continues during chaos         │
│  3. Introduce real-world events:                            │
│     - Server failures                                        │
│     - Network latency/partition                              │
│     - Resource exhaustion                                    │
│     - Clock skew                                             │
│  4. Try to disprove the hypothesis                          │
│  5. Minimize blast radius (start small)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**工具**: Chaos Monkey, Gremlin, Litmus, Chaos Toolkit

```yaml
# Chaos Toolkit Experiment Example
title: "Service resilience when database is slow"
description: "Verify the service degrades gracefully"

steady-state-hypothesis:
  title: "Service responds within SLA"
  probes:
    - name: "service-responds"
      type: probe
      provider:
        type: http
        url: "http://service/health"
        timeout: 3

method:
  - name: "inject-db-latency"
    type: action
    provider:
      type: process
      path: "tc"
      arguments: "qdisc add dev eth0 root netem delay 500ms"
    pauses:
      after: 30

rollbacks:
  - name: "remove-latency"
    type: action
    provider:
      type: process
      path: "tc"
      arguments: "qdisc del dev eth0 root"
```

### Property-Based Testing

根据代码应满足的性质，生成随机的测试输入。

```python
# Python Example with Hypothesis
from hypothesis import given, strategies as st

# Property: Sorting should be idempotent
@given(st.lists(st.integers()))
def test_sort_idempotent(xs):
    sorted_once = sorted(xs)
    sorted_twice = sorted(sorted_once)
    assert sorted_once == sorted_twice

# Property: Sorted list should have same elements
@given(st.lists(st.integers()))
def test_sort_preserves_elements(xs):
    sorted_xs = sorted(xs)
    assert sorted(xs) == sorted(sorted_xs)
    assert len(xs) == len(sorted_xs)

# Property: JSON encode/decode roundtrip
@given(st.dictionaries(st.text(), st.integers()))
def test_json_roundtrip(d):
    assert json.loads(json.dumps(d)) == d
```

**工具**: Hypothesis (Python), fast-check (JS/TS), QuickCheck (Haskell), FsCheck (C#)

### Visual Regression Testing

侦测 UI 组件中非预期的视觉变化。

```
┌─────────────────────────────────────────────────────────────┐
│              Visual Regression Testing                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Capture baseline screenshots                            │
│  2. Run tests, capture new screenshots                      │
│  3. Compare pixel-by-pixel or perceptually                  │
│  4. Flag differences for review                             │
│                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │  Baseline   │ → │   Current   │ → │    Diff     │       │
│  │  Screenshot │   │  Screenshot │   │   Report    │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**工具**: Percy, Chromatic, BackstopJS, Playwright visual comparisons

```typescript
// Playwright Visual Regression Example
test('homepage visual regression', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png', {
        maxDiffPixels: 100  // Allow minor differences
    });
});

test('button component visual regression', async ({ page }) => {
    await page.goto('/components/button');
    const button = page.locator('[data-testid="primary-button"]');
    await expect(button).toHaveScreenshot('primary-button.png');
});
```

### Accessibility Testing (a11y)

确保应用程序可供身心障碍者使用。

```
┌─────────────────────────────────────────────────────────────┐
│              Accessibility Testing Checklist                 │
├─────────────────────────────────────────────────────────────┤
│  WCAG 2.1 Guidelines                                         │
│  ├── Perceivable                                            │
│  │   ├── Alt text for images                                │
│  │   ├── Captions for video                                 │
│  │   └── Sufficient color contrast                          │
│  ├── Operable                                               │
│  │   ├── Keyboard navigation                                │
│  │   ├── Focus indicators visible                           │
│  │   └── No keyboard traps                                  │
│  ├── Understandable                                         │
│  │   ├── Clear labels and instructions                      │
│  │   ├── Predictable navigation                             │
│  │   └── Error identification                               │
│  └── Robust                                                 │
│      ├── Valid HTML                                         │
│      └── ARIA attributes correct                            │
└─────────────────────────────────────────────────────────────┘
```

**工具**: axe-core, Pa11y, WAVE, Lighthouse

```typescript
// Playwright + axe-core Example
import AxeBuilder from '@axe-core/playwright';

test('homepage accessibility', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

    expect(results.violations).toEqual([]);
});
```

### Additional Specialized Testing Types (SWEBOK)

以下测试类型在 SWEBOK v4.0 中被定义为测试目标：

#### Installation Testing

验证软件能在目标环境中正确安装。

```
┌─────────────────────────────────────────────────────────────┐
│              Installation Testing Checklist                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pre-Installation                                            │
│  ├── Prerequisites verified (OS, runtime, dependencies)    │
│  ├── Disk space requirements met                            │
│  └── Permissions and access rights confirmed                │
│                                                              │
│  Installation Process                                        │
│  ├── Fresh installation succeeds                            │
│  ├── Upgrade from previous version succeeds                 │
│  ├── Custom installation options work                       │
│  └── Silent/unattended installation works                   │
│                                                              │
│  Post-Installation                                           │
│  ├── Application launches correctly                         │
│  ├── Configuration files created properly                   │
│  ├── Registry/system settings correct                       │
│  └── Uninstallation removes all components                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Alpha and Beta Testing

| 阶段 | 参与者 | 环境 | 目的 |
|-------|--------------|-------------|---------|
| **Alpha** | 内部用户、开发者 | 开发场地 | 早期验证、重大问题 |
| **Beta** | 外部用户、客户 | 客户场地 | 真实世界验证、反馈 |
| **Open Beta** | 一般公众 | 各种环境 | 广泛曝光、压力测试 |

#### Recovery Testing

测试系统从故障中恢复的能力。

```
┌─────────────────────────────────────────────────────────────┐
│              Recovery Testing Scenarios                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Hardware Failures                                           │
│  ├── Power outage during transaction                        │
│  ├── Disk failure and RAID recovery                         │
│  └── Network disconnection and reconnection                 │
│                                                              │
│  Software Failures                                           │
│  ├── Application crash recovery                             │
│  ├── Database connection loss and reconnect                 │
│  └── Service restart behavior                               │
│                                                              │
│  Data Recovery                                               │
│  ├── Backup and restore procedures                          │
│  ├── Transaction rollback                                   │
│  └── Point-in-time recovery                                 │
│                                                              │
│  Metrics:                                                    │
│  • Recovery Time Objective (RTO): Max acceptable downtime   │
│  • Recovery Point Objective (RPO): Max acceptable data loss │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Configuration Testing

在不同配置下测试系统。

```
Configuration Matrix Example:

┌──────────────────┬─────────┬─────────┬─────────┐
│ Configuration    │ Config A│ Config B│ Config C│
├──────────────────┼─────────┼─────────┼─────────┤
│ Memory           │ 4 GB    │ 8 GB    │ 16 GB   │
│ Database         │ SQLite  │ MySQL   │ PostgreSQL│
│ Cache            │ None    │ Redis   │ Memcached│
│ Load Balancer    │ None    │ Nginx   │ HAProxy │
└──────────────────┴─────────┴─────────┴─────────┘

Test each supported configuration combination.
```

#### Back-to-Back Testing

以相同输入比较多个实现的输出。

```
┌─────────────────────────────────────────────────────────────┐
│              Back-to-Back Testing                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Use Cases:                                                  │
│  ├── Comparing new version against old version              │
│  ├── Comparing optimized code against reference impl        │
│  ├── Cross-platform consistency verification                │
│  └── Validating refactored code behavior                    │
│                                                              │
│  Process:                                                    │
│  ┌─────────┐     ┌─────────────┐     ┌──────────┐          │
│  │ Input   │────▶│ Version A   │────▶│ Output A │──┐       │
│  │ Data    │     └─────────────┘     └──────────┘  │       │
│  │         │     ┌─────────────┐     ┌──────────┐  ▼       │
│  │         │────▶│ Version B   │────▶│ Output B │─▶Compare │
│  └─────────┘     └─────────────┘     └──────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Usability Testing

评估用户学习与使用系统的容易程度。

```
┌─────────────────────────────────────────────────────────────┐
│              Usability Testing Methods                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Observational Methods                                       │
│  ├── Think-aloud protocol                                   │
│  ├── Eye tracking                                           │
│  └── Session recording                                      │
│                                                              │
│  Task-Based Methods                                          │
│  ├── Task completion rate                                   │
│  ├── Time on task                                           │
│  └── Error rate                                             │
│                                                              │
│  Survey Methods                                              │
│  ├── System Usability Scale (SUS)                           │
│  ├── Net Promoter Score (NPS)                               │
│  └── Post-task questionnaires                               │
│                                                              │
│  Key Metrics:                                                │
│  • Learnability: Time to complete first task                │
│  • Efficiency: Time to complete after learning              │
│  • Memorability: Performance after period of non-use        │
│  • Satisfaction: User rating scores                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Specialized Testing Summary

| 类型 | 目的 | 使用时机 |
|------|---------|-------------|
| Contract Testing | API 兼容性 | 微服务 |
| Mutation Testing | 测试质量评估 | 关键代码路径 |
| Chaos Engineering | 韧性验证 | 生产系统 |
| Property-Based | 边界用例发掘 | 算法、parser |
| Visual Regression | UI 一致性 | 前端变更 |
| Accessibility | 无障碍设计 | 所有面向用户的应用 |
| Installation | 部署验证 | 候选发布版本 |
| Alpha/Beta | 早期用户验证 | 发布前阶段 |
| Recovery | 故障恢复 | 业务关键系统 |
| Configuration | 多配置支持 | 跨平台应用 |
| Back-to-Back | 版本比较 | 迁移、重构 |
| Usability | 用户体验 | 面向用户的应用 |

---

## Test-Related Measures

用以评估受测软件本身以及测试本身质量的量化度量。

**参考**: SWEBOK v4.0 第 5.4 节

### Program Evaluation Measures

#### Fault Density

```
Fault Density = Total Faults / Size

Where Size can be:
- KLOC (Thousands of Lines of Code)
- Function Points
- Story Points

Industry Benchmarks:
┌─────────────────────┬────────────────────────────┐
│ Quality Level       │ Faults per KLOC            │
├─────────────────────┼────────────────────────────┤
│ Typical             │ 1 - 25                     │
│ Good                │ 0.5 - 1                    │
│ Excellent           │ < 0.5                      │
│ Safety-Critical     │ < 0.1                      │
└─────────────────────┴────────────────────────────┘
```

#### Reliability Growth Models

追踪缺陷随时间的发现率，以预测剩余缺陷。

```
┌─────────────────────────────────────────────────────────────┐
│              Reliability Growth Curve                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Defects                                                     │
│  Found                                                       │
│    │     ╭────────────────────────────────                  │
│    │   ╭─╯                                                   │
│    │  ╭╯                                                     │
│    │ ╭╯                                                      │
│    │╭╯                                                       │
│    ├╯                                                        │
│    └──────────────────────────────────────▶ Time            │
│                                                              │
│  As testing progresses:                                      │
│  • Defect discovery rate decreases                          │
│  • Curve approaches asymptote (total defects)               │
│  • Remaining defects can be estimated                       │
│                                                              │
│  Common Models:                                              │
│  • Goel-Okumoto: Exponential                                │
│  • Musa: Logarithmic                                        │
│  • Jelinski-Moranda: De-eutrophication                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Test Evaluation Measures

#### Fault Seeding

植入已知的缺陷以衡量测试效能。

```
Fault Detection Effectiveness = Seeded Faults Found / Total Seeded Faults

If tests find 80% of seeded faults, estimate:
- Similar detection rate for real faults
- Remaining faults ≈ Found faults / Detection rate

Example:
- Seeded 20 faults, tests found 16 (80%)
- Found 40 real faults during testing
- Estimated total real faults ≈ 40 / 0.8 = 50
- Estimated remaining ≈ 10 faults
```

#### Coverage Metrics Summary

| Metric | 公式 | 目标 |
|--------|---------|--------|
| Statement Coverage | 已执行语句 / 总语句 | ≥ 70% |
| Branch Coverage | 已执行分支 / 总分支 | ≥ 60% |
| Condition Coverage | 评估为 T 与 F 的条件 / 总条件 | ≥ 80% |
| MC/DC | 能独立影响决策的条件 | 100%（安全关键） |
| Requirements Coverage | 已测试需求 / 总需求 | 100% |
| Mutation Score | 被杀死的 mutants / 总 mutants | ≥ 80% |

### Testing Process Metrics

```
┌─────────────────────────────────────────────────────────────┐
│              Key Testing Metrics                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Efficiency Metrics                                          │
│  ├── Test Case Productivity = Tests created / Effort        │
│  ├── Defect Detection Rate = Defects found / Test hours     │
│  └── Automation Rate = Automated tests / Total tests        │
│                                                              │
│  Effectiveness Metrics                                       │
│  ├── Defect Leakage = Prod defects / Total defects          │
│  ├── Test Effectiveness = Defects found / Defects present   │
│  └── Phase Containment = Defects found in phase / Injected  │
│                                                              │
│  Progress Metrics                                            │
│  ├── Test Execution Rate = Tests run / Tests planned        │
│  ├── Pass Rate = Tests passed / Tests executed              │
│  └── Blocking Rate = Blocked tests / Total tests            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Defect Management

在整个测试生命周期中对缺陷进行系统化的追踪与管理。

**参考**: ISTQB CTFL v4.0 第 5.5 节, ISO/IEC/IEEE 29119-3

### Defect Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Defect Lifecycle                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌────────┐    ┌────────┐    ┌──────────┐                  │
│   │  New   │───▶│  Open  │───▶│ In Progress│                │
│   └────────┘    └────────┘    └──────────┘                  │
│                      │              │                        │
│                      │              ▼                        │
│                      │        ┌──────────┐                  │
│                      │        │  Fixed   │                  │
│                      │        └──────────┘                  │
│                      │              │                        │
│                      │              ▼                        │
│                      │        ┌──────────┐    ┌──────────┐  │
│                      │        │ Verified │───▶│  Closed  │  │
│                      │        └──────────┘    └──────────┘  │
│                      │              │                        │
│                      │              ▼                        │
│                      │        ┌──────────┐                  │
│                      └───────▶│ Reopened │                  │
│                               └──────────┘                  │
│                                                              │
│   Alternative paths:                                         │
│   - New → Rejected (not a bug, duplicate)                   │
│   - Open → Deferred (postponed to later release)            │
│   - Open → Won't Fix (accepted risk)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Defect Report Template

```markdown
# Defect Report

## Summary
[One-line description of the defect]

## ID: BUG-1234
## Priority: P1/P2/P3/P4
## Severity: Critical/High/Medium/Low

## Environment
- **Version**: 2.3.1
- **OS**: Windows 11 / macOS 14.2
- **Browser**: Chrome 120
- **Device**: Desktop / Mobile

## Steps to Reproduce
1. Navigate to login page
2. Enter valid username "testuser"
3. Enter invalid password "wrong123"
4. Click "Login" button
5. Observe error message

## Expected Result
Error message: "Invalid credentials. Please try again."

## Actual Result
Generic error: "Something went wrong."

## Screenshots/Videos
[Attach relevant media]

## Additional Information
- Occurs consistently (100% reproducible)
- Related to ticket: FEAT-456
- Log file: [attached]
```

### Severity vs Priority

| Severity | 说明 | 示例 |
|----------|-------------|----------|
| Critical | 系统崩溃、数据丢失、安全漏洞 | App 无法启动、数据损坏 |
| High | 主要功能损坏、无替代方案 | 无法完成结账 |
| Medium | 功能受损但有替代方案 | 导出失败，可手动复制 |
| Low | 小问题、外观瑕疵 | 错字、对齐问题 |

| Priority | 说明 | 响应时间 |
|----------|-------------|---------------|
| P1 | 立即修正 | 当天 |
| P2 | 发布前修正 | 本 sprint 内 |
| P3 | 有空时修正 | 下个 sprint |
| P4 | 修了更好 | Backlog |

### Defect Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                    Key Defect Metrics                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Defect Density = Total Defects / Size (KLOC or FP)         │
│  - Industry average: 1-25 defects per KLOC                  │
│                                                              │
│  Defect Detection Efficiency (DDE) =                        │
│    Defects found before release / Total defects × 100       │
│  - Target: > 90%                                            │
│                                                              │
│  Defect Removal Efficiency (DRE) =                          │
│    Defects removed / Defects injected × 100                 │
│  - Target: > 95%                                            │
│                                                              │
│  Mean Time to Detect (MTTD) = Avg time from injection       │
│  Mean Time to Resolve (MTTR) = Avg time from report to fix  │
│                                                              │
│  Defect Leakage Rate = Production defects / Total defects   │
│  - Target: < 5%                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Root Cause Analysis

```
┌─────────────────────────────────────────────────────────────┐
│              Common Defect Root Causes                       │
├─────────────────────────────────────────────────────────────┤
│  Requirements (35-40%)                                       │
│  ├── Ambiguous requirements                                 │
│  ├── Missing requirements                                   │
│  └── Changed requirements                                   │
├─────────────────────────────────────────────────────────────┤
│  Design (20-25%)                                             │
│  ├── Incorrect algorithm                                    │
│  ├── Integration issues                                     │
│  └── Performance not considered                             │
├─────────────────────────────────────────────────────────────┤
│  Code (25-30%)                                               │
│  ├── Logic errors                                           │
│  ├── Boundary conditions                                    │
│  └── Exception handling                                     │
├─────────────────────────────────────────────────────────────┤
│  Environment (10-15%)                                        │
│  ├── Configuration issues                                   │
│  ├── Third-party dependencies                               │
│  └── Data issues                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Test Process Management

针对测试活动进行规划、监控与控制的结构化途径。

**参考**: ISTQB CTFL v4.0 第 5 章, ISO/IEC/IEEE 29119-2

### Test Planning

#### Test Plan Components (ISO/IEC/IEEE 29119-3)

```
┌─────────────────────────────────────────────────────────────┐
│                   Test Plan Structure                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Test Plan Identification                                 │
│     - Project name, version, date                           │
│                                                              │
│  2. Introduction                                             │
│     - Purpose, scope, objectives                            │
│                                                              │
│  3. Test Items                                               │
│     - Features to be tested                                 │
│     - Features not to be tested                             │
│                                                              │
│  4. Test Approach                                            │
│     - Test levels and types                                 │
│     - Test techniques                                       │
│     - Entry/exit criteria                                   │
│                                                              │
│  5. Test Environment                                         │
│     - Hardware, software, tools                             │
│     - Test data requirements                                │
│                                                              │
│  6. Test Schedule                                            │
│     - Milestones, dependencies                              │
│                                                              │
│  7. Roles and Responsibilities                               │
│     - Team structure, RACI matrix                           │
│                                                              │
│  8. Risks and Contingencies                                  │
│     - Risk assessment, mitigation                           │
│                                                              │
│  9. Approvals                                                │
│     - Sign-off requirements                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Entry and Exit Criteria

| 准则类型 | 示例 |
|---------------|----------|
| **Entry Criteria**（开始测试） | 需求已批准、代码完成、环境就绪、测试数据齐备 |
| **Exit Criteria**（停止测试） | 所有 P1/P2 测试通过、达成覆盖目标、无未解的严重缺陷 |

```markdown
## Entry Criteria for System Testing
- [ ] All integration tests passed
- [ ] Test environment deployed and verified
- [ ] Test data prepared and loaded
- [ ] Test cases reviewed and approved
- [ ] All blockers from IT resolved

## Exit Criteria for System Testing
- [ ] 100% of critical test cases executed
- [ ] 95% of high priority test cases passed
- [ ] No Critical or High severity defects open
- [ ] Code coverage > 80%
- [ ] Performance benchmarks met
```

### Test Monitoring and Control

#### Key Progress Metrics

```
┌─────────────────────────────────────────────────────────────┐
│              Test Progress Metrics                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Execution Metrics:                                          │
│  - Tests Planned: 500                                        │
│  - Tests Executed: 350 (70%)                                │
│  - Tests Passed: 320 (91% of executed)                      │
│  - Tests Failed: 30 (9% of executed)                        │
│  - Tests Blocked: 15                                         │
│                                                              │
│  Defect Metrics:                                             │
│  - Total Defects Found: 45                                   │
│  - Open Defects: 12 (3 Critical, 5 High, 4 Medium)          │
│  - Fixed Defects: 28                                         │
│  - Verified Defects: 20                                      │
│                                                              │
│  Coverage Metrics:                                           │
│  - Requirements Coverage: 85%                                │
│  - Code Coverage: 78%                                        │
│  - Risk Coverage: 90%                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Test Dashboard Example

```
Test Progress Dashboard - Sprint 15
═══════════════════════════════════════════════════════════════

Test Execution                    Defect Status
█████████████████░░░░ 85%        Open:     ███░░░░░░░ 12
                                  Fixed:    ████████░░ 28
Passed  │████████████████│ 320    Verified: ██████░░░░ 20
Failed  │██              │  30
Blocked │█               │  15    Trend: ↓ (improving)

Coverage                          Build Health
Requirements: ███████████░ 85%    Last Build: ✓ Pass
Code:         ████████░░░░ 78%    Unit Tests: 245/245 ✓
Risk Items:   █████████░░░ 90%    Int Tests:  89/92 ⚠
                                  Flaky Rate: 2.1%
```

### Test Completion

#### Test Summary Report

```markdown
# Test Summary Report

## Project: [Project Name]
## Version: [Version Number]
## Test Period: [Start Date] - [End Date]

## Executive Summary
[Brief overview of testing activities and outcomes]

## Test Scope
- Features tested: [list]
- Features not tested: [list with justification]

## Test Results Summary

| Test Level | Planned | Executed | Passed | Failed | Pass Rate |
|------------|---------|----------|--------|--------|-----------|
| Unit       | 500     | 500      | 498    | 2      | 99.6%     |
| Integration| 150     | 150      | 145    | 5      | 96.7%     |
| System     | 200     | 195      | 188    | 7      | 96.4%     |
| E2E        | 50      | 48       | 46     | 2      | 95.8%     |

## Defect Summary

| Severity | Found | Fixed | Open | Deferred |
|----------|-------|-------|------|----------|
| Critical | 2     | 2     | 0    | 0        |
| High     | 8     | 7     | 1    | 0        |
| Medium   | 15    | 12    | 2    | 1        |
| Low      | 20    | 10    | 5    | 5        |

## Coverage Analysis
- Requirements coverage: 95%
- Code coverage: 82%
- Risk coverage: 100% (all high-risk items tested)

## Open Issues and Risks
1. [Issue 1]: Impact and mitigation
2. [Issue 2]: Impact and mitigation

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Conclusion
[Final assessment and release recommendation]

## Sign-off
- QA Lead: [Name, Date]
- Dev Lead: [Name, Date]
- Product Owner: [Name, Date]
```

### Test Process Improvement

```
┌─────────────────────────────────────────────────────────────┐
│              Continuous Improvement Cycle                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         ┌───────────┐                                        │
│         │   Plan    │                                        │
│         └─────┬─────┘                                        │
│               │                                              │
│               ▼                                              │
│  ┌───────────┐         ┌───────────┐                        │
│  │   Act     │◀───────▶│    Do     │                        │
│  └───────────┘         └─────┬─────┘                        │
│               ▲              │                               │
│               │              ▼                               │
│         ┌─────┴─────┐                                        │
│         │   Check   │                                        │
│         └───────────┘                                        │
│                                                              │
│  Retrospective Questions:                                    │
│  - What went well?                                          │
│  - What could be improved?                                  │
│  - What actions will we take?                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Examples by Test Level

### Unit Testing Example

```csharp
// C# Example
[TestClass]
public class UserValidatorTests
{
    private UserValidator _validator;

    [TestInitialize]
    public void Setup()
    {
        _validator = new UserValidator();
    }

    [TestMethod]
    public void ValidateEmail_ValidFormat_ReturnsTrue()
    {
        // Arrange
        var email = "user@example.com";

        // Act
        var result = _validator.ValidateEmail(email);

        // Assert
        Assert.IsTrue(result);
    }

    [TestMethod]
    public void ValidateEmail_InvalidFormat_ReturnsFalse()
    {
        // Arrange
        var email = "invalid-email";

        // Act
        var result = _validator.ValidateEmail(email);

        // Assert
        Assert.IsFalse(result);
    }
}
```

```typescript
// TypeScript Example
describe('UserValidator', () => {
    let validator: UserValidator;

    beforeEach(() => {
        validator = new UserValidator();
    });

    describe('validateEmail', () => {
        it('should return true for valid email format', () => {
            const result = validator.validateEmail('user@example.com');
            expect(result).toBe(true);
        });

        it('should return false for invalid email format', () => {
            const result = validator.validateEmail('invalid-email');
            expect(result).toBe(false);
        });
    });
});
```

### Integration Testing Example

```csharp
// C# Integration Test Example with Test Database
[TestClass]
public class UserRepositoryIntegrationTests
{
    private TestDbContext _dbContext;
    private UserRepository _repository;

    [TestInitialize]
    public async Task Setup()
    {
        // Use test database (e.g., SQLite in-memory or Testcontainers)
        _dbContext = TestDbContextFactory.Create();
        _repository = new UserRepository(_dbContext);
        await _dbContext.Database.EnsureCreatedAsync();
    }

    [TestCleanup]
    public async Task Cleanup()
    {
        await _dbContext.DisposeAsync();
    }

    [TestMethod]
    public async Task CreateUser_WithValidData_PersistsToDatabase()
    {
        // Arrange
        var user = new User { Name = "Test User", Email = "test@example.com" };

        // Act
        await _repository.CreateAsync(user);
        var savedUser = await _repository.GetByIdAsync(user.Id);

        // Assert
        Assert.IsNotNull(savedUser);
        Assert.AreEqual("Test User", savedUser.Name);
    }
}
```

### System Testing Example

```csharp
// System Test Example: Complete Resource Processing Flow
[TestClass]
public class ResourceProcessingSystemTests
{
    private HttpClient _client;
    private TestEnvironment _env;

    [TestInitialize]
    public async Task Setup()
    {
        _env = await TestEnvironment.CreateAsync();
        _client = _env.CreateAuthenticatedClient();
    }

    [TestMethod]
    public async Task ProcessResource_CompleteFlow_CompletedSuccessfully()
    {
        // Arrange: Create test data
        var item = await _env.CreateTestItem(value: 100);
        var user = await _env.CreateTestUser();

        // Act: Execute complete processing flow
        // Step 1: Create request
        var requestResponse = await _client.PostAsync("/api/requests",
            new { itemId = item.Id, quantity = 2 });
        Assert.AreEqual(HttpStatusCode.OK, requestResponse.StatusCode);

        // Step 2: Submit processing
        var processResponse = await _client.PostAsync("/api/processes",
            new { requestId = requestResponse.RequestId, userId = user.Id });
        var process = await processResponse.Content.ReadAsAsync<Process>();
        Assert.AreEqual(HttpStatusCode.Created, processResponse.StatusCode);

        // Step 3: Confirm completion
        var confirmResponse = await _client.PostAsync($"/api/processes/{process.Id}/confirm",
            new { confirmationType = "standard", amount = 200 });
        Assert.AreEqual(HttpStatusCode.OK, confirmResponse.StatusCode);

        // Assert: Verify final state
        var finalProcess = await _client.GetAsync($"/api/processes/{process.Id}");
        var result = await finalProcess.Content.ReadAsAsync<Process>();

        Assert.AreEqual(ProcessStatus.Completed, result.Status);
        Assert.AreEqual(200, result.TotalAmount);
        Assert.IsNotNull(result.Confirmation);
    }
}
```

### E2E Testing Example

```typescript
// Playwright E2E Test Example
import { test, expect } from '@playwright/test';

test.describe('User Registration Journey', () => {
    test('should complete registration and login successfully', async ({ page }) => {
        // Step 1: Navigate to registration page
        await page.goto('/register');

        // Step 2: Fill registration form
        await page.fill('[data-testid="email"]', 'newuser@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
        await page.click('[data-testid="register-button"]');

        // Step 3: Verify registration success
        await expect(page.locator('[data-testid="success-message"]'))
            .toContainText('Registration successful');

        // Step 4: Login with new account
        await page.goto('/login');
        await page.fill('[data-testid="email"]', 'newuser@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.click('[data-testid="login-button"]');

        // Step 5: Verify login success and dashboard redirect
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('[data-testid="welcome-message"]'))
            .toContainText('Welcome, newuser@example.com');
    });
});
```

### Containerized Testing Example

```csharp
// C# Example with Testcontainers
public class DatabaseIntegrationTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:15")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task Should_Connect_To_Database()
    {
        var connectionString = _postgres.GetConnectionString();
        // Use connectionString for tests
    }
}
```

```python
# Python Example with Testcontainers
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="module")
def postgres_container():
    with PostgresContainer("postgres:15") as postgres:
        yield postgres

def test_database_connection(postgres_container):
    connection_url = postgres_container.get_connection_url()
    # Use connection_url for tests
```

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  app:
    build: .
    depends_on:
      - db
      - redis
      - rabbitmq
    environment:
      - DATABASE_URL=postgres://test:test@db:5432/testdb
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: testdb

  redis:
    image: redis:7-alpine

  rabbitmq:
    image: rabbitmq:3-management
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│           Reference Standards                                │
├─────────────────────────────────────────────────────────────┤
│  • ISTQB CTFL v4.0 - Testing certification                  │
│  • ISO/IEC/IEEE 29119 - Testing standards                   │
│  • SWEBOK v4.0 - Software engineering knowledge             │
├─────────────────────────────────────────────────────────────┤
│              Testing Fundamentals (SWEBOK)                   │
├─────────────────────────────────────────────────────────────┤
│  Error → Fault → Failure (cause chain)                      │
│  Oracle Problem: How to know expected result?               │
│  Limitation: Testing proves presence, not absence of bugs   │
│  Testability: Controllability + Observability + Isolability │
├─────────────────────────────────────────────────────────────┤
│              Testing Framework Options                       │
├─────────────────────────────────────────────────────────────┤
│  ISTQB: UT → IT/SIT → ST → AT/UAT (Enterprise/Compliance)  │
│  Industry: UT (70%) → IT (20%) → E2E (10%) (Agile/DevOps)  │
├─────────────────────────────────────────────────────────────┤
│                    Testing Levels Summary                   │
├──────────┬──────────────────────────────────────────────────┤
│   UT     │ Single unit, isolated, mocked deps, < 100ms     │
├──────────┼──────────────────────────────────────────────────┤
│  IT/SIT  │ Component integration, real DB, 1-10 sec        │
├──────────┼──────────────────────────────────────────────────┤
│   ST     │ Full system, requirement-based (ISTQB only)     │
├──────────┼──────────────────────────────────────────────────┤
│  E2E     │ User journeys, UI to DB, critical paths only    │
├──────────┼──────────────────────────────────────────────────┤
│  AT/UAT  │ Business validation by end users (ISTQB only)   │
├──────────┴──────────────────────────────────────────────────┤
│                    Test Types (ISTQB)                       │
├─────────────────────────────────────────────────────────────┤
│  Functional: Verify system behavior (black-box)            │
│  Non-Functional: Performance, security, usability          │
│  Structural: Code coverage, white-box techniques           │
│  Change-Related: Confirmation & regression testing         │
├─────────────────────────────────────────────────────────────┤
│                 Test Design Techniques                      │
├─────────────────────────────────────────────────────────────┤
│  Black-Box: EP, BVA, Decision Table, State Transition      │
│             Pairwise Testing, Use Case Testing              │
│  White-Box: Statement, Branch, Condition, MC/DC            │
│             Data Flow (All-Defs, All-Uses)                  │
│  Experience: Exploratory, Error Guessing, Checklists       │
├─────────────────────────────────────────────────────────────┤
│                    Coverage Targets                         │
├─────────────────────────────────────────────────────────────┤
│  Line: 70% min / 85% recommended                           │
│  Branch: 60% min / 80% recommended                         │
│  Function: 80% min / 90% recommended                       │
│  Mutation Score: ≥ 80% for critical code                   │
├─────────────────────────────────────────────────────────────┤
│              Specialized Testing Types                      │
├─────────────────────────────────────────────────────────────┤
│  Contract: API compatibility for microservices             │
│  Mutation: Test quality via code mutations                 │
│  Chaos: Resilience via failure injection                   │
│  Property-Based: Random inputs based on properties         │
│  Visual Regression: UI screenshot comparison               │
│  Accessibility: WCAG compliance validation                 │
│  Installation: Deployment verification                      │
│  Recovery: Failure recovery (RTO/RPO)                       │
│  Configuration: Multi-config testing                        │
│  Usability: User experience (SUS, NPS)                      │
├─────────────────────────────────────────────────────────────┤
│               Test-Related Measures                         │
├─────────────────────────────────────────────────────────────┤
│  Fault Density = Faults / KLOC (target: < 1)               │
│  Defect Leakage = Prod defects / Total defects (< 5%)      │
│  Fault Seeding: Insert known faults to measure detection   │
│  Reliability Growth: Track defect rate over time           │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Standards

- [Testing Standards](../../core/testing-standards.md) - 给 AI agent 的可执行规则
- [Testing Pyramid](./testing-pyramid.md) - 详细的金字塔比例
- [Test-Driven Development](../../core/test-driven-development.md) - TDD/BDD/ATDD 方法论
- [Test Completeness Dimensions](../../core/test-completeness-dimensions.md) - 8 维度测试覆盖
- [Code Review Checklist](../../core/code-review-checklist.md)

---

## Version History

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | 初版建立：从 core/testing-standards.md 抽取教学内容，包含 Testing Fundamentals、Static Testing、Test Design Techniques、Experience-Based Testing、Risk-Based Testing、Specialized Testing、Test-Related Measures、Defect Management、Test Process Management、Code Examples 及 Quick Reference Card。 |

---

## License

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
