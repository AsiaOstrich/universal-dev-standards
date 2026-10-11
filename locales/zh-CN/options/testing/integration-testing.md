---
source: ../../../../options/testing/integration-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 4ac1711a8097
status: current
---

# 集成测试（IT/SIT）

> **语言**: [English](../../../../options/testing/integration-testing.md) | 简体中文

**上层标准**: [测试指南](../../core/testing-standards.md)

---

## 缩写说明

集成测试这一层级在业界有两种常见缩写：

| 缩写 | 全称 | 常见用法 |
|--------------|-----------|--------------|
| **IT** | Integration Testing | Agile/DevOps 社区（Martin Fowler、Google Testing Blog） |
| **SIT** | System Integration Testing | Enterprise/ISTQB 场景、传统 QA 环境 |

两个术语指的是同一个测试概念。本文档交替使用 IT/SIT。

---

## 概览

集成测试验证不同的模块、服务或组件能否正确协同运作。这类测试验证已集成单元之间的交互与数据流，并可能使用数据库或外部服务等真实依赖。

## 特性

| 属性 | 值 |
|-----------|-------|
| 范围 | 多个协同运作的组件 |
| 依赖 | 真实与 mock 混合 |
| 执行速度 | 数秒到数分钟 |
| 隔离程度 | 部分隔离——测试真实的集成 |
| 数量 | 适量的测试 |

## 最适用于

- 搭配数据库测试 API 端点
- 验证服务之间的通信
- 验证各层之间的数据流
- 测试第三方集成
- 验证配置与组件装配（wiring）

## 在测试金字塔中的位置

