# Spec-Driven Development (SDD) Standards

**Version**: 2.3.0
**Last Updated**: 2026-06-08
**Applicability**: All projects adopting Spec-Driven Development
**Scope**: universal
**Industry Standards**: None (Emerging 2025+ methodology)
**References**: [specmatic.io](https://specmatic.io/)

---

## Summary

Spec-Driven Development (SDD) is an AI-era methodology (2025+) distinct from traditional TDD/BDD/ATDD. It ensures that changes are planned, documented, and approved via specifications before implementation. The core principle is **"Spec First, Code Second"** - no functional code changes without a corresponding approved specification.

SDD operates at different maturity levels: Spec-first (discard after completion), Spec-anchored (maintain throughout evolution), and Spec-as-source (spec is only source, code auto-generated). The methodology uses Forward Derivation to generate test artifacts (BDD scenarios, TDD skeletons, contracts) from specifications.

---

**Full Guide: [SDD Guide](../methodologies/guides/sdd-guide.md)**

---

## Quick Reference

| Aspect | Description |
|--------|-------------|
| **Core Workflow** | Discuss → Proposal → Review → Implementation → Verification → Archive |
| **Key Principle** | Spec First, Code Second |
| **AC Format** | Given/When/Then (GWT, default — enables BDD derivation) **or** EARS notation (optional, XSPEC-263) |
| **Test Generation** | Forward Derivation (/derive-bdd, /derive-tdd, /derive-all) |
| **Maturity Levels** | Spec-first, Spec-anchored, Spec-as-source |
| **Tools** | OpenSpec, Spec Kit, Manual (file-based) |
| **I/O Contract** | Optional structured input/output definitions for cross-spec data flow |
| **Assumptions** | Required section tracking assumptions ([Assumption]) and open questions ([Need Confirmation]) |
| **AC YAML Sidecar** | Recommended .ac.yaml for machine-readable AC (when >3 ACs) |
| **AI Agent Behavior** | Optional section defining agent roles, rules, quality checks, constraints |

## Acceptance Criteria Formats | AC 格式

UDS supports two AC notations. **GWT is the default and preferred** (Forward Derivation / BDD scenario generation depends on it). **EARS** (Easy Approach to Requirements Syntax, IBM Rational) is an optional supplement that expresses event/state/ubiquitous/unwanted requirements more precisely.

| EARS type | Template | Use for |
|-----------|----------|---------|
| Ubiquitous | `THE SYSTEM SHALL <response>` | always-active requirement (no trigger) |
| Event-driven | `WHEN <trigger> THE SYSTEM SHALL <response>` | triggered by an event |
| State-driven | `WHILE <state> THE SYSTEM SHALL <response>` | active during a state |
| Unwanted | `IF <condition>, THEN THE SYSTEM SHALL <response>` | error / exception handling |
| Optional | `WHERE <feature included> THE SYSTEM SHALL <response>` | optional feature |

Provide **GWT or EARS** per AC (`.ac.yaml`: `given/when/then` **or** `ears`). Prefer GWT for BDD-derivable behaviour; reach for EARS when GWT feels forced. Do not require both; do not remove GWT.

## What's New in v2.3.0

- **EARS notation** as an optional AC format (XSPEC-263): 5 EARS templates + `.ac.yaml` `ears` field. GWT remains default & preferred; `given/when/then` relaxed from `required` (backward compatible).

## What's New in v2.2.0

- **AC YAML Sidecar**: Machine-readable acceptance criteria via `.ac.yaml` files (schema: `specs/schemas/acceptance-criteria.schema.yaml`)
- **I/O Contract Section**: Optional structured input/output contract in spec template
- **Assumptions & Open Questions Section**: Required section for new specs, integrates anti-hallucination tags
- **AI Agent Behavior Section**: Optional section for defining AI agent behavior within specs

> Existing specs are NOT required to retroactively add these sections.

## Related Standards

- [Forward Derivation Standards](forward-derivation-standards.md)
- [Reverse Engineering Standards](reverse-engineering-standards.md)
- [Test-Driven Development](test-driven-development.md)
- [Behavior-Driven Development](behavior-driven-development.md)
