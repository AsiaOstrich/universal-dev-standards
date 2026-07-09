---
name: journey-test-assistant
source: ../../../../skills/journey-test-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-09
source_hash: 9230eb251afd
status: current
scope: partial
description: |
  [UDS] 从项目描述生成连贯的用户旅程测试计划（TESTPLAN）与 E2E 骨架。
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[项目描述 | --analyze | --archetype A1|A2|A3]"
---

# Journey Test Assistant | 旅程测试助手

从项目描述生成连贯的用户旅程测试计划（TESTPLAN-NNN.md）与对应的 E2E 骨架，让每个新项目从第一天起就拥有完整的测试旅程。

## 与 /e2e 的区别

| 维度 | /e2e | /journey-test |
|------|------|--------------|
| 组织单位 | 单一 XSPEC/AC | 跨 Story 的用户旅程 |
| 测试结构 | 隔离、独立 | 连贯、状态共享 |
| 产物 | `*.spec.ts` 骨架 | `TESTPLAN.md` + `*.journey.spec.ts` |
| 触发时机 | 功能完成后 | 项目创建时（Journey-First） |
| 检测目标 | 单一 AC 是否正确 | 跨步骤状态传递是否连贯 |

## 工作流程

```
输入：项目描述 / 现有 TESTPLAN / --analyze
    ↓
Phase 1：定义 Persona
    分析项目描述 → 识别所有用户角色 → 定义 Actor/Role/Key Permissions
    ↓
Phase 2：设计旅程地图
    列出主要业务目标 → 拆解为 T-NNN 分组 → 声明依赖链
    ↓
Phase 3：生成 TESTPLAN
    按格式输出 test-plans/TESTPLAN-001.md（含 Personas、步骤、依赖图）
    ↓
Phase 4：生成 E2E 骨架
    从 TESTPLAN T-NNN 生成 *.journey.spec.ts（含 skipIf + 共享 state）
```

## 模式

### 1. 生成模式（默认）

从项目描述生成完整的 TESTPLAN + E2E 骨架。

```
/journey-test "电商平台，需要 buyer/seller/admin 三个角色"
```

产物：
- `test-plans/TESTPLAN-001.md`：含 Personas、T-000 环境重置、T-001~T-NNN 步骤分组、执行顺序依赖图
- `src/e2e/journey/main-flow.journey.spec.ts`：含 `describe.skipIf` + 共享 state + T-NNN 对应的完整骨架

### 2. 分析模式（--analyze）

扫描现有测试，找出旅程覆盖缺口。

```
/journey-test --analyze
```

执行步骤：
1. 读取 `test-plans/TESTPLAN-NNN.md`（若存在）
2. 扫描 `src/e2e/` 下所有 `*.journey.spec.ts` 和 `*.journey.e2e.test.ts`
3. 比对 TESTPLAN T-NNN 与自动化测试中的 T-NNN 引用
4. 输出 Coverage gap 报告：列出 TESTPLAN 中缺乏自动化对应的 T-NNN 步骤

### 3. Archetype 模式（--archetype）

使用预设旅程模板，适合已知类型的项目快速启动。

```
/journey-test --archetype A1    # Spec-driven 旅程
/journey-test --archetype A2    # UI-driven 旅程
/journey-test --archetype A3    # Brownfield 旅程
```

| Archetype | 模板 | 适用场景 |
|-----------|------|---------|
| A1 | Spec-driven | 需求 → Spec → Code → Test，适合 API/Backend 项目 |
| A2 | UI-driven | 设计稿 → UI → 视觉回归，适合前端/全栈项目 |
| A3 | Brownfield | 现有代码 → 分析 → 重构验证，适合既有项目补测试 |

## TESTPLAN 格式（T-NNN）

以下为完整的 TESTPLAN 模板，展示所有必要区段：

```markdown
# TESTPLAN-001 <ProjectName> 主线旅程

## Personas

| Actor         | Role          | Key Permissions              |
|---------------|---------------|------------------------------|
| platform_admin | Platform Admin | 创建 Org、管理用户、查看所有资源 |
| org_member    | Org Member    | 读取项目、执行 Pipeline         |

## Environment

- BASE_URL：`http://localhost:3000`（本机）/ `$JOURNEY_BASE_URL`（CI）
- 验证命令：`curl $BASE_URL/health`
- 必要账号：`ADMIN_EMAIL`、`ADMIN_PASSWORD` 环境变量

## T-000 环境重置（optional）

前置条件：无
depends_on：无

| 步骤    | 操作                              | 预期结果        |
|---------|-----------------------------------|-----------------|
| T-000-1 | [API] GET /health                | 返回 200 OK     |
| T-000-2 | [CHECK] 数据库连接正常            | 无错误日志      |

## T-001 Platform Admin 登录

前置条件：环境正常运行（T-000 通过）
depends_on：T-000

| 步骤    | 操作                                        | 预期结果                 |
|---------|---------------------------------------------|--------------------------|
| T-001-1 | [API] POST /api/auth/login（admin 账号）    | 返回 200 + authToken     |
| T-001-2 | [CHECK] authToken 存入共享 state            | let authToken 有值       |

## T-010 主要功能操作

前置条件：authToken 已取得（T-001 通过）
depends_on：T-001

| 步骤    | 操作                                        | 预期结果                 |
|---------|---------------------------------------------|--------------------------|
| T-010-1 | [API] POST /api/resources（带 authToken）   | 返回 201 + resourceId ★  |
| T-010-2 | [CHECK] resourceId 存入共享 state           | let resourceId 有值      |

## 执行顺序依赖图

T-000 → T-001 → T-010
```

## E2E 骨架格式（.journey.spec.ts）

生成的骨架展示三个核心模式：`describe.skipIf` 环境保护、共享 `let` 状态、T-NNN 标识符对应。

```typescript
import { describe, it, expect } from "vitest"

// Journey E2E：需要真实后端，不设置 JOURNEY_BASE_URL 则全部 skip
const BASE_URL = process.env.JOURNEY_BASE_URL || ""

describe.skipIf(!BASE_URL)("Platform Admin Journey — T-001 → T-010", () => {
  // 共享 state：每个步骤从前一步骤的结果取值
  let authToken: string
  let resourceId: string

  it("T-001: Platform Admin 登录并取得 authToken", async () => {
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
    authToken = data.token  // ← 传递给后续步骤
  })

  it("T-010: 执行主要操作（depends on T-001）", async () => {
    // 如果 T-001 失败，authToken 为 undefined，此步骤的错误信息会清楚说明
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
    resourceId = data.id  // ← 传递给后续步骤
  })
})
```

## 后续步骤

完成后建议：

> **TESTPLAN 与 Journey E2E 骨架已生成。建议下一步：**
> - 执行 `/e2e` 生成各功能的 AC 层测试（补充旅程测试的细节覆盖）
> - 执行 `/atdd` 定义各 T-NNN 步骤对应的验收条件
> - 执行 `/journey-test --analyze` 定期检查自动化覆盖缺口

## 参考

- 标准：[user-journey-testing.ai.yaml](../../../../.standards/user-journey-testing.ai.yaml)
- 相关 XSPEC：XSPEC-128（UDS 标准定义）
- 相关 Skill：`/e2e`（AC 层测试）、`/atdd`（验收条件定义）
