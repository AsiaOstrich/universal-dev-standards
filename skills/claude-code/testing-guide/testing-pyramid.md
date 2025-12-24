# Testing Pyramid Guide

## Unit Testing (UT) | 單元測試

### Definition

Tests individual functions, methods, or classes in isolation from external dependencies.

### Characteristics

- **Isolated**: No database, network, or file system access
- **Fast**: Each test < 100ms
- **Deterministic**: Same input always produces same output

### Scope

```
✅ Single function/method
✅ Single class
✅ Pure business logic
✅ Data transformations
✅ Validation rules

❌ Database queries
❌ External API calls
❌ File I/O operations
❌ Multi-class interactions
```

### Example

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

## Integration Testing (IT) | 整合測試

### Definition

Tests interactions between multiple components, modules, or external systems.

### When Integration Tests Are Required | 何時必須有整合測試

| Scenario | Reason |
|----------|--------|
| Query predicates | Mocks cannot verify filter expressions |
| Entity relationships | Verify foreign key correctness |
| Composite keys | In-memory DB may differ from real DB |
| Field mapping | DTO ↔ Entity transformations |
| Pagination | Row ordering and counting |
| Transactions | Rollback behavior |

**Decision Rule**: If your unit test uses a wildcard matcher (`any()`, `It.IsAny<>`, `Arg.Any<>`) for a query/filter parameter, that functionality MUST have an integration test.

### Characteristics

- **Component Integration**: Tests module boundaries
- **Real Dependencies**: Uses actual databases, APIs (often containerized)
- **Slower**: Each test typically 1-10 seconds

### Scope

```
✅ Database CRUD operations
✅ Repository + Database
✅ Service + Repository
✅ API endpoint + Service layer
✅ Message queue producers/consumers
✅ Cache read/write operations

❌ Full user workflows
❌ Cross-service communication
❌ UI interactions
```

### Example

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

## System Testing (ST) | 系統測試

### Definition

Tests the complete integrated system to verify it meets specified requirements.

### Characteristics

- **Complete System**: All components deployed and integrated
- **Requirement-Based**: Tests against functional specifications
- **Production-Like**: Uses environment similar to production

### Scope

```
✅ Complete API workflows
✅ Cross-service transactions
✅ Data flow through entire system
✅ Security requirements
✅ Performance under load
✅ Error handling & recovery

❌ UI visual testing
❌ User journey simulations
❌ A/B testing scenarios
```

### Types

| Type | Description |
|------|-------------|
| Functional | Verify features work as specified |
| Performance | Load, stress, scalability testing |
| Security | Penetration, vulnerability scanning |
| Reliability | Failover, recovery, stability |

---

## End-to-End Testing (E2E) | 端對端測試

### Definition

Tests complete user workflows from the user interface through all system layers.

### Characteristics

- **User Perspective**: Simulates real user interactions
- **Full Stack**: UI → API → Database → External Services
- **Slowest**: Each test typically 30 seconds to several minutes

### Scope

```
✅ Critical user journeys
✅ Login/Authentication flows
✅ Core business transactions
✅ Cross-browser functionality
✅ Smoke tests for deployments

❌ Every possible user path
❌ Edge cases (use UT/IT)
❌ Performance benchmarking
```

### Example (Playwright)

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

## Test Environment Isolation

### Virtual Environments

| Language | Tools | Lock File |
|----------|-------|----------|
| Python | venv, poetry | requirements.txt, poetry.lock |
| Node.js | nvm + npm | package-lock.json |
| Ruby | rbenv, bundler | Gemfile.lock |
| Java | SDKMAN, Maven | pom.xml |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |

### Containerized Testing

| Test Level | Container Usage |
|------------|----------------|
| UT | ❌ Not needed - use mocks |
| IT | ✅ Testcontainers for DB, cache |
| ST | ✅ Docker Compose for full env |
| E2E | ✅ Full containerized stack |

### Testcontainers Example

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

## Mock Limitations | Mock 限制

### Query Predicate Verification

When mocking repository methods that accept query predicates (e.g., lambda expressions, filter functions), using wildcard matchers like `any()` ignores the actual query logic, allowing incorrect queries to pass unit tests.

```typescript
// ❌ Jest mock ignores actual filter
jest.spyOn(repo, 'findBy').mockResolvedValue(users);

// ✓ Verify with integration test
```

**Rule of Thumb**: If your unit test mocks a method that accepts a query/filter/predicate parameter, you MUST have a corresponding integration test to verify the query logic.

---

## Test Data Management

### Principles

1. **Isolation**: Each test manages its own data
2. **Cleanup**: Tests clean up after themselves
3. **Determinism**: Tests don't depend on shared state
4. **Readability**: Test data clearly shows intent

### Distinct Identifiers | 區分識別欄位

When entities have both a surrogate key (auto-generated ID) and a business identifier (e.g., employee number, department code), test data MUST use different values for each.

```typescript
// ❌ Wrong: id equals businessCode - mapping errors go undetected
const dept = { id: 1, businessCode: 1 };

// ✓ Correct: distinct values catch field mapping bugs
const dept = { id: 1, businessCode: 1001 };
```

### Composite Keys | 複合主鍵

For entities with composite primary keys, ensure each record has a unique key combination.

```typescript
// ❌ Key collision - same (id, timestamp) combination
const record1 = { id: 0, timestamp: now };
const record2 = { id: 0, timestamp: now };  // Conflict!

// ✓ Unique combinations
const record1 = { id: 0, timestamp: addSeconds(now, 1) };
const record2 = { id: 0, timestamp: addSeconds(now, 2) };
```

### Builder Pattern

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

## Quick Reference Card

```
┌──────────┬──────────────────────────────────────────┐
│   UT     │ Single unit, isolated, mocked deps, < 100ms     │
├──────────┼──────────────────────────────────────────┤
│   IT     │ Component integration, real DB, 1-10 sec        │
├──────────┼──────────────────────────────────────────┤
│   ST     │ Full system, requirement-based, production-like │
├──────────┼──────────────────────────────────────────┤
│  E2E     │ User journeys, UI to DB, critical paths only    │
└──────────┴──────────────────────────────────────────┘

Ratio: UT 70% | IT 20% | ST 7% | E2E 3%

Mock Rule: If UT mocks query params → IT is REQUIRED
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
