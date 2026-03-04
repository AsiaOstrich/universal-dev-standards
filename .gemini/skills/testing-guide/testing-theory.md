# Testing Theory Knowledge Base

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/testing-guide/testing-theory.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Applicability**: Educational reference for testers and developers
**Scope**: universal

---

## Purpose

This document provides the theoretical foundations, educational content, and detailed examples for software testing. It serves as a comprehensive knowledge base to support the actionable rules defined in [Testing Standards](../../core/testing-standards.md).

**Reference Standards**:
- [ISTQB CTFL v4.0](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)
- [ISO/IEC/IEEE 29119](https://www.iso.org/standard/81291.html)
- [SWEBOK v4.0](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## Table of Contents

1. [Testing Fundamentals](#testing-fundamentals)
2. [Static Testing](#static-testing)
3. [Test Design Techniques](#test-design-techniques)
4. [Experience-Based Testing](#experience-based-testing)
5. [Risk-Based Testing](#risk-based-testing)
6. [Specialized Testing](#specialized-testing)
7. [Test-Related Measures](#test-related-measures)
8. [Defect Management](#defect-management)
9. [Test Process Management](#test-process-management)
10. [Code Examples by Test Level](#code-examples-by-test-level)
11. [Quick Reference Card](#quick-reference-card)

---

## Testing Fundamentals

Understanding the theoretical foundations of software testing is essential for effective test design and execution.

**Reference**: SWEBOK v4.0 Chapter 5

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

An **oracle** is any mechanism that determines whether observed program behavior is correct. The oracle problem addresses the challenge of knowing expected outcomes.

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
│  └── Verify relationships between outputs                    │
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

> "Program testing can be used to show the presence of bugs, but never to show their absence." — Edsger W. Dijkstra

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

Testability measures how easily software can be tested effectively.

| Factor | Description | How to Improve |
|--------|-------------|----------------|
| **Controllability** | Ability to set system state for testing | Provide test hooks, dependency injection |
| **Observability** | Ability to observe test results | Add logging, expose internal state |
| **Isolability** | Ability to test components independently | Modular design, clear interfaces |
| **Understandability** | Clarity of expected behavior | Good documentation, clear specifications |
| **Stability** | Low rate of change | Freeze features before testing phase |
| **Simplicity** | Low complexity | Reduce cyclomatic complexity |

### Test Adequacy Criteria

Test adequacy criteria answer: "Have we tested enough?"

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

Static testing examines work products (code, documents, requirements) without executing the software. It complements dynamic testing by finding defects earlier in the SDLC.

**Reference**: ISTQB CTFL v4.0 Chapter 3, ISO/IEC/IEEE 29119-4

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

| Phase | Activities |
|-------|------------|
| Planning | Define scope, entry criteria, roles |
| Initiate Review | Distribute work products |
| Individual Review | Each reviewer examines independently |
| Issue Communication | Discuss findings in meeting |
| Fixing & Reporting | Author fixes, metrics collected |

### Static Analysis Tools by Language

| Language | Linting | Security | Complexity |
|----------|---------|----------|------------|
| JavaScript/TypeScript | ESLint, Biome | npm audit, Snyk | ESLint complexity rules |
| Python | Pylint, Ruff, Flake8 | Bandit, Safety | Radon |
| Java | Checkstyle, PMD | SpotBugs, OWASP DC | JaCoCo |
| C# | StyleCop, Roslyn | Security Code Scan | NDepend |
| Go | golangci-lint | gosec | gocyclo |

### When to Use Static Testing

| Work Product | Review Type | Tools |
|--------------|-------------|-------|
| Requirements | Inspection, Walkthrough | - |
| Design Documents | Technical Review | Architecture tools |
| Code | Technical Review, Tool Analysis | Linters, SAST |
| Test Plans | Walkthrough | - |
| User Documentation | Walkthrough | Spell/grammar checkers |

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

Test design techniques are methods for deriving and selecting test cases. ISTQB and ISO/IEC/IEEE 29119 categorize them into three main approaches.

**Reference**: ISTQB CTFL v4.0 Chapter 4, ISO/IEC/IEEE 29119-4

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

Divides input data into partitions where all values should be treated the same by the system.

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

Tests at the boundaries of equivalence partitions where defects are most likely.

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

Captures complex business rules with multiple conditions.

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

Tests behavior changes based on system states and transitions.

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

Tests complete user scenarios from start to finish.

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

Tests all possible pairs of input parameter values, reducing test cases while maintaining good coverage.

**Reference**: SWEBOK v4.0 - Input Domain-Based Techniques

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

**Tools**: PICT (Microsoft), AllPairs, Jenny

```bash
# Using PICT (Pairwise Independent Combinatorial Testing)
# Input file: params.txt
# Browser: Chrome, Firefox, Safari
# OS: Windows, macOS, Linux
# Language: English, Spanish, French

pict params.txt > test_cases.txt
```

#### 7. Data Flow Testing

Tests the flow of data through a program by tracking variable definitions and uses.

**Reference**: SWEBOK v4.0 - Code-Based Techniques

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

**Coverage Criteria**:

| Criterion | Requirement | Strength |
|-----------|-------------|----------|
| All-Defs | Every def reaches at least one use | Weak |
| All-Uses | Every def-use pair is exercised | Medium |
| All-DU-Paths | All def-clear paths from def to use | Strong |

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

Ensure every statement is executed at least once.

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

Ensure every branch (decision outcome) is executed.

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

Ensure each condition in a decision is evaluated to both true and false.

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

Each condition independently affects the decision outcome. Required for safety-critical systems.

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

| Technique | Best For | Test Level |
|-----------|----------|------------|
| Equivalence Partitioning | Input validation, ranges | UT, IT |
| Boundary Value Analysis | Numeric limits, dates | UT, IT |
| Decision Table | Complex business rules | UT, IT, ST |
| State Transition | Workflows, status changes | IT, ST |
| Use Case Testing | User scenarios | ST, E2E |
| Pairwise Testing | Multi-parameter combinations | IT, ST |
| Data Flow Testing | Variable lifecycle verification | UT |
| Statement Coverage | Basic code coverage | UT |
| Branch Coverage | Decision logic | UT |
| MC/DC | Safety-critical systems | UT |

---

## Experience-Based Testing

Experience-based testing leverages the tester's knowledge, skills, and intuition to design and execute tests. It complements systematic techniques.

**Reference**: ISTQB CTFL v4.0 Section 4.4

### Types of Experience-Based Testing

#### 1. Exploratory Testing

Simultaneous test design, execution, and learning. The tester explores the system without predefined scripts.

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

| Element | Description |
|---------|-------------|
| Charter | Mission statement for the session |
| Time-box | Fixed duration (typically 60-90 min) |
| Session Notes | Observations, questions, bugs found |
| Debrief | Review findings with team |

#### 2. Error Guessing

Anticipate defects based on experience with similar systems or common mistakes.

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

Use predefined checklists based on experience and standards.

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

| Scenario | Recommended Technique |
|----------|----------------------|
| New feature exploration | Exploratory Testing |
| Legacy system with no documentation | Exploratory Testing |
| Known problematic areas | Error Guessing |
| Regression testing | Checklist-Based |
| Time pressure / quick validation | Error Guessing |
| Compliance verification | Checklist-Based |

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

Risk-based testing prioritizes testing efforts based on the likelihood and impact of potential failures.

**Reference**: ISTQB CTFL v4.0 Section 5.2

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

**Likelihood Factors** (Technical Risk):
- Complexity of the feature
- New/unfamiliar technology
- Code quality metrics
- Developer experience
- Frequency of changes
- Integration complexity

**Impact Factors** (Business Risk):
- Revenue impact
- User base affected
- Regulatory compliance
- Brand reputation
- Data security/privacy
- Operational criticality

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

Modern software development requires specialized testing types beyond traditional categories.

### Contract Testing

Verifies that services communicate correctly according to agreed contracts. Essential for microservices architectures.

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

**Tools**: Pact, Spring Cloud Contract, Postman

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

Evaluates test suite quality by introducing small changes (mutants) to the code and checking if tests detect them.

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

**Tools**: Stryker (JS/TS), PITest (Java), mutmut (Python)

```bash
# Run mutation testing with Stryker
npx stryker run

# Example output:
# Mutation score: 85.7%
# Killed: 180  Survived: 30  No coverage: 10
```

### Chaos Engineering

Proactively tests system resilience by injecting failures in production or staging environments.

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

**Tools**: Chaos Monkey, Gremlin, Litmus, Chaos Toolkit

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

Generates random test inputs based on properties the code should satisfy.

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

**Tools**: Hypothesis (Python), fast-check (JS/TS), QuickCheck (Haskell), FsCheck (C#)

### Visual Regression Testing

Detects unintended visual changes in UI components.

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

**Tools**: Percy, Chromatic, BackstopJS, Playwright visual comparisons

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

Ensures applications are usable by people with disabilities.

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

**Tools**: axe-core, Pa11y, WAVE, Lighthouse

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

The following test types are defined in SWEBOK v4.0 as test objectives:

#### Installation Testing

Verifies that the software installs correctly in the target environment.

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

| Phase | Participants | Environment | Purpose |
|-------|--------------|-------------|---------|
| **Alpha** | Internal users, developers | Development site | Early validation, major issues |
| **Beta** | External users, customers | Customer site | Real-world validation, feedback |
| **Open Beta** | General public | Various | Wide exposure, stress testing |

#### Recovery Testing

Tests the system's ability to recover from failures.

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

Tests the system under different configurations.

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

Compares outputs of multiple implementations with identical inputs.

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

Evaluates how easily users can learn and use the system.

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

| Type | Purpose | When to Use |
|------|---------|-------------|
| Contract Testing | API compatibility | Microservices |
| Mutation Testing | Test quality assessment | Critical code paths |
| Chaos Engineering | Resilience validation | Production systems |
| Property-Based | Edge case discovery | Algorithms, parsers |
| Visual Regression | UI consistency | Frontend changes |
| Accessibility | Inclusive design | All user-facing apps |
| Installation | Deployment verification | Release candidates |
| Alpha/Beta | Early user validation | Pre-release phases |
| Recovery | Failure recovery | Business-critical systems |
| Configuration | Multi-config support | Cross-platform apps |
| Back-to-Back | Version comparison | Migrations, refactoring |
| Usability | User experience | User-facing applications |

---

## Test-Related Measures

Quantitative measures for evaluating both the software under test and the quality of testing itself.

**Reference**: SWEBOK v4.0 Section 5.4

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

Track defect discovery rate over time to predict remaining defects.

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

Insert known faults to measure test effectiveness.

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

| Metric | Formula | Target |
|--------|---------|--------|
| Statement Coverage | Executed statements / Total statements | ≥ 70% |
| Branch Coverage | Executed branches / Total branches | ≥ 60% |
| Condition Coverage | Conditions evaluated T & F / Total conditions | ≥ 80% |
| MC/DC | Conditions independently affecting decision | 100% (safety-critical) |
| Requirements Coverage | Tested requirements / Total requirements | 100% |
| Mutation Score | Killed mutants / Total mutants | ≥ 80% |

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

Systematic tracking and management of defects throughout the testing lifecycle.

**Reference**: ISTQB CTFL v4.0 Section 5.5, ISO/IEC/IEEE 29119-3

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

| Severity | Description | Examples |
|----------|-------------|----------|
| Critical | System crash, data loss, security breach | App won't start, data corruption |
| High | Major feature broken, no workaround | Cannot complete checkout |
| Medium | Feature impaired but has workaround | Export fails, manual copy works |
| Low | Minor issue, cosmetic | Typo, alignment issue |

| Priority | Description | Response Time |
|----------|-------------|---------------|
| P1 | Fix immediately | Same day |
| P2 | Fix before release | Within sprint |
| P3 | Fix when possible | Next sprint |
| P4 | Nice to fix | Backlog |

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

Structured approach to planning, monitoring, and controlling testing activities.

**Reference**: ISTQB CTFL v4.0 Chapter 5, ISO/IEC/IEEE 29119-2

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

| Criteria Type | Examples |
|---------------|----------|
| **Entry Criteria** (start testing) | Requirements approved, code complete, environment ready, test data available |
| **Exit Criteria** (stop testing) | All P1/P2 tests passed, coverage target met, no critical defects open |

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

- [Testing Standards](../../core/testing-standards.md) - Actionable rules for AI agents
- [Testing Pyramid](./testing-pyramid.md) - Detailed pyramid ratios
- [Test-Driven Development](../../core/test-driven-development.md) - TDD/BDD/ATDD methodology
- [Test Completeness Dimensions](../../core/test-completeness-dimensions.md) - 8-dimension test coverage
- [Code Review Checklist](../../core/code-review-checklist.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial creation: Extracted educational content from core/testing-standards.md including Testing Fundamentals, Static Testing, Test Design Techniques, Experience-Based Testing, Risk-Based Testing, Specialized Testing, Test-Related Measures, Defect Management, Test Process Management, Code Examples, and Quick Reference Card. |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
