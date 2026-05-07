---
name: journey-test-assistant
scope: partial
description: "[UDS] 從專案描述生成連貫使用者旅程測試計畫（TESTPLAN）與 E2E 骨架"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[project description | --analyze | --archetype A1|A2|A3]"
status: stable
---

# Journey Test Assistant | 旅程測試助手

從專案描述生成連貫的使用者旅程測試計畫（TESTPLAN-NNN.md）與對應的 E2E 骨架，讓每個新專案從第一天起就擁有完整測試旅程。

## 與 /e2e 的差異

| 維度 | /e2e | /journey-test |
|------|------|--------------|
| 組織單位 | 單一 XSPEC/AC | 跨 Story 的使用者旅程 |
| 測試結構 | 隔離、獨立 | 連貫、狀態共享 |
| 產物 | `*.spec.ts` 骨架 | `TESTPLAN.md` + `*.journey.spec.ts` |
| 觸發時機 | 功能完成後 | 專案建立時（Journey-First） |
| 偵測目標 | 單一 AC 是否正確 | 跨步驟狀態傳遞是否連貫 |

## 工作流程

```
輸入：專案描述 / 現有 TESTPLAN / --analyze
    ↓
Phase 1：定義 Persona
    分析專案描述 → 識別所有使用者角色 → 定義 Actor/Role/Key Permissions
    ↓
Phase 2：設計旅程地圖
    列出主要業務目標 → 拆解為 T-NNN 群組 → 宣告依賴鏈
    ↓
Phase 3：生成 TESTPLAN
    按格式輸出 test-plans/TESTPLAN-001.md（含 Personas、步驟、依賴圖）
    ↓
Phase 4：生成 E2E 骨架
    從 TESTPLAN T-NNN 生成 *.journey.spec.ts（含 skipIf + 共享 state）
```

## 模式

### 1. 生成模式（預設）

從專案描述生成完整的 TESTPLAN + E2E 骨架。

```
/journey-test "電商平台，需要 buyer/seller/admin 三個角色"
```

產物：
- `test-plans/TESTPLAN-001.md`：含 Personas、T-000 環境重置、T-001~T-NNN 步驟群組、執行順序依賴圖
- `src/e2e/journey/main-flow.journey.spec.ts`：含 `describe.skipIf` + 共享 state + T-NNN 對應的完整骨架

### 2. 分析模式（--analyze）

掃描現有測試，找出旅程覆蓋缺口。

```
/journey-test --analyze
```

執行步驟：
1. 讀取 `test-plans/TESTPLAN-NNN.md`（若存在）
2. 掃描 `src/e2e/` 下所有 `*.journey.spec.ts` 和 `*.journey.e2e.test.ts`
3. 比對 TESTPLAN T-NNN 與自動化測試中的 T-NNN 引用
4. 輸出 Coverage gap 報告：列出 TESTPLAN 中缺乏自動化對應的 T-NNN 步驟

### 3. Archetype 模式（--archetype）

使用預設旅程模板，適合已知類型的專案快速啟動。

```
/journey-test --archetype A1    # Spec-driven 旅程
/journey-test --archetype A2    # UI-driven 旅程
/journey-test --archetype A3    # Brownfield 旅程
```

| Archetype | 模板 | 適用場景 |
|-----------|------|---------|
| A1 | Spec-driven | 需求 → Spec → Code → Test，適合 API/Backend 專案 |
| A2 | UI-driven | 設計稿 → UI → 視覺回歸，適合前端/全端專案 |
| A3 | Brownfield | 現有程式碼 → 分析 → 重構驗證，適合既有專案補測試 |

## TESTPLAN 格式（T-NNN）

以下為完整的 TESTPLAN 範本，展示所有必要區段：

