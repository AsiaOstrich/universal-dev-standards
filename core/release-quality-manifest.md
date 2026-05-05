# Release Quality Manifest

## Overview

A Release Quality Manifest (RQM) is a machine-readable document generated automatically by CI for every release. It aggregates the results of all quality gates into a single artifact that serves as the authoritative evidence of release readiness — both for internal go/no-go automation and for customer audits.

## Why a Manifest?

Without a manifest, quality evidence is scattered across CI logs, coverage HTML reports, SARIF files, and container scan summaries. When a customer asks "how was this release tested?", the answer is either "trust us" or a 45-minute manual aggregation exercise.

A Release Quality Manifest makes quality evidence:
- **Aggregated**: one file, all gates
- **Machine-readable**: downstream tooling can parse and enforce
- **Timestamped and commit-pinned**: tied to a specific release artifact
- **Customer-shareable**: ready to attach to a release package

## Schema

```yaml
release: vibeops-commercial-1.2.0
generated_at: "2026-05-05T04:00:00Z"
commit: "abc1234"
gates:
  unit_coverage:
    actual: "73%"
    target: "80%"
    status: warn        # within 10pp of target → warn, not fail
  mutation_score:
    actual: "62%"
    target: "60%"
    status: pass
  sca_critical_cve:
    actual: 0
    target: 0
    status: pass
  sca_high_cve:
    actual: 0
    target: 0
    status: pass
  sast_high:
    actual: 0
    target: 0
    status: pass
  e2e_pass_rate:
    actual: "96%"
    target: "95%"
    status: pass
  container_cve_critical:
    actual: 0
    target: 0
    status: pass
  image_signed:
    actual: true
    target: true
    status: pass
  sbom_present:
    actual: true
    target: true
    status: pass
overall: WARN   # worst gate status (2 warns, no fails)
```

## Status Semantics

| Status | Meaning | Action |
|--------|---------|--------|
| `pass` | Meets or exceeds target | None required |
| `warn` | Within acceptable deviation (see per-gate policy) | Document reason; no release block |
| `fail` | Below hard minimum | **Blocks release** |

### Per-Gate Hard Minimums (Examples)

| Gate | Warn Band | Fail Threshold |
|------|-----------|----------------|
| unit_coverage | target - 10pp to target | below target - 10pp |
| mutation_score | target - 5pp to target | below target - 5pp |
| sca_critical_cve | — | any critical CVE = fail |
| container_cve_critical | — | any critical CVE = fail |
| e2e_pass_rate | target - 3pp to target | below target - 3pp |

## Automated Generation

Generate the manifest in CI after all gate jobs complete:

```bash
#!/usr/bin/env bash
# scripts/generate-quality-manifest.sh
set -euo pipefail

COVERAGE=$(node -e "
  const r = JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json'));
  console.log(r.total.lines.pct.toFixed(1) + '%')
")

MUTATION=$(node -e "
  const r = JSON.parse(require('fs').readFileSync('reports/mutation/mutation-testing-report.json'));
  console.log(r.metrics.mutationScore.toFixed(1) + '%')
")

CRITICAL_CVE=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' trivy-report.json)

cat > quality-manifest.yaml <<YAML
release: ${RELEASE_TAG}
generated_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
commit: "${GITHUB_SHA:-$(git rev-parse HEAD)}"
gates:
  unit_coverage:
    actual: "${COVERAGE}"
    target: "80%"
    status: $([ $(echo "$COVERAGE" | tr -d '%') -ge 80 ] && echo pass || echo warn)
  sca_critical_cve:
    actual: ${CRITICAL_CVE}
    target: 0
    status: $([ "$CRITICAL_CVE" -eq 0 ] && echo pass || echo fail)
overall: $(grep -q "fail" quality-manifest.yaml && echo FAIL || grep -q "warn" quality-manifest.yaml && echo WARN || echo PASS)
YAML
```

## Customer-Facing Summary

Generate a Markdown table alongside the YAML for inclusion in release notes:

```markdown
## Release Quality Gates — vibeops-commercial-1.2.0

| Gate | Actual | Target | Status |
|------|--------|--------|--------|
| Unit Test Coverage | 73% | 80% | ⚠️ WARN |
| Mutation Score | 62% | 60% | ✅ PASS |
| Critical CVEs | 0 | 0 | ✅ PASS |
...
| **Overall** | | | ⚠️ WARN |
```

## Anti-Patterns

- **Manually authoring the manifest** — defeats the purpose; must be generated from tool outputs
- **Using warn for critical security gates** — `sca_critical_cve` and `container_cve_critical` are binary
- **Generating the manifest before all gates have run** — values must reflect actual results, not estimates
- **Not attaching the manifest to the release artifact** — a manifest in git history is not accessible to customers

## See Also

- `verification-evidence.ai.yaml` — audit evidence principles
- `supply-chain-attestation.ai.yaml` — SBOM and provenance
- `testing.ai.yaml` — overall test strategy
- `deployment-standards.ai.yaml` — release gate integration
