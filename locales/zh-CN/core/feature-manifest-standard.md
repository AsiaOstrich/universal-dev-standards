---
source: ../../../core/feature-manifest-standard.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 501a97944fd0
status: current
---

# Feature Manifest 标准

> **Language**: [English](../../../core/feature-manifest-standard.md) | [繁體中文](../../zh-TW/core/feature-manifest-standard.md) | 简体中文

**适用范围**: 将既有系统迁移或重组的迁移与重构项目
**Scope**: universal

---

## 概述

Feature Manifest 标准定义一种机器可读格式（`feature-manifest.yaml`），用于在迁移或重构开始前，盘点既有系统的所有功能。它在旧系统的能力与新系统的验收标准之间提供结构化的桥梁，让工具（VibeOps `/vo-pipeline --variant migration`）能自动强制执行完整性闸门。

## 参考资料

| 标准/来源 | 内容 |
|----------------|---------|
| XSPEC-200 | 迁移功能盘点与完整性闸门 |
| XSPEC-201 | 重构/迁移完整性协议 |
| XSPEC-199 | AC `not_implemented` 状态扩充 |

---

## 何时使用

在以下情况使用 `feature-manifest.yaml`：
- 将系统从一种语言/框架迁移到另一种（例如 PHP → C# .NET）
- 将旧系统移植到新架构
- 启动必须保留既有行为的大型重构

**请勿用于** greenfield 开发——manifest 是既有系统的映照，不是设计文档。

---

## Feature Manifest 格式

### 文件位置

```
artifacts/feature-manifest.yaml
```

### 顶层结构

```yaml
manifest_version: "1.0"
source_system:
  language: php
  framework: laravel
  scan_date: "2026-05-12"
  scan_coverage: "47/47 routes (100%)"

features:
  - id: FM-001
    name: UserLogin
    # ... (see Feature Entry below)
```

### Feature Entry 结构描述

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `id` | string | 是 | `FM-NNN`（补零） |
| `name` | string | 是 | PascalCase 业务功能名称 |
| `description` | string | 是 | 以白话描述业务目的 |
| `http_method` | string | 否 | `GET`、`POST`、`PUT`、`PATCH`、`DELETE`；CLI/后台作业为 `null` |
| `route` | string | 否 | URL 路径；CLI/后台作业为 `null` |
| `controller` | string | 是 | `ClassName::methodName` |
| `confidence` | float | 是 | 0.0–1.0（见 Confidence 评分） |
| `side_effects` | list | 是 | `DB_READ`、`DB_WRITE`、`EMAIL`、`QUEUE`、`HTTP_CALL`、`FILE` |
| `migration_risks` | list | 否 | 风险标签（见迁移风险） |
| `ac_id` | string | 否 | 初始为 `null`；manifest 建立后由 Planner 设定 |
| `status` | string | 是 | 初始一律为 `not_implemented` |

### 完整 Feature Entry 示例

```yaml
features:
  - id: FM-007
    name: OrderCancellation
    description: 取消订单并触发退款流程
    http_method: POST
    route: /api/orders/{id}/cancel
    controller: OrderController::cancel
    confidence: 0.9
    side_effects:
      - DB_WRITE
      - QUEUE
    migration_risks:
      - ORM_DIFFERENCES
    ac_id: null
    status: not_implemented
```

---

## Confidence 评分

| 数值 | 意义 | 动作 |
|-------|---------|--------|
| 1.0 | 功能名称与业务目的明确无歧义 | 进入 AC 产生阶段 |
| 0.8 | 功能名称合理，目的需要推断 | 附注后继续 |
| 0.5 | 可能是基础设施/工具程序，非主要业务功能 | 标记供人工审查 |
| 0.3 | 不明——无法判断业务目的 | **暂停；必须由人工确认** |

**规则**：所有 `confidence < 0.5` 的功能，必须先经人工审查，Planner 才能产生 AC。

---

## 迁移风险

### PHP → C# .NET

