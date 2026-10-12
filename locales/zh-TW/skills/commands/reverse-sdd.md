---
source: ../../../../skills/commands/reverse-sdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: 1e59164e7709
---

---
description: [UDS] 將程式碼反向工程為 SDD 規格文件
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[source file or directory | 原始檔案或目錄]"
---

# /reverse-sdd — 反向工程為 SDD 規格

> **Language**: [English](../../../../skills/commands/reverse-sdd.md) | 繁體中文

將現有程式碼反向工程為結構化的 SDD 規格文件。

## 工作流程

```
Source Code ──► Analyze ──► Extract Requirements ──► Generate SPEC-XXX.md
```

1. **掃描**原始碼結構和相依性
2. **擷取**隱含的需求、API 合約、商業邏輯
3. **分類**每項發現的確定性：`[Confirmed]`、`[Inferred]`、`[Assumption]`
4. **產生**符合 SDD 規範的規格文件
5. **審查**產生的規格以確認準確性

## 輸出格式

```markdown
# [SPEC-XXX] Feature: [Reverse-Engineered Name]

## Overview
[Inferred] Based on analysis of src/auth/...

## Requirements
- REQ-001: [Confirmed] User authentication via OAuth2
- REQ-002: [Inferred] Session timeout after 30 minutes

## Acceptance Criteria
- AC-1: [Confirmed] Given valid credentials, when login, then session created
```

## 使用方式

| 指令 | 用途 |
|------|------|
| `/reverse-sdd src/auth/` | 反向工程 auth 模組 |
| `/reverse-sdd` | 互動式 — 詢問目標 |

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/reverse-sdd` | 詢問使用者要分析的原始碼路徑 |
| `/reverse-sdd <path>` | 直接分析指定路徑 |

### 互動腳本

1. 掃描目標路徑的程式碼結構和相依性
2. 擷取隱含需求、API 合約、商業規則
3. 為每個發現分類確定性：`[Confirmed]`、`[Inferred]`、`[Assumption]`

**決策：確定性門檻**
- IF 有對應測試佐證 → `[Confirmed]`
- IF 從程式碼邏輯推斷 → `[Inferred]`
- IF 無直接證據 → `[Assumption]`

4. 產生 SDD 格式的規格文件
5. 展示結果（含確定性標記）

🛑 **STOP**: 展示產生的 spec 後等待使用者審查並確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 產生 spec 後 | 使用者審查確定性標記，確認寫入 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 路徑不存在 | 告知並詢問正確路徑 |
| 程式碼過大（>50 檔案） | 建議縮小範圍，或列出模組供選擇 |
| 無法辨識程式語言 | 詢問使用者確認語言 |
| 所有發現都是 `[Assumption]` | 警告信心不足，建議人工審查後再使用 |

## 參考

- 上層指令：[/reverse](../reverse-engineer/SKILL.md)
- 核心規範：[reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
