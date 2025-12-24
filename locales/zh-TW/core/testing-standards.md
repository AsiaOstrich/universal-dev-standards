# 測試標準

> **語言**: [English](../../../core/testing-standards.md) | 繁體中文

---
source: ../../../core/testing-standards.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2025-12-24
status: current
---

**版本**: 1.2.0
**最後更新**: 2025-12-19
**適用範圍**: 所有軟體專案

---

## 目的

本標準定義測試慣例與最佳實踐，透過多層級的系統化測試確保軟體品質。

---

## 測試金字塔

```
                    ┌─────────┐
                    │   E2E   │  ← 較少、較慢、成本高
                    │  端對端  │
                   ─┴─────────┴─
                  ┌─────────────┐
                  │     ST      │  ← 系統測試
                  │   系統測試   │    整體系統驗證
                 ─┴─────────────┴─
                ┌─────────────────┐
                │       IT        │  ← 整合測試
                │     整合測試     │    模組間互動
               ─┴─────────────────┴─
              ┌─────────────────────┐
              │         UT          │  ← 單元測試（基礎）
              │       單元測試       │    最多、最快、成本低
              └─────────────────────┘
```

### 建議比例

| 層級 | 百分比 | 執行時間 |
|------|--------|----------|
| UT (單元測試) | 70% | < 10 分鐘 |
| IT (整合測試) | 20% | < 30 分鐘 |
| ST (系統測試) | 7% | < 2 小時 |
| E2E (端對端) | 3% | < 4 小時 |

---

## 單元測試 (UT)

### 定義

測試個別函式、方法或類別，與外部相依性隔離。

### 特性

- **獨立**: 不存取資料庫、網路或檔案系統
- **快速**: 每個測試 < 100ms
- **確定性**: 相同輸入永遠產生相同輸出

### 範圍

```
┌─────────────────────────────────────────┐
│              測試單元範圍               │
├─────────────────────────────────────────┤
│  ✅ 單一函式/方法                       │
│  ✅ 單一類別                           │
│  ✅ 純業務邏輯                         │
│  ✅ 資料轉換                           │
│  ✅ 驗證規則                           │
├─────────────────────────────────────────┤
│  ❌ 資料庫查詢                         │
│  ❌ 外部 API 呼叫                      │
│  ❌ 檔案 I/O 操作                      │
│  ❌ 多類別互動                         │
└─────────────────────────────────────────┘
```

### 命名慣例

**檔案命名**:
```
[ClassName]Tests.[ext]
[ClassName].test.[ext]
[ClassName].spec.[ext]

範例:
  UserService.test.ts
  UserServiceTests.cs
  user_service_test.py
  user_service_test.go
```

**方法命名**:
```
[MethodName]_[Scenario]_[ExpectedResult]
should_[ExpectedBehavior]_when_[Condition]
test_[method]_[scenario]_[expected]

範例:
  CalculateTotal_WithDiscount_ReturnsDiscountedPrice()
  should_return_null_when_user_not_found()
  test_validate_email_invalid_format_returns_false()
```

### 覆蓋率指引

| 指標 | 最低要求 | 建議 |
|------|----------|------|
| 行覆蓋率 | 70% | 85% |
| 分支覆蓋率 | 60% | 80% |
| 函式覆蓋率 | 80% | 90% |

### 範例

```csharp
// C# 範例
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
        // Arrange - 準備
        var email = "user@example.com";

        // Act - 執行
        var result = _validator.ValidateEmail(email);

        // Assert - 斷言
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
// TypeScript 範例
describe('UserValidator', () => {
    let validator: UserValidator;

    beforeEach(() => {
        validator = new UserValidator();
    });

    describe('validateEmail', () => {
        it('有效的 email 格式應回傳 true', () => {
            const result = validator.validateEmail('user@example.com');
            expect(result).toBe(true);
        });

        it('無效的 email 格式應回傳 false', () => {
            const result = validator.validateEmail('invalid-email');
            expect(result).toBe(false);
        });
    });
});
```

---

## 整合測試 (IT)

### 定義

測試多個元件、模組或外部系統之間的互動。

### 何時必須有整合測試

