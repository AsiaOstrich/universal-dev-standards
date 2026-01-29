# [SPEC-API-01] Skills as a Service / 技能即服務

**Priority**: P2
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-API-001
**Dependencies**: None

---

## Summary / 摘要

Skills as a Service provides an API endpoint for querying UDS standard definitions, enabling non-CLI environments (web apps, IDE plugins, CI/CD pipelines) to access and validate against UDS standards programmatically.

技能即服務提供 API 端點用於查詢 UDS 規範定義，使非 CLI 環境（Web 應用、IDE 插件、CI/CD 流水線）能程式化地存取和驗證 UDS 規範。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **CLI-Only Access**: Standards only accessible via CLI
2. **Integration Barriers**: Hard to integrate with web tools
3. **Validation Gaps**: CI/CD can't easily validate against standards
4. **IDE Limitations**: IDEs can't show standard hints

### Solution / 解決方案

A REST API that:
- Exposes standards as queryable resources
- Provides validation endpoints
- Supports standard lookup and search
- Enables third-party integrations

---

## User Stories / 使用者故事

### US-1: CI/CD Validation

```
As a DevOps engineer setting up CI/CD,
I want to validate commits against UDS standards via API,
So that I can enforce standards in my pipeline.

作為設定 CI/CD 的 DevOps 工程師，
我想要透過 API 驗證提交是否符合 UDS 規範，
讓我可以在流水線中強制執行規範。
```

### US-2: IDE Integration

```
As an IDE plugin developer,
I want to query UDS standards for inline hints,
So that I can show relevant standards while coding.

作為 IDE 插件開發者，
我想要查詢 UDS 規範以顯示內聯提示，
讓我可以在編碼時顯示相關規範。
```

### US-3: Web Dashboard

```
As a team lead with a compliance dashboard,
I want to fetch standard definitions via API,
So that I can display them in our internal tools.

作為有合規儀表板的團隊負責人，
我想要透過 API 取得規範定義，
讓我可以在內部工具中顯示它們。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Standards Listing

**Given** the API is running
**When** I request `GET /api/v1/standards`
**Then** response includes:

```json
{
  "standards": [
    {
      "id": "commit-message-guide",
      "name": "Commit Message Guide",
      "version": "2.0.0",
      "category": "git",
      "scope": "universal",
      "url": "/api/v1/standards/commit-message-guide"
    },
    {
      "id": "testing-standards",
      "name": "Testing Standards",
      "version": "1.5.0",
      "category": "quality",
      "scope": "universal",
      "url": "/api/v1/standards/testing-standards"
    }
  ],
  "total": 23,
  "page": 1,
  "per_page": 20
}
```

### AC-2: Standard Detail

**Given** I request a specific standard
**When** I call `GET /api/v1/standards/commit-message-guide`
**Then** response includes:

```json
{
  "id": "commit-message-guide",
  "name": "Commit Message Guide",
  "version": "2.0.0",
  "last_updated": "2026-01-20",
  "category": "git",
  "scope": "universal",
  "description": "Guidelines for writing clear commit messages",
  "content": "## Purpose\n\nThis standard defines...",
  "rules": [
    {
      "id": "commit-format",
      "description": "Conventional commits format",
      "severity": "error"
    }
  ],
  "translations": {
    "zh-TW": "/api/v1/standards/commit-message-guide?lang=zh-TW",
    "zh-CN": "/api/v1/standards/commit-message-guide?lang=zh-CN"
  }
}
```

### AC-3: Validation Endpoint

**Given** I want to validate content
**When** I call `POST /api/v1/validate`
**Then** validation result is returned:

```json
// Request
{
  "type": "commit-message",
  "content": "Added new feature"
}

