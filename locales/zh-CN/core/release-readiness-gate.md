---
source: ../../../core/release-readiness-gate.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 622d8cb59abb
status: current
---

# 发布就绪闸门（Release Readiness Gate）

> **语言**：[English](../../../core/release-readiness-gate.md) | [繁體中文](../../zh-TW/core/release-readiness-gate.md) | 简体中文

**版本**：1.0.0
**最后更新**：2026-05-05
**适用范围**：所有准备进行生产环境发布的软件项目
**Scope**：universal
**业界标准**：ISO/IEC 25010（产品质量）、ISTQB Advanced Test Manager
**参考文件**：`core/release-quality-manifest.md`、`core/flow-based-testing.md`

---

## 目的

本标准定义一个**单一、汇整式的发布就绪闸门（Release Readiness Gate）**，将所有质量维度统一成生产部署前一个明确的 go/no-go 决策。

若没有这个闸门，质量证据会散落在 16 个以上的独立标准中。团队虽然通过了个别检查，却在未验证某些维度的情况下出货，因为没有任何一份文件明说「你必须在发布前通过*所有这些项目*」。

发布就绪闸门：
- **汇整（Aggregates）** 16 个质量维度成为一份分级 checklist
- **连结（Connects）** 人工 sign-off（本文件）与机器可读的证据（`release-quality-manifest.md`）
- **区分（Distinguishes）** 阻挡性条件与建议性警告
- **可伸缩（Scales）** 透过 Tier-1 / Tier-2 / Tier-3 分级，以适应不同类型与风险等级的项目

---

## 与发布质量清单（Release Quality Manifest, RQM）的关系

| 产物 | 格式 | 对象 | 目的 |
|----------|--------|----------|---------|
| **发布就绪 Sign-off**（本文件的模板） | Markdown checklist | 人类（PM、QA、Eng Lead、Business） | Go/no-go 决策、责任归属、审计轨迹 |
| **发布质量清单**（`release-quality-manifest.md`） | YAML/JSON | CI、工具、客户 | 机器可读的汇整、自动化闸门强制执行 |

这两份产物在每次发布时**并行（in parallel）**产生。Sign-off 涵盖人工验证的维度；RQM 涵盖自动化的维度。两者在生产部署前都必须为 `PASS` / `WARN`（绝不可为 `FAIL`）。

---

## Tier 分级

| Tier | 要求 | 未达标 = ？ | 适用对象 |
|------|-------------|---------|-------------|
| **Tier-1** | 必须通过；若 `FAIL` 则阻挡发布 | 硬性阻挡（Hard block） | 所有项目 |
| **Tier-2** | 应通过；`WARN` 须记录理由；不阻挡 | 记录在案的 WARN | 所有项目 |
| **Tier-3** | 当功能集或领域需要时才适用；`N/A` 为有效状态 | 接受 N/A | 取决于项目类型 |

---

## 16 维度发布就绪矩阵

