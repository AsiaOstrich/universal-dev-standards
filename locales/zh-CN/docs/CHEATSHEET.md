---
source: ../../../docs/CHEATSHEET.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: current
---

# UDS 速查表

> Quick reference for all UDS features | Last updated: 2026-03-24

**Language**: [English](../../../docs/CHEATSHEET.md) | [繁體中文](../../zh-TW/docs/CHEATSHEET.md) | 简体中文

---

## 🛠️ CLI 指令

| Command | 说明 |
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

## 💬 斜线命令

| Command | 说明 |
|---------|-------------|
| `/ac-coverage` | "[UDS] Generate AC-to-test traceability matrix and coverage report" |
| `/atdd` | [UDS] Guide through Acceptance Test-Driven Development workflow |
| `/bdd` | [UDS] Guide through Behavior-Driven Development workflow |
| `/brainstorm` | "[UDS] Structured AI-assisted brainstorming before spec creation" |
| `/changelog` | "[UDS] Generate and maintain CHANGELOG.md entries" |
| `/check` | [UDS] Verify standards adoption status |
| `/checkin` | "[UDS] Pre-commit quality gates verification" |
| `/commit` | [UDS] Generate commit messages following Conventional Commits standard |
| `/config` | [UDS] Configure project development standards |
| `/coverage` | [UDS] Analyze test coverage and provide recommendations |
| `/derive-all` | [UDS] Derive all test structures (BDD, TDD, ATDD) from SDD specification |
| `/derive-atdd` | [UDS] Derive ATDD acceptance tests from SDD specification |
| `/derive-bdd` | [UDS] Derive BDD Gherkin scenarios from SDD specification |
| `/derive-tdd` | [UDS] Derive TDD test skeletons from SDD specification |
| `/derive` | [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications. |
| `/dev-workflow` | "[UDS] Guide for mapping software development phases to UDS commands and features" |
| `/discover` | "[UDS] Assess project health, architecture, and risks before adding features" |
| `/docgen` | "[UDS] Generate usage documentation from project sources" |
| `/docs` | [UDS] Manage, guide, and generate documentation. |
| `/guide` | [UDS] Access Universal Development Standards guides and references. |
| `/init` | [UDS] Initialize development standards in current project |
| `/methodology` | [UDS] Manage development methodology workflow |
| `/refactor` | [UDS] Guide refactoring decisions and strategy selection |
| `/release` | [UDS] Manage release process and changelogs. |
| `/requirement` | [UDS] Write user stories and requirements following INVEST criteria |
| `/reverse-bdd` | [UDS] Transform SDD acceptance criteria to BDD scenarios |
| `/reverse-sdd` | [UDS] Reverse engineer code into SDD specification document |
| `/reverse-tdd` | [UDS] Analyze BDD-TDD coverage gaps |
| `/reverse` | [UDS] Reverse engineer code to Specs, BDD, or TDD coverage. |
| `/review` | [UDS] Perform systematic code review with checklist |
| `/sdd-retro` | [UDS] Create retroactive specs for untracked feat/fix commits |
| `/sdd` | [UDS] Create or review specification documents for Spec-Driven Development |
| `/tdd` | [UDS] Guide through Test-Driven Development workflow |
| `/update` | [UDS] Update development standards to latest version |

## 🎯 技能

| Skill | 说明 |
|-------|-------------|
| `ac-coverage-assistant` | "[UDS] Analyze AC-to-test traceability and coverage" |
| `ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses |
| `ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, laye |
| `ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, .cursor |
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
| `database-assistant` | Guide database design, migration, and query optimization. |
| `dev-workflow-guide` | "[UDS] Guide for mapping software development phases to UDS  |
| `docs-generator` | "[UDS] Generate usage documentation from project sources" |
| `documentation-guide` | Guide documentation structure, content requirements, and pro |
| `durable-execution-assistant` | "[UDS] Guide workflow failure recovery with checkpoints, ret |
| `error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_ |
| `forward-derivation` | "[UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables f |
| `git-workflow-guide` | Guide Git branching strategies, branch naming, and merge ope |
| `incident-response-assistant` | Guide incident response, root cause analysis, and post-morte |
| `logging-guide` | Implement structured logging with proper log levels and sens |
| `methodology-system` | "[UDS] Manage development methodology workflow" |
| `metrics-dashboard-assistant` | "[UDS] Track development metrics, code quality indicators, a |
| `migration-assistant` | "[UDS] Guide code migration, framework upgrades, and technol |
| `pr-automation-assistant` | Guide pull request creation, review automation, and merge st |
| `project-discovery` | "[UDS] Assess project health, architecture, and risks before |
| `project-structure-guide` | Guide for organizing project directories following language- |
| `refactoring-assistant` | "[UDS] Guide refactoring decisions and strategy selection" |
| `release-standards` | "[UDS] Guide release process and changelogs" |
| `requirement-assistant` | "[UDS] Write user stories and requirements following INVEST  |
| `reverse-engineer` | "[UDS] System archeology — reverse engineer code across Logi |
| `security-assistant` | Guide security review and vulnerability assessment following |
| `security-scan-assistant` | Guide automated security scanning, dependency auditing, and  |
| `spec-driven-dev` | "[UDS] Create or review specification documents for Spec-Dri |
| `tdd-assistant` | "[UDS] Guide through Test-Driven Development workflow" |
| `test-coverage-assistant` | "[UDS] Analyze test coverage and provide recommendations" |
| `testing-guide` | Testing pyramid and test writing standards for UT/IT/ST/E2E. |

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
| `agent-dispatch` | Define standards for dispatching AI sub-agents in  |
| `ai-agreement-standards` | This standard formalizes the interaction between H |
| `ai-friendly-architecture` | This standard defines architecture and documentati |
| `ai-instruction-standards` | This standard defines best practices for creating  |
| `anti-hallucination` | This standard defines strict guidelines for AI ass |
| `api-design-standards` | This standard defines comprehensive guidelines for |
| `behavior-driven-development` | Behavior-Driven Development (BDD) Standards |
| `branch-completion` | Define a standardized workflow for completing deve |
| `change-batching-standards` | Change Batching Standards |
| `changelog-standards` | This standard defines how to write and maintain a  |
| `checkin-standards` | This standard defines quality gates that MUST be p |
| `code-review-checklist` | This standard provides a comprehensive checklist f |
| `commit-message-guide` | Standardized commit messages improve code review e |
| `context-aware-loading` | This standard defines a protocol for AI tools to s |
| `database-standards` | This standard defines guidelines for database desi |
| `deployment-standards` | This standard defines guidelines for safely deploy |
| `developer-memory` | This standard defines a structured system for capt |
| `documentation-structure` | This standard defines a consistent documentation s |
| `documentation-writing-standards` | This standard defines documentation requirements b |
| `error-code-standards` | Error Code Standards |
| `forward-derivation-standards` | This standard defines the principles and workflows |
| `git-workflow` | This standard defines Git branching strategies and |
| `git-worktree` | Define a lifecycle for using Git worktrees to isol |
| `logging-standards` | Logging Standards |
| `model-selection` | Define a cost-effective strategy for selecting AI  |
| `performance-standards` | This standard defines comprehensive guidelines for |
| `pipeline-integration-standards` | Pipeline Integration Standards |
| `project-context-memory` | This standard defines a structured system for capt |
| `project-structure` | This standard defines conventions for project dire |
| `refactoring-standards` | This standard defines comprehensive guidelines for |
| `requirement-engineering` | Requirement Engineering Standards |
| `reverse-engineering-standards` | This standard defines the principles, workflows, a |
| `security-standards` | This standard defines comprehensive security guide |
| `spec-driven-development` | Spec-Driven Development (SDD) Standards |
| `structured-task-definition` | Structured Task Definition Standards |
| `systematic-debugging` | Define a structured, four-phase debugging workflow |
| `test-completeness-dimensions` | This document defines a systematic framework for e |
| `test-driven-development` | Test-Driven Development (TDD) Standards |
| `test-governance` | Test Governance Standards |
| `testing-standards` | This standard defines actionable testing rules and |
| `verification-evidence` | Establish an "Iron Law" that no task can be claime |
| `versioning` | This standard defines how to version software rele |
| `virtual-organization-standards` | This standard treats the AI ecosystem as a "Virtua |
| `workflow-enforcement` | Workflow Enforcement Standards |
| `workflow-state-protocol` | Workflow State Protocol |

## 📜 脚本

| Script | 说明 |
|--------|-------------|
| `add-industry-standards-metadata.mjs` | Add industry standards metadata to core/ |
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-commands-sync.ps1` | Check Commands Sync |
| `check-commands-sync.sh` | Commands Sync Checker |
| `check-commit-spec-reference.sh` | Commit-msg Spec Reference Suggestion — WARNING ONL |
| `check-docs-integrity.ps1` | Check Docs Integrity |
| `check-docs-integrity.sh` | Documentation Integrity Checker |
| `check-docs-sync.ps1` | Check Docs Sync |
| `check-docs-sync.sh` | Documentation Sync Checker |
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
| `check-workflow-compliance.sh` | Workflow Compliance Check — WARNING ONLY (non-bloc |
| `convert-md-to-yaml.mjs` | Markdown to AI-YAML Conversion Script |
| `fix-manifest-paths.ps1` | Fix Manifest Paths |
| `fix-manifest-paths.sh` | Manifest Path Fixer |
| `generate-docs.mjs` | Generate Docs |
| `pre-release-check.ps1` | Pre Release Check |
| `pre-release-check.sh` | Pre-release Check Script |
| `pre-release.ps1` | Pre-Release Preparation Script for Universal Devel |
| `pre-release.sh` | Pre-Release Preparation Script |
| `setup-husky.mjs` | Cross-platform Husky Setup Script |
| `sync-manifest.mjs` | Sync Manifest |

---

📖 [Full Reference](FEATURE-REFERENCE.md) | 🔗 [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)
