# Feature Discovery Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-05-13
> **AI-optimized version**: `ai/standards/feature-discovery-standards.ai.yaml`
> **Spec**: XSPEC-202 (cross-project/specs/XSPEC-202-feature-discovery-standards.md); related: XSPEC-199/200/201 (migration completeness protocol suite)

**Scope**: universal
**Applicability**: Any legacy-system migration, refactor, or reverse-engineering effort that must produce an exhaustive feature list before change

## Overview

This standard defines a language-agnostic methodology for **exhaustive feature discovery**
in legacy systems. Its pipeline position is the first of three stages:

```
feature-discovery-standards (FIND) → feature-manifest-standard (REPRESENT) → behavior-snapshot (VERIFY)
```

The methodology rests on one non-negotiable idea, **Deterministic-First**, and provides:
a **Software Form Taxonomy** to pick the right extraction strategy per system type,
**five static foundations** to run against source alone, a **dynamic observation
protocol** for systems that can be executed, a **human observation protocol** as last
resort, and a **cross-layer validation matrix** that merges every foundation's output
into confidence-scored feature candidates.

## Core Principle: Deterministic-First

> AI cannot tell you what it doesn't know it doesn't know. RAG solves "find details
> about a known feature." It does NOT solve "discover that this feature exists."
> Exhaustive feature discovery requires deterministic tools (grep/AST/log/schema) —
> not AI inference.

- **Blocking rule**: if deterministic extraction artifacts are absent when entering the
  Discovery Phase, the AI MUST output `[BLOCKED] Missing deterministic extraction
  artifacts. Run extraction tools first before AI analysis.` and MUST NOT proceed.
- **RAG prohibition**: during the Discovery Phase, AI is PROHIBITED from generating the
  feature list through inference or RAG retrieval alone — because AI will not report
  what it doesn't know it missed; only deterministic tools produce exhaustive lists.
- **AI's permitted role in Discovery**: classify extracted items into feature
  categories, assign confidence scores to candidates, and fill in business-purpose
  descriptions for confirmed entries. AI must NOT generate the initial feature list.

## Software Form Taxonomy

Identify the software's form **before** choosing an extraction strategy. If ambiguous,
check the detection signals below or ask the user to confirm.

| Form | Key Entry Points | Primary Detection Signal | Fastest Extraction Tool |
|------|-------------------|---------------------------|--------------------------|
| **web** | Route definitions, HTTP handlers, middleware | `routes/`/`app/Http/` dir; express/fastify/hono/django/flask/fastapi deps | `grep` route definitions; DB schema extraction; access-log analysis |
| **cli** | `main()` + arg-parser registrations, shell completions | argparse/click/cobra/clap/typer import; `cmd/` dir; no listen calls | Run `--help` recursively; `grep -rE 'ArgumentParser\|click\.command\|cobra\.Command'` |
| **gui** | Menu/button handlers, UI definition files | `.ui`/`.fxml`/`.xib`/`.storyboard` files; `QMainWindow`/`JFrame`/`Activity` subclasses | `find . -name '*.ui' -o -name '*.fxml'`; grep event-listener patterns |
| **daemon** | `main()` + event loop, signal handlers, socket bind/listen | systemd `.service` unit; `signal()`/`bind()`/`listen()` calls; no UI imports | `grep -rE 'signal\(\|SIGTERM\|SIGUSR'`; parse config schema |
| **library** | Public API surface, header files, `index.d.ts`/`__init__.py` exports | No `main()`; `package.json` `exports`; header files with public markers | `cat index.d.ts` / `__init__.py`; `nm <binary> \| grep ' T '`; analyze existing tests as API spec |
| **mobile** | Activity/Fragment (Android), UIViewController/SwiftUI View (iOS), deep links, push handlers | `AndroidManifest.xml`; `Info.plist`; `extends Activity`; `UIApplicationDelegate` | `grep android:name` in manifest; `grep CFBundleURLTypes` in Info.plist |
| **embedded** | Interrupt handlers (ISR), main control loop, protocol parsers, watchdog/timer handlers | `ISR()` macro; `HAL_` prefix functions; no OS process model | `grep -rE 'ISR\(\|__interrupt\|_irq_handler'`; parse linker script (`.ld`) |

