# Translation Lifecycle Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/translation-lifecycle-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-20
**Status**: Trial (expires 2026-10-20)
**Applicability**: All projects with multi-language documentation
**Scope**: universal
**Source**: Derived from UDS BUG-A06 post-mortem (2026-04-20)
**Parent Standard**: [documentation-lifecycle](documentation-lifecycle.md)

---

## Purpose

Translation lifecycle standards: MISSING vs OUTDATED distinction, semver-aware severity classification, and automation integration (pre-commit hook, release gate).

The `documentation-lifecycle` standard mentions translation sync as a release-gate check, but does not define how to classify or respond to different degrees of drift. This standard fills that gap: a translation that is absent is fundamentally different from one that is slightly stale, and a major-version gap is fundamentally different from a patch bump. Without this distinction, teams either over-block (failing on any staleness) or under-block (ignoring all staleness until it becomes a user-visible defect).

**Evidence (BUG-A06 post-mortem)**:
1. UDS accumulated 32 missing translations over 3 months of adding new standards without a MISSING gate — only discovered during a Q2 audit.
2. `anti-hallucination.md` zh-CN was at 1.5.0 while the source shipped 1.5.1 — a new Agent Epistemic Calibration framework section was completely absent in the zh-CN edition, invisible to users.

---

## Core Rules

- `MISSING` (translation file does not exist) is always a release blocker — `exit 1`
- `MAJOR` version gap (source X vs translation x where X > x) is a release blocker — `exit 1`
- `MINOR` version gap is advisory — warn prominently, do not block
- `PATCH` version gap is advisory — warn softly, do not block
- Severity is determined by semver comparison of `source_version` in translation frontmatter vs current source file version
- Every translation file MUST have YAML frontmatter with `source`, `source_version`, `translation_version`, `last_synced`, `status`
- When a source standard is modified, the translation's `source_version` becomes stale immediately — this drift is detectable at commit time via pre-commit hook

---

## Severity Classification

| Level | Condition | Exit Code | Action |
|-------|-----------|-----------|--------|
| `MISSING` | Translation file does not exist | 1 | Create before release |
| `MAJOR` | source MAJOR > translation MAJOR | 1 | Update before stable release |
| `MINOR` | source MINOR > translation MINOR | 0 | Update before next release (advisory) |
| `PATCH` | source PATCH > translation PATCH | 0 | Update when convenient (advisory) |
| `CURRENT` | source_version == translation source_version | 0 | No action needed |

### Semver Diff Formula

```
diff_level = compare(
  strip_prerelease(current_source_version),
  strip_prerelease(translation.source_version)
)

where: MAJOR if maj differs, MINOR if min differs, else PATCH
```

---

## Trigger Conditions

| Event | Required Action |
|-------|----------------|
| New standard added to `core/` | Create translation in all supported locales (MISSING check blocks release) |
| Standard version bumped (PATCH) | Update translation's `source_version` + `last_synced` when convenient |
| Standard version bumped (MINOR) | Update translation content + frontmatter before next release |
| Standard version bumped (MAJOR) | Update translation content + frontmatter before current release (blocker) |
| Translation file manually updated | Bump `translation_version` + `last_synced` in frontmatter |

---

## Translation Frontmatter Protocol

Every translation file MUST begin with:

```yaml
---
source: ../../../core/<filename>.md          # relative path to source
source_version: <X.Y.Z>                      # source version at last sync
translation_version: <X.Y.Z>                 # translation's own version
last_synced: <YYYY-MM-DD>                    # date of last sync
status: current | outdated | draft           # human-readable status
---
```

When updating a translation after a source change:
1. Translate the new/changed content
2. Set `source_version` = new source version
3. Set `translation_version` = same as `source_version` (or bump independently)
4. Set `last_synced` = today's date
5. Set `status: current`

---

## Automation Integration

### Pre-Commit Hook

When `core/*.md` files are staged, the pre-commit hook runs `check-translation-sync.sh` and shows OUTDATED warnings. The hook **never blocks** the commit (blocking at commit time is too disruptive) — it is a reminder only.

Setup: `./scripts/install-hooks.sh` (one-time, after clone)

### Release Gate (`check-translation-sync.sh`)

Run before `npm publish` or as part of `pre-release-check.sh`:

```bash
bash scripts/check-translation-sync.sh
# exit 1 if MISSING or MAJOR gap found
# exit 0 if only MINOR/PATCH gaps (with advisory output)
```

### Version Bump Integration (`bump-version.sh`)

`bump-version.sh` automatically runs `check-translation-sync.sh` after version files are updated, showing the translation health snapshot at the moment of bump — giving the author immediate feedback on what needs updating before publish.

---

## Scenarios

**Scenario 1 — Standard patch bump (1.0.0 → 1.0.1)**
- Translation `source_version: 1.0.0`, source now at `1.0.1`
- Severity: `PATCH` — advisory, exit 0
- Action: Update at next opportunity, no release block

**Scenario 2 — Standard minor bump with new section (1.0.0 → 1.1.0)**
- Translation `source_version: 1.0.0`, source now at `1.1.0`
- Severity: `MINOR` — advisory, exit 0
- Action: Update before next release; zh-CN users missing new content

**Scenario 3 — Standard major rewrite (1.x.x → 2.0.0)**
- Translation `source_version: 1.5.0`, source now at `2.0.0`
- Severity: `MAJOR` — blocker, exit 1
- Action: Must update before stable release

**Scenario 4 — New standard, no translation file**
- No `locales/zh-TW/core/new-standard.md` exists
- Severity: `MISSING` — blocker, exit 1
- Action: Create translation file before release

---

## Error Codes

| Code | Description |
|------|-------------|
| `TRANS-001` | `MISSING_TRANSLATION` — Translation file does not exist for a source standard |
| `TRANS-002` | `MAJOR_VERSION_GAP` — Translation source_version is MAJOR behind current source |
| `TRANS-003` | `MISSING_FRONTMATTER` — Translation file lacks required YAML frontmatter |
| `TRANS-004` | `STALE_SOURCE_REF` — `source` path in frontmatter points to non-existent file |

---

## References

- [documentation-lifecycle.md](documentation-lifecycle.md) — Parent standard; trigger matrix and check pyramid
- [standard-admission-criteria.md](standard-admission-criteria.md) — How new standards are admitted (triggers TRANS-001)
- `scripts/check-translation-sync.sh` — Implementation of this standard's automation rules
- `.githooks/pre-commit` — Pre-commit integration
- `scripts/install-hooks.sh` — Hook installation
