---
source: ../../../../skills/testing-guide/testing-pyramid.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2025-12-30
status: current
---

# 测试金字塔指南

> **语言**: [English](../../../../skills/testing-guide/testing-pyramid.md) | 简体中文

**版本**: 1.1.0
**最後更新**: 2025-12-29
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供测试金字塔和测试撰写最佳实踐的详细指南，支援 ISTQB 和业界通行金字塔框架。

---

## 框架选择

| 框架 | 层级 | 適用場景 |
|-----------|--------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企业级、合規性、正式 QA |
| **业界通行金字塔** | UT (70%) → IT (20%) → E2E (10%) | 敏捷、DevOps、CI/CD |

**集成测试縮写说明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用
- **SIT** (System Integration Testing)：企业/ISTQB 環境常用
- 兩者指的是相同的测试层级

---

## 单元测试 (UT)

### 定義

在隔離外部相依的情况下，测试单一函式、方法或类别。

### 特性

- **隔離**: 不存取数据庫、网络或文件系统
- **快速**: 每个测试 < 100ms
- **确定性**: 相同输入總是产生相同输出

### 範圍

```
✅ 单一函式/方法
✅ 单一类别
✅ 純粹商业邏辑
✅ 数据转换
✅ 验证規則

❌ 数据庫查詢
❌ 外部 API 呼叫
❌ 文件 I/O 操作
❌ 多类别互动
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

## 集成测试 (IT/SIT)

### 定義

测试多个元件、模組或外部系统之间的互动。

**縮写说明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用（Martin Fowler、Google）
- **SIT** (System Integration Testing)：企业/ISTQB 環境常用
- 兩者指的是相同的测试概念

### 何时必須有集成测试

| 情境 | 原因 |
|----------|--------|
| 查詢述詞 | Mock 無法验证過濾表达式 |
| 实体关联 | 验证外鍵正确性 |
| 複合主鍵 | 记忆体数据庫可能与真实数据庫不同 |
| 欄位对应 | DTO ↔ Entity 转换 |
| 分页 | 列排序和计數 |
| 交易 | 回滾行为 |

**决策規則**: 如果单元测试对查詢/過濾參數使用萬用字元匹配器（`any()`、`It.IsAny<>`、`Arg.Any<>`），該功能必須有集成测试。

### 特性

- **元件集成**: 测试模組邊界
- **真实相依**: 使用实际数据庫、API（通常容器化）
- **較慢**: 每个测试通常 1-10 秒

### 範圍

```
✅ 数据庫 CRUD 操作
✅ Repository + Database
✅ Service + Repository
✅ API 端点 + Service 层
✅ 消息佇列生产者/消费者
✅ 快取读写操作

❌ 完整使用者工作流程
❌ 跨服务通訊
❌ UI 互动
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

## 系统测试 (ST)

### 定義

测试完整集成的系统，以验证其符合指定需求。

### 特性

- **完整系统**: 所有元件已部署并集成
- **基於需求**: 針对功能規格进行测试
- **类生产環境**: 使用类似生产環境的環境

### 範圍

```
✅ 完整 API 工作流程
✅ 跨服务交易
✅ 整个系统的数据流
✅ 安全需求
✅ 負载下的效能
✅ 错误处理与恢復

❌ UI 视覺测试
❌ 使用者旅程模擬
❌ A/B 测试情境
```

### 类型

| 类型 | 描述 |
|------|-------------|
| 功能性 | 验证功能按指定运作 |
| 效能 | 負载、壓力、擴展性测试 |
| 安全性 | 滲透、漏洞掃描 |
| 可靠性 | 容錯移转、恢復、穩定性 |

---

## 端对端测试 (E2E)

### 定義

從使用者界面到所有系统层，测试完整的使用者工作流程。

### 特性

- **使用者视角**: 模擬真实使用者互动
- **全堆疊**: UI → API → Database → External Services
- **最慢**: 每个测试通常 30 秒到數分鐘

