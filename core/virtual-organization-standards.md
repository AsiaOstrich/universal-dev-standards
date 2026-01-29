# Virtual Organization Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/virtual-organization-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Applicability**: Project setup and AI tool configuration
**Scope**: universal
**ISO 12207 Mapping**: Organizational Project-Enabling Processes (6.2)

---

## Purpose

This standard treats the AI ecosystem as a "Virtual Organization." It defines how to manage AI capabilities (Skills), infrastructure, and quality assurance as organizational assets, ensuring the "Virtual Workforce" is capable and compliant.

---

## 1. Virtual Workforce Management (Human Resources)

In Vibe Coding, "HR Management" translates to managing the capabilities of your AI Agents.

### 1.1 Skill Management
Skills are the "qualifications" of your virtual employees.

- **Acquisition**: Skills must be explicitly installed (e.g., via `skills/` directory or plugins).
- **Competency**: Skills must be verified for the specific project context.
- **Role Definition**: Agents should be assigned "Roles" (collections of Skills) rather than being generic.

| Role | Recommended Skill Set |
|------|-----------------------|
| **Architect Agent** | `system-design`, `diagram-generation`, `codebase-analysis` |
| **Testing Agent** | `test-runner`, `coverage-analyzer`, `mock-generator` |
| **Refactoring Agent** | `static-analysis`, `code-metrics`, `refactoring-patterns` |

### 1.2 Onboarding (Context Loading)
"Onboarding" an AI Agent means loading the correct context and configuration.
- **Project Induction**: Loading `README.md`, architecture docs, and standards.
- **Rule Alignment**: Loading `core/ai-agreement-standards.md`.

---

## 2. Infrastructure Management (Tooling)

### 2.1 Tool Integration
The "office environment" for AI Agents consists of:
- **MCP Servers**: Standardized integration via Model Context Protocol.
- **API Access**: Secure management of keys and endpoints.
- **Sandbox**: Isolated environments for code execution (to prevent system damage).

### 2.2 Knowledge Base
The "corporate library" for AI Agents:
- **Vector Database**: For large-scale documentation retrieval.
- **Snippets Library**: Reusable code patterns and templates.

---

## 3. Quality Management System (QMS)

### 3.1 Automated Vibe Checks
Quality control is shifted left, into the generation process.
- **Pre-Generation Check**: Does the Agent understand the task?
- **Post-Generation Check**: Does the code compile? Do tests pass?

### 3.2 Hallucination Monitoring
Continuous monitoring of "defect rate" (Hallucinations):
- **Detection**: Using `uds check` and static analysis.
- **Correction**: Updating Context Contracts to prevent recurrence.

---

## Related Standards

- [Testing Standards](testing-standards.md)
- [Check-in Standards](checkin-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial release mapping to ISO 12207 Enabling Processes |
