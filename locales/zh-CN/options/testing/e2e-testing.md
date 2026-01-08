---
source: ../../../../options/testing/e2e-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 端对端 (E2E) 测试

> **语言**: [English](../../../../options/testing/e2e-testing.md) | 繁体中文

**上层标准**: [测试指南](../../core/testing.md)

---

## 概述

端对端 (E2E) 测试验证从开始到结束的完整使用者流程，模拟真实使用者与应用程式的互动。这些测试验证所有整合元件能共同运作以提供预期的使用者体验。

## 特性

| 属性 | 值 |
|------|------|
| 范围 | 完整使用者旅程 |
| 相依性 | 所有真实（类生产）|
| 执行速度 | 每个测试数分钟 |
| 环境 | 完整堆叠部署 |
| 数量 | 仅关键路径 |

## 适用情境

- 关键业务流程（结帐、注册）
- 使用者验收测试
- 部署烟雾测试
- 跨浏览器相容性
- 无障碍验证

## 何时撰写 E2E 测试

### 应该撰写

| 情境 | 范例 |
|------|------|
| 关键营收路径 | 结帐、订阅 |
| 使用者验证 | 登入、注册、密码重设 |
| 核心功能 | 主要产品功能 |
| 法规遵循 | GDPR 同意、无障碍 |
| 跨系统流程 | 多服务交易 |

### 不应该撰写

| 情境 | 更好的替代方案 |
|------|----------------|
| 边界案例 | 单元测试 |
| API 验证 | 整合测试 |
| 元件行为 | 元件测试 |
| 错误讯息 | 单元测试 |

## 框架范例

### Playwright（推荐）

```javascript
// tests/e2e/checkout.spec.js
import { test, expect } from '@playwright/test';

test.describe('结帐流程', () => {
  test.beforeEach(async ({ page }) => {
    // 以测试使用者登入
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpass123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('使用信用卡完成购买', async ({ page }) => {
    // 加入购物车
    await page.goto('/products/widget-pro');
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // 前往结帐
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL('/checkout');

    // 填写配送资讯
    await page.fill('[data-testid="address"]', '123 Test St');
    await page.fill('[data-testid="city"]', 'Test City');
    await page.fill('[data-testid="zip"]', '12345');
    await page.click('[data-testid="continue-to-payment"]');

    // 填写付款资讯（测试卡号）
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // 完成购买
    await page.click('[data-testid="place-order"]');

    // 验证成功
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });
});
```

## Page Object 模式

使用 page object 组织测试以提高可维护性：

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

## 最佳实践

### 1. 使用 Data-TestId 属性

```html
<!-- 好：稳定的选择器 -->
<button data-testid="submit-order">下订单</button>

<!-- 不好：脆弱的选择器 -->
<button class="btn btn-primary order-btn">下订单</button>
```

### 2. 隔离测试资料

```javascript
test.beforeEach(async ({ request }) => {
  // 透过 API 建立隔离的测试资料
  const response = await request.post('/api/test/setup', {
    data: { scenario: 'checkout-test' }
  });
  testData = await response.json();
});
```

### 3. 处理不稳定性

```javascript
// 重试不稳定的断言
await expect(async () => {
  const count = await page.locator('.item').count();
  expect(count).toBe(3);
}).toPass({ timeout: 10000 });

// 等待网路闲置
await page.waitForLoadState('networkidle');
```

### 4. 平行执行测试

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

## 常见框架

| 框架 | 语言 | 最适合 |
|------|------|--------|
| Playwright | JS/TS/Python/C# | 跨浏览器、现代 |
| Cypress | JavaScript | 元件 + E2E |
| Selenium | 多语言 | 旧系统、企业 |
| Puppeteer | JavaScript | Chrome 专用 |

## 相关选项

- [单元测试](./unit-testing.md) - 测试个别元件
- [整合测试](./integration-testing.md) - 测试元件互动
- [系统测试](./system-testing.md) - 测试完整系统

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
