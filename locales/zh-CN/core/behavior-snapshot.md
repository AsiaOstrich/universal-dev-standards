---
source: ../../../core/behavior-snapshot.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 7b2146e4fd6c
status: current
---

# 行为快照标准

> **语言**: [English](../../../core/behavior-snapshot.md) | [繁體中文](../../zh-TW/core/behavior-snapshot.md) | 简体中文

**适用范围**：需要行为一致性验证的迁移与重构项目
**Scope**: universal

---

## 概述

行为快照标准定义了一种黄金文件格式，用于记录现有系统的 HTTP 请求/响应配对。这些快照有两个用途：

1. **迁移一致性基准线** — 验证新系统能重现与旧系统相同的行为
2. **重构特性化** — 在修改代码前锁定现有行为（Gate 0 协议）

## 参考资料

| 标准/来源 | 内容 |
|----------------|---------|
| XSPEC-201 | 重构/迁移完整性协议 |
| Michael Feathers: *Working Effectively with Legacy Code* | 特性化测试概念 |
| Golden Master Testing | 记录并重放预期输出的模式 |

---

## 快照文件格式

### 位置

```
.snapshots/<feature-id>/<scenario>.json
```

### Schema

```json
{
  "feature_id": "FM-007",
  "scenario": "happy_path",
  "request": {
    "method": "POST",
    "path": "/api/orders/123/cancel",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "reason": "customer_request"
    }
  },
  "response": {
    "status": 200,
    "body": {
      "success": true,
      "order_status": "cancelled",
      "refund_initiated": true
    }
  },
  "ignore_fields": ["refund_id", "cancelled_at"]
}
```

### 字段参考

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `feature_id` | 是 | feature-manifest.yaml 中的 `FM-NNN` |
| `scenario` | 是 | `snake_case` 场景名称（`happy_path`、`not_found` 等） |
| `request.method` | 是 | HTTP 方法 |
| `request.path` | 是 | 不含 base URL 的 URL 路径 |
| `request.headers` | 否 | 请求所需的请求头（不含真实认证 token） |
| `request.body` | 否 | 请求体（JSON） |
| `response.status` | 是 | 预期的 HTTP 状态码 |
| `response.body` | 是 | 预期的响应体（比较用字段） |
| `ignore_fields` | 否 | 比较时跳过的字段（详见下方指南） |

---

## 目录结构

```
.snapshots/
  FM-001-UserLogin/
    happy_path.json
    invalid_credentials.json
    account_locked.json
  FM-007-OrderCancellation/
    happy_path.json
    order_not_found.json
    order_already_cancelled.json
    MANUAL-refund_webhook.json     ← 手动编写
```

### MANUAL- 前缀

以 `MANUAL-` 为前缀的文件包含无法自动录制的快照：
- 由第三方触发的 Webhook 端点
- 需要特定、难以重现的数据库状态的场景
- 后台任务 / 队列触发流程（非 HTTP 入口点）

`MANUAL-` 文件不纳入自动重放，但计入覆盖率报告。

---

## `ignore_fields` 使用指南

### 始终忽略（非确定性）

| 字段模式 | 原因 |
|--------------|--------|
| `created_at`、`updated_at`、`timestamp` | 每次请求都会改变 |
| `token`、`session_id`、`csrf_token` | 密码学随机值 |
| `request_id`、`trace_id`、`correlation_id` | 随机 UUID |

### 始终比较（业务逻辑）

| 字段模式 | 原因 |
|--------------|--------|
| `status`、`code`、`message`、`error_code` | 核心业务结果 |
| `order_status`、`payment_status` | 状态机结果 |
| `amount`、`quantity`、`price` | 计算后的业务数值 |
| `success`、`refunded`、`cancelled` | 布尔业务结果 |
| `user_id`、`order_id`（搭配固定测试数据） | 引用完整性 |

**规则**：`ignore_fields` 仅用于确实不确定性的值。用它来隐藏业务逻辑差异，会使一致性测试失去意义。

---

## 一致性检查工具

