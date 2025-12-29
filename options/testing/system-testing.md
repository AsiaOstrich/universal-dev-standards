# System Testing

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/system-testing.md)

**Parent Standard**: [Testing Guide](../../core/testing.md)

---

## Overview

System testing verifies the complete, integrated system against specified requirements. It tests the application as a whole in an environment that closely mirrors production, validating both functional and non-functional requirements.

## Characteristics

| Attribute | Value |
|-----------|-------|
| Scope | Entire application system |
| Dependencies | All real components |
| Execution Speed | Minutes to hours |
| Environment | Production-like |
| Quantity | Focused set of tests |

## Best For

- Validating complete user workflows
- Testing system-wide requirements
- Performance and load testing
- Security testing
- Regression testing before releases

## Testing Pyramid Position

```
        /\
       /★★\     E2E/System Tests (this level)
      /----\
     /      \   Integration Tests
    /--------\
   /          \  Unit Tests
  /------------\
```

System tests at the top: comprehensive but fewer in number.

## Types of System Testing

### 1. Functional Testing

Verify the system meets functional requirements:

```gherkin
# Behavior-Driven Specification
Feature: User Registration

  Scenario: Successful registration with valid data
    Given I am on the registration page
    When I enter valid registration details
    And I submit the registration form
    Then I should receive a confirmation email
    And My account should be created in the database
    And I should be redirected to the welcome page

  Scenario: Registration fails with existing email
    Given a user exists with email "user@example.com"
    When I try to register with email "user@example.com"
    Then I should see error "Email already registered"
    And No new account should be created
```

### 2. Performance Testing

Validate system performance under load:

```javascript
// k6 load test example
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200
    { duration: '5m', target: 200 },  // Stay at 200
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

export default function () {
  const res = http.get('https://api.example.com/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### 3. Security Testing

Test system security controls:

```yaml
# Security test scenarios
security_tests:
  authentication:
    - test: "Brute force protection"
      steps:
        - Attempt 5 failed logins
        - Verify account lockout
        - Verify lockout notification email

    - test: "Session management"
      steps:
        - Login and capture session token
        - Verify token expires after timeout
        - Verify token invalidated on logout

  authorization:
    - test: "Role-based access"
      steps:
        - Login as regular user
        - Attempt admin-only endpoint
        - Verify 403 Forbidden response

  data_protection:
    - test: "Sensitive data encryption"
      steps:
        - Create user with password
        - Verify password hashed in database
        - Verify PII encrypted at rest
```

### 4. Reliability Testing

Test system behavior under adverse conditions:

```python
# Chaos engineering test
class ReliabilityTest:
    def test_database_failover(self):
        """System should handle database failover gracefully."""
        # Arrange
        app = TestApplication()
        app.start()

        # Act: Simulate primary database failure
        app.database.simulate_failure('primary')

        # Assert: System continues with replica
        response = app.client.get('/api/health')
        assert response.status_code == 200
        assert response.json()['database'] == 'degraded'

        # Verify data consistency after failover
        user = app.client.get('/api/users/1')
        assert user.status_code == 200

    def test_external_service_timeout(self):
        """System should handle external service timeouts."""
        # Arrange
        app = TestApplication()
        app.mock_external_service('payment', delay=30)  # 30s delay

        # Act
        response = app.client.post('/api/orders', json={
            'items': [{'sku': 'ABC', 'qty': 1}]
        }, timeout=10)

        # Assert: Graceful timeout handling
        assert response.status_code == 202  # Accepted, processing async
        assert 'retry' in response.json()
```

### 5. Compatibility Testing

Test across different environments:

```yaml
# Cross-browser/device test matrix
compatibility_matrix:
  browsers:
    - Chrome (latest)
    - Firefox (latest)
    - Safari (latest)
    - Edge (latest)

  mobile:
    - iOS Safari (iPhone 12+)
    - Android Chrome (API 30+)

  screen_sizes:
    - 1920x1080 (Desktop)
    - 1366x768 (Laptop)
    - 768x1024 (Tablet)
    - 375x667 (Mobile)

  test_cases:
    - Login flow renders correctly
    - Forms are accessible
    - Responsive layouts work
    - Touch interactions function
```

## Test Environment

### Environment Requirements

| Aspect | Requirement |
|--------|-------------|
| Infrastructure | Mirror production topology |
| Data | Realistic, anonymized production data |
| Scale | At least 10% of production capacity |
| Isolation | Separate from development/staging |
| Monitoring | Full observability enabled |

### Environment Setup

```yaml
# docker-compose.system-test.yml
version: '3.8'

services:
  app:
    image: myapp:${VERSION}
    environment:
      - DATABASE_URL=postgresql://db:5432/app
      - REDIS_URL=redis://cache:6379
      - ENV=system-test
    depends_on:
      - db
      - cache

  db:
    image: postgres:14
    volumes:
      - ./test-data:/docker-entrypoint-initdb.d

  cache:
    image: redis:7

  monitoring:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

## Test Data Management

### Data Strategies

| Strategy | Use Case |
|----------|----------|
| Anonymized production | Realistic scenarios |
| Synthetic generation | Scale testing |
| Subset extraction | Specific workflows |
| On-demand creation | Fresh state tests |

### Data Setup Example

```python
class SystemTestDataFactory:
    def create_complete_test_scenario(self):
        """Create a complete e-commerce scenario."""
        # Users
        admin = self.create_user(role='admin')
        customers = [self.create_user(role='customer') for _ in range(100)]

        # Products
        categories = self.create_categories(count=10)
        products = self.create_products(count=1000, categories=categories)

        # Historical data
        for customer in customers[:50]:
            self.create_order_history(customer, products, count=5)

        return {
            'admin': admin,
            'customers': customers,
            'products': products,
            'categories': categories
        }
```

## Reporting

### Test Report Structure

```markdown
# System Test Report

## Summary
- **Date**: 2024-01-15
- **Version**: v2.3.0
- **Environment**: system-test-01
- **Duration**: 4 hours 32 minutes

## Results Overview
| Category | Passed | Failed | Skipped |
|----------|--------|--------|---------|
| Functional | 145 | 3 | 2 |
| Performance | 12 | 0 | 0 |
| Security | 28 | 1 | 0 |
| Compatibility | 32 | 0 | 4 |

## Failed Tests
### FUNC-042: Checkout with expired coupon
- **Expected**: Error message displayed
- **Actual**: System error 500
- **Priority**: High
- **Screenshot**: [link]

## Performance Metrics
- Average response time: 234ms
- 95th percentile: 456ms
- Error rate: 0.02%
- Throughput: 1,200 req/sec
```

## Best Practices

1. **Test in production-like environment**
2. **Use realistic data volumes**
3. **Include non-functional requirements**
4. **Automate regression tests**
5. **Document test scenarios clearly**
6. **Monitor during test execution**
7. **Clean up test data after execution**

## Related Options

- [Unit Testing](./unit-testing.md) - Test individual components
- [Integration Testing](./integration-testing.md) - Test component interactions
- [E2E Testing](./e2e-testing.md) - Test user workflows

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
