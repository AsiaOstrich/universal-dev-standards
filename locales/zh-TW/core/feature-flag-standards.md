---
source: ../../../core/feature-flag-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 98660be33d76
status: current
---

# Feature Flag 管理標準

> **語言**: [English](../../../core/feature-flag-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-31
**適用範圍**: 所有軟體專案
**範疇**: universal
**業界標準**: Martin Fowler Feature Toggles, LaunchDarkly Best Practices
**參考資料**: [martinfowler.com/articles/feature-toggles.html](https://martinfowler.com/articles/feature-toggles.html)

---

## 概述

本文件定義 Feature Flag（又稱 Feature Toggle）在整個生命週期中的管理標準。Feature Flag 是控制功能發布、實驗和營運安全的強大技術，但缺乏適當管理會累積為技術債並增加系統複雜度。

---

## 1. Flag Types / Flag 類型

所有 Feature Flag 必須分類為以下四種類型之一，每種類型皆有其專屬的管理策略：

| 類型 | 用途 | 管理策略 (Management Strategy) | 生命週期 |
|------|---------|-------------------------------|----------|
| **Release** | 控制漸進式功能發布 | 生命週期短暫；完全發布後移除 | 暫時性 |
| **Experiment** | A/B 測試與數據驅動決策 | 有時限；實驗結束後移除 | 暫時性 |
| **Ops** | 營運控制（Circuit Breaker、Kill Switch） | 長期存在；每季審查 | 永久（附帶審查） |
| **Permission** | 使用者/角色存取控制 | 長期存在；綁定授權模型 | 永久 |

### 類型詳細資訊

- **Release**：用於將部署與發布解耦。循序漸進地啟用功能（Canary、百分比發布）。功能完全發布後必須移除。
- **Experiment**：用於 A/B 測試與多變量實驗。建立前必須定義明確的成功指標。在收集完數據並做成決策後移除。
- **Ops**：用於營運安全控制，例如 Circuit Breaker、Rate Limiter 與優雅降級（Graceful Degradation）。可以無限期保留，但必須每季進行審查。
- **Permission**：用於依使用者角色、訂閱層級或權益（Entitlement）來控制功能存取。存活時間與業務授權模型綁定。

---

## 2. Naming Conventions / 命名慣例

### 模式

所有 Flag 名稱必須遵循以下模式：`<type>_<feature>_<context>`

| 元件 | 說明 | 範例 |
|-----------|-------------|---------|
| `type` | Flag 類型前綴 | `release`, `experiment`, `ops`, `permission` |
| `feature` | 功能或系統名稱 | `new_checkout`, `pricing_page`, `payment` |
| `context` | 特定情境或變體 | `flow`, `v2`, `circuit_breaker`, `dashboard` |

### 正面範例 (✅)

| Flag 名稱 | 類型 | 說明 |
|-----------|------|-------------|
| `release_new_checkout_flow` | Release | 新結帳流程發布 |
| `experiment_pricing_page_v2` | Experiment | 定價頁面 A/B 測試 |
| `ops_payment_circuit_breaker` | Ops | 支付服務 Circuit Breaker |
| `permission_admin_dashboard` | Permission | 管理後台存取控制 |

### 反面範例 (❌)

| 不良名稱 | 問題 |
|----------|---------|
| `flag1` | 無類型前綴，無具體意義的名稱 |
| `new_feature` | 缺少類型前綴與情境 |
| `test_thing_temp` | 模糊不清、無類型前綴、暗示暫時性卻無生命週期 |

---

## 3. Lifecycle Stages / 生命週期階段

每個 Feature Flag 都會歷經 6 個生命週期階段：

```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (if TTL exceeded)
```

| 階段 | 說明 | 進入條件 | 退出條件 |
|-------|-------------|---------------|--------------|
| **Created** | Flag 已在設定中定義但尚未啟用 | Flag 定義已合併至程式碼庫 | Flag 在任一環境中開啟 |
| **Active** | Flag 使用中，控制功能行為 | Flag 在至少一個環境中啟用 | 已做成功能決策（發布完成或實驗結束） |
| **Validated** | Flag 背後的功能確認正常運作 | 發布達 100% 或已收集實驗數據 | 建立清理工作票（Cleanup ticket） |
| **Cleanup** | Flag 正在從程式碼庫中移除 | 清理工作已開始 | 所有 Flag 參考均已移除 |
| **Removed** | Flag 已完全從所有程式碼與設定中移除 | 程式碼庫中未保留任何參考 | 終態 |
| **Expired** | Flag 超過其 TTL 且未向前推進 | 在 Created、Active 或 Validated 階段超過 TTL | 必須轉換為 Cleanup 或提出合理解釋予以展延 |

---

## 4. TTL (Time-To-Live) / 存活時間限制

每種 Flag 類型都有定義明確的 TTL，以防止 Flag 堆積：

| 類型 | 預設 TTL | 最大 TTL | 超過 TTL 時的動作 |
|------|-------------|---------|-------------------|
| **Release** | 2 週 | 4 週 | 自動標記為 Expired，觸發清理流程 |
| **Experiment** | 4 週 | 8 週 | 自動標記為 Expired，要求結論報告 |
| **Ops** | 無限 | 無限（季度審查） | 每季審查，未審查者標記為待確認 |
| **Permission** | 無限 | 無限（年度審查） | 年度審查，確認是否仍需要 |

### TTL 強制執行

- 當 Flag 超過其 TTL 時，系統必須自動將其標記為 **Expired**
- 過期的 Flag 必須在下一個 Sprint 內處理
- 展延需要明確的核准並附上記錄在案的理由

---

## 5. Audit / 審計

### 4 Audit Dimensions / 4 個審計檢查維度

定期審計必須跨以下四個維度檢查每個 Flag：

| 維度 | 說明 | 檢查方法 |
|-----------|-------------|-------------|
| **存活時間** | Flag 存活時間 vs. 其 TTL | 比對建立日期與 TTL 政策 |
| **使用狀態** | Flag 是否正在被活躍評估 | 檢查執行階段評估日誌 |
| **程式碼參考** | 多少程式碼位置引用此 Flag | 靜態分析／程式碼搜尋 |
| **測試影響** | Flag 如何影響測試套件行為 | 分析測試設定與分支 |

### Audit Report Format / 審計報告格式

每份審計報告必須包含以下區段：

| 區段 | 說明 |
|---------|-------------|
| **Flag 總數**（按類型分組） | 按類型分組的 Flag 總數（Release、Experiment、Ops、Permission） |
| **過期 Flag 清單** | 所有已超過其 TTL 的 Flag 清單 |
| **本季清理 Flag 數** | 當季已清理的 Flag 數量 |
| **Flag 趨勢（增減）** | 顯示 Flag 數量隨時間淨變化的趨勢 |

---

## 6. Decay Detection / 腐化偵測

當 Flag 超過其 TTL 或出現腐化跡象（未使用、未被引用）時，系統必須執行以下自動化動作：

| # | 動作 | 說明 |
|---|--------|-------------|
| 1 | **標記為 Expired** | 自動將 Flag 轉換至 Expired 生命週期階段 |
| 2 | **技術債登記（建立條目）** | 建立包含 Flag 詳細資訊、Owner 及建議動作的技術債登記條目 |
| 3 | **通知 Owner** | 透過已設定的管道（Email、Slack 等）發送通知給 Flag 的 Owner |
| 4 | **Sprint Planning 提醒** | 將過期的 Flag 加入下一次 Sprint Planning 議程中以進行優先序排序 |

---

## 7. Cleanup Checklist / 清理檢查表

移除 Feature Flag 時，請遵循以下 5 步驟檢查清單：

- [ ] **Step 1: 移除 Flag 判斷程式碼** — 移除所有引用該 Flag 的條件判斷程式碼分支。保留最終勝出的程式碼路徑。
- [ ] **Step 2: 移除 Flag 配置** — 從所有設定檔、環境變數與 Feature Flag 服務中移除 Flag 定義。
- [ ] **Step 3: 更新相關測試** — 更新或移除專門測試 Flag 開啟／關閉行為的測試。確保剩餘的測試反映永久狀態。
- [ ] **Step 4: 更新文件** — 更新引用該 Flag 的任何文件、Runbook 或架構圖。
- [ ] **Step 5: 驗證所有環境** — 驗證 Flag 已從所有環境（dev、staging、production）中移除，且未殘留任何參考。

---

## 8. Testing Principles / 測試原則

使用 Feature Flag 時，請遵循以下 4 項測試原則：

### Principle 1: 測試兩種狀態 (Test Both States: on/off)

每個 Feature Flag 必須有測試涵蓋啟用（on）與停用（off）兩種狀態。這能確保系統無論 Flag 值為何皆能正確運作。

### Principle 2: 避免組合爆炸 (Avoid Combination Explosion)

當存在多個 Flag 時，切勿測試所有可能的組合（2^N 會呈指數增長）。相反地：
- 獨立測試每個 Flag 的 on/off 狀態
- 僅測試代表實際部署情境的特定組合
- 使用基於風險的測試（Risk-based testing）來識別關鍵組合

### Principle 3: 預設值測試 (Test Default Values)

務必測試 Flag 為預設值時的系統行為。這是新使用者或新環境將體驗到的狀態。確保預設值安全且記錄詳盡。

### Principle 4: 環境隔離 (Environment Isolation)

測試中的 Flag 值必須與其他環境隔離：
- 測試不應依賴外部的 Feature Flag 服務
- 使用測試本地（test-local）的 Flag 設定
- 確保單一測試中的 Flag 狀態變更不會影響其他測試

---

## 快速參考卡

### Flag 類型選擇
```
Gradual feature rollout?         → Release
A/B testing or experiment?       → Experiment
Operational safety control?      → Ops
User/role access control?        → Permission
```

### 生命週期流程
```
Created → Active → Validated → Cleanup → Removed
                                  ↓
                               Expired (TTL exceeded)
```

### TTL 快速參考
```
Release:    2 weeks default, 4 weeks max
Experiment: 4 weeks default, 8 weeks max
Ops:        Unlimited (quarterly review)
Permission: Unlimited (annual review)
```

---

## 參考資料

- [Martin Fowler — Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) — Feature Toggle 類型與模式的完整指南
- [LaunchDarkly — Feature Flag Best Practices](https://launchdarkly.com/blog/feature-flag-best-practices/) — Flag 管理的業界最佳實踐
- [Pete Hodgson — Feature Toggles (aka Feature Flags)](https://www.martinfowler.com/articles/feature-toggles.html) — Toggle 類型的詳細分類

---

**相關標準：**
- [測試標準](testing-standards.md) — 測試需求與模式
- [部署標準](deployment-standards.md) — 包含 Canary 與藍綠部署的部署策略
- [日誌標準](logging-standards.md) — 記錄 Feature Flag 決策以利可觀測性

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始發布：Flag 類型、命名慣例、生命週期、TTL、審計、腐化偵測、清理檢查表、測試原則 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
