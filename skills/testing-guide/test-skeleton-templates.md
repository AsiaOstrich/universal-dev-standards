# Test Skeleton Templates | 測試骨架模板

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/testing-guide/test-skeleton-templates.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-14

Language-agnostic test skeleton templates for all four testing pyramid levels.
Use these templates when generating tests for any ecosystem.

所有四層測試金字塔的語言無關測試骨架模板。
在任何生態系中生成測試時使用這些模板。

---

## How to Use This Document | 如何使用本文件

AI assistants generating tests should:
1. Identify the correct test level (UT / IT / ST / E2E) for the scenario
2. Select the template for the target ecosystem
3. Fill in the `[TODO]` markers with real implementation
4. Remove `[TODO]` comments once implemented

---

## Unit Test (UT) Skeletons | 單元測試骨架

**Purpose**: Test a single function/method in isolation.
**When**: Business logic, pure functions, data transformations.

### JavaScript / TypeScript (Vitest / Jest)

```typescript
// [Generated] Unit tests for [FeatureName]
// [TODO] Fill in implementations

import { describe, it, expect, beforeEach } from 'vitest';
import { MyClass } from './my-class';

describe('MyClass', () => {
  let subject: MyClass;

  beforeEach(() => {
    // Arrange — shared setup
    subject = new MyClass();
  });

  describe('methodName', () => {
    it('should_return_expected_when_valid_input', () => {
      // Arrange
      const input = /* [TODO] */;

      // Act
      const result = subject.methodName(input);

      // Assert
      expect(result).toBe(/* [TODO] */);
    });

    it('should_throw_when_invalid_input', () => {
      // [TODO] Test error case
      expect(() => subject.methodName(null)).toThrow();
    });
  });
});
```

### Python (pytest)

```python
# [Generated] Unit tests for [FeatureName]
# [TODO] Fill in implementations

import pytest
from my_module import MyClass


class TestMyClass:
    def setup_method(self):
        # Arrange — shared setup
        self.subject = MyClass()

    def test_method_name_returns_expected_when_valid_input(self):
        # Arrange
        input_val = None  # [TODO]

        # Act
        result = self.subject.method_name(input_val)

        # Assert
        assert result == None  # [TODO]

    def test_method_name_raises_when_invalid_input(self):
        # [TODO] Test error case
        with pytest.raises(ValueError):
            self.subject.method_name(None)
```

### Go (testing + testify)

```go
// [Generated] Unit tests for [FeatureName]
// [TODO] Fill in implementations

package mypackage_test

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"mymodule/mypackage"
)

func TestMyStruct_MethodName_ReturnsExpected_WhenValidInput(t *testing.T) {
	// Arrange
	subject := mypackage.NewMyStruct()
	input := /* [TODO] */

	// Act
	result, err := subject.MethodName(input)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, /* [TODO] expected */, result)
}

func TestMyStruct_MethodName_ReturnsError_WhenInvalidInput(t *testing.T) {
	subject := mypackage.NewMyStruct()

	_, err := subject.MethodName(nil)

	assert.Error(t, err)
}
```

### Java (JUnit 5)

```java
// [Generated] Unit tests for [FeatureName]
// [TODO] Fill in implementations

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class MyClassTest {

    private MyClass subject;

    @BeforeEach
    void setUp() {
        // Arrange — shared setup
        subject = new MyClass();
    }

    @Test
    void methodName_shouldReturnExpected_whenValidInput() {
        // Arrange
        var input = /* [TODO] */;

        // Act
        var result = subject.methodName(input);

        // Assert
        assertEquals(/* [TODO] expected */, result);
    }

    @Test
    void methodName_shouldThrow_whenInvalidInput() {
        // [TODO] Test error case
        assertThrows(IllegalArgumentException.class,
            () -> subject.methodName(null));
    }
}
```

### C# (xUnit)

```csharp
// [Generated] Unit tests for [FeatureName]
// [TODO] Fill in implementations

using Xunit;

public class MyClassTests
{
    private readonly MyClass _subject;

    public MyClassTests()
    {
        // Arrange — shared setup
        _subject = new MyClass();
    }

    [Fact]
    public void MethodName_ReturnsExpected_WhenValidInput()
    {
        // Arrange
        var input = /* [TODO] */;

        // Act
        var result = _subject.MethodName(input);

        // Assert
        Assert.Equal(/* [TODO] expected */, result);
    }

    [Fact]
    public void MethodName_Throws_WhenInvalidInput()
    {
        // [TODO] Test error case
        Assert.Throws<ArgumentException>(() => _subject.MethodName(null));
    }
}
```

---

## Integration Test (IT) Skeletons | 整合測試骨架

**Purpose**: Test boundaries between components (DB, HTTP, queues).
**When**: API endpoints, repository layers, service interactions.