| # | 维度 | Tier | 闸门类型 | 阻挡条件 | 证据 | 标准 | 负责人 |
|---|-----------|------|-----------|-------------------|----------|---------|-------------|
| 1 | **性能 / 负载（Performance / Load）** | 2 | 自动化 | p95 latency 退化 > 10%；headroom < 20% | 负载测试报告 | `performance-standards.md` | Eng Lead + SRE |
| 2 | **安全性（Security）**（SAST/DAST/SCA/secrets） | 1 | 自动化 | 任何 Critical/High CVE、SAST High 未修、diff 中含 secret | SARIF、Trivy、SBOM | `pipeline-security-gates.md` | SecEng / Eng Lead |
| 3 | **无障碍（Accessibility, a11y）** | 2 | 自动化 + 人工 | axe-core critical > 0；键盘导航路径中断 | axe 报告、screen reader 记录 | `accessibility-standards.md` §Release-Blocking Threshold | QA + UX |
| 4 | **API / 合约测试（Contract Testing）** | 3 | 自动化 | 上游 consumer contract 为红；N-1 兼容性中断 | Pact broker 报告 | `contract-testing-standards.md` | API owner |
| 5 | **数据库迁移（Database Migration）** | 1 | 自动化 | up/rollback/idempotency 测试失败；数据保存测试失败 | `data-migration-testing.md` 闸门结果 | `data-migration-testing.md` | DB Lead |
| 6 | **跨流程回归（Cross-flow Regression）** | 2 | 自动化 | 关键 user journey 通过率 < 95%；business-critical flow 组合失败 | 跨流程回归报告 | `cross-flow-regression.md` | QA Lead |
| 7 | **运营就绪（Operational Readiness）** | 1 | 人工 | 缺少 Runbook；alerting 未设置；无 rollback 程序 | Runbook 链接、alert rule 审查 | `runbook-standards.md`、`alerting-standards.md` | SRE / Ops |
| 8 | **本地化 / i18n（Localization）** | 2 | 自动化 | 发布中有 MISSING 或 MAJOR i18n 落差（semver 落差） | `check-translation-sync.sh` 输出 | `translation-lifecycle-standards.md` | i18n Lead |
| 9 | **浏览器 / 设备兼容性（Browser / Device Compatibility）** | 3 | 自动化 | Tier-1 浏览器/设备通过率 < 100% | Playwright matrix 报告 | `browser-compatibility-standards.md` | Frontend QA |
| 10 | **容量 Sign-off（Capacity Sign-off）** | 3 | 人工 | 预估峰值时 headroom < 30%；无 Eng+SRE sign-off | 容量预测 + sign-off | `performance-standards.md` §Per-Release Capacity Sign-off | SRE + Eng Lead |
| 11 | **合规 / 隐私（Compliance / Privacy）** | 3 | 人工 | GDPR/CCPA 违规；缺少 audit log；保存政策中断 | 隐私审查 checklist | `privacy-standards.md` | DPO / Legal |
| 12 | **文档完整性（Documentation Completeness）** | 2 | 人工 | 此次发布缺少 CHANGELOG；面向客户的文档未更新 | CHANGELOG diff、文档审查 | `changelog-standards.md`、`documentation-lifecycle.md` | Tech Writer / PM |
| 13 | **回滚 / 灾难恢复（Rollback / Disaster Recovery）** | 1 | 人工 | 此次发布无经测试的 rollback 程序；RTO > 门槛 | DR 演练记录；rollback script | `rollback-standards.md`、`disaster-recovery-drill.md` | SRE |
| 14 | **生产 Smoke / Canary（Production Smoke / Canary）** | 1 | 自动化 | 部署后 smoke 失败；canary error rate > SLO | Smoke 测试结果；canary 仪表板 | `smoke-test.md`、`cd-deployment-strategies.md` | SRE / DevOps |
| 15 | **Feature Flag 治理（Feature Flag Governance）** | 2 | 人工 | 默认状态未审查；kill-switch 未测试 | Flag 审计 checklist | `feature-flag-standards.md` | PM + Eng Lead |
| 16 | **多闸门流程验证（Multi-Gate Flow Verification）** | 2 | 自动化 + 人工 | 任何 ≥ 3 步骤的流程缺少 Gate 0；Gate 3 CI 失败；缺少 Gate 4 UAT sign-off | `flow_gate_report.json`；UAT sign-off 表 | `flow-based-testing.md` §Multi-Gate | QA Lead + Business |

> **关于 Tier-3 的说明**：不适用时标记为 `N/A`（例如：CLI 工具的浏览器 matrix；无 API consumer 的独立服务的合约测试）。`N/A` 在 sign-off 中需附上理由注释。

---

## 发布就绪 Sign-off 模板

> 每次发布时复制此模板。在 repo 根目录存为 `.release-readiness/<version>.md`，或附加于发布产物上。

