---
source: ../../../../options/testing/unit-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: a6f360d666c8
status: current
---

# 单元测试

> **语言**: [English](../../../../options/testing/unit-testing.md) | 简体中文

**上层标准**: [测试指南](../../core/testing-standards.md)

---

## 概览

单元测试验证单个代码单元（函数、方法、类）在隔离状态下能正确运作。单元测试是测试金字塔的基础，能提供快速反馈，让重构更有把握。

## 特性

| 属性 | 值 |
|-----------|-------|
| 范围 | 单个函数、方法或类 |
| 依赖 | 以 mock 或 stub 替代 |
| 执行速度 | 毫秒级 |
| 隔离程度 | 与外部系统完全隔离 |
| 数量 | 测试数量最多 |

## 最适用于

- 测试纯函数与业务逻辑
- 验证边界情况与错误处理
- 让重构更安全
- 记录代码行为
- 快速的 CI/CD 反馈

## 在测试金字塔中的位置

```
        /\
       /  \      E2E Tests (few)
      /----\
     /      \    Integration Tests (some)
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

单元测试构成底层：快速、数量多且聚焦。

## 结构：Arrange-Act-Assert

```javascript
// JavaScript/TypeScript example
describe('calculateDiscount', () => {
  it('should apply 10% discount for orders over $100', () => {
    // Arrange
    const orderTotal = 150;
    const discountThreshold = 100;
    const discountRate = 0.10;

    // Act
    const result = calculateDiscount(orderTotal, discountThreshold, discountRate);

    // Assert
    expect(result).toBe(15);
  });
});
```

```python
# Python example
def test_calculate_discount_applies_ten_percent_for_orders_over_100():
    # Arrange
    order_total = 150
    discount_threshold = 100
    discount_rate = 0.10

    # Act
    result = calculate_discount(order_total, discount_threshold, discount_rate)

    # Assert
    assert result == 15
```

## 测试什么

### 应该测试

| 类别 | 示例 |
|----------|---------|
| 纯函数 | 数学计算、字符串转换 |
| 业务逻辑 | 验证规则、价格计算 |
| 边界情况 | 空数组、null 值、边界条件 |
| 错误条件 | 无效输入、抛出异常 |
| 状态转换 | 对象状态变化 |

### 不应测试

| 类别 | 原因 |
|----------|-----|
| 私有方法 | 通过公开接口测试 |
| 框架代码 | 框架已自行测试 |
| 简单的 getter/setter | 没有需要验证的逻辑 |
| 外部系统 | 使用集成测试 |
| 配置 | 测试行为，而非配置 |

## Mock 指南

### 何时使用 Mock

```javascript
// Mock external dependencies
const mockDatabase = {
  findUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
};

const userService = new UserService(mockDatabase);
```

### 何时不该使用 Mock

```javascript
// Don't mock the unit under test
// Don't mock simple value objects
// Don't mock everything - some real objects are fine
```

### Mock 类型

| 类型 | 用途 | 示例 |
|------|---------|---------|
| Stub | 返回固定值 | `mockFn.mockReturnValue(42)` |
| Mock | 验证交互 | `expect(mockFn).toHaveBeenCalled()` |
| Spy | 观察真实实现 | `jest.spyOn(obj, 'method')` |
| Fake | 简化的实现 | 内存数据库 |

## 测试命名规范

### 格式选项

```javascript
// Behavior-focused
it('should return null when user is not found')

// Given-When-Then
it('given an invalid email, when validating, then throws ValidationError')

// Method_Scenario_Expectation
it('validateEmail_withInvalidFormat_throwsError')
```

### 好的命名

```javascript
it('calculates tax correctly for multiple items')
it('throws error when dividing by zero')
it('returns empty array when no matches found')
```

### 不好的命名

```javascript
it('test1')
it('works')
it('should work correctly')
```

## 覆盖率指南

| 指标 | 目标 | 说明 |
|--------|--------|-------|
| 行覆盖率（Line Coverage） | 80%+ | 最低门槛 |
| 分支覆盖率（Branch Coverage） | 75%+ | 覆盖条件路径 |
| 函数覆盖率（Function Coverage） | 90%+ | 所有公开函数 |
| 关键路径 | 100% | 支付、认证、数据处理 |

### 覆盖率注意事项

- 高覆盖率 ≠ 好的测试
- 专注于有意义的测试，而非覆盖率数字
- 关键代码值得 100% 覆盖
- 不要只为了覆盖率而测试琐碎的代码

## 最佳实践

### 1. 每个测试一个断言（理想情况）

```javascript
// Good: Focused test
it('should return user name', () => {
  const user = new User('John');
  expect(user.getName()).toBe('John');
});

// Acceptable: Related assertions
it('should create valid user', () => {
  const user = new User('John', 'john@example.com');
  expect(user.getName()).toBe('John');
  expect(user.getEmail()).toBe('john@example.com');
});
```

### 2. 测试行为，而非实现

```javascript
// Good: Tests behavior
it('should mark order as paid', () => {
  order.pay();
  expect(order.isPaid()).toBe(true);
});

// Bad: Tests implementation detail
it('should set _paid flag to true', () => {
  order.pay();
  expect(order._paid).toBe(true);
});
```

### 3. 保持测试彼此独立

```javascript
// Bad: Test depends on previous test
let user;
it('should create user', () => {
  user = createUser();
});
it('should update user', () => {
  user.update({ name: 'New' }); // Depends on previous test!
});

// Good: Each test is independent
it('should update user name', () => {
  const user = createUser();
  user.update({ name: 'New' });
  expect(user.name).toBe('New');
});
```

### 4. 使用具描述性的测试数据

```javascript
// Bad
const user = { a: 'b', c: 'd' };

// Good
const validUser = {
  name: 'John Doe',
  email: 'john@example.com'
};
```

## 常见框架

| 语言 | 框架 | 说明 |
|----------|-----------|-------|
| JavaScript | Jest | 最流行，内置 mock 功能 |
| JavaScript | Vitest | 快速，兼容 Vite |
| Python | pytest | 灵活，插件丰富 |
| Java | JUnit 5 | Java 的标准框架 |
| C# | xUnit | 现代化、可扩展 |
| Go | testing | 内置包 |

## 相关选项

- [集成测试](./integration-testing.md) - 测试组件间的交互
- [系统测试](./system-testing.md) - 测试完整系统
- [E2E 测试](./e2e-testing.md) - 测试用户工作流程

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
