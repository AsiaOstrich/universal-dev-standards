# [SPEC-MARKET-01] Agent Marketplace / 代理市場

**Priority**: P2
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-MARKET-001
**Dependencies**: [SPEC-AGENT-CREATE-01 Custom Agent Creation, SPEC-SANDBOX-01 Agent Sandbox]

---

## Summary / 摘要

The Agent Marketplace provides a decentralized, Git-based registry for discovering, sharing, and installing community-created agents and workflows. It follows the Homebrew Taps model, avoiding centralized infrastructure while enabling rich discoverability.

代理市場提供去中心化、基於 Git 的註冊表，用於發現、分享和安裝社群建立的代理和工作流程。它遵循 Homebrew Taps 模式，避免集中式基礎設施同時實現豐富的可發現性。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **No Sharing Mechanism**: Users can't easily share custom agents
2. **Discovery Problem**: Hard to find agents others have created
3. **Trust Issues**: No way to verify agent quality or safety
4. **Maintenance Burden**: Centralized marketplace is expensive

### Solution / 解決方案

A Git-based marketplace that:
- Uses GitHub/GitLab repos as agent registries
- Provides discoverability via index aggregation
- Enables community reviews and ratings
- Requires no centralized infrastructure

---

## User Stories / 使用者故事

### US-1: Agent Discovery

```
As a developer looking for a security-focused agent,
I want to search the marketplace for security agents,
So that I can find one that fits my needs.

作為尋找安全導向代理的開發者，
我想要在市場中搜尋安全代理，
讓我能找到符合需求的代理。
```

### US-2: Agent Installation

```
As a developer who found a useful agent,
I want to install it with a single command,
So that I can start using it immediately.

作為找到有用代理的開發者，
我想要用單一命令安裝它，
讓我可以立即開始使用。
```

### US-3: Agent Publishing

```
As a developer who created a useful agent,
I want to publish it to the marketplace,
So that others can benefit from my work.

作為建立有用代理的開發者，
我想要發布到市場，
讓其他人能從我的工作中受益。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Registry Format

**Given** an agent registry repository
**When** structured correctly
**Then** it contains:

```
my-agents-registry/
├── registry.json           # Index of all agents
├── agents/
│   ├── security-scanner/
│   │   ├── AGENT.md        # Agent definition
│   │   ├── README.md       # Usage documentation
│   │   └── metadata.json   # Marketplace metadata
│   └── api-tester/
│       └── ...
└── workflows/
    └── security-audit/
        └── ...
```

### AC-2: Registry Index

**Given** a registry has multiple agents
**When** the registry.json is read
**Then** it contains:

```json
{
  "name": "awesome-agents",
  "version": "1.0.0",
  "description": "A collection of security-focused agents",
  "agents": [
    {
      "name": "security-scanner",
      "version": "2.1.0",
      "description": "Scans code for security vulnerabilities",
      "author": "security-team",
      "tags": ["security", "scanning", "owasp"],
      "downloads": 1523,
      "rating": 4.8
    }
  ],
  "workflows": []
}
```

### AC-3: Search and Discovery

**Given** I run `uds marketplace search security`
**When** connected registries are queried
**Then** matching agents are displayed:

```
Searching marketplace for "security"...

Found 5 agents:

security-scanner        v2.1.0  ★★★★★ (48)
  Scans code for security vulnerabilities
  by: security-team | registry: awesome-agents

dependency-auditor      v1.3.0  ★★★★☆ (23)
  Audits npm/pip dependencies for CVEs
  by: devops-guild | registry: devops-agents

...

Install with: uds marketplace install <agent-name>
```

### AC-4: Agent Installation

**Given** I run `uds marketplace install security-scanner`
**When** the agent is found
**Then**:
- Agent is downloaded from registry
- Installed to `.claude/agents/`
- Verification performed (checksum, signature)
- Success message displayed

### AC-5: Registry Management

**Given** I want to add a custom registry
**When** I run `uds marketplace add <registry-url>`
**Then**:
- Registry is added to configuration
- Registry index is fetched and cached
- Agents become searchable

```bash
# Add registry
uds marketplace add https://github.com/org/agents-registry

# List registries
uds marketplace registries

