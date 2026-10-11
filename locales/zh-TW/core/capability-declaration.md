---
source: ../../../core/capability-declaration.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 5890495db0da
status: current
---

# 能力聲明標準

> **語言**: [English](../../../core/capability-declaration.md) | 繁體中文

> **來源**: XSPEC-037 | **借鑑自**: claude-code-book Ch.3

## 概述

能力聲明標準要求所有工具、Adapter 和 Agent 顯式聲明其安全性質。**所有性質預設為最保守的（Fail-Closed）值**——忘記聲明能力的開發者得到的是安全行為，而非危險行為。

借鑑自 claude-code-book 的 `buildTool` 工廠設計：其中 `isConcurrencySafe()` 與 `isReadOnly()` 預設為 `false`，效能優化必須顯式選擇啟用。

## Fail-Closed 預設值

```typescript
const FAIL_CLOSED_DEFAULTS: CapabilityDeclaration = {
  isConcurrencySafe: false,       // Cannot run in parallel
  isReadOnly: false,              // Assumed to have side effects
  requiresUserConfirmation: true, // Must confirm before execution
  trustLevel: "untrusted",        // Maximum sandbox restrictions
};
```

## CapabilityDeclaration 介面

| 欄位 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `isConcurrencySafe` | boolean | **false** | 可安全地與其他操作並行執行 |
| `isReadOnly` | boolean | **false** | 不做任何持久化狀態變更 |
| `requiresUserConfirmation` | boolean | **true** | 執行前需要使用者明確核准 |
| `trustLevel` | enum | **untrusted** | 沙箱隔離等級 |

## 信任等級

| 等級 | 說明 | 沙箱 |
|------|------|------|
| `trusted` | 內建或已審核插件 | 無限制 |
| `sandboxed` | 第三方工具 | 受限的執行環境 |
| `untrusted` | 未知來源 | 最嚴格限制（預設） |

## 常見工具聲明

| 工具 | isConcurrencySafe | isReadOnly | requiresConfirmation | trustLevel |
|------|-------------------|------------|---------------------|------------|
| GrepTool | ✅ true | ✅ true | ❌ false | trusted |
| GlobTool | ✅ true | ✅ true | ❌ false | trusted |
| FileReadTool | ✅ true | ✅ true | ❌ false | trusted |
| FileEditTool | ❌ false | ❌ false | ✅ true | trusted |
| BashTool | ❌ false | ❌ false | ✅ true | sandboxed |

## 執行規範

- **缺少聲明**：使用 `FAIL_CLOSED_DEFAULTS` 並記錄 `[WARN] Capability not declared for: {name}`
- **虛假聲明偵測**：若聲明 `isReadOnly: true` 卻執行寫入 → 記錄 `CAPABILITY_MISMATCH` 事件，退回 Fail-Closed
- **並行**：只有 `isConcurrencySafe: true` 的組件可被批次納入並行執行

## 參考資料

- AI 最佳化版本：[ai/standards/capability-declaration.ai.yaml](../../../ai/standards/capability-declaration.ai.yaml)
- XSPEC-037：跨專案規格
- 借鑑自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.3 `buildTool` Fail-Closed 工廠


**Scope**: universal
