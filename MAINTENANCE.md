---
version: 1.0.0
last_updated: 2026-04-22
---

# Maintenance Guide

> **Maintenance workflow has moved to the AsiaOstrich dev-platform planning hub.**
>
> Merged into `OPERATION-WORKFLOW.md` in v2.0.0; migrated to internal planning hub in v5.1.1 per DEC-047.

## Quick Reference

For day-to-day maintenance, follow the verification steps in `CLAUDE.md` (§Post-Modification Verification).

- Archived version v1.1.0ï¼å·²å°å­ï¼ — original standalone guide

## Bundle-Source Parity (XSPEC-072 / DEC-045)

The npm-bundled standards (`cli/bundled/`, derived from `ai/`) must stay a
**subset** of the source-of-truth `.standards/`. The layout contract is
defined in DEC-045 §6.2.

### Release-time enforcement (automatic — XSPEC-072 Phase 4.2)

`scripts/bump-version.mjs` (and the legacy `bump-version.sh`) run a pre-flight
parity gate **before** touching any version file and **abort the bump** on
drift. Equivalent manual run:

```bash
cd cli
npm run prepack                # regenerate cli/bundled/ from ai/
npm run check:bundle-parity    # must exit 0 (source == bundled modulo excludes)
```

Break-glass: `SKIP_BUNDLE_PARITY=1 node scripts/bump-version.mjs <version>`
skips the gate (loudly warned) — use only when tooling is broken **and** you
have confirmed parity by other means.

The GHA `bundle-parity.yml` workflow independently hard-fails on any mismatch
in PRs and pushes to `main`. These two points (release gate + CI) are the
enforcement surface; a local pre-commit/pre-push hook (XSPEC-072 Phase 3.2) is
intentionally **not** added — it would re-run `prepack` on every push for
marginal benefit over the two gates above.

### Adding a new standard — bundle decision flow (DEC-045 §6.2)

When you add a `.ai.yaml` under `.standards/`, decide its bundle scope:

1. **Bundle ⊂ Source** — every bundled file must have a `.standards/` counterpart; no bundle-only files.
2. **Default heuristic (rule 5):** a **level ≤ 2** core standard also goes into the bundle → add it to `ai/standards/<name>.ai.yaml` (adopter-facing). A **level ≥ 3** or governance / AI-collaboration standard stays source-only → add its path to `cli/scripts/bundle-exclude.json` as `{ "path", "reason" }` (overridable).
3. **Options** → always use the nested layout `options/<category>/<choice>.ai.yaml`; flat paths are forbidden.
4. **No ambiguous duplicates** — two files with the same basename under different paths must be unified, not both kept.

Then run `cd cli && npm run prepack && npm run check:bundle-parity` and confirm exit 0.

### If parity fails

1. **New file in `.standards/` not in `ai/`** → copy to `ai/standards/` (if adopter-facing) or add to `cli/scripts/bundle-exclude.json` (if UDS-internal)
2. **New file in `ai/` not in `.standards/`** → copy to `.standards/`
3. **New option file** → ensure it exists in both `ai/options/<cat>/` and `.standards/options/<cat>/`

## Translations

- [繁體中文](locales/zh-TW/MAINTENANCE.md)
- [简体中文](locales/zh-CN/MAINTENANCE.md)
