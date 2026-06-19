---
source: ../../../../skills/spec-driven-dev/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-06-02
source_hash: 195f50bcbfb7
status: current
description: |
  在编写代码前，建立、审查和管理规格文件。
  使用时机：建立规格、审查设计、规格驱动开发流程。
  关键字：spec, specification, SDD, design, review, 规格, 设计, 审查, 验证。
---
<!-- DEPRECATION NOTICE (XSPEC-086 Phase 4, 2026-04-28):
  SDD 生命周期编排（7 阶段状态机、阶段转换、闸门检查）已迁移至
  采用层（XSPEC-095, 2026-04-28）。本 Skill 保留：spec 格式定义、状态
  描述、delta 操作、决策树。
  如需强制执行的生命周期，请使用你采用层的工具链。
-->

# Spec-Driven Development Assistant | 规格驱动开发助手

在编写代码前，建立、审查和管理规格文件。

在编写代码前，建立、审查和管理规格文件。

## When to Use `/sdd` vs `uds spec` | 何时使用

| 场景 | `/sdd` | `uds spec` |
|----------|--------|------------|
| 带审查周期的正式功能开发 | ✅ | ❌ |
| 完整 spec 生命周期（Draft → Archived） | ✅ | ❌ |
| 快速原型 / Vibe coding | ❌ | ✅ |
| 小幅增量改动 | ❌ | ✅ |
| 需要利益相关方签核 | ✅ | ❌ |
| 从自然语言意图生成 micro-spec | ❌ | ✅ |

> **`/sdd`** = 用于正式开发的完整 spec 生命周期
> **`uds spec`** = 用于快速迭代的轻量 micro-spec
>
> **`/sdd`** = 正式开发的完整规格生命周期
> **`uds spec`** = 快速迭代的轻量微规格

## TL;DR Quick Checklist | 快速检查清单

- 搜索已有 spec：查看 `specs/`、`docs/specs/` 或项目的 spec 目录
- 确定范围：新增功能 vs 修改既有能力
- 选取唯一的 spec ID：`SPEC-NNN` 或 kebab-case 变更 ID
- 撰写提案，包含清晰的 AC（Given/When/Then 格式）
- 在实作开始前取得批准
- 按顺序实作各任务，对照 spec 进行验证
- 完成后归档 spec

## Decision Tree | 决策树

```
New request? | 新需求？
├─ Bug fix restoring spec behavior? → Fix directly | 直接修复
├─ Typo/format/comment? → Fix directly | 直接修复
├─ Dependency update (non-breaking)? → Fix directly | 直接修复
├─ New feature/capability? → Create proposal | 建立提案
├─ Breaking change? → Create proposal | 建立提案
├─ Architecture change? → Create proposal | 建立提案
├─ Agent/role definition (spans multiple features)? → Use spec-type: agent | 使用 Agent SPEC template
└─ Unclear? → Create proposal (safer) | 建立提案（较安全）
```

## Workflow | 工作流程

```
DISCUSS ──► CREATE ──► REVIEW ──► APPROVE ──► IMPLEMENT ──► VERIFY ──► ARCHIVE
```

### 0. Discuss - Clarify Scope | 厘清范围
捕捉灰色地带、建立指导原则，并在撰写 spec 前消解歧义。

### 1. Create - Write Spec | 撰写规格
定义需求、技术设计、验收条件与测试计划。

### 2. Review - Validate | 审查验证
与利益相关方一起检查完整性、一致性与可行性。

### 3. Approve - Sign Off | 核准
在实作开始前取得利益相关方签核。

### 4. Implement - Code | 实作
依据已核准的 spec 进行开发，参照需求与 AC。

### 5. Verify - Confirm | 验证
确保实作与 spec 相符、所有测试通过、AC 满足。

### 6. Archive - Close | 归档
将完成的 spec 归档，并附上指向 commit/PR 的链接。

## Spec States | 规格状态

