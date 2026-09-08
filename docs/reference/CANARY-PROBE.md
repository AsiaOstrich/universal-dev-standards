# The companion canary — how to run one measurement

> **What this answers.** Every vendor whose docs describe skills describes the same
> one mechanism: *SKILL.md names a supporting file, and the agent reads it when the
> instructions point there.* As of 2026-09-08 every one of the 168 UDS companion
> files is one hop from its `SKILL.md`. **No run has ever observed that hop being
> taken** — 221 archived transcripts, 3 session logs, 7 read commands, 0 touching a
> skills path.
>
> This is the instrument for finding out. It is not a product, and it is not a skill
> adopters run. It is three scripts and a prompt, and it produces one measurement for
> one (tool, tool version, date) with **n = 1**.

Authority for the design: XSPEC-408 §6 (R2), §7 (R3), §11 (the counter-arms).

> **It has now been run** — eight runs across three tools on 2026-09-08 (§8 below;
> XSPEC-408 §18 and §21 for the results). The answer:
>
> **`SKILL.md` arrives. Its companions do not.** Loading a skill brings that one file
> and does not recursively expand the files it links to — attested three independent
> ways: markers (Codex, head/middle/tail present, all three companions absent), prose
> (Claude Code, 5/8 body lines present, 0/8 from each companion), and the tool saying
> so in words.
>
> 🔴 **An earlier version of this line said "what reaches the model is the description,
> not the body". That was wrong, twice over, and §21 records why** — four runs measured
> a tree that a user-level `~/.claude/skills` had silently shadowed. Read the boxed
> warning in §3 before spending another run; it is the failure mode that produced a
> confident wrong answer while every check stayed green.

---

## 1. What it measures, and the one thing it cannot

| Signal | Reading |
|---|---|
| `SKILL.md` head marker absent | **The result is invalid.** Not "the content did not load" — the model could not recite at all. |
| head present, tail absent | The `SKILL.md` was **truncated**, and we know roughly where. |
| head + middle + tail present | The `SKILL.md` **arrived**. |
| a companion's marker present | That companion **arrived**. |
| a companion's marker absent, `SKILL.md` intact | That companion **did not arrive** — the hop was not taken. |

🔴 **Arrival is not compliance.** Every row above is about whether bytes reached the
model. Whether the model then did what the skill says is a different question, it
needs a judge, and this instrument does not touch it.

---

## 2. Before the run — the arms that cost nothing

Run these first. They need no model and no quota, and if any of them fails the
instrument measures nothing:

```
npm run check:canary:inject:self-test
npm run check:canary:score:self-test
npm run check:canary:arms
```

`check:canary:arms` is the end-to-end chain: inject into an install, read the tokens
back **off disk**, score. It contains XSPEC-408 §11's mutation arm (truncate a
companion → must go red) and wrong-repo arm (no `SKILL.md` anywhere → refuse, and
write no manifest).

---

## 3. Setting up a probe repo

> 🔴 **Isolate `HOME`, or a user-level skills directory will silently win.**
> Measured 2026-09-08: a probe repo with 55 marked skills at `<repo>/.claude/skills`
> produced zero markers across four runs. The tool had loaded
> `~/.claude/skills/tdd-assistant` — 54 unmarked skills — the whole time. **Every
> downstream signal was identical to a genuine "nothing arrived"**: zero recited, no
> fishing, the model politely answering "none", the control arm passing.
>
> ```
> HOME=$(mktemp -d) claude ...
> ```
>
> And verify it worked from the transcript, not from precedence rules: **ask the model
> which base directory the skill came from.** That one question is what caught this;
> no check did. `canary-inject.ts` now warns when such a directory exists.



Markers are injected into an **install**, never into the source tree. A tool reads
bytes from `<repo>/.claude/skills/…` and cannot tell whether they came from a release
or from the injector thirty seconds ago — so injecting into a scratch repo measures
the same thing at zero cost to adopters.

```
mkdir /tmp/uds-probe && cd /tmp/uds-probe
git init -q .
echo '{"name":"probe","version":"0.0.0"}' > package.json

node <path-to-uds>/cli/bin/uds.js init --mode skills --skills-location project -y
```

Confirm the install actually carries companions before injecting — this was verified
once, on 2026-09-08: **55 skills, 59 companions, companion set identical to source in
all 55.** If a future CLI ships only `SKILL.md`, the question is answered without a
model and the answer is "no".

```
npx tsx <path-to-uds>/scripts/canary-inject.ts /tmp/uds-probe/.claude/skills \
    --out=/tmp/uds-probe-manifest.json
```

Keep the manifest. It is the only thing that can score the transcript, it carries a
per-run salt, and **it is the secret** — a transcript scored against a manifest the
model could have read proves nothing.

---

## 4. The probe prompt

Three rules make the result decidable. Breaking any one of them invalidates the run:

1. **Name no file, no path, and no skill directory.** If the prompt says
   `workflow.md`, a model that opens it has been told to, and the hop was not taken —
   it was instructed.
2. **Name no token value.** The prompt may say the tokens start with `UDSCANARY-`;
   it must never contain one.
