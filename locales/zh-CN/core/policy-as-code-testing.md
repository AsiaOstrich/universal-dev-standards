---
source: ../../../core/policy-as-code-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 80f3b5726ad3
status: current
---

# Policy as Code 测试标准

> **Language**: [English](../../../core/policy-as-code-testing.md) | [繁體中文](../../zh-TW/core/policy-as-code-testing.md) | 简体中文

> 标准 ID：`policy-as-code-testing`
> 版本：v1.0.0
> 最后更新：2026-05-05

---

## 为什么需要测试 Policy as Code？

OPA（Open Policy Agent）的 Rego policy 控制 AI Agent 能否执行生产环境操作。**未测试的 policy = 静默的安全漏洞。**

Policy as Code 的特殊风险：
1. **边界条件难以推理**：`reversible: false` + `target_env: "prod"` 组合是否触发？
2. **类型错误只在运行时爆发**：`array.concat()` 用在 set 类型 → 静默失效
3. **Fail-Open 风险**：评估失败若返回 `allow: true`，攻击者可触发未定义路径
4. **Policy 改动回归**：新增一条 rule 可能意外放行原本被拦截的案例

---

## 一、OPA 测试框架

### 测试规则格式

```rego
# 文件命名：<policy_module>_test.rego
# Package：<policy_package>_test
package governance.guardian.forbidden_patterns_test

import future.keywords.if

# 正向测试：规则应触发（assert rule fires）
test_drop_database_is_forbidden if {
    data.governance.guardian.forbidden_patterns.has_forbidden_pattern with input as {
        "plan": [{"command_type": "sql", "command": "DROP DATABASE prod_main", "reversible": false}]
    }
}

# 负向测试：规则不应触发（assert rule does NOT fire）
test_safe_select_is_not_forbidden if {
    not data.governance.guardian.forbidden_patterns.has_forbidden_pattern with input as {
        "plan": [{"command_type": "sql", "command": "SELECT * FROM users LIMIT 10", "reversible": true}]
    }
}
```

### 执行方式

```bash
# OPA 已安装时
opa test src/guardian/policies/ -v

# 通过 Docker（无需安装 OPA）
docker run --rm \
  -v "$(pwd)/src/guardian/policies:/policies:ro" \
  openpolicyagent/opa:latest-static \
  test /policies -v
```

---

## 二、每个 Policy Module 的最低测试要求

| 类型 | 最少案例 | 说明 |
|------|---------|------|
| ALLOW cases | 2 | 应该通过的正常操作 |
| DENY cases | 3 | 应该被拦截的危险操作 |
| Boundary cases | 1 | 边界条件（如 reversible=true vs. false）|
| Integration（main policy）| 2 | 集成 main.rego 的允许 + 拒绝路径 |

---

## 三、Policy Module 设计原则

### 3.1 Fail-Closed 默认

```rego
# main.rego 必须包含以下默认值
default allow = false

allow if {
    not data.governance.guardian.forbidden_patterns.has_forbidden_pattern
    not data.governance.guardian.env_policy.prod_violation
    not data.governance.guardian.logic_constraints.has_logic_violation
}
```

任何 `undefined` 评估结果都应返回 DENY，不能返回 ALLOW。

### 3.2 使用 Set（不要 array.concat）

OPA ≥ 0.40 的类型系统严格区分 array 和 set。`violations` partial rule 是 set 类型，**不可用 `array.concat()`**。

```rego
# ✅ 正确：partial set rule 收集 violations
deny_reasons[r] if { r := data.governance.guardian.forbidden_patterns.violations[_] }
deny_reasons[r] if { r := data.governance.guardian.env_policy.violations[_] }
deny_reasons[r] if { r := data.governance.guardian.logic_constraints.violations[_] }

# ❌ 错误：array.concat 用在 set 上 → rego_type_error
# deny_reasons := array.concat(violations1, violations2)
```

### 3.3 禁止解析自由文本字段

Policy 决策**不得依赖** `intent`、`description`、`annotation` 等用户可控文本字段。

```rego
# ❌ 危险：解析 intent 字段 → Prompt Injection 攻击面（OWASP LLM01）
allow if { contains(input.intent, "EMERGENCY") }

# ✅ 安全：只使用结构化字段
allow if {
    input.target_env != "prod"
    every step in input.plan { step.reversible == true }
}
```

### 3.4 一个 Module 管一个关注点

```
policies/
  forbidden_patterns.rego      ← 禁止指令模式
  forbidden_patterns_test.rego
  env_policy.rego              ← 环境特定规则（prod 保护）
  env_policy_test.rego
  logic_constraints.rego       ← 逻辑一致性（stop+start 用 restart）
  logic_constraints_test.rego
  risk_gate.rego               ← 风险分数阈值
  risk_gate_test.rego
  main.rego                    ← 集成所有 module，Fail-Closed
  main_test.rego               ← 集成测试
```

---

## 四、CI 集成

### GitHub Actions 步骤

```yaml
- name: Test OPA Rego Policies
  run: |
    docker run --rm \
      -v "${{ github.workspace }}/src/guardian/policies:/policies:ro" \
      openpolicyagent/opa:latest-static \
      test /policies -v
```

### npm script

```json
{
  "test:policy": "docker run --rm -v \"$(pwd)/src/guardian/policies:/policies:ro\" openpolicyagent/opa:latest-static test /policies -v"
}
```

---

## 五、质量闸门

| 闸门 | 阈值 | 强制程度 |
|------|------|---------|
| OPA 测试通过率（CI） | 100%（所有 test_ rule 通过）| Block merge |
| Root policy Fail-Closed | `default allow = false` 存在 | Block merge |
| 每个 policy module 有 _test.rego | 每个 .rego 有对应测试 | Advisory |

---

## 六、反模式（Anti-patterns）

| 反模式 | 问题 | 正确做法 |
|--------|------|---------|
| `array.concat()` 用在 violations（set 类型）| OPA 类型错误 | 改用 partial set rule |
| Root policy 缺少 `default allow = false` | Fail-Open 漏洞 | 加入 default |
| Intent 字段参与安全决策 | Prompt Injection 攻击面 | 只用结构化字段 |
| 只测试 DENY（无 ALLOW 测试）| 无法检测过度限制 | 加入 ALLOW 案例 |
| _test.rego 只在本地运行，不在 CI | policy 改动无安全网 | CI 加 `opa test` step |

---

## 参考标准

- [OPA Testing Guide](https://www.openpolicyagent.org/docs/latest/policy-testing/)
- NIST SP 800-204C — Attribute-based Access Control
- [UDS `secure-op.ai.yaml`](../../../core/secure-op.md) — AI Agent 安全操作六大支柱
- [UDS `adversarial-test.ai.yaml`](../../../core/adversarial-test.md) — 对抗性测试（OWASP LLM01）
- [UDS `container-security.ai.yaml`](../../../core/container-security.md) — 容器安全（OPA Sidecar 部署）

---

**Scope**: universal
