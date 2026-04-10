---
source: ../../../../skills/process-automation/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 识别重复流程并以正确开发深度创建 Skill"
---

# 流程转化 Skill 助手

> **语言**: [English](../../../../skills/process-automation/SKILL.md) | 简体中文

从「我一直在手动做这件事」引导你创建一个合适的 Skill，并在过程中采用恰当深度的开发流程。

## 使用时机

- 你已手动执行同一组多步骤流程 ≥ 3 次
- 队友第 3 次问「我们怎么做 X？」
- 你临时创建了一个 Skill，想要正式化它

## 核心原则

> **Skill 记录流程知识。Memory 记录历史事实。**
> 当你发现自己在重复执行相同步骤时，那就是 Skill 候选。

## 决策树

```
需要新 Skill？
├── 修改现有 Skill？
│     → Delta 路径：在现有 SKILL.md 末尾附加 ## MODIFIED / ## ADDED
│                   更新 version 字段 → 完成
│
├── 回答这 4 个问题（任何一个「是」→ Complex）：
│     1. 超过 7 个步骤？
│     2. 步骤之间有分支逻辑（if/else）？
│     3. 需要来自 3 个以上独立标准/决策的知识？
│     4. 输出直接影响子项目的源代码？
│
├── 全部「否」→ Simple 路径
│     → 填写 Skill Brief（templates/SKILL-BRIEF-TEMPLATE.md）
│     → 直接创建 SKILL.md（不需要 XSPEC）
│
└── 任何「是」→ Complex 路径
      → 先创建 XSPEC → 执行 /sdd
      → XSPEC 核准后回到这里

废弃 Skill？
  → 在 SKILL.md frontmatter 加入：
      status: deprecated
      deprecated_at: YYYY-MM-DD
      deprecated_reason: "..."
      superseded_by: "/new-skill"   （如有适用）
  → 在 SKILL-CANDIDATES.md 中标记为已归档
```

## 放置位置决策

创建 SKILL.md 前，先决定它应放在哪里：

| 条件 | 放置位置 |
|------|----------|
| 步骤引用项目特定路径（如 TECH-RADAR.md、DEC-*.md） | 项目：`{project}/.claude/skills/` |
| 步骤通用（无项目特定路径） | UDS：`skills/{name}/` + zh-CN 语系 |

## 工作流程

### 步骤 1 — 描述流程

记录重复的步骤序列：
- 哪些步骤？按什么顺序？
- 目前已手动执行几次？
- 会接触哪些工具或文件？

### 步骤 2 — 更新 SKILL-CANDIDATES.md

打开你项目的 `SKILL-CANDIDATES.md`（第一次使用时从 `templates/SKILL-CANDIDATES.md` 复制）：
- 尚未记录 → 新增一行，填入当前次数
- 已记录 → 更新次数
- 次数达 3 → 标记触发 ✅，继续进行

### 步骤 3 — 选择路径（Simple / Complex / Delta）

回答 4 个判断问题，决定：Simple、Complex 或 Delta。

### 步骤 4a — Simple：填写 Skill Brief

使用 `templates/SKILL-BRIEF-TEMPLATE.md`：
- 触发情境（什么时候会用这个？）
- 核心步骤（3～7 个，有序）
- 验收条件（2～3 条）
- 不涵盖的部分（明确边界）

### 步骤 4b — Complex：创建 XSPEC

执行 `/sdd` 创建 XSPEC。XSPEC 核准后回到步骤 5。

### 步骤 4c — Delta：识别变更范围

识别现有 SKILL.md 中哪些区段需要变更。
在末尾加入 `## MODIFIED Requirements` 或 `## ADDED Requirements`。

### 步骤 5 — 创建 / 更新 SKILL.md

从 Brief 或 XSPEC 生成 SKILL.md：
- 验证 frontmatter：`name`、`scope`、`description`、`allowed-tools`
- UDS Skill：同时创建 zh-CN 语系版本
- 项目 Skill：放置于 `{project}/.claude/skills/{name}/SKILL.md`

### 步骤 6 — 更新 SKILL-CANDIDATES.md

标记候选行：触发 ✅，Skill 字段填入名称。

### 步骤 7 — Commit

```
feat(skills): Add /{skill-name} skill. 新增 /{skill-name} Skill。

{English description, 1-2 lines}

{Chinese description, 1-2 lines}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## 输出检查清单

完成所有步骤后，验证：

- [ ] `SKILL-CANDIDATES.md` 已更新（触发 ✅，Skill 名称已填入）
- [ ] `SKILL.md` 已创建，含完整 frontmatter（`name`/`scope`/`description`/`allowed-tools`）
- [ ] Simple 路径：Skill Brief 已被引用或保存
- [ ] Complex 路径：XSPEC ID 已在 SKILL.md 标头注释中标注
- [ ] UDS Skill：zh-CN 语系文件已创建
- [ ] 废弃：frontmatter 中含 `status: deprecated`
- [ ] git commit 已完成

## 参考

- Skill Brief 模板：[templates/SKILL-BRIEF-TEMPLATE.md](../../../../templates/SKILL-BRIEF-TEMPLATE.md)
- 候选追踪：[templates/SKILL-CANDIDATES.md](../../../../templates/SKILL-CANDIDATES.md)（复制到你的项目）
- ADR 标准：[core/adr-standards.md](../../../../core/adr-standards.md)