| 情境 | 原因 |
|------|------|
| 查詢條件 | Mock 無法驗證過濾表達式 |
| 實體關聯 | 驗證外鍵正確性 |
| 複合主鍵 | 記憶體資料庫行為可能與真實資料庫不同 |
| 欄位映射 | DTO 與 Entity 轉換 |
| 分頁 | 資料排序與計數 |
| 交易 | 回滾行為 |

**判斷規則**:
如果你的單元測試對查詢/過濾參數使用萬用匹配器（`any()`、`It.IsAny<>`、`Arg.Any<>`），該功能必須有整合測試。

### 特性

- **元件整合**: 測試模組邊界
- **真實相依性**: 使用實際資料庫、API（通常容器化）
- **較慢**: 每個測試通常 1-10 秒

### 範圍

```
┌─────────────────────────────────────────┐
│         整合測試範圍                     │
├─────────────────────────────────────────┤
│  ✅ 資料庫 CRUD 操作                    │
│  ✅ Repository + Database               │
│  ✅ Service + Repository                │
│  ✅ API 端點 + Service 層               │
│  ✅ 訊息佇列生產者/消費者               │
│  ✅ 快取讀寫操作                        │
├─────────────────────────────────────────┤
│  ❌ 完整使用者工作流程                  │
│  ❌ 跨服務通訊                          │
│  ❌ UI 互動                             │
└─────────────────────────────────────────┘
```

### 命名慣例

**檔案命名**:
```
[ComponentName]IntegrationTests.[ext]
[ComponentName].integration.test.[ext]
[ComponentName].itest.[ext]

範例:
  UserRepositoryIntegrationTests.cs
  user-service.integration.test.ts
  user_repository_itest.py
```

**方法命名**:
```
[Operation]_[Context]_[ExpectedOutcome]

範例:
  CreateUser_WithValidData_PersistsToDatabase()
  GetUserById_ExistingUser_ReturnsUserFromDatabase()
  SendMessage_ToQueue_ConsumerReceivesMessage()
```

### 測試夾具

```csharp
// C# 整合測試範例，使用測試資料庫
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
        // Arrange - 準備
        var user = new User { Name = "Test User", Email = "test@example.com" };

        // Act - 執行
        await _repository.CreateAsync(user);
        var savedUser = await _repository.GetByIdAsync(user.Id);

        // Assert - 斷言
        Assert.IsNotNull(savedUser);
        Assert.AreEqual("Test User", savedUser.Name);
    }
}
```

---

## 系統測試 (ST)

### 定義

測試完整整合的系統，驗證是否符合指定需求。

### 特性

- **完整系統**: 所有元件部署並整合
- **基於需求**: 依據功能規格測試
- **類生產環境**: 使用類似生產的環境

### 範圍

```
┌─────────────────────────────────────────┐
│           系統測試範圍                   │
├─────────────────────────────────────────┤
│  ✅ 完整 API 工作流程                   │
│  ✅ 跨服務交易                          │
│  ✅ 資料流貫穿整個系統                  │
│  ✅ 安全需求                            │
│  ✅ 負載下的效能                        │
│  ✅ 錯誤處理與恢復                      │
│  ✅ 設定驗證                            │
├─────────────────────────────────────────┤
│  ❌ UI 視覺測試                         │
│  ❌ 使用者流程模擬                      │
│  ❌ A/B 測試情境                        │
└─────────────────────────────────────────┘
```

### 系統測試類型

| 類型 | 說明 |
|------|------|
| 功能測試 | 驗證功能符合規格 |
| 效能測試 | 負載、壓力、可擴展性測試 |
| 安全測試 | 滲透測試、漏洞掃描 |
| 可靠性測試 | 故障轉移、恢復、穩定性 |
| 相容性測試 | 跨平台、瀏覽器相容性 |

### 命名慣例

**檔案命名**:
```
[Feature]SystemTests.[ext]
[Feature].system.test.[ext]
[Feature]_st.[ext]

範例:
  OrderProcessingSystemTests.cs
  authentication.system.test.ts
  payment_processing_st.py
```

### 範例

