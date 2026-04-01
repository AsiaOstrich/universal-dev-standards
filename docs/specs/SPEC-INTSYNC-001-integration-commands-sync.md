# [SPEC-INTSYNC-001] Feature: AI 工具整合命令對齊檢查

**Status**: Approved
**Created**: 2026-04-01
**Author**: AI Assistant + User
**Spec ID**: SPEC-INTSYNC-001
**Change ID**: integration-commands-sync

## Overview

建立高品質的 AI 工具整合命令對齊檢查系統，確保新增 skills/commands 時，各 AI 工具的整合檔案能及時更新。Complete 和 Partial tier 工具均須檢查全部 commands，透過 Command 登記 + 嚴格匹配 + 自動化腳本，在 pre-release 流程中自動偵測落差。

## Motivation

### 問題現狀

1. UDS 目前有 **48 個 commands**、**52 個 skills**，但只有 2/13 工具有 `skills-mapping.md`
2. 現有 `check-ai-agent-sync.sh` 只檢查 7 條核心規則（AH-001~004, SDD-001~002, CMT-001），不檢查 commands 覆蓋
3. 新增 commands（如 `/observability`, `/slo`, `/runbook`, `/adr`, `/retrospective`）後，多數整合檔未更新
4. OpenCode 的 skills-mapping 只映射 25/48 commands（52%）

### 解決目標

- 每次 pre-release 自動偵測整合檔的 commands 覆蓋落差
- 按 tier 分層要求，避免 minimal tier 工具承受過多維護負擔
- 提供 Single Source of Truth 管理 command 分類

## Requirements

### Requirement 1: Command Index 登記

系統 SHALL 維護一個 `COMMAND-INDEX.json` 檔案作為所有 commands 的 Single Source of Truth。

#### Scenario: 新增 command 時登記

- **GIVEN** 開發者新增了一個 command 檔案 `skills/commands/new-command.md`
- **WHEN** 執行 pre-release 檢查
- **THEN** 檢查腳本應偵測到未登記的 command 並報告警告

#### Scenario: 讀取 Command Index

- **GIVEN** `COMMAND-INDEX.json` 已存在且包含所有 commands 的分類資訊
- **WHEN** 同步檢查腳本讀取此檔案
- **THEN** 應能取得每個 command 的 `name`、`category`、`since` 版本

### Requirement 2: Command 分類系統

系統 SHALL 將 commands 分為語義化的類別（categories），用於報告分組與組織管理（非 tier 差異化）。

#### Scenario: 定義分類

- **GIVEN** 管理者需要定義 command 分類
- **WHEN** 編輯 `COMMAND-INDEX.json` 的 `categories` 區段
- **THEN** 每個 category 應包含 `id`、`description`、`commands` 陣列

#### Scenario: 每個 command 歸屬一個 category

- **GIVEN** `COMMAND-INDEX.json` 中有 48 個 commands
- **WHEN** 驗證分類完整性
- **THEN** 每個 command MUST 歸屬於恰好一個 category

### Requirement 3: REGISTRY.json 擴展

系統 SHALL 在 `integrations/REGISTRY.json` 的 tier 定義中新增 `requiredCategories` 欄位。

#### Scenario: Complete 和 Partial tier 均要求所有類別

- **GIVEN** REGISTRY.json 定義了 `complete` 和 `partial` tier
- **WHEN** 讀取 tier 的 `requiredCategories`
- **THEN** 兩者都應包含所有 command categories

#### Scenario: Minimal/Preview/Planned/Tool tier 不要求 commands

- **GIVEN** REGISTRY.json 定義了 `minimal`、`preview`、`planned`、`tool` tier
- **WHEN** 讀取 tier 的 `requiredCategories`
- **THEN** 應為空陣列 `[]`

### Requirement 4: 整合命令同步檢查腳本

系統 SHALL 提供 `check-integration-commands-sync.sh` 腳本，驗證各 AI 工具整合檔是否提及其 tier 所要求的 commands。

#### Scenario: Complete tier 工具通過檢查

- **GIVEN** Claude Code（complete tier）的 CLAUDE.md 提及所有 required categories 的 commands
- **WHEN** 執行 `check-integration-commands-sync.sh`
- **THEN** Claude Code 應顯示為 ✅ 通過

#### Scenario: Complete tier 工具缺少 command 引用

- **GIVEN** OpenCode（complete tier）的整合檔未提及 `/observability` command
- **WHEN** 執行 `check-integration-commands-sync.sh`
- **THEN** 應報告 OpenCode 缺少 `observability` 命令引用，嚴重度為 warning

