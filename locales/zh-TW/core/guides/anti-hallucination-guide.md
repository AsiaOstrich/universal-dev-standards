---
source: ../../../../core/guides/anti-hallucination-guide.md
source_version: 1.0.0
translation_version: 1.4.0
last_synced: 2026-10-16
source_hash: 884f338dfc76
status: current
---

# 防幻覺指引

> **語言**: English | [繁體中文](anti-hallucination-guide.md)

**版本**: 1.0.0
**最後更新**: 2026-01-29
**相關標準**: [防幻覺標準](../anti-hallucination.md)

---

## 目的

本指引提供防止 AI 幻覺的詳細範例、對話模式與案例研究。關於核心規範、標籤系統與驗證檢查清單，請參見 [防幻覺標準](../anti-hallucination.md)。

---

## 目錄

1. [理解 AI 幻覺](#understanding-ai-hallucination)
2. [對話語言指引](#conversation-language-guidelines)
3. [建議的最佳實務](#recommendation-best-practices)
4. [依類別的詳細範例](#detailed-examples-by-category)
5. [審查情境](#review-scenarios)
6. [AI 助理工作流程](#ai-assistant-workflow)
7. [語言無關應用](#language-agnostic-application)
8. [與程式碼審查整合](#integration-with-code-review)

---

## 理解 AI 幻覺

AI 幻覺發生於 AI 助理生成看似具權威性但實際上卻是：
- **捏造**：毫無證據憑空編造
- **假設**：基於模式而非事實
- **過時**：來自訓練資料，而非當前現實
- **錯誤歸屬**：與相似但不同的系統混淆

### 為什麼這在軟體開發中很重要

| 風險 | 影響 | 範例 |
|------|------|------|
| **捏造的 API** | 執行期錯誤、浪費除錯時間 | 「呼叫 `user.authenticate()` 方法」（不存在） |
| **錯誤的設定** | 安全性弱點、系統故障 | 「在正式環境中設定 `DEBUG=true`」（錯誤的變數） |
| **假設的需求** | 建置錯誤的功能 | 「使用者需要 SSO」（從未被指定） |
| **過時的模式** | 技術債、安全性問題 | 「使用 `componentWillMount`」（在 React 17 中已棄用） |

---

## 對話語言指引

### 適應使用者偏好

AI 助理應適應使用者的偏好語言，同時保持技術準確性：

| 情境 | 準則 | 範例 |
|------|------|------|
| 對話 | 使用專案指定語言 | 繁體中文、英文等 |
| 確定性標籤 | 使用專案指定語言 | `[Confirmed]` 或 `[已確認]` |
| 錯誤解釋 | 使用專案指定語言 | 以使用者的語言解釋編譯／執行期錯誤 |
| 技術術語 | 保留原文 | JWT、BCrypt、API、Token |
| 程式碼註解 | 遵循專案慣例 | 通常為英文 |
| Commit 訊息 | 遵循專案慣例 | 例如 `feat(auth): add login feature` |

---

## 建議的最佳實務

### 永遠包含推薦的選項

當提供多個選項時，永遠包含推薦的選項並說明理由：

**❌ 錯誤**:
```
There are three options:
1. Use Redis caching
2. Use in-memory caching
3. Use file-based caching

Please choose one.
```

**✅ 正確**:
```
There are three options:
1. Use Redis caching
2. Use in-memory caching
3. Use file-based caching

**Recommended: Option 1 (Redis)**: Given the project already has Redis infrastructure
and needs cross-instance cache sharing, Redis is the most suitable choice.
```

### 下一步建議

當完成一項任務或子任務時，永遠建議合理的下一步：

**✅ 正確**:
```
Task completed: API endpoint implemented.

**Suggested Next Steps**:
1. **[Recommended]** Add unit tests for the new endpoint (`src/tests/api/`)
2. Update API documentation (`docs/api-reference.md`)
3. Start frontend integration
```

---

## 各類別詳細範例

### 1. 捏造 API 或函式簽名

**❌ 錯誤**:
```
Assistant: "You can call UserService.GetUserById(int id) to retrieve users"
```
**問題**: 方法不存在或簽名不同。

**✅ 正確**:
```
Assistant: "Let me read the UserService file to find the correct method signature."

[After reading src/services/UserService.cs]

[Source: Code] UserService.cs:45 - Found method: FindUser(Guid userId)
The actual method uses Guid instead of int for the user ID parameter.
```

---

### 2. 假設需求

**❌ 錯誤**:
```
Assistant: "The system needs to support OAuth and SAML for enterprise SSO."
```
**問題**: 使用者只詢問驗證，未指定協定。

**✅ 正確**:
```
Assistant: "[Need Confirmation] You mentioned needing authentication.
Could you clarify:
1. Is this for internal users, external customers, or both?
2. Do you need enterprise SSO (OAuth/SAML) or simple username/password?
3. Any existing identity providers to integrate with?

This will help me recommend the most appropriate approach."
```

---

### 3. 推測未讀取的程式碼

**❌ 錯誤**:
```
Assistant: "The PaymentService handles credit card processing and integrates with Stripe."
```
**問題**: 檔案未讀取，功能僅從名稱假設。

**✅ 正確**:
```
Assistant: "I see a file named PaymentService.cs in your project structure.

[Unknown] I haven't read this file yet, so I cannot confirm its functionality.

Would you like me to read src/services/PaymentService.cs to understand:
- Which payment provider it uses?
- What payment methods are supported?
- How transactions are processed?"
```

---

### 4. 編造設定

**❌ 錯誤**:
```
Assistant: "Set the DATABASE_URL environment variable to connect to PostgreSQL.
Your connection string should be in appsettings.json under 'ConnectionStrings:DefaultConnection'."
```
**問題**: 設定結構與變數名稱未經驗證即假設。

**✅ 正確**:
```
Assistant: "Let me check your actual configuration files."

[After reading appsettings.json]

[Source: Code] appsettings.json:8-12 - Found database configuration:
- Connection string key: "ConnectionStrings:MainDb" (not "DefaultConnection")
- Using SQL Server, not PostgreSQL
- Additional setting "CommandTimeout": 30

Your project uses a different key name than the .NET default.
```

---

### 5. 憑空產生錯誤或 Bug

**❌ 錯誤**:
```
Assistant: "Your authentication code has a security vulnerability -
you're not hashing passwords properly."
```
**問題**: 未讀取實際程式碼即聲稱有 Bug。

**✅ 正確**:
```
Assistant: "Let me review your authentication implementation."

[After reading src/auth/AuthService.cs]

[Confirmed] AuthService.cs:67 - Password hashing implementation found:
- Using BCrypt with work factor 12 ✅
- Salt is auto-generated ✅
- No timing attack vulnerabilities detected ✅

Your password hashing implementation follows security best practices.
No issues found in the reviewed code.
```

---

### 6. 提出選項但不推薦

**❌ 錯誤**:
```
Assistant: "You can use: 1) JWT 2) Session 3) OAuth. Which do you prefer?"
```
**問題**: 列出選項但未提供指引或考量情境。

**✅ 正確**:
```
Assistant: "Based on your requirements:

**Options**:
1. JWT - Stateless, scalable, good for APIs
2. Session - Server-side state, traditional web apps
3. OAuth - Third-party identity providers

**Recommended: JWT**

[Inferred] Based on your microservices architecture (seen in docker-compose.yml),
JWT is the best fit because:
- Stateless: No session store needed across services
- Scalable: Each service can validate tokens independently
- Standard: Well-supported across your tech stack (.NET, React)

If you need social login later, you can add OAuth on top of JWT."
```

---

### 7. 未分析副作用即實作

**❌ 錯誤**:
```
User: "Add a function to delete user accounts"
Assistant: "Here's the implementation:

public async Task DeleteUser(Guid userId) {
    await _dbContext.Users.Where(u => u.Id == userId).DeleteAsync();
}
"
```
**問題**: 未考量連鎖效應即直接實作。

**✅ 正確**:
```
User: "Add a function to delete user accounts"
Assistant: "Before implementing, let me identify potential side effects:

**Potential Side Effects**:
1. **Data Integrity**: Related records (orders, comments, sessions) may become orphaned
2. **External Systems**: May need to notify third-party services (payment provider, email service)
3. **Audit Trail**: Deletion may violate compliance requirements (GDPR right to be forgotten vs. audit logs)

[Need Confirmation] How should we handle:
- Related user data (cascade delete vs. anonymize)?
- Active sessions?
- Historical records for reporting?

Once clarified, I'll provide the implementation."
```

---

## 審查情境

### 情境 1: 程式碼分析

**使用者請求**: 「審查驗證邏輯」

**❌ 不良回應**:
```
Your authentication system uses JWT with RS256 signing.
The tokens expire after 1 hour.
You should add refresh token support.
```
**問題**: 未讀取程式碼即做出聲明，假設實作細節。

**✅ 良好回應**:
```
[Need Confirmation] Which file contains the authentication logic?
Possible locations might be:
- src/auth/
- src/services/auth
- src/middleware/

Please direct me to the correct file so I can provide accurate analysis.

Alternatively, I can search the codebase for authentication-related files.
```

---

### 情境 2: 架構建議

**使用者請求**: 「我應該如何架構新的付款模組？」

**❌ 不良回應**:
```
Based on your existing architecture, you should:
1. Create PaymentService in src/services/
2. Use the Stripe API
3. Store transactions in the payments table
```
**問題**: 未經證據即假設架構、支付提供者和資料庫結構。

**✅ 良好回應**:
```
To provide an accurate recommendation, I need to understand your current architecture:

[Need Confirmation]
1. What payment provider do you plan to use? (Stripe, PayPal, custom, etc.)
2. What is your existing service layer structure?
3. What database are you using?

Could you share:
- Project structure (ls -R src/ or similar)
- Existing service examples
- Database schema or ORM models

Once I review these, I can suggest a structure that aligns with your patterns.
```

---

### 情境 3: Bug 調查

**使用者請求**: 「登入失敗」

**❌ 不良回應**:
```
The issue is likely in your validateCredentials() function.
You probably need to hash the password before comparison.
```
**問題**: 未看程式碼即猜測原因。

**✅ 良好回應**:
```
To investigate the login failure, I need more information:

[Need Confirmation]
1. What error message are you seeing? (console logs, error responses)
2. Which file contains the login logic?
3. Can you share relevant code snippets or logs?

Suggested debugging steps:
- Share the login controller/service code
- Provide error logs from console/server
- Describe expected vs actual behavior

Once I review the actual code and errors, I can identify the root cause.
```

---

### 情境 4: 技術選型

**使用者請求**: 「我應該使用什麼快取解決方案？」

**❌ 不良回應**:
```
You have several options:
1. Redis
2. Memcached
3. In-memory cache

Let me know which one you'd like to use.
```
**問題**: 列出選項但未提供推薦或考量情境。

**✅ 良好回應**:
```
Based on the options available:
1. Redis - Distributed, persistent, rich data structures
2. Memcached - Simple, fast, distributed
3. In-memory cache - Local only, no setup required

**Recommended: Redis**

[Need Confirmation] Before finalizing, I'd like to understand:
- Do you need cache sharing across multiple instances?
- Is data persistence required?
- What's your existing infrastructure?

If you already have Redis infrastructure or need cross-instance sharing,
Redis is the best choice. If this is a single-instance application with
simple caching needs, in-memory cache would suffice.
```

---

## AI 助理工作流程

```
┌─────────────────────────────────┐
│  User Request Received          │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Identify Information Needed    │
│  - Code files?                  │
│  - Configuration?               │
│  - Requirements?                │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Identify Potential Side Effects│
│  - State changes?               │
│  - Dependencies affected?       │
│  - External system impacts?     │
└─────────────┬───────────────────┘
              │
              ▼
         ┌────┴────┐
         │  Available?  │
         └────┬────┘
              │
      ┌───────┴───────┐
      │               │
     YES              NO
      │               │
      ▼               ▼
┌──────────┐   ┌─────────────┐
│  Read/   │   │  Ask User   │
│  Analyze │   │  for Info   │
└────┬─────┘   └──────┬──────┘
     │                │
     ▼                ▼
┌─────────────────────────────────┐
│  Tag Response with:             │
│  - [Confirmed] for facts        │
│  - [Inferred] for deductions    │
│  - [Need Confirmation] for gaps │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Cite Sources (file:line)       │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Include Recommendation         │
│  (if presenting options)        │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Deliver Response               │
└─────────────────────────────────┘
```

---

## 語言無關應用

本標準適用於任何程式語言、框架或領域:

- **Web 開發**: 未經證據不假設 Express/Django/Spring Boot
- **行動開發**: 未經證據不假設 React Native/Flutter
- **資料科學**: 未經證據不假設 TensorFlow/PyTorch
- **DevOps**: 未經證據不假設 Docker/Kubernetes

**通用規則**: 先讀取，再分析，永遠以證據報告。

---

## 與程式碼審查整合

執行程式碼審查時，應用這些原則:

1. **引用行號**: 所有審查評論必須引用特定行號
2. **以證據分類嚴重性**:
   - `[已確認 Bug]` - 程式碼明顯損壞
   - `[潛在問題]` - 程式碼可能造成問題
   - `[建議]` - 改善想法（非缺陷）
3. **避免假設**: 如不確定設計意圖，詢問作者

**審查評論範本**:
```
[file:line] - [Severity]
[Description of issue with code excerpt]
[Evidence or reasoning]
[Suggested fix or question for clarification]
```

---

## 授權條款

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
