# Skill Tiering Rationale

> Companion to [`skills/README.md`](../skills/README.md) §Skill Tiers.
> Decision context: [DEC-061 (dev-platform)](https://github.com/AsiaOstrich/dev-platform/blob/main/cross-project/decisions/DEC-061-uds-skill-listing-budget.md).

## Why tier skills?

Claude Code lists every available skill to the assistant's context, costing tokens. By default 1% of the model's context window is reserved (`skillListingBudgetFraction`). When the budget overflows, descriptions are truncated and the most-used skills win — but in a UDS-adopting project plus user-installed plugins (huggingface-skills, MCP, etc.) the budget runs out fast.

UDS proposes three tiers so adopters can suppress descriptions of rarely-used skills while keeping every skill callable via `/<name>`.

## Criteria

A skill's tier is determined by **invocation frequency** and **discovery sensitivity**:

| Tier | Frequency | Discovery sensitivity | Reference `skillOverrides` |
|------|-----------|----------------------|--------------------------|
| **1 Core** | Daily — used in nearly every session | High — Claude must auto-suggest it | `"on"` |
| **2 Advanced** | Weekly — used multiple times per sprint | Medium — auto-suggest expected | `"on"` |
| **3 Specialist** | Monthly / event-driven | Low — user explicitly invokes | `"name-only"` |

### Tier 1 (Core) inclusion test
- [ ] User invokes the skill in ≥3 of 5 typical sessions
- [ ] The skill is part of the standard commit/test/review loop
- [ ] Misclassifying it as Tier 3 would block normal workflow

### Tier 2 (Advanced) inclusion test
- [ ] User invokes the skill weekly but not daily
- [ ] Skill maps to a recurring engineering activity (deploy, security review, API design)
- [ ] Description is needed for Claude to disambiguate (vs. similar skills)

### Tier 3 (Specialist) inclusion test
- [ ] User invokes the skill monthly or per-incident
- [ ] Skill is event-driven (incident, migration, retrospective)
- [ ] User typically *types* `/<name>` rather than expecting auto-suggestion
- [ ] Suppressing description has minimal cost (skill still callable)

## Mapping to DEC-051 four-layer classification

[DEC-051](https://github.com/AsiaOstrich/dev-platform/blob/main/cross-project/decisions/DEC-051-uds-vibeops-classification-model.md) defines: **Standards → Skills → Flows → Adapters**. Tiering is **orthogonal** to that classification — all tiered items are Skills layer; tier is a *frequency* axis, DEC-051 is a *kind* axis.

## How adopters override

Adopters are encouraged to override the reference. Common adjustments:

- **Promote** a Tier 3 to `"on"` if the team uses it weekly (e.g., a SRE-heavy team uses `runbook-assistant` daily → promote to `"on"`)
- **Demote** any Tier 1/2 to `"name-only"` if the team doesn't use it (e.g., team uses GitHub Actions only → demote `ci-cd-assistant`)
- **Disable** entirely with `"user-invocable-only"` or `"off"` — but check `/skills` first

Reference: [`examples/skill-overrides-recommended.json`](../examples/skill-overrides-recommended.json).

## Re-tiering policy

Tiering is a living document. Promote/demote when:
- Telemetry shows usage frequency has shifted (≥2 quarters of data)
- A skill's scope changes materially (split, merge, deprecation)
- A new skill is added — assign tier in the same PR that adds the skill

The PR that adds or moves a skill must update both `skills/README.md` §Skill Tiers and `examples/skill-overrides-recommended.json` (if Tier 3).