# Remove registry
uds marketplace remove <registry-name>
```

### AC-6: Publishing

**Given** I have a custom agent
**When** I run `uds marketplace publish`
**Then**:
- Agent is validated
- Metadata is generated
- Instructions for PR to registry shown

---

## Technical Design / 技術設計

### Git-Based Architecture / Git 架構

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Git-Based Marketplace Architecture                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │              Central Index (Optional)                    │          │
│   │   github.com/uds/marketplace-index                       │          │
│   │   • Aggregates registry metadata                         │          │
│   │   • Provides search API                                  │          │
│   │   • Not required for local operation                     │          │
│   └─────────────────────────────────────────────────────────┘          │
│                             │                                           │
│               ┌─────────────┴─────────────┐                             │
│               ▼                           ▼                             │
│   ┌─────────────────────┐     ┌─────────────────────┐                  │
│   │   Registry A         │     │   Registry B         │                 │
│   │   (GitHub repo)      │     │   (GitLab repo)      │                 │
│   │                      │     │                      │                 │
│   │ ├── registry.json    │     │ ├── registry.json    │                 │
│   │ ├── agents/          │     │ ├── agents/          │                 │
│   │ └── workflows/       │     │ └── workflows/       │                 │
│   └─────────────────────┘     └─────────────────────┘                  │
│               │                           │                             │
│               └───────────┬───────────────┘                             │
│                           ▼                                             │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                   Local Client                           │          │
│   │   ~/.uds/marketplace/                                    │          │
│   │   ├── registries.json   # Subscribed registries         │          │
│   │   └── cache/            # Cached registry data          │          │
│   └─────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Agent Metadata / 代理元資料

```json
// agents/security-scanner/metadata.json
{
  "name": "security-scanner",
  "version": "2.1.0",
  "description": "Scans code for security vulnerabilities",
  "author": {
    "name": "Security Team",
    "email": "security@example.com",
    "url": "https://github.com/security-team"
  },
  "license": "MIT",
  "tags": ["security", "scanning", "owasp", "sast"],
  "uds-version": ">=4.0.0",
  "compatibility": {
    "claude-code": true,
    "cursor": true,
    "opencode": true
  },
  "checksum": "sha256:abc123...",
  "signature": "...",
  "repository": "https://github.com/security-team/security-scanner"
}
```

### CLI Commands / CLI 命令

```bash
# Search marketplace
uds marketplace search <query>
uds marketplace search --tag security
uds marketplace search --author security-team

# Install agents
uds marketplace install <agent-name>
uds marketplace install <registry>/<agent-name>
uds marketplace install <agent-name>@<version>

# Registry management
uds marketplace add <registry-url>
uds marketplace remove <registry-name>
uds marketplace registries
uds marketplace update          # Refresh all registries

# Publishing
uds marketplace publish --registry <registry-url>
uds marketplace validate        # Validate before publish

# Agent info
uds marketplace info <agent-name>
uds marketplace versions <agent-name>
```

### Verification / 驗證

```javascript
// marketplace/verifier.js
export async function verifyAgent(agentPath, metadata) {
  const checks = [];

  // Checksum verification
  const actualHash = await calculateHash(agentPath);
  checks.push({
    name: 'checksum',
    passed: actualHash === metadata.checksum,
  });

  // Signature verification (if signed)
  if (metadata.signature) {
    const verified = await verifySignature(agentPath, metadata.signature);
    checks.push({
      name: 'signature',
      passed: verified,
    });
  }

  // UDS version compatibility
  checks.push({
    name: 'version-compatibility',
    passed: semver.satisfies(UDS_VERSION, metadata['uds-version']),
  });

  return checks;
}
```

---

## Security Considerations / 安全考量

| Concern | Mitigation |
|---------|------------|
| Malicious agents | Checksum verification, community reports |
| Impersonation | Author verification, GPG signatures |
| Supply chain attacks | Version pinning, lock files |
| Code execution | Sandbox execution (SPEC-SANDBOX-01) |

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Registry unavailable | Medium | Local cache, multiple registries |
| Malicious agents | High | Verification, sandboxing, reports |
| Version conflicts | Low | Version pinning, lock files |

---

## Out of Scope / 範圍外

- Paid/premium agents
- In-app purchases
- Rating/review backend
- Central search API

---

## Sync Checklist

### Starting from System Spec
- [ ] Create marketplace CLI module
- [ ] Define registry format schema
- [ ] Implement search aggregation
- [ ] Create verification system
- [ ] Update translations (zh-TW, zh-CN)

---

## References / 參考資料

- [Homebrew Taps](https://docs.brew.sh/Taps)
- [npm Registry](https://docs.npmjs.com/cli/v9/using-npm/registry)
- [Hugging Face Hub](https://huggingface.co/docs/hub/)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