```markdown
# TESTPLAN-001 <ProjectName> 主線旅程

## Personas

| Actor         | Role          | Key Permissions              |
|---------------|---------------|------------------------------|
| platform_admin | Platform Admin | 建立 Org、管理使用者、查看所有資源 |
| org_member    | Org Member    | 讀取專案、執行 Pipeline         |

## Environment

- BASE_URL：`http://localhost:3000`（本機）/ `$JOURNEY_BASE_URL`（CI）
- 驗證指令：`curl $BASE_URL/health`
- 必要帳號：`ADMIN_EMAIL`、`ADMIN_PASSWORD` 環境變數

## T-000 環境重置（optional）

前置條件：無
depends_on：無

| 步驟    | 操作                              | 預期結果        |
|---------|-----------------------------------|-----------------|
| T-000-1 | [API] GET /health                | 回傳 200 OK     |
| T-000-2 | [CHECK] 資料庫連線正常            | 無錯誤日誌      |

## T-001 Platform Admin 登入

前置條件：環境正常運行（T-000 通過）
depends_on：T-000

| 步驟    | 操作                                        | 預期結果                 |
|---------|---------------------------------------------|--------------------------|
| T-001-1 | [API] POST /api/auth/login（admin 帳號）    | 回傳 200 + authToken     |
| T-001-2 | [CHECK] authToken 存入共享 state            | let authToken 有值       |

## T-010 主要功能操作

前置條件：authToken 已取得（T-001 通過）
depends_on：T-001

| 步驟    | 操作                                        | 預期結果                 |
|---------|---------------------------------------------|--------------------------|
| T-010-1 | [API] POST /api/resources（帶 authToken）   | 回傳 201 + resourceId ★  |
| T-010-2 | [CHECK] resourceId 存入共享 state           | let resourceId 有值      |

## 執行順序依賴圖

T-000 → T-001 → T-010
```

## E2E 骨架格式（.journey.spec.ts）

生成的骨架展示三個核心模式：`describe.skipIf` 環境保護、共享 `let` 狀態、T-NNN 識別碼對應。

```typescript
import { describe, it, expect } from "vitest"

// Journey E2E：需要真實後端，不設定 JOURNEY_BASE_URL 則全部 skip
const BASE_URL = process.env.JOURNEY_BASE_URL || ""

describe.skipIf(!BASE_URL)("Platform Admin Journey — T-001 → T-010", () => {
  // 共享 state：每個步驟從前一步驟的結果取值
  let authToken: string
  let resourceId: string

  it("T-001: Platform Admin 登入並取得 authToken", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      }),
    })
    expect(res.status, "T-001 failed: login should return 200").toBe(200)
    const data = await res.json()
    expect(data.token, "T-001 failed: token should be present").toBeTruthy()
    authToken = data.token  // ← 傳遞給後續步驟
  })

  it("T-010: 執行主要操作（depends on T-001）", async () => {
    // 如果 T-001 失敗，authToken 為 undefined，此步驟的錯誤訊息會清楚說明
    expect(authToken, "T-010 precondition failed: authToken from T-001 is missing").toBeTruthy()

    const res = await fetch(`${BASE_URL}/api/resources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ name: "journey-test-resource" }),
    })
    expect(res.status, `T-010 failed: expected 201, got ${res.status}`).toBe(201)
    const data = await res.json()
    resourceId = data.id  // ← 傳遞給後續步驟
  })
})
```

## 後續步驟

完成後建議：

> **TESTPLAN 與 Journey E2E 骨架已生成。建議下一步：**
> - 執行 `/e2e` 生成各功能的 AC 層測試（補充旅程測試的細節覆蓋）
> - 執行 `/atdd` 定義各 T-NNN 步驟對應的驗收條件
> - 執行 `/journey-test --analyze` 定期檢查自動化覆蓋缺口

## 參考

- 標準：[user-journey-testing.ai.yaml](../../.standards/user-journey-testing.ai.yaml)
- 相關 XSPEC：XSPEC-128（UDS 標準定義）
- 相關 Skill：`/e2e`（AC 層測試）、`/atdd`（驗收條件定義）
