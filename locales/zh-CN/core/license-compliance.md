---
source: ../../../core/license-compliance.md
source_version: 2.1.0
translation_version: 2.1.0
last_synced: 2026-06-10
source_hash: 8a754039a2b5
status: current
---

# 许可证合规标准

> **语言**: [English](../../../core/license-compliance.md) | [繁體中文](../../zh-TW/core/license-compliance.md) | 简体中文

> **版本**: 2.1.0 | **状态**: Active | **更新日期**: 2026-05-16
> **AI 优化版本**: `ai/standards/license-compliance.ai.yaml`
> **Agent Spec**: ASPEC-001 (cross-project/aspec/ASPEC-001-license-compliance-agent.md)

## 概述

面向 AI 增强开发的完整许可证合规标准，涵盖通用 OSS 实践（Tier 1）以及针对 AI 生成代码的 AI 专属规则（Tier 2）。

## Tier 1 — 通用 OSS 合规实践

适用于所有项目，无论是否使用 AI。

| ID | 规则 | 级别 |
|----|------|------|
| REQ-001 | 许可证分类与允许列表（allowlist） | MUST |
| REQ-002 | CI 中的自动化许可证扫描 | MUST |
| REQ-003 | SBOM 生成（CycloneDX 1.5 或 SPDX 2.3） | MUST |
| REQ-004 | 许可证署名与 NOTICES 文件 | MUST |
| REQ-005 | 许可证违规整改（5 个工作日） | MUST |
| REQ-006 | 采用新技术时的许可证评审 | SHOULD |

### 许可证分级

| 分级 | 许可证 | 动作 |
|------|--------|------|
| APPROVED | MIT, Apache 2.0, BSD-2/3-Clause, ISC, CC0 | 自动批准 |
| REVIEW-REQUIRED | LGPL-2.1/3.0, MPL-2.0, CDDL | 采用前须法务评审 |
| PROHIBITED | GPL-2.0/3.0, AGPL-3.0, SSPL-1.0, BUSL-1.1 | 立即阻断 PR |

## Tier 2 — AI 专属规则

对生成代码的 AI Agent（VibeOps Generator Agent 及同等者）具有约束力。

| ID | 规则 | 严重度 |
|----|------|--------|
| LC-001 | 必须查询 SPDX ID | Blocking |
| LC-002 | 阻止列表（blocklist）自动阻断 | Blocking |
| LC-003 | 允许列表（allowlist）自动批准 | Informational |
| LC-004 | 灰名单（greylist）人工评审 | Review required |
| LC-005 | SBOM 强制生成 | Blocking |
| LC-006 | 版权相似度阈值（≥0.85 阻断） | Blocking |
| LC-007 | PII 模式检测 | Review required |
| LC-008 | EU AI Act 透明度标记 | Blocking |
| LC-009 | 客户策略上限 | Informational |

## v2.1.0 增强（XSPEC-193 Phase 2）

### ClearlyDefined API（LC-001）

- 主要许可证查询来源：`https://api.clearlydefined.io/definitions/{type}/{provider}/{namespace}/{name}/{revision}`
- 知名包的置信度 ≥ 0.95（score.total ≥ 80）
- 24h TTL LRU 缓存（cap=500）+ 404 negative cache
- Token bucket：10 req/s，burst 20
- 重试策略：5xx → exponential backoff × 3（200ms/1s/3s）；429 → batch fallback
- DEC-064 缓存键隔离：`sha256(client_salt + ':' + purl)`

### AST PII 分析（LC-007）

- Tree-sitter 支持：TypeScript、JavaScript、Python
- 上下文分类：
  - `hardcoded_value` → 严重度升级为 `critical`
  - `comment` → 严重度降级为 `info`
  - `schema_field` → 加注，严重度不变
- `// pii:ignore` pragma：抑制同一行的发现
- 可选字段：`PIIPattern.confidence`、`PIIPattern.ast_context`
- tree-sitter 不可用时优雅降级（graceful fallback）为 regex

### EmbeddingProvider 策略（LC-006）

- `provider='onnx-minilm'`：ONNX 本地推理（all-MiniLM-L6-v2）
- `provider='ollama-bge-m3'`：Ollama 本地 API（localhost:11434）
- `provider='jaccard'`：Jaccard token 相似度（Phase 1 基线，默认）
- 内存中的 snippet 索引（`buildSnippetIndex()`）按客户隔离（DEC-064 salt）
- 外部搜索：通过 `enableExternalSearch=true` opt-in（默认=false）

## 原则

| ID | 原则 |
|----|------|
| P-1 | SPDX 优先 — 所有许可证 ID 必须是 SPDX 标准 |
| P-2 | 独立评估者 — 与 Generator 使用不同的模型类别 |
| P-3 | 证据导向决策 — 每个阻断都附带可追溯的证据 |
| P-4 | 默认透明 — 必须有 EU AI Act Article 50 标记 |
| P-5 | 客户主权 — 策略可在 EULA §9 限制内定制 |

## 工具序列（XSPEC-193 §2）

```
1. dependency_reader
2. license_lookup         ← ClearlyDefined API (v2.1.0)
3. license_blocklist_check
4. sbom_generator
5. pii_pattern_detector   ← AST-enhanced (v2.1.0)
6. copyright_similarity_check ← EmbeddingProvider (v2.1.0)
7. eu_ai_act_classifier
8. transparency_marker
9. block_pr
10. suggest_alternative
11. escalate_to_human
```

## 相关规格

- XSPEC-193 — License Compliance Agent 完整规格
- XSPEC-066 — Wave 3 Compliance Pack（v1.0.0 基线）
- DEC-063 — VibeOps 法务与合规策略
- DEC-064 — 客户 IP 隔离（cache salt）
- ASPEC-001 — License Compliance Agent SPEC（XSPEC-205 §REQ-2 格式）

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0.0 | 2026-04-30 | 初版 — REQ-001~006 通用 OSS 实践 |
| v2.0.0 | 2026-05-14 | 新增 Tier 2 LC-001~009 AI 专属规则 |
| v2.1.0 | 2026-05-16 | ClearlyDefined API + AST PII + EmbeddingProvider + ASPEC-001 引用 |
