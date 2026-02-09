# Developer Persistent Memory Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/developer-memory.md)

**Version**: 1.0.0
**Last Updated**: 2026-02-07
**Applicability**: All software projects using AI assistants
**Scope**: universal
**Industry Standards**: None (UDS original)

---

## Purpose

This standard defines a structured system for capturing, retrieving, and surfacing developer experience insights (pitfalls, patterns, anti-patterns, mental models, etc.) across conversations and projects. It enables AI assistants to proactively leverage accumulated knowledge, reducing repeated mistakes and accelerating problem-solving.

---

## Quick Reference

### Memory Entry Schema (Required Fields)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (format: `MEM-YYYY-NNNN`) |
| `insight` | string | Core insight in one sentence |
| `category` | enum | One of 9 category types (see §2) |
| `confidence` | float | 0.0–1.0, dynamically adjusted via feedback |
| `created_at` | date | ISO 8601 date (YYYY-MM-DD) |

### Memory Entry Schema (Optional Fields)

| Field | Type | Description |
|-------|------|-------------|
| `context` | string | Situation or environment where this applies |
| `anti_pattern` | string | What NOT to do (the mistake) |
| `resolution` | string | How to fix or avoid the issue |
| `example` | object | `{bad: string, good: string}` — code or approach examples |
| `tags` | list | Free-form tags for search (e.g., `["async", "race-condition"]`) |
| `applicability` | object | Language/framework scope (see §6) |
| `triggers` | list | Patterns that should cause this memory to surface |
| `related` | list | IDs of related memory entries |
| `validity` | object | Lifecycle metadata (see §7) |

### Statistics Fields (Auto-managed)

| Field | Type | Description |
|-------|------|-------------|
| `stats.times_surfaced` | int | How many times this memory was shown |
| `stats.times_useful` | int | Positive feedback count |
| `stats.times_not_useful` | int | Negative feedback count |
| `stats.last_surfaced` | date | Last time this memory was pushed |

### Feedback Log

| Field | Type | Description |
|-------|------|-------------|
| `feedback[]` | list | Array of feedback entries |
| `feedback[].date` | date | When feedback was given |
| `feedback[].result` | enum | `valid` / `invalid` / `needs-revision` |
| `feedback[].note` | string | Optional developer comment |

---

## 1. Memory Schema

### 1.1 Full Schema Definition

```yaml
# Memory Entry - Full Schema
id: "MEM-2026-0001"              # Required: Unique ID
insight: "..."                    # Required: One-sentence core insight
category: pitfall                 # Required: One of 9 types
confidence: 0.85                  # Required: 0.0–1.0
created_at: "2026-02-07"         # Required: ISO date

# Optional fields
context: "When using async iterators in Node.js streams..."
anti_pattern: "Calling next() without awaiting the previous result"
resolution: "Always await each next() call or use for-await-of"
example:
  bad: "iterator.next(); iterator.next();"
  good: "for await (const chunk of iterator) { ... }"
tags: ["async", "streams", "node"]
applicability:
  languages: ["javascript", "typescript"]
  frameworks: []
  universal: false
  exclusions: []
triggers:
  - "async iterator"
  - "stream processing"
  - "next() called multiple times"
related: ["MEM-2026-0005"]
validity:
  type: versioned            # evergreen | versioned | temporal
  version_bound: "node >= 18"
  expires_at: null

# Auto-managed
stats:
  times_surfaced: 12
  times_useful: 9
  times_not_useful: 1
  last_surfaced: "2026-02-01"
feedback:
  - date: "2026-01-15"
    result: valid
    note: "Saved me 30 minutes debugging"
```

### 1.2 ID Format

| Component | Format | Example |
|-----------|--------|---------|
| Prefix | `MEM` | `MEM` |
| Year | `YYYY` | `2026` |
| Sequence | `NNNN` | `0001` |
| Full | `MEM-YYYY-NNNN` | `MEM-2026-0001` |

IDs are globally unique. Sequence resets yearly.

---

## 2. Memory Categories

| Category | Description | Example |
|----------|-------------|---------|
| `pitfall` | Common mistake or trap | "Off-by-one error in pagination with 0-based API" |
| `pattern` | Proven solution or best practice | "Use builder pattern for complex object construction" |
| `anti-pattern` | Known bad practice to avoid | "God object that handles all business logic" |
| `mental-model` | Conceptual framework for understanding | "Think of React state as a snapshot, not a variable" |
| `workaround` | Temporary fix for a known issue | "Add `--legacy-peer-deps` for npm 7+ peer conflicts" |
| `performance` | Performance insight or optimization | "Use `Map` instead of `Object` for frequent lookups" |
| `debugging-strategy` | Approach for diagnosing issues | "Binary search through git history with `git bisect`" |
| `tool-usage` | Tool/library tips and tricks | "Use `npx tsc --noEmit` for type-checking without build" |
| `decision-rationale` | Why a specific decision was made | "Chose PostgreSQL over MongoDB for transaction support" |

