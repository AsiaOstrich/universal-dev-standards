---
source: ../../../../options/testing/integration-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 整合測試 (IT/SIT)

> **語言**: [English](../../../../options/testing/integration-testing.md) | 繁體中文

**上層標準**: [測試指南](../../core/testing.md)

---

## 縮寫說明

整合測試層級在業界有兩種常見的縮寫：

| 縮寫 | 全名 | 常見用法 |
|------|------|----------|
| **IT** | Integration Testing | 敏捷/DevOps 社群（Martin Fowler、Google Testing Blog） |
| **SIT** | System Integration Testing | 企業/ISTQB 環境、傳統 QA 環境 |

兩者指的是相同的測試概念。本文件交替使用 IT/SIT。

---

## 概述

整合測試驗證不同模組、服務或元件是否能正確地協同運作。這些測試驗證整合單元之間的互動和資料流，同時可能使用真實的相依性如資料庫或外部服務。

## 特性

| 屬性 | 值 |
|------|------|
| 範圍 | 多個元件協同運作 |
| 相依性 | 真實與模擬混合 |
| 執行速度 | 秒到分鐘 |
| 隔離性 | 部分——測試真實整合 |
| 數量 | 中等數量的測試 |

## 適用情境

- 測試 API 端點與資料庫
- 驗證服務間通訊
- 驗證層間資料流
- 測試第三方整合
- 驗證設定和連線

## 測試金字塔位置

```
        /\
       /  \      E2E 測試（少）
      /----\
     / ★★★ \    整合測試 ← 這一層
    /--------\
   /          \  單元測試（多）
  /------------\
```

## 整合測試類型

### 1. 元件整合

測試內部元件間的互動：

```javascript
// 測試：UserService + UserRepository + Database
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

使用真實服務測試 REST/GraphQL 端點：

```python
# Python/pytest 範例
class TestUserAPI:
    def test_create_user_endpoint(self, test_client, test_database):
        # 執行
        response = test_client.post('/api/users', json={
            'name': 'John Doe',
            'email': 'john@example.com'
        })

        # 驗證
        assert response.status_code == 201
        assert response.json()['name'] == 'John Doe'

        # 驗證資料庫
        user = test_database.query(User).filter_by(email='john@example.com').first()
        assert user is not None
```

### 3. 資料庫整合

使用真實資料庫測試資料存取層：

```java
// Java/JUnit 範例
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

        // 執行
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        // 驗證
        assertThat(admins).hasSize(1);
    }
}
```

## 最佳實踐

### 1. 隔離測試資料

```javascript
describe('Order Integration', () => {
  beforeEach(async () => {
    // 每個測試都從乾淨狀態開始
    await database.truncate(['orders', 'order_items']);
    await seedProducts();
  });
});
```

### 2. 使用交易進行清理

```python
@pytest.fixture
def db_session():
    """提供測試的交易範圍。"""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

### 3. 測試真實情境

```javascript
it('should handle checkout with out-of-stock item', async () => {
  // 設置：庫存有限的產品
  await inventory.setStock('SKU-001', 1);

  // 第一筆訂單成功
  const order1 = await checkout.process({ sku: 'SKU-001', qty: 1 });
  expect(order1.status).toBe('confirmed');

  // 第二筆訂單因庫存不足失敗
  await expect(checkout.process({ sku: 'SKU-001', qty: 1 }))
    .rejects.toThrow('Out of stock');
});
```

## 應該測試什麼

| 情境 | 原因 |
|------|------|
| 資料庫查詢 | 驗證 SQL/ORM 正確運作 |
| API 端點 | 測試路由、中介軟體、回應 |
| 服務互動 | 驗證服務間合約 |
| 交易邊界 | 確保資料一致性 |
| 錯誤傳播 | 測試跨層錯誤處理 |

## 常見框架與工具

| 類別 | 工具 |
|------|------|
| 測試容器 | Testcontainers、Docker Compose |
| HTTP 模擬 | nock、WireMock、responses |
| 資料庫 | H2（Java）、SQLite（測試模式）|
| API 測試 | Supertest、REST Assured、httpx |

## 相關選項

- [單元測試](./unit-testing.md) - 測試個別元件
- [系統測試](./system-testing.md) - 測試完整系統
- [E2E 測試](./e2e-testing.md) - 測試使用者流程

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
