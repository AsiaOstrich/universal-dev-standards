# Retrospective Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/retrospective-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-26
**Applicability**: All software teams practicing iterative development
**Scope**: universal
**Industry Standards**: Scrum Guide (Sprint Retrospective), CMMI Level 3, ISO/IEC 12207 §6.3.6
**References**: [Scrum Guide](https://scrumguides.org/), [Fun Retrospectives](https://www.funretrospectives.com/)

---

## Purpose

Retrospectives are structured team reflections that identify what worked well, what needs improvement, and concrete actions to improve the process. They are a key practice in Agile methodologies and a requirement for process maturity (CMMI Level 3).

---

## When to Hold a Retrospective

| Type | When | Duration | Focus |
|------|------|----------|-------|
| **Sprint** | End of every iteration | 30-60 min | Team process, collaboration, tools |
| **Release** | After each release | 60-90 min | Delivery quality, cycle metrics, cross-team coordination |

### Distinction from Post-Mortems

| Aspect | Retrospective | Post-Mortem (Incident) |
|--------|--------------|----------------------|
| **Trigger** | Planned (end of iteration/release) | Reactive (after an incident) |
| **Tone** | Improvement-focused | Root-cause focused |
| **Scope** | Entire process | Specific incident |
| **Frequency** | Regular (every 1-4 weeks) | As needed |

---

## Retrospective Workflow

```
PREPARE ──► GATHER ──► ANALYZE ──► DECIDE ──► TRACK
  準備資料    蒐集意見    分析歸納    決定行動    追蹤落實
```

### Phase 1: PREPARE

Gather data before the session to ground the discussion in facts.

| Data Source | What to Collect |
|------------|----------------|
| Git log | Commits, PRs merged, branches |
| Issue tracker | Stories completed, bugs found |
| CI/CD | Build success rate, deployment frequency |
| Metrics | Velocity, cycle time, test coverage |

### Phase 2: GATHER

Collect team perspectives using a structured technique (see below).

**Ground rules:**
- Focus on process, not people
- No blame — seek systemic causes
- Everyone participates
- Time-box each section

### Phase 3: ANALYZE

Group similar items and identify patterns across themes.

### Phase 4: DECIDE

Select the top 1-3 improvements to focus on. Each becomes an action item.

**Action item format:**

| Field | Description |
|-------|-------------|
| **Action** | Specific, actionable description |
| **Owner** | Single responsible person |
| **Due Date** | Target completion date |
| **Status** | Open → In Progress → Done |
| **Metric** | How to measure success (optional) |

### Phase 5: TRACK

Review previous action items at the start of the next retrospective.

---

## Facilitation Techniques

### Start-Stop-Continue (Default)

The simplest and most common technique. Good for quick retrospectives.

| Category | Question |
|----------|---------|
| **Start** | What should we begin doing? |
| **Stop** | What should we stop doing? |
| **Continue** | What should we keep doing? |

### Starfish

More nuanced than Start-Stop-Continue. Good for deeper analysis.

| Category | Question |
|----------|---------|
| **More of** | What should we do more of? |
| **Keep** | What should we keep as is? |
| **Less of** | What should we do less of? |
| **Start** | What should we start doing? |
| **Stop** | What should we stop doing? |

### 4Ls

Focuses on emotions and learning. Good for team building.

| Category | Question |
|----------|---------|
| **Liked** | What did you enjoy? |
| **Learned** | What did you learn? |
| **Lacked** | What was missing? |
| **Longed for** | What do you wish you had? |

### Sailboat

Visual metaphor. Good for creative teams.

| Element | Meaning |
|---------|---------|
| **Wind** | Forces pushing us forward (strengths) |
| **Anchor** | Forces holding us back (impediments) |
| **Rocks** | Risks ahead |
| **Island** | Our goal / destination |

---

## Retrospective Report Template

```markdown
# Retrospective: [Sprint N / Release vX.Y.Z]

- **Type**: [Sprint | Release]
- **Date**: YYYY-MM-DD
- **Participants**: [names]
- **Facilitator**: [name]
- **Technique**: [Start-Stop-Continue | Starfish | 4Ls | Sailboat]

## Previous Action Items Review
| # | Action | Owner | Status | Notes |
|---|--------|-------|--------|-------|
| 1 | [from last retro] | [person] | Done/Open | [update] |

## [Technique-specific sections]
(e.g., Start / Stop / Continue for SSC technique)

## Action Items
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | [description] | [person] | YYYY-MM-DD | Open |

## Key Learnings
- [learning 1]
- [learning 2]

## Metrics Summary (Release retrospective only)
| Metric | This Release | Previous | Trend |
|--------|-------------|----------|-------|
| Velocity | [value] | [value] | ↑/↓/→ |
| Bug Rate | [value] | [value] | ↑/↓/→ |
| Test Coverage | [%] | [%] | ↑/↓/→ |
| Cycle Time | [days] | [days] | ↑/↓/→ |
```

---

## Storage Convention

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md    # Index (optional)
```

### File Naming

- Format: `RETRO-YYYY-MM-DD-[type]-[identifier].md`
- Sprint: `RETRO-2026-03-15-sprint-12.md`
- Release: `RETRO-2026-03-26-release-v5.1.0.md`

---

## Action Item Lifecycle

```
Open ──► In Progress ──► Done
  │
  └──► Cancelled (with reason)
```

### Tracking Rules

1. Review all open action items at the **start** of each retrospective.
2. Action items not completed after **2 retrospective cycles** should be re-evaluated (escalate, redefine, or cancel).
3. Maximum **3 action items** per retrospective. Focus is better than breadth.
4. Each action item must have a **single owner** (not "the team").

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Skipping retrospectives | Process debt accumulates | Make it a non-negotiable ceremony |
| Blame game | People stop participating | Enforce "process not people" rule |
| No action items | Retrospective becomes venting | Always end with 1-3 concrete actions |
| Too many action items | Nothing gets done | Limit to 3 max, prioritize ruthlessly |
| Never reviewing past actions | Actions are forgotten | Always start with previous action review |
| Same facilitator always | Perspective bias | Rotate facilitator role |
| Only the loud voices | Missing perspectives | Use silent writing before discussion |

---

## Best Practices

1. **Hold retrospectives regularly** — consistency builds trust and habit.
2. **Vary the technique** — same format gets stale; rotate techniques.
3. **Time-box strictly** — 60 min max for sprints, 90 min for releases.
4. **Start with data** — ground discussions in metrics, not feelings.
5. **End with commitment** — every retrospective produces 1-3 action items.
6. **Follow through** — track and review actions; this is where value is created.
7. **Create psychological safety** — what's said in retro stays in retro.
8. **Celebrate wins** — don't only focus on problems; acknowledge what went well.
