---
name: open-work
scope: universal
description: |
  [UDS] Optional help for work that stays open across sessions: a cheap capture point, a release condition for every wait, a next step that names something real.
  Use when: work gets lost between sessions, an item has "waited" for days with no known reason, a next step reads only "continue".
  Not for: projects that already track work in an issue tracker or board and lose nothing; planning a feature — use /plan or /sdd.
  Keywords: open work, backlog, inbox, waiting, release condition, next action, 開放工作, 待辦追蹤, 收件匣, 等待中, 解除條件.
allowed-tools: Read, Glob, Grep, Write, Bash
argument-hint: "[capture | waiting | next-action | report | 收件 | 等待 | 下一步 | 報告]"
---

# Open Work | 開放工作追蹤

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/open-work-assistant/SKILL.md) | [简体中文](../../locales/zh-CN/skills/open-work-assistant/SKILL.md)

**Version**: 1.0.0 | **Last Updated**: 2026-10-30 | **Applicability**: Claude Code Skills

Help keep work from getting lost between sessions. Use it when you want it. Nothing in UDS requires it.

## Purpose

This skill used to be a standard, `open-work-tracking`. UDS moved it here because the standard was tried on one project, and that project's own use did not confirm it. A skill fits better: you pick it up when work is getting lost, and you leave it when it is not.

The full text of the old standard is kept as a reference document: [open-work-tracking](../../core/open-work-tracking.md). UDS does not install it any more. This skill holds the part that was worth keeping.

## When to use it, and when not

First find out which problem is real. Ask the user. Do not start a tracker for a problem nobody has.

| What goes wrong | What helps |
|---|---|
| A new idea comes up in the middle of a task, and there is no cheap place to put it | A capture point that costs two fields |
| An item is paused "waiting", and later nobody knows for what | A release condition written next to the wait |
| A planned item is not started, time passes, and nothing points back at it | A date, or a regular look at the list |

If none of the three is real, stop and say so. If the project already has an issue tracker or a project board and loses nothing there, keep using it. A second list that nobody reads is a new place to lose work.

## Workflow

### 1. Capture: two fields

Write the date and one sentence. Nothing else.

| Date | What |
|---|---|
| 2026-10-30 | Check whether the export job still runs after the schema change |

Do not ask for a category, a priority or an owner at this step. Those are decided later, when the list is sorted. A third required field makes people stop using the list.

### 2. Waiting: write what releases it

Every item marked "waiting" gets two things: what it waits for, and what event ends the wait. Prefer an event a machine can see: a date, a file that appears, a tag, an identifier.

| Item | Status | asked-at | Waiting for | Release |
|---|---|---|---|---|
| Vendor quote | asked-awaiting | 2026-10-27 | The vendor's reply | A file `quotes/vendor-a.md` exists |

Say which kind of waiting it is:

- `not-yet-asked`: the request is drafted or decided, and nobody has sent it. Name the draft or command whose sending releases it.
- `asked-awaiting`: it was sent, and nothing has come back. Write `asked-at` (a full date with the year). An item with an age can come back on a threshold. An item without one cannot.

If the wait is for something in another project, write `<project>:<object>`, for example `uds:v6.15.0` or `vibeops:docs/handoff.md`. The project is a logical name, never a directory on one machine.

### 3. Next step: name something

A next step names at least one thing a reader can go and find: a file path, a test name, a command, or a requirement identifier. "Continue" and "handle the rest" name nothing.

| Weak | Better |
|---|---|
| Continue the migration | Run `npm run migrate -- --dry-run` and read `migrations/0042.sql` |

An item that was asked and awaits a reply may use the reply as its next step. Then it needs `asked-at`, what it waits for, and what releases it.

### 4. Sort the list: three exits

Sort the captured items on a regular day. Each item goes to one of three places:

1. It becomes a spec or a tracked item.
2. It goes on the list of work to do.
3. It is dropped, with one sentence that says why.

An item that stays unsorted for more than about two weeks is named in the report. A drop without a reason looks the same as an item that was deleted by mistake.

### 5. Report: say what you could not see

When you report "N items are open", also say how many sources you looked at and how many you could not. An unseen source is not zero. A report without that sentence reads as complete.

Print the report when a turn ends and control goes back to the person. The report must never block the turn. "Some work is still open" is nearly always true, and a check that is always red gets switched off.

### 6. Facts you cannot see

Some facts have no source an assistant can read: was a message sent, did the other side reply, was it approved. Write them by hand only with three things: who saw it (`observed-by`), when (`observed-at`, with the year), and a value of `yes`, `no` or `unknown`. `unknown` is a real value. It is counted apart and never counted as done. Show the age of every observation. A stamp says someone saw it once. It does not say it is still true.

Do not hand-write what version control, a spec marker or a CI result already says.

### 7. Optional: run the reference checks

UDS ships a reference checker for these rules in the CLI:

```bash
uds open-work next-action [files...]   # does every next step name something?
uds open-work waiting [files...]       # does every wait have a release condition?
uds open-work observations [files...]  # are the hand-written facts stamped?
uds open-work self-test                # does the checker itself still fail on a bad sample?
```

The checker finds fields by their column names, such as `status`, `asked-at`, `waiting for` and `release` (the tables above use them). If your tables use other words, declare them in `uds.project.yaml` under `open_work`.

Exit code 0 means no violation, 1 means a violation, 2 means the checker could not decide. 2 is not a pass. A clean run covers only the words it recognised. The vocabulary is a first guess and has not been tuned on real use.

## Where to keep it

Anywhere your project already looks: an issue tracker, a project board, a file in the repository. UDS does not choose for you. Two properties matter: the place is under version control or otherwise readable by every session that needs it, and it is not only in one person's private assistant memory. Work that waits on another project must be recorded where the sessions of both projects can read it.

## What this skill does not claim

- The rules above came from one project. UDS has no evidence that they work for other projects.
- The thresholds (two fields, two weeks, seven days for a stale observation) are first judgments, not measurements.
- The checker reads the structure of tables and lists. It cannot tell whether a note is true.

## Related

- [open-work-tracking](../../core/open-work-tracking.md): the former standard, now reference only. Its requirements are numbered OWT-001 to OWT-029.
- [deferred-item-exit](../../core/deferred-item-exit.md): an item that is deferred must leave its document. This skill starts where that one ends.
- [turn-completion-integrity](../../core/turn-completion-integrity.md): the check for a promise that was stated and dropped. Unlike the report in step 5, it may block a turn.
