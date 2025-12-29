# Testing Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/testing-standards.md)

**Version**: 1.3.0
**Last Updated**: 2025-12-29
**Applicability**: All software projects

---

## Purpose

This standard defines testing conventions and best practices to ensure software quality through systematic testing at multiple levels.

---

## Testing Framework Selection

Choose a testing framework based on your project needs. This standard supports two approaches:

### Option A: ISTQB Standard Framework

Best for enterprise projects, certification needs, and formal QA processes.

**Reference**: [ISTQB Glossary v4.0](https://glossary.istqb.org)

| Level | Abbreviation | Purpose |
|-------|--------------|---------|
| Unit Testing | UT | Verify individual code units |
| Integration Testing | IT/SIT | Verify component interactions |
| System Testing | ST | Verify system meets requirements |
| Acceptance Testing | AT/UAT | Verify system meets business needs |

**When to choose ISTQB**:
- Enterprise projects with formal QA processes
- Projects requiring certification or compliance
- Organizations with dedicated QA teams
- Projects with strict audit requirements

### Option B: Industry Testing Pyramid

Best for agile development, CI/CD optimization, and rapid iteration.

**Reference**: [Martin Fowler's Testing Pyramid](https://martinfowler.com/bliki/TestPyramid.html), [Google Testing Blog](https://testing.googleblog.com)

| Level | Abbreviation | Ratio | Purpose |
|-------|--------------|-------|---------|
| Unit Testing | UT | 70% | Isolated component tests |
| Integration Testing | IT/SIT* | 20% | Component interaction tests |
| E2E Testing | E2E | 10% | User workflow tests |

*Note on Integration Testing abbreviation:
- **IT** (Integration Testing): Common in Agile/DevOps communities
- **SIT** (System Integration Testing): Common in Enterprise/ISTQB contexts
- Both terms refer to the same testing level

**When to choose Industry Pyramid**:
- Agile/Scrum development teams
- CI/CD focused environments
- Small to medium projects with rapid iteration
- DevOps practices

---

## Testing Pyramid (Default: Industry Standard)

```
              ┌─────────┐
              │   E2E   │  ← 10% (Fewer, slower, expensive)
             ─┴─────────┴─
            ┌─────────────┐
            │    IT/SIT   │  ← 20% (Integration Testing)
           ─┴─────────────┴─
          ┌─────────────────┐
          │       UT        │  ← 70% (Unit Testing - Foundation)
          └─────────────────┘
```

### Recommended Ratio (Industry Pyramid)

| Level | Abbreviation | Percentage | Execution Time |
|-------|--------------|------------|----------------|
| Unit Testing | UT | 70% | < 10 min total |
| Integration Testing | IT/SIT | 20% | < 30 min total |
| E2E Testing | E2E | 10% | < 2 hours total |

### ISTQB 4-Level Structure (Alternative)

| Level | Abbreviation | Performed By | Focus |
|-------|--------------|--------------|-------|
| Unit Testing | UT | Developers | Code correctness |
| Integration Testing | IT/SIT | Developers/QA | Interface contracts |
| System Testing | ST | QA Team | Requirements verification |
| Acceptance Testing | AT/UAT | End Users | Business validation |

---

## Unit Testing (UT)

### Definition

Tests individual functions, methods, or classes in isolation from external dependencies.

### Characteristics

- **Isolated**: No database, network, or file system access
- **Fast**: Each test < 100ms
- **Deterministic**: Same input always produces same output

### Scope

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

### Naming Convention

**File Naming**:
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

**Method Naming**:
```
[MethodName]_[Scenario]_[ExpectedResult]
should_[ExpectedBehavior]_when_[Condition]
test_[method]_[scenario]_[expected]

Examples:
  CalculateTotal_WithDiscount_ReturnsDiscountedPrice()
  should_return_null_when_user_not_found()
  test_validate_email_invalid_format_returns_false()
```

### Coverage Guidelines

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Line Coverage | 70% | 85% |
| Branch Coverage | 60% | 80% |
| Function Coverage | 80% | 90% |

### Example

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

## Integration Testing (IT)

### Definition

Tests interactions between multiple components, modules, or external systems.

### When Integration Tests Are Required

| Scenario | Reason |
|----------|--------|
| Query predicates | Mocks cannot verify filter expressions |
| Entity relationships | Verify foreign key correctness |
| Composite keys | In-memory DB may differ from real DB |
| Field mapping | DTO ↔ Entity transformations |
| Pagination | Row ordering and counting |
| Transactions | Rollback behavior |

**Decision Rule**:
If your unit test uses a wildcard matcher (`any()`, `It.IsAny<>`, `Arg.Any<>`)
for a query/filter parameter, that functionality MUST have an integration test.

### Characteristics

- **Component Integration**: Tests module boundaries
- **Real Dependencies**: Uses actual databases, APIs (often containerized)
- **Slower**: Each test typically 1-10 seconds

### Scope

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

### Naming Convention

**File Naming**:
```
[ComponentName]IntegrationTests.[ext]
[ComponentName].integration.test.[ext]
[ComponentName].itest.[ext]

Examples:
  UserRepositoryIntegrationTests.cs
  user-service.integration.test.ts
  user_repository_itest.py
```

**Method Naming**:
```
[Operation]_[Context]_[ExpectedOutcome]

Examples:
  CreateUser_WithValidData_PersistsToDatabase()
  GetUserById_ExistingUser_ReturnsUserFromDatabase()
  SendMessage_ToQueue_ConsumerReceivesMessage()
```

### Test Fixtures

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
        // Use test database (e.g., SQLite in-memory or Testcontainers)
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

## System Testing (ST)

### Definition

Tests the complete integrated system to verify it meets specified requirements.

### Characteristics

- **Complete System**: All components deployed and integrated
- **Requirement-Based**: Tests against functional specifications
- **Production-Like**: Uses environment similar to production

### Scope

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

### Types of System Tests

| Type | Description |
|------|-------------|
| Functional | Verify features work as specified |
| Performance | Load, stress, scalability testing |
| Security | Penetration, vulnerability scanning |
| Reliability | Failover, recovery, stability |
| Compatibility | Cross-platform, browser compatibility |

### Naming Convention

**File Naming**:
```
[Feature]SystemTests.[ext]
[Feature].system.test.[ext]
[Feature]_st.[ext]

Examples:
  OrderProcessingSystemTests.cs
  authentication.system.test.ts
  payment_processing_st.py
```

### Example

```csharp
// System Test Example: Complete Resource Processing Flow
// Note: Replace {Resource}, {Item}, {Action} with your domain concepts
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
        // Arrange: Create test data
        var item = await _env.CreateTestItem(value: 100);
        var user = await _env.CreateTestUser();

        // Act: Execute complete processing flow
        // Step 1: Create request
        var requestResponse = await _client.PostAsync("/api/requests",
            new { itemId = item.Id, quantity = 2 });
        Assert.AreEqual(HttpStatusCode.OK, requestResponse.StatusCode);

        // Step 2: Submit processing
        var processResponse = await _client.PostAsync("/api/processes",
            new { requestId = requestResponse.RequestId, userId = user.Id });
        var process = await processResponse.Content.ReadAsAsync<Process>();
        Assert.AreEqual(HttpStatusCode.Created, processResponse.StatusCode);

        // Step 3: Confirm completion
        var confirmResponse = await _client.PostAsync($"/api/processes/{process.Id}/confirm",
            new { confirmationType = "standard", amount = 200 });
        Assert.AreEqual(HttpStatusCode.OK, confirmResponse.StatusCode);

        // Assert: Verify final state
        var finalProcess = await _client.GetAsync($"/api/processes/{process.Id}");
        var result = await finalProcess.Content.ReadAsAsync<Process>();

        Assert.AreEqual(ProcessStatus.Completed, result.Status);
        Assert.AreEqual(200, result.TotalAmount);
        Assert.IsNotNull(result.Confirmation);
    }
}
```

---

## End-to-End Testing (E2E)

### Definition

Tests complete user workflows from the user interface through all system layers.

### Characteristics

- **User Perspective**: Simulates real user interactions
- **Full Stack**: UI → API → Database → External Services
- **Slowest**: Each test typically 30 seconds to several minutes

### Scope

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

### Naming Convention

**File Naming**:
```
[UserJourney].e2e.[ext]
[Feature].e2e.spec.[ext]
e2e/[feature]/[scenario].[ext]

Examples:
  user-registration.e2e.ts
  checkout-flow.e2e.spec.ts
  e2e/authentication/login.spec.ts
```

### Example

```typescript
// Playwright E2E Test Example
import { test, expect } from '@playwright/test';

test.describe('User Registration Journey', () => {
    test('should complete registration and login successfully', async ({ page }) => {
        // Step 1: Navigate to registration page
        await page.goto('/register');

        // Step 2: Fill registration form
        await page.fill('[data-testid="email"]', 'newuser@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
        await page.click('[data-testid="register-button"]');

        // Step 3: Verify registration success
        await expect(page.locator('[data-testid="success-message"]'))
            .toContainText('Registration successful');

        // Step 4: Login with new account
        await page.goto('/login');
        await page.fill('[data-testid="email"]', 'newuser@example.com');
        await page.fill('[data-testid="password"]', 'SecurePass123!');
        await page.click('[data-testid="login-button"]');

        // Step 5: Verify login success and dashboard redirect
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('[data-testid="welcome-message"]'))
            .toContainText('Welcome, newuser@example.com');
    });
});
```

---

## Test Doubles

### Types

| Type | Purpose | Example Use |
|------|---------|-------------|
| **Stub** | Returns predefined values | Fixed API responses |
| **Mock** | Verifies interactions | Verify method called |
| **Fake** | Simplified implementation | In-memory database |
| **Spy** | Records calls, delegates to real | Partial mocking |
| **Dummy** | Placeholder, never used | Fill required parameters |

### Usage Guidelines

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

## Mock Limitations

### Query Predicate Verification

**Problem**:
When mocking repository methods that accept query predicates (e.g., lambda expressions,
filter functions), using wildcard matchers like `any()` ignores the actual query logic,
allowing incorrect queries to pass unit tests.

**Example**:

```python
# Python Example
# ❌ This test cannot verify query correctness
mock_repo.find.return_value = users
# Query could be wrong, test still passes

# ✓ Add integration test to verify actual query
```

```typescript
// TypeScript Example
// ❌ Jest mock ignores actual filter
jest.spyOn(repo, 'findBy').mockResolvedValue(users);

// ✓ Verify with integration test
```

```csharp
// C# Example
// ❌ Moq ignores the actual expression
_repo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
     .ReturnsAsync(users);

// ✓ Verify with integration test or use It.Is<> to validate
```

**Rule of Thumb**:
If your unit test mocks a method that accepts a query/filter/predicate parameter,
you MUST have a corresponding integration test to verify the query logic.

---

## Test Data Management

### Principles

1. **Isolation**: Each test manages its own data
2. **Cleanup**: Tests clean up after themselves
3. **Determinism**: Tests don't depend on shared state
4. **Readability**: Test data clearly shows intent

### Patterns

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

### Distinct Identifiers

When entities have both a surrogate key (auto-generated ID) and a business identifier
(e.g., employee number, department code), test data MUST use different values for each.

**Problem**:
If test data uses identical values for both fields, field mapping errors go undetected.

```python
# Python Example
# ❌ Wrong: id equals business_code
dept = Department(id=1, business_code=1)

# ✓ Correct: distinct values catch mapping errors
dept = Department(id=1, business_code=1001)
```

```csharp
// C# Example
// ❌ Wrong: Id equals DeptId - mapping errors go undetected
var dept = new Department { Id = 1, DeptId = 1 };

// ✓ Correct: distinct values catch field mapping bugs
var dept = new Department { Id = 1, DeptId = 1001 };
```

**Validation**:
```csharp
// C#
testData.Dept.Id.Should().NotBe(testData.Dept.DeptId,
    "Test precondition: Id must differ from business identifier");
```

### Composite Keys

For entities with composite primary keys, ensure each record has a unique key combination.

```csharp
// C# Example
// ❌ Key collision - same (Id, SendTime) combination
var batch1 = new BatchRecord { Id = 0, SendTime = now };
var batch2 = new BatchRecord { Id = 0, SendTime = now };  // Conflict!

// ✓ Unique combinations
var batch1 = new BatchRecord { Id = 0, SendTime = now.AddSeconds(1) };
var batch2 = new BatchRecord { Id = 0, SendTime = now.AddSeconds(2) };
```

**Tip**: Create helper functions that auto-generate unique composite keys.

```csharp
// C# Helper Example
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

## Test Environment Isolation

### Purpose

Ensure consistent, reproducible test results across development machines and CI/CD pipelines.

### Why It Matters

- **Reproducibility**: Same tests produce same results everywhere
- **Isolation**: Project dependencies don't conflict with system or other projects
- **CI/CD Parity**: Local environment matches CI environment

### Language-Specific Virtual Environments

| Language | Tools | Lock File |
|----------|-------|-----------|
| Python | venv, virtualenv, conda, poetry | requirements.txt, poetry.lock |
| Node.js | nvm, fnm + npm/yarn/pnpm | package-lock.json, yarn.lock |
| Ruby | rbenv, rvm, bundler | Gemfile.lock |
| Java | SDKMAN, jenv, Maven/Gradle | pom.xml, build.gradle.lock |
| .NET | dotnet SDK | packages.lock.json |
| Go | go mod | go.sum |
| Rust | rustup, cargo | Cargo.lock |

#### Best Practices

1. **Always use virtual environments** for development and testing
2. **Commit lock files** to version control
3. **Pin versions** in CI/CD pipelines
4. **Document required runtime versions** in README or .tool-versions

#### Example: Python with venv

```bash
# Create virtual environment
python -m venv .venv

# Activate
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/
```

#### Example: Node.js with nvm

```bash
# Use project's Node version
nvm use

# Install dependencies
npm ci

# Run tests
npm test
```

### Containerized Testing

Use containers to provide consistent external dependencies (databases, message queues, etc.) for integration and system tests.

#### When to Use

| Test Level | Container Usage |
|------------|-----------------|
| UT (Unit Testing) | ❌ Not needed - use mocks |
| IT (Integration Testing) | ✅ Testcontainers for databases, caches |
| ST (System Testing) | ✅ Docker Compose for full environment |
| E2E (End-to-End) | ✅ Full containerized stack |

#### Testcontainers

Testcontainers provides lightweight, disposable containers for testing.

```csharp
// C# Example with Testcontainers
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
        // Use connectionString for tests
    }
}
```

```python
# Python Example with Testcontainers
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="module")
def postgres_container():
    with PostgresContainer("postgres:15") as postgres:
        yield postgres

