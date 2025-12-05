# Testing Standards
# 測試標準

**Version**: 1.0.0
**Last Updated**: 2025-12-05
**Applicability**: All software projects
**適用範圍**: 所有軟體專案

---

## Purpose | 目的

This standard defines testing conventions and best practices to ensure software quality through systematic testing at multiple levels.

本標準定義測試慣例與最佳實踐，透過多層級的系統化測試確保軟體品質。

---

## Testing Pyramid | 測試金字塔

```
                    ┌─────────┐
                    │   E2E   │  ← Fewer, slower, expensive
                    │  端對端  │    較少、較慢、成本高
                   ─┴─────────┴─
                  ┌─────────────┐
                  │     ST      │  ← System Testing
                  │   系統測試   │    整體系統驗證
                 ─┴─────────────┴─
                ┌─────────────────┐
                │       IT        │  ← Integration Testing
                │     整合測試     │    模組間互動
               ─┴─────────────────┴─
              ┌─────────────────────┐
              │         UT          │  ← Unit Testing (Foundation)
              │       單元測試       │    最多、最快、成本低
              └─────────────────────┘
```

### Recommended Ratio | 建議比例

| Level | Percentage | Execution Time |
|-------|------------|----------------|
| UT (單元測試) | 70% | < 10 min |
| IT (整合測試) | 20% | < 30 min |
| ST (系統測試) | 7% | < 2 hours |
| E2E (端對端) | 3% | < 4 hours |

---

## Unit Testing (UT) | 單元測試

### Definition | 定義

Tests individual functions, methods, or classes in isolation from external dependencies.

測試個別函式、方法或類別，與外部相依性隔離。

### Characteristics | 特性

- **Isolated**: No database, network, or file system access
- **Fast**: Each test < 100ms
- **Deterministic**: Same input always produces same output
- **獨立**: 不存取資料庫、網路或檔案系統
- **快速**: 每個測試 < 100ms
- **確定性**: 相同輸入永遠產生相同輸出

### Scope | 範圍

```
┌─────────────────────────────────────────┐
│              Unit Under Test            │
├─────────────────────────────────────────┤
│  ✅ Single function/method              │
│  ✅ Single class                        │
│  ✅ Pure business logic                 │
│  ✅ Data transformations                │
│  ✅ Validation rules                    │
├─────────────────────────────────────────┤
│  ❌ Database queries                    │
│  ❌ External API calls                  │
│  ❌ File I/O operations                 │
│  ❌ Multi-class interactions            │
└─────────────────────────────────────────┘
```

### Naming Convention | 命名慣例

**File Naming | 檔案命名**:
```
[ClassName]Tests.[ext]
[ClassName].test.[ext]
[ClassName].spec.[ext]

Examples:
  UserService.test.ts
  UserServiceTests.cs
  user_service_test.py
  user_service_test.go
```

**Method Naming | 方法命名**:
```
[MethodName]_[Scenario]_[ExpectedResult]
should_[ExpectedBehavior]_when_[Condition]
test_[method]_[scenario]_[expected]

Examples:
  CalculateTotal_WithDiscount_ReturnsDiscountedPrice()
  should_return_null_when_user_not_found()
  test_validate_email_invalid_format_returns_false()
```

### Coverage Guidelines | 覆蓋率指引

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Line Coverage | 70% | 85% |
| Branch Coverage | 60% | 80% |
| Function Coverage | 80% | 90% |

### Example | 範例

```csharp
// C# Example
[TestClass]
public class UserValidatorTests
{
    private UserValidator _validator;

    [TestInitialize]
    public void Setup()
    {
        _validator = new UserValidator();
    }

    [TestMethod]
    public void ValidateEmail_ValidFormat_ReturnsTrue()
    {
        // Arrange
        var email = "user@example.com";

        // Act
        var result = _validator.ValidateEmail(email);

        // Assert
        Assert.IsTrue(result);
    }

    [TestMethod]
    public void ValidateEmail_InvalidFormat_ReturnsFalse()
    {
        // Arrange
        var email = "invalid-email";

        // Act
        var result = _validator.ValidateEmail(email);

        // Assert
        Assert.IsFalse(result);
    }
}
```

