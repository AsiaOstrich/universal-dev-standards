# UDS 功能参考手册

> Universal Development Standards - 完整功能文档
> Auto-generated | Last updated: 2026-01-26

**Language**: [English](../../docs/FEATURE-REFERENCE.md) | [繁體中文](../../zh-TW/docs/FEATURE-REFERENCE.md) | 简体中文

---

## 目录

1. [CLI 指令](#cli-commands) (9)
2. [斜线命令](#slash-commands) (25)
3. [技能](#skills) (25)
4. [代理](#agents) (5)
5. [工作流程](#workflows) (5)
6. [核心规范](#core-standards) (23)
7. [脚本](#scripts) (22)

**Total Features: 114**

---

## CLI 指令

### `uds list`

**说明**: List available standards

**选项**:
| Option | 说明 |
|--------|-------------|
| `-l, --level` | Filter by adoption level (1, 2, or 3) |
| `-c, --category` | Filter by category (skill, reference, extension, integration, template) |

### `uds init`

**说明**: Initialize standards in current project

**选项**:
| Option | 说明 |
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

**说明**: Modify options for initialized project

**选项**:
| Option | 说明 |
|--------|-------------|
| `-t, --type` | Option type to configure (format, workflow, merge_strategy, commit_language, test_levels, skills, commands, all) |
| `--ai-tool` | Specific AI tool to configure (claude-code, opencode, copilot, etc.) - enables non-interactive mode |
| `--skills-location` | Skills installation location (project, user) for non-interactive mode |
| `-y, --yes` | Apply changes immediately without prompting |
| `-E, --experimental` | Enable experimental features (methodology) |

### `uds check`

**说明**: Check adoption status of current project

**选项**:
| Option | 说明 |
|--------|-------------|
| `--summary` | Show compact status summary (for use by other commands) |
| `--diff` | Show diff for modified files |
| `--restore` | Restore all modified and missing files |
| `--restore-missing` | Restore only missing files |
| `--no-interactive` | Disable interactive mode |
| `--migrate` | Migrate legacy manifest to hash-based tracking |
| `--offline` | Skip npm registry check for CLI updates |

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

---

## 技能

| Skill | 说明 |
|-------|-------------|
| `ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses when analyzing code or making suggestions. |
| `ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, layered documentation, and semantic boundaries. |
| `ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, .cursorrules, etc.) with proper structure. |
| `atdd-assistant` | Guide teams through Acceptance Test-Driven Development workflow. |
| `bdd-assistant` | Guide developers through Behavior-Driven Development workflow. |
| `changelog-guide` | Write and maintain CHANGELOG.md following Keep a Changelog format. |
| `checkin-assistant` | Guide pre-commit quality gates and check-in workflow. |
| `code-review-assistant` | Systematic code review checklist and pre-commit quality gates for PRs. |
| `commit-standards` | Format commit messages following conventional commits standard. |
| `docs-generator` | Generate usage documentation from project sources. |
| `documentation-guide` | Guide documentation structure, content requirements, and project documentation best practices. |
| `error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_NUMBER format. |
| `forward-derivation` | Derive BDD scenarios and TDD test skeletons from approved SDD specifications. |
| `git-workflow-guide` | Guide Git branching strategies, branch naming, and merge operations. |
| `logging-guide` | Implement structured logging with proper log levels and sensitive data handling. |
| `methodology-system` | Manage and guide developers through active development methodology workflows. |
| `project-structure-guide` | Guide for organizing project directories following language-specific best practices. |
| `refactoring-assistant` | Guide refactoring decisions and large-scale code improvements. |
| `release-standards` | Semantic versioning and changelog formatting for software releases. |
| `requirement-assistant` | Guide requirement writing, user story creation, and feature specification. |
| `reverse-engineer` | Reverse engineer existing code into SDD specification documents. |
| `spec-driven-dev` | Guide Spec-Driven Development (SDD) workflow for planning changes before implementation. |
| `tdd-assistant` | Guide developers through Test-Driven Development workflow. |
| `test-coverage-assistant` | Evaluate test completeness using the 8 dimensions framework. |
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
| `acceptance-test-driven-development` | 1.1.0 | This standard defines the principles, workflows, and best practices for Acceptan |
| `ai-friendly-architecture` | 1.0.0 | This standard defines architecture and documentation practices that maximize the |
| `ai-instruction-standards` | 1.0.0 | This standard defines best practices for creating and maintaining AI instruction |
| `anti-hallucination` | 1.4.0 | This standard defines strict guidelines for AI assistants to prevent hallucinati |
| `behavior-driven-development` | 1.1.0 | This standard defines the principles, workflows, and best practices for Behavior |
| `changelog-standards` | 1.0.2 | This standard defines how to write and maintain a CHANGELOG.md file to communica |
| `checkin-standards` | 1.4.0 | This standard defines quality gates that MUST be passed before committing code t |
| `code-review-checklist` | 1.3.0 | This standard provides a comprehensive checklist for reviewing code changes, ens |
| `commit-message-guide` | 1.2.3 | Standardized commit messages improve code review efficiency, facilitate automate |
| `documentation-structure` | 1.3.0 | This standard defines a consistent documentation structure for software projects |
| `documentation-writing-standards` | 1.1.0 | This standard defines documentation requirements based on project types and prov |
| `error-code-standards` | 1.1.0 |  |
| `forward-derivation-standards` | 1.1.0 | This standard defines the principles and workflows for Forward Derivation—automa |
| `git-workflow` | 1.3.0 | This standard defines Git branching strategies and workflows to ensure consisten |
| `logging-standards` | 1.2.0 |  |
| `project-structure` | 1.1.0 | This standard defines conventions for project directory structure beyond documen |
| `refactoring-standards` | 2.0.0 | This standard defines comprehensive guidelines for code refactoring, covering ev |
| `reverse-engineering-standards` | 1.0.0 | This standard defines the principles, workflows, and best practices for reverse  |
| `spec-driven-development` | 2.0.0 | This standard defines the principles and workflows for Spec-Driven Development ( |
| `test-completeness-dimensions` | 1.1.0 | This document defines a systematic framework for evaluating test completeness. I |
| `test-driven-development` | 1.2.0 | This standard defines the principles, workflows, and best practices for Test-Dri |
| `testing-standards` | 2.2.0 | This standard defines testing conventions and best practices to ensure software  |
| `versioning` | 1.2.0 | This standard defines how to version software releases using Semantic Versioning |

---

## 脚本

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
