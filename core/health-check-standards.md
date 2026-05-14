# Health Check Standards

> **Source**: XSPEC-067 | **Driven by**: DEC-043 Wave 1 Reliability Pack | **Status**: Trial (2026-04-17 ~ 2026-10-17)

## Overview

健康檢查標準 — 業界常見錯誤是把 liveness 和 readiness 混用（健康檢查檢查外部依賴導致連鎖重啟）。本標準明確三種 probe 語意分離、定義深度 health check 的檢查範圍（僅關鍵依賴）、並規範結構化 JSON 回應以便下游自動化處理。與 observability 整合為 RED metric 的 Error 來源之一。

## Key Principles

- **Liveness 不碰外部依賴**：liveness 失敗會造成 pod 重啟；若依賴 DB，DB 故障時會造成所有 pod 連鎖重啟
- **Readiness 僅檢關鍵依賴**：非關鍵依賴不納入，避免邊緣故障造成服務被下線
- **慢啟動用 startup probe**：啟動完成後交棒給 liveness
- **結構化 JSON 回應**：含 `status` / `dependencies` / `timestamp` / `version`
- **作為 observability signal**：連續 fail 觸發 incident

## Probe Types

| Probe | Endpoint | Checks | On Fail | Threshold |
|-------|----------|--------|---------|-----------|
| **liveness** | `GET /health/live` | process 可回應 HTTP、內部 event loop | 重啟 pod | 3 failures |
| **readiness** | `GET /health/ready` | 自身 API、DB ping（若必要）、關鍵下游 | 移出負載均衡（不重啟）| 3 failures |
| **startup** | `GET /health/startup` | 啟動過程所需資源就緒 | 重啟 pod（啟動超時）| 30 failures |

### Liveness Forbidden Checks

- DB 連線（DB 壞時 liveness 失敗 → pod 重啟 → 啟動更多 client → DB 更壞）
- 下游 API（會造成連鎖重啟）
- 消息佇列

## Depth Rules

- **Shallow (liveness)**: process 是否可回應，不碰任何外部依賴
- **Deep (readiness)**: 自身 API 路由、DB ping、關鍵下游 API ping（關鍵 = 沒有它服務就完全無法提供核心功能）

## Response Format

```json
{
  "status": "healthy | degraded | unhealthy",
  "timestamp": "2026-04-17T10:00:00Z",
  "uptime_seconds": 3600,
  "dependencies": {
    "database": {"status": "healthy", "latency_ms": 5, "last_check": "..."},
    "upstream_api": {"status": "healthy", "latency_ms": 42, "last_check": "..."}
  },
  "version": "1.2.3"
}
```

- HTTP 200 → healthy
- HTTP 503 → unhealthy（至少一個關鍵依賴失敗）

## Usage Examples

- **Scenario 1 — Liveness 不檢 DB**：DB 連線池耗盡，liveness 仍回 200（liveness 不檢 DB），避免所有 pod 重啟
- **Scenario 2 — Readiness 失敗**：關鍵下游 API 不可達，readiness 回 503，pod 移出 LB；process 不重啟
- **Scenario 3 — Startup → Liveness 交棒**：服務需 60s 預熱快取，startup probe 前 60s 持續回 503，預熱完成改由 liveness 接手

## Error Codes

- `HC-001` — `HEALTH_CHECK_FAILED`（關鍵依賴失敗）
- `HC-002` — `HEALTH_CHECK_TIMEOUT`（probe 本身超時）
- `HC-003` — `INVALID_DEPENDENCY_SET`（readiness 檢查了非關鍵依賴，設計違規）

## References

- AI-optimized: [ai/standards/health-check-standards.ai.yaml](../ai/standards/health-check-standards.ai.yaml)
- XSPEC-067: DEC-043 Wave 1 Reliability Pack 跨專案規格
- DEC-043: UDS 覆蓋完整性路線圖（驅動來源）
- Related: `deployment-standards`, `circuit-breaker`, observability-standards (XSPEC-063 規劃中)
- Industry: Kubernetes probes, Microsoft eShop health checks, Google SRE Book Ch.6


**Scope**: universal
