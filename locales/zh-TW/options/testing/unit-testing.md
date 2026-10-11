---
source: ../../../../options/testing/unit-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: a6f360d666c8
status: current
---

# 單元測試

> **語言**: [English](../../../../options/testing/unit-testing.md) | 繁體中文

**上層標準**: [測試指南](../../../../core/testing-standards.md)

---

## 概述

單元測試驗證程式碼的個別單元（函式、方法、類別）在隔離狀態下正確運作。單元測試是測試金字塔的基礎，提供快速回饋並實現安全的重構。

## 特性

| 屬性 | 值 |
|------|------|
| 範圍 | 單一函式、方法或類別 |
| 相依性 | 模擬或替身 |
| 執行速度 | 毫秒等級 |
| 隔離性 | 完全隔離於外部系統 |
| 數量 | 最多的測試 |

## 適用情境

- 測試純函式和業務邏輯
- 驗證邊界案例和錯誤處理
- 實現安全重構
- 記錄程式碼行為
- 快速的 CI/CD 回饋

## 測試金字塔位置

```
        /\
       /  \      E2E Tests (few)
      /----\
     /      \    Integration Tests (some)
    /--------\
   /          \  Unit Tests (many)
  /------------\
```

單元測試構成基礎層：快速、數量多且聚焦。

## 結構：Arrange-Act-Assert

```javascript
// JavaScript/TypeScript 範例
describe('calculateDiscount', () => {
  it('should apply 10% discount for orders over $100', () => {
    // Arrange（安排）
    const orderTotal = 150;
    const discountThreshold = 100;
    const discountRate = 0.10;

    // Act（執行）
    const result = calculateDiscount(orderTotal, discountThreshold, discountRate);

    // Assert（驗證）
    expect(result).toBe(15);
  });
});
```

```python
# Python 範例
def test_calculate_discount_applies_ten_percent_for_orders_over_100():
    # Arrange（安排）
    order_total = 150
    discount_threshold = 100
    discount_rate = 0.10

    # Act（執行）
    result = calculate_discount(order_total, discount_threshold, discount_rate)

    # Assert（驗證）
    assert result == 15
```

## 應該測試什麼

### 應該測試

| 類別 | 範例 |
|------|------|
| 純函式 | 數學計算、字串轉換 |
| 業務邏輯 | 驗證規則、價格計算 |
| 邊界案例 | 空陣列、null 值、邊界條件 |
| 錯誤條件 | 無效輸入、例外拋出 |
| 狀態轉換 | 物件狀態變更 |

### 不應該測試

| 類別 | 原因 |
|------|------|
| 私有方法 | 透過公開介面測試 |
| 框架程式碼 | 已被框架測試 |
| 簡單 getter/setter | 無邏輯可驗證 |
| 外部系統 | 使用整合測試 |
| 設定 | 測試行為，而非設定 |

## 模擬指南

### 何時使用模擬

```javascript
// 模擬外部相依性
const mockDatabase = {
  findUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
};

const userService = new UserService(mockDatabase);
```

### 何時不使用模擬

```javascript
// 不要模擬被測試的單元
// 不要模擬簡單的值物件
// 不要模擬所有東西——某些真實物件是可以的
```

### 模擬類型

| 類型 | 目的 | 範例 |
|------|------|------|
| Stub | 回傳固定值 | `mockFn.mockReturnValue(42)` |
| Mock | 驗證互動 | `expect(mockFn).toHaveBeenCalled()` |
| Spy | 觀察真實實作 | `jest.spyOn(obj, 'method')` |
| Fake | 簡化的實作 | 記憶體內資料庫 |

## 測試命名慣例

### 格式選項

```javascript
// 行為導向
it('should return null when user is not found')

// Given-When-Then
it('given an invalid email, when validating, then throws ValidationError')

// Method_Scenario_Expectation
it('validateEmail_withInvalidFormat_throwsError')
```

### 好的命名

```javascript
it('calculates tax correctly for multiple items')
it('throws error when dividing by zero')
it('returns empty array when no matches found')
```

### 不好的命名

```javascript
it('test1')
it('works')
it('should work correctly')
```

## 覆蓋率指南

| 指標 | 目標 | 備註 |
|------|------|------|
| 行覆蓋率 | 80%+ | 最低門檻 |
| 分支覆蓋率 | 75%+ | 覆蓋條件路徑 |
| 函式覆蓋率 | 90%+ | 所有公開函式 |
| 關鍵路徑 | 100% | 付款、驗證、資料處理 |

### 覆蓋率注意事項

- 高覆蓋率 ≠ 好測試
- 專注於有意義的測試，而非覆蓋率數字
- 關鍵程式碼值得 100% 覆蓋
- 不要只為了覆蓋率測試瑣碎程式碼

## 最佳實踐

### 1. 每個測試一個斷言（理想情況）

```javascript
// 好：聚焦的測試
it('should return user name', () => {
  const user = new User('John');
  expect(user.getName()).toBe('John');
});

// 可接受：相關的多個斷言
it('should create valid user', () => {
  const user = new User('John', 'john@example.com');
  expect(user.getName()).toBe('John');
  expect(user.getEmail()).toBe('john@example.com');
});
```

### 2. 測試行為，而非實作

```javascript
// 好：測試行為
it('should mark order as paid', () => {
  order.pay();
  expect(order.isPaid()).toBe(true);
});

// 不好：測試實作細節
it('should set _paid flag to true', () => {
  order.pay();
  expect(order._paid).toBe(true);
});
```

### 3. 保持測試彼此獨立

```javascript
// 不好：測試依賴前一個測試
let user;
it('should create user', () => {
  user = createUser();
});
it('should update user', () => {
  user.update({ name: 'New' }); // 依賴前一個測試！
});

// 好：每個測試都是獨立的
it('should update user name', () => {
  const user = createUser();
  user.update({ name: 'New' });
  expect(user.name).toBe('New');
});
```

### 4. 使用具描述性的測試資料

```javascript
// 不好
const user = { a: 'b', c: 'd' };

// 好
const validUser = {
  name: 'John Doe',
  email: 'john@example.com'
};
```

## 常見框架

| 語言 | 框架 | 備註 |
|------|------|------|
| JavaScript | Jest | 最受歡迎，內建模擬 |
| JavaScript | Vitest | 快速，Vite 相容 |
| Python | pytest | 彈性，豐富插件 |
| Java | JUnit 5 | Java 標準 |
| C# | xUnit | 現代、可擴展 |
| Go | testing | 內建套件 |

## 相關選項

- [整合測試](./integration-testing.md) - 測試元件互動
- [系統測試](./system-testing.md) - 測試完整系統
- [E2E 測試](./e2e-testing.md) - 測試使用者流程

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
