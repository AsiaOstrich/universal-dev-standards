---
name: adr
scope: universal
description: |
  [UDS] Create, manage, and track Architecture Decision Records (ADR).
  Use when: architecture decisions, technology choices, design trade-offs, pattern selection.
  Keywords: ADR, architecture decision, decision record, trade-off, 架構決策, 決策記錄.
allowed-tools: Read, Write, Glob, Grep
argument-hint: "[create | list | supersede ADR-NNN | 決策主題]"
---

# ADR Assistant | 架構決策記錄助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/adr-assistant/SKILL.md)

Create, manage, and track Architecture Decision Records. Capture the context, options, and rationale behind significant technical decisions.

建立、管理和追蹤架構決策記錄。捕捉重大技術決策的背景、選項和理由。

## Workflow | 工作流程

```
CAPTURE ──► ANALYZE ──► DECIDE ──► RECORD ──► LINK
  捕捉背景    分析選項    做出決策    記錄 ADR    建立連結
```

### Phase 1: CAPTURE | 捕捉背景

Identify the context and constraints driving the decision.

識別驅動決策的背景與限制條件。

| Step | Action | 步驟 |
|------|--------|------|
| 1 | Identify the problem or opportunity | 識別問題或機會 |
| 2 | List constraints (time, budget, team skills) | 列出限制條件 |
| 3 | Define decision drivers | 定義決策驅動因素 |

### Phase 2: ANALYZE | 分析選項

Explore at least 2 options with pros and cons.

至少探索 2 個選項，列出優缺點。

| Step | Action | 步驟 |
|------|--------|------|
| 1 | Brainstorm candidate options | 腦力激盪候選方案 |
| 2 | Evaluate each against decision drivers | 根據決策驅動因素評估 |
| 3 | Document pros/cons for each | 記錄各方案優缺點 |

### Phase 3: DECIDE | 做出決策

Select the best option and articulate the rationale.

選擇最佳方案並闡述理由。

### Phase 4: RECORD | 記錄 ADR

Generate the ADR file following the standard template.

依照標準模板產生 ADR 檔案。

### Phase 5: LINK | 建立連結

Cross-reference with related artifacts (SPECs, PRs, code).

與相關工件（規格、PR、程式碼）建立交叉引用。

## Quick Reference | 快速參考

### When to Write an ADR | 何時撰寫 ADR

| Write ADR | Skip ADR |
|-----------|----------|
| Framework/library choice | Routine dependency update |
| API contract or data format | Bug fix within existing architecture |
| Deployment strategy change | Code style decision |
| Establishing new patterns | Trivial implementation choice |

**Rule of thumb**: If someone might ask "why?" in 6 months, write an ADR.

**經驗法則**：如果 6 個月後有人可能會問「為什麼？」，就寫一份 ADR。

### Status Lifecycle | 狀態生命週期

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

| Status | Description | 說明 |
|--------|-------------|------|
| **Proposed** | Under discussion | 討論中 |
| **Accepted** | Active, should be followed | 已接受，應遵循 |
| **Deprecated** | No longer relevant | 不再適用 |
| **Superseded** | Replaced by newer ADR | 已被新 ADR 取代 |

### ADR Template Summary | 模板摘要

```markdown
# ADR-NNN: [Title]

- Status: [Proposed | Accepted | Deprecated | Superseded]
- Date: YYYY-MM-DD
- Deciders: [people]
- Technical Story: [SPEC-ID or Issue]

## Context
## Decision Drivers
## Considered Options
## Decision Outcome
### Consequences (Good / Bad / Neutral)
## Links
```

### Storage | 存放位置

```
docs/adr/
├── ADR-001-short-description.md
├── ADR-002-short-description.md
└── README.md    # Index (optional)
```

## Commands | 指令

| Command | Action | 說明 |
|---------|--------|------|
| `/adr` | Interactive ADR creation wizard | 互動式建立 ADR |
| `/adr create` | Create a new ADR | 建立新 ADR |
| `/adr list` | List all ADRs with status | 列出所有 ADR 及狀態 |
| `/adr search [keyword]` | Search ADRs by keyword | 依關鍵字搜尋 ADR |
| `/adr supersede [ADR-NNN]` | Supersede an existing ADR | 取代現有 ADR |
| `/adr review` | Review ADRs for staleness | 審查過期的 ADR |

## Integration with Other Skills | 與其他技能的整合

| Skill | Integration | 整合方式 |
|-------|-------------|---------|
| `/sdd` | Reference ADRs in Technical Design; suggest creating ADR for major decisions | 在技術設計中引用 ADR |
| `/review` | Reference ADRs as design rationale during code review | 程式碼審查時引用 ADR |
| `/commit` | Include `ADR-NNN` in commit footer for traceability | 提交時在 footer 加入 ADR 編號 |
| `/brainstorm` | Feed brainstorm output into ADR option analysis | 腦力激盪結果作為 ADR 選項分析輸入 |

## Quality Checklist | 品質檢查清單

Before accepting an ADR:

| Check | Criteria | 標準 |
|-------|----------|------|
| ☐ Context | Clearly explains the problem | 清楚說明問題 |
| ☐ Options | At least 2 options considered | 至少考慮 2 個選項 |
| ☐ Drivers | Decision drivers explicitly listed | 決策驅動因素明確列出 |
| ☐ Consequences | Both good and bad outcomes | 包含正面與負面結果 |
| ☐ Links | Related artifacts referenced | 相關工件已引用 |

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
