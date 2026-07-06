# Git Push Safety Gates

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-04-23
> **AI-optimized version**: `ai/standards/push-standards.ai.yaml`
> **Spec**: XSPEC-081 (cross-project/specs/XSPEC-081-uds-push-skill.md)

**Scope**: universal
**Applicability**: Any project using Git, invoking the `/push` skill or an equivalent
AI-assisted push workflow

## Overview

This standard defines the safety gates an AI assistant MUST apply around `git push`:
protected-branch detection, force-push guardrails, pre-push quality gates, and a
structured push-receipt audit trail. It is the safety layer that sits between "tests
pass locally" and "code lands on a shared branch" — its job is to stop unsafe pushes
before they happen and to leave a durable record of every push that does happen.

## Configuration

| Setting | Default | Notes |
|---------|---------|-------|
| `protected_branches` | `["main", "master", "release/*", "hotfix/*"]` | Branches requiring explicit confirmation before push |
| `push_gates` | default: `["lint", "test"]`; optional: `["ac-coverage", "type-check", "security-scan"]` | Quality gates run before pushing |
| `receipt.output` | `"console"` (choices: `console`, `file`, `both`) | Where the push receipt is written |
| `receipt.file_path` | `~/.uds/push-history.jsonl` | Append-only JSON-lines history when `file` output is enabled |
| `auto_pr` | `true` | Prompt to create a PR after pushing to a non-protected branch |
| `repo_mode` | `"team"` (choices: `team`, `single-owner`) | `single-owner` skips PR prompts and reduces collaboration guardrails |

## Rules

| Rule | Trigger | Instruction | Priority |
|------|---------|--------------|----------|
| `detect-protected-branch` | Executing `/push` | Detect the target branch. If it matches any `protected_branches` pattern: display a warning with the branch name, show what commits will be pushed, require explicit user confirmation, and abort without pushing if not confirmed | required |
| `force-push-guardrail` | Push with `--force` detected | Calculate commits that will be overwritten on the remote, show their count and authors, require the user to type a confirmation string (e.g. "yes, force push"), and record `force_push: true` in the receipt | required |
| `pre-push-gates` | Before executing `git push` | Run all configured `push_gates` in sequence (lint, test, and any optional gates enabled); if any gate fails, abort the push, show which gate failed, and suggest a fix. With `--skip-gates`, push without gates and record `gates_skipped: true` | required |
| `push-receipt` | After a successful push | Output a structured push receipt (see schema below); if `receipt.output` includes `file`, append it as a JSON line to `~/.uds/push-history.jsonl` | required |
| `pr-integration` | After a successful push to a non-protected branch | If `auto_pr` is true AND `repo_mode` is `team`: check whether an open PR exists for this branch; if not, prompt the user to run `pr-automation-assistant`. Skip entirely if `auto_pr` is false or `repo_mode` is `single-owner` | suggested |
| `single-owner-mode` | `repo_mode: single-owner` is configured | Skip all collaboration-specific steps: no PR prompts, reduced force-push warnings (still warn, but no confirmation text required). Protected-branch detection remains active regardless of `repo_mode` | recommended |

## Push Receipt Schema

Every successful push MUST produce a receipt with the following fields:

| Field | Type | Description |
|-------|------|--------------|
| `branch` | string | Target branch name |
| `commit_sha` | string | HEAD commit SHA (short) |
| `gates_passed` | string[] | List of gates that ran and passed |
| `gates_skipped` | boolean | Whether `--skip-gates` was used |
| `force_push` | boolean | Whether this was a force push |
| `timestamp` | ISO 8601 string | Push time |
| `target_remote` | string | Remote the push was sent to |

## Anti-Patterns

- **Silent force-push** — overwriting remote history without showing the user which
  commits/authors will be lost.
- **Skipping gates without a trace** — running with `--skip-gates` but not recording
  `gates_skipped: true`, which makes the receipt misleading.
- **PR-prompting in single-owner repos** — nagging a single-owner repository to open a
  PR against itself; `repo_mode: single-owner` exists precisely to suppress this.
- **Protected-branch bypass** — treating `single-owner-mode` as a reason to also skip
  protected-branch confirmation; the two are independent. Protected-branch detection
  always stays active.

## Related Standards

- **`git-workflow`** — branching strategy this standard's protected-branch list assumes
- **`checkin-standards`** — pre-commit quality gates that `push_gates` extends to the
  pre-push moment
- **`pr-automation-assistant`** (skill) — invoked by the `pr-integration` rule
- **`audit-trail`** — the push receipt is a lightweight, project-local analogue of a
  compliance-grade audit record

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-04-23 | Initial — protected-branch detection, force-push guardrail, pre-push gates, push receipt, PR integration, single-owner mode (XSPEC-081) |
