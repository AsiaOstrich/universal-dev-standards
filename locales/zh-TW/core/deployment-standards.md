---
source: ../../../core/deployment-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

# 部署標準

> **語言**: [English](../../../core/deployment-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-02-09
**適用性**: 所有具有部署管線的軟體專案
**範圍**: 通用 (Universal)
**業界標準**: Twelve-Factor App、Google SRE — Release Engineering、DORA State of DevOps
**參考**: [12factor.net](https://12factor.net/)、[sre.google](https://sre.google/books/)、[dora.dev](https://dora.dev/)

---

## 目的

本標準定義安全部署軟體到正式環境的指南，涵蓋部署策略、Feature Flags、回滾程序、環境一致性和部署效能指標。

**參考標準**：
- [The Twelve-Factor App](https://12factor.net/) — Factor X：開發/正式一致性
- [Google SRE Book — Release Engineering](https://sre.google/sre-book/release-engineering/)
- [DORA State of DevOps Report](https://dora.dev/)

---

## 核心原則

| 原則 | 說明 |
|------|------|
| **部署 ≠ 發布** | 部署程式碼到正式環境和將其暴露給使用者是分開的動作；使用 Feature Flags 控制曝光 |
| **漸進式曝光** | 將變更推送給越來越大的受眾：內部 → 金絲雀 → 百分比 → 全面上線 |
| **快速回滾** | 每次部署必須有經過測試的回滾路徑，在 5 分鐘內完成 |
| **環境一致性** | 保持開發、暫存和正式環境盡可能相似（Twelve-Factor App Factor X） |
| **自動化一切** | 手動部署步驟容易出錯；自動化建置、測試、部署和回滾 |
| **監控一切** | 部署時必須具備可觀測性；無法測量就無法安全部署 |

## 部署策略選擇

| 策略 | 停機時間 | 風險 | 適用場景 |
|------|----------|------|----------|
| **滾動更新 (Rolling)** | 零 | 低 | 無狀態服務 |
| **藍綠部署 (Blue-Green)** | 接近零 | 低 | 需要即時回滾 |
| **金絲雀部署 (Canary)** | 零 | 極低 | 高流量服務 |
| **重建 (Recreate)** | 有 | 中 | 資料庫遷移 |

## DORA 指標

| 指標 | 菁英水準 | 高水準 |
|------|----------|--------|
| 部署頻率 | 每天多次 | 每週至每月 |
| 變更前置時間 | < 1 小時 | 1 天至 1 週 |
| 故障率 | 0-15% | 16-30% |
| 服務恢復時間 | < 1 小時 | < 1 天 |

## 部署驗證

### 成功標準

部署在觀測視窗內滿足以下**所有**條件時視為成功：

| 條件 | 閾值 | 觀測視窗 |
|------|------|----------|
| **Error rate** | ≤ 部署前 baseline + 0.1% | 5 分鐘 |
| **P99 latency** | ≤ 部署前 baseline × 1.2 | 5 分鐘 |
| **Health check** | 100% 通過率 | 持續 |
| **Smoke tests** | 100% 通過率 | 部署後 2 分鐘內 |

任一條件失敗應觸發自動 rollback 或通知 on-call 工程師。

### 觀測期

| 部署類型 | 最短觀測期 | 關鍵觀測指標 |
|----------|-----------|-------------|
| **Canary** | 每流量階段 15 分鐘 | Error rate、Latency、業務指標 |
| **Blue-Green** | 切換後 5 分鐘 | Health check、Error rate |
| **Rolling** | 整個上線期間 | 每批次 Health check |
| **Feature Flag** | 首次啟用 24 小時 | 業務指標、使用者回饋 |

### Smoke Test 要求

部署後 Smoke Test 必須自動執行，至少涵蓋：

| # | 測試項目 | 預期結果 | 超時 |
|---|----------|----------|------|
| 1 | Health check endpoint 回傳 200 | HTTP 200 + status "healthy" | 5 秒 |
| 2 | 核心 API endpoints 可用（至少 3 條關鍵路徑） | HTTP 2xx | 10 秒/條 |
| 3 | 資料庫連線正常 | 查詢成功執行 | 5 秒 |
| 4 | 外部相依服務可達 | 連線檢查成功 | 10 秒/項 |
| 5 | 總執行時間 | 所有測試完成 | 最長 60 秒 |

Smoke Test 失敗必須阻擋部署並觸發 rollback。

---

## 相關標準

- [安全標準](security-standards.md)
- [效能標準](performance-standards.md)
- [測試標準](testing-standards.md)
- [簽入標準](checkin-standards.md) - 部署前品質關卡
- [Changelog 標準](changelog-standards.md) - 記錄已部署變更
- [Git 工作流標準](git-workflow.md) - 分支策略與發布流程
- [版本標準](versioning.md) - 發布版本號碼
