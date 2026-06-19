---
source: options/testing/performance-testing.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# 效能測試（Performance Testing）

> **語言**: [English](../../../../options/testing/performance-testing.md) | 繁體中文

**上層標準**: [測試完整性](../../core/test-completeness-dimensions.md)

---

## 概觀

效能測試驗證應用程式在各種負載條件下是否符合速度、可擴展性與穩定性需求。它有助於找出瓶頸，並確保系統能承受預期的流量。

## 最適用於

- 高流量應用程式
- 即時系統
- 電子商務平台
- API 與微服務
- 資料庫密集型應用程式

## 測試類型

### Load Testing（負載測試）

測試系統在預期負載下的行為。

| 面向 | 細節 |
|--------|---------|
| **目的** | 驗證系統能處理正常流量 |
| **指標** | 回應時間（P50、P95、P99）、Throughput（TPS/RPS）、錯誤率 |

**工具：**

| 工具 | 類型 | 語言 |
|------|------|----------|
| k6 | 開源 | JavaScript |
| JMeter | 開源 | Java/XML |
| Gatling | 開源 | Scala |
| Locust | 開源 | Python |

### Stress Testing（壓力測試）

測試系統在超出正常負載下的行為。

| 面向 | 細節 |
|--------|---------|
| **目的** | 找出崩潰點與失效模式 |
| **指標** | 最大容量、劣化曲線、復原時間 |

**做法：**
- 逐步增加負載
- 監控錯誤與效能下降
- 找出瓶頸
- 記錄失效門檻

### Spike Testing（尖峰測試）

測試流量突然增加的情況。

| 面向 | 細節 |
|--------|---------|
| **目的** | 驗證對流量尖峰的處理能力 |
| **情境** | 限時搶購、爆紅內容、行銷活動、特定時段事件 |

### Soak Testing（耐久測試 / Endurance Testing）

測試系統在長時間運作下的穩定性。

| 面向 | 細節 |
|--------|---------|
| **目的** | 找出 memory leak 與效能劣化 |
| **持續時間** | 數小時到數天 |

**需留意：**
- Memory leak
- Connection pool 耗盡
- 日誌檔成長
- 效能逐漸劣化

### Capacity Testing（容量測試）

判定系統的最大容量。

| 面向 | 細節 |
|--------|---------|
| **目的** | 規劃擴展與基礎設施 |
| **產出** | 使用者容量上限、資源需求、擴展門檻 |

## 關鍵指標

### Latency（延遲）

| 百分位數 | 描述 | 目標 |
|------------|-------------|--------|
| P50 | 中位數回應時間 | 基準值 |
| P95 | 第 95 百分位數 | 基準值的 2–3 倍 |
| P99 | 第 99 百分位數 | 最多基準值的 5 倍 |

**注意：** 對使用者體驗而言，P99 往往比平均值更重要。

### Throughput（吞吐量）

| 量測 | 描述 |
|-------------|-------------|
| TPS | 每秒交易數（Transactions Per Second） |
| RPS | 每秒請求數（Requests Per Second） |
| QPS | 每秒查詢數（Queries Per Second） |

### 錯誤率

| 等級 | 目標 |
|-------|--------|
| 可接受 | < 0.1% |
| 劣化 | < 1% |
| 危急 | > 1% |

### 資源使用率

- CPU 使用率
- 記憶體使用率
- 網路 I/O
- 磁碟 I/O
- Connection pool 使用率

## Service Level Objectives（服務等級目標）

定義可量測的效能目標：

```yaml
latency_slo: "P99 latency < 200ms"
availability_slo: "99.9% uptime"
throughput_slo: "1000 RPS sustained"
error_slo: "Error rate < 0.1%"
```

**注意：** SLO 應以使用者需求為基礎，而非系統能力。

## 測試階段

| 階段 | 描述 | 持續時間 |
|-------|-------------|----------|
| **1. 基準（Baseline）** | 在最小負載下建立目前的效能基準 | 1–2 天 |
| **2. 負載（Load）** | 模擬預期流量，驗證是否符合 SLO | 2–3 天 |
| **3. 壓力（Stress）** | 增加負載直到失效，記錄崩潰點 | 1–2 天 |
| **4. 耐久（Soak）** | 執行 24–72 小時，監控效能劣化 | 1–3 天 |

## CI 整合

### k6 範例

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://api.example.com/health');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

### GitHub Actions

```yaml
name: Performance Test
on:
  pull_request:
    branches: [main]
jobs:
  k6:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6 test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/performance/load-test.js
```

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| 先建立基準 | 在最佳化前先建立基準指標 | 必要 |
| 真實資料 | 使用接近正式環境的資料量與模式 | 必要 |
| 隔離環境 | 使用隔離環境以避免干擾 | 必要 |
| 漸進負載 | 逐步增加負載以找出門檻 | 建議 |
| 監控資源 | 監控所有系統資源（CPU、記憶體、I/O） | 必要 |
| 聚焦百分位數 | 聚焦於 P95/P99 latency，而非平均值 | 必要 |
| 回歸測試 | 在 CI/CD 中納入效能回歸測試 | 建議 |

## 快速參考

### 測試類型

| 類型 | 目的 | 持續時間 | 時機 |
|------|---------|----------|------|
| Load | 正常流量 | 數分鐘 | 每次發版 |
| Stress | 崩潰點 | 數小時 | 重大發版 |
| Spike | 突然增加 | 數分鐘 | 視情況需要 |
| Soak | 長期穩定性 | 數天 | 每季 |
| Capacity | 最大容量 | 數小時 | 規劃時 |

### 關鍵指標

| 指標 | 量測內容 | 目標 |
|--------|-----------------|--------|
| P50 Latency | 中位數回應 | 基準值 |
| P95 Latency | 典型最差情況 | 基準值的 2–3 倍 |
| P99 Latency | 極端情況 | 最多基準值的 5 倍 |
| Throughput | 每秒請求數 | 依 SLO 定義 |
| 錯誤率 | 失敗的請求 | < 0.1% |

## 相關選項

- [單元測試](./unit-testing.md) - 單元測試實務
- [安全測試](./security-testing.md) - 安全測試實務

---

## 參考資料

- [ISTQB Performance Testing](https://www.istqb.org/)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [k6 Documentation](https://k6.io/docs/)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
