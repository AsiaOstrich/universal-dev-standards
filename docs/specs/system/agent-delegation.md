# SPEC: Real Agent Delegation Implementation

| Metadata | Value |
| :--- | :--- |
| **Title** | Real Agent Delegation: Moving Beyond Simulation |
| **Status** | Draft (Planned) |
| **Priority** | P1 |
| **Author** | Gemini CLI / Mission Orchestrator |

## 1. Goal
Currently, the "Mission Orchestrator" (Gemini CLI) simulates delegation by acting as the worker. The goal is to enable **actual** delegation to specialized sub-agents that have file-system write access.

## 2. Mechanism
We will implement a bridge that allows `delegate_to_agent` or a custom `uds agent run` command to invoke a separate agent instance.

### 2.1 Communication via MCP
- Implement a **UDS MCP Server**.
- The Server provides tools: `read_standard`, `validate_compliance`, `apply_fix`.
- Orchestrator (Commander) sends a task to the Sub-Agent via the MCP protocol.

### 2.2 Local CLI IPC (Alternative)
- A specialized command `uds agent exec --task "..."` that spawns a sub-shell with a pre-configured system prompt.

## 3. Security & Sandboxing
- Delegated agents should ideally run in a **Sandbox** (Docker or specialized VM) to prevent unauthorized system modifications outside the project scope.
- Use `AGENT-PROTOCOL.md` as the mandatory system prompt for all sub-agents.

## 4. Phase 2 Roadmap
1. [ ] Prototype `uds-mcp-server`.
2. [ ] Define `implementation-agent` persona and capabilities.
3. [ ] Integrate Orchestrator feedback loop with Sub-Agent status reports.
