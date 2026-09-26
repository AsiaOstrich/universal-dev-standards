# Turn Completion Integrity

> **Language**: English | [繁體中文](../locales/zh-TW/core/turn-completion-integrity.md)

**Version**: 1.4.0
**Last Updated**: 2026-09-25
**Applicability**: Any harness where an agent ends a turn and hands control back to a human
**Scope**: universal
**Industry Standards**: none claimed — derived from observed failures, see Evidence

---

## Purpose

An agent writes *"I'll do X next"* and then ends the turn without doing X.

The human reads a sentence describing work that was never done. Nothing errors, no
check fails, and the transcript reads like progress. The next turn starts from a
state the human believes is further along than it is.

This is not a knowledge failure — the agent named the correct next step. It is a
**closure** failure: the turn ended at the point where the work should have started.

---

## The Rule

**R1.** If the agent's final message states a first-person commitment to a next
action, the turn MUST NOT end until that action is taken or the agent states what
blocks it.

**R2.** "What blocks it" means naming the person or input each remaining item waits
on. *"The main parts are done"* is not a blocker statement; *"the deploy waits on
your key, the doc waits on nothing and I am doing it now"* is.

**R3.** A rule written only in the agent's instructions is not enforcement. R1 MUST
be evaluated **at the moment the turn ends**, by something that is not the agent.

---

## Why R3 exists

The instruction form of this rule was written into a project's agent instructions and
violated inside the same session that read it. It was then written into a published
standard, marked optional, with no checker reading it; the same violation recurred
seven days later.

An instruction is an input. The failure happens at a decision point — *"I am about to
end this turn"* — and an input that is not consulted at that point is not in effect.
This is the general shape: **a documented requirement with no enforcement at its
decision point is a suggestion, and its compliance is unmeasured, not high.**

---

## What the check MUST NOT do

**R4. Do not block on work that is always outstanding.** A repository always has open
TODOs, a backlog always has items. A gate that is true on every turn is turned off,
and then it protects nothing. The check fires **only** on a commitment the agent made
in that message.

**R5. Fail open, always.** Any error — unreadable transcript, missing field, malformed
JSON, unexpected schema — MUST let the turn end. A hook that can trap a session is
worse than no hook, because the human's only recovery is to disable it, and they will
disable it permanently.

**R6. Bound the blocking.** The check MUST enforce
(a) a cooldown between blocks, and
(b) a cap on blocks within a **rolling time window**.

A cap counted per session with no reset is not a safety limit — it is an off switch on
a delay, and it disarms silently in exactly the long session where the rule matters
most.

---

## The human can end the turn, and the agent's words cannot say so

**R9.** The check MUST exempt a turn the human asked to end, and MUST determine
that from the human's own most recent message — not from the agent's.

This rule exists because its absence was measured, once, on the first real
firing after this standard shipped. The human wrote *"pause, I'm going home"*;
the agent acknowledged and listed what it would resume; the check read an
abandoned commitment and blocked.

The detector was not wrong about the pattern. **A turn ending by instruction and
a turn ending on an abandoned commitment produce the same words from the agent**,
because in both cases the agent names work it is not doing now. Nothing in the
final message separates them, so a check that reads only that message cannot.

**R10.** The stop-request pattern MUST be narrow, and its corpus MUST include
work instructions that merely contain a stopping word. A false exemption is not
one missed block: it silences the check for the rest of the session. During
implementation the pattern matched *"stop using the hardcoded list and walk the
registry instead"* — an instruction to do work, read as an instruction to stop.

**R11.** The check's own block message re-enters the transcript as a human turn.
It MUST be able to recognise its own output and skip it when looking for the
human's last message.

Without this, R9 works exactly once. The block message becomes "the human's most
recent message" on the next run, the real instruction to stop is hidden behind
it, and the exemption disappears — silently, and only in the situation it was
built for.

This is the same family as a detector matching the prose that documents it,
one step further along: **the check reads its own output.** Carry a fixed marker
string in the block message and skip any human turn containing it.

**R12.** The check MUST be able to recognise the ending R2 defines. A check that
enforces R2 but cannot see an itemized blocker list blocks the one ending the
standard asks for — it punishes correct behaviour, and that is a faster way to
get uninstalled than missing a violation.

Recognition needs three things, and dropping any one of them was measured to
break it:

| Requirement | Why |
|---|---|
| Two or more list items | One item with an attribution is a sentence, not an itemization |
| A blocker attribution anywhere in the message, not per item | Real writing puts it in the preamble — *"the rest are all on you, itemized:"* — and requiring it per item missed the first real message it was tested against |
| No vague-completion phrase | *"the rest are done"* is the summary R2 rejects; a list that disposes of the remainder that way is a summary wearing a list's clothes |

🔴 **Exclude the check's own scaffolding from the attribution search.** The
heading *"what you need to decide"* contains the word *"you"*, so a list of work
already finished satisfied the attribution test by way of the heading above it.
The detector read its own structure — the same failure as R11, one layer down.

---

## Language coverage is a correctness property, not a translation task

