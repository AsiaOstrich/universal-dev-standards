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

## 相關標準

- [安全標準](security-standards.md)
- [效能標準](performance-standards.md)
- [測試標準](testing-standards.md)
