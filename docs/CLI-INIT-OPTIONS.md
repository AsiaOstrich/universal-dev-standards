# UDS CLI Init Options Complete Guide

> **Language**: English | [繁體中文](../locales/zh-TW/docs/CLI-INIT-OPTIONS.md) | [简体中文](../locales/zh-CN/docs/CLI-INIT-OPTIONS.md)
>
> **Version**: 3.5.1
> **Last Updated**: 2026-01-15

This document provides detailed explanations for every option in the `uds init` command, including use cases, effects, and recommended choices.

---

## Table of Contents

1. [AI Tools Selection](#1-ai-tools-selection)
2. [Skills Installation Location](#2-skills-installation-location)
3. [Standards Scope](#3-standards-scope)
4. [Format](#4-format)
5. [Standard Options](#5-standard-options)
6. [Extensions](#6-extensions)
7. [Integration Configuration](#7-integration-configuration)
8. [Content Mode](#8-content-mode)
9. [Methodology (Experimental)](#9-methodology-experimental)
10. [CLI Parameter Reference](#10-cli-parameter-reference)

---

## 1. AI Tools Selection

### Interactive Prompt

```
? Which AI tools are you using?
  ── Dynamic Skills ──
❯ ◉ Claude Code (推薦) - Anthropic CLI with dynamic Skills
  ── Static Rule Files ──
  ◯ Cursor (.cursorrules)
  ◯ Windsurf (.windsurfrules)
  ◯ Cline (.clinerules)
  ◯ GitHub Copilot (.github/copilot-instructions.md)
  ◯ Google Antigravity (INSTRUCTIONS.md) - Gemini Agent
  ── AGENTS.md Tools ──
  ◯ OpenAI Codex (AGENTS.md) - OpenAI Codex CLI
  ◯ OpenCode (AGENTS.md) - Open-source AI coding agent
  ── Gemini Tools ──
  ◯ Gemini CLI (GEMINI.md) - Google Gemini CLI
  ──────────────
  ◯ None / Skip
```

### Description

Select the AI coding assistants you use in your project. The CLI will generate corresponding integration files based on your selection.

### Supported Tools

| Tool | Generated File | Format | Description |
|------|----------------|--------|-------------|
| **Claude Code** | `CLAUDE.md` | Markdown | Anthropic CLI with dynamic Skills support |
| **Cursor** | `.cursorrules` | Plaintext | Cursor IDE rules file |
| **Windsurf** | `.windsurfrules` | Plaintext | Windsurf IDE rules file |
| **Cline** | `.clinerules` | Plaintext | Cline extension rules file |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Markdown | Copilot custom instructions |
| **Google Antigravity** | `INSTRUCTIONS.md` | Markdown | Gemini Agent system instructions |
| **OpenAI Codex** | `AGENTS.md` | Markdown | OpenAI Codex CLI |
| **OpenCode** | `AGENTS.md` | Markdown | Open-source AI coding agent (shares file with Codex) |
| **Gemini CLI** | `GEMINI.md` | Markdown | Google Gemini CLI |

### Categories

```
── Dynamic Skills ──
  Claude Code (Recommended) - Supports dynamic Skills loading

── Static Rule Files ──
  Cursor, Windsurf, Cline, GitHub Copilot, Google Antigravity

── AGENTS.md Tools ──
  OpenAI Codex, OpenCode (share AGENTS.md)

── Gemini Tools ──
  Gemini CLI
```

### Use Cases

| Scenario | Recommended Choice |
|----------|-------------------|
| Primarily using Claude Code | Select only Claude Code, can use minimal scope |
| Team members use different tools | Select all tools used by the team |
| Want the most complete rule coverage | Select Claude Code + other tools |

### Notes

- **Codex + OpenCode**: Both share `AGENTS.md`, only one file will be generated
- **Claude Code only**: Will trigger Skills installation location prompt
- **Multiple tools selected**: Will use shared integration configuration

---

## 2. Skills Installation Location

### Interactive Prompt (Multi-Agent Selection)

```
? Select AI agents to install Skills for:
  ── Claude Code ──
❯ ◉ Claude Code (Plugin Marketplace) - Auto-managed (Recommended)
  ◯ Claude Code (User Level) - ~/.claude/skills/
  ◯ Claude Code (Project Level) - .claude/skills/
  ── OpenCode ──
  ◯ OpenCode (User Level) - ~/.config/opencode/skill/
  ◯ OpenCode (Project Level) - .opencode/skill/
  ── Cline ──
  ◯ Cline (User Level) - ~/.cline/skills/
  ◯ Cline (Project Level) - .cline/skills/
  ── Other Agents ──
  ◯ Roo Code, Codex, Copilot, Windsurf, Gemini CLI...
  ──────────────
  ◯ Skip Skills Installation
```

### Description

Select which AI agents to install Skills for. **v3.5.0 supports installing Skills to multiple agents simultaneously**. Each agent has its own skills directory path.

### Options

| Agent | User Level Path | Project Level Path | Notes |
|-------|-----------------|-------------------|-------|
| **Claude Code** | `~/.claude/skills/` | `.claude/skills/` | Also supports Plugin Marketplace |
| **OpenCode** | `~/.config/opencode/skill/` | `.opencode/skill/` | Full SKILL.md support |
| **Cline** | `~/.cline/skills/` | `.cline/skills/` | Uses Claude skills path |
| **Roo Code** | `~/.roo/skills/` | `.roo/skills/` | Mode-specific: `.roo/skills-{mode}/` |
| **OpenAI Codex** | `~/.codex/skills/` | `.codex/skills/` | Full SKILL.md support |
| **GitHub Copilot** | `~/.copilot/skills/` | `.github/skills/` | Full SKILL.md support |
| **Windsurf** | `~/.codeium/windsurf/skills/` | `.windsurf/skills/` | Skills since Jan 2026 |
| **Gemini CLI** | `~/.gemini/skills/` | `.gemini/skills/` | Preview support |

> **Note**: Cursor does not support SKILL.md format yet (uses `.mdc` rules format).

### Detailed Explanation

#### Plugin Marketplace (Recommended)

```bash
# If not yet installed, run:
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**Pros**:
- Automatic updates to latest version
- No manual management needed
- All 15 Skills installed at once

**Cons**:
- Cannot lock to specific version
- Requires network connection

#### User Level

```
~/.claude/skills/
├── universal-dev-standards/
│   ├── ai-collaboration-standards/
│   ├── commit-standards/
│   └── ...
```

**Pros**:
- Shared across all projects
- Works offline
- Manual version control

**Cons**:
- Requires manual updates
- Not version controlled with project

#### Project Level

```
your-project/
├── .claude/
│   └── skills/
│       └── universal-dev-standards/
│           ├── ai-collaboration-standards/
│           └── ...
```

**Pros**:
- Can be added to Git version control
- Team members share the same version
- Project independent, doesn't affect other projects

**Cons**:
- Increases project size
- Requires manual updates
- Consider adding to `.gitignore` (depending on needs)

### Decision Flow

```
Using Claude Code?
    │
    ├─ No → Select None
    │
    └─ Yes → Need automatic updates?
              │
              ├─ Yes → Plugin Marketplace
              │
              └─ No → Need team sharing?
                        │
                        ├─ Yes → Project Level
                        │
                        └─ No → User Level
```

---

## 3. Standards Scope

### Interactive Prompt

```
? How should standards be installed?
❯ Lean (推薦) - Reference docs only, Skills handle the rest
  Complete - All standards as local files
```

### Description

Determines the scope of standards copied to the `.standards/` directory. **This option only appears when Skills are installed**.

### Options

| Scope | Copied Content | Use Case |
|-------|----------------|----------|
| **Minimal** (Recommended) | Reference category standards only | Skills installed, avoid duplication |
| **Full** | Reference + Skill category standards | No Skills, or need complete documentation |

### Detailed Explanation

#### Minimal Scope

Only copies **Reference** category standards (those without corresponding Skills):

```
.standards/
├── checkin-standards.md          # Reference
├── spec-driven-development.md    # Reference
├── project-structure.md          # Reference
└── documentation-writing-standards.md  # Reference
```

**Use Cases**:
- ✅ Skills installed (Marketplace / User / Project)
- ✅ Want to avoid Skill and document duplication
- ✅ Want a smaller `.standards/` directory

#### Full Scope

Copies **Reference + Skill** category standards:

```
.standards/
├── anti-hallucination.md         # Skill category
├── commit-message-guide.md       # Skill category
├── code-review-checklist.md      # Skill category
├── git-workflow.md               # Skill category
├── testing-standards.md          # Skill category
├── checkin-standards.md          # Reference category
├── spec-driven-development.md    # Reference category
└── ...
```

**Use Cases**:
- ✅ No Skills installed
- ✅ Need complete local documentation reference
- ✅ Team members don't use Claude Code

### Important Reminder

> **Principle**: For standards with Skills, use the Skill **OR** copy the document — **never both**.

---

## 4. Format

### Interactive Prompt

```
? Select standards format:
❯ Compact (推薦) - YAML format, optimized for AI reading
  Detailed - Full Markdown, best for human reading
  Both (進階) - Include both formats
```

### Description

Determines the format of copied standard files.

### Options

| Format | File Type | Token Usage | Use Case |
|--------|-----------|-------------|----------|
| **Compact** (Recommended) | `.ai.yaml` | ~31% smaller<sup>†</sup> | AI assistants, automation |
| **Detailed** | `.md` | Standard | Human reading, team training |
| **Both** | Both formats | Higher | Need both purposes |

<sup>†</sup> Measured 2026-07-23 across the 135 standards that ship in both forms:
872,380 bytes of `.ai.yaml` against 1,271,471 bytes of `.md`. Reproduce with the commands in
[Content Architecture §7](reference/CONTENT-ARCHITECTURE.md#7-how-to-re-measure).
This figure previously read "~80% reduction", which no measurement supports —
pick this option for structured machine parsing, not for a large token saving.

### Detailed Explanation

#### Compact (Recommended)

```yaml
# commit-message.ai.yaml
format: "<type>(<scope>): <subject>"
types:
  feat: New feature
  fix: Bug fix
  docs: Documentation
rules:
  - subject_max_length: 72
  - use_imperative_mood: true
```

**Characteristics**:
- Structured YAML format — deterministic to parse
- Suitable for AI parsing
- ~31% smaller than the Markdown form (measured; see the note above)

#### Detailed

```markdown
# Commit Message Guide

## Format
<type>(<scope>): <subject>

## Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation

## Rules
- Subject line maximum 72 characters
- Use imperative mood: "add" not "added"
```

**Characteristics**:
- Easy for human reading
- Detailed explanations and examples
- Suitable for team training

#### Both

Copies both formats, suitable when you need:
- AI automated processing
- Human reference reading

---

## 5. Standard Options

### Description

Configuration options for specific standards.

### 5.1 Git Workflow

#### Interactive Prompt

```
? Select Git branching strategy:
❯ GitHub Flow (推薦) - Simple, continuous deployment
  GitFlow - Structured releases with develop/release branches
  Trunk-Based - Direct commits to main, feature flags
```

Determines the team's Git branching strategy.

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **GitHub Flow** (Recommended) | Simple, continuous deployment | Small teams, web apps, continuous deployment |
| **GitFlow** | Structured, has develop/release branches | Large teams, periodic releases, multi-version maintenance |
| **Trunk-Based** | Direct commits to main, feature flags | Highly automated, mature CI/CD |

#### GitHub Flow

```
main ──────────────────────────────>
       \         /
        feature ─
```

- Only `main` branch
- Feature branch → PR → Merge
- Suitable for continuous deployment

#### GitFlow

```
main    ─────────────────────────────>
              \         /
develop ───────────────────────────>
           \   /     \   /
         feature   release
```

- `main` + `develop` branches
- Feature → develop → release → main
- Suitable for planned releases

#### Trunk-Based

```
main ─────────────────────────────>
       │   │   │
       ↑   ↑   ↑
     Direct commits or very short PRs
```

- Everyone commits directly to main
- Uses feature flags
- Requires highly automated testing

### 5.2 Merge Strategy

#### Interactive Prompt

```
? Select merge strategy:
❯ Squash Merge (推薦) - Clean history, one commit per PR
  Merge Commit - Preserve full branch history
  Rebase + Fast-Forward - Linear history, advanced
```

Determines PR merge method.

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Squash Merge** (Recommended) | Compress to single commit | Clean history, most projects |
| **Merge Commit** | Preserve complete branch history | Need detailed history tracking |
| **Rebase + Fast-Forward** | Linear history, advanced | Pursuit of perfect linear history |

### 5.3 Commit Language

#### Interactive Prompt

```
? Select commit message language:
❯ English (推薦) - Standard international format
  Traditional Chinese (繁體中文) - For Chinese-speaking teams
  Bilingual (雙語) - Both English and Chinese
```

Determines commit message language.

| Language | Example | Use Case |
|----------|---------|----------|
| **English** (Recommended) | `feat(auth): add OAuth2 support` | International teams, open source projects |
| **Traditional Chinese** | `新增(認證): 實作 OAuth2 支援` | Traditional Chinese teams |
| **Bilingual** | `feat(auth): add OAuth2 / 新增 OAuth2` | Bilingual environments |

### 5.4 Test Levels

#### Interactive Prompt

```
? Select test levels to include:
❯ ◉ Unit Testing (70% pyramid base)
  ◉ Integration Testing (20%)
  ◯ System Testing (7%)
  ◯ E2E Testing (3% pyramid top)
```

Select test levels to include.

| Level | Coverage Recommendation | Description |
|-------|------------------------|-------------|
| **Unit Testing** | 70% | Unit tests (default selected) |
| **Integration Testing** | 20% | Integration tests (default selected) |
| **System Testing** | 7% | System tests |
| **E2E Testing** | 3% | End-to-end tests |

---

## 6. Extensions

### Description

Based on project language, framework, and locale settings, copy corresponding extension standards.

### 6.1 Language Extensions

#### Interactive Prompt

```
? Detected language(s). Select style guides to include:
❯ ◉ C# Style Guide
  ◉ PHP Style Guide (PSR-12)
```

> Note: This prompt only appears when languages are detected in the project.

| Extension | File | Detection Method |
|-----------|------|-----------------|
| **C#** | `csharp-style.md` | `.cs` files, `.csproj` |
| **PHP** | `php-style.md` | `.php` files, `composer.json` |

### 6.2 Framework Extensions

#### Interactive Prompt

```
? Detected framework(s). Select patterns to include:
❯ ◉ Fat-Free Framework Patterns
```

> Note: This prompt only appears when frameworks are detected in the project.

| Extension | File | Detection Method |
|-----------|------|-----------------|
| **Fat-Free** | `fat-free-patterns.md` | Fat-Free Framework related files |

### 6.3 Locale Extensions

#### Interactive Prompt

```
? Use Traditional Chinese (繁體中文) locale? (y/N)
```

| Extension | File | Description |
|-----------|------|-------------|
| **zh-TW** | `zh-tw.md` | Traditional Chinese localization guidelines |

### Auto-Detection

CLI automatically detects project characteristics and pre-selects relevant extensions:

```bash
uds init
# Detecting project characteristics...
# Languages: javascript, typescript
# Frameworks: react
# AI Tools: cursor
```

---

## 7. Integration Configuration

### Description

Integration file configuration for non-Claude Code tools (Cursor, Windsurf, Cline, etc.).

### Configuration Items

#### Rule Categories

Select rule categories to embed:

| Category | Description |
|----------|-------------|
| `anti-hallucination` | Anti-hallucination protocol |
| `commit-standards` | Commit message standards |
| `code-review` | Code review checklist |
| `testing` | Testing standards |
| `git-workflow` | Git workflow |
| `documentation` | Documentation standards |
| `error-handling` | Error handling |
| `project-structure` | Project structure |
| `spec-driven-development` | Spec-driven development |

#### Detail Level

| Level | Description | File Size |
|-------|-------------|-----------|
| **Minimal** | Most concise rules | Smallest |
| **Standard** (Default) | Standard detail level | Medium |
| **Comprehensive** | Complete detailed explanation | Larger |

#### Existing File Handling

If integration file already exists:

| Strategy | Description |
|----------|-------------|
| **Overwrite** | Complete overwrite |
| **Merge** | Merge (avoid duplicate sections) |
| **Append** | Append to existing content |
| **Keep** | Keep existing file |

### Shared Configuration

When selecting multiple AI tools, all tools share the same configuration:

```
Selection: Cursor + Windsurf + Cline
     ↓
Shared configuration prompt (set once)
     ↓
Generate three files with same rules
```

---

## 8. Content Mode

### Interactive Prompt

```
? Select content level:
❯ Standard (推薦) - Summary + links to full docs
  Minimal - Core rules only (smallest)
```

### Description

Determines how much standards content to embed in AI tool integration files.

> **A third mode, `full` ("Full Embed"), was removed in UDS 6.9.0.**
> It never generated different files from `index` — the generator branches on
> `minimal` only, so the two produced byte-identical output in all 24 tool ×
> language combinations measured. `--content-mode full` is still accepted and
> resolves to `index`, and a manifest recording `full` is rewritten to `index`
> on the next run. **No project's generated files change**, because the two
> modes were already producing the same bytes. See XSPEC-357 R7.

### Options

| Mode | Content | Use Case |
|------|---------|----------|
| **Standard** (`index`, recommended) | Standards index + MUST/SHOULD task mapping | Most projects |
| **Minimal** (`minimal`) | File references only | Projects relying on Skills for guidance |

### Detailed Explanation

#### Minimal Mode

**Generated Content**: Simple standards reference list

```markdown
## Standards Reference

**IMPORTANT**: When performing related tasks, you MUST read and follow the standards in `.standards/`:

**Core Standards:**
- `.standards/anti-hallucination.md`
- `.standards/commit-message.ai.yaml`
- `.standards/checkin-standards.md`

**Options:**
- `.standards/options/github-flow.ai.yaml`
```

**Characteristics**:
- Only lists file paths
- AI needs to proactively read `.standards/`
- Smallest file size

**Use Cases**:
- ✅ Legacy project migration, don't want major changes
- ✅ Small projects / prototypes
- ✅ File size sensitive
- ⚠️ Risk: AI may not proactively read files

#### Standard Mode (Recommended)

**Generated Content**: Compliance instructions + standards index

```markdown
## Standards Compliance Instructions

**MUST follow** (always required):
| Task | Standard | When |
|------|----------|------|
| AI collaboration | anti-hallucination.md | Always |
| Writing commits | commit-message.ai.yaml | Every commit |
| Committing code | checkin-standards.md | Every commit |

**SHOULD follow** (when relevant):
| Task | Standard | When |
|------|----------|------|
| Adding logging | logging-standards.md | When writing logs |
| Writing tests | testing.ai.yaml | When creating tests |

## Installed Standards Index

All standards are located in `.standards/`:

### Core (6 standards)
- `anti-hallucination.md` - AI collaboration anti-hallucination
- `commit-message.ai.yaml` - Commit message format
...
```

**Characteristics**:
- **MUST / SHOULD** priority classification
- Task mapping table (Task → Standard → When)
- Tells AI **when** to read which standard
- Balances file size and visibility

**Use Cases**:
- ✅ Most projects
- ✅ Want AI to follow standards but don't want large files
- ✅ AI tools will read project files

#### Full Embed Mode (removed)

This section used to document a mode that embedded complete rule bodies into
the integration file, "guaranteeing" the AI saw every standard and producing a
file "3-5x larger than Index mode".

**None of that was implemented.** `full` shared the `index` code path and wrote
identical bytes. It could not have worked as described: `.standards/` is roughly
248k tokens, far past what any integration file can carry. The mode was removed
in UDS 6.9.0 (XSPEC-357 R7) and now resolves to `index`.

If you selected it for compliance reasons, you were already receiving `index`
output, and nothing about your generated files changes.

### Decision Flow

```
Start choosing content mode
        │
        ▼
  ┌─────────────────────────────┐
  │ Are Skills installed and    │
  │ providing task guidance?    │
  └─────────────────────────────┘
        │
    ┌───┴───┐
    │       │
   Yes      No
    │       │
    ▼       ▼
 Minimal  Index
```

### Use Case Examples

| Scenario | Recommended Mode | Reason |
|----------|------------------|--------|
| Startup team's SaaS project | **Index** | Balance efficiency and standards |
| Bank core system | **Index** | The index names every applicable standard and when it applies |
| Personal side project | **Minimal** | Lightweight is fine |
| Open source project | **Index** | Let contributor AIs know the standards |
| Migration from old setup | **Minimal** | Preserve existing settings |
| Traditional enterprise adopting AI | **Index** | Same output the retired `full` mode produced |

---

## 9. Methodology (Experimental)

### Interactive Prompt

```
? Which development methodology do you want to use?
❯ TDD - Test-Driven Development (Red → Green → Refactor)
  BDD - Behavior-Driven Development (Given-When-Then)
  SDD - Spec-Driven Development (Spec First, Code Second)
  ATDD - Acceptance Test-Driven Development
  ──────────────
  None - No specific methodology
```

> **⚠️ Experimental**: This feature requires the `-E` or `--experimental` flag to enable. It will be redesigned in v4.0.

### Description

Select a development methodology to guide your project's workflow. This option only appears when the `--experimental` flag is used.

### Options

| Methodology | Full Name | Description |
|-------------|-----------|-------------|
| **TDD** | Test-Driven Development | Red → Green → Refactor cycle |
| **BDD** | Behavior-Driven Development | Given-When-Then scenarios |
| **SDD** | Spec-Driven Development | Spec First, Code Second |
| **ATDD** | Acceptance Test-Driven Development | Acceptance criteria focus |
| **None** | - | No specific methodology |

### Enabling Experimental Features

```bash
# Enable experimental features
uds init -E

# Or use the long form
uds init --experimental
```

---

## 10. CLI Parameter Reference

### Interactive Mode vs Non-Interactive Mode

| Option | Interactive Prompt | CLI Parameter | Default |
|--------|-------------------|---------------|---------|
| AI Tools | `promptAITools()` | - (detected) | Auto-detect |
| Skills Location | `promptSkillsInstallLocation()` | `--skills-location` | `marketplace` |
| Standards Scope | `promptStandardsScope()` | - | Depends on Skills |
| Format | `promptFormat()` | `-f, --format` | `ai` |
| Git Workflow | `promptGitWorkflow()` | `--workflow` | `github-flow` |
| Merge Strategy | `promptMergeStrategy()` | `--merge-strategy` | `squash` |
| Output Language | `promptOutputLanguage()` | `--output-lang` | `english` |
| Test Levels | `promptTestLevels()` | `--test-levels` | `unit,integration` |
| Language | `promptLanguage()` | `--lang` | Auto-detect |
| Framework | `promptFramework()` | `--framework` | Auto-detect |
| Locale | `promptLocale()` | `--locale` | - |
| Content Mode | `promptContentMode()` | `--content-mode` | `index` |
| Methodology | `promptMethodology()` | - | `null` (requires `-E`) |

### Control Flags

| Flag | CLI Parameter | Description |
|------|---------------|-------------|
| Non-interactive | `-y, --yes` | Skip interactive prompts, use default values |
| Experimental | `-E, --experimental` | Enable experimental features (methodology selection) |
| AGENTS.md | `--agents-md` | Generate AGENTS.md universal summary (default: yes if no codex/opencode) |
| No AGENTS.md | `--no-agents-md` | Skip AGENTS.md generation |
| Enforcement Hooks | `--with-hooks` | Install enforcement hooks (commit-msg, security, logging) |
| Content Layout | `--content-layout` | Content layout (`flat`, `layered`) - default: `flat` |
| UI Language | `--ui-lang` | UI language for prompts (`en`, `zh-tw`, `auto`) - default: `auto` |
| Mode (deprecated) | `-m, --mode` | Installation mode (skills, full) - use `--skills-location` instead |
| Force overwrite | `-f, --force` | Overwrite existing configuration (used by `uds ai-context init`) |

### Complete CLI Examples

```bash
# Fully interactive
uds init

# Non-interactive with defaults
uds init -y

# Specify all options
uds init -y \
  --format ai \
  --skills-location marketplace \
  --workflow github-flow \
  --merge-strategy squash \
  --output-lang english \
  --test-levels unit,integration \
  --content-mode index

# Minimal integration files (rely on Skills for task guidance)
uds init -y --content-mode minimal

# Generate AGENTS.md universal summary (default in --yes mode)
uds init -y --agents-md

# Skip AGENTS.md generation
uds init -y --no-agents-md

# Install with enforcement hooks
uds init -y --with-hooks

# Layered CLAUDE.md (subdirectory context-aware loading)
uds init -y --content-layout layered

# Traditional Chinese team
uds init -y --output-lang traditional-chinese --locale zh-tw

# Force English prompts
uds init --ui-lang en

# Force Traditional Chinese prompts
uds init --ui-lang zh-tw

# PHP project
uds init -y --lang php --framework fat-free
```

---

## Related Documents

- [CLI README](../cli/README.md) - CLI basic usage
- [ADOPTION-GUIDE.md](../adoption/ADOPTION-GUIDE.md) - Adoption guide
- [CLAUDE.md](../CLAUDE.md) - Project development guidelines
- [CHANGELOG.md](../CHANGELOG.md) - Version history

---

**Maintained by Universal Dev Standards Team**
