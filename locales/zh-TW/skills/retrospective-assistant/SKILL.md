---
name: retrospective-assistant
source: ../../../../skills/retrospective-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: "[UDS] 引導結構化的團隊回顧，支援 Sprint 和 Release 回顧"
---

# 回顧助手

> **語言**: [English](../../../../skills/retrospective-assistant/SKILL.md) | 繁體中文

引導結構化的團隊回顧，識別改善機會並追蹤行動項目。

## 指令

| 指令 | 說明 |
|------|------|
| `/retrospective` | 互動式 Sprint 回顧（預設） |
| `/retrospective sprint` | Sprint 回顧 |
| `/retrospective release` | Release 回顧（含指標） |
| `/retrospective actions` | 列出未完成行動項目 |
| `/retrospective --technique starfish` | 使用指定技法 |

## 參考

- 核心規範：[retrospective-standards.md](../../../../core/retrospective-standards.md)
- 詳細指南：[guide.md](./guide.md)


## Next Steps Guidance | 下一步引導

After `/retrospective` completes:

> **Retrospective complete. Suggested next steps:**
> - Commit the retrospective report: `/commit`
> - Create ADRs for architectural decisions identified: `/adr`
> - Track action items in your issue tracker
> - Schedule next retrospective

> **回顧完成。建議下一步：**
> - 提交回顧報告：`/commit`
> - 為識別的架構決策建立 ADR：`/adr`
> - 在 issue tracker 中追蹤行動項目
> - 排定下次回顧

## AI Agent Behavior | AI 代理行為

When `/retrospective` is invoked:

1. **Check type** — Sprint (default) or Release
2. **Gather data** — Scan git log, check `docs/retrospectives/` for previous actions
3. **Guide technique** — Use Start-Stop-Continue by default, or specified technique
4. **Generate report** — Write to `docs/retrospectives/RETRO-YYYY-MM-DD-[type].md`
5. **Review past actions** — Check previous retro for open action items
6. **Offer next steps** — Show guidance above

When `/retrospective actions` is invoked:
1. Scan `docs/retrospectives/` for all retro files
2. Parse action items from each
3. Display open/in-progress items as table

## Reference | 參考

- Core Standard: [retrospective-standards.md](../../core/retrospective-standards.md)
- Detailed Guide: [guide.md](./guide.md)
