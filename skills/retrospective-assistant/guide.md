---
scope: universal
description: |
  Guide for facilitating structured team retrospectives.
  Use when: detailed retrospective facilitation, technique deep-dives, action tracking.
  Keywords: retrospective, retro, sprint, release, facilitation, action items, 回顧, 引導.
---

# Retrospective Assistant Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/retrospective-assistant/guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-26
**Applicability**: All software teams
**Scope**: universal
**Type**: Standard-backed Skill (core: retrospective-standards.md)

---

## Purpose

Teams that don't reflect don't improve. Without structured retrospectives, problems persist, frustrations accumulate, and the same mistakes repeat. A well-run retrospective transforms complaints into action and builds a culture of continuous improvement.

This skill integrates retrospectives into the UDS workflow:

```
/incident (reactive) ←→ /retrospective (proactive) ←→ /metrics (data)
```

---

## Detailed Workflow

### Phase 1: PREPARE — Gather Data

Before the session, collect objective data to anchor the discussion.

**For Sprint retrospectives:**

```bash
# Recent commits since last retro
git log --oneline --since="2 weeks ago"

# PRs merged
gh pr list --state merged --search "merged:>2026-03-12"

# Open issues/bugs
gh issue list --label bug --state open
```

**For Release retrospectives:**

Additionally collect:
- Release notes / changelog
- Deployment metrics (success rate, rollback count)
- Test coverage delta
- Customer feedback / support tickets

---

### Phase 2: GATHER — Collect Perspectives

Use a structured technique to ensure all voices are heard.

**Facilitation tips:**

1. **Silent writing first** (5 min) — Everyone writes their thoughts before discussion. This prevents anchoring and ensures introverts contribute.
2. **Round-robin sharing** — Each person shares one item at a time, rotating until all items are shared.
3. **No interrupting** — Listen fully before responding.
4. **Time-box** — Set a timer for each section.

#### Technique: Start-Stop-Continue (Detailed)

| Phase | Duration | Prompt |
|-------|----------|--------|
| Silent write | 5 min | "Write 2-3 items for each category" |
| Share Start | 5 min | "What new practices should we adopt?" |
| Share Stop | 5 min | "What practices are hurting us?" |
| Share Continue | 5 min | "What's working well that we should keep?" |
| Discuss | 10 min | "Which items have the most votes?" |
| Action items | 5 min | "Who owns what, by when?" |

#### Technique: Starfish (Detailed)

More nuanced than SSC. Use when the team needs finer granularity.

```
        More of
          │
 Start ───┼─── Keep
          │
 Stop ────┼─── Less of
```

- **More of**: Things we do but should increase
- **Keep**: Things working perfectly — don't change
- **Less of**: Things we do too much
- **Start**: Brand new practices to adopt
- **Stop**: Things to eliminate completely

#### Technique: 4Ls (Detailed)

Emotion-focused. Best for team morale and psychological safety.

- **Liked**: "What did you enjoy this sprint?" (positive energy)
- **Learned**: "What new knowledge did you gain?" (growth)
- **Lacked**: "What was missing or insufficient?" (gaps)
- **Longed for**: "What do you wish was different?" (aspirations)

#### Technique: Sailboat (Detailed)

Visual metaphor. Draw on a whiteboard:

```
                    🏝️ Island (Goal)
                   /
    💨 Wind ──── ⛵ ──── 🪨 Rocks (Risks)
   (Strengths)    |
                  ⚓ Anchor (Impediments)
```

---

### Phase 3: ANALYZE — Find Patterns

After gathering, group related items into themes:

1. **Affinity mapping** — Cluster similar items together
2. **Dot voting** — Each person gets 3 votes to prioritize
3. **Identify root causes** — For top-voted items, ask "why?" to dig deeper

---

### Phase 4: DECIDE — Create Action Items

Convert the top 1-3 themes into concrete action items.

**SMART format:**
- **S**pecific — Clear, unambiguous description
- **M**easurable — How will we know it's done?
- **A**ssignable — Single owner, not "the team"
- **R**ealistic — Achievable in one iteration
- **T**ime-bound — Has a due date

**Example:**

| # | Action | Owner | Due | Metric |
|---|--------|-------|-----|--------|
| 1 | Add pre-commit hook for lint | Alice | 2026-04-05 | Zero lint errors in CI |
| 2 | Pair programming for onboarding | Bob | 2026-04-12 | New dev ships PR in week 1 |
| 3 | Reduce PR review time to < 24h | Carol | 2026-04-12 | Avg review time metric |

---

### Phase 5: TRACK — Follow Through

This is where most teams fail. Without tracking, retrospectives become venting sessions.

**At the start of every retrospective:**

1. Pull up previous retro's action items
2. Review each: Done? In Progress? Blocked?
3. Celebrate completed items
4. Re-evaluate stale items (2+ cycles open)

---

## Release Retrospective: Additional Sections

Release retros include everything from Sprint retros plus:

### Metrics Comparison

```markdown
## Metrics Summary
| Metric | This Release | Previous | Trend | Target |
|--------|-------------|----------|-------|--------|
| Stories delivered | 24 | 18 | ↑ +33% | 20 |
| Bugs found in QA | 3 | 7 | ↓ -57% | < 5 |
| Test coverage | 87% | 84% | ↑ +3% | 85% |
| Avg PR review time | 18h | 32h | ↓ -44% | < 24h |
| Deployment success | 100% | 90% | ↑ | 100% |
```

### Release Goals Assessment

```markdown
## Release Goals
| Goal | Status | Notes |
|------|--------|-------|
| Ship user dashboard v2 | ✅ Done | Delivered on time |
| Reduce API latency to < 200ms | ⚠️ Partial | P95 at 180ms, P99 at 350ms |
| Zero critical bugs at launch | ✅ Done | Clean launch |
```

---

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Skipping retro when "too busy" | Problems compound | Non-negotiable ceremony |
| Only discussing negatives | Team morale drops | Always include "what went well" |
| Action items without owners | Nothing gets done | Every item needs a name |
| No data, just feelings | Discussions go in circles | Start with metrics |
| Same technique every time | Retro fatigue | Rotate techniques |

---

## FAQ

**Q: How is this different from `/incident` post-mortem?**
A: `/incident` is reactive (triggered by an outage/bug). `/retrospective` is proactive (scheduled at iteration/release boundaries). Different trigger, different scope, complementary practices.

**Q: How often should we do retrospectives?**
A: Every sprint/iteration. For teams not using sprints, at least once a month. Release retros happen after each release.

**Q: What if the team is too small (1-2 people)?**
A: Solo retrospectives are still valuable. Use the same template but as a personal reflection exercise. AI assistants can serve as a "thinking partner."

---

## Reference

- Core Standard: [retrospective-standards.md](../../core/retrospective-standards.md)
- SKILL: [SKILL.md](./SKILL.md)
