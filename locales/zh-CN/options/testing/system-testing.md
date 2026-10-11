---
source: ../../../../options/testing/system-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: accc907c60d0
status: current
---

# 系统测试

> **语言**: [English](../../../../options/testing/system-testing.md) | 简体中文

**上层标准**: [测试指南](../../core/testing-standards.md)

---

## 概览

系统测试对照指定需求验证完整、已集成的系统。它在高度接近生产环境的环境中，把应用程序作为一个整体来测试，同时验证功能性与非功能性需求。

## 特性

| 属性 | 值 |
|-----------|-------|
| 范围 | 整个应用系统 |
| 依赖 | 全部为真实组件 |
| 执行速度 | 数分钟到数小时 |
| 环境 | 接近生产环境 |
| 数量 | 聚焦的一组测试 |

## 最适用于

- 验证完整的用户工作流程
- 测试系统层级的需求
- 性能与负载测试
- 安全测试
- 发布前的回归测试

## 在测试金字塔中的位置

```
        /\
       /★★\     E2E/System Tests (this level)
      /----\
     /      \   Integration Tests
    /--------\
   /          \  Unit Tests
  /------------\
```

系统测试位于顶层：覆盖全面，但数量较少。

## 系统测试的类型

### 1. 功能测试

验证系统满足功能性需求：

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

### 2. 性能测试

验证系统在负载下的性能：

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

### 3. 安全测试

测试系统的安全控制：

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

### 4. 可靠性测试

测试系统在不利条件下的行为：

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

### 5. 兼容性测试

在不同环境中进行测试：

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

## 测试环境

### 环境要求

| 方面 | 要求 |
|--------|-------------|
| 基础设施 | 镜像生产环境拓扑 |
| 数据 | 贴近现实、经匿名化的生产数据 |
| 规模 | 至少为生产容量的 10% |
| 隔离 | 与开发／staging 环境分开 |
| 监控 | 启用完整的可观测性 |

### 环境设置

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

## 测试数据管理

### 数据策略

| 策略 | 使用场景 |
|----------|----------|
| 匿名化的生产数据 | 贴近现实的场景 |
| 合成生成 | 规模测试 |
| 子集抽取 | 特定工作流程 |
| 按需创建 | 全新状态的测试 |

### 数据设置示例

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

## 报告

### 测试报告结构

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

## 最佳实践

1. **在接近生产的环境中测试**
2. **使用贴近现实的数据量**
3. **纳入非功能性需求**
4. **自动化回归测试**
5. **清楚记录测试场景**
6. **在测试执行期间进行监控**
7. **执行后清理测试数据**

## 相关选项

- [单元测试](./unit-testing.md) - 测试单个组件
- [集成测试](./integration-testing.md) - 测试组件间的交互
- [E2E 测试](./e2e-testing.md) - 测试用户工作流程

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
