---
source: ../../../core/verification-evidence.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-07-17
status: current
---

> **语言**: [English](../../../core/verification-evidence.md) | 简体中文

# 验证证据标准

**版本**: 1.2.0
**最后更新**: 2026-07-17
**适用范围**: 所有 AI 辅助开发工作流
**范围**: universal
**灵感来源**: [Superpowers](https://github.com/obra/superpowers) — verification-before-completion (MIT)

---

## 目的

建立"铁律"：无验证证据不可声称完成——并确保**证据本身站得住脚**。本标准防两种不同的失败：

1. **无证据就宣称成功**——代理断言它从未查过的事（Iron Law）。
2. **证据撑不起它的主张**——代理**确实查了**，而查询工具静默地没有运作（证据有效性，v1.2.0 新增）。

前者是幻觉的一种，**后者不是**——没有任何东西被捏造，是一个真实的命令产生了真实的输出，而那个输出的意思不是它看起来的意思。两者殊途同归：一个不成立的完成声明。

---

## 术语表

| 术语 | 定义 |
|------|------|
| 验证证据 | 验证命令执行及其结果的结构化记录 |
| 铁律 | 绝对规则：无证据 = 不可声称完成 |
| RED-GREEN 循环 | 通过显示测试修复前失败、修复后通过来证明 Bug 修复 |
| 退出码 (Exit Code) | 命令的数字返回值。**"`0 = 成功`"是工具的惯例，不是保证** —— 见"证据有效性" |
| 环境层次 (Environment Layer) | 该证据是从哪个环境收集而来（`local` / `uat` / `prd`） |
| 证据有效性 (Evidence Validity) | 证据*本身*是否可信 —— 即验证命令究竟有没有真的执行、有没有真的测到它声称测到的东西 |
| 工具静默失败 (Silent Tool Failure) | 验证命令根本没跑起来，或跑了但什么都没测到，却产生了与真实结果无从分辨的输出 |

---

## 铁律

> **无验证证据 = 不可声称完成。**

代理声称"已完成"不是证据。验证必须是可独立执行且产生可观察输出的。

### 非证据的声明

以下声明**不构成**验证证据：

| 声明 | 原因 |
|------|------|
| "已完成" | 无可观察的输出 |
| "应该可以了" | 未执行验证 |
| "我改了代码" | 修改 ≠ 验证 |
| "测试应该会通过" | 预测 ≠ 事实 |
| "命令返回 0。" | 仅在该命令有可能测到它所主张的事时才成立 —— 见"证据有效性" |

---

## 证据格式

每次验证必须产生结构化的证据记录：

```json
{
  "command": "pnpm test -- --filter core",
  "exit_code": 0,
  "output": "Tests: 47 passed, 0 failed\nDuration: 3.2s",
  "timestamp": "2026-03-20T14:30:00Z",
  "environment_layer": "local"
}
```

### 必需字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `command` | string | 是 | 实际执行的验证命令 |
| `exit_code` | number | 是 | 命令的退出码。**须依"证据有效性"解读 —— 此字段是一项主张，不是事实** |
| `output` | string | 是 | 命令输出（截断至 2000 字符，保留关键信息） |
| `timestamp` | string | 是 | ISO 8601 格式的执行时间 |
| `environment_layer` | string | 条件性 | 该证据来自哪一层（`local` / `uat` / `prd`）。**任何具外部服务依赖的 AC（短信、支付、IdP）均为必需**；未填写时，该 AC 的验证层级视同仅限于 local |

---

## 证据类型

| 类型 | 适用场景 | 示例 |
|------|----------|------|
| **测试结果** | 功能开发、Bug 修复 | `npm test` 输出 |
| **类型检查** | 静态类型的代码库 | `pnpm tsc --noEmit` 无错误 |
| **构建成功** | 编译、打包 | `npm run build` 的 exit code 0 |
| **Lint 通过** | 代码质量 | `npm run lint` 无错误 |
| **RED-GREEN** | Bug 修复 | 修复前失败 → 修复后通过 |
| **健康探测** | 已部署的服务 | `curl https://<service>/health` —— 须声明 `environment_layer`；对 `localhost` 的探测验到的是本机 process，不是那个部署 |
| **手动验证** | UI 变更、视觉效果 | 截图或屏幕录像 |

---

## 环境层次

> **铁律（环境）**：验收前，必须先确立*此环境层次究竟有能力验证此流程的哪些维度*。

环境无法演练到的维度，测试通过也证明不了什么。在 `local` 用 mock 的支付网关跑过，并没有验证支付集成 —— 验到的是那个 mock。因此证据必须声明它是在哪里收集的。

| 层次 | 含义 |
|------|------|
| `local` | 开发机或 CI；外部依赖通常为 mock 或 stub |
| `uat` | 使用真实（或 sandbox）外部服务的 staging 环境 |
| `prd` | 生产环境 |

对于依赖外部服务的 AC，仅有 `local` 证据**不足采信**：要么补上 `uat`/`prd` 证据，要么明确声明此缺口。见 VE-005 / VE-006。

> 该声明应写入项目的**环境分层责任矩阵**（`docs/testing/environment-stratification-matrix.md` 或测试计划）—— 这是由 `deployment-standards` 标准所定义的逐项目交付物，用以回答"哪些测试流程能在哪个环境中被完整验证？"。无法验证的组合应在该处标记 ⚠️/❌，而不是任由一次通过的 local 执行把它们含混带过。

---

## RED-GREEN 循环

对 Bug 修复与回归测试，验证必须同时展示"失败"与"修好"：

### 步骤 1：RED —— 证明 Bug 存在

在修复**之前**执行测试，确认它会失败：

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 1,
  "output": "FAIL: expected null to equal { name: 'test' }",
  "timestamp": "2026-03-20T14:25:00Z"
}
```

### 步骤 2：应用修复

进行代码变更。

### 步骤 3：GREEN —— 证明修复有效

在修复**之后**执行测试，确认它会通过：

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 0,
  "output": "PASS: 12 tests passed",
  "timestamp": "2026-03-20T14:28:00Z"
}
```

