# Standards Adoption Guide

> **Language**: English | [繁體中文](../locales/zh-TW/adoption/ADOPTION-GUIDE.md)
>
> Version 1.0.0

This guide helps software projects adopt Universal Documentation Standards without duplication or omission.

---

## Table of Contents

- [Understanding the Two Projects](#understanding-the-two-projects)
- [Static vs Dynamic Standards](#static-vs-dynamic-standards)
- [Standard Categories](#standard-categories)
- [Complete Standards Matrix](#complete-standards-matrix)
- [How to Adopt](#how-to-adopt)
- [After Adoption: Daily Workflow](#after-adoption-daily-workflow)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Understanding the Two Projects

| Project | Purpose | Usage |
|---------|---------|-------|
| **[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)** | Source of truth for all standards | Reference documents, copy to project |
| **[universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)** | Claude Code Skills implementation | Interactive AI workflow assistance |

### Key Principle

**For standards with Skills**: Install the Skill OR copy the source document — **never both**.

---

## Static vs Dynamic Standards

Standards are classified by **when they should be applied**:

| Type | Description | Deployment |
|------|-------------|------------|
| **Static** | Always active | Project files (`CLAUDE.md`) |
| **Dynamic** | Triggered by keywords | Skills (on-demand) |

### Static Standards

These 3 standards should **always be active** in your project:

- `anti-hallucination.md` - Certainty labels, recommendation principles
- `checkin-standards.md` - Build, test, coverage gates
- `project-structure.md` - Directory conventions

**Deployment**: Add to `CLAUDE.md` or `.cursorrules`. See [CLAUDE.md.template](../templates/CLAUDE.md.template).

### Dynamic Standards

These 10 standards are **triggered by keywords** and loaded on demand:

| Skill | Triggers |
|-------|----------|
| commit-standards | commit, git, 提交 |
| code-review-assistant | review, PR, 審查 |
| git-workflow-guide | branch, merge |
| testing-guide | test, coverage |
| release-standards | version, release |
| documentation-guide | docs, README |
| requirement-assistant | spec, SDD, 新功能 |

**Deployment**: Install as Skills via Plugin Marketplace or manual copy.

> See [STATIC-DYNAMIC-GUIDE.md](STATIC-DYNAMIC-GUIDE.md) for detailed classification.

---

## Standard Categories

### Category 1: Skills

Standards implemented as Claude Code Skills for interactive AI assistance.

**Adoption Method**: Install via Plugin Marketplace (recommended) or manual copy

```bash
# Plugin Marketplace (Recommended)
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich

# Or manual copy (macOS / Linux)
mkdir -p ~/.claude/skills
cp -r skills/commit-standards ~/.claude/skills/
```

### Category 2: Reference Documents

Static reference documents that provide guidelines but don't have workflow equivalents. These are not suitable for Skills conversion because they are lookup references rather than interactive workflows.

**Adoption Method**: Copy to project's `.standards/` directory

```bash
# macOS / Linux
mkdir -p .standards
cp <source-file> .standards/
```

```powershell
# Windows PowerShell
New-Item -ItemType Directory -Force -Path .standards
Copy-Item <source-file> .standards\
```

### Category 3: Extensions

Language, framework, or locale-specific standards. Apply based on your project's technology stack.

**Adoption Method**: Copy if applicable to your project

### Category 4: Integrations

AI tool configuration files for various editors and assistants.

**Adoption Method**: Copy to tool's expected location

### Category 5: Templates

Document templates for specific purposes.

**Adoption Method**: Copy and customize as needed

---

## Complete Standards Matrix

### Core Standards

| Standard | Category | Skill Name | Adoption |
|----------|----------|------------|----------|
| anti-hallucination.md | Skill | ai-collaboration-standards | Install Skill |
| commit-message-guide.md | Skill | commit-standards | Install Skill |
| checkin-standards.md | Reference | - | Copy to project |
| spec-driven-development.md | Reference | - | Copy to project |
| code-review-checklist.md | Skill | code-review-assistant | Install Skill |
| git-workflow.md | Skill | git-workflow-guide | Install Skill |
| versioning.md | Skill | release-standards | Install Skill |
| changelog-standards.md | Skill | release-standards | Install Skill |
| testing-standards.md | Skill | testing-guide | Install Skill |
| documentation-structure.md | Skill | documentation-guide | Install Skill |
| documentation-writing-standards.md | Reference | - | Copy to project |
| project-structure.md | Reference | - | Copy to project |

### Extensions

| Standard | Category | Applicability |
|----------|----------|---------------|
| csharp-style.md | Extension | C# projects |
| php-style.md | Extension | PHP 8.1+ projects |
| fat-free-patterns.md | Extension | Fat-Free Framework |
| zh-tw.md | Extension | Traditional Chinese teams |

### Integrations

| Standard | Target Path |
|----------|-------------|
| copilot-instructions.md | .github/copilot-instructions.md |
| .cursorrules | .cursorrules |
| .windsurfrules | .windsurfrules |
| .clinerules | .clinerules |
| google-antigravity/* | See README |
| openspec/* | See README |

### Templates

| Template | Category | Applicability |
|----------|----------|---------------|
| requirement-*.md | Skill | All projects |
| migration-template.md | Template | Migration projects |

---

## How to Adopt

### Step 1: Install Standards via CLI (Recommended)

The easiest way to adopt all standards:

```bash
npx @anthropic/uds init
```

This installs all available standards, skills, and integrations for your project.

### Step 2: Install Skills

**Recommended: Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**Alternative: Manual Copy (macOS / Linux)**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
mkdir -p ~/.claude/skills
cp -r universal-dev-standards/skills/commit-standards ~/.claude/skills/
```

**Alternative: Manual Copy (Windows PowerShell)**
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.claude\skills
Copy-Item -Recurse universal-dev-standards\skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

### Step 3: Copy Reference Documents

**macOS / Linux:**
```bash
# In your project directory
mkdir -p .standards

# Copy all reference documents
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/
cp path/to/universal-dev-standards/core/documentation-writing-standards.md .standards/
cp path/to/universal-dev-standards/core/project-structure.md .standards/
```

**Windows PowerShell:**
```powershell
# In your project directory
New-Item -ItemType Directory -Force -Path .standards

# Copy all reference documents
Copy-Item path\to\universal-dev-standards\core\checkin-standards.md .standards\
Copy-Item path\to\universal-dev-standards\core\spec-driven-development.md .standards\
Copy-Item path\to\universal-dev-standards\core\documentation-writing-standards.md .standards\
Copy-Item path\to\universal-dev-standards\core\project-structure.md .standards\
```

### Step 4: Copy Applicable Extensions

**macOS / Linux:**
```bash
# Example: For a PHP project with Traditional Chinese team
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
cp path/to/universal-dev-standards/extensions/locales/zh-tw.md .standards/
```

**Windows PowerShell:**
```powershell
# Example: For a PHP project with Traditional Chinese team
Copy-Item path\to\universal-dev-standards\extensions\languages\php-style.md .standards\
Copy-Item path\to\universal-dev-standards\extensions\locales\zh-tw.md .standards\
```

### Step 5: Setup AI Tool Integrations

**macOS / Linux:**
```bash
# Example: For Cursor IDE
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .

# Example: For GitHub Copilot
mkdir -p .github
cp path/to/universal-dev-standards/integrations/github-copilot/copilot-instructions.md .github/
```

**Windows PowerShell:**
```powershell
# Example: For Cursor IDE
Copy-Item path\to\universal-dev-standards\integrations\cursor\.cursorrules .

# Example: For GitHub Copilot
New-Item -ItemType Directory -Force -Path .github
Copy-Item path\to\universal-dev-standards\integrations\github-copilot\copilot-instructions.md .github\
```

---

## After Adoption: Daily Workflow

After running `uds init`, you may wonder: **"How do I use UDS in my daily development?"**

This is covered in detail in [DAILY-WORKFLOW-GUIDE.md](DAILY-WORKFLOW-GUIDE.md), which explains:

- **Greenfield vs Brownfield**: Different workflows for new projects vs legacy codebases
- **Incremental Adoption**: You don't need to reverse-engineer all legacy code
- **Task-Based Workflow Selection**: Choose methodology based on task type
- **Legacy Code Strategy**: Golden Master Testing, Characterization Tests
- **Available Commands**: Quick reference for daily use (`/tdd`, `/bdd`, `/sdd`, etc.)

> **Key Insight**: For legacy projects, focus on "touch a little, protect a little" rather than comprehensive upfront documentation.

---

## Common Mistakes to Avoid

### Mistake 1: Referencing Both Skill AND Source Document

**Wrong**:
```
# Project has both:
- ai-collaboration-standards skill installed
- .standards/anti-hallucination.md copied
```

**Correct**:
```
# Project has ONLY ONE:
- ai-collaboration-standards skill installed
# OR
- .standards/anti-hallucination.md copied
```

### Mistake 2: Missing Reference-Only Standards

**Wrong**:
```
# Installed all skills but forgot reference documents
- Skills installed ✓
- checkin-standards.md ✗ (missing)
- spec-driven-development.md ✗ (missing)
```

**Correct**:
```
# Both skills AND reference documents
- Skills installed ✓
- .standards/checkin-standards.md ✓
- .standards/spec-driven-development.md ✓
```

### Mistake 3: Forgetting Tool Integrations

If you use AI coding assistants, don't forget to copy the integration files:
- `.cursorrules` for Cursor
- `.windsurfrules` for Windsurf
- `.github/copilot-instructions.md` for GitHub Copilot

---

## Machine-Readable Registry

For tooling and automation, see [standards-registry.json](standards-registry.json).

This JSON file contains the complete mapping of all standards, categories, and adoption methods.

---

## Related Links

- [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) - Source repository
- [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) - Skills repository
- [Daily Workflow Guide](DAILY-WORKFLOW-GUIDE.md) - How to use UDS after adoption
- [Adoption Checklist](checklists/enterprise.md) - Complete adoption checklist
