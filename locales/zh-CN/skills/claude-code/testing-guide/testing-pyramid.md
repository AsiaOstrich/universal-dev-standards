---
source: ../../../../../skills/claude-code/testing-guide/testing-pyramid.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2025-12-30
status: current
---

# 测试金字塔指南

> **语言**: [English](../../../../../skills/claude-code/testing-guide/testing-pyramid.md) | 繁体中文

**版本**: 1.1.0
**最后更新**: 2025-12-29
**适用范围**: Claude Code Skills

---

## 目的

本文件提供测试金字塔和测试撰写最佳实践的详细指南，支援 ISTQB 和业界通行金字塔框架。

---

## 框架选择

| 框架 | 层级 | 适用场景 |
|-----------|--------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企业级、合规性、正式 QA |
| **业界通行金字塔** | UT (70%) → IT (20%) → E2E (10%) | 敏捷、DevOps、CI/CD |

**整合测试缩写说明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用
- **SIT** (System Integration Testing)：企业/ISTQB 环境常用
- 两者指的是相同的测试层级

---

## 单元测试 (UT)

### 定义

在隔离外部相依的情况下，测试单一函式、方法或类别。

### 特性

- **隔离**: 不存取资料库、网路或档案系统
- **快速**: 每个测试 < 100ms
- **确定性**: 相同输入总是产生相同输出

### 范围

```
✅ 单一函式/方法
✅ 单一类别
✅ 纯粹商业逻辑
✅ 资料转换
✅ 验证规则

❌ 资料库查询
❌ 外部 API 呼叫
❌ 档案 I/O 操作
❌ 多类别互动
```

### 范例

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

## 整合测试 (IT/SIT)

### 定义

测试多个元件、模组或外部系统之间的互动。

**缩写说明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用（Martin Fowler、Google）
- **SIT** (System Integration Testing)：企业/ISTQB 环境常用
- 两者指的是相同的测试概念

### 何时必须有整合测试

| 情境 | 原因 |
|----------|--------|
| 查询述词 | Mock 无法验证过滤表达式 |
| 实体关联 | 验证外键正确性 |
| 复合主键 | 记忆体资料库可能与真实资料库不同 |
| 栏位对应 | DTO ↔ Entity 转换 |
| 分页 | 列排序和计数 |
| 交易 | 回滚行为 |

**决策规则**: 如果单元测试对查询/过滤参数使用万用字元匹配器（`any()`、`It.IsAny<>`、`Arg.Any<>`），该功能必须有整合测试。

### 特性

- **元件整合**: 测试模组边界
- **真实相依**: 使用实际资料库、API（通常容器化）
- **较慢**: 每个测试通常 1-10 秒

### 范围

```
✅ 资料库 CRUD 操作
✅ Repository + Database
✅ Service + Repository
✅ API 端点 + Service 层
✅ 讯息伫列生产者/消费者
✅ 快取读写操作

❌ 完整使用者工作流程
❌ 跨服务通讯
❌ UI 互动
```

### 范例

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

### 定义

测试完整整合的系统，以验证其符合指定需求。

### 特性

- **完整系统**: 所有元件已部署并整合
- **基于需求**: 针对功能规格进行测试
- **类生产环境**: 使用类似生产环境的环境

### 范围

```
✅ 完整 API 工作流程
✅ 跨服务交易
✅ 整个系统的资料流
✅ 安全需求
✅ 负载下的效能
✅ 错误处理与恢复

❌ UI 视觉测试
❌ 使用者旅程模拟
❌ A/B 测试情境
```

### 类型

| 类型 | 描述 |
|------|-------------|
| 功能性 | 验证功能按指定运作 |
| 效能 | 负载、压力、扩展性测试 |
| 安全性 | 渗透、漏洞扫描 |
| 可靠性 | 容错移转、恢复、稳定性 |

---

## 端对端测试 (E2E)

### 定义

从使用者介面到所有系统层，测试完整的使用者工作流程。

