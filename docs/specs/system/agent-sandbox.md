# [SPEC-SANDBOX-01] Agent Sandbox Environment / 代理沙盒環境

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-SANDBOX-001
**Dependencies**: [CLI-AGENT-001 Agents & Workflows System, SPEC-HITL-01 HITL Protocol]

---

## Summary / 摘要

The Agent Sandbox Environment provides an isolated execution context for AI agents, preventing unintended access to sensitive files, environment variables, and system resources. It enforces tool permissions and provides audit logging.

代理沙盒環境為 AI 代理提供隔離的執行環境，防止意外存取敏感檔案、環境變數和系統資源。它強制執行工具權限並提供審計日誌。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Unrestricted Access**: Agents can access any file the user can access
2. **Secret Exposure**: Agents may inadvertently read `.env` or credentials
3. **No Isolation**: Agent errors can affect the entire system
4. **Trust Deficit**: Users hesitate to use powerful agents

### Solution / 解決方案

A sandbox system that:
- Restricts file system access to project directory
- Filters environment variables
- Enforces agent-defined tool permissions
- Provides execution isolation

---

## User Stories / 使用者故事

### US-1: Credential Protection

```
As a developer using AI agents,
I want agents to be blocked from reading my .env file,
So that my API keys are not exposed to AI.

作為使用 AI 代理的開發者，
我想要代理被阻止讀取我的 .env 檔案，
讓我的 API 金鑰不會暴露給 AI。
```

### US-2: Directory Isolation

```
As a developer with multiple projects,
I want agents to only access the current project,
So that other projects remain private.

作為有多個專案的開發者，
我想要代理只存取當前專案，
讓其他專案保持私密。
```

### US-3: Tool Enforcement

```
As a developer using a read-only agent,
I want the sandbox to enforce read-only restrictions,
So that the agent cannot modify files even if it tries.

作為使用唯讀代理的開發者，
我想要沙盒強制執行唯讀限制，
讓代理即使嘗試也無法修改檔案。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: File System Restrictions

**Given** an agent is running in sandbox mode
**When** it attempts to access files
**Then**:

| Path Pattern | Access |
|--------------|--------|
| `./` (project root) | Allowed (per tool permissions) |
| `~/.ssh/` | Blocked |
| `~/.aws/` | Blocked |
| `/etc/` | Blocked |
| `../*` (parent directories) | Blocked |
| Other projects | Blocked |

### AC-2: Sensitive File Protection

**Given** an agent attempts to read sensitive files
**When** the file matches sensitive patterns
**Then** access is denied:

**Sensitive Patterns**:
```
.env
.env.*
*.pem
*.key
*credentials*
*secret*
.aws/
.ssh/
.gnupg/
```

### AC-3: Environment Variable Filtering

**Given** an agent runs in sandbox
**When** it accesses environment variables
**Then**:

| Variable Pattern | Behavior |
|------------------|----------|
| `PATH`, `HOME`, `USER` | Allowed |
| `NODE_ENV`, `DEBUG` | Allowed |
| `*_KEY`, `*_SECRET`, `*_TOKEN` | Filtered (returns undefined) |
| `AWS_*`, `GITHUB_*` | Filtered |
| Custom allowlist | Configurable |

### AC-4: Tool Permission Enforcement

**Given** an agent has `disallowed-tools: [Write, Edit]`
**When** sandbox executes the agent
**Then**:
- Write tool calls are blocked
- Edit tool calls are blocked
- Blocked attempts are logged

### AC-5: Network Restrictions

**Given** an agent runs in sandbox
**When** network access is attempted
**Then**:

| Action | Default Behavior |
|--------|-----------------|
| `fetch` to external URLs | Blocked (configurable) |
| `localhost` access | Allowed |
| Git remote operations | Allowed (configurable) |

### AC-6: Sandbox Configuration

**Given** sandbox settings are configured
**When** agent executes
**Then** settings are applied:

```yaml
# .uds/config.yaml
sandbox:
  enabled: true

  filesystem:
    root: ./  # Restrict to project root
    blocked-patterns:
      - "**/.env*"
      - "**/*.pem"
      - "**/credentials*"
    allowed-patterns:
      - ".env.example"  # Allow template

  environment:
    filter-secrets: true
    allow:
      - NODE_ENV
      - DEBUG
      - CI
    block:
      - AWS_*
      - GITHUB_TOKEN

  network:
    allow-external: false
    allow-localhost: true
    allow-git: true

  tools:
    enforce-agent-permissions: true
