---
source: ../../../core/feature-flag-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# Feature Flag 管理標準

> 版本: 1.0.0 | 最後更新: 2026-04-01

## 概述

本文件定義 Feature Flag（又稱 Feature Toggle）在整個生命週期中的管理標準。Feature Flag 是控制功能發布、實驗和營運安全的強大技術，但缺乏適當管理會累積為技術債。

## 1. Flag 類型

| 類型 | 用途 | 生命週期 |
|------|------|---------|
| **Release** | 控制漸進式功能發布 | 暫時性，完全發布後移除 |
| **Experiment** | A/B 測試與數據驅動決策 | 暫時性，實驗結束後移除 |
| **Ops** | 營運控制（Circuit Breaker、Kill Switch） | 永久，每季審查 |
| **Permission** | 使用者/角色存取控制 | 永久，綁定授權模型 |

## 2. 命名慣例

格式：`<type>_<feature>_<context>`

| Flag 名稱 | 類型 | 說明 |
|-----------|------|------|
| `release_new_checkout_flow` | Release | 新結帳流程發布 |
| `experiment_pricing_page_v2` | Experiment | 定價頁面 A/B 測試 |
| `ops_payment_circuit_breaker` | Ops | 支付服務 Circuit Breaker |
| `permission_admin_dashboard` | Permission | 管理後台存取控制 |

## 3. 生命週期階段

```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (TTL 超過)
```

| 階段 | 說明 |
|------|------|
| **Created** | Flag 已定義但尚未啟用 |
| **Active** | Flag 使用中，控制功能行為 |
| **Validated** | 功能確認正常運作 |
| **Cleanup** | 正在從程式碼中移除 |
| **Removed** | 完全移除（終態） |
| **Expired** | 超過 TTL 未推進 |

## 4. TTL（存活時間限制）

| 類型 | 預設 TTL | 最大 TTL |
|------|---------|---------|
| Release | 2 週 | 4 週 |
| Experiment | 4 週 | 8 週 |
| Ops | 無限 | 無限（每季審查） |
| Permission | 無限 | 無限（每年審查） |

## 5. 審計（4 個檢查維度）

| 維度 | 說明 |
|------|------|
| **存活時間** | Flag 存活時間 vs TTL |
| **使用狀態** | Flag 是否正在被評估 |
| **程式碼參考** | 多少程式碼位置引用此 Flag |
| **測試影響** | Flag 對測試套件的影響 |

## 6. 腐化偵測

Flag 超過 TTL 時，系統必須自動執行：
1. 標記為 Expired
2. 建立技術債登記條目
3. 通知 Owner
4. 加入 Sprint Planning 提醒

## 7. 清理檢查表

- [ ] 移除 Flag 判斷程式碼
- [ ] 移除 Flag 配置
- [ ] 更新相關測試
- [ ] 更新文件
- [ ] 驗證所有環境

## 8. 測試原則

1. **測試兩種狀態**：每個 Flag 必須測試 on/off 兩種狀態
2. **避免組合爆炸**：不測試所有 2^N 組合，只測試實際部署場景
3. **預設值測試**：測試 Flag 預設值的系統行為
4. **環境隔離**：測試中的 Flag 值必須與其他環境隔離

---

**相關標準：**
- [測試標準](testing-standards.md)
- [部署標準](deployment-standards.md)
- [日誌標準](logging-standards.md)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
