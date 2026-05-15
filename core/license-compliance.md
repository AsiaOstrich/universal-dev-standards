# License Compliance Standards

> **Version**: 2.1.0 | **Status**: Active | **Updated**: 2026-05-16
> **AI-optimized version**: `ai/standards/license-compliance.ai.yaml`
> **Agent Spec**: ASPEC-001 (cross-project/aspec/ASPEC-001-license-compliance-agent.md)

## Overview

Comprehensive license compliance for AI-augmented development, covering both general OSS practice (Tier 1) and AI-specific rules for AI-generated code (Tier 2).

## Tier 1 — General OSS Compliance Practices

Applies to every project regardless of AI use.

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | License classification and allowlist | MUST |
| REQ-002 | Automated license scanning in CI | MUST |
| REQ-003 | SBOM generation (CycloneDX 1.5 or SPDX 2.3) | MUST |
| REQ-004 | License attribution and NOTICES file | MUST |
| REQ-005 | License violation remediation (5 business days) | MUST |
| REQ-006 | License review for new technology adoption | SHOULD |

### License Tiers

| Tier | Licenses | Action |
|------|----------|--------|
| APPROVED | MIT, Apache 2.0, BSD-2/3-Clause, ISC, CC0 | Auto-approve |
| REVIEW-REQUIRED | LGPL-2.1/3.0, MPL-2.0, CDDL | Legal review before adoption |
| PROHIBITED | GPL-2.0/3.0, AGPL-3.0, SSPL-1.0, BUSL-1.1 | Block PR immediately |

## Tier 2 — AI-Specific Rules

Binding on AI Agents that produce code (VibeOps Generator Agent and equivalents).

| ID | Rule | Severity |
|----|------|----------|
| LC-001 | SPDX ID lookup required | Blocking |
| LC-002 | Blocklist auto-block | Blocking |
| LC-003 | Allowlist auto-approve | Informational |
| LC-004 | Greylist human review | Review required |
| LC-005 | SBOM mandatory generation | Blocking |
| LC-006 | Copyright similarity threshold (≥0.85 block) | Blocking |
| LC-007 | PII pattern detection | Review required |
| LC-008 | EU AI Act transparency marker | Blocking |
| LC-009 | Customer policy ceiling | Informational |

## v2.1.0 Enhancements (XSPEC-193 Phase 2)

### ClearlyDefined API (LC-001)

- Primary license lookup source: `https://api.clearlydefined.io/definitions/{type}/{provider}/{namespace}/{name}/{revision}`
- Confidence ≥ 0.95 for well-known packages (score.total ≥ 80)
- 24h TTL LRU cache (cap=500) + negative cache for 404
- Token bucket: 10 req/s, burst 20
- Retry strategy: 5xx → exponential backoff × 3 (200ms/1s/3s); 429 → batch fallback
- DEC-064 cache key isolation: `sha256(client_salt + ':' + purl)`

### AST PII Analysis (LC-007)

- Tree-sitter support: TypeScript, JavaScript, Python
- Context classification:
  - `hardcoded_value` → severity upgraded to `critical`
  - `comment` → severity downgraded to `info`
  - `schema_field` → annotated, no severity change
- `// pii:ignore` pragma: suppresses findings on same line
- Optional fields: `PIIPattern.confidence`, `PIIPattern.ast_context`
- Graceful fallback to regex when tree-sitter unavailable

### EmbeddingProvider Strategy (LC-006)

- `provider='onnx-minilm'`: ONNX local inference (all-MiniLM-L6-v2)
- `provider='ollama-bge-m3'`: Ollama local API (localhost:11434)
- `provider='jaccard'`: Jaccard token similarity (Phase 1 baseline, default)
- In-memory snippet index (`buildSnippetIndex()`) per-customer (DEC-064 salt)
- External search: opt-in via `enableExternalSearch=true` (default=false)

## Principles

| ID | Principle |
|----|-----------|
| P-1 | SPDX First — all license IDs must be SPDX standard |
| P-2 | Independent Evaluator — different model class from Generator |
| P-3 | Evidence-Based Decision — every block carries traceable evidence |
| P-4 | Transparency by Default — EU AI Act Article 50 markers required |
| P-5 | Customer Sovereignty — policy customizable within EULA §9 limits |

## Tool Sequence (XSPEC-193 §2)

```
1. dependency_reader
2. license_lookup         ← ClearlyDefined API (v2.1.0)
3. license_blocklist_check
4. sbom_generator
5. pii_pattern_detector   ← AST-enhanced (v2.1.0)
6. copyright_similarity_check ← EmbeddingProvider (v2.1.0)
7. eu_ai_act_classifier
8. transparency_marker
9. block_pr
10. suggest_alternative
11. escalate_to_human
```

## Related Specs

- XSPEC-193 — License Compliance Agent complete spec
- XSPEC-066 — Wave 3 Compliance Pack (v1.0.0 baseline)
- DEC-063 — VibeOps legal & compliance strategy
- DEC-064 — Customer IP isolation (cache salt)
- ASPEC-001 — License Compliance Agent SPEC (XSPEC-205 §REQ-2 format)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-04-30 | Initial — REQ-001~006 general OSS practices |
| v2.0.0 | 2026-05-14 | Added Tier 2 LC-001~009 AI-specific rules |
| v2.1.0 | 2026-05-16 | ClearlyDefined API + AST PII + EmbeddingProvider + ASPEC-001 ref |
