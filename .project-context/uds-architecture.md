---
id: "PRJ-2026-0001"
type: structure
status: active
created_at: "2026-02-09"
confidence: 1.0
authors: ["gemini-cli"]
scope:
  - "core/**"
  - "ai/standards/**"
  - ".standards/**"
triggers:
  - "create standard"
  - "modify standard"
  - "dual-layer"
related: []
supersedes: []
---

# Dual-Layer Implementation Pattern

## Context
UDS aims to be both human-readable and AI-optimizable. Storing everything in a single format compromises either readability or token efficiency.

## Decision
All standards must be implemented in two layers:
1.  **Human Layer (`core/`)**: Full Markdown documentation for humans.
2.  **AI Layer (`ai/standards/`)**: Token-optimized YAML instructions for AI agents.

## Constraint
- Every standard in `core/` MUST have a corresponding `.ai.yaml` in `ai/standards/`.
- The `ai.yaml` file MUST reference the `core` file in its `meta.source` field.
- When modifying a standard, BOTH files must be updated to stay in sync.
