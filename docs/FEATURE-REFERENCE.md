# UDS Feature Reference

> Universal Development Standards - Complete Feature Documentation
> Auto-generated | Last updated: 2026-02-10

**Language**: English | [繁體中文](../locales/zh-TW/docs/FEATURE-REFERENCE.md) | [简体中文](../locales/zh-CN/docs/FEATURE-REFERENCE.md)

---

## Table of Contents

1. [CLI Commands](#cli-commands) (9)
2. [Slash Commands](#slash-commands) (30)
3. [Skills](#skills) (26)
4. [Agents](#agents) (5)
5. [Workflows](#workflows) (5)
6. [Core Standards](#core-standards) (32)
7. [Scripts](#scripts) (31)

**Total Features: 138**

---

## AI Agent Functionality Matrix

This matrix shows the support level for UDS features across different AI agents.

| AI Agent | Skills Support | Slash Commands | Primary Config |
| :--- | :--- | :--- | :--- |
| **Claude Code** | **Full (26)** | **Native (30)**: `/tdd`, `/review`, `/commit`, etc. | `CLAUDE.md` |
| **OpenCode** | **Full (26)** | **Native (30)**: Same as Claude Code | `AGENTS.md` |
| **Gemini CLI** | **Complete (18+)** | **Native (20+)**: `/derive-*`, `/reverse-*`, `/config` | `GEMINI.md` |
| **Cursor** | **Core (v2.4+)** | **Simulated**: `/sdd`, `/review`, `/refactor` | `.cursorrules` |
| **Cline / Roo Code** | **Core (v3.48+)** | **Workflow-based**: `/checkin`, `/tdd`, `/sdd` | `.clinerules` |
| **GitHub Copilot** | **Instruction-based** | **Chat-based**: `commit`, `review`, `guide` | `copilot-instructions.md` |
| **Windsurf** | **Core (Jan 2026)** | **Rulebook-based**: `/refactor`, `/sdd` | `.windsurfrules` |

---

## CLI Commands

### `uds list`

**Description**: List available standards

**Options**:
| Option | Description |
|--------|-------------|
| `-l, --level` | Filter by adoption level (1, 2, or 3) |
| `-c, --category` | Filter by category (skill, reference, extension, integration, template) |

### `uds init`

**Description**: Initialize standards in current project

**Options**:
| Option | Description |
|--------|-------------|
| `-m, --mode` | Installation mode (skills, full) |
| `-l, --level` | Adoption level (1=Essential, 2=Recommended, 3=Enterprise) |
| `-f, --format` | Standards format (ai, human, both) |
| `--workflow` | Git workflow (github-flow, gitflow, trunk-based) |
| `--merge-strategy` | Merge strategy (squash, merge-commit, rebase-ff) |
| `--commit-lang` | Commit message language (english, traditional-chinese, bilingual) |
| `--test-levels` | Test levels, comma-separated (unit-testing,integration-testing,...) |
| `--lang` | Language extension (csharp, php) |
| `--framework` | Framework extension (fat-free) |
| `--locale` | Locale extension (zh-tw) |
| `--skills-location` | Skills location (marketplace, user, project, none) [default: marketplace] |
| `--content-mode` | Content mode for integration files (minimal, index, full) [default: index] |
| `-y, --yes` | Use defaults, skip interactive prompts |
| `-E, --experimental` | Enable experimental features (methodology) |

### `uds configure`

**Description**: Modify options for initialized project

**Options**:
| Option | Description |
|--------|-------------|
| `-t, --type` | Option type to configure (format, workflow, merge_strategy, commit_language, test_levels, skills, commands, all) |
| `--ai-tool` | Specific AI tool to configure (claude-code, opencode, copilot, etc.) |
| `--skills-location` | Skills installation location (project, user) |
| `-y, --yes` | Apply changes immediately without prompting |
| `-E, --experimental` | Enable experimental features (methodology) |

### `uds check`

**Description**: Check adoption status of current project

**Options**:
| Option | Description |
|--------|-------------|
| `-s, --standard` | Validate against a specific standard physical spec |
| `--json` | Output result in JSON format |
| `--summary` | Show compact status summary (for use by other commands) |
| `--diff` | Show diff for modified files |
| `--restore` | Restore all modified and missing files |
| `--restore-missing` | Restore only missing files |
| `--no-interactive` | Disable interactive mode |
| `--migrate` | Migrate legacy manifest to hash-based tracking |
| `--offline` | Skip npm registry check for CLI updates |

### `uds update`

**Description**: Update standards to latest version

**Options**:
| Option | Description |
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

### `uds skills`

**Description**: List installed Claude Code skills

### `uds agent`

**Description**: Manage UDS agents (list, install, info)

**Options**:
| Option | Description |
|--------|-------------|
| `--installed` | Show installation status for all AI tools |
| `-t, --tool` | Target AI tool (default: claude-code) |
| `-g, --global` | Install to user level instead of project level |
| `-y, --yes` | Skip confirmation prompts |

### `uds workflow`

**Description**: Manage UDS workflows (list, install, info, execute, status)

**Options**:
| Option | Description |
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

**Description**: Manage AI context configuration (init, validate, graph)

---

## Slash Commands

| Command | Description |
|---------|-------------|
| `/atdd` | [UDS] Guide through Acceptance Test-Driven Development workflow |
| `/bdd` | [UDS] Guide through Behavior-Driven Development workflow |
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
| `/sdd` | [UDS] Create or review specification documents for Spec-Driven Development |
| `/tdd` | [UDS] Guide through Test-Driven Development workflow |
| `/update` | [UDS] Update development standards to latest version |

---

## Skills

| Skill | Description |
|-------|-------------|
| `ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses when analyzing code or making suggestions. |
| `ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, layered documentation, and semantic boundaries. |
| `ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, .cursorrules, etc.) with proper structure. |
| `atdd-assistant` | "[UDS] Guide through Acceptance Test-Driven Development workflow" |
| `bdd-assistant` | "[UDS] Guide through Behavior-Driven Development workflow" |
| `changelog-guide` | "[UDS] Generate and maintain CHANGELOG.md entries" |
| `checkin-assistant` | "[UDS] Pre-commit quality gates verification" |
| `code-review-assistant` | "[UDS] Perform systematic code review with checklist" |
| `commit-standards` | "[UDS] Generate commit messages following Conventional Commits standard" |
| `docs-generator` | "[UDS] Generate usage documentation from project sources" |
| `documentation-guide` | Guide documentation structure, content requirements, and project documentation best practices. |
| `error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_NUMBER format. |
| `forward-derivation` | "[UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications" |
| `git-workflow-guide` | Guide Git branching strategies, branch naming, and merge operations. |
| `logging-guide` | Implement structured logging with proper log levels and sensitive data handling. |
| `methodology-system` | "[UDS] Manage development methodology workflow" |
| `project-discovery` | "[UDS] Assess project health, architecture, and risks before adding features" |
| `project-structure-guide` | Guide for organizing project directories following language-specific best practices. |
| `refactoring-assistant` | "[UDS] Guide refactoring decisions and strategy selection" |
| `release-standards` | "[UDS] Guide release process and changelogs" |
| `requirement-assistant` | "[UDS] Write user stories and requirements following INVEST criteria" |
| `reverse-engineer` | "[UDS] Reverse engineer code to Specs, BDD, or TDD coverage" |
| `spec-driven-dev` | "[UDS] Create or review specification documents for Spec-Driven Development" |
| `tdd-assistant` | "[UDS] Guide through Test-Driven Development workflow" |
| `test-coverage-assistant` | "[UDS] Analyze test coverage and provide recommendations" |
| `testing-guide` | Testing pyramid and test writing standards for UT/IT/ST/E2E. |

---

## Agents

| Agent | Role | Description |
|-------|------|-------------|
| `code-architect` | specialist | Software architecture specialist for system design and technical planning. |
| `doc-writer` | specialist | Documentation specialist for technical writing, API docs, and user guides. |
| `reviewer` | reviewer | Code review specialist for quality assessment, security analysis, and best practices enforcement. |
| `spec-analyst` | specialist | Specification analysis specialist for requirement extraction and spec generation. |
| `test-specialist` | specialist | Testing strategy specialist for test design, coverage analysis, and quality assurance. |

---

## Workflows

| Workflow | Description |
|----------|-------------|
| `code-review` | Comprehensive code review workflow for PRs and code changes. |
| `feature-dev` | Standard feature development workflow from requirements to deployment. |
| `integrated-flow` | Complete development workflow integrating ATDD, SDD, BDD, and TDD methodologies. |
| `large-codebase-analysis` | RLM-enhanced workflow for analyzing large codebases with 50+ files. |
| `release` | Complete release workflow for software projects. |

---

## Core Standards

| Standard | Version | Description |
|----------|---------|-------------|
| `acceptance-test-driven-development` | 1.1.0 |  |
| `accessibility-standards` | 1.0.0 | This standard defines comprehensive guidelines for creating accessible software  |
| `ai-agreement-standards` | 1.0.0 | This standard formalizes the interaction between Human (Acquirer) and AI (Suppli |
| `ai-friendly-architecture` | 1.0.0 | This standard defines architecture and documentation practices that maximize the |
| `ai-instruction-standards` | 1.0.0 | This standard defines best practices for creating and maintaining AI instruction |
| `anti-hallucination` | 1.5.0 | This standard defines strict guidelines for AI assistants to prevent hallucinati |
| `behavior-driven-development` | 1.1.0 |  |
| `changelog-standards` | 1.0.2 | This standard defines how to write and maintain a CHANGELOG.md file to communica |
| `checkin-standards` | 1.4.0 | This standard defines quality gates that MUST be passed before committing code t |
| `code-review-checklist` | 1.3.0 | This standard provides a comprehensive checklist for reviewing code changes, ens |
| `commit-message-guide` | 1.2.3 | Standardized commit messages improve code review efficiency, facilitate automate |
| `deployment-standards` | 1.0.0 | This standard defines guidelines for safely deploying software to production, co |
| `developer-memory` | 1.0.0 | This standard defines a structured system for capturing, retrieving, and surfaci |
| `documentation-structure` | 1.3.0 | This standard defines a consistent documentation structure for software projects |
| `documentation-writing-standards` | 1.1.0 | This standard defines documentation requirements based on project types and prov |
| `error-code-standards` | 1.1.0 |  |
| `forward-derivation-standards` | 1.1.0 | This standard defines the principles and workflows for Forward Derivation—automa |
| `git-workflow` | 1.4.0 | This standard defines Git branching strategies and workflows to ensure consisten |
| `logging-standards` | 1.2.0 |  |
| `performance-standards` | 1.1.0 | This standard defines comprehensive guidelines for software performance engineer |
| `project-context-memory` | 1.0.0 | This standard defines a structured system for capturing, retrieving, and enforci |
| `project-structure` | 1.1.0 | This standard defines conventions for project directory structure beyond documen |
| `refactoring-standards` | 2.1.0 | This standard defines comprehensive guidelines for code refactoring, covering ev |
| `requirement-engineering` | 1.0.0 |  |
| `reverse-engineering-standards` | 1.0.0 | This standard defines the principles, workflows, and best practices for reverse  |
| `security-standards` | 1.1.0 | This standard defines comprehensive security guidelines for software development |
| `spec-driven-development` | 2.1.0 |  |
| `test-completeness-dimensions` | 1.1.0 | This document defines a systematic framework for evaluating test completeness. I |
| `test-driven-development` | 1.2.0 |  |
| `testing-standards` | 3.0.0 | This standard defines actionable testing rules and conventions for AI agents and |
| `versioning` | 1.2.0 | This standard defines how to version software releases using Semantic Versioning |
| `virtual-organization-standards` | 1.0.0 | This standard treats the AI ecosystem as a "Virtual Organization." It defines ho |

---

## Scripts

| Script | Description |
|--------|-------------|
| `add-industry-standards-metadata.mjs` | Add industry standards metadata to core/ |
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-commands-sync.ps1` | Check Commands Sync |
| `check-commands-sync.sh` | Commands Sync Checker |
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
| `check-usage-docs-sync.ps1` | Check if usage documentation needs to be regenerated |
| `check-usage-docs-sync.sh` | check-usage-docs-sync.sh |
| `check-version-sync.ps1` | Check Version Sync |
| `check-version-sync.sh` | Version Sync Checker |
| `convert-md-to-yaml.mjs` | Markdown to AI-YAML Conversion Script |
| `fix-manifest-paths.ps1` | Fix Manifest Paths |
| `fix-manifest-paths.sh` | Manifest Path Fixer |
| `pre-release-check.ps1` | Pre Release Check |
| `pre-release-check.sh` | Pre-release Check Script |
| `pre-release.ps1` | Pre-Release Preparation Script for Universal Development Standards |
| `pre-release.sh` | Pre-Release Preparation Script |
| `setup-husky.mjs` | Cross-platform Husky Setup Script |

---

## License

This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
