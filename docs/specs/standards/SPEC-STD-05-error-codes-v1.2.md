# [SPEC-STD-05] Error Code Standards v1.2 — API 錯誤序列化補強

## Status: Implemented
## Created: 2026-03-18 (retroactive)
## Implemented: 2026-03-18

---

## Summary

補強 Error Code Standards 從 v1.1.0 至 v1.2.0，新增 API 錯誤序列化章節（RFC 7807 Problem Details 完整格式、REST/GraphQL/gRPC 錯誤處理模式）以及重試與冪等性指導。

## Motivation

- Error Code Standards v1.1.0 已引用 RFC 7807 但未提供完整的 Problem Details 格式範例
- 缺少 GraphQL 和 gRPC 的錯誤處理模式，而這兩者與 REST 的錯誤模型有本質差異
- 缺少重試指導（哪些錯誤可重試、退避策略）和冪等性（Idempotency-Key）規範
- 計畫中即將新增 API Design Standards，需要 Error Codes 先行補強以提供交叉引用

## Scope

| 面向 | 包含 |
|------|------|
| RFC 7807 Problem Details | 完整格式定義、必要欄位、擴充欄位 |
| REST JSON 錯誤回應 | 單一/多重錯誤格式、JSON Pointer |
| GraphQL 錯誤處理 | extensions 欄位映射、錯誤類別 |
| gRPC 錯誤處理 | Protobuf ErrorDetail、gRPC status code 映射 |
| 重試指導 | 各類別可重試性、指數退避、Retry-After 標頭 |
| 冪等性 | Idempotency-Key 標頭、HTTP 動詞冪等性表 |

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `core/error-code-standards.md` | Modified | v1.1.0→v1.2.0，新增 ~225 行（386→611 行） |
| `.standards/error-codes.ai.yaml` | Modified | 新增 5 條規則（rfc7807-format, graphql-errors, grpc-mapping, retry-guidance） |
| `ai/standards/error-codes.ai.yaml` | Modified | 同步 .standards/ 副本 |
| `locales/zh-TW/core/error-code-standards.md` | Modified | 翻譯同步至 v1.2.0 |
| `locales/zh-CN/core/error-code-standards.md` | Modified | 標記 status: outdated |

## Acceptance Criteria

- [x] AC-1: Given the error-code-standards.md, When the API Error Serialization section is added, Then it includes RFC 7807 Problem Details format with required fields table and JSON examples.
- [x] AC-2: Given the standard, When GraphQL error handling is added, Then it maps application error codes to GraphQL `extensions` field with category mapping table.
- [x] AC-3: Given the standard, When gRPC error handling is added, Then it maps error categories to gRPC status codes with protobuf and Go code examples.
- [x] AC-4: Given the standard, When retry guidance is added, Then it provides a retryable/non-retryable matrix per error category with exponential backoff recommendation.
- [x] AC-5: Given the standard, When idempotency guidance is added, Then it covers Idempotency-Key header usage and HTTP verb idempotency table.
- [x] AC-6: Given the AI YAML, When updated, Then 5 new rules are added covering RFC 7807, GraphQL, gRPC, and retry patterns.
- [x] AC-7: Given the zh-TW translation, When synced, Then all new sections are translated and version updated to 1.2.0.
- [x] AC-8: Given sync scripts, When run, Then `check-standards-sync.sh` and `check-translation-sync.sh` both pass.

## References

- [RFC 7807 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [RFC 9457 - Problem Details for HTTP APIs (2023 update)](https://datatracker.ietf.org/doc/html/rfc9457)
- [GraphQL Spec - Errors](https://spec.graphql.org/October2021/#sec-Errors)
- [gRPC Status Codes](https://grpc.github.io/grpc/core/md_doc_statuscodes.html)