def test_database_connection(postgres_container):
    connection_url = postgres_container.get_connection_url()
    # Use connection_url for tests
```

#### Docker Compose for System Tests

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
# Run system tests with Docker Compose
docker-compose -f docker-compose.test.yml up -d
npm run test:system
docker-compose -f docker-compose.test.yml down -v
```

### Environment Parity Checklist

```
┌─────────────────────────────────────────────────────────────┐
│              Environment Parity Checklist                   │
├─────────────────────────────────────────────────────────────┤
│  ✅ Same runtime version (Node, Python, etc.) locally & CI │
│  ✅ Same database version in containers & production       │
│  ✅ Lock files committed and used in CI (npm ci, pip -r)   │
│  ✅ Environment variables documented and consistent        │
│  ✅ Container images tagged with specific versions         │
│  ✅ .tool-versions or similar for runtime version mgmt     │
├─────────────────────────────────────────────────────────────┤
│  ❌ Using "latest" tags in production/CI                   │
│  ❌ Different DB versions between dev and CI               │
│  ❌ Missing lock files in repository                       │
│  ❌ Hardcoded paths or machine-specific configurations     │
└─────────────────────────────────────────────────────────────┘
```

---

## CI/CD Integration

### Test Execution Strategy

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

### Test Reports

Required metrics for each test level:

