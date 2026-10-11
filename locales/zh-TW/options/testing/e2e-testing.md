---
source: ../../../../options/testing/e2e-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: bd8259ffd41b
status: current
---

# 端對端 (E2E) 測試

> **語言**: [English](../../../../options/testing/e2e-testing.md) | 繁體中文

**上層標準**: [測試指南](../../../../core/testing-standards.md)

---

## 概述

端對端 (E2E) 測試驗證從開始到結束的完整使用者流程，模擬真實使用者與應用程式的互動。這些測試驗證所有整合元件能共同運作以提供預期的使用者體驗。

## 特性

| 屬性 | 值 |
|------|------|
| 範圍 | 完整使用者旅程 |
| 相依性 | 所有真實（類生產）|
| 執行速度 | 每個測試數分鐘 |
| 環境 | 完整堆疊部署 |
| 數量 | 僅關鍵路徑 |

## 適用情境

- 關鍵業務流程（結帳、註冊）
- 使用者驗收測試
- 部署煙霧測試
- 跨瀏覽器相容性
- 無障礙驗證

## 測試金字塔位置

```
        /\
       /★★\     E2E Tests (this level - few but critical)
      /----\
     /      \   Integration Tests
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

E2E 測試：數量少，但對關鍵路徑而言價值高。

## 何時撰寫 E2E 測試

### 應該撰寫 E2E 測試的情境

| 情境 | 範例 |
|------|------|
| 關鍵營收路徑 | 結帳、訂閱 |
| 使用者驗證 | 登入、註冊、密碼重設 |
| 核心功能 | 主要產品功能 |
| 法規遵循 | GDPR 同意、無障礙 |
| 跨系統流程 | 多服務交易 |

### 不應該撰寫 E2E 測試的情境

| 情境 | 更好的替代方案 |
|------|----------------|
| 邊界案例 | 單元測試 |
| API 驗證 | 整合測試 |
| 元件行為 | 元件測試 |
| 錯誤訊息 | 單元測試 |
| 內部邏輯 | 單元/整合測試 |

## 框架範例

### Playwright（推薦）

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

使用 page object 組織測試以提高可維護性：

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

## 最佳實踐

### 1. 使用 Data-TestId 屬性

```html
<!-- Good: Stable selectors -->
<button data-testid="submit-order">Place Order</button>

<!-- Bad: Fragile selectors -->
<button class="btn btn-primary order-btn">Place Order</button>
```

### 2. 隔離測試資料

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

### 3. 處理不穩定性

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

### 4. 平行執行測試

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

### 5. 視覺回歸測試

```javascript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100
  });
});
```

## CI/CD 整合

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

## 常見框架

| 框架 | 語言 | 最適合 |
|------|------|--------|
| Playwright | JS/TS/Python/C# | 跨瀏覽器、現代 |
| Cypress | JavaScript | 元件 + E2E |
| Selenium | 多語言 | 舊系統、企業 |
| Puppeteer | JavaScript | Chrome 專用 |

## 相關選項

- [單元測試](./unit-testing.md) - 測試個別元件
- [整合測試](./integration-testing.md) - 測試元件互動
- [系統測試](./system-testing.md) - 測試完整系統

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
