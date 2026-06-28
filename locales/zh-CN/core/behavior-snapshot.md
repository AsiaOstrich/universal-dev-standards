---
source: ../../../core/behavior-snapshot.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-06-28
source_hash: 36a3683ae75b
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

> **核心原则 —— 忽略「值」，保留「格式」断言。** 某字段是非确定性的，意指它的*值*在每次执行间会改变；这**并不**代表该字段的*形状*可以自由变动。`ignore_fields` 的天真用法会把整个字段排除在比较之外，连带也停止断言其格式 —— 于是当序列化器悄悄把 ISO-8601 时间戳改成 Unix epoch、拿掉时区、或变更 UUID 大小写／版本时，皆无人察觉。**忽略其值，但仍断言其格式。**

### 忽略值 vs. 忽略格式

| 字段 | 天真做法：整字段忽略 | 建议做法：忽略值、断言格式 |
|-------|---------------------------|-------------------------------------------|
| `created_at` | 完全不比较 | 忽略其值；但仍断言它是 ISO-8601、且维持相同的小数秒精度与相同的时区表示 |
| `trace_id` | 完全不比较 | 忽略其值；但仍断言它符合 UUID 版本与标准 8-4-4-4-12 形状 |
| `token` | 完全不比较 | 忽略其值；但仍断言长度、字符集与前缀 |

### 非确定性字段：忽略值、断言格式

| 字段模式 | 忽略（值） | 仍须断言（格式／形状） |
|--------------|--------------------|-------------------------------|
| `created_at`、`updated_at`、`timestamp` | 该瞬时 | ISO-8601 vs. epoch vs. 自定义；小数秒精度（位数）；时区表示（`Z` vs `+00:00` vs 偏移量） |
| `token`、`session_id`、`csrf_token` | 随机字节 | 长度、字符集、前缀 |
| `request_id`、`trace_id`、`correlation_id` | 随机 UUID | UUID 版本 + 标准 8-4-4-4-12 形状与大小写 |

**时间字段示例。** 某迁移后的端点返回 `created_at`：

```text
旧系统："2026-05-12T08:30:00Z"
新系统："2026-05-12T08:30:00.000+00:00"
```

