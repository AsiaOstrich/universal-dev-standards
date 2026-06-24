---
name: ci-cd
scope: universal
description: |
  Guide CI/CD pipeline design, configuration, and optimization.
  Use when: setting up pipelines, optimizing build times, configuring deployment stages.
  Keywords: CI/CD, pipeline, GitHub Actions, deployment, build.
allowed-tools: Read, Grep, Glob
argument-hint: "[pipeline config or stage | Pipeline 配置或階段]"
---

# CI/CD Pipeline Assistant | CI/CD 管線助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/ci-cd-assistant/SKILL.md)

Guide CI/CD pipeline design following industry best practices and DORA metrics.

引導 CI/CD 管線設計，遵循業界最佳實踐與 DORA 指標。

## Pipeline Stage Reference | 管線階段參考

```
BUILD ──► TEST ──► ANALYZE ──► DEPLOY ──► VERIFY
建置       測試      分析         部署       驗證
```

| Stage | Purpose | Key Activities | 關鍵活動 |
|-------|---------|----------------|----------|
| **Build** | Compile & package | Dependency install, compilation, artifact creation | 安裝相依、編譯、產出成品 |
| **Test** | Quality verification | Unit, integration, E2E tests | 單元、整合、端對端測試 |
| **Analyze** | Code quality | Lint, security scan, coverage report | 程式碼檢查、安全掃描、覆蓋率 |
| **Deploy** | Release to environment | Staging → Production rollout | 預備環境 → 正式環境部署 |
| **Verify** | Post-deploy validation | Smoke tests, health checks, monitoring | 冒煙測試、健康檢查、監控 |

## DORA Metrics Quick Reference | DORA 指標快速參考

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| **Deployment Frequency** 部署頻率 | On-demand (multiple/day) | Weekly–Monthly | Monthly–Biannual | > 6 months |
| **Lead Time for Changes** 變更前置時間 | < 1 hour | 1 day–1 week | 1–6 months | > 6 months |
| **MTTR** 平均恢復時間 | < 1 hour | < 1 day | 1 day–1 week | > 6 months |
| **Change Failure Rate** 變更失敗率 | 0–15% | 16–30% | 16–30% | > 30% |

## Best Practices Checklist | 最佳實踐檢查清單

- [ ] **Fail fast** — Run fastest checks first (lint → unit → integration → E2E)
- [ ] **Cache dependencies** — Cache `node_modules`, `.m2`, pip cache between runs
- [ ] **Parallel jobs** — Split test suites across parallel runners
- [ ] **Immutable artifacts** — Build once, deploy the same artifact to all environments
- [ ] **Environment parity** — Keep staging identical to production
- [ ] **Secrets management** — Never hardcode secrets; use vault/environment variables
- [ ] **Branch protection** — Require CI pass before merge
- [ ] **Rollback strategy** — Automate rollback on deploy failure

快速失敗、快取相依、平行作業、不可變成品、環境一致、密鑰管理、分支保護、回滾策略。

## Platform-Specific Tips | 平台專屬提示

| Platform | Cache | Parallelism | Secrets | 備註 |
|----------|-------|-------------|---------|------|
| **GitHub Actions** | `actions/cache` | `matrix` strategy | `secrets.*` context | 使用 reusable workflows |
| **GitLab CI** | `cache:` keyword | `parallel:` keyword | CI/CD Variables | 使用 `include:` 模組化 |
| **Jenkins** | Stash/unstash | `parallel {}` block | Credentials plugin | 使用 shared libraries |

## CI Job Orchestration Patterns | CI 作業編排模式

