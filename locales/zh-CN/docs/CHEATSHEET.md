# UDS 速查表

> Quick reference for all UDS features | Last updated: 2026-01-26

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
| `/atdd` | Guide through Acceptance Test-Driven Development workflow |
| `/bdd` | Guide through Behavior-Driven Development workflow |
| `/changelog` | Generate or update CHANGELOG following Keep a Changelog format |
| `/check` | Verify standards adoption status |
| `/commit` | Generate commit messages following Conventional Commits standard |
| `/config` | Configure project development standards |
| `/coverage` | Analyze test coverage and provide recommendations |
| `/derive-all` | Derive BDD scenarios and TDD test skeletons from approved SDD specification |
| `/derive-atdd` | (Optional) Derive ATDD acceptance test tables from approved SDD specification |
| `/derive-bdd` | Derive BDD Gherkin scenarios from approved SDD specification |
| `/derive-tdd` | Derive TDD test skeletons from approved SDD specification |
| `/docs` | Create or update project documentation structure |
| `/generate-docs` | Generate usage documentation from project sources \| 從專案來源產生使用說明文件 |
| `/init` | Initialize development standards in current project |
| `/methodology` | Manage development methodology workflow |
| `/refactor` | Guide refactoring decisions and strategy selection |
| `/release` | Guide through release process with semantic versioning |
| `/requirement` | Write user stories and requirements following INVEST criteria |
| `/reverse-bdd` | Transform SDD acceptance criteria into BDD Gherkin scenarios |
| `/reverse-spec` | Reverse engineer existing code into SDD specification document |
| `/reverse-tdd` | Analyze test coverage for BDD scenarios |
| `/review` | Perform systematic code review with checklist |
| `/spec` | Create or review specification documents for Spec-Driven Development |
| `/tdd` | Guide through Test-Driven Development workflow |
| `/update` | Update development standards to latest version |

## 🎯 技能

| Skill | 说明 |
|-------|-------------|
| `ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses |
| `ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, laye |
| `ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, .cursor |
| `atdd-assistant` | Guide teams through Acceptance Test-Driven Development workf |
| `bdd-assistant` | Guide developers through Behavior-Driven Development workflo |
| `changelog-guide` | Write and maintain CHANGELOG.md following Keep a Changelog f |
| `checkin-assistant` | Guide pre-commit quality gates and check-in workflow. |
| `code-review-assistant` | Systematic code review checklist and pre-commit quality gate |
| `commit-standards` | Format commit messages following conventional commits standa |
| `docs-generator` | Generate usage documentation from project sources. |
| `documentation-guide` | Guide documentation structure, content requirements, and pro |
| `error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_ |
| `forward-derivation` | Derive BDD scenarios and TDD test skeletons from approved SD |
| `git-workflow-guide` | Guide Git branching strategies, branch naming, and merge ope |
| `logging-guide` | Implement structured logging with proper log levels and sens |
| `methodology-system` | Manage and guide developers through active development metho |
| `project-structure-guide` | Guide for organizing project directories following language- |
| `refactoring-assistant` | Guide refactoring decisions and large-scale code improvement |
| `release-standards` | Semantic versioning and changelog formatting for software re |
| `requirement-assistant` | Guide requirement writing, user story creation, and feature  |
| `reverse-engineer` | Reverse engineer existing code into SDD specification docume |
| `spec-driven-dev` | Guide Spec-Driven Development (SDD) workflow for planning ch |
| `tdd-assistant` | Guide developers through Test-Driven Development workflow. |
| `test-coverage-assistant` | Evaluate test completeness using the 8 dimensions framework. |
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
| `acceptance-test-driven-development` | This standard defines the principles, workflows, a |
| `ai-friendly-architecture` | This standard defines architecture and documentati |
| `ai-instruction-standards` | This standard defines best practices for creating  |
| `anti-hallucination` | This standard defines strict guidelines for AI ass |
| `behavior-driven-development` | This standard defines the principles, workflows, a |
| `changelog-standards` | This standard defines how to write and maintain a  |
| `checkin-standards` | This standard defines quality gates that MUST be p |
| `code-review-checklist` | This standard provides a comprehensive checklist f |
| `commit-message-guide` | Standardized commit messages improve code review e |
| `documentation-structure` | This standard defines a consistent documentation s |
| `documentation-writing-standards` | This standard defines documentation requirements b |
| `error-code-standards` | Error Code Standards |
| `forward-derivation-standards` | This standard defines the principles and workflows |
| `git-workflow` | This standard defines Git branching strategies and |
| `logging-standards` | Logging Standards |
| `project-structure` | This standard defines conventions for project dire |
| `refactoring-standards` | This standard defines comprehensive guidelines for |
| `reverse-engineering-standards` | This standard defines the principles, workflows, a |
| `spec-driven-development` | This standard defines the principles and workflows |
| `test-completeness-dimensions` | This document defines a systematic framework for e |
| `test-driven-development` | This standard defines the principles, workflows, a |
| `testing-standards` | This standard defines testing conventions and best |
| `versioning` | This standard defines how to version software rele |

## 📜 脚本

| Script | 说明 |
|--------|-------------|
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-docs-sync.ps1` | Check Docs Sync |
| `check-docs-sync.sh` | Documentation Sync Checker |
| `check-standards-sync.ps1` | Check Standards Sync |
| `check-standards-sync.sh` | Standards Consistency Checker |
| `check-translation-sync.ps1` | Check Translation Sync |
| `check-translation-sync.sh` | Translation Sync Checker |
| `check-usage-docs-sync.ps1` | Check if usage documentation needs to be regenerat |
| `check-usage-docs-sync.sh` | check-usage-docs-sync.sh |
| `check-version-sync.ps1` | Check Version Sync |
| `check-version-sync.sh` | Version Sync Checker |
| `convert-md-to-yaml.mjs` | Markdown to AI-YAML Conversion Script |
| `fix-manifest-paths.ps1` | Fix Manifest Paths |
| `fix-manifest-paths.sh` | Manifest Path Fixer |
| `pre-release-check.ps1` | Pre Release Check |
| `pre-release-check.sh` | Pre-release Check Script |
| `pre-release.ps1` | Pre-Release Preparation Script for Universal Devel |
| `pre-release.sh` | Pre-Release Preparation Script |
| `setup-husky.mjs` | Cross-platform Husky Setup Script |

---

📖 [Full Reference](FEATURE-REFERENCE.md) | 🔗 [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)
