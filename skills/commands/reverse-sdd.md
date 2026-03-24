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

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/reverse-sdd` | 詢問使用者要分析的原始碼路徑 |
| `/reverse-sdd <path>` | 直接分析指定路徑 |

### Interaction Script | 互動腳本

1. 掃描目標路徑的程式碼結構和相依性
2. 擷取隱含需求、API 合約、商業規則
3. 為每個發現分類確定性：`[Confirmed]`、`[Inferred]`、`[Assumption]`

**Decision: 確定性門檻**
- IF 有對應測試佐證 → `[Confirmed]`
- IF 從程式碼邏輯推斷 → `[Inferred]`
- IF 無直接證據 → `[Assumption]`

4. 生成 SDD 格式的規格文件
5. 展示結果（含確定性標記）

🛑 **STOP**: 展示生成的 spec 後等待使用者審查並確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 生成 spec 後 | 使用者審查確定性標記，確認寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 路徑不存在 | 告知並詢問正確路徑 |
| 程式碼過大（>50 檔案） | 建議縮小範圍，或列出模組供選擇 |
| 無法辨識程式語言 | 詢問使用者確認語言 |
| 所有發現都是 `[Assumption]` | 警告信心不足，建議人工審查後再使用 |

## Reference | 參考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
