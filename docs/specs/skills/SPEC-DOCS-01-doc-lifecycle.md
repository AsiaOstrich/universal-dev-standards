# SPEC-DOCS-01: Documentation Lifecycle Automation

## Overview

Establish a closed-loop documentation lifecycle by enhancing the `sync-updates` auto-behavior to suggest actionable commands, and adding two new `/docs` subcommands (`impact`, `translate`) to cover the full documentation lifecycle: detect → update → translate.

建立文件生命週期閉環：強化 `sync-updates` 自動提醒（附建議命令），新增 `/docs impact`（主動影響分析）和 `/docs translate`（翻譯同步）子命令。

## Motivation

### Problem

1. The `sync-updates` rule in `documentation-writing-standards` was a passive guideline — AI did not automatically check documentation impact after code changes
2. Even when reminded, users had no guidance on *which command* to run for each affected document
3. No way to proactively analyze documentation impact (only reactive auto-trigger)
4. Translation sync relied solely on shell scripts (`check-translation-sync.sh`) with no AI-assisted workflow

### Solution

A three-part enhancement that creates a closed-loop:

```
Code Changes → sync-updates (auto reminder + command suggestions)
                     ↓
         /docs impact (manual trigger)
                     ↓
    /docs readme | /docs api | /docs generate | /docs translate
                     ↓
              Documentation stays current ✅
```

## Status

- **Status**: Archived
- **Created**: 2026-03-25
- **Spec Type**: Retroactive (features already implemented, spec created for traceability)

## Requirements

### Requirement 1: Automatic Documentation Impact Reminder with Command Suggestions

The `sync-updates` rule in `documentation-writing-standards.ai.yaml` SHALL automatically trigger after any code modification task and SHALL include suggested commands for each affected document.

#### Scenario: Code change affects README

- **GIVEN** the AI has completed modifying CLI option definitions
- **WHEN** the sync-updates check runs automatically
- **THEN** the reminder block SHALL list `README.md` with `→ /docs readme` as the suggested command

#### Scenario: Code change affects translation source

- **GIVEN** the AI has modified `docs/CLI-INIT-OPTIONS.md`
- **WHEN** the sync-updates check detects a corresponding `locales/zh-TW/docs/CLI-INIT-OPTIONS.md`
- **THEN** the reminder SHALL suggest `→ /docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW`

#### Scenario: No documentation affected

- **GIVEN** the AI has made an internal refactoring with no public API changes
- **WHEN** the sync-updates check finds no affected documents
- **THEN** the reminder block SHALL be silently skipped (no output)

#### Scenario: Multiple documents affected

- **GIVEN** the AI has modified multiple files affecting various documents
- **WHEN** the reminder lists more than 2 affected documents
- **THEN** the reminder SHALL also suggest `Or run /docs impact for a full analysis.`

### Requirement 2: `/docs impact` Subcommand

The `/docs impact` command SHALL provide on-demand documentation impact analysis based on git changes.

#### Scenario: Analyze uncommitted changes (default)

- **GIVEN** the user has uncommitted code changes
- **WHEN** the user runs `/docs impact`
- **THEN** the system SHALL analyze all uncommitted changes and list affected documents with suggested commands

#### Scenario: Analyze staged changes only

- **GIVEN** the user has staged some changes with `git add`
- **WHEN** the user runs `/docs impact --staged`
- **THEN** the system SHALL only analyze staged changes (not unstaged)

#### Scenario: Analyze specific commit

- **GIVEN** the user wants to check impact of a past commit
- **WHEN** the user runs `/docs impact --commit abc123`
- **THEN** the system SHALL analyze changes from that commit

#### Scenario: No changes detected

- **GIVEN** the working directory is clean with no changes
- **WHEN** the user runs `/docs impact`
- **THEN** the system SHALL inform the user that no changes were detected

### Requirement 3: `/docs translate` Subcommand

The `/docs translate` command SHALL manage translation sync status and provide AI-assisted translation.

#### Scenario: Show translation status (default)