```csharp
// 系統測試範例：完整資源處理流程
// 注意：將 {Resource}, {Item}, {Action} 替換為您的領域概念
[TestClass]
public class ResourceProcessingSystemTests
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
    public async Task ProcessResource_CompleteFlow_CompletedSuccessfully()
    {
        // Arrange: 建立測試資料
        var item = await _env.CreateTestItem(value: 100);
        var user = await _env.CreateTestUser();

        // Act: 執行完整處理流程
        // Step 1: 建立請求
        var requestResponse = await _client.PostAsync("/api/requests",
            new { itemId = item.Id, quantity = 2 });
        Assert.AreEqual(HttpStatusCode.OK, requestResponse.StatusCode);

        // Step 2: 提交處理
        var processResponse = await _client.PostAsync("/api/processes",
            new { requestId = requestResponse.RequestId, userId = user.Id });
        var process = await processResponse.Content.ReadAsAsync<Process>();
        Assert.AreEqual(HttpStatusCode.Created, processResponse.StatusCode);

        // Step 3: 確認完成
        var confirmResponse = await _client.PostAsync($"/api/processes/{process.Id}/confirm",
            new { confirmationType = "standard", amount = 200 });
        Assert.AreEqual(HttpStatusCode.OK, confirmResponse.StatusCode);

        // Assert: 驗證最終狀態
        var finalProcess = await _client.GetAsync($"/api/processes/{process.Id}");
        var result = await finalProcess.Content.ReadAsAsync<Process>();

        Assert.AreEqual(ProcessStatus.Completed, result.Status);
        Assert.AreEqual(200, result.TotalAmount);
        Assert.IsNotNull(result.Confirmation);
    }
}
```

---

## 端對端測試 (E2E)

### 定義

從使用者介面測試完整的使用者工作流程，貫穿所有系統層。

### 特性

- **使用者視角**: 模擬真實使用者互動
- **全棧**: UI → API → 資料庫 → 外部服務
- **最慢**: 每個測試通常 30 秒到數分鐘

### 範圍

```
┌─────────────────────────────────────────┐
│            E2E 測試範圍                 │
├─────────────────────────────────────────┤
│  ✅ 關鍵使用者流程                      │
│  ✅ 登入/驗證流程                       │
│  ✅ 核心業務交易                        │
│  ✅ 跨瀏覽器功能                        │
│  ✅ 部署煙霧測試                        │
├─────────────────────────────────────────┤
│  ❌ 所有可能的使用者路徑                │
│  ❌ 邊界情況（使用 UT/IT）              │
│  ❌ 效能基準測試                        │
└─────────────────────────────────────────┘
```

### 命名慣例

**檔案命名**:
```
[UserJourney].e2e.[ext]
[Feature].e2e.spec.[ext]
e2e/[feature]/[scenario].[ext]

範例:
  user-registration.e2e.ts
  checkout-flow.e2e.spec.ts
  e2e/authentication/login.spec.ts
```

### 範例

```typescript
// Playwright E2E 測試範例
import { test, expect } from '@playwright/test';

test.describe('使用者註冊流程', () => {
    test('應成功完成註冊並登入', async ({ page }) => {
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

## 測試替身

### 類型

| 類型 | 用途 | 使用範例 |
|------|------|----------|
| **Stub** (樁) | 回傳預定值 | 固定的 API 回應 |
| **Mock** (模擬物件) | 驗證互動 | 驗證方法被呼叫 |
| **Fake** (假物件) | 簡化的實作 | 記憶體資料庫 |
| **Spy** (間諜) | 記錄呼叫，委派給真實物件 | 部分模擬 |
| **Dummy** (虛設物件) | 佔位符，從不使用 | 填充必要參數 |

### 使用指引

```
┌─────────────────────────────────────────────────────────┐
│                  何時使用哪種替身                         │
├─────────────────────────────────────────────────────────┤
│  單元測試 (UT)                                          │
│  ├── 對所有外部相依使用 Mocks/Stubs                     │
│  └── 使用 Mocks 驗證互動                                │
├─────────────────────────────────────────────────────────┤
│  整合測試 (IT)                                          │
│  ├── 對資料庫使用 Fakes（記憶體、容器）                 │
│  ├── 對外部 API 使用 Stubs                              │
│  └── 最小化 mocking - 測試真實整合                      │
├─────────────────────────────────────────────────────────┤
│  系統測試 (ST)                                          │
│  ├── 盡可能使用真實元件                                 │
│  ├── 僅對外部第三方服務使用 Fakes                       │
│  └── 系統邊界內不使用 mocking                           │
├─────────────────────────────────────────────────────────┤
│  E2E 測試                                               │
│  ├── 使用真實的一切                                     │
│  └── 僅對外部支付/郵件服務使用 Stub                     │
└─────────────────────────────────────────────────────────┘
```

---

## Mock 限制

### 查詢條件驗證

**問題**:
當 Mock 接受查詢條件的 Repository 方法時（如 lambda 表達式、過濾函式），
使用萬用匹配器如 `any()` 會忽略實際的查詢邏輯，讓錯誤的查詢通過單元測試。

**範例**:

```python
# Python 範例
# ❌ 這個測試無法驗證查詢正確性
mock_repo.find.return_value = users
# 查詢可能寫錯，測試仍會通過

