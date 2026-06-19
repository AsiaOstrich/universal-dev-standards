---
source: options/testing/contract-testing.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Contract Testing

> **语言**: [English](../../../../options/testing/contract-testing.md) | 简体中文

**上层标准**: [Testing Completeness](../../core/test-completeness-dimensions.md)

---

## 概览

Contract testing 通过测试 consumer 与 provider 之间的协议（contract）来验证服务能否正确通信。它让团队可以独立开发与部署，同时确保彼此兼容。

## 最适用于

- 微服务架构
- API-first 开发
- 第三方集成
- 各自独立工作的团队
- 分布式系统

## Contract 类型

### Consumer-Driven Contracts (CDC)

由 API consumer 定义的 contract。

**流程：**
1. Consumer 定义预期的交互
2. 生成 contract（pact 文件）
3. Provider 依 contract 进行验证
4. 部署前双方都必须通过

**好处：**
- 由 consumer 的需求驱动 API 设计
- 解耦的部署
- 提早检测集成问题

### Provider Contracts

由 API provider 定义的 contract。

**使用场景：** 公开 API、OpenAPI-first 设计

**流程：**
1. Provider 定义 API 规格
2. Consumer 依规格进行测试
3. Provider 确保向后兼容性

## 工具

| 工具 | 类型 | 语言 |
|------|------|-----------|
| **Pact** | Consumer-driven | 多语言 |
| **Spring Cloud Contract** | 两者皆可 | JVM |
| **Dredd** | OpenAPI | 多语言 |
| **Prism** | Mock | 多语言 |

## Pact 工作流程

### Consumer 端

**1. 定义交互**

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

**2. 执行 consumer 测试** - 测试针对 mock provider 执行

**3. 发布 contract** - 将 pact 文件上传至 broker

### Provider 端

**1. 获取 contract** - 从 broker 下载 contract

**2. 验证 contract**

```javascript
verifier.verifyProvider({
  provider: 'UserService',
  pactBrokerUrl: 'https://broker.example.com',
  publishVerificationResult: true
});
```

**3. State 设置** - 为每个交互设置 provider state

## Pact Broker

contract 的集中式存储库，具备以下功能：

- Contract 存储
- 验证状态
- 依赖关系图
- Can-I-Deploy 检查
- 供 CI/CD 使用的 Webhook

### Can-I-Deploy

检查部署是否安全：

```bash
pact-broker can-i-deploy \
  --pacticipant UserService \
  --version $(git rev-parse HEAD) \
  --to production
```

## CI 集成

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

### GitHub Actions 示例

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

## 规则

| 规则 | 说明 | 优先级 |
|------|-------------|----------|
| Consumer 优先 | 从 consumer 需求出发，而非 provider 实现 | 建议 |
| 使用 matcher | 使用类型 matcher（like、eachLike）而非精确值 | 必需 |
| Provider state | 为每个交互定义清晰的 provider state | 必需 |
| 为 contract 加版本 | 以 consumer 版本与分支为 contract 加上标签 | 必需 |
| Can-I-Deploy | 一律在 CI/CD 中执行 can-i-deploy 检查 | 必需 |
| 破坏性变更 | 进行破坏性变更前先与 consumer 团队协调 | 必需 |
| 异步 contract | 为异步通信纳入 message contract | 建议 |

## 快速参考

### 工作流程

| 步骤 | Consumer | Provider |
|------|----------|----------|
| 1. 定义 | 编写预期 | 实现 API |
| 2. 测试 | 针对 mock 执行 | 验证 contract |
| 3. 发布 | 上传 pact | 上传结果 |
| 4. 部署 | Can-I-Deploy | Can-I-Deploy |

### 好处

| 好处 | 说明 |
|---------|-------------|
| 快速反馈 | 不需要完整的集成环境 |
| 解耦 | 团队可以独立工作 |
| 安全部署 | Can-I-Deploy 防止破坏性变更 |
| 活文档 | Contract 记录了 API 行为 |

## 相关选项

- [Integration Testing](./integration-testing.md) - 组件集成测试
- [E2E Testing](./e2e-testing.md) - 端到端测试

---

## 参考资料

- [Pact Foundation](https://docs.pact.io/)
- [Martin Fowler - Contract Test](https://martinfowler.com/bliki/ContractTest.html)
- [Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
