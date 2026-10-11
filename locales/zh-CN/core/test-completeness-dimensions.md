---
source: ../../../core/test-completeness-dimensions.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 13876de2fdea
status: current
---

# 测试完整性维度

**版本**: 1.1.0
**最后更新**: 2026-01-24
**适用范围**: 所有有测试需求的软件项目
**范围**: universal
**行业标准**: ISTQB AI Testing Syllabus
**参考资料**: [istqb.org](https://istqb.org/certifications/certified-tester-ai-testing-ct-ai/)

[English](../../../core/test-completeness-dimensions.md) | [繁體中文](../../zh-TW/core/test-completeness-dimensions.md) | 简体中文

---

## 目的

本文档定义评估测试完整性的系统性框架。为开发者提供检查清单，确保测试在多个维度上得到全面覆盖。

---

## 八个维度

完整的测试套件应为每个功能涵盖以下 8 个维度：

```
┌─────────────────────────────────────────────────────────────┐
│              Test Completeness = 8 Dimensions                │
├─────────────────────────────────────────────────────────────┤
│  1. Happy Path        Normal expected behavior              │
│  2. Boundary          Min/max values, limits                │
│  3. Error Handling    Invalid input, exceptions             │
│  4. Authorization     Role-based access control             │
│  5. State Changes     Before/after verification             │
│  6. Validation        Format, business rules                │
│  7. Integration       Real query verification               │
│  8. AI Generation     AI-generated test quality (NEW)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 维度详解

### 1. 正向路径

使用有效输入测试正常的预期流程。

**测试内容**：
- 有效输入产生预期输出
- 成功状态码/响应
- 数据被正确创建/修改
- 副作用如预期发生

**示例**：
```csharp
[Fact]
public async Task CreateUser_WithValidData_ReturnsSuccess()
{
    // Arrange
    var request = new CreateUserRequest
    {
        Username = "newuser",
        Email = "user@example.com",
        Password = "SecurePass123!"
    };

    // Act
    var result = await _service.CreateUserAsync(request);

    // Assert
    result.Success.Should().BeTrue();
    result.Data.Username.Should().Be("newuser");
}
```

---

### 2. 边界条件

测试有效范围边缘的值。

**测试内容**：
- 最小有效值
- 最大有效值
- 略小于最小值（无效）
- 略大于最大值（无效）
- 空集合 vs. 单一项目 vs. 多个项目

**示例**：
```csharp
[Theory]
[InlineData(0, false)]      // Below minimum
[InlineData(1, true)]       // Minimum valid
[InlineData(100, true)]     // Maximum valid
[InlineData(101, false)]    // Above maximum
public void ValidateQuantity_BoundaryValues_ReturnsExpected(
    int quantity, bool expected)
{
    var result = _validator.IsValidQuantity(quantity);
    result.Should().Be(expected);
}

[Fact]
public async Task BatchProcess_ExceedingLimit_ReturnsError()
{
    // Arrange - Create 1001 items (limit is 1000)
    var items = Enumerable.Range(1, 1001)
        .Select(i => new Item { Id = i })
        .ToList();

    // Act
    var result = await _service.ProcessBatchAsync(items);

    // Assert
    result.Success.Should().BeFalse();
    result.ErrorCode.Should().Be("LIMIT_EXCEEDED");
}
```

---

### 3. 错误处理

测试系统如何处理无效输入和异常状况。

**测试内容**：
- 无效输入格式
- 缺少必填字段
- 重复数据冲突
- 资源未找到
- 外部服务故障

**示例**：
```csharp
[Fact]
public async Task CreateUser_DuplicateEmail_ReturnsConflict()
{
    // Arrange
    var request = new CreateUserRequest
    {
        Email = "existing@example.com"  // Already exists
    };

    // Act
    var result = await _service.CreateUserAsync(request);

    // Assert
    result.Success.Should().BeFalse();
    result.ErrorCode.Should().Be("DUPLICATE_EMAIL");
}

[Fact]
public async Task GetUser_NotFound_ReturnsNotFoundError()
{
    // Arrange
    var nonExistentId = 99999;

    // Act
    var result = await _service.GetUserAsync(nonExistentId);

    // Assert
    result.Should().BeNull();
}

[Fact]
public async Task CreateUser_MissingRequiredFields_ReturnsValidationError()
{
    // Arrange
    var request = new CreateUserRequest
    {
        Username = "",  // Required but empty
        Email = null    // Required but null
    };

    // Act
    var result = await _service.CreateUserAsync(request);

    // Assert
    result.Success.Should().BeFalse();
    result.ErrorCode.Should().Be("VALIDATION_ERROR");
}
```

---

### 4. 权限验证

测试每个操作的基于角色的访问控制。

**测试内容**：
- 每个角色允许的操作
- 每个角色被拒绝的操作
- 未认证访问
- 跨租户/跨用户数据访问

**权限测试矩阵**：

为每个功能建立矩阵：

| 操作 | Admin | Manager | Member | Guest |
|------|-------|---------|--------|-------|
| Create | ✅ | ✅ | ❌ | ❌ |
| Read All | ✅ | ⚠️ Scoped | ❌ | ❌ |
| Update | ✅ | ⚠️ Own dept | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |

每个单元格都应有对应的测试用例。

**示例**：
```csharp
[Fact]
public async Task DeleteUser_AsAdmin_Succeeds()
{
    // Arrange
    var adminContext = CreateContext(role: "Admin");

    // Act
    var result = await _service.DeleteUserAsync(userId, adminContext);

    // Assert
    result.Success.Should().BeTrue();
}

[Fact]
public async Task DeleteUser_AsMember_ReturnsForbidden()
{
    // Arrange
    var memberContext = CreateContext(role: "Member");

    // Act
    var result = await _service.DeleteUserAsync(userId, memberContext);

    // Assert
    result.Success.Should().BeFalse();
    result.ErrorCode.Should().Be("FORBIDDEN");
}

[Fact]
public async Task GetUsers_AsManager_ReturnsOnlyDepartmentMembers()
{
    // Arrange
    var managerContext = CreateContext(role: "Manager", deptId: 5);

    // Act
    var result = await _service.GetUsersAsync(managerContext);

    // Assert
    result.Data.Should().AllSatisfy(u => u.DeptId.Should().Be(5));
}
```

---

### 5. 状态转换

验证操作是否正确修改系统状态。

**测试内容**：
- 操作前的状态
- 操作后的状态
- 状态转换（enabled → disabled，pending → approved）
- 幂等性（重复操作得到相同结果）

**示例**：
```csharp
[Fact]
public async Task DisableUser_UpdatesStateCorrectly()
{
    // Arrange
    var user = await CreateEnabledUser();
    user.IsEnabled.Should().BeTrue();  // Verify initial state

    // Act
    await _service.DisableUserAsync(user.Id);

    // Assert
    var updatedUser = await _repository.GetByIdAsync(user.Id);
    updatedUser.IsEnabled.Should().BeFalse();  // Verify final state
    updatedUser.DisabledAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
}

[Fact]
public async Task EnableUser_FromDisabledState_UpdatesStateCorrectly()
{
    // Arrange
    var user = await CreateDisabledUser();
    user.IsEnabled.Should().BeFalse();  // Verify initial state

    // Act
    await _service.EnableUserAsync(user.Id);

    // Assert
    var updatedUser = await _repository.GetByIdAsync(user.Id);
    updatedUser.IsEnabled.Should().BeTrue();
}
```

---

### 6. 验证逻辑

测试业务规则和格式验证。

**测试内容**：
- 格式验证（email、phone 等）
- 业务规则验证
- 跨字段验证
- 特定领域约束

**示例**：
```csharp
[Theory]
[InlineData("user@example.com", true)]
[InlineData("invalid-email", false)]
[InlineData("", false)]
[InlineData(null, false)]
public void ValidateEmail_VariousFormats_ReturnsExpected(
    string email, bool expected)
{
    var result = _validator.IsValidEmail(email);
    result.Should().Be(expected);
}

[Fact]
public async Task CreateUser_InvalidUsernameFormat_ReturnsValidationError()
{
    // Arrange - Username contains special characters
    var request = new CreateUserRequest
    {
        Username = "invalid@user!",  // Only alphanumeric allowed
        Email = "valid@example.com"
    };

    // Act
    var result = await _service.CreateUserAsync(request);

    // Assert
    result.Success.Should().BeFalse();
    result.Errors.Should().Contain(e => e.Field == "Username");
}

[Fact]
public async Task CreateOrder_QuantityExceedsStock_ReturnsBusinessRuleError()
{
    // Arrange
    var product = await CreateProduct(stockQuantity: 10);
    var request = new CreateOrderRequest
    {
        ProductId = product.Id,
        Quantity = 15  // Exceeds available stock
    };

    // Act
    var result = await _service.CreateOrderAsync(request);

    // Assert
    result.Success.Should().BeFalse();
    result.ErrorCode.Should().Be("INSUFFICIENT_STOCK");
}
```

---

### 7. 集成验证

验证实际的数据库查询和外部集成是否正确运作。

**何时需要**：

根据[测试标准](testing-standards.md)（或 `/testing-guide` 技能），如果单元测试对查询参数使用通配匹配器（`It.IsAny<>`、`any()`、`Arg.Any<>`），则必须有集成测试。

**测试内容**：
- 查询谓词返回正确数据
- 实体关联被正确加载
- 分页正确运作
- 排序和筛选正确运作

**示例**：
```csharp
// Unit test - cannot verify query logic
[Fact]
public async Task GetActiveUsers_MockedRepository_ReturnsUsers()
{
    // ⚠️ This test uses It.IsAny<> - needs integration test!
    _repoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
        .ReturnsAsync(users);

    var result = await _service.GetActiveUsersAsync();
    result.Should().NotBeEmpty();
}

// ✅ Integration test - verifies actual query
[Fact]
public async Task GetActiveUsers_RealDatabase_ReturnsOnlyActiveUsers()
{
    // Arrange - Seed database with mixed data
    await SeedUsers(
        new User { Name = "Active1", IsActive = true },
        new User { Name = "Active2", IsActive = true },
        new User { Name = "Inactive", IsActive = false }
    );

    // Act
    var result = await _service.GetActiveUsersAsync();

    // Assert
    result.Should().HaveCount(2);
    result.Should().AllSatisfy(u => u.IsActive.Should().BeTrue());
    result.Should().NotContain(u => u.Name == "Inactive");
}
```

---

### 8. AI 生成质量

评估 AI 生成测试的质量与有效性。

**为何此维度重要**：

AI 编程助手可以快速生成测试，但数量 ≠ 质量。此维度确保 AI 生成的测试提供真正的价值。

**质量评估标准**：

| 标准 | 低质量 | 高质量 |
|------|--------|--------|
| **测试目的** | 测试显而易见的 getter/setter | 测试业务逻辑与边界情况 |
| **断言深度** | 仅有 `result != null` | 验证具体的值与状态 |
| **独立性** | 测试依赖执行顺序 | 每个测试自给自足 |
| **命名** | `test1`、`test2` | 描述性名称：`should_reject_invalid_email` |
| **覆盖意图** | 覆盖代码行而非行为 | 有意义地覆盖所有代码路径 |

**AI 测试生成检查清单**：

```
□ Test Purpose Verification
  □ Does the test verify meaningful behavior?
  □ Would a bug cause the test to fail?
  □ Is the test testing the right thing?

□ Assertion Quality
  □ Are assertions specific (not just "not null")?
  □ Do assertions verify the expected output values?
  □ Are edge cases in assertions covered?

□ Test Independence
  □ Can tests run in any order?
  □ Does each test set up its own data?
  □ No shared mutable state between tests?

□ Mutation Score
  □ Would mutations in the code be caught?
  □ Does the test fail when logic is changed?
```

**示例 - 评估 AI 生成的测试**：

```csharp
// ❌ Poor AI-generated test - tests almost nothing
[Fact]
public void CalculateDiscount_Test()
{
    var service = new PricingService();
    var result = service.CalculateDiscount(100, "VIP");
    Assert.NotNull(result);  // Only checks not null!
}

// ✅ Good test - verifies specific business logic
[Fact]
public void CalculateDiscount_VipCustomer_Returns20PercentDiscount()
{
    // Arrange
    var service = new PricingService();
    var originalPrice = 100m;
    var customerType = "VIP";

    // Act
    var result = service.CalculateDiscount(originalPrice, customerType);

    // Assert
    result.DiscountAmount.Should().Be(20m);       // VIP gets 20%
    result.FinalPrice.Should().Be(80m);
    result.DiscountType.Should().Be("VIP_DISCOUNT");
}
```

**AI 测试质量指标**：

| 指标 | 目标 | 测量方式 |
|------|------|---------|
| 变异分数 | > 80% | 被杀死的变异 / 变异总数 |
| 断言密度 | 每个测试 > 2 | 断言数 / 测试数 |
| 行为覆盖率 | 100% | 已测试的业务规则 / 规则总数 |
| 边界情况覆盖率 | > 90% | 已测试的边界情况 / 已识别的边界情况 |

---

## Mutation Testing

### 概述

Mutation Testing（变异测试）通过对代码引入微小改动（变异），并检查测试是否能捕获这些改动，来验证测试的有效性。

```
┌─────────────────────────────────────────────────────────────┐
│                    Mutation Testing Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Original Code    Mutate        Mutated Code               │
│   ──────────────   ──────►       ──────────────             │
│   if (x > 0)                     if (x >= 0)  ← mutation    │
│                                                              │
│                    Run Tests                                 │
│                    ──────────►                               │
│                                                              │
│   Test FAILS?     → Mutation KILLED ✅ (test is effective)  │
│   Test PASSES?    → Mutation SURVIVED ❌ (test is weak)     │
│                                                              │
│   Mutation Score = Killed / Total Mutations                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 常见变异操作符

| 操作符 | 原始 | 变异后 | 测试应捕获 |
|--------|------|--------|-----------|
| 边界 | `>` | `>=` | 差一错误（off-by-one） |
| 取反 | `true` | `false` | 布尔逻辑 |
| 算术 | `+` | `-` | 数学运算 |
| 返回值 | `return x` | `return null` | 返回值的使用 |
| 移除调用 | `validate()` | （已移除） | 副作用 |
| 常量 | `0` | `1` | 魔术数字的使用 |

### Mutation Testing 工具

| 语言 | 工具 | 链接 |
|------|------|------|
| Java | PIT | https://pitest.org/ |
| JavaScript/TypeScript | Stryker | https://stryker-mutator.io/ |
| C# | Stryker.NET | https://stryker-mutator.io/docs/stryker-net/ |
| Python | mutmut | https://github.com/boxed/mutmut |
| Go | go-mutesting | https://github.com/zimmski/go-mutesting |

### 结果解读

| 变异分数 | 解读 | 行动 |
|----------|------|------|
| > 90% | 优秀 | 维持此水平 |
| 80-90% | 良好 | 检查存活的变异 |
| 60-80% | 尚可 | 补充缺失的测试用例 |
| < 60% | 较差 | 存在明显的测试缺口 |

### 示例：Stryker 配置

```json
// stryker.config.json (JavaScript/TypeScript)
{
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts"
  ],
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  }
}
```

### 何时使用 Mutation Testing

| 场景 | 建议 |
|------|------|
| 关键业务逻辑 | ✅ 是 |
| 安全敏感代码 | ✅ 是 |
| AI 生成测试之后 | ✅ 是 |
| 简单 CRUD 操作 | ⚠️ 可选 |
| UI/展示层代码 | ❌ 通常不值得 |

---

## 测试用例设计清单

对每个功能使用此清单以确保完整性：

```
Feature: ___________________

□ Happy Path
  □ Valid input produces expected success
  □ Correct data is returned/created
  □ Side effects occur as expected

□ Boundary Conditions
  □ Minimum valid value
  □ Maximum valid value
  □ Empty collection
  □ Single item collection
  □ Large collection (if applicable)

□ Error Handling
  □ Invalid input format
  □ Missing required fields
  □ Duplicate/conflict scenarios
  □ Not found scenarios
  □ External service failure (if applicable)

□ Authorization
  □ Each permitted role tested
  □ Each denied role tested
  □ Unauthenticated access tested
  □ Cross-boundary access tested

□ State Changes
  □ Initial state verified
  □ Final state verified
  □ All valid state transitions tested

□ Validation
  □ Format validation (email, phone, etc.)
  □ Business rule validation
  □ Cross-field validation

□ Integration (if UT uses wildcards)
  □ Query predicates verified
  □ Entity relationships verified
  □ Pagination verified
  □ Sorting/filtering verified

□ AI Generation Quality (if AI-generated)
  □ Tests verify meaningful behavior
  □ Assertions are specific (not just "not null")
  □ Mutation score > 80%
  □ Edge cases covered
```

---

## 错误码覆盖矩阵

对于有定义错误码的 API，确保每个错误码都有测试：

| 代码 | 意义 | 测试场景 |
|------|------|----------|
| 200 | 成功 | 正向路径测试 |
| 400 | 错误请求 | 无效格式、缺少字段 |
| 401 | 未认证 | 无效/缺少 token |
| 403 | 禁止访问 | 有效 token、权限不足 |
| 404 | 未找到 | 不存在的资源 |
| 409 | 冲突 | 重复数据 |
| 422 | 无法处理 | 违反业务规则 |
| 500 | 服务器错误 | 异常处理 |

---

## 何时应用各维度

并非所有维度都适用于每个功能。使用此指南：

| 功能类型 | 必需维度 |
|---------|---------|
| CRUD API | 1, 2, 3, 4, 6, 7, 8* |
| 查询/搜索 | 1, 2, 3, 4, 7, 8* |
| 状态机 | 1, 3, 4, 5, 6, 8* |
| 验证 | 1, 2, 3, 6, 8* |
| 后台任务 | 1, 3, 5, 8* |
| 外部集成 | 1, 3, 7, 8* |

*维度 8（AI 生成质量）仅在测试由 AI 生成时适用

---

## 反模式

避免这些常见错误：

```
❌ Testing only happy path

❌ Missing authorization tests for multi-role systems

❌ Not verifying state changes

❌ Using wildcards in UT without corresponding IT

❌ Same values for ID and business identifier in test data

❌ Testing implementation details instead of behavior

❌ Accepting AI-generated tests without review

❌ Assuming high line coverage means effective tests

❌ Skipping mutation testing for critical code
```

---

## 相关标准

- [测试驱动开发](test-driven-development.md) - TDD/BDD/ATDD 方法论
- [测试标准](testing-standards.md) - 核心测试标准（或使用 `/testing-guide` 技能）
- [代码审查检查清单](code-review-checklist.md) - 审查测试完整性
- [签入标准](checkin-standards.md) - 提交前测试要求

---

## 参考资料

- [ISTQB AI Testing Syllabus](https://www.istqb.org/certifications/ai-testing) - 基础级 AI 测试认证
- [Stryker Mutation Testing](https://stryker-mutator.io/) - 多语言 Mutation Testing 框架
- [PIT Mutation Testing](https://pitest.org/) - Java Mutation Testing
- [Google Testing Blog - Mutation Testing](https://testing.googleblog.com/2021/04/mutation-testing.html) - Google 对 Mutation Testing 的观点
- [ISTQB Foundation Level Syllabus](https://www.istqb.org/certifications/certified-tester-foundation-level) - 核心测试概念

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-24 | 新增：第 8 维度（AI 生成质量）、Mutation Testing 章节 |
| 1.0.0 | 2025-12-24 | 初始发布，包含 7 维度框架 |

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

---

**维护者**: 开发团队
