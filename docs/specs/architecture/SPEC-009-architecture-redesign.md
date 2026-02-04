# SPEC-009: Architecture Redesign - Integration Driven

> **Status**: Draft
> **Author**: Architect Agent
> **Date**: 2026-01-30

## 1. Objective

Simplify and align the CLI initialization flow by removing the concept of "Adoption Levels" and letting "Rule Categories" drive the entire configuration process.

## 2. Problem Statement

### 2.1 Redundancy & Confusion
- Users currently select an "Adoption Level" (1, 2, 3) and later select "Rule Categories" in Integration Config.
- This creates potential conflicts: User selects Level 2 but picks Level 3 rules, or vice versa.
- Logical disconnect: "Standard Options" (like Git Flow) are asked even if the user hasn't decided to adopt Git standards yet.

### 2.2 Over-Complexity
- Integration prompts include granular options like "Detail Level", "Custom Exclusions", and "Custom Rules" which complicate the initial setup. Most users can edit the generated files later.

## 3. Proposed Architecture

### 3.1 Core Shift
- **Remove**: `Adoption Level` concept.
- **New Core**: `Rule Selection` becomes the primary driver.
- **Logic**: Files installed = Selected Rules. AI Config = Selected Rules.

### 3.2 New Flow Sequence

1.  **AI Tools & Skills** (Unchanged)
    - Display Language
    - AI Tools
    - Skills Location
    - Commands Location

2.  **Rule Selection** (New Core)
    - **Prompt**: "Select Standard Rules to Adopt" (Checkbox)
    - **Options**: Anti-Hallucination, Commit Message, Git Workflow, Testing, Documentation, etc.
    - **Default**: Core rules checked.

3.  **Rule Configuration** (Dynamic)
    - Only ask configuration questions for selected rules.
    - *If "Git Workflow" selected* -> Prompt "Git Branching Strategy"
    - *If "Testing" selected* -> Prompt "Test Levels"
    - *If "Commit Message" selected* -> Prompt "Commit Language"

4.  **Generation & Content**
    - **Prompt**: "Standards Scope" (Minimal/Full) -> Controls file copying.
    - **Implicit**: Content Mode.
        - **Remove**: Prompt for "Content Mode" (Standard/Full/Minimal).
        - **Default**: Always use `index` (Standard) mode. It provides the best balance of context usage and AI awareness.
    - **Implicit**: Integration Config.
        - **Remove**: Prompt for Default/Custom/Merge mode.
        - **Logic**: If file exists -> Ask Overwrite/Merge/Keep. If new -> Create.
        - **Remove**: Detail Level, Custom Exclusions, Custom Rules, and "Enter Custom Rule" input prompts.
        - **Default**: Always use `standard` detail level.

## 4. Technical Changes

### 4.1 Data Structures
- `RULE_CATEGORIES` needs to map to:
  - `files`: List of `.ai.yaml` files to install.
  - `options`: List of option keys (e.g., `gitWorkflow`) to trigger.

### 4.2 Installers
- `standards-installer.js`: Refactor to accept a list of rule IDs instead of a numeric level.
- `integration-generator.js`: Refactor to use the globally selected rules instead of asking again.

## 5. Migration Strategy
- Deprecate `level` in `manifest.json` (or calculate it virtually for backward compatibility).
- Update `uds update` to respect the new rule-based manifest.
