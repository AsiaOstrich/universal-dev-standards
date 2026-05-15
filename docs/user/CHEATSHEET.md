# UDS Cheatsheet

> Quick reference for all UDS features | Last updated: 2026-05-14

**Language**: English | [繁體中文](../locales/zh-TW/docs/CHEATSHEET.md) | [简体中文](../locales/zh-CN/docs/CHEATSHEET.md)

---

## 🛠️ CLI Commands

| Command | Description |
|---------|-------------|
| `uds list` | List available standards |
| `uds init` | Initialize standards in current project |
| `uds configure` | Modify options for initialized project |
| `uds check` | Check adoption status of current project |
| `uds update` | Update standards to latest version |
| `uds skills` | List installed Claude Code skills |
| `uds agent` | Manage UDS agents (list, install, info) |
| `uds workflow` | Manage UDS workflows (list, install, info, execute, status) |
| `uds ai-context` | Manage AI context configuration (init, validate, graph) |

## 💬 Slash Commands

| Command | Description |
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
| `/review` | [UDS] Perform systematic code review with checklist |
| `/runbook` | "[UDS] Guide runbook creation, maintenance, drills, and coverage reporting" |
| `/scan` | "[UDS] Guide automated security scanning, dependency auditing and secret detection" |
| `/sdd-retro` | [UDS] Create retroactive specs for untracked feat/fix commits |
| `/sdd` | [UDS] Create or review specification documents for Spec-Driven Development |
| `/security` | "[UDS] Guide security review and vulnerability assessment following OWASP standards" |
| `/slo` | "[UDS] Guide SLI selection, SLO setting, and Error Budget management" |
| `/tdd` | [UDS] Guide through Test-Driven Development workflow |
| `/update` | [UDS] Update development standards to latest version |

## 🎯 Skills

| Skill | Description |
|-------|-------------|
| `ac-coverage` | "[UDS] Analyze AC-to-test traceability and coverage" |
| `adr-assistant` | [UDS] Create, manage, and track Architecture Decision Record |
| `ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses |
| `ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, laye |
| `ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, AGENTS. |
| `api-design-assistant` | Guide API design following REST, GraphQL, and gRPC best prac |
| `atdd-assistant` | "[UDS] Guide through Acceptance Test-Driven Development work |
| `audit-assistant` | "[UDS] UDS Health & Feedback System \| UDS 健康檢查與回饋系統" |
| `bdd-assistant` | "[UDS] Guide through Behavior-Driven Development workflow" |
| `brainstorm-assistant` | "[UDS] Structured AI-assisted brainstorming before spec crea |
| `changelog-guide` | "[UDS] Generate and maintain CHANGELOG.md entries" |
| `checkin-assistant` | "[UDS] Pre-commit quality gates verification" |
| `ci-cd-assistant` | Guide CI/CD pipeline design, configuration, and optimization |
| `code-review-assistant` | "[UDS] Perform systematic code review with checklist" |
| `commit-standards` | "[UDS] Generate commit messages following Conventional Commi |
| `contract-test-assistant` | [UDS] Guide contract testing strategy for APIs and microserv |
| `database-assistant` | Guide database design, migration, and query optimization. |
| `deploy-assistant` | Guide reliable deployments without CI/CD platforms (GitHub A |
| `dev-methodology` | "[UDS] Manage development methodology workflow" |
| `dev-workflow-guide` | "[UDS] Guide for mapping software development phases to UDS  |
| `docs-generator` | "[UDS] Generate usage documentation from project sources" |
| `documentation-guide` | Guide documentation structure, content requirements, and pro |
| `durable-execution-assistant` | "[UDS] Guide workflow failure recovery with checkpoints, ret |
| `e2e-assistant` | "[UDS] Generate E2E test skeletons from BDD scenarios" |
| `error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_ |
| `git-workflow-guide` | Guide Git branching strategies, branch naming, and merge ope |
| `incident-response-assistant` | Guide incident response, root cause analysis, and post-morte |
| `journey-test-assistant` | "[UDS] 從專案描述生成連貫使用者旅程測試計畫（TESTPLAN）與 E2E 骨架" |
| `logging-guide` | Implement structured logging with proper log levels and sens |
| `metrics-dashboard-assistant` | "[UDS] Track development metrics, code quality indicators, a |
| `migration-assistant` | "[UDS] Guide code migration, framework upgrades, and technol |
| `observability-assistant` | Guide observability setup, metrics design, and alerting conf |
| `orchestrate` | Orchestrate multi-task execution plans using Claude's native |
| `plan` | Generate plan.json from Spec documents, OpenSpec changes, or |
| `pr-automation-assistant` | Guide pull request creation, review automation, and merge st |
| `project-discovery` | "[UDS] Assess project health, architecture, and risks before |
| `project-structure-guide` | Guide for organizing project directories following language- |
| `push` | AI-assisted safety layer for git push operations with qualit |
| `refactoring-assistant` | "[UDS] Guide refactoring decisions and strategy selection" |
| `release-standards` | "[UDS] Guide release process and changelogs" |
| `requirement-assistant` | "[UDS] Write user stories and requirements following INVEST  |
| `retrospective-assistant` | [UDS] Guide structured team retrospectives for Sprint and Re |
| `reverse-engineer` | "[UDS] System archeology — reverse engineer code across Logi |
| `runbook-assistant` | Guide runbook creation, maintenance, and drill exercises. |
| `security-assistant` | Guide security review and vulnerability assessment following |
| `security-scan-assistant` | Guide automated security scanning, dependency auditing, and  |
| `skill-builder` | "[UDS] Identify repeated processes and build Skills with the |
| `slo-assistant` | Guide SLI selection, SLO setting, and Error Budget managemen |
| `spec-derivation` | "[UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables f |
| `spec-driven-dev` | "[UDS] Create or review specification documents for Spec-Dri |
| `sweep` | Scan codebase for debug artifacts and code quality issues; o |
| `tdd-assistant` | "[UDS] Guide through Test-Driven Development workflow" |
| `test-coverage-assistant` | "[UDS] Analyze test coverage and provide recommendations" |
| `testing-guide` | Testing pyramid and test writing standards for UT/IT/ST/E2E. |

