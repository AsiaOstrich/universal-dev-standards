# UDS v2 Migration Guide (Dual-Layer Architecture)

> **Status**: Active
> **Target Audience**: AI Agents & Contributors
> **Goal**: Upgrade standards from v1 (Document-only) to v2 (Physical + Imagination).

## 1. Overview

The v2 format introduces the **Dual-Layer Architecture**:
*   **Imagination Layer**: The `standard` object containing human/AI readable guidelines.
*   **Physical Layer**: The `physical_spec` object containing machine-executable validators.

## 2. Migration Steps

### Step 1: Restructure YAML
Move all semantic content (`format`, `rules`, `options`, `quick_reference`, etc.) inside a new `standard` root key.

**Before (v1):**
```yaml
id: my-standard
rules:
  - id: rule-1
    ...
```

**After (v2):**
```yaml
standard:
  id: my-standard
  name: My Standard Name
  description: ...
  guidelines:
    - "Guideline 1"
    - "Guideline 2"
  
  # Move legacy keys here
  rules:
    - id: rule-1
      ...
```

### Step 2: Add Metadata
Ensure `standard` has a `meta` block (moved or created).

```yaml
standard:
  meta:
    version: "2.0.0"
    updated: "2026-02-04"
    source: core/my-standard.md
```

### Step 3: Define Physical Spec
Add `physical_spec` at the **root level** (sibling to `standard`).

```yaml
physical_spec:
  type: ...
  validator: ...
  simulator: ... (Optional)
```

## 3. Physical Spec Templates

### Pattern A: File Existence Check
Use when the standard requires specific files.

```yaml
physical_spec:
  type: filesystem_schema
  validator:
    command: "test -f REQUIRED_FILE.md"
    rule: "file_exists"
```

### Pattern B: Configuration Check (NPM)
Use when the standard requires a tool configuration.

```yaml
physical_spec:
  type: custom_script
  validator:
    command: "test -f config.js || grep -q '"key":' package.json"
    rule: "config_exists"
```

### Pattern C: Package Installed Check
Use when the standard requires a dependency.

```yaml
physical_spec:
  type: custom_script
  validator:
    command: "npm list package-name > /dev/null 2>&1"
    rule: "package_installed"
```

### Pattern D: Simulator (Predictive)
Use when the standard can validate specific input (e.g., commit message).

```yaml
physical_spec:
  type: custom_script
  validator:
    command: "test -f config.js"
    rule: "env_check"
  simulator:
    type: command
    command: 'echo "{input}" | npx tool-name'
```

## 4. Verification

1.  **Install Standard locally**:
    ```bash
    cp ai/standards/my-standard.ai.yaml .standards/
    ```

2.  **Run Check**:
    ```bash
    node cli/bin/uds.js check --standard my-standard
    ```

3.  **Expected Output**:
    *   `✓ Validation Passed` (if env satisfies spec)
    *   `✗ Validation Failed` (if env violates spec)
    *   **CRITICAL**: Must NOT fail with "Parse Error".

## 5. Agent Prompt Template

When assigning this task to an AI:

```markdown
Upgrade `ai/standards/{id}.ai.yaml` to UDS v2 format.
1. Wrap existing content in `standard: {}`.
2. Add `physical_spec` to check for {requirement}.
3. Verify using `node cli/bin/uds.js check --standard {id}`.
```

