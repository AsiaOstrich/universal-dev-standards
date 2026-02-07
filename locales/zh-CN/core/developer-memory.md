---
source: ../../core/developer-memory.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-07
status: current
---

# 开发者持久记忆标准

> [English](../../core/developer-memory.md) | **简体中文**

**版本**: 1.0.0
**最后更新**: 2026-02-07
**适用范围**: 所有使用 AI 助手的软件项目
**范围**: 通用 (Universal)
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
# 记忆条目 - 完整 Schema
id: "MEM-2026-0001"              # 必填：唯一 ID
insight: "..."                    # 必填：一句话核心洞察
category: pitfall                 # 必填：9 种类型之一
confidence: 0.85                  # 必填：0.0–1.0
created_at: "2026-02-07"         # 必填：ISO 日期

# 选填字段
context: "在 Node.js 流中使用 async iterators 时..."
anti_pattern: "在未 await 前一个结果的情况下调用 next()"
resolution: "始终 await 每个 next() 调用，或使用 for-await-of"
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

# 自动管理
stats:
  times_surfaced: 12
  times_useful: 9
  times_not_useful: 1
  last_surfaced: "2026-02-01"
feedback:
  - date: "2026-01-15"
    result: valid
    note: "省了我 30 分钟的调试时间"
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

| 触发条件 | 动作 |
|---------|------|
| `confidence < 0.2` | 建议退役 |
| 超过 180 天未浮现且 `confidence < 0.5` | 建议退役 |
| 5+ 条 `invalid` 反馈 | 建议退役 |

#### 过时检测

| 触发条件 | 动作 |
|---------|------|
| `validity.type == "versioned"` 且版本已过时 | 标记为过时 |
| `validity.type == "temporal"` 且 `expires_at` 已过 | 标记为已过期 |
| `validity.type == "evergreen"` | 跳过版本检查 |

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

#### 浮现格式

```
💡 记忆匹配 [MEM-2026-0042]（置信度：0.85）
分类：pitfall | 标签：async, promise
洞察：Promise.all 在第一个失败时就会拒绝 — 使用 Promise.allSettled 获取部分结果
情境：处理批量 API 调用且可接受部分成功时
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
1. AI 检测信号
2. AI 提议：「看起来你发现了某些东西。要记录这个洞察吗？」
3. AI 根据对话情境预先结构化条目
4. 开发者确认/编辑/跳过
5. 若确认 → 保存至记忆库
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
多个陷阱 → 模式 → 心智模型
（片段）    （解决方案）  （理解）
```

---

## 5. 噪声控制

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
  languages: ["javascript", "typescript"]  # 适用语言（空 = 通用）
  frameworks: ["react", "next.js"]          # 适用框架（空 = 任何）
  universal: false                           # true = 适用所有语言
  exclusions: ["rust"]                       # 明确不适用的语言
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
  version_bound: "react >= 18"  # 用于 versioned 类型
  expires_at: "2026-12-31"      # 用于 temporal 类型
```

### 置信度生命周期

```
新条目：confidence = 0.5（默认）
    ↓ valid 反馈
增长中：0.5 → 0.7 → 0.85
    ↓ 持续正面使用
已验证：0.9+（经过 10+ 次浮现）
    ↓ invalid 反馈 / 过时
下降中：0.85 → 0.6 → 0.3
    ↓ 退役阈值
已退役：confidence < 0.2
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
└── _index.yaml          # ID 登记与交叉引用
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
# 记忆索引
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

---

## 10. 架构决策：Always-On Protocol

### 分类

开发者持久记忆被分类为 **Always-On Protocol**，而非用户触发的工作流。

| 模式 | 特性 | 示例 | 需要 Skill？ |
|------|------|------|------------|
| **用户触发** | 用户明确调用、多步骤引导式工作流 | `/commit`、`/review`、`/spec` | 是 |
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
AI 加载 developer-memory.ai.yaml
    ↓
规则自动启动：
  - proactive-surfacing：在情境匹配时浮现相关记忆
  - proactive-extraction：检测洞察时刻，提议记录
  - proactive-aggregation：建议合并相关条目
  - noise-control：尊重推送级别和冷却期
    ↓
不需要明确的用户触发
```

### 未来考量

如果用户反馈揭示：
- **发现性不足**：考虑轻量级 Skill（配置检测 + 发现性）
- **明确的审查需求**：考虑 `/memory review` 斜杠命令
- **永远不需要**：`uds memory add/search` CLI 命令 — 这些操作本质上需要 LLM

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-02-07 | 初始标准：schema、4 项操作、主动协议、噪声控制、架构决策（Always-On Protocol） |

---

## 许可

本标准依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
