---
source: ../../../../../skills/claude-code/testing-guide/testing-pyramid.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2025-12-30
status: current
---

# 測試金字塔指南

> **語言**: [English](../../../../../skills/claude-code/testing-guide/testing-pyramid.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2025-12-29
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供測試金字塔和測試撰寫最佳實踐的詳細指南，支援 ISTQB 和業界通行金字塔框架。

---

## 框架選擇

| 框架 | 層級 | 適用場景 |
|-----------|--------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企業級、合規性、正式 QA |
| **業界通行金字塔** | UT (70%) → IT (20%) → E2E (10%) | 敏捷、DevOps、CI/CD |

**整合測試縮寫說明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用
- **SIT** (System Integration Testing)：企業/ISTQB 環境常用
- 兩者指的是相同的測試層級

---

## 單元測試 (UT)

### 定義

在隔離外部相依的情況下，測試單一函式、方法或類別。

### 特性

- **隔離**: 不存取資料庫、網路或檔案系統
- **快速**: 每個測試 < 100ms
- **確定性**: 相同輸入總是產生相同輸出

### 範圍

```
✅ 單一函式/方法
✅ 單一類別
✅ 純粹商業邏輯
✅ 資料轉換
✅ 驗證規則

❌ 資料庫查詢
❌ 外部 API 呼叫
❌ 檔案 I/O 操作
❌ 多類別互動
```

### 範例

```typescript
describe('UserValidator', () => {
    let validator: UserValidator;

    beforeEach(() => {
        validator = new UserValidator();
    });

    it('should return true for valid email format', () => {
        const result = validator.validateEmail('user@example.com');
        expect(result).toBe(true);
    });

    it('should return false for invalid email format', () => {
        const result = validator.validateEmail('invalid-email');
        expect(result).toBe(false);
    });
});
```

---

## 整合測試 (IT/SIT)

### 定義

測試多個元件、模組或外部系統之間的互動。

**縮寫說明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用（Martin Fowler、Google）
- **SIT** (System Integration Testing)：企業/ISTQB 環境常用
- 兩者指的是相同的測試概念

### 何時必須有整合測試

| 情境 | 原因 |
|----------|--------|
| 查詢述詞 | Mock 無法驗證過濾表達式 |
| 實體關聯 | 驗證外鍵正確性 |
| 複合主鍵 | 記憶體資料庫可能與真實資料庫不同 |
| 欄位對應 | DTO ↔ Entity 轉換 |
| 分頁 | 列排序和計數 |
| 交易 | 回滾行為 |

**決策規則**: 如果單元測試對查詢/過濾參數使用萬用字元匹配器（`any()`、`It.IsAny<>`、`Arg.Any<>`），該功能必須有整合測試。

### 特性

- **元件整合**: 測試模組邊界
- **真實相依**: 使用實際資料庫、API（通常容器化）
- **較慢**: 每個測試通常 1-10 秒

### 範圍

```
✅ 資料庫 CRUD 操作
✅ Repository + Database
✅ Service + Repository
✅ API 端點 + Service 層
✅ 訊息佇列生產者/消費者
✅ 快取讀寫操作

❌ 完整使用者工作流程
❌ 跨服務通訊
❌ UI 互動
```

### 範例

```typescript
describe('UserRepository Integration', () => {
    let repository: UserRepository;
    let dbContext: TestDbContext;

    beforeEach(async () => {
        dbContext = await TestDbContext.create();
        repository = new UserRepository(dbContext);
    });

    afterEach(async () => {
        await dbContext.dispose();
    });

    it('should persist user to database', async () => {
        const user = { name: 'Test User', email: 'test@example.com' };

        await repository.create(user);
        const saved = await repository.getById(user.id);

        expect(saved).not.toBeNull();
        expect(saved.name).toBe('Test User');
    });
});
```

---

## 系統測試 (ST)

### 定義

測試完整整合的系統，以驗證其符合指定需求。

### 特性

- **完整系統**: 所有元件已部署並整合
- **基於需求**: 針對功能規格進行測試
- **類生產環境**: 使用類似生產環境的環境

### 範圍

```
✅ 完整 API 工作流程
✅ 跨服務交易
✅ 整個系統的資料流
✅ 安全需求
✅ 負載下的效能
✅ 錯誤處理與恢復

❌ UI 視覺測試
❌ 使用者旅程模擬
❌ A/B 測試情境
```

### 類型

| 類型 | 描述 |
|------|-------------|
| 功能性 | 驗證功能按指定運作 |
| 效能 | 負載、壓力、擴展性測試 |
| 安全性 | 滲透、漏洞掃描 |
| 可靠性 | 容錯移轉、恢復、穩定性 |

---

## 端對端測試 (E2E)

### 定義

從使用者介面到所有系統層，測試完整的使用者工作流程。

### 特性

- **使用者視角**: 模擬真實使用者互動
- **全堆疊**: UI → API → Database → External Services
- **最慢**: 每個測試通常 30 秒到數分鐘

### 範圍

```
✅ 關鍵使用者旅程
✅ 登入/驗證流程
✅ 核心業務交易
✅ 跨瀏覽器功能
✅ 部署煙霧測試

❌ 所有可能的使用者路徑
❌ 邊緣案例（使用 UT/IT）
❌ 效能基準測試
```

### 範例 (Playwright)

```typescript
test.describe('User Registration Journey', () => {
    test('should complete registration and login', async ({ page }) => {
        // Navigate to registration
        await page.goto('/register');

        // Fill form
        await page.fill('[data-testid="email"]', 'new@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.click('[data-testid="register-button"]');

        // Verify success
        await expect(page.locator('[data-testid="success-message"]'))
            .toContainText('Registration successful');

        // Login with new account
        await page.goto('/login');
        await page.fill('[data-testid="email"]', 'new@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.click('[data-testid="login-button"]');

        // Verify dashboard
        await expect(page).toHaveURL('/dashboard');
    });
});
```

---

## 測試環境隔離

### 虛擬環境

| 語言 | 工具 | 鎖定檔案 |
|----------|-------|----------|
| Python | venv, poetry | requirements.txt, poetry.lock |
| Node.js | nvm + npm | package-lock.json |
| Ruby | rbenv, bundler | Gemfile.lock |
| Java | SDKMAN, Maven | pom.xml |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |

### 容器化測試

| 測試層級 | 容器使用 |
|------------|----------------|
| UT | ❌ 不需要 - 使用 mock |
| IT | ✅ 使用 Testcontainers 進行 DB、快取 |
| ST | ✅ 使用 Docker Compose 進行完整環境 |
| E2E | ✅ 完整容器化堆疊 |

### Testcontainers 範例

```typescript
import { PostgreSqlContainer } from 'testcontainers';

describe('Database Integration', () => {
    let container: PostgreSqlContainer;

    beforeAll(async () => {
        container = await new PostgreSqlContainer().start();
    });

    afterAll(async () => {
        await container.stop();
    });

    test('should connect to database', async () => {
        const connectionUrl = container.getConnectionUri();
        // Use connectionUrl for tests
    });
});
```

---

## Mock 限制

### 查詢述詞驗證

當模擬接受查詢述詞（例如 lambda 表達式、過濾函式）的 repository 方法時，使用萬用字元匹配器（如 `any()`）會忽略實際的查詢邏輯，允許不正確的查詢通過單元測試。

```typescript
// ❌ Jest mock 忽略實際過濾器
jest.spyOn(repo, 'findBy').mockResolvedValue(users);

// ✓ 使用整合測試驗證
```

**經驗法則**: 如果單元測試模擬接受查詢/過濾/述詞參數的方法，您必須有相應的整合測試來驗證查詢邏輯。

---

## 測試資料管理

### 原則

1. **隔離**: 每個測試管理自己的資料
2. **清理**: 測試執行後清理
3. **確定性**: 測試不依賴共享狀態
4. **可讀性**: 測試資料清楚顯示意圖

### 區分識別欄位

當實體同時具有代理鍵（自動產生的 ID）和業務識別碼（例如員工編號、部門代碼）時，測試資料必須對每個使用不同的值。

```typescript
// ❌ 錯誤: id 等於 businessCode - 對應錯誤無法檢測
const dept = { id: 1, businessCode: 1 };

// ✓ 正確: 不同的值可捕獲欄位對應錯誤
const dept = { id: 1, businessCode: 1001 };
```

### 複合主鍵

對於具有複合主鍵的實體，確保每筆記錄具有唯一的鍵組合。

```typescript
// ❌ 鍵衝突 - 相同的 (id, timestamp) 組合
const record1 = { id: 0, timestamp: now };
const record2 = { id: 0, timestamp: now };  // 衝突！

// ✓ 唯一組合
const record1 = { id: 0, timestamp: addSeconds(now, 1) };
const record2 = { id: 0, timestamp: addSeconds(now, 2) };
```

### 建造者模式

```typescript
class UserBuilder {
    private name = 'Default User';
    private email = 'default@example.com';
    private isActive = true;

    withName(name: string): this {
        this.name = name;
        return this;
    }

    withEmail(email: string): this {
        this.email = email;
        return this;
    }

    inactive(): this {
        this.isActive = false;
        return this;
    }

    build(): User {
        return { name: this.name, email: this.email, isActive: this.isActive };
    }
}

// Usage
const activeUser = new UserBuilder().withName('Active').build();
const inactiveUser = new UserBuilder().inactive().build();
```

---

## 快速參考卡

### 業界通行金字塔（適合敏捷/DevOps）

```
┌──────────┬──────────────────────────────────────────┐
│   UT     │ 單一單元、隔離、模擬相依、< 100ms               │
├──────────┼──────────────────────────────────────────┤
│ IT/SIT   │ 元件整合、真實資料庫、1-10 秒                  │
├──────────┼──────────────────────────────────────────┤
│  E2E     │ 使用者旅程、UI 到資料庫、僅關鍵路徑            │
└──────────┴──────────────────────────────────────────┘

比例: UT 70% | IT 20% | E2E 10%
```

### ISTQB 框架（適合企業/合規）

```
┌──────────┬──────────────────────────────────────────┐
│   UT     │ 元件測試、隔離單元                            │
├──────────┼──────────────────────────────────────────┤
│ IT/SIT   │ 整合測試、元件互動                            │
├──────────┼──────────────────────────────────────────┤
│   ST     │ 系統測試、需求驗證                            │
├──────────┼──────────────────────────────────────────┤
│ AT/UAT   │ 驗收測試、業務驗證                            │
└──────────┴──────────────────────────────────────────┘
```

**Mock 規則**: 如果 UT 模擬查詢參數 → 必須有 IT

---

## 相關標準

- [測試標準](../../../core/testing-standards.md)
- [程式碼審查檢查清單](../../../core/code-review-checklist.md)

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 1.1.0 | 2025-12-29 | 新增：框架選擇（ISTQB/業界通行金字塔）、IT/SIT 縮寫說明 |
| 1.0.0 | 2025-12-24 | 新增：標準區段（目的、相關標準、版本歷史、授權） |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
