---
scope: universal
description: |
  Guide for contract testing strategy and implementation.
  Use when: detailed contract testing setup, Pact/OpenAPI configuration, CI integration.
  Keywords: contract test, Pact, OpenAPI, consumer, provider, 合約測試, API 合約.
---

# Contract Test Assistant Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/contract-test-assistant/guide.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-26
**Applicability**: All projects with API integrations
**Scope**: universal
**Type**: Standard-backed Skill (option: contract-testing.md)

---

## Purpose

As systems grow into microservices or integrate with third-party APIs, integration tests become slow, brittle, and hard to maintain. Contract testing solves this by verifying API agreements independently, enabling teams to deploy with confidence without running all services.

---

## Decision Guide

```
Do you own both consumer and provider?
├── Yes → Consumer-Driven (Pact)
├── No, provider is third-party → Provider-Driven (OpenAPI)
└── Mixed → Bi-Directional (Pact + OpenAPI)
```

### Consumer-Driven Contracts (Pact)

Best when the team owns both sides. The consumer defines expectations.

```
Consumer writes test → Generates contract (pact file) → Provider verifies
```

### Provider-Driven Contracts (OpenAPI)

Best for public APIs. The provider defines the contract.

```
Provider writes OpenAPI spec → Consumer generates client → Both verify
```

---

## Quick Start Examples

### Pact (JavaScript)

```typescript
// Consumer test
const interaction = {
  uponReceiving: 'a request for user by ID',
  withRequest: { method: 'GET', path: '/users/1' },
  willRespondWith: {
    status: 200,
    body: { id: 1, name: like('John') }
  }
};
```

### OpenAPI Verification

```yaml
# openapi.yaml
paths:
  /users/{id}:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

---

## Reference

- Detailed standard: [contract-testing.md](../../options/testing/contract-testing.md)
- SKILL: [SKILL.md](./SKILL.md)
