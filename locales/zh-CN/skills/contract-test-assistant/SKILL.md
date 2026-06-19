---
source: ../../../../skills/contract-test-assistant/SKILL.md
source_version: 1.0.0
source_hash: f67623eb913a
translation_version: 1.0.0
last_synced: 2026-06-01
status: current
description: |
  [UDS] 引导 API 和微服务的契约测试策略。
  使用时机：API 契约、微服务、消费者驱动测试。
  关键字：contract test, Pact, OpenAPI, 契约测试。
---

# 契约测试助手

> **语言**: [English](../../../../skills/contract-test-assistant/SKILL.md) | 简体中文

引导 API 和微服务的契约测试策略选择、设置和验证。

## 什么是契约测试？

契约测试通过测试消费者和提供者之间的协议（契约）来验证服务间的通信正确性，不需要所有服务同时运行。

## 策略选择

| 策略 | 适用场景 | 工具 |
|------|---------|------|
| **消费者驱动（Consumer-Driven）** | 内部微服务，团队同时拥有两端 | Pact |
| **提供者驱动（Provider-Driven）** | 公开 API，OpenAPI 优先设计 | OpenAPI + Prism |
| **双向（Bi-Directional）** | 混合所有权，渐进采用 | Pact + OpenAPI |

## 工作流程

```
ASSESS ──► CHOOSE ──► DEFINE ──► IMPLEMENT ──► VERIFY
  评估架构    选择策略    定义契约     实现测试      验证契约
```

### 1. ASSESS — 评估架构
- 有多少服务互相通信？
- 谁拥有消费者端、谁拥有提供者端？

### 2. CHOOSE — 选择策略
- 消费者驱动（Pact）vs 提供者驱动（OpenAPI）

### 3. DEFINE — 定义契约
- 编写消费者期望或 OpenAPI 规格

### 4. IMPLEMENT — 实现测试
- 消费者测试生成契约
- 提供者测试验证契约

### 5. VERIFY — 执行验证
- CI 流水线在每个 PR 上验证契约

## 指令

| 指令 | 说明 |
|------|------|
| `/contract-test` | 交互式策略选择 |
| `/contract-test consumer` | 引导消费者测试设置 |
| `/contract-test provider` | 引导提供者测试设置 |
| `/contract-test verify` | 检查契约覆盖率 |

## 契约覆盖率报告

```markdown
## 契约覆盖率报告

| 消费者 | 提供者 | 端点 | 状态 |
|--------|--------|------|------|
| web-app | user-api | GET /users/:id | ✅ 已验证 |
| web-app | user-api | POST /users | ✅ 已验证 |
| mobile-app | auth-api | POST /login | ⚠️ 仅消费者端 |
| admin-ui | report-api | GET /reports | ❌ 无契约 |

**覆盖率**：50%（2/4 个端点两端均验证）
```

## 与其他技能的集成

| 技能 | 集成方式 |
|------|---------|
| `/api-design` | 设计时定义 API 契约 |
| `/ci-cd` | 流水线中加入契约验证 |
| `/testing` | 契约测试作为测试策略一部分 |
| `/migrate` | API 迁移时捕获 legacy response fixture，验证新实现保持结构性等价 |

### 迁移契约测试（替换实现时）

当 API endpoint 从一个技术栈迁移至另一个（PHP → .NET、Express → Spring 等），对 **legacy 参考 fixture** 的 contract test 可捕捉「缺失字段」「rename」「层级漂移」等新 DTO 单元测试无法覆盖的缺陷。详见 [migration-assistant § API Migration Contract Tests](../../../../skills/migration-assistant/SKILL.md#api-migration-contract-tests--api-遷移合約測試) 获取 fixture 捕获协议与审计检查清单。

## 下一步引导

`/contract-test` 完成后：

> **契约测试引导完成。建议下一步：**
> - 执行 `/ci-cd` 将契约验证加入 CI 流水线
> - 执行 `/api-design` 完善 API 设计
> - 执行 `/testing` 集成到整体测试策略

## 参考

- 详细指南：[contract-testing.md](../../options/testing/contract-testing.md)
- 相关：[api-design-assistant](../api-design-assistant/SKILL.md)

## AI 代理行为

当 `/contract-test` 被调用时：
1. **评估（Assess）** — 询问架构（单体、微服务、API 数量）
2. **推荐（Recommend）** — 依架构建议策略
3. **引导（Guide）** — 逐步引导所选策略的设置
4. **生成（Generate）** — 创建示例契约测试文件
5. **验证（Verify）** — 若为 `verify` 子指令，扫描契约并报告覆盖率
