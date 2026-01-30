# SPEC-002: Init Command Refactoring (Decoupling UI from Logic)

> **Status**: Implemented
> **Author**: Architect Agent (Claude 4.5 Sonnet)
> **Date**: 2026-01-30

## 1. Objective

Refactor `cli/src/commands/init.js` to separate interactive logic (inquirer prompts) from execution logic (file copying, manifest generation). This will improve testability and enable programmatic usage.

## 2. Architecture

### 2.1 Current State (Monolithic)
- `initCommand` handles detection, prompts, configuration building, and execution in a single 1100+ line function.
- Testing requires mocking `inquirer` and `fs`, making it brittle.

### 2.2 Target State (Layered)

1.  **UI Layer**: `src/flows/init-flow.js`
    - Responsibility: Prompt user for input.
    - Output: `InitConfig` object.
2.  **Service Layer**: `src/installers/standard-installer.js`
    - Responsibility: Execute installation based on `InitConfig`.
    - Output: `InstallationResult`.
3.  **Command Layer**: `src/commands/init.js`
    - Responsibility: Glue code. Calls Flow -> Calls Installer -> Prints Summary.

## 3. Data Structures

### `InitConfig`
```typescript
interface InitConfig {
  projectPath: string;
  displayLanguage: 'en' | 'zh-tw' | 'zh-cn';
  level: 1 | 2 | 3;
  format: 'ai' | 'human' | 'both';
  standardsScope: 'minimal' | 'full';
  contentMode: 'minimal' | 'index' | 'full';
  standardOptions: { workflow, merge_strategy, commit_language, test_levels };
  languages: string[];
  frameworks: string[];
  aiTools: string[];
  skills: { installed, location, needsInstall, skillsInstallations, commandsInstallations };
  integrationConfigs: { [tool]: { categories, detailLevel, language } };
  methodology: 'tdd' | 'bdd' | 'sdd' | 'atdd' | null;
  detected: { languages, frameworks, aiTools };
}
```

## 4. Implementation Plan

1.  **Extract `StandardInstaller`**:
    - Move lines 569-1109 of `init.js` to `src/installers/standard-installer.js`.
    - Ensure it takes `InitConfig` as input.
2.  **Extract `InitFlow`**:
    - Move lines 184-518 of `init.js` to `src/flows/init-flow.js`.
    - Ensure it returns `InitConfig`.
3.  **Update `initCommand`**:
    - Rewire to use the new modules.
4.  **Update Tests**:
    - Unit test `InitFlow` (input -> config).
    - Integration test `StandardInstaller` (config -> files).

## 5. Success Metrics
- `init.js` line count reduced < 200.
- `init.interactive.test.js` passes without changes (Refactoring safety).
- New unit tests added for `StandardInstaller`.
