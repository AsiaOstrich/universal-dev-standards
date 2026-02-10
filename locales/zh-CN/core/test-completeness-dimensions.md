---
source: ../../../core/test-completeness-dimensions.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-24
status: current
---

# 测试完整性维度

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: 所有需要测试的软体专案

[English](../../core/test-completeness-dimensions.md) | [繁体中文](.)

---

## 目的

本文件定义评估测试完整性的系统性框架。为开发者提供检核清单，确保测试覆盖多个维度。

---

## 八个维度

完整的测试套件应为每个功能涵盖以下 8 个维度：

```
┌──────────────────────────────────────────────────────────────────┐
│                    测试完整性 = 8 个维度                           │
├──────────────────────────────────────────────────────────────────┤
│  1. 正向路径          正常预期行为                                 │
│  2. 边界条件          最小/最大值、限制                            │
│  3. 错误处理          无效输入、异常状况                           │
│  4. 权限验证          角色访问控制                                 │
│  5. 状态转换          前后验证                                     │
│  6. 验证逻辑          格式、业务规则                               │
│  7. 集成验证          实际查询验证                                 │
│  8. AI 生成质量       AI 测试的有效性评估                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 维度详解

### 1. 正向路径

测试使用有效输入的正常预期流程。

**测试内容**:
- 有效输入产生预期输出
- 成功状态码/回应
- 资料正确建立/修改
- 副作用如预期发生

**范例**:
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

**测试内容**:
- 最小有效值
- 最大有效值
- 略小于最小值（无效）
- 略大于最大值（无效）
- 空集合 vs. 单一项目 vs. 多个项目

**范例**:
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

**测试内容**:
- 无效输入格式
- 缺少必填栏位
- 重复资料冲突
- 资源未找到
- 外部服务故障

**范例**:
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

测试每个操作的角色存取控制。

**测试内容**:
- 每个角色允许的操作
- 每个角色拒绝的操作
- 未认证存取
- 跨租户/跨使用者资料存取

**权限测试矩阵**:

为每个功能建立矩阵：

| 操作 | Admin | Manager | Member | Guest |
|------|-------|---------|--------|-------|
| Create | ✅ | ✅ | ❌ | ❌ |
| Read All | ✅ | ⚠️ Scoped | ❌ | ❌ |
| Update | ✅ | ⚠️ Own dept | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |

每个储存格应有对应的测试案例。

**范例**:
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

验证操作正确修改系统状态。

**测试内容**:
- 操作前状态
- 操作后状态
- 状态转换（enabled → disabled, pending → approved）
- 幂等性（重复操作有相同结果）

**范例**:
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

**测试内容**:
- 格式验证（email、phone 等）
- 业务规则验证
- 跨栏位验证
- 特定领域限制

**范例**:
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

验证实际资料库查询和外部集成正确运作。

**何时需要**:

根据[测试标准](testing-standards.md)（或 `/testing-guide` 技能），如果单元测试对查询参数使用万用匹配器（`It.IsAny<>`, `any()`, `Arg.Any<>`），必须有集成测试。

**测试内容**:
- 查询述词回传正确资料
- 实体关联正确载入
- 分页正确运作
- 排序和筛选正确运作

**范例**:
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

评估 AI 生成测试的有效性和可维护性。

**何时需要**:

当使用 AI 工具（GitHub Copilot、Claude、ChatGPT）生成测试时，需评估其质量。

**评估标准**:

| 标准 | 说明 | 通过条件 |
|------|------|---------|
| **意图清晰** | 测试目的明确 | 测试名称描述行为 |
| **独立性** | 测试互不依赖 | 可单独执行通过 |
| **断言有效** | 断言验证正确行为 | 非仅检查 "not null" |
| **边界覆盖** | 含边界案例 | 最小/最大值已测试 |
| **可读性** | 代码易理解 | 无需注释即可理解 |

**评估范例**:

```csharp
// ❌ 差：AI 生成的低质量测试
[Fact]
public void Test1()
{
    var result = _service.Process(null);
    Assert.NotNull(result);  // 仅检查非空
}

