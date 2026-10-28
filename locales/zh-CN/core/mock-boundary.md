---
source: ../../../core/mock-boundary.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-10-28
source_hash: b95f3da59a8e
status: current
---

# Mock 边界标准

> **语言**: [English](../../../core/mock-boundary.md) | [繁體中文](../../zh-TW/core/mock-boundary.md) | 简体中文

**版本**: 1.3.0
**最后更新**: 2026-10-28
**适用性**: 所有具备单元测试与集成测试的软件项目
**范围**: universal
**行业标准**: ISTQB Foundation（Test Doubles）, xUnit Patterns（Gerard Meszaros）
**参考**: "Working Effectively with Legacy Code"（Feathers）, "Growing Object-Oriented Software"（Freeman & Pryce）

---

## 目的

本文档定义测试中哪些东西可以 mock、哪些不可以。其目标是防止**空心测试（hollow tests）**——永远通过却无法检测真实 bug 的测试，因为它们用 stub 取代了系统的逻辑。

---

## 空心测试问题

空心测试 mock 掉系统的大部分内容，使测试变成 mock 接线的规格说明，而非系统行为的规格说明。经典症状：你可以删掉实现文件，测试仍然通过。

**真实案例（Multi-agent pipeline SPEC-002.test.ts）**:

```typescript
vi.mock('../../src/runner/agent-runner.js')      // Core logic replaced
vi.mock('../../src/runner/guardian-hooks.js')     // Core logic replaced
vi.mock('../../src/runner/prototyper.js')         // Core logic replaced
vi.mock('../../src/runner/iteration-report.js')   // Core logic replaced
vi.mock('../../src/memory/memory-store.js')       // Core logic replaced
vi.mock('node:fs/promises', ...)                  // I/O replaced

// All assertions verify mock call counts — not actual outputs.
// runPipeline() touches zero real code.
```

---

## 可以 Mock 的项目

| 类别 | 示例 | 理由 |
|------|------|------|
| 外部 HTTP 服务 | LLM API、支付网关、email 服务 | 防止不稳定（flaky）测试；可控制响应场景 |
| 时间函数 | `Date.now()`、`new Date()`、`setTimeout` | 使测试具确定性 |
| 环境变量 | `process.env.NODE_ENV`、`process.env.LICENSE_KEY` | 支持配置变化 |
| 文件系统（仅限单元测试） | `fs.readFile`、`fs.writeFile` | 让快速单元测试避免 I/O |
| 跨模块边界（须有对应 IT） | 其他模块的 public API | 隔离被测单元 |
| 进程内后台执行（通过可注入 runner） | `Task.Run`、unawaited promise、`setTimeout`、goroutine、thread-pool dispatch | 注入 runner seam 让测试能 await 到确定完成，消除 race |

---

## 不可 Mock 的项目

| 类别 | 违规示例 | 禁止原因 |
|------|---------|---------|
| 自身模块的核心逻辑 | 在 pipeline-runner 测试中 `vi.mock('./pipeline-runner.js')` | 使测试形同虚设 |
| IT/flow/E2E 测试中的数据库 | 在集成测试中 `vi.mock('./db/client.js')` | 隐藏查询 bug、schema 问题 |
| HTTP 框架内部 | `vi.mock('express')` | 真实路由可能已坏 |
| 安全控制 | 永远通过的 auth middleware stub | 安全性回归不可见 |

---

## 可注入的后台执行（Injectable Background Execution）

fire-and-forget 的后台工作（`Task.Run`、unawaited promise、`setTimeout`、goroutine、`java.util.concurrent` executor 提交，或 `asyncio.create_task`）是一个 **seam**，就跟系统时钟一样。正如你注入 clock 而非直接读取 wall-clock 时间，你也应该注入后台 dispatcher，而非直接生成后台工作。这样测试就能把工作驱动到**确定、可被 await 的完成**，并对其结果（成功、异常或 retry）进行断言——不用 poll、不用 sleep、没有 race。

将 dispatch 抽象成一个小接口（例如 `IBackgroundTaskRunner` / `BackgroundDispatcher`），再提供两种实现：

- **Production**：保留真正的 fire-and-forget 语义——dispatch 立即返回，工作以 detached 方式运行。
- **Test**：以 **inline** 方式执行工作并**追踪底层 Task/promise**，对外暴露一个 handle 供测试 `await`，使完成（及任何失败）可被观察。

语言中立示意（TypeScript 伪代码）：