# ✓ 新增整合測試驗證實際查詢
```

```csharp
// C# 範例
// ❌ Moq 忽略實際的表達式
_repo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
     .ReturnsAsync(users);

// ✓ 用整合測試驗證，或使用 It.Is<> 來驗證
```

**經驗法則**:
如果你的單元測試 Mock 了一個接受查詢/過濾/條件參數的方法，
你必須有對應的整合測試來驗證查詢邏輯。

---

## 測試資料管理

### 原則

1. **隔離**: 每個測試管理自己的資料
2. **清理**: 測試結束後自行清理
3. **確定性**: 測試不依賴共享狀態
4. **可讀性**: 測試資料清楚顯示意圖

### 模式

```csharp
// Builder 模式建立測試資料
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

// 在測試中使用
var activeUser = new UserBuilder()
    .WithName("Active User")
    .Build();

var inactiveUser = new UserBuilder()
    .WithName("Inactive User")
    .Inactive()
    .Build();
```

### 區分識別欄位

當實體同時有代理鍵（自動產生的 ID）和業務識別碼（如員工編號、部門代碼）時，
測試資料必須使用不同的值。

**問題**:
如果測試資料在兩個欄位使用相同的值，欄位映射錯誤將無法被發現。

```python
# Python 範例
# ❌ 錯誤：id 與 business_code 相同
dept = Department(id=1, business_code=1)

# ✓ 正確：不同的值能抓到映射錯誤
dept = Department(id=1, business_code=1001)
```

```csharp
// C# 範例
// ❌ 錯誤：Id 與 DeptId 相同 - 映射錯誤不會被發現
var dept = new Department { Id = 1, DeptId = 1 };

// ✓ 正確：不同的值能抓到欄位映射錯誤
var dept = new Department { Id = 1, DeptId = 1001 };
```

**驗證**:
```csharp
// C#
testData.Dept.Id.Should().NotBe(testData.Dept.DeptId,
    "Test precondition: Id must differ from business identifier");
```

### 複合主鍵

對於使用複合主鍵的實體，確保每筆記錄有唯一的主鍵組合。

```csharp
// C# 範例
// ❌ 主鍵衝突 - 相同的 (Id, SendTime) 組合
var batch1 = new BatchRecord { Id = 0, SendTime = now };
var batch2 = new BatchRecord { Id = 0, SendTime = now };  // 衝突！