```typescript
// TypeScript Example
describe('UserValidator', () => {
    let validator: UserValidator;

    beforeEach(() => {
        validator = new UserValidator();
    });

    describe('validateEmail', () => {
        it('should return true for valid email format', () => {
            const result = validator.validateEmail('user@example.com');
            expect(result).toBe(true);
        });

        it('should return false for invalid email format', () => {
            const result = validator.validateEmail('invalid-email');
            expect(result).toBe(false);
        });
    });
});
```

---

## Integration Testing (IT) | 整合測試

### Definition | 定義

Tests interactions between multiple components, modules, or external systems.

測試多個元件、模組或外部系統之間的互動。

### Characteristics | 特性

- **Component Integration**: Tests module boundaries
- **Real Dependencies**: Uses actual databases, APIs (often containerized)
- **Slower**: Each test typically 1-10 seconds
- **元件整合**: 測試模組邊界
- **真實相依性**: 使用實際資料庫、API（通常容器化）
- **較慢**: 每個測試通常 1-10 秒

### Scope | 範圍

```
┌─────────────────────────────────────────┐
│         Integration Test Scope          │
├─────────────────────────────────────────┤
│  ✅ Database CRUD operations            │
│  ✅ Repository + Database               │
│  ✅ Service + Repository                │
│  ✅ API endpoint + Service layer        │
│  ✅ Message queue producers/consumers   │
│  ✅ Cache read/write operations         │
├─────────────────────────────────────────┤
│  ❌ Full user workflows                 │
│  ❌ Cross-service communication         │
│  ❌ UI interactions                     │
└─────────────────────────────────────────┘
```

### Naming Convention | 命名慣例

**File Naming | 檔案命名**:
```
[ComponentName]IntegrationTests.[ext]
[ComponentName].integration.test.[ext]
[ComponentName].itest.[ext]

Examples:
  UserRepositoryIntegrationTests.cs
  user-service.integration.test.ts
  user_repository_itest.py
```

**Method Naming | 方法命名**:
```
[Operation]_[Context]_[ExpectedOutcome]

Examples:
  CreateUser_WithValidData_PersistsToDatabase()
  GetUserById_ExistingUser_ReturnsUserFromDatabase()
  SendMessage_ToQueue_ConsumerReceivesMessage()
```

### Test Fixtures | 測試夾具

```csharp
// C# Integration Test Example with Test Database
[TestClass]
public class UserRepositoryIntegrationTests
{
    private TestDbContext _dbContext;
    private UserRepository _repository;

    [TestInitialize]
    public async Task Setup()
    {
        // 使用測試資料庫（如 SQLite in-memory 或 Testcontainers）
        _dbContext = TestDbContextFactory.Create();
        _repository = new UserRepository(_dbContext);
        await _dbContext.Database.EnsureCreatedAsync();
    }

    [TestCleanup]
    public async Task Cleanup()
    {
        await _dbContext.DisposeAsync();
    }

    [TestMethod]
    public async Task CreateUser_WithValidData_PersistsToDatabase()
    {
        // Arrange
        var user = new User { Name = "Test User", Email = "test@example.com" };

        // Act
        await _repository.CreateAsync(user);
        var savedUser = await _repository.GetByIdAsync(user.Id);

        // Assert
        Assert.IsNotNull(savedUser);
        Assert.AreEqual("Test User", savedUser.Name);
    }
}
```

---

## System Testing (ST) | 系統測試

### Definition | 定義

Tests the complete integrated system to verify it meets specified requirements.

測試完整整合的系統，驗證是否符合指定需求。

### Characteristics | 特性

- **Complete System**: All components deployed and integrated
- **Requirement-Based**: Tests against functional specifications
- **Production-Like**: Uses environment similar to production
- **完整系統**: 所有元件部署並整合
- **基於需求**: 依據功能規格測試
- **類生產環境**: 使用類似生產的環境

### Scope | 範圍

```
┌─────────────────────────────────────────┐
│           System Test Scope             │
├─────────────────────────────────────────┤
│  ✅ Complete API workflows              │
│  ✅ Cross-service transactions          │
│  ✅ Data flow through entire system     │
│  ✅ Security requirements               │
│  ✅ Performance under load              │
│  ✅ Error handling & recovery           │
│  ✅ Configuration validation            │
├─────────────────────────────────────────┤
│  ❌ UI visual testing                   │
│  ❌ User journey simulations            │
│  ❌ A/B testing scenarios               │
└─────────────────────────────────────────┘
```

