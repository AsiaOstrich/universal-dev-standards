---
source: ../../../../options/testing/e2e-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 端對端 (E2E) 測試

> **語言**: [English](../../../../options/testing/e2e-testing.md) | 繁體中文

**上層標準**: [測試指南](../../core/testing.md)

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

## 何時撰寫 E2E 測試

### 應該撰寫

| 情境 | 範例 |
|------|------|
| 關鍵營收路徑 | 結帳、訂閱 |
| 使用者驗證 | 登入、註冊、密碼重設 |
| 核心功能 | 主要產品功能 |
| 法規遵循 | GDPR 同意、無障礙 |
| 跨系統流程 | 多服務交易 |

### 不應該撰寫

| 情境 | 更好的替代方案 |
|------|----------------|
| 邊界案例 | 單元測試 |
| API 驗證 | 整合測試 |
| 元件行為 | 元件測試 |
| 錯誤訊息 | 單元測試 |

## 框架範例

### Playwright（推薦）

```javascript
// tests/e2e/checkout.spec.js
import { test, expect } from '@playwright/test';

test.describe('結帳流程', () => {
  test.beforeEach(async ({ page }) => {
    // 以測試使用者登入
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpass123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('使用信用卡完成購買', async ({ page }) => {
    // 加入購物車
    await page.goto('/products/widget-pro');
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // 前往結帳
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL('/checkout');

    // 填寫配送資訊
    await page.fill('[data-testid="address"]', '123 Test St');
    await page.fill('[data-testid="city"]', 'Test City');
    await page.fill('[data-testid="zip"]', '12345');
    await page.click('[data-testid="continue-to-payment"]');

    // 填寫付款資訊（測試卡號）
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // 完成購買
    await page.click('[data-testid="place-order"]');

    // 驗證成功
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
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
    this.placeOrderButton = page.locator('[data-testid="place-order"]');
  }

  async fillShipping(address, city, zip) {
    await this.addressInput.fill(address);
    await this.page.fill('[data-testid="city"]', city);
    await this.page.fill('[data-testid="zip"]', zip);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }
}
```

## 最佳實踐

### 1. 使用 Data-TestId 屬性

```html
<!-- 好：穩定的選擇器 -->
<button data-testid="submit-order">下訂單</button>

<!-- 不好：脆弱的選擇器 -->
<button class="btn btn-primary order-btn">下訂單</button>
```

### 2. 隔離測試資料

```javascript
test.beforeEach(async ({ request }) => {
  // 透過 API 建立隔離的測試資料
  const response = await request.post('/api/test/setup', {
    data: { scenario: 'checkout-test' }
  });
  testData = await response.json();
});
```

### 3. 處理不穩定性

```javascript
// 重試不穩定的斷言
await expect(async () => {
  const count = await page.locator('.item').count();
  expect(count).toBe(3);
}).toPass({ timeout: 10000 });

// 等待網路閒置
await page.waitForLoadState('networkidle');
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
