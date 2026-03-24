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

## 相關標準

- [部署標準](deployment-standards.md)
- [安全標準](security-standards.md)
- [測試標準](testing-standards.md)
