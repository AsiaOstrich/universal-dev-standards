---
source: ../../../core/release-quality-manifest.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 9ab9b61963df
status: current
---

# Release Quality Manifest（发布质量清单）

> **语言**: [English](../../../core/release-quality-manifest.md) | [繁體中文](../../zh-TW/core/release-quality-manifest.md) | 简体中文

## 概述

Release Quality Manifest（RQM）是由 CI 为每次发布自动生成的机器可读文档。它将所有质量门禁的结果汇总为单一产物，作为发布就绪度的权威证据——既供内部 go/no-go 自动化使用，也供客户审计使用。

## 为什么需要 Manifest？

没有 manifest 时，质量证据会散落在 CI 日志、覆盖率 HTML 报告、SARIF 文件与容器扫描摘要之中。当客户问"这个发布是怎么测试的？"，答案要么是"相信我们"，要么是一场 45 分钟的手动汇总作业。

Release Quality Manifest 让质量证据变得：
- **汇总化**：一个文件，所有门禁
- **机器可读**：下游工具可以解析并强制执行
- **带时间戳且绑定 commit**：与特定发布产物绑定
- **可与客户共享**：可直接附加到发布包

## Schema

RQM 目前覆盖 **16 个质量维度**，与 `release-readiness-gate.md` 对齐。自动化门禁出现在此处；人工验证的门禁则出现在 Release Readiness Sign-off 文档中。

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

## 状态语义

| 状态 | 含义 | 行动 |
|--------|---------|--------|
| `pass` | 达到或超过目标 | 无需任何行动 |
| `warn` | 在可接受偏差范围内（见各门禁策略） | 记录原因；不阻断发布 |
| `fail` | 低于硬性下限 | **阻断发布** |

### 各门禁硬性下限

| 门禁 | Warn 区间 | Fail 阈值 | Release Readiness 维度 |
|------|-----------|----------------|----------------------------|
| unit_coverage | target - 10pp 至 target | 低于 target - 10pp | （核心 RQM） |
| mutation_score | target - 5pp 至 target | 低于 target - 5pp | （核心 RQM） |
| sca_critical_cve | — | 任何 critical CVE = fail | Dim 2（安全） |
| container_cve_critical | — | 任何 critical CVE = fail | Dim 2（安全） |
| e2e_pass_rate | target - 3pp 至 target | 低于 target - 3pp | （核心 RQM） |
| a11y_critical | — | > 0 = fail | Dim 3（a11y） |
| a11y_serious | 项目阈值 | 项目阈值 + 1-2 | Dim 3（a11y） |
| contract_drift | — | 任何红灯 consumer contract = fail（若 n/a：跳过） | Dim 4（Contract） |
| cross_flow_cuj_pass_rate | 90–95% | < 90% | Dim 6（跨流程回归） |
| browser_tier1_pass_rate | — | < 100%（若 n/a：跳过） | Dim 9（浏览器兼容性） |
| capacity_headroom_cpu_pct | 20–30% | < 20%（若 n/a：跳过） | Dim 10（容量） |
| smoke_pass_rate | — | 任何 smoke 失败 = fail | Dim 14（Smoke） |
| flow_gate_report | gate_3_ci_pass=false | gate_0_complete=false 或 gate_4_uat_signoff=false | Dim 16（Multi-Gate Flow） |

## 自动生成

在所有门禁 job 完成后于 CI 生成 manifest：

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

## 面向客户的摘要

在 YAML 之外同时生成 Markdown 表格，以便纳入 release notes：

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

- **手动编写 manifest** —— 违背初衷；必须由工具输出生成
- **对关键安全门禁使用 warn** —— `sca_critical_cve` 与 `container_cve_critical` 是二元判定
- **在所有门禁跑完之前生成 manifest** —— 数值必须反映实际结果，而非估计值
- **未将 manifest 附加到发布产物** —— 只存在于 git 历史中的 manifest 客户无法获取

## 另请参阅

- `verification-evidence.ai.yaml` — 审计证据原则
- `supply-chain-attestation.ai.yaml` — SBOM 与 provenance
- `testing.ai.yaml` — 整体测试策略
- `deployment-standards.ai.yaml` — 发布门禁集成


**Scope**: universal
