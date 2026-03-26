---
name: retrospective
scope: universal
description: |
  [UDS] Guide structured team retrospectives for Sprint and Release cycles.
  Use when: sprint end, release post-mortem, iteration review, process improvement.
  Keywords: retrospective, retro, sprint review, lessons learned, action items, 回顧, 檢討, 持續改善.
allowed-tools: Read, Write, Glob, Grep
argument-hint: "[sprint | release | actions | --technique starfish]"
---

# Retrospective Assistant | 回顧助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/retrospective-assistant/SKILL.md)

Guide structured team retrospectives to identify improvements and track action items. Support Sprint and Release retrospective types with multiple facilitation techniques.

引導結構化的團隊回顧，識別改善機會並追蹤行動項目。支援 Sprint 和 Release 回顧類型，提供多種引導技法。

## Workflow | 工作流程

```
PREPARE ──► GATHER ──► ANALYZE ──► DECIDE ──► TRACK
  準備資料    蒐集意見    分析歸納    決定行動    追蹤落實
```

### Phase 1: PREPARE | 準備

Gather data from git log, metrics, and issue tracker to ground the discussion.

從 git log、指標和 issue tracker 蒐集數據作為討論基礎。

### Phase 2: GATHER | 蒐集

Collect perspectives using a structured technique.

使用結構化技法蒐集團隊觀點。

### Phase 3: ANALYZE | 分析

Group items and identify patterns.

分組歸納並識別模式。

### Phase 4: DECIDE | 決定

Select top 1-3 improvements as action items.

選出前 1-3 項改善作為行動項目。

### Phase 5: TRACK | 追蹤

Review previous actions and track new ones.

檢視過去的行動項目並追蹤新項目。

## Retrospective Types | 回顧類型

| Type | When | Duration | Focus | 焦點 |
|------|------|----------|-------|------|
| **Sprint** | End of iteration | 30-60 min | Process, collaboration, tools | 流程、協作、工具 |
| **Release** | After release | 60-90 min | Quality, metrics, cross-team | 品質、指標、跨團隊 |

## Facilitation Techniques | 引導技法

| Technique | Best For | Structure | 結構 |
|-----------|----------|-----------|------|
| **Start-Stop-Continue** | Quick, default | Start / Stop / Continue | 開始 / 停止 / 繼續 |
| **Starfish** | Nuanced analysis | More / Keep / Less / Start / Stop | 更多 / 保持 / 減少 / 開始 / 停止 |
| **4Ls** | Team building | Liked / Learned / Lacked / Longed for | 喜歡 / 學到 / 缺少 / 渴望 |
| **Sailboat** | Visual, creative | Wind / Anchor / Rocks / Island | 風 / 錨 / 礁石 / 島嶼 |

## Commands | 指令

| Command | Action | 說明 |
|---------|--------|------|
| `/retrospective` | Interactive Sprint retrospective (default) | 互動式 Sprint 回顧 |
| `/retrospective sprint` | Sprint retrospective | Sprint 回顧 |
| `/retrospective release` | Release retrospective with metrics | Release 回顧（含指標） |
| `/retrospective actions` | List open action items | 列出未完成行動項目 |
| `/retrospective --technique starfish` | Use specific technique | 使用指定技法 |

## Action Item Format | 行動項目格式

| Field | Description | 說明 |
|-------|-------------|------|
| **Action** | Specific description | 具體描述 |
| **Owner** | Single person responsible | 單一負責人 |
| **Due Date** | Target completion | 預計完成日 |
| **Status** | Open → In Progress → Done | 狀態 |

### Tracking Rules | 追蹤規則

1. Review open actions at **start** of each retrospective | 每次回顧開始先檢視未完成項目
2. Max **3 action items** per retro | 每次回顧最多 3 項
3. Stale items (2+ cycles) must be re-evaluated | 超過 2 個循環未完成須重新評估
4. Each item has **one owner** | 每項須有單一負責人

## Storage | 存放

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md    # Index (optional)
```

## Integration | 與其他技能的整合

| Skill | Integration | 整合方式 |
|-------|-------------|---------|
| `/metrics` | Pull metrics data into release retrospective | 引用指標數據 |
| `/incident` | Post-incident, suggest team retrospective | 事故後建議回顧 |
| `/adr` | If architecture issues found, suggest ADR | 識別架構問題時建議 ADR |
| `/commit` | Commit retro report with `docs(retro):` | 提交回顧報告 |

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
