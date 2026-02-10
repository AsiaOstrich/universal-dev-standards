---
source: ../../../../options/testing/integration-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 整合测试 (IT/SIT)

> **语言**: [English](../../../options/testing/integration-testing.md) | 繁体中文

**上层标准**: [测试指南](../../core/testing.md)

---

## 缩写说明

整合测试层级在业界有两种常见的缩写：

| 缩写 | 全名 | 常见用法 |
|------|------|----------|
| **IT** | Integration Testing | 敏捷/DevOps 社群（Martin Fowler、Google Testing Blog） |
| **SIT** | System Integration Testing | 企业/ISTQB 环境、传统 QA 环境 |

两者指的是相同的测试概念。本文件交替使用 IT/SIT。

---

## 概述

整合测试验证不同模组、服务或元件是否能正确地协同运作。这些测试验证整合单元之间的互动和资料流，同时可能使用真实的相依性如资料库或外部服务。

## 特性

| 属性 | 值 |
|------|------|
| 范围 | 多个元件协同运作 |
| 相依性 | 真实与模拟混合 |
| 执行速度 | 秒到分钟 |
| 隔离性 | 部分——测试真实整合 |
| 数量 | 中等数量的测试 |

## 适用情境

- 测试 API 端点与资料库
- 验证服务间通讯
- 验证层间资料流
- 测试第三方整合
- 验证设定和连线

## 测试金字塔位置

```
        /\
       /  \      E2E 测试（少）
      /----\
     / ★★★ \    整合测试 ← 这一层
    /--------\
   /          \  单元测试（多）
  /------------\
```

## 整合测试类型

### 1. 元件整合

测试内部元件间的互动：

```javascript
// 测试：UserService + UserRepository + Database
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

### 2. API 整合

使用真实服务测试 REST/GraphQL 端点：

```python
# Python/pytest 范例
class TestUserAPI:
    def test_create_user_endpoint(self, test_client, test_database):
        # 执行
        response = test_client.post('/api/users', json={
            'name': 'John Doe',
            'email': 'john@example.com'
        })

        # 验证
        assert response.status_code == 201
        assert response.json()['name'] == 'John Doe'

        # 验证资料库
        user = test_database.query(User).filter_by(email='john@example.com').first()
        assert user is not None
```

### 3. 资料库整合

使用真实资料库测试资料存取层：

```java
// Java/JUnit 范例
@SpringBootTest
@Transactional
class UserRepositoryIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUsersByRole() {
        // 安排
        userRepository.save(new User("admin", Role.ADMIN));
        userRepository.save(new User("user1", Role.USER));

        // 执行
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        // 验证
        assertThat(admins).hasSize(1);
    }
}
```

## 最佳实践

### 1. 隔离测试资料

```javascript
describe('Order Integration', () => {
  beforeEach(async () => {
    // 每个测试都从干净状态开始
    await database.truncate(['orders', 'order_items']);
    await seedProducts();
  });
});
```

### 2. 使用交易进行清理

```python
@pytest.fixture
def db_session():
    """提供测试的交易范围。"""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

### 3. 测试真实情境

```javascript
it('should handle checkout with out-of-stock item', async () => {
  // 设置：库存有限的产品
  await inventory.setStock('SKU-001', 1);

  // 第一笔订单成功
  const order1 = await checkout.process({ sku: 'SKU-001', qty: 1 });
  expect(order1.status).toBe('confirmed');

  // 第二笔订单因库存不足失败
  await expect(checkout.process({ sku: 'SKU-001', qty: 1 }))
    .rejects.toThrow('Out of stock');
});
```

## 应该测试什么

| 情境 | 原因 |
|------|------|
| 资料库查询 | 验证 SQL/ORM 正确运作 |
| API 端点 | 测试路由、中介软体、回应 |
| 服务互动 | 验证服务间合约 |
| 交易边界 | 确保资料一致性 |
| 错误传播 | 测试跨层错误处理 |

## 常见框架与工具

| 类别 | 工具 |
|------|------|
| 测试容器 | Testcontainers、Docker Compose |
| HTTP 模拟 | nock、WireMock、responses |
| 资料库 | H2（Java）、SQLite（测试模式）|
| API 测试 | Supertest、REST Assured、httpx |

## 相关选项

- [单元测试](./unit-testing.md) - 测试个别元件
- [系统测试](./system-testing.md) - 测试完整系统
- [E2E 测试](./e2e-testing.md) - 测试使用者流程

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