```typescript
// Seam — 在任何 dispatch 后台工作处注入
interface BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void
}

// Production：真正的 fire-and-forget——立即返回，工作以 detached 方式运行
class FireAndForgetDispatcher implements BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void {
    void work() // 刻意不 await
  }
}

// Test：inline 执行 + 追踪 task，让测试能 await 到完成
class DeterministicDispatcher implements BackgroundDispatcher {
  private readonly tasks: Promise<void>[] = []
  dispatch(work: () => Promise<void>): void {
    this.tasks.push(work()) // inline 启动并保留 handle
  }
  async settle(): Promise<void> {
    await Promise.all(this.tasks) // 测试 await 到确定完成
  }
}
```

测试注入 `DeterministicDispatcher`，执行被测代码，再在断言结果前 `await dispatcher.settle()`——后台副作用此时已完全可观察且具确定性。

---

## 拦截型 Hook：测宿主的入口，不是测匹配函数

**hook** 是 AI 宿主（Claude Code、Codex、Gemini CLI、Antigravity CLI 等）在生命周期事件上运行的脚本。有些 hook 能**拦下**宿主原本要做的事：拒绝一次工具调用、拒绝一条提示、不让一个回合结束。对这类 hook，空心测试根本不需要任何 mock——测试只是从来没碰到宿主会调用的入口。

hook 有两层。**判断层**决定这条命令危不危险；**接线层**读宿主送来的 stdin 数据，并用宿主会读的信号回答（退出码，或标准输出的 JSON）。导入判断函数的单元测试只练到第一层，而宿主读的是第二层。退出码错、字段名称读错、输出格式宿主不认，这些都不会让那个测试变红。

### 反例：UDS 自己的危险命令 hook，拦下 0／26

`scripts/hooks/check-dangerous-cmd.mjs` 是 PreToolUse hook。检测到危险命令时它 `exit 1`。Claude Code 只有 `exit 2` 才拦下工具调用；其他非 0 退出码都是不阻断的 hook 错误，命令照样执行。它的测试导入匹配函数（`isDangerousCommand()`）直接调用，所以绿了好几个月。

重放 11,617 次真实 shell 调用（2026-10-27），规则 `rm -rf /` 命中 26 次，宿主拦下 **0** 次。26 次中有 25 次是无害的临时清理，例如 `rm -rf /tmp/x`；没有任何一次是真的要清空根目录。同一个规则还漏掉 `rm -fr /` 与 `rm -r -f /`。修正与入口测试在 PR #281 发布。

### 规则

**H1（MUST）**：能拦下工具调用、提示或回合的 hook，至少要有一个测试同时做到下列三件事：

1. **另起进程运行 hook**，用宿主配置文件里运行它的同一条命令。启动脚本算数；导入不算。
2. **在 stdin 送入宿主自己的数据**，字段名称用该宿主的（见下表：Claude Code 送 `tool_name`／`tool_input`，Antigravity 送 `toolCall`）。照作者想象的宿主格式做出来的数据什么也证明不了。
3. **断言宿主据以判断的信号**：确切的退出码，或宿主在标准输出解析的 JSON。“非 0”“有错误退出”“stderr 含某个词”都不算：exit 1 是非 0，却在 Claude Code 上什么也没拦。

导入并调用内部函数的测试可以存在，对判断层也有用，但**不计入** H1。

**H2（SHOULD）**：拦下的用例旁边，用同样方式跑一个放行的用例，并断言宿主的放行信号（例如 exit 0 且标准输出为空）。一个什么都拦的 hook 可以通过只测拦下的测试。

**H3（SHOULD）**：切断检查——把 hook 的拦下信号改掉（例如 `exit 2` 改成 `exit 1`），确认入口测试变红。保持绿色，说明那个测试没在守接线。

H1 也适用于“唯一作用是让宿主读到它的信号”的 hook，例如用 exit 2 把 stderr 送到模型面前的 PostToolUse hook。工具已经跑完、无法撤销，但错的退出码一样会让这个 hook 无声无息。

### 各宿主把什么当成“已拦下”

2026-10-28 取自各宿主自己的官方文档。宿主会改这些约定；采信某一格之前请重查出处。格子写“未查到”，是读过该页而页面没写，不等于“没有”。

