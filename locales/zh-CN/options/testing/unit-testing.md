---
source: ../../../../options/testing/unit-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 单元测试

> **语言**: [English](../../../../options/testing/unit-testing.md) | 繁体中文

**上层标准**: [测试指南](../../../../core/testing-standards.md)

---

## 概述

单元测试验证程式码的个别单元（函式、方法、类别）在隔离状态下正确运作。单元测试是测试金字塔的基础，提供快速回馈并实现安全的重构。

## 特性

| 属性 | 值 |
|------|------|
| 范围 | 单一函式、方法或类别 |
| 相依性 | 模拟或替身 |
| 执行速度 | 毫秒等级 |
| 隔离性 | 完全隔离于外部系统 |
| 数量 | 最多的测试 |

## 适用情境

- 测试纯函式和业务逻辑
- 验证边界案例和错误处理
- 实现安全重构
- 记录程式码行为
- 快速的 CI/CD 回馈

## 测试金字塔位置

```
        /\
       /  \      E2E 测试（少）
      /----\
     /      \    整合测试（中）
    /--------\
   /          \  单元测试（多）← 这一层
  /------------\
```

## 结构：Arrange-Act-Assert

```javascript
// JavaScript/TypeScript 范例
describe('calculateDiscount', () => {
  it('should apply 10% discount for orders over $100', () => {
    // Arrange（安排）
    const orderTotal = 150;
    const discountThreshold = 100;
    const discountRate = 0.10;

    // Act（执行）
    const result = calculateDiscount(orderTotal, discountThreshold, discountRate);

    // Assert（验证）
    expect(result).toBe(15);
  });
});
```

## 应该测试什么

### 应该测试

| 类别 | 范例 |
|------|------|
| 纯函式 | 数学计算、字串转换 |
| 业务逻辑 | 验证规则、价格计算 |
| 边界案例 | 空阵列、null 值、边界条件 |
| 错误条件 | 无效输入、例外抛出 |
| 状态转换 | 物件状态变更 |

### 不应该测试

| 类别 | 原因 |
|------|------|
| 私有方法 | 透过公开介面测试 |
| 框架程式码 | 已被框架测试 |
| 简单 getter/setter | 无逻辑可验证 |
| 外部系统 | 使用整合测试 |

## 模拟指南

### 何时使用模拟

```javascript
// 模拟外部相依性
const mockDatabase = {
  findUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
};

const userService = new UserService(mockDatabase);
```

### 何时不使用模拟

- 不要模拟被测试的单元
- 不要模拟简单的值物件
- 不要模拟所有东西——某些真实物件是可以的

## 测试命名惯例

```javascript
// 行为导向
it('should return null when user is not found')
// 当找不到使用者时应该回传 null

// Given-When-Then
it('given an invalid email, when validating, then throws ValidationError')
// 给定无效的 email，当验证时，抛出 ValidationError

// Method_Scenario_Expectation
it('validateEmail_withInvalidFormat_throwsError')
```

## 覆盖率指南

| 指标 | 目标 | 备注 |
|------|------|------|
| 行覆盖率 | 80%+ | 最低门槛 |
| 分支覆盖率 | 75%+ | 覆盖条件路径 |
| 函式覆盖率 | 90%+ | 所有公开函式 |
| 关键路径 | 100% | 付款、验证、资料处理 |

### 覆盖率注意事项

- 高覆盖率 ≠ 好测试
- 专注于有意义的测试，而非覆盖率数字
- 关键程式码值得 100% 覆盖
- 不要只为了覆盖率测试琐碎程式码

## 常见框架

| 语言 | 框架 | 备注 |
|------|------|------|
| JavaScript | Jest | 最受欢迎，内建模拟 |
| JavaScript | Vitest | 快速，Vite 相容 |
| Python | pytest | 弹性，丰富插件 |
| Java | JUnit 5 | Java 标准 |
| C# | xUnit | 现代、可扩展 |
| Go | testing | 内建套件 |

## 相关选项

- [整合测试](./integration-testing.md) - 测试元件互动
- [系统测试](./system-testing.md) - 测试完整系统
- [E2E 测试](./e2e-testing.md) - 测试使用者流程

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
