---
source: ../../../core/systematic-debugging.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 7f591022723b
status: current
---

# 系统化调试工作流

> **语言**: [English](../../../core/systematic-debugging.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-20
**适用范围**: 所有使用 AI 辅助开发的软件项目
**范围**: universal
**灵感来源**: [Superpowers](https://github.com/obra/superpowers) — systematic-debugging (MIT)

---

## 目的

定义结构化的四阶段调试工作流，防止常见的"猜测修复"循环反模式。本标准强制要求在任何修复尝试之前先进行根因分析，并包含 **3-Strike Rule** 以尽早发现架构问题。

---

## 术语表

| 术语 | 定义 |
|------|------|
| 根因（Root Cause） | 缺陷存在的根本原因，而不仅仅是症状 |
| 3-Strike Rule | 连续 3 次修复尝试失败后，怀疑存在架构问题 |
| 反向追踪（Backward Tracing） | 从错误症状追溯到产生问题的源头 |
| 组件边界（Component Boundary） | 两个模块或子系统之间的接口 |

---

## 核心原则 — 铁律

> **绝不跳过根因分析直接进行修复。**

如果你发现自己在说"快速修复"、"试试看"或"现在应该可以了" — **停下来**，回到阶段 1。

---

## 四个阶段

### 阶段 1：根因调查（Root Cause Investigation）

分析错误信息并追踪最近的变更，形成初步假设。

1. **仔细阅读错误** — 识别失败的确切位置和类型
2. **追踪最近的变更** — 使用 `git log`、`git diff`、`git blame` 找出变更内容
3. **在组件边界添加诊断** — 在模块之间的接口处插入日志/断点
4. **记录观察结果** — 记录所见内容并形成初步假设

### 阶段 2：模式分析（Pattern Analysis）

将失败的代码与类似的正常运行实现进行比对。

1. **在代码库中搜索类似的成功实现**
2. **识别失败代码与正常代码之间的差异**
3. **检查缺失的前置条件** — 初始化、配置、执行顺序

### 阶段 3：假设测试（Hypothesis Testing）

以最小、隔离的修改验证你的假设。

1. **做出尽可能小的修改**来测试假设
2. **每次只改变一个变量** — 绝不同时进行多处修改
3. **记录每次尝试** — 记录假设、修改内容和结果

### 阶段 4：修复实施（Fix Implementation）

只有在确认根因之后才实施修复。

1. **确认根因**已通过假设测试得到验证
2. **实施修复**，并进行适当的错误处理
3. **运行完整测试套件** — 确保没有回归
4. **验证修复不会引入新问题**

---

## 3-Strike Rule

> 在**连续 3 次修复尝试失败**后，停止猜测，并质疑架构设计。

当 3-Strike Rule 触发时：

1. 从具体的缺陷中退后一步
2. 审视整体模块/组件设计
3. 考虑架构是否支持预期行为
4. 寻找使这一类缺陷得以出现的设计缺陷
5. 在再次尝试修复之前考虑重构

---

## 规则

| ID | 触发条件 | 动作 | 优先级 |
|----|---------|------|--------|
| SD-001 | 连续 3 次修复失败 | 停止猜测，质疑架构设计 | Critical |
| SD-002 | 出现"快速修复"、"试试看"、"现在应该可以了"等说法 | 回到阶段 1 根因分析 | High |
| SD-003 | 多组件交互错误 | 在每个组件边界添加诊断观察 | Medium |

---

## 应避免的反模式

| 反模式 | 为何有害 |
|--------|---------|
| 霰弹枪式调试（Shotgun debugging） | 随机修改浪费时间，且可能引入新缺陷 |
| 从 Stack Overflow 复制粘贴修复 | 缺乏理解时，修复可能并未解决真正的根因 |
| 压制错误 | 隐藏症状并不能修复问题 |
| "在我的机器上可以运行" | 环境差异是线索，而不是推托的理由 |

---

## 示例

### 正确：结构化调试

```
Phase 1: TypeError at line 42 in parser.ts — reading property of undefined
         git log shows parser.ts was modified 2 commits ago
         Added console.log at module boundary → input is null when empty array passed

Phase 2: Similar parser in legacy/ handles empty arrays with early return

Phase 3: Added early return for empty array → test passes
         Changed only one thing, recorded result

Phase 4: Implemented fix, ran full test suite (47/47 pass), no regressions
```

### 错误：猜测后修复

```
"Hmm, let me try adding a null check... nope.
 Maybe wrapping in try-catch... still broken.
 Let me just change the type to any... 🤦"
```

---

## 参考资料

- **Superpowers**: [systematic-debugging](https://github.com/obra/superpowers) (MIT)
- **The Pragmatic Programmer**: Chapter on Debugging
- **Debugging by Thinking**: A Multidisciplinary Approach (Robert Charles Metzger)