---

## 3. Four Operations

### 3.1 Record (記錄)

#### Input Process

1. Developer describes an insight in natural language
2. AI structures it into the memory schema
3. Developer confirms or edits the structured entry
4. Entry is saved to the memory store

#### 30-Second Rule

Every memory entry must answer three questions:

| Question | Maps To |
|----------|---------|
| What is the specific problem? | `insight` |
| Why does it happen? | `context` + `anti_pattern` |
| How to fix/avoid it? | `resolution` |

#### Recording Levels

| Level | Fields | When to Use |
|-------|--------|-------------|
| Level 1: Quick | `insight`, `category`, `tags` | Quick note, will refine later |
| Level 2: Contextual | Level 1 + `context`, `anti_pattern`, `resolution` | Standard recording |
| Level 3: Refined | Level 2 + `example`, `triggers`, `applicability` | Important, frequently-used insight |

#### De-identification

Before storing, remove project-specific details:

| Remove | Keep |
|--------|------|
| API keys, secrets | Technical pattern |
| Project names, internal URLs | Framework/library names |
| Team member names | Language/version information |
| Proprietary business logic | Generic business logic pattern |

### 3.2 Query (查詢)

#### Search Methods

| Method | Description | Example |
|--------|-------------|---------|
| Keyword | Free-text search across `insight`, `context`, `tags` | `"async race condition"` |
| Tag | Exact match on `tags` field | `tags: ["react", "hooks"]` |
| Category | Filter by category type | `category: pitfall` |
| Language | Filter by `applicability.languages` | `languages: ["python"]` |
| Confidence | Filter by confidence threshold | `confidence >= 0.7` |
| Combined | Multiple filters combined | `category: pitfall AND tags: ["react"]` |

#### Query Result Sorting

| Priority | Criteria |
|----------|----------|
| 1 | Relevance to current context |
| 2 | Confidence score (highest first) |
| 3 | Hit rate (`times_useful / times_surfaced`) |
| 4 | Recency (`created_at` newest first) |

### 3.3 Feedback (回饋)

#### Feedback Actions

| Action | Effect on `confidence` | Effect on `stats` |
|--------|------------------------|-------------------|
| `valid` | +0.05 (cap at 1.0) | `times_useful += 1` |
| `invalid` | -0.15 (floor at 0.0) | `times_not_useful += 1` |
| `needs-revision` | -0.05 (floor at 0.0) | No change |

#### Confidence Adjustment Rules

| Condition | Action |
|-----------|--------|
| 3 consecutive `valid` | Bonus +0.05 |
| 3 consecutive `invalid` | Flag for review |
| `confidence < 0.2` | Flag for retirement |
| `confidence > 0.9` after 10+ uses | Mark as "proven" |

### 3.4 Review (審查)

AI scans the memory store and generates a review report covering:

#### Merge Suggestions

| Trigger | Action |
|---------|--------|
| Two entries with >80% semantic similarity | Suggest merge |
| Same `tags` + same `category` + similar `insight` | Suggest merge |
| Merged entries inherit highest `confidence` | Preserve both feedback logs |

#### Retirement Suggestions

| Trigger | Action |
|---------|--------|
| `confidence < 0.2` | Suggest retirement |
| Not surfaced in 180+ days AND `confidence < 0.5` | Suggest retirement |
| 5+ `invalid` feedback entries | Suggest retirement |

#### Staleness Detection

| Trigger | Action |
|---------|--------|
| `validity.type == "versioned"` AND version is outdated | Flag as stale |
| `validity.type == "temporal"` AND `expires_at` passed | Flag as expired |
| `validity.type == "evergreen"` | Skip version check |

#### Revision Suggestions

| Trigger | Action |
|---------|--------|
| 2+ `needs-revision` feedback | Suggest revision |
| High `times_surfaced` but low `times_useful` ratio | Suggest revision |

---

## 4. Proactive Behavior Protocol

### 4.1 Memory Surfacing (主動浮現)

#### When to Surface

| Timing | Behavior |
|--------|----------|
| Conversation start | Scan memory store, show top 3 relevant to stated task |
| During development | Detect code patterns, error messages, or tech decisions that match `triggers` |
| Before committing | Surface relevant pitfalls for changed files/patterns |

#### Surfacing Rules

