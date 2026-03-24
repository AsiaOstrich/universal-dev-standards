---
name: ci-cd
scope: universal
description: |
  Guide CI/CD pipeline design, configuration, and optimization.
  Use when: setting up pipelines, optimizing build times, configuring deployment stages.
  Keywords: CI/CD, pipeline, GitHub Actions, deployment, build, 持續整合, 持續部署.
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
> - 部署配置 → 執行 `/deploy` 設定部署策略 — Configure deployment strategy
> - 安全掃描 → 執行 `/security` 檢查管線安全 — Check pipeline security
> - 測試設計 → 執行 `/testing` 設計測試策略 — Design test strategy
> - 提交規範 → 執行 `/commit` 建立規範化提交 — Create conventional commit

## Reference | 參考

- Core standard: [pipeline-integration-standards.md](../../core/pipeline-integration-standards.md)
- Core standard: [deployment-standards.md](../../core/deployment-standards.md)

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |

## License | 授權

CC BY 4.0 — Documentation content
