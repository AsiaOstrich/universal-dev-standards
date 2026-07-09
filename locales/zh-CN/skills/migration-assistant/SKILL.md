---
source: ../../../../skills/migration-assistant/SKILL.md
source_version: 1.0.0
source_hash: 5d58f55f3f68
translation_version: 1.0.0
last_synced: 2026-07-09
status: current
description: |
  引导代码迁移、框架升级与技术现代化。
  使用时机：框架升级、语言迁移、API 版本更新、依赖现代化。
  关键字：migration, upgrade, modernize, framework, dependency, 迁移, 升级, 现代化。
---

# 迁移助手

> **语言**: [English](../../../../skills/migration-assistant/SKILL.md) | 简体中文

引导系统性代码迁移、框架升级与技术现代化。

## 使用方式

| 命令 | 用途 |
|------|------|
| `/migrate` | 启动交互式迁移引导 |
| `/migrate --assess` | 仅风险评估 |
| `/migrate "Vue 2 to 3"` | 引导特定迁移 |
| `/migrate --deps` | 依赖升级分析 |
| `/migrate --rollback` | 规划回滚策略 |

## 迁移类型

| 类型 | 范例 | 风险 |
|------|------|------|
| **框架升级** | React 17→18, Vue 2→3, Angular 15→17 | 中高 |
| **语言迁移** | JS→TS, Python 2→3, Java 8→17 | 高 |
| **API 版本** | REST v1→v2, GraphQL schema 更新 | 中 |
| **数据库迁移** | MySQL→PostgreSQL, SQL→NoSQL | 极高 |
| **构建工具** | Webpack→Vite, Grunt→ESBuild | 低中 |
| **包管理器** | npm→pnpm, pip→poetry | 低 |

## 风险评估矩阵

| | 低影响 | 中影响 | 高影响 |
|---|--------|--------|--------|
| **低复杂度** | 安全（直接进行） | 谨慎 | 仔细规划 |
| **中复杂度** | 谨慎 | 规划 + 测试 | 分阶段发布 |
| **高复杂度** | 规划 + 测试 | 分阶段发布 | 完整 SDD 规格 |

## 工作流程

1. **评估** - 评估现状、识别破坏性变更
2. **规划** - 建立含依赖关系的迁移清单
3. **准备** - 设定 codemods、兼容层、功能旗标
4. **迁移** - 分阶段执行迁移并测试
5. **验证** - 执行完整测试套件、检查回归
6. **清理** - 移除兼容层、旧依赖

## API 迁移契约测试

当 API endpoint 从一个技术栈迁至另一个（PHP → .NET、Express → Spring、Python → Go），对**新**实现的单元测试只验证**新 DTO**——无法捕捉「旧版有但新版漏掉的字段」。字段缺漏、字段 rename、类型漂移，以及顶层 vs nested 层级漂移等问题会静默流入生产，导致仍预期旧版 shape 的既有前端失灵。

**仅靠单元测试、集成测试或 code review 无法防止**。2026-05-24 真实 PROD 事故：67/67 测试全绿流入正式环境，由客户发现缺漏。

### 强制规则

每个被迁移的 API endpoint **必须**至少有一份 contract test，比对新实现的 response 与从 legacy 实现捕获的 fixture。验证的是结构性等价（keys、type、层级位置），而非值等价。

### Fixture 捕获协议

**Legacy 仍运行（典型迁移窗口）：**

```bash
# 1. Capture ≥3 representative inputs (happy path, edge case, empty result)
curl -X POST $LEGACY_BASE/endpoint -d @input1.json \
  > tests/fixtures/migration/endpoint/scenario1.json
curl -X POST $LEGACY_BASE/endpoint -d @input2_empty.json \
  > tests/fixtures/migration/endpoint/scenario2_empty.json
curl -X POST $LEGACY_BASE/endpoint -d @input3_edge.json \
  > tests/fixtures/migration/endpoint/scenario3_edge.json

# 2. Scrub PII and volatile values (timestamps, generated IDs)
jq 'walk(if type == "string" and test("@") then "redacted@example.com" else . end)' \
  tests/fixtures/migration/endpoint/scenario1.json > tmp && mv tmp ...

# 3. Commit fixtures
git add tests/fixtures/migration/endpoint/
```