- **GIVEN** the project has a `locales/` directory with translations
- **WHEN** the user runs `/docs translate`
- **THEN** the system SHALL display a status table showing each translation file as ✅ current, ⚠️ outdated, or ❌ missing

#### Scenario: Check-only mode

- **GIVEN** the user wants to verify translation status without changes
- **WHEN** the user runs `/docs translate --check`
- **THEN** the system SHALL display the status table and exit without modifying any files

#### Scenario: Translate specific file

- **GIVEN** a source file `docs/CLI-INIT-OPTIONS.md` has been updated
- **WHEN** the user runs `/docs translate docs/CLI-INIT-OPTIONS.md --lang zh-TW`
- **THEN** the system SHALL read the source file and existing translation, generate an updated translation, and present it for user confirmation before writing

#### Scenario: Translate all outdated files

- **GIVEN** multiple translation files are outdated
- **WHEN** the user runs `/docs translate --all --lang zh-TW`
- **THEN** the system SHALL process each outdated file sequentially, stopping for confirmation after each

#### Scenario: No locales directory

- **GIVEN** the project has no `locales/` directory
- **WHEN** the user runs `/docs translate`
- **THEN** the system SHALL inform the user that no translation structure exists and suggest setting up `locales/`

## Acceptance Criteria

- AC-1: Given code changes affecting README.md, when sync-updates triggers, then the reminder includes `→ /docs readme`
- AC-2: Given code changes affecting a translated file, when sync-updates triggers, then the reminder includes `→ /docs translate <file> --lang <lang>`
- AC-3: Given no affected documents, when sync-updates triggers, then no reminder is shown
- AC-4: Given uncommitted changes, when user runs `/docs impact`, then a full impact report with command suggestions is displayed
- AC-5: Given a `locales/` directory exists, when user runs `/docs translate`, then translation status (current/outdated/missing) is displayed
- AC-6: Given user runs `/docs translate <file> --lang <lang>`, then AI generates translation and stops for confirmation before writing

## Technical Design

### Modified Files

| File | Change |
|------|--------|
| `.standards/documentation-writing-standards.ai.yaml` | Enhanced `sync-updates` rule with command suggestion mapping |
| `core/documentation-writing-standards.md` | Added "Automatic Documentation Impact Check" section with command mapping table |
| `skills/commands/docs.md` | Added `impact` and `translate` subcommands with full AI Agent Behavior definitions |

### Command Suggestion Mapping (sync-updates)

| Affected Document | Suggested Command |
|-------------------|-------------------|
| README.md | `/docs readme` |
| API documentation | `/docs api` |
| Generated docs | `/docs generate` |
| Translation files | `/docs translate <source-file> --lang <lang>` |
| Spec/skill/other | Manual update |
| Multiple docs | `/docs impact` |

### `/docs impact` Flow

1. Determine change scope (`git diff`, `git diff --staged`, or `git diff <ref>`)
2. For each changed file, scan for referencing documents
3. Output impact report with per-file command suggestions
4. Stop for user action selection

### `/docs translate` Flow

1. Scan `locales/` directory structure
2. Compare source file versions with translation frontmatter (`source_version`, `last_synced`)
3. Display status table
4. If translating: read source + existing translation → generate updated translation → stop for confirmation

## Test Plan

- [ ] Manual: Modify a CLI file, verify sync-updates reminder includes command suggestions
- [ ] Manual: Run `/docs impact` with uncommitted changes, verify report accuracy
- [ ] Manual: Run `/docs impact --staged` with mix of staged/unstaged, verify only staged shown
- [ ] Manual: Run `/docs translate --check`, verify status matches `check-translation-sync.sh` output
- [ ] Manual: Run `/docs translate <file> --lang zh-TW`, verify translation is generated and stop point works

## References

- [documentation-writing-standards.ai.yaml](../../../.standards/documentation-writing-standards.ai.yaml)
- [core/documentation-writing-standards.md](../../../core/documentation-writing-standards.md)
- [skills/commands/docs.md](../../../skills/commands/docs.md)
- Brainstorm report: `/docs` ecosystem gap analysis (2026-03-25)