| 标签 | 说明 |
|-------|-------------|
| `SESSION_HANDLING` | PHP `$_SESSION` → ASP.NET Core Session/Cookie middleware |
| `ORM_DIFFERENCES` | Eloquent ORM 与 Entity Framework 的行为差异 |
| `TIMEZONE_HANDLING` | PHP 时区函数 → .NET `DateTimeOffset` |
| `FILE_UPLOAD_PATH` | PHP `$_FILES` → ASP.NET Core `IFormFile` |
| `REGEX_DIFFERENCES` | PHP PCRE 语法与 .NET `System.Text.RegularExpressions` 的差异 |
| `ARRAY_FUNCTIONS` | PHP `array_*` 函数 → LINQ 对应写法 |
| `EXCEPTION_HIERARCHY` | PHP 异常层级与 .NET 异常层级的差异 |

### 通用

| 标签 | 说明 |
|-------|-------------|
| `ASYNC_MODEL` | 同步代码 → async/await 迁移 |
| `NULL_SEMANTICS` | Null 处理差异 |
| `STRING_ENCODING` | 字符串编码/排序（collation）差异 |

---

## FEATURE_STUB 标记协议

在目标代码库中实现 manifest 内的功能时，使用 `FEATURE_STUB:` 标记作为占位符：

### 格式

```
// FEATURE_STUB: <FM-ID> <FeatureName> — <AC-ID> pending
```

### 示例（C#）

```csharp
// FEATURE_STUB: FM-007 OrderCancellation — AC-007 pending
public async Task<Result<OrderDto>> CancelOrderAsync(string orderId, CancellationReason reason)
{
    throw new NotImplementedException();
}
```

### FEATURE_STUB 与 WARNING:STUB 的差异

| 标记 | 语义 | 使用时机 |
|--------|----------|-------------|
| `// WARNING: STUB` | 临时的假逻辑（程序可执行但行为错误） | 带有错误业务逻辑的占位符 |
| `// FEATURE_STUB:` | 功能尚未实现（完全没有逻辑） | manifest 中尚未编写代码的功能 |

**两种标记都会阻止 CI**（main 分支 push 与 UAT/production 部署）。

### 生命周期

1. 功能加入 manifest，`status: not_implemented`
2. 开发人员在目标代码中加入 `FEATURE_STUB:` 占位符
3. 开发人员实现该功能，移除 `FEATURE_STUB:` 标记
4. 更新 manifest `status` → `implemented`
5. 更新 AC traceability `status` → `uncovered` 或 `covered`

---

## 完整性闸门

### Gate 1（Pre-Pipeline）

在 `/vo-pipeline --variant migration` 开始前：
- `artifacts/feature-manifest.yaml` 必须存在
- `.snapshots/` 目录必须存在且至少含一个 JSON 文件

### 功能完整性闸门（Pre-UAT）

CI 在以下条件同时成立时阻止 UAT 部署：
- manifest 中有任何功能的 `status: not_implemented`，且
- 代码库中存在对应的 `FEATURE_STUB:`

---

## 反模式

| 反模式 | 影响 | 正确做法 |
|--------------|--------|------------------|
| 没有 manifest 就开始迁移 | 功能缺口到 UAT 才被发现 | 一律先产生 manifest |
| 跳过低 confidence 的功能 | 功能被静默遗漏 | 审查并确认所有功能 |
| 用 `uncovered` 取代 `not_implemented` | CI 不会因缺少功能而阻止 | 代码不存在时使用 `not_implemented` |
| 实现后未移除 `FEATURE_STUB:` | CI 出现「未完成」的假信号 | 实现后一律清除标记 |

---

## 相关标准

- [Acceptance Criteria Traceability](acceptance-criteria-traceability.md) — `not_implemented` AC 状态
- [Behavior Snapshot Standard](behavior-snapshot.md) — HTTP parity 基准记录
- [Refactoring Standards](refactoring-standards.md) — 重构用的 Characterization 测试
- [Spec-Driven Development](spec-driven-development.md) — AC 产生工作流程

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-05-12 | 初始版本——FM-NNN schema、confidence 评分、FEATURE_STUB 协议（XSPEC-200） |