### 範圍

```
✅ 关鍵使用者旅程
✅ 登入/验证流程
✅ 核心业务交易
✅ 跨浏览器功能
✅ 部署煙霧测试

❌ 所有可能的使用者路徑
❌ 邊緣案例（使用 UT/IT）
❌ 效能基准测试
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

## 测试環境隔離

### 虛擬環境

| 语言 | 工具 | 鎖定文件 |
|----------|-------|----------|
| Python | venv, poetry | requirements.txt, poetry.lock |
| Node.js | nvm + npm | package-lock.json |
| Ruby | rbenv, bundler | Gemfile.lock |
| Java | SDKMAN, Maven | pom.xml |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |

### 容器化测试

| 测试层级 | 容器使用 |
|------------|----------------|
| UT | ❌ 不需要 - 使用 mock |
| IT | ✅ 使用 Testcontainers 进行 DB、快取 |
| ST | ✅ 使用 Docker Compose 进行完整環境 |
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

### 查詢述詞验证

當模擬接受查詢述詞（例如 lambda 表达式、過濾函式）的 repository 方法时，使用萬用字元匹配器（如 `any()`）会忽略实际的查詢邏辑，允許不正确的查詢通過单元测试。

```typescript
// ❌ Jest mock 忽略实际過濾器
jest.spyOn(repo, 'findBy').mockResolvedValue(users);

// ✓ 使用集成测试验证
```

**經驗法則**: 如果单元测试模擬接受查詢/過濾/述詞參數的方法，您必須有相应的集成测试來验证查詢邏辑。

---

## 测试数据管理

### 原則

1. **隔離**: 每个测试管理自己的数据
2. **清理**: 测试执行後清理
3. **确定性**: 测试不依賴共享状态
4. **可读性**: 测试数据清楚顯示意图

### 區分識别欄位

當实体同时具有代理鍵（自动产生的 ID）和业务識别码（例如員工编号、部門代码）时，测试数据必須对每个使用不同的值。

```typescript
// ❌ 错误: id 等於 businessCode - 对应错误無法檢测
const dept = { id: 1, businessCode: 1 };

// ✓ 正确: 不同的值可捕獲欄位对应错误
const dept = { id: 1, businessCode: 1001 };
```

### 複合主鍵

对於具有複合主鍵的实体，确保每筆记录具有唯一的鍵組合。

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

### 业界通行金字塔（適合敏捷/DevOps）

```
┌──────────┬──────────────────────────────────────────┐
│   UT     │ 单一单元、隔離、模擬相依、< 100ms               │
├──────────┼──────────────────────────────────────────┤
│ IT/SIT   │ 元件集成、真实数据庫、1-10 秒                  │
├──────────┼──────────────────────────────────────────┤
│  E2E     │ 使用者旅程、UI 到数据庫、僅关鍵路徑            │
└──────────┴──────────────────────────────────────────┘

比例: UT 70% | IT 20% | E2E 10%
```

### ISTQB 框架（適合企业/合規）

```
┌──────────┬──────────────────────────────────────────┐
│   UT     │ 元件测试、隔離单元                            │
├──────────┼──────────────────────────────────────────┤
│ IT/SIT   │ 集成测试、元件互动                            │
├──────────┼──────────────────────────────────────────┤
│   ST     │ 系统测试、需求验证                            │
├──────────┼──────────────────────────────────────────┤
│ AT/UAT   │ 驗收测试、业务验证                            │
└──────────┴──────────────────────────────────────────┘
```

**Mock 規則**: 如果 UT 模擬查詢參數 → 必須有 IT

---

## 相关标准

- [测试标准](../../../../core/testing-standards.md)
- [程序码审查检查清单](../../../../core/code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.1.0 | 2025-12-29 | 新增：框架选择（ISTQB/业界通行金字塔）、IT/SIT 縮写说明 |
| 1.0.0 | 2025-12-24 | 新增：标准區段（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
