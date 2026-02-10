---
source: ../../../core/test-completeness-dimensions.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-24
status: current
---

# 測試完整性維度

**版本**: 1.1.0
**最後更新**: 2026-01-24
**適用範圍**: 所有需要測試的軟體專案

[English](../../core/test-completeness-dimensions.md) | [繁體中文](.)

---

## 目的

本文件定義評估測試完整性的系統性框架。為開發者提供檢核清單，確保測試覆蓋多個維度。

---

## 八個維度

完整的測試套件應為每個功能涵蓋以下 8 個維度：

```
┌─────────────────────────────────────────────────────────────┐
│                    測試完整性 = 8 個維度                      │
├─────────────────────────────────────────────────────────────┤
│  1. 正向路徑          正常預期行為                            │
│  2. 邊界條件          最小/最大值、限制                       │
│  3. 錯誤處理          無效輸入、例外狀況                       │
│  4. 權限驗證          角色存取控制                            │
│  5. 狀態轉換          前後驗證                                │
│  6. 驗證邏輯          格式、業務規則                          │
│  7. 整合驗證          實際查詢驗證                            │
│  8. AI 生成品質       AI 生成測試品質（新增）                  │
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

根據[測試標準](testing-standards.md)（或 `/testing-guide` 技能），如果單元測試對查詢參數使用萬用匹配器（`It.IsAny<>`, `any()`, `Arg.Any<>`），必須有整合測試。

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

### 8. AI 測試生成品質

評估 AI 生成測試的品質與有效性。

**為何重要**:

AI 程式碼助手可以快速生成測試，但數量 ≠ 品質。此維度確保 AI 生成的測試提供真正的價值。

**品質評估標準**:

| 標準 | 品質不佳 | 品質良好 |
|------|---------|---------|
| **測試目的** | 測試明顯的 getter/setter | 測試業務邏輯和邊界案例 |
| **斷言深度** | 只有 `result != null` | 驗證具體的值和狀態 |
| **獨立性** | 測試依賴執行順序 | 每個測試自成一體 |
| **命名** | `test1`, `test2` | 描述性: `should_reject_invalid_email` |

**AI 測試生成檢核清單**:

```
□ 測試目的驗證
  □ 測試是否驗證有意義的行為？
  □ bug 會導致測試失敗嗎？

□ 斷言品質
  □ 斷言是否具體（不只是「非空」）？
  □ 斷言是否驗證預期的輸出值？

□ 測試獨立性
  □ 測試可以任意順序執行嗎？
  □ 每個測試都設定自己的資料嗎？

□ 變異分數
  □ 程式碼中的變異會被捕捉嗎？
  □ 邏輯變更時測試會失敗嗎？
```

---

## 變異測試

### 概述

變異測試透過在程式碼中引入小變更（變異）來驗證測試有效性，並檢查測試是否能捕捉它們。

```
原始程式碼    變異        變異後程式碼
──────────  ──────►    ──────────
if (x > 0)             if (x >= 0)  ← 變異

           執行測試
           ──────────►

測試失敗？ → 變異被殺死 ✅ (測試有效)
測試通過？ → 變異存活 ❌ (測試薄弱)

變異分數 = 被殺死的變異 / 總變異數
```

### 常見變異運算子

| 運算子 | 原始 | 變異後 | 測試應捕捉 |
|--------|------|--------|-----------|
| 邊界 | `>` | `>=` | 差一錯誤 |
| 否定 | `true` | `false` | 布林邏輯 |
| 算術 | `+` | `-` | 數學運算 |
| 回傳 | `return x` | `return null` | 回傳值使用 |

### 變異測試工具

| 語言 | 工具 | 連結 |
|------|------|------|
| Java | PIT | https://pitest.org/ |
| JavaScript/TypeScript | Stryker | https://stryker-mutator.io/ |
| C# | Stryker.NET | https://stryker-mutator.io/docs/stryker-net/ |
| Python | mutmut | https://github.com/boxed/mutmut |

### 解讀結果

| 變異分數 | 解讀 | 行動 |
|----------|------|------|
| > 90% | 優秀 | 維持此水準 |
| 80-90% | 良好 | 檢視存活的變異 |
| 60-80% | 尚可 | 新增缺少的測試案例 |
| < 60% | 不佳 | 有重大測試缺口 |

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

□ AI 生成品質（如果是 AI 生成）
  □ 測試驗證有意義的行為
  □ 斷言具體（不只是「非空」）
  □ 變異分數 > 80%
  □ 邊界案例已涵蓋
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
| CRUD API | 1, 2, 3, 4, 6, 7, 8* |
| 查詢/搜尋 | 1, 2, 3, 4, 7, 8* |
| 狀態機 | 1, 3, 4, 5, 6, 8* |
| 驗證 | 1, 2, 3, 6, 8* |
| 背景工作 | 1, 3, 5, 8* |
| 外部整合 | 1, 3, 7, 8* |

*維度 8（AI 生成品質）在測試為 AI 生成時適用

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

❌ 未審查就接受 AI 生成的測試

❌ 假設高行覆蓋率等於有效測試

❌ 對關鍵程式碼跳過變異測試
```

---

## 相關標準

- [測試驅動開發](test-driven-development.md) - TDD/BDD/ATDD 方法論
- [測試標準](testing-standards.md) - 核心測試標準（或使用 `/testing-guide` 技能）
- [程式碼審查清單](code-review-checklist.md) - 審查測試完整性
- [簽入標準](checkin-standards.md) - 提交前測試需求

---

## 參考資料

- [ISTQB AI 測試大綱](https://www.istqb.org/certifications/ai-testing) - 基礎級 AI 測試認證
- [Stryker 變異測試](https://stryker-mutator.io/) - 多語言變異測試框架
- [PIT 變異測試](https://pitest.org/) - Java 變異測試
- [Google 測試部落格 - 變異測試](https://testing.googleblog.com/2021/04/mutation-testing.html) - Google 對變異測試的觀點
- [ISTQB 基礎級大綱](https://www.istqb.org/certifications/certified-tester-foundation-level) - 核心測試概念

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-01-24 | 新增：第 8 維度（AI 測試生成品質）、變異測試章節 |
| 1.0.0 | 2025-12-24 | 初始發布，包含 7 維度框架 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**維護者**: 開發團隊