### Types of System Tests | 系統測試類型

| Type | Chinese | Description |
|------|---------|-------------|
| Functional | 功能測試 | Verify features work as specified |
| Performance | 效能測試 | Load, stress, scalability testing |
| Security | 安全測試 | Penetration, vulnerability scanning |
| Reliability | 可靠性測試 | Failover, recovery, stability |
| Compatibility | 相容性測試 | Cross-platform, browser compatibility |

### Naming Convention | 命名慣例

**File Naming | 檔案命名**:
```
[Feature]SystemTests.[ext]
[Feature].system.test.[ext]
[Feature]_st.[ext]

Examples:
  OrderProcessingSystemTests.cs
  authentication.system.test.ts
  payment_processing_st.py
```

### Example | 範例

```csharp
// System Test Example: Complete Order Flow
[TestClass]
public class OrderProcessingSystemTests
{
    private HttpClient _client;
    private TestEnvironment _env;

    [TestInitialize]
    public async Task Setup()
    {
        _env = await TestEnvironment.CreateAsync();
        _client = _env.CreateAuthenticatedClient();
    }

    [TestMethod]
    public async Task ProcessOrder_CompleteFlow_OrderFulfilledSuccessfully()
    {
        // Arrange: 建立測試資料
        var product = await _env.CreateTestProduct(price: 100);
        var customer = await _env.CreateTestCustomer();

        // Act: 執行完整訂單流程
        // Step 1: 加入購物車
        var cartResponse = await _client.PostAsync("/api/cart/add",
            new { productId = product.Id, quantity = 2 });
        Assert.AreEqual(HttpStatusCode.OK, cartResponse.StatusCode);

        // Step 2: 建立訂單
        var orderResponse = await _client.PostAsync("/api/orders",
            new { cartId = cartResponse.CartId, shippingAddress = customer.Address });
        var order = await orderResponse.Content.ReadAsAsync<Order>();
        Assert.AreEqual(HttpStatusCode.Created, orderResponse.StatusCode);

        // Step 3: 處理付款
        var paymentResponse = await _client.PostAsync($"/api/orders/{order.Id}/pay",
            new { paymentMethod = "credit_card", amount = 200 });
        Assert.AreEqual(HttpStatusCode.OK, paymentResponse.StatusCode);

        // Assert: 驗證最終狀態
        var finalOrder = await _client.GetAsync($"/api/orders/{order.Id}");
        var result = await finalOrder.Content.ReadAsAsync<Order>();

        Assert.AreEqual(OrderStatus.Paid, result.Status);
        Assert.AreEqual(200, result.TotalAmount);
        Assert.IsNotNull(result.PaymentConfirmation);
    }
}
```

---

## End-to-End Testing (E2E) | 端對端測試

### Definition | 定義

Tests complete user workflows from the user interface through all system layers.

從使用者介面測試完整的使用者工作流程，貫穿所有系統層。

### Characteristics | 特性

- **User Perspective**: Simulates real user interactions
- **Full Stack**: UI → API → Database → External Services
- **Slowest**: Each test typically 30 seconds to several minutes
- **使用者視角**: 模擬真實使用者互動
- **全棧**: UI → API → 資料庫 → 外部服務
- **最慢**: 每個測試通常 30 秒到數分鐘

### Scope | 範圍

```
┌─────────────────────────────────────────┐
│            E2E Test Scope               │
├─────────────────────────────────────────┤
│  ✅ Critical user journeys              │
│  ✅ Login/Authentication flows          │
│  ✅ Core business transactions          │
│  ✅ Cross-browser functionality         │
│  ✅ Smoke tests for deployments         │
├─────────────────────────────────────────┤
│  ❌ Every possible user path            │
│  ❌ Edge cases (use UT/IT)              │
│  ❌ Performance benchmarking            │
└─────────────────────────────────────────┘
```

### Naming Convention | 命名慣例

**File Naming | 檔案命名**:
```
[UserJourney].e2e.[ext]
[Feature].e2e.spec.[ext]
e2e/[feature]/[scenario].[ext]

Examples:
  user-registration.e2e.ts
  checkout-flow.e2e.spec.ts
  e2e/authentication/login.spec.ts
```

