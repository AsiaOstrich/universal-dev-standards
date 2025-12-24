# Test Completeness Dimensions
# 測試完整性維度

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: All software projects with testing requirements
**適用範圍**: 所有需要測試的軟體專案

---

## Purpose | 目的

This document defines a systematic framework for evaluating test completeness. It provides developers with a checklist to ensure comprehensive test coverage across multiple dimensions.

本文件定義評估測試完整性的系統性框架。為開發者提供檢核清單，確保測試覆蓋多個維度。

---

## The Seven Dimensions | 七個維度

A complete test suite should cover these 7 dimensions for each feature:

完整的測試套件應為每個功能涵蓋以下 7 個維度：

```
┌─────────────────────────────────────────────────────────────┐
│              Test Completeness = 7 Dimensions                │
│                    測試完整性 = 7 個維度                      │
├─────────────────────────────────────────────────────────────┤
│  1. Happy Path        正向路徑    Normal expected behavior   │
│  2. Boundary          邊界條件    Min/max values, limits     │
│  3. Error Handling    錯誤處理    Invalid input, exceptions  │
│  4. Authorization     權限驗證    Role-based access control  │
│  5. State Changes     狀態轉換    Before/after verification  │
│  6. Validation        驗證邏輯    Format, business rules     │
│  7. Integration       整合驗證    Real query verification    │
└─────────────────────────────────────────────────────────────┘
```

---

## Dimension Details | 維度詳解

### 1. Happy Path | 正向路徑

Test the normal, expected flow with valid inputs.

測試使用有效輸入的正常預期流程。

**What to test | 測試內容**:
- Valid input produces expected output
- Success status codes/responses
- Data is correctly created/modified
- Side effects occur as expected

**Example | 範例**:
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

### 2. Boundary Conditions | 邊界條件

Test values at the edges of valid ranges.

測試有效範圍邊緣的值。

**What to test | 測試內容**:
- Minimum valid values
- Maximum valid values
- Just below minimum (invalid)
- Just above maximum (invalid)
- Empty collections vs. single item vs. many items

**Example | 範例**:
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

### 3. Error Handling | 錯誤處理

Test how the system handles invalid inputs and exceptional conditions.

測試系統如何處理無效輸入和異常狀況。

**What to test | 測試內容**:
- Invalid input formats
- Missing required fields
- Duplicate data conflicts
- Resource not found
- External service failures

**Example | 範例**:
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

### 4. Authorization | 權限驗證

Test role-based access control for each operation.

測試每個操作的角色存取控制。

**What to test | 測試內容**:
- Each role's permitted operations
- Each role's denied operations
- Unauthenticated access
- Cross-tenant/cross-user data access

**Authorization Test Matrix | 權限測試矩陣**:

Create a matrix for each feature:
為每個功能建立矩陣：

| Operation | Admin | Manager | Member | Guest |
|-----------|-------|---------|--------|-------|
| Create | ✅ | ✅ | ❌ | ❌ |
| Read All | ✅ | ⚠️ Scoped | ❌ | ❌ |
| Update | ✅ | ⚠️ Own dept | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |

Each cell should have a corresponding test case.
每個儲存格應有對應的測試案例。

**Example | 範例**:
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

### 5. State Changes | 狀態轉換

Verify that operations correctly modify system state.

驗證操作正確修改系統狀態。

**What to test | 測試內容**:
- State before operation
- State after operation
- State transitions (enabled → disabled, pending → approved)
- Idempotency (repeating operation has same result)

**Example | 範例**:
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

### 6. Validation Logic | 驗證邏輯

Test business rules and format validation.

測試業務規則和格式驗證。

**What to test | 測試內容**:
- Format validation (email, phone, etc.)
- Business rule validation
- Cross-field validation
- Domain-specific constraints

**Example | 範例**:
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

### 7. Integration Verification | 整合驗證

Verify actual database queries and external integrations work correctly.

驗證實際資料庫查詢和外部整合正確運作。

**When Required | 何時需要**:

As per [Testing Standards](testing-standards.md), if your unit test uses wildcard matchers (`It.IsAny<>`, `any()`, `Arg.Any<>`) for query parameters, you MUST have integration tests.

根據[測試標準](testing-standards.md)，如果單元測試對查詢參數使用萬用匹配器，必須有整合測試。

**What to test | 測試內容**:
- Query predicates return correct data
- Entity relationships are correctly loaded
- Pagination works correctly
- Sorting and filtering work correctly

**Example | 範例**:
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

## Test Case Design Checklist | 測試案例設計清單

Use this checklist for each feature to ensure completeness:

使用此清單檢核每個功能的完整性：

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
```

---

## Error Code Coverage Matrix | 錯誤碼覆蓋矩陣

For APIs with defined error codes, ensure each code has a test:

對於有定義錯誤碼的 API，確保每個錯誤碼都有測試：

| Code | Meaning | Test Scenario |
|------|---------|---------------|
| 200 | Success | Happy path test |
| 400 | Bad Request | Invalid format, missing fields |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Valid token, insufficient permissions |
| 404 | Not Found | Non-existent resource |
| 409 | Conflict | Duplicate data |
| 422 | Unprocessable | Business rule violation |
| 500 | Server Error | Exception handling |

---

## When to Apply Each Dimension | 何時應用各維度

Not all dimensions apply to every feature. Use this guide:

並非所有維度都適用於每個功能。使用此指南：

| Feature Type | Required Dimensions |
|--------------|---------------------|
| CRUD API | 1, 2, 3, 4, 6, 7 |
| Query/Search | 1, 2, 3, 4, 7 |
| State Machine | 1, 3, 4, 5, 6 |
| Validation | 1, 2, 3, 6 |
| Background Job | 1, 3, 5 |
| External Integration | 1, 3, 7 |

---

## Anti-Patterns | 反模式

Avoid these common mistakes:

避免這些常見錯誤：

```
❌ Testing only happy path
   只測試正向路徑

❌ Missing authorization tests for multi-role systems
   多角色系統缺少權限測試

❌ Not verifying state changes
   未驗證狀態變更

❌ Using wildcards in UT without corresponding IT
   單元測試使用萬用匹配器但無對應整合測試

❌ Same values for ID and business identifier in test data
   測試資料的 ID 與業務識別碼使用相同值

❌ Testing implementation details instead of behavior
   測試實作細節而非行為
```

---

## Related Standards | 相關標準

- [Testing Standards](testing-standards.md) - Core testing standards
- [Code Review Checklist](code-review-checklist.md) - Review test completeness
- [Check-in Standards](checkin-standards.md) - Pre-commit test requirements

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Initial release with 7 dimensions framework |

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**Maintainer**: Development Team
**維護者**: 開發團隊
