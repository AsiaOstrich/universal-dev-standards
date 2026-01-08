---
source: ../../../../../skills/claude-code/tdd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-07
status: current
---

---
name: tdd-assistant
description: |
  Guide developers through Test-Driven Development workflow.
  Use when: writing tests first, practicing TDD, red-green-refactor cycle, BDD scenarios.
  Keywords: TDD, test first, red green refactor, FIRST, BDD, ATDD, 测试驱动开发, 红绿重构.
---

# TDD 助手

> **语言**: [English](../../../../../skills/claude-code/tdd-assistant/SKILL.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2026-01-07
**适用范围**: Claude Code Skills

---

## 目的

此技能引导开发者完成测试驱动开发工作流程，协助他们：
- 撰写有效的失败测试（红色阶段）
- 实现最少程式码让测试通过（绿色阶段）
- 在保持测试绿色的同时安全重构（重构阶段）
- 识别并避免常见的 TDD 反模式
- 整合 TDD 与 BDD 和 ATDD 方法
- 根据情境适当地应用 TDD

---

## 快速参考

### TDD 循环检查清单

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 红色阶段                                                     │
│  □ 测试描述预期行为，而非实作                                     │
│  □ 测试名称清楚说明正在测试什么                                   │
│  □ 测试遵循 AAA 模式（Arrange-Act-Assert）                       │
│  □ 测试因为「正确的原因」而失败                                   │
│  □ 失败讯息清楚且可操作                                          │
├─────────────────────────────────────────────────────────────────┤
│  🟢 绿色阶段                                                     │
│  □ 撰写「最少」程式码让测试通过                                   │
│  □ 「假装」是可以接受的（如有需要可硬编码）                        │
│  □ 不要优化或过度设计                                            │
│  □ 测试现在通过                                                  │
│  □ 所有其他测试仍然通过                                          │
├─────────────────────────────────────────────────────────────────┤
│  🔵 重构阶段                                                     │
│  □ 消除重复（DRY）                                               │
│  □ 改善命名                                                      │
│  □ 如有需要提取方法                                              │
│  □ 「每次」变更后执行测试                                         │
│  □ 没有新增功能                                                  │
│  □ 所有测试仍然通过                                              │
└─────────────────────────────────────────────────────────────────┘
```

### FIRST 原则快速参考

| 原则 | 检查 | 常见违规 |
|------|------|---------|
| **F**ast（快速） | 每个单元测试 < 100ms | 资料库呼叫、档案 I/O、网路 |
| **I**ndependent（独立） | 无共享状态 | 静态变数、执行顺序依赖 |
| **R**epeatable（可重复） | 结果总是相同 | DateTime.Now、Random、外部服务 |
| **S**elf-validating（自我验证） | 清楚的通过/失败 | 手动检查日志、无断言 |
| **T**imely（及时） | 程式码之前测试 | 实现后才写测试 |

### 反模式快速侦测

| 症状 | 可能的反模式 | 快速修复 |
|------|-------------|---------|
| 重构时测试失败 | 测试实作细节 | 只测试行为 |
| 测试通过但生产环境有 bug | 过度 mock | 新增整合测试 |
| 随机测试失败 | 测试相依性 | 隔离测试状态 |
| 测试套件缓慢 | 整合测试太多 | 增加单元测试比例 |
| 团队回避写测试 | 测试设置复杂 | 用建构器简化 |

---

## TDD vs BDD vs ATDD 快速参考

| 面向 | TDD | BDD | ATDD |
|------|-----|-----|------|
| **谁撰写** | 开发者 | 开发者 + BA + QA | 所有利益相关者 |
| **语言** | 程式码 | Gherkin（Given-When-Then） | 业务语言 |
| **层级** | 单元/元件 | 功能/场景 | 验收 |
| **时机** | 编码期间 | 编码之前 | Sprint 之前 |

### 何时使用哪个

```
是技术实作细节吗？
├─ 是 → TDD
└─ 否 → 有业务利益相关者吗？
         ├─ 是 → 利益相关者需要阅读/验证测试吗？
         │        ├─ 是 → ATDD → BDD → TDD
         │        └─ 否 → BDD → TDD
         └─ 否 → TDD
```

---

## 工作流协助

### 红色阶段指导

撰写失败测试时，确保：

1. **清楚的意图**
   ```typescript
   // ❌ 模糊
   test('it works', () => { ... });

   // ✅ 清楚
   test('should calculate discount when order total exceeds threshold', () => { ... });
   ```

2. **单一行为**
   ```typescript
   // ❌ 多个行为
   test('should validate and save user', () => { ... });

   // ✅ 单一行为
   test('should reject invalid email format', () => { ... });
   test('should save user with valid data', () => { ... });
   ```

3. **正确的断言**
   ```typescript
   // ❌ 无断言
   test('should process order', () => {
     orderService.process(order);
     // 缺少断言！
   });

   // ✅ 清楚的断言
   test('should mark order as processed', () => {
     const result = orderService.process(order);
     expect(result.status).toBe('processed');
   });
   ```

### 绿色阶段指导

让测试通过时，记住：

1. **最少实现**
   ```typescript
   // 测试：should return "FizzBuzz" for numbers divisible by both 3 and 5

   // ❌ 过度设计的第一次实现
   function fizzBuzz(n: number): string {
     const divisibleBy3 = n % 3 === 0;
     const divisibleBy5 = n % 5 === 0;
     if (divisibleBy3 && divisibleBy5) return 'FizzBuzz';
     if (divisibleBy3) return 'Fizz';
     if (divisibleBy5) return 'Buzz';
     return n.toString();
   }

   // ✅ 当前测试的最少实现（假装！）
   function fizzBuzz(n: number): string {
     return 'FizzBuzz'; // 刚好足够通过「这个」测试
   }
   ```

2. **渐进式泛化**
   - 第一个测试：硬编码答案
   - 第二个测试：新增简单条件
   - 第三个测试：泛化模式

### 重构阶段指导

安全重构检查清单：

```
之前：
□ 所有测试都是绿色
□ 理解程式码在做什么

期间（一次一个）：
□ 提取方法 → 执行测试
□ 重新命名 → 执行测试
□ 消除重复 → 执行测试
□ 简化条件 → 执行测试

之后：
□ 所有测试仍然绿色
□ 程式码更干净
□ 没有新功能
```

---

## 与 SDD 整合

使用规格驱动开发时：

### Spec → 测试映射

| Spec 区段 | 测试类型 |
|----------|---------|
| 验收标准 | 验收测试（ATDD/BDD） |
| 业务规则 | 单元测试（TDD） |
| 边界情况 | 单元测试（TDD） |
| 整合点 | 整合测试 |

### 工作流程

```
1. 阅读 Spec (SPEC-XXX)
   ↓
2. 识别验收标准
   ↓
3. 撰写 BDD 场景（如适用）
   ↓
4. 对每个场景：
   ├─ TDD：红 → 绿 → 重构
   └─ 标记 AC 为已实现
   ↓
5. 所有 AC 已实现？
   ├─ 是 → 标记 Spec 为完成
   └─ 否 → 返回步骤 4
```

### 测试文件参考

```typescript
/**
 * SPEC-001：使用者验证 的测试
 *
 * 验收标准：
 * - AC-1：使用者可以用有效凭证登入
 * - AC-2：无效密码显示错误
 * - AC-3：3 次失败尝试后帐号锁定
 */
describe('使用者验证 (SPEC-001)', () => {
  // 依 AC 组织测试
});
```

---

## 配置侦测

此技能支援专案特定配置。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 的「Disabled Skills」区段
   - 如果此技能在列表中，则对此专案停用
2. 检查 `CONTRIBUTING.md` 的「TDD Standards」区段
3. 检查程式码库中现有的测试模式
4. 如果未找到，**预设使用标准 TDD 实践**

### 首次设置

如果未找到配置且情境不明确：

1. 询问：「此专案尚未配置 TDD 偏好。您偏好哪种方法？」
   - 纯 TDD（红-绿-重构）
   - BDD 风格 TDD（Given-When-Then）
   - ATDD 搭配 BDD 和 TDD

2. 选择后，建议在 `CONTRIBUTING.md` 中文件化：

```markdown
## TDD 标准

### 偏好方法
- 主要：TDD（红-绿-重构）
- 对于有业务利益相关者的功能：BDD

### 测试命名惯例
- 模式：`should_[行为]_when_[条件]`
- 范例：`should_return_error_when_email_invalid`

### 覆盖率目标
- 单元：80%
- 整合：60%
```

---

## 详细指南

完整标准请参阅：
- [TDD 核心标准](../../../../../core/test-driven-development.md)
- [TDD 工作流程指南](./tdd-workflow.md)
- [语言范例](./language-examples.md)

相关测试标准：
- [测试标准](../../../../../core/testing-standards.md)
- [测试完整性维度](../../../../../core/test-completeness-dimensions.md)

---

## 相关标准

- [测试驱动开发](../../../../../core/test-driven-development.md) - TDD 核心标准
- [测试标准](../../../../../core/testing-standards.md) - 测试框架
- [测试完整性维度](../../../../../core/test-completeness-dimensions.md) - 7 维度
- [规格驱动开发](../../../../../core/spec-driven-development.md) - SDD 整合
- [测试指南技能](../testing-guide/SKILL.md) - 测试指南
- [测试覆盖率助手](../test-coverage-assistant/SKILL.md) - 覆盖率协助

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-07 | 初始版本 |

---

## 授权

此技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