### 步骤 4：两者都记录

证据记录必须同时包含 RED 与 GREEN 两个阶段。

---

## 证据有效性

> **证据本身会骗人。要验的不只是主张，还有证据本身。**

铁律拦下的是"**没有**证据就声称成功"。它拦不住反向的失败：代理**确实**跑了验证，命令**确实**返回了，`exit_code`**确实**是 `0` —— **而输出毫无意义**，因为那道命令根本没测到任何东西。

这不是幻觉。幻觉是虚构你没查过的事。这是反过来：**你查了，而那个查询工具骗了你。** `anti-hallucination` 标准覆盖不到这一块 —— 该标准的每一条禁令都是某种形式的"不要编造"，而这里没有任何东西被编造。

### 四条有效性规则

**1. 只有在"成功时返回 0"的工具上，`exit_code = 0` 才代表成功。**

这个惯例近乎普世，正因如此才无人质疑。当一个工具在受测情境下**按设计**就是会失败时，它的非零退出码并不携带任何关于受测对象的信息 —— 该读的是*输出*。反向亦然：非零退出码并不足以确立受测对象是坏的。

**2."输出为空"/"未找到"/`0` 不等于"它不存在"。**

在断定"不存在"之前，先确立查询工具*成功执行过*：它不是 `command not found`，不是被拒绝权限，它的参数也没有被中间的 shell 吃掉。**先验证查询工具能用，再去相信查询结果的沉默。**

**3. 用来检测存在与否的命令，不得丢弃 stderr。**

抑制 stderr（`2>/dev/null` 及其等价写法）消音掉的，恰好就是那个本来会报告"这个工具坏了"的通道。失败于是穿上了与真阴性一模一样的外衣。

**4. pipeline 的退出码不属于其中任何单一阶段。**

在 `set -o pipefail` 下，`producer | grep -q pattern` 会继承 `producer` 的非零值，与 `grep` 有没有匹配到无关。当决策取决于内容时，**先捕获输出，再评估它** —— 不要让一个 pipeline 把两个问题压缩成一个数字。

### 此失效模式的实例证据

以下是某 AI 代理于 2026-07-17 实际执行的验证命令，每一道都导出了自信而错误的结论，并被当成事实报告出去：