### JavaScript / TypeScript (Vitest + Supertest)

```typescript
// [Generated] Integration tests for [FeatureName]
// [TODO] Fill in implementations

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';

describe('[FeatureName] Integration', () => {
  beforeAll(async () => {
    // [TODO] Seed test database
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    // [TODO] Cleanup
    await db.destroy();
  });

  it('POST /api/[resource] creates and persists entity', async () => {
    // Act
    const response = await request(app)
      .post('/api/[resource]')
      .send({ /* [TODO] payload */ });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ /* [TODO] shape */ });

    // Verify persistence
    const inDb = await db('[table]').where({ id: response.body.id }).first();
    expect(inDb).toBeDefined();
  });
});
```

### Python (pytest + requests/httpx)

```python
# [Generated] Integration tests for [FeatureName]
# [TODO] Fill in implementations

import pytest
import httpx
from my_app import create_app
from my_app.db import get_test_engine


@pytest.fixture(scope="module")
def client():
    app = create_app(testing=True)
    with httpx.Client(app=app, base_url="http://test") as client:
        yield client


def test_post_resource_creates_and_persists(client):
    # Act
    response = client.post("/api/resource", json={"key": "value"})  # [TODO]

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert "id" in body  # [TODO] verify shape
```

### Go (net/http/httptest)

```go
// [Generated] Integration tests for [FeatureName]
// [TODO] Fill in implementations

package integration_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"mymodule/server"
)

func TestPostResource_CreatesAndPersists(t *testing.T) {
	// Arrange
	srv := server.NewTestServer(t) // [TODO] set up test DB
	body, _ := json.Marshal(map[string]any{"key": "value"}) // [TODO]

	// Act
	req := httptest.NewRequest(http.MethodPost, "/api/resource", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)
	// [TODO] verify DB persistence
}
```

### Java (Spring Boot Test / REST Assured)

```java
// [Generated] Integration tests for [FeatureName]
// [TODO] Fill in implementations

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ResourceIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void postResource_createsAndPersists() {
        // Arrange
        var payload = new ResourceRequest(/* [TODO] */);

        // Act
        var response = restTemplate.postForEntity("/api/resource", payload, ResourceResponse.class);

        // Assert
        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        // [TODO] verify DB persistence via repository
    }
}
```

---

## System Test (ST) Skeletons | 系統測試骨架

**Purpose**: Test complete subsystem with stubbed external dependencies.
**When**: After IT, before E2E. Validates business flows without external services.

### JavaScript / TypeScript (Vitest + WireMock / MSW)

```typescript
// [Generated] System tests for [FeatureName]
// [TODO] Fill in implementations

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { SystemTestClient } from '../test-helpers/system-client';

// Stub external dependencies
const mockServer = setupServer(
  http.post('https://external-api.example.com/payments', () =>
    HttpResponse.json({ status: 'approved', transactionId: 'TX-001' })
  )
);

describe('[FeatureName] System', () => {
  let client: SystemTestClient;

  beforeAll(async () => {
    mockServer.listen();
    client = await SystemTestClient.start(); // [TODO] boot subsystem
  });

  afterAll(async () => {
    mockServer.close();
    await client.stop();
  });

  it('completes checkout flow with stubbed payment provider', async () => {
    // Arrange
    const order = await client.createOrder({ /* [TODO] */ });

    // Act
    const result = await client.checkout(order.id, { /* [TODO] payment */ });

    // Assert
    expect(result.status).toBe('confirmed');
    expect(result.receiptId).toBeDefined();
  });
});
```

### Python (pytest + responses / httpretty)

```python
# [Generated] System tests for [FeatureName]
# [TODO] Fill in implementations

import pytest
import responses
from my_app import create_app


@pytest.fixture
def system_client():
    app = create_app(env="system-test")
    app.testing = True
    with app.test_client() as client:
        yield client


@responses.activate
def test_checkout_flow_with_stubbed_payment(system_client):
    # Stub external payment API
    responses.add(
        responses.POST,
        "https://payment-provider.example.com/charge",
        json={"status": "approved", "transaction_id": "TX-001"},
        status=200,
    )

    # Arrange
    order_resp = system_client.post("/api/orders", json={"items": []})  # [TODO]
    order_id = order_resp.get_json()["id"]

    # Act
    result = system_client.post(f"/api/orders/{order_id}/checkout",
                                json={"payment_token": "tok_test"})

    # Assert
    assert result.status_code == 200
    body = result.get_json()
    assert body["status"] == "confirmed"
```

### Go (httptest + custom stubs)