## Five Static Foundations

Apply to **all** software forms when git history, access logs, and runtime execution are
unavailable. Execute in order 1→5 — do not skip any foundation even if earlier ones seem
comprehensive, since each catches a different category of feature. **Any item appearing
in any foundation is a confirmed feature candidate**; merge results into the cross-layer
validation matrix before writing `feature-manifest.yaml`.

| Order | Foundation | What It Catches | Output |
|-------|-----------|------------------|--------|
| 1 | **Entry Points** | Direct feature invocation points — the most reliable foundation | Entry point inventory (file:line, handler name, interaction type) |
| 2 | **Call Graph** | Hidden logic reachable from entry points (nested logic, utility wrappers) | Call graph + dead-code candidate list |
| 3 | **String Mining** | UI strings, error messages, log calls — features and boundary conditions | String corpus, fed to AI for classification *after* collection |
| 4 | **Resource Files** | i18n/l10n keys, icons, config schemas, templates — often the most complete inventory | Resource inventory (i18n keys, icon names, config options, template names) |
| 5 | **External Interfaces** | File I/O, network calls, process execution, env vars — frequently missed because they read as utility code | External interface inventory |

Notes that matter in practice:

- **Call Graph dead code**: functions unreachable from any entry point are dead-code
  candidates OR dynamic-dispatch targets (virtual functions, reflection). Flag for
  human review — do not silently exclude.
- **String Mining value**: each unique error message is a boundary condition and a test
  scenario.
- **Resource Files i18n value**: i18n file keys are often the most complete inventory of
  all UI elements — each key maps to one visible feature element.

## Dynamic Observation Protocol

Use whenever the legacy system can be executed — even partially, even in a degraded/dev
mode — with a person familiar with the system available to demonstrate realistic usage.
Running the system once with tracing enabled produces a definitive reachability map that
static analysis cannot match; **prefer dynamic observation over static analysis when
available** (static foundations remain required — dynamic observation complements, not
replaces them).

- **Linux**: `strace -f -o trace.log` (syscalls), `ltrace -f -o ltrace.log` (library
  calls), `lsof -p <pid>` (open files/sockets), `tcpdump -i any -w net.pcap` (network).
- **macOS**: `fswatch` (filesystem events), `dtrace` (syscall probes), `tcpdump`.
- **Windows**: Process Monitor / Sysinternals ProcMon (file/registry/network/process),
  WireShark (network).
- **Universal code coverage**: gcov/lcov (C/C++), coverage.py (Python), JaCoCo (Java),
  nyc/c8 (JS/TS), `go test -coverprofile` (Go) — code coverage with **real usage
  scenarios** produces a definitive map of reachable code.

Recommended workflow: (1) have a domain expert demonstrate a complete typical workday,
(2) run strace/coverage in parallel during the demonstration, (3) replay the
demonstration 3 times for edge cases, (4) analyze the trace for system calls, files
accessed, and URLs called.

## Human Observation Protocol

Last resort — required when the system cannot run, domain experts are unavailable for
tracing, or features are triggered only by rare business events.

- **User Demo Recording**: have 1-2 heavy users screen-record (with audio) a full
  typical workday; review for interactions not captured elsewhere; pay special attention
  to keyboard shortcuts, context menus, and power-user workflows.
- **Support Ticket Mining**: search 6-12 months of support tickets/Jira/GitHub issues;
  each recurring issue type is a boundary condition or edge-case feature; tickets
  requesting "restore old behavior" are high-risk migration targets; group by frequency.
- **Internal Knowledge Mining**: internal wiki/Confluence, Slack/Teams history, email
  threads about system behavior, old (even informal) release notes.

**Confidence assignment**:

| State | Confidence | Meaning | Action |
|-------|-----------|---------|--------|
| Human-observed, unverified | 0.7 | Confirmed by user observation, not yet located in source | Add to manifest at 0.7; find source code before AC generation |
| Human-observed, code-located | 1.0 | Confirmed by user AND verified in code | Upgrade to 1.0 after locating the code |

