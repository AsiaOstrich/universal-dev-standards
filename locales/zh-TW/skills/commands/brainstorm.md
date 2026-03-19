---
source: ../../../../skills/commands/brainstorm.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: brainstorm
description: "[UDS] Structured AI-assisted brainstorming before spec creation"
argument-hint: "[problem or feature idea | 問題或功能構想]"
---

# 腦力激盪助手

> **Language**: [English](../../../../skills/commands/brainstorm.md) | 繁體中文

在撰寫規格前進行結構化發想。透過引導式腦力激盪，將模糊構想轉化為可執行的功能提案。

---

## 用法

```bash
/brainstorm [problem or feature idea]
```

## 工作流程

```
FRAME ──► DIVERGE ──► CONVERGE ──► OUTPUT
定義問題     發散思考       收斂評估       輸出提案
```

| 階段 | 目標 | 關鍵技法 |
|------|------|----------|
| **FRAME** | 清楚定義問題 | 5 Whys, HMW, Stakeholder Map |
| **DIVERGE** | 產生大量想法 | HMW, SCAMPER, Six Thinking Hats |
| **CONVERGE** | 評估與排序 | Evaluation Matrix, Dot Voting |
| **OUTPUT** | 可執行的報告 | Brainstorm Report template |

## 技法

| 技法 | 適用場景 |
|------|----------|
| **5 Whys** | 找到根本原因 |
| **HMW** | 將問題重構為機會 |
| **SCAMPER** | 改善現有功能 |
| **Six Thinking Hats** | 多角度分析 |
| **Dot Voting** | 快速排序 |

## 範例

```bash
/brainstorm                           # 啟動互動式會話
/brainstorm "user retention"          # 針對特定主題腦力激盪
/brainstorm --technique scamper       # 使用特定技法
```

## 輸出格式

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

## 後續步驟

腦力激盪後，典型的工作流程為：

1. `/brainstorm` - 結構化發想（本命令）
2. `/requirement` - 撰寫使用者故事和需求
3. `/sdd` - 建立規格文件
4. `/derive-all` 或 `/tdd` - 以測試保護進行實作

## 參考

* [Brainstorm Assistant Skill](../brainstorm-assistant/SKILL.md)
* [Requirement Assistant](../requirement-assistant/SKILL.md)
* [Spec-Driven Development](../spec-driven-dev/SKILL.md)
