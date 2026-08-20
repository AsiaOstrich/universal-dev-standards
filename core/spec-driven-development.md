# Spec-Driven Development (SDD) Standards

**Version**: 2.4.0
**Last Updated**: 2026-08-17
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

## An AC With No Verification Item Is Not an AC | 沒有驗證項的 AC 不是 AC

Every acceptance criterion must have a **verification item that points at it** — a test, a
check, a gate, or an explicitly recorded manual step. An AC that no verification item
references is a **promise nobody kept**, and it does not fail loudly: it simply stops being
true while the spec continues to assert it.

每一條驗收標準都必須有一個**指向它的驗證項**——測試、檢查、閘門，或一則明確記錄的
手動步驟。沒有任何驗證項引用的 AC 是**一張沒有人兌現的支票**，而且它不會大聲失敗：
它只是安靜地停止成立，而規格繼續宣稱它為真。

**Rule**: an AC without a verification item must be **demoted to a design intent**, not
carried as an AC. Demotion is honest; an unverified AC is not.
**規則**：沒有驗證項的 AC 必須**降級為設計意圖**，不得繼續掛在 AC 欄。降級是誠實的，
未經驗證的 AC 不是。

### The measured instance | 實測案例

A 2026-05-14 spec carried `AC-7: the legacy system-report is fully preserved, no
regression`. Its Test Plan had seven items and **none of them pointed at AC-7**. The
report's timer was disabled and its deploy function was never called — **from the same day
the AC was written**. It was found three months later, by accident, while verifying an
unrelated install.

**It was never wired to a check and later came loose. It was never wired at all.**

一份 2026-05-14 的規格寫著 `AC-7：舊版系統報告完整保留（無回歸）`。它的 Test Plan
有七項，**沒有一項指向 AC-7**。該報告的 timer 是 disabled、部署函式從未被呼叫——
**從那條 AC 被寫下的同一天起**。三個月後在驗證另一件無關的安裝時偶然發現。

**它不是後來斷線的。它從來沒有被接上過。**

### Why "someone will check it" is not a verification item

A verification item must be **executable or recorded**, not implied. "The reviewer will
notice" is not one, because a reviewer reads the spec — and the spec says the AC holds.
An AC is a claim **about the world**, and only something that touches the world can
falsify it.

「有人會檢查」不是驗證項。它必須**可執行或有紀錄**，不能是隱含的。「審查者會注意到」
不算——因為審查者讀的是規格，而規格說那條 AC 成立。**AC 是一個關於世界的宣稱，
只有碰得到世界的東西才能證偽它。**

### Related | 關聯

- [verification-evidence](verification-evidence.md) — VE-011 requires evidence to come from a
  fresh run **after the last edit**; this standard is the upstream question of whether any
  run was ever pointed at the claim in the first place.
- [class-level-fix](class-level-fix.md) — the same discipline applied to *scope*: traverse the
  set rather than enumerate it.

## What's New in v2.4.0

- **An AC with no verification item is not an AC** (XSPEC-380 R5). Every acceptance criterion must have a verification item pointing at it; one that has none is demoted to a design intent rather than carried as an AC. Measured instance: a spec's `AC-7` had no matching Test Plan item, and the thing it protected stopped running **on the day the AC was written** — found three months later by accident. An AC is a claim about the world, and only something that touches the world can falsify it.

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
