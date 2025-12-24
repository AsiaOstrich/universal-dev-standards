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
- [Adoption Levels](#adoption-levels)
- [How to Adopt](#how-to-adopt)
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

**Deployment**: Install as Skills via `skills/claude-code/install.sh`.

> See [STATIC-DYNAMIC-GUIDE.md](STATIC-DYNAMIC-GUIDE.md) for detailed classification.

---

## Standard Categories

### Category 1: Skills

Standards implemented as Claude Code Skills for interactive AI assistance.

**Adoption Method**: Install via [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills)

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
```

### Category 2: Reference Documents

Static reference documents that provide guidelines but don't have workflow equivalents. These are not suitable for Skills conversion because they are lookup references rather than interactive workflows.

**Adoption Method**: Copy to project's `.standards/` directory

```bash
mkdir -p .standards
cp <source-file> .standards/
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

| Standard | Category | Skill Name | Level | Adoption |
|----------|----------|------------|-------|----------|
| anti-hallucination.md | Skill | ai-collaboration-standards | 1 | Install Skill |
| commit-message-guide.md | Skill | commit-standards | 1 | Install Skill |
| checkin-standards.md | Reference | - | 1 | Copy to project |
| spec-driven-development.md | Reference | - | 1 | Copy to project |
| code-review-checklist.md | Skill | code-review-assistant | 2 | Install Skill |
| git-workflow.md | Skill | git-workflow-guide | 2 | Install Skill |
| versioning.md | Skill | release-standards | 2 | Install Skill |
| changelog-standards.md | Skill | release-standards | 2 | Install Skill |
| testing-standards.md | Skill | testing-guide | 2 | Install Skill |
| documentation-structure.md | Skill | documentation-guide | 3 | Install Skill |
| documentation-writing-standards.md | Reference | - | 3 | Copy to project |
| project-structure.md | Reference | - | 3 | Copy to project |

### Extensions

| Standard | Category | Applicability | Level |
|----------|----------|---------------|-------|
| csharp-style.md | Extension | C# projects | 2 |
| php-style.md | Extension | PHP 8.1+ projects | 2 |
| fat-free-patterns.md | Extension | Fat-Free Framework | 2 |
| zh-tw.md | Extension | Traditional Chinese teams | 2 |

### Integrations

| Standard | Target Path | Level |
|----------|-------------|-------|
| copilot-instructions.md | .github/copilot-instructions.md | 2 |
| .cursorrules | .cursorrules | 2 |
| .windsurfrules | .windsurfrules | 2 |
| .clinerules | .clinerules | 2 |
| google-antigravity/* | See README | 2 |
| openspec/* | See README | 2 |

### Templates

| Template | Category | Applicability | Level |
|----------|----------|---------------|-------|
| requirement-*.md | Skill | All projects | 2 |
| migration-template.md | Template | Migration projects | 3 |

---

## Adoption Levels

### Level 1: Essential

Minimum viable standards for any project. Setup time: ~30 minutes.

**Required**:
- [ ] ai-collaboration-standards (Skill)
- [ ] commit-standards (Skill)
- [ ] checkin-standards.md (Reference)
- [ ] spec-driven-development.md (Reference)

See [checklists/minimal.md](checklists/minimal.md) for detailed checklist.

### Level 2: Recommended

Professional quality standards for team projects. Setup time: ~2 hours.

**Includes Level 1, plus**:
- [ ] code-review-assistant (Skill)
- [ ] git-workflow-guide (Skill)
- [ ] release-standards (Skill)
- [ ] testing-guide (Skill)
- [ ] Applicable extensions
- [ ] AI tool integrations

See [checklists/recommended.md](checklists/recommended.md) for detailed checklist.

### Level 3: Enterprise

Comprehensive standards for enterprise or regulated projects. Setup time: 1-2 days.

**Includes Level 2, plus**:
- [ ] documentation-guide (Skill)
- [ ] documentation-writing-standards.md (Reference)
- [ ] project-structure.md (Reference)
- [ ] migration-template.md (if applicable)

See [checklists/enterprise.md](checklists/enterprise.md) for detailed checklist.

---

## How to Adopt

### Step 1: Determine Your Level

Consider your project's needs:
- **Personal/Side project**: Level 1
- **Team project**: Level 2
- **Enterprise/Regulated**: Level 3

### Step 2: Install Skills

```bash
# Clone and install universal-dev-skills
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh

# Choose installation type based on your needs
```

### Step 3: Copy Reference Documents

```bash
# In your project directory
mkdir -p .standards

# Copy reference documents based on your level
# Level 1
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/

# Level 3 (additional)
cp path/to/universal-dev-standards/core/documentation-writing-standards.md .standards/
cp path/to/universal-dev-standards/core/project-structure.md .standards/
```

### Step 4: Copy Applicable Extensions

```bash
# Example: For a PHP project with Traditional Chinese team
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
cp path/to/universal-dev-standards/extensions/locales/zh-tw.md .standards/
```

### Step 5: Setup AI Tool Integrations

```bash
# Example: For Cursor IDE
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .

# Example: For GitHub Copilot
mkdir -p .github
cp path/to/universal-dev-standards/integrations/github-copilot/copilot-instructions.md .github/
```

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
- [Minimal Checklist](checklists/minimal.md) - Level 1 adoption checklist
- [Recommended Checklist](checklists/recommended.md) - Level 2 adoption checklist
- [Enterprise Checklist](checklists/enterprise.md) - Level 3 adoption checklist