执行 `scripts/parity-check.ts` 对目标系统重放所有快照：

```bash
npx tsx scripts/parity-check.ts --url http://new-system:8080 [--snapshots .snapshots] [--env uat|staging]
```

### 输出示例

```
🔄 Parity Check — 119 snapshots against http://new-system:8080

  ✅ FM-001 / happy_path
  ✅ FM-001 / invalid_credentials
  ❌ [PARITY-FAIL] FM-007 / happy_path
      body.order_status: expected "cancelled", got "pending"
      body.refund_initiated: expected true, got false

─────────────────────────────────
Parity Results: 118/119 passed (99.2%)

❌ 1 parity check(s) failed.
[PARITY-BLOCK] UAT/production deployment blocked. Fix parity failures first.
```

### 退出码

| 代码 | 含义 |
|------|---------|
| 0 | 所有快照通过 |
| 1 | 发现失败 + `--env uat` 或 `production` → 部署被阻止 |
| 2 | 发现失败 + `--env staging` → 仅警告 |

---

## Gate 0：特性化测试协议（重构）

在开始任何重构之前，特性化测试必须存在且通过。

### 什么是特性化测试？

特性化测试记录现有代码*实际的行为*——而非它*应有的行为*。它们在修改开始前锁定可观察的行为。若重构期间特性化测试失败，代表行为发生了非预期的变更。

```typescript
describe('characterization: OrderService.cancelOrder', () => {
  // @characterization
  it('returns status cancelled and sets refund_initiated=true for valid order', async () => {
    const result = await orderService.cancelOrder('test-order-123', 'customer_request');
    expect(result.order_status).toBe('cancelled');
    expect(result.refund_initiated).toBe(true);
  });
});
```

### Gate 0 强制执行

1. **第一次重构 commit 前**：执行 `npm test -- --grep characterization`
   - 任何失败 → 停止。先修复现有代码，再进行修改。
2. **重构期间**：每次 commit 重新执行特性化测试
   - 任何失败 → 立即警告行为偏移
3. **Gate 2（完成）**：所有特性化测试通过 → 重构完成

### 反模式警告

> 绝不要在没有 Gate 0 的情况下开始重构。一旦开始修改代码，就无法判断测试失败究竟是「我破坏了某些东西」还是「测试对旧行为的描述有误」。

---

## 与迁移 Pipeline 集成

### Gate 1 预飞行（`--variant migration`）

在执行 `/vo-pipeline --variant migration` 之前：
1. `artifacts/feature-manifest.yaml` 必须存在
2. `.snapshots/` 必须包含每个功能至少一个快照

### 一致性闸门（UAT 前）

所有功能实现完成后，执行一致性检查：
- 要求 100% 通过率（不含 `MANUAL-` 文件）
- 任何失败皆阻止 UAT 晋升

---

## 反模式

| 反模式 | 影响 | 正确做法 |
|--------------|--------|------------------|
| 过度使用 `ignore_fields` | 隐藏业务逻辑差异 | 仅忽略非确定性字段 |
| 跳过 MANUAL 快照 | Webhook/后台行为未测试 | UAT 前先编写 MANUAL 快照 |
| 从损坏的系统录制快照 | 基准线错误 | 录制前先验证旧系统行为 |
| 特性化测试缺少 `@characterization` | Gate 0 找不到它们 | 一律加上 `@characterization` 标记 |
| 未进行 Gate 0 就开始重构 | 无法检测行为偏移 | 先跑特性化测试，始终如此 |

---

## 相关标准

- [功能清单标准](../../../core/feature-manifest-standard.md) — 功能清单中 FM-NNN 的 schema
- [验收条件追踪](../../../core/acceptance-criteria-traceability.md) — `not_implemented` AC 状态
- [重构标准](../../../core/refactoring-standards.md) — 特性化测试需求
- [测试标准](../../../core/testing-standards.md) — 测试实现标准

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | 初始版本 — 快照 schema、一致性闸门、Gate 0 特性化协议（XSPEC-201） |
