---
source: ../../../core/developer-memory.md
source_version: 1.2.1
translation_version: 1.2.1
last_synced: 2026-10-11
source_hash: 4f480ae3038e
status: current
---

# 开发者持久记忆标准

> [English](../../../core/developer-memory.md) | **简体中文**

**版本**: 1.2.1
**最后更新**: 2026-10-07
**适用范围**: 所有使用 AI 助手的软件项目
**范围**: 通用 (Universal)
**所属规格**: XSPEC-291（developer-memory 没有专属的功能 XSPEC；由 XSPEC-291 负责）
**行业标准**: 无 (UDS 原创)

---

## 目的

本标准定义了一套结构化系统，用于跨对话和跨项目捕获、检索和浮现开发者经验洞察（陷阱、模式、反模式、心智模型等）。它使 AI 助手能够主动利用累积的知识，减少重复错误并加速问题解决。

---

## 快速参考

### 记忆条目 Schema（必填字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识符（格式：`MEM-YYYY-NNNN`） |
| `insight` | string | 一句话核心洞察 |
| `category` | enum | 9 种分类之一（见 §2） |
| `confidence` | float | 0.0–1.0，根据反馈动态调整 |
| `created_at` | date | ISO 8601 日期 (YYYY-MM-DD) |

### 记忆条目 Schema（选填字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `context` | string | 适用的情境或环境 |
| `anti_pattern` | string | 不应该做的事（错误做法） |
| `resolution` | string | 如何修复或避免问题 |
| `example` | object | `{bad: string, good: string}` — 代码或方法示例 |
| `tags` | list | 自由搜索标签（如 `["async", "race-condition"]`） |
| `applicability` | object | 语言/框架范围（见 §6） |
| `triggers` | list | 应触发浮现此记忆的模式 |
| `related` | list | 相关记忆条目的 ID |
| `validity` | object | 生命周期元数据（见 §7） |

### 统计字段（自动管理）

| 字段 | 类型 | 说明 |
|------|------|------|
| `stats.times_surfaced` | int | 此记忆被显示的次数 |
| `stats.times_useful` | int | 正面反馈次数 |
| `stats.times_not_useful` | int | 负面反馈次数 |
| `stats.last_surfaced` | date | 最近一次推送时间 |

### 反馈记录

| 字段 | 类型 | 说明 |
|------|------|------|
| `feedback[]` | list | 反馈条目数组 |
| `feedback[].date` | date | 反馈时间 |
| `feedback[].result` | enum | `valid` / `invalid` / `needs-revision` |
| `feedback[].note` | string | 可选的开发者备注 |

---

## 1. 记忆 Schema

### 1.1 完整 Schema 定义

```yaml
# Memory Entry - Full Schema
id: "MEM-2026-0001"              # Required: Unique ID
insight: "..."                    # Required: One-sentence core insight
category: pitfall                 # Required: One of 9 types
confidence: 0.85                  # Required: 0.0–1.0
created_at: "2026-02-07"         # Required: ISO date

# Optional fields
context: "When using async iterators in Node.js streams..."
anti_pattern: "Calling next() without awaiting the previous result"
resolution: "Always await each next() call or use for-await-of"
example:
  bad: "iterator.next(); iterator.next();"
  good: "for await (const chunk of iterator) { ... }"
tags: ["async", "streams", "node"]
applicability:
  languages: ["javascript", "typescript"]
  frameworks: []
  universal: false
  exclusions: []
triggers:
  - "async iterator"
  - "stream processing"
  - "next() called multiple times"
related: ["MEM-2026-0005"]
validity:
  type: versioned            # evergreen | versioned | temporal
  version_bound: "node >= 18"
  expires_at: null

# Auto-managed
stats:
  times_surfaced: 12
  times_useful: 9
  times_not_useful: 1
  last_surfaced: "2026-02-01"
feedback:
  - date: "2026-01-15"
    result: valid
    note: "Saved me 30 minutes debugging"
```