### Example | 範例

```typescript
// Playwright E2E Test Example
import { test, expect } from '@playwright/test';

test.describe('User Registration Journey', () => {
    test('should complete registration and login successfully', async ({ page }) => {
        // Step 1: 導航到註冊頁面
        await page.goto('/register');

        // Step 2: 填寫註冊表單
        await page.fill('[data-testid="email"]', 'newuser@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
        await page.click('[data-testid="register-button"]');

        // Step 3: 驗證註冊成功
        await expect(page.locator('[data-testid="success-message"]'))
            .toContainText('Registration successful');

        // Step 4: 使用新帳號登入
        await page.goto('/login');
        await page.fill('[data-testid="email"]', 'newuser@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.click('[data-testid="login-button"]');

        // Step 5: 驗證登入成功並導向儀表板
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('[data-testid="welcome-message"]'))
            .toContainText('Welcome, newuser@example.com');
    });
});
```

---

## Test Doubles | 測試替身

### Types | 類型

| Type | Chinese | Purpose | Example Use |
|------|---------|---------|-------------|
| **Stub** | 樁 | Returns predefined values | Fixed API responses |
| **Mock** | 模擬物件 | Verifies interactions | Verify method called |
| **Fake** | 假物件 | Simplified implementation | In-memory database |
| **Spy** | 間諜 | Records calls, delegates to real | Partial mocking |
| **Dummy** | 虛設物件 | Placeholder, never used | Fill required parameters |

### Usage Guidelines | 使用指引

```
┌─────────────────────────────────────────────────────────┐
│                  When to Use What                       │
├─────────────────────────────────────────────────────────┤
│  Unit Tests (UT)                                        │
│  ├── Use Mocks/Stubs for all external dependencies     │
│  └── Verify interactions with Mocks                    │
├─────────────────────────────────────────────────────────┤
│  Integration Tests (IT)                                 │
│  ├── Use Fakes for databases (in-memory, containers)   │
│  ├── Use Stubs for external APIs                       │
│  └── Minimize mocking - test real integrations         │
├─────────────────────────────────────────────────────────┤
│  System Tests (ST)                                      │
│  ├── Use real components whenever possible             │
│  ├── Use Fakes only for external third-party services  │
│  └── No mocking within the system boundary             │
├─────────────────────────────────────────────────────────┤
│  E2E Tests                                              │
│  ├── Use real everything                               │
│  └── Stub only external payment/email services         │
└─────────────────────────────────────────────────────────┘
```

---

## Test Data Management | 測試資料管理

### Principles | 原則

1. **Isolation**: Each test manages its own data
2. **Cleanup**: Tests clean up after themselves
3. **Determinism**: Tests don't depend on shared state
4. **Readability**: Test data clearly shows intent

1. **隔離**: 每個測試管理自己的資料
2. **清理**: 測試結束後自行清理
3. **確定性**: 測試不依賴共享狀態
4. **可讀性**: 測試資料清楚顯示意圖

### Patterns | 模式

```csharp
// Builder Pattern for Test Data
public class UserBuilder
{
    private string _name = "Default User";
    private string _email = "default@example.com";
    private bool _isActive = true;

    public UserBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public UserBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public UserBuilder Inactive()
    {
        _isActive = false;
        return this;
    }

    public User Build() => new User
    {
        Name = _name,
        Email = _email,
        IsActive = _isActive
    };
}

// Usage in tests
var activeUser = new UserBuilder()
    .WithName("Active User")
    .Build();

var inactiveUser = new UserBuilder()
    .WithName("Inactive User")
    .Inactive()
    .Build();
```

---

## CI/CD Integration | CI/CD 整合

### Test Execution Strategy | 測試執行策略

```yaml
# Example CI Pipeline
stages:
  - unit-test        # Run on every commit
  - integration-test # Run on every commit
  - system-test      # Run on PR merge to main
  - e2e-test         # Run on release candidates

unit-test:
  stage: unit-test
  script:
    - npm run test:unit
  timeout: 10m
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"

integration-test:
  stage: integration-test
  services:
    - postgres:14
    - redis:7
  script:
    - npm run test:integration
  timeout: 30m
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"

system-test:
  stage: system-test
  environment: staging
  script:
    - npm run test:system
  timeout: 2h
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

e2e-test:
  stage: e2e-test
  environment: staging
  script:
    - npm run test:e2e
  timeout: 4h
  rules:
    - if: $CI_COMMIT_TAG
```

