# AI Model Selection Strategy

> **Language**: English | [繁體中文](../locales/zh-TW/core/model-selection.md)

**Version**: 2.1.0
**Last Updated**: 2026-08-11
**Applicability**: AI-assisted development with multiple model tiers
**Scope**: universal
**Inspired by**: [Superpowers](https://github.com/obra/superpowers) — subagent-driven-development (MIT)

---

## Purpose

Define how to choose **which model** and **how deeply it should think** — two independent decisions that must not be collapsed into one. Use the cheapest combination that can handle the job, and escalate along the correct axis when it cannot.

定義兩個獨立決策：**選哪個模型**與**要它想多深**。兩者不可壓成同一軸。使用能勝任的最便宜組合，失敗時沿**正確的軸**升級。

---

## Glossary

| Term | Definition |
|------|-----------|
| Model Tier | A classification level representing a model's reasoning ceiling and cost |
| Effort Level | How much reasoning depth is requested **for one dispatch**; a request parameter, not a model property |
| Reasoning Ceiling | The limit beyond which more thinking time yields no better answer |
| Specification Definiteness | Whether the steps are already defined, or only the goal and constraints are known |
| Hard Boundary | A capability the model does not have at all (not "worse at") — e.g. context capacity, effort-parameter support |
| Refusal Marker | A field in an otherwise-normal response indicating the request was declined |
| Escalation | Moving up the model axis after the effort axis is exhausted |

---

## Version Field Semantics

> **This document carries exactly one version.** The `Version` field in the header covers the
> whole file, including every section. **Sections MUST NOT carry their own version markers.**
> Section-level change history belongs in the [Version History](#version-history) table.
>
> The `standard.meta.version` field in `ai/standards/model-selection.ai.yaml` corresponds to
> **this whole-file version**, never to a section version.

本檔只有一個版本欄，位於檔頭，涵蓋全檔。**章節不得自帶版本標記**；章節的變更歷程一律記於 Version History 表。`.ai.yaml` 的 `standard.meta.version` 對應**全檔版本**。

---

## Core Principle — Two Orthogonal Axes

> **The model axis buys a ceiling and a temperament. The effort axis buys depth on this one dispatch. Choosing on one axis tells you nothing about the other.**

模型軸買的是「天花板與性格」，effort 軸買的是「這一次要它想多深」。在一軸上的選擇，不決定另一軸。

```
                        effort →   low        medium      high      very-high    max
model tier ↓
  fast                             ·          ·           ·         ?            ?
  standard                         ·          ·           ·         ?            ?
  capable                          ·          ·           ·         ?            ?
```

Every cell is in principle a legal dispatch: the two axes are chosen independently.

`?` marks a cell whose availability **this standard cannot state**. Whether a given model accepts a given effort level is a property of that model, and tier names here are vendor-neutral labels — so the answer lives in each platform's tier→model mapping, not in this table. An unsupported level is a **hard boundary**, not a poor choice: see [R3a](#r3a-hard-boundaries). Adopters MUST record, per model, which levels it accepts.

`?` 標示的格子，**本標準無法斷言其可用性**——某個模型接受哪些 effort 級距是該模型的屬性，而此處的層級名稱是與廠商無關的標籤。答案在各平台自己的「層級 → 模型」映射裡。

---

## Axis 1 — Model Tier

### Selection Criteria

Two criteria decide the tier. **Neither is "how many files does this change".**

兩個判準決定分層。**兩者都不是「改幾個檔案」**。

#### Criterion 1 — Reasoning Ceiling Requirement（推理天花板需求）

Does the task contain a component that **more thinking time cannot solve**?

- **No** → a lower tier suffices; buy depth with effort instead of buying a ceiling with money.
- **Yes** → a higher ceiling is required; no amount of effort on a lower tier reaches it.

這個任務是否存在「想更久也想不出來」的成分？若否，較低層加 effort 即可；若是，才需要更高天花板。

#### Criterion 2 — Specification Definiteness（規格明確度）

**This criterion is bidirectional. It is not monotonically increasing.**

| Specification state | Prefer | Failure mode if inverted |
|---|---|---|
| Steps already defined, path known | Literal-following tier (lower) | Feeding a written-out step list to a high-ceiling model **lowers** output quality — it reinterprets what was already decided |
| Only goal and constraints known, path unknown | Ambiguity-navigating tier (higher) | Handing an ambiguous task to a literal-following model yields **"precisely executed the wrong sentence"** |

規格明確度是**雙向**判準：把模糊任務給字面遵循型，會得到「精確執行了錯誤的那句話」；把已寫死的步驟餵給高天花板型，反而降低品質。

> **Why file count was removed.** A 3-file redesign of module boundaries is harder than an 8-file
> mechanical rename. File count mis-sorts "deep and narrow" work **in a fixed direction** — it is a
> bias, not noise. It survived as a signal because it is cheap to measure, not because it predicts
> anything.

### The Three Tiers

Tier ids (`fast` / `standard` / `capable`) are unchanged. Only the criteria changed.

#### Tier 1: Fast（快速層）

**Purpose**: Work with no reasoning ceiling requirement and a fully definite specification.

無推理天花板需求、規格完全明確的工作。

**Signals**:
- No component that "more thinking cannot solve"
- Steps are written out; no path-finding needed
- No design judgment required
- Literal following is exactly what is wanted

**Examples**:
- Apply a defined edit across a set of files (mechanical rename, version bump)
- Fix a typo
- Add an export statement named in the spec

#### Tier 2: Standard（標準層）

**Purpose**: A modest reasoning ceiling, with a specification that is mostly defined but leaves local decisions open.

需要一定推理天花板，規格大致明確但留有局部決策空間。

**Signals**:
- Some components need reasoning, but none are "unreachable by thinking longer"
- Goal and most steps defined; a bounded set of local choices remains
- Requires understanding inter-module relationships

**Examples**:
- Implement a defined feature whose integration points are known
- Refactor a module against a stated target structure
- Write integration tests for a specified subsystem

#### Tier 3: Capable（能力層）

**Purpose**: A high reasoning ceiling, or a specification that gives only goal and constraints.

需要高推理天花板，或規格僅有目標與約束、路徑未知。

**Signals**:
- Contains a component that more thinking time alone cannot resolve
- Path is unknown; the answer must be found, not applied
- Requires navigating ambiguity rather than following text

**Examples**:
- Design a subsystem architecture (path unknown)
- Review a large pull request (what matters is not stated in advance)
- Diagnose a failure whose cause is not yet hypothesised

> **Note on "large refactor"**: a major refactor with a *defined* target structure is **not**
> automatically Tier 3 — under Criterion 2 it is a definite specification, and a high-ceiling model
> may produce worse results than a literal-following one. What raises it to Tier 3 is an *undecided*
> target structure.

### Selection Decision Flow

```
Does the task contain something more thinking cannot solve?
  ├── Yes → high ceiling needed → Tier 3 (Capable)
  └── No  → how definite is the specification?
            ├── Fully defined steps, path known   → Tier 1 (Fast)
            ├── Goal + most steps, local choices  → Tier 2 (Standard)
            └── Goal + constraints only           → Tier 3 (Capable)
Then, independently: choose an effort level (Axis 2).
```

---

## Axis 2 — Effort (Reasoning Depth)

Effort is **a parameter of one dispatch**, not a property of a model. The same model at `low` and at `max` is not the same worker.

effort 是**單次派工的參數**，不是模型屬性。

### Vendor-Neutral Effort Levels

Each platform maps these labels to its own parameter. The labels are the contract; the mapping is local.

| Level | Semantics | Typical use |
|---|---|---|
| `low`（低） | Minimal deliberation; answer largely on pattern | Mechanical edits, lookups, formatting |
| `medium`（中） | Ordinary deliberation; the default | Most defined implementation work |
| `high`（高） | Extended deliberation; considers alternatives before answering | Integration work with local decisions |
| `very-high`（極高） | Explores and discards candidate approaches | Design, review, non-obvious debugging |
| `max`（極限） | Maximum available depth for this model | Last attempt before escalating the model axis |

**Not every tier supports every level.** Support for the effort parameter is a **hard boundary**, not a quality gradient — see [R3a](#r3a-hard-boundaries). A platform's tier→model mapping MUST record which levels each model accepts.

### Failure Diagnosis — Depth or Ceiling?

> **When a dispatch fails, first decide which axis was insufficient. The two remedies are not interchangeable.**

任務失敗時，**先判斷是「深度不足」還是「天花板不足」**——兩者的補救方式不可互換。

| Observation | Diagnosis | Remedy | Wrong remedy costs |
|---|---|---|---|
| Output is shallow, skipped considerations, stopped early, but the reasoning it *did* do was sound | **Depth insufficient** | Raise effort on the **same** model | Escalating the tier pays more for a ceiling that was never the constraint |
| Output is wrong in kind — misunderstood the problem, produced an approach that cannot work — **and this persists at `max` effort** | **Ceiling insufficient** | Escalate the **model** tier | Raising effort again buys nothing; the level is already exhausted |

**Ordering rule**: raise effort before escalating the tier. Escalate the tier only after the current tier's **highest supported** effort level has failed. A tier escalation performed without exhausting effort is an untested assumption about which axis was short.

**Exception**: if [Criterion 1](#criterion-1--reasoning-ceiling-requirement推理天花板需求) already identified a component that more thinking cannot solve, start at the higher tier. The ordering rule is about *diagnosing failures*, not about ignoring the criteria up front.

---

## Reverse Exclusion Rules

The tier criteria say what work should be **raised** to a tier. This section says what work must **not** be sent to one. These are separate questions, and the second one has no answer derivable from the first.

### R3a Hard Boundaries

> **A hard boundary is the absence of a capability, not a lower degree of it.** A model that cannot hold the input does not "do the task worse" — it does not do the task.

硬邊界是**能力有無**，不是程度差。

Adopters MUST record hard boundaries in their tier→model mapping, **alongside and separately from** capability scores:

| Hard boundary | Question it answers | Consequence when violated |
|---|---|---|
| **Context capacity** | Does the input fit? | Truncation or error — the model never saw part of the task |
| **Effort parameter support** | Does this model accept an effort level at all? | Request rejected, or silently executed at the model's fixed depth |
| **Modality support** | Can it accept this input type at all (image, audio)? | Input dropped or rejected |

**Rule**: a model failing any required hard boundary is **excluded before cost comparison**, not ranked lower within it. Excluding it afterwards allows a cheaper, incapable model to win on price.

**Recording format**: hard boundaries map to `declared` in the [capability registry](#capability_dimensions--capability-dimensions) — a boolean, obtainable at connection time, at near-zero cost. A score of `1` is **not** a hard boundary; it is a measured low quality (see [R7a state table](#routing_rules--four-state-routing)).

### R3b Reverse Risks

Higher capability is not uniformly better. Two risks run in the opposite direction from the tier criteria:

#### 1. Safety-classifier refusal on specification-sensitive work

Higher-capability tiers may carry stricter safety classification. Work that is legitimate but resembles a prohibited category — security hardening, exploit-mitigation implementation, credential-handling code, red-team tooling — may be **declined**.

> **The refusal is not an error.** The call returns a normal response with a refusal marker.
> For a caller that checks only the exit code, or only whether an exception was raised, **this is a
> silent failure**: the pipeline records success, and the work was never done.

拒絕**不是錯誤**——回傳的是正常回應加上拒絕標記。對只看 exit code／有無例外的呼叫端，這是**靜默失效**。

**Requirements**:

1. Callers **MUST inspect the response for a refusal marker**. Absence of an error is not evidence of completion. (See the `verification-evidence` standard: "the checking tool ran and returned nothing useful" is a distinct failure class from "the check was not run".)
2. Specification-sensitive work **MUST be feasibility-checked before batch dispatch** to a high-capability tier — a cheap probe request, not the full task.
3. On refusal, **re-dispatch to a different tier or provider**; do not retry the same request at higher effort. Effort does not move a classifier decision.

#### 2. Over-specified prompts degrade high-ceiling models

Writing out every step is the correct practice for a literal-following tier and the **wrong** practice for a high-ceiling one: the latter reinterprets decisions that were already made, and the output gets worse.

**Rule**: prompt granularity follows the tier. If a fully written-out step list is the only prompt available, [Criterion 2](#criterion-2--specification-definiteness規格明確度) already says to send it to a lower tier — sending it to a high tier is a double mistake, paying more for worse output.

---

## Escalation Rules

Escalation now has two axes; the table applies **after** effort has been exhausted at the current tier.

| Current Tier | On failure at max supported effort | Action |
|-------------|-----------|--------|
| Fast | → Standard | Re-dispatch at Standard tier |
| Standard | → Capable | Re-dispatch at Capable tier |
| Capable | → Human | Flag for human intervention |

### Escalation is Not Retry

Escalation means using a more capable model, not repeating the same action. The higher-tier model receives:
- The original task
- The lower-tier model's output and failure reason
- The effort level already attempted
- Additional context if available

升級不是重試。更高層級的模型會收到原始任務、低層級的輸出與失敗原因，以及**已嘗試過的 effort 等級**。

---

## Rules

| ID | Trigger | Action | Priority |
|----|---------|--------|----------|
| MS-001 | BLOCKED at Fast tier, effort exhausted | Escalate to Standard | High |
| MS-002 | BLOCKED at Standard tier, effort exhausted | Escalate to Capable | High |
| MS-003 | BLOCKED at Capable tier, effort exhausted | Flag for human intervention | Critical |
| MS-004 | Task specification gives only goal and constraints | Start at Standard or higher | Medium |
| MS-005 | Output shallow but sound; effort not yet at max | Raise effort on the same model — do **not** escalate tier | High |
| MS-006 | Output wrong in kind and effort already at max | Escalate model tier — raising effort buys nothing | High |
| MS-007 | Candidate model fails a required hard boundary (context, effort support, modality) | Exclude **before** cost comparison | Critical |
| MS-008 | Dispatching specification-sensitive work to a high-capability tier | Probe feasibility first; inspect every response for a refusal marker | Critical |
| MS-009 | Prompt is a fully written-out step list | Prefer a literal-following tier; do not escalate to a high-ceiling tier | Medium |
| MS-010 | `pin_date` or `measured.at` older than 90 days | WARN and queue for re-measurement (does not block) | Medium |

---

## Cost Optimization Tips

1. **Try the effort axis first** — it is the cheaper of the two axes to move
2. **Batch simple tasks** — send multiple Fast-tier tasks in one session
3. **Track escalation rates by axis** — frequent effort escalation and frequent tier escalation have different root causes and different fixes
4. **Review Capable usage** — a Capable dispatch on a fully defined specification is both more expensive and likely worse

---

## LLM Capability Management (XSPEC-027)

The two axes above answer "which model, how deep". This section answers a third, independent question: **can this model do this kind of thing at all, and how well** — needed in multi-model-pool environments.

### capability_dimensions — Capability Dimensions

Capabilities are grouped in four categories, ten sub-dimensions:

| Category | Sub-dimension | Description | Benchmark |
|------|--------|------|---------|
| modality | vision | Image / screenshot understanding | internal-vision-bench |
| modality | audio | Speech understanding | future-audio-bench |
| modality | image_generation | Image generation | provider-specific |
| reasoning | code_reasoning | Code understanding and generation quality | humaneval-plus |
| reasoning | math_reasoning | Mathematical reasoning accuracy | gsm8k |
| reasoning | instruction_following | Multi-step instruction adherence | internal-instruction-bench |
| reasoning | long_context_quality | Mid-document information access | needle-in-haystack |
| output | structured_output | JSON / schema output success rate | internal-json-bench |
| output | tool_use | Function-calling correctness | internal-tool-bench |
| language | multilingual_zh_tw | Traditional Chinese quality | internal-zh-tw-bench |

#### Each sub-dimension has TWO independent fields

> **A single 1–5 score cannot express two different things.** "Does it support this" is binary,
> vendor-declared, and obtainable at connection time. "How good is it" is continuous and requires a
> benchmark run. Encoding both in one number means the cheap fact and the expensive fact become
> indistinguishable — and the expensive one silently wins.

每個子維度拆為兩個獨立欄位：

| Field | Type | Source | Cost | Meaning |
|---|---|---|---|---|
| `declared` | boolean | Provider model-description endpoint or configuration declaration | ~0, at connection time | **Can it do this at all** |
| `measured` | `{ score: 1–5, at: date, version_identifier: string }` | Benchmark run | High, offline | **How well does it do it** |

**Normative rules**:

1. **`declared: false` is a hard boundary.** The model cannot do this, regardless of any score. It is excluded, and it is **not** queued for calibration — measuring it is meaningless.
2. **`declared: true` with `measured` absent = `UNKNOWN`.** It can do this; we do not know how well. This is an information gap, not a conclusion.
3. **`supported` MUST NOT be derived from `score`.** Any implementation computing `supported = score > 0` (or similar) has merged the two fields back into one axis and reintroduced the defect this rule exists to prevent.
4. **A failed measurement MUST NOT be recorded as a score.** Record it as absent (`UNKNOWN`). Filling a failed measurement with a default value — including `0`, which is not on the 1–5 scale — makes "we could not measure it" indistinguishable from "we measured it and it was bad".

**Scoring scale (1–5), applies to `measured.score` only**:

| Score | Meaning |
|------|------|
| 5 | Production-ready — high accuracy, usable directly |
| 4 | Good — occasional gaps, acceptable |
| 3 | Basically usable — needs human supplementation |
| 2 | Partially usable — reference only |
| 1 | Unreliable — not recommended |

There is no `0`. Absence of a measurement is expressed by the **absence of the `measured` object**, never by a score.

### capability_registry — Model Capability Registry

Each project maintains scores for its own models in its own `capability_registry`, based on its own measurements.

> **This standard registers no concrete vendor model IDs, by rule.** A model ID written into a
> standard is a citation with an expiry date and no clock: it goes stale, and a stale entry is
> indistinguishable on the page from a current one. Examples below use placeholders.

**本標準的 examples 不得登記任何具體廠商模型 ID**——那是等著過期的引用端。具體登記由採用者在自己的 registry 維護。

**Format**:
```yaml
- model_id: "<provider>/<model-name>"        # placeholder — adopters fill in
  version_pinned: "<version-identifier>"      # SHA, date stamp, or model_version
  pin_date: "<YYYY-MM-DD>"
  eol_date: "<YYYY-MM-DD>"                    # optional
  capabilities:
    "modality.vision":
      declared: true
      measured:
        score: 4
        at: "<YYYY-MM-DD>"
        version_identifier: "<version-identifier measured against>"
    "modality.audio":
      declared: false                          # hard boundary — no measured field, none needed
    "output.tool_use":
      declared: true                           # measured absent → UNKNOWN → calibration queue
```

**Version pinning (DEC-031 D1)**: `version_pinned` and `pin_date` are REQUIRED, to prevent silent model upgrades from changing capability without notice.

**Staleness check (WARN, not BLOCK)**: a `pin_date` or `measured.at` older than **90 days** MUST raise a WARN naming the affected `model_id` and sub-dimension. It MUST NOT block a release — the false-positive rate of purely in-file invariants is too high to gate on.

### routing_rules — Four-State Routing

> **"Never measured" and "measured and unreliable" are not the same state.** Collapsing them means a
> newly detected model is excluded on its first evaluation and never re-enters the pool — the exact
> opposite of supporting more models.

「沒測過」與「測過且不可靠」不是同一件事。壓成同一態的後果是**新模型永遠進不了候選池**。

| State | Condition | Action |
|---|---|---|
| `SUPPORTED` | All required capabilities `measured.score` ≥ `min_score` | Execute normally |
| `DEGRADED` | `measured.score` present, ≥ 2, but below `min_score` | Execute degraded; mark output `[DEGRADED]` |
| `UNSUPPORTED` | **`measured` present** and `score` ≤ 1 | Exclude; do **not** queue for calibration (a conclusion exists) |
| `UNKNOWN` | **`measured` absent** — never registered, measurement failed, or data expired — while `declared: true` | **Queue for calibration**; MUST NOT be silently excluded before calibration completes |

**`declared: false`** is handled before this table: it is a hard boundary ([R3a](#r3a-hard-boundaries)), excluded and **not** queued.

**Observability requirement**: `UNKNOWN` and `UNSUPPORTED` MUST be distinguishable **in the return structure**, not merely in logs. A caller has to be able to tell "this model cannot do it" from "I do not yet know whether this model can do it" — they lead to different next actions. A routing API returning a single boolean, or returning three states, cannot express this.

**Decision tree**:

```
Task requires capability X
  ├── declared == false                          → HARD BOUNDARY — exclude, no calibration
  ├── measured absent / failed / expired         → UNKNOWN     — queue for calibration
  ├── measured.score ≤ 1                         → UNSUPPORTED — exclude, no calibration
  ├── measured.score ≥ 2 and < min_score         → DEGRADED    — run, mark [DEGRADED]
  └── measured.score ≥ min_score                 → SUPPORTED   — run
```

### Re-measurement Triggers — Three Independent Paths

> **Version change is a sufficient condition, not a necessary one.** Degradation detection
> (DEC-033) exists precisely because behaviour changes while the model ID and version string
> stay the same. An implementation triggered only by version change misses the entire scenario
> DEC-033 was built to catch.

**版本變更是充分條件，不是必要條件。**

| # | Trigger | Effect |
|---|---|---|
| 1 | `version_identifier` differs from the one recorded in `measured` | Existing measurement is **invalidated immediately** → state becomes `UNKNOWN` |
| 2 | `measured.at` older than 90 days | Queue for re-measurement; WARN (see MS-010) |
| 3 | Degradation-detection alert (DEC-033, CAP-004 / CAP-005) | Queue for re-measurement **even though the version string did not change** |

These three are **independent**: each fires on its own, and none is a precondition for another.

### Capability Rules

| ID | Condition | Action | Priority |
|------|------|------|------|
| CAP-001 | Required capability's `measured.score` ≥ `min_score` | SUPPORTED — execute normally | High |
| CAP-002 | `measured.score` ≥ 2 but below `min_score` | DEGRADED — degraded flow, mark output `[DEGRADED]` | Medium |
| CAP-003 | **`measured` present** and `score` ≤ 1 | UNSUPPORTED — alternative flow or prompt user; do not calibrate | High |
| CAP-004 | Degradation detection (DEC-033) raises a moderate signal | Start canary testing, record degradation warning, **queue affected capabilities for re-measurement** | High |
| CAP-005 | Degradation detection raises a critical signal | Switch to fallback model, file a P1 issue, **queue affected capabilities for re-measurement** | Critical |
| CAP-006 | `declared: true` and `measured` absent, failed, or expired | UNKNOWN — queue for calibration; MUST NOT be silently excluded | High |
| CAP-007 | `declared: false` for a required capability | Hard boundary — exclude before cost comparison; do **not** queue for calibration | Critical |
| CAP-008 | `version_identifier` changed since `measured.version_identifier` | Invalidate the measurement immediately → `UNKNOWN` | High |

**Selection strategy**: `pareto_weighted` — prefer the model with the highest scores on the required dimensions at the lowest cost, **among candidates that passed hard-boundary exclusion**.

### Relationship to the Two Axes

- **Model axis** — reasoning ceiling and temperament (which model)
- **Effort axis** — reasoning depth for this dispatch (how deep)
- **Capability dimensions** — whether the chosen model can do this *kind* of thing at all, and how well

Order of application: exclude on hard boundaries → select tier by the two criteria → confirm the required capabilities are `SUPPORTED` or acceptably `DEGRADED` → choose an effort level.

---

## Navigation Integration | 與下一步建議整合

The [ai-response-navigation](ai-response-navigation.md) standard (Rule R6, optional) allows each next-step suggestion option to carry a Tier annotation. The criteria in this standard serve as the judgment basis.

> **Changed in 2.1.0**: annotations previously derived from file count. Existing annotations made
> under the old criteria may no longer be accurate. Tier ids are unchanged, so no data migration is
> required; re-evaluate annotations when the surrounding text is next edited.

**Vendor-neutral principle**: Tier names (Fast / Standard / Capable) and effort labels (`low` … `max`) are tool-agnostic. They do not correspond to any specific vendor's model identifiers or parameter names. Each platform or tool independently maintains its own tier → model mapping, effort-label → parameter mapping, and hard-boundary register.

Example mapping (illustrative only, not normative):

| Tier | Typical capability level |
|------|--------------------------|
| Fast | Lightweight / literal instruction-following |
| Standard | Balanced reasoning + code generation |
| Capable | High reasoning ceiling, ambiguity navigation |

---

## Related Standards

- [agent-dispatch](agent-dispatch.md) — **how to dispatch**: parallel safety, independent-domain criteria, status protocol, prompt design. This standard covers **who to dispatch to and how deeply**; the two are complementary and **must not duplicate each other**. Parallel-safety rules belong there, not here.
- [verification-evidence](verification-evidence.md) — why "no error was raised" is not evidence of success; the basis for the refusal-marker requirement in [R3b](#r3b-reverse-risks)
- [systematic-debugging](systematic-debugging.md) — diagnosing before changing, applied here to the depth-vs-ceiling decision

---

## References

- **Superpowers**: [subagent-driven-development](https://github.com/obra/superpowers) (MIT)
- **Cost-Effective AI**: Principle of using the minimum capability needed

---

## Version History

> **Note on ordering**: rows are in version order, not date order. Version `2.0.0` (2026-04-13)
> predates `1.0.1` (2026-06-10) because the capability-management section carried its own version
> sequence at the time. Version 2.1.0 removes section-level versions; see
> [Version Field Semantics](#version-field-semantics).

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-08-11 | **Two-axis restructure (XSPEC-362)**. Model-axis criteria changed from file count to reasoning-ceiling requirement × specification definiteness (R1). Added the orthogonal effort axis with vendor-neutral levels and the depth-vs-ceiling failure diagnosis (R2). Added reverse-exclusion rules: hard boundaries and safety-classifier refusal as silent failure (R3). `capability_dimensions` sub-dimensions split into `declared` / `measured` (R7b); `routing_rules` extended to four states separating `UNKNOWN` from `UNSUPPORTED` (R7a); three independent re-measurement triggers (R7c). `capability_registry` examples replaced with placeholders and a 90-day staleness WARN added (R4). Section versions removed; `.ai.yaml` `meta.version` defined as the whole-file version (R6a). New rules MS-005–MS-010, CAP-006–CAP-008. |
| 2.0.0 | 2026-04-13 | Add LLM Capability Management section (XSPEC-027 Phase 1): `capability_dimensions`, `capability_registry`, `routing_rules`. *Recorded retroactively in 2.1.0 — this change was never entered in the version history when it was made.* |
| 1.0.1 | 2026-06-10 | Add Navigation Integration section (R6 cross-reference; vendor-neutral principle) |
| 1.0.0 | 2026-03-20 | Initial release |