| 状态 | Description | 说明 |
|-------|-------------|------|
| **Draft** | Work in progress | 草稿中 |
| **Review** | Under review | 审查中 |
| **Approved** | Ready for implementation | 已核准 |
| **Implemented** | Code complete | 已实作 |
| **Archived** | Completed or deprecated | 已归档 |

## Spec Structure | 规格结构

```markdown
# [SPEC-ID] Feature: [Name]

## Overview
Brief description of the proposed change.

## Motivation
Why is this change needed? What problem does it solve?

## Requirements
### Requirement: [Name]
The system SHALL [behavior description].

#### Scenario: [Success case]
- **GIVEN** [initial context]
- **WHEN** [action performed]
- **THEN** [expected result]

## Acceptance Criteria
- AC-1: Given [context], when [action], then [result]

## Technical Design
[Architecture, API changes, database changes]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]
```

### Agent SPEC Structure | Agent 规格结构（`spec-type: agent`）

```markdown
# [SPEC-ID] Agent: [Role Name]
<!-- spec-type: agent -->
<!-- agent-id auto-referenced by feature SPECs -->

## Role Definition
- **Role**: [Agent Name]
- **Responsibility**: [One sentence]
- **Autonomy Level**: L[1-5] (per DEC-065)

## Capability Scope
**Owns:**
- [Capability 1]
- [Capability 2]

**Does NOT own:**
- [Explicit exclusion]

## Interface Contract
### Input
| Message Type | Required Fields | Optional Fields |
|---|---|---|
| [Type] | [fields] | [fields] |

### Output
| Artifact Type | Success Condition | Failure Condition |
|---|---|---|
| [Type] | [condition] | [condition] |

## Agent Interactions
- **Upstream**: [Who calls this agent]
- **Downstream**: [Who this agent calls]
- **Parallel**: [Agents working alongside]

## Related Feature SPECs
- [SPEC-NNN] — [This agent's role in that spec]
```

### Scenario Formatting Rules | 场景格式规则

- 每个场景使用 `#### Scenario:`（h4 标题）
- 每条 requirement 必须至少有一个场景
- 使用 **GIVEN/WHEN/THEN** 格式描述结构化行为
- 规范性需求使用 **SHALL/MUST**，建议性使用 **SHOULD**

## Delta Operations | 变更操作

修改既有 spec 时，使用 delta 区段：

| Operation | Description | 说明 |
|-----------|-------------|------|
| `## ADDED Requirements` | New capabilities | 新增功能 |
| `## MODIFIED Requirements` | Changed behavior | 修改行为 |
| `## REMOVED Requirements` | Deprecated features | 移除功能 |
| `## RENAMED Requirements` | Name changes | 重新命名 |

## Usage | 使用方式

```
/sdd                     - Interactive spec creation wizard | 互动式规格建立向导
/sdd auth-flow           - Create spec for specific feature | 为特定功能建立规格
/sdd review              - Review existing specs | 审查现有规格
/sdd --sync-check        - Check sync status | 检查同步状态
```

## Next Steps Guidance | 下一步引导

`/sdd` 完成后，AI 助手应建议：

> **规格文件已建立。建议下一步 / Specification document created. Suggested next steps:**
> - 执行 `/derive` 从规格推导测试工件 ⭐ **Recommended / 推荐** — Derive test artifacts from spec
> - 执行 `/derive bdd` 仅推导 BDD 场景 — Derive BDD scenarios only
> - 执行 `/derive tdd` 仅推导 TDD 骨架 — Derive TDD skeletons only
> - 审查 AC 完整性，确保所有验收条件可测试 — Review AC completeness
> - 检查 UDS 规范覆盖率 → 执行 `/audit --patterns` — Check UDS standard coverage → Run `/audit --patterns`

## Reference | 参考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [spec-driven-development.md](../../core/spec-driven-development.md)


## AI Agent Behavior | AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/sdd`](../../../../skills/commands/sdd.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/sdd`](../../../../skills/commands/sdd.md#ai-agent-behavior--ai-代理行為)
