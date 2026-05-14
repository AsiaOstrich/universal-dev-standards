# CD Deployment Strategies（CD 部署策略）

## 概述

本標準定義四種主要部署策略的選用矩陣：Blue-Green、Canary、Rolling、Recreate。幫助團隊根據流量規模、風險容忍度和基礎設施成本，做出一致且有據可查的策略選擇。

---

## 核心原則

- **三維決策**：根據流量規模 × 風險容忍度 × 基礎設施成本選擇策略
- **禁止直接推產**：任何變更都必須先通過 staging 環境驗證
- **零停機目標**：除非為內部工具或開發環境，否則應追求零停機部署

---

## 策略選用矩陣

| 策略 | 流量規模 | 風險容忍度 | 基礎設施成本 | 停機時間 | 回滾時間 |
|------|---------|----------|------------|---------|---------|
| Blue-Green | 高 | 低 | 高 | 零 | < 30 秒 |
| Canary | 中至高 | 中 | 中 | 零 | < 2 分鐘 |
| Rolling | 任意 | 中 | 低 | 極少 | 數分鐘 |
| Recreate | 低 | 高 | 極低 | 數秒至數分鐘 | 數分鐘 |

---

## 各策略詳細說明

### Blue-Green

**適用場景**：有狀態服務、資料庫相容性變更、高 SLA API

**運作方式**：
- 維護兩個完全相同的環境（Blue = 現有線上版，Green = 新版本）
- 完整部署並驗證 Green 環境後，切換 Load Balancer 流量
- 問題發生時立即切回 Blue

**前置條件**：雙環境基礎設施、Load Balancer、健康檢查

---

### Canary

**適用場景**：功能驗證、A/B 測試、高風險變更

**流量漸進比例**：1% → 5% → 25% → 50% → 100%

**運作方式**：
- 先將少量流量導向新版本
- 監控指標，符合自動晉升規則則繼續擴大
- 發現問題立即縮回 0%

**前置條件**：流量切分機制、可觀測性、自動晉升規則

---

### Rolling

**適用場景**：無狀態服務、標準更新、批次工作者

**運作方式**：
- 依序更新每個實例，更新前進行健康檢查
- 允許新舊版本短暫共存
- 資源效率最佳，但回滾需時較長

**前置條件**：多個服務實例、健康檢查

---

### Recreate

**適用場景**：開發/測試環境、內部工具、單一實例服務

**運作方式**：
- 停止所有現有實例，部署新版本，重新啟動
- 最簡單，但有停機時間

**前置條件**：無（最低門檻）

---

## 決策樹

```
Q1: 需要零停機時間？
  → 否 → Recreate
  → 是 → Q2

Q2: 流量 > 10k req/min？
  → 是 → Q3（Blue-Green 或 Canary）
  → 否 → Rolling

Q3: 變更屬於高風險？
  → 是 → Canary
  → 否 → Q4

Q4: 基礎設施預算有限？
  → 是 → Rolling
  → 否 → Blue-Green
```

---

## 無 CI/CD 環境的替代做法

| 策略 | 替代方案 |
|------|---------|
| Blue-Green | 參見 no-cicd-deployment.ai.yaml 的 Shell Script 實作 |
| Canary | 使用 Nginx `split_clients` 或 HAProxy 做流量切分 |
| Rolling | 使用順序式 rsync + 健康檢查迴圈 |
| Recreate | 最簡單 — 停止、部署、啟動 |

---

## 相關標準

- [deployment-standards.md](deployment-standards.md) — 部署基礎原則
- [rollback-standards.md](rollback-standards.md) — 回滾觸發條件矩陣
- [no-cicd-deployment.md](no-cicd-deployment.md) — 無 CI/CD 部署策略
- AI 格式：[../ai/standards/cd-deployment-strategies.ai.yaml](../ai/standards/cd-deployment-strategies.ai.yaml)


**Scope**: universal
