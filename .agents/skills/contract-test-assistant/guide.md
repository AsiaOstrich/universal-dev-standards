---
source: ../../../../skills/contract-test-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: fcc8d98bc6bf
status: current
scope: universal
description: |
  合約測試策略與實作指南。
  使用時機：詳細的合約測試設定、Pact/OpenAPI 配置、CI 整合。
  關鍵字：contract test, Pact, OpenAPI, consumer, provider, 合約測試, API 合約.
---

# 合約測試助手指南

> **語言**: [English](../../../../skills/contract-test-assistant/guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-26
**適用範圍**: 所有具有 API 整合的專案
**Scope**: universal
**類型**: 標準支援技能（選項標準：contract-testing.md）

---

## 目的

當系統成長為微服務架構或與第三方 API 整合時，整合測試會變得緩慢、脆弱且難以維護。合約測試透過獨立驗證 API 約定來解決這個問題，讓團隊不必啟動所有服務也能有信心地部署。

---

## 決策指南

```
Do you own both consumer and provider?
├── Yes → Consumer-Driven (Pact)
├── No, provider is third-party → Provider-Driven (OpenAPI)
└── Mixed → Bi-Directional (Pact + OpenAPI)
```

### 消費者驅動合約（Pact）

最適合團隊同時擁有兩端的情況。由消費者定義期望。

```
Consumer writes test → Generates contract (pact file) → Provider verifies
```

### 提供者驅動合約（OpenAPI）

最適合公開 API。由提供者定義合約。

```
Provider writes OpenAPI spec → Consumer generates client → Both verify
```

---

## 快速入門範例

### Pact（JavaScript）

```typescript
// Consumer test
const interaction = {
  uponReceiving: 'a request for user by ID',
  withRequest: { method: 'GET', path: '/users/1' },
  willRespondWith: {
    status: 200,
    body: { id: 1, name: like('John') }
  }
};
```

### OpenAPI 驗證

```yaml
# openapi.yaml
paths:
  /users/{id}:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

---

## 參考

- 詳細標準：[contract-testing.md](../../../../options/testing/contract-testing.md)
- 技能定義：[SKILL.md](./SKILL.md)