| 验证命令 | `exit_code` | 输出 | 实际真相 |
|---|:---:|---|---|
| `sudo -n find /backup/immich -type f 2>/dev/null \| wc -l` | **0** | `0` | `sudo` 因无 tty 而失败，`2>/dev/null` 吃掉了错误信息，空输入让 `wc -l` 打印出 `0`。**实际存在 31 个文件。** 被报告为"备份是空的" |
| `gpg --list-packets <valid-file.gpg>` | **≠ 0** | 格式良好的 packet 列表 | 该主机**按设计**就不持有私钥；gpg 在此情境必定以非零退出。**该文件是有效的。** 据此删掉了一份完好的加密备份 |
| `gpg … \| grep -q "tag=1"`（在 `pipefail` 下） | **≠ 0** | grep *确实*匹配到了 | pipeline 继承了 gpg 的非零值；匹配与否根本无关。**第二次删掉了一份完好的备份** |
| 以双引号包住、通过 SSH 执行的 `grep -c "${VAR}/path" file` | **0** | `0` | `${VAR}` 被*本地* shell 展开成空字符串；远端的 grep 搜的是错的文本 |
| `gpg --import key.asc 2>/dev/null` | — | （空） | gpg **根本没安装**；`command not found` 进了被抑制的 stderr |
| `until ! ssh host 'systemctl is-active svc'; do …` | — | 循环退出 | **SSH 连接失败与服务已结束，产生的退出码一模一样。** 事后读到的"结果"是前一次执行留下的过期值 |
| 以非特权用户执行 `du -sh /data/*` | **0** | `4.0K` | 读不到的目录被报告成几近空目录，而非报告为错误 |
| 以 `case "$tag" in *M*)` 搜索 monthly 快照 | **0** | （无匹配） | 该 tag 的实际值是 `monthly` —— 没有大写 `M`。差点变成"没有任何 monthly 快照" |

**其中四笔 `exit_code = 0` 却是错的；两笔 `exit_code ≠ 0` 却是对的。** 此字段在两个方向上都不可靠 —— 而在那两笔非零的案例中，遵循 VE-002（"标记验证失败、触发修复循环"）摧毁了一份健康的产物。

> **来源说明（Provenance）**：所有实例均出自单一代理（Claude Opus 4.8）单日的工作，记录于 AsiaOstrich XSPEC-340。此样本密集但狭窄。它是作为证据而非证明提出的 —— 但请注意，上述每一项失败都源自*工具本身的语义*（sudo、gpg、pipefail、POSIX 退出码），而非任何模型特性，因此任何驱动同一批工具的代理都暴露在同样的陷阱下。

---

## 信任规则

| 规则 | 说明 |
|------|------|
| 代理说"完成"但没有 `verification_evidence` | 标记为**未验证** |
| 有 `verification_evidence` 但 `exit_code ≠ 0` | 标记为**验证失败** —— **除非**已知该工具在受测状态下本就会以非零退出（证据有效性规则 1），此时改以输出判定 |
| `exit_code = 0`，但该命令不可能测到它所声称的事 | 标记为**未验证** —— 一道在错的地方执行、或根本没执行的通过命令，不是证据 |
| 证据主张"不存在"（`0`、空输出、"未找到"） | 在证明查询工具成功执行过之前，标记为**未验证** |
| 多个验证步骤 | **全部**步骤都必须通过 |
| 代理提供的是错误命令的证据 | 标记为**未验证** |

---

## 规则

