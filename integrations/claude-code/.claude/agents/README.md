# Reference Subagent Definitions

Reference implementations of [`core/model-selection.md`](../../../../core/model-selection.md) 2.1.0
for Claude Code (XSPEC-362 R5). Copy the ones you want into your project's `.claude/agents/`
directory, or into `~/.claude/agents/` for user scope.

Concrete `model` and `effort` values, and the reasoning behind them, live in
[`../../model-selection-mapping.md`](../../model-selection-mapping.md) — these files are that
mapping applied, not a second source for it.

## The set

| File | UDS tier | `model` | `effort` | Writes files? |
|---|---|---|---|---|
| [`uds-mechanical-edit.md`](uds-mechanical-edit.md) | `fast` | `haiku` | **omitted** — unsupported on this model | yes |
| [`uds-feature-implementer.md`](uds-feature-implementer.md) | `standard` | `sonnet` | `medium` | yes |
| [`uds-architecture-reviewer.md`](uds-architecture-reviewer.md) | `capable` | `opus` | `xhigh` | no — read-only by design |
| [`uds-deep-investigator.md`](uds-deep-investigator.md) | `capable`, long-horizon | `fable` | `xhigh` | yes, in an isolated worktree |

The last two are **the same tier**. What separates them is the autonomy horizon, a host-layer
sub-criterion applied inside `capable` — not a fourth tier. See
[the mapping](../../model-selection-mapping.md#why-fable-is-not-a-fourth-tier).

## Three things these files demonstrate

1. **`very-high` is spelled `xhigh` here.** The vendor-neutral standard keeps its own label; the
   rename is absorbed by the host layer rather than by bending the standard.
2. **The `fast` tier has no effort axis on this host**, so `uds-mechanical-edit` carries no `effort`
   field — writing one would record a decision that is never executed.
3. **Each file cites [`core/agent-dispatch.md`](../../../../core/agent-dispatch.md) rather than
   restating it.** Status protocol, parallel safety and independent-domain criteria are that
   standard's; these files decide only which model and how deep.

## Constraints every one of them respects

- `tools` stays inside the **background-safe** built-in set. Subagents run in the background by
  default, and a background subagent silently loses built-in tools outside that set —
  [details](../../model-selection-mapping.md#44-background-execution-silently-narrows-the-tool-set).
- **No `permissionMode: bypassPermissions`.** A published standard should not demonstrate bypassing
  the permission check, whatever the convenience.
- `name` is lowercase-and-hyphens and contains no `:` — a name with a colon is not loaded, and the
  failure is reported only to the debug log.

## Before you copy one

The `model` aliases resolve to different models on different providers, and some of those accept no
`effort` parameter at all. Confirm your provider's row in
[the alias-resolution table](../../model-selection-mapping.md#42-provider-dependent-alias-resolution--the-same-alias-is-not-the-same-model)
before relying on the `effort` values above. The declared level and the executed level can differ,
and the file will not say so — the session header will.
