# Specification: Skill Harvester (UDS Skill Creation Tool)

> **Status**: Draft
> **Feature**: `uds skill new` (Skill Harvester)
> **Goal**: Democratize skill creation by converting unstructured knowledge into standardized UDS Skills.

## 1. Overview

The **Skill Harvester** is a CLI feature that "crystallizes" valuable practices—such as documentation, fix patterns, or workflows—into executable AI skills (`SKILL.md`). It leverages LLM capabilities to parse unstructured text and map it to the strict UDS Skill Schema.

## 2. User Experience (UX)

### 2.1 Command Interface

```bash
uds skill new [name] [options]
```

**Aliases**: `uds harvest`

**Options**:
*   `--from <file>`: Source file to harvest (Markdown, text, code).
*   `--scope <project|global>`: Storage location (Default: `project`).
*   `--interactive, -i`: Launch interactive wizard (Default if no args provided).
*   `--dry-run`: Output the generated content to stdout without saving.

### 2.2 Workflow

1.  **Input Collection**: User provides a file or answers prompts about the task.
2.  **AI Distillation**: The system analyzes the input and structures it.
3.  **Review**: User sees a summary of the generated skill (Name, Trigger, Steps).
4.  **Refinement**: User can edit the name or description.
5.  **Persistence**: Skill is saved to the appropriate directory.

## 3. Technical Architecture

### 3.1 Input Processing Strategies

| Input Source | Processing Strategy |
| :--- | :--- |
| **Documentation File** (`--from docs/deploy.md`) | **Extraction**: Identify headers as steps, code blocks as actions, warnings as constraints. |
| **Interactive Wizard** | **Interview**: Ask "What is the goal?", "What are the prerequisites?", "What are the steps?". |
| **Conversation History** (Future) | **Summarization**: Extract successful command sequences from recent shell history. |

### 3.2 The "Harvester" Agent (Prompt Logic)

The core logic relies on a specialized AI prompt that acts as a **"Standards Enforcer"**.

**Input**: Unstructured text.
**System Instruction**: "You are an expert in Universal Development Standards. Convert the following text into a valid `SKILL.md` structure."
**Transformation Rules**:
1.  **Metadata**: Extract `name` (kebab-case), `description` (short summary), `keywords`.
2.  **Physical Binding (Reality Check)**:
    *   *Rule*: If the text implies a prerequisite (e.g., "Make sure you have Docker"), convert it to a **Reality Check** step (e.g., `docker --version`).
    *   *Safety*: Always add a check for the project root or specific config files.
3.  **Actions**:
    *   Convert imperative sentences ("Run this command") into `run_shell_command`.
    *   Convert "Check if..." into `read_file` or `run_shell_command` (verification).
4.  **Constraints**: Extract warnings ("Do not run this in production") into `<constraints>` or Reality Checks.

### 3.3 Output Schema (`SKILL.md`)

The generator must produce a file adhering to this template:

```markdown
---
name: {{skill_name}}
scope: {{scope}}
description: {{description}}
keywords: {{keywords}}
---

# {{Title}}

## Purpose
{{Purpose Description}}

# [Physical Binding]
## Reality Check
1. Verify Context: {{check_command_1}}
2. Verify Safety: {{check_command_2}}

## Steps
1. {{Step 1}}
2. {{Step 2}}
...
```

### 3.4 Storage Strategy

*   **Project Scope (Default)**:
    *   Path: `<project_root>/.claude/skills/<skill-name>/`
    *   Use case: Project-specific workflows, deployment scripts, architecture rules.
*   **Global Scope**:
    *   Path: `~/.claude/skills/<skill-name>/` (or platform specific)
    *   Use case: Personal workflows, general coding patterns.

## 4. Implementation Details

### 4.1 CLI Flow (Pseudo-code)

```javascript
async function harvestSkill(options) {
  // 1. Gather Input
  let rawContent = "";
  if (options.from) {
    rawContent = fs.readFileSync(options.from);
  } else {
    rawContent = await promptUser("Describe the skill or paste instructions:");
  }

  // 2. AI Distillation (Call LLM)
  const spinner = startSpinner("Harvesting skill...");
  const skillDraft = await generateSkillDraft(rawContent); // Calls LLM with "Harvester Prompt"
  spinner.stop();

  // 3. User Verification
  console.log(preview(skillDraft));
  const approved = await confirm("Create this skill?");

  if (approved) {
    // 4. Save
    const targetDir = options.scope === 'global' ? USER_SKILLS_DIR : PROJECT_SKILLS_DIR;
    writeSkill(targetDir, skillDraft);
    console.log(`Skill '${skillDraft.name}' created!`);
  }
}
```

### 4.2 Integration with Existing Tools
*   Reuse `cli/src/utils/ai-context.js` for context awareness.
*   Reuse `cli/src/utils/file-system.js` for safe writing.

## 5. Roadmap

*   **Phase 1**: CLI scaffolding + Interactive Prompt (Wizard).
*   **Phase 2**: File Parsing (`--from`) + "Harvester" Prompt tuning.
*   **Phase 3**: "Try it now" feature (Sandboxed execution of the new skill).
