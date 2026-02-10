---
source: ../../../../options/testing/system-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
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
```

### 2. 效能測試

驗證系統在負載下的效能：

```javascript
// k6 負載測試範例
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
