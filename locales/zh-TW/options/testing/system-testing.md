---
source: ../../../../options/testing/system-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: accc907c60d0
status: current
---

# 系統測試

> **語言**: [English](../../../../options/testing/system-testing.md) | 繁體中文

**上層標準**: [測試指南](../../../../core/testing-standards.md)

---

## 概述

系統測試針對指定需求驗證完整、整合的系統。它在接近生產環境的環境中測試整個應用程式，驗證功能性和非功能性需求。

## 特性

| 屬性 | 值 |
|------|------|
| 範圍 | 整個應用系統 |
| 相依性 | 所有真實元件 |
| 執行速度 | 分鐘到小時 |
| 環境 | 類生產環境 |
| 數量 | 精選的測試集 |

## 適用情境

- 驗證完整使用者流程
- 測試系統級需求
- 效能和負載測試
- 安全性測試
- 發布前回歸測試

## 在測試金字塔中的位置

```
        /\
       /★★\     E2E/System Tests (this level)
      /----\
     /      \   Integration Tests
    /--------\
   /          \  Unit Tests
  /------------\
```

系統測試位於頂端：涵蓋全面，但數量較少。

## 系統測試類型

### 1. 功能測試

驗證系統符合功能需求：

```gherkin
# 行為驅動規格
Feature: 使用者註冊

  Scenario: 使用有效資料成功註冊
    Given 我在註冊頁面
    When 我輸入有效的註冊資料
    And 我提交註冊表單
    Then 我應該收到確認郵件
    And 我的帳戶應該在資料庫中建立
    And 我應該被重導到歡迎頁面

  Scenario: 使用已存在的電子郵件註冊失敗
    Given 已存在電子郵件為 "user@example.com" 的使用者
    When 我嘗試以電子郵件 "user@example.com" 註冊
    Then 我應該看到錯誤訊息 "Email already registered"
    And 不應建立任何新帳戶
```

### 2. 效能測試

驗證系統在負載下的效能：

```javascript
// k6 負載測試範例
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // 升溫
    { duration: '5m', target: 100 },  // 維持 100 使用者
    { duration: '2m', target: 200 },  // 尖峰到 200
    { duration: '5m', target: 200 },  // 維持 200
    { duration: '2m', target: 0 },    // 降溫
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 低於 500ms
    http_req_failed: ['rate<0.01'],    // 錯誤率低於 1%
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

### 3. 安全性測試

測試系統安全控制：

```yaml
# 安全測試情境
security_tests:
  authentication:
    - test: "暴力破解保護"
      steps:
        - 嘗試 5 次失敗登入
        - 驗證帳戶鎖定
        - 驗證鎖定通知郵件

    - test: "Session 管理"
      steps:
        - 登入並取得 session token
        - 驗證 token 在逾時後過期
        - 驗證登出時 token 失效

  authorization:
    - test: "角色型存取控制"
      steps:
        - 以一般使用者登入
        - 嘗試存取僅限管理員的端點
        - 驗證回應為 403 Forbidden

  data_protection:
    - test: "敏感資料加密"
      steps:
        - 建立帶有密碼的使用者
        - 驗證密碼在資料庫中已雜湊
        - 驗證 PII 在靜態儲存時已加密
```

### 4. 可靠性測試

測試系統在不利條件下的行為：

```python
# 混沌工程測試
class ReliabilityTest:
    def test_database_failover(self):
        """系統應優雅處理資料庫故障轉移。"""
        # 安排
        app = TestApplication()
        app.start()

        # 執行：模擬主資料庫故障
        app.database.simulate_failure('primary')

        # 驗證：系統使用副本繼續運作
        response = app.client.get('/api/health')
        assert response.status_code == 200
        assert response.json()['database'] == 'degraded'

        # 驗證故障轉移後的資料一致性
        user = app.client.get('/api/users/1')
        assert user.status_code == 200

    def test_external_service_timeout(self):
        """系統應能處理外部服務逾時。"""
        # 安排
        app = TestApplication()
        app.mock_external_service('payment', delay=30)  # 延遲 30 秒

        # 執行
        response = app.client.post('/api/orders', json={
            'items': [{'sku': 'ABC', 'qty': 1}]
        }, timeout=10)

        # 驗證：優雅處理逾時
        assert response.status_code == 202  # 已接受，非同步處理中
        assert 'retry' in response.json()
```

### 5. 相容性測試

在不同環境中進行測試：

```yaml
# 跨瀏覽器／裝置測試矩陣
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
    - 登入流程正確呈現
    - 表單具備無障礙性
    - 響應式版面正常運作
    - 觸控互動功能正常
```

## 測試環境

### 環境需求

| 面向 | 需求 |
|------|------|
| 基礎設施 | 鏡像生產拓撲 |
| 資料 | 真實、匿名化的生產資料 |
| 規模 | 至少生產環境 10% 容量 |
| 隔離 | 與開發/測試環境分離 |
| 監控 | 啟用完整可觀測性 |

### 環境建置

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

## 測試資料管理

### 資料策略

| 策略 | 使用情境 |
|------|----------|
| 匿名化生產資料 | 貼近真實的情境 |
| 合成資料產生 | 規模測試 |
| 子集擷取 | 特定工作流程 |
| 按需建立 | 全新狀態的測試 |

### 資料建置範例

```python
class SystemTestDataFactory:
    def create_complete_test_scenario(self):
        """建立完整的電子商務情境。"""
        # 使用者
        admin = self.create_user(role='admin')
        customers = [self.create_user(role='customer') for _ in range(100)]

        # 商品
        categories = self.create_categories(count=10)
        products = self.create_products(count=1000, categories=categories)

        # 歷史資料
        for customer in customers[:50]:
            self.create_order_history(customer, products, count=5)

        return {
            'admin': admin,
            'customers': customers,
            'products': products,
            'categories': categories
        }
```

## 測試報告

### 報告結構

```markdown
# 系統測試報告

## 摘要
- **日期**: 2024-01-15
- **版本**: v2.3.0
- **環境**: system-test-01
- **時長**: 4 小時 32 分鐘

## 結果總覽
| 類別 | 通過 | 失敗 | 跳過 |
|------|------|------|------|
| 功能 | 145 | 3 | 2 |
| 效能 | 12 | 0 | 0 |
| 安全 | 28 | 1 | 0 |
| 相容性 | 32 | 0 | 4 |

## 失敗的測試
### FUNC-042: 使用過期優惠券結帳
- **預期**: 顯示錯誤訊息
- **實際**: 系統錯誤 500
- **優先級**: 高
- **截圖**: [link]

## 效能指標
- 平均回應時間: 234ms
- 95 百分位: 456ms
- 錯誤率: 0.02%
- 吞吐量: 1,200 req/sec
```

## 最佳實踐

1. **在類生產環境測試**
2. **使用真實資料量**
3. **包含非功能性需求**
4. **自動化回歸測試**
5. **清楚記錄測試情境**
6. **執行期間監控**
7. **執行後清理測試資料**

## 相關選項

- [單元測試](./unit-testing.md) - 測試個別元件
- [整合測試](./integration-testing.md) - 測試元件互動
- [E2E 測試](./e2e-testing.md) - 測試使用者流程

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
