---
source: ../../../../options/testing/e2e-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: bd8259ffd41b
status: current
---

# 端到端（E2E）测试

> **语言**: [English](../../../../options/testing/e2e-testing.md) | 简体中文

**上层标准**: [测试指南](../../core/testing-standards.md)

---

## 概览

端到端（E2E）测试从头到尾验证完整的用户工作流程，模拟真实用户与应用程序的交互。这类测试验证所有集成的组件能协同运作，交付预期的用户体验。

## 特性

| 属性 | 值 |
|-----------|-------|
| 范围 | 完整的用户旅程 |
| 依赖 | 全部真实（接近生产环境） |
| 执行速度 | 每个测试数分钟 |
| 环境 | 全栈部署 |
| 数量 | 仅限关键路径 |

## 最适用于

- 关键业务工作流程（结账、注册）
- 用户验收测试
- 部署后的冒烟测试（smoke test）
- 跨浏览器兼容性
- 无障碍验证

## 在测试金字塔中的位置

```
        /\
       /★★\     E2E Tests (this level - few but critical)
      /----\
     /      \   Integration Tests
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

E2E 测试：数量少，但对关键路径价值高。

## 何时编写 E2E 测试

### 应该编写 E2E 测试的情况

| 场景 | 示例 |
|----------|---------|
| 关键营收路径 | 结账、订阅 |
| 用户认证 | 登录、注册、重置密码 |
| 核心功能 | 产品主要功能 |
| 法规合规 | GDPR 同意、无障碍 |
| 跨系统工作流程 | 多服务事务 |

### 不应编写 E2E 测试的情况

| 场景 | 更好的替代方案 |
|----------|-------------------|
| 边界情况 | 单元测试 |
| API 验证 | 集成测试 |
| 组件行为 | 组件测试 |
| 错误信息 | 单元测试 |
| 内部逻辑 | 单元／集成测试 |

## 框架示例

### Playwright（推荐）

```javascript
// tests/e2e/checkout.spec.js
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpass123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete purchase with credit card', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/widget-pro');
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // Go to checkout
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL('/checkout');

    // Fill shipping info
    await page.fill('[data-testid="address"]', '123 Test St');
    await page.fill('[data-testid="city"]', 'Test City');
    await page.fill('[data-testid="zip"]', '12345');
    await page.click('[data-testid="continue-to-payment"]');

    // Fill payment info (test card)
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // Complete purchase
    await page.click('[data-testid="place-order"]');

    // Verify success
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirmation-email"]')).toContainText('test@example.com');
  });

  test('handles payment failure gracefully', async ({ page }) => {
    await page.goto('/checkout');

    // Use declined test card
    await page.fill('[data-testid="card-number"]', '4000000000000002');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    await page.click('[data-testid="place-order"]');

    // Verify error handling
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText('Card declined');
    await expect(page).toHaveURL('/checkout'); // Still on checkout
  });
});
```

### Cypress

```javascript
// cypress/e2e/user-registration.cy.js
describe('User Registration', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('successfully registers a new user', () => {
    const email = `test-${Date.now()}@example.com`;

    // Fill registration form
    cy.get('[data-testid="name"]').type('Test User');
    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type('SecurePass123!');
    cy.get('[data-testid="confirm-password"]').type('SecurePass123!');
    cy.get('[data-testid="terms-checkbox"]').check();

    // Submit
    cy.get('[data-testid="register-button"]').click();

    // Verify redirect to verification page
    cy.url().should('include', '/verify-email');
    cy.contains('Verification email sent').should('be.visible');

    // Verify user in database (via API)
    cy.request(`/api/test/users?email=${email}`).then((response) => {
      expect(response.body.exists).to.be.true;
      expect(response.body.user.verified).to.be.false;
    });
  });

  it('validates password requirements', () => {
    cy.get('[data-testid="password"]').type('weak');
    cy.get('[data-testid="confirm-password"]').click();

    cy.get('[data-testid="password-requirements"]')
      .should('contain', 'At least 8 characters')
      .and('contain', 'One uppercase letter')
      .and('contain', 'One number');
  });
});
```

## Page Object 模式

使用 page object 组织测试，以提升可维护性：

```javascript
// pages/CheckoutPage.js
export class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.addressInput = page.locator('[data-testid="address"]');
    this.cityInput = page.locator('[data-testid="city"]');
    this.zipInput = page.locator('[data-testid="zip"]');
    this.cardNumberInput = page.locator('[data-testid="card-number"]');
    this.placeOrderButton = page.locator('[data-testid="place-order"]');
  }

  async fillShipping(address, city, zip) {
    await this.addressInput.fill(address);
    await this.cityInput.fill(city);
    await this.zipInput.fill(zip);
  }

  async fillPayment(cardNumber, expiry, cvc) {
    await this.cardNumberInput.fill(cardNumber);
    await this.page.fill('[data-testid="card-expiry"]', expiry);
    await this.page.fill('[data-testid="card-cvc"]', cvc);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }
}

// tests/checkout.spec.js
import { CheckoutPage } from '../pages/CheckoutPage';

test('checkout with page object', async ({ page }) => {
  const checkout = new CheckoutPage(page);

  await page.goto('/checkout');
  await checkout.fillShipping('123 Test St', 'Test City', '12345');
  await checkout.fillPayment('4242424242424242', '12/25', '123');
  await checkout.placeOrder();

  await expect(page).toHaveURL(/\/order-confirmation/);
});
```

## 最佳实践

### 1. 使用 Data-TestId 属性

```html
<!-- Good: Stable selectors -->
<button data-testid="submit-order">Place Order</button>

<!-- Bad: Fragile selectors -->
<button class="btn btn-primary order-btn">Place Order</button>
```

### 2. 隔离测试数据

```javascript
test.beforeEach(async ({ request }) => {
  // Create isolated test data via API
  const response = await request.post('/api/test/setup', {
    data: { scenario: 'checkout-test' }
  });
  testData = await response.json();
});

test.afterEach(async ({ request }) => {
  // Cleanup
  await request.post('/api/test/cleanup', {
    data: { testId: testData.id }
  });
});
```

### 3. 处理不稳定性（flakiness）

```javascript
// Retry flaky assertions
await expect(async () => {
  const count = await page.locator('.item').count();
  expect(count).toBe(3);
}).toPass({ timeout: 10000 });

// Wait for network idle
await page.waitForLoadState('networkidle');

// Explicit waits for animations
await page.waitForTimeout(300); // Only when necessary
```

### 4. 并行执行测试

```javascript
// playwright.config.js
export default {
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
};
```

### 5. 视觉回归测试

```javascript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100
  });
});
```

## CI/CD 集成

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Start application
        run: npm run start:test &
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Wait for app
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 常见框架

| 框架 | 语言 | 最适用于 |
|-----------|----------|----------|
| Playwright | JS/TS/Python/C# | 跨浏览器、现代化 |
| Cypress | JavaScript | 组件 + E2E |
| Selenium | 多种语言 | 遗留系统、企业 |
| Puppeteer | JavaScript | 专用于 Chrome |

## 相关选项

- [单元测试](./unit-testing.md) - 测试单个组件
- [集成测试](./integration-testing.md) - 测试组件间的交互
- [系统测试](./system-testing.md) - 测试完整系统

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
