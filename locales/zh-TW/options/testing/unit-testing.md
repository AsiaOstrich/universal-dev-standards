---
source: ../../../../options/testing/unit-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 單元測試

> **語言**: [English](../../../options/testing/unit-testing.md) | 繁體中文

**上層標準**: [測試指南](../../core/testing.md)

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
       /  \      E2E 測試（少）
      /----\
     /      \    整合測試（中）
    /--------\
   /          \  單元測試（多）← 這一層
  /------------\
```

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

- 不要模擬被測試的單元
- 不要模擬簡單的值物件
- 不要模擬所有東西——某些真實物件是可以的

## 測試命名慣例

```javascript
// 行為導向
it('should return null when user is not found')
// 當找不到使用者時應該回傳 null

// Given-When-Then
it('given an invalid email, when validating, then throws ValidationError')
// 給定無效的 email，當驗證時，拋出 ValidationError

// Method_Scenario_Expectation
it('validateEmail_withInvalidFormat_throwsError')
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
