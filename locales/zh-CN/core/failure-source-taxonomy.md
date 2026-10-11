---
source: ../../../core/failure-source-taxonomy.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 56c9d4057405
status: current
---

# 失败来源分类法标准

> **语言**: [English](../../../core/failure-source-taxonomy.md) | 简体中文

> **来源**: XSPEC-045 | **借鉴自**: ultraworkers/claw-code ROADMAP Phase 2 Failure Taxonomy

## 概述

失败来源分类法在现有的 `TaskStatus`（是什么）之上，新增 `failureSource`（为什么）维度。结构化的失败来源让下游的恢复机制（Recovery Recipe Registry，XSPEC-046）能够精准匹配策略，避免对本质上不同的失败类型套用同一套重试逻辑。

## 8 类失败来源

| 来源 | 说明 | 建议恢复方式 |
|------|------|-------------|
| `prompt_delivery` | 提示词未送达 LLM（API 4xx、空响应、解析错误） | retry 或 model_switch |
| `model_degradation` | LLM 质量下降（重复输出、答非所问） | model_switch |
| `branch_divergence` | 工作分支落后于基础分支 | rebase_and_retry |
| `compilation` | 编译或类型检查错误（tsc、cargo、go build） | fix_loop |
| `test_failure` | 测试失败（unit / integration / system / e2e） | fix_loop |
| `tool_failure` | 工具层失败（MCP server 无响应、插件加载失败） | 先 circuit_breaker 再 retry |
| `policy_violation` | 安全／治理策略拦截（Guardian deny、SafetyHook） | human_checkpoint |
| `resource_exhaustion` | 资源耗尽（超出 token 预算、超时、USD 预算） | degraded_mode 或 human_checkpoint |

## 优先级规则

多个失败来源同时存在时，依下列规则处理：

1. `branch_divergence` > `compilation` —— 分支漂移通常是编译失败的根因
2. `policy_violation` > 其他 —— 安全优先，不得尝试绕过
3. `resource_exhaustion` > 其他 —— 资源耗尽时重试没有意义
4. 其余情况：采用最先检测到的来源

## 类型

```typescript
type FailureSource =
  | "prompt_delivery"
  | "model_degradation"
  | "branch_divergence"
  | "compilation"
  | "test_failure"
  | "tool_failure"
  | "policy_violation"
  | "resource_exhaustion";

interface FailureDetail {
  source: FailureSource;
  raw_error: string;
  detected_by: string;  // quality-gate / claude-adapter / safety-hook / branch-drift
  timestamp: string;    // ISO 8601
}
```

## 指引

- 所有失败结果都应附带 `failureSource`，以便精准匹配恢复策略
- `failureSource` 是**可选**字段 —— 不得破坏没有此字段的既有代码
- 单次失败事件中，选择最根本的来源作为 `failureSource`
- `failureSource` 应由检测到该失败的组件设置
- 各采用层各自独立定义自己的 `FailureSource` 类型（许可证隔离）

## 适用场景

- 质量门禁（采用层）失败结果的信息补充
- Pipeline Runner（采用层）`agent:error` 事件的 payload
- Recovery Recipe Registry（XSPEC-046）的匹配键
- 遥测失败分析的维度

## 参考资料

- AI 优化版：[ai/standards/failure-source-taxonomy.ai.yaml](../../../ai/standards/failure-source-taxonomy.ai.yaml)
- XSPEC-045：跨项目规格
- 依赖：Recovery Recipe Registry（XSPEC-046）
- 借鉴自：[ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) ROADMAP Phase 2 Failure Taxonomy


**范围**: universal
