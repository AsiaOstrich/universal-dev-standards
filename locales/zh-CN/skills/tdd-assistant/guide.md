---
source: ../../../../skills/tdd-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: dfe1437a04b0
status: current
description: |
  引导开发者完成测试驱动开发工作流程。
  使用时机：先写测试、实践 TDD、红-绿-重构循环、BDD 场景。
  关键字：TDD, test first, red green refactor, FIRST, BDD, ATDD, 测试驱动开发, 红绿重构。
---

# TDD 助手

> **语言**: [English](../../../../skills/tdd-assistant/guide.md) | [繁體中文](../../../zh-TW/skills/tdd-assistant/guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-07
**适用范围**: Claude Code Skills

---

## 目的

此技能引导开发者完成测试驱动开发工作流程，帮助他们：
- 编写有效的失败测试（红色阶段）
- 实现最少代码让测试通过（绿色阶段）
- 在保持测试绿色的同时安全重构（重构阶段）
- 识别并避免常见的 TDD 反模式
- 将 TDD 与 BDD 和 ATDD 方法集成
- 根据上下文适当地应用 TDD

---

## 快速参考

### TDD 循环检查清单

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 RED Phase                                                   │
│  □ Test describes expected behavior, not implementation         │
│  □ Test name clearly states what is being tested                │
│  □ Test follows AAA pattern (Arrange-Act-Assert)                │
│  □ Test fails for the RIGHT reason                              │
│  □ Failure message is clear and actionable                      │
├─────────────────────────────────────────────────────────────────┤
│  🟢 GREEN Phase                                                 │
│  □ Write MINIMUM code to pass the test                          │
│  □ "Fake it" is acceptable (hardcode if needed)                 │
│  □ Don't optimize or over-engineer                              │
│  □ Test now passes                                              │
│  □ All other tests still pass                                   │
├─────────────────────────────────────────────────────────────────┤
│  🔵 REFACTOR Phase                                              │
│  □ Remove duplication (DRY)                                     │
│  □ Improve naming                                               │
│  □ Extract methods if needed                                    │
│  □ Run tests after EVERY change                                 │
│  □ No new functionality added                                   │
│  □ All tests still pass                                         │
└─────────────────────────────────────────────────────────────────┘
```

### FIRST 原则快速参考

| 原则 | 检查 | 常见违规 |
|------|------|---------|
| **F**ast（快速） | 每个单元测试 < 100ms | 数据库调用、文件 I/O、网络 |
| **I**ndependent（独立） | 无共享状态 | 静态变量、执行顺序依赖 |
| **R**epeatable（可重复） | 结果总是相同 | DateTime.Now、Random、外部服务 |
| **S**elf-validating（自验证） | 明确的通过/失败 | 手动检查日志、无断言 |
| **T**imely（及时） | 先测试后编写代码 | 实现后才写测试 |

### 反模式快速检测

| 症状 | 可能的反模式 | 快速修复 |
|------|-------------|---------|
| 重构时测试失败 | 测试实现细节 | 只测试行为 |
| 测试通过但生产环境有 Bug | 过度 Mock | 增加集成测试 |
| 随机测试失败 | 测试相互依赖 | 隔离测试状态 |
| 测试套件缓慢 | 集成测试过多 | 提高单元测试比例 |
| 团队回避写测试 | 测试设置复杂 | 使用构建器简化 |

---

## TDD vs BDD vs ATDD 快速参考

| 方面 | TDD | BDD | ATDD |
|------|-----|-----|------|
| **谁编写** | 开发者 | 开发者 + BA + QA | 所有利益相关者 |
| **语言** | 代码 | Gherkin (Given-When-Then) | 业务语言 |
| **层级** | 单元/组件 | 功能/场景 | 验收 |
| **时机** | 编码期间 | 编码之前 | Sprint 之前 |

### 何时使用哪个

```
Is it a technical implementation detail?
├─ Yes → TDD
└─ No → Is there a business stakeholder?
         ├─ Yes → Does stakeholder need to read/validate tests?
         │        ├─ Yes → ATDD → BDD → TDD
         │        └─ No → BDD → TDD
         └─ No → TDD
```

---

## 工作流程协助

### 红色阶段指导

编写失败测试时，确保：

1. **清晰的意图**
   ```typescript
   // ❌ Vague
   test('it works', () => { ... });

   // ✅ Clear
   test('should calculate discount when order total exceeds threshold', () => { ... });
   ```

2. **单一行为**
   ```typescript
   // ❌ Multiple behaviors
   test('should validate and save user', () => { ... });

   // ✅ Single behavior
   test('should reject invalid email format', () => { ... });
   test('should save user with valid data', () => { ... });
   ```

3. **正确的断言**
   ```typescript
   // ❌ No assertion
   test('should process order', () => {
     orderService.process(order);
     // Missing assertion!
   });

   // ✅ Clear assertion
   test('should mark order as processed', () => {
     const result = orderService.process(order);
     expect(result.status).toBe('processed');
   });
   ```

### 绿色阶段指导

让测试通过时，记住：

1. **最少实现**
   ```typescript
   // Test: should return "FizzBuzz" for numbers divisible by both 3 and 5

   // ❌ Over-engineered first pass
   function fizzBuzz(n: number): string {
     const divisibleBy3 = n % 3 === 0;
     const divisibleBy5 = n % 5 === 0;
     if (divisibleBy3 && divisibleBy5) return 'FizzBuzz';
     if (divisibleBy3) return 'Fizz';
     if (divisibleBy5) return 'Buzz';
     return n.toString();
   }

   // ✅ Minimum for current test (fake it!)
   function fizzBuzz(n: number): string {
     return 'FizzBuzz'; // Just enough to pass THIS test
   }
   ```

2. **渐进式泛化**
   - 第一个测试：硬编码答案
   - 第二个测试：添加简单条件
   - 第三个测试：泛化模式

### 重构阶段指导

安全重构检查清单：

```
Before:
□ All tests are GREEN
□ Understand what the code does

During (one at a time):
□ Extract method → Run tests
□ Rename → Run tests
□ Remove duplication → Run tests
□ Simplify conditional → Run tests

After:
□ All tests still GREEN
□ Code is cleaner
□ No new functionality
```

---

## 与 SDD 集成

使用规格驱动开发时：

### Spec → 测试映射

| Spec 区段 | 测试类型 |
|-----------|----------|
| 验收标准 | 验收测试（ATDD/BDD） |
| 业务规则 | 单元测试（TDD） |
| 边界情况 | 单元测试（TDD） |
| 集成点 | 集成测试 |

### 工作流程

```
1. Read Spec (SPEC-XXX)
   ↓
2. Identify Acceptance Criteria
   ↓
3. Write BDD scenarios (if applicable)
   ↓
4. For each scenario:
   ├─ TDD: Red → Green → Refactor
   └─ Mark AC as implemented
   ↓
5. All ACs implemented?
   ├─ Yes → Mark Spec as complete
   └─ No → Return to step 4
```

### 测试文件参考

```typescript
/**
 * Tests for SPEC-001: User Authentication
 *
 * Acceptance Criteria:
 * - AC-1: User can login with valid credentials
 * - AC-2: Invalid password shows error
 * - AC-3: Account locks after 3 failed attempts
 */
describe('User Authentication (SPEC-001)', () => {
  // Tests organized by AC
});
```

---

## 配置检测

此技能支持项目特定配置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的 "Disabled Skills" 区段
   - 如果此技能在列表中，则对此项目禁用
2. 检查 `CONTRIBUTING.md` 中的 "TDD Standards" 区段
3. 检查代码库中现有的测试模式
4. 如果未找到，**默认使用标准 TDD 实践**

### 首次设置

如果未找到配置且上下文不明确：

1. 询问：“此项目尚未配置 TDD 偏好。您偏好哪种方法？”
   - 纯 TDD（红-绿-重构）
   - BDD 风格 TDD（Given-When-Then）
   - ATDD 搭配 BDD 和 TDD

2. 选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## TDD Standards

### Preferred Approach
- Primary: TDD (Red-Green-Refactor)
- For features with business stakeholders: BDD

### Test Naming Convention
- Pattern: `should_[behavior]_when_[condition]`
- Example: `should_return_error_when_email_invalid`

### Coverage Targets
- Unit: 80%
- Integration: 60%
```

---

## 详细指南

完整标准请参阅：
- [TDD 核心标准](../../core/test-driven-development.md)
- [TDD 工作流指南](./tdd-workflow.md)
- [语言示例](./language-examples.md)

相关测试标准：
- [测试标准](../../core/testing-standards.md)
- [测试完整性维度](../../core/test-completeness-dimensions.md)

---

## 重构阶段深度解析（YAML 压缩）

```yaml
# === TDD REFACTOR = SAFE SMALL REFACTORING ===
refactor_phase:
  scope: "Single method/class improvements"
  duration: "5-15 minutes max"
  prerequisite: "All tests GREEN"
  rule: "No new functionality"

techniques:
  safe_refactorings:
    - extract_method: "Long method → smaller methods"
    - rename: "Improve naming clarity"
    - inline_variable: "Remove unnecessary temp"
    - replace_magic_number: "Constant with meaning"
    - extract_class: "SRP violation fix"
    - move_method: "Better cohesion"

workflow:
  steps:
    1: "Confirm all tests GREEN"
    2: "Make ONE small change"
    3: "Run tests immediately"
    4: "If RED → revert, try smaller step"
    5: "If GREEN → commit, repeat"

# === WHEN TO USE /refactor INSTEAD ===
escalation:
  use_tdd_refactor:
    - "Improving code just written"
    - "Single method/class cleanup"
    - "Takes <15 minutes"
  use_refactoring_assistant:
    - "Legacy code modernization"
    - "Refactor vs Rewrite decision"
    - "Large-scale architectural change"
    - "Technical debt management"
    - "Strangler Fig pattern needed"

# === REFACTOR ANTIPATTERNS ===
antipatterns:
  - name: "Refactoring without tests"
    symptom: "No safety net"
    fix: "Add characterization tests first"
  - name: "Too large refactoring"
    symptom: "Tests RED for hours"
    fix: "Smaller steps, commit frequently"
  - name: "Adding features while refactoring"
    symptom: "Scope creep"
    fix: "Separate commits: refactor then feature"
  - name: "Refactoring everything"
    symptom: "Perfectionism paralysis"
    fix: "Only refactor code you're changing"
```

---

## 相关标准

- [测试驱动开发](../../core/test-driven-development.md) - TDD 核心标准
- [重构标准](../../core/refactoring-standards.md) - 大规模重构
- [测试标准](../../core/testing-standards.md) - 测试框架
- [测试完整性维度](../../core/test-completeness-dimensions.md) - 7 个维度
- [规格驱动开发](../../core/spec-driven-development.md) - SDD 集成
- [测试指南技能](../testing-guide/SKILL.md) - 测试指南
- [测试覆盖率助手](../test-coverage-assistant/SKILL.md) - 覆盖率支持
- [重构助手](../refactoring-assistant/SKILL.md) - 大规模重构

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-07 | 初始版本 |

---

## 许可证

此技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可证发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