### 1.2 ID 格式

| 组成 | 格式 | 示例 |
|------|------|------|
| 前缀 | `MEM` | `MEM` |
| 年份 | `YYYY` | `2026` |
| 序号 | `NNNN` | `0001` |
| 完整 | `MEM-YYYY-NNNN` | `MEM-2026-0001` |

ID 全局唯一。序号每年重置。

---

## 2. 记忆分类

| 分类 | 说明 | 示例 |
|------|------|------|
| `pitfall` | 常见错误或陷阱 | 「以 0 为基础的 API 分页中的差一错误」 |
| `pattern` | 已验证的解决方案或最佳实践 | 「使用 Builder 模式构建复杂对象」 |
| `anti-pattern` | 已知的不良实践 | 「处理所有业务逻辑的上帝对象」 |
| `mental-model` | 理解概念的框架 | 「将 React state 视为快照，而非变量」 |
| `workaround` | 已知问题的临时修复 | 「为 npm 7+ 的 peer 冲突添加 `--legacy-peer-deps`」 |
| `performance` | 性能洞察或优化 | 「频繁查询时使用 `Map` 取代 `Object`」 |
| `debugging-strategy` | 诊断问题的方法 | 「使用 `git bisect` 二分搜索 git 历史」 |
| `tool-usage` | 工具/库技巧 | 「使用 `npx tsc --noEmit` 进行类型检查而不构建」 |
| `decision-rationale` | 做出特定决策的原因 | 「因事务支持而选择 PostgreSQL 而非 MongoDB」 |

---

## 3. 四项操作

### 3.1 记录 (Record)

#### 输入流程

1. 开发者以自然语言描述洞察
2. AI 将其结构化为记忆 schema
3. 开发者确认或编辑结构化条目
4. 条目保存至记忆库

#### 30 秒规则

每个记忆条目必须回答三个问题：

| 问题 | 对应字段 |
|------|---------|
| 具体问题是什么？ | `insight` |
| 为什么会发生？ | `context` + `anti_pattern` |
| 如何修复/避免？ | `resolution` |

#### 记录级别

| 级别 | 字段 | 使用时机 |
|------|------|---------|
| 级别 1：快速 | `insight`, `category`, `tags` | 快速笔记，稍后完善 |
| 级别 2：情境 | 级别 1 + `context`, `anti_pattern`, `resolution` | 标准记录 |
| 级别 3：完善 | 级别 2 + `example`, `triggers`, `applicability` | 重要且频繁使用的洞察 |

#### 去标识化

存储前，移除项目特定细节：

| 移除 | 保留 |
|------|------|
| API 密钥、密码 | 技术模式 |
| 项目名称、内部 URL | 框架/库名称 |
| 团队成员名称 | 语言/版本信息 |
| 专有业务逻辑 | 通用业务逻辑模式 |

### 3.2 查询 (Query)

#### 搜索方法

| 方法 | 说明 | 示例 |
|------|------|------|
| 关键字 | 跨 `insight`、`context`、`tags` 的自由文本搜索 | `"async race condition"` |
| 标签 | `tags` 字段的精确匹配 | `tags: ["react", "hooks"]` |
| 分类 | 按分类类型筛选 | `category: pitfall` |
| 语言 | 按 `applicability.languages` 筛选 | `languages: ["python"]` |
| 置信度 | 按置信度阈值筛选 | `confidence >= 0.7` |
| 组合 | 多重筛选组合 | `category: pitfall AND tags: ["react"]` |

#### 查询结果排序

| 优先顺序 | 标准 |
|---------|------|
| 1 | 与当前情境的相关性 |
| 2 | 置信度分数（最高优先） |
| 3 | 命中率 (`times_useful / times_surfaced`) |
| 4 | 近期性 (`created_at` 最新优先) |

### 3.3 反馈 (Feedback)

#### 反馈动作