## 🤖 Agents

| Agent | Role |
|-------|------|
| `code-architect` | specialist |
| `doc-writer` | specialist |
| `reviewer` | reviewer |
| `spec-analyst` | specialist |
| `test-specialist` | specialist |

## 🔄 Workflows

| Workflow | Description |
|----------|-------------|
| `code-review` | Comprehensive code review workflow for PRs and code changes. |
| `feature-dev` | Standard feature development workflow from requirements to deployment. |
| `integrated-flow` | Complete development workflow integrating ATDD, SDD, BDD, and TDD methodologies. |
| `large-codebase-analysis` | RLM-enhanced workflow for analyzing large codebases with 50+ files. |
| `release` | Complete release workflow for software projects. |

## 📚 Core Standards

| Standard | Description |
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
| `code-review-checklist` | This standard provides a comprehensive checklist f |
| `commit-message-guide` | Standardized commit messages improve code review e |
| `container-security` | 容器安全標準 |
| `containerization-standards` | Containerization Standards |
| `context-aware-loading` | This standard defines a protocol for AI tools to s |
| `contract-testing-standards` | Contract testing verifies that a provider (API ser |
| `cost-budget-test` | Cost Budget Test Standards |
| `cross-flow-regression` | This standard defines cross-flow regression testin |
| `data-migration-testing` | Data Migration Testing |
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
| `immutability-first` | Immutability-First Architecture Standard |
| `knowledge-transfer-standards` | Knowledge Transfer Standards |
| `llm-output-validation` | LLM 輸出驗證標準 |
| `logging-standards` | Logging Standards |
| `mock-boundary` | This document defines rules for what can and canno |
| `model-selection` | Define a cost-effective strategy for selecting AI  |
| `mutation-testing` | Mutation testing evaluates test suite effectivenes |
| `no-cicd-deployment` | No-CI/CD Deployment Strategy |
| `observability-standards` | Observability Standards |
| `packaging-standards` | This standard defines a Recipe-based packaging fra |
| `performance-standards` | This standard defines comprehensive guidelines for |
| `pipeline-integration-standards` | Pipeline Integration Standards |
| `pipeline-security-gates` | Pipeline Security Gates（CI Pipeline 安全檢查點） |
| `policy-as-code-testing` | Policy as Code 測試標準 |
| `postmortem-standards` | Postmortem Standards (Blameless Post-Incident Review) |
| `privacy-standards` | Privacy Standards |
| `project-context-memory` | This standard defines a structured system for capt |
| `project-structure` | This standard defines conventions for project dire |
| `prompt-regression` | Prompt Regression Standards |
| `property-based-testing` | Property-Based Testing Standards |
| `recovery-recipe-registry` | Recovery Recipe Registry Standard |
| `refactoring-standards` | This standard defines comprehensive guidelines for |
| `release-quality-manifest` | Release Quality Manifest |
| `release-readiness-gate` | This standard defines a **single, aggregated Relea |
| `replay-test` | Replay Test Standards |
| `requirement-engineering` | Requirement Engineering Standards |
| `retrospective-standards` | Retrospectives are structured team reflections tha |
| `retry-standards` | Retry Standards |
| `reverse-engineering-standards` | This standard defines the principles, workflows, a |
| `rollback-standards` | Rollback Standards（回滾標準） |
| `runbook-standards` | Runbook Standards |
| `sast-advanced` | This standard defines Advanced Static Application  |
| `secure-op` | Secure-Op：AI Agent 安全操作標準 |
| `security-decision` | Security Decision Standard |
| `security-standards` | This standard defines comprehensive security guide |
| `security-testing` | This document defines the security testing methodo |
| `server-ops-security` | 伺服器操作安全標準 |
| `skill-standard-alignment-check` | Skill-Standard Alignment Check |
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
| `verification-evidence` | Establish an "Iron Law" that no task can be claime |
| `versioning` | This standard defines how to version software rele |
| `virtual-organization-standards` | This standard treats the AI ecosystem as a "Virtua |
| `workflow-enforcement` | Workflow Enforcement Standards |
| `workflow-state-protocol` | Workflow State Protocol |

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `add-industry-standards-metadata.mjs` | Add industry standards metadata to core/ |
| `aggregate-effectiveness.mjs` | Aggregate Standards Effectiveness Reports |
| `analyze-hook-stats.mjs` | Hook Statistics Analyzer (SPEC-SELFDIAG-001 REQ-7, |
| `bump-version.mjs` | Build a platform-aware shell command for a .sh scr |
| `bump-version.sh` | DEPRECATED: Use 'node scripts/bump-version.mjs <ve |
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-ai-behavior-sync.sh` | DEPRECATED: Use 'npx tsx scripts/check-ai-behavior |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-commands-sync.ps1` | Check Commands Sync |
| `check-commands-sync.sh` | Commands Sync Checker |
| `check-commit-spec-reference.sh` | DEPRECATED: Use 'npx tsx scripts/check-commit-spec |
| `check-docs-integrity.ps1` | Check Docs Integrity |
| `check-docs-integrity.sh` | Documentation Integrity Checker |
| `check-docs-sync.ps1` | Check Docs Sync |
| `check-docs-sync.sh` | Documentation Sync Checker |
| `check-external-references.mjs` | External Reference Checker (SPEC-SELFDIAG-001 REQ- |
| `check-flow-gate-report.sh` | DEPRECATED: Use 'npx tsx scripts/check-flow-gate-r |
| `check-integration-commands-sync.sh` | DEPRECATED: Use 'npx tsx scripts/check-integration |
| `check-orphan-specs.ps1` | Check Orphan Specs |
| `check-orphan-specs.sh` | Orphan Spec Detection Script |
| `check-registry-completeness.sh` | DEPRECATED: Use 'npx tsx scripts/check-registry-co |
| `check-release-readiness-signoff.sh` | DEPRECATED: Use 'npx tsx scripts/check-release-rea |
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
| `check-workflow-compliance.sh` | DEPRECATED: Use 'npx tsx scripts/check-workflow-co |
| `convert-md-to-yaml.mjs` | Markdown to AI-YAML Conversion Script |
| `fix-manifest-paths.ps1` | Fix Manifest Paths |
| `fix-manifest-paths.sh` | Manifest Path Fixer |
| `generate-docs.mjs` | Generate Docs |
| `generate-version-manifest.mjs` | Generate Version Manifest (SPEC-SELFDIAG-001 REQ-9 |
| `install-hooks.mjs` | Install Hooks |
| `install-hooks.sh` | DEPRECATED: Use 'node scripts/install-hooks.mjs' i |
| `pre-commit.mjs` | Build a platform-aware shell command for a .sh scr |
| `pre-release-check.ps1` | Pre Release Check |
| `pre-release-check.sh` | Pre-release Check Script |
| `pre-release.ps1` | Pre-Release Preparation Script for Universal Devel |
| `pre-release.sh` | Pre-Release Preparation Script |
| `setup-husky.mjs` | Cross-platform Husky Setup Script |
| `sync-manifest.mjs` | Sync Manifest |

---

📖 [Full Reference](FEATURE-REFERENCE.md) | 🔗 [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)