3. **Trigger the skill the way an adopter would** — through its normal trigger
   surface (the `Keywords:` and `Use when:` lines of its description), by asking for
   the work the skill is for.

Template — substitute the real task, leave the second paragraph verbatim:

```
<A task phrased the way a user would phrase it, using the words in the skill's
 trigger surface. Example for the TDD skill: "我要在這個 repo 加一個 email 驗證
 函式，用測試先行的方式做，先給我失敗的測試。">

Before you start: this session is run <RUN-ID>. List, verbatim and one per line,
every string beginning with UDSCANARY- that is present in your context right now.
List only strings that are actually there. If there are none, say "none".
```

Save the model's complete output, including any tool calls it made, to a text file.
**The tool calls matter** — the scorer reads them.

---

## 5. Scoring

```
npx tsx <path-to-uds>/scripts/check-canary-transcript.ts \
    --manifest=/tmp/uds-probe-manifest.json \
    --transcript=/tmp/run-1.txt
```

Exit `0` = everything arrived · `1` = a real finding (something absent or truncated) ·
`2` = cannot tell.

### The route column, and the mistake to avoid reading it

The scorer classifies **how** each token got recited:

| Route | Meaning |
|---|---|
| `via-injection` | The transcript never mentions the install tree. The tool put the bytes in context itself. Strongest signal. |
| `one-hop-observed` | The transcript reads exactly a file this skill's `SKILL.md` names. **This is the observation the whole exercise is chasing.** |
| `fishing` | A listing or grep over the tree, or a read of a file `SKILL.md` does not name. The recital proves nothing; that skill is scored invalid. |

🔴 **A read of the companion is the finding, not contamination.** The vendor-documented
mechanism *is* "SKILL.md names a file and the agent opens it". An earlier draft of
this scorer treated any read as cheating, which would have thrown away the exact
observation it was built to catch.

Path form does not matter — absolute, repo-relative (`.claude/skills/…`), or a bare
`<skill>/<file>` are all recognised, and a search verb (`grep`, `find`, `ls`, …) on a
line mentioning the tree is fishing whatever form it uses. This was not true of the
first version, which keyed on the absolute path alone: a real transcript writes
relative paths, so a model that grepped the whole tree scored `via-injection` — the
*strongest* signal. Three self-test arms exist solely to keep that from coming back.

---

## 6. What a result may and may not be used for

- One result is `(tool, tool version, date, n=1)`. Write all four down beside it.
- 🔴 **Never aggregate into a coverage claim.** Whoever runs a diagnostic is not a
  random sample of adopters (XSPEC-408 R3). "N% of adopters pass" is a sentence this
  data cannot support, and someone will try to write it.
- A green result on one tool says nothing about any other tool, and nothing about the
  next version of the same tool.

---

## 7. Known gaps

- **The weak-model arm of §11 is only half built.** The half that needs no model is
  done and enforced: a scorer given a transcript with no head marker emits **zero**
  companion rows, so it is structurally unable to print a page of confident "not
  loaded" lines. The other half — running against a small local model to confirm the
  "head fails → invalid" path is actually reached — needs a run.
- **Companion markers measure arrival, not completeness.** One token, at the head. A
  companion whose tail was cut still scores `present`.
- **Localized installs are not covered by a single run.** An adopter on `zh-TW` gets
  the localized `SKILL.md`; that is a separate probe repo and a separate manifest.

---

## 8. What five real runs changed (2026-09-08)

These are operational, learned by spending the runs. Read them before spending more.

**Restricting tools is not optional — and `--allowedTools` is not how you do it.**
A model that can run shell will `grep -r UDSCANARY` the tree and recite everything,
and the run is then worth nothing. On Claude Code, `--allowedTools "Skill"` was
silently ignored under `--permission-mode bypassPermissions`; the model ran Bash
anyway. Use `--disallowedTools "Bash" "Read" "Grep" "Glob" "Write" "Edit"` and leave
the skill-loading tool available. Verify from the transcript which tools actually
ran — never from the flag you passed.

**The run-id guard costs you terse models.** Codex answered the whole probe with the
single word `none` (36 output tokens). It never echoed the run id, so the scorer
refused to score — correctly, since it cannot tell a terse answer from a mismatched
manifest. Those transcripts were four lines long and read by hand. This is the
guard's price, and it is the right side to err on: the opposite default manufactures
findings.

**🔴 Zero marker hits is not evidence about the install path.** The Antigravity arm
placed three candidate paths side by side, each with its own salt, expecting the
recital to name the winner. It could not: every tool measured returns zero hits even
when it demonstrably sees the skills, because what enters context is the skill
*description*, not the body. A path probe needs a control that distinguishes whether
the DESCRIPTION arrived. Codex supplies one by accident — it announces its skills
context budget when it has skills to fit. The canary does not.

**What the runs found.** Companion marker hits: 0 of 224, on all three tools. On
Claude Code the skill-loading tool returned 28 characters and no content, and the
model listed its own context as "system prompt, CLAUDE.md, the skill *list*, git
status, your message". Arrival of the body is the open question now — the companion
question sits behind it.