**Legacy 已退役但 source 可读：**

- 追踪 legacy source code，手动构建预期的 response shape
- 将每个字段的来源（SQL 列、计算式、hardcoded）记录于同位置的 `.notes.md` 文件

### Contract test 模板

**C# / xUnit：**

```csharp
[Theory]
[InlineData("scenario1")]
[InlineData("scenario2_empty")]
[InlineData("scenario3_edge")]
public async Task Endpoint_ResponseShape_MatchesLegacyFixture(string scenario)
{
    var fixture = LoadFixture($"migration/endpoint/{scenario}");
    var response = await CallNewImpl(fixture.Input);
    // StructuralEquivalence checks keys + types + placement, ignores values
    StructuralEquivalence.Assert(response, fixture.ExpectedShape);
}
```

**TypeScript / Jest：**

```typescript
import { structuralEquivalence } from "./test-utils/structural-equivalence";

describe.each([
  ["scenario1"],
  ["scenario2_empty"],
  ["scenario3_edge"],
])("Endpoint response shape vs legacy fixture (%s)", (scenario) => {
  test("matches", async () => {
    const fixture = loadFixture(`migration/endpoint/${scenario}.json`);
    const response = await callNewImpl(fixture.input);
    structuralEquivalence(response, fixture.expectedShape);
  });
});
```

`structuralEquivalence` / `StructuralEquivalence.Assert` 规则：每一层具备相同的 key 集合（不可缺漏、不可多出，除非明确 opt in）、每个 key 具相同的基本类型、相同的层级位置（顶层 vs nested）。值可以不同（timestamps、IDs）；类型与结构不可不同。

### 逐字段迁移审计清单

合并任何被迁移的 endpoint 前：

- [ ] 所有 legacy response 字段皆 mapping 至新 DTO（无 silent drop）
- [ ] 尽量保留命名（避免将 `TotalX` rename 而丢失「per-member」语意）
- [ ] 保留顶层 vs nested 层级位置
- [ ] 已验证类型兼容性（string→int 转换为明确而非巧合）
- [ ] Error path return code 与 legacy 一致（`509` 而非 `506`；`404` 而非 `400`）
- [ ] Contract test fixture 已 commit 至 `tests/fixtures/migration/`
- [ ] Cross-link 至 [contract-test-assistant](../contract-test-assistant/SKILL.md) 做持续的消费端验证

## Cutover 后生产数据对账

