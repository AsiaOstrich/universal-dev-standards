---
source: ../../../core/flaky-test-management.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 04c9ce181011
status: current
---

# Flaky 测试管理标准

> **Language**: [English](../../../core/flaky-test-management.md) | [繁體中文](../../zh-TW/core/flaky-test-management.md) | 简体中文

## 概述

在一个 3000 个测试的套件中，只要有一个 flaky 测试，就足以侵蚀 CI 的可信度，让开发人员开始忽略失败。一旦开发人员学会「重跑 CI 就好」，真正的 bug 就会悄悄溜过。消除 flaky 测试的成本，永远低于它们所制造的虚假安全感的成本。

## 定义

若一个测试在相同代码下连续执行却产生不同结果（pass/fail），即为 **flaky**。2% 门槛：若一个测试在 `main` 上未变更代码的情况下失败率 ≥ 2%，即属 flaky。

## 检测

大多数 CI 系统可自动检测 flakiness：

- **GitHub Actions**：寻找 `Flaky tests detected` 标注
- **手动**：执行 `npx vitest run --reporter=verbose` 5 次，观察是否有非确定性结果
- **Vitest**：`vitest run --repeat=5`（每个测试各执行 5 次）

## 隔离（Quarantine）工作流程

```
Detected → Quarantine (< 48h) → Track → Fix or Delete (< 30 days)
```

### 隔离标注

```typescript
// TODO: quarantined 2026-05-05 — flaky race condition, see issue #42
it.skip("reconnects after WebSocket disconnect", async () => {
  // ... test body preserved for reference
})
```

### 追踪 Issue 模板

```markdown
**Flaky Test**: `describe > test name`
**File**: `src/path/to/test.ts`
**Quarantined**: 2026-05-05
**Failure rate**: ~5% on main
**Known failure mode**: `Cannot read property 'socket' of undefined`
**Root cause hypothesis**: Race condition in WebSocket teardown
**Deadline**: 2026-06-05
```

## 常见根本原因

| 根本原因 | 修法 |
|-----------|-----|
| Race condition | 使用 `waitFor()`、`vi.waitFor()`、正确的 async 协调 |
| 共享状态 | 在 `beforeEach`/`afterEach` 中重置状态 |
| 外部服务 | Mock 该依赖 |
| 文件系统排序 | 使用确定性排序 |
| 未设 seed 的随机值 | 在测试中设定固定 seed |
| 时序相依 | 使用假计时器（`vi.useFakeTimers()`） |

## Vitest 设定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    retry: 2,              // retry failed tests up to 2 times
    testTimeout: 10000,    // 10s timeout prevents infinite hangs
    hookTimeout: 5000,     // 5s hook timeout
  }
})
```

## 相关标准

- [Testing Standards](testing-standards.md) — 整体测试金字塔
- [Test Governance Standards](test-governance.md) — CI 政策


**Scope**: universal
