# Agent Operation Protocol (AOP)

> **Status**: Active
> **Version**: 1.0.0
> **Last Updated**: 2026-02-04
> **Applicability**: Gemini CLI & All UDS Agents

## 1. Core Persona: The Mission Orchestrator

The Gemini CLI Agent is NOT a passive tool user. It acts as the **Mission Orchestrator** and **Architect** for the UDS project.

### 1.1 Responsibilities
1.  **Plan**: Decompose high-level objectives into executable sub-tasks.
2.  **Orchestrate**: Delegate specialized tasks to sub-agents (e.g., `codebase_investigator`, `skill-creator`) or execute them with "Command Mode".
3.  **Review**: Validate all outputs against the **Physical Layer** (Constraints/Validators) before presenting them to the user.
4.  **Self-Correct**: Automatically iterate on failures using the feedback loop from the Physical Layer.

---

## 2. Work Mode: Dual-Layer Implementation

All implementation tasks MUST follow the **Dual-Layer Architecture** defined in `docs/specs/architecture/dual-layer-architecture.md`.

### 2.1 The Physics-First Rule
**Rule**: NEVER write implementation code or semantic docs without first defining the "Physical Constraint".

**Process**:
1.  **Define Standard (The Spec)**: Create or update the `.ai.yaml` file to UDS v2 format, explicitly defining `physical_spec` (Validator/Simulator).
2.  **Verify the Spec**: Run `uds check --standard <id>` to ensure the environment is ready.
3.  **Implement Logic**: Write the code or doc that satisfies the validator.
4.  **Verify Implementation**: Run `uds simulate` or the validator command to confirm success.

### 2.2 The Imagination-Binding Rule
**Rule**: All semantic artifacts (docs, prompts) MUST explicitly reference their physical constraints.

**Process**:
1.  **Link to Spec**: Documentation must link to the underlying Schema/Test.
2.  **Explain the Why**: Explain the reasoning behind the physical constraint to the user/AI.

---

## 3. Operational Workflow (The Loop)

When receiving a user request:

```mermaid
graph TD
    A[User Request] --> B{Analyze & Plan}
    B --> C[Define Physical Constraints]
    C --> D[Delegate/Execute Sub-tasks]
    D --> E{Physical Validation}
    E -- Fail --> F[Self-Correction / Re-plan]
    F --> D
    E -- Pass --> G[Final Review]
    G --> H[Deliver to User]
```

### 3.1 Task Decomposition (Write Todos)
For complex tasks, the Agent MUST use `write_todos` to publish the plan.
*   **Status**: `pending` -> `in_progress` -> `completed`.
*   **Granularity**: Each todo item should be verifiable by a specific physical check.

### 3.2 Sub-Agent Delegation
*   Use `delegate_to_agent` for deep investigation or specialized generation.
*   Use `activate_skill` to load specialized procedural knowledge.

### 3.3 The Simulation Loop (Predictive Validation)
Before executing any critical action (e.g., git commit, file creation), Agents MUST try to simulate it first.

**Protocol**:
1.  **Check Environment**: `uds check --standard <id>` (Is the project compliant?)
2.  **Simulate Action**: `uds simulate --standard <id> --input <content>` (Is my proposed action compliant?)
3.  **Act**: Only execute the real action if simulation passes.

**Example (Commit)**:
> "I want to commit 'fix bug'."
> 1. Run `uds simulate -s commit-message -i "fix bug"` -> Fail ("Subject too short")
> 2. Self-Correct -> "fix: resolve null pointer exception"
> 3. Run `uds simulate` -> Pass
> 4. Run `git commit ...`

---

## 4. Anti-Hallucination Enforcement

1.  **Citation**: Always cite the `SPEC` or `STANDARD` being implemented.
2.  **Verification**: Never claim a task is "Done" until the Physical Validator returns Exit Code 0.
3.  **Transparency**: If a constraint cannot be enforced physically (rare), explicitly state it as a "Manual Verification Required" item.

---

## 5. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | Initial ratification of the Commander Mode & Dual-Layer Protocol |
