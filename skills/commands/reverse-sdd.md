---
description: [UDS] Reverse engineer code into SDD specification document
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[source file or directory | 原始檔案或目錄]"
---

# /reverse-sdd — Reverse Engineer to SDD Spec | 反向工程為 SDD 規格

Reverse engineer existing code into a structured SDD specification document.

將現有程式碼反向工程為結構化的 SDD 規格文件。

## Workflow | 工作流程

```
Source Code ──► Analyze ──► Extract Requirements ──► Generate SPEC-XXX.md
```

1. **Scan** source code structure and dependencies
2. **Extract** implicit requirements, API contracts, business rules
3. **Classify** certainty of each finding: `[Confirmed]`, `[Inferred]`, `[Assumption]`
4. **Generate** SDD-compliant specification document
5. **Review** generated spec for accuracy

## Output Format | 輸出格式

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

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/reverse-sdd src/auth/` | Reverse engineer auth module | 反向工程 auth 模組 |
| `/reverse-sdd` | Interactive — ask for target | 互動式 — 詢問目標 |

## Reference | 參考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