// ✓ 唯一組合
var batch1 = new BatchRecord { Id = 0, SendTime = now.AddSeconds(1) };
var batch2 = new BatchRecord { Id = 0, SendTime = now.AddSeconds(2) };
```

**提示**：建立自動產生唯一複合主鍵的輔助函式。

```csharp
// C# 輔助函式範例
private static int _timeOffset = 0;
public static BatchRecord CreateWithUniqueKey(DateTime baseTime)
{
    return new BatchRecord
    {
        SendTime = baseTime.AddSeconds(Interlocked.Increment(ref _timeOffset))
    };
}
```

---

## 測試環境隔離

### 目的

確保在開發機器與 CI/CD 管線之間獲得一致、可重現的測試結果。

### 為什麼重要

- **可重現性**: 相同測試在任何地方產生相同結果
- **隔離性**: 專案相依性不與系統或其他專案衝突
- **CI/CD 一致性**: 本地環境與 CI 環境相符

### 語言專屬虛擬環境

| 語言 | 工具 | Lock 檔案 |
|------|------|-----------|
| Python | venv, virtualenv, conda, poetry | requirements.txt, poetry.lock |
| Node.js | nvm, fnm + npm/yarn/pnpm | package-lock.json, yarn.lock |
| Ruby | rbenv, rvm, bundler | Gemfile.lock |
| Java | SDKMAN, jenv, Maven/Gradle | pom.xml, build.gradle.lock |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |
| Rust | rustup, cargo | Cargo.lock |

#### 最佳實踐

1. **開發和測試時始終使用虛擬環境**
2. **將 lock 檔提交到版本控制**
3. **在 CI/CD 管線中鎖定版本**
4. **在 README 或 .tool-versions 記錄所需的執行環境版本**

#### 範例：Python 使用 venv

```bash
# 建立虛擬環境
python -m venv .venv

# 啟用
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows

# 安裝相依套件
pip install -r requirements.txt

# 執行測試
pytest tests/
```

#### 範例：Node.js 使用 nvm

```bash
# 使用專案的 Node 版本
nvm use

# 安裝相依套件
npm ci

# 執行測試
npm test
```

### 容器化測試

使用容器為整合測試和系統測試提供一致的外部相依性（資料庫、訊息佇列等）。

#### 何時使用

| 測試層級 | 容器使用 |
|----------|----------|
| UT (單元測試) | ❌ 不需要 - 使用 mocks |
| IT (整合測試) | ✅ Testcontainers 用於資料庫、快取 |
| ST (系統測試) | ✅ Docker Compose 用於完整環境 |
| E2E (端對端) | ✅ 完整容器化堆疊 |

#### Testcontainers

Testcontainers 提供輕量級、可拋棄式的測試容器。

```csharp
// C# 範例使用 Testcontainers
public class DatabaseIntegrationTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:15")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task Should_Connect_To_Database()
    {
        var connectionString = _postgres.GetConnectionString();
        // 使用 connectionString 進行測試
    }
}
```

```python
# Python 範例使用 Testcontainers
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="module")
def postgres_container():
    with PostgresContainer("postgres:15") as postgres:
        yield postgres

def test_database_connection(postgres_container):
    connection_url = postgres_container.get_connection_url()
    # 使用 connection_url 進行測試
```

#### Docker Compose 用於系統測試

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  app:
    build: .
    depends_on:
      - db
      - redis
      - rabbitmq
    environment:
      - DATABASE_URL=postgres://test:test@db:5432/testdb
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: testdb

  redis:
    image: redis:7-alpine

  rabbitmq:
    image: rabbitmq:3-management
```

```bash
# 使用 Docker Compose 執行系統測試
docker-compose -f docker-compose.test.yml up -d
npm run test:system
docker-compose -f docker-compose.test.yml down -v
```

### 環境一致性檢查清單

```
┌─────────────────────────────────────────────────────────────┐
│              環境一致性檢查清單                               │
├─────────────────────────────────────────────────────────────┤
│  ✅ 本地與 CI 使用相同的執行環境版本（Node, Python 等）      │
│  ✅ 容器與生產使用相同的資料庫版本                           │
│  ✅ Lock 檔案已提交並在 CI 中使用（npm ci, pip -r）          │
│  ✅ 環境變數有文件並保持一致                                 │
│  ✅ 容器映像使用特定版本標籤                                 │
│  ✅ 使用 .tool-versions 或類似工具管理執行環境版本           │
├─────────────────────────────────────────────────────────────┤
│  ❌ 在生產/CI 中使用 "latest" 標籤                           │
│  ❌ 開發與 CI 使用不同的資料庫版本                           │
│  ❌ 儲存庫中缺少 lock 檔案                                   │
│  ❌ 硬編碼路徑或機器特定設定                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## CI/CD 整合

### 測試執行策略

```yaml
# CI 管線範例
stages:
  - unit-test        # 每次提交執行
  - integration-test # 每次提交執行
  - system-test      # PR 合併到 main 時執行
  - e2e-test         # 發布候選版本時執行

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

