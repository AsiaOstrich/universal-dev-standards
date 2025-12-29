# Integration Testing

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/integration-testing.md)

**Parent Standard**: [Testing Guide](../../core/testing.md)

---

## Overview

Integration testing verifies that different modules, services, or components work correctly together. These tests validate the interactions and data flow between integrated units while potentially using real dependencies like databases or external services.

## Characteristics

| Attribute | Value |
|-----------|-------|
| Scope | Multiple components working together |
| Dependencies | Mix of real and mocked |
| Execution Speed | Seconds to minutes |
| Isolation | Partial - tests real integrations |
| Quantity | Moderate number of tests |

## Best For

- Testing API endpoints with database
- Verifying service-to-service communication
- Validating data flow between layers
- Testing third-party integrations
- Verifying configuration and wiring

## Testing Pyramid Position

```
        /\
       /  \      E2E Tests (few)
      /----\
     / ★★★ \    Integration Tests (this level)
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

Integration tests sit in the middle: validating component interactions.

## Types of Integration Tests

### 1. Component Integration

Test interactions between internal components:

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

### 2. API Integration

Test REST/GraphQL endpoints with real services:

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

### 3. Service Integration

Test communication between microservices:

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

### 4. Database Integration

Test data access layer with real database:

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

## Test Environment Setup

### Database Setup

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

### API Mocking for External Services

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

## Best Practices

### 1. Isolate Test Data

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

### 2. Use Transactions for Cleanup

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

### 3. Test Realistic Scenarios

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

### 4. Handle Async Operations

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

## What to Test

### DO Test

| Scenario | Why |
|----------|-----|
| Database queries | Verify SQL/ORM works correctly |
| API endpoints | Test routing, middleware, responses |
| Service interactions | Verify contracts between services |
| Transaction boundaries | Ensure data consistency |
| Error propagation | Test error handling across layers |

### DON'T Test

| Scenario | Why |
|----------|-----|
| Framework internals | Trust the framework |
| Third-party services in production | Use mocks or sandboxes |
| UI rendering | Use E2E tests |
| Unit-level logic | Use unit tests |

## Common Frameworks & Tools

| Category | Tools |
|----------|-------|
| Test Containers | Testcontainers, Docker Compose |
| HTTP Mocking | nock, WireMock, responses |
| Database | H2 (Java), SQLite (testing mode) |
| API Testing | Supertest, REST Assured, httpx |

## Related Options

- [Unit Testing](./unit-testing.md) - Test individual components
- [System Testing](./system-testing.md) - Test complete system
- [E2E Testing](./e2e-testing.md) - Test user workflows

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
