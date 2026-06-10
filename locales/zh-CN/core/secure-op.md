---
source: ../../../core/secure-op.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 7ef0c2e3a2c2
status: current
---

# Secure-Op：AI Agent 安全操作标准

> **语言**: [繁體中文（原文）](../../../core/secure-op.md) | [繁體中文](../../zh-TW/core/secure-op.md) | 简体中文

**版本**：1.0.0
**最后更新**：2026-05-04
**适用范围**：所有部署 AI Agent 的系统
**范围**：AI Agent 安全操作
**行业标准**：ISO/IEC 27001:2022、NIST SP 800-207、OWASP LLM Top 10 2025

---

## 标准概述

**Secure-Op** 是针对 AI Agent 系统的安全操作方法论，定义 AI Agent 在执行高风险操作时必须遵循的六大安全支柱。

本标准源自 External Guardian OPA Sidecar reference implementation (XSPEC-146 from an external project)的实现经验，并沉淀为通用 UDS 标准，供任何采用 UDS 的 AI Agent 系统应用。

### 核心理念

传统软件安全假设操作主体是人类用户。AI Agent 系统带来新的威胁模型：
- **Agent 可能被提示注入（Prompt Injection）操控**，伪装成合法操作
- **LLM 推理不确定性**，相同输入可能产生不同决策
- **操作范围不可预测**，一个指令可能触发连锁副作用

Secure-Op 的回应是：**确定性系统守护边界，概率性系统只做辅助**。

---

## 六大支柱

### 支柱一：Veto-Based Decision（否决式决策）

决策逻辑必须以「否决权」为基础，不得使用投票制。

#### 核心原则

| 原则 | 说明 |
|------|------|
| Deterministic > Probabilistic | 确定性系统（Policy Engine、Rule Engine）的决策优先于 LLM 推理 |
| Policy-as-Code | 所有安全规则必须版本控制，可回归测试 |
| 否决即终止 | 任一层 DENY 即立刻终止管道，不继续下一层 |

#### 决策管道（Decision Pipeline）

```
输入操作请求
     │
     ▼
[M1] Prompt Injection 检测
     │ DENY → 终止
     ▼
[M2] Policy Engine（OPA / Rule Engine）
     │ DENY → 终止
     ▼
[M3] SOBR 风险评分
     │ ≥76 → DENY；51-75 → HITL；≤50 → 继续
     ▼
[M4] Semantic Review（可选，LLM）
     │ DENY → 终止
     ▼
执行操作 + 记录 Audit
```

**参考实现**：OPA（Open Policy Agent）或等效 Policy Engine

---

### 支柱二：SOBR Risk Scoring（四维风险评分）

量化风险分数，提供一致且可解释的决策依据。

#### 公式

```
RiskScore = S×0.30 + O×0.25 + B×0.25 + R×0.20
```

#### 四个维度

| 维度 | 权重 | 说明 | 示例高分 | 示例低分 |
|------|------|------|---------|---------|
| **S** Sensitivity | 0.30 | 目标资源敏感度 | 用户凭证（100）| 公开文档（5）|
| **O** OperationType | 0.25 | 操作危险程度 | 执行任意代码（100）| 读取公开数据（10）|
| **B** BlastRadius | 0.25 | 操作影响范围 | 影响所有生产环境（100）| 隔离开发沙箱（10）|
| **R** Reversibility | 0.20 | 不可逆程度（越不可逆分数越高）| 永久删除无备份（100）| 只读操作（0）|

#### 决策阈值

| 分数范围 | 决策 | 行动 |
|---------|------|------|
| 0–25 | **ALLOW** | 正常执行，记录 Audit |
| 26–50 | **ALLOW_WITH_MONITORING** | 执行并加强监控，标记人工事后审查 |
| 51–75 | **REQUIRE_HITL** | 触发人工审核升级（Human-in-the-Loop）|
| 76–100 | **DENY** | 拒绝，记录决策路径与违规项目 |

---

### 支柱三：Fail-Closed（故障关闭原则）

任何安全组件故障时，**默认行为必须是 DENY**，禁止 fail-open。

#### 故障场景对应