### 測試報告

每個測試層級所需的指標：

| 指標 | UT | IT | ST | E2E |
|------|----|----|----|----|
| 通過/失敗計數 | ✅ | ✅ | ✅ | ✅ |
| 執行時間 | ✅ | ✅ | ✅ | ✅ |
| 覆蓋率 % | ✅ | ✅ | ⚠️ | ❌ |
| 不穩定測試率 | ✅ | ✅ | ✅ | ✅ |
| 截圖/影片 | ❌ | ❌ | ⚠️ | ✅ |

---

## 最佳實踐

### AAA 模式

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

### FIRST 原則

| 原則 | 說明 |
|------|------|
| **F**ast (快速) | 測試執行迅速 |
| **I**ndependent (獨立) | 測試不互相影響 |
| **R**epeatable (可重複) | 每次結果相同 |
| **S**elf-validating (自我驗證) | 明確的通過/失敗 |
| **T**imely (及時) | 與生產程式碼一起撰寫 |

### 應避免的反模式

```
❌ 測試相依
   測試必須按特定順序執行

❌ 不穩定測試
   測試有時通過有時失敗

❌ 測試實作細節
   重構時測試會壞掉

❌ 過度模擬
   Mock 太多導致沒測到真正的東西

❌ 缺少斷言
   測試沒有驗證任何有意義的東西

❌ 魔術數字/字串
   測試程式碼中有未解釋的值

❌ 相同測試識別碼
   代理鍵和業務鍵使用相同的值
```

---

## 快速參考卡

```
┌─────────────────────────────────────────────────────────────┐
│                    測試層級摘要                              │
├──────────┬──────────────────────────────────────────────────┤
│   UT     │ 單一單元、隔離、模擬相依、< 100ms               │
│  單元測試 │                                                  │
├──────────┼──────────────────────────────────────────────────┤
│   IT     │ 元件整合、真實資料庫、1-10 秒                   │
│  整合測試 │                                                  │
├──────────┼──────────────────────────────────────────────────┤
│   ST     │ 完整系統、基於需求、類生產環境                  │
│  系統測試 │                                                  │
├──────────┼──────────────────────────────────────────────────┤
│  E2E     │ 使用者流程、UI 到 DB、僅關鍵路徑                │
│ 端對端   │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│                    命名慣例                                  │
├─────────────────────────────────────────────────────────────┤
│  檔案:  [Name]Tests.cs, [name].test.ts, [name]_test.py     │
│  方法: Method_Scenario_Expected, should_X_when_Y           │
├─────────────────────────────────────────────────────────────┤
│                    覆蓋率目標                                │
├─────────────────────────────────────────────────────────────┤
│  行: 最低 70% / 建議 85%                                    │
│  分支: 最低 60% / 建議 80%                                  │
│  函式: 最低 80% / 建議 90%                                  │
├─────────────────────────────────────────────────────────────┤
│               Mock 限制規則                                  │
├─────────────────────────────────────────────────────────────┤
│  若單元測試 Mock 查詢參數 → 必須有整合測試                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 相關標準

- [AI 協作防幻覺標準](anti-hallucination.md)
- [程式碼簽入檢查點標準](checkin-standards.md)
- [程式碼審查清單](code-review-checklist.md)
- [Commit 訊息規範](commit-message-guide.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.2.0 | 2025-12-19 | 新增：Mock 限制章節、整合測試必要性、區分識別欄位、複合主鍵測試資料模式 |
| 1.1.1 | 2025-12-11 | 改進：系統測試範例改用通用領域概念取代特定業務術語 |
| 1.1.0 | 2025-12-05 | 新增測試環境隔離章節（venv、容器） |
| 1.0.0 | 2025-12-05 | 初始測試標準，涵蓋 UT/IT/ST/E2E |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**維護者**: 開發團隊
