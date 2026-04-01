---
source: ../../../core/performance-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

# 效能標準

> **語言**: [English](../../../core/performance-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-29
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)
**業界標準**: ISO/IEC 25010 效能效率
**參考**: [sre.google](https://sre.google/books/)

> **詳細說明與最佳化技術，請參閱 [效能指南](../../../core/guides/performance-guide.md)**

---

## 目的

本標準定義軟體效能工程的完整指南，涵蓋效能需求、測試方法論和監控實踐。

**參考標準**：
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - 效能效率
- [Google SRE Book](https://sre.google/books/) - 網站可靠性工程

---

## 效能需求範本

### NFR 格式

```markdown
### NFR-PERF-XXX: [標題]

**分類**: 效能效率 > [時間行為/資源利用/容量]
**優先級**: P1/P2/P3

**需求**:
| 百分位 | 目標 | 最大值 |
|--------|------|--------|
| p50 | Xms | Yms |
| p95 | Xms | Yms |
| p99 | Xms | Yms |
```

## 效能預算

| 類別 | 預算 | 測量方式 |
|------|------|----------|
| 頁面載入時間 | < 3 秒 | Lighthouse |
| API 回應時間 (p95) | < 500ms | APM 工具 |
| 記憶體使用 | < 512MB | 執行時監控 |
| CPU 使用率 | < 70% 平均 | 系統監控 |
| 套件大小 | < 200KB (gzip) | 建置分析 |

## 效能測試類型

| 類型 | 目的 | 工具 |
|------|------|------|
| **負載測試** | 驗證正常負載下的效能 | k6、JMeter、Locust |
| **壓力測試** | 找出系統極限 | k6、Gatling |
| **浸泡測試** | 偵測記憶體洩漏 | k6（長時間執行） |
| **尖峰測試** | 驗證突發流量處理 | k6、Artillery |

## 監控與告警

| 指標類型 | 範例 | 告警閾值 |
|----------|------|----------|
| 延遲 (Latency) | p95 回應時間 | > 目標的 2 倍 |
| 流量 (Traffic) | 每秒請求數 | 異常波動 > 50% |
| 錯誤率 (Errors) | HTTP 5xx 比例 | > 1% |
| 飽和度 (Saturation) | CPU/記憶體使用 | > 80% |

## 效能測試執行

### 測試類型定義

| 測試類型 | 目的 | 適用場景 |
|----------|------|----------|
| **Load Test** | 驗證系統在預期負載下的行為 | 發布前驗證、容量規劃 |
| **Stress Test** | 找出系統極限與崩潰行為 | 架構變更、擴展驗證 |
| **Soak Test** | 偵測記憶體洩漏或資源耗盡 | 重大發布、資源密集服務 |
| **Spike Test** | 驗證突發流量下的回應與恢復 | 行銷活動前、促銷事件 |

### Baseline 管理

**首次建立 Baseline：**
1. 在穩定版本上執行至少 3 次完整 Load Test
2. 取 p50、p95、p99 的中位數作為 baseline
3. 記錄測試環境配置（硬體、資料量、並發數）
4. 將 baseline 與測試腳本一同存入版本控制

**漂移偵測閾值：**

| 指標 | 可接受漂移 | 需調查 | 阻擋 |
|------|-----------|--------|------|
| p50 Latency | < 5% | 5-15% | > 15% |
| p95 Latency | < 10% | 10-20% | > 20% |
| p99 Latency | < 10% | 10-25% | > 25% |
| Throughput | < 5% 下降 | 5-15% 下降 | > 15% 下降 |
| Error Rate | 無增加 | < 0.1% 增加 | > 0.1% 增加 |

### CI 觸發條件

| 觸發條件 | Load Test | Stress Test | Soak Test | Spike Test |
|----------|-----------|-------------|-----------|------------|
| 每次 commit | 否 | 否 | 否 | 否 |
| PR 合併至 main | 是（精簡） | 否 | 否 | 否 |
| Release tag | 是（完整） | 是 | 否 | 否 |
| 排程（每週） | 是 | 否 | 是 | 否 |

### Performance Budget

| 概念 | 定義 | 範例 |
|------|------|------|
| **效能目標** | 目標效能水準 | p99 < 200ms |
| **效能預算** | 允許的劣化餘裕 | p99 可劣化至 220ms（10%） |
| **預算消耗** | 累積劣化百分比 | 本季已消耗 6% |
| **預算耗盡** | 觸發凍結非必要變更 | 剩餘 < 2% 時凍結 |

---

## 相關標準

- [部署標準](deployment-standards.md)
- [安全標準](security-standards.md)
- [測試標準](testing-standards.md)
- [需求工程](requirement-engineering.md) - NFR 文件
- [日誌標準](logging-standards.md) - 效能日誌