Recurring CI job-orchestration patterns (UDS #126). Each principle is platform-agnostic; the mapping columns show how each platform expresses it.
反覆出現的 CI 作業編排模式（UDS #126）。每條原則平台無關；對照欄顯示各平台的寫法。

### Trigger separation | 觸發分離

Separate heavy, slow suites (a full E2E run) from lightweight per-change checks by **trigger**, so runner cost scales with risk, not with every push.
將重型慢速套件（完整 E2E）以**觸發條件**與每次變更的輕量檢查分離，使 runner 成本隨風險而非每次 push 成長。

| Need | GitHub Actions | GitLab CI | Jenkins |
|------|----------------|-----------|---------|
| Heavy suite on schedule | `on: schedule:` | `rules: if $CI_PIPELINE_SOURCE == "schedule"` | cron trigger |
| Light checks per change | `on: pull_request` | `rules: if $CI_PIPELINE_SOURCE == "merge_request_event"` | SCM webhook |

> ⚠️ Anti-pattern: full E2E on every push. 反模式：每次 push 跑完整 E2E。

### Shared-resource serialization | 共享資源序列化

When several jobs touch one **stateful shared resource** (a single test env / runner / deploy target), serialize them to prevent concurrent corruption.
當多個作業觸及同一個**有狀態共享資源**（單一測試環境 / runner / 部署目標）時，序列化以防並發污染。

| Need | GitHub Actions | GitLab CI | Jenkins |
|------|----------------|-----------|---------|
| Mutual exclusion | `concurrency: { group: … }` | `resource_group:` | `lock(resource: …)` |

> ⚠️ Anti-pattern: two jobs writing the same DB/env in parallel. 反模式：兩作業並行寫同一 DB/環境。

### Change-detection gating | 變更偵測閘控

When `HEAD` is unchanged for a scope (or a change touches only out-of-scope paths), skip deploy/test to conserve runner time. Define "unchanged" **explicitly** (last-success SHA or path filters).
當某範圍的 `HEAD` 自上次成功未變（或變更只觸及範圍外路徑）時，跳過 deploy/test 以節省 runner。**明確**定義「未變」（上次成功 SHA 或路徑過濾）。

| Need | GitHub Actions | GitLab CI | Jenkins |
|------|----------------|-----------|---------|
| Skip on unchanged scope | `paths:` / `dorny/paths-filter` | `rules: changes:` / SHA compare | `changeset` condition |

> ⚠️ Anti-pattern: full deploy + test for a docs-only commit. 反模式：文件-only commit 跑完整部署。

### Advisory vs. gating jobs | 諮詢 vs 閘控作業

Declare each job as **advisory** (failure reported, does not block merge) or **gating** (failure blocks merge). Conflating them blocks on noise or fails to gate on what matters. (Security gates are the Block/Warn/Log specialization — see [`pipeline-security-gates`](../../core/pipeline-security-gates.md).)
明確宣告每個作業是 **advisory**（回報但不擋合併）或 **gating**（擋合併）。混淆會在雜訊上卡關、或漏掉該擋的。（安全閘門是 Block/Warn/Log 特例——見 [`pipeline-security-gates`](../../core/pipeline-security-gates.md)。）

| Need | GitHub Actions | GitLab CI | Jenkins |
|------|----------------|-----------|---------|
| Advisory (non-blocking) | `continue-on-error: true` | `allow_failure: true` | `catchError` → `unstable` |
| Gating (blocking) | required status check | default (no `allow_failure`) | hard fail |

> ⚠️ Anti-pattern: a noisy third-party lint as a hard gate, or a critical suite as advisory. 反模式：把雜訊 lint 設硬閘，或把關鍵套件設 advisory。

### Troubleshooting: `npm ci` `EUSAGE` | 排錯：`npm ci` `EUSAGE`

`npm ci` requires a **committed** lockfile. If `package-lock.json` is gitignored, CI dies with `EUSAGE`. Fix: commit the lockfile, or for CI-only installs use `npm install --no-audit --no-fund --ignore-scripts` (skipping `prepare`/husky hooks not wanted in CI).
`npm ci` 需要 **committed** lockfile。若 `package-lock.json` 被 gitignore，CI 會以 `EUSAGE` 失敗。修法：commit lockfile，或 CI-only 安裝用 `npm install --no-audit --no-fund --ignore-scripts`（跳過 CI 不需要的 `prepare`/husky hook）。

## Usage | 使用方式

```bash
/ci-cd                     # Show full pipeline guidance | 顯示完整管線指引
/ci-cd github-actions      # GitHub Actions specific tips | GitHub Actions 專屬提示
/ci-cd --optimize          # Pipeline optimization advice | 管線優化建議
/ci-cd build               # Build stage best practices | 建置階段最佳實踐
```

## Next Steps Guidance | 下一步引導

After `/ci-cd` completes, the AI assistant should suggest:

> **管線指引已提供。建議下一步 / Pipeline guidance provided. Suggested next steps:**
> - 部署配置 → 執行 `/deploy` 設定部署策略 ⭐ **Recommended / 推薦** — Configure deployment strategy
> - 安全掃描 → 執行 `/security` 檢查管線安全 — Check pipeline security
> - 測試設計 → 執行 `/testing` 設計測試策略 — Design test strategy
> - 提交規範 → 執行 `/commit` 建立規範化提交 — Create conventional commit

## Reference | 參考

- Core standard: [pipeline-integration-standards.md](../../core/pipeline-integration-standards.md)
- Core standard: [deployment-standards.md](../../core/deployment-standards.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.1.0 | 2026-06-24 | Add CI Job Orchestration Patterns (trigger separation, shared-resource serialization, change-detection gating, advisory-vs-gating, `npm ci` `EUSAGE` troubleshooting) — UDS #126 → XSPEC-300 | 新增 CI 作業編排模式（UDS #126） |
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |

## License | 授權

CC BY 4.0 — Documentation content
