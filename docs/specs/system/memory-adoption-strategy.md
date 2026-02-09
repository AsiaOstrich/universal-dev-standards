# Memory Adoption Strategy

> **Language**: English | [繁體中文](../../../locales/zh-TW/docs/specs/system/memory-adoption-strategy.md)

This document provides strategic guidance for adopting Universal Development Standards (UDS) memory systems across different team sizes and operational models. It helps users decide how to structure their **Project Context Memory (PCM)** and **Developer Persistent Memory (DPM)** for maximum effectiveness.

---

## 1. Decision Matrix

Choose the strategy that best fits your operational model:

| Strategy | Target Audience | Storage Location | Knowledge Flow | Key Benefit |
| :--- | :--- | :--- | :--- | :--- |
| **Digital Garden** | Solo Developers, Freelancers | Local Global (`~/.uds/memory`) | Project → User | **Portability**: Your experience travels with you. |
| **Repo-Centric** | Startups, Small Teams | Project Local (`.project-context/`) | User → Project | **Consistency**: "Batteries included" onboarding for new members. |
| **Hub-and-Spoke** | Enterprises, Multi-Project Orgs | Git Submodule / Registry | Hub ↔ Spoke | **Standardization**: Enforce compliance across strict boundaries. |

---

## 2. Strategy A: Digital Garden (Solo/Freelancer)

**Philosophy**: "I am the carrier of knowledge."

The goal is to accumulate personal experience across many temporary projects. The AI acts as your personal pair programmer that learns *your* preferences.

### Configuration
- **Global Memory**: Active. Store stack-specific insights (e.g., "React Tips", "Python Tricks") in `~/.uds/memory/`.
- **Project Memory**: Minimal. Only store credentials, specific paths, or temporary business logic.

### Workflow
1.  **Encounter Issue**: Solve a tricky React rendering bug in Project A.
2.  **Promote**: Tell AI: "Save this as a generic React pattern to my global memory."
3.  **Reuse**: Open Project B. AI immediately suggests the pattern when you write similar code, because it reads `~/.uds/memory`.

### Setup
```bash
# 1. Create global directory
mkdir -p ~/.uds/memory

# 2. (Optional) Initialize as git repo for backup
cd ~/.uds/memory && git init
```

---

## 3. Strategy B: Repo-Centric (Small Team)

**Philosophy**: "The Repo is the Source of Truth."

The goal is to ensure every team member (and their AI Agent) has the exact same context. Personal preferences should not override project conventions.

### Configuration
- **Global Memory**: **Disabled** or Read-Only. Prevents "works on my machine/AI" issues.
- **Project Memory**: Extensive. All architectural decisions, coding styles, and domain terms live in `.project-context/` and are committed to Git.

### Workflow
1.  **Onboarding**: New member clones the repo.
2.  **Instant Context**: Their AI reads `.project-context/` and immediately knows: "We use Hexagonal Architecture" and "Variables must be snake_case".
3.  **Consensus**: When the team agrees on a new rule in Code Review, one person instructs AI: "Add this rule to Project Context."
4.  **Sync**: The new `.md` file is committed and pushed. Everyone gets the update on next `git pull`.

---

## 4. Strategy C: Hub-and-Spoke (Enterprise)

**Philosophy**: "Governance and Compliance."

The goal is to share common standards across hundreds of projects while allowing local flexibility.

### Configuration
- **Core Layer (The Hub)**: A dedicated Git repository (e.g., `acme-corp/standard-memory`) containing company-wide security rules and architecture patterns.
- **Project Layer (The Spoke)**: Local `.project-context/` for app-specific logic.

### Implementation: Git Submodules
Each project mounts the central memory as a submodule.

```bash
# In Project A, B, and C:
git submodule add git@github.com:acme-corp/standard-memory.git .standards/shared
```

### Workflow
1.  **Policy Update**: Security team updates "Auth Standards" in Hub repo.
2.  **Propagation**: Projects update their submodules to pull the new standards.
3.  **Validation**: CI/CD pipeline checks if project code complies with updated rules in `.standards/shared`.

---

## 5. Summary

| If you want to... | Use Strategy... |
| :--- | :--- |
| Stop repeating yourself across freelance gigs | **Digital Garden** |
| Get new hires productive in Day 1 | **Repo-Centric** |
| Ensure 50+ microservices follow security spec | **Hub-and-Spoke** |
