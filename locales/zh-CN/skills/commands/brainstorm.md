---
source: ../../../../skills/commands/brainstorm.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: brainstorm
description: "[UDS] Structured AI-assisted brainstorming before spec creation"
argument-hint: "[问题或功能构想 | problem or feature idea]"
---

# 脑力激荡助手

在撰写规格前进行结构化发想。通过引导式脑力激荡，将模糊构想转化为可执行的功能提案。

## 用法

```bash
/brainstorm [problem or feature idea]
```

## 工作流程

```
FRAME ──► DIVERGE ──► CONVERGE ──► OUTPUT
定义问题     发散思考       收敛评估       输出提案
```

| 阶段 | 目标 | 关键技法 |
|------|------|----------|
| **FRAME** | 清楚定义问题 | 5 Whys, HMW, Stakeholder Map |
| **DIVERGE** | 生成大量想法 | HMW, SCAMPER, Six Thinking Hats |
| **CONVERGE** | 评估与排序 | Evaluation Matrix, Dot Voting |
| **OUTPUT** | 可执行的报告 | Brainstorm Report template |

## 技法

| 技法 | 适用场景 |
|------|----------|
| **5 Whys** | 找到根本原因 |
| **HMW** | 将问题重构为机会 |
| **SCAMPER** | 改善现有功能 |
| **Six Thinking Hats** | 多角度分析 |
| **Dot Voting** | 快速排序 |

## 范例

```bash
/brainstorm                           # Start interactive session
/brainstorm "user retention"          # Brainstorm around a topic
/brainstorm --technique scamper       # Use a specific technique
```

## 输出格式

```markdown
# Brainstorm Report: [Topic]

## Problem Statement
[Refined problem from FRAME phase]

## Top 3 Recommendations
1. **[Idea]** — Score: X.X — [Why recommended]
2. **[Idea]** — Score: X.X — [Why recommended]
3. **[Idea]** — Score: X.X — [Why recommended]

## Next Steps
- [ ] Proceed to `/requirement` with top idea
- [ ] Proceed to `/sdd` if requirements are clear
```

## 后续步骤

脑力激荡后，典型的工作流程是：

1. `/brainstorm` - 结构化发想（本命令）
2. `/requirement` - 撰写用户故事和需求
3. `/sdd` - 创建规格文档
4. `/derive-all` 或 `/tdd` - 以测试保护进行实现

## 参考

* [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md)
* [Requirement Assistant](../requirement-assistant/SKILL.md)
* [Spec-Driven Development](../spec-driven-dev/SKILL.md)
