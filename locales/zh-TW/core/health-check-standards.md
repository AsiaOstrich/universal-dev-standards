---
source: ../../../core/health-check-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 健康檢查標準

> **語言**: [English](../../../core/health-check-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-17
**狀態**: Trial（到期 2026-10-17）
**適用範圍**: universal
**來源**: XSPEC-067（DEC-043 Wave 1 可靠性套件）

---

## 目的

健康檢查標準：liveness / readiness / startup 三種 probe、深度 health check、結構化 JSON 回應。

業界常見錯誤：把 liveness 和 readiness 混用（健康檢查檢查外部依賴導致連鎖重啟）。本標準明確三種 probe 語意分離，定義深度 health check 的檢查範圍（僅關鍵依賴），並規範結構化 JSON 回應以便下游自動化處理。

---

## 核心規範

- Liveness probe 不得檢查外部依賴（DB、下游 API），否則會造成連鎖重啟
- Readiness probe 可檢查關鍵外部依賴，但僅關鍵（非全部依賴）
- 慢啟動服務應使用 startup probe，啟動完成後交棒給 liveness
- Health check 端點必須回傳結構化 JSON，包含 status / dependencies / timestamp
- Health check 結果應作為 observability 的 Error signal 之一，連續 fail 觸發 incident

---

## 三種 Probe 類型

### Liveness Probe

- **目的**：服務是否還活著（process 是否卡死）
- **建議端點**：`GET /health/live`
- **允許檢查**：process 是否能回應 HTTP、內部 event loop 是否可用
- **禁止檢查**：DB 連線、下游 API、消息佇列（會造成連鎖重啟）
- **失敗行為**：重啟 pod / process
- **參數**：failureThreshold=3，periodSeconds=10

### Readiness Probe

- **目的**：是否可接收流量
- **建議端點**：`GET /health/ready`
- **允許檢查**：自身 API 可用、DB 連線（若服務必須依賴 DB）、關鍵下游依賴、必要設定已載入
- **禁止檢查**：非關鍵依賴（避免非關鍵故障造成服務被移出負載均衡）
- **失敗行為**：移出負載均衡，不重啟
- **參數**：failureThreshold=3，periodSeconds=5

### Startup Probe

- **目的**：啟動期專用，替代慢啟動服務的 liveness
- **建議端點**：`GET /health/startup`
- **檢查項目**：啟動過程所需資源（如快取預熱、index 載入）已完成
- **失敗行為**：重啟 pod（啟動超時）
- **完成後**：停用，改由 liveness 接手
- **參數**：failureThreshold=30，periodSeconds=10

---

## 深度規則

| 層級 | 使用時機 | 檢查範圍 |
|------|---------|---------|
| Shallow | Liveness | process 是否可回應，不碰任何外部依賴 |
| Deep | Readiness | 自身 API 路由、DB ping（若必須）、關鍵下游 API ping |

**關鍵依賴的定義**：沒有它服務就完全無法提供核心功能。

---

## 回應格式

**Content-Type**：`application/json`

| HTTP 狀態碼 | 意義 |
|------------|------|
| `200` | healthy — 所有關鍵依賴正常 |
| `503` | unhealthy — 至少一個關鍵依賴失敗 |

**JSON Schema**：

```json
{
  "status": "healthy | degraded | unhealthy",
  "timestamp": "<ISO-8601>",
  "uptime_seconds": 12345,
  "version": "1.0.0",
  "dependencies": {
    "database": {
      "status": "healthy | unhealthy",
      "latency_ms": 5,
      "last_check": "<ISO-8601>"
    },
    "upstream_api": {
      "status": "healthy | unhealthy",
      "latency_ms": 20
    }
  }
}
```

---

## 與 Observability 整合

- Health check 結果應作為 RED metric 的 Error 來源之一（Rate / Errors / Duration）
- 連續 N 次 health check failed 應觸發 incident（對齊 incident-response）
- probe 延遲本身應被監控（異常緩慢可能是 resource_exhaustion 徵兆）

---

## 情境範例

**情境 1：liveness 不檢查 DB**
- 條件：DB 暫時無法連線
- Liveness 回傳 200 healthy（不檢查 DB），避免連鎖重啟

**情境 2：readiness 因關鍵依賴失敗**
- 條件：關鍵下游 API 不可達
- Readiness 回傳 503，pod 移出負載均衡但不重啟

**情境 3：startup 後交棒 liveness**
- 條件：服務需 60s 預熱快取
- 前 60s startup probe 持續回 503，預熱完成後交棒 liveness

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `HC-001` | `HEALTH_CHECK_FAILED` — 關鍵依賴失敗 |
| `HC-002` | `HEALTH_CHECK_TIMEOUT` — probe 本身超時 |
| `HC-003` | `INVALID_DEPENDENCY_SET` — readiness 檢查了非關鍵依賴（設計違規） |
