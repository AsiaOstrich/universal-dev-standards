---
source: ../../../../skills/adr-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: |
  建立、管理和追踪架构决策记录（ADR）。
  使用时机：架构决策、技术选型、设计取舍。
  关键字：ADR, architecture decision, decision record, 架构决策, 决策记录。
---

# 架构决策记录助手

> **语言**: [English](../../../../skills/adr-assistant/SKILL.md) | 简体中文

建立、管理和追踪架构决策记录。捕捉重大技术决策的背景、选项和理由。

## 工作流程

```
CAPTURE ──► ANALYZE ──► DECIDE ──► RECORD ──► LINK
  捕捉背景    分析选项    做出决策    记录 ADR    建立链接
```

## 指令

| 指令 | 说明 |
|------|------|
| `/adr` | 交互式建立 ADR |
| `/adr create` | 建立新 ADR |
| `/adr list` | 列出所有 ADR 及状态 |
| `/adr search [关键字]` | 依关键字搜索 ADR |
| `/adr supersede [ADR-NNN]` | 取代现有 ADR |
| `/adr review` | 审查过期的 ADR |

## 参考

- 核心规范：[adr-standards.md](../../../../core/adr-standards.md)
- 详细指南：[guide.md](./guide.md)


## Next Steps Guidance | 下一步引導

After `/adr` completes, the AI assistant should suggest:

> **ADR created. Suggested next steps:**
> - Execute `/sdd` to create a spec if the decision requires implementation
> - Execute `/commit` to commit the ADR file
> - Update related SPECs to reference this ADR
> - Share with team for review if status is `Proposed`

> **ADR 已建立。建議下一步：**
> - 執行 `/sdd` 建立規格（若決策需要實作）
> - 執行 `/commit` 提交 ADR 檔案
> - 更新相關規格以引用此 ADR
> - 若狀態為 `Proposed`，分享給團隊審查

## AI Agent Behavior | AI 代理行為

When the user invokes `/adr`, the AI assistant MUST:

1. **Check existing ADRs** — Search `docs/adr/` to determine next ADR number
2. **Guide interactively** — Ask about context, drivers, and options step by step
3. **Generate the file** — Write ADR to `docs/adr/ADR-NNN-title.md`
4. **Suggest links** — Identify related SPECs or ADRs to cross-reference
5. **Offer next steps** — Show the Next Steps Guidance above

When the user invokes `/adr list`:
1. Scan `docs/adr/` directory
2. Parse status from each ADR file
3. Display as a table: Number, Title, Status, Date

When the user invokes `/adr supersede [ADR-NNN]`:
1. Read the existing ADR
2. Guide creation of a new ADR
3. Update old ADR status to `Superseded by ADR-NNN`
4. Add `Supersedes ADR-NNN` to new ADR

## Reference | 參考

- Core Standard: [adr-standards.md](../../core/adr-standards.md)
- Detailed Guide: [guide.md](./guide.md)
