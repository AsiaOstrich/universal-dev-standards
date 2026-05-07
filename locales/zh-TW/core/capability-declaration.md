---
source: ../../../core/capability-declaration.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 能力聲明標準

> **語言**: [English](../../../core/capability-declaration.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-15
**適用範圍**: 所有工具、Adapter、Agent 組件
**Scope**: universal
**來源**: XSPEC-037（claude-code-book Ch.3 Fail-Closed buildTool factory）

---

## 目的

Fail-Closed 能力聲明：工具／Adapter／Agent 必須顯式聲明安全性，缺省為最保守預設。

所有工具、Adapter 和 Agent 能力預設為「不安全、需授權」。開發者必須顯式聲明 `isConcurrencySafe: true` 才能享受並行優化。「忘記設權限」的結果是保守行為而非危險行為。

---

## 核心規範

- 所有工具、Adapter、Agent 必須實作 `CapabilityDeclaration`（即使使用預設值）
- `isConcurrencySafe` 和 `isReadOnly` 預設為 `false` — 必須顯式聲明才能解鎖優化路徑
- 框架必須在缺少聲明時使用 `FAIL_CLOSED_DEFAULTS`，並記錄警告
- 聲明必須反映實際能力，虛假聲明（如謊稱 `isReadOnly`）視為安全漏洞
- `trustLevel` 影響沙箱隔離強度，不可降低至低於 `userSettings` 允許的等級

---

## CapabilityDeclaration 介面

| 欄位 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `isConcurrencySafe` | `boolean` | `false` | 是否對並行執行安全（無競態、無共享可變狀態）。設為 `true` 後可加入並行批次執行 |
| `isReadOnly` | `boolean` | `false` | 是否為純讀取操作（不修改任何持久化狀態）。設為 `true` 後可跳過寫入相關的 Safety Hook 階段 |
| `requiresUserConfirmation` | `boolean` | `true` | 執行前是否需要使用者明確確認。設為 `false` 後進入自動執行模式（需 `userSettings` 允許） |
| `trustLevel` | enum | `untrusted` | 工具的信任等級，影響沙箱隔離強度 |

### trustLevel 值對應

| 值 | 說明 |
|----|------|
| `trusted` | 內建工具或已審核插件，無沙箱限制 |
| `sandboxed` | 第三方工具，在受限環境中執行 |
| `untrusted` | 未知來源，最嚴格限制（預設） |

---

## Fail-Closed 預設值

缺少聲明時使用的保守預設：

| 欄位 | 值 |
|------|-----|
| `isConcurrencySafe` | `false` |
| `isReadOnly` | `false` |
| `requiresUserConfirmation` | `true` |
| `trustLevel` | `untrusted` |

使用預設時記錄警告：`[WARN] Capability not declared, using Fail-Closed defaults for: {component_name}`

---

## 常見工具聲明範例

| 工具 | `isConcurrencySafe` | `isReadOnly` | `requiresUserConfirmation` | `trustLevel` |
|------|--------------------|--------------|-----------------------------|-------------|
| GrepTool | `true` | `true` | `false` | `trusted` |
| GlobTool | `true` | `true` | `false` | `trusted` |
| FileReadTool | `true` | `true` | `false` | `trusted` |
| FileEditTool | `false` | `false` | `true` | `trusted` |
| BashTool | `false` | `false` | `true` | `sandboxed` |

---

## 執行規範

| 情況 | 行動 |
|------|------|
| 缺少聲明 | 使用 `FAIL_CLOSED_DEFAULTS`，記錄警告 |
| 虛假聲明（聲明 `isReadOnly: true` 但實際執行了寫入） | 記錄 `CAPABILITY_MISMATCH` 事件，降級至 `FAIL_CLOSED_DEFAULTS` |

---

## 適用組件

- AgentAdapter 實作（採用層；如 ClaudeAdapter / OpenCodeAdapter / CliAdapter）
- Tool 呼叫系統（採用層）
- ToolExecutor 實作（採用層）
- Agent（採用層；planner / builder / evaluator 等）
- 所有 MCP 工具插件

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `CAP-001` | `CAPABILITY_NOT_DECLARED` — 使用 Fail-Closed 預設 |
| `CAP-002` | `CAPABILITY_MISMATCH` — 實際行為與聲明不符 |
| `CAP-003` | `TRUST_LEVEL_INSUFFICIENT` — `trustLevel` 低於場景要求 |
| `CAP-004` | `CONCURRENT_UNSAFE` — 嘗試並行執行 `isConcurrencySafe: false` 的組件 |