| Rule | Value | Rationale |
|------|-------|-----------|
| Relevance threshold | > 0.7 | Avoid noise from loosely-related memories |
| Cooldown period | 7 days per entry | Prevent repetitive suggestions |
| Max per trigger | 3–5 entries | Information overload prevention |
| Overflow handling | AI summarizes into grouped insight | When > 5 matches found |

#### Surfacing Format

```
💡 Memory Match [MEM-2026-0042] (confidence: 0.85)
Category: pitfall | Tags: async, promise
Insight: Promise.all rejects on first failure — use Promise.allSettled for partial results
Context: When processing batch API calls where partial success is acceptable
```

### 4.2 Memory Extraction (主動萃取)

#### Trigger Signals

AI should detect these developer signals and suggest recording:

| Signal | Example |
|--------|---------|
| Repeated modification | Same code block edited 3+ times |
| Revert | `git revert` or manual undo |
| Insight language | "Oh!", "I see", "原來", "終於", "the trick is..." |
| Long debugging session | 10+ minutes on same error |
| Solution after struggle | Error → multiple attempts → resolution |

#### Extraction Flow

```
1. AI detects signal
2. AI proposes: "It seems you discovered something. Want to record this insight?"
3. AI pre-structures the entry based on conversation context
4. Developer confirms / edits / skips
5. If confirmed → saved to memory store
```

### 4.3 Memory Aggregation (主動聚合)

#### Aggregation Triggers

| Trigger | Action |
|---------|--------|
| 3+ related `pitfall` entries | Suggest grouping into a `mental-model` |
| 5+ entries with same tag | Suggest creating a topic summary |
| Scattered fragments about same concept | Suggest consolidation |

#### Upgrade Path

```
Multiple pitfalls → Pattern → Mental Model
  (fragments)     (solution)  (understanding)
```

---

## 5. Noise Control

### Push Levels

| Level | Name | Behavior |
|-------|------|----------|
| 0 | Silent | Never push; only respond to queries |
| 1 | Summary | Show count: "3 relevant memories found. Want to see them?" |
| 2 | Active (default) | Show top 3 with one-line summaries |
| 3 | Detailed | Show full entries with context and examples |

### Noise Reduction Rules

| Rule | Description |
|------|-------------|
| Feedback-driven | If user marks 3+ surfaced memories as `invalid`, reduce to Level 1 |
| Session respect | After user says "not now", switch to Level 0 for current session |
| Confidence filter | Only surface entries with `confidence >= 0.5` |
| Proven bias | Prioritize entries with "proven" status (confidence > 0.9, 10+ uses) |

---

## 6. Cross-Language Applicability

### Applicability Schema

```yaml
applicability:
  languages: ["javascript", "typescript"]  # Applicable languages (empty = universal)
  frameworks: ["react", "next.js"]          # Applicable frameworks (empty = any)
  universal: false                           # true = applies to all languages
  exclusions: ["rust"]                       # Languages where this explicitly does NOT apply
```

### Applicability Rules

| Scenario | `universal` | `languages` | `exclusions` |
|----------|-------------|-------------|--------------|
| Applies to all languages | `true` | `[]` | `[]` |
| Language-specific | `false` | `["python", "ruby"]` | `[]` |
| All except some | `true` | `[]` | `["c", "assembly"]` |
| Framework-specific | `false` | `["javascript"]` | `[]` |

---

## 7. Knowledge Lifecycle

### Validity Types

| Type | Description | Staleness Check |
|------|-------------|-----------------|
| `evergreen` | Always applicable (e.g., algorithm insight) | None |
| `versioned` | Tied to specific version (e.g., API behavior) | Check `version_bound` |
| `temporal` | Time-limited (e.g., workaround for a bug) | Check `expires_at` |

### Validity Schema

```yaml
validity:
  type: versioned          # evergreen | versioned | temporal
  version_bound: "react >= 18"  # For versioned type
  expires_at: "2026-12-31"      # For temporal type
```

### Confidence Lifecycle

```
New entry: confidence = 0.5 (default)
    ↓ valid feedback
Growing: 0.5 → 0.7 → 0.85
    ↓ consistent positive use
Proven: 0.9+ (after 10+ surfacings)
    ↓ invalid feedback / staleness
Declining: 0.85 → 0.6 → 0.3
    ↓ retirement threshold
Retired: confidence < 0.2
```

### Retirement Conditions

An entry is flagged for retirement when ANY of:

- `confidence < 0.2`
- Not surfaced in 180+ days AND `confidence < 0.5`
- 5+ `invalid` feedback entries
- `validity.type == "temporal"` AND `expires_at` has passed
- `validity.type == "versioned"` AND version is no longer in use