The check reads prose written by the agent, so **its detector is language-specific**.
A detector carrying only one language's patterns, shipped to an adopter working in
another, produces a hook that is installed, runs on every turn, exits 0, and can never
fire. Every observable signal is identical to "the agent is behaving well".

**R7.** Each supported language MUST ship as a locale pack carrying **its own corpus**
of cases that must block and cases that must pass, and the pack's self-test MUST run
in CI. A locale pack whose corpus does not pass is not shipped.

**R8.** An adopter whose language has no pack MUST be told the check is inactive for
their language. Silence here reproduces the exact failure the standard exists to
prevent, one level up.

---

## Supported harnesses

The check is enforced only where a harness adapter exists and a hook is
actually wired into that harness's own config. As of v1.4.0:

| Harness | Event | Config file | Block contract |
|---|---|---|---|
| Claude Code | Stop | `.claude/settings.json` | stdout `{"decision":"block","reason":...}`, exit 0; silence allows |
| Codex | Stop | `.codex/hooks.json` | stdout `{"decision":"block","reason":...}`, exit 0 — plain text or empty stdout is documented as invalid for this event |
| Gemini CLI | AfterAgent | `.gemini/settings.json` | stdout `{"decision":"deny","reason":...}`, exit 0 — the documented preferred path over exit code 2 |

Codex's R9 exemption is best-effort, not silent failure: Codex's Stop payload
gives the assistant's final message directly but not the human's, so reading
the human side requires parsing a transcript file. Confirmed against a real
codex-cli 0.156.1 installation (2026-09-26): a user message in
`~/.codex/sessions/**/*.jsonl` is a `{"type":"response_item","payload":
{"type":"message","role":"user","content":[{"type":"input_text","text":...}]}}`
record — the message lives under `payload`, not at the top level of the
line or under a `message` key, and a `role: "developer"` record on the same
shape is not a human message. The 6.13.0-beta.1 adapter read neither of the
two shapes it tried against this real one, so R9 never exempted a turn on
Codex; fixed for 6.13.0-beta.2. A failed parse (or an unrecognized record
shape) still leaves the human side empty rather than throwing — detection
still runs on the assistant's message, only the R9 exemption for that one
turn may be missed.

Cursor was evaluated and is not supported: whether its stop hook can actually
block a turn in the way this standard requires was unresolved as of this
writing, and shipping an adapter against an unverified contract would repeat
the exact failure R3 exists to prevent — an enforcement mechanism nobody has
confirmed enforces anything.

On any harness not in the table above, the check is inactive — the same
silent-by-default failure as an unsupported language (R8). `uds init
--with-hooks` reports which harnesses it wired a hook into; it does not
enumerate the rest here, because that list is a citation waiting to go stale
the next time a harness is added or dropped.

---

## What the detector matches

The shape is: **a first-person future marker, then an action verb, in the same
sentence**, minus three exclusions.

| Element | Purpose | Failure if omitted |
|---|---|---|
| First-person + future marker | Distinguishes a commitment from a description | Matches the user's words quoted back |
| Action verb | Distinguishes doing from reporting | *"I'll explain why"* counts as work |
| Same-sentence scope | Keeps the two halves related | A negated clause and a later real commitment merge into one non-match |
| Exclude reporting verbs | *"I'll say / note / mention"* is not work | The check fires on its own summaries |
| Exclude negation | *"I won't change that"* is a decision, not a commitment | A refusal reads as a promise |
| Exclude quoted and tabular text | Examples of the pattern are not instances of it | The check fires on its own documentation |

Each exclusion above was added because its absence produced a false block in testing.
An implementation that drops one will reproduce that block.

---

## Evidence

Observed over one project, 2026-08 to 2026-09:

| Observation | Count |
|---|---|
| Same complaint raised by the human about stated-but-undone next steps | 5 |
| Times the instruction form was present and violated in the same session | ≥1 |
| Detector versions defeated by the pattern in their own source or examples | 5 |
| Detector false positives caught by a corpus before shipping | 3 |

The last row is the argument for R7. Three of the five detector defects were caught
only because a corpus existed; the two that shipped were the ones no case covered.

---

## Checklist

- [ ] The check runs at turn end, not as an instruction to the agent
- [ ] Every failure path exits without blocking
- [ ] A cooldown and a rolling-window cap are both present
- [ ] Each shipped language has a corpus, and the corpus runs in CI
- [ ] Adopters in unsupported languages are told the check is inactive
- [ ] The check does not consult repository state (open TODOs, backlog)
- [ ] A turn the human asked to end is exempt, decided from the human's message
- [ ] The stop-request corpus includes work instructions containing a stopping word
- [ ] The check recognises its own block message and does not read it as the human's
- [ ] The check recognises the itemized blocker ending R2 defines, and does not block it
- [ ] The attribution search excludes the check's own headings and scaffolding
- [ ] Each supported harness's block contract (config file, event, output shape) is verified against that harness's own docs, not assumed from another harness
- [ ] The installer only writes a harness's hook config for a harness the adopter selected
