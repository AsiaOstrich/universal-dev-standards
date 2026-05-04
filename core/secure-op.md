# Secure-Op：AI Agent 安全操作標準

**版本**：1.0.0
**最後更新**：2026-05-04
**適用範圍**：所有部署 AI Agent 的系統
**範疇**：AI Agent 安全操作
**產業標準**：ISO/IEC 27001:2022、NIST SP 800-207、OWASP LLM Top 10 2025

---

## 標準概述

**Secure-Op** 是針對 AI Agent 系統的安全操作方法論，定義 AI Agent 在執行高風險操作時必須遵循的六大安全支柱。

本標準源自 VibeOps Guardian OPA Sidecar（XSPEC-146）的實作經驗，並沉澱為通用 UDS 標準，供任何採用 UDS 的 AI Agent 系統套用。

### 核心理念

傳統軟體安全假設操作主體是人類使用者。AI Agent 系統帶來新的威脅模型：
- **Agent 可能被提示注入（Prompt Injection）操控**，偽裝成合法操作
- **LLM 推論不確定性**，相同輸入可能產生不同決策
- **操作範圍不可預測**，一個指令可能觸發連鎖副作用

Secure-Op 的回應是：**確定性系統守護邊界，機率性系統只做輔助**。

---

## 六大支柱

### 支柱一：Veto-Based Decision（否決式決策）

決策邏輯必須以「否決權」為基礎，不得使用投票制。

#### 核心原則

| 原則 | 說明 |
|------|------|
| Deterministic > Probabilistic | 確定性系統（Policy Engine、Rule Engine）的決策優先於 LLM 推論 |
| Policy-as-Code | 所有安全規則必須版本控制，可回歸測試 |
| 否決即終止 | 任一層 DENY 即立刻終止管線，不繼續下一層 |

#### 決策管線（Decision Pipeline）

```
輸入操作請求
     │
     ▼
[M1] Prompt Injection 偵測
     │ DENY → 終止
     ▼
[M2] Policy Engine（OPA / Rule Engine）
     │ DENY → 終止
     ▼
[M3] SOBR 風險評分
     │ ≥76 → DENY；51-75 → HITL；≤50 → 繼續
     ▼
[M4] Semantic Review（選配，LLM）
     │ DENY → 終止
     ▼
執行操作 + 記錄 Audit
```

**參考實作**：OPA（Open Policy Agent）或等效 Policy Engine

---

### 支柱二：SOBR Risk Scoring（四維風險評分）

量化風險分數，提供一致且可解釋的決策依據。

#### 公式

```
RiskScore = S×0.30 + O×0.25 + B×0.25 + R×0.20
```

#### 四個維度

| 維度 | 權重 | 說明 | 範例高分 | 範例低分 |
|------|------|------|---------|---------|
| **S** Sensitivity | 0.30 | 目標資源敏感度 | 使用者憑證（100）| 公開文件（5）|
| **O** OperationType | 0.25 | 操作危險程度 | 執行任意程式碼（100）| 讀取公開資料（10）|
| **B** BlastRadius | 0.25 | 操作影響範圍 | 影響所有正式環境（100）| 隔離開發沙箱（10）|
| **R** Reversibility | 0.20 | 不可逆程度（越不可逆分數越高）| 永久刪除無備份（100）| 唯讀操作（0）|

#### 決策閾值

| 分數範圍 | 決策 | 行動 |
|---------|------|------|
| 0–25 | **ALLOW** | 正常執行，記錄 Audit |
| 26–50 | **ALLOW_WITH_MONITORING** | 執行並加強監控，標記人工事後審查 |
| 51–75 | **REQUIRE_HITL** | 觸發人工審核升級（Human-in-the-Loop）|
| 76–100 | **DENY** | 拒絕，記錄決策路徑與違規項目 |

---

### 支柱三：Fail-Closed（故障關閉原則）

任何安全組件故障時，**預設行為必須是 DENY**，禁止 fail-open。

#### 故障情境對應

| 故障情境 | 必要回應 | 例外 |
|---------|---------|------|
| Policy Engine 不可達 | DENY ALL | 唯讀操作可由操作者明確設定例外 |
| SOBR 評分計算失敗 | REQUIRE_HITL（保守升級）| 無 |
| Signature 驗證失敗 | DENY ALL | 無 |
| 任何未知錯誤 | DENY | 無 |

