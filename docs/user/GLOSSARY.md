# UDS Glossary

> **Language**: English | [繁體中文](../../locales/zh-TW/docs/user/GLOSSARY.md) _(planned)_

Terms specific to UDS or used in a UDS-specific way.

---

## A

**AC (Acceptance Criterion)**
A testable statement that defines when a feature is considered complete. Written in Given-When-Then or plain English. ACs are tracked in Spec files and referenced in tests.
_See: `/atdd`, `/sdd`, `acceptance-test-driven-development` standard_

**Activity**
In the DEC-051 four-layer classification model, an Activity is a named workflow step (e.g., "Write failing test", "Run regression"). Activities are defined in UDS standards and executed by Skills.

**ADR (Architecture Decision Record)**
A document that records a significant technical decision: the context, the options considered, the chosen option, and the consequences.
_See: `/adr`, `adr-standards` standard_

**ATDD (Acceptance Test-Driven Development)**
A practice where Acceptance Criteria are defined before implementation begins, and tests are written to validate those ACs. Bridges BDD and TDD.
_See: `/atdd`_

---

## B

**BDD (Behavior-Driven Development)**
A development practice that uses natural-language Given-When-Then scenarios to describe system behavior. Scenarios serve as both documentation and test specifications.
_See: `/bdd`, `behavior-driven-development` standard_

**Bundle (Bundle Layer)**
The subset of UDS standards included in the `npm install` package (intended for adopters). Distinct from the Source layer which includes all standards including governance and maintenance tooling.
_See: DEC-045_

---

## C

**Core Standard**
A Markdown file in `core/` (and `.standards/*.md`) that contains the full, human-readable version of a UDS standard. Includes rationale, edge cases, examples, and references.
_Contrast with: AI Standard_

**AI Standard**
A `.ai.yaml` file in `.standards/` (and `ai/standards/`) that is a token-efficient, AI-optimized encoding of a Core Standard. Read by Skills during execution.

---

## D

**DEC (Decision)**
A cross-project architectural or product decision documented in `dev-platform/cross-project/decisions/DEC-NNN-*.md`. DECs are numbered sequentially and track the "why" behind major choices.

**Dual-Layer Architecture**
UDS's two-layer design: Core Standards (complete knowledge, human-readable) + AI Standards (token-efficient, machine-readable). Skills use AI Standards; developers read Core Standards.

---

## S

**SDD (Spec-Driven Development)**
A UDS practice where a specification document is created before writing code. The spec defines background, scope, Acceptance Criteria, and out-of-scope items.
_See: `/sdd`, `spec-driven-development` standard_

**Skill**
A pre-built AI workflow packaged as a SKILL.md file. Activated by typing `/<name>` in Claude Code. Skills implement UDS activities using AI Standards.
_See: [SKILLS-INDEX.md](SKILLS-INDEX.md)_

**Skill Budget**
The fraction of Claude Code's context window reserved for listing available skills. With 54+ skills, descriptions can be truncated. UDS uses Tiers to manage this budget.
_See: DEC-061, [skill-budget-tuning.md](../skill-budget-tuning.md)_

**Skill Tier (DEC-061)**
A classification of skills by usage frequency that controls listing behavior:
- **Tier 1 (Core)**: 13 skills, daily use, always listed with description
- **Tier 2 (Advanced)**: 27 skills, weekly use, listed with description by default
- **Tier 3 (Specialist)**: 14 skills, event-driven, name-only listing by default (callable via `/<name>`)

**Standard**
A UDS guideline document covering a specific practice (e.g., commit messages, API design, testing). Standards are technology-agnostic and language-agnostic. Each standard exists as a Core Standard (`.md`) and an AI Standard (`.ai.yaml`).

**Source (Source Layer)**
The full UDS repository including all standards, governance tooling, and maintenance scripts. Superset of the Bundle layer.
_See: DEC-045_

---

## T

**TDD (Test-Driven Development)**
A development practice where tests are written before the implementation code. The RED-GREEN-REFACTOR cycle: write a failing test → make it pass → refactor.
_See: `/tdd`, `test-driven-development` standard_

---

## U

**UDS (Universal Development Standards)**
This project. A language-agnostic, framework-agnostic collection of 125 core standards, 54 AI skills, and 48 slash commands for software development quality.

**UDS Manifest (`uds-manifest.json`)**
The machine-readable index of all UDS standards and skills. Contains stats, skill-to-command mappings, and category assignments. Used by the UDS CLI and doc generators.

---

## X

**XSPEC (Cross-Project Spec)**
A specification document in `dev-platform/cross-project/specs/XSPEC-NNN-*.md`. Used for features that affect multiple sub-projects (UDS, VibeOps, telemetry) or for new UDS features.
_All new specs are created as XSPECs per the centralization policy (2026-04-22)._

---

## See Also

- [FAQ.md](FAQ.md) — Common questions
- [SKILLS-INDEX.md](SKILLS-INDEX.md) — All skills with descriptions
- [GETTING-STARTED.md](GETTING-STARTED.md) — First-time setup