### 特性

- **使用者视角**: 模拟真实使用者互动
- **全堆叠**: UI → API → Database → External Services
- **最慢**: 每个测试通常 30 秒到数分钟

### 范围

```
✅ 关键使用者旅程
✅ 登入/验证流程
✅ 核心业务交易
✅ 跨浏览器功能
✅ 部署烟雾测试

❌ 所有可能的使用者路径
❌ 边缘案例（使用 UT/IT）
❌ 效能基准测试
```

### 范例 (Playwright)

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

## 测试环境隔离

### 虚拟环境

| 语言 | 工具 | 锁定档案 |
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
| ST | ✅ 使用 Docker Compose 进行完整环境 |
| E2E | ✅ 完整容器化堆叠 |

### Testcontainers 范例

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

### 查询述词验证

当模拟接受查询述词（例如 lambda 表达式、过滤函式）的 repository 方法时，使用万用字元匹配器（如 `any()`）会忽略实际的查询逻辑，允许不正确的查询通过单元测试。

```typescript
// ❌ Jest mock 忽略实际过滤器
jest.spyOn(repo, 'findBy').mockResolvedValue(users);

// ✓ 使用整合测试验证
```

**经验法则**: 如果单元测试模拟接受查询/过滤/述词参数的方法，您必须有相应的整合测试来验证查询逻辑。

---

## 测试资料管理

### 原则

1. **隔离**: 每个测试管理自己的资料
2. **清理**: 测试执行后清理
3. **确定性**: 测试不依赖共享状态
4. **可读性**: 测试资料清楚显示意图

### 区分识别栏位

当实体同时具有代理键（自动产生的 ID）和业务识别码（例如员工编号、部门代码）时，测试资料必须对每个使用不同的值。

```typescript
// ❌ 错误: id 等于 businessCode - 对应错误无法检测
const dept = { id: 1, businessCode: 1 };

// ✓ 正确: 不同的值可捕获栏位对应错误
const dept = { id: 1, businessCode: 1001 };
```

### 复合主键

对于具有复合主键的实体，确保每笔记录具有唯一的键组合。

```typescript
// ❌ 键冲突 - 相同的 (id, timestamp) 组合
const record1 = { id: 0, timestamp: now };
const record2 = { id: 0, timestamp: now };  // 冲突！

// ✓ 唯一组合
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

## 快速参考卡

### 业界通行金字塔（适合敏捷/DevOps）

```
┌──────────┬──────────────────────────────────────────┐
│   UT     │ 单一单元、隔离、模拟相依、< 100ms               │
├──────────┼──────────────────────────────────────────┤
│ IT/SIT   │ 元件整合、真实资料库、1-10 秒                  │
├──────────┼──────────────────────────────────────────┤
│  E2E     │ 使用者旅程、UI 到资料库、仅关键路径            │
└──────────┴──────────────────────────────────────────┘

比例: UT 70% | IT 20% | E2E 10%
```

### ISTQB 框架（适合企业/合规）

```
┌──────────┬──────────────────────────────────────────┐
│   UT     │ 元件测试、隔离单元                            │
├──────────┼──────────────────────────────────────────┤
│ IT/SIT   │ 整合测试、元件互动                            │
├──────────┼──────────────────────────────────────────┤
│   ST     │ 系统测试、需求验证                            │
├──────────┼──────────────────────────────────────────┤
│ AT/UAT   │ 验收测试、业务验证                            │
└──────────┴──────────────────────────────────────────┘
```

**Mock 规则**: 如果 UT 模拟查询参数 → 必须有 IT

---

## 相关标准

- [测试标准](../../../core/testing-standards.md)
- [程式码审查检查清单](../../../core/code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.1.0 | 2025-12-29 | 新增：框架选择（ISTQB/业界通行金字塔）、IT/SIT 缩写说明 |
| 1.0.0 | 2025-12-24 | 新增：标准区段（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