Retired entries are archived (not deleted) for historical reference.

---

## 8. Metrics

### Key Metrics

| Metric | Formula | Healthy Range |
|--------|---------|---------------|
| Hit rate | `times_useful / times_surfaced` | > 0.6 |
| Feedback ratio | `(valid + invalid) / times_surfaced` | > 0.3 |
| Library growth | New entries per month | 5–20 |
| Retirement rate | Retired entries per month | < 20% of new |
| Coverage | Categories with 5+ entries | 6+ of 9 categories |

### Health Indicators

| Indicator | Good | Warning | Action Needed |
|-----------|------|---------|---------------|
| Avg confidence | > 0.6 | 0.4–0.6 | < 0.4 |
| Hit rate | > 0.6 | 0.3–0.6 | < 0.3 |
| Stale entries | < 10% | 10–25% | > 25% |
| Orphan entries (never surfaced) | < 15% | 15–30% | > 30% |

---

## 9. Storage Format

### Recommended: YAML per Category

```
.memory/
├── pitfall.yaml
├── pattern.yaml
├── anti-pattern.yaml
├── mental-model.yaml
├── workaround.yaml
├── performance.yaml
├── debugging-strategy.yaml
├── tool-usage.yaml
├── decision-rationale.yaml
└── _index.yaml          # ID registry and cross-references
```

#### File Size Guideline

| Entries per File | Recommendation |
|------------------|----------------|
| < 100 | Single YAML file per category |
| 100–500 | Split by sub-topic within category |
| > 500 | Consider JSONL format |

### Alternative: JSONL

For large memory stores, use one JSONL file per category:

```
.memory/
├── pitfall.jsonl
├── pattern.jsonl
└── ...
```

Each line is a complete JSON object representing one memory entry.

### Index File (`_index.yaml`)

```yaml
# Memory Index
last_id: "MEM-2026-0042"
total_entries: 42
by_category:
  pitfall: 12
  pattern: 8
  anti-pattern: 5
  mental-model: 3
  workaround: 4
  performance: 3
  debugging-strategy: 2
  tool-usage: 3
  decision-rationale: 2
```

---

## Related Standards

- [Anti-Hallucination Standards](anti-hallucination.md) — Evidence-based analysis applies to memory sourcing
- [AI Instruction Standards](ai-instruction-standards.md) — Token-efficient format for memory system instructions
- [AI-Friendly Architecture](ai-friendly-architecture.md) — Project structure enabling memory integration
- [Documentation Writing Standards](documentation-writing-standards.md) — Writing quality for memory entries

---

## 10. Architecture Decision: Always-On Protocol

### Classification

Developer Persistent Memory is classified as an **Always-On Protocol**, not a User-Triggered workflow.

| Pattern | Characteristics | Examples | Skill Required? |
|---------|----------------|----------|-----------------|
| **User-Triggered** | User explicitly invokes, multi-step guided workflow | `/commit`, `/review`, `/sdd` | Yes |
| **Always-On Protocol** | AI continuously follows rules after loading ai.yaml | Anti-hallucination, Developer Memory | No |

### Rationale: No CLI / Skill / Slash Command Needed

| Component | Decision | Rationale |
|-----------|----------|-----------|
| CLI commands (`uds memory ...`) | **Not needed** | Core operations (semantic matching, insight extraction, confidence adjustment) require LLM intelligence; CLI can only do string matching |
| Skill (`skills/developer-memory/`) | **Not needed** | `developer-memory.ai.yaml` is self-sufficient with complete schema + rules + proactive protocol |
| `/memory add`, `/memory search` | **Not needed** | Contradicts the "proactive behavior" design — AI should extract and surface automatically |
| `/memory review` | **Deferred** | Only potentially useful command; defer until user feedback indicates need |

### How It Works Without Additional Tooling

```
AI loads developer-memory.ai.yaml
    ↓
Rules automatically activate:
  - proactive-surfacing: Surface relevant memories on context match
  - proactive-extraction: Detect insight moments, offer to record
  - proactive-aggregation: Suggest merging related entries
  - noise-control: Respect push levels and cooldown
    ↓
No explicit user trigger needed
```

### Future Considerations

If user feedback reveals:
- **Discoverability gap**: Consider a lightweight Skill (configuration detection + discoverability)
- **Explicit review need**: Consider `/memory review` slash command
- **Never needed**: `uds memory add/search` CLI commands — these operations inherently require LLM

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-07 | Initial standard: schema, 4 operations, proactive protocol, noise control, architecture decision (Always-On Protocol) |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
