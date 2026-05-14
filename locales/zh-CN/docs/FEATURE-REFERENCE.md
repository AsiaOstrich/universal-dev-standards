# UDS 功能参考手册

> Universal Development Standards - 完整功能文档
> Auto-generated | Last updated: 2026-05-14

**Language**: [English](../../../docs/FEATURE-REFERENCE.md) | [繁體中文](../../zh-TW/docs/FEATURE-REFERENCE.md) | 简体中文

---

## 目录

1. [CLI 指令](#cli-commands) (9)
2. [斜线命令](#slash-commands) (49)
3. [技能](#skills) (54)
4. [代理](#agents) (5)
5. [工作流程](#workflows) (5)
6. [核心规范](#core-standards) (125)
7. [脚本](#scripts) (55)

**Total Features: 302**

---

## CLI 指令

### `uds list`

**说明**: List available standards

**选项**:
| Option | 说明 |
|--------|-------------|
| `-c, --category` | Filter by category (skill, reference, extension, integration, template) |

### `uds init`

**说明**: Initialize standards in current project

**选项**:
| Option | 说明 |
|--------|-------------|
| `-m, --mode` | Installation mode (skills, full) |
| `-f, --format` | Standards format (ai, human, both) |
| `--workflow` | Git workflow (github-flow, gitflow, trunk-based) |
| `--merge-strategy` | Merge strategy (squash, merge-commit, rebase-ff) |
| `--output-lang` | Output language (english, traditional-chinese, bilingual) |
| `--test-levels` | Test levels, comma-separated (unit-testing,integration-testing,...) |
| `--lang` | Language extension (csharp, php) |
| `--framework` | Framework extension (fat-free) |
| `--locale` | Locale extension (zh-tw) |
| `--skills-location` | Skills location (marketplace, user, project, none) [default: marketplace] |
| `--content-mode` | Content mode for integration files (minimal, index, full) [default: index] |
| `--agents-md` | Generate AGENTS.md universal summary |
| `--no-agents-md` | Skip AGENTS.md generation |
| `--with-hooks` | Install enforcement hooks (commit-msg, security, logging) |
| `--content-layout` | Content layout (flat, layered) [default: flat] |
| `-y, --yes` | Use defaults, skip interactive prompts |
| `-E, --experimental` | Enable experimental features (methodology) |
| `--force` | Bypass UDS source-repo self-adoption guard (DEC-044 / XSPEC-071) |

### `uds configure`

**说明**: Modify options for initialized project

**选项**:
| Option | 说明 |
|--------|-------------|
| `-t, --type` | Option type to configure (format, workflow, merge_strategy, output_language, test_levels, skills, commands, all) |
| `--ai-tool` | Specific AI tool to configure (claude-code, opencode, copilot, etc.) |
| `--skills-location` | Skills installation location (project, user) |
| `-y, --yes` | Apply changes immediately without prompting |
| `-E, --experimental` | Enable experimental features (methodology) |

### `uds check`

**说明**: Check adoption status of current project

**选项**:
| Option | 说明 |
|--------|-------------|
| `-s, --standard` | Validate against a specific standard physical spec |
| `--json` | Output result in JSON format |
| `--summary` | Show compact status summary (for use by other commands) |
| `--diff` | Show diff for modified files |
| `--restore` | Restore all modified and missing files |
| `--restore-missing` | Restore only missing files |
| `--no-interactive` | Disable interactive mode |
| `--ci` | CI mode: disable interactive prompts and set exit code on issues |
| `--migrate` | Migrate legacy manifest to hash-based tracking |
| `--offline` | Skip npm registry check for CLI updates |
| `--force` | Bypass UDS source-repo self-adoption guard (DEC-044 / XSPEC-071) |

### `uds update`

**说明**: Update standards to latest version

**选项**:
| Option | 说明 |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `--sync-refs` | Sync integration file references with manifest standards |
| `--integrations-only` | Only regenerate integration files (CLAUDE.md, etc.) |
| `--standards-only` | Only update standards, skip integration files |
| `--offline` | Skip npm registry check for CLI updates |
| `--beta` | Check for beta version updates |
| `--skills` | Install/update Skills for configured AI tools |
| `--commands` | Install/update slash commands for configured AI tools |
| `--debug` | Show debug output for Skills/Commands detection |
| `--plan` | Show reconciliation plan without executing (like terraform plan) |
| `--force` | Force update all files, ignoring hash comparison |
| `--rollback` | Rollback to the most recent backup |

### `uds skills`

**说明**: List installed Claude Code skills

### `uds agent`

**说明**: Manage UDS agents (list, install, info)

**选项**:
| Option | 说明 |
|--------|-------------|
| `--installed` | Show installation status for all AI tools |
| `-t, --tool` | Target AI tool (default: claude-code) |
| `-g, --global` | Install to user level instead of project level |
| `-y, --yes` | Skip confirmation prompts |

### `uds workflow`

**说明**: Manage UDS workflows (list, install, info, execute, status)

**选项**:
| Option | 说明 |
|--------|-------------|
| `--installed` | Show installation status for all AI tools |
| `-t, --tool` | Target AI tool (default: claude-code) |
| `-g, --global` | Install to user level instead of project level |
| `-y, --yes` | Skip confirmation prompts |
| `-t, --tool` | Target AI tool (default: claude-code) |
| `--resume` | Resume from saved state |
| `--restart` | Restart from beginning (discard saved state) |
| `-v, --verbose` | Show detailed output |
| `--dry-run` | Show steps without executing |
| `-y, --yes` | Skip confirmation prompts |

### `uds ai-context`

**说明**: Manage AI context configuration (init, validate, graph)

---

## 斜线命令

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

---

## 技能

| Skill | 说明 |
|-------|-------------|
| `ac-coverage` | "[UDS] Analyze AC-to-test traceability and coverage" |
| `adr-assistant` | [UDS] Create, manage, and track Architecture Decision Records (ADR). |
| `ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses when analyzing code or making suggestions. |
| `ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, layered documentation, and semantic boundaries. |
| `ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, AGENTS.md, .cursor/rules/, etc.) with proper structure. |
| `api-design-assistant` | Guide API design following REST, GraphQL, and gRPC best practices. |
| `atdd-assistant` | "[UDS] Guide through Acceptance Test-Driven Development workflow" |
| `audit-assistant` | "[UDS] UDS Health & Feedback System \| UDS 健康檢查與回饋系統" |
| `bdd-assistant` | "[UDS] Guide through Behavior-Driven Development workflow" |
| `brainstorm-assistant` | "[UDS] Structured AI-assisted brainstorming before spec creation" |
| `changelog-guide` | "[UDS] Generate and maintain CHANGELOG.md entries" |
| `checkin-assistant` | "[UDS] Pre-commit quality gates verification" |
| `ci-cd-assistant` | Guide CI/CD pipeline design, configuration, and optimization. |
| `code-review-assistant` | "[UDS] Perform systematic code review with checklist" |
| `commit-standards` | "[UDS] Generate commit messages following Conventional Commits standard" |
| `contract-test-assistant` | [UDS] Guide contract testing strategy for APIs and microservices. |
| `database-assistant` | Guide database design, migration, and query optimization. |
| `deploy-assistant` | Guide reliable deployments without CI/CD platforms (GitHub Actions / GitLab CI). |
| `dev-methodology` | "[UDS] Manage development methodology workflow" |
| `dev-workflow-guide` | "[UDS] Guide for mapping software development phases to UDS commands and features" |
| `docs-generator` | "[UDS] Generate usage documentation from project sources" |
| `documentation-guide` | Guide documentation structure, content requirements, and project documentation best practices. |
| `durable-execution-assistant` | "[UDS] Guide workflow failure recovery with checkpoints, retries, and rollback" |
| `e2e-assistant` | "[UDS] Generate E2E test skeletons from BDD scenarios" |
| `error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_NUMBER format. |
| `git-workflow-guide` | Guide Git branching strategies, branch naming, and merge operations. |
| `incident-response-assistant` | Guide incident response, root cause analysis, and post-mortem documentation. |
| `journey-test-assistant` | "[UDS] 從專案描述生成連貫使用者旅程測試計畫（TESTPLAN）與 E2E 骨架" |
| `logging-guide` | Implement structured logging with proper log levels and sensitive data handling. |
| `metrics-dashboard-assistant` | "[UDS] Track development metrics, code quality indicators, and project health" |
| `migration-assistant` | "[UDS] Guide code migration, framework upgrades, and technology modernization" |
| `observability-assistant` | Guide observability setup, metrics design, and alerting configuration. |
| `orchestrate` | Orchestrate multi-task execution plans using Claude's native Agent tool (DAG-based, no external engine). |
| `plan` | Generate plan.json from Spec documents, OpenSpec changes, or free-text requirements. |
| `pr-automation-assistant` | Guide pull request creation, review automation, and merge strategies. |
| `project-discovery` | "[UDS] Assess project health, architecture, and risks before adding features" |
| `project-structure-guide` | Guide for organizing project directories following language-specific best practices. |
| `push` | AI-assisted safety layer for git push operations with quality gates and collaboration guardrails. |
| `refactoring-assistant` | "[UDS] Guide refactoring decisions and strategy selection" |
| `release-standards` | "[UDS] Guide release process and changelogs" |
| `requirement-assistant` | "[UDS] Write user stories and requirements following INVEST criteria" |
| `retrospective-assistant` | [UDS] Guide structured team retrospectives for Sprint and Release cycles. |
| `reverse-engineer` | "[UDS] System archeology — reverse engineer code across Logic, Data, and Runtime dimensions" |
| `runbook-assistant` | Guide runbook creation, maintenance, and drill exercises. |
| `security-assistant` | Guide security review and vulnerability assessment following OWASP standards. |
| `security-scan-assistant` | Guide automated security scanning, dependency auditing, and secret detection. |
| `skill-builder` | "[UDS] Identify repeated processes and build Skills with the right development depth" |
| `slo-assistant` | Guide SLI selection, SLO setting, and Error Budget management. |
| `spec-derivation` | "[UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications" |
| `spec-driven-dev` | "[UDS] Create or review specification documents for Spec-Driven Development" |
| `sweep` | Scan codebase for debug artifacts and code quality issues; optionally auto-fix safe patterns. |
| `tdd-assistant` | "[UDS] Guide through Test-Driven Development workflow" |
| `test-coverage-assistant` | "[UDS] Analyze test coverage and provide recommendations" |
| `testing-guide` | Testing pyramid and test writing standards for UT/IT/ST/E2E. |

---

## 代理

| Agent | 角色 | 说明 |
|-------|------|-------------|
| `code-architect` | specialist | Software architecture specialist for system design and technical planning. |
| `doc-writer` | specialist | Documentation specialist for technical writing, API docs, and user guides. |
| `reviewer` | reviewer | Code review specialist for quality assessment, security analysis, and best practices enforcement. |
| `spec-analyst` | specialist | Specification analysis specialist for requirement extraction and spec generation. |
| `test-specialist` | specialist | Testing strategy specialist for test design, coverage analysis, and quality assurance. |

---

## 工作流程

| Workflow | 说明 |
|----------|-------------|
| `code-review` | Comprehensive code review workflow for PRs and code changes. |
| `feature-dev` | Standard feature development workflow from requirements to deployment. |
| `integrated-flow` | Complete development workflow integrating ATDD, SDD, BDD, and TDD methodologies. |
| `large-codebase-analysis` | RLM-enhanced workflow for analyzing large codebases with 50+ files. |
| `release` | Complete release workflow for software projects. |

---

## 核心规范

| Standard | 版本 | 说明 |
|----------|---------|-------------|
| `acceptance-criteria-traceability` | - |  |
| `acceptance-test-driven-development` | 1.1.0 |  |
| `accessibility-standards` | 1.0.0 | This standard defines comprehensive guidelines for creating accessible software  |
| `adr-standards` | 1.0.0 | Architecture Decision Records capture the context, options, and rationale behind |
| `adversarial-test` | - |  |
| `agent-behavior-discipline` | 1.0.0 | This standard defines four behavioral disciplines for AI agents that elevate per |
| `agent-communication-protocol` | 1.0.0 | Define a unified communication protocol for AI agents across the AsiaOstrich pro |
| `agent-dispatch` | 1.0.0 | Define standards for dispatching AI sub-agents in parallel, coordinating their w |
| `ai-agreement-standards` | 1.0.0 | This standard formalizes the interaction between Human (Acquirer) and AI (Suppli |
| `ai-command-behavior` | 1.0.0 | This standard defines a structure for specifying AI Agent runtime behavior in co |
| `ai-friendly-architecture` | 1.0.0 | This standard defines architecture and documentation practices that maximize the |
| `ai-instruction-standards` | 1.0.0 | This standard defines best practices for creating and maintaining AI instruction |
| `ai-response-navigation` | 1.0.0 | This standard defines navigation behavior for AI responses: every substantive AI |
| `alerting-standards` | 1.0.0 |  |
| `anti-hallucination` | 1.5.1 | This standard defines strict guidelines for AI assistants to prevent hallucinati |
| `anti-sycophancy-prompting` | 1.0.0 | This standard defines techniques and rules for designing prompts that elicit gen |
| `api-design-standards` | 1.0.0 | This standard defines comprehensive guidelines for designing, building, and main |
| `behavior-driven-development` | 1.1.0 |  |
| `behavior-snapshot` | - |  |
| `branch-completion` | 1.0.0 | Define a standardized workflow for completing development branches, including pr |
| `browser-compatibility-standards` | 1.0.0 | This standard defines supported browser and device matrices, testing automation  |
| `capability-declaration` | - |  |
| `cd-deployment-strategies` | - |  |
| `change-batching-standards` | - |  |
| `changelog-standards` | 1.0.2 | This standard defines how to write and maintain a CHANGELOG.md file to communica |
| `chaos-engineering-standards` | 1.0.0 |  |
| `chaos-injection-tests` | - |  |
| `checkin-standards` | 1.6.0 | This standard defines quality gates that MUST be passed before committing code t |
| `circuit-breaker` | - |  |
| `code-review-checklist` | 1.3.0 | This standard provides a comprehensive checklist for reviewing code changes, ens |
| `commit-message-guide` | 1.3.0 | Standardized commit messages improve code review efficiency, facilitate automate |
| `container-security` | - |  |
| `containerization-standards` | 1.0.0 |  |
| `context-aware-loading` | 1.0.0 | This standard defines a protocol for AI tools to selectively load development st |
| `contract-testing-standards` | 1.0.0 | Contract testing verifies that a provider (API server) and its consumers (client |
| `cost-budget-test` | - |  |
| `cross-flow-regression` | 1.0.0 | This standard defines cross-flow regression testing — verifying that changes to  |
| `data-migration-testing` | - |  |
| `database-standards` | 1.0.0 | This standard defines guidelines for database design, querying, migration, and o |
| `deployment-standards` | 1.0.0 | This standard defines guidelines for safely deploying software to production, co |
| `deprecation-standards` | 1.0.0 |  |
| `design-document-standards` | 1.0.0 |  |
| `developer-memory` | 1.0.0 | This standard defines a structured system for capturing, retrieving, and surfaci |
| `disaster-recovery-drill` | - |  |
| `documentation-lifecycle` | 1.0.0 | This standard defines **when** to update documentation, **when** to check it, an |
| `documentation-structure` | 1.5.0 | This standard defines a consistent documentation structure for software projects |
| `documentation-writing-standards` | 1.2.0 | This standard defines documentation requirements based on project types and prov |
| `dual-phase-output` | - |  |
| `environment-standards` | 1.0.0 |  |
| `error-code-standards` | 1.2.0 |  |
| `estimation-standards` | 1.0.0 |  |
| `execution-history` | 1.0.0 |  |
| `failure-source-taxonomy` | - |  |
| `feature-flag-standards` | 1.0.0 |  |
| `feature-manifest-standard` | - |  |
| `flaky-test-management` | - |  |
| `flow-based-testing` | 1.3.0 | This document defines a systematic methodology for testing multi-step processes. |
| `forward-derivation-standards` | 1.2.0 | This standard defines the principles and workflows for Forward Derivation—automa |
| `frontend-design-standards` | 1.0.0 | This standard defines a machine-readable frontend design specification format (D |
| `full-coverage-testing` | - |  |
| `git-workflow` | 1.4.0 | This standard defines Git branching strategies and workflows to ensure consisten |
| `git-worktree` | 1.0.0 | Define a lifecycle for using Git worktrees to isolate development work, ensuring |
| `governance-layer` | 1.0.0 | A governance layer provides a shared anchor for all agents and roles in a projec |
| `health-check-standards` | - |  |
| `immutability-first` | - |  |
| `knowledge-transfer-standards` | 1.0.0 |  |
| `llm-output-validation` | - |  |
| `logging-standards` | 1.2.0 |  |
| `mock-boundary` | 1.0.0 | This document defines rules for what can and cannot be mocked in tests. Its goal |
| `model-selection` | 1.0.0 | Define a cost-effective strategy for selecting AI model tiers based on task comp |
| `mutation-testing` | 1.0.0 | Mutation testing evaluates test suite effectiveness by injecting artificial bugs |
| `no-cicd-deployment` | - |  |
| `observability-standards` | 1.0.0 |  |
| `packaging-standards` | 1.0.0 | This standard defines a Recipe-based packaging framework that enables user proje |
| `performance-standards` | 1.1.0 | This standard defines comprehensive guidelines for software performance engineer |
| `pipeline-integration-standards` | - |  |
| `pipeline-security-gates` | - |  |
| `policy-as-code-testing` | - |  |
| `postmortem-standards` | 1.0.0 |  |
| `privacy-standards` | 1.0.0 |  |
| `project-context-memory` | 1.1.0 | This standard defines a structured system for capturing, retrieving, and enforci |
| `project-structure` | 1.2.0 | This standard defines conventions for project directory structure beyond documen |
| `prompt-regression` | - |  |
| `property-based-testing` | - |  |
| `recovery-recipe-registry` | - |  |
| `refactoring-standards` | 2.1.0 | This standard defines comprehensive guidelines for code refactoring, covering ev |
| `release-quality-manifest` | - |  |
| `release-readiness-gate` | 1.0.0 | This standard defines a **single, aggregated Release Readiness Gate** that unifi |
| `replay-test` | - |  |
| `requirement-engineering` | 1.0.0 |  |
| `retrospective-standards` | 1.0.0 | Retrospectives are structured team reflections that identify what worked well, w |
| `retry-standards` | - |  |
| `reverse-engineering-standards` | 1.0.0 | This standard defines the principles, workflows, and best practices for reverse  |
| `rollback-standards` | - |  |
| `runbook-standards` | 1.0.0 |  |
| `sast-advanced` | 1.0.0 | This standard defines Advanced Static Application Security Testing (SAST) practi |
| `secure-op` | - |  |
| `security-decision` | - |  |
| `security-standards` | 1.1.0 | This standard defines comprehensive security guidelines for software development |
| `security-testing` | 1.0.0 | This document defines the security testing methodology for software projects. It |
| `server-ops-security` | - |  |
| `skill-standard-alignment-check` | - |  |
| `slo-standards` | 1.0.0 |  |
| `smoke-test` | - |  |
| `spec-driven-development` | 2.2.0 |  |
| `standard-admission-criteria` | - |  |
| `standard-lifecycle-management` | - |  |
| `structured-task-definition` | 1.0.0 |  |
| `supply-chain-attestation` | - |  |
| `supply-chain-security-standards` | 1.0.0 |  |
| `systematic-debugging` | 1.0.0 | Define a structured, four-phase debugging workflow that prevents the common anti |
| `tech-debt-standards` | 1.0.0 |  |
| `test-completeness-dimensions` | 1.1.0 | This document defines a systematic framework for evaluating test completeness. I |
| `test-data-standards` | 1.0.0 |  |
| `test-driven-development` | 1.2.0 |  |
| `test-governance` | 1.1.0 |  |
| `testing-standards` | 3.2.0 | This standard defines actionable testing rules and conventions for AI agents and |
| `timeout-standards` | - |  |
| `token-budget` | - |  |
| `translation-lifecycle-standards` | 1.0.0 | Translation lifecycle standards: MISSING vs OUTDATED distinction, semver-aware s |
| `verification-evidence` | 1.0.0 | Establish an "Iron Law" that no task can be claimed as complete without verifica |
| `versioning` | 1.2.0 | This standard defines how to version software releases using Semantic Versioning |
| `virtual-organization-standards` | 1.0.0 | This standard treats the AI ecosystem as a "Virtual Organization." It defines ho |
| `workflow-enforcement` | - |  |
| `workflow-state-protocol` | 1.0.0 |  |

---

## 脚本

| Script | 说明 |
|--------|-------------|
| `add-industry-standards-metadata.mjs` | Add industry standards metadata to core/ |
| `aggregate-effectiveness.mjs` | Aggregate Standards Effectiveness Reports |
| `analyze-hook-stats.mjs` | Hook Statistics Analyzer (SPEC-SELFDIAG-001 REQ-7, AC-11) |
| `bump-version.mjs` | Build a platform-aware shell command for a .sh script. |
| `bump-version.sh` | DEPRECATED: Use 'node scripts/bump-version.mjs <version>' instead (cross-platform). |
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-ai-behavior-sync.sh` | DEPRECATED: Use 'npx tsx scripts/check-ai-behavior-sync.ts' instead (cross-platform). |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-commands-sync.ps1` | Check Commands Sync |
| `check-commands-sync.sh` | Commands Sync Checker |
| `check-commit-spec-reference.sh` | DEPRECATED: Use 'npx tsx scripts/check-commit-spec-reference.ts' instead (cross-platform). |
| `check-docs-integrity.ps1` | Check Docs Integrity |
| `check-docs-integrity.sh` | Documentation Integrity Checker |
| `check-docs-sync.ps1` | Check Docs Sync |
| `check-docs-sync.sh` | Documentation Sync Checker |
| `check-external-references.mjs` | External Reference Checker (SPEC-SELFDIAG-001 REQ-5, AC-7) |
| `check-flow-gate-report.sh` | DEPRECATED: Use 'npx tsx scripts/check-flow-gate-report.ts' instead (cross-platform). |
| `check-integration-commands-sync.sh` | DEPRECATED: Use 'npx tsx scripts/check-integration-commands-sync.ts' instead (cross-platform). |
| `check-orphan-specs.ps1` | Check Orphan Specs |
| `check-orphan-specs.sh` | Orphan Spec Detection Script |
| `check-registry-completeness.sh` | DEPRECATED: Use 'npx tsx scripts/check-registry-completeness.ts' instead (cross-platform). |
| `check-release-readiness-signoff.sh` | DEPRECATED: Use 'npx tsx scripts/check-release-readiness-signoff.ts' instead (cross-platform). |
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
| `check-usage-docs-sync.ps1` | Check if usage documentation needs to be regenerated |
| `check-usage-docs-sync.sh` | check-usage-docs-sync.sh |
| `check-version-sync.ps1` | Check Version Sync |
| `check-version-sync.sh` | Version Sync Checker |
| `check-workflow-compliance.sh` | DEPRECATED: Use 'npx tsx scripts/check-workflow-compliance.ts' instead (cross-platform). |
| `convert-md-to-yaml.mjs` | Markdown to AI-YAML Conversion Script |
| `fix-manifest-paths.ps1` | Fix Manifest Paths |
| `fix-manifest-paths.sh` | Manifest Path Fixer |
| `generate-docs.mjs` | Generate Docs |
| `generate-version-manifest.mjs` | Generate Version Manifest (SPEC-SELFDIAG-001 REQ-9, AC-14) |
| `install-hooks.mjs` | Install Hooks |
| `install-hooks.sh` | DEPRECATED: Use 'node scripts/install-hooks.mjs' instead (cross-platform). |
| `pre-commit.mjs` | Build a platform-aware shell command for a .sh script. |
| `pre-release-check.ps1` | Pre Release Check |
| `pre-release-check.sh` | Pre-release Check Script |
| `pre-release.ps1` | Pre-Release Preparation Script for Universal Development Standards |
| `pre-release.sh` | Pre-Release Preparation Script |
| `setup-husky.mjs` | Cross-platform Husky Setup Script |
| `sync-manifest.mjs` | Sync Manifest |

---

## License

This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
