# UDS Cheatsheet

> Quick reference for all UDS features | Last updated: 2026-02-04

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
| `/atdd` | [UDS] Guide through Acceptance Test-Driven Development workflow |
| `/bdd` | [UDS] Guide through Behavior-Driven Development workflow |
| `/check` | [UDS] Verify standards adoption status |
| `/commit` | [UDS] Generate commit messages following Conventional Commits standard |
| `/config` | [UDS] Configure project development standards |
| `/coverage` | [UDS] Analyze test coverage and provide recommendations |
| `/derive` | [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications. |
| `/docs` | [UDS] Manage, guide, and generate documentation. |
| `/guide` | [UDS] Access Universal Development Standards guides and references. |
| `/init` | [UDS] Initialize development standards in current project |
| `/methodology` | [UDS] Manage development methodology workflow |
| `/refactor` | [UDS] Guide refactoring decisions and strategy selection |
| `/release` | [UDS] Manage release process and changelogs. |
| `/requirement` | [UDS] Write user stories and requirements following INVEST criteria |
| `/reverse` | [UDS] Reverse engineer code to Specs, BDD, or TDD coverage. |
| `/review` | [UDS] Perform systematic code review with checklist |
| `/sdd` | [UDS] Create or review specification documents for Spec-Driven Development |
| `/tdd` | [UDS] Guide through Test-Driven Development workflow |
| `/update` | [UDS] Update development standards to latest version |

## 🎯 Skills

| Skill | Description |
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
| `acceptance-test-driven-development` | Acceptance Test-Driven Development (ATDD) Standards |
| `accessibility-standards` | This standard defines comprehensive guidelines for |
| `ai-agreement-standards` | This standard formalizes the interaction between H |
| `ai-friendly-architecture` | This standard defines architecture and documentati |
| `ai-instruction-standards` | This standard defines best practices for creating  |
| `anti-hallucination` | This standard defines strict guidelines for AI ass |
| `behavior-driven-development` | Behavior-Driven Development (BDD) Standards |
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
| `performance-standards` | This standard defines comprehensive guidelines for |
| `project-structure` | This standard defines conventions for project dire |
| `refactoring-standards` | This standard defines comprehensive guidelines for |
| `requirement-engineering` | Requirement Engineering Standards |
| `reverse-engineering-standards` | This standard defines the principles, workflows, a |
| `security-standards` | This standard defines comprehensive security guide |
| `spec-driven-development` | Spec-Driven Development (SDD) Standards |
| `test-completeness-dimensions` | This document defines a systematic framework for e |
| `test-driven-development` | Test-Driven Development (TDD) Standards |
| `testing-standards` | This standard defines actionable testing rules and |
| `versioning` | This standard defines how to version software rele |
| `virtual-organization-standards` | This standard treats the AI ecosystem as a "Virtua |

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `add-industry-standards-metadata.mjs` | Add industry standards metadata to core/ |
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-docs-sync.ps1` | Check Docs Sync |
| `check-docs-sync.sh` | Documentation Sync Checker |
| `check-scope-sync.ps1` | Check Scope Sync |
| `check-scope-sync.sh` | Scope Consistency Check Script |
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