| 宿主 | 事件 | 拦下 | 不拦下 | 出处 |
|---|---|---|---|---|
| Claude Code | PreToolUse | exit **2**（stderr 是理由）；或 exit 0 并在 stdout 输出 `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}` | 其他任何退出码，**包含 1**，都是不阻断的 hook 错误，动作照常进行；无效的 JSON 同理。文档写明的例外：配置了 `onFailure: "block"` 的 hook，失败时会拦下 | code.claude.com/docs/en/hooks：Exit code output、Exit code 2、Other exit codes、Decision control |
| Claude Code | UserPromptSubmit | exit **2**（提示不会送到模型）；或 exit 0 并在 stdout 输出 `{"decision":"block","reason":"..."}` | 其他任何退出码（同样有 `onFailure: "block"` 的例外） | 同页，Exit code 2 behavior per event |
| Claude Code | PostToolUse | 不能拦：工具已经执行。exit 2 只会把 stderr 显示给模型 | 就拦下而言，任何退出码都不行 | 同页，Exit code 2 behavior per event |
| Codex | PreToolUse | exit **2** 并把理由写到 stderr；或 stdout 输出 `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}`；旧式 `{"decision":"block","reason":"..."}` 也接受 | stdout 的纯文本会被忽略；`permissionDecision:"ask"`、`continue:false`、`stopReason`、`suppressOutput` 尚不支持，该次 hook 运行被标为失败而工具调用继续；其他非 0 退出码：未查到 | developers.openai.com/codex/hooks，PreToolUse |
| Codex | UserPromptSubmit | exit **2** 并把理由写到 stderr；或 stdout 输出 `{"decision":"block","reason":"..."}` | stdout 纯文本会被当成额外上下文；其他非 0 退出码：未查到 | 同页，UserPromptSubmit |
| Codex | PermissionRequest | stdout 输出 `{"hookSpecificOutput":{"decision":{"behavior":"deny","message":"..."}}}`；任一 `deny` 即胜出 | 此事件的 exit 2：未查到；stdout 纯文本会被忽略 | 同页，PermissionRequest |
| Gemini CLI（旧版） | BeforeTool | exit **2**（stderr 是送给 agent 的理由）；或 exit 0 并在 stdout 输出 `{"decision":"deny","reason":"..."}`（`"block"` 是别名）。文档把 JSON 形式列为优先路径 | 其他任何退出码只是警告，CLI 继续 | geminicli.com/docs/hooks/reference，Global hook mechanics 与 BeforeTool |
| Gemini CLI（旧版） | BeforeAgent、BeforeModel | exit **2** 中止该回合（BeforeAgent 还会把提示从上下文抹除；BeforeModel 跳过 LLM 调用）；或 `decision:"deny"` | 同上 | 同页 |
| Antigravity CLI（`agy`） | PreToolUse | exit 0 并在 stdout 输出 `{"decision":"deny","reason":"..."}`（“Hard blocks execution immediately”）。`decision` 字段必填，其他值为 `allow`、`auto_approve`、`ask`、`force_ask`、`deny_unless_prior_grant`。stdin 带的是 `toolCall.name` 与 `toolCall.args`，不是 Claude Code 的字段名 | 退出码语义：未查到（官方页面没写）。不要假设 Claude Code 的 exit 2 适用。第三方文章声称任何非 0 都视为拒绝；那不是官方说法，此处不采用 | antigravity.google/docs/hooks，Input and output contract，PreToolUse |
| Cursor 与其他宿主 | 任何 | 未查到（本版未调查） | 未查到 | 无 |

Stop 类事件（Claude Code 与 Codex 的 Stop、Gemini CLI 的 AfterAgent、Antigravity 的 Stop）**不在这里重复**。它们的拦下约定写在 [turn-completion-integrity](turn-completion-integrity.md) 的“支持的执行环境”表，那是唯一写下它们的地方。该表也记录了一个 Antigravity hook 失败后被静默放行的案例，与本节要防的接线失败是同一类。

### 重放验证的是接线，不是规则

把录下的真实调用重放给 hook（例如用 rules-to-guards）是检查接线的有力方法。但它有一个每次汇报结果时都必须讲明的限制：若同一份规则清单同时决定“该拦”与“不该拦”，重放只证明 hook 照它的规则运行，**不证明规则本身是对的**。

0／26 之所以量得出来，是因为宿主的约定（exit 2 才拦）是 hook 之外的事实。至于“哪些命令值得拦”，手上只有 hook 自己的匹配式：26 次命中都与它一致，真正的危险 0 次，而它没覆盖的 `rm -fr /` 永远不会在重放里显示为漏掉，因为答案来源与 hook 共用同一个盲点。

所以重放的结果只能报“接线正确”或“接线错误”，不要由它得出“规则正确”。要对规则下结论，请去读实际命中的命令，或另备一份不看 hook 匹配式写成的独立答案（见 [verification-oracle](../../../core/verification-oracle.md)）。

### UDS 的执行方式

