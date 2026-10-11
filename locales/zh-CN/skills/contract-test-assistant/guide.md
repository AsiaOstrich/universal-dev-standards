---
source: ../../../../skills/contract-test-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: fcc8d98bc6bf
status: current
---

# 合约测试助手指南

> **语言**: [English](../../../../skills/contract-test-assistant/guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-26
**适用范围**: 所有具有 API 集成的项目
**Scope**: universal
**类型**: 标准支撑技能（选项：contract-testing.md）

---

## 目的

当系统发展为微服务或与第三方 API 集成时，集成测试会变得缓慢、脆弱且难以维护。合约测试通过独立验证 API 约定来解决这个问题，让团队无需运行所有服务即可放心部署。

---

## 决策指南

```
Do you own both consumer and provider?
├── Yes → Consumer-Driven (Pact)
├── No, provider is third-party → Provider-Driven (OpenAPI)
└── Mixed → Bi-Directional (Pact + OpenAPI)
```

### 消费者驱动合约（Pact）

最适合团队同时拥有双方的情况。由消费者定义期望。

```
Consumer writes test → Generates contract (pact file) → Provider verifies
```

### 提供者驱动合约（OpenAPI）

最适合公开 API。由提供者定义合约。

```
Provider writes OpenAPI spec → Consumer generates client → Both verify
```

---

## 快速入门示例

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

### OpenAPI 验证

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

## 参考

- 详细标准：[contract-testing.md](../../../../options/testing/contract-testing.md)
- 技能定义：[SKILL.md](./SKILL.md)