| 故障场景 | 必要响应 | 例外 |
|---------|---------|------|
| Policy Engine 不可达 | DENY ALL | 只读操作可由操作者明确设置例外 |
| SOBR 评分计算失败 | REQUIRE_HITL（保守升级）| 无 |
| Signature 验证失败 | DENY ALL | 无 |
| 任何未知错误 | DENY | 无 |

#### 禁止的反模式

- **Fail-Open**：错误时默认 ALLOW（严重度：CRITICAL）
- **部分验证继续执行**：某层验证失败但仍继续（严重度：HIGH）
- **静默吞噬错误**：catch 错误但不改变决策（严重度：HIGH）

---

### 支柱四：Audit Chain（不可篡改审计轨迹）

所有安全决策必须记录在**可验证的不可篡改审计轨迹**中。

#### 每条 Audit 记录必要字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `request_id` | UUID v4 | 每次决策的唯一标识符 |
| `decision` | enum | ALLOW / ALLOW_WITH_MONITORING / REQUIRE_HITL / DENY |
| `risk_score` | number (0-100) | SOBR 计算结果 |
| `timestamp` | ISO 8601 UTC | 毫秒精度时间戳 |
| `violations` | string[] | 违规政策列表（ALLOW 时为空数组）|
| `signature` | base64 Ed25519 | 对核心字段的非对称签名 |
| `prev_hash` | SHA-256 hex | 前一条记录的 hash（构成 hash chain）|

#### Hash Chain 设计

```
Record[0]: prev_hash = "0000...0000" (genesis)
Record[1]: prev_hash = SHA-256(Record[0])
Record[2]: prev_hash = SHA-256(Record[1])
...
```

必须提供 `verify_chain()` 函数，可检测任何中间记录的篡改。

#### 签名规范

- **算法**：Ed25519（非对称加密）
- **签署内容**：`{request_id}:{decision}:{risk_score}:{timestamp}`
- **禁止**：使用 HMAC（对称）作为审计签名

#### 存储级别

| 级别 | 存储介质 | 适用环境 |
|------|---------|---------|
| Level 0（最低）| 本地 append-only file | 开发/测试 |
| Level 1（推荐）| WORM 存储（S3 Object Lock / Azure Immutable Blob）| 生产环境 |
| Level 2（最高）| 不可变云端 + Remote Attestation | 法规要求环境（SOC2, ISO 27001 认证）|

---

### 支柱五：HITL Escalation（人工审核升级）

Risk Score 落在 51–75（REQUIRE_HITL 区间）时，必须有明确的人工审核升级机制。

#### 两种 HITL 模式

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| **Non-Blocking** | 发送通知，执行继续（加强监控）| 分数 51–62，低敏感操作 |
| **Blocking** | 暂停执行，等待人工确认 | 分数 63–75，高敏感环境 |

#### 必要要求

- **TTL**：HITL 审核请求必须有过期时间（建议 **1800 秒**）
- **过期行为**：TTL 到期未审核 → 自动升级为 DENY
- **Audit**：HITL 触发事件与审核结果必须记入 Audit Chain
- **通知接口**：Webhook 为标准接口；Adapter 模式支持 Slack / Teams / PagerDuty

#### 通知 Payload 必要字段

```json
{
  "request_id": "...",
  "risk_score": 67,
  "operation_summary": "...",
  "policy_violations": [...],
  "expires_at": "2026-05-04T12:30:00Z"
}
```

---

### 支柱六：Prompt Injection Defense（提示注入防护）

AI Agent 系统必须防护 Prompt Injection 攻击，防止恶意输入绕过安全控制。

#### 检测模式类型

| 类型 | 示例模式 |
|------|---------|
| 覆盖指令 | "ignore previous instructions", "disregard your programming" |
| 角色扮演操控 | "you are now", "act as", "DAN", "jailbreak" |
| 系统 Token 注入 | `[SYSTEM]`, `[INST]`, `<\|system\|>`, `<<SYS>>` |
| 指令前缀 | "New instruction:", "OVERRIDE:", "Updated system prompt:" |

#### 防护措施

