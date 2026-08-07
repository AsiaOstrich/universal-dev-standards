---
source: ../../CHANGELOG.md
source_version: 6.3.3
translation_version: 6.3.3
last_synced: 2026-08-07
status: current
---

# 变更日志

> **语言**: [English](../../CHANGELOG.md) | [繁体中文](../zh-TW/CHANGELOG.md) | 简体中文

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，
并遵循[语义化版本](https://semver.org/)。

## [Unreleased]

## [6.3.3] - 2026-08-07

### Fixed

- **6.3.2 改好了说明，却把说明刚刚撤回的那个主张留在它上方的标题里。** 漂移区段的标题是 `N shipped ≠ tested`——黄色，就在那段说明「出货的与测到的是否不同，取决于项目怎么出货」的 dim 文字上一行。对随产物出货 lockfile 的产物而言，出货的**就是**测到的，因此那个标题在整份报告最醒目的位置说了与事实相反的话。这正是 1.1.0 改写 Lock Strategy 条目所要根除的形状：一句误导的话，下面附一句限定。标题现在改为指出两个不一致的字段——`N tested ≠ resolves`——这是对测量结果的陈述，不是对「谁收到了它」的结论。已加测试钉住。
- **另有两处在说同一件事，其中一处是采用者最先读到的。** `uds deps --help` 把这个命令描述为「Compare what you test against what your users install (published packages ship no lockfile)」，模块自身的摘要行则写「does what you test match what your users install?」。两者现在都改以「声明范围会解析到什么」表述。发现方式是修完标题后对整个 repo grep 已撤回的措辞——那是我自己那一轮修正漏掉的两处。

## [6.3.2] - 2026-08-06

### 修复

- **`uds deps` 断言了一个它无从得知的出货渠道。** 报告结尾写着「consumers resolve the range themselves, because a published package does not ship a lockfile」，第三列标为 `users get=`。对一个以 `npm ci` 构建、出货 Docker image 的产品，这两句都是错的——它的用户拿到的正是 `tested=` 那一列，而解析出的那一列实际代表的是「下一次 lockfile 重新生成时会被无人审阅地拉进来的东西」。发现方式是拿这个命令去跑一个出货 Docker image、根本没发到 npm 的闭源产品。列名改为 `resolves=`，报告同时陈述两种读法——因为单独读一行时，它不能说出与事实相反的话。这与 1.1.0 对 Lock Strategy 条目所做的修正是同一件事：在一句误导的话下面补「但是……」，那句话仍然误导，而报告和标准表格一样，多半是一次读一行。现在有三个测试把措辞钉住，此前一个都没有。

## [6.3.1] - 2026-08-06

### 修复

- **6.3.0 从来没有到达 npm——而这一版的存在，正是因为它自己描述的那个失效。** 发版流程有跑，它的 clean-room job 在 `npm ci` 这一步失败，错误是 `EUSAGE … Missing: @emnapi/core@1.11.3 from lock file`，`Publish to npm` 被跳过。lock 文件是被 `npm install --save semver` 重新生成的，过程中掉了 `npm ci` 需要的传递依赖项；我在本机跑的检查接受了它，所以这个不一致要到发版 job 才显形——那时 tag 与 GitHub Release 都已经公开。改以最后一份 `npm ci` 确实能通过的 lock 文件为基础重建，只加进 semver 那一笔，并在整个 CI 矩阵上验证，而不是只在一台机器上。
- **`v6.3.0` 保留不删，其 release 说明已改为注明它从未发布。** 一个没有 npm 对应版本的 tag，正是 `uds deps` 被写出来要抓的那种不一致；删掉它移除的是证据，不是落差。**6.3.1 完整包含 6.3.0 的全部内容**，见下方。

## [6.3.0] - 2026-08-04

### 新增

- **`uds deps`——你测的东西，跟你用户装的是同一个吗？** 发布出去的软件包不带 lockfile：你的 CI 測的是 `package-lock.json` 鎖定的版本，你的用户拿到的是声明范围在他们安装当下解析出的版本。两者不同时，整套测试会对着一个没有人会安装的组合亮绿灯，而那个绿灯与真绿灯无从分辨。此命令逐一比对每个 runtime 依赖的三个数字，**只报告差异**并附上分母——一份大多一致的表格会被略过，而其中真正有问题的那几行也跟着被略过。
  - **原生依赖适用更严格的规则。** 带原生绑定的软件包只要以范围声明就会被标出，**不论它今天是否正在漂移**。semver 对原生 ABI 兼容性没有任何承诺，而这在本生态已被在 minor 范围内打破过。一个只对应到单一已发布版本的范围，安全是因为上游还没再发布，不是因为有任何保障——等漂移，等于等到用户已经拿到为止。
  - **查询失败绝不记为一致。** 它会成为 `unverifiable` 并使整次检查失败。一个「没问题」与「我查不到」长得一样的检查，会把未知转成安心。
  - `--path`、`--json`、`--concurrency`。

### 变更

- **`supply-chain-security-standards` 1.0.0 → 1.1.0——Lock Strategy 条目是对的，但不完整。** 它写「使用 lock 文件，一律进版本控制」，读起来是完整的，因此照着做的人没有任何理由再往下查——而一份提交的 lock 文件约束的是**你自己的**构建，碰不到你任何一个用户。回头改写正文而非加但书，因为在一条未变动的规则下方补「但请注意……」，会让原文那一行继续误导只读那一行的人，而标准表格多半就是一行一行读的。新章节以产生它的那个案例陈述失效、对会发布软件包的项目给出四项要求，并明确限定于发布出去的产物——部署的服务会连同 lock 文件一起发布，不受影响。

### 备注

- 该标准的 `.ai.yaml` 仍是五行的壳、没有任何机器可读规则——**141 份中的四份之一**，另含 `design-document-standards`、`estimation-standards` 与 `privacy-standards`，因此读 `ai/` 层的 agent 对这四份得到的都是空的。本次发版刻意没有把新增的那一条规则加进去：一条规则躺在一个原本全空的文件里，会让覆盖率看起来比实际好。该缺口现已记在文件内部。

## [6.2.8] - 2026-07-31

### 修复

- **下载回来的标准，中文是坏的。** HTTPS 响应以 `data += chunk` 累积，而那会对每一个分块各自解码——于是任何字节跨在分块边界上的字符都变成替换字符（`日期` → `日�期`）。单字节的拉丁文不受影响；三字节的中日韩文字受影响。**过程中没有任何一步失败**：传输完成、文件写入、动作报告成功，损坏只有读文字才看得见。在一台机器上实测，**11 个项目的已安装标准里共约 278 个替换字符**。损害集中在 `requirement-checklist.md`、`requirement-template.md`、`requirement-document-template.md` 与 locale 包——也就是发布包不出货的那些文件（`files` 不含 `templates/` 与 `extensions/`），它们只可能靠下载取得。**若你的标准里有 `�`，请在 6.2.8 以上跑 `uds update --force`——重新下载的内容是正确的，会覆盖掉它们。**

## [6.2.7] - 2026-07-31

### 修复

- **reconciler 在任何 npm 安装下都取不到 extension。** `manifest.extensions` 的条目（locale 包之类）抵达 executor 时没有已解析的来源路径，因为发布包的 `files` 清单不含 `extensions/` 目录——于是 `uds update --force` 对它们报告 `No source path available`，而 `uds update` 却更新了同一个文件。executor 现在改以 `copyStandard` 解析 extension，那是它处理 registry entry 时本来就在用的 bundled → repo → download fallback，也正是 legacy 路径一直在用的那一条。完全没有任何来源的条目仍然会失败，本来就该如此。

## [6.2.6] - 2026-07-31

### 新增

- **`uds update --apply`** —— 应用 `uds update --plan` 打印出的那个计划，一字不差。

### 修复

- **`--plan` 叫你去跑一个会忽略计划的命令。** 它打印出「Run `uds update` to apply these changes」，但 `uds update` 根本到不了 reconciler——它走 legacy 路径、更新既有标准，然后为**那件事**报告成功。某次升级它打印出 `✓ 已更新 69 个标准文件`，而上方计划里的 8 个删除、2 个新增一个都没做，那些文件事后仍在磁盘上。**没有任何一步失败**，所以输出与「已应用计划」无从分辨。`--force` 也不是答案：它以 `force: true` 重算，那是一个会重写每个受管文件的更大计划。**如果你过去读完计划后都是跑 `uds update`，那些删除与新增从未被应用**——请重跑 `uds update --plan` 看还有什么未处理。

## [6.2.5] - 2026-07-31

### 修复

- **`uds update` 的备份目录可能被提交进你的 repo。** `.uds-backup-<时间戳>/` 会写在项目旁供回滚，而没有任何规则忽略它——于是一次 `git add -A` 就把它扫了进去。这在我们自己的 repo 发生过两次，其中一次把 360 个文件、73,992 行带进了公开 repo。备份现在会忽略自己：创建时就在目录内写一个内容为 `*` 的 `.gitignore`，`git status` 与 `git add -A` 不再看得到它，而**你的** `.gitignore` 不会被修改。旧版本产生的既有备份不会被追溯隐藏——请自行删除或补上规则。

## [6.2.4] - 2026-07-31

### 修复

- **`uds update` 会提议删掉你自己写的技能。** 来源判定只要 `manifest.skillHashes` 记录了某个技能底下的任一文件，就把它当成 UDS 自己的资产。那个判准之所以安全，只因为 hasher 是坏的——它为 78 个已安装技能只留下 2 笔记录。6.2.2 修好 hasher 之后，同一份 map 被填满技能文件夹底下全部 137 个文件，包括手写的那些；它们于是落在「以 UDS 出货内容构建的期望状态」之外，被判为应删除的孤儿。某个项目的计划提议删掉 18 个目录，其中 14 个是它自己的运维技能。来源判定现在只保留一个信号：名称存在于 UDS 自己的 `skills/` 树下。UDS 已下架的技能改为发警告而非删除——磁盘上没有任何东西能把它们和你自己的作品区分开，而**留下一个带警告的陈旧目录，比删掉别人手写的文件，是比较好的失败方式**。**若你正在使用 6.2.2 或 6.2.3，且自己的技能与 UDS 的并存，应用任何变更前请先跑 `uds update --plan`。**

## [6.2.3] - 2026-07-31

### 修复

- **重新选取已安装的 agent 会追加一笔重复的 manifest 记录。** 四个 manifest 写入端以 `[...existing, ...new]` 追加安装记录，于是一个已被记录的 agent 每次被重新选取就多一笔；某个项目的 manifest 读起来是 `['claude-code', 'claude-code']`。安装器本身从未受影响——`installSkillsToMultipleAgents` 会对输入去重。损害仅限于**记录**，以及每一个会迭代它的消费端：`checkNewFeatures`、reconciler 的扫描器与期望状态计算器都把那个 agent 走了两遍。效果无害——**这正是它跨越五次升级都没被注意到的原因**。四个写入端现在改用安装器早就在用的那个 helper。

## [6.2.2] - 2026-07-31

### 修复

- **`uds check` 的技能完整性只检查了你文件中的一小部分。** 某个项目上它打印出 `✓ All skill files intact (6 files)`，而实际安装了 **345** 个。`scanDirectory` 以 `fullPath.slice(basePath.length + 1)` 推导相对路径，这假设了 base path 不带尾部分隔符——而三个 agent 的技能路径带（`.claude/skills/`、`.opencode/skill/`、`.cursor/skills/`）。于是每个条目都被砍掉第一个字符（`ac-coverage` → `c-coverage`、`.manifest.json` → `manifest.json`）；`computeDirectoryHashes` 用这个坏掉的名字重组绝对路径、找不到文件、跳过该条目。**扫了 115 个文件，只算出 2 个哈希。** 过程中没有任何一步失败——目录存在、循环跑完、函数返回对象，而检查在 2% 的表面上打了绿勾。`manifest.skillHashes` 现在会被正确填入；同一个项目报告 345。


## [6.2.1] - 2026-07-31

### 修复

- **`uds update --locale <x> --skills` 现在会记录它安装的是哪个语言。** `manifest.skills.locale` 只有 `init` 会写，其他路径一律不写——与 6.2.0 刚决定不再信任的 `skills.names` 是同一种「设计上就会过期」的形状。把项目的技能切换到本地化变体时，磁盘上每个文件都被换掉，而这个字段动也没动。**这个字段在 6.2.0 之后变成承重的**：该版的 locale 修复会优先读 `skills.locale`、读不到才回退到 `display_language`。当两者不一致时——例如显示语言是英文、技能却是以 `--locale zh-tw` 安装的项目——下一次 reconcile 会无声地把它们全部换回英文。**正是 6.2.0 修掉的那个缺陷，从另一扇门走回来。** 五个技能安装路径现在都会记录实际安装的语言。


## [6.2.0] - 2026-07-31

> **Reconciler 一直在删除不是它安装的东西，事后还回报成功。** `uds update --plan` 在某个采用 repo 提议移除 86 个文件，其中 72 个是 UDS 有发布、项目也正在用的技能、命令与选项文件。十二个缺陷，形状完全相同：一个格式完好、却永远对不上的名字——所以什么都不会报错，而计划看起来很权威。**如果你曾看着 `--plan` 的输出、纳闷它为什么要删掉你的东西——那不是你的问题。**

### 新增

- **`CLAUDE.md` / `AGENTS.md` 的标准索引改为陈述数量并指向 manifest**，不再逐条列出标准名称（XSPEC-358 R1）。原本的列举每个项目约占 2 KB 的常驻 context，且与 `.standards/manifest.json` 重复——后者才是权威来源且永远不会过期。区块会在下次 `uds update` 时自行重建，你不需要做任何事。**若你有工具在解析那份列举，请改读 `manifest.standards`。**

### 修复

- **Reconciler 不再删除你自己写的技能。** `isUDSManaged` 对技能目录下的每一个子目录都返回 true，于是任何不是当前 UDS 版本发布的东西都被提议移除。某个采用端的计划列出了十四个手写的 ops 技能要删。现在改由 UDS 自己的 `skills/` 树判定来源——这同时涵盖旧版 CLI 误复制进来的非技能同级目录（`_shared`、`agents`、`ai`、`tools`、`workflows`），所以它们仍可被清理——或由已记录的哈希判定。其余一律发警告而非移除。**刻意付出的代价**：四个 UDS 此后已下架的技能改为只警告不删除，因为磁盘上没有任何东西能把它们和你自己的作品区分开。
- **`manifest.skills.names` 与 `commands.names` 不再被当成期望状态。** 两者都只有 `init` 会写，其他代码路径一律不写。某个 repo 的清单跨越 9 个 commit、5 次 UDS 升级一直冻结在 32 个技能，而发布集合已增长到 55——于是 40 个可用的技能被判为「no longer in desired state」。期望集合现在改为「运行中的 UDS 版本发布什么」，那本来就是 `uds update` 实际安装的东西。全部 18 个安装点也改为同步维护这两份清单。
- **Gemini CLI 的命令不再被提议删除。** 扫描器写死剥除 `.md`，而 Gemini 的命令是 `.toml`，键值停在 `commit.toml`，永远对不上期望键 `commit`——30 个全被判为孤儿。扩展名现在由 agent 配置提供，与写出这些文件的安装器共用同一份。
- **UDS 不再提议删除它自己的安装记录。** 命令安装器写出的 `.manifest.json` 被当成了散落的命令。
- **已选取的选项不再被提议删除。** `calculateOptions` 把 `manifest.options` 的键当成标准 id 迭代，找不到叫 `workflow` 的标准就跳过——于是每个项目的期望选项集合都是空的。某个 repo 的计划提议删掉它自己 manifest 指名的全部七个选项。manifest 键到注册表类别的映射现在放在单一份表，安装器与计算器共用。
- **语言包与其他 extensions 不再被提议删除。** `manifest.extensions` 在 reconciler 里根本没有分支，于是每个已安装的 extension——语言包、语言风格指南、框架模式——都落在期望状态之外，而 manifest 仍列着它、说它已安装。
- **Reconcile 不再把所有技能重装成英文。** 技能安装路径漏掉了命令路径有传的 locale 参数，于是本地化技能被无声换成英文 canonical 版，而 `skills.locale` 全程仍记着原本的语言。
- **成功的 reconcile 现在会记下它 reconcile 到哪个版本。** `upstream.version` 从不更新，于是 `uds check` 仍报告项目落后，任何读取该字段的落后监测也会一直标记它。
- **重写过的集成区块不再把自己报告为「已修改」。** `migrate_block` 刷新了 `integrationBlockHashes`，却没刷新 `fileHashes`——而后者才是文件完整性比对的对象。
- **Reconciler 与 `uds update` 现在生成相同的集成区块。** 两个独立的构建者早已漂移：reconciler 那份完全没有内容类别，于是 reconcile 一个项目会无声删掉它的提交信息段落；它也把输出语言一律默认为英文（无视 `options.output_language`），并以工具键查 `integrationConfigs`，而 manifest 是以文件名为键。
- **索引区块的选项数量计算正确了。** 原本从 `manifest.standards` 数，而该字段记录选项的方式并不一致——某个 repo 明明装了七个选项，区块却写着「options 0」。
- **`uds check` 不再对新的索引区块报告假的「未同步」。** 有两处检查仍以已废止的列举为契约、逐一 grep 标准名，于是升级后报告 `5/70` 与 `0/7`，并建议运行 `uds update`——而那会重新生成同一个区块。两处现在改为核对声明数量与 manifest 是否一致，这反而抓得到「数量过期」，那是名称 grep 永远抓不到的。
- **`manifest.integrations` 两种形状都能正确读取。** 它被一条路径写成工具键、被另一条写成文件路径；实测 21 个 repo 中有 20 个存的是文件路径，而 reconciler 只懂工具键——于是它在这 20 个 repo 全都提议剥掉 `CLAUDE.md` / `AGENTS.md` 的 UDS 区块。
- **`uds update --plan --integrations-only` 不再写文件。** `--integrations-only` 的分支排在 `--plan` 检查之前。
- **`uds init` 不再把 husky 装进 UDS source repo**（从 repo root 运行测试套件时）。

### 变更

- **发布闸门重新开始测量。** `pre-release-check.sh` 直接调用 `tsx`，于是在 PATH 上没有 tsx 的 shell 中，三项检查会因为找不到可执行文件而报告「✗ Failed」——与真正查出问题无从分辨；现在它会先解析 `tsx`，找不到就直接中止。另外它的 dogfooding 闸门运行 `uds check` 时没带 `--force`，而 DEC-044 的自我采用守卫会在本 repo 内拒绝该命令——**这个闸门自 5.15.1 加入以来，每一次发布都是红的。**

## [6.1.1] - 2026-07-18

> **`uds check` 悄悄量错了东西。** 它的落后检查拿你的标准去比 CLI 自己 bundled 的副本、而非 npm——CLI 一旧就吐出倒退、无意义的消息，且结构上永远说不出「你的标准过期了」——还把那条消息埋在逐文件一行的「未变更」底下。

### Fixed

- **`uds check` 现在拿你安装的标准比对 npm 上的最新版，而非 CLI 自己 bundled 的副本**（XSPEC-342）。`displayAdoptionStatus` 原本拿 `manifest.upstream.version` 去比**运行这支 CLI 内置的**标准副本。CLI 一旧，那副本就比 npm 旧——于是检查打印出倒退的 `⚠ 有可用更新：6.1.0 → 5.12.1`（叫你「更新」到*更旧*的版本），且结构上永远无法报告你的标准落后。现在改问 npm 最新版；当你的标准落后时，消息改为 **「你安装的标准落后最新版」**，并给出完整两步修复——`npm update -g universal-dev-standards` **然后** `uds update`——因为只更新 CLI 不会动到你项目的 `.standards/`。`--offline` 静默跳过比对，不再退回误导的 bundled 检查。

### Changed

- **`uds check` 不再逐文件列出未变更的文件**（XSPEC-342）。它原本对每个跟踪文件打印一行 `✓ …（未变更）`——约占命令输出的 70%（实测 121 → 41 行）——淹没了真正该读的消息，也让输出大到被自动化调用端（pre-commit agent）截断。逐文件「未变更」打印已移除；计数仍保留在一行的完整性摘要，已修改／缺失／未哈希的文件仍逐一列出。

## [6.1.0] - 2026-07-17

> **同一种形状的两个失败，一个在标准里、一个在 CLI 里**：一道检查跑了、返回了、报告成功，却什么都没测到。`verification-evidence` 补上了为它命名的那一层；`uds init` 则不再是它的一个实例。

### 修复

- **`uds init` 不再覆盖既有的 `prepare` script**（XSPEC-341）。自 2026-02-04 起，`uds init` 会对任何没有 `.husky/` 目录的 Node 项目执行 `npx husky init`。该命令是为**全新**项目设计的一次性 bootstrap：它会无条件把 `"prepare"` 设成 `"husky"`。若你的项目原本就有 `prepare`——而对一个要发布的包而言，`prepare` 通常就是 build 步骤——**它会被静默取代**，而 CLI 报告成功。`uds init` 现在改为串接而非覆写（`"tsup"` → `"tsup && husky"`），会打印出它所修改的每一个 `package.json` 字段，也不再丢弃 husky 的 stderr。

  > **⚠️ 若你曾在原本就有 `prepare` script 的项目上跑过 `uds init`，请立即检查。** 这次修复保护的是往后的执行；它无法还原一个已经被改写的 `package.json`。症状是：你预期看到自己的 build 命令，实际看到的却是 `"prepare": "husky"`——而如果你的包会发布构建产物（`files: ["dist"]`、`main` 指向 `dist/`）且没有 `prepack`／`prepublishOnly`，那么你下一次 `npm publish` 送出去的将是一个未构建或过期的目录。请以串接方式恢复：`"prepare": "<你原本的命令> && husky"`。

- **`uds init` 不再把 `npm test` 塞进 `.husky/pre-commit`**（XSPEC-341）。那一行来自 husky 的 init 模板，不是来自 UDS——它等于在每一次 commit 上架了一道采用者从未选择加入的完整测试套件闸门。UDS 现在只追加自己的 `npx uds check`，而且是追加到既有 hook 之后，而不是改写它们。

- **新建的 husky hook 改以 v9 格式写入**（XSPEC-341）。fallback 的 hook 模板仍在输出 v8 的 `#!/usr/bin/env sh` + `. "$(dirname -- "$0")/_/husky.sh"` 前导段，该写法在 husky v9 已弃用、v10 已移除——而 `uds init` 安装的正是 husky `^9`。这原本是潜伏问题（过去 hook 是由 husky init 写出的）；移除 `husky init` 后，fallback 升为主要路径，因此一并修复。

### 变更

- **`verification-evidence` 1.1.0 → 1.2.0 —— 证据有效性**（XSPEC-340）。本标准原本把 `exit_code` 当成事实真相：`trust_rules` 写着"`exit_code ≠ 0` → 验证失败"、`physical_spec.checks` 问的是"`exit_code` 是否为 0（成功）？"、VE-002 只要非零就触发修复循环。**这三处现已全数加上限定条件**，因为一道验证命令可以跑完、可以返回，却什么意义都没有：
  - **新增 `evidence_validity` 层次与规则 VE-007 – VE-010**：只有在"成功时返回 0"的工具上，`exit_code = 0` 才代表成功（VE-007）；在证明查询工具确实执行过之前，"空／未找到／0"不等于不存在（VE-008）；存在性检查不得丢弃 stderr（VE-009）；pipeline 的退出码不属于其中任何单一阶段（VE-010）。
  - **新增 `non_evidence_claims`**："已完成"／"应该可以了"／"我改了代码"／"测试应该会通过"／"命令返回 0"。
  - 有别于 `anti-hallucination`——后者的禁令全都是"不要断言你没查过的事"的变形。这里是相反的失败：**确实查了，而查询工具静默地没有运作**。`core/verification-evidence.md` 收录了八笔真实案例作为证据。
- **`verification-evidence` 的人类文档补上了 v1.1.0 的落差。** v1.1.0 的 `environment_layer` 工作（XSPEC-204）已落地于全部三份 `.ai.yaml`，却**一份 `.md` 都没有更新**（共四份）——人类文档自 2026-05-13 起就一直在错误地描述这个标准。`core/*.md` 现已载明 `environment_layer`、Environment Layers 章节，以及 VE-005 / VE-006。
- **`verification-evidence` 新增三个先前只存在于 zh-TW 译文的章节**：非证据的声明（Non-Evidence Claims）、证据类型（Evidence Types）、相关标准（Related Standards）。译文比它的来源更完整；这些章节现已上溯至英文来源，并同时存在于两个语系。

## [6.0.0] - 2026-07-06

> ⚠️ **重大版本（Major release）。** 包含一项 breaking 更名，并移除 8 个已弃用的机器可读标准与 4 个已弃用的 CLI 命令（皆自 5.4.0 起带有「将于 6.0.0 移除」告示）。**请参阅 [v6 迁移指南](docs/MIGRATION-v6.md)**（[English](../../docs/MIGRATION-v6.md) | [繁体中文](../zh-TW/docs/MIGRATION-v6.md)）。

### 变更 — BREAKING

- **`review` 命令／skill 更名为 `code-review`**（T1）。`/review` 的调用方必须迁移至 `/code-review`；flow-id `review-flow` → `code-review-flow`。见迁移指南 §1。

### 移除 — BREAKING（自 5.4.0 起排定）

- **移除 8 个已弃用的 `.ai.yaml` 标准 stub**（runtime 已依 XSPEC-086/095 / DEC-049 于 5.4.0 移至 adoption layer）：`agent-communication-protocol`、`agent-dispatch`、`branch-completion`、`change-batching-standards`、`execution-history`、`pipeline-integration-standards`、`workflow-enforcement`、`workflow-state-protocol`。人类可读的 `core/*.md` 文档保留作为参考（现列于 registry-check 的 REFERENCE_ONLY 清单）；registry 条目已移除。见迁移指南 §2。
- **移除 4 个已弃用的 CLI 命令**：`uds start` / `uds mission:*`、`uds workflow:*`、`uds flow:*`、`uds sweep`（orchestration 属 adoption layer 职责；`/sweep` skill 取代 `uds sweep`）。并清理引用已移除命令的死 i18n 键与过时的 in-CLI 提示（`config` next-steps、`quickstart` recipes）。见迁移指南 §3。

### 新增 — 新标准（coverage-roadmap waves + 旗舰标准）

- **领域与生命周期标准补齐**：product — `prd-standards`、`product-metrics`、`user-story-mapping`（XSPEC-069）；infra — `container-image`、`secret-management`、`iac-design`（XSPEC-065）；SRE — `incident-response`、`slo-sli`、`runbook`（XSPEC-063）；data engineering — `data-pipeline`、`schema-evolution`、`data-contract`（XSPEC-068）；compliance — `audit-trail`、`pii-classification`（XSPEC-066）。
- **旗舰标准**：`verification-oracle`（XSPEC-256）、`model-provenance`（XSPEC-255）、`resource-cost-boundary`（XSPEC-277）。
- **`user-journey-testing`** 以一级标准（first-class standard）身份发布（ai/standards + core + zh-TW + registry）。
- **`logging-standards` 强制事件目录（mandatory events catalog）**（XSPEC-234）。

### 新增 — UDS Stage 2 硬化（T5–T16）

- **Canonical AC 注记**（T5）：涵盖 `acceptance-criteria-traceability` 与 worked examples。
- **附出处的量化阈值**（T8）：`browser-compatibility` 95%/90% gate、`checkin` code-smell、`accessibility` session-timeout、`code-review` PR 大小／响应时间 + 大量变更例外、`project-context-memory` 7 天陈旧度、`developer-memory` 退役、`privacy` DPIA「large scale」。
- **Failure Handling 章节**（T7）：`git-worktree` 暂时性失败重试、`reverse-engineering` 升级（escalation）、`forward-derivation` 恢复。
- **跨职能交接**（T16）：`security-testing` finding-remediation 生命周期、`pii-classification` 发现与交接契约。
- **Glossary 术语正规化**：作为 canonical 真实来源（T6）。
- **CLI 硬化**（T11/T12）：Mission `FAILED` 终止状态 + resume 防护、具 rollback 的 transactional `init`、`hitl`/`run`/`release`/config 的输入验证。

### 新增 — 迁移与重构完整性家族

- `migration-assistant` 切换后（post-cutover）数据对账（XSPEC-284 P0）、状态机与时序对等（XSPEC-287）；`full-coverage-testing` 迁移错误路径完整性（XSPEC-288）；`performance-standards` 迁移非功能对等（XSPEC-286）。

### 新增 — 工具与工作流程

- **`/brainstorm` v4 的 BQS v1 质量契约**（XSPEC-296）。
- **`ci-cd-assistant` skill 新增 CI Job Orchestration Patterns** — trigger 分离、共享资源序列化、change-detection gating、advisory vs gating、`npm ci` `EUSAGE` 故障排除（UDS #126 / XSPEC-300）。
- **`pipeline-security-gates` 新增部署前 attestation 验证闸门**。
- **release 流程新增发版前 issue/PR triage 闸门**（XSPEC-265）。
- `release verify` 现在使用已记录的 manifest checksum。
- `/journey-test` 与 `/skill-builder` 注册为正式命令。
- 可选的 model-tier 注记（R6，XSPEC-270 Work Package A）。
- `sync-standard` 四层同步工具；Phase 2 内容覆盖稽核 metadata。

### 新增 — 事故驱动的防漂移与可测试性

- **`refactoring-standards` Semantic Duplication 与 Copy-Drift**（#142）：命名 Copy-Drift 反模式（同一领域事实在多处重复实现，或存储的衍生汇总值与其来源之间没有强制绑定——文本型重复度量测不到），以及 Single-Source-of-Truth / Derive-Don't-Duplicate 对策（每个事实一个单元、以推导取代存储、存储的汇总值在单一收敛点重算、以 golden + architecture 测试锁住），另加迁移用的 Intentional-Divergence Registry。
- **`mock-boundary` 可注入的后台执行**（#143）：将 in-process fire-and-forget 工作（`Task.Run`、未 await 的 promise、`setTimeout`、goroutine、executor）视为如同时钟般的可注入接缝——production 保留真实 fire-and-forget，测试 dispatcher 则 inline 执行并追踪 task 以达成确定性完成；新增 Poll/Sleep-for-Background-Result 反模式与 no-poll/sleep 规则。

### 变更

- **API versioning 与 deprecation 合并为单一真实来源** — producer 端的 API-versioning 内容并入 `api-design-standards`；不一致的 deprecation 时间表已调和（XSPEC-298 R8）。
- **`versioning` 新增 Deployment Version Identity 章节**，含 build-metadata 判别符（discriminator）注意事项（XSPEC-298 R1）。
- **`versioning` 构建身份与多语言 versioning**（XSPEC-298 R2/R3）：.NET／JVM／多语言项目的 git-height 推导 versioning（MinVer / Nerdbank.GitVersioning / GitVersion）；构建身份升级为需求——已部署服务 MUST 经由 `/version`|`/health` 暴露 `version + commit sha + build time`，且 Phase-5 验证 MUST 断言 sha 与已部署 artifact 相符（#138）。

### 弃用

- **6 个 workflow skill** 标记为 `reference` 并附可见的弃用告示；已弃用的 runtime 命令加上结构化 `@superseded-by` 指标（XSPEC-291 §4）。

### 修复

- **`uds audit` 假阳性**：`options/` 文件被误报 missing（health check 现在会递归进子目录）、CP950 控制台乱码、非 TTY 崩溃（#115）；unused-standard 检测改以 canonical id 而非文件名比对（#125）。
- **Bundle ⇄ source 对等已恢复** — 25 个标准已同步进 `.standards/` self-adoption tree。
- 多项 docs/i18n 完整性修复：过时的标准／skill／命令数量、损坏的 locale 交叉链接、command/skill 索引重新生成、anchor-slugger 与 table-parity 路径。

## [5.17.0] - 2026-06-08

### 新增 — 可执行 SDD 一致性与 AC 格式扩充（XSPEC-262/263/264）

- **`/sdd analyze` 跨 artifact 一致性（XSPEC-262，`scripts/sdd-analyze.ts`）**：acceptance-criteria-traceability + forward-derivation single-spine 的可执行面。7 类信号——孤儿测试／未覆盖／not_implemented／跨 spec AC 冲突／孤儿 .feature／AC 无 scenario／手册↔E2E drift（`T-NNN`，实现 XSPEC-260 R5）。`npm run sdd:analyze`；12 bats 测试。
- **EARS 记法作为可选 AC 格式（XSPEC-263）**：spec-driven-development v2.3.0 加 5 种 EARS 模板；schema 加可选 `ears` 字段（given/when/then 由 required 放宽、向后兼容）。GWT 维持预设首选。
- **结构化 Bugfix 规格模板（XSPEC-264）**：sdd-guide 决策树细分 trivial vs regression-prone，新增轻量 `<BUG-ID>.bugfix.md` 模板（current/expected/**unchanged** + root-cause + regression-test 当 AC）。

> 注：Bugfix 模板的 sdd-guide locale（zh-TW/zh-CN）同步交 XSPEC-248 回路（既有 locale drift）。

## [5.16.0] - 2026-06-08

### 新增 — 测试推导链延伸至用户指南（XSPEC-260）

- **`core/forward-derivation-standards.md`**：新增 `## Terminal Projection: User Guide`（终端投影：用户指南）段 + `### Single-Spine Principle`（单一主干原则）。把推导管道从测试延伸到用户指南——用户指南是 journey／E2E 测试以机器验证的同一条 AC 主干的终端投影。定义共用 `T-NNN` 编号（用户指南步骤的 `T-NNN` 必须等于某个真实 journey／E2E 测试的 id）、user-facing AC 筛选与保守预设，以及单一主干原则：测试／文件来源是同一 AC 主干的 N×1 投影、非 N×N 平行对照；另立平行编号体系即为违规。
- **`ai/standards/forward-derivation-standards.ai.yaml`**：对应 `terminal_projection` 区块 + 3 条 rules（`single-spine-no-parallel-numbering`、`user-guide-shared-tnnn`、`user-facing-ac-conservative-default`）。
- **`core/acceptance-criteria-traceability.md`**：新增 `## User-Documentation Coverage`（用户文件覆盖）维度——追踪 user-facing AC 是否被用户指南记载。含 user-facing AC 筛选（保守预设：判不准归 user-facing）、沿用 ✅/⚠️/❌ 状态，及排除非 user-facing 与 `not_implemented` AC 的覆盖率公式。
- **`ai/standards/acceptance-criteria-traceability.ai.yaml`**：对应 `user_doc_coverage` 区块 + 2 条 rules（`user-doc-user-facing-only`、`user-doc-shared-tnnn`）。
- **zh-TW / zh-CN 语言版**：两标准的新段落均完整翻译。

## [5.15.0] - 2026-05-28

### 新增 — i18n 分层语言策略（XSPEC-239）

- **`core/ai-instruction-standards.md` v1.0.0 → v1.1.0**：新增 `## 国际化（i18n）` 章节，定义 SKILL.md 与 root 级 AI 指令档的 L1/L2/L3/L4 分层语言策略。**范围延伸**自原本只规范 root 级（`CLAUDE.md`、`.cursorrules` 等）扩张至涵盖 skill 级档案（`SKILL.md`）。定义 canonical/locale 档案结构、责任边界、chimera 防范规则、采用者安装模式。
- **`ai/standards/ai-instruction-standards.ai.yaml` v1.0.0 → v1.1.0**：对应的 `i18n:` 区块 + 4 条新规则。
- **10 个缺漏 zh-TW locale skill 变体**：`ac-coverage`、`deploy-assistant`、`dev-methodology`、`journey-test-assistant`、`orchestrate`、`plan`、`push`、`skill-builder`、`spec-derivation`、`sweep`。zh-TW skill 覆盖率达 54/54（100%）。
- **`cli/src/lint/i18n.js` + `uds check --i18n` 命令**：强制执行 5 条 chimera 防范规则。Error 退出码 1。`--json` 模式给 CI 用。
- **`scripts/generate-locale-coverage.mjs` + 自动产生的 `locales/COVERAGE.md`**：依 skill/standard × locale 的覆盖率矩阵 + drift 警告。npm script `docs:locale-coverage`。
- **`UDS_LOCALE` 环境变数支援**。
- **`.uds/install.yaml` `locale:` 栏位支援**：让采用者宣告偏好 locale 一次，免去每次 `--locale`。
- **Locale fallback WARN**：取代原本的 silent fallback。
- **i18n 讯息**：新增 `localeFallbackTitle` / `localeFallbackHint` 键（en/zh-tw/zh-cn）。

### 变更

- **CLI locale 解析优先顺序**：6 阶层 — `--locale` > `.uds/install.yaml` > `UDS_LOCALE` env > manifest > `.standards/` 侦测 > `'en'`。
- **`core/ai-instruction-standards.md` 译本**：zh-TW 与 zh-CN locale 同步至 v1.1.0 含完整在地化 i18n 章节。（zh-CN 章节标记 pending-review，依 XSPEC-239 O-2 — 简中翻译质量策略未定。）

### 修正

- **29 个 canonical SKILL.md 描述 chimera 修正**（XSPEC-239 Phase 1B）：从下列 skill 的 `description:` frontmatter 移除 CJK 内容：`adr-assistant`、`ai-collaboration-standards`、`ai-friendly-architecture`、`ai-instruction-standards`、`api-design-assistant`、`audit-assistant`、`ci-cd-assistant`、`contract-test-assistant`、`database-assistant`、`deploy-assistant`、`documentation-guide`、`error-code-guide`、`git-workflow-guide`、`incident-response-assistant`、`journey-test-assistant`、`logging-guide`、`observability-assistant`、`orchestrate`、`plan`、`pr-automation-assistant`、`project-structure-guide`、`push`、`retrospective-assistant`、`runbook-assistant`、`security-assistant`、`security-scan-assistant`、`slo-assistant`、`sweep`、`testing-guide`。
- **`skills/reverse-engineer/SKILL.md` description em dash** 改为 ASCII hyphen。
- **`locales/zh-TW/core/self-review-protocol.md` 缺 YAML frontmatter** 已补。

### 采用者升级注意

对于以 `--locale zh-TW` 或 `--locale zh-CN` 安装 UDS 的项目，请执行 `uds update`。手动编辑过 canonical 档案的采用者，请将客制化内容调整至 locale 变体或 overlay。新的 `uds check --i18n` lint 可验证项目干净。

## [5.14.0] - 2026-05-27

### 新增
- **`.github/RELEASE-FLOW-TODOS.md`**：发版流程改善项目的持久追踪文件，记录 dogfood 过程中发现的问题。包含 TODO-001 ~ TODO-005（bump-version.mjs 自动执行 docs:generate-index、FB/Threads prompt 捕捉习惯、下次 bootstrap 验证 `_template/`、Phase 1.5 social-assets 硬闸、Phase 2 Meta API 自动发布 workflow）。维护者可直接编辑此文件新增或关闭项目。

### 变更
- **`.github/workflows/release-reminder.yml`**：现在读取 `.github/RELEASE-FLOW-TODOS.md` 并将 open TODO 显示在每周一 09:00 UTC reminder issue 内文中。改善项目在每个发布周期持续累积，不再遗失在 commit history 里。

### 修复
- **`cli/src/commands/check.js` — AI 工具集成 check 误报 missing 标准**：`uds check` 错误地将 `error-code-standards` 和 `logging-standards` 报告为 missing，即使实际 `.ai.yaml` 文件（`error-codes.ai.yaml`、`logging.ai.yaml`）已正确写入 `CLAUDE.md`。根因：`migrateStandardsPathsToIds()` 将 manifest 路径转为 registry ID（如 `ai/standards/error-codes.ai.yaml` → `error-code-standards`），但集成文件是以实际文件名生成的。check 现在从 registry 建立 `id → aiFilename` 查找表，在 ID 未直接出现于集成文件时以实际文件名进行第二次比对。

## [5.13.3] - 2026-05-26

### 修复
- **`scripts/pre-release-check.sh` Step 22.5 逻辑升级**：原始实作（v5.13.0）只接受 Pass A（`[Unreleased]` 非空）。CHANGELOG promotion（`[Unreleased]` → `[X.Y.Z]`）后该 section 正确清空但原 check 误判失败，需 `--skip-changelog` 绕过。新逻辑加 **Pass B（post-promotion）**：最新 dated section 是 today AND 有内容也 pass。并新增 **Fail D**：今日 dated section 存在但仅有 template。发版 v5.13.0 时 surface — gate 自己的 pre-release-check 退到 `--skip-changelog` 因为已是情境 B。

### 备注（翻译回填）
- `locales/zh-TW/CHANGELOG.md` 与 `locales/zh-CN/CHANGELOG.md` 补回 v5.13.1 hotfix commit 时遗漏的 [5.13.1] section（Edit 工具当时遇到 tool-state 问题挡住这两份翻译）。

## [5.13.1] - 2026-05-26 [PUBLISH 失败 — 见 5.13.2]

### 修复
- **`.github/workflows/publish.yml` Clean-room Install Test（XSPEC-221 hotfix）**：在 alpine clean-room job 的 `npm install -g .` 之前新增 `npm ci --ignore-scripts` 步骤。

## [5.13.2] - 2026-05-26

### 修复
- **`.github/workflows/publish.yml` Clean-room Install Test（XSPEC-221 hotfix v2）**：将 `uds init --dry-run`（CLI 未实作此 option）换成 `uds init --help` 作为安全的 non-mutating 验证。v5.13.1 publish 失败时 surface — 错误讯息 `error: unknown option '--dry-run'`。gate 第二次自我 bug 被抓出；gate 经此次端对端验证。

## [5.13.1] - 2026-05-26 [PUBLISH 失败 — 见 5.13.2]

### 修复
- **`.github/workflows/publish.yml` Clean-room Install Test（XSPEC-221 hotfix）**：在 alpine clean-room job 的 `npm install -g .` 之前新增 `npm ci --ignore-scripts` 步骤。

## [5.13.0] - 2026-05-26

### 新增
- **`core/self-review-protocol.md` v1.0.0**（含 `ai/standards/self-review-protocol.ai.yaml`、`locales/zh-TW/core/self-review-protocol.md`、`cli/standards-registry.json` 注册项）：新标准，要求**大型 markdown 编辑（> 50 行）commit 前必跑 self-review**。明列 **6 类内部 cross-reference 不一致** — diagram/step 不同步、changelog 编号错位、计数错位、stale 模板、错误工具引用、placeholder 与 rule 不对齐 — 并附具体检查方法。与 code review（代码）、内容自我审计（完整性）、同侪审查（设计）三者分工互补。观察源：下游 skill 编辑出现的 `v1.X→v1.X.1` patch 惯性。
- **`scripts/pre-release-check.sh` Step 22.5 — CHANGELOG hard gate**：当 `CHANGELOG.md [Unreleased]` 为空时拒绝发版。新增 `--skip-changelog` flag 提供 escape valve（发版 commit message 须注明理由）。插在 flow gate（step 22）与 dogfooding gate（step 23）之间。
- **`scripts/pre-commit.mjs` Step 1.5 — CHANGELOG drift advisory**：当 staged commit 改 substantive source（`core/`、`ai/standards/`、`cli/src`、`cli/bin`、`scripts/`、`skills/*/SKILL.md`、`.github/workflows/`）但没 stage `CHANGELOG.md` 时，黄色 warning（不挡 commit，exit 0）。讯息指向 release-time hard gate 让使用者知道忽略警告的后果。
- **`.github/workflows/release-reminder.yml`**：每周一 09:00 UTC cron，当 `CHANGELOG.md [Unreleased]` 非空 **且** 距离 latest semver tag ≥ 7 天时，开或更新标 `release-reminder` + `auto-generated` 的 issue。条件不再满足时（发完版或 [Unreleased] 清空）自动 close。内建 semver bump heuristic（依条目内容推 major/minor/patch）。
- **`scripts/check-skill-structural-integrity.ts`**（XSPEC-223，P1 发版 gate）：验证 skill `SKILL.md` 结构完整性（frontmatter 字段、必要 section）。串接到 `pre-release-check.sh` step 18.5；任何 skill 结构不全则挡发版。
- **`packaging-standards`**（XSPEC-233 / #112）：新增 API migration contract test fixtures section — 定义跨版本 API 迁移相容性测试的 fixture 格式。
- **Clean-room install gate**（XSPEC-221）于 `.github/workflows/publish.yml`：Alpine Node 20 容器跑 `npm install -g .`（从 `cli/`），验证 `uds --version` / `uds list` / `uds init --dry-run`。任何步骤失败则挡 `publish` job。
- **Dogfooding gate**（XSPEC-222）— `scripts/pre-release-check.sh` step 23：新 CLI build 必须能跑 `uds check` 通过自身验证才能发版。

### 变更
- **`core/deployment-standards.md`**（XSPEC-231 / #110 + #113）：部署防御性配对 — 强制归档格式验证 + 解压-验证-才删除 模式。关闭「压缩档损毁但先被删除」失败类别。
- **`core/logging-standards.md`**（XSPEC-232 / #111）：强制双触发日志轮替策略 — size **AND** time 两种触发都必须配置（非 OR）。关闭「size 门槛未达所以轮替从未触发」失败模式。
- **`skills/contract-test-assistant/SKILL.md`** 与 **`skills/runbook-assistant/SKILL.md`**：配合 XSPEC-231/232/233 模式的小幅更新。
- **依赖升级（`cli/`）**：`lint-staged` 17.0.3→17.0.4（#107）、`@inquirer/prompts` 8.4.2→8.4.3（#106）、`eslint` 10.3.0→10.4.0（#105）、`@vitest/coverage-v8` 4.1.5→4.1.6（#103）、`vitest` 4.1.5→4.1.6（#101）、`@commitlint/cli` 21.0.0→21.0.1（#104）、`tsx` 4.21.0→4.22.3（#109）。
- **CI actions**：`actions/checkout` 4→6（#98）、`actions/setup-node` 4→6（#99）。

## [5.12.1] - 2026-05-19

### 变更
- **`full-coverage-testing.ai.yaml`**（`no-tautology-assertions` 规则，XSPEC-220）：AI agent 生成未实作测试骨架时，**必须**使用 `it.todo("AC-XXX: ...")`，禁止使用含 `expect(true).toBe(true)` 的 `it()` callback——无论由人类或 AI agent 生成，均视为 `[ANTI-FAKE-001]` 违规。
- **`test-governance.ai.yaml`**（`gate-wiring-required` 规则，XSPEC-220）：品质侦测脚本（anti-fake、stub-check、coverage ratchet）**必须**同时出现在至少一个 CI workflow job 与至少一个 local hook。脚本存在于 `scripts/` 但从未被 CI 呼叫，等同不存在，视为治理缺口。
- **`acceptance-criteria-traceability.ai.yaml`**（`not_implemented` 状态，XSPEC-220）：明确定义 `it.todo()` 占位符对应 `not_implemented 🚫` 状态（不计入覆盖率分母），补充决策树区分 `not_implemented`（有意识标记）与 `uncovered`（遗漏）。

## [5.12.0] - 2026-05-16

### 新增
- **`docs/user/` 用户文档体系**（XSPEC-211）：新增双轨文档结构，仿照 VibeOps 惯例，包含 8 份文档：
  - `docs/user/GETTING-STARTED.md` — 5 分钟端到端教程（install → `uds init` → `/sdd` → `/commit`）
  - `docs/user/SKILLS-INDEX.md` — 自动生成的 54 个 skill 索引，按 Tier（DEC-061）与 Category 分类，含「触发时机速查」表
  - `docs/user/COMMANDS-INDEX.md` — 自动生成的 48 个 slash command 字母序列表，含 skill 对应
  - `docs/user/FAQ.md` — 14 题常见问题（安装、skill、SDD、升级、架构）
  - `docs/user/GLOSSARY.md` — UDS、SDD、ATDD、BDD、TDD、XSPEC、Dual-Layer、Skill Tier、Standard、Activity、Bundle/Source、ADR、AC 等术语定义
  - `docs/user/TROUBLESHOOTING.md` — 问题→解法指南，整合 `SKILL-FALLBACK-GUIDE.md` 内容
  - `docs/user/README.md` — 三类受众入口（新手 / 日常用户 / 维护者）+ 文档地图
  - `docs/user/CHEATSHEET.md` — 从 `docs/` 移入（内容不变）
- **`scripts/generate-skill-index.ts`** — 从 `uds-manifest.json` + `skills/*/SKILL.md` frontmatter 生成 SKILLS-INDEX.md 与 COMMANDS-INDEX.md。执行：`npm run docs:generate-index`
- **`scripts/check-skill-index.ts`** — pre-commit 守门；重生成后 diff，不同步则 exit 非零。执行：`npm run docs:check-index`
- **`scripts/setup-hooks.sh`** — 安装 `.git/hooks/pre-commit`，每次 commit 自动调用 `docs:check-index`
- **`.github/workflows/docs-check.yml`** — CI job：PR 修改 manifest/SKILL.md/registry 时验证 INDEX 文档已同步
- **`docs/reference/FEATURE-REFERENCE.md`** — FEATURE-REFERENCE.md 从 `docs/` 迁移至 `docs/reference/`（自动生成，内容不变）
- **`docs/archive/USER-MANUAL-2026-03-24.md`** — 已废弃 User Manual 的归档备份

### 变更
- **`package.json`**：新增 `docs:generate-index` 与 `docs:check-index` npm scripts
- **`scripts/generate-usage-docs.mjs`**：更新英文输出路径（FEATURE-REFERENCE → `docs/reference/`，CHEATSHEET → `docs/user/`）
- **`skills/README.md`**：新增 banner 指向 `docs/user/SKILLS-INDEX.md` 与 `COMMANDS-INDEX.md`
- **`README.md`**：Quick Start 段落新增「📚 Documentation」表格，列出 7 份 `docs/user/` 文档直链
- **`docs/USER-MANUAL.md`**：新增 deprecation banner 指向 `docs/user/README.md`；归档备份保留于 `docs/archive/`

### 移除
- **`docs/SKILL-FALLBACK-GUIDE.md`**：内容已整合至 `docs/user/TROUBLESHOOTING.md`。非 Claude Code 工具的 fallback 策略与 Skill→Core Standard 对应表保留于「Using UDS Without Claude Code」段落

## [5.11.0] - 2026-05-14

### 新增 / Added
- **`spec-driven-development`** SPEC Type Agent 变体：`acceptance-criteria-traceability.ai.yaml` 与 SDD 模板新增 `spec-type: feature | agent | infrastructure` 字段，以及 Agent SPEC 五段式模板（能力范围 / 决策边界 / 可观测性 / 失败模式 / 跨 Agent 不变量）。让 Builder/QA/Planner 风格的 SPEC 可独立于 feature SPEC 追踪，并通过新增的 `agent-id` 字段连回特定 Agent。(XSPEC-205)
- **`reverse-engineering-standards`** 移植清单双向验证：新增路由驱动的发现方法（禁止以 filesystem-glob 为起点）、target→source 双向扫描，以及对"无对应来源产物"的发现的 `[GAP]` 标记协议。搭配 `testing.ai.yaml` 新增 `migration_testing` 区段，要求以 3 步骤 schema parity pattern 并由 CI gate 强制执行。关闭 UDS Issue #96 与 #97。(XSPEC-206)

### 修复 / Fixed
- **`uds update` 对 schema 3.x manifest 误报"CLAUDE.md.md：无法判断来源"还原失败**（`cli/src/utils/integration-generator.js`、`cli/src/commands/update.js`）：schema 3.x manifest 在 `manifest.integrations` 存的是**文件名**（如 `"CLAUDE.md"`）而非工具名。`integration-generator.js:56` 的 `getToolFileName` fallback 无条件附加 `".md"`，导致 `getToolFilePath("CLAUDE.md")` 返回 `"CLAUDE.md.md"`，被当成丢失文件而无法还原（`getSourcePathFromRelative` 对该合成路径没有 mapping）。Commit `79532b3`（5.10.0）修了反向案例（工具名输入），但漏这个文件名变体。修补：从 `SUPPORTED_AI_TOOLS` 预计算 `KNOWN_TOOL_FILES`，对已知集成文件名或已含已知扩展名（`.md`/`.yaml`/`.yml`/`.json`）的输入短路返回。`integration-generator.test.js` 新增 5 个 regression test。(XSPEC-208 BUG-208-01)
- **`uds update` / `uds check` 误报"Integration UDS Block Integrity：GEMINI.md/AGENTS.md 丢失"警告**（`cli/src/commands/update.js`、`cli/src/i18n/messages.js`）：`manifest.integrationBlockHashes` 每次安装都累加但从不清理。当 `manifest.aiTools` 缩减（如 `["claude-code","gemini-cli"]` → `["claude-code"]`），GEMINI.md 的 hash 仍残留，`check.js:1491 checkIntegrationBlocksIntegrity` 误报该文件丢失。修补：在 integration 重新生成步骤后，依 `manifest.aiTools`（声明的配置，而非 `results.integrations`，后者在暂时性写入失败时会 over-prune）反推预期文件名集合并移除孤儿 hash。被清理的文件名通过新增 i18n key `prunedOrphanedBlockHashes`（en / zh-TW / zh-CN）回报。`update.test.js` 新增 3 个 regression test。在 machine-setup `uds update` 5.1.0-beta.4 → 5.10.0 触发；于 5.10.0 → 5.11.0 验证修复。(XSPEC-208 BUG-208-02)

## [5.10.0] - 2026-05-13

### 新增
- **`multi-environment-e2e-testing`**（`ai/standards/multi-environment-e2e-testing.ai.yaml`）：新增多部署目标 E2E 测试配置标准。核心原则："执行命令即文档"。涵盖：BASE_URL 内嵌于测试框架配置（不依赖 .env）；各环境含自检前置条件的 runner 脚本；环境能力矩阵提交至 repo；CI Gate 映射；凭证处理规则。关闭 UDS Issue #95。（XSPEC-204）

### 修改
- **`mock-boundary`**（v1.0.0 → v1.1.0）：新增 Level 1 / Level 2 mock 层级区分。Level 1 = 代码级 mock，受 STUB 标记规则管制。Level 2 = 基础设施级 stub server（WireMock、MockSoap），受环境分层规则管制，**不受** STUB 部署阻断规则管辖。新增 `external_dependency_testability_matrix` 模板（✅/⚠️/❌ 各服务 × 环境）。新增规则：`level-2-stub-server-rules`、`no-stub-server-in-prd`。关闭 UDS Issue #94 盲点二。（XSPEC-204）
- **`deployment-standards`**（v1.0.0 → v1.1.0）：新增 `environment_stratification_matrix` 块——有外部依赖的项目必须在测试计划阶段建立此矩阵；模板包含 10 大流程 × 三层环境对照表。新增 `stub_server_cicd_rules` 块——选项 A（sidecar 部署）/ 选项 B（推迟至 PRD Smoke）；production artifact 排除规则；PRD 禁止规则；禁止状态定义。关闭 UDS Issue #94 盲点一与盲点三。（XSPEC-204）
- **`verification-evidence`**（v1.0.0 → v1.1.0）：新增 Iron Law（环境维度）：有外部服务依赖的 AC 验收证据必须标明 `environment_layer`。在 evidence format 新增 `environment_layer` 字段（有外部服务依赖的功能为必填）。新增规则 VE-005、VE-006。（XSPEC-204）
- **`test-completeness-dimensions`**（v1.2.0 → v1.3.0）：新增第 11 维度：**环境可验证性（Environment Verifiability）**——有外部服务依赖的 AC 须标明最低可验证环境层次（local/UAT/PRD），追踪 PRD-only 项目，要求 smoke 测试计划。更新功能类型映射：外部集成 → [1,3,7,11]；新增类型"外部依赖工作流程"→ [1,3,4,5,9,10,11]。更新 use-checklist 规则。（XSPEC-204）

### 修复
- **`uds update` 集成工具名称误作文件路径的误报**：`manifest.integrations` 含有 `"claude-code"`、`"opencode"` 等工具标识符时，update 命令将其直接推入 `allTrackedFiles` 作为文件路径，导致 `existsSync("claude-code")` 返回 false，触发假的「⚠ N 个文件缺失」警告和「✗ claude-code: 无法判断来源」还原失败。修复方式：先用 `getToolFilePath(int)` 转换为真实路径（如 `"CLAUDE.md"`）再推入列表；无法映射的条目跳过。问题出现于 `uds update` 5.7.2 → 5.8.0。

## [5.9.0] - 2026-05-13

### 新增
- **`feature-discovery-standards`**（`ai/standards/feature-discovery-standards.ai.yaml`、`core/feature-discovery-standards.md`）：新增标准，定义遗留系统功能穷举发现的语言无关方法论。确立 **Deterministic-First 原则**（AI 在 Discovery Phase 禁止通过推断生成功能清单）。定义七种软件形式分类法（web/cli/gui/daemon/library/mobile/embedded），各含检测信号与提取工具。定义五个静态基础（入口点→调用图→字符串挖掘→资源文件→外部接口）、动态观察协议（三平台）、人工观察协议（confidence: 0.7 规则）与多层交叉比对矩阵模板。流水线位置：Discovery → feature-manifest → behavior-snapshot。（XSPEC-202）
- **`ai/language-packs/language-pack-php-to-csharp.ai.yaml`**：UDS 首个语言包，提供 PHP→C#（ASP.NET Core）迁移风险标签，含 7 个标签（SESSION_HANDLING、ORM_DIFFERENCES、TIMEZONE_HANDLING、FILE_UPLOAD_PATH、REGEX_DIFFERENCES、ARRAY_FUNCTIONS、EXCEPTION_HIERARCHY）各附详细说明。（XSPEC-203）
- **`ai/language-packs/README.md`**：语言包命名规范、使用指南与贡献说明。（XSPEC-203）

### 变更
- **`feature-manifest-standard`**（v1.0.0 → v1.1.0）：重构 `migration_risks` 为语言无关架构。移除硬编的 `php_to_csharp` 区块（已移入 `ai/language-packs/`）。新增 `language_packs` Extension Point（`extension_point: true`）。新增三个通用风险标签：CONCURRENCY_MODEL、PACKAGE_ECOSYSTEM、TYPE_SYSTEM。（XSPEC-203）
- **`behavior-snapshot`**（v1.0.0 → v1.1.0）：从纯 HTTP 扩充为多模态格式。新增 `adapter` 字段（默认 `http`，向下兼容）。新增 `adapters` 区段，含 4 种 schema：`http` / `cli` / `file` / `event`。新增 `adapter-selection` 与 `backward-compatibility` 规则。现有不含 `adapter` 字段的 HTTP 快照无需修改。（XSPEC-203）

## [5.8.0] - 2026-05-12

### 新增
- **`feature-manifest-standard`**（`ai/standards/feature-manifest-standard.ai.yaml`、`core/feature-manifest-standard.md`）：新增标准，定义迁移/重构项目的 FM-NNN 机器可读功能清单格式。含信心评分、迁移风险标签（PHP→C#）、`FEATURE_STUB:` 标记协议与 Gate 1 完整性闸门。（XSPEC-200）
- **`behavior-snapshot`**（`ai/standards/behavior-snapshot.ai.yaml`、`core/behavior-snapshot.md`）：新增标准，定义 HTTP 金文件快照格式，用于迁移等价性验证与重构特征化测试。含快照结构、`ignore_fields` 指引、parity gate exit codes 与 Gate 0 特征化测试协议。（XSPEC-201）

### 变更
- **`acceptance-criteria-traceability`**：新增第 4 个 AC 状态 `not_implemented`（🚫）——区分「代码不存在」与 `uncovered`（代码存在但无测试）。更新覆盖率公式（分母排除 `not_implemented`）。新增 CI blocking gate：`not_implemented_count > 0` → blocking（独立于覆盖率 % gate）。新增状态分类决策树。（XSPEC-199）

## [5.7.3] - 2026-05-08

### 修复
- **`uds update` 跳过无效 ID**（`cli/src/commands/update.js`）：display、copy、hash 重算、post-update integrity check 四个循环，现在会跳过 `manifest.standards` 中无法解析的 short ID（没有 `/` 或 `.` 且 registry 无对应 entry，例如残留的 AI 工具名称 `claude-code`、`opencode`）。修复前，这类条目会在 `uds update` 中触发无意义的"缺失文件"警告与失败的还原尝试。

## [5.7.1] - 2026-05-08

### 修复
- **`cli/package-lock.json`**：同步 lock file，修正 GitHub Actions `npm ci` 失败（`@emnapi/core`、`@emnapi/runtime` 条目缺失）。

### 移除
- **`specs/`**：删除已迁移至 dev-platform 的 4 个 spec 文件（XSPEC-026/005/006 对应）。保留 `execution-history-spec.md`（Archived）、`schemas/`、`standards-effectiveness-schema.json`。
- **`docs/archive/`**：删除 7 个过时的迁移指南与工作流程分析文件。
- **`.project-context/`**：删除 gemini-cli 自动生成的架构文件（内容已由 CLAUDE.md 涵盖）。

### 新增
- **`.npmignore`**：排除 `tests/`、`scripts/`、`.github/` 等开发用目录，不再随 npm publish 发出（v5.7.0 前这些目录一直被误打包）。

## [5.7.0] - 2026-05-08

> **跨平台脚本迁移**（XSPEC-179 + XSPEC-180）：bash 脚本逐步被单一来源的
> TypeScript / Node.js ESM 等价实现取代，可在 macOS / Linux / Windows 上以
> 相同方式执行。原 `.sh` 文件保留并加上 `DEPRECATED` 警告以维持向后兼容。

### 新增

- **AI 工具表格补全**（`README.md`、`locales/zh-TW/README.md`、`locales/zh-CN/README.md`）：补上五个遗漏工具——GitHub Copilot、OpenAI Codex、Aider、Continue、Google Antigravity。新增 ⚠ Minimal 状态图例。（`1b588e1`）
- **`scripts/bump-version.mjs`**（XSPEC-179 Phase 1）：跨平台版本升版实现，与原 `.sh` 对等。（`1a44e14`）
- **`scripts/install-hooks.mjs`**（XSPEC-179 Phase 1）：跨平台 git hooks 安装程序；于 Windows 自动跳过 `chmod`。（`1a44e14`）
- **`scripts/pre-commit.mjs`**（XSPEC-180）：pre-commit hook 的 Node.js ESM 实现，平台分支于 Windows 调用 `check-translation-sync.ps1`，其他平台调用 `.sh`。（`1572869`）
- **7 个 TypeScript 检查脚本**（XSPEC-179 Phase 2，`0a26d14`）：从 bash 迁移至单一 TypeScript 来源，通过 `tsx` 执行：
  - `scripts/check-ai-behavior-sync.ts`
  - `scripts/check-commit-spec-reference.ts`
  - `scripts/check-flow-gate-report.ts`
  - `scripts/check-integration-commands-sync.ts`
  - `scripts/check-registry-completeness.ts`
  - `scripts/check-release-readiness-signoff.ts`
  - `scripts/check-workflow-compliance.ts`
- **`tsx@^4.20.0`** 加入 root `devDependencies`（XSPEC-179 Phase 2，`0a26d14`）。
- **7 个 npm scripts** 串接 TypeScript 检查脚本（`0a26d14`）：`check:ai-behavior`、`check:commit-spec`、`check:flow-gate`、`check:integration-commands`、`check:registry`、`check:release-signoff`、`check:workflow-compliance`。

### 变更

- **下游项目解耦**（6 批次，`ebe716c`–`2392c0f`）：所有公开叙述中对特定下游产品（DevAP / VibeOps）的直接引用已替换为采用层中性术语，涵盖 130+ 个文件。UDS 重申为纯 MIT + CC BY 4.0 标准库，与任何特定采用层无依赖关系。
- **REGISTRY**：`roo-code` integration tier 从 `planned` 升为 `partial`；AI 工具表格中将 Roo Code 独立成行（不再与 Cline 合并）。（`1b588e1`）
- **`.githooks/pre-commit`**（XSPEC-180，`1572869`）：从 51 行 bash 精简为 16 行 POSIX `sh` 薄壳层，将实际逻辑委派给 `scripts/pre-commit.mjs`。
- **`scripts/bump-version.mjs`**（`19ad314`）：新增 `buildCmd()` 辅助函数，于 Windows 自动切换为 PowerShell + `.ps1` 来调用 `check-version-sync` / `check-translation-sync`，恢复 Windows 平台对等性。
- **XSPEC-179 Phase 2 策略修订**（`0a26d14`）：放弃先前的 `.sh` + `.ps1` 双轨方案，改采**单一 TypeScript 来源**策略。单一 `.ts` 通过 `tsx` 在所有平台上行为一致，消除「只能在 Windows 验证」的反馈落差。

### 弃用

- **`scripts/bump-version.sh`**（`1a44e14`）：标记为 DEPRECATED，由 `bump-version.mjs` 取代。
- **`scripts/install-hooks.sh`**（`1a44e14`）：标记为 DEPRECATED，由 `install-hooks.mjs` 取代。
- **7 个 legacy `check-*.sh` 脚本**（`0a26d14`）：对应的 `.ts` 版本（如上）已成为 canonical 实现。`.sh` 文件保留供 legacy Linux/macOS 环境使用，但不应再新增功能。

### 移除

- **`.devap/` 目录**（`2392c0f`）：移除孤儿 DevAP dogfooding 安装目录。DevAP 已于 2026-04-28 退场（XSPEC-086/095）。

### 修复

- **`scripts/check-release-readiness-signoff.sh`**（`0a26d14`，于 TypeScript 移植时顺带修复的潜伏 bug）：原本错误的 `grep -c "0\n0"` 样式（永远无法匹配到字面 `\n`）已修正，现在能可靠侦测缺漏的 sign-off 信号。
- **`scripts/check-integration-commands-sync.sh`**（`0a26d14`，于 TypeScript 移植时顺带修复的潜伏 bug）：消除 `find` 与下游 consumer 之间 broken pipe 引发的 SIGPIPE 噪音。

## [5.3.2] - 2026-04-27

> **修补版本发布**：Bug 修复 —— `uds update -y` 现在会自动安装/更新 Skills 和 Commands，不再只显示提示信息。

### 修复
- **`uds update --yes` / `-y`**（`cli/src/commands/update.js`）：`--yes` 标志此前对 Skills 和 Commands 安装完全跳过，只显示「New features available」提示。现在与交互模式行为一致 —— 缺少的 Skills/Commands 立即安装，过时的直接更新，并同步刷新 manifest 与集成文件。修复了 `uds update -y` 让 `.claude/` Skills 保持不变而交互式 `uds update` 正常更新的行为差异。

## [5.3.1] - 2026-04-27

> **修补版本发布**：Bug 修复 —— `uds update` 后 `uds check` 不再误报「AGENTS.md 标准不同步」。

### 修复
- **`generateAgentsMdSummary()`**（`integration-generator.js`）：移除导致 AGENTS.md 只列出 30 项标准的 `.slice(0, 30)` 截断。`uds check` 与 manifest 全量标准比对，截断导致永远误报 `30/64 out of sync`。现在列出全部已安装标准，check 正常通过。

## [5.3.0] - 2026-04-26

> **次版本发布**：四个新标准 + 一个新 Skill（XSPEC-085/064）—— `no-cicd-deployment`、`rollback-standards`、`cd-deployment-strategies`、`pipeline-security-gates`，以及无 CI/CD 环境的 `/deploy` Skill。标准总数：136。

### 新增
- **`no-cicd-deployment.ai.yaml`**（XSPEC-085 Phase 1）：无 CI/CD 平台的三层部署架构 — `set -euo pipefail` + deploy.lock + 版本 tag 强制；Smoke Test + 自动 rollback；Blue-Green 切换 <30 秒。
- **`rollback-standards.ai.yaml`**（XSPEC-064 Phase 1）：Rollback 触发条件矩阵 — 自动（error rate >2× baseline）、辅助（SLO 违反）、手动（延迟在 SLO 内）。Error budget <10% 升级为自动。P0–P3 严重级别与 SLA。
- **`cd-deployment-strategies.ai.yaml`**（XSPEC-064 Phase 1）：部署策略选用矩阵 — blue-green / canary / rolling / recreate 决策树（流量 × 风险 × 成本）。含无 CI/CD 兼容性说明。
- **`pipeline-security-gates.ai.yaml`**（XSPEC-064 Phase 1）：CI 安全检查点 — pre-commit secrets 扫描、post-build SAST、post-staging DAST、package 阶段 SCA+SBOM。Critical/High 阻断 pipeline；Medium 需要审核。
- **`/deploy` Skill**（`skills/deploy-assistant/`，XSPEC-085 Phase 1b）：无 CI/CD 交互式部署脚本生成器，含繁体中文本地化翻译。

## [5.2.0] - 2026-04-24

> **次版本发布**：三项新标准/技能（XSPEC-080/081/082）—— `/release package` 子命令、`/push` 质量守门 Skill、以及 `agent-behavior-discipline` 标准（Karpathy 四大原则：问/减/准/测）。Bundle 一致性加固。文档集中至 dev-platform。标准总数：74。

### 新增
- **`agent-behavior-discipline.ai.yaml`**（Trial 试验期至 2026-10-24，XSPEC-082 / DEC-048）：新治理标准，系统化整合 Andrej Karpathy 提炼的四大 AI Agent 行为纪律——问（执行前揭露假设）、减（最小充分代码）、准（精准修改边界）、测（定义可验证成功标准 + 自我修正循环）。已加入 `uds-manifest.json`（第 74 个标准）及 `cli/standards-registry.json`。
- **`/push` Skill**（`skills/push/`，XSPEC-081）：Git Push 质量守门与跨人协作护栏——受保护分支检测、force-push 护栏、pre-push gate 验证、push 审计日志、PR 集成入口。包含两个配置选项：`options/push/single-owner-mode.ai.yaml`（单人仓库简化护栏）和 `options/push/team-mode.ai.yaml`（团队全护栏，需确认）。
- **`/release package` 子命令**（`skills/release/`，XSPEC-080）：10 种目标格式的打包指引——npm/Node.js、Python/PyPI、Go 二进制、Electron App、Homebrew（Wave 1）+ Rust/Cargo、Tauri 桌面、Docker 镜像、VS Code Extension、GitHub Release 资产（Wave 2）。检测优先设计：自动检测项目类型再套用打包步骤。

### 修正
- **Bundle 一致性**（XSPEC-072 Phase 2）：解决 `ai/standards/` 与 `bundle/` 之间的差异——74 个标准现在全部纳入 bundle。CI 硬性失败（exit 1）于任何差异，防止静默的 bundle 落差。
- **i18n NO META frontmatter**（BUG-A06）：补齐 36 个翻译文件缺少的 YAML frontmatter，修复翻译同步验证误报。

### 变更
- **文档集中化（DEC-047 Batch 2）**：UDS 规划/治理文档已迁移至 AsiaOstrich dev-platform 规划中心，不再随 UDS 发布：
  - `docs/AI-AGENT-ROADMAP.md`、`docs/OPERATION-WORKFLOW.md`、`docs/internal/` 下四份文档已移除
  - `locales/zh-TW/docs/`、`locales/zh-CN/docs/` 副本亦已移除

[5.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.1...v5.2.0

## [5.1.1] - 2026-04-20

> **补丁版本**：Windows CI 修正、53 个 SKILL.md 补 `name` 字段、三份 `.md` 源文件依 BUG-A08 事后分析新增规则、zh-TW/zh-CN 翻译同步。

### 修正
- **`cli/src/utils/directory-mapper.js`**：以 `path.basename(dir)` 取代 `dir.split('/').pop()`，修正 Windows CI 路径分隔符兼容性问题（修复 Windows CI runner 上 `directory-mapper.test.js` 测试失败）。

### 新增
- **`name` 字段** 补齐至 9 个源目录 `skills/*/SKILL.md` 及 44 个 `locales/zh-TW/skills/*/SKILL.md`，符合 Skill 验证工具需求。

### 变更
- **`core/test-governance.md`** 1.0.0 → 1.1.0：新增 `test-execution-continuity` 规则（BUG-A08 事后分析 — 22 个测试存在但未连接任何 CI 执行触发器）。
- **`core/checkin-standards.md`** 1.5.0 → 1.6.0：新增旧版项目文件同步（`project-file-sync`）章节 — 磁盘上的每个源文件必须注册于旧版项目 manifest 中。
- **`core/testing-standards.md`** 3.1.0 → 3.2.0：新增 E2E 前置条件范围（`e2e-precondition-scope`）章节 — E2E 前置检查必须验证所有受测页面/端点，而非仅验证认证入口。
- **zh-TW 与 zh-CN 翻译** 已同步 `test-governance.md`、`checkin-standards.md`、`testing-standards.md` 三份文件。

[5.1.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0...v5.1.1

## [5.1.0] - 2026-04-20

> **正式版**：BUG-A06 i18n 完整性 — 新增 32 份缺失翻译、Semver 感知翻译闸门、新增 `translation-lifecycle-standards` UDS 标准。BUG-A07 Shell 测试覆盖 — 20+ 脚本的 bats smoke tests。BUG-A08 假通过测试审计 — 修正 22 个测试。Pre-release Batch 0：6 个标准从 Trial 升至 Adopt（DEC-021/025/031/035/038/040）。标准总数：106 个。

### 新增
- **`translation-lifecycle-standards`**（Trial，到期 2026-10-20）：新 UDS 标准，定义 MISSING 与 OUTDATED 的区别、Semver 严重度分级（MISSING/MAJOR = 发布阻塞器，MINOR/PATCH = advisory），以及自动化集成（pre-commit hook、release gate、bump-version 集成）。来源：BUG-A06 事后分析。
- **`.githooks/pre-commit`** + **`scripts/install-hooks.sh`**：commit 时若暂存 `core/*.md` 文件则显示 OUTDATED 警告，永不阻塞 commit。通过 `./scripts/install-hooks.sh` 启用。
- **32 份 zh-TW 与 zh-CN 翻译**（BUG-A06）：所有核心标准现已有完整 zh-TW 和 zh-CN 翻译，包含 `circuit-breaker`、`token-budget`、`dual-phase-output`、`failure-source-taxonomy`、`immutability-first`、`security-decision`、`capability-declaration`、`recovery-recipe-registry`、`retry-standards`、`health-check-standards`、`timeout-standards`、`skill-standard-alignment-check`、`standard-admission-criteria`、`standard-lifecycle-management`、`packaging-standards`、`frontend-design-standards`、`translation-lifecycle-standards` 等。
- **bats smoke tests**（BUG-A07）：`tests/scripts/` — 20+ 个 Shell 脚本的 smoke tests，涵盖 `check-translation-sync.sh`、`check-version-sync.sh`、`bump-version.sh`、`install-hooks.sh` 等。

### 变更
- **`check-translation-sync.sh`**：Semver 感知严重度 — MAJOR 版本落差现在 exit 1（发布阻塞器）；MINOR/PATCH 落差 exit 0 附 advisory 警告。新增 `semver_diff()` 函数与 `[MAJOR]`/`[MINOR]`/`[PATCH]` 严重度标签。
- **`bump-version.sh`**：更新版本文件后自动执行 `check-translation-sync.sh`，在升版时提供翻译健康状态快照。
- **`scripts/pre-release-check.sh`**：更新为将 `check-translation-sync.sh` 作为硬闸门（MISSING + MAJOR = exit 1）。

### 修正
- **zh-CN `anti-hallucination.md`**（BUG-A06）：从 1.5.0 更新至 1.5.1 — 补上缺失的「Agent 认识论校准」章节（Answer/Ask/Abstain 框架，XSPEC-008）。该章节自 2026-04-13 起在 zh-CN 中完全缺失。
- **22 个假通过测试**（BUG-A08）：修正未正确验证行为的测试，加入真实断言。

### 升至 Adopt（Pre-release Batch 0）
- `circuit-breaker`（DEC-021）：Trial 6 个月后升至 Adopt
- `token-budget`（DEC-025）：Trial 6 个月后升至 Adopt
- `dual-phase-output`（DEC-031）：Trial 6 个月后升至 Adopt
- `security-decision`（DEC-035）：Trial 6 个月后升至 Adopt
- `immutability-first`（DEC-038）：Trial 6 个月后升至 Adopt
- `failure-source-taxonomy`（DEC-040）：Trial 6 个月后升至 Adopt

[5.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.7...v5.1.0

## [5.1.0-beta.7] - 2026-04-17

> **Beta Release**：DEC-043 Wave 1 — 六个 Trial 状态标准，涵盖可靠性模式与治理 Meta 框架。

### 新增
- **Reliability 包（XSPEC-067）**：三个 Trial 状态的韧性模式标准。
  - `retry-standards`：重试策略（指数退避、Jitter、幂等性保护）。
  - `timeout-standards`：分层 timeout 预算（call / request / end-to-end）与传递规则。
  - `health-check-standards`：Liveness / Readiness / Startup probe 语义。
- **治理 Meta 包（XSPEC-070，Wave 1 前置）**：三个定义「标准如何被纳入、管理、与 Skill 对齐」的 Trial 标准。
  - `standard-admission-criteria`：新标准提案的入场门槛。
  - `standard-lifecycle-management`：Trial → Stable → Deprecated → Archived 状态流转。
  - `skill-standard-alignment-check`：Skill 与其引用标准之间的对齐稽核。
- 六份标准皆遵循 UDS 三方同步要求：`.ai.yaml`（机器）+ `.md`（人类）+ `cli/standards-registry.json` entry（+66 行）。

### 背景
- 由 **DEC-043**（UDS 覆盖完整性路线图）驱动。治理 Meta 包为 Wave 1 前置条件，解锁 Wave 2–4（八个主题标准包：SRE / CI-CD / IaC / 合规 / Reliability / 资料工程 / 产品 / 治理 — XSPEC-063~070）。
- PR：#77

## [5.1.0-beta.6] - 2026-04-13

> **Beta 版本**：修复 `uds init` 崩溃问题、E2E 测试隔离问题，以及 macOS 显示语言检测失效问题。

### 修复

- **`uds init --yes` 崩溃**（`manifest-installer.js`）：`contentMode: 'auto'` 未被 `|| 'minimal'` 后备值拦截，导致 Schema 验证失败，`manifest.json` 无法写入
- **macOS 显示语言被忽略**：新增 `~/.udsrc ui.language` 的读取，修复英文语系 macOS 忽略用户语言偏好的问题
- **E2E 测试隔离**（`cli-runner.js`）：所有子进程 spawn 改以独立的 `TEST_HOME_DIR` 覆盖 `HOME`，消除开发者 `~/.udsrc` 对测试输出的干扰
- **E2E 计数断言**（`update-flow.test.js`）：过滤 `manifest.standards` 仅计算 `.ai.yaml` 文件，排除 `.md` 模板文件的干扰

### 新增

- **认知校准框架**（XSPEC-008）：反幻觉标准新增认知校准框架章节
- **`/e2e-assistant` Skill**：从 BDD Gherkin 场景自动生成 E2E 测试骨架的交互式技能
- **`/process-to-skill` Skill**：Process-to-Skill 治理框架技能
- **`execution-history.ai.yaml`**：同步至 XSPEC-003-SDD 规格格式

## [5.1.0-beta.5] - 2026-04-10

> **Beta 版本**：大规模 CLI 扩展（SDLC Flow Engine、Standards-as-Hooks 编译器、分层 CLAUDE.md、SuperSpec Phase 4、opt-in 遥测上传）与 Skill 治理框架（/process-to-skill、DEC 评估框架）。

### 新增

**新功能 — CLI & 标准**
- **opt-in 遥测上传**（SPEC-TELEMETRY-002）：Hook 执行结果可选择性上传至远端分析端点；双重防护；SHA-256 匿名 user_id，不含个人资料
- **DEC 借镶评估框架**（XSPEC-014 Layer 1）：技术雷达、假设书、Reversal DEC 三大评估工具
- **SuperSpec Phase 4 — 收尾功能**（XSPEC-005）：`uds spec archive`、`uds spec search`、`uds spec quickstart`、`uds spec split`
- **SuperSpec Phase 2 — 验证管线**：`spec-linter`、品质评分（0-100 分）、`context sync`
- **spec 大小闸门**（AC-3）：`validateSpecSize()` — 超过 600 行触发警告，超过 1200 行阻挡提交
- **YAML 标准扩展**（AC-18）：`.standards/*.ai.yaml` 支持 `enforcement` 区块与 `required_fields`
- **SDLC Flow Engine**（SPEC-FLOW-001）：自定义工作流程引擎，含状态机持久化、可插拔品质闸门、Export/Import
- **Standards-as-Hooks 编译器**（SPEC-COMPILE-001）：`uds compile` — 自动将 YAML enforcement 区块转译为 hook 脚本
- **分层 CLAUDE.md**（SPEC-LAYERED-001）：`uds init --content-layout` 支持多层目录独立 CLAUDE.md
- **Hook 整合**（SPEC-HOOKS-001）：`uds init --with-hooks` 一键安装 hook 脚本
- **Hook 执行遥测**（SPEC-TELEMETRY-001）：本地端 hook 执行统计，写入 `.uds/hook-stats.jsonl`
- **执行历史仓库标准**（`execution-history`）：AI Agent 跨对话持久化记忆标准
- **`/e2e` 斜线命令**（SPEC-E2E-001）：从 BDD Gherkin 场景自动生成 E2E 测试骨架
- **`/process-to-skill` Skill**（XSPEC-020）：Process-to-Skill 治理框架；3-Times Rule；Simple/Complex/Delta 决策树
- **Skill 治理模板**：`templates/SKILL-CANDIDATES.md`、`templates/SKILL-BRIEF-TEMPLATE.md`
- **Integration Commands Sync**（SPEC-INTSYNC-001）：自动检测 AI 工具整合文件是否引用所有斜线命令
- `COMMAND-INDEX.json`：47 个 commands 的 Single Source of Truth
- `/derive` 扩展：感知 `test_levels`；支持 IT + E2E 测试推演（SPEC-DERIVE-001）
- **三个核心标准新增 `enforcement` 区块**：`commit-message-guide`、`testing-standards`、`checkin-standards`

**文档与规格**
- 批次归档 28 个已完成的 orphan specs 为 Archived 状态
- 归档 6 份规格：SPEC-TELEMETRY-001、SPEC-COMPILE-001、SPEC-LAYERED-001、SPEC-HOOKS-001、SPEC-FLOW-001、SPEC-E2E-001

### 变更
- `REGISTRY.json`：所有 tier 新增 `requiredCategories` 字段
- `REGISTRY.json`：Cursor 从 `complete` 降为 `partial` tier
- `spec dependency tracking`：新增 `depends_on` 字段与 dual mode 支持

### 修复
- `check-orphan-specs.sh`：排除 traceability 文档的误判
- `check-orphan-specs.sh`：修复支持 list 前缀和中文状态字段的 regex

### 杂项
- `.gitignore`：新增 `.workflow-state/`
- 移除 11 个测试文件中过时的 `[TODO]` 标记

## [3.5.0-beta.13] - 2026-01-13

### 新增
- **CLI**：将 OpenCode 加入 skills 兼容工具
  - `uds init` 现在将 OpenCode 视为 Claude Code 处理，提供精简安装
  - `uds check` 显示 OpenCode skills 兼容性状态
  - Skills 自动安装到 `.claude/skills/`（OpenCode 自动检测此路径）
- **文档**：在 skills-mapping.md 新增跨工具兼容性章节
  - 7 个 AI Agent 的路径对照表（Claude Code、OpenCode、Cursor、OpenAI Codex、GitHub Copilot、Windsurf、Cline）
  - 说明 UDS 为何使用 `.claude/skills/` 作为默认路径
  - 不兼容工具的跨工具安装说明
- **文档**：重构 README 建立独立的 Agent Skills 安装章节
  - 将 skills 安装方法整合在一处
  - 新增社区 marketplace（n-skills、claude-plugins.dev、agentskills.io）
- **文档**：新增 beta 版本安装说明
  - `npm install -g universal-dev-standards@beta`
  - `npx universal-dev-standards@beta init`

### 变更
- **文档**：更新 integrations/opencode/ 文档
  - 版本 1.4.0 包含跨工具兼容性信息
  - 双语翻译同步（zh-TW、zh-CN）

## [3.5.0-beta.12] - 2026-01-13

### 新增
- **文档**：新增使用模式比较文档
  - 比较仅 Skills vs 仅规范文件 vs 两者并用
  - 包含功能覆盖率、Token 效率、和建议
  - 双语支持（英文和繁体中文）
  - 参见 `docs/USAGE-MODES-COMPARISON.md`
- **文档**：重构 README 安装文档
  - npm CLI 作为主要安装方式
  - AI 工具扩充作为可选功能
  - 完整列出 9 个支持的 AI 工具及正确状态

### 修复
- **CLI**：修复 detector.js 缺失的 AI 工具检测
  - 现在可检测全部 9 个 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Antigravity、Codex、OpenCode、Gemini CLI
  - 修复 `uds init` 时的自动检测功能

## [3.5.0-beta.11] - 2026-01-12

### 新增
- **文档**：在 README 新增功能可用性表格
  - 清楚比较稳定版 (3.4.2) 与 beta 版 (3.5.x) 功能
  - 以 🧪 标记实验性功能
  - 双语支持（英文和繁体中文）

### 修复
- **i18n**：为 6 个翻译文件新增缺失的 YAML front matter
  - `docs/CLI-INIT-OPTIONS.md`
  - `skills/commands/bdd.md`
  - `skills/commands/methodology.md`
  - `skills/dev-methodology/SKILL.md`
  - `skills/dev-methodology/create-methodology.md`
  - `skills/dev-methodology/runtime.md`
- **文档**：更新稳定版本参考从 3.3.0 至 3.4.2

## [3.5.0-beta.10] - 2026-01-12

### 新增
- **方法论系统**：新增完整开发方法论支持
  - 内置方法论：TDD、BDD、SDD、ATDD
  - YAML 格式方法论定义，含 JSON Schema 验证
  - 阶段追踪、检查清单和检查点
  - 自定义方法论模板，支持团队特定工作流
  - `/methodology` 命令：状态、切换、阶段管理
  - CLI 整合：`uds init` 和 `uds configure` 方法论选择
- **命令**：新增 `/bdd` 行为驱动开发命令
  - 完整 BDD 工作流：探索 → 制定 → 自动化 → 活文档
  - Gherkin 格式范例和三剑客会议引导
  - 阶段检查清单和指示器
- **命令**：整合 `/tdd` 与方法论系统
  - 调用时自动启用 TDD 方法论
  - 显示阶段指示器（🔴 红灯、🟢 绿灯、🔵 重构）
- **文档**：新增方法论系统双语文档
  - 英文和繁体中文翻译
  - SKILL.md、runtime.md、create-methodology.md

### 变更
- **Skills**：更新安装脚本以包含 methodology-system（共 16 个 skills）
- **Registry**：在 standards-registry.json 新增 methodologies 区块

## [3.5.0-beta.9] - 2026-01-11

### 新增
- **脚本**：新增统一预发布检查脚本
  - `scripts/pre-release-check.sh` 适用于 Unix/macOS
  - `scripts/pre-release-check.ps1` 适用于 Windows PowerShell
  - 单一指令执行所有 7 项验证检查
  - 选项：`--fail-fast`、`--skip-tests`
- **CI**：在 GitHub Actions 发布工作流程中新增预发布验证
  - 在 npm publish 前执行版本同步、标准同步、linting 和测试
  - 任何检查失败则阻止发布

### 变更
- **文档**：在 release-workflow.md 新增「自动化预发布检查」区块
- **文档**：在 CLAUDE.md 的快速指令中加入 pre-release-check.sh

## [3.5.0-beta.8] - 2026-01-11

### 修复
- **CLI**：修复 `standards-registry.json` 版本不一致问题
  - 同步 `standards-registry.json` 版本与 `package.json`（之前停留在 3.5.0-beta.5）
  - 这导致 `uds update` 显示过时的「最新版本」信息

### 变更
- **发布**：将版本同步检查加入预发布检查清单
  - 在自动化验证区块新增 `./scripts/check-version-sync.sh` 验证步骤
  - 防止未来版本不一致问题

## [3.5.0-beta.7] - 2026-01-11

### 修复
- **CLI**：修复 Windows 未追踪文件检测的路径分隔符问题
  - 在 `scanDirectory` 函数中标准化路径分隔符为正斜线
  - 确保比对 manifest 路径时的跨平台一致性

## [3.5.0-beta.6] - 2026-01-11

### 新增
- **文档**：新增 18 个 `options/` 目录的人类可读 Markdown 文件
  - `options/changelog/`：keep-a-changelog.md、auto-generated.md
  - `options/code-review/`：pr-review.md、pair-programming.md、automated-review.md
  - `options/documentation/`：api-docs.md、markdown-docs.md、wiki-style.md
  - `options/project-structure/`：kotlin.md、php.md、ruby.md、rust.md、swift.md
  - `options/testing/`：contract-testing.md、industry-pyramid.md、istqb-framework.md、performance-testing.md、security-testing.md
  - 完成双格式架构：`ai/options/*.ai.yaml` 供 AI 工具使用，`options/*.md` 供人类开发者使用
- **AI 标准**：新增 `ai/standards/test-driven-development.ai.yaml`
  - AI 优化的 TDD 标准，含 Red-Green-Refactor 循环
  - FIRST 原则与适用性指南
- **文档**：新增完整的 CLI init 选项指南（三语支持）
  - `docs/CLI-INIT-OPTIONS.md` - 完整的 `uds init` 选项文档
  - 涵盖：AI 工具、技能位置、标准范围、采用等级、格式、标准选项、扩展、集成配置、内容模式
  - 包含使用案例、决策流程和 CLI 参数参考
  - 三语版本：英文、繁体中文 (`locales/zh-TW/`)、简体中文 (`locales/zh-CN/`)
- **发布**：将 CLI 文档新增至预发布检查清单
  - `release-workflow.md` 现在包含 CLI-INIT-OPTIONS.md 验证
- **发布**：将标准一致性检查新增至预发布检查清单
  - 验证 `core/` ↔ `ai/standards/` 内容对齐
  - 验证 `options/` ↔ `ai/options/` 双格式完整性
- **脚本**：新增自动化标准一致性检查脚本
  - `scripts/check-standards-sync.sh` 用于 Unix/macOS
  - `scripts/check-standards-sync.ps1` 用于 Windows PowerShell
  - 检查 `core/` ↔ `ai/standards/` 和 `options/` ↔ `ai/options/` 一致性

### 变更
- **CLI**：改进集成生成器的 minimal 内容模式
  - Minimal 模式现在包含简化的标准参考清单
  - 确保 AI 工具即使在 minimal 模式下也知道有哪些标准可用
  - 新增 `generateMinimalStandardsReference()` 函数
- **CLI**：优化 `uds init` 提示信息
  - 统一所有提示的标题格式
  - 改善术语：Starter/Professional/Complete（等级）、Compact/Detailed（格式）、Standard（内容模式）、Lean（标准范围）
  - 增强颜色标示：推荐选项使用绿色
  - 简化选择后的说明文字

## [3.5.0-beta.5] - 2026-01-09

### 新增
- **CLI**：增强 AI 工具集成，自动符合标准
  - 支持 9 个 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Google Antigravity、OpenAI Codex、Gemini CLI、OpenCode
  - 新增内容模式选择：`full`、`index`（推荐）、`minimal`
  - 生成标准合规指示，含 MUST/SHOULD 优先级
  - 生成标准索引，列出所有已安装标准
  - 处理 Codex 和 OpenCode 之间的 `AGENTS.md` 共享
- **CLI**：增强 `uds configure` 命令
  - 新选项：AI 工具 - 新增/移除 AI 工具集成
  - 新选项：采用等级 - 变更 Level 1/2/3
  - 新选项：内容模式 - 变更 full/index/minimal
  - 设置变更时自动重新生成集成文件
- **CLI**：增强 `uds update` 命令
  - 新标志：`--integrations-only` - 只更新集成文件
  - 新标志：`--standards-only` - 只更新标准文件
  - 标准更新时自动同步集成文件
- **CLI**：增强 `uds check` 命令
  - 新区段：AI 工具集成状态
  - 验证集成文件存在且正确参考标准
  - 报告缺少的标准参考并提供修复建议
- **Skills**：新增 `/config` 斜线命令用于标准配置

### 变更
- **CLI**：集成文件现在默认包含合规指示和标准索引（index 模式）

## [3.5.0-beta.4] - 2026-01-09

### 新增
- **CLI**：AI 集成文件的参考同步功能
  - `uds check` 现在显示「参考同步状态」区段
    - 检测孤立参考（集成文件中的参考不在 manifest 中）
    - 报告缺少参考（manifest 中的标准未被参考）
  - `uds update --sync-refs` 根据 manifest 标准重新生成集成文件
  - manifest 中新增 `integrationConfigs` 字段以保存生成设置
- **Utils**：新增 `reference-sync.js` 模块，含类别对标准的映射

### 变更
- **CLI**：Manifest 版本从 3.1.0 升级至 3.2.0
  - 新增 `integrationConfigs` 字段存储集成文件生成设置
  - 允许 `uds update --sync-refs` 使用相同选项重新生成（类别、详细等级、语言）

## [3.5.0-beta.3] - 2026-01-09

### 修复
- **CLI**：修复 `uds update` 显示错误版本号
  - `standards-registry.json` 版本与 `package.json` 未同步
  - 现在显示正确的当前和最新版本信息

### 新增
- **脚本**：新增版本同步检查脚本
  - `scripts/check-version-sync.sh` 用于 Unix/macOS
  - `scripts/check-version-sync.ps1` 用于 Windows PowerShell
  - 验证 `standards-registry.json` 版本与 `package.json` 一致
- **文档**：将版本同步检查新增至 `release-workflow.md` 预发布检查清单

## [3.5.0-beta.2] - 2026-01-09

### 新增
- **集成**：OpenAI Codex CLI 集成，使用 `AGENTS.md`
- **集成**：Gemini CLI 集成，使用 `GEMINI.md`
- **集成**：OpenCode 集成，使用 `AGENTS.md`
- **集成**：Google Antigravity 项目级规则文件 (`.antigravity/rules.md`)

### 移除
- **CLI**：从 `uds check` 移除未追踪文件扫描
  - `uds check` 现在只验证 manifest 中记录的文件
  - 不再提示追踪 `.standards/` 目录中的未知文件

## [3.5.0-beta.1] - 2026-01-09

### 新增
- **CLI**：新增 `uds configure` 命令用于后安装配置
  - 子命令：`add-tool`、`remove-tool`、`set-level`
  - 交互模式支持
- **CLI**：改进 `uds init` 流程
  - 新增 AI 工具选择提示
  - 新增集成文件配置选项
- **CLI**：manifest 版本升级至 3.2.0
  - 新增 `aiTools` 字段追踪选择的 AI 工具
  - 新增 `integrations` 字段列出生成的集成文件

### 变更
- **CLI**：重构集成生成器以支持多 AI 工具
- **CLI**：改进错误处理和用户反馈

## [3.4.1] - 2026-01-08

### 修复
- **CLI**：修复 `uds update` 建议从较新版本降级的问题
  - 新增正确的语义版本比较，支持预发布版本（alpha/beta/rc）
  - 现在能正确识别当前版本比 registry 版本更新的情况
  - 当用户版本比 registry 更新时显示提示信息
- **CLI**：更新 `standards-registry.json` 版本与 package.json 一致

## [3.4.0] - 2026-01-08

### 新增
- **CLI**：`uds check` 新增基于哈希值的文件完整性检查
  - 通过比较 SHA-256 哈希值检测修改的文件
  - 新增选项：`--diff`、`--restore`、`--restore-missing`、`--no-interactive`、`--migrate`
  - 交互模式：检测到问题时提示操作（查看差异、还原、保留、跳过）
  - 旧版 manifest 迁移：`uds check --migrate` 升级至基于哈希值的追踪
- **CLI**：manifest 中存储文件哈希值（版本 3.1.0）
  - `uds init` 在安装时计算并存储文件哈希值
  - `uds update` 在更新文件后重新计算哈希值
- **Utils**：新增 `hasher.js` 工具模块用于 SHA-256 文件哈希

### 变更
- **CLI**：manifest 版本从 3.0.0 升级至 3.1.0
  - 新增 `fileHashes` 字段追踪文件完整性
  - 向后兼容旧版 manifest

### 修复
- **CLI**：修复 `uds check` 错误显示「Skills 已标记为已安装但找不到」警告
  - 现在正确识别 Plugin Marketplace 安装路径（`~/.claude/plugins/cache/`）
- **CLI**：修复 `uds update` 命令失败并显示「undefined」错误
  - 为异步 `copyStandard()` 和 `copyIntegration()` 调用新增遗漏的 `await`

## [3.3.0] - 2026-01-08

### 新增
- **Skills**：新增 9 个斜线命令，用于手动触发工作流程
  - `/commit` - 生成 conventional commit message
  - `/review` - 执行系统性代码审查
  - `/release` - 引导发布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 撰写用户故事和需求
  - `/sdd` - 创建规格文档
  - `/tdd` - 测试驱动开发工作流程
  - `/docs` - 创建/更新文档
  - `/coverage` - 分析测试覆盖率
- **Core**：新增测试驱动开发 (TDD) 标准
  - 新增 `core/test-driven-development.md`，涵盖 Red-Green-Refactor 循环
  - SDD + TDD 集成工作流程指南
- **Skills**：新增 `tdd-assistant` 技能（第 15 个技能）

### 变更
- **Skills**：简化斜线命令格式，从 `/uds:xxx` 改为 `/xxx`
  - 移除 `uds:` 命名空间前缀，使命令调用更简洁
- **Plugin Marketplace**：将 marketplace 名称从 `universal-dev-standards` 改为 `asia-ostrich`
  - 新安装命令：`/plugin install universal-dev-standards@asia-ostrich`

### 修复
- **CLI**：`uds skills` 现在优先检测新的 `@asia-ostrich` marketplace
- **CLI**：将 `tdd-assistant` 添加至 standards-registry.json

### 迁移指南
如果你使用旧的 marketplace 名称安装，请进行迁移：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### 新增
- **Skills**：新增 9 个斜线命令，用于手动触发工作流程
  - `/commit` - 产生 commit message
  - `/review` - 执行代码审查
  - `/release` - 引导发布流程
  - `/changelog` - 更新变更日志
  - `/requirement` - 撰写用户故事
  - `/sdd` - 建立规格文件
  - `/tdd` - TDD 工作流程
  - `/docs` - 文档撰写
  - `/coverage` - 测试覆盖率
  - 命令与技能的差异：命令为手动触发，技能为自动触发

### 修复
- **CLI**：`uds skills` 现在优先检测新的 `@asia-ostrich` marketplace
  - 当检测到旧版 `@universal-dev-standards` marketplace 时显示迁移提示
  - 确保迁移期间的兼容性

## [3.3.0-beta.4] - 2026-01-07

### 变更
- **Plugin Marketplace**：将 marketplace 名称从 `universal-dev-standards` 改为 `asia-ostrich`
  - 新安装命令：`/plugin install universal-dev-standards@asia-ostrich`
  - 这提供与 AsiaOstrich 组织更好的品牌一致性

### 迁移指南
如果你使用旧的 marketplace 名称安装，请进行迁移：

```bash
# 1. 卸载旧版本
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. 安装新版本
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### 修复
- **CLI**：将 `tdd-assistant` 新增至 standards-registry.json
  - 新增 TDD 的技能文件列表和标准项目
  - `uds skills` 现在正确显示 15/15 个技能

## [3.3.0-beta.2] - 2026-01-07

### 新增
- **Core**：新增测试驱动开发 (TDD) 标准
  - 新增 `core/test-driven-development.md` 涵盖 Red-Green-Refactor 循环、FIRST 原则、TDD vs BDD vs ATDD
  - SDD + TDD 集成工作流程指引
  - ML 测试边界（模型准确度 vs 数据工程）
  - 遗留系统的 Golden Master 测试
- **Skills**：为 Claude Code 新增 `tdd-assistant` 技能（第 15 个技能）
  - `skills/tdd-assistant/SKILL.md` - TDD 工作流程指引
  - `skills/tdd-assistant/tdd-workflow.md` - 逐步 TDD 流程
  - `skills/tdd-assistant/language-examples.md` - 6 种语言范例
  - 所有 TDD 文件的完整繁体中文翻译

### 变更
- **核心标准**：更新相关标准中的交叉引用
  - `spec-driven-development.md` - 新增 TDD 集成引用
  - `testing-standards.md` - 新增 TDD 交叉引用
  - `test-completeness-dimensions.md` - 新增 TDD 交叉引用
- **发布流程**：扩展预发布检查清单，加入完整的文件验证
  - 新增版本文件检查清单，涵盖所有版本相关文件
  - 重新命名为文档验证检查清单，加入正确性验证
  - 新增内容正确性验证区块，包含 grep 指令
  - 使用 `locales/*` 通配符涵盖所有语言版本

## [3.2.2] - 2026-01-06

### 新增
- **CLI**：新增 `uds skills` 指令列出已安装的 Claude Code skills
  - 显示来自 Plugin Marketplace、用户级别和项目级别的安装
  - 显示每个安装的版本、路径和 skill 数量
  - 对已弃用的手动安装显示警告
- **CLI**：根据安装位置改善 Skills 更新指示

### 弃用
- **Skills**：通过 `install.sh` / `install.ps1` 手动安装现已弃用
  - 建议：使用 Plugin Marketplace 以获得自动更新
  - 脚本将显示弃用警告并要求确认
  - 将在未来的主要版本中移除

### 变更
- **CLI**：`uds update` 现在对手动安装的 Skills 显示弃用警告
  - 建议迁移至 Plugin Marketplace
- **Skills**：更新 README.md 将手动安装标记为弃用

### 修复
- **CLI**：更新标准注册表版本至 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### 新增
- **CLI**：根据安装位置改善 Skills 更新指示
  - Marketplace：通过 Plugin Marketplace UI 更新的指引
  - 用户级别：`cd ~/.claude/skills/... && git pull`
  - 项目级别：`cd .claude/skills/... && git pull`

### 修复
- **CLI**：更新标准注册表版本至 3.2.2
  - 让 `uds update` 能检测现有项目的新版本

## [3.2.2-beta.1] - 2026-01-05

### 新增
- **Skills**：新增发布流程指南，提供完整的发布流程
  - 新增 `skills/release-standards/release-workflow.md` 包含逐步发布指示
  - 涵盖 beta、alpha、rc 和稳定版发布工作流程
  - 包含 npm dist-tag 策略、疑难排解和 AI 助理指南
  - 在 CLAUDE.md 中新增发布流程章节供 AI 助理参考
- **CLI**：为 AI 工具集成新增对话语言设定
  - 所有 AI 工具集成文件现在都包含对话语言指示
  - 支持英文、繁体中文和双语模式
  - 为 Claude Code 用户生成包含语言设定的 CLAUDE.md
- **CLI**：为 prompts 和 utils 模块新增完整测试
  - 测试覆盖率从 42.78% 提升至 72.7%
  - 总测试数从 94 增加至 210

### 修复
- **CLI**：仅在 Claude Code 是唯一选择的 AI 工具时才询问 Skills
  - 修复选择多个 AI 工具与 Skills 时可能导致其他工具遗漏完整标准的问题
- **CI/CD**：修复 npm 发布工作流程，正确标记 beta/alpha/rc 版本
  - 在 `.github/workflows/publish.yml` 中新增自动版本检测
  - Beta 版本现在使用 `@beta` 标签而非 `@latest`
  - 用户现在可以使用 `npm install -g universal-dev-standards@beta` 安装 beta 版本

### 变更
- **核心规范**：为 5 个核心标准新增业界参考标准
  - `error-code-standards.md` v1.0.0 → v1.1.0: RFC 7807, RFC 9457, HTTP Status Codes
  - `logging-standards.md` v1.0.0 → v1.1.0: OWASP Logging, RFC 5424, OpenTelemetry, 12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0: SWEBOK v4.0 Ch.10 (Software Quality)
  - `checkin-standards.md` v1.2.5 → v1.3.0: SWEBOK v4.0 Ch.6 (Configuration Management)
  - `spec-driven-development.md` v1.1.0 → v1.2.0: IEEE 830-1998, SWEBOK v4.0 Ch.1 (Requirements)
- **测试标准**：新增 SWEBOK v4.0 参考和新章节
  - `testing-standards.md` v2.0.0 → v2.1.0: Testing Fundamentals, Test-Related Measures, Pairwise/Data Flow Testing
- **文档**：更新 MAINTENANCE.md 加入 npm dist-tag 策略
  - 新增不同版本模式的 dist-tag 表格
  - 新增手动修正标签的指令说明

## [3.2.1-beta.1] - 2026-01-02

### 新增
- **CLI**：在 Skills 安装流程中新增 Plugin Marketplace 支持
  - 在 Skills 安装提示中新增「Plugin Marketplace (推荐)」选项
  - CLI 在 manifest 中追踪通过 marketplace 安装的 Skills，不尝试本地安装
  - `uds check` 指令现在会显示 marketplace 安装状态

### 修复
- **CLI**：修复 standards registry 中通配符路径处理导致 404 错误
  - 将 `templates/requirement-*.md` 通配符替换为明确文件路径
  - 为 requirement-checklist.md、requirement-template.md、requirement-document-template.md 新增明确条目
- **CLI**：修复 `uds init`、`uds configure` 和 `uds update` 指令执行后程序未退出的问题
  - 新增明确的 `process.exit(0)` 以防止 inquirer readline interface 阻挡程序终止

## [3.2.0] - 2026-01-02

### 新增
- **Claude Code Plugin Marketplace 支持**：启用通过 Plugin Marketplace 分发
  - 新增 `.claude-plugin/plugin.json` - Plugin manifest 配置
  - 新增 `.claude-plugin/marketplace.json` - Marketplace 分发配置
  - 新增 `.claude-plugin/README.md` - Plugin 文档和维护指南
  - 更新 `skills/README.md` 新增方法 1：Marketplace 安装（推荐）

### 优点
- 用户可以用单一指令安装所有 14 个技能：`/plugin install universal-dev-standards@universal-dev-standards`
- 新版本发布时自动更新
- 通过 Claude Code marketplace 提升可发现性
- 保持与脚本安装的向后兼容性（方法 2 和 3）

### 变更
- 在 `CLAUDE.md` 新增 AI 助手对话语言要求（繁体中文）

### 修复
- 修复 CLI 版本读取，改用 `package.json` 而非硬编码值

## [3.1.0] - 2025-12-30

### 新增
- **简体中文 (zh-CN) 翻译**：为简体中文用户提供完整本地化
  - 新增 `locales/zh-CN/README.md` - 完整 README 翻译
  - 新增 `locales/zh-CN/CLAUDE.md` - 项目指南翻译
  - 新增 `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows 指南翻译
- 在所有 README 版本中新增语言切换链接（EN, zh-TW, zh-CN）

- **完整 Windows 支持**：为 Windows 用户提供完整的跨平台兼容性
  - 新增 `.gitattributes` 确保跨平台换行符一致性
  - 新增 `scripts/check-translation-sync.ps1` - 翻译检查器 PowerShell 版本
  - 新增 `skills/install.ps1` - Skills 安装器 PowerShell 版本
  - 新增 `scripts/setup-husky.js` - 跨平台 Husky 设定脚本
  - 新增 `docs/WINDOWS-GUIDE.md` - 完整的 Windows 开发指南
- **5 个新 Claude Code 技能**：技能库从 9 个扩充至 14 个
  - `spec-driven-dev` - SDD 工作流程指引（触发词：spec, proposal, 提案）
  - `test-coverage-assistant` - 7 维度测试完整性框架（触发词：test coverage, dimensions, 测试覆盖）
  - `changelog-guide` - 变更日志撰写标准（触发词：changelog, release notes, 变更日志）
  - `error-code-guide` - 错误码设计模式（触发词：error code, 错误码）
  - `logging-guide` - 结构化日志标准（触发词：logging, log level, 日志）
- 新增**双重性质标准**分类至 `STATIC-DYNAMIC-GUIDE.md` - 同时具有静态和动态组件的标准
- 新增**动态 vs 静态分类**章节至 `MAINTENANCE.md` - 标准分类指南
- 将 `checkin-standards` 核心规则加入 `CLAUDE.md` 作为静态标准
- 新增 5 个新技能的完整繁体中文翻译（共 10 个文件）

### 变更
- 更新 `cli/package.json` 的 prepare 脚本使用跨平台 `setup-husky.js`
- 更新 `README.md`、`cli/README.md`、`CLAUDE.md` 添加 Windows 安装说明
- 更新 `STATIC-DYNAMIC-GUIDE.md` 至 v1.1.0 - 引入双重性质标准概念，更新至 14 个技能
- 更新 `MAINTENANCE.md` - 新增 `STATIC-DYNAMIC-GUIDE.md` 交叉引用，扩展 Workflow 4 分类检查清单
- 更新 `MAINTENANCE.md` 技能表格从 9 个扩充至 14 个（35 个技能文件 + 10 个共用/README = 45 个文件）
- 同步 `MAINTENANCE.md` 和 `STATIC-DYNAMIC-GUIDE.md` 的繁体中文翻译

## [3.0.0] - 2025-12-30

### 新增
- **AI 优化标准架构**：新增 `.ai.yaml` 双格式支持
- 新增 `ai/standards/` 目录，包含 15 个 AI 优化标准文件
- 新增 `ai/options/` 目录，包含语言特定和工作流程选项
- 新增 `MAINTENANCE.md` - 项目维护指南与文件结构概览
- 新增 `ai/MAINTENANCE.md` - AI 标准维护工作流程指南
- 新增 `STANDARDS-MAPPING.md` - 标准与技能对应矩阵
- 新增 6 个 AI 优化标准：
  - `anti-hallucination.ai.yaml` - AI 协作标准
  - `checkin-standards.ai.yaml` - 代码签入标准
  - `documentation-writing-standards.ai.yaml` - 文档撰写指南
  - `spec-driven-development.ai.yaml` - SDD 工作流程
  - `test-completeness-dimensions.ai.yaml` - 7 维度测试框架
  - `versioning.ai.yaml` - 语义化版本标准
- 新增所有新标准和技能的完整繁体中文翻译（共 78 个文件）

### 变更
- 统一核心标准的版本格式为 `**Version**: x.x.x`
- 为所有 zh-TW 翻译的 YAML front matter 新增 `source` 字段以追踪同步
- 更新翻译同步脚本，改进验证功能

### 修正
- 修正 `core/error-code-standards.md` 和 `core/logging-standards.md` 的版本格式不一致
- 修正 zh-TW 技能翻译中的来源路径

## [2.3.0] - 2025-12-25

### 新增
- **多语言支持**：新增 `locales/` 目录结构用于国际化
- 新增所有文档的繁体中文 (zh-TW) 翻译（44 个文件）
  - `locales/zh-TW/core/` - 13 个核心规范翻译
  - `locales/zh-TW/skills/` - 25 个 skill 文件翻译
  - `locales/zh-TW/adoption/` - 5 个采用指南翻译
  - `locales/zh-TW/README.md` - 完整的中文 README
- 为所有英文文档新增语言切换器
- 新增 `scripts/check-translation-sync.sh` - 翻译同步检查脚本
- 为 Skills 文档新增静态与动态规范分类说明
- 新增 `templates/CLAUDE.md.template` - 静态规范集成范本
- 新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 详细分类指南

### 变更
- 将双语内容分离到专用语言文件（AI 工具减少约 50% token 消耗）
- 英文版本现在仅包含英文内容并带有语言切换器
- 更新 `skills/README.md` - 新增静态与动态区块及触发关键字

## [2.2.0] - 2025-12-24

### 新增
- 为所有 Skills 文档新增标准区段（23 个文件）
  - 8 个 SKILL.md 文件：新增目的、相关标准、版本历史、授权区段
  - 15 个支持文档：新增双语标题、metadata 及标准区段

### 变更
- 统一 Skills 文档格式与 Core 标准
- 新增 Skills 与 Core 文档之间的交叉引用

## [2.1.0] - 2025-12-24

### 新增
- **集成 Skills**：将 `universal-dev-skills` 合并至 `skills/` 目录
- 新增 `skills/` - 所有 Claude Code Skills 现已包含在主仓库中
- 新增 `skills/_shared/` - 用于多 AI 工具支持的共享模板
- 为未来 AI 工具新增占位目录：`skills/cursor/`、`skills/windsurf/`、`skills/cline/`、`skills/copilot/`

### 变更
- CLI 现在从本地 `skills/` 安装技能，而非从远程仓库获取
- 更新 `standards-registry.json` 以反映集成的 skills 架构

### 迁移指南
- 如果您之前单独使用 `universal-dev-skills`，现在可以使用本仓库中包含的 skills
- 执行 `cd skills && ./install.sh` 从集成位置重新安装 skills

## [2.0.0] - 2025-12-24

### 变更

**破坏性变更**：项目从 `universal-doc-standards` 更名为 `universal-dev-standards`

这反映了项目扩展的范围，涵盖所有开发标准，而不仅仅是文档。

#### 迁移指南

- 从新的仓库重新 clone：`git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- 如果使用全局安装，请在 CLI 目录重新执行 `npm link`
- 使用 `npx universal-dev-standards` 取代 `npx universal-doc-standards`
- `uds` 命令保持不变

### 新增
- 新增 `extensions/languages/php-style.md` - 基于 PSR-12 的 PHP 8.1+ 编码风格指南
- 新增 `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ 开发模式

## [1.3.1] - 2025-12-19

### 新增
- 新增 Mock 限制章节至 `testing-standards.md` - Mock 需要集成测试的指南
- 新增测试数据管理模式至 `testing-standards.md` - 识别码区分与复合键指南
- 新增「何时需要集成测试」表格至 `testing-standards.md` - 6 种必须集成测试的情境

## [1.3.0] - 2025-12-16

### 新增
- 新增 `changelog-standards.md` - 完整的变更日志撰写指南
- 新增决策树和选择矩阵至 `git-workflow.md`，协助工作流程策略选择
- 新增语言选择指南至 `commit-message-guide.md`，协助选择提交信息语言

### 变更
- 更新 `versioning.md` - 新增交叉引用至 changelog-standards.md
- 更新 `git-workflow.md` - 在发布准备中新增 CHANGELOG 更新指南
- 更新 `zh-cn.md` - 新增术语：变更日志、发布说明、破坏性变更、弃用、语义化版本
- 更新 `changelog-standards.md` - 与 versioning.md 统一排除规则，新增交叉引用
- 更新 `checkin-standards.md` - 阐明 CHANGELOG 更新仅适用于用户可感知的变更
- 更新 `code-review-checklist.md` - 与 changelog-standards.md 统一 CHANGELOG 区段

### 修正
- 修正 `commit-message-guide.md` 和 `documentation-writing-standards.md` 标头格式不一致问题
- 统一交叉引用使用 markdown 链接格式而非反引号

## [1.2.0] - 2025-12-11

### 新增
- 新增 `project-structure.md` - 项目目录结构规范
- 在 `documentation-structure.md` 新增实体 DFD 层

### 变更
- 更新 `documentation-structure.md` - 阐明流程/图表分离，改进文件命名规范
- 更新 `checkin-standards.md` - 新增目录卫生指南
- 改进通用性，将项目特定范例替换为通用占位符

## [1.1.0] - 2025-12-05

### 新增
- 新增 `testing-standards.md` - 完整测试金字塔标准（单元/集成/系统/端对端测试）
- 新增 `documentation-writing-standards.md` - 文档内容需求标准

### 变更
- 更新 `anti-hallucination.md` - 强化出处标示指南
- 更新 `zh-cn.md` - 与 commit-message-guide.md v1.2.0 同步

## [1.0.0] - 2025-11-12

### 新增
- 初始发布，包含核心标准
- 核心标准：反幻觉、签入标准、提交信息指南、Git 工作流程、代码审查检查清单、版本标准、文档结构
- 扩充：C# 风格指南、繁体中文本地化
- 范本：需求文档范本
- 集成：OpenSpec 框架

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.1...HEAD
[5.7.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.0...v5.7.1
[5.7.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.6.0...v5.7.0
[3.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
