# UDS 速查表

> Quick reference for all UDS features | Last updated: 2026-08-21

**Language**: [English](../../../docs/user/CHEATSHEET.md) | [繁體中文](../../zh-TW/docs/CHEATSHEET.md) | 简体中文

---

## 🛠️ CLI 指令

| Command | 说明 |
|---------|-------------|
| `uds list` | List available standards |
| `uds init` | Initialize standards in current project |
| `uds config` | Manage UDS configuration and project settings |
| `uds hitl` | Human-in-the-Loop controls |
| `uds configure` | Alias for "uds config" — Modify project settings |
| `uds check` | Check file integrity and adoption status (quick validation). For deep health diagnosis, use "uds audit" |
| `uds lint` | Check spec dependency validity and size against installed specs (specs/*.md) |
| `uds simulate` | Simulate a standard check with input (Predictive Validation) |
| `uds fix` | Auto-fix standard violations (Self-Healing) |
| `uds update` | Update standards to latest version |
| `uds skills` | List installed Claude Code skills |
| `uds audit` | Deep health diagnosis with pattern detection and feedback (strategic). For quick file check, use "uds check" |
| `uds deps` | Compare the versions you test against the versions your declared ranges resolve to |
| `uds uninstall` | Remove UDS standards, integrations, skills, and hooks |
| `uds compile` | Compile enforcement standards into hook configurations |
| `uds report` | Analyze hook telemetry and show adoption report |
| `uds release` | Manage release process (promote, deploy, manifest, verify) |
| `uds spec` | Manage lightweight micro-specs for vibe coding. For full spec lifecycle with review, use "/sdd" |
| `uds quickstart` | Interactive workflow guide — find the right commands quickly |
| `uds agent` | Manage UDS agents for AI tools |
| `uds ai-context` | Manage .ai-context.yaml configuration for AI-friendly architecture |
| `uds mcp` | MCP server commands for AI tool integration |
| `uds run` | Run a project command by intent (test/lint/build/security) via uds.project.yaml |

## 💬 斜线命令

| Command | 说明 |
|---------|-------------|
| `/ac-coverage` | "[UDS] Generate AC-to-test traceability matrix and coverage report" |
| `/api-design` | "[UDS] Guide API design following REST, GraphQL and gRPC best practices" |
| `/atdd` | [UDS] Guide through Acceptance Test-Driven Development workflow |
| `/audit` | "[UDS] UDS health check and feedback system, diagnose installation integrity and detect development patterns" |
| `/bdd` | [UDS] Guide through Behavior-Driven Development workflow |
| `/brainstorm` | "[UDS] Structured AI-assisted brainstorming before spec creation" |
| `/changelog` | "[UDS] Generate and maintain CHANGELOG.md entries" |
| `/check` | [UDS] Verify standards adoption status |
| `/checkin` | "[UDS] Pre-commit quality gates verification" |
| `/ci-cd` | "[UDS] Guide CI/CD pipeline design, configuration and optimization" |
| `/code-review` | [UDS] Perform systematic code review with checklist |
| `/commit` | [UDS] Generate commit messages following Conventional Commits standard |
| `/config` | [UDS] Configure project development standards |
| `/coverage` | [UDS] Analyze test coverage and provide recommendations |
| `/database` | "[UDS] Guide database design, migration planning and query optimization" |
| `/derive-all` | [UDS] Derive all test structures (BDD, TDD, ATDD) from SDD specification |
| `/derive-atdd` | [UDS] Derive ATDD acceptance tests from SDD specification |
| `/derive-bdd` | [UDS] Derive BDD Gherkin scenarios from SDD specification |
| `/derive-tdd` | [UDS] Derive TDD test skeletons from SDD specification |
| `/derive` | [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications. |
| `/dev-workflow` | "[UDS] Guide for mapping software development phases to UDS commands and features" |
| `/discover` | "[UDS] Assess project health, architecture, and risks before adding features" |
| `/docgen` | "[UDS] Generate usage documentation from project sources" |
| `/docs` | [UDS] Manage, guide, and generate documentation. |
| `/durable` | "[UDS] Guide workflow failure recovery with checkpoints, retries and rollback strategies" |
| `/e2e` | [UDS] Generate E2E test skeletons from BDD scenarios with framework detection |
| `/guide` | [UDS] Access Universal Development Standards guides and references. |
| `/incident` | "[UDS] Guide incident response, root cause analysis and post-mortem documentation" |
| `/init` | [UDS] Initialize development standards in current project |
| `/journey-test` | [UDS] Generate coherent user journey test plans (TESTPLAN) and E2E skeletons from a project description. |
| `/methodology` | [UDS] Manage development methodology workflow |
| `/metrics` | "[UDS] Track development metrics, code quality indicators and project health" |
| `/migrate` | "[UDS] Guide code migration, framework upgrades and technology modernization" |
| `/observability` | "[UDS] Guide observability setup, metrics design, alerting, and maturity assessment" |
| `/pr` | "[UDS] Guide Pull Request creation, review automation and merge strategies" |
| `/refactor` | [UDS] Guide refactoring decisions and strategy selection |
| `/release` | [UDS] Manage release process and changelogs. |
| `/requirement` | [UDS] Write user stories and requirements following INVEST criteria |
| `/reverse-bdd` | [UDS] Transform SDD acceptance criteria to BDD scenarios |
| `/reverse-sdd` | [UDS] Reverse engineer code into SDD specification document |
| `/reverse-tdd` | [UDS] Analyze BDD-TDD coverage gaps |
| `/reverse` | [UDS] Reverse engineer code to Specs, BDD, or TDD coverage. |
| `/runbook` | "[UDS] Guide runbook creation, maintenance, drills, and coverage reporting" |
| `/scan` | "[UDS] Guide automated security scanning, dependency auditing and secret detection" |
| `/sdd-retro` | [UDS] Create retroactive specs for untracked feat/fix commits |
| `/sdd` | [UDS] Create or review specification documents for Spec-Driven Development |
| `/security` | "[UDS] Guide security review and vulnerability assessment following OWASP standards" |
| `/skill-builder` | [UDS] Identify repeated processes and build Skills with the right development depth. |
| `/slo` | "[UDS] Guide SLI selection, SLO setting, and Error Budget management" |
| `/tdd` | [UDS] Guide through Test-Driven Development workflow |
| `/update` | [UDS] Update development standards to latest version |

## 🎯 技能

| Skill | 说明 |
|-------|-------------|
| `ac-coverage` | [UDS] 分析验收条件（AC）与测试之间的追踪关系，并生成需求层级的覆盖率报告。 |
| `adr-assistant` | [UDS] 创建、管理并追踪架构决策记录（ADR）。 |
| `ai-collaboration-standards` | 防止 AI 幻觉，确保分析代码或提出建议时给出以证据为基础的回应。 |
| `ai-friendly-architecture` | 设计 AI 友善架构，包含明确的模式、分层文档与语义边界。 |
| `ai-instruction-standards` | 创建并维护 AI 指令文件（CLAUDE.md、AGENTS.md、.cursor/rules/ 等），并采用适当结构。 |
| `api-design-assistant` | 引导 API 设计，遵循 REST、GraphQL 与 gRPC 最佳实践。 |
| `atdd-assistant` | [UDS] 验收测试驱动开发（ATDD）的参考资料：INVEST 准则、Gherkin 验收条件格式与 Three Am |
| `audit-assistant` | [UDS] 诊断 UDS 安装的健康状态，并向上游提交结构化反馈。 |
| `bdd-assistant` | [UDS] 行为驱动开发（BDD）的参考资料：Gherkin 的 Given-When-Then 格式与 Three A |
| `brainstorm-assistant` | [UDS] 在规格出现之前执行的结构化多角色头脑风暴，并附带评分质量关卡。 |
| `changelog-guide` | [UDS] 以 Keep a Changelog 格式生成并维护 CHANGELOG.md 条目。 |
| `checkin-assistant` | [UDS] 提交前质量关卡的参考资料：关卡定义、检查清单项目，以及绝不可提交的规则。 |
| `ci-cd-assistant` | 引导 CI/CD 流水线的设计、配置与优化。 |
| `code-review-assistant` | [UDS] 系统性代码审查的参考资料：八大审查类别，以及 BLOCKING/IMPORTANT/SUGGESTION 评 |
| `commit-standards` | [UDS] 生成符合 Conventional Commits 规范的 commit message，包含双语格式。 |
| `contract-test-assistant` | [UDS] 引导 API 与微服务的契约测试策略。 |
| `database-assistant` | 引导数据库设计、迁移与查询优化。 |
| `deploy-assistant` | 引导在没有 CI/CD 平台（GitHub Actions／GitLab CI）的情况下完成可靠部署。 |
| `dev-methodology` | [UDS] 为项目选择并追踪当前采用的开发方法论（SDD、BDD、TDD）。 |
| `dev-workflow-guide` | [UDS] 把目前的软件开发阶段对应到正确的 UDS 命令与 Skill。 |
| `docs-generator` | [UDS] 从项目源文件生成使用文档（速查表、参考手册、使用指南）。 |
| `documentation-guide` | 引导文档结构、内容需求与项目文档的最佳实践。 |
| `durable-execution-assistant` | [UDS] 引导容错工作流设计，包含检查点、重试策略与回滚计划。 |
| `e2e-assistant` | [UDS] 从 BDD 的 .feature 场景生成 E2E 测试骨架，并支持框架检测与覆盖缺口分析。 |
| `error-code-guide` | 设计一致的错误码，遵循 PREFIX_CATEGORY_NUMBER 格式。 |
| `git-workflow-guide` | 引导 Git 分支策略、分支命名与合并操作。 |
| `incident-response-assistant` | 引导事故响应、根因分析与事后复盘文档撰写。 |
| `journey-test-assistant` | [UDS] 从项目描述生成连贯的用户旅程测试计划（TESTPLAN）与旅程 E2E 骨架。 |
| `knowledge-graph` | [UDS] 通过知识图谱追踪规格、决策与代码之间的影响链；没有引擎时以 Markdown 后备方案运作。 |
| `logging-guide` | 实现结构化日志，包含适当的日志级别与敏感数据处理。 |
| `metrics-dashboard-assistant` | [UDS] 长期追踪开发指标、代码质量指标与技术债。 |
| `migration-assistant` | [UDS] 引导系统性的代码迁移、框架升级与技术现代化。 |
| `observability-assistant` | 引导可观测性建设、指标设计与告警配置。 |
| `orchestrate` | 以 Claude 原生 Agent tool 编排多任务执行计划（以 DAG 为基础，不需外部引擎）。 |
| `plan` | 从 Spec 文档、OpenSpec 变更或自由文本需求生成 plan.json。 |
| `pr-automation-assistant` | 引导 pull request 创建、审查自动化与合并策略。 |
| `project-discovery` | [UDS] 在既有代码库新增功能之前，评估项目健康度、架构与风险。 |
| `project-structure-guide` | 依各语言的最佳实践组织项目目录结构的指南。 |
| `push` | AI 辅助的 git push 安全层，提供质量关卡与协作护栏。 |
| `refactoring-assistant` | [UDS] 引导重构决策与策略选择，包含「重构还是重写」这个判断。 |
| `release-standards` | [UDS] 引导发布流程——语义化版本、发布模式，以及 start/finish/promote/deploy 的顺序。 |
| `requirement-assistant` | [UDS] 撰写符合 INVEST 准则的用户故事与需求。 |
| `retrospective-assistant` | [UDS] 引导 Sprint 与 Release 周期的结构化团队回顾。 |
| `reverse-engineer` | [UDS] 系统考古——从逻辑、数据、运行时三个维度对既有系统做逆向工程。 |
| `runbook-assistant` | 引导 Runbook 的撰写、维护与演练。 |
| `security-assistant` | 引导安全审查与漏洞评估，遵循 OWASP 标准。 |
| `security-scan-assistant` | 引导自动化安全扫描、依赖包审计与密钥检测。 |
| `skill-builder` | [UDS] 把重复的手动流程转成范围界定得宜的 Skill，过程中拿捏恰当的流程分量。 |
| `slo-assistant` | 引导 SLI 选取、SLO 设置与 Error Budget 管理。 |
| `spec-derivation` | [UDS] 从已批准的规格推导出 BDD 场景、TDD 骨架、集成与 E2E 测试，以及 ATDD 表格。 |
| `spec-driven-dev` | [UDS] 在写代码之前建立并审查规格文档——规格格式、状态与差异操作。 |
| `sweep` | 扫描代码库中的调试残留与代码质量问题；可选择自动修正安全的模式。 |
| `tdd-assistant` | [UDS] 测试驱动开发（TDD）的参考资料：红-绿-重构循环、FIRST 原则与 Arrange-Act-Assert |
| `test-coverage-assistant` | [UDS] 以八维度框架分析代码层级的测试覆盖率，并建议该优先补上哪些缺口。 |
| `testing-guide` | 测试金字塔，以及 UT/IT/ST/E2E 的测试编写标准。 |

## 🤖 代理

| Agent | 角色 |
|-------|------|
| `code-architect` | specialist |
| `doc-writer` | specialist |
| `reviewer` | reviewer |
| `spec-analyst` | specialist |
| `test-specialist` | specialist |

## 🔄 工作流程

| Workflow | 说明 |
|----------|-------------|
| `code-review` | Comprehensive code review workflow for PRs and code changes. |
| `feature-dev` | Standard feature development workflow from requirements to deployment. |
| `integrated-flow` | Complete development workflow integrating ATDD, SDD, BDD, and TDD methodologies. |
| `large-codebase-analysis` | RLM-enhanced workflow for analyzing large codebases with 50+ files. |
| `release` | Complete release workflow for software projects. |

## 📚 核心规范

| Standard | 说明 |
|----------|-------------|
| `acceptance-criteria-traceability` | Acceptance Criteria Traceability Standards |
| `acceptance-test-driven-development` | Acceptance Test-Driven Development (ATDD) Standards |
| `accessibility-standards` | This standard defines comprehensive guidelines for |
| `adr-standards` | Architecture Decision Records capture the context, |
| `adversarial-test` | 對抗性測試標準 |
| `agent-behavior-discipline` | This standard defines four behavioral disciplines  |
| `agent-communication-protocol` | Define a unified communication protocol for AI age |
| `agent-dispatch` | Define standards for dispatching AI sub-agents in  |
| `ai-agreement-standards` | This standard formalizes the interaction between H |
| `ai-command-behavior` | This standard defines a structure for specifying A |
| `ai-friendly-architecture` | This standard defines architecture and documentati |
| `ai-instruction-standards` | This standard defines best practices for creating  |
| `ai-response-navigation` | This standard defines navigation behavior for AI r |
| `alerting-standards` | Alerting Standards |
| `anti-hallucination` | This standard defines strict guidelines for AI ass |
| `anti-sycophancy-prompting` | This standard defines techniques and rules for des |
| `api-design-standards` | This standard defines comprehensive guidelines for |
| `audit-trail` | Audit Trail Standards |
| `behavior-driven-development` | Behavior-Driven Development (BDD) Standards |
| `behavior-snapshot` | Behavior Snapshot Standard |
| `branch-completion` | Define a standardized workflow for completing deve |
| `browser-compatibility-standards` | This standard defines supported browser and device |
| `capability-declaration` | Capability Declaration Standard |
| `cd-deployment-strategies` | CD Deployment Strategies（CD 部署策略） |
| `change-batching-standards` | Change Batching Standards |
| `changelog-standards` | This standard defines how to write and maintain a  |
| `chaos-engineering-standards` | Chaos Engineering Standards |
| `chaos-injection-tests` | Chaos Injection Tests |
| `checkin-standards` | This standard defines quality gates that MUST be p |
| `circuit-breaker` | Circuit Breaker Standard |
| `class-level-fix` | A defect is almost never alone. It is one member o |
| `code-review-checklist` | This standard provides a comprehensive checklist f |
| `commit-message-guide` | Standardized commit messages improve code review e |
| `container-image-standards` | Container Image Build and Security Standards |
| `container-security` | 容器安全標準 |
| `containerization-standards` | Containerization Standards |
| `context-aware-loading` | This standard defines a protocol for AI tools to s |
| `contract-testing-standards` | Contract testing verifies that a provider (API ser |
| `cost-budget-test` | Cost Budget Test Standards |
| `cross-flow-regression` | This standard defines cross-flow regression testin |
| `data-contract` | Data Contract Standards |
| `data-migration-testing` | Data Migration Testing |
| `data-pipeline` | Data Pipeline Standards |
| `database-standards` | This standard defines guidelines for database desi |
| `deployment-standards` | This standard defines guidelines for safely deploy |
| `deprecation-standards` | Deprecation & Sunset Standards |
| `design-document-standards` | Design Document Standards |
| `developer-memory` | This standard defines a structured system for capt |
| `disaster-recovery-drill` | Disaster Recovery Drill Standards |
| `documentation-lifecycle` | This standard defines **when** to update documenta |
| `documentation-structure` | This standard defines a consistent documentation s |
| `documentation-writing-standards` | This standard defines documentation requirements b |
| `dual-phase-output` | Dual-Phase LLM Output Standard |
| `environment-standards` | Environment Management Standards |
| `error-code-standards` | Error Code Standards |
| `estimation-standards` | Estimation Standards |
| `execution-history` | Execution History Repository Standards |
| `failure-source-taxonomy` | Failure Source Taxonomy Standard |
| `feature-discovery-standards` | Feature Discovery Standards |
| `feature-flag-standards` | Feature Flag Management Standards |
| `feature-manifest-standard` | Feature Manifest Standard |
| `flaky-test-management` | Flaky Test Management Standards |
| `flow-based-testing` | This document defines a systematic methodology for |
| `forward-derivation-standards` | This standard defines the principles and workflows |
| `frontend-design-standards` | This standard defines a machine-readable frontend  |
| `full-coverage-testing` | Full Coverage Testing Standards |
| `git-workflow` | This standard defines Git branching strategies and |
| `git-worktree` | Define a lifecycle for using Git worktrees to isol |
| `governance-layer` | A governance layer provides a shared anchor for al |
| `health-check-standards` | Health Check Standards |
| `iac-design-principles` | Infrastructure as Code Design Principles |
| `immutability-first` | Immutability-First Architecture Standard |
| `incident-response` | Incident Response Standards |
| `knowledge-graph-memory` | This standard defines a **relationship schema** so |
| `knowledge-transfer-standards` | Knowledge Transfer Standards |
| `license-compliance` | License Compliance Standards |
| `llm-output-validation` | LLM 輸出驗證標準 |
| `logging-standards` | Logging Standards |
| `mock-boundary` | This document defines rules for what can and canno |
| `model-provenance` | Model Provenance Policy Standards |
| `model-selection` | Define how to choose **which model** and **how dee |
| `multi-environment-e2e-testing` | Multi-Environment E2E Testing Standards |
| `mutation-testing` | Mutation testing evaluates test suite effectivenes |
| `no-cicd-deployment` | No-CI/CD Deployment Strategy |
| `observability-standards` | Observability Standards |
| `packaging-standards` | This standard defines a Recipe-based packaging fra |
| `performance-standards` | This standard defines comprehensive guidelines for |
| `pii-classification` | PII Classification and Handling Standards |
| `pipeline-integration-standards` | Pipeline Integration Standards |
| `pipeline-security-gates` | Pipeline Security Gates（CI Pipeline 安全檢查點） |
| `policy-as-code-testing` | Policy as Code 測試標準 |
| `postmortem-standards` | Postmortem Standards (Blameless Post-Incident Review) |
| `prd-standards` | Product Requirements Document Standards |
| `privacy-standards` | Privacy Standards |
| `product-metrics-standards` | Product Metrics Framework Standards |
| `project-context-memory` | This standard defines a structured system for capt |
| `project-structure` | This standard defines conventions for project dire |
| `prompt-regression` | Prompt Regression Standards |
| `property-based-testing` | Property-Based Testing Standards |
| `push-standards` | Git Push Safety Gates |
| `recovery-recipe-registry` | Recovery Recipe Registry Standard |
| `refactoring-standards` | This standard defines comprehensive guidelines for |
| `release-quality-manifest` | Release Quality Manifest |
| `release-readiness-gate` | This standard defines a **single, aggregated Relea |
| `replay-test` | Replay Test Standards |
| `requirement-engineering` | Requirement Engineering Standards |
| `resource-cost-boundary` | Resource / Cost Boundary Declaration Standards |
| `retrospective-standards` | Retrospectives are structured team reflections tha |
| `retry-standards` | Retry Standards |
| `reverse-engineering-standards` | This standard defines the principles, workflows, a |
| `rollback-standards` | Rollback Standards（回滾標準） |
| `runbook-standards` | Runbook Standards |
| `runbook` | Runbook Writing Standards |
| `sast-advanced` | This standard defines Advanced Static Application  |
| `schema-evolution` | Schema Evolution Standards |
| `secret-management-standards` | Secret Management and Credential Hygiene Standards |
| `secure-op` | Secure-Op：AI Agent 安全操作標準 |
| `security-decision` | Security Decision Standard |
| `security-standards` | This standard defines comprehensive security guide |
| `security-testing` | This document defines the security testing methodo |
| `self-review-protocol` | This standard mandates a **self-review pass** on l |
| `server-ops-security` | 伺服器操作安全標準 |
| `skill-standard-alignment-check` | Skill-Standard Alignment Check |
| `slo-sli` | SLO/SLI Definition Standards |
| `slo-standards` | SLO Standards (Service Level Objectives) |
| `smoke-test` | Smoke Test Standards |
| `spec-driven-development` | Spec-Driven Development (SDD) Standards |
| `standard-admission-criteria` | Standard Admission Criteria |
| `standard-lifecycle-management` | Standard Lifecycle Management |
| `structured-task-definition` | Structured Task Definition Standards |
| `supply-chain-attestation` | Supply Chain Attestation Standards |
| `supply-chain-security-standards` | Supply Chain Security Standards |
| `systematic-debugging` | Define a structured, four-phase debugging workflow |
| `tech-debt-standards` | Tech Debt Management Standards |
| `test-completeness-dimensions` | This document defines a systematic framework for e |
| `test-data-standards` | Test Data Standards |
| `test-driven-development` | Test-Driven Development (TDD) Standards |
| `test-governance` | Test Governance Standards |
| `testing-standards` | This standard defines actionable testing rules and |
| `timeout-standards` | Timeout Standards |
| `token-budget` | Token Budget Zone Standard |
| `translation-lifecycle-standards` | Translation lifecycle standards: MISSING vs OUTDAT |
| `user-journey-testing` | User Journey Testing Standard |
| `user-story-mapping` | User Story Mapping Standards |
| `verification-evidence` | Establish an "Iron Law" that no task can be claime |
| `verification-oracle` | Verification Oracle Standards |
| `versioning` | This standard defines how to version software rele |
| `virtual-organization-standards` | This standard treats the AI ecosystem as a "Virtua |
| `workflow-enforcement` | Workflow Enforcement Standards |
| `workflow-state-protocol` | Workflow State Protocol |

## 📜 脚本

| Script | 说明 |
|--------|-------------|
| `add-industry-standards-metadata.mjs` | Add industry standards metadata to core/ |
| `aggregate-effectiveness.mjs` | Aggregate Standards Effectiveness Reports |
| `analyze-hook-stats.mjs` | Hook Statistics Analyzer (SPEC-SELFDIAG-001 REQ-7, |
| `bump-version.mjs` | Build a platform-aware shell command for a .sh scr |
| `bump-version.sh` | Thin wrapper — scripts/bump-version.mjs is the onl |
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-ai-yaml-parses.mjs` | Every shipped .ai.yaml must parse, and must parse  |
| `check-bump-sync-roundtrip.mjs` | check-bump-sync-roundtrip — 測「跑完 bump 之後 check 必須通 |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-commands-sync.ps1` | Check Commands Sync |
| `check-commands-sync.sh` | Commands Sync Checker |
| `check-commit-spec-reference.sh` | Thin wrapper — scripts/check-commit-spec-reference |
| `check-docs-integrity.ps1` | Check Docs Integrity |
| `check-docs-integrity.sh` | Documentation Integrity Checker |
| `check-docs-sync.ps1` | Check Docs Sync |
| `check-docs-sync.sh` | Documentation Sync Checker |
| `check-external-references.mjs` | External Reference Checker (SPEC-SELFDIAG-001 REQ- |
| `check-orphan-specs.ps1` | Check Orphan Specs |
| `check-orphan-specs.sh` | Orphan Spec Detection Script |
| `check-scope-sync.ps1` | Check Scope Sync |
| `check-scope-sync.sh` | Scope Consistency Check Script |
| `check-skill-next-steps-sync.ps1` | Check Skill Next Steps Sync |
| `check-skill-next-steps-sync.sh` | Skill Next Steps Guidance Sync Checker |
| `check-spec-sync.ps1` | Core↔Skill Sync Check Script |
| `check-spec-sync.sh` | Core↔Skill Sync Check Script |
| `check-standards-reference-sync.ps1` | Check Standards Reference Sync |
| `check-standards-reference-sync.sh` | check-standards-reference-sync.sh |
| `check-standards-sync.ps1` | Check Standards Sync |
| `check-standards-sync.sh` | Standards Consistency Checker |
| `check-translation-sync.ps1` | Check Translation Sync |
| `check-translation-sync.sh` | Translation Sync Checker |
| `check-usage-docs-sync.ps1` | Check if usage documentation needs to be regenerat |
| `check-usage-docs-sync.sh` | check-usage-docs-sync.sh |
| `check-version-sync.ps1` | Check Version Sync |
| `check-version-sync.sh` | Version Sync Checker |
| `check-workflow-compliance.sh` | Thin wrapper — scripts/check-workflow-compliance.t |
| `commitlint-bilingual-rule.mjs` | commitlint-bilingual-rule.mjs — custom commitlint  |
| `convert-md-to-yaml.mjs` | Markdown to AI-YAML Conversion Script |
| `fix-manifest-paths.ps1` | Fix Manifest Paths |
| `fix-manifest-paths.sh` | Manifest Path Fixer |
| `generate-adoption-skills.mjs` | Self-Adoption Skill Copy Generator and Drift Gate  |
| `generate-docs.mjs` | Look up the release date for `version` from CHANGE |
| `generate-llms-txt.mjs` | llms.txt Generator and Drift Gate — XSPEC-385 |
| `generate-locale-coverage.mjs` | Locale Coverage Generator |
| `generate-version-manifest.mjs` | Generate Version Manifest (SPEC-SELFDIAG-001 REQ-9 |
| `install-hooks.mjs` | Install Hooks |
| `install-hooks.sh` | Thin wrapper — scripts/install-hooks.mjs is the on |
| `pre-commit.mjs` | Build a platform-aware shell command for a .sh scr |
| `pre-release-check.ps1` | Pre Release Check |
| `pre-release-check.sh` | Pre-release Check Script |
| `pre-release.ps1` | Pre-Release Preparation Script for Universal Devel |
| `pre-release.sh` | Pre-Release Preparation Script |
| `setup-husky.mjs` | Cross-platform Husky Setup Script |
| `sync-manifest.mjs` | Extract top-level Commander command names register |
| `watch-model-versions.sh` | Model / tool version watch — XSPEC-357 AC-6.2 |

---

📖 [Full Reference](FEATURE-REFERENCE.md) | 🔗 [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)