// Response
{
  "valid": false,
  "violations": [
    {
      "rule": "commit-format",
      "severity": "error",
      "message": "Commit message does not follow conventional format",
      "suggestion": "Use format: type(scope): subject"
    }
  ],
  "standard": "commit-message-guide",
  "version": "2.0.0"
}
```

### AC-4: Search

**Given** I search for standards
**When** I call `GET /api/v1/standards/search?q=test`
**Then** matching standards returned:

```json
{
  "query": "test",
  "results": [
    {
      "id": "testing-standards",
      "name": "Testing Standards",
      "relevance": 0.95,
      "matches": ["title", "content"]
    },
    {
      "id": "tdd-standards",
      "name": "Test-Driven Development",
      "relevance": 0.82,
      "matches": ["title"]
    }
  ],
  "total": 2
}
```

### AC-5: Authentication

**Given** API requires authentication
**When** requests are made
**Then** auth is validated:

| Auth Method | Use Case |
|-------------|----------|
| API Key | Server-to-server |
| OAuth | Web applications |
| No Auth | Public read endpoints |

### AC-6: Rate Limiting

**Given** API is in production
**When** requests exceed limits
**Then** rate limiting applies:

| Tier | Limit | Reset |
|------|-------|-------|
| Anonymous | 100/hour | Hourly |
| API Key | 10,000/hour | Hourly |
| Enterprise | Unlimited | - |

---

## Technical Design / 技術設計

### API Architecture / API 架構

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Skills API Architecture                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                    API Gateway                           │          │
│   │  • Rate limiting                                         │          │
│   │  • Authentication                                        │          │
│   │  • Request validation                                    │          │
│   └─────────────────────────────────────────────────────────┘          │
│                             │                                           │
│               ┌─────────────┴─────────────┐                             │
│               ▼                           ▼                             │
│   ┌─────────────────────┐     ┌─────────────────────┐                  │
│   │   Standards Service  │     │  Validation Service  │                 │
│   │                      │     │                      │                 │
│   │ • List standards     │     │ • Validate content   │                 │
│   │ • Get standard       │     │ • Apply rules        │                 │
│   │ • Search standards   │     │ • Return violations  │                 │
│   └──────────┬───────────┘     └──────────┬───────────┘                 │
│              │                            │                              │
│              └────────────┬───────────────┘                             │
│                           ▼                                             │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                  Standards Repository                    │          │
│   │  • Markdown files                                        │          │
│   │  • Rule definitions                                      │          │
│   │  • Translations                                          │          │
│   └─────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Endpoints / 端點

```
Base URL: https://api.uds.dev/v1

Standards:
  GET    /standards                    # List all standards
  GET    /standards/:id                # Get standard by ID
  GET    /standards/:id/rules          # Get rules for standard
  GET    /standards/search             # Search standards

Validation:
  POST   /validate                     # Validate content
  POST   /validate/commit              # Validate commit message
  POST   /validate/code                # Validate code snippet

Agents:
  GET    /agents                       # List agents
  GET    /agents/:id                   # Get agent definition

Workflows:
  GET    /workflows                    # List workflows
  GET    /workflows/:id                # Get workflow definition

Meta:
  GET    /health                       # Health check
  GET    /version                      # API version info
```

### Response Format / 回應格式

```json
{
  "data": { ... },
  "meta": {
    "version": "1.0.0",
    "timestamp": "2026-01-28T10:30:00Z"
  },
  "links": {
    "self": "/api/v1/standards/commit-message-guide",
    "collection": "/api/v1/standards"
  }
}
```

### Error Format / 錯誤格式

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Content does not meet standards",
    "details": [...]
  },
  "meta": {
    "request_id": "req-12345"
  }
}
```

### Deployment Options / 部署選項

| Option | Use Case | Maintenance |
|--------|----------|-------------|
| **Serverless** | Low traffic, cost-sensitive | Minimal |
| **Container** | Medium traffic, self-hosted | Medium |
| **Edge** | High performance, global | High |
| **Embedded** | CLI/offline use | None |

---

## SDK Support / SDK 支援

### JavaScript/TypeScript

```typescript
import { UDSClient } from '@anthropic/uds-sdk';

const client = new UDSClient({ apiKey: 'your-key' });

// List standards
const standards = await client.standards.list();

// Validate commit
const result = await client.validate.commit('feat: add login');
if (!result.valid) {
  console.log(result.violations);
}
```

### Python

```python
from uds import UDSClient

client = UDSClient(api_key="your-key")

# List standards
standards = client.standards.list()

# Validate commit
result = client.validate.commit("feat: add login")
if not result.valid:
    print(result.violations)
```

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| API abuse | Medium | Rate limiting, auth |
| Stale standards | Low | Sync with Git repo |
| Server costs | Medium | Serverless, caching |

---

## Out of Scope / 範圍外

- Real-time validation (WebSocket)
- Standard creation via API
- User management
- Billing/payment

---

## Sync Checklist

### Starting from System Spec
- [ ] Design OpenAPI specification
- [ ] Implement API server
- [ ] Create SDKs (JS, Python)
- [ ] Set up deployment infrastructure
- [ ] Create API documentation

---

## References / 參考資料

- [OpenAPI Specification](https://swagger.io/specification/)
- [REST API Best Practices](https://restfulapi.net/)
- [JSON:API](https://jsonapi.org/)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