## Cross-Layer Validation Matrix

After running all applicable foundations, merge results into this matrix. **Any item
with at least one checkmark is a confirmed feature candidate** for the manifest; items
with zero checkmarks across all applicable layers are dead-code candidates — flag for
human review, never silently exclude.

| Column | Source |
|--------|--------|
| Entry Point | Foundation 1: Entry Points |
| DB/Schema | Foundation 1 (web): DB schema; data file for other forms |
| Log/Dynamic | Access log (web) or dynamic observation trace |
| UI/Resource | Foundation 3 (String Mining) + Foundation 4 (Resource Files) |
| Notification/External | Foundation 5: External Interfaces |
| Git/History | `git log --grep` / commit history, if available |
| Human | Human observation protocol |

```
confidence = (columns_with_checkmark) / (columns_applicable_to_this_form)
Minimum to include in feature-manifest: ≥ 1 checkmark in any column
Confidence < 0.5: flag for human review before AC generation
Confidence < 0.3: require human confirmation before including in manifest
```

Example:

| Feature Candidate | Entry Point | DB/Schema | Log/Dynamic | UI/Resource | Notification/Ext | Git/History | Human | Confidence |
|---|---|---|---|---|---|---|---|---|
| UserLogin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1.0 |
| MonthlyReconcile | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 0.71 |
| AdminUserDelete | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | 0.57 |

Each confirmed row becomes an `FM-NNN` entry per `feature-manifest-standard`; the
confidence value from this matrix becomes the manifest's `confidence` field.

## Rules

| Rule | Trigger | Instruction | Priority |
|------|---------|--------------|----------|
| `deterministic-first` | Starting feature discovery for any legacy system | Require deterministic extraction results before generating any feature list; if absent, output `[BLOCKED]` and list applicable tools for the detected form | required |
| `no-rag-for-discovery` | Feature discovery phase | Do NOT use RAG/long-context inference alone to generate the initial feature list; RAG is permitted only to fill in details of already-identified features | required |
| `identify-form-first` | Starting feature discovery | Identify the software form using detection signals before selecting an extraction strategy; ask the user to confirm if ambiguous | required |
| `apply-all-static-foundations` | Source-only analysis (no git, no log, no runtime) | Execute all five static foundations in order; merge all candidate lists into the cross-layer matrix | required |
| `prefer-dynamic-observation` | Legacy system can be executed in any environment | Prefer dynamic observation (strace/coverage + expert demo) over static analysis alone; static foundations remain required | recommended |
| `human-observation-for-gaps` | A feature candidate cannot be confirmed by any tool-based foundation | Escalate to human observation; assign confidence 0.7 for human-observed/code-unverified; never include confidence < 0.3 without explicit human confirmation | required |
| `matrix-before-manifest` | Generating `feature-manifest.yaml` | Complete the cross-layer validation matrix first; only ≥1-checkmark items become `FM-NNN` entries; zero-checkmark items go to a separate `dead_code_candidates` list | required |
| `dead-code-handling` | Call graph analysis reveals unreachable code | Never silently exclude unreachable functions; list as `dead_code_candidates`; account for dynamic dispatch; require human confirmation before classifying as dead code | required |

## Related Standards

- `feature-manifest-standard` — represents confirmed candidates as `FM-NNN` entries
- `behavior-snapshot` — verifies the manifest against observed runtime behavior
- `reverse-engineering-standards` — broader legacy reverse-engineering process this
  standard feeds into
- `anti-hallucination` — the deterministic-first / no-inference-alone discipline this
  standard applies to feature discovery specifically
- `acceptance-criteria-traceability` — confirmed features become AC-traceable units
- `refactoring-standards` — discovery precedes any refactor of legacy code

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-05-13 | Initial — Deterministic-First principle, Software Form Taxonomy (7 forms), five static foundations, dynamic/human observation protocols, cross-layer validation matrix (XSPEC-202) |
