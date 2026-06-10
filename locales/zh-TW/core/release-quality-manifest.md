---
source: ../../../core/release-quality-manifest.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 9ab9b61963df
status: current
---

# Release Quality Manifest（發布品質清單）

> **Language**: [English](../../../core/release-quality-manifest.md) | 繁體中文

## 概述

Release Quality Manifest（RQM）是由 CI 為每次發布自動產生的機器可讀文件。它將所有品質閘門的結果彙整為單一產物，作為發布就緒度的權威證據——既供內部 go/no-go 自動化使用，也供客戶稽核使用。

## 為什麼需要 Manifest？

沒有 manifest 時，品質證據會散落在 CI 日誌、覆蓋率 HTML 報告、SARIF 檔案與容器掃描摘要之中。當客戶問「這個發布是怎麼測試的？」，答案要不是「相信我們」，就是一場 45 分鐘的手動彙整作業。

Release Quality Manifest 讓品質證據變得：
- **彙整化**：一個檔案，所有閘門
- **機器可讀**：下游工具可以解析並強制執行
- **帶時間戳且綁定 commit**：與特定發布產物綁定
- **可與客戶分享**：可直接附加到發布套件

## Schema

RQM 目前涵蓋 **16 個品質維度**，與 `release-readiness-gate.md` 對齊。自動化閘門出現在此處；人工驗證的閘門則出現在 Release Readiness Sign-off 文件中。

```yaml
release: app-commercial-1.2.0
generated_at: "2026-05-05T04:00:00Z"
commit: "abc1234"
gates:
  # ── Automated quality gates ──────────────────────────────
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
  # ── Extended dimensions (aligned with release-readiness-gate.md) ──
  a11y_critical:             # Dimension 3: axe-core critical violations
    actual: 0
    target: 0
    status: pass
  a11y_serious:              # Dimension 3: axe-core serious violations
    actual: 0
    target: 0
    status: pass
  contract_drift:            # Dimension 4: consumer contracts failing (n/a if no consumers)
    actual: 0
    target: 0
    status: pass             # or "n/a" if no API consumers
  cross_flow_cuj_pass_rate:  # Dimension 6: critical user journey pass rate
    actual: "100%"
    target: "95%"
    status: pass
  browser_tier1_pass_rate:   # Dimension 9: Tier-1 browser matrix (n/a for non-frontend)
    actual: "100%"
    target: "100%"
    status: pass             # or "n/a" for CLI/backend
  capacity_headroom_cpu_pct: # Dimension 10: CPU headroom at projected peak (n/a for small projects)
    actual: "42%"
    target: "30%"
    status: pass             # or "n/a" for small-scale projects
  smoke_pass_rate:           # Dimension 14: post-deploy smoke (populated after staging deploy)
    actual: "100%"
    target: "100%"
    status: pass
  flow_gate_report:          # Dimension 16: Multi-Gate Flow verification
    gate_0_complete: true    # all flows with ≥3 steps have §2.4 + §9.4 filled
    gate_1_pr_coverage: true # all PRs touching flows include terminal-state tests
    gate_3_ci_pass: true     # Decision Table CI all green; branch coverage ≥ 90%
    gate_4_uat_signoff: true # UAT sign-off table signed
    status: pass
overall: WARN   # worst gate status across all dimensions (2 warns, no fails)
```

## 狀態語義

| 狀態 | 意義 | 行動 |
|--------|---------|--------|
| `pass` | 達到或超過目標 | 無需任何行動 |
| `warn` | 在可接受偏差範圍內（見各閘門政策） | 記錄原因；不阻擋發布 |
| `fail` | 低於硬性下限 | **阻擋發布** |

### 各閘門硬性下限

| 閘門 | Warn 區間 | Fail 門檻 | Release Readiness 維度 |
|------|-----------|----------------|----------------------------|
| unit_coverage | target - 10pp 至 target | 低於 target - 10pp | （核心 RQM） |
| mutation_score | target - 5pp 至 target | 低於 target - 5pp | （核心 RQM） |
| sca_critical_cve | — | 任何 critical CVE = fail | Dim 2（安全） |
| container_cve_critical | — | 任何 critical CVE = fail | Dim 2（安全） |
| e2e_pass_rate | target - 3pp 至 target | 低於 target - 3pp | （核心 RQM） |
| a11y_critical | — | > 0 = fail | Dim 3（a11y） |
| a11y_serious | 專案門檻 | 專案門檻 + 1-2 | Dim 3（a11y） |
| contract_drift | — | 任何紅燈 consumer contract = fail（若 n/a：跳過） | Dim 4（Contract） |
| cross_flow_cuj_pass_rate | 90–95% | < 90% | Dim 6（跨流程回歸） |
| browser_tier1_pass_rate | — | < 100%（若 n/a：跳過） | Dim 9（瀏覽器相容性） |
| capacity_headroom_cpu_pct | 20–30% | < 20%（若 n/a：跳過） | Dim 10（容量） |
| smoke_pass_rate | — | 任何 smoke 失敗 = fail | Dim 14（Smoke） |
| flow_gate_report | gate_3_ci_pass=false | gate_0_complete=false 或 gate_4_uat_signoff=false | Dim 16（Multi-Gate Flow） |

## 自動產生

在所有閘門 job 完成後於 CI 產生 manifest：

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

## 面向客戶的摘要

在 YAML 之外同時產生 Markdown 表格，以便納入 release notes：

```markdown
## Release Quality Gates — app-commercial-1.2.0

| Gate | Actual | Target | Status |
|------|--------|--------|--------|
| Unit Test Coverage | 73% | 80% | ⚠️ WARN |
| Mutation Score | 62% | 60% | ✅ PASS |
| Critical CVEs | 0 | 0 | ✅ PASS |
...
| **Overall** | | | ⚠️ WARN |
```

## 反模式

- **手動撰寫 manifest** —— 違背初衷；必須由工具輸出產生
- **對關鍵安全閘門使用 warn** —— `sca_critical_cve` 與 `container_cve_critical` 是二元判定
- **在所有閘門跑完之前產生 manifest** —— 數值必須反映實際結果，而非估計值
- **未將 manifest 附加到發布產物** —— 只存在於 git 歷史中的 manifest 客戶無法取得

## 另請參閱

- `verification-evidence.ai.yaml` — 稽核證據原則
- `supply-chain-attestation.ai.yaml` — SBOM 與 provenance
- `testing.ai.yaml` — 整體測試策略
- `deployment-standards.ai.yaml` — 發布閘門整合


**Scope**: universal
