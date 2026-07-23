# FROZEN — Gemini CLI is discontinued

**Status**: Frozen 2026-07-23 · Not maintained · Not deleted
**Reason**: Google sunset Gemini CLI on **2026-06-18** (announced at I/O 2026-05-19, with a
30-day migration window). Succeeded by **Antigravity CLI**.
**Registry entry**: `integrations/REGISTRY.json` → `agents["gemini-cli"].deprecated = true`

---

## What this directory is

`.gemini/` is UDS **dogfooding its own output** — the zh-TW skill and command set that
`uds init --agent gemini-cli` produces, committed so the UDS repo itself could be developed
with Gemini CLI.

| | |
|---|---|
| Files | 141 tracked (105 under `skills/`, 36 under `commands/`) |
| Nature | **Derived** — every file carries a `source:` pointer back into `skills/` |
| Language | zh-TW translations |
| Last synced | 2026-02-10 (see per-file `last_synced:` frontmatter) |

It is **not** the integration definition that adopters consume. That lives in
`integrations/gemini-cli/` (3 files) and is frozen under the same decision.

## What "frozen" means operationally

1. **Excluded from sync checks.** `scripts/check-ai-agent-sync.sh` reads
   `deprecated` from `integrations/REGISTRY.json` and reports the target as `[FROZEN]`
   instead of enforcing tier rules against it.
   `scripts/check-docs-integrity.sh` already excluded `.gemini/` by path.
2. **Not updated when `skills/` changes.** The `source_version` / `last_synced` frontmatter
   in these files will drift, and that drift is expected — do not "fix" it.
3. **Not deleted.** Deletion is an irreversible outward-facing change, and these files are
   regenerable from `skills/` if ever needed. Freezing costs nothing and keeps the record.
4. **Not counted as supported.** `README.md` lists Gemini CLI as ⛔ Discontinued.

## Why it was frozen rather than deleted

The alternative — deleting all 141 files — is cleaner but irreversible, and "sunset" does not
mean nobody still has the tool installed. Freezing preserves the option while removing the
maintenance tax, which was the actual problem: on **2026-07-22**, a day after the tool had
already been dead for over a month, work was still being done to repair links inside this tree.

## Why this was invisible for a month

Gemini CLI sat in the `preview` tier. Tier rule sets shrink as the tier drops:

| Tier | Required rules |
|------|----------------|
| `complete` | AH-001 … CMT-001 (7 rules) |
| `partial` | 6 rules |
| `preview` | AH-001, AH-002, AH-003 |
| `minimal` | AH-001, AH-002 |

A `preview`-tier target has a rule set small enough that it passes as long as the files exist
at all. **The exemption system designed to tolerate an incomplete integration silently
absorbed the integration's death.** No check could go red, because nothing was being checked
that a dead tool would fail.

That gap is now covered by `scripts/check-integration-liveness.ts`, which asserts that a
target's declared status stays consistent across the registry, the README, and this marker.

## Migration

Antigravity CLI is the successor (`agents["gemini-cli"].supersededBy = "antigravity"`).
Porting this skill set to an Antigravity plugin is **not** part of the freeze — it is separate
work, tracked as XSPEC-356 in the dev-platform repo. Antigravity's skill install path is not
yet verified against a real CLI; see README's ‡ footnote.

---

**Do not edit the files in this directory.** If you are here because a check pointed you at
them, the check is wrong — report it rather than updating the frozen content.