#### 禁止的反模式

- **Fail-Open**：錯誤時預設 ALLOW（嚴重度：CRITICAL）
- **部分驗證繼續執行**：某層驗證失敗但仍繼續（嚴重度：HIGH）
- **靜默吞噬錯誤**：catch 錯誤但不改變決策（嚴重度：HIGH）

---

### 支柱四：Audit Chain（不可竄改審計軌跡）

所有安全決策必須記錄在**可驗證的不可竄改審計軌跡**中。

#### 每筆 Audit 紀錄必要欄位

| 欄位 | 型別 | 說明 |
|------|------|------|
| `request_id` | UUID v4 | 每次決策的唯一識別碼 |
| `decision` | enum | ALLOW / ALLOW_WITH_MONITORING / REQUIRE_HITL / DENY |
| `risk_score` | number (0-100) | SOBR 計算結果 |
| `timestamp` | ISO 8601 UTC | 毫秒精度時間戳 |
| `violations` | string[] | 違規政策列表（ALLOW 時為空陣列）|
| `signature` | base64 Ed25519 | 對核心欄位的非對稱簽章 |
| `prev_hash` | SHA-256 hex | 前一筆紀錄的 hash（構成 hash chain）|

#### Hash Chain 設計

```
Record[0]: prev_hash = "0000...0000" (genesis)
Record[1]: prev_hash = SHA-256(Record[0])
Record[2]: prev_hash = SHA-256(Record[1])
...
```

必須提供 `verify_chain()` 函式，可偵測任何中間紀錄的竄改。

#### 簽章規格

- **演算法**：Ed25519（非對稱加密）
- **簽署內容**：`{request_id}:{decision}:{risk_score}:{timestamp}`
- **禁止**：使用 HMAC（對稱）作為審計簽章

#### 儲存等級

| 等級 | 儲存媒介 | 適用環境 |
|------|---------|---------|
| Level 0（最低）| 本地 append-only file | 開發/測試 |
| Level 1（推薦）| WORM 儲存（S3 Object Lock / Azure Immutable Blob）| 正式環境 |
| Level 2（最高）| 不可變雲端 + Remote Attestation | 法規要求環境（SOC2, ISO 27001 認證）|

---

### 支柱五：HITL Escalation（人工審核升級）

Risk Score 落在 51–75（REQUIRE_HITL 區間）時，必須有明確的人工審核升級機制。

#### 兩種 HITL 模式

| 模式 | 行為 | 適用情境 |
|------|------|---------|
| **Non-Blocking** | 發送通知，執行繼續（加強監控）| 分數 51–62，低敏感操作 |
| **Blocking** | 暫停執行，等待人工確認 | 分數 63–75，高敏感環境 |

#### 必要要求

- **TTL**：HITL 審核請求必須有過期時間（建議 **1800 秒**）
- **過期行為**：TTL 到期未審核 → 自動升級為 DENY
- **Audit**：HITL 觸發事件與審核結果必須記入 Audit Chain
- **通知介面**：Webhook 為標準介面；Adapter 模式支援 Slack / Teams / PagerDuty

#### 通知 Payload 必要欄位

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

### 支柱六：Prompt Injection Defense（提示注入防護）

AI Agent 系統必須防護 Prompt Injection 攻擊，防止惡意輸入繞過安全控制。

#### 偵測模式類型

| 類型 | 範例模式 |
|------|---------|
| 覆蓋指令 | "ignore previous instructions", "disregard your programming" |
| 角色扮演操控 | "you are now", "act as", "DAN", "jailbreak" |
| 系統 Token 注入 | `[SYSTEM]`, `[INST]`, `<\|system\|>`, `<<SYS>>` |
| 指令前綴 | "New instruction:", "OVERRIDE:", "Updated system prompt:" |

#### 防護措施

