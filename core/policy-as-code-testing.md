# Policy as Code 測試標準

> 標準 ID：`policy-as-code-testing`
> 版本：v1.0.0
> 最後更新：2026-05-05

---

## 為什麼需要測試 Policy as Code？

OPA（Open Policy Agent）的 Rego policy 控制 AI Agent 能否執行生產環境操作。**未測試的 policy = 靜默的安全漏洞。**

Policy as Code 的特殊風險：
1. **邊界條件難以推理**：`reversible: false` + `target_env: "prod"` 組合是否觸發？
2. **型別錯誤只在執行時爆發**：`array.concat()` 用在 set 型別 → 靜默失效
3. **Fail-Open 風險**：評估失敗若回傳 `allow: true`，攻擊者可觸發未定義路徑
4. **Policy 改動回歸**：新增一條 rule 可能意外放行原本被擋的案例

---

## 一、OPA 測試框架

### 測試規則格式

```rego
# 檔案命名：<policy_module>_test.rego
# Package：<policy_package>_test
package vibeops.guardian.forbidden_patterns_test

import future.keywords.if

# 正向測試：規則應觸發（assert rule fires）
test_drop_database_is_forbidden if {
    data.vibeops.guardian.forbidden_patterns.has_forbidden_pattern with input as {
        "plan": [{"command_type": "sql", "command": "DROP DATABASE prod_main", "reversible": false}]
    }
}

# 負向測試：規則不應觸發（assert rule does NOT fire）
test_safe_select_is_not_forbidden if {
    not data.vibeops.guardian.forbidden_patterns.has_forbidden_pattern with input as {
        "plan": [{"command_type": "sql", "command": "SELECT * FROM users LIMIT 10", "reversible": true}]
    }
}
```

### 執行方式

```bash
# OPA 已安裝時
opa test src/guardian/policies/ -v

# 透過 Docker（不需安裝 OPA）
docker run --rm \
  -v "$(pwd)/src/guardian/policies:/policies:ro" \
  openpolicyagent/opa:latest-static \
  test /policies -v
```

---

## 二、每個 Policy Module 的最低測試要求

| 類型 | 最少案例 | 說明 |
|------|---------|------|
| ALLOW cases | 2 | 應該通過的正常操作 |
| DENY cases | 3 | 應該被攔截的危險操作 |
| Boundary cases | 1 | 邊界條件（如 reversible=true vs. false）|
| Integration（main policy）| 2 | 整合 main.rego 的允許 + 拒絕路徑 |

---

## 三、Policy Module 設計原則

### 3.1 Fail-Closed 預設

```rego
# main.rego 必須包含以下預設
default allow = false

allow if {
    not data.vibeops.guardian.forbidden_patterns.has_forbidden_pattern
    not data.vibeops.guardian.env_policy.prod_violation
    not data.vibeops.guardian.logic_constraints.has_logic_violation
}
```

任何 `undefined` 評估結果都應回傳 DENY，不能回傳 ALLOW。

### 3.2 使用 Set（不要 array.concat）

OPA ≥ 0.40 的型別系統嚴格區分 array 和 set。`violations` partial rule 是 set 型別，**不可用 `array.concat()`**。

```rego
# ✅ 正確：partial set rule 集合 violations
deny_reasons[r] if { r := data.vibeops.guardian.forbidden_patterns.violations[_] }
deny_reasons[r] if { r := data.vibeops.guardian.env_policy.violations[_] }
deny_reasons[r] if { r := data.vibeops.guardian.logic_constraints.violations[_] }

# ❌ 錯誤：array.concat 用在 set 上 → rego_type_error
# deny_reasons := array.concat(violations1, violations2)
```

### 3.3 禁止解析自由文字欄位

Policy 決策**不得依賴** `intent`、`description`、`annotation` 等使用者可控文字欄位。

```rego
# ❌ 危險：解析 intent 欄位 → Prompt Injection 攻擊面（OWASP LLM01）
allow if { contains(input.intent, "EMERGENCY") }

# ✅ 安全：只使用結構化欄位
allow if {
    input.target_env != "prod"
    every step in input.plan { step.reversible == true }
}
```

### 3.4 一個 Module 管一個關注點

```
policies/
  forbidden_patterns.rego      ← 禁止指令模式
  forbidden_patterns_test.rego
  env_policy.rego              ← 環境特定規則（prod 保護）
  env_policy_test.rego
  logic_constraints.rego       ← 邏輯一致性（stop+start 用 restart）
  logic_constraints_test.rego
  risk_gate.rego               ← 風險分數閾值
  risk_gate_test.rego
  main.rego                    ← 整合所有 module，Fail-Closed
  main_test.rego               ← 整合測試
```

---

## 四、CI 整合

### GitHub Actions 步驟

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

## 五、品質閘門

| 閘門 | 閾值 | 強制程度 |
|------|------|---------|
| OPA 測試通過率（CI） | 100%（所有 test_ rule 通過）| Block merge |
| Root policy Fail-Closed | `default allow = false` 存在 | Block merge |
| 每個 policy module 有 _test.rego | 每個 .rego 有對應測試 | Advisory |

---

## 六、反模式（Anti-patterns）

| 反模式 | 問題 | 正確做法 |
|--------|------|---------|
| `array.concat()` 用在 violations（set 型）| OPA 型別錯誤 | 改用 partial set rule |
| Root policy 缺少 `default allow = false` | Fail-Open 漏洞 | 加入 default |
| Intent 欄位參與安全決策 | Prompt Injection 攻擊面 | 只用結構化欄位 |
| 只測試 DENY（無 ALLOW 測試）| 無法偵測過度限制 | 加入 ALLOW 案例 |
| _test.rego 只在本機跑，不在 CI | policy 改動無安全網 | CI 加 `opa test` step |

---

## 參考標準

- [OPA Testing Guide](https://www.openpolicyagent.org/docs/latest/policy-testing/)
- NIST SP 800-204C — Attribute-based Access Control
- [UDS `secure-op.ai.yaml`](./secure-op.md) — AI Agent 安全操作六大支柱
- [UDS `adversarial-test.ai.yaml`](./adversarial-test.md) — 對抗性測試（OWASP LLM01）
- [UDS `container-security.ai.yaml`](./container-security.md) — 容器安全（OPA Sidecar 部署）