| 动作 | 对 `confidence` 的影响 | 对 `stats` 的影响 |
|------|----------------------|------------------|
| `valid` | +0.05（上限 1.0） | `times_useful += 1` |
| `invalid` | -0.15（下限 0.0） | `times_not_useful += 1` |
| `needs-revision` | -0.05（下限 0.0） | 无变更 |

#### 置信度调整规则

| 条件 | 动作 |
|------|------|
| 连续 3 次 `valid` | 额外 +0.05 |
| 连续 3 次 `invalid` | 标记待审查 |
| `confidence < 0.2` | 标记待退役 |
| `confidence > 0.9` 且使用 10+ 次 | 标记为「已验证」 |

### 3.4 审查 (Review)

AI 扫描记忆库并生成审查报告，涵盖：

#### 合并建议

| 触发条件 | 动作 |
|---------|------|
| 两个条目语义相似度 >80% | 建议合并 |
| 相同 `tags` + 相同 `category` + 相似 `insight` | 建议合并 |
| 合并后继承最高 `confidence` | 保留两者反馈记录 |

#### 退役建议

阈值为 UDS 默认值（可按项目配置）；理由一并记录，使每个数值都可审计，而非任意设定。

| 触发条件 | 动作 | 理由 |
|---------|------|------|
| `confidence < 0.2` | 建议退役 | 屡被判定无效的知识，噪声多于信号 |
| 超过 180 天未浮现且 `confidence < 0.5` | 建议退役 | 半年未被使用再加上低置信度，代表该记忆已与当前工作无关；180 天窗口与下方「过时检测」中的过时/衰减模型一致 |
| 5+ 条 `invalid` 反馈 | 建议退役 | 持续的负面反馈表示该记忆有误或已过时 |

#### 过时检测

| 触发条件 | 动作 |
|---------|------|
| `validity.type == "versioned"` 且版本已过时 | 标记为过时 |
| `validity.type == "temporal"` 且 `expires_at` 已过 | 标记为已过期 |
| `validity.type == "evergreen"` | 跳过版本检查 |
| 被调用的记忆引用了某个文件路径或符号（函数/类），但该位置已不存在该路径或符号，或已被移动 | 标记为 `code-reference` 过时 — 见下文 |

#### 代码引用过时（`code-reference`）

代码会移动；针对旧位置记录的记忆不会自行更新。此检查捕捉的情况是：记忆的洞察仍然成立，但其引用——文件路径或函数/类名称——已不成立。

此检查复用 **[Knowledge Graph Memory](knowledge-graph-memory.md) §2 已定义的两种运作模式**，而非另创第三种：