1. **攔截位置**：M1 Intake 層（管線最前端），在任何語意評估前攔截
2. **回應**：觸發 DENY + 記錄 `PROMPT_INJECTION_DETECTED` violation
3. **日誌安全**：**禁止**將原始惡意輸入存入日誌；只記錄偵測到的模式類型與輸入的 Hash
4. **模式維護**：每月更新偵測模式；訂閱 OWASP LLM Working Group 更新

---

## 實作參考

### VibeOps Guardian（TypeScript 參考實作）

VibeOps Guardian OPA Sidecar（XSPEC-146）是 Secure-Op 的完整 TypeScript 參考實作，包含：

- **GuardianService**：主要 Veto-based 決策管線
- **SobrScorer**：SOBR 四維風險評分
- **AuditChain**：SHA-256 Hash Chain + Ed25519 簽章
- **HitlNotifier**：Webhook Adapter（支援 Slack/Teams）
- **PromptInjectionDetector**：正則表達式 + 模式比對

> 路徑：`vibeops/src/guardian/`（VibeOps repo，AGPL-3.0）

### 最小實作清單

建立 Secure-Op 合規系統的最小步驟：

```
□ Step 1：建立 Policy Engine（OPA 或等效工具）並連接至 Agent 管線
□ Step 2：實作 SOBR 評分計算（4 維度 + 權重公式）
□ Step 3：設定決策閾值路由（ALLOW / MONITORING / HITL / DENY）
□ Step 4：建立 Audit Chain（append-only + hash + signature）
□ Step 5：實作 HITL 通知 + TTL 機制
□ Step 6：加入 Prompt Injection 偵測（M1 位置）
□ Step 7：在所有錯誤路徑確認 Fail-Closed 行為
```

---

## ISO / NIST / OWASP 對映

| 支柱 | 標準對映 |
|------|---------|
| Veto-Based Decision | ISO/IEC 27001:2022 A.8.24 |
| SOBR Risk Scoring | ISO/IEC 27001:2022 Annex A.8.24；ISO/IEC 27005 |
| Fail-Closed | NIST SP 800-207 Zero Trust Architecture（2.1節）；ISO/IEC 27001:2022 A.8.22 |
| Audit Chain | ISO/IEC 27001:2022 A.8.15（Logging）；ISO/IEC 27001:2022 A.5.33（Protection of records）|
| HITL Escalation | ISO/IEC 27001:2022 A.8.2；NIST SP 800-53 AC-2 |
| Prompt Injection Defense | OWASP LLM Top 10 2025 LLM01；ISO/IEC 27001:2022 A.8.24 |

---

## 等級分類

Secure-Op 標準分為三個實作等級（Priority Levels）：

### P0a：審查層（必須）

最低基準要求，所有 AI Agent 系統必須實作：

- Policy Engine 連接並設定 Fail-Closed
- SOBR 風險評分（任何操作請求觸發）
- Prompt Injection 偵測（M1 位置）

### P0b：執行驗證層（必須）

在 P0a 基礎上，強化執行時的決策保障：

- 完整決策路由（ALLOW / MONITORING / HITL / DENY）
- HITL 升級機制（含 TTL）
- 所有決策記入 Audit Log

### P0c：強化層（高安全需求環境）

在 P0b 基礎上，達到法規合規等級：

- Hash Chain + Ed25519 簽章的 Audit Chain
- WORM 儲存（Level 1 或 Level 2）
- Remote Attestation 支援
- 定期 Audit Chain 完整性驗證

---

## 快速開始建議

### 對於小型 AI Agent 系統（MVP / Prototype）

從 SOBR 評分 + 基本 DENY 閾值開始：

1. 為每個操作類型定義 S / O / B / R 值
2. 計算 RiskScore；≥76 直接拒絕
3. 記錄決策到 append-only log

### 對於生產環境 AI Agent 系統

完整實作六大支柱，使用 VibeOps Guardian 作為參考或直接引用。

### 對於法規要求環境（金融、醫療、政府）

P0c 等級 + 外部稽核師可存取的 Audit Chain 匯出功能。

---

## 相關標準

- `security-standards`：架構層安全設計（輸入驗證、認證設計）
- `security-testing`：安全測試方法論（SAST、DAST、依賴審計）
- `audit-trail`：一般 Audit Trail 標準
- `mock-boundary`：測試中禁止 mock 安全控制