### Test Reports | 測試報告

Required metrics for each test level:

| Metric | UT | IT | ST | E2E |
|--------|----|----|----|----|
| Pass/Fail Count | ✅ | ✅ | ✅ | ✅ |
| Execution Time | ✅ | ✅ | ✅ | ✅ |
| Coverage % | ✅ | ✅ | ⚠️ | ❌ |
| Flaky Test Rate | ✅ | ✅ | ✅ | ✅ |
| Screenshots/Videos | ❌ | ❌ | ⚠️ | ✅ |

---

## Best Practices | 最佳實踐

### AAA Pattern | AAA 模式

```csharp
[TestMethod]
public void MethodName_Scenario_ExpectedBehavior()
{
    // Arrange - 準備測試資料與環境
    var input = CreateTestInput();
    var sut = new SystemUnderTest();

    // Act - 執行被測試的行為
    var result = sut.Execute(input);

    // Assert - 驗證結果
    Assert.AreEqual(expected, result);
}
```

### FIRST Principles | FIRST 原則

| Principle | Chinese | Description |
|-----------|---------|-------------|
| **F**ast | 快速 | Tests run quickly |
| **I**ndependent | 獨立 | Tests don't affect each other |
| **R**epeatable | 可重複 | Same result every time |
| **S**elf-validating | 自我驗證 | Clear pass/fail |
| **T**imely | 及時 | Written with production code |

### Anti-Patterns to Avoid | 應避免的反模式

```
❌ Test Interdependence (測試相依)
   Tests that must run in specific order

❌ Flaky Tests (不穩定測試)
   Tests that sometimes pass, sometimes fail

❌ Testing Implementation Details (測試實作細節)
   Tests that break when refactoring

❌ Over-Mocking (過度模擬)
   Mocking so much that nothing real is tested

❌ Missing Assertions (缺少斷言)
   Tests that verify nothing meaningful

❌ Magic Numbers/Strings (魔術數字/字串)
   Unexplained values in test code
```

---

## Quick Reference Card | 快速參考卡

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Levels Summary                    │
├──────────┬──────────────────────────────────────────────────┤
│   UT     │ Single unit, isolated, mocked deps, < 100ms     │
│  單元測試 │ 單一單元、隔離、模擬相依、< 100ms               │
├──────────┼──────────────────────────────────────────────────┤
│   IT     │ Component integration, real DB, 1-10 sec        │
│  整合測試 │ 元件整合、真實資料庫、1-10 秒                   │
├──────────┼──────────────────────────────────────────────────┤
│   ST     │ Full system, requirement-based, production-like │
│  系統測試 │ 完整系統、基於需求、類生產環境                  │
├──────────┼──────────────────────────────────────────────────┤
│  E2E     │ User journeys, UI to DB, critical paths only    │
│ 端對端   │ 使用者流程、UI 到 DB、僅關鍵路徑                │
├──────────┴──────────────────────────────────────────────────┤
│                    Naming Conventions                        │
├─────────────────────────────────────────────────────────────┤
│  Files:  [Name]Tests.cs, [name].test.ts, [name]_test.py    │
│  Methods: Method_Scenario_Expected, should_X_when_Y        │
├─────────────────────────────────────────────────────────────┤
│                    Coverage Targets                          │
├─────────────────────────────────────────────────────────────┤
│  Line: 70% min / 85% recommended                            │
│  Branch: 60% min / 80% recommended                          │
│  Function: 80% min / 90% recommended                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Standards | 相關標準

- [Anti-Hallucination Standard](anti-hallucination.md) - AI 協作防幻覺標準
- [Code Check-in Standards](checkin-standards.md) - 程式碼簽入檢查點標準
- [Code Review Checklist](code-review-checklist.md) - 程式碼審查清單
- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-05 | Initial testing standards with UT/IT/ST/E2E coverage |

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**Maintainer**: Development Team
**維護者**: 開發團隊