| 模式 | 时机 | 方式 |
|------|------|------|
| 降级模式（无图引擎） | 任何工具、无需额外设置——默认 | 使用记忆前，助手自行确认所引用的路径/符号仍存在（`Glob`/`Grep`/`Read`）——与 §5 记忆验证原则已要求的机制相同 |
| 引擎模式（已建立索引的图引擎，如 [EngramGraph](https://github.com/AsiaOstrich/EngramGraph) 的 `egr refs check`） | 可用时 | 引擎回报每个引用的状态：`present` / `moved`（附新位置）/ `missing` / `unresolvable` |

> 正确的实现在两种模式下产生相同形态的答案（Knowledge Graph Memory §2.2）——引擎模式更快、更完整，但本质上并无不同。

**`unresolvable` 不得被当作 `present` 或 `missing`。** 它表示检查器无法为该引用得出答案（例如超出索引范围的跨仓库引用，参见 Knowledge Graph Memory §2.2 的跨领域注意事项）——这种不确定性必须以独立状态传达给助手，而不能悄悄塌缩为假阳性（视为仍有效）或假阴性（视为已消失）。

**时机**：此检查作为 `proactive-surfacing`（§4.1）的一部分执行——在记忆显示之前，而非之后。引用解析为 `missing` 的记忆不会被若无其事地悄悄浮现。

**范围（第一批）**：仅限文件路径与符号名称（函数/类名称）。`file:line` 引用明确**不在范围内**——行号会随文件中任何无关编辑而漂移，这与「此文件/符号已不存在」属于不同类型的过时（见 DEC-115 OQ-1；将于 2027-01-31 前重新审视）。

#### 修订建议

| 触发条件 | 动作 |
|---------|------|
| 2+ 条 `needs-revision` 反馈 | 建议修订 |
| 高 `times_surfaced` 但低 `times_useful` 比率 | 建议修订 |

---

## 4. 主动行为协议

### 4.1 记忆浮现（主动浮现）

#### 何时浮现

| 时机 | 行为 |
|------|------|
| 对话开始 | 扫描记忆库，显示与所述任务最相关的前 3 个 |
| 开发过程中 | 检测代码模式、错误信息或技术决策是否匹配 `triggers` |
| 提交前 | 浮现与已变更文件/模式相关的陷阱 |

#### 浮现规则

| 规则 | 值 | 理由 |
|------|---|------|
| 相关性阈值 | > 0.7 | 避免松散相关记忆的噪声 |
| 冷却期 | 每条目 7 天 | 防止重复建议 |
| 每次触发上限 | 3–5 条 | 防止信息过载 |
| 溢出处理 | AI 归纳为分组洞察 | 当 > 5 个匹配时 |
| 代码引用检查 | 浮现前执行（§3.4 `code-reference` 过时检查，降级或引擎模式） | 不在未加标记的情况下浮现文件/符号引用已无法解析的记忆 |

#### 浮现格式

```
💡 Memory Match [MEM-2026-0042] (confidence: 0.85)
Category: pitfall | Tags: async, promise
Insight: Promise.all rejects on first failure — use Promise.allSettled for partial results
Context: When processing batch API calls where partial success is acceptable
```

### 4.2 记忆提取（主动提取）

#### 触发信号

AI 应检测这些开发者信号并建议记录：

| 信号 | 示例 |
|------|------|
| 重复修改 | 同一代码块被编辑 3+ 次 |
| 还原 | `git revert` 或手动撤销 |
| 洞察语言 | 「哦！」、「我懂了」、「原来」、「终于」、「the trick is...」 |
| 长时间调试 | 同一错误超过 10 分钟 |
| 挣扎后的解决方案 | 错误 → 多次尝试 → 解决 |

#### 提取流程

```
1. AI detects signal
2. AI proposes: "It seems you discovered something. Want to record this insight?"
3. AI pre-structures the entry based on conversation context
4. Developer confirms / edits / skips
5. If confirmed → saved to memory store
```

### 4.3 记忆聚合（主动聚合）

#### 聚合触发

| 触发条件 | 动作 |
|---------|------|
| 3+ 个相关的 `pitfall` 条目 | 建议归纳为 `mental-model` |
| 5+ 个相同标签的条目 | 建议创建主题摘要 |
| 关于同一概念的分散片段 | 建议整合 |

#### 升级路径

```
Multiple pitfalls → Pattern → Mental Model
  (fragments)     (solution)  (understanding)
```

---

## 5. 记忆验证原则（记忆是线索，非结论）

> 借鉴 lintsinghua/claude-code-book 记忆验证原则。

记忆提供方向，但**不能直接作为事实使用**。使用记忆前须独立验证：

| 记忆内容 | 验证方法 | 冲突时处理 |
|---------|---------|-----------|
| 文件路径 | 确认文件仍存在（Glob/Read） | 标记记忆为 `needs-revision` |
| 函数名称/API flag | 确认仍存在（Grep/文档） | 标记记忆为 `needs-revision` |
| 架构快照/Repo 状态 | 优先信任 `git log`/源代码 | 更新记忆为当前状态 |
| 包版本/依赖 | 确认 package.json/lockfile | 以实际版本为准 |

### 禁止行为

- 未先验证，就直接引用记忆中的具体 API/路径/函数名称推荐给用户
- 宣称「根据记忆，X 存在」而未执行独立确认
- 记忆内容与现况冲突时，选择信任记忆而非当前观察

### 记忆用途场景

记忆适合提供：
- **搜索方向**：「这类问题上次在 X 模块找到答案」
- **模式线索**：「这个错误模式对应已知 pitfall MEM-2026-0042」
- **决策背景**：「此设计决策的历史背景是...」

---

## 6. 噪声控制

### 推送级别

| 级别 | 名称 | 行为 |
|------|------|------|
| 0 | 静默 | 从不推送；仅响应查询 |
| 1 | 摘要 | 显示计数：「找到 3 个相关记忆。要查看吗？」 |
| 2 | 主动（默认） | 显示前 3 个及一行摘要 |
| 3 | 详细 | 显示完整条目，含情境和示例 |

### 噪声降低规则

| 规则 | 说明 |
|------|------|
| 反馈驱动 | 若用户标记 3+ 个浮现记忆为 `invalid`，降至级别 1 |
| 会话尊重 | 用户说「现在不要」后，当前会话切换至级别 0 |
| 置信度筛选 | 仅浮现 `confidence >= 0.5` 的条目 |
| 已验证偏好 | 优先显示「已验证」状态的条目（confidence > 0.9，10+ 次使用） |

---

## 6. 跨语言适用性

### 适用性 Schema

```yaml
applicability:
  languages: ["javascript", "typescript"]  # Applicable languages (empty = universal)
  frameworks: ["react", "next.js"]          # Applicable frameworks (empty = any)
  universal: false                           # true = applies to all languages
  exclusions: ["rust"]                       # Languages where this explicitly does NOT apply
```

### 适用性规则

| 情境 | `universal` | `languages` | `exclusions` |
|------|-------------|-------------|--------------|
| 适用所有语言 | `true` | `[]` | `[]` |
| 特定语言 | `false` | `["python", "ruby"]` | `[]` |
| 除部分语言外全部适用 | `true` | `[]` | `["c", "assembly"]` |
| 特定框架 | `false` | `["javascript"]` | `[]` |

---

## 7. 知识生命周期

### 有效性类型

| 类型 | 说明 | 过时检查 |
|------|------|---------|
| `evergreen` | 始终适用（如算法洞察） | 无 |
| `versioned` | 绑定特定版本（如 API 行为） | 检查 `version_bound` |
| `temporal` | 有时效（如 bug 的临时修复） | 检查 `expires_at` |

### 有效性 Schema

```yaml
validity:
  type: versioned          # evergreen | versioned | temporal
  version_bound: "react >= 18"  # For versioned type
  expires_at: "2026-12-31"      # For temporal type
```

### 置信度生命周期

```
New entry: confidence = 0.5 (default)
    ↓ valid feedback
Growing: 0.5 → 0.7 → 0.85
    ↓ consistent positive use
Proven: 0.9+ (after 10+ surfacings)
    ↓ invalid feedback / staleness
Declining: 0.85 → 0.6 → 0.3
    ↓ retirement threshold
Retired: confidence < 0.2
```

### 退役条件

条目在以下任何条件下被标记为退役：

- `confidence < 0.2`
- 超过 180 天未浮现且 `confidence < 0.5`
- 5+ 条 `invalid` 反馈
- `validity.type == "temporal"` 且 `expires_at` 已过
- `validity.type == "versioned"` 且版本不再使用

已退役条目被归档（非删除）以供历史参考。

---

## 8. 指标

### 关键指标

| 指标 | 公式 | 健康范围 |
|------|------|---------|
| 命中率 | `times_useful / times_surfaced` | > 0.6 |
| 反馈率 | `(valid + invalid) / times_surfaced` | > 0.3 |
| 库增长 | 每月新增条目 | 5–20 |
| 退役率 | 每月退役条目 | < 新增的 20% |
| 覆盖率 | 有 5+ 条目的分类数 | 9 种分类中 6+ |

### 健康指标

| 指标 | 良好 | 警告 | 需要处理 |
|------|------|------|---------|
| 平均置信度 | > 0.6 | 0.4–0.6 | < 0.4 |
| 命中率 | > 0.6 | 0.3–0.6 | < 0.3 |
| 过时条目 | < 10% | 10–25% | > 25% |
| 孤立条目（从未浮现） | < 15% | 15–30% | > 30% |

---

## 9. 存储格式

### 推荐：按分类 YAML

```
.memory/
├── pitfall.yaml
├── pattern.yaml
├── anti-pattern.yaml
├── mental-model.yaml
├── workaround.yaml
├── performance.yaml
├── debugging-strategy.yaml
├── tool-usage.yaml
├── decision-rationale.yaml
└── _index.yaml          # ID registry and cross-references
```

#### 文件大小建议

| 每文件条目数 | 建议 |
|-----------|------|
| < 100 | 每分类一个 YAML 文件 |
| 100–500 | 按分类内子主题分割 |
| > 500 | 考虑 JSONL 格式 |

### 替代方案：JSONL

大型记忆库可使用每分类一个 JSONL 文件：

```
.memory/
├── pitfall.jsonl
├── pattern.jsonl
└── ...
```

每行是一个代表一个记忆条目的完整 JSON 对象。

### 索引文件 (`_index.yaml`)

```yaml
# Memory Index
last_id: "MEM-2026-0042"
total_entries: 42
by_category:
  pitfall: 12
  pattern: 8
  anti-pattern: 5
  mental-model: 3
  workaround: 4
  performance: 3
  debugging-strategy: 2
  tool-usage: 3
  decision-rationale: 2
```

---

## 相关标准

- [反幻觉标准](anti-hallucination.md) — 证据导向分析适用于记忆来源
- [AI 指令标准](ai-instruction-standards.md) — Token 效率优化的记忆系统指令格式
- [AI 友好架构](ai-friendly-architecture.md) — 支持记忆集成的项目结构
- [文档撰写标准](documentation-writing-standards.md) — 记忆条目的撰写质量
- [Knowledge Graph Memory](knowledge-graph-memory.md) — `code-reference` 过时检查（§3.4）所复用的降级/引擎双模式来源

---

## 10. 架构决策：Always-On Protocol

### 分类

开发者持久记忆被分类为 **Always-On Protocol**，而非用户触发的工作流。

| 模式 | 特性 | 示例 | 需要 Skill？ |
|------|------|------|------------|
| **用户触发** | 用户明确调用、多步骤引导式工作流 | `/commit`、`/code-review`、`/sdd` | 是 |
| **Always-On Protocol** | AI 加载 ai.yaml 后持续遵循规则 | 反幻觉、开发者记忆 | 否 |

### 理由：不需要 CLI / Skill / 斜杠命令

| 组件 | 决策 | 理由 |
|------|------|------|
| CLI 命令 (`uds memory ...`) | **不需要** | 核心操作（语义匹配、洞察提取、置信度调整）需要 LLM 智能；CLI 只能做字符串匹配 |
| Skill (`skills/developer-memory/`) | **不需要** | `developer-memory.ai.yaml` 已自足，包含完整 schema + 规则 + 主动协议 |
| `/memory add`、`/memory search` | **不需要** | 与「主动行为」设计理念矛盾 — AI 应自动提取和浮现 |
| `/memory review` | **延后** | 唯一可能有用的命令；延后至用户反馈表明需要时 |

### 无需额外工具即可运作

```
AI loads developer-memory.ai.yaml
    ↓
Rules automatically activate:
  - proactive-surfacing: Surface relevant memories on context match
  - proactive-extraction: Detect insight moments, offer to record
  - proactive-aggregation: Suggest merging related entries
  - noise-control: Respect push levels and cooldown
    ↓
No explicit user trigger needed
```

### 未来考量

如果用户反馈揭示：
- **发现性不足**：考虑轻量级 Skill（配置检测 + 发现性）
- **明确的审查需求**：考虑 `/memory review` 斜杠命令
- **永远不需要**：`uds memory add/search` CLI 命令 — 这些操作本质上需要 LLM

---

## 11. 工具采用示例：代码引用检查（非规范性）

本节示范一种将 `code-reference` 过时检查（§3.4）接入工具自身自动化的方式。本节仅为文档——UDS 不附带此 hook，`uds init`/`uds update` 也不会安装它。

### Claude Code

Claude Code 的自动记忆存放在仓库之外，位于 `~/.claude/projects/<project-path>/memory/`。`SessionStart` hook 可在会话首次浮现记忆之前，针对该目录执行检查；若没有图引擎，则回退到降级模式：

```bash
#!/usr/bin/env bash
# Illustrative only — not installed by any UDS command.
MEMORY_DIR="$HOME/.claude/projects/$(pwd | tr '/' '-')/memory"

if command -v egr >/dev/null 2>&1 && [ -f .engram/graph.db ]; then
  # Engine mode (§3.4): egr resolves each cited path/symbol.
  egr refs check "$MEMORY_DIR"
else
  # Degraded mode (§3.4): no engine configured — nothing to run up
  # front; the assistant verifies each citation itself before use (§5).
  echo "[developer-memory] no graph engine detected; degraded mode applies"
fi
```

### 其他工具

没有会话启动 hook 的工具，仍可通过以下任一方式满足本标准：

- 在仓库自身的指令文件（`CLAUDE.md`、`AGENTS.md`、`.cursorrules`、`.clinerules`、`.windsurfrules`、`copilot-instructions.md`、`GEMINI.md`、`.roo/rules/` 等）中加入规则，指示助手在依赖记忆前先验证其引用的路径/符号；或
- 加入 pre-commit 检查，扫描仓库自身的指令文件中已无法解析的引用。

---

## 边界：本标准不放什么

下面两种信息不在本标准的范围内，写进这里是错的：

- **个人、跨项目、可识别的信息**（谁负责什么、怎么连到某个环境）。去标识化（见上方的 schema）会把这些剥掉，所以它们不能是一条记忆条目。它们属于用户自己的 AI 工具的记忆——那种记忆绑定该用户与该机器，不被分享。
- **项目之间的协调**（哪件工作在等哪件工作）。那是开放工作，不是记忆：见 [Open Work Tracking](open-work-tracking.md)（OWT-027–OWT-029）。

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.1 | 2026-10-07 | 新增：边界一节——个人、跨项目、可识别的信息以及项目之间的协调不属于记忆条目（XSPEC-460 R5；修订版，无行为变更） |
| 1.2.0 | 2026-09-25 | 新增：审查（§3.4）中的 `code-reference` 过时检查——引用已移动/缺失的文件路径或符号的记忆会在浮现前被标记；复用 Knowledge Graph Memory 的降级/引擎双模式，而非另创第三种；`unresolvable` 不得被解读为 present 或 missing；范围仅限文件路径与符号名称（`file:line` 明确不在范围内，DEC-115 OQ-1）；§11 新增非规范性的 Claude Code 采用示例（DEC-115-L1） |
| 1.1.1 | 2026-06-18 | 新增：指向 XSPEC-291 的 `Owning Spec` 标头（修订版，无行为变更；XSPEC-291 §11 处置） |
| 1.1.0 | 2026-06-18 | 新增：退役建议阈值的理由栏与可配置说明（XSPEC-292 T8） |
| 1.0.0 | 2026-02-07 | 初始标准：schema、4 项操作、主动协议、噪声控制、架构决策（Always-On Protocol） |

---

## 许可

本标准依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
