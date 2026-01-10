# Contract Testing

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/contract-testing.md)

**Parent Standard**: [Testing Completeness](../../core/testing-completeness.md)

---

## Overview

Contract testing verifies that services can communicate correctly by testing the agreements (contracts) between consumers and providers. It enables independent team development and deployment while ensuring compatibility.

## Best For

- Microservices architecture
- API-first development
- Third-party integrations
- Teams working independently
- Distributed systems

## Contract Types

### Consumer-Driven Contracts (CDC)

Contracts defined by API consumers.

**Flow:**
1. Consumer defines expected interactions
2. Generates contract (pact file)
3. Provider verifies against contract
4. Both sides must pass before deployment

**Benefits:**
- Consumer needs drive API design
- Decoupled deployments
- Early integration problem detection

### Provider Contracts

Contracts defined by API providers.

**Use Case:** Public APIs, OpenAPI-first design

**Flow:**
1. Provider defines API specification
2. Consumers test against specification
3. Provider ensures backward compatibility

## Tools

| Tool | Type | Languages |
|------|------|-----------|
| **Pact** | Consumer-driven | Multi-language |
| **Spring Cloud Contract** | Both | JVM |
| **Dredd** | OpenAPI | Multi-language |
| **Prism** | Mock | Multi-language |

## Pact Workflow

### Consumer Side

**1. Define Interactions**

```javascript
const interaction = {
  state: 'user exists',
  uponReceiving: 'a request for user by id',
  withRequest: {
    method: 'GET',
    path: '/users/1',
    headers: { Accept: 'application/json' }
  },
  willRespondWith: {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      id: like(1),
      name: like('John'),
      email: like('john@example.com')
    }
  }
};
```

**2. Run consumer tests** - Tests run against mock provider

**3. Publish contract** - Upload pact file to broker

### Provider Side

**1. Fetch contracts** - Download contracts from broker

**2. Verify contracts**

```javascript
verifier.verifyProvider({
  provider: 'UserService',
  pactBrokerUrl: 'https://broker.example.com',
  publishVerificationResult: true
});
```

**3. State setup** - Configure provider states for each interaction

## Pact Broker

Central repository for contracts with features:

- Contract storage
- Verification status
- Dependency graphs
- Can-I-Deploy check
- Webhooks for CI/CD

### Can-I-Deploy

Check if deployment is safe:

```bash
pact-broker can-i-deploy \
  --pacticipant UserService \
  --version $(git rev-parse HEAD) \
  --to production
```

## CI Integration

### Consumer Pipeline

```yaml
stages:
  - test:
      - Run unit tests
      - Run contract tests (generates pact)
  - publish:
      - Publish pact to broker
  - can-i-deploy:
      - Check deployment safety
  - deploy:
      - Deploy consumer
```

### Provider Pipeline

```yaml
stages:
  - test:
      - Run unit tests
      - Verify consumer contracts
  - publish:
      - Publish verification results
  - can-i-deploy:
      - Check deployment safety
  - deploy:
      - Deploy provider
```

### GitHub Actions Example

```yaml
name: Consumer Contract Tests
on: [push, pull_request]
jobs:
  contract-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run contract tests
        run: npm run test:contract
      - name: Publish pact
        run: npm run pact:publish
      - name: Can I deploy?
        run: |
          pact-broker can-i-deploy \
            --pacticipant MyConsumer \
            --version ${{ github.sha }}
```

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Consumer first | Start with consumer needs, not provider implementation | Recommended |
| Use matchers | Use type matchers (like, eachLike) not exact values | Required |
| Provider states | Define clear provider states for each interaction | Required |
| Version contracts | Tag contracts with consumer version and branch | Required |
| Can-I-Deploy | Always run can-i-deploy check in CI/CD | Required |
| Breaking changes | Coordinate with consumer teams before breaking changes | Required |
| Async contracts | Include message contracts for async communication | Recommended |

## Quick Reference

### Workflow

| Step | Consumer | Provider |
|------|----------|----------|
| 1. Define | Write expectations | Implement API |
| 2. Test | Run against mock | Verify contracts |
| 3. Publish | Upload pact | Upload results |
| 4. Deploy | Can-I-Deploy | Can-I-Deploy |

### Benefits

| Benefit | Description |
|---------|-------------|
| Fast feedback | No need for full integration environment |
| Decoupled | Teams can work independently |
| Safe deployment | Can-I-Deploy prevents breaking changes |
| Living documentation | Contracts document API behavior |

## Related Options

- [Integration Testing](./integration-testing.md) - Component integration testing
- [E2E Testing](./e2e-testing.md) - End-to-end testing

---

## References

- [Pact Foundation](https://docs.pact.io/)
- [Martin Fowler - Contract Test](https://martinfowler.com/bliki/ContractTest.html)
- [Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
