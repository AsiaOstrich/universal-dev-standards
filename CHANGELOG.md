# Changelog

> **Language**: English | [繁體中文](locales/zh-TW/CHANGELOG.md) | [简体中文](locales/zh-CN/CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [3.5.1-beta.22] - 2026-01-19

### Added
- **CLI**: New `--debug` flag for `uds update` command
  - Shows detailed debug output for Skills/Commands detection
  - Helps diagnose why certain AI tools may not appear in installation prompts
  - Outputs: aiTools list, declined features, config checks, installation status

## [3.5.1-beta.21] - 2026-01-19

### Fixed
- **CLI**: Skills installation now works correctly with `--skills-location` option
  - Bug fix: Changed property name from `location` to `level` to match `installSkillsToMultipleAgents` API
  - Previously reported success but no files were created

## [3.5.1-beta.20] - 2026-01-19

### Added
- **CLI**: New `--skills-location` option for `uds configure` command
  - Allows specifying Skills installation level (project/user) in non-interactive mode
  - Example: `uds configure --type skills --ai-tool opencode --skills-location user`

### Changed
- **Commands**: `/update` Step 4 rewritten with multi-stage AskUserQuestion flow
  - Step 4a: Detect missing Skills
  - Step 4b: Ask which AI tools to install (multiSelect)
  - Step 4c: Ask installation location (project/user)
  - Step 4d-e: Similar flow for Commands
  - Addresses AskUserQuestion option limit (max 4) constraint

### Documentation
- **Commands**: `/config` command updated with `--skills-location` option examples

## [3.5.1-beta.19] - 2026-01-19

### Fixed
- **Skills**: Sync slash commands with CLI behavior
  - `/update`: Add declined features handling, outdated Skills update flow, project/user level selection, checkbox multi-select interface
  - `/init`: Align step order with CLI (AI Tools → Skills → Commands → ...), expand to 9 AI tools, add missing configuration steps
  - `/config`: Add skills/commands config types, `--ai-tool` option for non-interactive installation, declined features handling
  - `/check`: Add Interactive mode documentation, Skills/Commands integrity checks, remove obsolete manual verification steps

## [3.5.1-beta.18] - 2026-01-19

### Added
- **CLI**: Remember declined Skills/Commands choices
  - New `declinedFeatures` field in manifest stores declined items
  - `uds update` excludes previously declined Skills/Commands from prompts
  - `uds configure` shows declined items with option to reinstall
  - Supports both Skills and Commands tracking independently
- **CLI**: Dynamic Marketplace installation detection
  - `uds check` dynamically detects Marketplace Skills regardless of manifest
  - `uds configure` shows Marketplace status in Skills configuration
  - `uds update` shows "(already via Marketplace)" hint for Claude Code
  - Default unchecked for file-based installation when Marketplace detected
  - Adds coexistence note: file-based and Marketplace can work together

## [3.5.1-beta.17] - 2026-01-18

### Added
- **CLI**: Smart apply feature for `uds config` command
  - Auto-prompts to regenerate integration files after config changes
  - New `--yes` flag for non-interactive config changes
  - Extracted `regenerateIntegrations()` as reusable function from update.js
- **CLI**: Auto-sync mechanism for E2E test specification
  - New `npm run generate:e2e-spec` script generates E2E-TEST-CASES.md from test files
  - `--check` mode for CI verification that spec is up-to-date
  - Parses test files to extract describe/it blocks and CLI options
- **CLI**: Enhanced file tracking system for Skills, Commands, and Integration blocks
  - New `skillHashes` field in manifest tracks individual skill file integrity
  - New `commandHashes` field in manifest tracks slash command file integrity
  - New `integrationBlockHashes` field tracks UDS marker block content separately from user customizations
  - `uds check` now verifies integrity of Skills, Commands, and Integration UDS blocks
  - Users can modify content outside UDS markers without triggering warnings
- **Utils**: New hash computation functions in `hasher.js`
  - `computeIntegrationBlockHash()`: Computes hash for UDS marker block content only
  - `compareIntegrationBlockHash()`: Compares block hash, detects if markers removed
  - `computeDirectoryHashes()`: Recursively computes hashes for all files in directory
- **Tests**: Comprehensive E2E test coverage
  - 73 E2E tests across 6 commands (init, config, check, update, list, skills)
  - E2E-TEST-CASES.md specification document with option coverage matrix

### Changed
- **CLI**: Manifest version upgraded to `3.3.0` to mark enhanced file tracking feature
- **CLI**: `writeIntegrationFile()` now returns `blockHashInfo` with UDS block hash
- **CLI**: `installSkillsForAgent()` and `installCommandsForAgent()` now return `fileHashes`
- **CLI**: `installSkillsToMultipleAgents()` and `installCommandsToMultipleAgents()` aggregate hashes in `allFileHashes`

### Fixed
- **CLI**: Integration file path now returns relative path for manifest consistency
- **CLI**: `uds check` now tracks all installed standards correctly

## [3.5.1-beta.16] - 2026-01-16

### Added
- **Commands**: Add Skills verification diagnostics to `/check` command
  - Shows actual directory contents for each AI tool
  - Helps identify false positives in Skills installation reporting
  - Add `Bash(ls:*)` to allowed-tools

### Fixed
- **Commands**: `/update` now shows specific version type (Alpha/Beta/RC)
  - Option displays "更新至 Beta" instead of generic "更新至 Pre-release"
  - Includes stability indicators (🔴🟡🟢) in descriptions

## [3.5.1-beta.15] - 2026-01-16

### Added
- **Commands**: Add pre-release version types explanation to `/update` command
  - New section explains alpha, beta, rc stability levels (🔴🟡🟢)
  - Includes version comparison: `alpha < beta < rc < stable`
  - Links to `core/versioning.md` for detailed standards

## [3.5.1-beta.14] - 2026-01-16

### Fixed
- **Commands**: `/update` now shows correct version type in AskUserQuestion
  - Stable versions show "latest stable version X.Y.Z"
  - Pre-release versions show "pre-release version X.Y.Z-tag.N"
  - Fixes misleading "stable version 3.5.1-beta.13" description

## [3.5.1-beta.13] - 2026-01-16

### Changed
- **Commands**: Slash commands now use `AskUserQuestion` for interactive prompts
  - `/update` Step 4: Asks user to select Skills/Commands installation options
  - `/init` Step 3: Asks user to select AI tools for Skills/Commands installation
  - Design principle: "CLI prompts should be mirrored in slash commands"

### Added
- **CLI**: New `--ai-tool` option for `uds configure` command
  - Enables non-interactive Skills/Commands installation for specific tools
  - Usage: `uds configure --type skills --ai-tool claude-code`
  - Supports: claude-code, opencode, copilot, gemini-cli, roo-code, cursor, windsurf, cline, codex

## [3.5.1-beta.12] - 2026-01-16

### Changed
- **Commands**: Update `/update` command documentation
  - Reflects CLI's automatic Skills/Commands installation in Step 4
  - Adds `uds configure` to allowed-tools for non-TTY fallback
  - Documents checkbox multi-select interface for AI tool selection
  - Provides `uds configure` commands for non-TTY environments

## [3.5.1-beta.11] - 2026-01-16

### Changed
- **CLI**: `check` command is now read-only
  - No longer prompts to install missing Skills/Commands
  - Shows hint: "Run `uds update` to install missing Skills/Commands"
  - Follows single responsibility principle: check reports, update installs

### Removed
- **CLI**: Removed installation prompt from `check` command
  - `promptSkillsCommandsInstallation()` function removed
  - Unused imports cleaned up

## [3.5.1-beta.10] - 2026-01-16

### Fixed
- **Commands**: Quote `argument-hint` values in YAML frontmatter
  - Fixes YAML parsing error in OpenCode and other strict YAML parsers
  - Square brackets in values now properly quoted
  - Affected 16 command files
- **CLI**: Add TTY check before showing interactive prompts in check command
  - Prevents "ERR_USE_AFTER_CLOSE: readline was closed" error
  - Check command now only prompts when stdin/stdout are TTY
  - Fixes crash when running from non-interactive environments (e.g., Claude Code skills)

## [3.5.1-beta.9] - 2026-01-16

### Changed
- **CLI**: Skills/Commands installation now uses checkbox multi-select instead of yes/no
  - `uds update`: Users can now select specific AI tools to install Skills/Commands for
  - `uds check`: Added installation prompt for missing Skills/Commands after status display
  - All options default to checked (opt-out behavior)
  - Skip option available with validation

### Added
- **i18n**: New message keys for checkbox prompts in English, Traditional Chinese, and Simplified Chinese
  - `selectSkillsToInstall`, `selectCommandsToInstall`
  - `skipSkillsInstallation`, `skipCommandsInstallation`
  - `skipValidationError`

## [3.5.1-beta.8] - 2026-01-16

### Fixed
- **CLI**: Empty skills directory no longer detected as installed
  - `getInstalledSkillsInfoForAgent` now checks for actual `SKILL.md` files
  - `uds update` Step 4 correctly prompts to install Skills for OpenCode, GitHub Copilot, etc.
  - Resolves issue where empty `.claude/skills/`, `.github/skills/`, `.opencode/skills/` directories were falsely reported as having skills installed

### Added
- **Tests**: 2 new unit tests for empty directory detection
  - Tests empty skills directory returns `null`
  - Tests skills directory with empty subdirectories returns `null`

## [3.5.1-beta.7] - 2026-01-16

### Fixed
- **CLI**: Non-interactive mode (`--yes`) now correctly saves configuration to manifest
  - `aiTools` field now populated with detected AI tools (was empty `[]`)
  - `options` field now saves workflow, merge strategy, commit language, test levels (was all `null`)
  - Commands auto-installed for agents that support file-based commands (opencode, copilot, etc.)

### Added
- **Docs**: Testing Workflow section in CLAUDE.md
  - Documents when to run tests (development, pre-commit, pre-PR, CI/CD)
  - Lists git hook automated checks
  - Provides manual testing command reference
- **Tests**: 11 new tests for non-interactive mode bug fixes
  - 8 unit tests in `init.test.js`
  - 3 E2E tests in `init-flow.test.js`

## [3.5.1-beta.6] - 2026-01-16

### Fixed
- **CLI**: Skills and Commands now properly bundled in npm package
  - Added `skills/claude-code/` to `prepack.mjs` bundle directories
  - `skills-installer.js` now prioritizes bundled path over development path
  - Resolves issue where "Installed commands for X AI tools" showed success but directories were empty
- **CLI**: Registered `--skills` and `--commands` options in update command
  - Options were implemented in code but not exposed to users
  - `uds update --skills` and `uds update --commands` now work correctly

## [3.5.1-beta.5] - 2026-01-16

### Changed
- **Skills**: `/update` slash command now prompts for Skills/Commands installation
  - Added Step 4 to check if Skills/Commands are installed after update
  - Uses AskUserQuestion to prompt user for installation
  - Ensures consistent behavior with CLI interactive mode

## [3.5.1-beta.4] - 2026-01-16

### Added
- **CLI**: New feature detection during update
  - `uds update` now detects AI tools in manifest that haven't installed Skills/Commands
  - Interactive mode prompts users to install missing features
  - `--yes` mode shows a hint instead of auto-installing (conservative behavior)
  - Supports all skills-compatible tools: Claude Code, OpenCode, Cursor, Copilot, etc.

## [3.5.1-beta.3] - 2026-01-16

### Fixed
- **CLI**: npm package now bundles standard files
  - Added `prepack` script to bundle `core/` and `locales/` directories
  - New `getSourcePath()` function prioritizes bundled files over GitHub download
  - Resolves 404 errors when updating standards via npm-installed CLI
  - Improved error messages for file download failures

## [3.5.1-beta.2] - 2026-01-16

### Added
- **Scripts**: Documentation sync check for pre-release
  - New `check-docs-sync.sh/.ps1` scripts
  - Validates CHANGELOG.md has entry for current version
  - Verifies version sync in plugin.json, marketplace.json, README.md
  - Provides reminder list for docs that may need updating
  - Pre-release check now runs 8 checks (7 with --skip-tests)

### Removed
- **Skills**: Deprecated installation scripts
  - Removed `skills/claude-code/install.sh` and `install.ps1`
  - Removed `scripts/check-install-scripts-sync.sh` and `.ps1`
  - Plugin Marketplace is now the primary installation method

### Changed
- **Docs**: Updated all documentation to use Plugin Marketplace installation
  - Updated README.md (en, zh-TW, zh-CN)
  - Updated all adoption guides and checklists
  - Updated skills README files

## [3.5.1-beta.1] - 2026-01-15

### Added
- **CLI**: Multi-Agent Skills Installation
  - Support installing Skills to multiple AI agents simultaneously
  - Checkbox selection for target agents (Claude Code, OpenCode, Cline, Roo Code, etc.)
  - User-level and project-level installation paths for each agent
- **CLI**: Gemini CLI TOML Command Conversion
  - Auto-convert markdown commands to TOML format for Gemini CLI
  - Support `{{args}}` placeholder for command arguments
  - Proper TOML string escaping
- **CLI**: Slash Commands Installation
  - Install commands to agents that support them (OpenCode, Roo Code, Copilot, Gemini CLI)
  - `uds update --skills` and `uds update --commands` options
- **CLI**: Centralized AI Agent Path Configuration
  - New `src/config/ai-agent-paths.js` module
  - Unified path management for all 10 supported AI agents
- **Tests**: Comprehensive unit tests
  - `ai-agent-paths.test.js` (29 tests)
  - `skills-installer.test.js` (23 tests)
  - Total: 400 tests passing

### Changed
- **Docs**: Updated AI-AGENT-ROADMAP.md to v2.2.0
  - Added Multi-Agent Installation and Gemini CLI TOML to Feature Enhancement Roadmap
- **Docs**: Updated CLI-INIT-OPTIONS.md to v3.5.1
  - New multi-agent Skills installation section
  - Updated Skills paths table for all agents
- **Docs**: Updated README.md
  - New AI Tool Extensions table with Skills and Commands columns
  - Added Multi-Agent Skills and Gemini CLI TOML to What's New

## [3.5.0] - 2026-01-15

### Added
- **i18n**: Complete internationalization support
  - Simplified Chinese (zh-CN) localization for all 18 core standards, 20+ skills, adoption guides
  - CLI i18n: `--ui-lang` option (`en`, `zh-tw`, `zh-cn`, `auto`)
  - All 6 CLI commands and 8 interactive prompts support 3 languages
  - Environment variable detection (`LANG`, `LC_ALL`)
- **Methodology System** `[Experimental]`: Development methodology support
  - Built-in methodologies: TDD, BDD, SDD, ATDD
  - YAML-based definitions with JSON Schema validation
  - `/methodology`, `/tdd`, `/bdd` commands with phase tracking
  - CLI integration in `uds init` and `uds configure` (requires `-E` flag)
- **CLI**: Enhanced AI tool integration
  - Support 9 AI tools: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Google Antigravity, OpenAI Codex, Gemini CLI, OpenCode
  - Content mode selection: `full`, `index` (recommended), `minimal`
  - Auto-generate Standards Compliance Instructions and Standards Index
- **CLI**: Enhanced commands
  - `uds configure`: AI Tools, Adoption Level, Content Mode options
  - `uds update`: `--integrations-only`, `--standards-only`, `--sync-refs`, `--beta` flags
  - `uds check`: AI Tool Integration Status, Reference Sync Status, Marketplace Skills version detection
  - `uds init/configure`: `-E, --experimental` flag for experimental features
- **Skills**: New `/config` slash command for standards configuration
- **Skills**: Interactive mode with AskUserQuestion for `/init`, `/config`, `/update`
- **Core**: New `ai-instruction-standards.md` (18th core standard)
- **Docs**: Windows PowerShell support for all adoption guides (33 files)
- **Docs**: Comprehensive CLI init options guide (`docs/CLI-INIT-OPTIONS.md`)
- **Docs**: Usage modes comparison (`docs/USAGE-MODES-COMPARISON.md`)
- **Docs**: 18 human-readable markdown files for `options/` directory
- **Docs**: LOCALIZATION-ROADMAP.md for future 10-language expansion
- **Scripts**: Unified pre-release check (`scripts/pre-release-check.sh`)
- **Scripts**: Standards consistency check (`scripts/check-standards-sync.sh`)
- **Scripts**: Version sync check (`scripts/check-version-sync.sh`)
- **CI**: Pre-release validation in GitHub Actions publish workflow

### Changed
- **CLI**: Manifest version upgraded to 3.2.0
  - New `fileHashes` field for integrity checking
  - New `integrationConfigs` field for integration settings
- **CLI**: Improved interactive prompt descriptions with bilingual support
- **CLI**: Integration files use index mode by default
- **Skills**: Slash command descriptions simplified to English-only
- **Skills**: Update install scripts to include methodology-system (16 skills total)

### Fixed
- **CLI**: Windows path separator issue in untracked file detection
- **CLI**: `require()` error in ES Module (init.js)
- **CLI**: Skills version detection showing stale version
- **CLI**: Version mismatch in `standards-registry.json`
- **CLI**: Missing AI tool detection (now detects all 9 tools)
- **CLI**: Registry references for `.ai.yaml` files in Compact format

### Removed
- **CLI**: Untracked file scanning from `uds check`

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
