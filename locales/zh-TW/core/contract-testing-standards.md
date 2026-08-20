---
source: ../../../core/contract-testing-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-23
source_hash: b2b6acbac739
---

# 合約測試標準（Contract Testing Standards）

> **語言**：[English](../../../core/contract-testing-standards.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-05-05
**適用範圍**：具有 API 消費者（服務對服務、前端對後端、公開 API）的專案
**範疇**：universal
**業界標準**：消費者驅動合約測試（Consumer-Driven Contract Testing, CDCT）、Pact Specification v3
**參考資料**：[pact.io](https://docs.pact.io/)、[Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract)

---

## 目的

合約測試（Contract testing）驗證 provider（API 伺服器）與其 consumer（用戶端）對於確切介面 —— 請求格式、回應 schema 與狀態碼 —— 達成共識，且無需雙方同時部署。

若缺少合約測試：
- Provider 的變更會在 production 中悄悄破壞 consumer
- 服務之間的整合測試需要完整環境
- API 版本決策在缺乏實際使用證據的情況下做出

本標準將消費者驅動合約測試正式化為一道**發布閘門**（`release-readiness-gate.md` 中的 Dimension 4，Tier-3）。

---

## 消費者驅動合約流程

```
Consumer 撰寫互動預期
        ↓
Consumer 將合約發布至 Pact Broker
        ↓
Provider CI 取得 consumer 合約
        ↓
Provider 驗證自身能否滿足每一筆互動
        ↓
Pact Broker 記錄：can-i-deploy 結果
        ↓
發布閘門：provider 部署前所有 consumer 合約必須 GREEN
```

---

## 合約涵蓋範圍

一份合約涵蓋：

| 元素 | 是否必須指定 | 備註 |
|---------|-------------|-------|
| 請求方法（Request method） | 是 | GET / POST / PUT / PATCH / DELETE |
| 請求路徑（Request path） | 是 | 包含路徑參數（path params） |
| 請求標頭（Request headers） | 僅必要者 | 不要過度指定可選標頭 |
| 請求 body schema | 是（針對寫入操作） | schema 層級，而非字面值 |
| 回應狀態（Response status） | 是 | 所有預期的狀態碼 |
| 回應 body schema | 是 | schema 層級；使用 matcher 而非字面值 |
| 回應標頭（Response headers） | 僅必要者 | 例如 `Content-Type` |

**寧可不足指定，也不要過度指定。** 只斷言 consumer 實際使用到的部分。

---

## 向後相容視窗

| 發布類型 | 相容性要求 |
|-------------|--------------------------|
| Patch | 100% 向後相容；不預期有合約變更 |
| Minor | N-1 consumer 合約版本仍須通過 |
| Major | 需要棄用期；通知 consumer；舊合約歸檔 |

**破壞性變更政策**：若任何作用中的 consumer 合約呈紅色，provider 不得部署（MAY NOT deploy）。破壞性變更需要：
1. 採用僅新增（additive-only）變更的新 provider 版本
2. Consumer 遷移至新版本
3. 舊合約明確標示棄用並歸檔

---

## 發布閘門準則

| 準則 | 硬性下限 | 警告區間 |
|-----------|-------------|-----------|
| 所有作用中的 consumer 合約 | 100% 綠燈 | —（二元：全有或全無） |
| N-1 向後相容 | 100% 綠燈 | — |
| 棄用合約清理 | 舊合約於 30 天內歸檔 | > 30 天 = WARN |

Pact Broker 中的 `can-i-deploy` 指令封裝了這道閘門：

```bash
pact-broker can-i-deploy \
  --pacticipant <provider-service> \
  --version <version> \
  --to-environment production
```

結束碼（Exit code）0 = PASS；非零 = FAIL（阻擋發布）。

---

## 實作指引

### Consumer 端

```typescript
// Pact consumer test (TypeScript example)
const interaction = {
  state: "user 42 exists",
  uponReceiving: "a request for user 42",
  withRequest: {
    method: "GET",
    path: "/users/42",
    headers: { Accept: "application/json" },
  },
  willRespondWith: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: like({           // schema matcher, not literal
      id: integer(),
      name: string(),
      email: email(),
    }),
  },
};
```

### Provider 端

```bash
# Provider verification in CI
PACT_BROKER_BASE_URL=https://pact-broker.internal \
PACT_PROVIDER_VERSION=$GIT_SHA \
npm run test:pact:provider
```

### Pact Broker 標籤

| 標籤 | 意義 |
|-----|---------|
| `main` | main 分支的最新版本 |
| `production` | 目前部署於 production 的版本 |
| `<feature-branch>` | 功能分支合約（暫時性） |

---

## 反模式

- **測試整個 API 表面** —— 只測試 consumer 實際使用的部分；過度指定會造成不必要的合約中斷
- **字面值比對** —— 使用 schema matcher（`like()`、`eachLike()`、`integer()`）而非精確值；合約應能容忍實際資料的合理變化
- **略過 provider 驗證** —— 發布 consumer 合約卻不進行 provider 驗證，代表該合約毫無強制效力
- **未執行 `can-i-deploy`** —— 只檢查個別合約狀態並不足夠；`can-i-deploy` 會評估整個部署矩陣

---

## 與其他標準的關係

- **`api-design-standards.md`** —— 合約測試強制執行 API 設計中所宣告的向後相容保證
- **`release-readiness-gate.md`** —— Dimension 4（Tier-3：當存在 API consumer 時適用）
- **`integration-testing.md`** —— 合約測試補足但不取代整合測試
- **`versioning.md`** —— 語意化版本與上述向後相容視窗互相關聯

---

## 另見

- [Pact 文件](https://docs.pact.io/)
- [Can I Deploy](https://docs.pact.io/pact_broker/can_i_deploy)
- [消費者驅動合約（Consumer-Driven Contracts）](https://martinfowler.com/articles/consumerDrivenContracts.html) —— Martin Fowler

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | 初版發布：消費者驅動合約流程、向後相容視窗、發布閘門準則 |

---

## 授權

本標準依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