```go
// [Generated] System tests for [FeatureName]
// [TODO] Fill in implementations

package system_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"mymodule/system"
)

func TestCheckoutFlow_WithStubbedPaymentProvider(t *testing.T) {
	// Stub external payment provider
	stubPayment := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"approved","transaction_id":"TX-001"}`))
	}))
	defer stubPayment.Close()

	// Arrange — boot subsystem pointing at stubs
	app := system.NewTestApp(t, system.Config{
		PaymentURL: stubPayment.URL,
	})

	// Act
	result, err := app.Checkout(/* [TODO] order */)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, "confirmed", result.Status)
}
```

### Java (Spring Boot Test + WireMock)

```java
// [Generated] System tests for [FeatureName]
// [TODO] Fill in implementations

import com.github.tomakehurst.wiremock.junit5.WireMockTest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@WireMockTest(httpPort = 9999)
class CheckoutSystemTest {

    @Autowired
    private CheckoutService checkoutService;

    @Test
    void checkout_completesFlow_withStubbedPaymentProvider() {
        // Stub external payment provider
        stubFor(post(urlEqualTo("/payments"))
            .willReturn(okJson("{\"status\":\"approved\",\"transactionId\":\"TX-001\"}")));

        // Arrange
        var order = /* [TODO] create test order */;

        // Act
        var result = checkoutService.checkout(order);

        // Assert
        assertThat(result.getStatus()).isEqualTo("confirmed");
        assertThat(result.getReceiptId()).isNotNull();
    }
}
```

---

## Performance Test Skeletons | 效能測試骨架

**Purpose**: Validate throughput, latency, and resource usage under load.
**When**: Before production, after ST. Focus on SLOs (p95 latency, RPS targets).

### JavaScript (k6)

```javascript
// [Generated] Performance test for [FeatureName]
// [TODO] Set realistic targets

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up
    { duration: '60s', target: 50 },   // Steady state — [TODO] adjust
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // p95 < 500ms — [TODO] adjust
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  const res = http.post(
    '[TODO: API_URL]/api/resource',
    JSON.stringify({ /* [TODO] payload */ }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Python (Locust)

```python
# [Generated] Performance test for [FeatureName]
# Run: locust -f this_file.py --host=http://[TODO:host]
# [TODO] Set realistic targets

from locust import HttpUser, task, between


class ResourceUser(HttpUser):
    wait_time = between(0.5, 2)  # [TODO] adjust think time

    @task(3)  # Weight: 3x more GET than POST
    def get_resource(self):
        self.client.get("/api/resource/1")  # [TODO]

    @task(1)
    def create_resource(self):
        self.client.post("/api/resource", json={
            "key": "value"  # [TODO]
        })
```

### Go (vegeta)

```go
// [Generated] Performance test for [FeatureName]
// [TODO] Set realistic targets

package perf_test

import (
	"net/http"
	"testing"
	"time"

	vegeta "github.com/tsenart/vegeta/v12/lib"
)

func TestResourceEndpoint_Throughput(t *testing.T) {
	rate := vegeta.Rate{Freq: 50, Per: time.Second} // [TODO] adjust RPS
	duration := 30 * time.Second
	targeter := vegeta.NewStaticTargeter(vegeta.Target{
		Method: http.MethodGet,
		URL:    "[TODO: API_URL]/api/resource",
	})

	attacker := vegeta.NewAttacker()
	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "perf-test") {
		metrics.Add(res)
	}
	metrics.Close()

	if p95 := metrics.Latencies.P95; p95 > 500*time.Millisecond {
		t.Errorf("p95 latency %v exceeded 500ms threshold", p95) // [TODO] adjust threshold
	}
	if metrics.Success < 0.99 {
		t.Errorf("success rate %.2f%% below 99%% threshold", metrics.Success*100)
	}
}
```

### Java (Gatling / JMeter DSL)

```java
// [Generated] Performance test for [FeatureName] — Gatling
// [TODO] Set realistic targets

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;
import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class ResourceLoadSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
        .baseUrl("[TODO: API_URL]")
        .acceptHeader("application/json");

    ScenarioBuilder scn = scenario("Resource Load")
        .exec(http("GET resource")
            .get("/api/resource/1")
            .check(status().is(200))
            .check(responseTimeInMillis().lte(500)) // [TODO] adjust
        );

    {
        setUp(
            scn.injectOpen(
                rampUsers(50).during(30),    // [TODO] adjust
                constantUsersPerSec(50).during(60)
            )
        ).protocols(httpProtocol)
         .assertions(
             global().responseTime().percentile3().lt(500), // p95 < 500ms
             global().failedRequests().percent().lt(1.0)    // < 1% error
         );
    }
}
```

---

## Contract Test Skeletons | 合約測試骨架

**Purpose**: Verify API contracts between consumers and providers.
**When**: Microservices, shared APIs, CI on every PR.

### Consumer-Driven (Pact) — JavaScript

```typescript
// [Generated] Consumer contract test for [ProviderName]
// [TODO] Fill in interactions

import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { UserApiClient } from '../src/clients/user-api';

const { like, string } = MatchersV3;

describe('[ConsumerName] → [ProviderName] Contract', () => {
  const pact = new PactV3({
    consumer: '[ConsumerName]',  // [TODO]
    provider: '[ProviderName]',  // [TODO]
  });

  it('gets user by ID', async () => {
    await pact
      .given('user 123 exists')
      .uponReceiving('a request for user 123')
      .withRequest({ method: 'GET', path: '/users/123' })
      .willRespondWith({
        status: 200,
        body: like({
          id: string('123'),
          name: string('Alice'),  // [TODO] add required fields
        }),
      })
      .executeTest(async (mockServer) => {
        const client = new UserApiClient(mockServer.url);
        const user = await client.getUser('123');
        expect(user.id).toBe('123');
      });
  });
});
```

### Consumer-Driven (Pact) — Python

```python
# [Generated] Consumer contract test for [ProviderName]
# [TODO] Fill in interactions

import pytest
from pact import Consumer, Provider, Like


@pytest.fixture
def pact():
    return Consumer("[ConsumerName]").has_pact_with(  # [TODO]
        Provider("[ProviderName]"),                    # [TODO]
        pact_dir="./pacts"
    )


def test_get_user_by_id(pact):
    expected = {"id": "123", "name": Like("Alice")}  # [TODO] add fields

    (pact
     .given("user 123 exists")
     .upon_receiving("a request for user 123")
     .with_request("GET", "/users/123")
     .will_respond_with(200, body=expected))

    with pact:
        from my_app.clients import UserApiClient
        client = UserApiClient(pact.uri)
        user = client.get_user("123")
        assert user["id"] == "123"
```

### Provider Verification — JavaScript

```typescript
// [Generated] Provider verification for [ProviderName]
// [TODO] Configure pact broker URL

import { Verifier } from '@pact-foundation/pact';

describe('[ProviderName] Provider Verification', () => {
  it('verifies all consumer contracts', async () => {
    await new Verifier({
      providerBaseUrl: 'http://localhost:[TODO:PORT]',
      pactBrokerUrl: process.env.PACT_BROKER_URL,  // [TODO]
      provider: '[ProviderName]',
      stateHandlers: {
        'user 123 exists': async () => {
          // [TODO] Set up provider state — seed DB, configure mocks
        },
      },
    }).verifyProvider();
  });
});
```

### OpenAPI Provider Test — Go

```go
// [Generated] OpenAPI contract test for [ServiceName]
// [TODO] Configure spec path

package contract_test

import (
	"net/http/httptest"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/stretchr/testify/require"
	"mymodule/server"
)

func TestAPIConformsToOpenAPISpec(t *testing.T) {
	// Load OpenAPI spec
	loader := openapi3.NewLoader()
	doc, err := loader.LoadFromFile("./api/openapi.yaml") // [TODO] spec path
	require.NoError(t, err)
	require.NoError(t, doc.Validate(loader.Context))

	// Boot server
	srv := httptest.NewServer(server.NewRouter())
	defer srv.Close()

	// [TODO] For each critical endpoint, send request and validate response
	// Use openapi3filter.ValidateResponse to check conformance
}
```

---

## Choosing the Right Test Level | 選擇正確的測試層

```
Scenario fits into UT if:
  ✓ Tests a single function/method
  ✓ All dependencies can be mocked easily
  ✓ Should run in <100ms

Scenario fits into IT if:
  ✓ Tests interaction with DB, HTTP, or queue
  ✓ Crosses a component boundary
  ✓ Needs a real (or containerised) dependency

Scenario fits into ST if:
  ✓ Tests a complete business flow within one subsystem
  ✓ External services should be stubbed (WireMock, MSW, etc.)
  ✓ Validates non-functional requirements (latency, throughput)

Scenario fits into E2E if:
  ✓ Tests a full user journey across multiple systems
  ✓ Uses a production-like environment
  ✓ Critical path (top 5–10 journeys only)
```

## Related Documents | 相關文件

- [Testing Pyramid](./testing-pyramid.md)
- [TDD Language Examples](../tdd-assistant/language-examples.md)
- [E2E Assistant](../e2e-assistant/SKILL.md)
- [Contract Test Assistant](../contract-test-assistant/SKILL.md)
- Core: [testing-standards.md](../../core/testing-standards.md)
- Options:
  - [unit-testing.ai.yaml](../../.standards/options/testing/unit-testing.ai.yaml)
  - [integration-testing.ai.yaml](../../.standards/options/testing/integration-testing.ai.yaml)
  - [system-testing.ai.yaml](../../.standards/options/testing/system-testing.ai.yaml)
  - [performance-testing.ai.yaml](../../.standards/options/testing/performance-testing.ai.yaml)
  - [contract-testing.ai.yaml](../../.standards/options/testing/contract-testing.ai.yaml)