```
        /\
       /  \      E2E Tests (few)
      /----\
     / ★★★ \    Integration Tests (this level)
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

集成测试位于中间层：验证组件之间的交互。

## 集成测试的类型

### 1. 组件集成

测试内部组件之间的交互：

```javascript
// Test: UserService + UserRepository + Database
describe('UserService Integration', () => {
  let userService;
  let database;

  beforeAll(async () => {
    database = await TestDatabase.connect();
    const userRepository = new UserRepository(database);
    userService = new UserService(userRepository);
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('should create and retrieve user', async () => {
    const created = await userService.createUser({
      name: 'John',
      email: 'john@example.com'
    });

    const retrieved = await userService.getUser(created.id);

    expect(retrieved.name).toBe('John');
    expect(retrieved.email).toBe('john@example.com');
  });
});
```

### 2. API 集成

搭配真实服务测试 REST/GraphQL 端点：

```python
# Python/pytest example
class TestUserAPI:
    @pytest.fixture(autouse=True)
    def setup(self, test_client, test_database):
        self.client = test_client
        self.db = test_database

    def test_create_user_endpoint(self):
        # Act
        response = self.client.post('/api/users', json={
            'name': 'John Doe',
            'email': 'john@example.com'
        })

        # Assert
        assert response.status_code == 201
        assert response.json()['name'] == 'John Doe'

        # Verify database
        user = self.db.query(User).filter_by(email='john@example.com').first()
        assert user is not None
```

### 3. 服务集成

测试微服务之间的通信：

```javascript
describe('Order Service Integration', () => {
  it('should process order with inventory check', async () => {
    // Arrange
    const inventoryService = new InventoryService(inventoryApi);
    const paymentService = new PaymentService(paymentApi);
    const orderService = new OrderService(inventoryService, paymentService);

    // Act
    const order = await orderService.processOrder({
      productId: 'SKU-001',
      quantity: 2,
      paymentMethod: 'credit_card'
    });

    // Assert
    expect(order.status).toBe('confirmed');
    expect(order.inventoryReserved).toBe(true);
    expect(order.paymentProcessed).toBe(true);
  });
});
```

### 4. 数据库集成

搭配真实数据库测试数据访问层：

```java
// Java/JUnit example
@SpringBootTest
@Transactional
class UserRepositoryIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUsersByRole() {
        // Arrange
        userRepository.save(new User("admin", Role.ADMIN));
        userRepository.save(new User("user1", Role.USER));
        userRepository.save(new User("user2", Role.USER));

        // Act
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        // Assert
        assertThat(admins).hasSize(1);
        assertThat(admins.get(0).getUsername()).isEqualTo("admin");
    }
}
```

## 测试环境设置

### 数据库设置

```javascript
// Using test containers (JavaScript)
const { GenericContainer } = require('testcontainers');

let postgresContainer;

beforeAll(async () => {
  postgresContainer = await new GenericContainer('postgres:14')
    .withEnvironment({
      POSTGRES_DB: 'testdb',
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test'
    })
    .withExposedPorts(5432)
    .start();

  process.env.DATABASE_URL = `postgresql://test:test@localhost:${postgresContainer.getMappedPort(5432)}/testdb`;
});

afterAll(async () => {
  await postgresContainer.stop();
});
```

### 为外部服务 mock API

```javascript
// Mock external APIs while using real internal services
const nock = require('nock');

beforeEach(() => {
  // Mock external payment API
  nock('https://api.payment-provider.com')
    .post('/v1/charges')
    .reply(200, { id: 'ch_test', status: 'succeeded' });
});

afterEach(() => {
  nock.cleanAll();
});
```

## 最佳实践

### 1. 隔离测试数据

```javascript
describe('Order Integration', () => {
  beforeEach(async () => {
    // Clean slate for each test
    await database.truncate(['orders', 'order_items']);

    // Seed required reference data
    await seedProducts();
  });
});
```

### 2. 使用事务进行清理

```python
@pytest.fixture
def db_session():
    """Provide a transactional scope for tests."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

### 3. 测试贴近现实的场景

```javascript
// Good: Tests real workflow
it('should handle checkout with out-of-stock item', async () => {
  // Setup: Product with limited stock
  await inventory.setStock('SKU-001', 1);

  // First order succeeds
  const order1 = await checkout.process({ sku: 'SKU-001', qty: 1 });
  expect(order1.status).toBe('confirmed');

  // Second order fails due to stock
  await expect(checkout.process({ sku: 'SKU-001', qty: 1 }))
    .rejects.toThrow('Out of stock');
});
```

### 4. 处理异步操作

```javascript
// Wait for eventual consistency
it('should update search index after product create', async () => {
  const product = await productService.create({ name: 'Widget' });

  // Wait for async index update
  await waitFor(async () => {
    const results = await searchService.search('Widget');
    expect(results).toContainEqual(expect.objectContaining({ id: product.id }));
  }, { timeout: 5000 });
});
```

## 测试什么

### 应该测试

| 场景 | 原因 |
|----------|-----|
| 数据库查询 | 验证 SQL/ORM 正确运作 |
| API 端点 | 测试路由、中间件、响应 |
| 服务交互 | 验证服务之间的契约 |
| 事务边界 | 确保数据一致性 |
| 错误传播 | 测试跨层的错误处理 |

### 不应测试

| 场景 | 原因 |
|----------|-----|
| 框架内部实现 | 信任框架 |
| 生产环境中的第三方服务 | 使用 mock 或沙箱 |
| UI 渲染 | 使用 E2E 测试 |
| 单元级逻辑 | 使用单元测试 |

## 常见框架与工具

| 类别 | 工具 |
|----------|-------|
| 测试容器 | Testcontainers, Docker Compose |
| HTTP Mock | nock, WireMock, responses |
| 数据库 | H2 (Java), SQLite（测试模式） |
| API 测试 | Supertest, REST Assured, httpx |

## 相关选项

- [单元测试](./unit-testing.md) - 测试单个组件
- [系统测试](./system-testing.md) - 测试完整系统
- [E2E 测试](./e2e-testing.md) - 测试用户工作流程

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
