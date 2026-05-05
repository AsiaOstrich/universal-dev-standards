# Contract Testing Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/contract-testing-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-05-05
**Applicability**: Projects with API consumers (service-to-service, frontend-to-backend, public API)
**Scope**: universal
**Industry Standards**: Consumer-Driven Contract Testing (CDCT), Pact Specification v3
**References**: [pact.io](https://docs.pact.io/), [Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract)

---

## Purpose

Contract testing verifies that a provider (API server) and its consumers (clients) agree on the exact interface — request format, response schema, and status codes — without requiring both sides to be deployed simultaneously.

Without contract testing:
- Provider changes silently break consumers in production
- Integration tests between services require full environments
- API versioning decisions are made without evidence of actual usage

This standard formalizes consumer-driven contract testing as a **release gate** (Dimension 4 in `release-readiness-gate.md`, Tier-3).

---

## Consumer-Driven Contract Flow

```
Consumer writes interaction expectations
        ↓
Consumer publishes contract to Pact Broker
        ↓
Provider CI fetches consumer contracts
        ↓
Provider verifies it can fulfill each interaction
        ↓
Pact Broker records: can-i-deploy result
        ↓
Release gate: ALL consumer contracts GREEN before provider deploy
```

---

## Contract Scope

A contract covers:

| Element | Must Specify | Notes |
|---------|-------------|-------|
| Request method | Yes | GET / POST / PUT / PATCH / DELETE |
| Request path | Yes | Including path params |
| Request headers | Required only | Do not over-specify optional headers |
| Request body schema | Yes (for write operations) | Schema-level, not literal values |
| Response status | Yes | All expected status codes |
| Response body schema | Yes | Schema-level; use matchers not literals |
| Response headers | Required only | e.g., `Content-Type` |

**Under-specification is preferred over over-specification.** Only assert what the consumer actually uses.

---

## Backward Compatibility Window

| Release Type | Compatibility Requirement |
|-------------|--------------------------|
| Patch | 100% backward compatible; no contract changes expected |
| Minor | N-1 consumer contract version must still pass |
| Major | Deprecation period required; consumers notified; old contract archived |

**Breaking change policy**: A provider MAY NOT deploy if any active consumer contract is red. Breaking changes require:
1. New provider version with additive-only changes
2. Consumer migration to new version
3. Old contract explicitly deprecated and archived

---

## Release Gate Criteria

| Criterion | Hard Minimum | Warn Band |
|-----------|-------------|-----------|
| All active consumer contracts | 100% green | — (binary: all or nothing) |
| N-1 backward compatibility | 100% green | — |
| Deprecated contract cleanup | Old contracts archived within 30 days | > 30 days = WARN |

The `can-i-deploy` command in the Pact Broker encapsulates this gate:

```bash
pact-broker can-i-deploy \
  --pacticipant <provider-service> \
  --version <version> \
  --to-environment production
```

Exit code 0 = PASS; non-zero = FAIL (blocks release).

---

## Implementation Guidelines

### Consumer Side

```typescript
// Pact consumer test (TypeScript example)
const interaction = {
  state: "user 42 exists",
  uponReceiving: "a request for user 42",
  withRequest: {
    method: "GET",
    path: "/users/42",
    headers: { Accept: "application/json" },
  },
  willRespondWith: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: like({           // schema matcher, not literal
      id: integer(),
      name: string(),
      email: email(),
    }),
  },
};
```

### Provider Side

```bash
# Provider verification in CI
PACT_BROKER_BASE_URL=https://pact-broker.internal \
PACT_PROVIDER_VERSION=$GIT_SHA \
npm run test:pact:provider
```

### Pact Broker Tags

| Tag | Meaning |
|-----|---------|
| `main` | Latest from main branch |
| `production` | Currently deployed to production |
| `<feature-branch>` | Feature branch contracts (transient) |

---

## Anti-Patterns

- **Testing the full API surface** — test only what consumers actually consume; over-specification causes unnecessary contract breaks
- **Literal value matching** — use schema matchers (`like()`, `eachLike()`, `integer()`) not exact values; contracts should tolerate realistic data variation
- **Skipping provider verification** — publishing a consumer contract without provider verification means the contract has no enforcement value
- **Not running `can-i-deploy`** — checking individual contract status is insufficient; `can-i-deploy` evaluates the entire deployment matrix

---

## Relationship to Other Standards

- **`api-design-standards.md`** — contract testing enforces backwards-compat guarantees stated in API design
- **`release-readiness-gate.md`** — Dimension 4 (Tier-3: applies when API consumers exist)
- **`integration-testing.md`** — contract tests complement but do not replace integration tests
- **`versioning.md`** — semantic versioning interacts with backward compatibility window above

---

## See Also

- [Pact Documentation](https://docs.pact.io/)
- [Can I Deploy](https://docs.pact.io/pact_broker/can_i_deploy)
- [Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html) — Martin Fowler

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | Initial release: consumer-driven contract flow, backward compat window, release gate criteria |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
