# UDS Cheatsheet

> Quick reference for all UDS features | Last updated: 2026-08-20

**Language**: English | [繁體中文](../../locales/zh-TW/docs/CHEATSHEET.md) | [简体中文](../../locales/zh-CN/docs/CHEATSHEET.md)

---

## 🛠️ CLI Commands

| Command | Description |
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

## 🎯 Skills

| Skill | Description |
|-------|-------------|
| `ac-coverage` | [UDS] Analyze AC-to-test traceability and generate requireme |
| `adr-assistant` | [UDS] Create, manage, and track Architecture Decision Record |
| `ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses |
| `ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, laye |
| `ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, AGENTS. |
| `api-design-assistant` | Guide API design following REST, GraphQL, and gRPC best prac |
| `atdd-assistant` | [UDS] Reference for Acceptance Test-Driven Development: INVE |
| `audit-assistant` | [UDS] Diagnose UDS installation health and submit structured |
| `bdd-assistant` | [UDS] Reference for Behavior-Driven Development: Gherkin Giv |
| `brainstorm-assistant` | [UDS] Structured multi-persona brainstorming with a scored q |
| `changelog-guide` | [UDS] Generate and maintain CHANGELOG.md entries in Keep a C |
| `checkin-assistant` | [UDS] Reference for pre-commit quality gates: gate definitio |
| `ci-cd-assistant` | Guide CI/CD pipeline design, configuration, and optimization |
| `code-review-assistant` | [UDS] Reference for systematic code review: eight review cat |
| `commit-standards` | [UDS] Generate commit messages that follow Conventional Comm |
| `contract-test-assistant` | [UDS] Guide contract testing strategy for APIs and microserv |
| `database-assistant` | Guide database design, migration, and query optimization. |
| `deploy-assistant` | Guide reliable deployments without CI/CD platforms (GitHub A |
| `dev-methodology` | [UDS] Select and track the active development methodology (S |
| `dev-workflow-guide` | [UDS] Map the current software development phase to the righ |
| `docs-generator` | [UDS] Generate usage documentation (cheatsheets, references, |
| `documentation-guide` | Guide documentation structure, content requirements, and pro |
| `durable-execution-assistant` | [UDS] Guide fault-tolerant workflow design with checkpoints, |
| `e2e-assistant` | [UDS] Generate E2E test skeletons from BDD .feature scenario |
| `error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_ |
| `git-workflow-guide` | Guide Git branching strategies, branch naming, and merge ope |
| `incident-response-assistant` | Guide incident response, root cause analysis, and post-morte |
| `journey-test-assistant` | [UDS] Generate coherent user-journey test plans (TESTPLAN) a |
| `knowledge-graph` | [UDS] Trace impact chains across specs, decisions, and code  |
| `logging-guide` | Implement structured logging with proper log levels and sens |
| `metrics-dashboard-assistant` | [UDS] Track development metrics, code quality indicators, an |
| `migration-assistant` | [UDS] Guide systematic code migration, framework upgrades, a |
| `observability-assistant` | Guide observability setup, metrics design, and alerting conf |
| `orchestrate` | Orchestrate multi-task execution plans using Claude's native |
| `plan` | Generate plan.json from Spec documents, OpenSpec changes, or |
| `pr-automation-assistant` | Guide pull request creation, review automation, and merge st |
| `project-discovery` | [UDS] Assess project health, architecture, and risks before  |
| `project-structure-guide` | Guide for organizing project directories following language- |
| `push` | AI-assisted safety layer for git push operations with qualit |
| `refactoring-assistant` | [UDS] Guide refactoring decisions and strategy selection, in |
| `release-standards` | [UDS] Guide the release process — semantic versioning, relea |
| `requirement-assistant` | [UDS] Write user stories and requirements that satisfy the I |
| `retrospective-assistant` | [UDS] Guide structured team retrospectives for Sprint and Re |
| `reverse-engineer` | [UDS] System archeology — reverse engineer an existing syste |
| `runbook-assistant` | Guide runbook creation, maintenance, and drill exercises. |
| `security-assistant` | Guide security review and vulnerability assessment following |
| `security-scan-assistant` | Guide automated security scanning, dependency auditing, and  |
| `skill-builder` | [UDS] Turn a repeated manual process into a properly scoped  |
| `slo-assistant` | Guide SLI selection, SLO setting, and Error Budget managemen |
| `spec-derivation` | [UDS] Derive BDD scenarios, TDD skeletons, integration and E |
| `spec-driven-dev` | [UDS] Create and review specification documents before writi |
| `sweep` | Scan codebase for debug artifacts and code quality issues; o |
| `tdd-assistant` | [UDS] Reference for Test-Driven Development: the Red-Green-R |
| `test-coverage-assistant` | [UDS] Analyze code-level test coverage across the eight-dime |
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

## 📜 Scripts

| Script | Description |
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
| `generate-docs.mjs` | Look up the release date for `version` from CHANGE |
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

📖 [Full Reference](../reference/FEATURE-REFERENCE.md) | 🔗 [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)
