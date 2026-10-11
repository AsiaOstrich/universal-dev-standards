---
source: ../../../../skills/commands/reverse-sdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 1e59164e7709
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

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/reverse-sdd` | 询问用户要分析的源代码路径 |
| `/reverse-sdd <path>` | 直接分析指定路径 |

### Interaction Script | 交互脚本

1. 扫描目标路径的代码结构和依赖关系
2. 提取隐含需求、API 契约、业务规则
3. 为每项发现分类确定性：`[Confirmed]`、`[Inferred]`、`[Assumption]`

**Decision: 确定性门槛**
- IF 有对应测试佐证 → `[Confirmed]`
- IF 从代码逻辑推断 → `[Inferred]`
- IF 无直接证据 → `[Assumption]`

4. 生成 SDD 格式的规格文件
5. 展示结果（含确定性标记）

🛑 **STOP**: 展示生成的 spec 后等待用户审查并确认写入

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 生成 spec 后 | 用户审查确定性标记，确认写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 路径不存在 | 告知并询问正确路径 |
| 代码过大（>50 文件） | 建议缩小范围，或列出模块供选择 |
| 无法识别编程语言 | 询问用户确认语言 |
| 所有发现都是 `[Assumption]` | 警告信心不足，建议人工审查后再使用 |

## Reference | 参考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