UDS 在 CI 对自己发布的 hook 检查这条规则：`node scripts/check-hook-entry-tests.mjs`（npm 命令 `check:hook-entry-tests`），发布的、能拦下的 hook 若没有“启动它、送 stdin、断言宿主信号”的测试就判失败。它是静态文本分析：只证明“形状对的测试存在”，不证明 hook 退化时那个测试会变红——那是 H3 的工作。

---

## 空心测试检测

提交测试文件之前，请检查：

1. **Mock 数量 ≥ import 数量** → 评审：至少要有一个断言验证实际输出
2. **所有断言都是 `.toHaveBeenCalled()` 系列** → 加入输出值断言
3. **Mock 路径与被测对象目录相同** → 自我引用 mock；移除之
4. **Mock 设置行数多于断言行数** → 很可能是空心测试
5. **拦截型 hook 的测试只导入并调用它的函数** → 补一个启动 hook 并断言宿主信号的入口测试（见“拦截型 Hook”）

---

## 反模式

- **Total Mock Isolation**：所有 import 都被 mock；只断言 mock 交互
- **Mock the World**：外部 + 内部 + DB + FS 在同一个测试中全部 mock
- **Orphan Mock**：跨模块 mock 却没有对应的集成测试
- **Security Bypass Mock**：auth/权限逻辑被换成直接放行的 stub
- **Database Mock Cascade**：DB 返回硬编码的数据，隐藏真实查询错误
- **Matcher-Only Hook Test**：拦截型 hook 的测试只导入并调用其判断函数，从未按宿主的方式运行 hook。hook 什么也没拦，测试却是绿的（UDS 自己的 0／26）
- **Poll/Sleep for Background Result**：用 sleep 或 poll 等待 fire-and-forget 后台工作完成。race 依然存在——timeout 只是多数时候把它掩盖住，同时拖慢整个测试套件；在共享 runner 上还会把 flakiness 泄漏到其他 MR 的 CI 中。应改为注入 deterministic runner 并 await 被追踪的 task。

---

## 规则摘要

| 规则 | 触发条件 | 动作 |
|------|---------|------|
| 禁止 self-mock | 测试文件 mock 自己的模块 | 移除 mock；让真实代码运行 |
| IT/flow 用真实 DB | 编写 IT 或 flow 测试 | 使用 in-memory SQLite 或测试 schema |
| IT 对应测试 | mock 跨模块边界 | 确保有对应的 IT 存在 |
| 禁止 mock 安全机制 | 测试涉及 auth/权限 | 使用真实测试用户 + 真实 token |
| 空心评审 | Mock 数量 ≥ import 数量 | 加入输出值断言 |
| 后台工作禁止 poll/sleep | 测试断言某个 fire-and-forget 副作用 | 注入 deterministic runner；await 被追踪的 task |
| 拦截型 hook 要有宿主入口测试 | hook 能拦下工具调用、提示或回合 | 启动它、在 stdin 送宿主的数据、断言宿主据以判断的退出码或 stdout JSON |
| 重放只证明接线 | 汇报把真实调用重放给 hook 的结果 | 报“接线正确”；除非规则另以独立答案核对过，否则不报“规则正确” |

---

## 与其他标准的关系

- **testing**：Mock 边界规则适用于测试金字塔的所有测试级别
- **test-completeness-dimensions**：维度 8（AI 测试质量）引用了这些规则
- **flow-based-testing**：Flow 测试必须遵循 mock 边界规则
- **turn-completion-integrity**：Stop 类事件的拦下约定写在那里；工具与提示事件的写在本标准，两边都不重复对方
- **verification-oracle**：用来判断 hook 规则对不对的答案来源，不得由 hook 自己的匹配式推出

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-05-04 | 初始标准：空心测试问题、可／不可 Mock 表格、检测、反模式、规则摘要 |
| 1.1.0 | 2026-07-01 | 新增可注入的后台执行作为 seam（平行于 clock injection）：可 Mock 表格新增行、`可注入的后台执行` 章节、`Poll/Sleep for Background Result` 反模式，以及后台工作禁止 poll/sleep 规则（issue #143） |
| 1.3.0 | 2026-10-28 | 新增《拦截型 Hook：测宿主的入口，不是测匹配函数》：H1 MUST（启动 hook、送宿主的 stdin 数据、断言宿主据以判断的信号）、H2／H3 SHOULD、各宿主拦下信号对照表，以及“重放验证接线、不验证规则”的注记，并以 UDS 自己的 0／26 为反例。版本号与 `mock-boundary.ai.yaml` 对齐——该文件先前把“后台执行”那次新增记为 1.2.0，本文件记为 1.1.0 |
