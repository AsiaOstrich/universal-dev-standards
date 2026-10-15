# Test Skeleton Templates | 測試骨架模板

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/testing-guide/test-skeleton-templates.md)

**Version**: 2.0.0
**Last Updated**: 2026-04-14

Language-agnostic test skeleton patterns for all testing pyramid levels.
AI should read `uds.project.yaml` at runtime to determine the target ecosystem,
then generate code using the appropriate framework for that language.

---

## How to Use This Document | 如何使用本文件

This document contains **patterns only** — pseudocode that applies to any language.

**AI workflow for generating tests:**
1. Read `uds.project.yaml` to identify `ecosystem` (e.g. `python`, `go`, `java`, `rust`)
2. Select the test framework standard for that ecosystem (e.g. pytest, testing, JUnit, #[test])
3. Apply the pseudocode pattern below, translated into the target language
4. Fill in `[TODO]` markers with real implementation details

> If `uds.project.yaml` is not present, ask the user for their language/framework before generating.

---

## Unit Test (UT) | 單元測試

**Purpose**: Test a single function/method in isolation — no external dependencies.
**Speed**: < 100ms per test.
**Isolation**: Complete (use stubs/mocks for all dependencies).

### Pattern: Arrange-Act-Assert

```
# [TODO: Replace with target language syntax]
# Arrange
subject = new TargetClass()
input   = <test_value>

# Act
result = subject.method(input)

# Assert
assert result == <expected_value>
```

### Pattern: Error / Edge Case

```
# [TODO: Replace with target language syntax]
# Assert that invalid input raises / returns error
assert throws_error( subject.method(invalid_input) )
```

### Naming convention
```
methodName_scenario_expectedResult
# Examples:
#   calculateTotal_withEmptyCart_returnsZero
#   validateEmail_withInvalidFormat_returnsFalse
```

### AI generation instruction
> Read `uds.project.yaml → ecosystem`, then:
> - Wrap the above pseudocode in the ecosystem's test runner structure
> - Use the ecosystem's assertion library
> - Use the ecosystem's mock/stub mechanism for dependencies
> - Apply the ecosystem's file naming convention (e.g. `_test.go`, `*_spec.rb`, `Test*.java`)

---

## Integration Test (IT) | 整合測試

**Purpose**: Test the boundary between two components (DB, HTTP, queue).
**Speed**: < 1 second per test.
**Isolation**: Partial — use real implementations when possible, stubs for external services.

### Pattern: Database Integration

```
# [TODO: Replace with target language syntax]
# Arrange — start test database (in-memory or container)
db   = start_test_database()
repo = new Repository(db)

# Act
repo.save(entity)
found = repo.findById(entity.id)

# Assert
assert found == entity

# Teardown — rollback or truncate
db.cleanup()
```

### Pattern: HTTP API Integration

```
# [TODO: Replace with target language syntax]
# Act
response = http_client.post("/api/resource", body = { key: value })

# Assert
assert response.status == 201
assert response.body contains expected_fields
```

### Pattern: Message Queue Integration

```
# [TODO: Replace with target language syntax]
# Act
publisher.send("topic.created", event)
received = consumer.receive(timeout = 5s)

# Assert
assert received.payload == event
```

### AI generation instruction
> Read `uds.project.yaml → ecosystem`, then select the appropriate:
> - In-memory or Testcontainers-compatible DB driver for that ecosystem
> - HTTP test client for that ecosystem
> - Embedded queue or mock transport for that ecosystem
> Never hardcode a specific library — choose based on detected ecosystem.

---

## System Test (ST) | 系統測試

**Purpose**: Test a complete business flow within one subsystem, with external services stubbed.
**Isolation**: Stub all external HTTP/queue calls; use real DB.

### Pattern: Full Flow with Stubbed External Service

```
# [TODO: Replace with target language syntax]
# Arrange — stub external dependency
stub_server = start_http_stub("/external-api/charge",
    response = { status: "approved", id: "TX-001" })

# Boot subsystem under test
app = start_system(config = { external_url: stub_server.url })

# Act
result = app.run_flow(input_data)

# Assert
assert result.status == "confirmed"
assert result.id is not null

# Teardown
stub_server.stop()
app.stop()
```

### AI generation instruction
> Read `uds.project.yaml → ecosystem`, then select the appropriate:
> - HTTP stub/mock server for that ecosystem (e.g. WireMock, MSW, responses, httpretty, httpmock)
> - Application test harness / test client for that framework
> Never hardcode a specific stub library — choose based on detected ecosystem.

---

## Performance Test | 效能測試

**Purpose**: Validate throughput, latency, and resource usage under load.
**Focus**: SLOs — p95 latency target, requests-per-second target, error rate threshold.

### Pattern: Load Test

```
# [TODO: Replace with target load testing tool syntax]
# Configuration
rate     = <RPS target>          # [TODO] e.g. 50 requests/sec
duration = <test duration>       # [TODO] e.g. 60 seconds
target   = "<API_URL>/api/resource"

# Thresholds
p95_latency_threshold = <ms>     # [TODO] e.g. 500ms
error_rate_threshold  = <rate>   # [TODO] e.g. 1%

# Execute
results = run_load_test(rate, duration, target)

# Assert
assert results.p95_latency < p95_latency_threshold
assert results.error_rate  < error_rate_threshold
```

### AI generation instruction
> Read `uds.project.yaml → ecosystem`, then select the appropriate load testing tool:
> - Performance tests are **language-independent by default** (k6, Gatling, Locust, vegeta, wrk)
> - Prefer the tool already present in the project (check for existing config files)
> - If none present, suggest the most common tool for the detected ecosystem
> Set `[TODO]` thresholds based on the project's SLO definition if available.

---

## Contract Test | 合約測試

**Purpose**: Verify API contracts between consumer and provider without deploying both.
**When**: Microservices, shared APIs, CI on every PR.

### Pattern: Consumer Contract (Consumer-Driven)

```
# [TODO: Replace with target language / Pact version syntax]
# Define the contract
pact = new ConsumerPactBuilder(
    consumer = "[ConsumerName]",   # [TODO]
    provider = "[ProviderName]"    # [TODO]
)

pact.given("resource 123 exists")
    .upon_receiving("a GET request for resource 123")
    .with_request(method = GET, path = "/resources/123")
    .will_respond_with(
        status = 200,
        body   = { id: like("123"), name: like("Alice") }  # [TODO] add fields
    )

# Run consumer test against mock provider
pact.run_test(lambda mock_url:
    client = new ApiClient(mock_url)
    resource = client.get_resource("123")
    assert resource.id == "123"
)
```

### Pattern: Provider Verification

```
# [TODO: Replace with target language / Pact version syntax]
# Verify all consumer pacts against the real provider
verifier = new ProviderVerifier(
    provider_url  = "http://localhost:[PORT]",  # [TODO]
    pact_broker   = env("PACT_BROKER_URL"),
    provider_name = "[ProviderName]",           # [TODO]
    state_handlers = {
        "resource 123 exists": lambda: seed_database(id = "123")  # [TODO]
    }
)
verifier.verify()
```

### Pattern: OpenAPI / Schema Contract Test

```
# [TODO: Replace with target language syntax]
# Load OpenAPI spec and validate responses
spec    = load_openapi_spec("./api/openapi.yaml")  # [TODO] spec path
server  = start_test_server()

for each critical_endpoint in spec.paths:
    response = http_client.request(critical_endpoint)
    assert spec.validates(critical_endpoint, response)
```

### AI generation instruction
> Read `uds.project.yaml → ecosystem`, then select:
> - Consumer-Driven: Pact has SDKs for most languages — use the SDK for the detected ecosystem
> - OpenAPI: Use the OpenAPI validation library available for the detected ecosystem
> Never hardcode a specific Pact version or library — choose based on detected ecosystem.

---

## Choosing the Right Test Level | 選擇正確的測試層

```
Use UT when:
  ✓ Testing a single function or method
  ✓ All dependencies can be replaced by stubs
  ✓ Should run in < 100ms

Use IT when:
  ✓ Testing interaction with a real DB, HTTP endpoint, or message queue
  ✓ Crossing a component boundary
  ✓ Needs a real or containerised dependency

Use ST when:
  ✓ Testing a complete business flow within one subsystem
  ✓ External services should be stubbed (not mocked)
  ✓ Validates non-functional requirements (latency, throughput)

Use E2E when:
  ✓ Testing a full user journey across multiple systems
  ✓ Uses a production-like environment
  ✓ Critical paths only (top 5–10 journeys)

Use Performance when:
  ✓ Validating SLOs before production
  ✓ Checking throughput or latency under load

Use Contract when:
  ✓ Two services share an API contract
  ✓ You want CI to catch consumer/provider drift early
```

---

## Related Documents | 相關文件

- [Testing Pyramid](./testing-pyramid.md)
- [E2E Assistant](../e2e-assistant/SKILL.md)
- [Contract Test Assistant](../contract-test-assistant/SKILL.md)
- Core: [testing-standards.md](../../core/testing-standards.md)
- Options:
  - [unit-testing.ai.yaml](../../.standards/options/testing/unit-testing.ai.yaml)
  - [integration-testing.ai.yaml](../../.standards/options/testing/integration-testing.ai.yaml)
  - [system-testing.ai.yaml](../../.standards/options/testing/system-testing.ai.yaml)
  - [performance-testing.ai.yaml](../../.standards/options/testing/performance-testing.ai.yaml)
  - [contract-testing.ai.yaml](../../.standards/options/testing/contract-testing.ai.yaml)
