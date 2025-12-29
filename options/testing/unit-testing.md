# Unit Testing

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/unit-testing.md)

**Parent Standard**: [Testing Guide](../../core/testing.md)

---

## Overview

Unit testing verifies that individual units of code (functions, methods, classes) work correctly in isolation. Unit tests are the foundation of the testing pyramid, providing fast feedback and enabling confident refactoring.

## Characteristics

| Attribute | Value |
|-----------|-------|
| Scope | Single function, method, or class |
| Dependencies | Mocked or stubbed |
| Execution Speed | Milliseconds |
| Isolation | Complete isolation from external systems |
| Quantity | Highest number of tests |

## Best For

- Testing pure functions and business logic
- Validating edge cases and error handling
- Enabling safe refactoring
- Documenting code behavior
- Fast CI/CD feedback

## Testing Pyramid Position

```
        /\
       /  \      E2E Tests (few)
      /----\
     /      \    Integration Tests (some)
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

Unit tests form the base: fast, numerous, and focused.

## Structure: Arrange-Act-Assert

```javascript
// JavaScript/TypeScript example
describe('calculateDiscount', () => {
  it('should apply 10% discount for orders over $100', () => {
    // Arrange
    const orderTotal = 150;
    const discountThreshold = 100;
    const discountRate = 0.10;

    // Act
    const result = calculateDiscount(orderTotal, discountThreshold, discountRate);

    // Assert
    expect(result).toBe(15);
  });
});
```

```python
# Python example
def test_calculate_discount_applies_ten_percent_for_orders_over_100():
    # Arrange
    order_total = 150
    discount_threshold = 100
    discount_rate = 0.10

    # Act
    result = calculate_discount(order_total, discount_threshold, discount_rate)

    # Assert
    assert result == 15
```

## What to Test

### DO Test

| Category | Example |
|----------|---------|
| Pure functions | Mathematical calculations, string transformations |
| Business logic | Validation rules, pricing calculations |
| Edge cases | Empty arrays, null values, boundary conditions |
| Error conditions | Invalid inputs, exception throwing |
| State transitions | Object state changes |

### DON'T Test

| Category | Why |
|----------|-----|
| Private methods | Test through public interface |
| Framework code | Already tested by framework |
| Simple getters/setters | No logic to verify |
| External systems | Use integration tests |
| Configuration | Test behavior, not config |

## Mocking Guidelines

### When to Mock

```javascript
// Mock external dependencies
const mockDatabase = {
  findUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
};

const userService = new UserService(mockDatabase);
```

### When NOT to Mock

```javascript
// Don't mock the unit under test
// Don't mock simple value objects
// Don't mock everything - some real objects are fine
```

### Mock Types

| Type | Purpose | Example |
|------|---------|---------|
| Stub | Return fixed values | `mockFn.mockReturnValue(42)` |
| Mock | Verify interactions | `expect(mockFn).toHaveBeenCalled()` |
| Spy | Observe real implementation | `jest.spyOn(obj, 'method')` |
| Fake | Simplified implementation | In-memory database |

## Test Naming Conventions

### Format Options

```javascript
// Behavior-focused
it('should return null when user is not found')

// Given-When-Then
it('given an invalid email, when validating, then throws ValidationError')

// Method_Scenario_Expectation
it('validateEmail_withInvalidFormat_throwsError')
```

### Good Names

```javascript
it('calculates tax correctly for multiple items')
it('throws error when dividing by zero')
it('returns empty array when no matches found')
```

### Bad Names

```javascript
it('test1')
it('works')
it('should work correctly')
```

## Coverage Guidelines

| Metric | Target | Notes |
|--------|--------|-------|
| Line Coverage | 80%+ | Minimum threshold |
| Branch Coverage | 75%+ | Cover conditional paths |
| Function Coverage | 90%+ | All public functions |
| Critical Paths | 100% | Payment, auth, data handling |

### Coverage Caveats

- High coverage ≠ good tests
- Focus on meaningful tests, not coverage numbers
- Critical code deserves 100% coverage
- Don't test trivial code just for coverage

## Best Practices

### 1. One Assertion per Test (Ideally)

```javascript
// Good: Focused test
it('should return user name', () => {
  const user = new User('John');
  expect(user.getName()).toBe('John');
});

// Acceptable: Related assertions
it('should create valid user', () => {
  const user = new User('John', 'john@example.com');
  expect(user.getName()).toBe('John');
  expect(user.getEmail()).toBe('john@example.com');
});
```

### 2. Test Behavior, Not Implementation

```javascript
// Good: Tests behavior
it('should mark order as paid', () => {
  order.pay();
  expect(order.isPaid()).toBe(true);
});

// Bad: Tests implementation detail
it('should set _paid flag to true', () => {
  order.pay();
  expect(order._paid).toBe(true);
});
```

### 3. Keep Tests Independent

```javascript
// Bad: Test depends on previous test
let user;
it('should create user', () => {
  user = createUser();
});
it('should update user', () => {
  user.update({ name: 'New' }); // Depends on previous test!
});

// Good: Each test is independent
it('should update user name', () => {
  const user = createUser();
  user.update({ name: 'New' });
  expect(user.name).toBe('New');
});
```

### 4. Use Descriptive Test Data

```javascript
// Bad
const user = { a: 'b', c: 'd' };

// Good
const validUser = {
  name: 'John Doe',
  email: 'john@example.com'
};
```

## Common Frameworks

| Language | Framework | Notes |
|----------|-----------|-------|
| JavaScript | Jest | Most popular, built-in mocking |
| JavaScript | Vitest | Fast, Vite-compatible |
| Python | pytest | Flexible, extensive plugins |
| Java | JUnit 5 | Standard for Java |
| C# | xUnit | Modern, extensible |
| Go | testing | Built-in package |

## Related Options

- [Integration Testing](./integration-testing.md) - Test component interactions
- [System Testing](./system-testing.md) - Test complete system
- [E2E Testing](./e2e-testing.md) - Test user workflows

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
