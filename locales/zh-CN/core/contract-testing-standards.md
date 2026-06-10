---
source: ../../../core/contract-testing-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: b2b6acbac739
status: current
---

# 契约测试标准（Contract Testing Standards）

> **语言**: [English](../../../core/contract-testing-standards.md) | [繁體中文](../../zh-TW/core/contract-testing-standards.md) | 简体中文

**版本**：1.0.0
**最后更新**：2026-05-05
**适用范围**：具有 API 消费者（服务对服务、前端对后端、公开 API）的项目
**范围**：universal
**行业标准**：消费者驱动契约测试（Consumer-Driven Contract Testing, CDCT）、Pact Specification v3
**参考资料**：[pact.io](https://docs.pact.io/)、[Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract)

---

## 目的

契约测试（Contract testing）验证 provider（API 服务器）与其 consumer（客户端）对于确切接口 —— 请求格式、响应 schema 与状态码 —— 达成共识，且无需双方同时部署。

若缺少契约测试：
- Provider 的变更会在 production 中悄悄破坏 consumer
- 服务之间的集成测试需要完整环境
- API 版本决策在缺乏实际使用证据的情况下做出

本标准将消费者驱动契约测试正式化为一道**发布门禁**（`release-readiness-gate.md` 中的 Dimension 4，Tier-3）。

---

## 消费者驱动契约流程

```
Consumer 撰写交互预期
        ↓
Consumer 将契约发布至 Pact Broker
        ↓
Provider CI 获取 consumer 契约
        ↓
Provider 验证自身能否满足每一笔交互
        ↓
Pact Broker 记录：can-i-deploy 结果
        ↓
发布门禁：provider 部署前所有 consumer 契约必须 GREEN
```

---

## 契约涵盖范围

一份契约涵盖：

| 元素 | 是否必须指定 | 备注 |
|---------|-------------|-------|
| 请求方法（Request method） | 是 | GET / POST / PUT / PATCH / DELETE |
| 请求路径（Request path） | 是 | 包含路径参数（path params） |
| 请求头（Request headers） | 仅必要者 | 不要过度指定可选请求头 |
| 请求 body schema | 是（针对写入操作） | schema 层级，而非字面值 |
| 响应状态（Response status） | 是 | 所有预期的状态码 |
| 响应 body schema | 是 | schema 层级；使用 matcher 而非字面值 |
| 响应头（Response headers） | 仅必要者 | 例如 `Content-Type` |

**宁可不足指定，也不要过度指定。** 只断言 consumer 实际使用到的部分。

---

## 向后兼容窗口

| 发布类型 | 兼容性要求 |
|-------------|--------------------------|
| Patch | 100% 向后兼容；不预期有契约变更 |
| Minor | N-1 consumer 契约版本仍须通过 |
| Major | 需要弃用期；通知 consumer；旧契约归档 |

**破坏性变更政策**：若任何活跃的 consumer 契约呈红色，provider 不得部署（MAY NOT deploy）。破坏性变更需要：
1. 采用仅新增（additive-only）变更的新 provider 版本
2. Consumer 迁移至新版本
3. 旧契约明确标记弃用并归档

---

## 发布门禁准则

| 准则 | 硬性下限 | 警告区间 |
|-----------|-------------|-----------|
| 所有活跃的 consumer 契约 | 100% 绿灯 | —（二元：全有或全无） |
| N-1 向后兼容 | 100% 绿灯 | — |
| 弃用契约清理 | 旧契约于 30 天内归档 | > 30 天 = WARN |

Pact Broker 中的 `can-i-deploy` 命令封装了这道门禁：

```bash
pact-broker can-i-deploy \
  --pacticipant <provider-service> \
  --version <version> \
  --to-environment production
```

退出码（Exit code）0 = PASS；非零 = FAIL（阻断发布）。

---

## 实现指引

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

### Pact Broker 标签

| 标签 | 意义 |
|-----|---------|
| `main` | main 分支的最新版本 |
| `production` | 目前部署于 production 的版本 |
| `<feature-branch>` | 功能分支契约（暂时性） |

---

## 反模式

- **测试整个 API 表面** —— 只测试 consumer 实际使用的部分；过度指定会造成不必要的契约中断
- **字面值比对** —— 使用 schema matcher（`like()`、`eachLike()`、`integer()`）而非精确值；契约应能容忍实际数据的合理变化
- **跳过 provider 验证** —— 发布 consumer 契约却不进行 provider 验证，代表该契约毫无强制效力
- **未执行 `can-i-deploy`** —— 只检查个别契约状态并不足够；`can-i-deploy` 会评估整个部署矩阵

---

## 与其他标准的关系

- **`api-design-standards.md`** —— 契约测试强制执行 API 设计中所声明的向后兼容保证
- **`release-readiness-gate.md`** —— Dimension 4（Tier-3：当存在 API consumer 时适用）
- **`integration-testing.md`** —— 契约测试补足但不取代集成测试
- **`versioning.md`** —— 语义化版本与上述向后兼容窗口互相关联

---

## 另见

- [Pact 文档](https://docs.pact.io/)
- [Can I Deploy](https://docs.pact.io/pact_broker/can_i_deploy)
- [消费者驱动契约（Consumer-Driven Contracts）](https://martinfowler.com/articles/consumerDrivenContracts.html) —— Martin Fowler

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | 初版发布：消费者驱动契约流程、向后兼容窗口、发布门禁准则 |

---

## 授权

本标准依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