| ID | 触发条件 | 动作 | 优先级 |
|----|----------|------|--------|
| VE-001 | 代理报告成功但无 verification_evidence | 降级为 `done_with_concerns` | Critical |
| VE-002 | 证据中 `exit_code ≠ 0` | 标记验证失败、触发修复循环 —— 须**先**确认该工具在此状态下成功时会返回 0（见 VE-007） | High |
| VE-003 | Bug 修复缺少 RED-GREEN 循环 | 要求补上 RED 与 GREEN 两份证据 | High |
| VE-004 | 输出超过 2000 字符 | 截断，但保留错误信息与摘要行 | Medium |
| VE-005 | AC 具外部服务依赖（短信、支付、IdP） | 证据必须声明 `environment_layer`；仅有 local 证据不足采信 | Required |
| VE-006 | 具外部依赖的 AC 被标为完成，却无 `environment_layer` | 降级为 `done_with_concerns`；要求补上层次声明，或在 environment-stratification-matrix 中补上 ⚠️/❌ 条目 | High |
| VE-007 | 验证工具在受测状态下**按设计**就会以非零退出 | VE-002 不适用。改以输出内容判定；**不得对健康的产物触发修复循环** | Critical |
| VE-008 | 证据主张"不存在"（`0`、空输出、"未找到"） | 在证明查询工具成功执行过之前一律无效。以不抑制 stderr 的方式重跑 | High |
| VE-009 | 存在性／不存在性检查抑制了 stderr（`2>/dev/null` 或等价写法） | 证据不成立。以 stderr 可见的方式重跑 | High |
| VE-010 | 证据的 `exit_code` 来自 pipeline（尤其是在 `pipefail` 下） | 该退出码不归属于任何单一阶段。改为捕获输出并评估内容 | Medium |

---

## 输出截断指引

当验证输出超过 2000 字符时：

1. **保留**：错误信息、失败摘要、测试计数、最终状态行
2. **移除**：冗长的进度输出、通过测试的 stack trace、重复行
3. **标记截断**：在被移除内容处加上 `[... truncated ...]`

---

## 示例

### 良好：完整的证据

```yaml
verification_evidence:
  - command: "pnpm test"
    exit_code: 0
    output: "Test Suites: 12 passed\nTests: 147 passed\nTime: 8.3s"
    timestamp: "2026-03-20T14:30:00Z"
  - command: "pnpm lint"
    exit_code: 0
    output: "No issues found"
    timestamp: "2026-03-20T14:30:05Z"
```

### 不良：没有证据

```yaml
status: success
message: "I've completed the task and everything should work now."
# ❌ 没有 verification_evidence —— 违反铁律
```

### 不良：撑不起自身主张的证据

```yaml
claim: "The backup directory is empty — backups are not running."
verification_evidence:
  - command: "sudo -n find /backup/immich -type f 2>/dev/null | wc -l"
    exit_code: 0
    output: "0"
    timestamp: "2026-07-17T13:05:00Z"
# ❌ 通过了铁律：证据存在、exit_code 是 0、输出很具体。
# ❌ 违反 VE-008、VE-009、VE-010：
#      - 主张"不存在"却未证明查询工具跑过（VE-008）
#      - 抑制掉了那句"sudo: a terminal is required"的 stderr（VE-009）
#      - 这个退出码是 pipeline 的，也就是 `wc -l` 的 —— `find` 根本没跑（VE-010）
#    实际存在 31 个文件。目录被列为空的，是因为根本没人去看。
```

### 良好：同一道检查，改为有效版本

```yaml
claim: "The backup directory holds 31 files."
verification_evidence:
  - command: "ssh host 'sudo find /backup/immich -type f | wc -l'"   # stderr not suppressed
    exit_code: 0
    output: "31"
    timestamp: "2026-07-17T13:07:00Z"
    environment_layer: "prd"
# ✅ stderr 会浮现 sudo／权限失败，而不是打印出 0
# ✅ 使用单引号，${...} 不会在传输前被本地 shell 展开
```

---

## 相关标准

- [反幻觉标准](anti-hallucination.md) —— 互补标准。它防的是*捏造*的主张（断言从未查证过的事）；证据有效性覆盖的是反向的失败 —— **确实**查证过、但查证工具静默失效的主张。
- [系统化调试](systematic-debugging.md) —— 当证据显示确实有失败时，如何往下调查
- [提交规范](checkin-standards.md) —— 完成声明在此受闸门把关
- [测试治理](test-governance.md) —— 规定哪些测试必须存在，因而也就规定了哪些证据必须存在
- [测试标准](testing-standards.md) —— 产生多数证据的那些测试是怎么写的
- [代理派遣与并行协调](agent-dispatch.md) —— 委派出去的工作会返回主张，那些主张需要套用本标准
- [部署标准](deployment-standards.md) —— 定义 VE-005 / VE-006 所引用的"环境分层责任矩阵"

---

## 参考资料

- **Superpowers**: [verification-before-completion](https://github.com/obra/superpowers) (MIT)
- **测试驱动开发**: RED-GREEN-REFACTOR 循环

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
