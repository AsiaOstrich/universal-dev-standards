# End-to-End (E2E) Testing

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/e2e-testing.md)

**Parent Standard**: [Testing Guide](../../core/testing-standards.md)

---

## Overview

End-to-End (E2E) testing validates complete user workflows from start to finish, simulating real user interactions with the application. These tests verify that all integrated components work together to deliver the expected user experience.

## Characteristics

| Attribute | Value |
|-----------|-------|
| Scope | Complete user journeys |
| Dependencies | All real (production-like) |
| Execution Speed | Minutes per test |
| Environment | Full stack deployment |
| Quantity | Critical paths only |

## Best For

- Critical business workflows (checkout, signup)
- User acceptance testing
- Smoke tests for deployments
- Cross-browser compatibility
- Accessibility validation

## Testing Pyramid Position

```
        /\
       /★★\     E2E Tests (this level - few but critical)
      /----\
     /      \   Integration Tests
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

E2E tests: Few in number, high in value for critical paths.

## When to Write E2E Tests

### DO Write E2E Tests For

| Scenario | Example |
|----------|---------|
| Critical revenue paths | Checkout, subscription |
| User authentication | Login, signup, password reset |
| Core features | Main product functionality |
| Regulatory compliance | GDPR consent, accessibility |
| Cross-system workflows | Multi-service transactions |

### DON'T Write E2E Tests For

| Scenario | Better Alternative |
|----------|-------------------|
| Edge cases | Unit tests |
| API validation | Integration tests |
| Component behavior | Component tests |
| Error messages | Unit tests |
| Internal logic | Unit/Integration tests |

## Framework Examples

### Playwright (Recommended)

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

## Page Object Pattern

Organize tests using page objects for maintainability:

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

## Best Practices

### 1. Use Data-TestId Attributes

```html
<!-- Good: Stable selectors -->
<button data-testid="submit-order">Place Order</button>

<!-- Bad: Fragile selectors -->
<button class="btn btn-primary order-btn">Place Order</button>
```

### 2. Isolate Test Data

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

### 3. Handle Flakiness

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

### 4. Run Tests in Parallel

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

### 5. Visual Regression Testing

```javascript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100
  });
});
```

## CI/CD Integration

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

## Common Frameworks

| Framework | Language | Best For |
|-----------|----------|----------|
| Playwright | JS/TS/Python/C# | Cross-browser, modern |
| Cypress | JavaScript | Component + E2E |
| Selenium | Multiple | Legacy, enterprise |
| Puppeteer | JavaScript | Chrome-specific |

## Related Options

- [Unit Testing](./unit-testing.md) - Test individual components
- [Integration Testing](./integration-testing.md) - Test component interactions
- [System Testing](./system-testing.md) - Test complete system

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
