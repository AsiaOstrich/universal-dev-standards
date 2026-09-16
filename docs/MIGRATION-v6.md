# UDS 6.0.0 Migration Guide

> **Language**: English | [繁體中文](../locales/zh-TW/docs/MIGRATION-v6.md) | [简体中文](../locales/zh-CN/docs/MIGRATION-v6.md)

UDS 6.0.0 is a **major** release. It contains one breaking rename, removes 8 deprecated machine-readable standards and 4 deprecated CLI commands — all of which have carried a "removed in 6.0.0" notice since 5.4.0. This guide covers everything you need to change.

**TL;DR checklist:**

- [ ] Replace `/review` with `/code-review` everywhere you invoke it
- [ ] If you scripted `uds start` / `uds mission*` / `uds workflow*` / `uds flow*` / `uds sweep`, migrate per §3
- [ ] If your adoption layer loaded any of the 8 removed `.ai.yaml` stubs, switch to your own runtime equivalents (§2)
- [ ] Upgrade: `npm install -g universal-dev-standards@6`, then run `uds update` in each project

---

## 1. Breaking rename: `/review` → `/code-review`

The `review` command/skill is renamed to `code-review` to align the skill's frontmatter name with its directory (`code-review-assistant`).

| Before | After |
|--------|-------|
| `/review` | `/code-review` |
| `skills/commands/review.md` | `skills/commands/code-review.md` |
| `.gemini/commands/review.toml` | `.gemini/commands/code-review.toml` |
| `flows/review.flow.yaml` (flow-id `review-flow`) | `flows/code-review.flow.yaml` (flow-id `code-review-flow`) |

**What you must do:**

- Replace `/review` invocations in your own prompts, docs, CI scripts, and AI-instruction files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, …) with `/code-review`.
- If any of your flows reference flow-id `review-flow` (e.g. in `workflow-prerequisites`), update to `code-review-flow`.
- Re-run `uds update` so regenerated command indexes land in your project.

**Not affected:** `/review` mentions that refer to external tools' built-in review commands (e.g. Codex) are unrelated to UDS and were intentionally left as-is.

## 2. Removed: 7 deprecated machine-readable standards (`.ai.yaml`)

These standards had their runtime relocated to the adoption layer in 5.4.0 (XSPEC-086/095; UDS defines activities, adoption layers orchestrate — DEC-049). Their `.ai.yaml` stubs were removed as scheduled:

| Removed `.ai.yaml` | Human-readable doc (kept) |
|---|---|
| `agent-communication-protocol` | `core/agent-communication-protocol.md` |
| `branch-completion` | `core/branch-completion.md` |
| `change-batching-standards` | `core/change-batching-standards.md` |
| `execution-history` | `core/execution-history.md` |
| `pipeline-integration-standards` | `core/pipeline-integration-standards.md` |
| `workflow-enforcement` | `core/workflow-enforcement.md` |
| `workflow-state-protocol` | `core/workflow-state-protocol.md` |

**What you must do:**

- Nothing, if you never loaded these `.ai.yaml` files directly — the human-readable concepts remain under `core/` as reference documents.
- If your adoption layer (agent runtime, orchestrator, CI) loaded any of these stubs, implement the equivalent in your own toolchain. The stubs themselves were already deprecation notices pointing you there since 5.4.0.
- These standards are no longer distributed by `uds init` / `uds update`. Each kept `core/*.md` says so in its own first lines, and `scripts/reference-only-standards.json` is the machine-readable list.
- **`agent-dispatch` was on this list and is not any more.** Its `.ai.yaml` was restored in XSPEC-362 R5a and it ships normally; this guide listed it as removed for two majors after that. If your manifest still carries it, that is correct.
- Copies already installed in your project's `.standards/` are not deleted automatically. **Use `uds update --prune`** rather than deleting them by hand:
  - `--prune` removes the files *and* their `fileHashes` entries. Deleting them by hand leaves the entries behind, and `uds check` then reports each one as `missing` and offers `uds check --restore` — a restore that cannot succeed, because the source no longer exists upstream.
  - **The first `uds update` after upgrading from 6.8.x or earlier deletes nothing**, whatever flags you pass: ownership records do not exist yet, and nothing is removed on the strength of an absent record. Run `uds update` once, then `uds update --prune`.
  - `--prune` does not clean `integrationConfigs[<file>].installedStandards`. That snapshot is what `uds update --sync-refs` regenerates from, so a stale entry there can still put a wrong standards count into your CLAUDE.md. `uds update --integrations-only` recomputes from the manifest instead.

## 3. Removed: 4 deprecated CLI commands

All four were marked `@deprecated` in 5.4.0 (XSPEC-095) with removal scheduled for 6.0.0. Process orchestration is adoption-layer responsibility (DEC-049).

| Removed command | Migration path |
|---|---|
| `uds start`, `uds mission:*` (status/pause/resume/cancel/list) | Use your adoption layer's mission runtime (e.g. VibeOps orchestrator) |
| `uds workflow:*` (list/install/info/execute/status) | Workflow definitions live in `flows/`; execution belongs to your adoption layer |
| `uds flow:*` (create/list/validate/diff/export/import) | Author flow YAML directly; validation/execution in your adoption layer |
| `uds sweep` | Use the `/sweep` skill (same capability, skill-based) |

Commands that stay: `init`, `update`, `check`, `audit`, `config`, `skills`, `release`, `hitl`, `run`, and the rest of the non-orchestration CLI surface.

## 4. Deprecated but NOT removed in 6.0.0

- **6 workflow skills** are marked as `reference` tier with visible deprecation notices (XSPEC-291 §4). They still ship; plan migrations at your own pace.
- Deprecated runtime commands elsewhere carry a structured `@superseded-by` pointer.

## 5. Upgrade steps

```bash
# 1. Upgrade the CLI
npm install -g universal-dev-standards@6

# 2. In each consuming project
uds update

# 3. Sweep your own configs for stale references
grep -rn "/review\b" . --include="*.md" --include="*.toml" | grep -v code-review
grep -rn "uds start\|uds workflow\|uds flow\|uds sweep" . --exclude-dir=node_modules
```

If `uds check` passes and the greps above come back clean, you are fully migrated.
