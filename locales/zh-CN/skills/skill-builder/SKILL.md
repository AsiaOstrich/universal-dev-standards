---
name: skill-builder
source: ../../../../skills/skill-builder/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 5d91e5974c44
status: current
scope: universal
description: |
  [UDS] 识别重复流程并以正确的开发深度构建 Skill
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "[process description | 流程描述]"
---

# 流程转 Skill 助手

> **语言**: [English](../../../../skills/skill-builder/SKILL.md) | 简体中文

引导你从「我一直在手动做这件事」走到「拥有一个正确构建的 Skill」，并在这一过程中保持适量的流程治理。

## 何时使用

- 你已经用同样的多步骤流程手动执行 ≥ 3 次
- 同事第 3 次问你「我们是怎么做 X 的？」
- 你临时建了一个 Skill，现在想把它正式化

## 核心原则

> Skill 记录的是**流程知识**。Memory 记录的是历史事实。
> 当你注意到自己重复执行相同的步骤时，那就是一个 Skill 候选。

## 决策树

```
New Skill needed?
├── Modifying existing Skill?
│     → Delta path: append ## MODIFIED / ## ADDED to existing SKILL.md
│                   update version field → done
│
├── Answer these 4 questions (any "yes" → Complex):
│     1. More than 7 steps?
│     2. Branching logic between steps (if/else)?
│     3. Requires knowledge from 3+ separate standards/decisions?
│     4. Output directly affects sub-project source code?
│
├── All "no" → Simple path
│     → Fill Skill Brief (templates/SKILL-BRIEF-TEMPLATE.md)
│     → Create SKILL.md directly (no XSPEC needed)
│
└── Any "yes" → Complex path
      → Create XSPEC first → run /sdd
      → Return here after XSPEC Approved

Deprecating a Skill?
  → Add to SKILL.md frontmatter:
      status: deprecated
      deprecated_at: YYYY-MM-DD
      deprecated_reason: "..."
      superseded_by: "/new-skill"   (if applicable)
  → Mark archived in SKILL-CANDIDATES.md
```

## 摆放位置决策

在创建 SKILL.md 前，先决定它应该放在哪里：

| 条件 | 摆放位置 |
|-----------|-----------|
| 步骤引用项目特定路径（如 TECH-RADAR.md、DEC-*.md） | 项目：`{project}/.claude/skills/` |
| 步骤为通用流程（无项目特定路径） | UDS：`skills/{name}/` + zh-TW locale |

## 工作流程

### Step 1 — 描述流程

捕捉重复的步骤序列：
- 哪些步骤？按什么顺序？
- 目前手动执行过几次？
- 触及哪些工具或文件？

### Step 2 — 更新 SKILL-CANDIDATES.md

打开你项目的 `SKILL-CANDIDATES.md`（首次请从 `templates/SKILL-CANDIDATES.md` 复制）：
- 尚未记录 → 新增一行，填入当前次数
- 已记录 → 增加次数
- 次数达到 3 → 标记 trigger ✅，继续执行

### Step 3 — 选择路径（Simple / Complex / Delta）

回答这 4 个判断问题。确定：Simple、Complex 或 Delta。

### Step 4a — Simple：填写 Skill Brief

使用 `templates/SKILL-BRIEF-TEMPLATE.md`：
- 触发情境（何时会用到？）
- 核心步骤（3 ~ 7 个，有顺序）
- 验收条件（2 ~ 3 条）
- 范围外（明确边界）

### Step 4b — Complex：创建 XSPEC

执行 `/sdd` 创建 XSPEC。XSPEC Approved 之后回到 Step 5。

### Step 4c — Delta：识别变更范围

识别现有 SKILL.md 中哪些区段需要变更。
在文件末尾加入 `## MODIFIED Requirements` 或 `## ADDED Requirements`。

### Step 5 — 创建 / 更新 SKILL.md

依据 Brief 或 XSPEC 生成 SKILL.md：
- 确认 frontmatter：`name`、`scope`、`description`、`allowed-tools`
- UDS 通用 Skill：同步创建 zh-TW locale 版本
- 项目 Skill：放在 `{project}/.claude/skills/{name}/SKILL.md`

### Step 6 — 更新 SKILL-CANDIDATES.md

将候选行标记为：trigger ✅、Skill 列填写完成。

### Step 7 — Commit

```
feat(skills): Add /{skill-name} skill. 新增 /{skill-name} Skill。

{English description, 1-2 lines}

{Chinese description, 1-2 lines}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## 输出检查清单

完成所有步骤后，请确认：

- [ ] `SKILL-CANDIDATES.md` 已更新（trigger ✅、Skill 名称已填）
- [ ] `SKILL.md` 已创建并具备完整 frontmatter（`name` / `scope` / `description` / `allowed-tools`）
- [ ] Simple 路径：Skill Brief 已引用或保留
- [ ] Complex 路径：XSPEC ID 已记录在 SKILL.md header comment 中
- [ ] UDS skill：已创建 zh-TW locale 文件
- [ ] 棄用（Deprecated）：frontmatter 含 `status: deprecated`
- [ ] git commit 已完成

## 参考

- Skill Brief 模板：[templates/SKILL-BRIEF-TEMPLATE.md](../../../../templates/SKILL-BRIEF-TEMPLATE.md)
- 候选追踪：[templates/SKILL-CANDIDATES.md](../../../../templates/SKILL-CANDIDATES.md)（请复制到你的项目）
- ADR 标准：[core/adr-standards.md](../../core/adr-standards.md)
