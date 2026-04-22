---
source: ../../../../skills/commands/reverse-sdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: current
---

---
description: [UDS] Reverse engineer code into SDD specification document
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[source file or directory | 源文件或目录]"
---

# /reverse-sdd — Reverse Engineer to SDD Spec | 逆向工程为 SDD 规格

Reverse engineer existing code into a structured SDD specification document.

将现有代码逆向工程为结构化的 SDD 规格文件。

## Workflow | 工作流程

```
Source Code ──► Analyze ──► Extract Requirements ──► Generate SPEC-XXX.md
```

1. **扫描**源代码结构和依赖关系
2. **提取**隐含需求、API 契约、业务规则
3. **分类**每项发现的确定性：`[Confirmed]`、`[Inferred]`、`[Assumption]`
4. **生成** SDD 合规的规格文件
5. **审查**生成的规格以确保准确性

## Output Format | 输出格式

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
| `/reverse-sdd src/auth/` | Reverse engineer auth module | 逆向工程 auth 模块 |
| `/reverse-sdd` | Interactive — ask for target | 交互式 — 询问目标 |

## Reference | 参考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