> **实现**：XSPEC-284 R2（轴③持久化数据语义）／关闭 UDS issue [#134](https://github.com/AsiaOstrich/universal-dev-standards/issues/134)。

Contract test 与 `behavior-snapshot` 只能捕捉**接口**分歧，对**持久化数据语义**分歧视而不见。两者共有两个盲区：(1) 你只能验证你想得到要列举的规则——真正出包的永远是没人写下来的隐含规则（某字段何时非零、何时被覆写）；(2) per-request parity ≠ data-at-rest parity——由**异步**程序（DR sync、结算批次、状态对账器）对 live 外部供应商写入的字段，不是可重放的确定性请求，其正确性只在**真实生产量的聚合**中浮现。

### 事故指纹（#134）

某企业 SMS 平台 PHP→.NET 重写：每笔金额由**异步** DR sync 覆写（`record.Cost = gatewayDr.Cost`）。legacy 对 carrier-failure 仍计费，rewrite 写入 gateway 回报的 `0` → cutover 边界两侧同一失败状态的金额分歧。**所有既有 gate 全部漏接**（response shape 相同 → contract test 通过；无人 curated「失败仍计费」场景；字段由后台作业对 live gateway 写入 → 不可重放）。最后靠 ops 跑生产 `SUM(cost) GROUP BY status, day` 跨边界汇总才发现。**单日抽样甚至误判「失败不计费＝正常」**——只有跨 cutover 边界的多周聚合才揭露真相。

### 强制规则

当 migration 将 legacy 数据载入与 new 相同的**存储**，新旧边界即是**免费差分神谕**。对每个 business-critical 持久化字段**必须**：定义聚合对账不变量（比对 legacy-origin vs new-origin 行沿关键维度的分布）、对生产**排程执行**并于分歧超过宣告容差时告警、以跨 cutover 的**多周窗口**调查（切忌单日抽样，抽样可能坐实错误结论）。

### 对账 SQL 模板

```sql
-- Reconcile a money/state field across the migration cutover boundary.
SELECT status,
       SUM(CASE WHEN created < @cutover THEN 1 ELSE 0 END)                          AS legacy_rows,
       SUM(CASE WHEN created < @cutover AND money_field > 0 THEN 1 ELSE 0 END)      AS legacy_nonzero,
       SUM(CASE WHEN created >= @cutover THEN 1 ELSE 0 END)                         AS new_rows,
       SUM(CASE WHEN created >= @cutover AND money_field > 0 THEN 1 ELSE 0 END)     AS new_nonzero
FROM records GROUP BY status;
-- Invariant: nonzero-ratio per status must not differ across the boundary beyond tolerance.
```

### 容差与告警指引

| 维度 | 指引 |
|--------|------|
| **不变量类型** | 每维度的非零比率 / `SUM` / `COUNT` / `DISTINCT` / checksum，按 `GROUP BY status, period` |
| **容差** | 逐字段宣告；硬会计不变量为 0%，仅已知合法漂移（如四舍五入）容许小 ε |
| **窗口** | 多周、横跨 cutover；以 `period` 分桶定位边界 |
| **排程** | Post-cutover 常态化 cron（每日）直到边界行退出活跃报表 |
| **告警** | 分歧超过容差即告警；经 `observability-assistant` 告警规则路由 |

### Gate 0 — 持久化业务字段的隐含规则捕获

在迁移任何写入持久化业务字段的功能前，**针对每个此类字段明确回答**三个问题，并将答案锁定为快照场景**或**对账不变量：

> 1. **何时设值？**
> 2. **何时被覆写？**（尤其异步路径）
> 3. **何时归零／清空？**

**高风险隐含规则检查清单** — 经验反复出现的指纹：

- [ ] **计费语义** — 提交时计费 vs 送达时计费；失败退费？
- [ ] **枚举／状态码映射** — 每个 legacy 码都映射；「成功集合」定义一致
- [ ] **空值处理** — 空字符串 vs null vs 不存在；缺值默认
- [ ] **字段命名大小写／序列化** — snake_case vs camelCase 绑定
- [ ] **时区** — 存 UTC vs local；报表边界
- [ ] **四舍五入／类型强转** — `"2.00"`（文本）被当 int 解析 → 掉成 0

### 3-gate 定位表

明确划出各 gate 之间的边界，让每个轴都有负责方、不落入缝隙：

| Gate | 范围 | 时机 |
|------|------|------|
| [`behavior-snapshot`](../../../../core/behavior-snapshot.md) | per-request、人工 curated 场景 | pre-UAT CI |
| Contract tests（上方／#112） | response **shape**（keys／类型／层级） | 单元／集成 |
| **本节（#134）** | **异步写入字段的聚合、静态数据语义，跨真实量** | **post-cutover，排程，生产** |

> 交叉参照：[`behavior-snapshot`](../../../../core/behavior-snapshot.md)（curated golden masters），[`observability-assistant`](../observability-assistant/SKILL.md)（对账排程 + 告警模板）。

## 背景作业／副作用完整性

> **实现**：XSPEC-284 R3（轴⑤）。

迁移清单与副作用 grep 只是**标注**背景作业——标注本身不证明任何事。背景作业可能在 manifest 列出、代码中存在，却在新系统**从未真正执行**。

### 强制规则

对每条由 legacy 带过来的背景副作用，须验证**两件事**——标注不够：

| 检查 | Pre-flight | Post-cutover |
|------|-----------|--------------|
| **(a) 存在** — cron／queue consumer／webhook／寄信点在新系统实际实作 | source grep + 注册检查 | — |
| **(b) 已执行** — post-cutover 已被**触发／执行至少一次**，且有可观测证据（log、heartbeat、queue depth 排空、telemetry counter） | — | 需要可观测性证据 |

任一检查未过即标 `not_implemented`（XSPEC-199）并 **block UAT／cutover**——绝不把沉默、从未触发的作业当「完成」。

> 交叉参照：结构化日志强制事件 `heartbeat` / `business_event`（logging-standards）为检查 (b) 提供可观测的执行证据。

## 状态机与时序对等

> **实现**：XSPEC-284 R8（轴⑧）→ 拆分为 **XSPEC-287**。

legacy 的状态转移规则与时序前提多为**隐性**：单笔记录的快照「看起来合法」，违规只在一连串操作的**转移序列**中浮现，因此 per-request 功能对等与 behavior-snapshot 对等都抓不到（与「per-request ≠ data-at-rest」「per-request ≠ 并发」同源盲区）。`feature-manifest` 只有 `status` 字段，**不**验证转移合法性。

### Step 1 — 状态机清单来源（derive, R3）

legacy 状态转移散落于 controller／service／DB trigger。以**三方交叉**机械化提取状态枚举 + 合法转移集（不靠人脑回忆）：

| 来源 | 产出 |
|------|------|
| **(1) enum 定义** — status enum ／查找表 | 完整的已声明状态集合 |
| **(2) 状态更新点** — grep 每个 `status = ...` ／`UPDATE ... SET status` ／trigger | 代码*可以*执行哪些转移 |
| **(3) 生产实际序列** — 从生产历史／审计中观察到的相异 `(from_status → to_status)` 对 | *实际*发生哪些转移 |

> **权威性**：三者不一致时，以**生产实际出现过的转移为 legacy 真实行为基准**（呼应 #134「以生产为准」）。代码允许但生产从未产生的转移是潜在路径；生产出现过但新 enum 禁止的转移是回归。

### Step 2 — 合法转移验证（oracle, R1）

依提取出的转移图，断言**新系统禁止 legacy 禁止的非法转移**。当新系统**允许 legacy 禁止的转移**即 block（重写常放宽隐性护栏）：

- `cancelled → pending`（复活已取消的订单）
- `refunded → paid`（反退款）
- `shipped → draft`（倒退回不可逆点之前）

**Gate 时机**：pre-UAT。

### Step 3 — 时序不变量侦测（oracle, R2）

断言单笔快照无法揭露的时序不变量；违反即告警：

- `created_at ≤ updated_at`（记录不会在存在之前被更新）
- 无**未来时间戳**（clock skew／默认值错误）
- 状态时间戳**单调**递进（`paid_at ≤ shipped_at ≤ delivered_at`）
- 事件排序保证被保留（事件日志不重排）

**Gate 时机**：pre-UAT **与** post-cutover（与上方轴③ Post-Cutover 对账共用排程）。

### Step 4 — 序列／顺序对等（R4）

验证新系统保留**幂等性**（重复操作不产生重复状态变更）与**关键事件顺序**，避免重写引入顺序敏感 bug：

- [ ] 重放同一事件／消息两次只产生一次状态变更，而非两次
- [ ] 乱序投递会被拒绝或对账处理，而非静默套用
- [ ] 幂等键／去重窗口与 legacy 语义一致

### 与 XSPEC-286 轴⑥边界

**287（本节，轴⑧）**负责**转移合法性 + 时序正确性**（领域问题）；**[XSPEC-286](../../../../core/performance-standards.md) 轴⑥**负责**并发竞态／隔离**（性能/竞争问题）。重叠案例（并发导致非法转移）的并发面归 286、转移合法性面归本节；落地时依主导失败模式指派主责。

## 错误路径完整性

> **实现**：XSPEC-284 R9（轴⑨）→ 拆分为 **XSPEC-288**。

最常见的迁移遗漏是「happy path 移了、错误／降级／fallback 分支整批被漏」。happy path 有明确需求，错误分支散落（try/catch 层级、自定义异常层级、特定错误码）而被静默遗失。本 skill 负责**迁移 derive + 降级对等**（R1/R3）；**系统性遗漏分支 gap 分析 + 错误响应差分**（R2/R4）落在 [full-coverage-testing](../../../../core/full-coverage-testing.md)「Migration Error-Path Completeness」。

### Step 1 — 机械化 legacy 异常/错误码清单（derive, R1）

**机械化**列举 legacy 错误面（不靠回忆）：grep `catch`／`except`／`rescue` 区块、自定义异常/错误类层级、所有错误/状态码、错误响应形状（serializer／DTO）。此清单即交给 full-coverage-testing gap 分析的错误路径待验清单。

### Step 2 — 降级／Fallback 对等（R3）

legacy 降级模式只在失败时执行，容易被漏。验证新系统保留——对等上 fail closed，而非「正常路径一致、失败时行为迥异」：

- [ ] 外部服务失败 **fallback** 与 legacy 一致
- [ ] **重试**策略（次数／backoff／放弃）与 legacy 一致
- [ ] **部分结果**处理与 legacy 一致
- [ ] **断路器／超时**降级与 legacy 一致

> **重要性分级**：依**生产实际触发频率**排序（#134「以生产为准」）。高频生产错误分支无对映即硬 block；从未触发的潜在分支仍列入但较低优先。

> 交叉参照：[full-coverage-testing](../../../../core/full-coverage-testing.md) Migration Error-Path Completeness（gap 报告 + 错误响应差分，R2/R4）；[behavior-snapshot](../../../../core/behavior-snapshot.md)（错误响应对等）。

## 回滚策略

| 方式 | 使用时机 |
|------|---------|
| **Git revert** | 小型、原子性变更 |
| **功能旗标** | 需要逐步发布 |
| **双运行** | 关键系统、零停机 |
| **分支冻结** | 一次性完整迁移 |

## 使用范例

```
User: /migrate "Vue 2 to 3"
AI: Migration Assessment: Vue 2 → Vue 3
    Breaking changes found: 12
    - Options API → Composition API (47 components)
    - Filters removed (8 usages)
    - Event bus removed (3 usages)
    Risk: Medium-High
    Estimated effort: 2-3 weeks
    Recommended: Staged migration with @vue/compat
```

## 下一步引导

`/migrate` 完成后，AI 助手应建议：

> **迁移分析完成。建议下一步：**
> - 执行 `/reverse` 深入理解现有代码
> - 执行 `/testing` 确保迁移后测试通过 ⭐ **推荐**
> - 执行 `/commit` 提交迁移变更

## 附录：9 轴完整性矩阵

> **来源**：XSPEC-284 Legacy Refactor Completeness Framework。「确保没有遗漏」无法用枚举证明——你只能验证你想得到要列举的东西。策略＝两条腿：(1) 从 legacy 真实 artifact **机械化推导**待办清单；(2) **差分神谕**让分歧自报。

每个迁移针对每一轴宣告三件事：**derive**（清单来源）· **detect**（oracle）· **gate 时机**。此处标为已覆盖者对映既有 UDS 标准——勿重复造轮子。

| 轴 | Derive（清单来源） | Detect（oracle） | Gate | 覆盖来源 |
|------|----------------------|-----------------|------|------------|
| ① Feature | route table／controller／menu／permissions | inventory diff（legacy vs new） | pre-flight | XSPEC-200 feature-manifest + `/vo-inventory`；XSPEC-206 |
| ② Behavior | curated 场景 + prod-log 提取 | behavior-snapshot 对等 | pre-UAT | XSPEC-201 behavior-snapshot；**contract tests**（本 skill） |
| ③ **持久化语义** | DB schema 全列语义签核（Gate 0） | **cutover-boundary 聚合对账** | **post-cutover** | **本 skill — Post-Cutover 数据对账（#134）** |
| ④ 隐含规则 | cron／queue／计算列／middleware source 扫描 | 每字段 3 问题 + 非 HTTP Devil's Advocate | pre-flight | 本 skill Gate 0（HTTP 层：XSPEC-201 Step 7）；XSPEC-284 R4（非 HTTP，未来） |
| ⑤ **背景副作用** | crontab／queue config／webhook 注册表／邮件点 | **逐 job「存在 + 已触发」** | pre-flight + **post-cutover** | **本 skill — 背景作业／副作用完整性** |
| ⑥ 非功能性 | legacy 性能基线 + 并发清单 | 延迟/吞吐回归 + 隔离 | pre-UAT | XSPEC-286（拆分） |
| ⑦ 数据完整性 | schema 类型／编码／时区清单 | 行数 + checksum + 编码字节 + 聚合相等 | post-migration + post-cutover | XSPEC-172 data-migration-testing；XSPEC-206；XSPEC-284 R6（未来） |
| ⑧ **状态机** | legacy 转移图（enum + 更新点 + 生产序列） | **合法转移 + 时序不变量（`created ≤ updated`）** | pre-UAT + **post-cutover** | **本 skill — 状态机与时序对等**（XSPEC-287） |
| ⑨ **错误路径** | legacy 异常层级／错误码（本 skill derive + 降级） | **错误路径快照 + 系统性 gap 分析 + 错误响应差分** | pre-UAT + cutover before/after | **本 skill — 错误路径完整性**（R1/R3）+ **full-coverage-testing** Migration Error-Path Completeness（R2/R4）；XSPEC-288 |
| **跨轴** | — | **shadow run**（镜像生产至两端）／**replay**（重放 legacy 请求） | cutover before/after | XSPEC-284 R5（泛化 `/vo-snapshot` 对等，未来） |

每轴宣告〔清单来源 derive｜oracle detect｜gate 时机〕；标为已覆盖者对映既有 UDS 标准，**勿重复造轮子**。未宣告的轴视为**已知遗漏风险**。本框架 P0 落地＝轴③④⑤（本 skill）；轴⑥已拆 XSPEC-286（落地于 performance-standards）、**轴⑧已落地于本 skill 状态机与时序对等（XSPEC-287）**、**轴⑨已落地（XSPEC-288）＝本 skill 错误路径完整性（R1/R3 derive + 降级）+ full-coverage-testing（R2/R4 系统性 gap 分析 + 错误响应差分）**。

## 参考

- 核心规范：[refactoring-standards.md](../../../../core/refactoring-standards.md)
- 相关：[contract-test-assistant](../contract-test-assistant/SKILL.md) — 迁移后持续契约验证的策略
- 相关：[behavior-snapshot](../../../../core/behavior-snapshot.md) — Curated golden-master 对等（3-gate 轴②）
- 相关：[observability-assistant](../observability-assistant/SKILL.md) — Post-cutover oracle 的对账排程 + 告警规则
- 框架：XSPEC-284 Legacy Refactor Completeness Framework — 9 轴 SSOT

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.4.0 | 2026-06-17 | 新增错误路径完整性（轴⑨，XSPEC-288）：机械化异常/错误码 derive（R1）+ 降级对等清单（R3）+ 生产频率重要性分级；系统性 gap 分析 + 错误响应差分（R2/R4）委由 full-coverage-testing |
| 1.3.0 | 2026-06-17 | 新增状态机与时序对等（轴⑧，XSPEC-287）：三方转移图提取、合法转移验证、时序不变量、序列/幂等对等、与 XSPEC-286 轴⑥边界 |
| 1.2.0 | 2026-06-17 | 新增 Post-Cutover 生产数据对账、背景作业完整性验证、9 轴完整性矩阵附录 |
| 1.1.0 | 2026-05-26 | 新增：API 迁移契约测试章节——强制 fixture 捕获协议、C#/TS 模板、逐字段审计清单（XSPEC-233 / closes #112） |
| 1.0.0 | 2026-03-24 | 初始版本 |

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/migrate`](../../../../skills/commands/migrate.md#ai-agent-behavior--ai-代理行為)

## 授权

CC BY 4.0
