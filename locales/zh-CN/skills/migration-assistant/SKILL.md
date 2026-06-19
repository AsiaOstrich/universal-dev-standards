---
source: ../../../../skills/migration-assistant/SKILL.md
source_version: 1.0.0
source_hash: 67b6f33f825e
translation_version: 1.0.0
last_synced: 2026-06-01
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

## 参考

- 核心规范：[refactoring-standards.md](../../../../core/refactoring-standards.md)
- 相关：[contract-test-assistant](../contract-test-assistant/SKILL.md) — 迁移后持续契约验证的策略

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-05-26 | 新增：API 迁移契约测试章节——强制 fixture 捕获协议、C#/TS 模板、逐字段审计清单（XSPEC-233 / closes #112） |
| 1.0.0 | 2026-03-24 | 初始版本 |

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/migrate`](../../../../skills/commands/migrate.md#ai-agent-behavior--ai-代理行為)

## 授权

CC BY 4.0