#### Scenario: Partial tier 工具檢查全部 commands

- **GIVEN** Cline（partial tier）的整合檔
- **WHEN** 執行 `check-integration-commands-sync.sh`
- **THEN** Cline 應被檢查全部 commands（與 Complete tier 相同要求）

#### Scenario: Minimal tier 工具跳過 command 檢查

- **GIVEN** Google Antigravity（minimal tier）
- **WHEN** 執行 `check-integration-commands-sync.sh`
- **THEN** 應跳過 command 覆蓋檢查，只顯示 "ℹ️ Skipped (no command requirements)"

#### Scenario: 偵測未登記的 command 檔案

- **GIVEN** `skills/commands/` 目錄中有一個 `.md` 檔案不在 `COMMAND-INDEX.json` 中
- **WHEN** 執行 `check-integration-commands-sync.sh`
- **THEN** 應報告 "⚠️ Unregistered command: [filename]"

### Requirement 5: Pre-release 整合

系統 SHALL 將新腳本整合到 `pre-release-check.sh` 中，作為 Step 7.5。

#### Scenario: Pre-release 執行新檢查

- **GIVEN** 開發者執行 `./scripts/pre-release-check.sh`
- **WHEN** 流程到達 Step 7.5
- **THEN** 應執行 `check-integration-commands-sync.sh` 並根據結果決定通過/失敗

#### Scenario: 與現有 Step 7 互補

- **GIVEN** Step 7 (`check-ai-agent-sync.sh`) 檢查核心規則
- **WHEN** Step 7.5 (`check-integration-commands-sync.sh`) 檢查 command 覆蓋
- **THEN** 兩者 SHALL 獨立執行，互不影響

## Acceptance Criteria

- **AC-1**: Given `skills/commands/` 有 48 個 command 檔案, when `COMMAND-INDEX.json` 建立完成, then 所有 commands（排除 README.md、COMMAND-FAMILY-OVERVIEW.md、guide.md）應已登記且分類
- **AC-2**: Given REGISTRY.json 已擴展 `requiredCategories`, when 讀取 complete 和 partial tier, then 都應包含所有 categories；其他 tier 為空
- **AC-3**: Given complete 或 partial tier 工具缺少某些 command 的 `/command` 引用, when 執行 sync 腳本, then 應列出缺少的 commands 且回傳非零 exit code
- **AC-4**: Given Cursor 不支援 Workflows, when 讀取 REGISTRY.json, then Cursor 的 tier 應為 `partial`（非 `complete`）
- **AC-5**: Given `skills/commands/` 新增一個未登記的 command, when 執行 sync 腳本, then 應報告 unregistered warning
- **AC-6**: Given pre-release-check.sh 已整合 Step 7.5, when 執行 pre-release, then 新檢查應在 Step 7 之後、Step 8 之前執行
- **AC-7**: Given 腳本執行環境為 macOS 或 Linux, when 使用 bash 執行, then 應正確運作且輸出格式與其他 check 腳本一致

## Technical Design

### 1. COMMAND-INDEX.json 結構

位置：`skills/commands/COMMAND-INDEX.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "version": "1.0.0",
  "lastUpdated": "2026-04-01",
  "description": "Command registry with category classification for integration sync",

  "categories": {
    "core": {
      "description": "基礎命令，所有 AI 工具都應知道",
      "commands": ["commit", "review", "sdd", "check", "init", "update", "config"]
    },
    "testing": {
      "description": "測試相關命令",
      "commands": ["tdd", "bdd", "atdd", "coverage", "ac-coverage", "derive", "derive-bdd", "derive-tdd", "derive-atdd", "derive-all", "contract-test"]
    },
    "quality": {
      "description": "品質與重構命令",
      "commands": ["checkin", "refactor", "scan", "security", "reverse", "reverse-sdd", "reverse-bdd", "reverse-tdd"]
    },
    "docs": {
      "description": "文件與需求命令",
      "commands": ["docs", "docgen", "changelog", "requirement", "adr", "brainstorm", "sdd-retro", "pr"]
    },
    "ops": {
      "description": "維運與可觀測性命令",
      "commands": ["observability", "slo", "runbook", "incident", "metrics", "durable", "ci-cd"]
    },
    "methodology": {
      "description": "方法論與工作流程命令",
      "commands": ["methodology", "dev-workflow", "discover", "release", "audit", "migrate"]
    },
    "reference": {
      "description": "參考指南命令（唯讀）",
      "commands": ["guide", "database", "api-design"]
    }
  },

  "excluded": ["README.md", "COMMAND-FAMILY-OVERVIEW.md", "guide.md"]
}
```

