# Test Completeness Dimensions

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: All software projects with testing requirements

[English](.) | [繁體中文](../locales/zh-TW/core/test-completeness-dimensions.md)

---

## Purpose

This document defines a systematic framework for evaluating test completeness. It provides developers with a checklist to ensure comprehensive test coverage across multiple dimensions.

---

## The Seven Dimensions

A complete test suite should cover these 7 dimensions for each feature:

```
┌─────────────────────────────────────────────────────────────┐
│              Test Completeness = 7 Dimensions                │
├─────────────────────────────────────────────────────────────┤
│  1. Happy Path        Normal expected behavior              │
│  2. Boundary          Min/max values, limits                │
│  3. Error Handling    Invalid input, exceptions             │
│  4. Authorization     Role-based access control             │
│  5. State Changes     Before/after verification             │
│  6. Validation        Format, business rules                │
│  7. Integration       Real query verification               │
└─────────────────────────────────────────────────────────────┘
```

---

## Dimension Details

### 1. Happy Path

Test the normal, expected flow with valid inputs.

**What to test**:
- Valid input produces expected output
- Success status codes/responses
- Data is correctly created/modified
- Side effects occur as expected

**Example**:
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

### 2. Boundary Conditions

Test values at the edges of valid ranges.

**What to test**:
- Minimum valid values
- Maximum valid values
- Just below minimum (invalid)
- Just above maximum (invalid)
- Empty collections vs. single item vs. many items

**Example**:
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

### 3. Error Handling

Test how the system handles invalid inputs and exceptional conditions.

**What to test**:
- Invalid input formats
- Missing required fields
- Duplicate data conflicts
- Resource not found
- External service failures

**Example**:
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

### 4. Authorization

Test role-based access control for each operation.

**What to test**:
- Each role's permitted operations
- Each role's denied operations
- Unauthenticated access
- Cross-tenant/cross-user data access

**Authorization Test Matrix**:

Create a matrix for each feature:

| Operation | Admin | Manager | Member | Guest |
|-----------|-------|---------|--------|-------|
| Create | ✅ | ✅ | ❌ | ❌ |
| Read All | ✅ | ⚠️ Scoped | ❌ | ❌ |
| Update | ✅ | ⚠️ Own dept | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |

Each cell should have a corresponding test case.

**Example**:
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

### 5. State Changes

Verify that operations correctly modify system state.

**What to test**:
- State before operation
- State after operation
- State transitions (enabled → disabled, pending → approved)
- Idempotency (repeating operation has same result)

**Example**:
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

### 6. Validation Logic

Test business rules and format validation.

**What to test**:
- Format validation (email, phone, etc.)
- Business rule validation
- Cross-field validation
- Domain-specific constraints

**Example**:
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

### 7. Integration Verification

Verify actual database queries and external integrations work correctly.

**When Required**:

As per [Testing Standards](testing-standards.md), if your unit test uses wildcard matchers (`It.IsAny<>`, `any()`, `Arg.Any<>`) for query parameters, you MUST have integration tests.

**What to test**:
- Query predicates return correct data
- Entity relationships are correctly loaded
- Pagination works correctly
- Sorting and filtering work correctly

**Example**:
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

## Test Case Design Checklist

Use this checklist for each feature to ensure completeness:

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

## Error Code Coverage Matrix

For APIs with defined error codes, ensure each code has a test:

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

## When to Apply Each Dimension

Not all dimensions apply to every feature. Use this guide:

| Feature Type | Required Dimensions |
|--------------|---------------------|
| CRUD API | 1, 2, 3, 4, 6, 7 |
| Query/Search | 1, 2, 3, 4, 7 |
| State Machine | 1, 3, 4, 5, 6 |
| Validation | 1, 2, 3, 6 |
| Background Job | 1, 3, 5 |
| External Integration | 1, 3, 7 |

---

## Anti-Patterns

Avoid these common mistakes:

```
❌ Testing only happy path

❌ Missing authorization tests for multi-role systems

❌ Not verifying state changes

❌ Using wildcards in UT without corresponding IT

❌ Same values for ID and business identifier in test data

❌ Testing implementation details instead of behavior
```

---

## Related Standards

- [Test-Driven Development](test-driven-development.md) - TDD/BDD/ATDD methodology
- [Testing Standards](testing-standards.md) - Core testing standards
- [Code Review Checklist](code-review-checklist.md) - Review test completeness
- [Check-in Standards](checkin-standards.md) - Pre-commit test requirements

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Initial release with 7 dimensions framework |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Maintainer**: Development Team
