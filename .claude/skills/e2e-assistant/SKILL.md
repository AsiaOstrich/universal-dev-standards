---
source: ../../../../skills/e2e-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 從 BDD 場景生成 E2E 測試骨架，支援框架偵測與覆蓋差距分析"
name: e2e
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*)
scope: partial
argument-hint: "[feature file or --analyze | .feature 檔案或 --analyze]"
---

# E2E 助手

> **語言**: [English](../../../../skills/e2e-assistant/SKILL.md) | 繁體中文

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

從 BDD `.feature` 場景生成 E2E 測試骨架，支援框架偵測與覆蓋差距分析。

## 工作流程

```
/derive bdd → .feature 場景
    ↓
/e2e → 分析 AC 適用性 → 偵測框架 → 參考既有模式 → 生成骨架
    ↓
手動執行驗證
```

## 模式

### 1. 生成模式（預設）

分析 BDD 場景、分類 AC 適用性、偵測框架、生成 E2E 測試骨架。

### 2. 分析模式（--analyze）

掃描 BDD feature 與既有 E2E 測試之間的覆蓋差距。

## AC 分類

| 類別 | 條件 | 範例 |
|------|------|------|
| `e2e-suitable` | 多步驟使用者流程或 UI 互動 | 登入 → 操作 → 驗證 |
| `integration-suitable` | 跨元件但無 UI | API 呼叫 → DB 寫入 |
| `unit-suitable` | 純邏輯或計算 | 排序、驗證、格式化 |

## 支援框架

| 框架 | 自動偵測 | 範本 |
|------|:--------:|------|
| Playwright | ✅ | `@playwright/test` |
| Cypress | ✅ | `cy.*` 指令 |
| Vitest | ✅ | `describe/it` + async |

## 使用方式

```
/e2e <feature-file>            - 從 BDD 場景生成 E2E 骨架
/e2e <spec-file>               - 委派 /derive e2e 處理 SDD 規格
/e2e --analyze                 - 掃描所有 feature 的 E2E 覆蓋差距
/e2e --analyze <feature-file>  - 分析特定 feature 的 AC 適用性
```

## 下一步引導

`/e2e` 完成後，AI 助手應建議：

> **E2E 骨架已生成。建議下一步：**
> - 執行 `/tdd` 填入 `[TODO]` 標記的測試實作 ⭐ **推薦** — 實作測試邏輯
> - 執行 `/checkin` 品質關卡（若功能完成）
> - 執行 `/e2e --analyze` 檢查整體 E2E 覆蓋狀況

## 參考

- 規格：[SPEC-E2E-001](../../../../docs/specs/skills/SPEC-E2E-001-e2e-skill.md)
- 核心規範：[testing-standards.md](../../../../core/testing-standards.md)
- 工具程式：`cli/src/utils/e2e-analyzer.js`、`cli/src/utils/e2e-detector.js`

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/e2e`](../../commands/e2e.md#ai-agent-behavior--ai-代理行為)