两者解码后是同一瞬时，因此整字段忽略 —— 甚至是「先 parse 成日期再比值」 —— 都会通过。但**序列化格式已漂移**：多了小数秒、且时区表示从 `Z` 变成 `+00:00`。对采字符串比对、或以严格格式 parse 的客户端而言，这在正式环境会坏掉。断言格式 pattern（例如 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$`）能抓到它；整字段忽略则会遮蔽它。

### 始终比较（业务逻辑）

| 字段模式 | 原因 |
|--------------|--------|
| `status`、`code`、`message`、`error_code` | 核心业务结果 |
| `order_status`、`payment_status` | 状态机结果 |
| `amount`、`quantity`、`price` | 计算后的业务数值 |
| `success`、`refunded`、`cancelled` | 布尔业务结果 |
| `user_id`、`order_id`（搭配固定测试数据） | 引用完整性 |

### 整字段忽略（例外 —— 须附理由）

把字段完全排除在比较之外 —— 既不比值、**也不**断言格式 —— 是**例外**，非默认。仅在字段格式确实未定义或无关紧要时保留此做法（例如不透明的厂商 blob），并在行内注明理由。

> ⚠️ **风险**：整字段忽略会遮蔽**格式漂移**。改变精度或时区的时间戳、改变版本的 UUID、或多了／少了一个尾零的数字都会悄悄通过 —— 而这正是一致性测试本应抓到的那类 bug。

**规则**：`ignore_fields` 仅用于确实不确定性的*值*。忽略其值的同时，仍须断言该字段的格式／形状。用它来排除业务逻辑字段 —— 或用它来消音非确定性字段的格式漂移 —— 都会使一致性测试失去意义。

---

## 序列化格式对等

只比较**反序列化后对象**的差分 oracle，会悄悄把序列化层级的差异 normalize 掉：它把两边的响应都 parse 成 map／对象再比较，于是任何在 parse 后消失的分歧都看不见了。要抓到序列化 bug，oracle 必须以能保留序列化形式的粒度比较 —— 要么比对**原始序列化字符串**，要么明确断言 JSON 形状。

### 比较反序列化对象会遮蔽什么

| 序列化分歧 | 比较 parse 后对象时会被遮蔽吗？ |
|--------------------------|------------------------------------------|
| `1` vs `1.0`（数字格式） | 会 —— 两者都 parse 成数字 `1` |
| `null` vs 缺少该 key | 会 —— 两者都读成不存在／null |
| `true` vs `1` vs `"true"` | 常会 —— 类型强制转换后 |
| key 排序 | 会 —— 对象 key 无序 |
| 前导零／科学记数法 | 会 —— parse 时被 normalize |
| 空白与 Unicode 转义（`\/`、`\uXXXX`） | 会 —— parse 时丢失 |

### 两种策略

1. **原始字符串比对** —— 比对精确的序列化字符串。保真度最强；当 wire 格式属于契约一部分时采用（公开 API、被缓存的 payload、签名过的 body）。
2. **明确的 JSON 形状断言** —— 当原始比对太严格时（例如确实有非确定性的值），改为明确断言形状：
   - **key 的存在性与顺序**（当顺序属于契约时）
   - **数字格式**：`1` vs `1.0`、前导零、科学记数法
   - **`null` vs 缺漏 key**（省略字段不等于明确的 `null`）
   - **布尔／字符串类型**：`true` vs `"true"` vs `1`

### 跨语言重写会换掉序列化器

当系统以另一种语言重写时，序列化器会换 —— 而各序列化器的**默认行为**不同。oracle 必须明确断言这些，因为没有其他东西会帮你抓。PHP `json_encode` ↔ C# `System.Text.Json` 常见的默认差异：

| 关注点 | PHP `json_encode`（默认） | C# `System.Text.Json`（默认） |
|---------|------------------------------|----------------------------------|
| 数字尾零 | `(float) 1.0` 输出 `1`；需 `JSON_PRESERVE_ZERO_FRACTION` 才保留 `1.0` | `double` `1.0` 序列化成 `1`；`decimal` 保留小数位 |
| 日期／时间 | 无原生日期类型 —— 由应用决定（常是自定义字符串或 epoch） | `DateTime`/`DateTimeOffset` → ISO-8601（round-trip "O"），例如 `2026-05-12T08:30:00+00:00` |
| 时区 | 由应用决定 | `DateTimeOffset` 保留偏移量；`DateTime.Kind` 决定 `Z` vs 偏移量 |
| `null` 属性 | 以 `"k":null` 输出 | 默认输出；仅在 `DefaultIgnoreCondition.WhenWritingNull` 时省略 |
| key 排序 | 插入顺序（associative array） | 属性声明／反射顺序 |
| 斜杠与 Unicode 转义 | 默认转义 `/` 与非 ASCII，除非设 `JSON_UNESCAPED_SLASHES` / `JSON_UNESCAPED_UNICODE` | 不转义 `/`；非 ASCII 依所配置的 encoder 转义 |

### 断言序列化形状（TypeScript）

```typescript
// 超越值的对等：断言序列化形式，而不只是 parse 后的对象。
function assertSerializationParity(oldRaw: string, newRaw: string): void {
  // 1. 最强：精确的序列化字符串（只剥除被忽略的*值*之后）。
  if (oldRaw === newRaw) return;

  // 2. 否则在原始文本上明确断言形状，而非在 JSON.parse() 上：
  //    数字格式 —— 旧的 "1.0" 不可悄悄变成新的 "1"
  const numberShape = (s: string) => s.match(/:\s*-?\d+(\.\d+)?([eE][+-]?\d+)?/g) ?? [];
  expect(numberShape(newRaw)).toEqual(numberShape(oldRaw));

  //    null vs 缺漏 —— 明确的 "key":null 不可消失
  expect(/"refund_id"\s*:\s*null/.test(newRaw))
    .toBe(/"refund_id"\s*:\s*null/.test(oldRaw));
}
```

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
| 只比较反序列化后的对象 | 序列化格式 bug（数字格式、`null` vs 缺漏 key、key 排序、类型强制转换）在 parse 时被 normalize 掉 | 比对原始序列化字符串，或明确断言 JSON 形状（见「序列化格式对等」） |
| 对非确定性字段采整字段 `ignore_fields` | 遮蔽该字段的**格式**漂移（时间戳精度／时区、UUID 版本） | 忽略其值但仍断言格式／形状（见「`ignore_fields` 使用指南」） |
| 特性化测试缺少 `@characterization` | Gate 0 找不到它们 | 一律加上 `@characterization` 标记 |
| 未进行 Gate 0 就开始重构 | 无法检测行为偏移 | 先跑特性化测试，始终如此 |

---

## 相关标准

- [功能清单标准](../../../core/feature-manifest-standard.md) — 功能清单中 FM-NNN 的 schema
- [验收条件追踪](../../../core/acceptance-criteria-traceability.md) — `not_implemented` AC 状态
- [重构标准](../../../core/refactoring-standards.md) — 特性化测试需求
- [测试标准](../../../core/testing-standards.md) — 测试实现标准
- [数据迁移测试](../../../core/data-migration-testing.md) — 同样的「别只比看起来相等」原则，作用于 DB 存储层（byte／codepoint 编码），而非 oracle／序列化层

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | 初始版本 — 快照 schema、一致性闸门、Gate 0 特性化协议（XSPEC-201） |
| 1.1.0 | 2026-06-28 | 比对保真度补强（XSPEC-306）— `ignore_fields` 改写为「忽略值、断言格式」；新增「序列化格式对等」章节（原始 vs. JSON 形状断言、PHP↔C# 序列化器默认）；2 条格式遮蔽反模式；与 data-migration-testing 交叉引用 |
