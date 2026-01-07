---
source: ../../../core/test-completeness-dimensions.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 測試完整性維度

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: 所有需要測試的軟體專案

[English](../../../core/test-completeness-dimensions.md) | [繁體中文](.)

---

## 目的

本文件定義評估測試完整性的系統性框架。為開發者提供檢核清單，確保測試覆蓋多個維度。

---

## 七個維度

完整的測試套件應為每個功能涵蓋以下 7 個維度：

```
┌─────────────────────────────────────────────────────────────┐
│                    測試完整性 = 7 個維度                      │
├─────────────────────────────────────────────────────────────┤
│  1. 正向路徑          正常預期行為                            │
│  2. 邊界條件          最小/最大值、限制                       │
│  3. 錯誤處理          無效輸入、例外狀況                       │
│  4. 權限驗證          角色存取控制                            │
│  5. 狀態轉換          前後驗證                                │
│  6. 驗證邏輯          格式、業務規則                          │
│  7. 整合驗證          實際查詢驗證                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 維度詳解

### 1. 正向路徑

測試使用有效輸入的正常預期流程。

**測試內容**:
- 有效輸入產生預期輸出
- 成功狀態碼/回應
- 資料正確建立/修改
- 副作用如預期發生

**範例**:
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

### 2. 邊界條件

測試有效範圍邊緣的值。

**測試內容**:
- 最小有效值
- 最大有效值
- 略小於最小值（無效）
- 略大於最大值（無效）
- 空集合 vs. 單一項目 vs. 多個項目

**範例**:
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

### 3. 錯誤處理

測試系統如何處理無效輸入和異常狀況。

**測試內容**:
- 無效輸入格式
- 缺少必填欄位
- 重複資料衝突
- 資源未找到
- 外部服務故障

**範例**:
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

### 4. 權限驗證

測試每個操作的角色存取控制。

**測試內容**:
- 每個角色允許的操作
- 每個角色拒絕的操作
- 未認證存取
- 跨租戶/跨使用者資料存取

**權限測試矩陣**:

為每個功能建立矩陣：

| 操作 | Admin | Manager | Member | Guest |
|------|-------|---------|--------|-------|
| Create | ✅ | ✅ | ❌ | ❌ |
| Read All | ✅ | ⚠️ Scoped | ❌ | ❌ |
| Update | ✅ | ⚠️ Own dept | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |

每個儲存格應有對應的測試案例。

**範例**:
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

### 5. 狀態轉換

驗證操作正確修改系統狀態。

**測試內容**:
- 操作前狀態
- 操作後狀態
- 狀態轉換（enabled → disabled, pending → approved）
- 冪等性（重複操作有相同結果）

**範例**:
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

### 6. 驗證邏輯

測試業務規則和格式驗證。

**測試內容**:
- 格式驗證（email、phone 等）
- 業務規則驗證
- 跨欄位驗證
- 特定領域限制

**範例**:
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

### 7. 整合驗證

驗證實際資料庫查詢和外部整合正確運作。

**何時需要**:

根據[測試標準](testing-standards.md)，如果單元測試對查詢參數使用萬用匹配器（`It.IsAny<>`, `any()`, `Arg.Any<>`），必須有整合測試。

**測試內容**:
- 查詢述詞回傳正確資料
- 實體關聯正確載入
- 分頁正確運作
- 排序和篩選正確運作

**範例**:
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

## 測試案例設計清單

使用此清單檢核每個功能的完整性：

```
功能: ___________________

□ 正向路徑
  □ 有效輸入產生預期成功
  □ 回傳/建立正確資料
  □ 副作用如預期發生

□ 邊界條件
  □ 最小有效值
  □ 最大有效值
  □ 空集合
  □ 單一項目集合
  □ 大型集合（如適用）

□ 錯誤處理
  □ 無效輸入格式
  □ 缺少必填欄位
  □ 重複/衝突情境
  □ 未找到情境
  □ 外部服務故障（如適用）

□ 權限驗證
  □ 每個允許角色已測試
  □ 每個拒絕角色已測試
  □ 未認證存取已測試
  □ 跨邊界存取已測試

□ 狀態變更
  □ 初始狀態已驗證
  □ 最終狀態已驗證
  □ 所有有效狀態轉換已測試

□ 驗證
  □ 格式驗證（email、phone 等）
  □ 業務規則驗證
  □ 跨欄位驗證

□ 整合（如果單元測試使用萬用匹配器）
  □ 查詢述詞已驗證
  □ 實體關聯已驗證
  □ 分頁已驗證
  □ 排序/篩選已驗證
```

---

## 錯誤碼覆蓋矩陣

對於有定義錯誤碼的 API，確保每個錯誤碼都有測試：

| 代碼 | 意義 | 測試情境 |
|------|------|----------|
| 200 | 成功 | 正向路徑測試 |
| 400 | 錯誤請求 | 無效格式、缺少欄位 |
| 401 | 未認證 | 無效/缺少 token |
| 403 | 禁止 | 有效 token、權限不足 |
| 404 | 未找到 | 不存在的資源 |
| 409 | 衝突 | 重複資料 |
| 422 | 無法處理 | 違反業務規則 |
| 500 | 伺服器錯誤 | 例外處理 |

---

## 何時應用各維度

並非所有維度都適用於每個功能。使用此指南：

| 功能類型 | 必需維度 |
|---------|---------|
| CRUD API | 1, 2, 3, 4, 6, 7 |
| 查詢/搜尋 | 1, 2, 3, 4, 7 |
| 狀態機 | 1, 3, 4, 5, 6 |
| 驗證 | 1, 2, 3, 6 |
| 背景工作 | 1, 3, 5 |
| 外部整合 | 1, 3, 7 |

---

## 反模式

避免這些常見錯誤：

```
❌ 只測試正向路徑

❌ 多角色系統缺少權限測試

❌ 未驗證狀態變更

❌ 單元測試使用萬用匹配器但無對應整合測試

❌ 測試資料的 ID 與業務識別碼使用相同值

❌ 測試實作細節而非行為
```

---

## 相關標準

- [測試驅動開發](test-driven-development.md) - TDD/BDD/ATDD 方法論
- [測試標準](testing-standards.md) - 核心測試標準
- [程式碼審查清單](code-review-checklist.md) - 審查測試完整性
- [簽入標準](checkin-standards.md) - 提交前測試需求

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 初始發布，包含 7 維度框架 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**維護者**: 開發團隊
