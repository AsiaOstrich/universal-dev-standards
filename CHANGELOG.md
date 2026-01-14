# Changelog

> **Language**: English | [繁體中文](locales/zh-TW/CHANGELOG.md) | [简体中文](locales/zh-CN/CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [3.5.0-beta.15] - 2026-01-14

### Fixed
- **CLI**: Fix `require()` error in ES Module (init.js)
  - Replaced dynamic `require('path')` with static ES Module import
  - Resolved JavaScript Temporal Dead Zone (TDZ) error caused by variable shadowing
  - `uds init` now works correctly in all environments

## [3.5.0-beta.14] - 2026-01-14

### Added
- **CLI**: Add Marketplace Skills version detection
  - New `getMarketplaceSkillsInfo()` reads `~/.claude/plugins/installed_plugins.json`
  - `uds check` now displays Skills version and last updated date for Marketplace installations
- **Docs**: Add Section 7.5 "CLI and Slash Command Sync" to OPERATION-WORKFLOW.md
  - Documents the relationship between CLI code and slash command documentation
  - Provides sync checklist for adding new CLI features
  - Includes example workflow for version detection feature

### Changed
- **Skills**: Update `/check` and `/update` slash commands
  - Document Skills version detection capability
  - Explain where version info is stored for different installation methods

## [3.5.0-beta.13] - 2026-01-13

### Added
- **CLI**: Add OpenCode as skills-compatible tool
  - `uds init` now treats OpenCode like Claude Code for minimal installation
  - `uds check` shows OpenCode skills compatibility status
  - Skills auto-installed to `.claude/skills/` (OpenCode auto-detects this path)
- **Docs**: Add Cross-Tool Compatibility section to skills-mapping.md
  - Path comparison table for 7 AI agents (Claude Code, OpenCode, Cursor, OpenAI Codex, GitHub Copilot, Windsurf, Cline)
  - Explains why UDS uses `.claude/skills/` as default path
  - Cross-tool installation instructions for incompatible tools
- **Docs**: Restructure README with independent Agent Skills Installation section
  - Consolidated skills installation methods in one place
  - Added community marketplaces (n-skills, claude-plugins.dev, agentskills.io)
- **Docs**: Add beta version installation instructions
  - `npm install -g universal-dev-standards@beta`
  - `npx universal-dev-standards@beta init`

### Changed
- **Docs**: Update integrations/opencode/ documentation
  - Version 1.4.0 with cross-tool compatibility info
  - Bilingual translations synced (zh-TW, zh-CN)

## [3.5.0-beta.12] - 2026-01-13

### Added
- **Docs**: Add usage modes comparison documentation
  - Compares Skills Only vs Standards Only vs Both modes
  - Includes feature coverage, token efficiency, and recommendations
  - Bilingual support (English and Traditional Chinese)
  - See `docs/USAGE-MODES-COMPARISON.md`
- **Docs**: Restructure README installation documentation
  - npm CLI as primary installation method
  - AI tool extensions as optional features
  - Complete list of 9 supported AI tools with correct status

### Fixed
- **CLI**: Add missing AI tool detection in detector.js
  - Now detects all 9 AI tools: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Antigravity, Codex, OpenCode, Gemini CLI
  - Fixes auto-detection during `uds init`

## [3.5.0-beta.11] - 2026-01-12

### Added
- **Docs**: Add Feature Availability table to README
  - Clear comparison of stable (3.4.2) vs beta (3.5.x) features
  - Mark experimental features with 🧪 indicator
  - Bilingual support (English and Traditional Chinese)

### Fixed
- **i18n**: Add missing YAML front matter to 6 translation files
  - `docs/CLI-INIT-OPTIONS.md`
  - `skills/claude-code/commands/bdd.md`
  - `skills/claude-code/commands/methodology.md`
  - `skills/claude-code/methodology-system/SKILL.md`
  - `skills/claude-code/methodology-system/create-methodology.md`
  - `skills/claude-code/methodology-system/runtime.md`
- **Docs**: Update stable version reference from 3.3.0 to 3.4.2

## [3.5.0-beta.10] - 2026-01-12

### Added
- **Methodology System**: Add comprehensive development methodology support
  - Built-in methodologies: TDD, BDD, SDD, ATDD
  - YAML-based methodology definitions with JSON Schema validation
  - Phase tracking with checklists and checkpoints
  - Custom methodology template for team-specific workflows
  - `/methodology` command for status, switching, phase management
  - CLI integration: methodology selection in `uds init` and `uds configure`
- **Commands**: Add `/bdd` command for Behavior-Driven Development
  - Full BDD workflow: Discovery → Formulation → Automation → Living Documentation
  - Gherkin format examples and Three Amigos guidance
  - Phase checklists and indicators
- **Commands**: Integrate `/tdd` with methodology system
  - Auto-activates TDD methodology when invoked
  - Shows phase indicators (🔴 RED, 🟢 GREEN, 🔵 REFACTOR)
- **Docs**: Add bilingual documentation for methodology system
  - English and Traditional Chinese translations
  - SKILL.md, runtime.md, create-methodology.md

### Changed
- **Skills**: Update install scripts to include methodology-system (16 skills total)
- **Registry**: Add methodologies section to standards-registry.json

## [3.5.0-beta.9] - 2026-01-11

### Added
- **Scripts**: Add unified pre-release check script
  - `scripts/pre-release-check.sh` for Unix/macOS
  - `scripts/pre-release-check.ps1` for Windows PowerShell
  - Runs all 7 validation checks in a single command
  - Options: `--fail-fast`, `--skip-tests`
- **CI**: Add pre-release validation to GitHub Actions publish workflow
  - Runs version sync, standards sync, linting, and tests before npm publish
  - Prevents publishing if any check fails

### Changed
- **Docs**: Add "Automated Pre-release Check" section to release-workflow.md
- **Docs**: Update CLAUDE.md with pre-release-check.sh in Quick Commands

## [3.5.0-beta.8] - 2026-01-11

### Fixed
- **CLI**: Fix version mismatch in `standards-registry.json`
  - Sync `standards-registry.json` version with `package.json` (was stuck at 3.5.0-beta.5)
  - This caused `uds update` to show outdated "latest version" info

### Changed
- **Release**: Add version sync check to pre-release checklist
  - Added `./scripts/check-version-sync.sh` verification step
  - Prevents future version mismatch issues

## [3.5.0-beta.7] - 2026-01-11

### Fixed
- **CLI**: Fix Windows path separator issue in untracked file detection
  - Normalize path separators to forward slashes in `scanDirectory` function
  - Ensures cross-platform consistency when comparing manifest paths

## [3.5.0-beta.6] - 2026-01-11

### Added
- **Docs**: Add 18 human-readable markdown files for `options/` directory
  - `options/changelog/`: keep-a-changelog.md, auto-generated.md
  - `options/code-review/`: pr-review.md, pair-programming.md, automated-review.md
  - `options/documentation/`: api-docs.md, markdown-docs.md, wiki-style.md
  - `options/project-structure/`: kotlin.md, php.md, ruby.md, rust.md, swift.md
  - `options/testing/`: contract-testing.md, industry-pyramid.md, istqb-framework.md, performance-testing.md, security-testing.md
  - Completes dual-format architecture: `ai/options/*.ai.yaml` for AI tools, `options/*.md` for human developers
- **AI Standards**: Add `ai/standards/test-driven-development.ai.yaml`
  - AI-optimized TDD standards with Red-Green-Refactor cycle
  - FIRST principles and applicability guide
- **Docs**: Add comprehensive CLI init options guide with trilingual support
  - `docs/CLI-INIT-OPTIONS.md` - Complete documentation for all `uds init` options
  - Covers: AI Tools, Skills Location, Standards Scope, Adoption Level, Format, Standard Options, Extensions, Integration Configuration, Content Mode
  - Includes use cases, decision flows, and CLI parameter reference
  - Trilingual: English, Traditional Chinese (`locales/zh-TW/`), Simplified Chinese (`locales/zh-CN/`)
- **Release**: Add CLI documentation to pre-release checklist
  - `release-workflow.md` now includes CLI-INIT-OPTIONS.md verification
- **Release**: Add standards consistency check to pre-release checklist
  - Verify `core/` ↔ `ai/standards/` content alignment
  - Verify `options/` ↔ `ai/options/` dual-format completeness
- **Scripts**: Add automated standards consistency check scripts
  - `scripts/check-standards-sync.sh` for Unix/macOS
  - `scripts/check-standards-sync.ps1` for Windows PowerShell
  - Checks `core/` ↔ `ai/standards/` and `options/` ↔ `ai/options/` consistency

### Changed
- **CLI**: Improve minimal content mode in integration generator
  - Minimal mode now includes simplified standards reference list
  - Ensures AI tools know which standards are available even in minimal mode
  - New `generateMinimalStandardsReference()` function
- **CLI**: Optimize `uds init` prompt messages
  - Unified header format across all prompts
  - Improved terminology: Starter/Professional/Complete (levels), Compact/Detailed (format), Standard (content mode), Lean (standards scope)
  - Enhanced color coding: green for recommended options
  - Simplified post-selection explanations

## [3.5.0-beta.5] - 2026-01-09

### Added
- **CLI**: Enhanced AI tool integration with automatic standards compliance
  - Support 9 AI tools: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Google Antigravity, OpenAI Codex, Gemini CLI, OpenCode
  - New content mode selection: `full`, `index` (recommended), `minimal`
  - Generate Standards Compliance Instructions with MUST/SHOULD priorities
  - Generate Standards Index listing all installed standards
  - Handle `AGENTS.md` sharing between Codex and OpenCode
- **CLI**: Enhanced `uds configure` command
  - New option: AI Tools - Add/Remove AI tool integrations
  - New option: Adoption Level - Change Level 1/2/3
  - New option: Content Mode - Change full/index/minimal
  - Auto-regenerate integration files when settings change
- **CLI**: Enhanced `uds update` command
  - New flag: `--integrations-only` - Only update integration files
  - New flag: `--standards-only` - Only update standard files
  - Auto-sync integration files during standard updates
- **CLI**: Enhanced `uds check` command
  - New section: AI Tool Integration Status
  - Verify integration files exist and reference standards correctly
  - Report missing standards references with fix suggestions
- **Skills**: New `/config` slash command for standards configuration

### Changed
- **CLI**: Integration files now include compliance instructions and standards index by default (index mode)

## [3.5.0-beta.4] - 2026-01-09

### Added
- **CLI**: Reference sync feature for AI integration files
  - `uds check` now shows "Reference Sync Status" section
    - Detects orphaned references (references in integration file but not in manifest)
    - Reports missing references (standards in manifest but not referenced)
  - `uds update --sync-refs` regenerates integration files based on manifest standards
  - New `integrationConfigs` field in manifest to persist generation settings
- **Utils**: New `reference-sync.js` module with category-to-standard mappings

### Changed
- **CLI**: Manifest version upgraded from 3.1.0 to 3.2.0
  - New `integrationConfigs` field stores integration file generation settings
  - Allows `uds update --sync-refs` to regenerate with same options (categories, detailLevel, language)

## [3.5.0-beta.3] - 2026-01-09

### Fixed
- **CLI**: Fix `uds update` showing incorrect version numbers
  - `standards-registry.json` versions were not synchronized with `package.json`
  - Now displays correct current and latest version information

### Added
- **Scripts**: Add version sync check scripts
  - `scripts/check-version-sync.sh` for Unix/macOS
  - `scripts/check-version-sync.ps1` for Windows PowerShell
  - Verifies `standards-registry.json` versions match `package.json`
- **Docs**: Add version sync check to pre-release checklist in `release-workflow.md`

## [3.5.0-beta.2] - 2026-01-09

### Added
- **Integrations**: OpenAI Codex CLI integration with `AGENTS.md`
- **Integrations**: Gemini CLI integration with `GEMINI.md`
- **Integrations**: OpenCode integration with `AGENTS.md`
- **Integrations**: Google Antigravity project-level rules file (`.antigravity/rules.md`)

### Removed
- **CLI**: Remove untracked file scanning from `uds check`
  - `uds check` now only verifies files recorded in manifest
  - No longer prompts to track unknown files in `.standards/` directory

## [3.5.0-beta.1] - 2026-01-09

### Added
- **CLI**: Untracked file detection in `uds check` (removed in 3.5.0-beta.2)

### Changed
- **CLI**: `uds check` now reports "Some issues detected" when untracked files exist (removed in 3.5.0-beta.2)

## [3.4.2] - 2026-01-08

### Fixed
- **Plugin**: Sync version numbers across all configuration files
  - `.claude-plugin/plugin.json`: 3.3.0 → 3.4.2
  - `.claude-plugin/marketplace.json`: 3.3.0 → 3.4.2
  - `.claude-plugin/README.md`: 3.2.0 → 3.4.2
  - `adoption/standards-registry.json`: 3.2.0 → 3.4.2
- **Plugin**: Fix `adoption/standards-registry.json` still referencing deprecated `universal-dev-skills` repo
  - Now correctly points to `skills/claude-code` in main repository

## [3.4.1] - 2026-01-08

### Fixed
- **CLI**: Fix `uds update` suggesting downgrade from newer versions
  - Added proper semantic version comparison with prerelease support (alpha/beta/rc)
  - Now correctly identifies when current version is newer than registry version
  - Shows informative message when user has a newer version than the registry
- **CLI**: Update `standards-registry.json` versions to match package.json

## [3.4.0] - 2026-01-08

### Added
- **CLI**: Hash-based file integrity checking for `uds check`
  - Detects modified files by comparing SHA-256 hashes
  - New options: `--diff`, `--restore`, `--restore-missing`, `--no-interactive`, `--migrate`
  - Interactive mode: prompts for action when issues detected (view diff, restore, keep, skip)
  - Legacy manifest migration: `uds check --migrate` upgrades to hash-based tracking
- **CLI**: File hashes stored in manifest (version 3.1.0)
  - `uds init` computes and stores file hashes at installation
  - `uds update` recomputes hashes after updating files
- **Utils**: New `hasher.js` utility module for SHA-256 file hashing

### Changed
- **CLI**: Manifest version upgraded from 3.0.0 to 3.1.0
  - New `fileHashes` field tracks file integrity
  - Backward compatible with legacy manifests

### Fixed
- **CLI**: Fix `uds check` incorrectly showing "Skills marked as installed but not found" warning
  - Now correctly recognizes Plugin Marketplace installation paths (`~/.claude/plugins/cache/`)
- **CLI**: Fix `uds update` command failing with "undefined" errors
  - Added missing `await` for async `copyStandard()` and `copyIntegration()` calls

## [3.3.0] - 2026-01-08

### Added
- **Skills**: Add 9 slash commands for manual workflow triggers
  - `/commit` - Generate conventional commit messages
  - `/review` - Perform systematic code review
  - `/release` - Guide through release process
  - `/changelog` - Update CHANGELOG.md
  - `/requirement` - Write user stories and requirements
  - `/spec` - Create specification documents
  - `/tdd` - Test-Driven Development workflow
  - `/docs` - Create/update documentation
  - `/coverage` - Analyze test coverage
- **Core**: Add Test-Driven Development (TDD) standard
  - New `core/test-driven-development.md` covering Red-Green-Refactor cycle
  - SDD + TDD integration workflow guidance
- **Skills**: Add `tdd-assistant` skill for Claude Code (skill #15)

### Changed
- **Skills**: Simplify slash command format from `/uds:xxx` to `/xxx`
  - Remove `uds:` namespace prefix for cleaner command invocation
- **Plugin Marketplace**: Rename marketplace from `universal-dev-standards` to `asia-ostrich`
  - New install command: `/plugin install universal-dev-standards@asia-ostrich`

### Fixed
- **CLI**: `uds skills` now prioritizes new `@asia-ostrich` marketplace
- **CLI**: Add `tdd-assistant` to standards-registry.json

### Migration
If you installed via the old marketplace name, please migrate:

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### Added
- **Skills**: Add 9 slash commands for manual workflow triggers
  - `/commit` - Generate conventional commit messages
  - `/review` - Perform systematic code review
  - `/release` - Guide through release process
  - `/changelog` - Update CHANGELOG.md
  - `/requirement` - Write user stories and requirements
  - `/spec` - Create specification documents
  - `/tdd` - Test-Driven Development workflow
  - `/docs` - Create/update documentation
  - `/coverage` - Analyze test coverage
  - Commands vs Skills: Commands are manually triggered (`/command`), Skills are automatic (context-based)

### Fixed
- **CLI**: `uds skills` now prioritizes new `@asia-ostrich` marketplace
  - Adds migration notice when legacy `@universal-dev-standards` marketplace is detected
  - Ensures compatibility during migration period

## [3.3.0-beta.4] - 2026-01-07

### Changed
- **Plugin Marketplace**: Rename marketplace from `universal-dev-standards` to `asia-ostrich`
  - New install command: `/plugin install universal-dev-standards@asia-ostrich`
  - This provides better brand consistency with the AsiaOstrich organization

### Migration
If you installed via the old marketplace name, please migrate:

```bash
# 1. Uninstall old version
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. Install new version
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### Fixed
- **CLI**: Add `tdd-assistant` to standards-registry.json
  - Add skill files list and standard entry for TDD
  - `uds skills` now correctly shows 15/15 skills

## [3.3.0-beta.2] - 2026-01-07

### Added
- **Core**: Add Test-Driven Development (TDD) standard
  - New `core/test-driven-development.md` covering Red-Green-Refactor cycle, FIRST principles, TDD vs BDD vs ATDD
  - SDD + TDD integration workflow guidance
  - ML testing boundaries (model accuracy vs data engineering)
  - Golden Master Testing for legacy systems
- **Skills**: Add `tdd-assistant` skill for Claude Code (skill #15)
  - `skills/claude-code/tdd-assistant/SKILL.md` - TDD workflow guidance
  - `skills/claude-code/tdd-assistant/tdd-workflow.md` - Step-by-step TDD process
  - `skills/claude-code/tdd-assistant/language-examples.md` - 6 language examples (JS/TS, Python, C#, Go, Java, Ruby)
  - Complete zh-TW translations for all TDD files

### Changed
- **Core Standards**: Update cross-references in related standards
  - `spec-driven-development.md` - Add TDD integration reference
  - `testing-standards.md` - Add TDD cross-reference
  - `test-completeness-dimensions.md` - Add TDD cross-reference
- **Release Workflow**: Expand pre-release checklist with comprehensive file verification
  - Add Version Files Checklist with all version-related files
  - Rename to Documentation Verification Checklist with accuracy verification
  - Add Content Accuracy Verification section with grep commands
  - Use `locales/*` pattern for all locale files

## [3.2.2] - 2026-01-06

### Added
- **CLI**: Add `uds skills` command to list installed Claude Code skills
  - Shows installations from Plugin Marketplace, user-level, and project-level
  - Displays version, path, and skill count for each installation
  - Warns about deprecated manual installations
- **CLI**: Improve Skills update instructions based on installation location

### Deprecated
- **Skills**: Manual installation via `install.sh` / `install.ps1` is now deprecated
  - Recommended: Use Plugin Marketplace for automatic updates
  - Scripts will show deprecation warning and prompt for confirmation
  - Will be removed in a future major version

### Changed
- **CLI**: `uds update` now shows deprecation warning for manual Skills installations
  - Recommends migration to Plugin Marketplace
- **Skills**: Update README.md to mark manual installation as deprecated

### Fixed
- **CLI**: Update standards-registry version to 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### Added
- **CLI**: Improve Skills update instructions based on installation location
  - Marketplace: Guide to update via Plugin Marketplace UI
  - User-level: `cd ~/.claude/skills/... && git pull`
  - Project-level: `cd .claude/skills/... && git pull`

### Fixed
- **CLI**: Update standards-registry version to 3.2.2
  - Enables `uds update` to detect new versions for existing projects

## [3.2.2-beta.1] - 2026-01-05

### Added
- **Skills**: Add Release Workflow Guide for comprehensive release process
  - New `skills/claude-code/release-standards/release-workflow.md` with step-by-step release instructions
  - Covers beta, alpha, rc, and stable release workflows
  - Includes npm dist-tag strategy, troubleshooting, and AI assistant guidelines
  - Add Release Process section in CLAUDE.md for AI assistants
- **CLI**: Add conversation language setting to AI tool integrations
  - All AI tool integration files now include conversation language directive
  - Supports English, Traditional Chinese, and Bilingual modes
  - Generates CLAUDE.md for Claude Code users with language setting
- **CLI**: Add comprehensive tests for prompts and utils modules
  - Test coverage improved from 42.78% to 72.7%
  - Total tests increased from 94 to 210

### Fixed
- **CLI**: Only prompt Skills when Claude Code is the only selected AI tool
  - Fixes bug where selecting multiple AI tools with Skills could cause other tools to miss full standards
- **CI/CD**: Fix npm publish workflow to correctly tag beta/alpha/rc versions
  - Add automatic version detection in `.github/workflows/publish.yml`
  - Beta versions now publish with `@beta` tag instead of `@latest`
  - Users can now install beta versions with `npm install -g universal-dev-standards@beta`

### Changed
- **Core Standards**: Add industry reference standards to 5 core documents
  - `error-code-standards.md` v1.0.0 → v1.1.0: RFC 7807, RFC 9457, HTTP Status Codes
  - `logging-standards.md` v1.0.0 → v1.1.0: OWASP Logging, RFC 5424, OpenTelemetry, 12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0: SWEBOK v4.0 Ch.10 (Software Quality)
  - `checkin-standards.md` v1.2.5 → v1.3.0: SWEBOK v4.0 Ch.6 (Configuration Management)
  - `spec-driven-development.md` v1.1.0 → v1.2.0: IEEE 830-1998, SWEBOK v4.0 Ch.1 (Requirements)
- **Testing Standards**: Add SWEBOK v4.0 reference and new sections
  - `testing-standards.md` v2.0.0 → v2.1.0: Testing Fundamentals, Test-Related Measures, Pairwise/Data Flow Testing
- **Documentation**: Update MAINTENANCE.md with npm dist-tag strategy
  - Add dist-tag table for different version patterns
  - Add manual tag correction commands

## [3.2.1-beta.1] - 2026-01-02

### Added
- **CLI**: Add Plugin Marketplace support to Skills installation flow
  - New "Plugin Marketplace (Recommended)" option in Skills installation prompt
  - CLI tracks marketplace-installed Skills in manifest without attempting local installation
  - `uds check` command now displays marketplace installation status

### Fixed
- **CLI**: Fix wildcard path handling in standards registry causing 404 errors
  - Replace `templates/requirement-*.md` wildcard with explicit file paths
  - Add explicit entries for requirement-checklist.md, requirement-template.md, requirement-document-template.md
- **CLI**: Fix process hanging after `uds init`, `uds configure`, and `uds update` commands
  - Add explicit `process.exit(0)` to prevent inquirer readline interface from blocking termination

## [3.2.0] - 2026-01-02

### Added
- **Claude Code Plugin Marketplace Support**: Enable distribution via Plugin Marketplace
  - Add `.claude-plugin/plugin.json` - Plugin manifest with metadata
  - Add `.claude-plugin/marketplace.json` - Marketplace configuration for plugin distribution
  - Add `.claude-plugin/README.md` - Plugin documentation and maintenance guide
  - Update `skills/claude-code/README.md` with Method 1: Marketplace Installation (Recommended)

### Benefits
- Users can install all 14 skills with a single command: `/plugin install universal-dev-standards@universal-dev-standards`
- Automatic updates when new versions are released
- Better discoverability through Claude Code marketplace
- Maintains backward compatibility with script installation (Method 2 and 3)

### Changed
- Add conversation language requirement (Traditional Chinese) to `CLAUDE.md` for AI assistants

### Fixed
- Fix CLI version reading to use `package.json` instead of hardcoded value

## [3.1.0] - 2025-12-30

### Added
- **Simplified Chinese (zh-CN) Translation**: Complete localization for Simplified Chinese users
  - Add `locales/zh-CN/README.md` - Full README translation
  - Add `locales/zh-CN/CLAUDE.md` - Project guidelines translation
  - Add `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows guide translation
- Add language switcher links across all README versions (EN, zh-TW, zh-CN)

- **Full Windows Support**: Complete cross-platform compatibility for Windows users
  - Add `.gitattributes` for consistent line endings across platforms
  - Add `scripts/check-translation-sync.ps1` - PowerShell version of translation checker
  - Add `skills/claude-code/install.ps1` - PowerShell version of skills installer
  - Add `scripts/setup-husky.js` - Cross-platform Husky setup script
  - Add `docs/WINDOWS-GUIDE.md` - Comprehensive Windows development guide
- **5 New Claude Code Skills**: Expand skill library from 9 to 14 skills
  - `spec-driven-dev` - SDD workflow guidance (triggers: spec, proposal)
  - `test-coverage-assistant` - 7-dimension test completeness framework (triggers: test coverage, dimensions)
  - `changelog-guide` - Changelog writing standards (triggers: changelog, release notes)
  - `error-code-guide` - Error code design patterns (triggers: error code)
  - `logging-guide` - Structured logging standards (triggers: logging, log level)
- Add **Hybrid Standards** category to `STATIC-DYNAMIC-GUIDE.md` - Standards with both static and dynamic components
- Add **Dynamic vs Static Classification** section to `MAINTENANCE.md` - Guidelines for categorizing standards
- Add `checkin-standards` core rules to `CLAUDE.md` as static standard
- Add complete zh-TW translations for all 5 new skills (10 files total)

### Changed
- Update `cli/package.json` prepare script to use cross-platform `setup-husky.js`
- Update `README.md`, `cli/README.md`, `CLAUDE.md` with Windows installation instructions
- Update `STATIC-DYNAMIC-GUIDE.md` to v1.1.0 - Introduce Hybrid Standards concept, update to 14 skills
- Update `MAINTENANCE.md` - Add cross-reference to `STATIC-DYNAMIC-GUIDE.md`, expand Workflow 4 with classification checklist
- Update skills table in `MAINTENANCE.md` from 9 to 14 skills (35 skill files + 10 shared/README = 45 files)
- Sync zh-TW translations for `MAINTENANCE.md` and `STATIC-DYNAMIC-GUIDE.md`

## [3.0.0] - 2025-12-30

### Added
- **AI-Optimized Standards Architecture**: Add dual-format support with `.ai.yaml` files
- Add `ai/standards/` directory with 15 AI-optimized standard files
- Add `ai/options/` directory with language-specific and workflow options
- Add `MAINTENANCE.md` - Project maintenance guide with file structure overview
- Add `ai/MAINTENANCE.md` - AI standards maintenance workflow guide
- Add `STANDARDS-MAPPING.md` - Standards to skills mapping matrix
- Add 6 new AI-optimized standards:
  - `anti-hallucination.ai.yaml` - AI collaboration standards
  - `checkin-standards.ai.yaml` - Code check-in standards
  - `documentation-writing-standards.ai.yaml` - Documentation writing guide
  - `spec-driven-development.ai.yaml` - SDD workflow
  - `test-completeness-dimensions.ai.yaml` - 7-dimension test framework
  - `versioning.ai.yaml` - Semantic versioning standards
- Add complete zh-TW translations for all new standards and skills (78 files total)

### Changed
- Standardize version format in core standards to `**Version**: x.x.x`
- Add `source` field to all zh-TW translation YAML front matter for sync tracking
- Update translation sync script with improved validation

### Fixed
- Fix version format inconsistency in `core/error-code-standards.md` and `core/logging-standards.md`
- Fix source paths in zh-TW skills translations

## [2.3.0] - 2025-12-25

### Added
- **Multilingual Support**: Add `locales/` directory structure for internationalization
- Add Traditional Chinese (zh-TW) translations for all documentation (44 files)
  - `locales/zh-TW/core/` - 13 core standard translations
  - `locales/zh-TW/skills/claude-code/` - 25 skill file translations
  - `locales/zh-TW/adoption/` - 5 adoption guide translations
  - `locales/zh-TW/README.md` - Complete Chinese README
- Add language switcher to all English documentation files
- Add `scripts/check-translation-sync.sh` - Translation synchronization checker
- Add Static vs Dynamic standards classification to Skills documentation
- Add `templates/CLAUDE.md.template` - Ready-to-use template for static standards
- Add `adoption/STATIC-DYNAMIC-GUIDE.md` - Detailed classification guide

### Changed
- Separate bilingual content into dedicated language files (~50% token reduction for AI tools)
- English versions now contain English-only content with language switcher
- Update `skills/claude-code/README.md` - Add Static vs Dynamic section with trigger keywords

## [2.2.0] - 2025-12-24

### Added
- Add standard sections to all Skills documentation (23 files)
  - 8 SKILL.md files: Added Purpose, Related Standards, Version History, License sections
  - 15 supporting docs: Added bilingual titles, metadata, and standard sections

### Changed
- Align Skills documentation format with Core standards
- Add cross-references between Skills and Core documents

## [2.1.0] - 2025-12-24

### Added
- **Integrated Skills**: Merge `universal-dev-skills` into `skills/` directory
- Add `skills/claude-code/` - All Claude Code Skills now included in main repo
- Add `skills/_shared/` - Shared templates for multi-AI tool support
- Add placeholder directories for future AI tools: `skills/cursor/`, `skills/windsurf/`, `skills/cline/`, `skills/copilot/`

### Changed
- CLI now installs skills from local `skills/claude-code/` instead of fetching from remote repository
- Update `standards-registry.json` to reflect integrated skills architecture

### Migration Guide
- If you previously used `universal-dev-skills` separately, you can now use the skills included in this repo
- Run `cd skills/claude-code && ./install.sh` to reinstall skills from the integrated location

## [2.0.0] - 2025-12-24

### Changed

**BREAKING CHANGE**: Project renamed from `universal-doc-standards` to `universal-dev-standards`

This reflects the project's expanded scope covering all development standards, not just documentation.

#### Migration Guide

- Re-clone from the new repository: `git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- Re-run `npm link` in the CLI directory if using global installation
- Use `npx universal-dev-standards` instead of `npx universal-doc-standards`
- The `uds` command remains unchanged

### Added
- Add `extensions/languages/php-style.md` - PHP 8.1+ coding style guide based on PSR-12
- Add `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ development patterns

## [1.3.1] - 2025-12-19

### Added
- Add Mock Limitations section to `testing-standards.md` - Guidelines for when mocks require integration tests
- Add Test Data Management patterns to `testing-standards.md` - Distinct identifiers and composite key guidelines
- Add "When Integration Tests Are Required" table to `testing-standards.md` - 6 scenarios requiring integration tests

## [1.3.0] - 2025-12-16

### Added
- Add `changelog-standards.md` - Comprehensive changelog writing guide
- Add decision tree and selection matrix to `git-workflow.md` for workflow strategy selection
- Add language selection guide to `commit-message-guide.md` for choosing commit message language

### Changed
- Update `versioning.md` - Add cross-reference to changelog-standards.md
- Update `git-workflow.md` - Add CHANGELOG update guidance in release preparation
- Update `zh-tw.md` - Add terminology for Changelog, Release Notes, Breaking Change, Deprecate, Semantic Versioning
- Update `changelog-standards.md` - Align exclusion rules with versioning.md, add cross-reference
- Update `checkin-standards.md` - Clarify CHANGELOG updates apply to user-facing changes only
- Update `code-review-checklist.md` - Align CHANGELOG section with changelog-standards.md

### Fixed
- Fix inconsistent header format in `commit-message-guide.md` and `documentation-writing-standards.md`
- Standardize cross-references to use markdown link format instead of backticks

## [1.2.0] - 2025-12-11

### Added
- Add `project-structure.md` - Project directory conventions
- Add Physical DFD layer to `documentation-structure.md`

### Changed
- Update `documentation-structure.md` - Clarify flows/diagrams separation, improve file naming conventions
- Update `checkin-standards.md` - Add directory hygiene guidelines
- Improve universality by replacing project-specific examples with generic placeholders

## [1.1.0] - 2025-12-05

### Added
- Add `testing-standards.md` - Comprehensive testing pyramid (UT/IT/ST/E2E)
- Add `documentation-writing-standards.md` - Documentation content requirements

### Changed
- Update `anti-hallucination.md` - Enhance source attribution guidelines
- Update `zh-tw.md` - Sync with commit-message-guide.md v1.2.0

## [1.0.0] - 2025-11-12

### Added
- Initial release with core standards
- Core standards: `anti-hallucination.md`, `checkin-standards.md`, `commit-message-guide.md`, `git-workflow.md`, `code-review-checklist.md`, `versioning.md`, `documentation-structure.md`
- Extensions: `csharp-style.md`, `zh-tw.md`
- Templates: Requirement document templates
- Integrations: OpenSpec framework

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.4.0...HEAD
[3.4.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.3.0...v3.4.0
[3.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