| Metric | UT | IT | ST | E2E |
|--------|----|----|----|----|
| Pass/Fail Count | ✅ | ✅ | ✅ | ✅ |
| Execution Time | ✅ | ✅ | ✅ | ✅ |
| Coverage % | ✅ | ✅ | ⚠️ | ❌ |
| Flaky Test Rate | ✅ | ✅ | ✅ | ✅ |
| Screenshots/Videos | ❌ | ❌ | ⚠️ | ✅ |

---

## Best Practices

### AAA Pattern

```csharp
[TestMethod]
public void MethodName_Scenario_ExpectedBehavior()
{
    // Arrange - Set up test data and environment
    var input = CreateTestInput();
    var sut = new SystemUnderTest();

    // Act - Execute the behavior under test
    var result = sut.Execute(input);

    // Assert - Verify the result
    Assert.AreEqual(expected, result);
}
```

### FIRST Principles

| Principle | Description |
|-----------|-------------|
| **F**ast | Tests run quickly |
| **I**ndependent | Tests don't affect each other |
| **R**epeatable | Same result every time |
| **S**elf-validating | Clear pass/fail |
| **T**imely | Written with production code |

### Anti-Patterns to Avoid

```
❌ Test Interdependence
   Tests that must run in specific order

❌ Flaky Tests
   Tests that sometimes pass, sometimes fail

❌ Testing Implementation Details
   Tests that break when refactoring

❌ Over-Mocking
   Mocking so much that nothing real is tested

❌ Missing Assertions
   Tests that verify nothing meaningful

❌ Magic Numbers/Strings
   Unexplained values in test code

❌ Identical Test IDs
   Using same values for surrogate and business keys
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              Testing Framework Options                       │
├─────────────────────────────────────────────────────────────┤
│  ISTQB: UT → IT/SIT → ST → AT/UAT (Enterprise/Compliance)  │
│  Industry: UT (70%) → IT (20%) → E2E (10%) (Agile/DevOps)  │
├─────────────────────────────────────────────────────────────┤
│  IT = Integration Testing (Agile/DevOps term)              │
│  SIT = System Integration Testing (Enterprise/ISTQB term)  │
├─────────────────────────────────────────────────────────────┤
│                    Testing Levels Summary                   │
├──────────┬──────────────────────────────────────────────────┤
│   UT     │ Single unit, isolated, mocked deps, < 100ms     │
├──────────┼──────────────────────────────────────────────────┤
│  IT/SIT  │ Component integration, real DB, 1-10 sec        │
├──────────┼──────────────────────────────────────────────────┤
│   ST     │ Full system, requirement-based (ISTQB only)     │
├──────────┼──────────────────────────────────────────────────┤
│  E2E     │ User journeys, UI to DB, critical paths only    │
├──────────┼──────────────────────────────────────────────────┤
│  AT/UAT  │ Business validation by end users (ISTQB only)   │
├──────────┴──────────────────────────────────────────────────┤
│                    Naming Conventions                       │
├─────────────────────────────────────────────────────────────┤
│  Files:  [Name]Tests.cs, [name].test.ts, [name]_test.py    │
│  Methods: Method_Scenario_Expected, should_X_when_Y        │
├─────────────────────────────────────────────────────────────┤
│                    Coverage Targets                         │
├─────────────────────────────────────────────────────────────┤
│  Line: 70% min / 85% recommended                           │
│  Branch: 60% min / 80% recommended                         │
│  Function: 80% min / 90% recommended                       │
├─────────────────────────────────────────────────────────────┤
│               Mock Limitation Rule                          │
├─────────────────────────────────────────────────────────────┤
│  If UT mocks query/filter params → IT is REQUIRED          │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Standards

- [Anti-Hallucination Standard](anti-hallucination.md)
- [Code Check-in Standards](checkin-standards.md)
- [Code Review Checklist](code-review-checklist.md)
- [Commit Message Guide](commit-message-guide.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2025-12-29 | Add: Testing Framework Selection (ISTQB vs Industry Pyramid), IT/SIT abbreviation clarification, source references |
| 1.2.0 | 2025-12-19 | Add: Mock Limitations section, When Integration Tests Are Required, Distinct Identifiers, Composite Keys test data patterns |
| 1.1.1 | 2025-12-11 | Improved: System test example to use generic domain concepts instead of specific business terminology |
| 1.1.0 | 2025-12-05 | Add test environment isolation section (venv, containers) |
| 1.0.0 | 2025-12-05 | Initial testing standards with UT/IT/ST/E2E coverage |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Maintainer**: Development Team
