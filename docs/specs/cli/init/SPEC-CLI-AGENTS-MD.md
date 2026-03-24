# SPEC-CLI-AGENTS-MD: AGENTS.md 通用輸出整合

> **Status**: Archived
> **Author**: AI Assistant (Claude Opus 4.6)
> **Date**: 2026-03-20
> **PR**: #38
> **Type**: Feature Enhancement
> **Scope**: partial (UDS CLI 功能，但概念通用)

## Context

AGENTS.md 已成為 Linux Foundation 下 AAIF 管理的開放標準，60K+ 開源專案採用，所有主流 AI 工具原生支援。

UDS 原本僅在選擇 codex/opencode 時生成 AGENTS.md。此 Spec 新增「通用輸出」功能，無論選擇哪些工具都可額外生成。

## Problem Statement

| 面向 | 說明 |
|------|------|
| **當前行為** | AGENTS.md 僅在選擇 codex 或 opencode 時生成 |
| **期望行為** | 無論選擇哪些工具，都可選擇額外生成 AGENTS.md 作為通用格式 |
| **缺口** | 選擇 claude-code + cursor 的用戶無法獲得 AGENTS.md |

## Requirements

| ID | 描述 | 狀態 |
|----|------|------|
| REQ-001 | `uds init` 時提供 AGENTS.md 生成選項 | ✅ |
| REQ-002 | AGENTS.md 內容為精簡摘要（≤ 150 行） | ✅ |
| REQ-003 | 若已選 codex/opencode，不重複生成 | ✅ |
| REQ-004 | `uds update` 時同步更新 AGENTS.md | ✅ |
| REQ-005 | 內容指向 `.standards/` 取得完整標準 | ✅ |
| REQ-006 | 支援 `--agents-md` / `--no-agents-md` CLI flag | ✅ |

## Implementation

### 修改的檔案

| 檔案 | 變更 |
|------|------|
| `cli/bin/uds.js` | `--agents-md` / `--no-agents-md` flags |
| `cli/src/utils/integration-generator.js` | `generateAgentsMdSummary()`, `writeAgentsMdSummary()`, `detectBuildCommands()` |
| `cli/src/prompts/init.js` | `promptAgentsMd()` |
| `cli/src/flows/init-flow.js` | Step 3.5 AGENTS.md 提示 |
| `cli/src/commands/init.js` | 非互動模式 + 安裝步驟 2.5 |
| `cli/src/commands/update.js` | update + regenerateIntegrations 支援 |
| `cli/src/commands/config.js` | AI 工具變更時提示 |
| `cli/src/installers/integration-installer.js` | `generateUniversalAgentsMd()` |
| `cli/src/installers/manifest-installer.js` | `generateAgentsMd` 欄位 |
| `cli/src/i18n/messages.js` | 英文/繁中/簡中 i18n |
| `cli/src/core/constants.js` | `AGENTS_MD_UNIVERSAL` 常數 |

### 測試覆蓋

- 單元測試：12 個（`generateAgentsMdSummary` 輸出驗證）
- 整合測試：5 個（`generateUniversalAgentsMd` 去重邏輯）
- E2E 測試：4 個（完整 init 流程）

## Cross-Project Issues

| 專案 | Issue | 說明 |
|------|-------|------|
| DevAP | AsiaOstrich/dev-autopilot#1 | QualityGate + drift 偵測 |
| VibeOps | AsiaOstrich/vibeops#18 | Agent prompt 引用 |

## Version History

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-03-20 | Implemented — PR #38 merged |