1. **拦截位置**：M1 Intake 层（管道最前端），在任何语义评估前拦截
2. **响应**：触发 DENY + 记录 `PROMPT_INJECTION_DETECTED` violation
3. **日志安全**：**禁止**将原始恶意输入存入日志；只记录检测到的模式类型与输入的 Hash
4. **模式维护**：每月更新检测模式；订阅 OWASP LLM Working Group 更新

---

## 实现参考

### External Guardian (reference implementation)（TypeScript 参考实现）

External Guardian OPA Sidecar reference implementation (XSPEC-146 from an external project)是 Secure-Op 的完整 TypeScript 参考实现，包含：

- **GuardianService**：主要 Veto-based 决策管道
- **SobrScorer**：SOBR 四维风险评分
- **AuditChain**：SHA-256 Hash Chain + Ed25519 签名
- **HitlNotifier**：Webhook Adapter（支持 Slack/Teams）
- **PromptInjectionDetector**：正则表达式 + 模式匹配

> 路径：external Guardian implementation (separately licensed)

### 最小实现清单

建立 Secure-Op 合规系统的最小步骤：

```
□ Step 1：建立 Policy Engine（OPA 或等效工具）并连接至 Agent 管道
□ Step 2：实现 SOBR 评分计算（4 维度 + 权重公式）
□ Step 3：设置决策阈值路由（ALLOW / MONITORING / HITL / DENY）
□ Step 4：建立 Audit Chain（append-only + hash + signature）
□ Step 5：实现 HITL 通知 + TTL 机制
□ Step 6：加入 Prompt Injection 检测（M1 位置）
□ Step 7：在所有错误路径确认 Fail-Closed 行为
```

---

## ISO / NIST / OWASP 映射

| 支柱 | 标准映射 |
|------|---------|
| Veto-Based Decision | ISO/IEC 27001:2022 A.8.24 |
| SOBR Risk Scoring | ISO/IEC 27001:2022 Annex A.8.24；ISO/IEC 27005 |
| Fail-Closed | NIST SP 800-207 Zero Trust Architecture（2.1节）；ISO/IEC 27001:2022 A.8.22 |
| Audit Chain | ISO/IEC 27001:2022 A.8.15（Logging）；ISO/IEC 27001:2022 A.5.33（Protection of records）|
| HITL Escalation | ISO/IEC 27001:2022 A.8.2；NIST SP 800-53 AC-2 |
| Prompt Injection Defense | OWASP LLM Top 10 2025 LLM01；ISO/IEC 27001:2022 A.8.24 |

---

## 级别分类

Secure-Op 标准分为三个实现级别（Priority Levels）：

### P0a：审查层（必须）

最低基准要求，所有 AI Agent 系统必须实现：

- Policy Engine 连接并设置 Fail-Closed
- SOBR 风险评分（任何操作请求触发）
- Prompt Injection 检测（M1 位置）

### P0b：执行验证层（必须）

在 P0a 基础上，强化执行时的决策保障：

- 完整决策路由（ALLOW / MONITORING / HITL / DENY）
- HITL 升级机制（含 TTL）
- 所有决策记入 Audit Log

### P0c：强化层（高安全需求环境）

在 P0b 基础上，达到法规合规级别：

- Hash Chain + Ed25519 签名的 Audit Chain
- WORM 存储（Level 1 或 Level 2）
- Remote Attestation 支持
- 定期 Audit Chain 完整性验证

---

## 快速开始建议

### 对于小型 AI Agent 系统（MVP / Prototype）

从 SOBR 评分 + 基本 DENY 阈值开始：

1. 为每个操作类型定义 S / O / B / R 值
2. 计算 RiskScore；≥76 直接拒绝
3. 记录决策到 append-only log

### 对于生产环境 AI Agent 系统

完整实现六大支柱，使用 External Guardian (reference implementation) 作为参考或直接引用。

### 对于法规要求环境（金融、医疗、政府）

P0c 级别 + 外部审计师可访问的 Audit Chain 导出功能。

---

## 相关标准

- `security-standards`：架构层安全设计（输入验证、认证设计）
- `security-testing`：安全测试方法论（SAST、DAST、依赖审计）
- `audit-trail`：一般 Audit Trail 标准
- `mock-boundary`：测试中禁止 mock 安全控制


**Scope**: universal
