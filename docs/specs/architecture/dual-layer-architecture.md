# SPEC-001: UDS Dual-Layer Architecture (Standard-World-Model)

| Metadata | Value |
| :--- | :--- |
| **Title** | **Dual-Layer Architecture: Physical Constraints & Imagination Guidance** |
| **Status** | **Draft (Proposal)** |
| **Type** | Architecture / Core |
| **Author** | Gemini CLI (Collaborative Session) |
| **Date** | 2026-02-04 |
| **Related** | `core/anti-hallucination.md`, `core/spec-driven-development.md` |

## 1. Context & Motivation (背景與動機)

### 1.1 The Hallucination Gap (幻覺落差)
Current UDS standards rely heavily on **Natural Language** (Markdown). AI Agents (the "Imagination Layer") must interpret these vague texts to generate code. When the AI's interpretation deviates from the actual runtime environment (the "Physical Layer"), hallucinations occur (e.g., calling non-existent scripts, using wrong folder structures).

### 1.2 The World Model Inspiration (世界模型啟發)
Drawing from the *Web World Models* research, we recognize that effective Agents require:
1.  **A Physical Layer**: Deterministic rules, schemas, and validators (The Ground Truth).
2.  **An Imagination Layer**: Probabilistic reasoning and planning (The AI's Mind).

### 1.3 Goal (目標)
To restructure UDS standards into a **Dual-Layer System**, providing machine-readable constraints (Physical) alongside semantic guidelines (Imagination), creating a robust "World Model" for software development.

---

## 2. Architectural Design (架構設計)

We propose splitting every Standard and Skill into two distinct components:

### 2.1 The Physical Layer (Constraint & Validation)
*   **Definition**: Machine-readable artifacts that define "Success" and "Failure" deterministically.
*   **Artifacts**:
    *   **Schemas**: JSON Schema / YAML Schema (for configs, APIs, specs).
    *   **Validators**: CLI commands that return Exit Code 0 or 1.
    *   **Templates**: Strict code scaffoldings (not just examples).
*   **Role**: To reject invalid actions from the Imagination Layer immediately.

### 2.2 The Imagination Layer (Context & Reasoning)
*   **Definition**: Human-readable and AI-friendly context that explains "Why" and "How".
*   **Artifacts**:
    *   **Guidelines**: Semantic explanations (existing Markdown).
    *   **Reasoning Prompts**: Instructions on *how* to think about the problem.
    *   **Few-Shot Examples**: Paired Input/Output data to train the AI's context.
*   **Role**: To generate high-probability valid actions based on the Physical Layer's constraints.

---

## 3. Specification Details (規格細節)

### 3.1 Standard File Format Upgrade (`.ai.yaml` v2)

The `.standards/*.ai.yaml` files will be expanded to include a `physical_spec` section.

**Example: `project-structure.ai.yaml`**

```yaml
# [Imagination Layer] - Used for Prompting
standard:
  id: "STR-001"
  name: "Project Structure"
  description: "Standard directory layout for UDS projects."
  guidelines:
    - "All source code must reside in src/"
    - "Tests must mirror source structure in tests/"

# [Physical Layer] - Used for Validation (NEW)
physical_spec:
  type: "filesystem_schema"
  schema:
    root:
      required: ["src", "tests", "docs"]
      banned: ["code", "lib", "test"] # Anti-patterns
  validator:
    command: "ls -R"
    rule: "must_match_schema"
```

### 3.2 Skill Definition Upgrade (`SKILL.md` v2)

Skills will explicitly reference the Physical Layer to perform "Reality Checks".

**Example: `skills/commit-standards/SKILL.md`**

```markdown
# [Imagination]
## Instruction
You are an expert at writing Conventional Commits.
Analyze the changes and write a commit message.

# [Physical Binding] (NEW)
## Reality Check
Before returning the final answer, you MUST:
1. Run the validator: `echo "{message}" | npx commitlint`
2. IF exit_code != 0:
   - Read the error message.
   - REVISE the message in your "Imagination".
   - RETRY until exit_code == 0.
```

### 3.3 CLI "Simulator" Mode

The UDS CLI will introduce a simulation mode to act as the feedback loop.

*   **Command**: `uds simulate <action> <payload>`
*   **Function**: Runs the Physical Validator for a specific standard without actually committing/saving (Dry Run).
*   **Output**: Structured JSON for the AI to parse.
    ```json
    {
      "valid": false,
      "errors": ["Subject line must not end with a period"],
      "hint": "Remove the '.' at the end"
    }
    ```

---

## 4. Implementation Roadmap (實作路線圖)

### Phase 1: Foundation (The Hardening)
*   [ ] Define schema for `physical_spec` in `.ai.yaml`.
*   [ ] Create JSON Schemas for key standards: `project-structure`, `commit-message`, `naming-conventions`.

### Phase 2: Integration (The Binding)
*   [ ] Update `skill-creator` to enforce "Reality Check" sections in new skills.
*   [ ] Update core Skills (Commit, Refactor, Spec) to use CLI Validators.

### Phase 3: The Loop (The World Model)
*   [ ] Implement `uds simulate` command.
*   [ ] Implement "Self-Correction" loops in AI Agents (Agent tries -> CLI rejects -> Agent retries).

---

## 5. Success Metrics (成功指標)

*   **Reduction in "Syntax Errors"**: Code generated by Agents passes Linting/Compilation 95% of the time on the first try.
*   **Structure Compliance**: 100% of generated projects follow the directory schema.
*   **Feedback Loop**: Agents demonstrate at least 1 self-correction step when their initial "imagination" fails the "physical" check.
