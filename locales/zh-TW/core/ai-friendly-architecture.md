---
source: ../../../core/ai-friendly-architecture.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 7381f66445c3
status: current
---

# AI 友善架構標準

> **語言**: [English](../../../core/ai-friendly-architecture.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-21
**適用範圍**: 所有與 AI 助手協作的軟體專案
**範疇**: 通用
**業界標準**: 無（新興 AI 協作實踐）

---

## 目的

本標準定義能最大化 AI 輔助開發效能的架構與文件實踐。遵循這些指南，專案將更容易被 AI 工具分析、理解和修改，同時保持人類可讀性。

**參考概念**:
- RLM（遞迴語言模型）上下文管理原則
- 考慮 Token 的文件設計
- 支援 AI 理解的模組化架構

---

## 目錄

1. [核心原則](#core-principles)
2. [模組設計標準](#module-design-standards)
3. [上下文邊界標記](#context-boundary-markers)
4. [文件分層](#documentation-layering)
5. [元資料標準](#metadata-standards)
6. [查詢介面設計](#query-interface-design)
7. [AI 上下文配置](#ai-context-configuration)
8. [反模式](#anti-patterns)
9. [實施清單](#implementation-checklist)

---

## 核心原則

### 1. 明確勝過隱含

AI 助手在行為和結構明確記錄時表現最佳，而非依賴慣例推測。

```
┌─────────────────────────────────────────────────────────────┐
│                 Explicit vs Implicit                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ IMPLICIT (Hard for AI)                                  │
│  └── Magic naming conventions                               │
│  └── Undocumented folder structures                         │
│  └── Convention-based routing                               │
│  └── Assumed knowledge of framework behavior                │
│                                                              │
│  ✅ EXPLICIT (AI-Friendly)                                  │
│  └── Documented module responsibilities                     │
│  └── Clear entry point annotations                          │
│  └── Explicit dependency declarations                       │
│  └── Self-documenting configuration files                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 分層上下文

以層次結構組織文件，讓 AI 可以根據任務複雜度存取適當的詳細程度。

```
┌─────────────────────────────────────────────────────────────┐
│               Context Layering Strategy                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Quick Reference (< 500 tokens)                    │
│  └── One-liner descriptions                                 │
│  └── API signatures only                                    │
│  └── Key entry points                                       │
│                                                              │
│  Layer 2: Detailed Guide (< 5,000 tokens)                   │
│  └── Full API documentation                                 │
│  └── Usage examples                                         │
│  └── Configuration options                                  │
│                                                              │
│  Layer 3: Full Examples (unlimited)                         │
│  └── Complete implementation examples                       │
│  └── Edge case documentation                                │
│  └── Migration guides                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. 語意邊界

設計清楚的模組邊界，讓 AI 可以獨立分析元件，而不需要完整專案上下文。

### 4. 可探索的結構

確保專案結構可以透過分析配置檔案和進入點來理解，而不需閱讀所有原始碼。

---

## 模組設計標準

### 模組層級單一職責

每個模組應有明確定義的單一目的，可以用一句話總結。

```
┌─────────────────────────────────────────────────────────────┐
│              Module Header Template                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /**                                                         │
│   * @module auth                                             │
│   * @description Handles user authentication and session    │
│   *              management for the application.            │
│   *                                                          │
│   * @responsibility Authentication and authorization         │
│   * @dependencies [database, crypto, config]                │
│   * @exports {login, logout, verify, refreshToken}          │
│   * @entrypoint ./index.ts                                  │
│   */                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 清楚的輸入／輸出契約

每個公開介面都應有明確的型別定義或文件說明。

| 元素 | 要求 | 範例 |
|------|------|------|
| 函式參數 | 型別 + 描述 | `@param {string} email - User's email address` |
| 回傳值 | 型別 + 可能值 | `@returns {Promise<User \| null>}` |
| 副作用 | 明確記錄 | `@sideeffect Writes to database` |
| 錯誤條件 | 所有可能錯誤 | `@throws {AuthError} Invalid credentials` |

### 明確的依賴宣告

依賴應在模組層級宣告，而非隱藏在實作細節中。

**JavaScript/TypeScript:**
```javascript
// module: src/auth/index.ts
// dependencies: [database, crypto, config]
import { db } from '../database';
import { hash } from '../crypto';
import { config } from '../config';
```

**Python:**
```python
# module: src/auth/__init__.py
# dependencies: [database, crypto, config]
from ..database import db
from ..crypto import hash_password
from ..config import settings
```

---

## 上下文邊界標記

### 模組標頭註解

使用 AI 可以解析的標準化標頭註解，快速理解模組。

```javascript
/**
 * ═══════════════════════════════════════════════════════════
 * MODULE: Payment Processing
 * ═══════════════════════════════════════════════════════════
 *
 * PURPOSE: Handles all payment-related operations including
 *          processing, refunds, and subscription management.
 *
 * DEPENDENCIES:
 *   - stripe: Payment gateway integration
 *   - database: Transaction storage
 *   - events: Payment event publishing
 *
 * EXPORTS:
 *   - processPayment(amount, method): Process single payment
 *   - refund(transactionId): Issue refund
 *   - createSubscription(plan): Start subscription
 *
 * CONFIGURATION:
 *   - STRIPE_SECRET_KEY: Required
 *   - PAYMENT_WEBHOOK_SECRET: Required
 *
 * ═══════════════════════════════════════════════════════════
 */
```

### 區段分隔線

在大型檔案中使用一致的區段分隔線：

```javascript
// ============================================================
// SECTION: Validation Helpers
// ============================================================

// ... validation code ...

// ============================================================
// SECTION: API Handlers
// ============================================================

// ... handler code ...
```

---

## 文件分層

### 第一層：快速參考（< 500 tokens）

在每個主要模組建立 `QUICK-REF.md`：

```markdown
# Auth Module - Quick Reference

## Purpose
User authentication and session management.

## Key Functions
- `login(email, password)` → `Promise<Session>`
- `logout(sessionId)` → `void`
- `verify(token)` → `Promise<User | null>`

## Configuration
- `AUTH_SECRET`: JWT signing secret
- `SESSION_DURATION`: Session lifetime (default: 24h)

## Entry Point
`src/auth/index.ts`
```

### 第二層：詳細指南（< 5,000 tokens）

主要 `README.md` 包含完整文件：

```markdown
# Authentication Module

## Overview
[2-3 paragraph description]

## Architecture
[Diagram or description of internal structure]

## API Reference
[Full function signatures with parameters]

## Configuration Options
[All configuration with defaults and descriptions]

## Usage Examples
[Common use cases with code samples]

## Error Handling
[Error types and handling strategies]
```

### 第三層：完整範例（無限制）

獨立的 `examples/` 目錄包含完整實作：

```
auth/
├── QUICK-REF.md          # Level 1
├── README.md             # Level 2
└── examples/             # Level 3
    ├── basic-login.ts
    ├── oauth-integration.ts
    └── custom-middleware.ts
```

---

## 元資料標準

### 套件元資料擴充

使用 AI 相關的元資料擴充標準套件檔案：

**package.json (JavaScript/TypeScript):**
```json
{
  "name": "my-project",
  "ai-context": {
    "entryPoints": ["src/index.ts", "src/api/index.ts"],
    "modules": {
      "auth": "src/auth/",
      "api": "src/api/",
      "database": "src/db/"
    },
    "ignorePatterns": ["node_modules", "dist", "coverage"],
    "quickRef": "docs/QUICK-REF.md"
  }
}
```

**pyproject.toml (Python):**
```toml
[tool.ai-context]
entry_points = ["src/main.py", "src/api/__init__.py"]
modules = { auth = "src/auth/", api = "src/api/" }
ignore_patterns = ["__pycache__", ".venv", "*.pyc"]
quick_ref = "docs/QUICK-REF.md"
```

### .ai-context.yaml 配置

專用的 AI 上下文配置檔案：

```yaml
# .ai-context.yaml - AI Context Configuration
version: 1.0.0

project:
  name: my-project
  type: web-app  # web-app | library | cli | api | monorepo
  primary-language: typescript

modules:
  - name: auth
    path: src/auth/
    entry: index.ts
    description: Authentication and authorization
    dependencies: [database, crypto]
    priority: high

  - name: api
    path: src/api/
    entry: routes.ts
    description: REST API endpoints
    dependencies: [auth, database]
    priority: high

  - name: utils
    path: src/utils/
    entry: index.ts
    description: Shared utility functions
    dependencies: []
    priority: low

analysis-hints:
  entry-points:
    - src/main.ts
    - src/index.ts
  ignore-patterns:
    - node_modules
    - dist
    - coverage
    - "*.test.ts"
  architecture-type: layered  # layered | microservices | modular | monolith

documentation:
  quick-ref: docs/QUICK-REF.md
  detailed: docs/ARCHITECTURE.md
  examples: docs/examples/

context-strategy:
  max-chunk-size: 50000
  overlap: 500
  analysis-pattern: hierarchical
```

---

## 查詢介面設計

### 結構化 API 文件格式

設計易於查詢的 API 文件：

```markdown
## API: createUser

**Endpoint**: `POST /api/users`
**Module**: `src/api/users.ts:45`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | Min 8 characters |
| name | string | No | Display name |

### Response
```json
{
  "id": "string",
  "email": "string",
  "createdAt": "ISO8601"
}
```

### Errors
| Code | Condition |
|------|-----------|
| 400 | Invalid email format |
| 409 | Email already exists |

### Example
```javascript
const user = await api.createUser({
  email: 'user@example.com',
  password: 'securePassword123'
});
```
```

### 可搜尋的程式碼註解

使用 AI 可以搜尋的一致註解模式：

```javascript
// @ai-hint: This function is performance-critical
// @ai-complexity: O(n log n)
// @ai-dependencies: [sortUtils, comparators]
function sortLargeDataset(data) {
  // ...
}

// @ai-security: Validates user input
// @ai-validation: email, password strength
function validateRegistration(input) {
  // ...
}
```

---

## AI 上下文配置

### 建議的目錄結構

```
project/
├── .ai-context.yaml          # AI context configuration
├── docs/
│   ├── QUICK-REF.md          # Level 1 documentation
│   ├── ARCHITECTURE.md       # Level 2 documentation
│   └── examples/             # Level 3 documentation
├── src/
│   ├── auth/
│   │   ├── index.ts          # Entry point with module header
│   │   ├── QUICK-REF.md      # Module-level quick reference
│   │   └── README.md         # Module documentation
│   ├── api/
│   │   ├── index.ts
│   │   └── README.md
│   └── index.ts              # Application entry point
└── CLAUDE.md / INSTRUCTIONS.md  # AI instruction file
```

### 上下文優先順序指引

當 AI 上下文有限時，請優先考慮：

| 優先順序 | 內容類型 | 原因 |
|----------|--------------|--------|
| 1 | 進入點 | 理解應用程式結構 |
| 2 | .ai-context.yaml | 模組地圖與依賴關係 |
| 3 | QUICK-REF 檔案 | 快速理解 API |
| 4 | 修改的檔案 | 與任務直接相關 |
| 5 | 依賴鏈 | 變更的上下文 |

---

## 反模式

### ❌ 應避免的模式

| 反模式 | 問題 | 解決方案 |
|--------|------|----------|
| **魔術字串** | AI 無法追蹤常數 | 使用有文件的型別常數 |
| **隱含路由** | 隱藏行為 | 明確記錄路由映射 |
| **全域狀態** | 不可預測的依賴 | 依賴注入，明確連結 |
| **循環依賴** | 上下文混亂 | 清楚的層次依賴 |
| **巨大檔案** | 上下文溢出 | 分割成專注的模組 |
| **慣例優於文件** | 假設已知知識 | 明確記錄文件 |

### ❌ 文件反模式

| 反模式 | 問題 | 解決方案 |
|--------|------|----------|
| **過時文件** | 誤導 AI | 保持文件與程式碼同步 |
| **僅自動產生** | 缺少上下文 | 加入人工撰寫的上下文 |
| **缺乏範例** | 用法模糊 | 包含可運作的範例 |
| **文字牆** | 難以解析 | 使用結構化格式 |

---

## 實施清單

### 快速開始（< 1 小時）

- [ ] 建立 `.ai-context.yaml` 包含模組清單
- [ ] 在專案根目錄新增 `QUICK-REF.md`
- [ ] 在 README 中記錄進入點
- [ ] 在主要檔案中新增模組標頭

### 標準實施（< 1 天）

- [ ] 完成 `.ai-context.yaml` 配置
- [ ] 為每個主要模組新增 `QUICK-REF.md`
- [ ] 記錄所有公開 API 的型別資訊
- [ ] 在大型檔案中新增區段分隔
- [ ] 建立依賴文件

### 完整實施（< 1 週）

- [ ] 所有模組的三層文件
- [ ] 可搜尋的程式碼註解
- [ ] 使用案例的範例目錄
- [ ] 架構圖
- [ ] 整合 CI 進行文件驗證

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-01-21 | 初始版本 |

---

## 相關標準

- [專案結構](./project-structure.md) - 目錄組織
- [文件結構](./documentation-structure.md) - 文件組織
- [反幻覺](./anti-hallucination.md) - AI 準確性標準

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
