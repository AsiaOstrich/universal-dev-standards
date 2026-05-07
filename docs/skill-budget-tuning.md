# Skill Budget Tuning Guide

> Reduce Claude Code's `/doctor` warning about truncated skill descriptions, while keeping every UDS skill callable.

## Background

Claude Code reserves a fraction of the assistant's context window for the skill listing it shows the model. The default is **1%** (controlled by `skillListingBudgetFraction` in `settings.json`). When the budget overflows, less-used skills lose their descriptions — the assistant can still invoke them, but it won't *auto-discover* them based on what the user is doing.

In a UDS-adopting project plus user-installed plugins (e.g. `huggingface-skills`, MCP servers), the budget commonly overflows. Symptom from `/doctor`:

```
Skill listing will be truncated
  60 descriptions dropped (full descriptions kept for most-used skills) (3.1%/1% of context)
    run /skills to disable some, or raise skillListingBudgetFraction (currently 1%) in settings.json
```

UDS provides a tier-based reference setting that hides Tier 3 (specialist) skill descriptions, freeing up budget for higher-priority skills (UDS Tier 1/2 + your own plugins).

## Quick start

### Option A — User-level (applies to all your projects)

Edit `~/.claude/settings.json`:

```json
{
  "skillOverrides": {
    "incident-response-assistant": "name-only",
    "observability-assistant": "name-only",
    "slo-assistant": "name-only",
    "runbook-assistant": "name-only",
    "retrospective-assistant": "name-only",
    "durable-execution-assistant": "name-only",
    "metrics-dashboard-assistant": "name-only",
    "migration-assistant": "name-only",
    "security-scan-assistant": "name-only",
    "brainstorm-assistant": "name-only",
    "skill-builder": "name-only"
  }
}
```

(Or copy the block from [`examples/skill-overrides-recommended.json`](../examples/skill-overrides-recommended.json).)

### Option B — Project-level (only this repo)

Edit `.claude/settings.json` at the project root with the same `skillOverrides` block. Project settings override user settings per-key.

### Verify

1. Restart Claude Code (or reload `/skills`)
2. Run `/doctor`
3. Expect: UDS skills no longer appear in the "dropped" list; total skill budget usage closer to 0.5–0.7% (varies by other installed plugins)

## How it works

| `skillOverrides` value | Listing behavior | Auto-trigger | Manual `/<name>` |
|-----------------------|------------------|--------------|------------------|
| `"on"` | Full description | ✅ Yes | ✅ Yes |
| `"name-only"` | Name only (no description) | ❌ No (Claude can't know what it does) | ✅ Yes |
| `"user-invocable-only"` | Hidden from listing | ❌ No | ✅ Yes |
| `"off"` | Hidden entirely | ❌ No | ❌ No |

UDS reference uses `"name-only"` for Tier 3 — saves budget without disabling the skill.

## Customizing tiers

Adopters are encouraged to override the reference based on their team's workflow:

### Example 1 — SRE-heavy team
A team that practices incident drills weekly should *promote* `runbook-assistant` and `incident-response-assistant`:

```json
{
  "skillOverrides": {
    "runbook-assistant": "on",
    "incident-response-assistant": "on",
    "observability-assistant": "on"
  }
}
```

### Example 2 — Frontend-only project
A frontend team that doesn't deploy backend infra can *demote* infrastructure skills:

```json
{
  "skillOverrides": {
    "database-assistant": "name-only",
    "api-design-assistant": "name-only",
    "ci-cd-assistant": "name-only"
  }
}
```

### Example 3 — Aggressive savings
If you're hitting budget hard, demote Tier 2 skills you rarely use to `"name-only"`. Skills you never use can go `"user-invocable-only"`. Only set `"off"` if you're sure you'll never want auto-discovery.

## Raising the budget instead

If you'd rather pay the token cost than tier-suppress, raise the budget:

```json
{
  "skillListingBudgetFraction": 0.02
}
```

> **Tradeoff**: 2% of a 200k-token context = ~4k tokens *every session*, charged against your rate limits. UDS reference defaults to tier-suppression because it preserves auto-discovery for the skills that matter most.

## Reference

- [`examples/skill-overrides-recommended.json`](../examples/skill-overrides-recommended.json) — copy-paste reference
- [`skills/README.md` §Skill Tiers](../skills/README.md#skill-tiers-listing-budget-optimization) — tier membership
- [`flows/skill-tiering-rationale.md`](../flows/skill-tiering-rationale.md) — tiering criteria
- DEC-061 (dev-platform): [decisions/DEC-061-uds-skill-listing-budget.md](https://github.com/AsiaOstrich/dev-platform/blob/main/cross-project/decisions/DEC-061-uds-skill-listing-budget.md)
- Claude Code `/skills` command — interactive override editor