// ✅ 好：AI 生成的高质量测试
[Fact]
public void Process_WithEmptyInput_ReturnsEmptyResult()
{
    // Arrange
    var input = Array.Empty<Item>();

    // Act
    var result = _service.Process(input);

    // Assert
    result.Should().BeEmpty();
    result.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
}
```

**AI 测试反模式**:

| 反模式 | 问题 | 修正 |
|--------|------|------|
| 仅检查非空 | 无实际验证 | 断言具体值 |
| 硬编码魔术值 | 难以维护 | 使用常量或工厂 |
| 测试名称如 `Test1` | 无法理解意图 | 使用描述性名称 |
| 无边界案例 | 覆盖不完整 | 加入边界测试 |

---

## Mutation Testing

### 概念

Mutation Testing 通过在代码中引入小变异（mutations）来评估测试质量。如果测试套件未能检测到变异，表示测试不够强健。

### 变异操作符

| 操作符 | 原始 | 变异 |
|--------|------|------|
| 关系运算符 | `>` | `>=`, `<`, `==` |
| 算术运算符 | `+` | `-`, `*` |
| 逻辑运算符 | `&&` | `\|\|` |
| 返回值 | `return x` | `return null` |
| 条件边界 | `i < 10` | `i <= 10` |

### 工具推荐

| 语言 | 工具 | 链接 |
|------|------|------|
| JavaScript/TypeScript | Stryker | stryker-mutator.io |
| Java | PIT | pitest.org |
| C# | Stryker.NET | stryker-mutator.io/docs/stryker-net |
| Python | mutmut | github.com/boxed/mutmut |

### 结果解读

| 指标 | 意义 | 目标 |
|------|------|------|
| 杀死的变异 | 测试检测到变异 | 越高越好 |
| 存活的变异 | 测试未检测到 | 需要加强测试 |
| 变异分数 | 杀死数 / 总数 | > 80% |

### 范例配置 (Stryker)

```json
{
  "stryker": {
    "mutate": ["src/**/*.ts", "!src/**/*.spec.ts"],
    "testRunner": "jest",
    "reporters": ["html", "clear-text"],
    "thresholds": {
      "high": 80,
      "low": 60,
      "break": 50
    }
  }
}
```

---

## 测试案例设计清单

使用此清单检核每个功能的完整性：

```
功能: ___________________

□ 正向路径
  □ 有效输入产生预期成功
  □ 回传/建立正确资料
  □ 副作用如预期发生

□ 边界条件
  □ 最小有效值
  □ 最大有效值
  □ 空集合
  □ 单一项目集合
  □ 大型集合（如适用）

□ 错误处理
  □ 无效输入格式
  □ 缺少必填栏位
  □ 重复/冲突情境
  □ 未找到情境
  □ 外部服务故障（如适用）

□ 权限验证
  □ 每个允许角色已测试
  □ 每个拒绝角色已测试
  □ 未认证存取已测试
  □ 跨边界存取已测试

□ 状态变更
  □ 初始状态已验证
  □ 最终状态已验证
  □ 所有有效状态转换已测试

□ 验证
  □ 格式验证（email、phone 等）
  □ 业务规则验证
  □ 跨栏位验证

□ 集成（如果单元测试使用万用匹配器）
  □ 查询述词已验证
  □ 实体关联已验证
  □ 分页已验证
  □ 排序/筛选已验证

□ AI 生成质量（如使用 AI 生成测试）
  □ 测试意图清晰
  □ 断言验证具体值
  □ 包含边界案例
  □ 测试名称描述行为
```

---

## 错误码覆盖矩阵

对于有定义错误码的 API，确保每个错误码都有测试：

| 代码 | 意义 | 测试情境 |
|------|------|----------|
| 200 | 成功 | 正向路径测试 |
| 400 | 错误请求 | 无效格式、缺少栏位 |
| 401 | 未认证 | 无效/缺少 token |
| 403 | 禁止 | 有效 token、权限不足 |
| 404 | 未找到 | 不存在的资源 |
| 409 | 冲突 | 重复资料 |
| 422 | 无法处理 | 违反业务规则 |
| 500 | 服务器错误 | 例外处理 |

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

*维度 8 仅在使用 AI 生成测试时适用

---

## 反模式

避免这些常见错误：

```
❌ 只测试正向路径

❌ 多角色系统缺少权限测试

❌ 未验证状态变更

❌ 单元测试使用万用匹配器但无对应集成测试

❌ 测试数据的 ID 与业务标识码使用相同值

❌ 测试实现细节而非行为

❌ 盲目信任 AI 生成的测试而不审查

❌ AI 测试仅检查非空而无具体断言
```

---

## 相关标准

- [测试驱动开发](test-driven-development.md) - TDD/BDD/ATDD 方法论
- [测试标准](testing-standards.md) - 核心测试标准（或使用 `/testing-guide` 技能）
- [程序码审查清单](code-review-checklist.md) - 审查测试完整性
- [签入标准](checkin-standards.md) - 提交前测试需求

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-24 | 新增：第 8 维度 AI 生成质量、Mutation Testing 章节 |
| 1.0.0 | 2025-12-24 | 初始发布，包含 7 维度框架 |

---

## 参考资料

- [ISTQB AI Testing Guidelines](https://www.istqb.org/) - 软件测试认证
- [Stryker Mutator](https://stryker-mutator.io/) - JavaScript/TypeScript Mutation Testing
- [PIT Mutation Testing](https://pitest.org/) - Java Mutation Testing
- [Mutation Testing 概念](https://en.wikipedia.org/wiki/Mutation_testing) - Wikipedia

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

---

**维护者**: 开发团队