### 2. REGISTRY.json 擴展

在 `tiers` 區段新增 `requiredCategories`：

```json
{
  "tiers": {
    "complete": {
      "requiredRules": ["AH-001", "AH-002", "AH-003", "AH-004", "SDD-001", "SDD-002", "CMT-001"],
      "requiredCategories": ["core", "testing", "quality", "docs", "ops", "methodology", "reference"]
    },
    "partial": {
      "requiredRules": ["AH-001", "AH-002", "AH-003", "AH-004", "SDD-001", "CMT-001"],
      "requiredCategories": ["core", "testing", "quality", "docs", "ops", "methodology", "reference"]
    },
    "minimal": {
      "requiredRules": ["AH-001", "AH-002"],
      "requiredCategories": []
    },
    "preview": {
      "requiredRules": ["AH-001", "AH-002", "AH-003"],
      "requiredCategories": []
    },
    "planned": { "requiredRules": [], "requiredCategories": [] },
    "tool": { "requiredRules": [], "requiredCategories": [] }
  }
}
```

### 3. 檢查腳本邏輯

`scripts/check-integration-commands-sync.sh`:

```
1. 讀取 COMMAND-INDEX.json
2. 掃描 skills/commands/*.md，比對 INDEX 登記 → 報告未登記
3. 讀取 REGISTRY.json agents + tiers
4. For each agent (排除 planned/tool):
   a. 取得 tier → requiredCategories
   b. 若 requiredCategories 為空 → skip
   c. For each requiredCategory:
      - 取得 category 的 commands 列表
      - 在 agent 的 instructionFile 中搜尋每個 command 關鍵字
      - 記錄缺少的 commands
   d. 報告結果
5. 彙總統計
```

**搜尋策略**：在整合檔中使用嚴格匹配，搜尋 `/command-name` 格式（斜線前綴）。整合檔必須明確以 `/command` 格式列出支援的命令，避免誤判。

### 4. Pre-release 整合

在 `pre-release-check.sh` 的 Step 7 之後插入 Step 7.5：

```bash
# Step 7.5: Integration commands sync
run_check "7.5" "Running integration commands sync check" "$SCRIPT_DIR/check-integration-commands-sync.sh"
```

> **注意**：插入 7.5 而非重新編號，以避免影響現有文件中的步驟引用。

### 5. 跨平台考量

- Bash 腳本使用 `grep -E` 進行 pattern matching
- JSON 解析使用 `python3 -c` 或 `node -e`（專案已有 Node.js 依賴）
- 相容 macOS (BSD grep) 和 Linux (GNU grep)

## Task Breakdown

| Task | Description | Estimated Effort |
|------|-------------|-----------------|
| T1 | 建立 `COMMAND-INDEX.json`，登記全部 48 commands 並分類 | Small |
| T2 | 擴展 `REGISTRY.json` tiers 加入 `requiredCategories` + Cursor 降為 partial | Small |
| T3 | 開發 `check-integration-commands-sync.sh` | Medium |
| T4 | 整合到 `pre-release-check.sh` Step 7.5 | Small |
| T5 | 更新 CLAUDE.md 文件（Quick Verification 區段） | Small |
| T6 | 執行腳本，修復 Complete tier 工具的落差 | Medium-Large |

## Test Plan

- [ ] `COMMAND-INDEX.json` 包含所有非排除的 command 檔案
- [ ] `COMMAND-INDEX.json` 中每個 command 恰好出現在一個 category
- [ ] REGISTRY.json 的 `requiredCategories` 與 tier 定義一致
- [ ] 腳本在 macOS 上正確執行
- [ ] Complete tier 工具（Claude Code, OpenCode）的缺少 commands 被正確偵測
- [ ] Partial tier 工具檢查全部 commands（與 Complete 相同）
- [ ] Minimal/Preview tier 工具跳過 command 檢查
- [ ] 未登記的 command 被正確偵測
- [ ] Pre-release Step 7.5 正確執行
- [ ] `--verbose` flag 顯示詳細匹配資訊

## Resolved Questions

1. **Category 粒度** → 保留 7 類用於報告分組，但不影響 tier 差異化。Complete 和 Partial 都檢查全部 commands。
2. **Partial tier 範圍** → Partial tier 檢查全部 commands（與 Complete 相同），最高品質原則。
3. **Cursor tier** → 降為 `partial`（不支援 Workflows，不符 complete 定義）。
4. **搜尋嚴格度** → 嚴格匹配（`/command` 格式），減少誤判。
