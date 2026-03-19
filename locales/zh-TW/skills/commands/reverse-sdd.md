---
source: ../../../../skills/commands/reverse-sdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Reverse engineer code into SDD specification document
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

## 參考

- 上層指令：[/reverse](../reverse-engineer/SKILL.md)
- 核心規範：[reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