```

---

## Technical Design / 技術設計

### Sandbox Architecture / 沙盒架構

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Sandbox Architecture                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Agent Request                                                          │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ Sandbox Interceptor                                     │           │
│   │                                                         │           │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │           │
│   │  │ File Guard  │  │ Env Filter  │  │ Tool Guard  │    │           │
│   │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │           │
│   │         │                │                │            │           │
│   │         ▼                ▼                ▼            │           │
│   │  ┌─────────────────────────────────────────────────┐  │           │
│   │  │            Policy Engine                         │  │           │
│   │  │  • Check path against patterns                   │  │           │
│   │  │  • Filter environment variables                  │  │           │
│   │  │  • Verify tool permissions                       │  │           │
│   │  └─────────────────────────────────────────────────┘  │           │
│   │                          │                             │           │
│   │                          ▼                             │           │
│   │  ┌─────────────────────────────────────────────────┐  │           │
│   │  │            Audit Logger                          │  │           │
│   │  │  • Log all access attempts                       │  │           │
│   │  │  • Record blocked operations                     │  │           │
│   │  └─────────────────────────────────────────────────┘  │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ├── Allowed ──→ Execute                                          │
│        └── Blocked ──→ Return error, log                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### File Guard Implementation / 檔案守衛實作

```javascript
// sandbox/file-guard.js
export class FileGuard {
  constructor(config) {
    this.root = path.resolve(config.root);
    this.blockedPatterns = config['blocked-patterns'];
    this.allowedPatterns = config['allowed-patterns'];
  }

  checkAccess(filePath, operation) {
    const absolutePath = path.resolve(filePath);

    // Must be within project root
    if (!absolutePath.startsWith(this.root)) {
      return { allowed: false, reason: 'Outside project root' };
    }

    // Check blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (minimatch(filePath, pattern)) {
        // Check if explicitly allowed
        const isAllowed = this.allowedPatterns.some(p =>
          minimatch(filePath, p)
        );
        if (!isAllowed) {
          return { allowed: false, reason: `Matches blocked pattern: ${pattern}` };
        }
      }
    }

    return { allowed: true };
  }
}
```

### Environment Filter / 環境變數過濾器

```javascript
// sandbox/env-filter.js
export class EnvFilter {
  constructor(config) {
    this.filterSecrets = config['filter-secrets'];
    this.allowList = config.allow || [];
    this.blockList = config.block || [];
  }

  filter(env) {
    const filtered = {};

    for (const [key, value] of Object.entries(env)) {
      if (this.isBlocked(key)) {
        continue; // Skip blocked
      }

      if (this.isAllowed(key)) {
        filtered[key] = value;
        continue;
      }

      if (this.filterSecrets && this.looksLikeSecret(key)) {
        continue; // Skip secrets
      }

      filtered[key] = value;
    }

    return filtered;
  }

  looksLikeSecret(key) {
    const patterns = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'CREDENTIAL'];
    return patterns.some(p => key.toUpperCase().includes(p));
  }
}
```

### CLI Commands / CLI 命令

```bash
# Enable sandbox mode globally
uds configure --global set sandbox.enabled true

# Run agent with explicit sandbox
uds agent run code-architect --sandbox

# Disable sandbox for trusted operation
uds agent run code-architect --no-sandbox

# View sandbox audit log
uds sandbox log
uds sandbox log --blocked-only

# Test sandbox configuration
uds sandbox test
```

---

## Audit Log Format / 審計日誌格式

```json
{
  "timestamp": "2026-01-28T10:30:00Z",
  "agent": "code-architect",
  "operation": "read",
  "target": "./src/auth/login.js",
  "result": "allowed",
  "policy": "within-project-root"
}

{
  "timestamp": "2026-01-28T10:30:05Z",
  "agent": "code-architect",
  "operation": "read",
  "target": "./.env",
  "result": "blocked",
  "policy": "sensitive-file-pattern",
  "reason": "Matches blocked pattern: **/.env*"
}
```

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance overhead | Low | Lazy evaluation, caching |
| False positives | Medium | Allow patterns, configuration |
| Bypass attempts | High | Multiple layers, audit logging |

---

## Out of Scope / 範圍外

- Container-level isolation (Docker)
- Memory/CPU limits
- Process isolation
- Network traffic inspection

---

## Sync Checklist

### Starting from System Spec
- [ ] Create sandbox module
- [ ] Integrate with agent executor
- [ ] Add sandbox configuration to cascading config
- [ ] Create audit log viewer
- [ ] Update translations (zh-TW, zh-CN)

---

## References / 參考資料

- [Agents & Workflows System](./agents-workflows-system.md)
- [HITL Protocol](./hitl-protocol.md)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
