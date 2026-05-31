---
name: contract-test-assistant
source: ../../../../skills/contract-test-assistant/SKILL.md
source_version: 1.0.0
source_hash: f67623eb913a
translation_version: 1.0.0
last_synced: 2026-06-01
status: current
description: "[UDS] 引導 API 和微服務的合約測試策略"
---

# 合約測試助手

> **語言**: [English](../../../../skills/contract-test-assistant/SKILL.md) | 繁體中文

引導 API 和微服務的合約測試策略選擇、設定和驗證。

## 什麼是合約測試？

合約測試透過測試消費者和提供者之間的協議（合約）來驗證服務間的通訊正確性，不需要所有服務同時運行。

## 策略選擇

| 策略 | 適用場景 | 工具 |
|------|---------|------|
| **消費者驅動（Consumer-Driven）** | 內部微服務，團隊同時擁有兩端 | Pact |
| **提供者驅動（Provider-Driven）** | 公開 API，OpenAPI 優先設計 | OpenAPI + Prism |
| **雙向（Bi-Directional）** | 混合所有權，漸進採用 | Pact + OpenAPI |

## 工作流程

```
ASSESS ──► CHOOSE ──► DEFINE ──► IMPLEMENT ──► VERIFY
  評估架構    選擇策略    定義合約     實作測試      驗證合約
```

### 1. ASSESS — 評估架構
- 有多少服務互相通訊？
- 誰擁有消費者端、誰擁有提供者端？

### 2. CHOOSE — 選擇策略
- 消費者驅動（Pact）vs 提供者驅動（OpenAPI）

### 3. DEFINE — 定義合約
- 撰寫消費者期望或 OpenAPI 規格

### 4. IMPLEMENT — 實作測試
- 消費者測試產生合約
- 提供者測試驗證合約

### 5. VERIFY — 執行驗證
- CI 管線在每個 PR 上驗證合約

## 指令

| 指令 | 說明 |
|------|------|
| `/contract-test` | 互動式策略選擇 |
| `/contract-test consumer` | 引導消費者測試設定 |
| `/contract-test provider` | 引導提供者測試設定 |
| `/contract-test verify` | 檢查合約覆蓋率 |

## 合約覆蓋率報告

```markdown
## 合約覆蓋率報告

| 消費者 | 提供者 | 端點 | 狀態 |
|--------|--------|------|------|
| web-app | user-api | GET /users/:id | ✅ 已驗證 |
| web-app | user-api | POST /users | ✅ 已驗證 |
| mobile-app | auth-api | POST /login | ⚠️ 僅消費者端 |
| admin-ui | report-api | GET /reports | ❌ 無合約 |

**覆蓋率**：50%（2/4 個端點兩端皆驗證）
```

## 與其他技能的整合

| 技能 | 整合方式 |
|------|---------|
| `/api-design` | 設計時定義 API 合約 |
| `/ci-cd` | 管線中加入合約驗證 |
| `/testing` | 合約測試作為測試策略一部分 |
| `/migrate` | API 遷移時捕獲 legacy response fixture，驗證新實作保持結構性等價 |

### 遷移合約測試（替換實作時）

當 API endpoint 從一個技術棧遷至另一個（PHP → .NET、Express → Spring 等），對 **legacy 參考 fixture** 的 contract test 可捕捉「缺漏欄位」「rename」「層級漂移」等新 DTO 單元測試無法覆蓋的缺陷。詳見 [migration-assistant § API Migration Contract Tests](../migration-assistant/SKILL.md#api-migration-contract-tests--api-遷移合約測試) 取得 fixture 捕獲協議與稽核檢查清單。

## 下一步引導

`/contract-test` 完成後：

> **合約測試引導完成。建議下一步：**
> - 執行 `/ci-cd` 將合約驗證加入 CI 管線
> - 執行 `/api-design` 完善 API 設計
> - 執行 `/testing` 整合到整體測試策略

## 參考

- 詳細指南：[contract-testing.md](../../options/testing/contract-testing.md)
- 相關：[api-design-assistant](../api-design-assistant/SKILL.md)

## AI 代理行為

當 `/contract-test` 被呼叫時：
1. **評估（Assess）** — 詢問架構（單體、微服務、API 數量）
2. **推薦（Recommend）** — 依架構建議策略
3. **引導（Guide）** — 逐步引導所選策略的設定
4. **產生（Generate）** — 建立範例合約測試檔案
5. **驗證（Verify）** — 若為 `verify` 子指令，掃描合約並回報覆蓋率