```markdown
# Release Readiness Sign-off

**Release**: [tag/version]
**Date**: [YYYY-MM-DD]
**Environment**: Pre-Production → Production
**RQM Artifact**: [link or commit SHA]

## Tier-1 Gates (ALL must be PASS)

| # | Dimension | Status | Evidence | Sign-off |
|---|-----------|--------|----------|---------|
| 2 | Security (SAST/DAST/SCA) | PASS / FAIL | [link] | [name] |
| 5 | Database Migration | PASS / FAIL | [link] | [name] |
| 7 | Operational Readiness | PASS / FAIL | [link] | [name] |
| 13 | Rollback / DR | PASS / FAIL | [link] | [name] |
| 14 | Production Smoke/Canary | PASS / FAIL | [link] | [name] |

## Tier-2 Gates (WARN must have rationale)

| # | Dimension | Status | Evidence | Rationale (if WARN) | Sign-off |
|---|-----------|--------|----------|---------------------|---------|
| 1 | Performance / Load | PASS / WARN / FAIL | [link] | | [name] |
| 3 | Accessibility | PASS / WARN / FAIL | [link] | | [name] |
| 6 | Cross-flow Regression | PASS / WARN / FAIL | [link] | | [name] |
| 8 | Localization / i18n | PASS / WARN / FAIL | [link] | | [name] |
| 12 | Documentation | PASS / WARN / FAIL | [link] | | [name] |
| 15 | Feature Flag Governance | PASS / WARN / FAIL | [link] | | [name] |
| 16 | Multi-Gate Flow Verification | PASS / WARN / FAIL | [link] | | [name] |

## Tier-3 Gates (N/A with rationale allowed)

| # | Dimension | Status | Evidence | Rationale (if N/A) | Sign-off |
|---|-----------|--------|----------|---------------------|---------|
| 4 | API / Contract Testing | PASS / WARN / N/A | [link] | | [name] |
| 9 | Browser / Device Compat | PASS / WARN / N/A | [link] | | [name] |
| 10 | Capacity Sign-off | PASS / WARN / N/A | [link] | | [name] |
| 11 | Compliance / Privacy | PASS / WARN / N/A | [link] | | [name] |

## Overall Decision

- [ ] **GO** — All Tier-1 PASS; all WARN documented; all N/A have rationale
- [ ] **NO-GO** — One or more Tier-1 FAIL, or undocumented WARN

**Decision made by**: [name, role]
**Date**: [YYYY-MM-DD]
```

---

## 状态语义（Status Semantics）

| 状态 | 意义 | 对发布的影响 |
|--------|---------|----------------|
| `PASS` | 符合或超越所有条件 | 无 |
| `WARN` | 低于目标但高于硬性最低标；已记录理由 | 允许；记录在案 |
| `FAIL` | 低于硬性最低标；尚未解决 | **阻挡发布** |
| `N/A` | 此维度不适用于本项目/本次发布；已记录理由 | 允许 |

---

## 何时建立 Sign-off

| 里程碑 | 动作 |
|-----------|--------|
| Release candidate 已 tag | 依模板建立 `.release-readiness/<version>.md`；填入证据链接 |
| Pre-UAT 部署 | 填入 Gate 3 CI 结果；验证 Tier-1 自动化闸门 |
| UAT sign-off（Gate 4） | 完成 Tier-3 人工闸门；定案 Multi-Gate Flow 列 |
| 生产部署决策 | 由 release owner 签署整体 GO/NO-GO 决策 |

Sign-off **不是**事后补做的——Gate 0（PRD 完整性）与 Gate 1（PR 层级测试）必须在 sign-off 文件建立之前很久就已满足。Sign-off 汇整的是整个发布周期中持续收集的证据。

---

## 反模式（Anti-Patterns）

- **在部署当天才建立 sign-off** — 证据应在整个发布周期中渐进收集
- **未附理由就标记 WARN** — 没有记录理由的 WARN，在功能上等同于无视该闸门
- **完全略过 Tier-3 而未附 N/A 理由** — 若 web app 省略浏览器测试，必须明确说明理由
- **把 Sign-off 当成橡皮图章** — 每一列都需要一位具名的 sign-off 负责人；匿名的集体所有权代表没有真正的责任归属
- **多个发布共用一份 sign-off** — 每个发布 tag 一份 sign-off；不可跨版本复用

---

## 另请参阅（See Also）

- `release-quality-manifest.md` — 机器可读的 RQM（本 sign-off 的自动化对应物）
- `flow-based-testing.md` — Multi-Gate Flow Model（维度 16）
- `branch-completion.md` — 分支层级闸门（前置条件；不等同于发布就绪）
- `verification-evidence.md` — 证据标准（所有证据链接都必须符合此标准）
- `deployment-standards.md` — 部署后闸门集成

---

## 版本历史（Version History）

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | 首次发布：16 维度矩阵、分级 sign-off 模板、RQM 集成 |

---

## 授权（License）

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源（Source）**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
