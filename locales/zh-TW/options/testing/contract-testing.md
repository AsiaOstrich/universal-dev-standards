---
source: options/testing/contract-testing.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Contract Testing

> **語言**: [English](../../../../options/testing/contract-testing.md) | 繁體中文

**上層標準**: [Testing Completeness](../../core/test-completeness-dimensions.md)

---

## 概觀

Contract testing 透過測試 consumer 與 provider 之間的協議（contract）來驗證服務能否正確通訊。它讓團隊可以獨立開發與部署，同時確保彼此相容。

## 最適用於

- 微服務架構
- API-first 開發
- 第三方整合
- 各自獨立作業的團隊
- 分散式系統

## Contract 類型

### Consumer-Driven Contracts (CDC)

由 API consumer 定義的 contract。

**流程：**
1. Consumer 定義預期的互動
2. 產生 contract（pact 檔案）
3. Provider 依 contract 進行驗證
4. 部署前雙方都必須通過

**好處：**
- 由 consumer 的需求驅動 API 設計
- 解耦的部署
- 提早偵測整合問題

### Provider Contracts

由 API provider 定義的 contract。

**使用情境：** 公開 API、OpenAPI-first 設計

**流程：**
1. Provider 定義 API 規格
2. Consumer 依規格進行測試
3. Provider 確保向後相容性

## 工具

| 工具 | 類型 | 語言 |
|------|------|-----------|
| **Pact** | Consumer-driven | 多語言 |
| **Spring Cloud Contract** | 兩者皆可 | JVM |
| **Dredd** | OpenAPI | 多語言 |
| **Prism** | Mock | 多語言 |

## Pact 工作流程

### Consumer 端

**1. 定義互動**

```javascript
const interaction = {
  state: 'user exists',
  uponReceiving: 'a request for user by id',
  withRequest: {
    method: 'GET',
    path: '/users/1',
    headers: { Accept: 'application/json' }
  },
  willRespondWith: {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      id: like(1),
      name: like('John'),
      email: like('john@example.com')
    }
  }
};
```

**2. 執行 consumer 測試** - 測試針對 mock provider 執行

**3. 發布 contract** - 將 pact 檔案上傳至 broker

### Provider 端

**1. 取得 contract** - 從 broker 下載 contract

**2. 驗證 contract**

```javascript
verifier.verifyProvider({
  provider: 'UserService',
  pactBrokerUrl: 'https://broker.example.com',
  publishVerificationResult: true
});
```

**3. State 設定** - 為每個互動設定 provider state

## Pact Broker

contract 的集中式儲存庫，具備以下功能：

- Contract 儲存
- 驗證狀態
- 相依關係圖
- Can-I-Deploy 檢查
- 供 CI/CD 使用的 Webhook

### Can-I-Deploy

檢查部署是否安全：

```bash
pact-broker can-i-deploy \
  --pacticipant UserService \
  --version $(git rev-parse HEAD) \
  --to production
```

## CI 整合

### Consumer Pipeline

```yaml
stages:
  - test:
      - Run unit tests
      - Run contract tests (generates pact)
  - publish:
      - Publish pact to broker
  - can-i-deploy:
      - Check deployment safety
  - deploy:
      - Deploy consumer
```

### Provider Pipeline

```yaml
stages:
  - test:
      - Run unit tests
      - Verify consumer contracts
  - publish:
      - Publish verification results
  - can-i-deploy:
      - Check deployment safety
  - deploy:
      - Deploy provider
```

### GitHub Actions 範例

```yaml
name: Consumer Contract Tests
on: [push, pull_request]
jobs:
  contract-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run contract tests
        run: npm run test:contract
      - name: Publish pact
        run: npm run pact:publish
      - name: Can I deploy?
        run: |
          pact-broker can-i-deploy \
            --pacticipant MyConsumer \
            --version ${{ github.sha }}
```

## 規則

| 規則 | 說明 | 優先級 |
|------|-------------|----------|
| Consumer 優先 | 從 consumer 需求出發，而非 provider 實作 | 建議 |
| 使用 matcher | 使用型別 matcher（like、eachLike）而非精確值 | 必要 |
| Provider state | 為每個互動定義清楚的 provider state | 必要 |
| 為 contract 加版本 | 以 consumer 版本與分支為 contract 加上標籤 | 必要 |
| Can-I-Deploy | 一律在 CI/CD 中執行 can-i-deploy 檢查 | 必要 |
| 破壞性變更 | 進行破壞性變更前先與 consumer 團隊協調 | 必要 |
| 非同步 contract | 為非同步通訊納入 message contract | 建議 |

## 快速參考

### 工作流程

| 步驟 | Consumer | Provider |
|------|----------|----------|
| 1. 定義 | 撰寫預期 | 實作 API |
| 2. 測試 | 針對 mock 執行 | 驗證 contract |
| 3. 發布 | 上傳 pact | 上傳結果 |
| 4. 部署 | Can-I-Deploy | Can-I-Deploy |

### 好處

| 好處 | 說明 |
|---------|-------------|
| 快速回饋 | 不需要完整的整合環境 |
| 解耦 | 團隊可以獨立作業 |
| 安全部署 | Can-I-Deploy 防止破壞性變更 |
| 活文件 | Contract 記錄了 API 行為 |

## 相關選項

- [Integration Testing](./integration-testing.md) - 元件整合測試
- [E2E Testing](./e2e-testing.md) - 端對端測試

---

## 參考資料

- [Pact Foundation](https://docs.pact.io/)
- [Martin Fowler - Contract Test](https://martinfowler.com/bliki/ContractTest.html)
- [Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
