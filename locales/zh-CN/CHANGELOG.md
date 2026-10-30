---
source: ../../CHANGELOG.md
source_version: 6.14.1-beta.2
translation_version: 6.14.1-beta.2
last_synced: 2026-10-29
source_hash: 5dcc2a09effc
status: current
---

# 变更日志

> **语言**: [English](../../CHANGELOG.md) | [繁體中文](../zh-TW/CHANGELOG.md) | 简体中文

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，
并且本项目遵循[语义化版本](https://semver.org/)。

## [Unreleased]

## [6.14.1-beta.2] - 2026-10-30

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。**在 6.14.1-beta.1 之上的一项修复：** `uds update --with-hooks` 现在会替换旧版 UDS 安装、且没有人改过的 hook 脚本，即使 hook 已经配置好。因此已有危险指令 hook 的项目会拿到会拦截的版本；beta.1 留下的是从不拦截的旧副本，还得你手动复制文件。包含以下 6.14.1-beta.1 的所有内容。

### 修复

- **`uds update --with-hooks` 现在会替换旧版 UDS 安装、且没有人改过的 hook 脚本，即使 hook 已经配置好。** 在 6.14.1-beta.1，已经有危险指令 hook 的项目会留着 6.14.0 的 `scripts/hooks/check-dangerous-cmd.mjs`，它以 exit 1 结束、从不拦截：安装器看到 hook 配置“已存在”，打印“已安装、未动”，从不比对旁边的脚本（实测：`uds update --with-hooks`、`uds update --with-hooks --force` 与 `uds update --apply` 都让它原封不动）。现在不论配置是否已存在，每个工具都会比对。与出货版不同的脚本按内容判断：若与历代 UDS 某版出货的内容逐字节相同（忽略换行符，所以 Windows 在 `core.autocrlf` 下的检出仍算），说明没人改过，直接替换，输出会列出每个文件及它来自哪一版；其他任何差异都说明被改过：保留、列出，并说明如何强制。历代内容列在 `cli/src/installers/hook-script-fingerprints.json`，由 `scripts/generate-hook-fingerprints.mjs` 从 git 标签生成（不是手写，也不会被缩减）；单元测试在 `scripts/hooks/` 任一脚本的内容不在清单里时失败，所以改了 hook 就无法不更新清单而提交，`scripts/pre-release-check.sh` 的第 29 步另检查每个发版标签。报告依“实际写入”而非“测量结果”。**`--force`：** 搭配 `--with-hooks` 时，现在连被改过的 hook 脚本也会用出货版覆盖，hook 已经安装时也一样（以前只在补装缺少的 hook 时才会），输出会说覆盖了几个；你的修改没有备份。`--with-hooks --plan` 列出将替换或覆盖的项目，且不写任何文件。**`--apply`、单独的 `--force` 与普通的 `uds update` 不管理 hook 脚本，仍然不会替换它们；**当其中一个是过期且未改过的副本时，它们现在会打印一行说明，并指出 `uds update --with-hooks`。**谁会看到差异：** 用 6.14.0 或更早版本安装过 hook、并在这个版本运行 `uds update --with-hooks` 的人：他们没改过的每个 hook 脚本都会被替换（替换的文件有记录，所以 `uds uninstall` 仍会移除）。**如果你改过 hook 脚本**，它会被保留，在你手动合并或使用 `--force` 之前拿不到之后的修复（以危险指令 hook 来说，就是 exit 2 的修复）。

### 测试

- **macOS 发布后验收不再丢失步骤输出的结尾（在 6.14.0 与 6.14.1-beta.1 发现）。** `xspec482-init-interactive-manual` 只在 macOS 上红：捕获到的输出在一行中间断掉，没有驱动程序最后打印的 `DRIVE-EXIT=0`，但 `uds init` 其实成功了。`scripts/beta-acceptance/steps.json` 里的验收辅助程序（两个交互式驱动程序与三个小包装）在写出结果后立刻调用 `process.exit()`。标准输出是管道时，Node 在 macOS 上把放不进管道的部分异步写出，`process.exit()` 会把剩下的丢掉；Linux 上同样的写入是同步的，所以同一步在那里是绿的。现在它们等写完才结束（写入的回调，或 `process.exitCode`）。验证：新增一个测试，用真正的驱动程序文本对一个打印 300 KB 的替身、搭配读得很慢的读取端；在 macOS 上，修改前只收到 65,536 字节、没有 `DRIVE-EXIT` 行，修改后收到全部输出。**没有证明的部分：** 真实步骤只打印约 2.8 KB，放得进管道，而且在维护者的 macOS 上修改前后都通过，所以 CI 上输出丢失出自这个原因是合理的判断，不是测到的结果；以本版的发布后验收为准。仅改动测试与验收程序；用户运行的东西没有变。

## [6.14.1-beta.1] - 2026-10-30

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。**安全修正：** 危险指令 hook（`scripts/hooks/check-dangerous-cmd.mjs`）侦测到时以 exit 1 回报，而 Claude Code 不把 exit 1 当成拦截，因此 6.14.0 及更早版本从未挡下任何指令（重播 11,617 笔真实 shell 调用，规则命中 26 次，宿主挡下 0 次）；现在改以 exit 2 结束，且只判断指令本身。**在这个版本，已经安装这个 hook 的项目会保留旧的脚本副本，直到你手动换掉；6.14.1-beta.2（见上）已修复：`uds update --with-hooks` 会替换它。**另修正：提交信息 hook 略过 `git commit -am "..."` 与其他合并短旗标，以及 `uds update --skills --commands` 只运行两者其中之一。包含以下 6.14.0 的所有内容。

### 新增

- **mock-boundary 1.3.0：能拦截的 hook 必须以宿主运行它的方式测试，并使用各宿主读取的信号。** UDS 自己的 `scripts/hooks/check-dangerous-cmd.mjs` 以 exit 1 结束，而 Claude Code 只在 exit 2 时拦截；它的测试导入比对函数，因此一直是绿的；重播 11,617 笔真实 shell 调用，规则命中 26 次，宿主挡下 0 次（已于 #281 修正）。标准现在规定：能挡下工具调用、提示或回合的 hook，必须（MUST）至少有一支测试把它当成进程启动，送入宿主自己的 stdin 数据，并断言宿主读取的结束码或 stdout JSON（H1）；导入并调用内部函数的测试不计入，只断言「非 0」也不计入。同时应该（SHOULD）以同样方式运行一个放行案例（H2），并确认改掉挡下信号时测试会变红（H3）。标准附上一张表，列出 Claude Code、Codex、Gemini CLI 与 Antigravity CLI 在 PreToolUse 类事件中各自视为「已挡下」的信号，每一列都附官方出处，宿主页面没写的写「未查到」（Antigravity 的结束码行为没有文档，且其 stdin 使用 `toolCall` 而非 `tool_input`）。标准也注明：以同一份规则清单同时决定「该挡」与「不该挡」的真实调用重播，只证明接线，不证明规则（重播中 26 次命中全部与规则一致，0 次是真正的危险，而 `rm -fr /` 对它是隐形的）。`turn-completion-integrity` 1.5.1 仅在非 Stop 事件上指向新表；其 Stop 表与规则不变，信号只写在一处。对 UDS 自己出货的 hook 套用 H1 的 CI 闸门是 `npm run check:hook-entry-tests`。**谁会看到差异：** 采用者在下次 `uds update` 取得新文字；除非项目出货了拦截型 hook（此时标准要求多一支测试），否则项目内没有任何东西改变。同时更正 `mock-boundary.md` 的版本：同一份内容在 `mock-boundary.md` 写 1.1.0、在 `mock-boundary.ai.yaml` 写 1.2.0，现在两者都是 1.3.0。

### 修复

- **危险指令 hook 现在会拦截，且不再挡下一般的清理指令。** `scripts/hooks/check-dangerous-cmd.mjs`（安全标准的 PreToolUse/Bash hook）从来没有挡下过任何东西：它以 exit 1 结束，而 Claude Code 只在 exit 2 时拦截工具调用，所以指令照常运行。它还拿整段 stdin JSON 来比对，而不是 `tool_input.command`。重播 11,617 笔真实 shell 调用，旧的 `rm -rf /` 规则命中 26 次，其中 25 次是无害的暂存清理（`rm -rf /tmp/x`），而 `rm -fr /` 与 `rm -r -f /` 却漏网。现在 hook 读取 `tool_input.command`（stdin 不是 JSON 时读取原始指令列），以 exit 2 拦截并在 stderr 写出规则名称；`rm` 只在递归且目标正好是 `/`、`/*`、`~`、`~/` 或 `$HOME` 时才拦截，旗标顺序不拘，`sudo` 之后也适用。原本从未命中任何东西的 fork bomb 规则（`()` 是空的 regex 群组）现在会命中；没有点号的 `mkfs`、没有 `if=` 的 `dd of=/dev/…`，以及对 `/` 之下路径的 `chmod -R 777`（以前会误中 `/home/me/x`）改以指令词判断，而不是子字符串。**行为改变：** `rm -rf /home` 与其他根目录之下的路径不再被拦截；它们不是这条规则原本要防的对象。命令行模式（`node check-dangerous-cmd.mjs "<command>"`）现在也以 exit 2 而非 1 结束。 **在这个版本，已经安装这个 hook 的项目不会从 `uds update` 获得修复：** 安装器会保留 `scripts/hooks/` 里已有的 hook 脚本（实测：`uds update --with-hooks`、`uds update --with-hooks --force` 与 `uds update --apply` 都让旧的 `check-dangerous-cmd.mjs` 原封不动，它对 `rm -rf /` 仍以 exit 1 结束），当时的解法是手动把随附的文件复制过去覆盖。6.14.1-beta.2（见上）已修复这一点。在这个版本上运行 `uds init --with-hooks` 的项目拿到的是修复后的脚本。
- **结构化日志 hook 现在会传到模型。** `scripts/hooks/check-logging-standard.mjs`（PostToolUse/Write）原本以 exit 1 结束，Claude Code 视为不拦截的 hook 错误，模型看不到消息；现在改以 exit 2，让 stderr 的建议回馈给模型，且只判断写入的文字（`tool_input.content` 或 `new_string`），不看 payload 的其余部分。Write 已经发生，所以这无法复原任何事。
- **提交信息 hook 现在检查 git 在命令行上接收消息的每一种写法，且不再挡下它误读的消息。** `scripts/hooks/validate-commit-msg.mjs`（PreToolUse/Bash hook）原本只在单独的 `-m` 之后找消息，所以 `git commit -am "wip"`（由它添加的进入点测试发现）与其他所有合并短旗标（`-vam`、`-sam`）都不经检查就放行。现在它像 git 一样读取命令：`-m` 出现在短旗标串的任何位置，值附在后面（`-m"msg"`、`-mmsg`、`-am"msg"`）或接在下一个词，`--message=msg`、`--message msg` 与 git 不含糊的缩写（`--mess=msg`），以及串接命令中的每一个 `git commit`（`git commit -m "feat: a" && git commit -m wip` 在第二个被挡下）。多个 `-m` 如 git 一样以空行相连，所以被判断的是第一个，即主旨。同一次重写也修掉两种误挡，成因是在读取引号之前就在 `;`、`&&`、`|` 与换行处切开命令：消息本身含其中之一（`-m "feat: a; b"`），以及 Claude Code 最常写的 `-m "$(cat <<'EOF' ... EOF)"` 形式——它以前被当成垃圾消息 `"$(cat` 挡下，现在改以本文判断。消息文字不在命令行上的提交照旧放行：`-F`、`-C`/`-c`、`--amend --no-edit`、编辑器、`--fixup`/`--squash`（git 自己写 `fixup!` 主旨，`-m` 变成本文），以及由 shell 计算的消息（`-m "$MSG"`、`$(...)`、反引号）。**行为改变：** 以前放行的命令，在消息不是 Conventional Commit 时现在会被挡下：`-am`/`-vam` 风格的提交、`--message`、串接命令的第二个提交，以及 `VAR=value` 之后的提交。
- **`uds update --skills --commands` 现在两者都更新；以前只更新一边，对另一边什么也没说（在 6.14.0 的 Windows 11 上发现）。** 两个旗标都带并加 `--apply` 时，只有指令运行：Skills 段落从未出现，manifest 里的 Skills 停在旧版本（一个项目：51 个指令已更新，Skills 仍在 6.11.0），结束码是 0。两个旗标都带但不加 `--apply` 时，只有 Skills 运行，`--commands` 被丢掉。旗标的顺序没有差别。原因：两个步骤各自在完成时结束整个进程，所以另一个永远没开始，且不加 `--apply` 的路径在第一个之后就返回。现在两者都运行，不论旗标顺序都是 Skills 先、指令后，各自印出自己的段落，并以两者中较差的结束码结束（任一边失败即非 0，`--apply` 对帐已记下的失败也一样）。单一范围（只带 `--skills` 或只带 `--commands`）的行为与输出和以前完全相同，`--plan --skills --commands` 本来就会规划两者，没有改变。**谁会看到差异：** 传过两个旗标的人。请再运行一次 `uds update --apply --yes --skills --commands`；经过那次有问题的运行的项目没有损坏，只是它的 Skills（或指令）落后。有一件事这次没有改变：只带单一范围的 `--apply` 在对帐中失败时仍以结束码 0 结束，因为该步骤一向以明确的 0 结束进程。

### 变更

- **每个能拦截的 hook 现在都需要一支以宿主方式运行它的测试，并由 CI 强制运行（`npm run check:hook-entry-tests`）。** 新的 CI 工作 `scripts/check-hook-entry-tests.mjs` 从安装器推出 UDS 出货的 hook（各标准的 `enforcement:` 区块，加上 Codex、Gemini 与 Antigravity 的转接器），凡是能拦截的 hook，除非 `cli/tests` 下有测试真的启动该脚本、从 stdin 送入宿主格式的 payload 并断言 exit 2（Stop hook 则断言 stdout 的决定），否则失败。未分类的出货脚本同样失败。这是有已记载盲点的静态检查，附自我测试与样本测试。它抓到的第一个是没有进入点测试的 `validate-commit-msg.mjs`，现已补上一支。这就是上方 `mock-boundary` 1.3.0 规则所指的检查。它在 UDS 自己的 CI 中运行，不随 npm 套件出货。
- **正式版闸门现在也在发布时运行，且正式版必须等于它验收过的预发布版（XSPEC-498）。** 闸门原本只在 `scripts/bump-version.mjs` 里运行，所以从别处创建的 GitHub Release 会绕过它直接走到 `npm publish`；6.14.0 就是这样发出去的，比它验收过的预发布版（6.14.0-beta.15）多了四个修正与一次翻译同步。`publish.yml` 现在对正式版（预发布版不受影响）在 `npm publish` 之前运行 `scripts/beta-acceptance/check-stable-gate.mjs`，checkout 取得完整历史与 tag。闸门添加一条规则：HEAD 与预发布版 tag 的差异只能是版本档与发版纪录（三份更新日志、`docs/PRE-RELEASE.md`、验收报告）；其他有变动的文件会使发布被拒绝并被列出，找不到 tag 或不是 git 保存库的文件夹同样被拒绝。版本档清单移到 `scripts/lib/version-files.mjs`，`bump-version.mjs` 现在由它写入，写入者与闸门共用同一份清单。**谁会看到差异：** 发布正式版的维护者；采用者与 CLI 用户看不到任何变化。
- **开发相依套件已更新，`npm audit` 高风险公告从 3 笔降为 0。** 只动 `cli/package-lock.json`（`npm audit fix`）：`vite` 8.3.0 升到 8.3.5、`brace-expansion` 5.0.9 升到 5.0.12、`source-map-js` 1.2.1 升到 1.2.2，加上它们带进来的 `rolldown`、`postcss`、`nanoid` 升级；变动的每个套件都是开发相依，所以用户安装时不会拿到任何一项（#279）。6.14.0 之后的 Dependabot 更新是 `@commitlint/cli` 与 `@commitlint/config-conventional` 由 21.2.3 升到 21.2.4（根目录 `devDependencies`，#275、#276），以及 `/cli` 中 `lint-staged` 17.5.1 升到 17.6.0、`@vitest/coverage-v8` 5.0.3 升到 5.0.5、`@inquirer/prompts` 8.7.2 升到 8.7.4（#263、#261、#262）。这三项 `/cli` 更新只改了 `cli/package-lock.json`：`cli/package.json` 与 6.14.0 相同，所以用户安装时解析到的版本范围（`@inquirer/prompts` 是运行期相依，范围 `^8.7.2`）没有改变。

### 测试

- **修正正式版闸门测试与语系安装测试在 Windows CI 上的时间上限。** `xspec-471-r5-stable-gate.test.js` 中会多次启动 `bump-version.mjs` 的八项测试，现在共用一个具名的 120 秒上限（其中四项曾在 `windows-latest` 上超过预设的 30 秒：#284 计入三项，#286 又补上一项）；`init-every-declared-locale.test.js` 的每个语系安装现在各用一个以序号命名的文件夹，因为 `zh-cn` 与 `zh-CN` 在 Windows 与预设的 macOS 上是同一个文件夹，两个安装在里面互抢（准备阶段现在会拒绝忽略大小写后相同的名称，#280）。仅限测试；用户运行的东西没有任何改变。

## [6.14.0] - 2026-10-22

> **正式版发布**：包含下方 6.14.0-beta.1 至 beta.15 的所有内容，加上本节列出的 beta.15 之后的修正。beta.15 已在 Windows、macOS、Linux 完成发布后验收（0 项失败）。

### 修复

- **`manifest.integrations` 为空但工具仍在使用时，`uds update` 不再计划删除 CLAUDE.md**（[#269](https://github.com/AsiaOstrich/universal-dev-standards/issues/269)）。当 `integrations: []`、而 `aiTools` 含 `claude-code` 或留有 CLAUDE.md 的区块哈希记录时，计划会写「integration no longer configured」，`uds check` 却报告符合。现在列表为空或缺失时，改由 `aiTools` 与区块哈希记录推导集成。
- **移除集成时只删除 UDS 区块，保留用户写的内容。** `uds update --apply` 原本会删掉整个集成文件，连用户在 UDS 区块外写的文字一起删除。现在只移除标记区块；文件没有其他内容才删除；没有 UDS 区块的文件不动；标记重复时拒绝处理。
- **简体中文界面的 `uds init` 中，中文产出语言选项改标为繁体中文**（[#254](https://github.com/AsiaOstrich/universal-dev-standards/issues/254)）。该选项安装的是 UDS 唯一提供的中文提交选项（繁体），标签却写简体中文。想要简体提交信息可选双语。同一报告中的 `uds init` 闪退已在 6.14.0 较早的版本修正（XSPEC-482 R1）。
- **旧版只记 user 的 manifest 略过 Antigravity 时，`uds update` 会说明原因**（XSPEC-486 R2）。
- **Claude Code 插件不再把 README 当成命令或 agent 加载，设置也通过 `claude plugin validate`。** 插件安装会加载 `skills/commands/` 与 `skills/agents/` 下每一个 `.md`，所以 `README.md`、`COMMAND-FAMILY-OVERVIEW.md` 被当成命令，`skills/agents/README.md` 被当成一个 agent；`.claude-plugin/plugin.json` 的 `repository` 是对象，验证失败。`skills/.claude-plugin/plugin.json` 现在逐个列出 51 个命令与五个 agent，`repository` 改为字符串，`marketplace.json` 删掉两个 Claude Code 不读的 `metadata` 字段。命令名称不变（例如 `/universal-dev-standards:commit`）。`cli/scripts/check-plugin-manifest.mjs` 现在会推算安装实际加载什么，除非插件完整出货一种形式（全部命令或全部技能）且没有说明文件，否则失败；`check-version-sync` 与 `bump-version` 涵盖新的清单文件。已在 Claude Code 2.1.304 实测：无人值守的 session 以旧名称列出各命令与五个 agent，没有 README。

### 弃用

- **Claude Code 插件将在 7.0 改为安装 SKILL.md 技能，命令名称会改变。** 6.x 的插件安装 `skills/commands/` 下的旧版命令文件，而 `uds init` 安装 56 个 SKILL.md 技能；7.0 让插件也安装技能，`/universal-dev-standards:commit` 会变成 `/universal-dev-standards:commit-standards`，其余依此类推。没有对应技能的 16 个命令（`init`、`update`、`check`、`config`、`derive-*`、`reverse-*` 等）会在切换前补成技能。

### 变更

- **自采纳技能生成器现在除了 `.claude/skills/` 之外，还会派生出 `.agents/skills/`（Google Antigravity，Codex 也会读取），且漂移闸门同时覆盖两者（XSPEC-488 R3）。** Antigravity 从 `.agents/skills/` 读取项目技能。以前用 `uds config --type skills --ai-tool antigravity` 安装在那里的副本会游离在“自采纳技能漂移闸门”（Self-Adoption Skill Drift Gate）之外，在没有任何检查变红的情况下逐渐过时，因此 `scripts/generate-adoption-skills.mjs` 现在像处理 Claude Code 副本一样，从 `skills/` 和 `locales/zh-TW/skills/` 写入该副本；当任一副本与源文件不同时，`npm run check:adoption-skills` 将失败，且 `--self-test` 的各项分支会对两者同时运行。其内容与 `uds` 安装的内容相同：安装器对技能没有按 agent 分支的逻辑，将 antigravity、claude-code 和 codex 安装到三个语言区域为 zh-TW 的空目录中，差异仅在于 `.manifest.json` 中的 `agent` 行。Codex 和 Antigravity 共享该目录，因此一个目录即为一个目标，其 manifest 会指明它是为哪个 agent 采纳的（未指明两者的 manifest 视为“无法派生”，退出码 2）。`scripts/self-adoption-skills-baseline.json` 获得了一个 `.agents/skills` 条目（若无此条目，`check:trigger-surface` 会因“无基线条目”而失败），`check-docs-integrity.sh` 像跳过 `.claude/` 一样跳过 `.agents/`（其在副本中统计出 465 个链接警告，而没有副本时仅有 22 个），并且 `bump-version.mjs` 会重新生成两份 manifest。仅本仓库发生变更；`uds init` 和 `uds config` 的行为与之前相同。

## [6.14.0-beta.15] - 2026-10-14

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。修复了在选择 Google Antigravity 时交互式 `uds init` 崩溃（在 Windows 上的 6.14.0-beta.14 手动发现）、`uds update` 输出中的 Windows 路径分隔符，以及 `--format both` 计划（XSPEC-483）。包含以下 6.14.0-beta.14 中的所有内容。

### 修复

- **`uds update --plan` 不再计划删除 `--format both` 项目中每个标准的 AI 副本，且 `uds init --format both` 结束于当前形式（XSPEC-483 R1-R3）。** `--format both` 将每个标准和选项的人类可读副本（`.md`）和 AI 副本（`.ai.yaml`）放入 `.standards/`，但协调器将 `both` 读取为单一格式，仅期望 `.md` 文件，并将约 71 个 `.ai.yaml` 文件列为“不再被选定”；在该计划上执行 `uds update --apply` 本会删除已安装标准的一半。现在计划遵循 manifest 记录的格式：`both` 期望两个文件，且仅当 `format` 真正发生变化时才添加或删除文件（从 `both` 改为 `ai` 计划删除 `.md` 副本，从 `ai` 改为 `both` 计划创建它们）。因为计划已正确，XSPEC-482 R6 为这些项目跳过的收敛步骤现在也会为它们运行：通过 `uds init --format both` 刚刚创建的项目在预览中显示为“无需更改”（No changes needed）。用 `--format both` 创建的 6.11.0 或 6.14.0-beta.14 项目在升级时会保留每个 `.md` 和 `.ai.yaml`，且 `uds update --rollback` 会恢复其原有的文件。如果你应用了旧计划并丢失了 `.ai.yaml` 副本，`uds update --apply` 会重新创建它们。

- **交互式 `uds init` 不再在 Google Antigravity 上崩溃，且没有任何命令会索取工具本身没有的用户级技能文件夹（XSPEC-486 R1-R3，在 Windows PowerShell 上的 6.14.0-beta.14 手动发现）。** 在“你正在使用哪些 AI 工具？”中勾选 Claude Code 和 Google Antigravity 会在技能位置问题处以 `TypeError: Cannot read properties of undefined (reading 'replace')` 结束，退出码为 1 且未安装任何内容。Antigravity 拥有项目级技能文件夹（`.agents/skills/`），且故意不设用户级文件夹，但该问题为每个勾选的工具都构建了“用户级别”选项。现在它仅对拥有此类文件夹的工具提供用户级别；Antigravity 获得项目级别，像所有工具一样预先勾选。`uds init --yes` 从不询问该问题，这就是为何早期的测试均未触及它。在可能触及此问题的地方，同一类问题均已修复：`uds init --yes --skills-location user`、`uds config --type skills --ai-tool antigravity --skills-location user` 以及仅记录 `user` 的旧版 manifest 现在会排除 Antigravity 并说明原因（对其应使用 `--skills-location project`），路径表在缺少用户级文件夹时返回 `null` 而不是 `undefined`，且 `uds config --type skills` 中的“重新安装被拒绝的技能”现在会安装在你回答的级别上（之前读取了安装器忽略的键 `location`）。测试会模拟交互式 `uds init` 的输入（Claude Code + Antigravity，配合默认、手动和混合发布模式，并勾选问题中的所有工具），并针对路径表中的每个工具运行技能问题。

- **`uds update --plan` 和 `uds update --apply` 的错误列表在 Windows 上也使用 `/` 来命名技能与命令文件（XSPEC-486 R4，之所以发现是因为自 XSPEC-482 合入 main 以来，windows-latest 上的两个端到端测试一直变红）。** 计划中的标准行显示为 `.standards/testing.ai.yaml`，但技能和命令行是用 `path.join` 构建的，在 Windows 上显示为 `.claude\skills\commit-standards` 和 `.gemini\commands\ac-coverage.toml`，导致同一份计划和错误列表混合了这两种形式。协调器打印的每个项目相对路径现在都统一使用 `/`。Pull request 仅在 Ubuntu 上运行端到端作业，这就是该故障仅在推送到 main 之后才暴露的原因；路径的其他方面均未更改（用户级文件夹仍按其原本的绝对路径打印）。

## [6.14.0-beta.14] - 2026-10-13

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。取代 6.14.0-beta.13，后者的发版后验收在 16 个步骤上失败：一项产品回归（项目已是最新时仍保留废弃名称）以及仍期望 XSPEC-482 所修改行为的验收步骤。包含以下 6.14.0-beta.13 中的所有内容。

### 修复

- **`uds update --apply` 在项目已是最新且计划为空时，也会清除 UDS 无法担保的技能和命令名称（XSPEC-456 R4，由 6.14.0-beta.13 的发版后验收发现）。** 自 beta.6 以来，`--apply` 会从 `skills.names` / `commands.names` 中移除 `_shared` 和废弃名称，但仅通过协调器自身的运行来完成，而这只有在计划包含操作时才会发生。beta.13 让刚由 `uds init` 创建的项目立即可成为最新（XSPEC-482 R6），因此空计划变成了常态，触发了“一切已是最新”的提前返回，并将这些名称留在了 manifest 中。现在的提前返回也会丢弃它们，说明丢弃了多少个，并依然会推进记录的版本号。

## [6.14.0-beta.13] - 2026-10-13

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。修复了 beta.12 在 macOS 和 Linux 上针对未测项目重新测试所发现的问题（XSPEC-482 R1–R14）。
>
> **行为变更：**`uds update --apply` 现在在任何操作失败时**以 1 退出**；`uds init` 写入的 pre-commit hook 会运行 `check --ci`，因此它会**拒绝编辑已安装标准的提交**，且 `uds update` 会替换掉允许一切通过的旧 hook；`uds init --output-lang` 会**拒绝**没有对应选项文件的值；`uds release` 以显示语言打印（之前在所有语言下均打印繁体中文）；`uds compile` 会**合并**进 `.claude/settings.json`，而不是替换其触及事件的条目；`uds audit --report` 在交互模式下发送前会先询问。

### 修复

- **选择手动（Manual）或混合（Hybrid）发布模式不再导致 `uds init` 和 `uds config` 崩溃（XSPEC-482 R1，由 beta.12 macOS 重新测试发现）。** js-yaml 5 没有默认导出，但两处动态导入仍读取 `(await import('js-yaml')).default`：交互式 `uds init` 会因“Cannot read properties of undefined (reading 'dump')”而回滚整个安装，且 `uds config --type release_mode` 在 manifest 已经记录 `manual` 后抛出异常，未能留下 `release-config.yaml`。现在两者都使用模块命名空间，`uds config` 会在写入 manifest 之前先写入 `release-config.yaml`，以便写入失败时让 manifest 保持原样，且如果有任何源文件再次读取该默认导出，扫描测试将失败。（6.11.0 存在相同缺陷。）
- **行为变更——`uds update --apply` 在任何操作失败时以 1 退出，并指名每个失败技能的路径和原因（XSPEC-482 R2、R10）。** 以前它打印“Reconciliation completed with errors: N failed”并以 0 退出，导致 CI 无法察觉。失败的技能批处理对每个技能打印一条 `Unknown error`，既无路径也无原因，并将安装正常的技能也计入失败；现在每个操作单独判定，失败的操作显示为 `<path>: <cause>`。包含失败的运行还会说明留下了什么（参见 6.14.0-beta.12 下的更正），并提示再次运行 `uds update --apply`。
- **行为变更——pre-commit hook 运行 `check --ci`，因此它会阻断编辑已安装标准的提交（XSPEC-482 R3，macOS N3）。** 该 hook 原本运行不带 `--ci` 的 `universal-dev-standards check`，在标准文件被编辑时只打印“issues”并以 0 退出，因此 git 从未拒绝提交。该代码块（husky 和原生 hook 皆同）现在运行 `check --ci`，失败时会说明提交已被阻断以及如何恢复文件。
- **`uds update` 会替换允许每次提交都通过的旧 pre-commit hook，且 `--plan` 会列出该置换（XSPEC-482 R5，Linux N2）。** 由 UDS 5.x 至 6.13.1 设置的项目在 `.git/hooks/pre-commit` 中包含 `uds check 2>/dev/null || true`（错误被吞掉，永远“通过”）；由 6.14.0 beta 设置的项目包含不带 `--ci` 的代码块。当该文件与 UDS 写入的文本逐字节相同时（与已发布包生成的文件相比），它会被置换；被编辑过的文件会保持原样，并指出让检查永远通过的那一行行号以及应替换的内容。
- **`uds uninstall` 说明其操作内容，不留下空的工具文件夹，并移除 6.11.0 项目的永远通过 hook（XSPEC-482 R8，Linux N4 和 macOS N11d）。** 以前在删除 `.gemini/commands/` 和 `.opencode/command/` 后打印“folder kept”（因为安装文件夹在比对时带有末尾斜杠），导致它们上层的空 `.gemini/` 和 `.opencode/` 被残留。完全由 UDS 写入的原生 pre-commit hook 现在即使旧版 UDS 没有记录也会被移除，而不是留下一个仍然打印“Pre-commit checks passed”的脚本；用户添加了步骤的 hook 会保留其步骤并予以说明。
- **`uds compile` 保留你的 hook 并写入 Claude Code 文档规范的格式（XSPEC-482 R4，macOS N4）。** 以前它替换了所触及每个事件的整个条目列表（用户自己的 `Edit` hook 会被删除），将匹配器写成对象（`{"tool":"Bash"}`），而 `uds init --with-hooks` 写入的是字符串 `"Bash"`（Claude Code 文档将匹配器规范为字符串，https://code.claude.com/docs/en/hooks），并为项目中不存在的 hook 脚本写入了条目。现在它像 `uds update --with-hooks` 一样进行合并，将对象匹配器精简为其工具名称（并修复之前编译留下的条目），并排除 hook 脚本缺失的标准并予以说明。
- **全新项目在预览中显示为“无需更改”（No changes needed）（XSPEC-482 R6，Linux N1）。** `uds init` 写入的 manifest 采用了 3.3.0 格式，且集成块的顺序与 `uds update` 写入的不同，导致第一次 `update --plan` 会列出变更，第一次 `--apply` 会重写 manifest 和 GEMINI.md 的标准索引。`uds init` 现在会运行一次协调器（不创建备份），因此新项目已经处于当前形式（使用 `--content-layout layered` 时，生成的分层文件保持原样）。
- **`update --plan --commands` 和 `--plan --skills` 与 `update --plan` 保持一致（XSPEC-482 R7，Linux N3）。** 对于另外两者认定未更改的项目，`--plan --commands` 之前会显示“51 command(s) would be reinstalled”。现在两者都按安装向协调器询问哪些文件不同，仅在均无差异时才认定安装未更改。
- **`uds update --rollback --from <backup>` 恢复指定备份，包括旧版 UDS 创建的备份，且提示信息会给出其被排除的真正原因（XSPEC-482 R11，macOS N7）。** 由 UDS 6.11.0 创建的备份没有记录 manifest 哈希，因此永远无法加入其后的序列中；第二次 `--rollback` 只是重做了最新的序列，且提示信息归咎于“项目被其他东西更改了”。现在提示信息会列出旧备份及其 ID，并说明适用的两种原因之一。
- **`uds check --json` 始终打印一个 JSON 文档（XSPEC-482 R9，Linux N5）。** 以前除非附带 `--standard` 或 `--i18n`，否则它会打印人类可读文本。其退出码与文本模式一致（`--ci` 且项目存在问题时为 1）。
- **Claude Code 提交 hook 和 `uds simulate -s commit-message` 读取相同的提交类型（XSPEC-482 R12，macOS N8）。** 该 hook 原本使用不含 `security` 的固定列表，而 `simulate` 读取已安装的选项文件，导致 `security(auth): rotate keys` 在一方通过却被另一方拒绝。现在 hook 也读取选项文件（并接受破坏性变更标记 `!`）。
- **行为变更——`uds init --output-lang` 拒绝不存在选项文件的值，且简体中文项目获得简体中文（XSPEC-482 R13，macOS N9、N10）。** `klingon` 和 `simplified-chinese` 过去会被接受并记录，但未安装任何选项文件；现在的错误提示会列出 `english`、`traditional-chinese`、`bilingual`。在简体中文项目中，索引块、极简参考和标准索引原本是繁体中文句子，双语说明显示为“English + 繁體中文”，`uds update` 会将该块重写为双语标题，且 `uds.project.yaml` 步骤的提示是英文；现在所有这些都已改为简体中文。
- **行为变更——`uds release` 以显示语言打印，且 `release verify` 说明其比对的是 HEAD（XSPEC-482 R14a、R14b）。** 以前无论 `--ui-lang` 或项目如何设置，每一行都是繁体中文（匹配这些繁体中文行的脚本必须切换到 `--ui-lang zh-tw`）。提交不匹配的提示信息曾显示为“git tag points to”并比对当前的 HEAD；现在显示为“the current HEAD is”。
- **MCP 服务器响应 `ping`，且失败的工具以 `isError` 结果响应（XSPEC-482 R14c）。** 以前 `ping` 会返回“Method not found”，且工具错误以 JSON-RPC 错误返回，调用该工具的模型无法将其作为工具结果读取。
- **`UDS_NO_UPDATE_CHECK=1` 阻止 `uds check` 从 npm 查询并阻止写入 `~/.uds/update-check.json`（XSPEC-482 R14e）。** 以前除非同时提供了 `--offline`，否则 `check` 会查询注册表。
- **在报告宽度为 0 的终端上关闭 spinner（XSPEC-482 R14f）。** ora 在擦除时除以宽度，导致 spinner 在该循环中占用 100% CPU，命令永远无法完成（如 `expect` 打开的 pty、某些 CI 执行器）。
- **行为变更——`uds audit --report` 显示完整报告并在发送前进行确认（XSPEC-482 R14g）。** 交互式路径以前直接从“你的评论”跳到在你账户下发布公开 GitHub issue。`--yes` 依然无需询问直接发送，`--dry-run` 依然仅打印。

## [6.14.0-beta.12] - 2026-10-12

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。修复了 6.14.0-beta.11 Windows 重新测试仍发现的问题（XSPEC-475 R6–R10）。
>
> **行为变更：**`uds update --apply` 现在使 manifest 中的技能/命令版本和名称记录与其重写的文件保持同步；当已安装的选项文件早于 CLI 随附的文件时，`uds simulate -s commit-message` 依据 CLI 当前规则判定（并予以说明）；`uds update --plan` / `uds check` / `uds audit --friction` 列出未安装的推荐核心标准。

### 变更

- **行为变更——`uds update --apply` 会记录其重写的技能与命令，因此运行一次即可（XSPEC-475 R6，由 beta.11 在 Windows 上的重新测试发现）。** 在由 6.11.0 设置的项目上单纯执行 `--apply` 重写了大约 200 个技能和命令文件，但将 `skills.version` / `commands.version` 留在了旧版本，且 `skills.names` 中缺少新增的技能（`comprehension-ladder`），导致 `uds check` 一直提示“Commands: v6.11.0 → v6.14...”，直到运行第二次 `uds update --skills` 为止。重写文件是有意为之的（协调器的职责就是让项目与此 UDS 随附的内容匹配），因此修复的是记录而不是重写：在干净的 `--apply` 之后，为技能和命令记录的版本为此 UDS 随附的版本，且本次运行安装的每个名称都会添加到 `names` 中。当无需重写任何内容时（“一切已是最新”，或者计划仅包含集成文件块），版本记录也会推进，因为此时文件与此 UDS 随附的内容完全一致。发生错误的运行将保持记录不变，与之前一致。*（更正，6.14.0-beta.13：该句话言过其实，超过了代码的实际行为。带有错误的运行不会推进总体版本记录 (`upstream.version`)，且失败的技能或命令批处理会保留其旧记录；同一运行中成功的批处理已经记录了其新版本，再次运行 `uds update --apply` 即可完成剩余部分。beta.13 在运行出现失败时会打印此说明。）* 如果有脚本在 `--apply` 之后比对 `skills.version` 以检测是否需要第二步，它现在将立即发现随附的版本。
- **当已安装的选项文件早于 CLI 随附的文件时，`uds simulate -s commit-message` 依据 CLI 当前规则判定，并予以说明（XSPEC-475 R7，由 beta.11 重新测试发现）。** 升级 CLI 之后且在 `uds update --apply` 之前，已安装的 `traditional-chinese` 选项文件仍列出中文类型（1.0.0），导致 `feat(user): 新增部門端點` 被判定为不合规，而 `新增(認證): …` 被判定为合规——这与 6.14 规则相反，且毫无提示原因。现在，如果已安装的 commit-message 选项文件的 `meta.version` 低于此 CLI 随附的版本，则不使用该文件：以随附文件的类型为准，且输出中会增加一行 `Note:`（“已安装的选项文件 "traditional-chinese" 版本为 1.0.0，早于此 CLI 随附的 2.0.0，因此此消息是根据 CLI 当前规则判定的。请运行 `uds update --apply` ...”）。与随附文件一样新的选项文件无论是否被编辑过仍起决定作用，没有随附对应文件的文件（团队自定义的）则按之前的方式读取。**traditional-chinese 变更的过渡期（6.14.0-beta.10 的迁移说明）：**在 CLI 升级之后到 `uds update --apply` 之前，判定结果已经遵循新规则（英文类型，中文主题）；运行 `uds update --apply` 可使已安装文件也表述相同内容。
- **secret-management-standards 1.1.0 将 REQ-003 指向 pipeline-security-gates 的 PSG-1 至 PSG-3（XSPEC-475 R10）。** REQ-003 要求配备 pre-commit 和 CI 密钥扫描器；这些扫描器如何运行由 `pipeline-security-gates` 规范，而这两个标准此前未从本侧相互引用。REQ-003 现在用一段话陈述了这三条规则（PSG-1 扫描输出绝不包含匹配到的密钥值，PSG-2 无法运行的扫描器必须阻断，PSG-3 团队自编规则必须有红绿测试样本），集成章节列出了交叉引用，且 AI 优化后的 YAML 包含相同的文本、`references: [pipeline-security-gates]` 以及两个示例。`.md`、`.ai.yaml` 和注册表描述保持同步；zh-TW 译本已更新并打上时间戳。

### 新增

- **`uds update --plan`、`uds check` 和 `uds audit --friction` 指名未安装的推荐核心标准，并附带各自的安装命令（XSPEC-475 R9）。** 有 59 个核心标准未由 `uds init` 安装，而在每个计划中列出所有这些标准会淹没采纳者询问的少数几个（在 Windows 报告中提到了 `turn-completion-integrity`、`pipeline-security-gates`）。标记为 `"recommended": true` 的注册表条目会被逐一列出——“未安装的推荐核心标准 (N)”，其下方附有 `uds update --apply --add-standard <id>`；`uds check` 打印一行点名它们；`uds audit --friction` 包含一条带有这些命令的 LOW 级别发现。“未在上方列出：还有 N 个”这行保持不变，准确统计未列出的数量：属于 `uds init` 从不安装的分类中的标准，减去上方逐一列出的推荐标准。列出并不等于安装：这些标准不在旧版 `uds update --yes` 路径安装的集合中，分数和退出码均无改变。目前标记了两个条目；该标记是 `standards-registry.json` 中的一行。

### 修复

- **`uds spec list` 可以读取与另一个字段写在同一行的状态（XSPEC-475 R8，由 beta.11 重新测试发现）。** 诸如 `**規格**: SPEC-002 ｜ **狀態**: Draft（驗收中）` 这样的标题行（字段之间使用全角 `｜` 或半角 `|`，顺序任意，亦支持英文名称）之前会显示“format: SDD (status not parsed)”。现在该行的各个部分均被读取为独立字段。当标题仍然无法读取时，声明此情况的句子不再拉宽每行的状态列（及其下方的分割线）——仅该行变长。

## [6.14.0-beta.11] - 2026-10-12

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。取代 6.14.0-beta.10，后者的发版后验收在一个步骤上失败。

### 修复

- **`uds run` 不再对真正的行尾注释发出警告；仅当 YAML 在引号内截断命令时才发出警告（XSPEC-475 R5c，由 6.14.0-beta.10 的发版后验收发现）。** beta.10 中添加的警告对每个包含空格和 `#` 的未加引号值都会触发，因此 `test: dotnet test Tests.csproj  # 90 tests pass` 这种受支持的命令注释方式会将丢弃的注释打印出来，并导致所有五个平台上的验收步骤 `beta6-run-dry-run` 失败（该步骤要求输出中不得出现注释）。现在仅当 YAML 保留的部分包含未闭合引号时才出现警告，例如 `build: node -p "'quoted # kept'"`（YAML 保留 `node -p "'quoted`，而 shell 本应保留 `#`）：它会在 `--dry-run` 和实际运行之前说明 `uds.project.yaml` 的哪一行被截断，并提示将整个值加上引号，且绝不重复显示丢弃的文本。保留部分完整的值不会被报告，即使 `#` 之后的文本原本打算作为命令的一部分也是如此；给此类值加上引号可保留 `#`。

## [6.14.0-beta.10] - 2026-10-12

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行为变更：** **traditional-chinese 提交选项现在表示英文类型搭配中文主题**（`feat(user): 新增部門端點`），且诸如 `新增(認證): ...` 之类的中文类型会被 `uds simulate -s commit-message` 判定为不合规；`uds update --apply` 不再将旧版 UDS 留在项目根目录的 `.uds-backup-*` 文件夹计入限额或删除；当缺少 `.standards/release-config.yaml` 时，`uds release` 子命令会从 manifest 的 `options.release_mode` 中获取发布模式（之前会回退到 `ci-cd`）；当 YAML 在命令中丢弃空格和 `#` 之后的文本时，`uds run` 会打印警告；`uds uninstall` 会移除其留空的 `.claude/`（或其他工具）文件夹。

### 变更

- **行为变更——traditional-chinese 提交选项为“英文类型，繁体中文主题”（XSPEC-475 OQ1，2026-10-12 决定）。** `ai/options/commit-message/traditional-chinese.ai.yaml` (2.0.0) 列出了中文类型（`新增`、`修正` 等），而其对应的人类可读版本 `options/commit-message/traditional-chinese.md` 和所有采纳者的 commitlint `type-enum` 均已采用英文类型，导致机器可读选项与项目自身的实践相抵触。它现在列出与 english 选项相同的类型（`feat`、`fix` 等）并附带中文示例（`feat(auth): 加入 OAuth2 登入`），并声明主题和正文可以使用繁体中文；生成的集成文本（针对 `output_language` 为 `traditional-chinese` 的项目的 `uds init` / `uds update`）、commit-standards 技能、`core/commit-message-guide.md` 1.4.0（Option B）和 `docs/CLI-INIT-OPTIONS.md` 同样遵循此规则。**受影响者：** 编写中文类型（`新增(認證): ...`）的项目将会看到 `uds simulate -s commit-message` 返回退出码 1 并提示“Type "新增" is not one of: feat, fix, ... The type must be an English word from that list; only the subject may be Chinese”。**迁移方式：** 改写为英文类型（`新增`→`feat`、`修正`→`fix`、`重構`→`refactor`、`文件`→`docs`、`樣式`→`style`、`測試`→`test`、`效能`→`perf`、`建置`→`build`、`整合`→`ci`、`維護`→`chore`、`回退`→`revert`、`安全`→`security`），并运行 `uds update --apply`（已检查：它会重写已安装的选项文件以及生成的 AGENTS.md / CLAUDE.md 提交文本）。simplified-chinese 扩展文本在此处未作更改。
- **行为变更——`uds update --apply` 仅将 `.uds-backups/` 计入其 5 个备份的限额，并说明其移除了什么以及保留了什么（XSPEC-475 R2）。** 该限额过去将新文件夹和旧版 UDS 留在项目根目录下的 `.uds-backup-<time>` 文件夹合在一起计算，导致一个带有 4 个旧备份的项目在经历三步升级时，有 2 个旧备份被静默删除（在 Windows 上配合 beta.9 发现；项目的 CLAUDE.md 指出这些文件无法从 git 中恢复）。旧文件夹不再会被该限额移除：在每个备份步骤之后，输出会列出每一个旧备份（“来自旧版 UDS 的 N 个备份仍留在项目根目录中，且未被限额移除”），并建议你自己将其移出项目。被限额从 `.uds-backups/` 中移除的备份会被逐一命名（“已移除 .uds-backups/ 中超出 5 个限额的 N 个旧备份”）。`--rollback` 仍会读取这两个位置。如果你依赖旧布局备份被自动清理，请手动删除它们。
- **行为变更——当缺少 `release-config.yaml` 时，`uds release promote|deploy|manifest|verify` 从 manifest 中读取发布模式（XSPEC-475 R4）。** 以前只读取 `.standards/release-config.yaml`，因此 `.standards/manifest.json` 中记录了 `options.release_mode: manual`（或 `hybrid`）却没有该文件的项目会以 `ci-cd` 运行，且 `uds release verify` 会拒绝（“仅在 manual 或 hybrid 模式下”）却不说未找到该文件。现在的模式为：若 `release-config.yaml` 指定了 `release.mode` 则取该值（优先于 manifest）；否则取 manifest 的 `options.release_mode`，并输出一行说明；再否则取 `ci-cd`。现在的拒绝信息会说明是这三者中的哪一个起决定作用以及缺少了什么（“找不到 .standards/release-config.yaml ... 所以使用預設的 ci-cd”）。`verify` 的退出码保持不变（0 已验证，1 失败，2 无法验证）。manifest 中含有 `manual` 且无配置文件项目现在可以运行手动模式子命令；manifest 记录为 `ci-cd` 的项目行为与之前相同。

### 新增

- **`uds open-work waiting` 和 `next-action` 接受项目自定义的“何时询问”和“等待什么”列名：`--asked-at-word` / `--waiting-for-word`，或 `uds.project.yaml` 中的 `open_work.asked_at_words` / `open_work.waiting_for_words`（XSPEC-475 R3）。** 某个真实载体的表头使用了 `何時問` 和 `問什麼`；固定词汇表未收录它们，导致每一行询问等待行均告失败且 `waiting-on-reply` 为 0。声明的词为纯文本、不区分大小写，作为表格标题或行内标签的子字符串进行匹配；空白词会被拒绝并以 2 退出。违规文本现在会区分三种错误：**未找到**字段（“此记录中没有任何列或标签被识别为 asked-at（见到的表头：...）。已接受：... 如需声明你自己的词：...”）、字段**为空**（措辞未变），以及值**不是日期**（措辞未变）。空白和不是日期情况的措辞与之前完全一致。

### 修复

- **`uds simulate -s commit-message` 将所有非 ASCII 类型均判定为“不符合 `<type>(<scope>): <subject>` 格式”，导致允许中文类型的选项文件永远无法通过，即使使用其自身示例也不行（XSPEC-475 R1）。** 标题模式现在可读取由任何字母组成的类型，并询问已安装的选项文件该词是否被允许；scope 小写规则仅适用于有大小写区分的字母（中文 scope 可通过，`Auth` 和 `API-認證` 依然失败）。
- **`uds spec list` 可以读取中文状态：`| 狀態 | Approved |` 和 `> **狀態**: Draft`（以及作为类型的 `類型`）（XSPEC-475 R5a）。** 它们之前显示为“format: SDD (status not parsed)”并拉宽了表格列。
- **`uds open-work next-action` 不再将斜杠命令（如 `/work` 或 `` `/sdd create login` ``）误报为缺失的绝对路径 `/work`（XSPEC-475 R5b）。** 它是命名命令且从不进行路径查找（计为 not-resolvable，而非 path-missing）。
- **`uds run` 在未加引号的命令中，当 YAML 丢弃空格和 `#` 之后的文本时发出警告（XSPEC-475 R5c）。** `build: node -p "'quoted # kept'"` 是合法的 YAML，解析结果止于 `node -p "'quoted`（6.14.0 将该文件读取为 YAML；而 shell 本应保留 `#`）。警告会在 `--dry-run` 和实际运行之前打印，指出丢弃的文本，并提示给整个值加上引号。真正的尾随注释（`test: dotnet test X.csproj  # 90 tests pass`）像以前一样被丢弃，现在也会被报告，因为两者在文件中看起来一样；加引号的值或前面没有空格的 `#` 不会被报告。
- **`uds uninstall` 会移除其留空的 `.claude/` 文件夹（或 `.codex/` 等）（XSPEC-475 R5d）。** 在移除技能文件夹后，空的 `.claude/` 仍留在项目中。仍然包含你自己的文件的文件夹会被保留。

## [6.14.0-beta.9] - 2026-10-10

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行为变更：** 对不存在的规格执行 `uds spec delete <id>`，现在不先询问，直接以 1 退出。

### 修复

- **`uds spec delete` 在询问是否删除之前先说明规格不存在；`uds spec split` 在 `**Confirmed**` 之前保留空行；`uds check` 和 `uds update` 的错误退出闸门提示遵循界面语言（在 6.14.0-beta.8 macOS 手工验收中发现）。** 删除不存在的规格 ID 过去会先问“要删除吗？”，并在回答 yes 后打印“找不到规格”；现在直接打印“找不到规格：<id>”并以 1 退出，不再询问。`uds spec split` 写入的规格原本将 `**Confirmed**: No` 直接紧贴在最后一条验收条件下方；两者之间的空行现已恢复。`uds check`（“[error-exit] 没有针对错误消息的单一退出检查”）和 `uds update`（询问是否写入 `scripts/check-error-exit.mjs`）过去无论界面语言为何均打印繁体中文；现在它们与 CLI 的其余部分一样显示英文、繁体中文或简体中文。闸门脚本本身（`templates/gates/check-error-exit.mjs`）仍然打印中文；此处未作更改。
- **CI：发版后验收等待 `npm install` 所读取的内容，且在版本尚不可见时重试安装（XSPEC-471 R1）。** 在 6.14.0-beta.8 发布后，`wait-for-npm.mjs` 在第 8 次轮询时宣告找到该版本（单版本文档 `/universal-dev-standards/6.14.0-beta.8` 返回 200 且其 tarball 返回 2xx），而紧随其后的 `npm install universal-dev-standards@6.14.0-beta.8` 在前三个作业中失败（“COULD NOT RUN | install failed”，执行了 0 个步骤）。`npm install` 并不读取该文档：它读取的是包文档 `/universal-dev-standards`，而当时该文档尚未更新。现在的等待会向包文档查询版本，然后查询 tarball，再通过安装所使用的相同 npm 和注册表设置运行 `npm view`；并且当 npm 报告 E404 或 ETARGET 时，`run.mjs` 会重试 `npm install`（5 次尝试，间隔 5/10/20/40 秒，180 秒后不再启动新尝试），打印每次重试并在报告中注明重试次数。任何其他安装错误依然立即失败。`--install-retries <n>` 和 `--install-retry-wait <sec>` 用于设置这些限制。维护者工具位于 `scripts/beta-acceptance/` 下；其内容均不在 npm 包中。

## [6.14.0-beta.8] - 2026-10-10

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行为变更：** `uds hitl check` 在无人可答时拒绝（退出码 1）；`uds release verify` 失败时以 1 退出，无法验证时以 2 退出；`uds release promote` 不再为未做之事打印“✓”；移除 `uds mcp serve --root`；无终端时，`uds spec delete/split` 以 2 退出，`uds spec create` 以 0 退出；`uds uninstall` 仅移除 UDS 写入且你未更改的文件。

### 新增

- **CI：uds CLI 的每个命令、子命令与选项都需要验收步骤，且步骤必须读回效果，而不仅仅是退出码（XSPEC-471 R2、R3）。** `node scripts/beta-acceptance/check-cli-coverage.mjs`（CI 作业“Beta Acceptance Coverage”）加载真正的 `cli/bin/uds.js`，记录其构建的 commander 程序（包含隐藏命令、隐藏选项和别名；不从帮助文本读取任何内容），当 `scripts/beta-acceptance/steps.json` 的任何步骤都未用到某个命令、子命令或选项时便告失败并逐一命名；它会打印已使用、豁免和缺失的数量。只有包含 `exemptions` 条目 `{"command": ...}` 或 `{"option": ...}` 且附带至少 20 个字符的理由时，项目才可以豁免；空白或单字理由将使该项保持缺失状态。添加检查时存在的缺口（31 个命令和子命令，115 个选项）列在 `scripts/beta-acceptance/coverage-baseline.json` 中，该文件只会缩减：不在其中的缺口会失败，已被步骤使用的条目若未移除也会失败（`--shrink-baseline`），因此该文件不会腐烂；`--baseline-not-larger-than <ref>` 会使添加条目的更改失败。`check-steps.mjs` 现在还会指出其 `expect` 仅有退出码的步骤，包含面向人工的步骤（`{"step": ..., "reason": ...}` 可豁免一个步骤）。**未验证**：CI 接线仅由 YAML 解析器和测试读取过，未由 GitHub 实际运行。
- **CI：在版本发布后，验收步骤会在 Windows、macOS 和 Linux 上针对已发布的包运行（XSPEC-471 R1）。** 新的工作流 `.github/workflows/post-publish-acceptance.yml` 在某个版本的“Publish to npm”成功完成时触发（或手动通过 `workflow_dispatch` 指定版本触发，以测试任何已发布的版本），轮询注册表直到可以获取该版本及其 tarball（`scripts/beta-acceptance/wait-for-npm.mjs`；如果一直未出现，作业会提示“package not published, not a platform failure”，而不会从发布事件起等待固定时间），然后在 `ubuntu-latest`、`macos-latest` 和 `windows-latest`（最后者分别从 PowerShell、cmd 和 Git Bash 运行）上执行 `run.mjs --non-interactive`。每个作业将其统计数据写入作业摘要（`ci-summary.mjs`：通过、失败、未确认的人工项目、每个失败的步骤），在任何自动化步骤失败时变红，并将其报告作为构件上传。`node scripts/beta-acceptance/fetch-ci-reports.mjs --version <version>` 使用 `gh` 将构件下载到 `scripts/beta-acceptance/reports/<version>/`；CI 从不向 `main` 提交；获取的文件命名为 `<label>__<original name>`，因为三个 Windows 作业可能会在同一秒完成。它不触及 `publish.yml`。因为一个平台现在可以有多个报告，`docs/PRE-RELEASE.md` 的“已验证平台”区块取每个标签的最新运行并展示其中最差的结果（只有一个标签时行为不变）。
- **CI：`scripts/bump-version.mjs` 拒绝不带预发布标记的版本号，除非其最新的预览版已在所有三个平台上通过验收（XSPEC-471 R5）。** 在更改文件之前，它会检查 `scripts/beta-acceptance/reports/<preview>/` 中是否包含来自已发布包的 Windows、macOS 和 Linux 报告（使用 `--local-bin`、`--source` 或注入的安装程序生成的报告不算；当一个平台在多种 shell 下运行时，会读取每种 shell 并以最差者为准），确保其中没有任何自动化步骤失败，`check-cli-coverage.mjs` 和 `check-steps.mjs` 均变绿且 `coverage-baseline.json` 为空，当前 `steps.json` 的每个步骤都在这些报告中（在预览版发布后添加的步骤需要更新的预览版），并且没有 `steps.json` 豁免声明某个功能为“已知损坏”（R4 的措辞；也会读取 `已知壞掉`）。所有缺失的内容会在一次拒绝中全部列出，退出码为 1。未经验证的人工步骤会被列出且绝不阻断。预览版本不会被检查。没有任何跳过该闸门的开关，即使 `SKIP_BUNDLE_PARITY` 也不行：补丁会先作为预览版发布，随后的发版后验收会自动运行。规则位于 `scripts/beta-acceptance/lib/stable-gate.mjs`。

### 变更

- **行为变更——`uds release verify` 现在在验证失败时以退出码 1 结束，在无法验证时以 2 结束（XSPEC-471 R4）。** 以前它打印“Manifest 驗證失敗”后仍然以 0 退出，导致以此作为发布关卡的脚本或 CI 步骤将每次失败都误认为通过。退出码 0 表示 manifest 验证通过。退出码 1 表示提交或构件校验和与 manifest 记录的不一致。退出码 2 表示根本无法验证：没有 `build-manifest.json`、该文件不是合法的 JSON、`--artifact` 文件不存在，或发布模式（`ci-cd`）没有 `verify`；其划分与 `uds hitl check` 相同（1 = 答案是否定的，2 = 没有答案）。缺失预发布（staging）结果仍然只是警告，不改变退出码。如果脚本依赖 `uds release verify` 始终以 0 退出，请处理 1 和 2。
- **`uds release promote <version>` 不再为未做之事打印“✓ 晉升紀錄建立”和“✓ Git tag”（XSPEC-471 R4）。** 该命令不写入晋级记录，也不创建 tag；它仅打印文本。信任这些勾号的人可能会部署一个从未打过 tag 的版本。它现在会显示“這個指令不會建立晉升紀錄，也不會建立 Git tag”并列出供你运行的后续步骤，包括 `git tag v<version>`。未添加任何新行为：它仍然不写入任何内容，也不打任何 tag。
- **行为变更——移除 `uds mcp serve` 的 `--root <path>` 选项（XSPEC-471 R4）。** 该选项过去被接受并保存，但没有任何代码读取它，因此 `--root /elsewhere` 未改变任何响应，却显得像是选择了标准的来源位置。服务器照常从已安装的包中读取 UDS 随附的文件。`uds mcp serve --root <path>` 现在会以 `error: unknown option '--root'` 和退出码 1 停止；请从任何传递该选项的 MCP 客户端配置中将其移除。

### 修复

- **`uds mcp serve`：在所有安装中，`get_design_standards` 以及 `get_design_token` 的 DESIGN.md 模板后备均返回 ENOENT（XSPEC-471 R4）。** 服务器在 `cli/src/mcp/` 之上四层查找 UDS 随附的文件，该位置在仓库之外，也在已安装的包之外。现在它会在包的 `bundled/` 文件夹中查找，在代码检出中则在 `cli/` 上一层查找。单元测试替换了文件系统，因此从未发现该问题；新的端到端测试会启动真实的 `uds mcp serve` 并读取响应。
- **在由 UDS 自身生成 `release-config.yaml` 的项目中，`uds release deploy <env>` 拒绝每个环境（XSPEC-471 R4）。** `uds init` 和 `uds config` 将 `release.environments` 写为对象（`- name: staging`）；检查逻辑将键入的名称与这些对象进行比较，提示“未知环境”并列出 `[object Object]`。现在对象形式和纯文本名称均可被读取。
- **`uds agent list` 和 `uds agent info` 显示空白描述，且无专业技能、工具或技能（XSPEC-471 R4）。** agent 文件是 YAML（`description: |`、列表）；读取器每次取一行 `key: value` 并将描述视作 `|`。front matter 现在被解析为 YAML。
- **行为变更——`uds hitl check` 在无法询问时不再以退出码 0 结束（XSPEC-471 R4）。** 在没有终端可供回答且无 `CI` 变量时，带有风险的 `--op` 会打开一个永远等不到回答的提示，打印堆栈跟踪并以 0 退出，脚本会将其视作“已批准”。现在它打印“Blocked (Safety First)”和“Denied”并以 1 退出，与 CI 环境下的行为相同。不带 `--op` 的 `uds hitl check` 以 2 退出（以前以 0 退出）。
- **`uds list` 仅显示其统计的 163 个标准中的 81 个，并拒绝 `--category core`（在为 XSPEC-471 R4 编写验收步骤时发现）。** “Total”行统计了注册表中的每个标准，但列表仅遍历了五个固定类别，因此 `core`、`testing`、`security`、`deployment` 和 `operations` 类别下的 82 个标准被计入却从未显示，且 `uds list --category core` 回复“Unknown category”。现在列表会显示注册表包含标准的每个类别，各带标题和数量，使得标题中的数字相加等于 Total；这五个类别已在 `cli/standards-registry.json` 中声明（附有一行说明它们不由 `uds init` 安装，需通过 `uds update --apply --add-standard` 按 ID 添加），注册表日后新增的类别将在其自有的键下列出，而不是被丢弃。“有效类别”提示列出了所有十个类别。如果标题与 Total 不一致，`npm test` 现在会失败。
- **在没有任何内容可以回答其问题时，`uds quickstart`、`uds spec create`、`uds spec delete` 和 `uds spec split` 会因 Node 堆栈跟踪以退出码 0 结束（在为 XSPEC-471 R4 编写验收步骤时发现）。** 在无终端环境（AI 助手、CI、管道）中运行时，它们绘制出问题随后死于 `ExitPromptError`，且运行看起来像成功。`uds update` 和 `uds uninstall` 早先已通过同样方式修复。现在：`uds quickstart` 打印所有四个工作流及其命令（本指南的全部职责）；不带 `--yes` 的 `uds spec create` 将已写入的规格保留为草稿并说明如何确认它（退出码 0）；不带 `--yes` 的 `uds spec delete` 不删除任何内容，提示带 `--yes` 重新运行并以 2 退出（以前为 0）；`uds spec split` 不更改任何内容，提示在终端中运行并以 2 退出（以前为 0）。在有终端时行为不变。
- **`uds uninstall` 不再删除你自己编写的技能和命令，或你添加到 `.standards/` 的文件（XSPEC-471 R4）。** 以前它会移除每个安装的整个技能文件夹（`.claude/skills/`、`.opencode/skill/` 等）、整个命令文件夹以及整个 `.standards/` 文件夹，导致你存放在那里的自定义技能或保存在 `.standards/` 中的备忘文件随 UDS 文件一同丢失。现在它仅移除 manifest 记录且自 UDS 写入以来未更改的文件，保留你编辑过的 UDS 文件（并予以说明），且仅在文件夹中没有其他内容时才将其删除。这是 `uds uninstall` 对 hook 脚本和集成文件已经遵循的规则。manifest 未记录某安装之文件的项目（旧版 UDS）会保留该安装的文件并说明原因。在为 `uds uninstall` 编写验收步骤时发现。
- **在任何运行过 `prepack` 的检出中，验收步骤 `init-locale-pack-missing-is-said` 在 `run.mjs --local-bin cli/bin/uds.js` 下失败（XSPEC-471 R5）。** 它通过 `cli/bundled/` 是否存在来区分已发布的包与源码检出，但源码检出在 `prepack` 之后也存在该文件夹，因此“缺少 zh-TW 技能文本”的副本被构建在仓库根目录中，`skills-installer.js` 仍然在根目录中找到了 `locales/zh-TW` 并安装了中文技能。现在该步骤检查 `locales/zh-TW` 是否位于 `cli/` 旁边。已发布的包从未受此影响，`uds init` 亦然。

## [6.14.0-beta.7] - 2026-10-08

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行为变更：** `uds init` 和 `uds init --yes` 会将 UDS 技能安装到项目中；`uds init` 的命令契约步骤保留 `uds.project.yaml` 的其余内容；`uds skills` 输出文本发生变化；当唯一的违规是 OWT-022 判定为完整的“已询问，等待回复”行时，`uds open-work next-action` 以 0 退出（以前为 1）。

### 新增

- **`uds update` 现在会说明 UDS 随附但项目中缺失的标准，且 `--add-standard <id>` 可以安装它们（XSPEC-458）。** 由旧版 UDS 设置的项目仅保留其 manifest 列出的标准，因此 `uds update --apply` 会报告“最新”，而自那时起新增的标准（例如 `open-work-tracking`）从未被安装——且没有任何提示。现在：`uds update --plan` 以按类别分组的“上游可用但未安装 (N)”结束，或者显示“无”；`--apply` 以数量和命令结束；`uds check` 打印一行“N 个上游标准未安装”；`uds audit --friction` 列出一项低严重程度的发现。这些均不会改变计划的操作、判定结果、退出码或 `uds audit --score`。`uds update --plan|--apply --add-standard <id>`（可重复）安装某个标准并将其记录在 `manifest.standards` 中，使其在下一次 `--apply` 时不会作为多余项被删除；一次 `--rollback` 即可再次将其移除。未知 ID 以 1 退出并列出最接近的 ID；已安装的 ID 会予以说明并以 0 退出；`extension`、`integration` 和 `template` 条目（通过语言、工具和模板选择安装）会被拒绝并说明原因。“可用”意味着在项目格式下拥有源文件且 manifest 中没有该名称文件的 `reference` 或 `skill` 标准——这是由旧版 `uds update` 路径、`--plan`/`--apply`、`check` 和 `audit` 共享的统一规范。其他类别（`core`、`testing`、`security`、`deployment`、`operations` 等）的标准从未由 `uds init` 安装，仅在一行中进行统计而不予列出；它们仍可按 ID 进行选择。规则和失效的 manifest 字段（`level`、`profile`）见 [docs/AVAILABLE-STANDARDS.md](docs/AVAILABLE-STANDARDS.md)。
- **CI：标准孤儿矩阵（XSPEC-458 R4）。** `npm run check:orphan-matrix` 为注册表中的 163 个标准各分配五个“是/否”列（是否由 `uds init` 安装、是否被生成的索引命名、是否被技能包装、是否被检查、是否被工作流、hook 或技能调用），并在某个标准五列全空以及存在未被任何东西调用的 `check-*` 脚本时失败。首次运行发现了 78 个孤儿标准和 2 个未被调用的检查脚本；它们各自附带原因和所有者列在 `cli/scripts/orphan-matrix-allowlist.json` 中，该文件将于 2026-12-31 到期，且在某个条目不再属于发现时会失败。一项新的升级测试使用当前的 CLI 针对真实的 6.11.0 写入的 manifest 运行。
- **`open-work-tracking` 1.2.0——“尚未询问”与“已询问，等待回复”现为两个具名状态，且对无法推导的事实允许使用手写行（OWT-020–OWT-026，XSPEC-459）。** 起草后从未发送的消息看起来与已发送且未回复的消息相同，而助手无法观察的事实（是否发送、对方是否回复、是否获得批准）此前没有合规的位置可供书写。OWT-020–OWT-022 命名了 `not-yet-asked`（必须指明其草稿或操作）和 `asked-awaiting`（必须包含 `asked-at`、在等待什么以及其解除事件）；未处于两者之一的等待项将被逐一列出且绝不计为已完成。OWT-023–OWT-026 仅针对此类事实允许手写行，必须附带 `observed-by`、`observed-at` 以及 `yes`、`no` 或 `unknown` 的值——`unknown` 会单独统计并展示且绝不计为完成，每条观察记录的时间跨度都会打印，且早于阈值的观察会被报告为陈旧（stale）且绝不确认。该例外不涉及版本控制、规格标记或 CI 结果所能确定的内容。所有七项要求均为 `warning` 级别；词汇（英文与中文）及 7 天的陈旧默认值尚未校准；检查仅判定字段是否存在且格式良好——绝不判定观察是否属实。未采纳表格中的“手写状态文件”行已重写以准确说明这一点；OWT-003 保持不变。
- **`uds open-work waiting` 和 `uds open-work observations`**——针对它们的参考检查。`--now` 注入今天的日期（规则绝不读取系统时钟），`--stale-after` 声明阈值，退出码与其他 `open-work` 命令一致：0 无违规，1 违规（`warning` 级别的违规也是 1，与 OWT-019 相同），2 无法判定。`uds open-work self-test` 现在对 OWT-020–OWT-026 中的每一项各运行一个违规样本和一个满足样本。`next-action`、`revision` 和 `separation` 打印的内容与 1.1.0 逐字节完全一致（在 16 个载体上经过 21 次运行的比对，包含带有中文表头的表格）。
- **`uds check` 在 UDS 技能被安装两次时发出警告（XSPEC-462 R2）。** 当项目中已安装 UDS 技能（`.claude/skills/`）且从 Claude Code 市场安装了 UDS 插件时，Claude Code 会将每个技能列出两次（`/commit` 和 `/universal-dev-standards:commit`），并在每个回合将每个技能的名称和描述放入上下文中。`uds check` 现在会对此发出提示，并说明如何保留两者之一。仅供参考：它既不改变判定结果也不改变退出码，在任一方缺失或无法读取 `~/.claude/plugins/installed_plugins.json` 时不输出任何内容。
- **CI：插件设置不得声明错误的技能数量（XSPEC-462 R3）。** 当 `.claude-plugin/plugin.json`、`marketplace.json` 或 `README.md` 中的描述所声明的技能数量与 `skills/` 下包含 `SKILL.md` 的文件夹数量不一致时，`npm run check:plugin-manifest` 将失败。不含数字的描述可以通过检查。
- **文档：`docs/user/GETTING-STARTED.md` 中的“如何安装技能”（XSPEC-462 R3）。** 并列对比两种方式及其限制、为何 `uds check` 和 `uds update` 建议使用 `uds update --apply --skills`，以及两者均安装时该如何处理（英文、繁体中文和简体中文）。
- **`pipeline-security-gates` 1.1.0——pre-commit 密钥扫描现在明确了扫描器自身的三个行为（PSG-1 至 PSG-3，XSPEC-463）。** 该标准过去陈述了闸门扫描和阻断什么，但未说明扫描器本身必须如何表现。1.1 节新增：PSG-1（必须/MUST）扫描输出——终端、CI 日志、报告文件——绝不包含匹配到的密钥值，仅包含文件、行号和规则名称；PSG-2（必须/MUST）无法运行的扫描器（缺失二进制文件、无法读取或无效配置、超时、异常退出）视为闸门失败并予以阻断，绝不能被 `|| true` 或 `2>/dev/null` 吞掉；PSG-3（应该/SHOULD）团队自己编写的每条检测规则都应在测试中运行一个红样本和一个绿样本。每条行为都附带采纳者在自己的闸门上运行的三行程序；PSG-1 程序首先要求证明闸门确实被阻断，因此没有规则能匹配的样本无法通过它。工具说明仅记录厂商自身文档中读取到的内容：对于 gitleaks，其 README（2026-10-07 读取）在其示例输出中无 `--redact` 时打印 `Secret:` 行，并将退出码 1 同时用于“泄漏”和“错误”；对于 detect-secrets 和 trufflehog，标准声明“采纳者必须自行确认”。UDS 不随附扫描器，在自己的 CI 或 hook 中也没有扫描器；标准中已明确说明这一点。机器可读形式：`.ai.yaml` 中的 `gate_positions.pre_commit.output_redaction`、`.scanner_failure` 和 `.custom_rule_samples`；注册表描述及两份译本均已更新，`meta.updated` 打上时间戳 2026-10-07。
- **`open-work-tracking` 1.3.0——等待项可以指名另一个项目中的对象，且本机无法看到之项目会被单独统计（OWT-027–OWT-029，XSPEC-460）。** 相互依赖的项目过去无法表达“该项目正在等待那个项目的产出”。OWT-027 允许解除条件写作 `<project>:<object>`：项目是一个**逻辑名称**（`uds`、`vibeops`），绝不能是目录，对象是文件路径、测试名称、命令、需求标识符或版本控制 tag，且包含机器专属绝对路径（主目录或卷目录、驱动器盘符、`~/`）或离开另一项目之路径的载体均属违规。名称在机器上的实际位置声明在载体之外。OWT-028：对于每个此类条件，`uds open-work waiting` 会说明四种情况之一，并分别统计：**已解除**（该路径或 tag 当前存在于该处）、**尚未解除**、**从此处不可见**（该项目不在本机上、其目录缺失，或无法读取其 git tag：未解除且非零）或**需要人工判断**（另一项目中的测试名称、命令或需求标识符没有检查工具可读取的内容）。它仅读取本机的本地文件和 git，不涉及网络。等待另一项目对象的项免于 OWT-020 的“是否已询问”检查，并在自己的独立行上统计（`waiting-cross-project`）。OWT-029 说明此类工作的记录应存放在每个涉及项目的会话均可读取的受版本控制仓库中，而不仅存于某个人的 AI 工具记忆中；检查不会裁决载体保存在何处。这涵盖单人在单机上的会话；人与人之间的共享在此处未做裁决。三项要求均为 `warning` 级别且未校准。
- **`uds open-work waiting --root NAME=DIR`（可重复）与 `uds.project.yaml` 中的 `open_work`。** 其一直支持的单一 `--root DIR` 行为与以前完全相同（在 14 次运行中与 1.2.0 检查器的冻结捕获逐字节比对；第二个普通 `--root` 现在会被拒绝而不是被误读）。`--root NAME=DIR` 说明另一个项目的位置；`uds.project.yaml` 中的 `open_work.projects` 可以在无需键入的情况下声明同样的内容，相对目录根据该文件进行解析，且两者均提供同一名称时以命令行优先。包含格式错误 `open_work` 区块的可读文件会使命令以退出码 2 终止；完全无法读取的文件会被提示并继续运行命令。同一个 `open_work` 区块还包含 `next_action_words`（见下文），因此一个设置命名空间即可满足两者需求。
- **`uds open-work next-action` 可识别更多人们用于表示“下一步行动”的词语，允许项目自行声明，并说明其为何以 2 退出（XSPEC-461）。** 载体中按状态每个状态一张表格的用户过去会遇到退出码 2 却未被告知原因。现在 `下一個動作`、`下一個步驟` 和 `接下來要做什麼` 均可被识别，并与作为标题、表格表头和行内标签所读取的词语共用同一份列表。`待辦`、`後續`、`Next`、`TODO`、`Action` 和单纯的 `接下來` 被刻意**排除**（它们也常用于非下一步行动的列头），回归测试对此进行了固定。`--next-action-word <word>`（可重复；同样适用于 `separation`）以及 `uds.project.yaml` 中的 `open_work.next_action_words` 可将词语添加到该列表中；词语为纯文本、不区分大小写、绝非模式，空白词语将被拒绝并以 2 退出。当未找到任何字段时，退出码仍为 2，且文本现在会针对每个载体列出其见到的表格表头和标题（约 20 个，随后的以“以及另外 N 个”表示）、它所识别的词语（声明的词语单独列出）、如何添加词语，以及该载体是否包含没有匹配表头的表格或完全没有任何可读取内容。`glab` 和 `dotnet` 现在为内置命令（用户写的 `glab mr merge 486` 过去被判定为未指定任何内容）；`go`、`make` 和 `sh` 被刻意排除。`--command-word <program>`（可重复）和 `open_work.command_words` 可添加程序，且 `next-action` 和 `waiting` 均可读取它们——`waiting` 过去在缺少它们时会询问“该草稿是否指定了操作”。`next-action` 现在还会指明路径是在哪个目录下查找的，以及它是来自 `--root` 还是当前目录；当载体位于所有 git 仓库之外且未提供 `--root` 时会予以说明；并将 `named-unresolved` 拆分为 `path-missing`（已查找但不存在）和 `not-resolvable`（命令、测试名称或需求标识符，从不进行查找）；旧有的统计计数行保持不变，两个新数字相加等于该值。现有载体上的所有其他 `next-action`、`revision` 和 `separation` 输出均未改变：与 1.1.0 捕获内容逐字节比对，在移除了新增行后完全一致，仅有的两处以退出码 2 结束的“未找到字段”情况得到了扩充，且旧文本仍然作为其开头。
- **`developer-memory` 和 `project-context-memory` 中的边界说明（两者均为 1.2.1，XSPEC-460 R5）。** 个人的、跨项目的、可识别的事实（谁拥有什么、如何访问某个环境）在此处不属于记忆条目：它们应当归入用户自有的 AI 工具记忆中。项目之间的协调（谁在等待谁）属于未完工作而非记忆，并指向 `open-work-tracking`。两个标准的 zh-TW 和 zh-CN 译本原本就已经落后（1.0.0 和 1.1.0）且依然如此；本次仅向其中添加了本节内容。
- **`uds check` 在个人技能与项目中安装的 UDS 技能同名时发出警告（XSPEC-465 R1）。** Claude Code 对每个名称仅运行一个技能，并将个人技能（`~/.claude/skills/`）排在项目技能（`.claude/skills/`，即 `uds init --skills-location project` 和 `uds update --apply --skills` 存放 UDS 技能之处）之上，导致采纳者自己的 `plan`、`push` 或 `commit` 会静默替换 UDS 的技能：没有错误，没有提示。`uds check` 现在会比对这两个文件夹，命名每一对冲突项，说明将运行个人技能，并说明如何解决（重命名你的技能，或删除 UDS 的技能）；`uds init` 和 `uds update --apply --skills` 会在安装结束时打印相同的警告。名称为 `SKILL.md` front matter 中的 `name:`，若无此项则为文件夹名称，两者均参与比对（文件夹名称也可以调用技能）。仅供参考：无论是否带有 `--ci`，它既不改变判定结果也不改变退出码；缺失、非文件夹、无法读取或包含损坏 `SKILL.md` 的个人文件夹不会输出任何内容也不会导致失败；UDS 自身的用户级副本（来源为 `universal-dev-standards` 的 `~/.claude/skills/.manifest.json`）以及本身即为主目录的项目会被排除。**它无法感知企业级别，或在其运行之后添加的个人技能，文本对此予以说明：没有警告并不代表没有冲突。** 插件技能（`/<plugin>:<skill>`）和 `.claude/commands/` 文件不在此列。（英文、繁体中文和简体中文。）
- **文档：`docs/user/GETTING-STARTED.md` 中的“当个人技能与 UDS 技能同名时”，以及 `skills/SKILL_NAMING.md` 中的命名规则 6（XSPEC-465 R3）。** 当某个名称出现在多处时将运行哪个技能（Claude Code 技能文档，2026-10-07 读取）、这对具有通用名称的 UDS 技能（`plan`、`push`、`sweep`、`orchestrate`）意味着什么、如何通过 `uds check` 查看该情况，以及如何解决它。UDS 未为此重命名随附技能（重命名会破坏现有的所有调用）；新技能应避免使用单一通用单词。（英文、繁体中文和简体中文；命名规则与文件本身一样为中文。）
- **`open-work-tracking` 1.4.0——已询问且正在等待回复的项根据 OWT-022 判定，而非 OWT-019（XSPEC-464）。** 用户将 17 个下一步行动中的 14 个记录为“等待对方回复、等待排期、等待撤销”；`uds open-work waiting` 接受了这些行，而 `uds open-work next-action` 却拒绝了相同的行，因为“等待回复”没有指明任何文件、命令、测试或标识符。现在，处于 `asked-awaiting` 且被 OWT-022 判定为完整的行（真实的 `asked-at` 且非未来时间、所等待的内容、解除事件）构成了 OWT-019 的第四种结果 `waiting-on-reply`：不属于违规，不计为已命名，不计为已完成，在单独区块中列出并展示其时间跨度，并在超过 `--stale-after`（默认 7 天，未校准）时标记为 STALE。这并非藏匿违规的地方：缺失三者中任意一项的行、`not-yet-asked` 行、处于其他状态的行、作为标题区块书写的下一步行动以及没有状态列的载体均像以前一样进行判定。`next-action` 通过 `waiting` 所运行的同一函数读取该行的状态，因此两者不会对同一行产生分歧；一项自测分支以及针对中英文行的属性测试确保了这一点。`uds open-work next-action` 接受新的选项 `--now` 和 `--stale-after`；仅当 N 不为 0 时，其统计行才会追加 `waiting-on-reply=N`。无新增需求标识符。冻结的 1.1.0 和 1.2.0 捕获内容仍然逐字节匹配。检查仅判定三个字段是否存在且格式良好；无法判定请求是否真正发出。
- **`open-work-tracking` 阐明 OWT-007 摘要可由程序打印，而完整列表可按需获取（XSPEC-465 R2）。** OWT-007 从未指明谁来生成摘要或摘要的长度。新的小节说明了低成本方式（程序在回合结束时打印简短摘要；完整版本仅在被索取时生成，从而模型不消耗 token）和高成本方式（模型在每次回复中写入完整表格，有效但不作硬性要求），针对前者保留了 OWT-008 和 OWT-009，作为建议提出了用于摘要的词汇表（等待决策、等待外部回复、等待 CI、固定日期到期、无人跟进），并明确说明 UDS 不随附生成此类摘要的程序，且此处没有任何检查来验证其是否存在。无新增需求标识符，亦无新检查。
- **测试版验收：一个程序在每台机器上针对已发布的包运行验收步骤（XSPEC-469 R2、R3）。** `node scripts/beta-acceptance/run.mjs --version <version>` 从 npm 将该版本安装到临时文件夹（而非仓库源码）中，运行 `scripts/beta-acceptance/steps.json` 中适用于该机器操作系统的一系列步骤——每个步骤在具有自己独立临时主目录的独立文件夹中运行，绝不使用真实主目录——并输出供粘贴回去的 Markdown 报告和供比对的 JSON 报告：操作系统和版本、shell、Node 和 npm 版本、Windows 控制台代码页（无法读取时注明“取不到”及原因，绝非空白）、UDS 版本，以及每个步骤的通过、失败、跳过（其他平台）或未确认状态，并附带其输出摘要。它仅使用 Node 标准库且无需 shell 即可启动程序，因此同一行命令可在 PowerShell、cmd、Git Bash、zsh 和 bash 中通用。它是维护者工具，不属于 npm 包的一部分。退出码 0 表示有步骤通过且无步骤失败；1 表示有步骤失败；2 表示无法运行（安装失败、安装了另一版本、步骤文件格式错误）；3 表示零步骤通过——没有任何测试的运行绝不能视为通过。需要人工审视的步骤（例如 cp950 控制台中的中文文本）会在终端中询问或从 `--answers` 中读取；在无回答时记录为“未确认”且不计入通过。`steps.json` 针对下文的每个条目以及 beta.6 的修复（此前从未在 Windows 上运行过）均包含一个或多个步骤。这些步骤针对 beta.6 和 `main` 的源码进行了验证（功能步骤在前者上失败而在后者上通过），并曾在 macOS 上针对真正发布的 beta.6 运行验证。**未验证**：尚无步骤在真实 Windows 机器上运行过；beta.7 的运行将是首次。
- **CI：每个 `[Unreleased]` 条目都需要一个验收步骤，且 `docs/PRE-RELEASE.md` 为自动生成（XSPEC-469 R1、R5）。** 当 `[Unreleased]` 下的 Added、Changed 或 Fixed 条目在 `steps.json` 中既无对应步骤，亦无理由说明其为何无用户可见行为的 `exemptions` 项时，`node scripts/beta-acceptance/check-steps.mjs`（CI 作业“Beta Acceptance Coverage”）将失败并指出该条目。步骤根据条目的起始文字（至少 20 个字符）来指名其对应的条目：修改条目末尾的措辞不会改变任何事情，修改其开头则会使该条目和步骤同时变红并被指出。`generate-pre-release.mjs` 从 `steps.json` 写入 `docs/PRE-RELEASE.md` 的“要测什么”列表（该列表不再手动键入），并仅根据 `scripts/beta-acceptance/reports/<version>/` 中的 JSON 报告生成“已验证平台”表格：没有报告的平台显示为“尚未验证”，来自 `--local-bin`、`--source`、注入安装程序、另一版本或未测试任何内容的运行报告绝不会填入单元格。当文档与将写入的内容不符时，`--check`（相同的 CI 作业）将失败。
- **CI：当推送到 `main` 时，端到端测试会在 ubuntu、windows 和 macos 上运行（XSPEC-469 R4）。** 过去它们仅针对 pull request 且仅在 Ubuntu 上运行，而 Windows 作业仅运行单元测试。pull request 保持仅在 Ubuntu 上运行，且仅在 `cli/**` 发生更改时运行。推送到 `main` 的运行不再会被下一次推送取消（pull request 运行仍然会被取消），因为被取消的运行与被跳过的运行一样都算不上通过。使用 bash 运行 `scripts/check-*.sh` 的四个测试在 Windows 上调用 `ctx.skip()`；该作业的最后一步（`scripts/ci-vitest-summary.mjs`）将运行、通过、失败和跳过的测试数量写入作业摘要，且在没有测试运行时判定为失败（跳过不等于通过）。**未验证**：工作流仅由 YAML 解析器和测试读取，未由 GitHub 实际运行，且 `actionlint` 不可用；首次推送到 `main` 将是其首次运行，仅在 Windows 或 macOS 上失败的测试届时会使其变红。
- **`check-anti-fake-tests` 还会指出期望值不独立于被测代码的测试（XSPEC-470 R1）。** `full-coverage-testing` 过去仅在测试绝不可能失败时（`expect(true).toBe(true)`）将其称为重言式（tautology，同义反复）。期望值源自其被测代码的测试同样必然通过：`expect(total(items)).toBe(total(items))`，或 `expect(total(items)).toBe(items.reduce((s, i) => s + i.price, 0))`，后者不过是将相同的算术逻辑又打了一遍，即使实现错误也会吻合。`uds init` 写入到 `scripts/check-anti-fake-tests.mjs` 的扫描器现在将这两种形态均报告为 `tautology`（JavaScript/TypeScript：`toBe`/`toEqual`/`toStrictEqual`，chai 的 `to.equal`/`to.eql`，node 的 `assert.equal`/`strictEqual`/`deepEqual`/`deepStrictEqual`）：两侧为带有相同参数的相同调用，以及期望值将调用自身的输入通过 `reduce`、`map`、`flatMap` 或 `filter` 运行，且回调仅使用其自身参数并不包含字面量；仅读取断言本身的文本，因此绝不透视前几行定义的名称。`--json` 包含 `forms` 和每个断言的行号。**在无法确定时保持沉默**：状态的前后对比、与第二种实现的对比、在测试名称声明了确定性（determinism）、幂等性（idempotence）、缓存（caching）或恒等性（identity）的测试中比较的两个调用、在固定表中的查找（`ids.map(id => PRICES[id])`）、按字面量筛选（`users.filter(u => u.id === 2)`）、调用内部的调用（`render(now())`、`parse(serialize(rows))`）、仅返回或浅拷贝其参数的回调（`rows.map(r => r)`、`users.map(u => ({ ...u }))`、`pairs.map(([k, v]) => [k, v])`）、在操作前保存并在操作后对比的值（`const before = items.map(...); freezeCart(items); expect(pricesOf(items)).toEqual(before)`）、作为结果属性的被测值（`sortUsers(users).length`）、无参数的调用、`new` 表达式、取反匹配器，以及同时包含不属于这些形态之断言的测试（与 `expect(true).toBe(true)` 相同的“仅包含断言”规则）。在本仓库自有的 297 个测试文件（4,200 个测试）上未报告任何新问题；初稿曾将此前定义的名称视为“相同调用”并报告了 6 个测试，均属合理的前后对比或确定性检查，这就是为何它现在仅读取单条语句中所写内容的原因。`full-coverage-testing` 1.3.0 现在将第二种重言式定义为“断言的神谕（oracle）即为实现本身”，指向 `verification-oracle` 而无需再次定义独立真理，并附带实例以及审查人员针对脚本无法决定的情况所提出的问题；扫描器的自测增加了新形态及其外观相似的形式，因此削弱版的扫描器副本会以 `2` 退出而不是继续运行。**谁会看到差异：** 在本版本之后由 `uds init` 写入 `scripts/check-anti-fake-tests.mjs` 的项目；现有文件绝不被覆盖，因此可将 `templates/gates/check-anti-fake-tests.mjs` 覆盖到你的文件上来获取该规则。它默认发出警告；在 `.standards/test-policy.json` 中配置 `"mode": "block"` 后，新发现可阻断提交。**我们接受的两项代价：** 使用参考实现作为神谕的差异测试看起来与教科书示例完全一致因而会被指出（添加一条针对手算字面量的断言，或将文件列入 `ignore`）；且该规则容易规避（将被测值包装在 `Number(...)` 中、为其添加 `.valueOf()` 或 `[0]`，或传入 `items.slice()`；对期望值做相同处理仍会被指出），因此它是供审查人员使用的提示，而非防范故意绕过的闸门。**应对方式：** 将重复调用或重写的算术替换为字面量或手算示例；有意为之的比较应当放入专门以此命名的测试中。（XSPEC-470 R1）
- **`code-review-checklist` 1.6.0 及 PR 模板要求每次变更声明其合并危险程度：双向门还是单向门，并用一个词概括爆炸半径（XSPEC-470 R2）。** 双向门在合并后可以轻松撤销；单向门则无法撤销，或撤销难度极大（数据迁移、删除操作、更改默认行为、更改退出码、重命名公共接口）。新的检查清单第 11 项以及审查人员与作者步骤声明，单向门必须在合并**之前**让决定合并的人知悉；`pr-review` 选项模板（1.1.0）和本仓库自身的 PR 模板均包含该字段。检查清单还询问审查人员测试的期望值是否独立于被测代码。**谁会看到差异：** 复制 `pr-review` 模板或阅读检查清单的人；没有任何程序强制执行。**应对方式：** 如果需要，将该字段添加到你的 PR 模板中。（XSPEC-470 R2）

### 变更

- 旧版 `uds update` 提示信息“N new standard(s) available for your level”不再提及等级（level）：没有等级规则（manifest 的 `level` 是无任何代码读取的残留物）。
- `uds audit --report` 不再将“可用标准未安装”的发现作为提交给维护者的反馈。
- **行为变更——`uds skills` 输出文本发生改变（XSPEC-462 R1）。** 项目级和用户级安装不再标记为 `(deprecated)`，插件不再标记为 `(recommended)`，且“Manual installation is deprecated”和“Recommendation: Migrate to Plugin Marketplace”两行已被移除。取而代之的是，每次运行结束时并列展示安装 UDS 技能的两种方式：安装到项目中（`uds init --skills-location project`、`uds update --apply --skills`；支持多种 AI 工具、繁体和简体中文文本、遵循你安装的 UDS 版本，包括测试版）以及 Claude Code 插件市场（仅限 Claude Code、仅限英文文本、仅限稳定发布版、项目中无文件）。废弃的说法始于 2026-01，并与一直建议人们运行 `uds update --apply --skills` 的 `uds check` 和 `uds update` 相抵触。匹配旧文本的脚本需要更新。（英文、繁体中文和简体中文。）
- **`uds update` 的“技能有可用更新”提醒** 现在针对项目级、用户级和未知安装提示 `Update them with: uds update --apply --skills`。过去它将它们称为已废弃，指向通用的插件 URL 并建议在技能文件夹中执行 `git pull`。对于来自插件的技能，它现在指明市场为 `asia-ostrich`（`/plugin marketplace update asia-ostrich`），而非 `anthropic-agent-skills`。
- **行为变更——对于唯一的 OWT-019 违规是 OWT-022 判定为完整的 `asked-awaiting` 行的载体，`uds open-work next-action` 改为回 0，不再回 1（XSPEC-464）。** 这些行现在被认定为 `waiting-on-reply`。包含任何其他违规的载体仍然以 1 退出，且没有状态列的载体表现与 1.3.0 中一致。
- **行为变更——`uds init` 和 `uds init --yes` 现在会将 UDS 技能安装到项目中（XSPEC-468 R1）。** XSPEC-462 将“安装到项目中”定为主路径，但每当检测到 Claude Code 时，`uds init --yes` 仍然会选择 Claude Code 插件且不写入技能文件，并且在没有 AI 工具标记的文件夹中完全不写入技能。运行 `uds init --yes` 的现有脚本现在将在 `.claude/skills/` 中获得技能（针对 Claude Code；其他检测到的工具获得其自有的文件夹），以及更大的 `git status`。交互式提示预先选定项目级别，因此按下 Enter 即可安装它们。如需保留旧结果，需按名称请求：`uds init --yes --skills-location marketplace`（插件：不向项目中写入技能文件，且安装结束时会说明技能来源、插件无法执行的操作以及如何将其移入项目中）或 `--skills-location none`。在交互式提示中，取消全选即可跳过。若 UDS 插件已经安装，安装结束时会打印与 `uds check` 相同的“技能重复安装”警告。`uds init --help` 中 `--skills-location` 的默认值现在为 `project`。
- **行为变更——`uds init` 的命令契约步骤不再重写整个 `uds.project.yaml`（XSPEC-468 R5）。** 当该文件存在且你同意覆盖它时，向导过去会根据其询问的四个命令重新写入该文件，并丢弃其余所有内容：`open_work:`（`uds open-work` 所读取的内容）、`custom:`、注释。该问题现在会列出保留的区块，且默认回答依然为 no；在回答 yes 时，仅更改 `commands:` 下的 `test`、`lint`、`build` 和 `security` 行（当前值为每个问题的默认值，空白回答将保持该行不变），文件的所有其他字节保持原样。非有效 YAML 的文件无法部分保留，因此问题会说明这一点并询问是否全盘替换。
- **文档和提示词不再推荐插件市场（XSPEC-468 R2）。** `docs/CLI-INIT-OPTIONS.md`、`docs/WINDOWS-GUIDE.md`、`docs/USAGE-MODES-COMPARISON.md`、采纳指南和检查清单、`uds init` 提示文本以及较早的设计说明现在均表述 XSPEC-462 的决定：项目方式为主路径，插件为备选方案并在其旁注明了限制（仅限 Claude Code、技能文本仅限英文、仅限稳定版本、项目中无文件）。涵盖三种语言。3.2.x 发行说明和本变更日志仍保留当时版本的引用。如果 Markdown 文件或 CLI 自身文本再次推荐插件，`npm test` 现在会失败并指出文件和行号。

### 修复

- **插件设置声明了错误的技能数量（XSPEC-462 R3）。** `.claude-plugin/plugin.json` 声明“25 comprehensive skills”，`marketplace.json` 声明“23 skills”，且 `.claude-plugin/README.md` 列出了 15 个，而插件实际加载了 56 个。描述中不再包含数字，上述检查可保持这一点。
- **`uds open-work waiting` 将列表项的空白字段误读为其下方的 `Next action:` 行所填充（在构建 XSPEC-464 时发现）。** 在列表项中，最后一个被识别标签的值一直延续到列表项末尾，因此留空的 `- release:` 紧随 `- Next action: wait for the vendor reply` 会被误读为具有 release，导致 OWT-022 放行了未声明任何 release 的 `asked-awaiting` 项。`Next action:` 标签（内置词汇）现在会终结其前面的值，且自身绝不作为字段。缺少 release、所等待内容或 `asked-at` 且下方带有 next-action 行的列表项现在会被 `waiting` 报告（OWT-022），且不再被 `next-action` 赦免；表格不受此影响。
- **缺少中文技能文本的 UDS 副本安装了英文且未作提示（XSPEC-468 R3）。** `--locale zh-tw` 或 `zh-cn` 从包的 `locales/` 文件夹中获取文本，当该文件夹不存在时，静默复制英文技能并以 0 退出，与 XSPEC-451 中 `zh-CN` 变成英文的情况相同。`uds init` 和 `uds update` 现在提示“The zh-TW skill texts are not in this copy of UDS, so the skills were installed in English”，说明原因为副本不完整或损坏而非网络原因，并给出修复命令。安装仍以英文继续；这不属于错误。这些文本包含在 npm 包中（对于 zh-TW 约 4.6 MB，对于 zh-CN 约 4.1 MB，按打包后的 tarball 计算），因此安装它们无需网络连接：安装指南在三种语言中均说明了这一点。
- **`uds init` 和 `uds update` 会重试因文件被短暂锁定而失败的文件复制，并在锁定未解除时以直白文字予以说明（在 2026-10-08 的 Windows CI 运行中发现）。** 在 Windows 上，杀毒软件实时扫描、搜索索引器或云同步客户端可能会短暂占用文件；此时将标准复制到其上会因 `EBUSY: resource busy or locked, copyfile ...` 失败，且 `uds init` 会回滚整个安装，尽管实际上并没有任何错误（`--locale zh-cn` 端到端测试在一次 CI 运行中因此失败而在下一次运行中通过）。复制标准和扩展（语言包、语言或框架文件）现在最多重试 10 次，等待时间递增（50 ms、100 ms……最高 500 ms；每个文件最多等待约 2.3 秒，5 秒为硬性上限）。`EBUSY` 在所有平台上重试；`EPERM` 和 `EACCES` 仅在 Windows 上重试（杀毒软件会导致这些错误），因为在其他平台上它们是重试无法解决的真实权限错误，仍会立即失败。若锁定未解除，安装像以前一样回滚，且提示信息现在会指出文件名、说明其被其他程序锁定、列出常见原因（杀毒软件扫描、搜索索引器、云同步、编辑器），并提示关闭该程序或将文件夹添加到杀毒软件排除项中再重新运行命令，文本中保留原始错误代码。不受此重试机制覆盖的部分：写入或复制文件的其他位置（技能、hook、`github.js` 本地副本、旧版集成文件副本、更新计划内针对非标准或非扩展条目的直接文件复制、更新备份与恢复、manifest 写入）；它们的行为与之前一致。`uds update` 受此机制覆盖，因为它通过相同的函数复制标准，但测试主要由 `uds init` 驱动。

## [6.14.0-beta.6] - 2026-10-07

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行为改变：**对于无法模拟的标准，`uds simulate` 退出码改为 2（原为 1）；`uds update` 从 manifest 中移除 UDS 无法保证真实性的名称；备份移至 `.uds-backups/`；`uds.project.yaml` 中的双引号值现在遵循 YAML 规范。

> **行为改变：**`uds update` 将其备份写入 `.uds-backups/`，而不是项目根目录下的 `.uds-backup-*`；`uds simulate` 在无法得出判定时退出码为 2（而非 1），且 `uds simulate -s commit-message` 现在在进程内判定而非运行 `npx commitlint`；`uds update` 从 `manifest.skills.names` / `commands.names` 中丢弃 UDS 无法保证真实性的技能与命令名称；`uds run` 将 `uds.project.yaml` 解析为 YAML（非合法 YAML 的值现在会失败，且空格后的 `#` 表示值结束）。

### 变更

- **行为改变——`uds update` 备份现在统一存放在一个文件夹 `.uds-backups/` 中，而不是在项目根目录下每一步生成一个 `.uds-backup-<time>/` 文件夹（XSPEC-456 R7）。** Git 从不显示旧文件夹（每个文件夹都隐藏了自身），但索引器、IDE 搜索和 grep 不会读取 `.gitignore`，会将它们对你文件的备份计入项目文件。现在每次备份都存为 `.uds-backups/<time>-<NNNN>/`，且 `.uds-backups/` 附带一个包含 `*` 的 `.gitignore`（绝不修改你自己原本的 `.gitignore`）。在忽略 `.gitignore` 的工具中请排除 `.uds-backups`；`uds update` 在完成时会进行相应提示。较旧版本 UDS 留在根目录下的备份不会被移动：`--rollback`、连续步骤之间的链条、清理以及“最近五次”限制会合并读取两处位置，最新的优先。`uds uninstall` 仍不会触动备份。

### 修复

- **`uds run` 使用手写逐行解析器读取 `uds.project.yaml`，导致尾随注释变成了命令的一部分（XSPEC-456 R1）。** `test: dotnet test X.csproj  # 90 tests pass` 运行时附加了 `# 90 tests pass`；POSIX shell 会隐藏未加引号的 `#`，而 `cmd.exe` 不会。该文件现在按 YAML（js-yaml）规范读取：空格后的 `#` 表示值结束，带引号的值保留其 `#`，以带引号参数结尾的命令保留其闭合引号。非合法 YAML 的文件会失败并显示行号；请注意双引号值内的反斜杠在 YAML 中是转义符，因此 Windows 路径请勿加引号或使用单引号。
- **行为改变——`uds simulate` 不再对从未判定的内容打印 "Simulation Failed"（XSPEC-456 R2）。** `commit-message` 过去通过管道传给 `npx commitlint`；在项目中没有 commitlint 配置（.NET 项目，无 package.json）时，该工具拒绝运行，合规与不合规的消息在下载之后得到相同的回答。现在它根据标准自身的规则在进程内判定（头部 `<type>(<scope>): <subject>`、已安装选项文件的类型、规则 `scope-lowercase` 与 `subject-max-length`），无需 npx 也无需网络，且输出会列出未检查的内容。退出码：**0** 通过，**1** 不合规，**2** 无法判定（未定义模拟器、标准未安装、委托的工具不可用）——最后一项过去是 1 并附带字样 "Simulation Failed"。`--json` 包含 `status`（`pass` / `fail` / `cannot-simulate`）。委托的模拟器命令不再将输入直接粘贴进其 shell 字符串中。帮助文本现在指明了定义有模拟器的标准（目前仅有 `commit-message`）。报告中的“失败时退出码为 0”在 macOS 上无法复现，因此不声明已修复。
- **`uds skills` 列出已安装的 56 个技能中的 27 个，并输出 "27 / 30"（XSPEC-456 R3）。** 过滤器与分母曾是 `standards-registry.json` 中手动维护的 30 个名称的列表。现在它们改为 UDS 随附的技能（包含 `SKILL.md` 的文件夹），与 `init`、`update` 和 `check` 使用的集合相同；manifest 记录的为其他 AI 工具安装的技能也会被列出，且摘要会说明 `uds check` 为它们追踪了多少个技能文件。
- **行为改变——`uds update` 现在从 `manifest.skills.names` 和 `manifest.commands.names` 中移除 UDS 无法保证真实性的名称（XSPEC-456 R4）。** 在 `update --apply --skills` 移除了旧 CLI 复制到技能文件夹中的 `_shared`、`agents`、`ai`、`tools` 和 `workflows` 文件夹之后，`skillHashes` 是干净的，但名称列表仍保留了 56 个技能的 61 个名称。只有当 UDS 随附该名称的技能或命令，且（安装后）在 manifest 记录的安装位置存在于磁盘上时，名称才会被保留；市场安装以及无法检查磁盘的情况保持原样。现有项目会在下一次 `uds update`（包括已是最新版本的项目）时得到修正。记录名称的四个 manifest 字段是 `skills.names`、`commands.names`、`skillHashes` 和 `commandHashes`。
- **`uds spec list` 将完整的 SDD 规格列为 `draft` 且标题为空（XSPEC-456 R5）。** 它过去将每个文件都当作微规格读取并填入默认值。现在它会读取 SDD 头部——表格（`| Status | Approved (...) |`）、字段行（`- **Status**: Archived`）或 front matter——并将无法读取的内容打印为 "format: SDD (status not parsed)" 而非默认值。未改变：`spec show`、`confirm` 和 `archive` 仍会通过微规格模板重写文件。

### 新增

- **`uds deps --if-present`（XSPEC-456 R6）。** 在没有 `package.json`，或包未声明任何运行时依赖项时，它会输出不适用且未检查任何内容，并以退出码 0 退出（`--json`：`notApplicable`）。不带该标志时行为不变：缺少 `package.json` 仍以退出码 1 退出。

## [6.14.0-beta.5] - 2026-10-06

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行为改变：**`uds check` 将缺失或修改过的技能与命令文件计入结果（`--ci` 退出码为 1）；`uds check --diff` 对比已安装的包，而非 GitHub `main`；`uds init` 添加了两个在 commit 时发出警告的扫描器脚本。

### 变更

- **行为改变——`uds check --diff` 现在将你的文件与你所安装的 UDS 包内的副本进行对比，而非与 GitHub `main` 对比。** 该 diff 旨在回答“我对 UDS 交付给我的内容做了什么修改”；过去它会从 GitHub `main` 下载原始文件，因此在离线状态下会失败（包含扩展文件），且 UDS 自你安装以来在 `main` 上自行修改的任何内容都会被列为你所做的修改。现在原始文件直接从已安装的包中读取——标准、选项和扩展文件皆是如此——无需下载任何内容。该命令会输出比对的目标（`installed UDS package (version X)`）并指向 `uds update --plan` 以查看 UDS 在此之后变更的内容。当你项目中的标准所安装的 UDS 版本与当前安装的包不同时，它会予以提示，因为两个版本之间 UDS 变更的文件会显示为差异。当已安装的包中没有受追踪文件的原始版本时，该命令会**指名**提示，不下载任何内容，并以退出码 1 退出；它不再回退到 GitHub 或静默跳过该文件。在没有修改文件时，`--diff` 现在输出 "nothing to diff" 而非什么都不打印。**谁会看到差异：**运行 `uds check --diff`（或在交互式 `uds check` 中按 "view"）的任何人：在 `main` 与你的安装版本存在差异之处，diff 可能会与之前不同，而缺少原始版本的包在先前脚本读取退出码为 0 的现在会变为 1。**该怎么做：**无需任何操作；要查看上游的新增内容，运行 `uds update --plan`。实现 dev-platform XSPEC-453 R1。

### 移除

- **`extensions/languages/php/` 已移除**——两个未被任何内容引用的文件（`php-style.md`、`fat-free-patterns.md`，约 37 KB）；安装程序、注册表和文档使用的是 `extensions/languages/php-style.md` 和 `extensions/frameworks/fat-free-patterns.md`，它们保持不变。npm 包因此缩减了这两个文件，现在刚好包含安装程序可以安装的 5 个扩展文件；如果打包了未声明的扩展文件，新测试会失败。`uds init --lang php` 和 `--framework fat-free` 安装的文件与之前相同。实现 dev-platform XSPEC-453 R2。

### 修复

- **健康分的覆盖率维度不再报告 `has_tests`（该值之前恒为 0）。** `calculateCoverage` 声明了 `hasTests = 0` 且从未修改，导致 `uds audit --score` 打印出一个看似衡量标准是否有测试且数值固定的数字。它已从求和与 `details` 中移除；**没有项目的覆盖率得分会发生变化**（分母原本就是每个标准两个——`check-<id>.sh` 和 `check-<id>-sync.sh`）。(XSPEC-444 R5)
- **行为改变——`uds check` 现在会将缺失或更改的技能文件计入其判定。过去它会打印红色 ✗ 但仍以 "Project is compliant" 结尾，退出码为 0。** 技能完整性结果过去被计算出来后直接丢弃。现在，被删除或编辑的技能文件会使 `uds check` 输出 "Some issues detected" 并点名该文件，且 `uds check --ci` 退出码为 1（未加 `--ci` 时退出码保持为 0，与所有其他类型的发现一致；UDS 写入的 pre-commit 钩子运行普通 `uds check`，因此不会被此阻塞）。**谁会看到差异：**技能文件夹被修改或丢失文件的项目。**该怎么做：**运行消息打印的命令 `uds update --apply --skills`。**幽灵记录会优先处理，因此现有项目不会开始失败：**项目的 manifest 可能会列出 UDS 从未安装过的技能文件——采用者自己的技能，以及旧版 UDS 复制到技能文件夹中的 `agents/`、`workflows/` 和 `_shared/` 文件夹（因为旧版对整个文件夹进行了哈希），且随后的 `uds update` 在移除它们时并未将其从记录中清除（某个项目显示了 26 个“缺失”，在 6.11.0 和 6.14.0-beta.4 上相同）。现在安装程序仅记录它所安装的技能（而不记录它自身的 `.manifest.json`），`uds update` 删除的技能文件夹会丢失其记录，`uds check` 会忽略未描述随附技能的记录并说明数量（`N skill record(s) ignored`），且 `uds update`（`--apply`、`--skills` 或最新路径）会将其从 `.standards/manifest.json` 中永久清除。**同样适用于斜线命令文件**，它们之前也有相同被丢弃的结果：被删除或修改的命令文件现在会使 `uds check` 指名它且 `--ci` 退出码为 1（修复方式：`uds update --apply --commands`）。非 UDS 随附命令的命令记录会被 `uds update` 丢弃，而在用户级别安装的命令记录（由所有项目共享，因此不属于本项目担保范围）会被检查忽略并予以说明。当无测试代码或虚假测试检查被设置为 `"mode": "block"` 时，`uds check` 在打印 BLOCKED 后不再以 "compliant" 结尾。实现 dev-platform XSPEC-454 R2。
- **`uds update --rollback` 现在会撤销整个升级，而不仅是标准文件。** 在 `update --apply`、`update --apply --skills` 和 `update --apply --commands` 之后，执行一次 `--rollback` 恢复了标准和 `CLAUDE.md`/`AGENTS.md`，但留下了新的技能文件夹（`comprehension-ladder`）、技能和命令的 `.manifest.json` 文件以及 `.standards/manifest.json` 中的哈希记录处于新版本状态，导致 `uds check` 随后报告修改过的文件，项目与任何一个版本都不匹配。原因：备份仅记录了计划将覆盖的文件（不包括更新创建的文件，也不包括 `.standards/manifest.json`）；`--skills` 和 `--commands` 写入时根本没有备份；且还原使用了无法恢复目录的 `copyFileSync`。现在，`--apply`、`--apply --skills` 和 `--apply --commands` 的每一步都会进行备份，同时也记录其创建的文件（`--skills`/`--commands` 进行自身的备份，没有备份则不写入任何内容；它们仅备份 UDS 随附的技能和命令，绝不备份你自己的）；未加 `--apply` 的普通 `uds update` 仍与之前一样不进行备份；连续步骤通过前后的 `.standards/manifest.json` 哈希链接成链，因此一次 `--rollback` 会沿着整条未中断的序列回退，并在期间有其他操作修改了项目的地方停止并说明原因；还原操作会被读回验证，且该命令会打印其还原和移除的内容，如果有任何失败，**不会以 "successful" 结尾**（退出码 1，并附带重试方法）。**未涵盖并明确打印提示的内容：**用户级别的技能/命令（`~/.claude/skills`，由所有项目共享），以及较早版本生成的备份（其从未记录创建的文件或 manifest）。实现 dev-platform XSPEC-454 R1。
- **`uds update --commands` 将命令数量报告成了工具数量**（对于一个 OpenCode 报告为 "Updated Commands for 51 AI tools"）。该消息键在各种语言中措辞均为 "N AI tools"，过去被传入了命令文件数量。现在增加了一条带有两个插槽的独立消息——"Updated 51 commands for 1 AI tool(s)" / 「已為 1 個 AI 工具更新 51 個斜線命令」 / 「已为 1 个 AI 工具更新 51 个斜线命令」。旧键的其他用法原本就传入工具计数，保持不变。实现 dev-platform XSPEC-454 R4。

### 新增

- **`uds init` 现在随附了 `full-coverage-testing` 一直要求你编写的虚假测试与存根扫描器，且 `uds check` 会对它们发现的问题发出警告。** 该标准曾指出“添加 `scripts/check-stubs.sh` 和 `scripts/check-anti-fake-tests.sh`”，其验证器检查这两个文件是否存在——但 UDS 两者都未随附，导致该指示无法被执行。`uds init` 现在会写入 `scripts/check-anti-fake-tests.mjs`（**没有断言**的测试、唯一断言是诸如 `expect(true).toBe(true)` 或 `assert 200 == 200` 等**同义反复**的测试、**所有测试都被跳过或标记为 todo** 的测试文件）以及 `scripts/check-stubs.mjs`（`// WARNING: STUB` 标记、体声明为**未实现**且旁边没有标记、体为**空**且旁边没有标记的命名函数）。纯 Node 实现，无依赖项，不预设测试框架；它们属于你自己的文件。单独运行时，发现问题即以非零码退出。**`uds check`——即 pre-commit 钩子运行的内容——会运行它们并将发现的内容输出为 WARNING；除非你在 `.standards/test-policy.json` 中设置 `"mode": "block"`，否则不会阻塞任何内容**。在有暂存文件时，它会扫描这些文件；没有暂存文件时（CI 运行），它会扫描整个项目。**测试文件规则适用于 JavaScript/TypeScript、Python、Java/Kotlin/Scala/C#、Go、Rust、Ruby、Elixir、PHP、Swift、Dart、Lua 和 C/C++；任何其他语言的测试文件均列为 "NOT scanned"，绝不计为干净。** 它们只读取文本而不运行你的测试，因此以扫描器无法识别的名称进行断言的辅助函数会被报告为 "no-assertion"（将其命名为 `assert*`/`verify*`/`expect*` 或将其模式列入 `assertionPatterns`）。每次运行首先对照已知虚假测试和已知良好测试检查自身，如果失败则以 `2` 退出（“无法判定”，绝不通过）。已存在的文件绝不覆盖，`uds uninstall` 精确移除 `uds init` 写入的文件且仅在未修改时移除，对于较早初始化的项目，`uds update` 会提示是否写入它们（提示默认选 no；**`uds update -y` 会回答 yes**，因此升级命令为 `uds update -y` 的项目在下次更新时会获得这两个文件）。**谁会看到差异：**此版本之后的每次 `uds init` 都会在 `scripts/` 下添加两个文件，每次 commit 都会显示来自 `uds check` 的额外两行（或发现）。**该怎么做：**阅读发现内容；要忽略某一类文件，添加 `test-policy.json`；要强制执行，设置 `"mode": "block"` 或在 CI 中运行这些脚本。`uds check --standard full-coverage-testing` 现在会运行这两个脚本，而不是检查它们是否存在。(XSPEC-444 R5)
- **`uds check` 在提交修改了代码却未触及测试时发出警告。** 在有文件暂存时，`uds check` 会列出在未修改测试文件的提交中修改的代码文件，并列出其无法识别类型的任何修改文件（绝不假设正常，绝不阻塞）。删除不需要测试；纯重命名（git `R100`）以及与 `exempt` 条目匹配的路径是豁免的，输出会记录其原因。哪些路径是测试、哪些是代码，属于常见生态系统的默认数据——`*.test.*`、`*_test.go`、`test_*.py`、`*Test.java`、`tests/` 等——可通过 `.standards/test-policy.json` 进行扩展（而非替换）：`testDirs`、`testPatterns`、`sourceExtensions`、`nonCodeExtensions`、`ignore` 以及 `exempt` 条目，其中每一项都必须附带 `reason`，否则不予生效。**它发出警告并允许提交通过。** 在同一文件中设置 `"mode": "block"` 会使其阻止提交；这是提供的唯一步骤。**未构建的功能（因规范未对其进行定义）：**非成对修改数量的棘轮机制（其基线存放在何处以及它计入什么），以及每次提交的豁免理由（pre-commit 钩子无法读取提交信息）。(XSPEC-444 R2)
- **`uds audit --offline`。** `check` 和 `update` 已有此选项；`audit` 过去会回答 "unknown option"。加上此选项后，`audit` 不会发出任何网络请求——包括在每个命令后运行但之前在 `check` 和 `update` 上忽略 `--offline` 的“有新版本可用”提示，现在也会遵循该选项——并且 `--report` 会输出 "Offline mode: the report is not submitted."（附带退出途径 `--dry-run`），而不是启动 `gh`、浏览器或剪贴板。实现 dev-platform XSPEC-454 R3。

## [6.14.0-beta.4] - 2026-10-06

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行为改变：**当你的 lint 或测试失败时，`uds check --standard checkin-standards` 现在会失败，且非 Node 项目的原生 pre-commit 钩子现在可以阻止提交。参见“修复”下的前几个条目。

### 修复
- **`extensions/` 现已内置于 npm 包中，且 `uds init`、`uds update` 及对齐程序仅从包中安装扩展文件——它们都不会从 GitHub 下载。** 6.13.1 包包含了 `extensions/` 下 7 个文件中的 0 个（语言风格指南、框架模式、zh-TW 和 zh-CN 语言包），因此 `uds init --lang csharp`、`--lang php`、`--framework fat-free` 和 `--locale zh-tw` / `zh-cn` 在安装时会从 GitHub `main` 获取它们。导致两个后果：离线或公司网络下安装其中任何一个都会失败，且你获取的文件是当天 `main` 上的内容，而不是属于你所安装版本的内同。正是这同一个回退机制导致缺失 `zh-cn.md` 的问题被隐藏了数月。现在 `cli/scripts/prepack.mjs` 会打包整个目录；打包一致性检查会逐文件、逐字节将 `extensions/` 与包内容进行比对（过去它仅比对 `.ai.yaml` 标准，因此一个都不包含的包也会显示 "bundle parity holds"）；且包中不存在已声明的扩展会导致安装**失败并指明该文件**——不再下载，不再静默跳过。**谁会看到差异：**从 npm 安装的任何人会多获取 7 个文件（约 152 KB），且不会对其发起网络请求；`uds update` 也会从包中刷新 `manifest.extensions` 条目。**未改变：**本地缺少文件时仍会尝试 GitHub 的其他位置（标准、选项、集成、技能）以及 `uds check --diff`，后者仍会从 GitHub `main` 获取任何受追踪文件（包括扩展文件）的原始版本来进行比对。该清单已在规范中列出，此处未作更改。新增测试会运行 `npm pack`，将 tarball 安装到临时目录中，阻止并记录网络，并针对安装包声明的每个扩展选项运行 `uds init`，然后逐字节读回每个安装的文件；第二项测试从包中移除一个声明的文件，并要求安装失败并指名该文件且不尝试下载。实现 dev-platform XSPEC-452 R1, R2, R3。
- **`uds init --locale` 不区分大小写并在不支持该区域设置时给出说明**：`--locale zh-CN` 过去会以退出码 0 安装英文；现在它会安装简体中文。不支持的值（如 `fr`）仍会安装英文，但会打印警告而非静默处理。（dev-platform XSPEC-451 后续）

- **行为改变——当你的 lint 或测试失败时，`uds check --standard checkin-standards` 现在会失败。过去它会显示 "passed"。** 该验证器曾是 `(npm test --if-present || echo "No test script")`。`--if-present` 已经处理了“没有测试脚本”的情况；因此 `|| echo` 只起到了一个作用：将失败的 `npm test` 或 `npm run lint` 转换为退出码 0。UDS 自身的 `test-governance` 标准规定门禁必须以失败闭合；它随附的检查却并未做到。现在：失败的 lint 或测试脚本以非零码退出，输出会说明是哪一个（`FAILED: npm run test exited with 1`，随后是脚本自身的输出）；真正缺少脚本的情况不算失败，并打印 `No lint script` / `No test script`——仅在此情况下如此；`npm init` 为 `test` 写入的占位符（`echo "Error: no test specified" && exit 1`）视同缺失；没有 `package.json` 的项目通过检查并打印 lint 和测试**未**运行；存在但无法解析的 `package.json` 会失败，而不是被解读为“无脚本”。缺失 `CHANGELOG.md` 仍仅作为提示。**谁会看到差异：**pre-commit 钩子运行 `check --standard checkin-standards` 的项目（UDS 在 2026-02-04 到 2026-03-04 期间写入的钩子，`uds update` 将其保留为代码块的参数），以及在 CI 或脚本中运行该命令的任何人。过去测试失败却能通过的提交现在会被阻止——这正是其目的。**该怎么做：**运行 `npm test` / `npm run lint` 并修复其报告的问题。没有测试的项目不受影响。全新的 `uds init` 钩子运行普通 `uds check`，不会执行此验证器；它是否应该执行属于另一项决策，此处未作改动。该验证器现在运行 `node`，任何运行 `uds` CLI 的项目都已具备该环境。
- **`pipeline-security-gates` 验证器在流水线未提及安全门禁时不再通过。** 它过去将 `grep` 传给 `head -1` 并回退到 `|| echo 'no-ci-pipeline'`；`head` 恒以 0 退出，因此该回退从不执行，检查永远不可能失败。它现在使用 `grep -q`，并在 `.github/workflows/`、`.gitlab-ci.yml` 或 `Jenkinsfile` 未提及 `secrets`、`sast`、`sca` 或 `dast` 时以非零码退出。仅有 `uds check --standard pipeline-security-gates` 会运行它。
- **`uds init` 为非 Node 项目写入的原生 `.git/hooks/pre-commit` 现在可以阻止提交。** 它过去以 `... 2>/dev/null || true` 运行每个 linter，以 `uds check 2>/dev/null || true` 运行检查，然后打印 "Pre-commit checks passed"——它无法阻止任何事情并隐藏了自己的错误。现在，已安装的 linter（`ruff`、`go vet`、`cargo clippy`）失败会阻止提交，未安装的 linter 则会被跳过；UDS 检查具有与 husky 钩子相同的标记块，因此其退出状态会阻止提交，且缺失 `universal-dev-standards` CLI 时会说明如何安装并阻止提交，而不是静默跳过。`uds uninstall` 会完整移除该块，包括从你修改过的脚本中移除。**磁盘上已有的钩子保持原样**——UDS 无法证明被修改的文件属于它自己，且该更改不包含对此类文件的迁移。
- **`uds init --locale zh-cn` 现在可以正常工作。过去它会失败并回滚整个安装。** 安装程序声明了 `zh-cn` 并复制 `extensions/locales/zh-cn.md`，但该文件并不存在（仅存在 `zh-tw.md`），因此安装以 `extensions/locales/zh-cn.md: File not available` 结束并移除了所有已安装的内容——导致没有人能以简体中文安装 UDS，也没有测试以简体中文运行安装，因而一直处于损坏状态。该文件现已存在：使用大陆术语编写的简体中文语言包（不是繁体中文的逐字转换——在繁体包有相反表述之处，其词汇表注明 "Performance → 性能"）。它以 `zh-cn-locale` 与 `zh-tw-locale` 并列注册。新增测试针对安装程序声明的每个区域设置运行真实的 `uds init`（列表从安装程序中读取，而非硬编码在测试中），并读回语言包、manifest 以及已安装的技能；声明了区域设置但缺少其文件会使测试变红并指明该区域设置。comprehension-ladder 安装测试现在也通过 `uds init` 读取 zh-CN。**针对 npm 安装的说明：**在编写此条目时，`extensions/` 尚未包含在 npm 包中，因此语言包是在安装时从 GitHub（`main`）获取的；它现在已随包附带（见上文 `extensions/` 条目）。实现 dev-platform XSPEC-451 R1, R2。

### 新增

- **`ai-response-navigation` 1.3.0 → 1.4.0——R12，受控语言，带有一条强制条款。** 简化文本能使其更易于阅读，而最容易阅读的句子是语气笃定的句子，因此“简化”容易滑向确定性：“可能”变成了“是”。R12 将规则一分为二。**12.1 为强制项**：在为非作者读者缩短、简化、重写或翻译文本时，必须保留作者的限定词（might、could、probably、可能、推断、尚未确认），绝不能将不确定的断言转变为确定性的断言，且不得添加源文本未陈述的事实。这是其违背会导致读者相信不真实内容的唯一部分，且无需校准：检查方式是在任何语言下进行前/后比对。**12.2 为可选建议项**，标准中记录了其理由：以该语言自身的单位计算短句（起始范围，按语言校准）、一物一名、主动语态、一步一动作、少用分号、数字带单位。R10 现在指向 R12。
  - **标准中已声明不设英文词典。** 这些原则源自 ASD-STE100，其认可的词汇表和时态限制依赖于英语，不适用于中文或其他非英语文本。该标准仅采纳其原则，不随附词汇表，并警告按空白字符分割的字数统计器会将中文段落读取为一个词且永远通过。
  - **中文实操示例**：一个原文段落、约 80% 版本和严格版本，三者均保留了限定词，外加第四个更短但错误的重写版本（将“可能”变成了确定原因，将“尚未重现”变成了“已确认”）。已在 zh-TW 和 zh-CN 两个 `.ai.yaml` 副本中同步，并有测试读取随附文件，若强制条款被削弱或移除则会变红。
- **新增技能 `comprehension-ladder`（`/comprehend`）1.0.0——在不改变事实的前提下，将不易理解的 AI 输出转换为更易理解的形式。** 该技能从源文本构建一个大纲，然后从中渲染最多三层阶梯：受控文本、Mermaid 图表以及可离线打开且不从网络加载任何内容的单文件 HTML 解说页。没有视频阶梯。**需要三条守则**，每条都附有正面和反面示例：不添加源文本未陈述的事实、保留每个限定词（“可能”保持为“可能”），并为每个条目提供来源指针和“未涵盖”说明。该技能以受控语言编写（[ai-response-navigation](core/ai-response-navigation.md) 规则 12），其守则 G2 即为条款 12.1。
  - **尚未证明有效。** `skills/comprehension-ladder/eval-cases.md` 包含为此目的编写的 5 篇源文本，每篇都带有理解问题和答案，以及产出两个数字的运行流程：前后的正确答案率，以及违反守则的次数。该运行需要模型调用，目前尚未执行。在完成之前，该技能不声明有效性。
  - 随附 `zh-TW` 和 `zh-CN` 版本，并在注册表、manifest、`llms.txt` 和技能索引中注册。测试在临时项目中运行真实的 `uds init` 并读回已安装的技能：三条守则均存在且标记为必须，HTML 阶梯禁止外部资源，且没有视频阶梯。

## [6.14.0-beta.3] - 2026-09-30

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **现有采用者——请运行一次 `uds update`。** 早期版本的 `uds init` 写入的 pre-commit 钩子是单行 `npx uds check`，这可能会向 npm 请求名为 `uds` 的包，而该包并不是本项目。全新安装不再写入该内容，且 `uds update` 会替换现有 `.husky/pre-commit` 中由 UDS 自身写入的该行。另有新增：`uds uninstall` 仅移除其能证明由 UDS 写入的内容（较早版本 UDS 安装的项目会保留部分文件，并说明原因），且 `uds open-work next-action` 可以读取写为表格列的下一步行动。

### 变更

- **`uds open-work next-action` 现在支持读取写为 Markdown 表格列的下一步行动，而不仅限于标题或行内标签。** 其表头位于下一步行动词汇表（`Next action`、`Next step`、`下一步`、`下一動`，以及新增的 `回來要做什麼`）中的列，会在每一行中被读取，且每份报告都带有行号和该行的第一个单元格。词汇表仍为同一个列表：标题、行内标签和表格标题都会读取它。现在可以识别引用块内的表格（`> | … |`），且代码跨度内或反斜杠后的 `|` 不再分割单元格。单元格数量与其表头不一致的行会被列为 `UNDECIDABLE` 且绝不读为空白；在其他地方没有违反的情况下退出码为 2，因为干净的结果只能覆盖字段的一部分。空的、`—` 或 `-` 的单元格会被计入但不评估，且不属于 OWT-019 违反项。这是在真实工作日志上衡量 DEC-122 H2 基线时发现的，其中 80 行中有 32 行的单元格数量与其表头不同。`回來要做什麼` 是该工作日志实际使用的表头（其正文将该列称为下一動），且未校准（UNCALIBRATED，OWT-016）。该检查自身的变异测试增加了 8 个表格变异体；先前的 17 个仍会变红。

### 修复

- **`uds uninstall` 不再遗留 UDS 自己的文件，也不再移除无法证明属于 UDS 的内容。** 在 `init` → `update --with-hooks` → `uninstall -y` 之后，它曾报告 "Removed 5, Skipped 1, Errors 0" 并留下了 `scripts/hooks/` 下的 15 个钩子脚本、空的 `.codex/`、其生成的头部仍指向已删除的 `.standards/` 的 AGENTS.md，以及 `uds init` 写入的 `.git/hooks/pre-commit` 正文。现在的规则是：只有在 manifest 记录了由 UDS 写入（`installedArtifacts`，由 `init` 和 `update --with-hooks` 写入）**且**其内容仍与记录的哈希相匹配时，整个文件才会被删除。其他任何内容都会被保留，且输出会说明原因（`kept: modified since UDS wrote it`，`kept: no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this`）。文件夹仅在由 UDS 创建且当前为空时才会被移除；采用者自己的 `scripts/hooks/*.mjs`、`.agents/rules/*` 和钩子条目会被保留。较早版本 UDS 安装的项目没有记录，因此其脚本、生成的 AGENTS.md 文本和原生 pre-commit 正文会被保留并说明原因，而不是胡乱猜测。每个 "Removed" 行现在都对应一次真实的删除或编辑，以错误结束的运行会以非零码退出。
- **`uds uninstall` 在无人能回答时不再显示提示或堆栈跟踪，且在未执行任何操作时不再以退出码 0 退出。** `--dry-run` 绝不提示（它不写入任何内容）并预览每个类别。在没有 `--yes` 且没有终端的情况下，实际运行会以退出码 2 拒绝，而不是默认假设为 "yes"；关闭的提示以 130 退出；未初始化的项目以 1 退出。
- **`uds init --with-hooks` 在 Windows 上不再打印 `'chmod' is not recognized`。** pre-commit 钩子过去在 try/catch 内使用 `execSync("chmod +x ...")` 赋予可执行权限；catch 对代码隐藏了失败，但 `execSync` 已经将 cmd.exe 的错误发送到了终端。现在它调用 `fs.chmodSync`，并在没有可执行位的 Windows 上跳过该步骤。
- **安全修复：`uds init` 写入的 pre-commit 钩子不再向 npm 请求名为 `uds` 的包（该包不是本项目）。** 该钩子曾是单行 `npx uds check`。`npx` 首先在 `node_modules/.bin` 和 `PATH` 中查找，仅当两者都不存在时才访问 npm 注册表，而注册表中的 `uds` 包是一个无关的项目（维护者 wizawu，`github.com/wizawu/uds`，v0.3.6，最后发布于 2022 年，目前没有 `bin`）。在已安装 UDS 的机器上没有任何变化；在任何未安装 UDS 的克隆仓库中，该钩子会按名称获取陌生人的包——目前无害仅仅是因为该包*暂时*还没有可执行文件，一旦其发布可执行文件，每位采用者的每次提交都会运行它。`--no-install` 并不能解决问题：在记录每个请求的本地注册表（npm 10.9.9、11.20.0、12.1.0，表现相同）上进行测试，`npx --no-install uds` 仍会请求 `GET /uds`，而 `npx --no-install --package=universal-dev-standards uds` 根本找不到全局安装。该钩子现在两者都不用：它首先在项目的 `node_modules/.bin` 中查找 `universal-dev-standards`（包本身的名称，只有本项目可以发布），然后在 `PATH` 中查找，运行 `check`，如果在任何地方都找不到，则打印安装提示并以非零码退出——它既不跳过检查，也不下载任何内容，且失败的检查会阻止提交，即使后面有采用者自己的命令。`uds uninstall` 会根据其标记完整移除该新块。人类可读的文本也有相同的修复：生成的 `CLAUDE.md`/`AGENTS.md` 块内的警告行和钩子提示现在显示 `npx universal-dev-standards init` / `update`（警告行多出了几个 token，因此 `scripts/prompt-footprint-baseline.json` 刚好增加了测得的 3–6）。**现有采用者：**`uds update`（除 `--skills`、`--commands`、`--integrations-only`、`--standards-only`、`--rollback` 和 `--with-hooks` 之外的所有模式；`--plan` 只报告而不写入）会替换 UDS 自身在 `.husky/pre-commit` 中写入的行——仅针对其直接位于 `# UDS Standard Check` 标记下的 UDS 生成过的两种精确形态（`npx uds check`，以及较早的 `npx uds check --standard checkin-standards`）——而你自己编写或编辑的行会保持原样并报告其行号。它在 "already up to date" 返回之前运行，因此标准为最新版本的采用者也会得到该更新。`uds check` 现在会对仍运行裸名称的钩子发出警告。新增测试会遍历 `npm pack` 交付的所有内容，并在发现任何通过包运行器（npx、bunx、pnpm dlx、yarn dlx、npm exec）运行裸 `uds` 的字符串时失败；非 Node 原生钩子（`uds check`，仅从 `PATH` 解析，绝不通过注册表）未受影响，保持不变。

## [6.14.0-beta.2] - 2026-09-30

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **修复了 6.14.0-beta.1 的已知限制：**现有项目现在可以通过 `uds update --with-hooks` 获取 Antigravity CLI 钩子（以及其缺失的 Claude Code / Codex / Gemini CLI 钩子）。

### 新增

- **`uds open-work next-action | revision | separation | self-test`——`open-work-tracking` 1.1.0 参考检查（OWT-017/018/019）现已包含在 npm 包中。** 在 6.14.0-beta.1 中，这些检查仅存在于代码仓库的 `scripts/` 中，而 npm 包不包含该目录，因此采用者不克隆 UDS 就无法运行它们。现在规则集中在一个地方 `cli/src/utils/open-work-tracking.mjs`（在包内部）；`uds open-work` 和旧的 `node scripts/check-open-work-tracking.mjs`（现为不包含规则且重新导出该模块的 shim）都运行这同一个实体，并有测试要求它们的输出完全一致。检查本身没有任何改变：相同的退出码（0 无违反，1 违反，2 无法判定——2 不代表通过），检查器仍先运行自己的自测分支，且每次运行仍声明覆盖率未知（OWT-011）且词汇表未校准（OWT-016）。它仍然是作为证据提供的参考判定程序，而不是门禁。**观察到的红灯测试：**新测试复制了 CLI，使命令吞掉退出码（恒为 0）或使共享规则始终通过，并要求违反规则的样本对于该副本变绿；断言 `npm pack --dry-run` 列出了该模块。该标准的“什么在执行此标准”部分现在指向该命令，而不是仅存在于仓库中的路径。

- **`uds update --with-hooks`——针对已初始化项目的强制执行钩子，以及更宽泛的 Antigravity 检测规则。** 钩子以往仅能通过 `uds init --with-hooks` 进行挂接，而 `uds init` 拒绝运行两次，导致现有采用者永远无法收到 UDS 在其初始化后才开始支持的工具的钩子（在将 6.14.0-beta.1 包安装到新项目中时发现；记录为该测试版的已知限制）。`uds update --with-hooks` 重新检测工具（manifest 中的工具加上项目文件当前显示的内容）并安装缺失的钩子；`--ai-tool <list>`（`claude-code`、`codex`、`gemini-cli`、`antigravity`）则可直接指定工具，如果未找到任何工具，它会说明如何指定并以 1 退出，而不是胡乱猜测。已安装的钩子不会被重写（二次运行不改变任何内容），采用者自己的钩子绝不被移除或重新排序（合并 Claude/Codex/Gemini 条目；agy 的 `.agents/hooks.json` 仅在 UDS 自己的 `uds-turn-completion-integrity` 键下写入，非合法 JSON 的内容保持原样），采用者修改过的钩子脚本除非加 `--force` 否则保留，且 `--plan` 不写入任何内容。它像 `--claude-target` 和 `--sync-refs` 一样可独立运行；在已初始化的项目中执行 `uds init --with-hooks` 现在会指向它，而不是静默无操作。**Antigravity 检测：**它过去要求存在 `.agents/AGENTS.md`，而项目可以长期使用 agy 却从不创建该文件。现在它还接受 `.agents/rules/`、`.agents/workflows/`、`.agents/plugins/` 和 `.agents/hooks.json`——这些是 agy 自己的二进制文件所包含且 antigravity.google 记录的名称——并刻意**不**计入 `.agents/skills/`，因为 Codex 也会读取该目录（根目录下有 `AGENTS.md` 加上 `.agents/skills/` 的仓库保持为 Codex；这已通过测试）。检测仅取决于项目目录：曾考虑过 agy 打开项目的注册表 `~/.gemini/projects.json`，但因其属于机器本地文件而未采用。`.agents/hooks.json` 是一个标记，但也是 UDS 写入的文件，因此安装后它只能证明已安装，不能证明采用者使用的是 agy。**观察到的红灯测试：**测试将真实的 CLI 作为子进程针对已初始化的项目运行，如果 CLI 副本移除了补丁——删除了该分支、安装程序报告成功且不写入任何内容，并将检测重新收紧为 `.agents/AGENTS.md`——则必须在真实 CLI 通过的相同断言上失败。关于 agy 钩子仍须注意：仅在 `agy -p` 模式下验证了无工具调用的单回合。

### 修复

- **只要人类的前置条件超过固定字符数，`turn-completion-integrity` 就会阻止等待人类的回合——自 6.13 起就存在。** 针对条件性承诺（“一旦你做出选择，我就会应用它”）的豁免在英文包中限制在 `you` 和逗号之间的 20 个字符以内，在 zh-TW 包中限制在 `你` 和 `後` 之间的 1–6 个字符；两个数字都是凭感觉选取的。在已发布的 6.14.0-beta.1 上使用真实的 Claude Code Stop 钩子输入进行测量："Once you choose A, I will apply it." 通过，而 "Once you choose option A or B, I will apply it."（21 个字符）被阻止，"After you choose option A or B, I will apply it." 也是如此——决定结果的是从句的长度，而不是 `once`/`after`。该钩子仅在回合的*最后一条*消息上触发，因此采用者看到的是 Agent 在正确停下来提问后被强迫继续说话。修复方案：豁免现在延伸至从句边界（逗号、句子标点或换行符）而不是字符计数，因此 "Once you've reviewed the three options above and picked one, I will apply it." 和 "你看完上面三個選項並選好一個之後，我會接著套用。" 可以通过。放宽上限是让真实承诺得以通过的方向，因此有两点取代了字符计数：在英文中，从句自身不得包含承诺（"After you merged it I will follow up, I will push the tag." 仍会被阻止），而在 zh-TW 中，`你` 必须位于从句开头且不能是 `你的`（"我看了你的設定檔並判斷需要重構之後，我會接著改。" 仍会被阻止——这里的 `你` 是我自身句子中的所有格）。"I will apply it once the build finishes." 并不是在等待人类，因此仍会被阻止。**观察到的红灯测试：**新测试复制了钩子目录，恢复每个旧上限，并要求该副本在相同的句子上再次被阻止（且 `--self-test` 失败）。**已知的局限性（未变）：**豁免是按段落决定的，因此包含一个此类条件从句的段落会将其旁边无关的无条件承诺一并豁免，与之前一样；且没有逗号的条件句（"After you merged it I will follow up"）仍会触发。

- **运行 `scripts/pre-release-check.sh`——以及在该仓库中执行 `git commit`——会将 UDS 技能写入运行者的真实用户主目录中。** 2026-09-29，维护者自己机器上的一次发版前检查将 54 个技能文件夹和一个 `.manifest.json` 写入了真实的 `~/.claude/skills/` 中。用户级别的技能会覆盖项目级别的技能，导致使用 zh-TW 技能的项目静默运行了英文测试构建。每个步骤都是绿色的：执行写入的步骤是在 `mkdtemp` 目录中运行 CLI，这只隔离了*项目*，而没有隔离*用户*——`uds init -y` 和 `uds update` 会在运行的任何地方写入用户级别的文件（`~/.claude/skills`，`~/.uds`）。通过临时的 `HOME` 复现并测得（而非凭空假设）：`scripts/check-upgrade-fidelity.sh` 写入了 115 个文件（其 `uds update` 和前一版本的 `npx … init` 都继承了真实的 `HOME`）；最初怀疑的检查 `check-adopter-instruction-files.ts` 反而什么都没写。通过逐个文件二分单测，发现了另外两处写入者：`tests/commands/update-language-fidelity.test.js` 和 `update-agents-md-generator-fidelity.test.js` 调用了真实的 `updateCommand`（将 115 个文件写入 `~/.claude/skills`），且 `tests/commands/check.test.js` 写入了 `~/.uds/update-check.json`——而 pre-commit 钩子会运行单元测试，因此**该仓库中的每一次提交都会执行此写入**；该修复作者自己在修复完成前的第一次提交就再次写入了真实主目录。在三个层面上进行了修复：现在每个运行 CLI 的脚本都统一通过 `scripts/lib/isolated-home.{mjs,sh}` 在临时的 `HOME` 下运行（涵盖 `HOME`、`USERPROFILE`、`XDG_*`、`APPDATA`、`CODEX_HOME`；列表统一维护，bash 侧从 mjs 读取），涵盖了 `pre-release-check.sh` 的 dogfood 步骤、`check-upgrade-fidelity.sh`、`check-prompt-footprint.mjs`、`check-adopter-instruction-files.ts`、`check-skills-install-paths.ts`、`generate-usage-docs.mjs`、`cli/scripts/check-command-existence.mjs`、`cli/scripts/test-upgrade-path.mjs` 和 `cli/scripts/test-refactoring.sh`；测试套件在 `cli/tests/setup.js` 中为每个测试文件替换了 `HOME`；且 `pre-release-check.sh` 现在在启动前为 UDS 在 `HOME` 下写入的位置创建快照，并在摘要处报告是否有任何新增或修改，若有则失败（`scripts/check-home-untouched.mjs`）。监控的位置不是手工列出的：它们是从安装路径表以及 `cli/src` 中以 `homedir()` 为根的路径中遍历出来的，且会打印数量，因此缩减为空的集合无法通过检查。**端到端观察到的红灯测试：**在未隔离的情况下针对替身主目录运行 CLI，防护机制退出码为 1 并点名 `~/.claude/skills`；在隔离情况下退出码为 0；测试遍历每个启动 CLI 的脚本，并在调用处的隔离被剥离时变红，且探测测试在缺少 `tests/setup.js` 时会失败。**如果你在此修复之前运行过 `pre-release-check.sh` 或在此仓库中提交过代码，**请在 `~/.claude/skills/` 中查找 `installedDate` 为当天的 `.manifest.json` 以及其旁的 UDS 技能文件夹；用户级技能会覆盖项目级技能，如果你没有自行安装过它们，请将其删除。**刻意不监控的内容：**`~/.claude/skills/synced/`，Claude Code 自身在运行时会用账号的 claude.ai 技能填充该目录（在真实主目录上的第一次完整运行因它而失败，来源于运行检查的 Claude Code 会话）；它是防护机制排除列表中的唯一且经过推敲的条目，每次比对都会打印，且如果移除它或将其放宽到整个 `~/.claude/skills`，测试都会失败。**未覆盖的内容：**向任何安装程序未命名的路径进行的写入，以及端到端（`tests/e2e`）套件（已逐文件二分确认其未写入任何内容）。

## [6.14.0-beta.1] - 2026-09-29

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **已知限制（于 2026-09-29 将该包安装到全新项目时发现）：**Antigravity CLI 钩子仅在已有 `.agents/AGENTS.md` 的**全新**项目中通过 `uds init --with-hooks` 挂接（该文件是 init 检测 Antigravity 的方式）。现有项目中的 `uds update` **不会**添加它，且 `uds init` 拒绝运行两次。因此，现有项目在此测试版中无法获得 agy 钩子；计划在下一个版本中修复。

### 新增

- **`open-work-tracking` 1.1.0：OWT-016 之后的三个要求——意图与进展分离、对意图的修改留下记录、下一步行动指名对象。** OWT-017（警告）：存放工作项目标、验收条件或约束的载体不存放其任何进展或下一步行动，通过遍历每个载体的结构来判断，绝不依赖文件名，因此进展更新绝不需要修改目标。OWT-018（错误）：对该意图的每一次修改都会留下关于修改内容、批准人以及原因的记录；没有批准人的修改会在 OWT-007 交接时列出且绝不静默，且该列表绝不阻塞（OWT-008）。OWT-019（警告）：“下一步行动”字段指名文件路径、测试名称、命令或需求标识符；单独的动词不符合要求，且测试判定的是否指名了对象，而不是句子的可读性。严重程度在标准中进行了论证。该标准还记录了其刻意**不**从引发此需求的提示词中采纳的内容——该提示词是作者不明且无实现的转发文本，仅借鉴了其设计形态：手写状态文件作为唯一事实源（容易过时，且比过时内容更新的时间戳无法被察觉）以及固定的开工仪式（在各个 Agent 工具中配置，且属于针对产物的任何检查都无法判定的要求）。新增的 `scripts/check-open-work-tracking.mjs` 是这三项要求的参考判定程序，作为 OWT-015 证据提供而非作为门禁（UDS 仍不随附门禁，且未挂接到 `pre-release-check.sh` 中）：`next-action` 报告已命名且已解析 / 已命名但未解析 / 未命名，`revision` 对两个版本的验收/目标/约束部分（或文件与 `--base <git rev>` 对比）进行 diff 并要求提供新的完整记录，列出无批准人的修改供交接使用，`separation` 检查没有载体同时包含两者。它首先运行自己的自测分支，在无法判定时以退出码 2（而非 0）退出，并声明其无法判定的内容——记录是否如实描述了变更，以及指名的对象是否正确。**在每次测试运行中观察到的红灯：**测试套件复制该脚本，编辑其源码文本，并要求对真实脚本通过的断言在 17 个变异体上失败（每个要求的始终通过和始终失败、每个识别分支轮流关闭、旧记录被计为新记录、接受不完整的记录）。**未校准（OWT-016）：标题词汇表、命令列表、扩展名列表和标识符模式属于初始判定，而非测量结果**——例如 `已知限制` 被读取为约束部分；采用者应传入自己的标识符模式。在真实历史记录上重放时，它报告 XSPEC-436 的验收条件被修改且没有修订记录，以及 dev-platform 工作日志中有一个未命名的下一步行动。

- **`turn-completion-integrity` 1.5.0：现在支持 Antigravity CLI（`agy`），基于在真实会话中观察到的契约。** 该标准过去称 agy“尚未支持”，因为其 Stop 钩子契约尚未被观察到（R3：不对未观察到的契约构建适配器）。该契约于 2026-09-29 被观察到（agy 1.2.12，`agy -p`，单回合，无工具调用），适配器 `scripts/hooks/check-turn-completion-agy.mjs` 基于该次运行产出的内容构建，而非仅仅依靠文档：钩子有效载荷仅包含 `transcriptPath`，因此最终回复是最后一条 `MODEL`/`PLANNER_RESPONSE` 记录，人类的消息是最后一条 `USER_EXPLICIT`/`USER_INPUT` 记录（从 `<USER_REQUEST>` 解包，其后的系统块被丢弃）。`SYSTEM_MESSAGE` 记录绝不被读取为人类——agy 会将此钩子自身的 `continue` 原因作为一条此类记录写回，若将其读取为人类会使 R9 停止豁免失效。阻止为 `{"decision":"continue","reason":...}`，允许为 `{}`，且每个失败路径都会允许通过。当 Google Antigravity 是所选工具时，`uds init --with-hooks` 会写入 `.agents/hooks.json`（且不覆盖其无法解析的 `hooks.json`），`uds uninstall` 仅移除 UDS 自身的处理程序并保留用户的其他钩子。**已验证范围：单回合，无工具调用，`agy -p`。未验证：多回合、带有工具调用的回合、交互模式、`fullyIdle: false`、非空的 `error`、`.agents/hooks.json` 是否需要注册过的 Antigravity 项目，以及工作目录是否始终为 `.agents/`**——标准、适配器和安装输出均说明了这一点。**在同一天测得：agy 运行钩子时以 `.agents/` 作为其工作目录（而不是项目根目录），并静默放行启动失败的钩子，因此安装的命令为 `node ../scripts/hooks/check-turn-completion-agy.mjs`。**

## [6.13.1] - 2026-09-28

> **补丁版本**：修复了 6.13.0 暴露的在使用 `uds update` 升级现有项目时的两个缺陷（zh-TW 提交语言部分变成了英文；AGENTS.md 被重写为不同格式且缺少索引提醒），并添加了一个在每次发布前从上一个稳定版本执行实际升级的发版前门禁。**如果你已经运行过 `uds update` 升级到 6.13.0，请在升级到 6.13.1 后再次运行 `uds update`** 以恢复这些部分。

### 新增

- **`scripts/check-upgrade-fidelity.sh`，作为步骤 24 挂接到 `pre-release-check.sh`：在每次发版前运行的真实跨版本 `uds update` 升级检查。** 上述修复的两个回归问题具有相同的特征——它们仅在由上一个稳定版本更新过的现有项目针对较新版本运行 `uds update`/`uds update --apply` 时才会触发——而 pre-release-check.sh 的其他 31 个步骤以及 CI 都漏过了两者，因为它们都没有执行真实的跨版本升级：`uds init` 属于全新运行（没有可回归的基准），而针对与 manifest 已记录版本相同的内置注册表版本运行 `uds update` 会在触及损坏的代码之前提前返回。该检查使用从 npm 获取的真实的、已发布的上一个稳定版本构建了三种项目形态（匹配遇到这些 bug 的三个真实采用者），通过普通的 `uds update -y` 和 `uds update --apply` 使用受测的 CLI 对每个项目进行升级，并断言：UDS 标记块之外的内容绝不改变；块内的内容仅根据实际升级允许添加的标准列表/计数发生改变；提交信息语言标题（CLAUDE.md）在字节级别完全一致，而不仅是存在；包含“这只是一个索引”的提醒；`uds update -y` 和 `uds update --apply` 对生成文件的生成器归属保持一致；且在第一次 `--apply` 之后立即执行第二次 `--apply` 不会改变任何内容。如果 npm 无法访问或先前的版本从未发布，则明确失败（退出码 2，而不是跳过）——该检查的全部价值在于演练真实的发版，没有发版而静默通过会重新打开它原本旨在消除的盲区。双向验证：`--cli="npx -y universal-dev-standards@6.13.0"` 重现了上述两个回归（CLAUDE.md 语言反转和 AGENTS.md 生成器反转），并打印了实际的 diff；本地开发版 CLI（应用了 commit `e1524872` + `8373207d`）在所有三种形态上均干净通过。

### 修复

- **普通的 `uds update -y`（非 `--apply`）静默将项目的繁体中文 CLAUDE.md 提交信息标题替换为英文标题，并可能在 `--plan --integrations-only` 空运行报告中输出忽略项目显示语言的 diff。** `updateCommand` 的主流程及其 `--plan` 空运行各自独立地仅从 `output_language`/`commit_language`（提交信息语言）推导集成块的内容语言，忽略了 `display_language`（`uds init` 和对齐程序一直用于“你想阅读什么语言”的设置）。因此，以 `display_language: zh-tw` 和 `output_language: bilingual` 安装的项目（一种常见组合）在 `init` 时获得了正确的 `## 提交訊息語言` 标题，但在下一次普通 `uds update` 时变成了 `## Commit Message Language`，丢弃了原本已经正确的语言选择。在两个升级 6.12.0 → 6.13.0 的真实采用者（asiaostrich-telemetry-server、EngramGraph）上测得。该 bug 早于 6.13.0 存在（自 2026-03-25，commit `ad555d41` 起存在），且每当 `uds update` 针对已是最新版本的项目运行时都是不可见的，因为在这种情况下它在触及该代码之前就已提前返回——它只在真实的版本跃升时才会浮现，这就是为什么它看起来像是一个新的回归。`buildToolIntegrationConfig`（由 `--apply`/对齐程序使用）已经具备了于 2026-09-16 添加的正确推导逻辑；两个剩余的调用点现在通过新的 `resolveIntegrationLanguage(manifest)` 共享该逻辑。回归测试针对真实的临时项目和真实的生成器（无 mocking）重现了该确切缺陷，且静态防护会在旧的内联推导逻辑再次出现在 CLI 源码中任何位置时失败。
- **`uds update --apply`（对齐程序）在 `generateAgentsMd` 曾经写入过一次的情况下，立即将项目的 AGENTS.md 重写为完全不同的 opencode 格式文档——即使是在全新 `uds init` 之后且未作任何更改的第一次 `--apply` 上也是如此。** `desired-state-calculator.js` 的 `calculateIntegrations` 通过 `resolveToolKey` 将任何名为 `AGENTS.md` 的 `manifest.integrations` 条目解析为 `opencode` 工具，而不管 opencode（或其别名 `codex`）是否是实际选择的 AI 工具——一旦写入通用摘要，`uds init` 始终会在那里记录 `AGENTS.md`（一个追踪标记，而不是工具选择的记录），因此每个设置了 `generateAgentsMd: true` 且未选择 codex/opencode 的项目都会受到影响。根据生成器自身的设计说明（添加于 2026-08-20）：针对特定工具的模板仅在真正选择了 codex 或 opencode 时才用于替代通用摘要。在三个真实项目（asiaostrich-telemetry-server、EngramGraph、dev-platform 自己的 `.standards/`）上确认，其 `aiTools` 均不包含 codex/opencode 条目。`calculateIntegrations`（以及 `plan-executor.js` 的 `executeMigrateBlock`）现在会检查该工具是否真正被选中，若未被选中，则通过普通 `uds update` 已经使用的同一个 `writeAgentsMdSummary` 进行生成——`--apply` 与普通 `uds update` 现在达成一致。新增回归测试驱动真实的 `uds init`/`uds update`（无 mocking）；针对还原后的修复确认变红，包括第二次 `--apply` 的幂等性检查，该检查捕获了在构建修复时引入的后续哈希不收敛 bug（见下一条目）。
- **通用 AGENTS.md 摘要的“本文件为索引，并非标准本身”提醒（添加于 2026-08-18）从未进入现有项目的受管块中——仅存在于其固定的头部中，而基于标记的更新对于已存在的文件绝不会重新生成头部。** 对于已存在的文件，`writeAgentsMdSummary` 仅替换 `<!-- UDS:STANDARDS:START/END -->` 标记之间的内容；提醒位于头部，在标记之外。在两个真实采用者（asiaostrich-telemetry-server、EngramGraph）上测得：在真实更新的前后，提醒既不存在于文件头部，也不存在于块内部。该提醒现在也放在标记块内部（用词与针对特定工具的生成器自身声明 `generateIndexDisclosure` 完全一致——而不是第三种表述），因此每个项目在下次 `uds update`/`--apply` 时都会收到它，无论是新文件还是已有文件。通过特定工具生成器已经使用的同一个 `wrapWithMarkers` 辅助函数（而不是手写标记行）构建该块，还修复了在添加它时发现的相关漏洞：全新生成的 AGENTS.md 过去也从未带有 "DO NOT manually edit" 警告注释，因为过去只有合并路径才会添加它。

## [6.13.0] - 2026-09-28

> **正式发布**：包含以下 6.13.0-beta.1 至 beta.5 中的所有内容，自 beta.5 以来无变更。重点：回合完成钩子（Agent 不得在声明了未采取的下一步行动的情况下结束回合）现在涵盖 **Claude Code 和 Codex**，在从 npm 安装的两者真实会话中进行了验证（Codex 仅在你通过 `/hooks` 信任它之后才会运行）；Claude Code 钩子能够真正阻止（直到 beta.4 它都允许每个回合通过）；它可在 Windows 上工作；`uds uninstall` 会将其移除；`uds init` 使 pre-commit 检查能够真正运行；`developer-memory` 1.2.0。Gemini CLI 被标记为遗留（Google 在个人账号中停用了它，转向支持 Antigravity CLI，后者目前尚未支持）。

## [6.13.0-beta.5] - 2026-09-28

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。**如果你安装了 6.13.0-beta.1–beta.4，请升级：这些版本中的 Claude Code 回合完成钩子从未真正阻止过。**

### 修复

- **Claude Code 回合完成钩子在真实的 Claude Code 会话中从未阻止过——6.13.0-beta.1 到 beta.4 的每个采用者都挂接并运行了它，但它放行了每个回合。** 2026-09-28 使用 Claude Code 2.1.283 在实时的 `claude -p` 会话中测得：当 Stop 钩子运行时，transcript 尚未包含最终的 assistant 消息，因此适配器（仅读取 transcript）看到的是一条空消息，在 5 次本应阻止的回合中全部予以放行；在较长的会话中，它反而会判定前一回合的消息。由于自测和单元测试都向适配器提供已经完整的 transcript，因此当时全部通过。适配器现在从 stdin 的 `last_assistant_message` 获取最终消息（由 Claude Code 发送），且仅为人侧读取 transcript（R9），并作为不发送该字段的版本的后备手段。修复后进行了实时重测。新测试重现了钩子在那一刻实际看到的形态，并在旧适配器上失败。
- **Codex 的钩子已安装但从未运行，且没有任何提示。** Codex 会跳过项目钩子，直到项目受信任且该特定钩子通过 `/hooks` 得到信任——在 `codex exec` 下静默发生。`uds init --with-hooks` 现在在 Codex 安装行旁说明了这一点，标准的*受支持的运行环境*和 `docs/PRE-RELEASE.md` 包含了该步骤。一旦信任，Codex 适配器完全按照其测试所述进行阻止和放行（测于 2026-09-28，codex-cli 0.155.1）。

### 变更

- **`turn-completion-integrity` 1.4.1：Gemini CLI 适配器现在标记为遗留，且 Antigravity CLI 被指名为尚未支持。** Google 于 2026-06-18 在个人账号中停用了 Gemini CLI，转而支持 Antigravity CLI（`agy`）；企业账号保留两者。适配器为企业账号保留，但从未针对真实的 Gemini CLI 会话进行过确认，因此不再作为与 Claude Code 和 Codex 适配器并列的对等项展示。Antigravity CLI 文档记录的 Stop 钩子契约与每个已发布的适配器都不同（配置在 `.agents/hooks.json`；有效载荷仅包含 `transcriptPath`，没有最终消息或人类消息；阻止为 `{"decision":"continue"}`），因此在针对真实会话观察到该契约之前不会发布适配器——这与保持 Cursor 不受支持是同一规则。无行为变化：当选择 Gemini CLI 时，`uds init --with-hooks` 仍会挂接 Gemini CLI 钩子。

## [6.13.0-beta.4] - 2026-09-28

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。注：6.13.0-beta.3 从未发布到 npm；其变更包含在此处发布。

### 修复

- **直到 6.13.0-beta.3，`turn-completion-integrity` 的 Stop 钩子在 Windows 上对所有采用者都是静默失效的——它运行了、未找到语言包，并不打印任何内容就让每个回合未受检查地结束。** `engine.mjs` 的 `loadPacks()` 使用 `join(HERE, 'locales', ...)` 构建每个包的路径，并将该文件系统路径直接传递给动态 `import()`；在 Windows 上该路径为 `C:\...`，这不是合法的 ESM 导入说明符（POSIX 绝对路径恰好也能被解析为说明符，这就是为什么在 macOS/Linux 上未被注意到的原因）。2026-09-27 在 CI（windows-latest）中测得：每个随附的语言包都加载失败，且每个本应返回 `block`/`deny` 决定的适配器（Claude Code、Codex、Gemini CLI）都返回了 `undefined`。使用 `pathToFileURL(...).href` 进行了修复，这与 `cli/src/utils/standard-fixer.js`/`standard-validator.js` 已经正确使用的转换相同。四个 `scripts/check-*.ts` 开发工具脚本具有完全相同的形式（Windows CI 作业未演练它们，因为它们仅在 `ubuntu-latest` 上运行，但在 Windows 上同样损坏），并以相同方式修复。新增的全仓库测试（`cli/tests/unit/scripts/no-fs-path-dynamic-import.test.js`）遍历 `scripts/`、`cli/src/` 和 `cli/scripts/` 查找此形式，以便未来任何地方出现此问题都会在任何平台上失败，而无需有人记住此次事件。
- **直到 6.13.0-beta.3，在 Windows 上由 husky 管理的 `.husky/pre-commit`（由 `uds init` 写入）在每次提交时都失败，报错 `error: cannot spawn .husky/pre-commit: No such file or directory`，即使 `core.hooksPath` 已正确挂接——对所有采用者皆然。** husky v9 自己的模板不带 shebang 行，这在 macOS/Linux 上一直可行，因为当脚本没有 shebang 时 POSIX git 会回退到 `/bin/sh`（`ENOEXEC`）；Windows 上的 git 没有这种回退机制，根本无法生成没有 shebang 的文件，且错误指出的是钩子文件而不是缺失的解释器——很容易被误诊为挂接问题而非内容问题。现在，无论是在写入新钩子还是修改现有的采用者文件时，当缺少 shebang 时，`uds init` 都会在所有平台上为 husky 管理的钩子预先添加 `#!/bin/sh`（仅执行预先添加——采用者自己的 shebang 或任何其他行绝不会被重写）。`uds check` 的 `[pre-commit]` 警告增加了一个 `missingShebang` 信号，独立于挂接情况进行报告（钩子可能已完全挂接用于提交，但由于此原因仍会在 Windows 上每次提交失败），并且根据其现有设计为只读。

## [6.13.0-beta.3] - 2026-09-27

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。

### 修复

- **`uds init` 写入了 pre-commit 钩子（`.husky/pre-commit`，或对于非 Node 项目为 `.git/hooks/pre-commit`），却从未确认 git 是否真的会运行它。** 它依赖于 husky 自身的引导机制——`npm install` 触发 husky 的 `prepare` 脚本来设置 `core.hooksPath`——该机制只有在下一次运行 `npm install` 时才会触发；如果 `node_modules` 已经存在，则永远不会发生。针对三个真实采用者（asiaostrich-telemetry-server、asiaostrich-telemetry-client、machine-setup，2026-09-26）进行了验证：三者都有调用 `npx uds check` 的 `.husky/pre-commit`，但都没有设置 `core.hooksPath`，且在提交时检查从未运行过一次——静默无报错。`uds init` 不再为采用者安装 husky 或修改 package.json 的依赖项；而是直接挂接 `git config --local core.hooksPath .husky`（与 husky 自身的内部引导所做的事情相同），因此在 `uds init` 之后检查立即可用，无论是否安装过 husky。绝不覆盖采用者自己的 `core.hooksPath` 或现有的 `.git/hooks/pre-commit`——两者都保持原样，并附有消息说明检查未启用及其原因。非 Node 原生钩子路径也不再无条件覆盖现有的 `.git/hooks/pre-commit`（过去会覆盖）。新的 `uds check` 警告 `[pre-commit]` 可检测到存在但不在 git 实际执行路径上的 UDS 受管钩子文件（涵盖直接挂接、husky 自己的 `<dir>/_` shim 转发以及原生默认路径）并报告修复方法——已存在该缺陷的采用者（如上述三个仓库）就是通过这种方式发现的。仅供建议；不影响 `uds check --ci` 的退出码，因为这是每个克隆副本的本地配置缺口，而不是标准合规性缺陷。`core.hooksPath` 绝不会被提交，因此该挂接仅适用于运行 `uds init` 的克隆仓库——消息和新的 `uds check` 警告均说明了这一点。

- **后续跟进（2026-09-27）：如果采用者现有的 `.husky/pre-commit` 仍在使用 husky v8 的 `_/husky.sh` 引用行，上述 pre-commit 修复可能会使其在每次提交时都失败。** 针对上述三个采用者之一的真实临时克隆进行了验证：在旧模板上运行 `uds check` 自身建议的修复方案（`git config --local core.hooksPath .husky`）会产生 `.husky/pre-commit: line 2: .husky/_/husky.sh: No such file or directory`，且 `git commit` 以 1 退出——比最初的静默跳过缺陷更糟糕，因为该 `.husky/_/` shim 目录只有在 husky 自身的引导实际运行后才存在，而直接将 `core.hooksPath` 设置为 `.husky` 会使 git 直接执行该文件。`uds init` 的 `setupHuskyHook` 现在在重写 `.husky/pre-commit` 时会检测并移除该行（保留其他所有内容——采用者自己添加的命令、现有的 `uds check` 行）；当检测到旧版行时，`uds check` 的 `[pre-commit]` 警告不再孤立地建议 hooksPath 修复——而是给出两步修复方法（删除该行，然后设置 hooksPath），因为 `uds init` 拒绝在已初始化的项目上运行，无法为发现的三个真实采用者修复此问题。在 `git-hooks.js` 中新增了共享辅助函数 `hasLegacyHuskyShLine`/`stripLegacyHuskyShLine`。

- **`bump-version.mjs` 在预发布 -> 预发布版本递增时错误标记了 `SECURITY.md` 的 "Latest stable" 行——在 6.13.0-beta.2 发布（2026-09-26）时现场测得，当时手动进行了修复。** 其 `SECURITY.md` 补丁通过查找“带有纯 X.Y.Z 版本的行”来识别稳定版本行；新的预发布版本（例如 `6.13.0-beta.2`）始终带有连字符，永远无法匹配该模式，因此补丁顺延到了看起来确实像纯版本的那一行——无关的稳定版本行——并用新的预发布版本覆盖了其版本，同时保留了陈旧的预发布版本行（仍为 `6.13.0-beta.1`）未作修改。将表格生成逻辑（在 `generate-docs.mjs` 中已经正确，未被 `bump-version.mjs` 使用）提取到共享的 `scripts/lib/security-versions.mjs` 中，现在两个脚本都根据 `(version, stableVersion)` 重新生成整个 2 行或 3 行的块，而不是就地对单个匹配行打补丁——通过针对隔离的仓库副本进行真实的端到端 `bump-version.mjs` 运行，验证了在所有四种版本类型转换（stable→stable、stable→pre-release、pre-release→pre-release、pre-release→stable）中、所有三种发布的语言中均正确无误。`check-version-sync.sh` 现有的 SECURITY.md 检查仅将第一个数据行的版本与 `package.json` 进行比对（恰好捕获了该特定事件的基于位置的代理检查）；现在它还会对照每行自身的版本形态交叉检查其标签（包含带连字符版本的 "Latest stable"/"最新正式版" 行，或包含不带连字符版本的 "Pre-release"/"預發布版本" 行，即使单独的位置检查通过也会被标记出来）。

## [6.13.0-beta.2] - 2026-09-26

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。

### 修复

- **`uds uninstall` 从未移除 `installHooks()`/`installCodexHooks()`/`installGeminiHooks()` 写入的强制执行钩子——不仅针对 Codex 和 Gemini CLI（6.13.0-beta.1 记录的已知限制），而且针对 Claude Code 自己的 `.claude/settings.json` 也是如此，后者具有相同的缺口且从未被报告过。** `hooks` 卸载类别过去仅触及 `.husky/pre-commit` 和 `.git/hooks/pre-commit`；三个安装程序实际写入的设置/配置文件未被任何卸载程序触及，因此在 `uds uninstall` 之后每个强制执行钩子仍在继续运行。新增的 `uninstallClaudeCodeHooks`/`uninstallCodexHooks`/`uninstallGeminiHooks`（`src/uninstallers/hook-uninstaller.js`）现在可以精确移除 `.claude/settings.json`、`.codex/hooks.json` 和 `.gemini/settings.json` 中由 UDS 安装的条目——通过命令路径*以及*已知当前由 UDS 随附的脚本基本名称共同标识，而非仅通过路径标识，因此放置在由 UDS 架设的相同 `scripts/hooks/` 目录下的采用者自己的钩子脚本绝不会被移除。移除后变为空的事件数组将从配置中丢弃；完全变为空的配置文件（意味着它只包含 UDS 写入的内容）将被删除，否则将在保留其他所有内容完好的情况下重写。畸形的 JSON 会报告为错误并保持原样，而不是被覆盖。已挂接到 `uds uninstall` 现有的 `hooks` 类别、其 `--dry-run` 预览以及交互式菜单中对该类别的描述中。
- **Codex 适配器的 R9 豁免（“人类要求结束回合”）在真实的 Codex 安装中从未实际触发——`scripts/hooks/check-turn-completion-codex.mjs` 中的 `bestEffortLastUserMessage()` 尝试读取的两种记录形态均未成功。** 针对真实的 codex-cli 0.156.1 `~/.codex/sessions/**/*.jsonl` transcript 进行了验证：用户消息记录为 `{"type":"response_item","payload":{"type":"message","role":"user","content":[{"type":"input_text","text":...}]}}`——消息位于 `payload` 下，不在记录的顶层，也不在 `message` 键下，因此该字段始终被读取为不存在，R9 永远无法豁免 Codex 回合。现在首先读取 `payload.type === "message"`（对于可能使用它们的任何其他记录类型回退到两种原始形态），在提取现有 `text` 形态的同时提取 `input_text` 内容项，并且不将 `role: "developer"` 记录视为用户消息。`core/turn-completion-integrity.md` 的“受支持的运行环境”部分和 `docs/PRE-RELEASE.md` 已从“未针对真实安装进行确认”更新为确认后的形态。
- **R9 的 zh-TW 停止请求检测器遗漏了“现在离开，稍后继续”的表述——实测：在 2026-09-25，"我要出門了，等我回來再繼續" 确实误触发了 Claude Code 的回合完成阻止。** 该句子和 "暫停，我要出門" 都不匹配任何现有的 `STOP_REQUEST` 备选项。添加了两个收窄的备选项，要求离开词（出門/離開一下/先走）与“稍后继续”词（等我回來/回來再/明天再/晚點再/待會再）或单纯的词 暫停 在同一个短语段落中共存——单独的离开词（"出門前把這三件做完"，即在离开前完成某事的指示）根据语料库仍然不能豁免。在审计英文包中相同的缺口时，发现 `\bI'?m (heading|going) (home|out)\b` 是无法触及的死代码：`isStopRequest()` 总是先调用 `normalize()`，该函数会将 "I'm" 重写为 "I am"，因此仅针对缩写的模式永远无法匹配；已修复为 `I(?:'m| am) (heading|going) (home|out)`，针对单纯的 "I'm heading out." 验证了此前为 false / 此后为 true。

## [6.13.0-beta.1] - 2026-09-26

> **测试版**——以 `npm install -g universal-dev-standards@beta` 安装。要测什么、已知限制以及如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。已知限制：`uds uninstall` 尚未移除 Codex / Gemini CLI 钩子条目。

### 新增

- **`turn-completion-integrity` 1.4.0 将 Stop 钩子扩展至 Codex 和 Gemini CLI，与现有的 Claude Code 适配器并列。** 判定逻辑（语言包、冷却时间、滑动窗口、自回显标记）移入共享的 `turn-completion/engine.mjs` 中，以便三个针对特定运行环境的脚本转换其自身工具的契约，而不是各自携带一份检测逻辑的副本。Codex（`.codex/hooks.json`，Stop 事件）直接从 stdin 读取 `last_assistant_message`，并在退出码为 0 时通过 stdout 上的 `{"decision":"block","reason":...}` 进行阻止——其文档说明该处纯文本或空 stdout 是无效的，这与 Claude Code 静默即允许不同；人类的最后一条消息是从 `transcript_path` 尽力读取的，因为其确切的 schema 尚未针对真实安装进行确认，因此 R9（豁免人类主导的停止）在 Codex 上是有记录的已知缺口，而非静默失败。Gemini CLI（`.gemini/settings.json`，`AfterAgent` 事件）直接在 stdin 上接收 `prompt` 和 `prompt_response`——无需解析 transcript——并通过 `{"decision":"deny","reason":...}` 进行阻止，这是文档记录的相比退出码 2“所有逻辑的首选”途径。`uds init --with-hooks` 现在还调用 `installCodexHooks`/`installGeminiHooks`，以采用者是否选择了该工具为条件，因此不会向不使用 Codex 或 Gemini CLI 的项目中写入任何内容。评估了 Cursor，并明确指名为不受支持（其停止钩子是否能真正阻止回合尚未解决）。参见[受支持的运行环境](core/turn-completion-integrity.md#supported-harnesses)和 [CLI-INIT-OPTIONS.md](docs/CLI-INIT-OPTIONS.md#enforcement-hooks-beyond-claude-code)。

- **`developer-memory` 1.2.0：`code-reference` 陈旧性检查——引用了已移动或不再存在的文件路径或符号的记忆，现在在呈现之前会被标记，而不是被静默复用。** 复用了 `knowledge-graph-memory` 1.0.0 已经定义的两种操作模式（§2），而不是发明第三种：降级模式（无图引擎——助手通过 Glob/Grep/Read 自行验证引用，机制与现有的记忆验证原则相同）和引擎模式（图引擎如 EngramGraph 的 `egr refs check` 将每个引用报告为 `present` / `moved`（附带其新位置）/ `missing` / `unresolvable`）。`unresolvable` 绝不能被解读为 `present` 或 `missing`——它意味着检查器无法得出答案，而不是引用正常或消失。挂接到现有的 `proactive-surfacing` 规则（§4.1）中，以便检查在展示记忆之前运行，而不是之后。第一批仅涵盖文件路径和符号名称（函数/类）；`file:line` 明确不在范围内——行号会因无关的编辑而变动，属于不同类型的陈旧（见 DEC-115 OQ-1，于 2027-01-31 重新审视）。`core/developer-memory.md` §11 添加了非规范性的 Claude Code `SessionStart` 钩子示例；其他工具则路由通过它们自己的仓库指令文件（CLAUDE.md/AGENTS.md/.cursorrules/等）。(DEC-115-L1)

### 修复

- **`turn-completion-integrity` 的 zh-TW 和 en 检测器在条件性承诺的前置条件是人类自身的决定时误触发。** `"你選定後，我會把這一輪的發想寫成正式決策紀錄…"` 被解读为未履行的承诺——现有的豁免仅涵盖索取信息或请求回复，未涵盖表述为人类决定的前置条件。zh-TW 增加了收窄的 `你 + 短决定动词 (選定/選好/決定/確認/回覆/點頭) + 後 + 逗号 + 我` 模式；en 增加了基于语法的 `(once|after|as soon as) you ..., I` 模式，匹配该包现有的无动词列表设计，而不是穷举动词。两个语料库都增加了成对的反例（主语不是 你/you，或仅有一半形态存在），证明该收窄不会漏掉真实的未履行承诺；en 包还记录了一个刻意保留未涵盖的已知限制（前置条件和 "I" 之间没有逗号仍会触发，因为超出此范围的放宽可能会遗漏真实的承诺）。

## [6.12.0] - 2026-09-25

### 新增

- **新标准 `open-work-tracking`——`deferred-item-exit` 的下游对应部分。** `deferred-item-exit` 要求推迟的条目离开其文档以获得可追踪的出口，但刻意未指定该出口的载体；一旦条目到达，没有任何机制能防止载体本身发生腐烂。该标准以 16 项要求（OWT-001..016）涵盖了这一点：低摩擦的捕获点（最多两个必填字段）、每个等待条目旁记录的解除条件、生成而非手写的可推导字段、根据内容证明而非单纯的可编辑时间戳的实效性声明、声明其无法看到内容的覆盖率数字，以及报告未结工作但绝不阻塞的回合结束检查点。最后一点刻意与挂接同一事件并执行阻止的 `turn-completion-integrity` 相反；标准中的对比表可防止采用者将两者混为一谈。其两个数值门槛被标记为初始判定，而非测量结果。

## [6.11.0] - 2026-09-18

### 修复

- **`uds update --plan`/`--apply` 对集成文件永远无法收敛：即使在 `--apply` 之后立即执行，在一个内容与生成产物逐字节完全一致的文件上，仍持续显示 `Migrate Block: N`。** `diffIntegrations` 对任何带有 UDS 标记的集成文件无条件产生 `migrate_block` 动作——“由于内容是动态生成的，因此我们总是更新集成”——因为期望状态从未携带可供比对的哈希值（`hash: null`，“在生成后计算”，然后实际上从未真正计算）。期望状态计算器现在以与 `--apply` 本身相同的方式生成集成内容（`buildToolIntegrationConfig` + `generateIntegrationContent`）并仅对 UDS 区块进行哈希处理，使 `diffIntegrations` 能像对待其他所有类别一样区分“内容已匹配”与“内容不同”，并在它们匹配时报告 `unchanged` 而不是 `migrate_block`。区块确实已过时的文件（经手工编辑，或由较旧版本 CLI 生成）仍像以前一样产生 `migrate_block`。因任何原因生成失败（例如注册表无法解析的工具）将回退到旧的无条件行为，而不是导致计划崩溃。
- **`uds check` 在单次运行中可能针对同一个集成文件打印出两条相互矛盾的“已参考”断言。** `standardsReferenced`（“已参考 {count}/{total} 个标准”）扫描整个集成文件正文——提及标准名称的每一处位置。`standardsNotReferenced`（“未参考的标准（可选）：”）仅查看结构化的 `Reference:`/`參考:` 行。在文件正文散文中被提及但从未列在 `Reference:` 行上的标准，在同一次运行中满足了第一项断言却未通过第二项断言——相同的英文/中文词汇（"referenced"/"參考"），两种不同的度量方式，读起来就像自相矛盾。在所有三种语言区域中重命名了第二条消息，以准确说明它所检查的内容（未出现在 `Reference:`/`參考:` 行中），而不是一概而论的“未参考”断言。
- **单纯的 `uds update --plan` 和 `uds check` 从不提示 Skills 或 Commands 落后于最新的 UDS 版本。** 版本过时状态以往仅由 `uds update --plan --skills`/`--plan --commands` 计算——通用的调和 `--plan`（无范围标志）调用了另一个从未触及该状态的函数，而 `uds check` 则完全没有对等功能。采用者在运行普通的 `--plan` 或 `check` 时看到的是一份干净的报告，即使 Skills 已经落后了整整一个次版本号，也没有任何提示表明限定范围的计划或 `uds update --skills` 有事可做。现在，当任何已安装的 Skills 或 Commands 版本落后时，两者都会打印一段简短的 `<tool> (<location>): vOLD → vNEW` 说明，并附上修复它的命令。仿照现有的顶层“Version: X → Y ⚠”行设计，而不是集成区块完整性检查（XSPEC-418 R1）：在采用者更新之前，落后于最新发布版属于环境性的、预期中的状态，而不像被修改/缺失的 UDS 区块那样属于合规缺陷——因此它不会导致 `uds check --ci` 失败。
- **6.10.0 的死链接重写（P2）删除了针对 6.0.0 之前文件名编写的参考引用，而不是将其重写，并且可能会遗留一个悬空的逗号。** `resolveStandardReferences` 仅将 `Reference:` 行的词干与清单的已安装列表进行比对——从未与 `STANDARD_ID_MAPPING`（conversion-rules.js）比对，而该旧文件名→当前 ID 的映射表正是 `yaml-generator.js` 在其他地方已经使用的。在安装了 `commit-message` 的项目上，一行写着 `.standards/commit-message-guide.md` 的内容看起来完全就像是一个已退役的、UDS 所有的、项目选择不安装的标准，因而被删除，而不是被重写为 `.standards/commit-message.ai.yaml`。另外，删除后的逗号清理只处理了末尾逗号、双逗号或逗号前的多余空格——而未处理当行中第一个参考引用被移除时紧跟在冒号后面的逗号（`Reference:, .standards/other.ai.yaml`）。重构为分割（split）→ 解析或丢弃（resolve-or-drop）→ 连接（join），而不是在被删除的子字符串周围打补丁式修补标点符号。
- **被 6.10.0 的 `resolveStandardReferences` 缺陷删除的主标准参考引用即使在上述修复后也不会自行恢复。** 通过重写消除删除遗留的悬空逗号，恢复的是该行的标点符号，而不是被删除的条目本身——UDS 规则模板小节（例如“## 提交訊息標準”）位于 UDS 标记之外，因此一旦某个条目消失，就没有任何机制会重新生成其内容。针对这一种情况增加了一个范围狭窄、有意限定的自动修复：当一行的标题与 UDS 规则模板标题完全匹配（`RULE_TEMPLATES` 随附的任何语言），且该模板的主参考引用（其自身 `Reference:`/`參考:` 行上的第一个 `.standards/...` 条目）在文件的该行中缺失，并且该标准确实已安装时，它会被重新添加在最前面——该行上的其他所有内容（项目自身的条目、选项文件、现有顺序）均保持不变，绝不恢复次要模板条目，也绝不触碰用户编写的小节（任何其他标题）。具有幂等性。仅修复 6.10.0 的删除所导致的问题；不尝试修复因无关的手工编辑而损坏的参考引用。
- **普通的 `uds update` 从不修复由上述 Q1 缺陷遗留的损坏的 `integrationConfigs[file].categories`——只有 `--sync-refs` 才会修复。** 已经包含 `categories: []` 的清单（源于较早前存在缺陷的 `--sync-refs` 运行）在随后的每次普通 `uds update --yes` 中都保持损坏状态：该命令自身的集成同步步骤会写入 `integrationBlockHashes`，但甚至从未读取 `integrationConfigs`，因此那里的任何逻辑都无法纠正它——而随后的 `uds check --restore-missing` 接着根据该损坏的已存储配置重新构建集成文件，再次悄然丢失小节。`uds update` 现在以与 `--sync-refs` 相同的方式修复为空或无法识别的 `categories` 值（`calculateCategoriesFromStandards`），并保持原本已有效的列表不变，以使普通的更新不会在每次运行时都演变成完整的重新同步。
- **`uds update --sync-refs`/`--integrations-only`/`uds check --migrate`/`uds config` 可能会悄然降级 `manifest.version`，并且相同的同步路径在正常的 3.4.0 清单上计算出了空的类别集合。** 五个写入点硬编码了旧的模式版本字面量（`'3.1.0'`/`'3.2.0'`/`'3.3.0'`），而不是 CLI 当前的模式版本（`3.4.0`）——在已经是当前版本的清单上运行这些命令中的任何一个都会将版本向后倒写。另外，`calculateCategoriesFromStandards`（`--sync-refs` 用来决定哪些小节属于 CLAUDE.md/AGENTS.md 的函数）按文件名查找每个标准，但 3.4.0 清单存储的是纯词干（`commit-message`，而不是 `commit-message.ai.yaml`）——每次查找均未命中，返回的类别集合为空，随后的 `--sync-refs`（或 `--restore-missing` 重建）重新生成的文件完全缺失了 anti-hallucination/commit-message/code-review 小节。这两处现在均在其单一真实来源处得到修复：一个共享的 `bumpManifestVersion` 辅助函数，它仅将清单的版本向当前版本推进，绝不倒退；以及同一个文件中其他地方已经使用的、支持词干感知的类别查找（`categoryForStandard`）。这使类别计算恢复到 6.10.0 之前 `--sync-refs` 的推导方式——根据实际安装的标准计算，而不是固定列表——因此完全重新生成（`--sync-refs`、`--integrations-only` 或普通的 `uds update`）现在会写入每一个背后有规则模板和已安装标准支撑的小节（目前为 9 个），而不仅是全新 `uds init` 所播种的 3 个小节；对于已经拥有完整小节集合的项目，普通的区块更新不受影响。
- **仅仅提及 UDS 标记文本的句子可能会被误认为是真正的区块边界，导致该提及与真正的 END 标记之间的所有内容——包括采用者自身的内容——全部被删除（v3.5.0–6.10.0）。** 每个定位标记的调用点都直接使用了 `content.indexOf('<!-- UDS:STANDARDS:START -->')`/`.indexOf('...:END -->')`，这会在文件中的任何位置匹配标记文本：逐字引用解释标记语法的句子（本项目自身的 CLAUDE.md 恰恰就是这样做的），或者包含该标记的代码块示例，都无法与真正的边界区分开来。这影响了重新生成集成文件 UDS 区块的所有四个写入路径：`uds update --integrations-only`、`uds update --apply` 的 `migrate_block` 调和器路径、`uds update --sync-refs` 以及 `uds check --restore`（XSPEC-418 R6 对其进行了扩展，也用于恢复受损的 UDS 区块）。现在，只有在去除首尾空格后单独占满整行，且该行不在围栏代码块（``` / ~~~）内部时，标记才会被计入；每个调用点都通过一个共享的 `locateMarkerBlock` 辅助函数处理，并通过静态扫描保护测试进行强制约束，以防未来的调用点退化回原始的 `indexOf`/`includes`。对于包含两对真正的标记对的文件（损坏，或手工编辑出错），不再进行猜测——所有写入路径均拒绝处理并按行号报告两个标记行，`uds check` 会明确报告该情况，而不是将其混入“已修改”或“未找到标记”中。
- **`uds check --ci` 可能会针对损坏的集成区块打印可见的 ✗，但仍以退出码 0 结束并宣称项目合规。** `checkIntegrationBlocksIntegrity` 的结果（已修改/缺失/UDS 标记被移除）在计算并打印后便被丢弃——最终判定仅查看了标准文件的完整性。如果你的 CI 在一个 CLAUDE.md/GEMINI.md 等文件的 UDS 区块实际上已被移除或编辑的项目上一直通过，那就是这个缺陷所致；现在，`--ci` 将正确地失败，直到区块恢复（`uds update --integrations-only`）或项目以其他方式重新恢复同步。交互式 `uds check`（不带 `--ci`）不受影响——它仍然以 0 退出，绝不打断正常使用。(XSPEC-418 R1)
- **集成文件（CLAUDE.md、CLAUDE.local.md、AGENTS.md 等）同时根据其 UDS 区块以及整份文件内容进行跟踪，而这两项检查在同一次运行中可能会相互矛盾。** 全新执行的 `uds init` 从不为这些文件记录全文件哈希，但 `uds update --integrations-only` 记录了——在此之后，UDS 区块外部的任何编辑（恰恰是基于标记的更新原本应当保留的自定义内容）都会导致 `uds check --ci` 报告 `CLAUDE.md (modified)` 并以退出码 1 退出，而在同一次运行中，其自身的区块完整性检查却表明该区块完好无损。另外，`uds check --restore` 正确地重新生成了受损的区块（保留了其外部的内容，没有数据丢失），但仅刷新了全文件哈希，从未刷新区块哈希——因此紧接着的下一次检查针对刚刚被正确恢复的区块报告了 `CLAUDE.md (UDS block modified)`。集成文件不再被添加到 `fileHashes`（仅添加到 `integrationBlockHashes`，该项本来就只跟踪区块）——排查了所有写入点，而不仅仅是最初报告的两处，包括 `--apply`/`--plan` 调和器路径和 `--sync-refs`；对于现存清单中针对这些文件之一的陈旧全文件条目，将在下一次 `uds update`（或 `uds check --restore`/`--migrate`）时将其移除，同时保留区块哈希。针对集成文件执行的 `uds check --restore` 现在会更新区块哈希以匹配其实际写入的内容。在一个携带此完全相同陈旧条目的真实采用者清单上进行了验证：应用修复后，在完全相同的输入下，`uds check --ci` 从退出码 1 变为退出码 0。后续审查中发现的两个漏洞也已关闭：`uds check --restore` 过去对损坏的 UDS 区块根本不做任何处理——它由 `fileStatus` 驱动，而 `fileStatus` 完全根据 `fileHashes` 构建，其中不再包含集成文件，因此它在区块原封不动的情况下静默恢复了零个文件；现在，`--restore` 也会重新生成报告为已修改或缺失标记的区块（区块外部未受影响的内容以及 `--restore-missing` 的行为与之前相同）。并且由于上述新的修剪逻辑仅在写入时运行，因此带有陈旧全文件条目的现有清单在 `uds check --ci` 上将永远保持报红——普通的只读 `check` 从没有机会清理它；标准文件完整性检查现在还在读取时跳过任何同时被 `integrationBlockHashes` 跟踪的 `fileHashes` 键，因此未经修改的项目无需先执行 `update` 即可报告干净。(XSPEC-418 R6)

### 新增

- **`uds init --claude-target <project|local>` 与 `uds update --claude-target <project|local>`：在拥有团队所属 `CLAUDE.md` 的仓库中以个人身份采用 UDS。** 在此之前，UDS 的 Claude Code 集成一律写入 `CLAUDE.md`——团队共享并提交的文件——且没有任何方式可以重定向它。个人若想在已有团队 `CLAUDE.md` 的仓库中为自己采用 UDS，必须手动将 UDS 区块移动到 `CLAUDE.local.md`（Claude Code 原生支持的文件，紧随 `CLAUDE.md` 之后加载），而从那时起，`check`/`update`/`uninstall` 都会报错或悄然写回团队文件中——包括在常规清理过程中将已移动文件自身被跟踪的哈希作为“孤儿”删除。在 `uds init` 上指定 `--claude-target local` 从一开始就将集成内容写入 `CLAUDE.local.md`；团队的 `CLAUDE.md` 绝不会被触及。`uds update --claude-target <project|local>` 无需重新安装即可切换*现有*安装的目标——它从旧文件中移除 UDS 区块（保留写在那里的其他所有内容；若文件变为 100% 由 UDS 生成则将其删除，符合 `uninstall` 的现有规则），写入新目标，并更新清单（无论新目标是否已包含手动移动的区块）。`check`、`update`（包括 `--integrations-only`/`--force`）以及孤儿哈希清理现在都通过一个函数解析工具的实际目标文件，而不是各自独立地假定默认值——从未设置 `--claude-target` 的项目完全看不到任何变化：仅在选择 `local` 时，清单才会获得 `integrationTargets` 字段。`--claude-target` 不影响 `AGENTS.md`；如果你同样不想将其提交，请继续通过 `.git/info/exclude` 自行排除它。`CLAUDE.local.md` 不会自动写入 `.gitignore`——请自行添加——且由于未被跟踪，它仅存在于创建它的 git 工作树中。参见 [CLI-INIT-OPTIONS.md](docs/CLI-INIT-OPTIONS.md#claude-code-integration-target---claude-target)。(XSPEC-418 R2–R4)

## [6.10.0] - 2026-09-16

### 修复

- **`uds update --apply` 遗忘了它未触及的每一个命令，而 `uds check` 却称其完好无损。** 一个拥有 51 个 OpenCode 命令的项目发生了 3 个文件的漂移；计划列出了这 3 个文件，在 `--apply` 之后，清单中保留了 3 个 `commandHashes`——其余 48 个文件留在磁盘上，没有任何东西跟踪它们。同一次 `uds check` 运行接着打印出“Commands: 51 installed”和“✓ All command files intact (3 files)”，篡改这 48 个文件中的任何一个都不会改变这两行中的任何一行（于 2026-09-16 在 6.9.0 版本的干净临时项目上实测）。调和器在合并新哈希键之前删除了该 agent 的每个哈希键，这仅在安装器重新安装了该 agent 的所有命令时才是正确的——`uds update` 自身的调用点确实这样做了，但计划路径却没有。它现在执行合并，正如 skills 路径一直以来的做法一样，并且计划的删除仅移除该文件的条目。`uds check` 另外列出未被任何哈希覆盖的已安装命令文件，因此这两个数字再也不会悄无声息地不一致。
- **集成文件指向了磁盘上不存在的标准，而参考引用检查却称其已同步。** 在使用 `--format ai` 安装的项目上，`uds update --integrations-only` 写入了 `Reference: .standards/anti-hallucination.md` 和 `.standards/checkin-standards.md`；这两个文件仅存在于 `human` 格式中。规则模板无论安装的格式如何都将其参考引用拼写为 `.md`，并且由于规则小节位于 UDS 标记之外，基于标记的更新从不刷新它们——由较旧 CLI 首次写入的文件在该文件停止随附两个大版本之后，仍保留着 `.standards/commit-message-guide.md`。现在，无论在生成时还是在更新现有文件时，参考引用都会根据本项目实际安装的标准及其安装格式进行解析；对项目未采用的标准的参考引用将被丢弃，而不是保持悬空。`uds check` 报告其文件缺失的参考引用，而不是在剥离扩展名的情况下仅按名称进行匹配。只有 UDS 自身随附的标准才会被移除：项目在 `.standards/` 下为其自身文件添加的参考引用将完全按原样保留。
- **`uds check` 推荐了无法运行的 `uds update --sync-refs`。** 当清单中没有 `integrationConfigs` 时，`--sync-refs` 会中止，而该键仅由 `uds init` 的交互式流程写入——使用 `uds init -y` 创建的项目从第一天起就拥有 `{}`，因此一个全新的 6.9.0 项目就已经处于错误消息归咎于旧版本和手动复制的状态。`--sync-refs` 现在会根据清单（集成、AI 工具、标准、选项）重新构建配置，而不是拒绝运行；并且 `uds check` 仅在 `--sync-refs` 确实能够运行时才提及它，否则指向 `uds update --integrations-only`。
- **`uds check` 报告已采用的标准在索引中缺失。** ID 到文件名的映射以往仅根据 `source.ai` 构建，但某些注册表条目将 `source` 存储为字符串——`zh-tw-locale` 为 `extensions/locales/zh-tw.md`——因此其已安装文件 `.standards/zh-tw.md` 从未被识别，并且在列出了该标准的文件上计数显示为“67/68 標準已參考, 缺少: zh-tw-locale”。
- **参考引用同步将选项文件报告为孤儿，并建议了 UDS 不再随附的文件名。** 选项记录在 `manifest.options` 中，而不是 `manifest.standards` 中，因此每个 `.standards/options/*.ai.yaml` 参考引用都被报告为“not in manifest”（不在清单中）；而“未参考的标准”列表是根据一份手工编写的 6.0.0 之前名称表（`git-workflow.md`、`error-code-standards.md`、`project-structure.md`）构建的。选项现在能够被正确识别，且该列表仅指名本项目实际保有的文件。
- **`uds check` 两次列出 `AGENTS.md`。** Codex 和 OpenCode 共享同一个文件；该检查此前遍历的是工具而不是文件。现在它对每个文件仅报告一次，并指出共享该文件的工具。
- **自 6.0.0 以来有七个 `core/*.md` 标准从未被安装，且没有一个说明了这一点（[#180](https://github.com/AsiaOstrich/universal-dev-standards/issues/180)）。** 它们对应的 `.ai.yaml` 文件已在 6.0.0 中被移除，这些文档被刻意保留在 `core/` 下作为采用层的参考资料——这是一个合理的决定，记录在 `docs/MIGRATION-v6.md` 第 2 节和 `scripts/reference-only-standards.json` 中，但在文档本身的任何地方都未提及，读者根本无法获知。迁移指南仅在升级时阅读一次；而 `core/` 则会被持续查阅，任何为了解答“UDS 拥有哪些标准”而浏览它的人都会数出 152 个文件，其中有七个是 `uds init` 从未安装过的。这七个标准现在均以 `<!-- UDS:REFERENCE-ONLY -->` 提示开头（提供英文、zh-TW 和 zh-CN），指向迁移记录以及机器可读的列表。一道新的关卡（`npm run check:reference-only`，已接入 CI 并包含两个自测分支）从注册表中的每个 `source.human` 路径推导出随附的暴露面，将与 `core/*.md` 的差异视为仅供参考的集合，并要求每个成员都披露这一点——同时同样要求随附发布的文档*不得*携带该提示，从而确保重新开始随附发布的标准不会留下虚假信息。通过推导集合而不是检查七个名称，防止了下一次缩减范围时重蹈同样的沉默覆辙。
- **`--format human` 安装在两个标准 ID 下交付了 `testing-standards.md`，且从未交付全覆盖文档。** 注册表条目 `full-coverage-testing` 将 `source.human` 指向了 `core/testing-standards.md`，因此 `core/full-coverage-testing.md`——一个活跃的标准，最近一次维护在 XSPEC-288——从未被任何人安装过，并且 human 格式的清单两次列出了相同的路径。`check-registry-completeness.ts` 的 Check 2 无法察觉这一点：当 human 或 ai 路径中的*任意一个*出现在注册表文本的任何位置时它便接受该条目，而 ai 路径确实存在。上述 reference-only 关卡在首次运行时发现了该问题，表现为预期七个孤儿之外的第八个孤儿。在修改前后通过真实的 `uds init --format human` 安装进行了验证。
- **`uds update --sync-refs` 写入的标准计数随后被 `uds check` 判定为自相矛盾。** 在一个清单包含 73 个标准的项目上，`--sync-refs` 重写了 CLAUDE.md 并宣称有 76 个，而 `uds check` 回应“index declares 76 standards, manifest actually has 73”；`--integrations-only` 生成了正确的数字，这使其看起来像是一个计数缺陷，而不是数据源缺陷。`--sync-refs` 根据 `integrationConfigs[file]` 重新生成该文件，其 `installedStandards` 是在安装时捕获且从未被任何机制刷新的快照——因此在跨大版本升级的项目上，它仍然列出已在 6.0.0 中停止随附发行的标准，并且无论它列出了什么都会成为文件的内容。它现在根据清单重新生成，正如 `buildToolIntegrationConfig` 自身的文档块早已声明的那样；存储的快照现在仅用于决定 `outputLanguage`，从而使早于该选项出现的清单不会悄然重置它。
- **已安装标准索引在每个项目上都显示“options 0”。** `uds init` 将已安装列表缩减为基本名称（basename），而下游的所有逻辑都通过 `/options/` 路径片段对选项进行分类——在 `contentLayout: flat` 下，没有目录可供恢复它。一个拥有 66 个核心标准和 7 个选项的项目被告知其拥有“73 (73 core, 0 options)”。同样的缩减将 AGENTS.md 中的每个选项文件发送到 `.standards/<name>.ai.yaml`，即选项文件安装目录的上一层目录，因此每一个选项文件在告知 agent 读取它们的小节标题下都成了死链接。现在路径完整传入，AGENTS.md 摘要为选项写入 `.standards/options/` 并遵循项目的格式，而不是假定为 `ai`（此前 `--format human` 项目持有的 `.md` 文件却被赋予了 `.ai.yaml` 名称）。
- **遵循迁移指南会导致 `uds check` 报告故障，而它提供的修复方案却无法奏效。** MIGRATION-v6 第 2 节指出应手动删除七个被缩减范围的 `.ai.yaml` 副本。这样做留下了它们的 `fileHashes` 记录，因此 `uds check` 报告七个文件缺失并建议运行 `uds check --restore`，随后对每一个文件都失败并提示“could not determine source”——该来源自 6.0.0 以来在上游已不复存在。该工具要求采用者使用一条它已知无法成功的命令来撤销其自身文档所指导的操作。现在，凡是其名称在 UDS 任何地方都不再随附的缺失文件，均与普通缺失文件分开以灰色报告，并提供行之有效的补救措施；`uds update` 会丢弃这些记录并指出是哪些记录，包括在已经处于最新版本的项目上（这正是遵循了指南的每位采用者必然所处的状态）。`--prune` 无法触及它们：它删除的是遍历 `.standards/` 时找到的文件，而这些文件恰恰是已经不存在的文件。
- **UDS 重新生成了 AGENTS.md 但未记录其写入的内容。** 在运行 `uds update --integrations-only` 后立即运行 `uds check`，会对一个除 UDS 外没有任何人触碰过的文件报告 `AGENTS.md (modified)`。写入 AGENTS.md 的所有三个调用点都记录了 `integrationBlockHashes`，但没有任何一个记录了 `fileHashes`。现在，已存在的记录会被刷新；清单未跟踪的文件仍然不会被登记，因为该摘要允许采用者自行扩展。
- **在 Windows PowerShell 上，成功的运行看起来就像失败一样。** 进度行被输出到 stderr，而在 PowerShell 5.1 中，来自原生命令的任何输出都会被包装在 `NativeCommandError` 中——包括表明操作已成功的提示行 `✔ Regenerated 2 integration files`。变更前的测量结果：stdout 输出 9 行，stderr 输出 2 行（均为旋转进度条 spinner）。现在所有 47 个旋转进度条均在 stdout 上报告；成功运行时 stderr 为空。
- **删除计划针对三种不同的情况给出了同一种理由。** 对于 UDS 在上游退役的标准、项目取消选择的选项以及期望状态未建模的路径——三种不同的合理对应情况——以往一律打印“no longer in desired state”（不再处于期望状态中）。现在的理由会说明具体是哪一种情况，以及重新选择是否能找回该文件。`.standards/release-config.yaml` 完全不再作为被删除的候选对象：`uds init` 根据用户选择的发布模式写入该文件，而 `uds config` 会重写它，因此将其删除的计划实际上是在丢弃设置并将其称作调和。它被保留并说明原因，而不是静默跳过。
- **.NET Framework 项目收到了四个命令，其中三个无法运行。** 自 2017 年以来，`.csproj` 指代了两种不兼容的构建系统，而检测器仅根据扩展名进行判断：旧式项目（带有 `<TargetFrameworkVersion>`，无 `Sdk` 属性）收到了 `dotnet build`（因 `MSB4019` 失败）以及 `dotnet list package --vulnerable`（针对 `packages.config` 静默报告为空，因为它只读取 `PackageReference`）。旧式项目现在在 `build` 中获得 `msbuild`，在其他位置留空——未知生态系统分支原本就会返回空白“以便用户自行填写”，由人工完成填空胜过看似权威但初次使用即失败的命令。
- **每个生成的指令文件开头都指示 agent 读取一个从未被安装过的目录。** 所有九个工具在每种语言中均以“PRIORITIZE reading the concise rules in `core/` (e.g. `core/testing-standards.md`)”开头。`uds init` 安装到 `.standards/` 中，且从未在采用者的项目中创建过 `core/`——那是标准在 UDS 仓库中所处的位置，而不是在采用它的仓库中的位置。同一句两句话的 36 份副本全都有着相同的错误，并且在干净的 6.9.0 安装中写入了它们。它们现在指名 `.standards/`，并且有一项测试会遍历生成的输出，以防第十个工具重新引入该错误。
- **`uds update` 用英文重写了中文的 CLAUDE.md。** `uds init` 以 `display_language` 写入集成内容；而每个重新生成路径却根据 `output_language`（提交信息语言，默认为 `english`）来推导它。内容语言现在遵循 `display_language`，仅在没有显示设置可循时才回退到 `output_language`。


### 新增

- **`uds check` 现在会报告指令文件中提及但不存在的路径。** 此前它仅检查 `Reference:`/`參考:` 行且仅检查 `.standards/` 路径，这对于参考引用*同步*而言是正确的范围——那些是 UDS 生成的行——但对于“此指令是否指向有效目标”而言则是错误的范围。UDS 标记之外的散文文本（由较旧的安装遗留且从未在重新生成中被重新审查）将 agent 引向了根本不存在的文件。该扫描基于存在性而非形式，因此拥有自己 `core/` 目录的项目不会被误报任何问题，并且它会忽略 URL 内部的路径。它在首次运行时便发现了本版本中修复的其中两处缺陷。

## [6.9.0] - 2026-09-14

### 采用者迁移说明

- **`uds update` 不再自动删除文件。** 它会列出可以移除的 UDS 文件，仅在指定 `--prune` 时才删除它们，并且只删除 UDS 自身写入的文件。依赖自动清理的工作流应添加 `--prune`。（#168、#165——详情见“修复”小节。）
- **无法识别的 `--content-mode` 值现在会打印警告并仍然使用 `index`**（6.8.0 也为其生成了 `index` 输出）。从 7.0.0 开始这将是一个错误。`--content-mode full` 已废弃，并附带提示解析为 `index`。（详情见“废弃”小节。）
- **使用 `uds init -y` 安装的 Codex、OpenCode 及其他非 Claude 工具现在会在它们自己的目录中接收技能**（例如 Codex 为 `.agents/skills/`），而不是 `.claude/skills/`。在现有安装上运行 `uds update` 会对其进行迁移。（详情见“修复”小节。）
- **Antigravity 现在获得 `.agents/skills/` 和 `.agents/AGENTS.md`**，而不是什么都没有以及 `INSTRUCTIONS.md`。Antigravity 仅在该目录为已注册项目时才会发现 `.agents/`；`uds init` 会打印此提示。
- **在 6.8.0 及更早版本中通过 `uds init --with-hooks` 写入 `.claude/settings.json` 的 hook 使用了从未真正运行过的字符串格式。** `uds update` 不处理 hook，且重新运行 `uds init --with-hooks` 不会移除旧条目或 `scripts/hooks/*.js`。要获得正常工作的 hook，请重新运行 `uds init --with-hooks`；你可以手动删除旧的 `.js` 条目。

### 修复

- **`uds update` 不再通过查哈希表来决定所有权（XSPEC-384，议题 [#165](https://github.com/AsiaOstrich/universal-dev-standards/issues/165) 与 [#168](https://github.com/AsiaOstrich/universal-dev-standards/issues/168)）。** 两位用户报告了同一个命令中相反的两处缺陷：它在没有任何警告、diff、提示或备份的情况下删除了 `.standards/` 下手工编写的项目文档（#168，仅通过逐行比对 `git status` 才发现）；而在 `upstream.version` 推进到“latest”的同时，它在清单和磁盘上都保留了注册表已舍弃的标准（#165）。两者均源于用同一个布尔值回答了两个独立的问题——*该文件是否由 UDS 写入*以及*这是否仍是随附发行的标准*——每个 issue 各自对应这个重载维度的一端。现在，当 UDS 写入时便会记录所有权，保存在清单中新增的 `provenance`（出处）字段中，以复制操作实际返回的路径作为键，而不是根据源名称重新推导的路径（这种重新推导正是导致五个本位于 `options/<category>/<name>.ai.yaml` 的文件在 `fileHashes` 中被记为 `.standards/options/<name>.ai.yaml` 条目的原因）。Provenance 采用只追加模式，而 `fileHashes` 代表当前状态；若将记录与 `fileHashes` 同步修剪，则会在同一时刻失效且毫无益处。删除现在需要两项事实均吻合，而其他所有组合均会被保留**并打印原因**。无法确定的所有权判定为保留——这正是旧代码所拒绝走的分支。现有安装不带有 provenance，因此初次升级不会归属任何所有权，也不会移除任何内容；仅在写入完整集合的运行结束时才会建立 provenance。删除操作另外被限定在一个新的 `--prune` 选项之后，有意未采用 `--yes`：`--yes` 通常在 CI 中设置，允许其授权删除将恰恰在无人可见之处启用破坏性路径。默认启用删除的分阶段策略位于一个具名常量（`PRUNE_POLICY`）中，因为 XSPEC-384 第 4 节尚未作出决定。每份移除报告都会打印其分母——检查的文件数、自有的文件数、外部文件数、未知文件数、排除的文件数及原因——因为仅列出目标的报告与仅扫描到那些文件的扫描无法区分。这两个 issue 均通过先证明变红的测试进行了固定。
- **Skills 被写入了九个工具中有八个从未读取的目录中。** 在非交互式路径（`uds init -y`）中，除 Claude Code 外，每个具备 skills 能力的工具的 skills 都被写入了 `.claude/skills/`；使用 `--mode skills -y` 的 Codex 仓库得到了零个 skills 且没有任何提示信息。具备 skills 能力的集合以及市场决策现在来自路径表，检测到没有经过验证的 skills 路径的工具将不安装任何内容并明确说明，并且 `uds update` 在转换旧清单时会重新推导 agent，而不是假定为 `claude-code`。Codex 未经验证的 `fallbackSkillsPath: '.claude/skills/'` 已被移除。交互式流程从未受到影响。
- **Roo Code 从未能够成功安装。** 它拥有路径表条目但没有检测器，并且其标识符在一个表中为 `roo`，在其他地方均为 `roo-code`，因此 `uds init` 将指令写入了仓库根目录的 `roo-code.md` 中。检测现在使用 `.roo/` 和 `.roorules`（有意未使用 `.clinerules`，那是 Cline 自身的标记），并且 skills 不再回退到 Roo Code 文档中未列出的 `.claude/skills/`。基于 Roo Code 的文档实现；未在实机 Roo Code 安装上进行测量。
- **Antigravity：UDS 有六个月未安装任何内容，且指令文件是它从未读取的文件（XSPEC-355 OQ6）。** Skills 现在进入 `.agents/skills/`，指令进入 `.agents/AGENTS.md`，这已通过该工具的二进制文件、随附指南以及使用诱饵路径的实机运行得到确认。其梯队从 `minimal` 调整为 `partial`。
- **UDS 随附发行的每一个 hook 都处于惰性失效状态，采用者收到了四个已损坏的 hook。** Hook 条目被写成了纯字符串（只有对象形式才会运行）；`scripts/hooks` 未包含在 npm 包中；hook 是 ESM 格式的 `.js`，在 `"type": "commonjs"` 下会报错（现改为 `.mjs`）；并且提交信息验证器在每次提示词输入时都会运行（`UserPromptSubmit`）并每次都以退出码 1 退出（现改为 `PreToolUse(Bash)`，仅检查真正的 `git commit -m`）。
- **`uds check` 恢复操作使用过时的模板覆盖了生成的集成文件。** 对于 Claude Code，那是一个 140 行的文件，最后修改时间为 2026-03-25。恢复操作现在根据安装器记录的配置重新生成，受管区块之外的内容保持不变；Antigravity 和 Gemini CLI 获得了恢复路径，且 Codex 的回退不再指向不存在的目录。
- **Codex/OpenCode 的 `AGENTS.md` 未携带披露说明。** 2026-08-18 的披露修复仅惠及了两个生成器中的一个；选择 codex 或 opencode 会将 `AGENTS.md` 路由经由另一个生成器。现已在两种语言和两种输出格式中修复。
- **cline、windsurf、roo-code 和 Antigravity 的集成文件指向了 commit-message 规则，而不是直接陈述它。** 格式和有效类型现在直接以内联形式写入，正如 Codex 文件所做的那样。

### 新增

- **`turn-completion-integrity`——agent 不得在陈述了尚未采取的下一步行动后结束回合。** 在回合结束时通过 Stop hook 而非指令进行强制执行。检测器随附英文和 zh-TW 语言包以及经过变异测试的语料库；它会读取人类的最后一条消息，因此要求停止的指令不会被视为放弃承诺，它将逐条列出的“什么被谁阻断”列表识别为合法的结束，并将“完成后告诉我，我会进行验证”视为条件性语句。`uds init --with-hooks` 现在会在你的语言没有对应语言包时发出警告，因为在未列出的语言中，hook 安装后永远无法触发。包含 zh-TW 和 zh-CN 译本。
- **`deferred-item-exit`——六个标准产生了推迟条目，却没有任何一个说明这些条目该去向何处（XSPEC-391）。** 某采用者的一次设计会话产出了一份 ADR 和一份规格，其中带有五个标记为“to be decided”（待定）/“separate effort”（单独工作）/“not in v1”（不在第 1 版中）的条目，而**这五个条目根本没有进入任何跟踪器**。原因并非健忘。对产生此类条目的六个标准（`adr-standards`、`spec-driven-development`、`retrospective-standards`、`feature-discovery-standards`、`code-review-checklist`、`acceptance-criteria-traceability`）进行测定，grep 搜索 `issue|tracker|backlog|task id|work item` 返回了 13 次命中，且**没有一个是出口**：ADR 的 `Technical Story` 是输入参考，retrospective 将跟踪器作为指标来源，feature-discovery 将工单作为需求输入挖掘，AC-traceability 仅对外部阻断的覆盖要求链接，而 code-review 中的全部 8 次命中均为表示问题的英文单词“issues”。每个标准都说明了如何写好其文档；然后文档就成了终点线。新标准统一陈述了这一缺失的关系——推迟条目在文档外部拥有可追溯的出口，且文档携带该出口的标识符——这六个产生者外加 `brainstorm-assistant` 技能各自获得了**指向它的一行指针而不是它的副本**，因为一条规则的六份副本会在六个方向上腐化。**载体被刻意不作规定**：一个 issue、一个被跟踪的 TODO、一个清单行、待办文件中的一行均可满足要求，其检验标准是“该条目是否已离开文档”，绝不是“使用了哪个工具”。三个调查发现塑造了这些规则。第一，出口必须在产出文档的变更合并*之后*仍能解析——观察到的两起遗漏满足了其他所有条件却仍然丢失了条目（写在合并所关闭的 issue 里的 todo；写在出口评论里被后来的评论顶出视野的 todo）。第二，**存在链接并不等同于有效链接**：报告此问题的采用者自身的关卡本会放过其最强烈的示例——一份写着“与 issue #19 一同决定”的文档，而 #19 中根本没有任何相关内容——因此 DEX-005/006 要求“已链接且内容已验证”与“已链接、内容未验证”绝不能打印相同的绿色，因为被报告为通过的未知比被报告为未知的未知更加糟糕。第三，锚点是文档的**结构**（ADR 的 `Consequences`、规格的范围外小节、回顾的 `Action Items`），而不是其措辞：结构可以被枚举而措辞列表不能，因此 DEX-008 要求任何措辞列表必须声明其覆盖范围未知，且 DEX-009 要求任何窗口大小（“3 行以内”）必须携带其出处或被标记为未校准。根据 DEC-049，该标准完全编写为必须存在的关系，绝不规定必须维持它们的机制——并且它在其自身文本中明确说明 **UDS 未随附针对它的关卡**，因为一个陈述了规则却没有机制执行它的标准，不承认这一点比承认这一点更为糟糕。`adr-standards` 另外获得了一个从未阐明的明确边界（在其中 grep 搜索 `acceptance criteria|\bAC\b|驗收` 返回了 **0 次**，而作为对照在 `acceptance-criteria-traceability` 中命中了 84 次）：**验收条件仅在一个地方维护，即 SPEC**，ADR 则链接到它们——被复制的列表有两个所有者，其中一个从未被更新，测得的后果是工作交付后 ADR 的复选框全部显示为未勾选，而这对仅读取规格的覆盖率工具是不可见的。
- **`AUTH_SCOPE_EXTRACTION`——租户边界是一个 `WHERE` 子句，而在迁移中没有任何东西强制要求你寻找它（`reverse-engineering-standards` 1.3.0，议题 [#166](https://github.com/AsiaOstrich/universal-dev-standards/issues/166)）。** 在一次真实的 PHP → C# 迁移中，一个限定租户范围的账户列表端点在重写期间丢失了其隔离谓词：按角色限定范围被替换为粗粒度的“此账户是否为任何已启用的管理员？”检查，导致该端点返回数据库中的每一个账户，而无论哪个租户发起请求。它已发布上线，它通过了所有现有测试——该方法没有任何测试——直到一位客户报告看到了不该出现的账户信息时才暴露出来。`test-completeness-dimensions` 的第 4 维度早已指明了跨租户访问，因此该维度从未缺失；所缺失的是在迁移时强制要求回溯检查的步骤。三个特性使得这类问题能够逃过道道关卡：安全关键行读起来就像若干过滤器中的一个，因为它位于查询内部而不是请求/响应契约中；基于形式的断言无法察觉范围，因此在删除了该子句后，“带有非空列表的 200”同样能够通过；并且代码库其他地方存在的共享范围解析器被误当作覆盖率，而新的调用点却在没有它的情况下重新实现了查询。新的阶段与隐式规则扫描（Implicit Rule Scan）并行运行，机械式推导通过操作者自身身份限定结果范围的每个谓词——包括在 SQL 之外由 ORM 全局作用域、仓储基类、RLS 策略和注入过滤器的中间件强制执行的范围，因为仅对 SQL 进行 grep 报告的集合小于实际存在的集合，而较小的集合在这里读起来恰恰像是更安全的。每个匹配项均记录了 `file:line`、其自身绑定及触发分支；判断准则是每个角色分支及每个调用点上的谓词等价性，而非输出形式。RE-AUTH-001 要求进行反向测试以断言另一个操作者记录的**不存在**（带自检：在临时草稿副本中删除该谓词，若测试仍然通过，则表明它从未测试过范围）；RE-AUTH-002 对任何移植后的等价项未经验证的谓词阻断切换。
- **书面写下的日期现在必须具备实际意义（`tech-debt-standards` 1.1.0、`governance-layer` 1.1.0）。** 自 1.0.0 以来，登记表模板就一直要求提供 `Owner` 和 `Target Resolution Date`，而在这两份标准的任何地方都没有说明当该日期过去时会发生什么——在 `core/tech-debt-standards.md` 中 grep 搜索 `overdue|past due|expired|exceed` 返回为空，而对照搜索 `Owner` 返回了一次命中，因此这种缺失是真实的，而非查询出错。更糟糕的是，`Registry Storage Options` 将“专用电子表格”列为完全合法：一个没有任何程序能够读取的表格满足了该小节中的所有其他要求，而在日期过去且什么都没发生之前，它看起来没有任何毛病。`tech-debt-standards` 增加了**逾期处理（Overdue Handling）**——到期时恰好有三种合法处置方式（解决 / 撤回 / 附带书面理由延期），TD-EXP-001..006，明确禁止将到期实现为自动延期或自动关闭（两者都会停止计时，且都不会留下相关痕迹），以及**无人值守声明（Unattended Declaration）**，作为无法运行检查的团队的合规替代方案。每个存储选项现在都附带了其合法的条件；电子表格被有意保留，因为这往往是资助这项工作的人唯一会打开的格式。`governance-layer` 在风险接受条款（Risk Acceptance Clause）上增加了 `review_by`（`review_by` 已过期的接受不再有效，管线故障闭合如同其不存在一样）、**待决决策（Pending Decisions）**（GOV-PD-001..004——待决决策是一种受治理的状态，带有计时器和固定的枚举标记，而非自由文本散文）、**汇总报告（Aggregate Reporting）**（GOV-RPT-001..005——通过 / 失败 / **无法判定** 分别打印，明确说明分母及其推导方式，没有单一折叠的分数，因为在其中什么都不做与实际开展工作得分相同的指标并不是在度量工作）以及**新鲜度指标（Freshness Metrics）**（GOV-FRESH-001..004——指标必须指明其读取的是编辑时间还是调和时间，两者不得共用一个字段；一份今天编辑过却从未对照现实进行检查的文档，在一个时钟上是 0 天前，而在另一个时钟上则是无界的）。两份标准都在标准本身的正文中坦白指出，UDS 未随附针对上述任何内容的检查器：最低门槛不是“构建检查器”，而是“绝不让记录在无人值守的情况下被悄然忽视”。
- **`uds audit --effects`——一个询问报告成功的组件是否真正执行了操作的关卡（XSPEC-383 R8）。** 形态 D：可达、被调用、运行、返回 `{ok: true}`、未触及任何东西。R3 的可达性关卡无法察觉它——可达性询问的是谁调用了文件（入边），而形态 D 存在于出边之中（它最终触及了什么）。方向相反。其根因在于断言与证据共享同一个作者：组件的返回值既是“我做了什么”，也是其唯一的证明，而类型系统所检查的形态对于真实实现和虚假实现而言是*完全相同*的。该关卡遍历每个声明的实现的调用图，并度量它是否触及跨进程边界。边界集合是通过从关于族根的规则（`fs`、`child_process`、`net`/`dgram`/`tls`、`http`/`https`/`http2`、`dns`、`worker_threads`）遍历 `builtinModules` 推导出来的，而不是手工列出的，因此 `fs/promises` 和任何未来的子路径都不需要修改代码，并且每条规则都会打印它展开到了多少个模块——匹配到零个模块的规则已过期。免导入全局变量（`fetch`、`WebSocket`、`process.dlopen`）在被计入之前会针对运行中的运行时进行探测，并且在当前 Node 中不存在的变量也会被打印出来。族在 `.uds/effect-boundary.json` 中**通过 glob** 进行声明，绝不通过文件名，因为一旦有人添加了第七个适配器，文件名列表就会失效——而这正是该关卡所针对的场景。判定为三态：零边界命中为 RED（红，当族中位数大于零时得到佐证；当整个族均为零时报告为*未获佐证*，因为族内比对在那里失效）；零命中并伴有无法分类的外部依赖为 UNDECIDABLE（无法判定）并以退出码 2 退出，因为将其判定为干净属于故障开放（fail-open），而将其判定为肮脏则属于无端指控。根据 R7-b，声明了 `NOT_IMPLEMENTED` 且从未返回代表成功形态的字面量的实现是合法的，不需要加入许可名单——这一连词至关重要，因为仅靠标记本身会成为每个空心实现都可以钻的漏洞，而同时携带两者的文件会被按名称判定为 RED。R7-c 提取通过字符串拼接构建的域名（模板插值和 `+` 拼接链均折叠为 `*`，因此 `` `https://${env}.api.acme.example` `` 保持可判定，而 `` `https://api.${tld}` `` 则不可判定），并对照从可插拔数据源（文件、环境变量或**命令**，命令正是注册商或云 DNS 区域 API 的用武之地）读取的所属域名列表进行检查。无法读取的声明列表会以退出码 2 退出，绝不会判定为“列表为空，因此允许所有”。基线为 TSV 格式，每行包含一个到期日期（§7.11.2），格式错误的行会以退出码 2 退出，因为损坏的基线不等于“没有基线”。构建它时在其自身的首次自测运行中捕获了一处真实缺陷：仅用于类型的导入（type-only import）被作为调用图的边进行追踪，导致一个空心实现继承了其接口文件的边界命中并判定为绿——类型导入在编译时就消失了，将其计入等同于凭空放行绿灯。该情况现在通过其自身的对照分支进行了固定。**这并不能证明什么：**触及的边界是*正确*的边界——装饰性的日志请求同样可以通过。那是尚未实现的 R9。UDS 自身未声明任何 effect 族，因此按设计直接运行该关卡会以退出码 2 退出；CI 运行 `--self-test`，其十七个分支（五个探针对照、分母、green、red、R7-b 滥用、R7-b 豁免、跨文件调用图、边界金丝雀、域名金丝雀、不可读列表、空集合、无法判定、损坏的探针）在为本仓库编写的合成语料库上均能按需变红。
- **采用者可运行的错误退出关卡。** `templates/gates/check-error-exit.mjs` 现在随附在包中。当包含 `src/` 目录的项目缺少此类关卡时，`uds check` 会进行报告且绝不自动写入；`uds update` 会解释其为何物并提议写入，默认选项为 **no**（否），且绝不覆盖现有文件。该关卡允许一个文件格式化错误文本并在第二个文件上判定失败，在配置完成前以退出码 2 退出。
- **`brainstorm-assistant`：裁判现在不仅需要一个席位，还需要头脑（XSPEC-388）。** BQS D4 仅在同时具备独立上下文以及声明的模型层级（使用 `core/model-selection.md` 的厂商中立标签表达）时才通过；指名具体的厂商模型属于违规。CONVERGE 评审员简报被重写为目标 + 约束。未移除任何 v3 机制。
- **`llms.txt`：由生成产生而非手工编写。** 根据 `uds-manifest.json`、`core/`、`skills/`、`integrations/REGISTRY.json` 和 `cli/package.json` 推导生成，若提交的文件存在单字节差异，`--check` 将判定失败。

### 变更

- **P1 和 P3 重返探针集合，它们被削减的原因现在成为了另一类错误的典型实例（XSPEC-408）。** 两者均在 2026-07-23 以“基线通过”为由退役：在未安装 UDS 的 Antigravity CLI 1.0.14 上运行，模型在回答前读取了文件（P1），并主动给出了推荐（P3）。这些观察结果依然成立。但随之而来的退役决定却并不成立。**每个探针度量的都是两件事——一种行为和一个声明的标记——而只有该行为被证伪。** P1 的削减记录用其自身的原话陈述了这一点（“剩下的部分是 UDS 要求明确的 `[Source: <path>]` 归属说明，而基线使用的是 markdown 文件链接”），然后引用第 2.2 节“探针断言结构而非措辞”舍弃了其余部分。这种理解绝不可能是正确的，因为 **P2 正是通过匹配四个字面标签而存续**，并且是集合中最持久的探针；第 4 节自身的总结此前就已经得出结论：“always-read 梯队中持久的部分看似是声明的形式和内部约定，而不是知识”，而两个声明形式的探针却在其下方几段处被削减。第 2.2 节现在明确阐述了它本应承载的区别：匹配模型碰巧写出的一句话度量的是运气，而匹配**标准要求模型发出的标记**度量的则是标准是否真正生效。P1 和 P3 被重写为仅询问这一更狭窄的问题，现在当回答*事实正确但未添加标记*时两者均会明确失败，而这正是它们存在所要捕获的情况。它们在第 2.3 节的准入基线不需要进行新的运行：保留的 2026-07-23 成绩单被重新评分，包含 `[Source:` **0 次**与 `[Recommended]` **0 次**，且每一个都通过同一个读取程序在同一个文件中找到的阳性对照字符串进行了验证，因此这里的零代表确实不存在，而非搜索失效。`scripts/check-reinstated-probe-baselines.ts` 在每次 CI 运行时重新推导这两个计数——读取一次后硬敲进文档里的零属于盖章，而本仓库已经记录了盖章会导致什么后果——其 `--self-test` 分支涵盖了标记出现（red）、对照缺失（undecidable，绝不判定为 green）以及空成绩单（undecidable），这三者均经由变异测试得到确认。**这并没有做到什么**：提高样本量 n。它只是每个探针单次运行、单个工具、单个前沿模型重新读取的结果。`DELTA-TREND.md` 在其子表中记录了重新评分，并明确禁止将其加入到其上方的扫描中，且 Codex 行带有注解说明其 50% 指的是*已退役*的 P1/P3——Codex 未保留任何 P1/P3 成绩单，因此与 Antigravity 不同，那里没有任何内容可供重新评分。当初探针*为了*它们而退役的受众群体——采用者在 aider 和 continue-dev 下运行的本地模型和量化模型——仍然从未被测量过，而探针的全部价值恰恰在于告诉你该受众群体何时不再需要该规则。恢复探针只是把传感器放了回去；它并不预示会读出什么结果。
- **Skills：每个附属文件现在均可从其 `SKILL.md` 到达。** 有 13 个附属文件（3,193 行）没有任何东西指向它们，另有 56 个文件只能通过另一个附属文件到达；现在，`skills/` 和语言区域树中的全部 168 个附属文件均在一跳（hop）之内可达，每个指针均说明了文件包含什么内容以及何时读取它。这消除了一项结构性风险；但并不证明附属文件实际上会被读取。
- **随附发行的 `.ai.yaml` 文件的 `meta.updated` 改取自其源文件的 git 历史记录**，并在 git 没有记录时省略该字段，而不是使用手工键入的日期或转换运行当天的日期。
- **`governance-layer`：执行现实（Enforcement Reality）小节现在还将较旧的风险接受字段**（`review_by`、`risks_accepted`、`gates_bypassed`）指名为没有任何程序读取。
- **依赖项：** `chalk` 5.6.2 → 6.0.0, `js-yaml` 5.2.1 → 5.2.3（CLI 运行时）；`eslint`、`globals`、`lint-staged`、`tsx`（开发）。
- **仓库内部验证（对采用者收到的内容无影响）：** 运行真实 `uds init` 的采用者指令文件检查；针对路径表中每个工具的安装路径关卡；执行已安装 Stop hook 的 hook 交付关卡；内容级 bundle 对等性；skill 触发暴露面关卡；随附盖章一致性检查器；翻译 `source_hash` 棘轮；名称提及分类器；STATUS.md 矛盾关卡；针对本仓库生成的 `.claude/skills` 副本；skill 金丝雀工具（XSPEC-408 R2）及其首次真实运行；P7 探针削减；版本递增/同步双向验证移至每次 CI 运行；测试套件不再依赖机器的语言区域设置。

### 废弃

- **`contentMode: 'full'`——一个本已存在的模式的第二个名字（XSPEC-357 R7）。** 清单模式接受它，`--content-mode` 提供它，init 提示词将其吹捧为以上下文预算换取合规性（“嵌入全部规则，约 10-15 KB，最高合规性”），并且每个 `partial` 梯队的工具都被自动分配了该模式。然而这些根本没有实现：生成器对该模式唯一的测试是 `=== 'minimal'`，因此在**测量的所有 24 种工具 × 语言组合中**，`full` 和 `index` 走了相同的分支并写出了**逐字节完全相同的文件**，对照测试确认比对能够检测出真实的差异（在全部 24 种组合中 `full` 与 `minimal` 均存在差异）。它也根本无法如宣传的那样运作——`.standards/` 大约有 24.8 万个 token，远远超出了集成文件所能承载的容量。采用者此前是在针对同一种行为的两个标签之间做选择，而该标签承诺了根本不存在的差异；文档甚至出于监管考量向银行核心系统推荐 `full`。**废弃它不会给采用者带来任何成本**：`--content-mode full` 仍然被接受，并在附带提示的情况下解析为 `index`，记录了 `full` 的清单在下次读取时会被重写为 `index`，并且由于这两种模式本来就产出相同的字节，**任何项目生成的文件都不会发生变化**。未识别的模式仍然解析为 `index`，现在会打印指名该值的警告；在 7.0.0 中它将成为一个错误。`check-adopter-instruction-files.ts` 中的 `content-mode=full` 场景（正是其“全部 8 个文件逐字节相同”的发现引向了这里）已被移除，而不是留下来将 `index` 与 `index` 比对并永远报告完全相同。
## [6.8.0] - 2026-08-20

### 新增

- **一个询问是否有人能够触及该代码的关卡（XSPEC-383 R3）。** 单元测试证明函数是正确的，却丝毫不说明用户是否能调用它。在 2026-04-07，一次提交添加了 `cli/src/utils/spec-linter.js`（172 行，14 个通过的测试）和 `cli/src/commands/sync.js`（133 行）——两者均从未被注册过，而同一天下游产品将其自身连接到了 `npx uds lint --json`，一条因此永远不会存在的命令。四个半月以来，两边都是绿灯，却没有连接的路径。`check-module-reachability.mjs` 从 package.json 的 `bin` 和 `main` 开始，沿着静态导入、重新导出和动态导入进行遍历，并报告它无法触及的内容。采用广度优先搜索（BFS）而非“导入计数 > 0”，因为互相导入但没有任何外部模块导入的模块集群各自仍会得到 1 分。在手工搜索只找到 2 个的地方，它找到了 24 个，包括一个完整的九模块 `src/flow/` 子系统。排除项是带有每条规则计数的规则，绝非文件名白名单；成功时会打印分母；无法静态解析的动态导入会被计数并报告，而不是被吞掉。已接入 CI，其基线将于 2026-11-19 到期，因此初次接触不会变红，并且在信任该检查之前，`--self-test` 会作为独立步骤运行。
- **`uds lint`（XSPEC-383 R5）。** 注册了 linter 自 2026-04-07 以来一直等待的命令，携带与真实规格接触后存活下来的两项检查：依赖有效性和规格大小。`--json` 输出 `{summary, results:[{specId,status,message}]}`。

### 变更

- **在哈希前规范化行尾结束符（#155）。** `uds check` 此前比对的是磁盘上的字节，因此在设置了 `core.autocrlf=true` 的 Windows 检出上，每个 LF 都变成了 CRLF，导致每个哈希都不再匹配——无论真有人编辑了 N 个文件还是平台重写了每个换行符，“N files modified”读起来都完全一样。规范化现在在哈希之前进行，并借助 git 自身的二进制启发式方法（前 8000 个字节中存在 NUL 字节）跳过绝不能触及的内容。遍历还发现了另外两个从未经由 `hasher.js` 的哈希实现（`skills-installer.js`、`actual-state-scanner.js`）；所有四个调用点均已修复。添加了 21 项测试，包括证明在 CRLF 检出上真实内容差异和行尾空格差异仍能被检测到的反向对照测试。修改前后 `uds check --force` 的输出逐字节完全相同，因此现有清单无需重新盖章。
- **使用文档生成器改为向 CLI 询问，而不是背诵列表。** `scanCliCommands` 将 `cli/bin/uds.js` 读取到变量中然后将其忽略，使用了一个带有“based on uds.js analysis”（基于 uds.js 分析）注解的手写数组。因此每次重新生成都会把已被移除的 `uds workflow` 写回文档中，并且从未添加 `uds lint`。它现在改为解析 `uds --help`，这是 CLI 自身权威的答案，它覆盖了单文件解析无法察觉的注册方式——`mcp` 完全是从另一个模块注册的。覆盖率从 24 个中的 19 个提高到了 23 个中的 23 个。解析到零个命令时会抛出异常，而不是输出空小节。

### 移除

- **`uds sync` 与 AC 覆盖率检查（XSPEC-383 R5，选项 E）。** `sync.js` 的使用者数量为零。AC 覆盖率检查对照 93 份真实规格进行了测定，报告 98 个验收条件中有 0 个被覆盖——并非因为它们缺少测试，而是因为它根据位置构建 AC 标识符（`AC-1`、`AC-2`），而不是读取规格所声明的标识符，然后使用硬编码的 `@` 前缀进行搜索。一个编写了 `AC-045-001` 且未使用 `@` 进行注解的项目，无论其追溯多么彻底，都会得到零覆盖率。它所报告的并非“该项目没有追溯性”，而是“我使用自己的约定寻找且一无所获”，而这两者的呈现效果完全相同。它被移除而不是留着未接入状态：它是对其唯一已知使用者并未采用的约定的一套正确实现，留在代码树中等待重新接入。跨仓库协调 AC 标识符约定是一场协商而非打补丁，属于其独立的议题。

- **一个检查 `uds <cmd>` 指令是否真正能运行的关卡（XSPEC-383 R4）。** 2026-08-19 发现指引文档中随附了三个根本不存在的顶层命令（`uds install`、`uds lint`、`uds sync`）和两个标志（`uds check --spec-size`、`uds spec create --boost`）——包括在 `quickstart.js`（其全部职责就是“寻找正确的命令”）以及 `integration-generator.js`（将命令写入每位采用者的 `CLAUDE.md`/`AGENTS.md`）中。两者此前均已修复（`465335e4`）；但没有任何机制检查该修复是否能持续保持。`check-command-existence.mjs` 遍历 `core/`、`locales/`、`ai/standards/`、`cli/src/`、`skills/`、`docs/` 以及仓库根目录下的 `*.md`，提取每种 `uds <cmd>` 形式，并针对本次提交自身的 CLI 使用 `uds <path> --definitely-not-a-real-flag` 对每一项进行探测——而不是使用 `--help`，因为 commander 对*未知*命令会以通用命令列表回应而不是报错，而这正是 `uds lint`/`uds sync` 在第一轮检查中逃过检测存活下来的原因。标志通过两个尾随哨兵选项进行探测，以使接收值的标志绝不会意外消耗掉哨兵选项而导致真正的命令被执行。已接入 CI，拥有独立的 `command-existence` 变更过滤器（非现有的 `cli` 过滤器——其源码暴露面并非 `cli/**`）。
- 针对当前代码树重新运行相同的探测发现了第一次事故的修复从未触及的进一步漂移：`uds workflow`（已在 v6.0.0 中移除）在 `docs/user/CHEATSHEET.md`、`docs/reference/FEATURE-REFERENCE.md` 和 `skills/workflows/README.md`（及其 zh-TW/zh-CN 镜像）中仍被显示为有效长达五个月，尽管 `docs/MIGRATION-v6.md` 本身就已经给出了本可捕获它的确切 grep 表达式。`uds config --lang`/`--mode`（根目录 `README.md` 和两种语言区域版本，加上 `docs/reference/INTEGRATION-VERIFICATION.md`）从未作为标志存在过——正确用法是 `uds config set output_language <value>` / `uds config --type content_mode`。`uds agent install --all` 在 CLI 接收位置参数的地方使用了标志（`uds agent install all`）。`uds reverse-tdd` 是为 GitHub Actions 示例凭空捏造的（`skills/reverse-engineer/tdd-analysis.md` × 3 种语言区域）——该能力仅作为 `reverse-tdd` AI agent 随附，而不是可脚本化调用的 CLI，该示例现在已据实说明，而不是展示捏造的 `coverage.json` 流水线。`uds check --interactive`（`cli/src/i18n/messages.js` × 3 种语言区域）并不存在，因为交互模式已经是默认模式（`--no-interactive` 用于禁用它）。共 29 项发现，29 项已修复，剩余 0 项。

## [6.7.5] - 2026-08-18

### 变更

- **八个技能可再次被模型选择。** `audit-assistant`、`changelog-guide`、`commit-standards`、`docs-generator`、`project-discovery`、`release-standards`、`reverse-engineer` 和 `spec-derivation` 曾带有 `disable-model-invocation: true`，这是由 `d415937e` 在重写描述时附带添加的，且未遵循任何明确的规则。它们在 2026-08-17 被特意保留原样，其原因在当时是成立的：当时确立的规则是“参考资料是模型可调用的”，而这些技能完全没有携带 `status`，因此解除它们相当于用一种无规则的行为替代另一种无规则的状态。之后的评估表明：**这八个技能都包含完整的 `Use when:` 触发条件和 `Not for:` 排除条件，全部描述的是操作而非参考资料，并且都已配对有斜杠命令**——这与 `code-review-assistant` 的形态完全一致，而后者的 `/code-review` 已被判定不足以成为设置该标志的依据。`journey-test-assistant` 是现成的先例：相同的“生成 X”形态、`status: stable`，且从未被禁用。现在每个技能均记录了 `status: stable` 并内联附带了理由。采用 `stable` 而非新值，是因为 `skills/` 使用的是 reference、stable 和 experimental，创造第四个值无异于换汤不换药的无规则行为。
- **模型实际可选择的技能数量现为 55 / 55。** 原为 45。

### 修复

- **在英文源文件移除该标志后，本地化安装仍带出了该标志。** `spec-derivation` 是唯一一个其语言包自身带有 `disable-model-invocation` 的技能，而 frontmatter 合并只会复制英文源文件中*存在*的字段——因此英文源文件中不再声明的字段会在语言包文件中完好保留下来，并最终被打包发布。zh-TW 和 zh-CN 均已修正。经解析全部 **60 个技能 × 3 个语言环境 = 165 个安装结果** 验证：仍处于禁用状态的数量为零。

## [6.7.4] - 2026-08-18

### 修复

- **6.7.3 导致 `uds check` 在每个仓库中虚报 52 个文件缺失。** 6.7.3 的两项改动只有在同时存在时才会产生交互：R1 为 skills 提供了内容哈希，使它们首次进入 `unchanged` 分支，而 R6b 将该分支的条目收集到 `manifest.fileHashes` 中。该映射通过 `isFile()` 测试进行验证，而 skill 条目是目录，因此每一个都被报告为缺失。**没有任何内容被删除——是记录出错了，而不是磁盘出错了**（经验证：59 个 skill 目录及其内容完好无损）。`verifiedPristine` 现在仅限于基于文件的类别，并且由于修复写入器并不会移除其已经写入的内容，`uds update` 还会丢弃它在 `fileHashes` 中找到的 `.claude/skills/` 和 `.claude/commands/` 键——否则错误的键将永远不会被再次访问，因为磁盘上没有任何东西与之对应。
- **Commands 现在也按内容进行比对（XSPEC-382 R7）。** R1 覆盖了 skills，但保留了 commands 的 `hash: null`，使其无条件重新安装分支继续生效。与 skills 修复形式相同：`resolveCommandContent(name, agent, locale)` 说明安装应包含的内容——带有英文回退的语言区域选择，加上针对每个 agent 的转换——安装器写入该内容，而规划器对其进行哈希处理。
- **本地化安装随附的 SKILL.md 文件指向了从未安装过的文件。** 语言区域包不是英文源的完整副本——实测表明，**zh-TW 中 59 个本地化 skills 中有 4 个、zh-CN 中 59 个中有 5 个**缺少英文源随附的文件——而安装器直接将整个语言区域目录替换进去，因此那些附属文件根本就没有被写入。其中有两个缺口被引用了：zh-TW 的 `dev-workflow-guide/SKILL.md` 指向 `workflow-phases.md` 三次，`testing-guide/SKILL.md` 指向 `test-skeleton-templates.md` 三次。**回退现在按文件而非按 skill 进行**——存在语言区域文件的地方使用本地化文件，不存在的地方回退到英文。
- **非 UDS 随附的文件不再导致 skill 永久处于“已改变”状态。** 安装 skill 现在会移除其目录中未被解析命名的顶层文件（实际发现案例：`deploy-assistant/guide.md`，它不在任何 UDS skills 代码树中且从未存在过）。通过相同的出处测试界定范围，以使采用者自身的 skill 目录排除在涉及此处的每条路径之外——经验证，手工编写的 skill 目录及其额外文件在 `--force` 下安然无恙——并且子目录保持原样，因为安装器从未写入过子目录。

## [6.7.3] - 2026-08-18

### 修复

- **Skills 现在按内容进行比对，因此升级不再重复打印毫无意义的 55 行。** diff 的两边此前都硬编码了 `hash: null`，因此每个 skill 都是无条件重新安装。对源目录进行哈希处理行不通——安装并不是逐字复制：本地化的 `SKILL.md` 会合并入英文 frontmatter（`brainstorm-assistant`：23,753 字节的 zh-TW 源在安装后变为 23,866 字节），源在运行时按语言区域选择，并支持按 skill 回退到英文，且子目录会被跳过。若按那种方式构建，全部 55 个在每次升级时都会显示为内容**变更**——与真实变更无法区分，比已知缺少信号更加糟糕。相反，现在通过单一函数实现：`resolveSkillFiles(name, locale)` 说明安装应包含的内容，安装器写入该内容，规划器对其进行哈希处理，因此两者不会发生漂移。在真实的已安装项目上进行了验证——110 个文件逐字节完全相同，0 处不匹配，且 18 个采用者编写的 skills 正确保持未解析。实际端**仅对 UDS 受管目录**进行哈希处理；采用者自身的 skills 从不参与比对，也绝不会成为被删除的候选对象。在一次真实升级中，`Update (57)` 现在变为 `Update: 0, Unchanged: 127`。
- **`uds check --restore` 无法恢复 72 个被跟踪标准中的 64 个。** 它在 `manifest.standards` 上匹配 `entry.endsWith(fileName)`，但自 3.4.0 以来其中的条目一直是 ID（`commit-message`）而非路径——这一比较永远不可能为真。成功运行的八个是 `options/` 条目（仍作为路径存储），这正是失败看起来从未像是彻底失败的原因；其余的均报告“Could not determine source”。相同的 ID 到源的查找在同一文件的其他地方已经存在两次，而此处从未获得其副本，因此修复方法是在 `registry.js` 中提供一个解析器，与它必须保持一致的文件名解析器配对。
- **逐字节完全匹配的标准无法摆脱被报告为已修改的状态。** 实际状态是从磁盘哈希计算的，因此与上游匹配的文件被归类为 `unchanged`，不产生任何动作，且永远不会被重新哈希——并且当计划为空时调和逻辑会提前返回而无需写入清单。根本没有回退路径。diff 现在会报告它**证明**与上游完全相同的文件，并在提前返回之前更正这些记录。范围刻意收窄：它只在证明磁盘与期望的上游内容相匹配后才记录哈希，因此手工编辑绝不会被吞并吸收。若将记录同步为磁盘上的任何内容，将导致 `uds check` 再也无法报告已被修改的标准。
- **备份中未包含 skills，且没有任何提示说明这一点。** Skills 是目录，备份对它们调用了 `copyFileSync`，这在所有平台上都会抛出异常（在此处的两个文件系统上均测得 ENOTSUP——非临时目录产物）。这一失败被掩盖了两次：执行器仅在**没有任何内容**完成备份时才会中止，因此一次成功掩盖了任意数量的失败；且备份清单没有 errors 字段，使得计划的 129 个路径中备份了 74 个在磁盘上看起来与完整备份毫无二致。修复前在真实仓库上的测量结果：针对 129 个操作的计划，备份清单记录了 74 个路径，其中 **55 个 skill 目录中有 0 个**在其中——这样一个回滚点根本没有覆盖它即将覆盖的绝大部分内容。目录现在以递归方式复制，清单记录 `failedToBackUp` 以及 `coverage: {planned, backedUp, failed}`，并且**任何**备份失败都会中止运行：拒绝覆盖未能预先复制的文件，这正是备份的意义所在。

### 变更

- **保留了无条件重新安装的折叠显示，并放宽了其措辞。** Commands 仍未实现内容比对，因此该分支依然生效。它未与 skills 部分一同移除，是因为悄然停止生效的折叠看起来与根本没有任何可折叠内容的计划毫无二致。

## [6.7.2] - 2026-08-18

### 修复

- **`uds update --skills` 更新了一切却从未推进版本标记。** 五个采用者仓库中有四个停留在 6.6.0，而同一份清单的 `skills.version` 却已经显示为 6.7.0；唯一成功推进版本的是未安装任何 skills 的仓库。两者的运行均以退出码 0 结束，均打印出“57 succeeded”，且均未打印任何失败。此前对此的理解——即有地方报告了失败却从未浮现出来——是错误的。探测表明 `results=57 failing=0`，注册表版本解析为 `"6.7.1"`，即将写入的值也是正确的：**调和器做对了一切，但随后的写入撤销了它。** `update.js` 在命令顶层（调和器运行之前）加载一次清单，随后 `updateSkillsOnly()` 将该陈旧的内存中对象写回覆盖了它。`updateCommandsOnly()` 存在完全相同的缺陷，是通过代码遍历而非踩坑发现的。现在两者都会重新读取清单，并**仅应用它们所拥有的字段**——将整个对象复制回去会导致后续步骤添加的任何字段重新暴露相同的缺陷。这一点至关重要，因为该机制自身的注释说明它的存在正是为了让恰好读取该字段的每周过时侦测停止误报。
- **列出 57 项变更的计划，其中 55 项为无条件变更。** Skills 不具备内容比对（XSPEC-382 R1），因此每次升级都会以完全相同的理由重复打印相同的 55 行，淹没了审查者实际需要核准的 2 行。它们现在被折叠为单行**并说明折叠了多少项**，总数保持不变——未声明自身的上限看起来就像“这些就是全部”。Summary 行同样改为显示 `Update: 57 (2 changed, 55 unconditional reinstall)`；仅有 `Update: 57` 虽然属实却毫无解答价值，而 Summary 正是你在决定是否批准升级时所阅读的内容。

### 变更

- **无条件重新安装的理由字符串改为单一导出的常量**，而不是在产生它的调用点保留一份副本并在渲染它的调用点保留另一份副本。两份副本之间的漂移在此处会悄无声息地发生：折叠将直接失效停止折叠，而计划将看起来与以往完全一样。

### 测试

- **针对版本标记的行为测试，与现有的形式测试并存。** 随修复一起添加的回归测试断言的是源码文本——即这两个函数包含 `readManifest(projectPath)`——这对于调用它却丢弃结果的重构依然会保持绿色。由于所作出的断言属于行为层面，因此 `tests/e2e/update-version-advances.test.js` 现在执行真正的安装、植入探针版本、运行 `update --apply --yes --skills` 并断言标记已发生移动。双向验证：应用修复时为绿，回退修复时为红。
- 两个新测试套件均断言**两个分支**。折叠测试检查普通计划是否保持不变，因为仅检查“这 55 个已消失”的测试对于丢弃每个更新行的渲染器同样能够通过。

## [6.7.1] - 2026-08-18

### 修复

- **本地化的速查表嵌入了英文 skill 描述——对每个语言区域一贯如此。** `scripts/generate-usage-docs.mjs` 在语言循环之前仅扫描了一次 skills，且始终来自 `skills/`（英文源），因此所有三份速查表和功能参考手册共享了同一套描述。修复前的测量结果：**`locales/zh-TW/docs/CHEATSHEET.md` 中的全部 82 条描述与英文描述逐字节完全相同**——并且它们是 6.7.0 之前精简剥离后的 `[UDS] <label>` 形式，因此繁体中文读者在错误的语言中看到了过时的描述，而他们已安装的 `SKILL.md` 却携带着完整的中文触发暴露面。`scanSkills()` 现在接收一种语言并在循环**内部**被调用，优先使用语言区域变体并在缺失时按 skill 回退到英文。在生成器中而非在 82 行中进行修复：手工编辑的速查表在下次编辑时必然会与 `SKILL.md` 发生分歧。
- **从 `code-review-assistant` 和 `checkin-assistant` 中移除了 `disable-model-invocation: true`。** 该标志未遵循任何可陈述的规则。在携带 `status: reference` 的六个 skills 中，尽管其生命周期完全相同地根据 XSPEC-095 迁移到了采用层，**其中四个（`tdd`、`bdd`、`atdd`、`pr-automation`）却从未被禁用**——相同的类别，相反的处理——而其余八个被禁用的 skills 则完全没有携带 `status`。系统此前已经记录了其后果：`pr-automation-assistant` 路由指引*“审查本身的实质内容——请用 `/code-review`”*，而该转介在任何模型发起的路径中均不可达。所有六个参考型现在均受到同等对待，这使得规则变得可陈述：**参考型可由模型调用**。两份文件均内联附带推理理由。其余八个被刻意保持原样——它们没有 `status`，因此解除限制将是用另一种毫无规则的行为替代一种毫无规则的状态；它们在 XSPEC-378 R5 中被点名列出，而非未加说明。

## [6.7.0] - 2026-08-17

### 修复

- **跨全部三层恢复了 skill 触发暴露面——55 个 skills × 英文、zh-TW、zh-CN。** 在模型决定是否调用某个 skill 时，其 `description` 是模型唯一看得到的内容。提交 `d415937e`（2026-02-10）将其中 17 个重写为 `[UDS] <label>` 并删除了 `Use when:` 和 `Keywords:` 行，**中文关键词也被包含在内**；相邻提交的标题写着 `token optimization`。以往只有 token 是可计数的——没有任何东西在度量触发暴露面，因此这种权衡在实际上并非如此时看起来像是一边倒的利好。在 2026-08-14 的测定结果：在携带 `SKILL.md` 的 55 个 skills 中，**27 个拥有触发条件，27 个拥有关键词，0 个拥有排除条件，而 28 个两者皆无**——这 28 个正是方法论的核心：tdd、bdd、atdd、spec-driven-dev、code-review、commit-standards、checkin、requirement。
  - **英文源**：恢复了 28 个，且**全部 55 个均获得了排除条件**（`Not for:`）。只添加触发条件而不添加排除条件会导致过度触发，而在不该触发时触发的 skill 会被彻底关闭——连同正常工作的 skill 一起被关闭。在可从 git 历史中恢复的 15 个中，有 **8 个被重写**，因为历史文本已不再描述当前的行为：其中六个声称驱动已在 XSPEC-095 中迁移到采用层的生命周期。恢复过时的描述比不恢复任何描述更糟糕。
  - **语言区域层**：zh-TW 和 zh-CN，**各 55/55 个，系翻译而非简单转码**。这一半正是重点所在——使用 `--locale zh-tw` 安装的项目在英文源已被修复的同时仍持续接收剥离精简后的描述，因此修复无法惠及其所针对的读者。繁体和简体各自遵循其自身习惯用语编写，并且更正了三个混有繁体字的 zh-CN 描述。
  - **翻译漂移从 62 → 38**，剩余的 38 处是刻意停止：仅因本次描述编辑而产生漂移的 24 个文件更新了它们的哈希，而正文此前早已发生漂移的 12 个文件保留了其陈旧的哈希——更新那些哈希等同于断言了无人验证的全文件同步。
  - ⚠️ **这 28 个中有 10 个携带了 `disable-model-invocation: true`**，由同一个 `d415937e` 添加。对于这些 skills，描述并不能恢复可选择性——该标志才能，而是否解除该标志属于设计决策而非缺陷。模型实际能够选择的 skills 数量为 **45 个，而非 55 个**。

### 新增

- **`ai-response-navigation` 1.2.0 → 1.3.0——可选的 R10 和 R11。** 它们的来源与 R7–R9 不同：一位用户在同一次会话中两次指出一份正确且完整的回答难以阅读，而当时 R7–R9 已经随附发布并被遵循。仅以结论开头还不够。
  - **R10——通俗语言为主体；标识符为支撑。** *触发条件*：向人类解释某种情况、缺陷或系统行为的任何回答。用读者会使用的词汇解释发生了什么；路径、符号、行号、命令输出和版本字符串应当放在它们所支撑的句子**之后**，而不是充当句子本身。这并**不**允许省略它们——想要验证的读者必须能够进行验证。**有意与 R7 分开**：R7 规定了结论先于证据的顺序，而回答可以以结论开头，却用仅其作者掌握的词汇来陈述。两者都会导致读者无法采取行动；它们是不同的失败模式。
  - **R11——每个选项都附带其自身的权衡。** *触发条件*：要求读者在两个或多个行动方案之间做出选择的回答。规则 2 已经要求标记推荐项并给出*其*理由；R11 要求**每个**选项均陈述其收益与代价。只为推荐项进行论证的列表把比对工作扔回给了读者——而这正是他们要求完成的工作——并且没有展示缺点的选项读起来就像没有任何缺点一样。**权衡不是模棱两可的说辞**：“稍微困难一些”不是代价，“重写 110 个文件且需要人工检查翻译”才是。空的代价单元格读起来就像“未作分析”，读者无法将它们区分开来。

## [6.6.0] - 2026-08-17

### 新增

- **`spec-driven-development` 2.3.0 → 2.4.0 — 没有验证项的 AC 就不是 AC。** 每一个验收条件都必须有**指向它的验证项**——测试、检查、关卡或显式记录的手动步骤。没有任何验证项引用的 AC 是一句无人履行的承诺，而且它**不会**大声报错：它只是在规格继续声称其成立的同时，悄然不再成真。**规则**：此类 AC 必须**降级为设计意图**，而不能作为 AC 保留——降级是坦诚的，未经验证的 AC 则不是。该标准还规定了什么*不算*验证项：“审查者会注意到”不算验证项，因为审查者读的是规格，而规格写着该 AC 成立。新增规则 `SDD-AC-VERIFIED`。
  - **实测案例**：一份 2026-05-14 的规格包含 `AC-7: the legacy system-report is fully preserved, no regression`。其测试计划有七个项目，且**没有任何一项指向 AC-7**。该报告的定时器被停用，其部署函数从未被调用——**自写下该 AC 的第一天起便是如此**。三个月后，在验证一次无关的安装时才偶然发现了它。它并不是关联了检查后来松脱了；**它根本就从未被关联过**。

- **`ai-response-navigation` 1.1.0 → 1.2.0 — 规范回答本身的可选规则 R7–R9**（XSPEC 借鉴 B-10，来自 [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd)，MIT）。规则 1–6 规范回答*之后*的内容：导航页脚、醒目的建议、与响应类型匹配的模板。没有任何规则规范回答本身。因此，回答可能会将结论埋没在长篇累牍的证据之下，却依然能通过追加正确的页脚来满足**本标准中的每一条规则**——而对于找不到答案的读者来说，被告知下一步该做什么并无任何帮助。
  - **R7 — 以结论开篇，而非过程。** *触发条件*：回答问题、汇报调查结果或陈述决策的响应。首行陈述发现了什么或该做什么——而不是方法，不是重述请求，也不是回答计划。证据（`file:line`、命令输出、表格、度量数据）是**佐证**，应当置于其所支持的论点之后；以证据开篇会迫使读者自行重构结论，而这本是他们要求完成的工作。这是对证据进行排序；它**并不**允许省略证据。
  - **R8 — 每轮重述状态。** *触发条件*：跨越 3 轮或更多次交互的工作，或包含 3 个或更多步骤的任务。用一行说明当前工作的进展情况。不能假定读者能在多条消息间记住“我们正处于 5 步中的第 3 步”，而重述它只需花费一句话。与模板 4（*进行中*）组合使用：R8 规范开头，模板规范页脚。
  - **R9 — 禁用开场白。** *触发条件*：任何实质性响应。推广了一项既有禁令：[`anti-sycophancy-prompting`](core/anti-sycophancy-prompting.md) 已禁止*“以积极肯定作为批评的开场”*，但仅适用于批评。R9 出于不同的原因将同样的禁令扩展到所有实质性响应——不是为了防止阿谀奉承，而是为了消除它在读者与答案之间造成的延迟。**R9 不适用于结束语**；R1 的导航页脚要求依然有效。
  - **源项目的 10 条规则中采纳了 3 条；放弃其余 7 条的原因已记录在标准本身中**，而非仅留在待办列表中。其中两条与 R1–R2 重复。三条与本标准或其他标准冲突：其*“无回顾 / 无结束语”*直接与 R1 的导航页脚相抵触，其*“列表上限 5 项”*会截断证据表和遍历分母，而其*“具体时间预估”*已由 [`estimation-standards`](core/estimation-standards.md) 规范。
  - **在与 R6（模型层级标注）相同的意义上属于可选**：采用者无需启用它们，现有技能无需追溯修改，项目也可以在其自身配置中将其中任何规则提升为必选。**不可选的是每条规则都带有精确的触发条件**——表述过于宽泛以致无法触发的规则与没有规则无异，这正是 XSPEC-378 中记录的失效模式。
  - 扩展**现有**标准而非新增标准：涵盖“AI 如何向人类读者书写”的第二个标准将会在同一个维度上产生两套实现。

## [6.5.0] - 2026-08-14

### 新增

- **借用自 `AmazingAng/old-coder` 的对四个现有标准的五项强化**（XSPEC 借用 B-01）。没有创建新标准；每处修改都是既有标准内部的一个条款。来自同一来源的另外两项主张被**拒绝**，因为我们的版本更严格——`verification-evidence` 已经包含带有八个实际运行实例的四条证据有效性规则，而 `class-level-fix` 已经要求阴性对照**按子集**运行并**指名**违规成员，而来源并未做到这一点。
  - **`verification-evidence` 1.2.0 → 1.3.0 — VE-011，证据新鲜度。** 证据记录中的每个数字必须来自**在其验证的产物最后一次编辑之后执行的全新运行**；任务中途运行的结果已过时，严禁上报。VE-001 到 VE-010 全部规范结果如何被*解读*；此前没有任何规则规范结果*何时生成*。此项关闭的缺陷是：测试套件全绿，随后编辑了提示词或配置，紧接着提交——通过的测试套件是在最后一次更改之前运行的，而捕获这一问题的防线正是固定内容哈希的检查，类型检查和代码检查（linting）永远无法触发该防线。
  - **`test-governance` 1.1.0 → 1.2.0 — 阈值关卡必须故障闭锁（fail closed）。** 一个只打印百分比且无论数值是否达到阈值都以 `0` 退出的度量层是一份报告，而非关卡：当数值向下漂移时它依然保持绿色，没有任何机制能阻止下一次合并。强制执行必须来自工具自身的标志（`--cov-fail-under`、`diff-cover --fail-under`、`nyc --check-coverage`），而非通过包装脚本重新解析打印的输出。放在这里而非 `verification-evidence` 中，是因为本标准规范**检查如何构建**，而后者规范一旦退出码存在**如何读取退出码**；两者现在相互交叉引用。
  - **`mutation-testing` 1.0.0 → 1.1.0 — 杀死归因、单侧不变量、等价变异体。** `Killed` 意味着*某个*测试失败了；工具不记录是哪一个，也没有工具记录属于哪一**层级**。因此 7/7 的得分验证的是所运行的整个测试套件，而非其中的属性测试套件——所以“属性验证了 X”需要单独针对属性测试套件重新运行变异体。单侧不变量（“从不超过限制”）**无法**检测出故障闭锁的变异体，因为拒绝所有输入永远不会产生超限输出；每个单侧属性现在都需要其相反的边界。此外，存活的变异体并不自动代表缺口——语义等价的变异体必须附带原因进行分类，而不是仅为了提升数字而通过无意义的断言将其杀死。
  - **`class-level-fix` 1.0.0 → 1.1.0 — 通过的阴性对照不能证明什么。** 对照测试通过一次仅表明**一个**已知不良用例到达了检查器的失败路径。它并**不能**证明检查器能够识别其声称防范之规则的**每一次**违规。基于 grep 的关卡在守卫拼写而非行为时可以完美地故障闭锁：人工构造的成员仅能证明导线已连通，不能证明网足够大。
  - **VE-012 / CLF-008 — 范围狭窄的关卡必须登记，而不能仅仅披露。** 当检查的实际覆盖范围窄于其所服务的规则时，说明这一点是必要的，但并不充分：**仅披露并不满足规则**，因为写一句“此检查未覆盖所有内容”比扩大覆盖范围廉价得多，那样一来每个狭窄的关卡都会加上一段坦诚的说明并继续保持狭窄。缺口必须在带有复审日期的例外清单中包含一条带日期的条目。这是本仓库自身反复出现的失败模式——一次哈希扫描读取了 115 个文件却仅输出 2 个、引用检查器跳过了整个已发布的目录、索引关卡仅在日期戳上触发——每一个都是覆盖范围窄于其规则且没有任何明说的关卡。

### 变更

- **`model-selection` 1.0.1 → 2.1.0 — 一维轴扩展为二维轴**（XSPEC-362）。该标准此前根据**任务修改了多少个文件**来决定模型层级。对模块边界进行 3 个文件的重新设计比 8 个文件的机械性重命名更难，因此该信号以**固定方向**错误分类了“深而窄”的工作——这是一种偏差，而非噪声。它之所以留存，是因为度量成本低廉，而不是因为它具有任何预测能力。现替换为两项标准：**推理上限需求**（是否存在更长的思考时间也无法解决的组件？）与**规范明确度**，后者明确是**双向的**——将模棱两可的任务交给字面执行的模型会导致“精确执行了错误的语句”，而将详尽写出的步骤列表喂给高上限模型则会*降低*输出质量。层级 ID（`fast` / `standard` / `capable`）保持不变；仅评判标准发生变更。
  - **新增与模型轴正交的 effort（思考投入）轴。** 思考深度现在是**单次调度的参数**，而非模型本身的属性：分为厂商中立的级别 `low` / `medium` / `high` / `very-high` / `max`，由各平台在本地映射。标准清楚指明了何种失败对应何种补救措施——输出肤浅但合理属于**深度不足**（在同一模型上提高 effort），在最大投入（max effort）下输出本质性错误属于**上限不足**（提升模型层级）——且两者不可互换。在未耗尽 effort 的情况下盲目提升层级，属于关于哪个维度存在短板的未经检验的假设。
  - **新增反向排除章节。** 旧标准只规定了将什么工作*提升*至某个层级，从未规定不该将什么工作*发送*给某个层级。**硬性边界**（上下文容量、effort 参数支持、模态）代表能力的缺失，而非能力的强弱程度不同，必须在成本对比**之前**排除——在对比之后排除会让更便宜但无法胜任的模型凭借价格胜出。**反向风险**：高能力层级可能会通过安全分类器拒绝规范敏感型的工作，且**拒绝并不算作错误**——它表现为携带拒绝标记的正常响应。对于仅检查退出码或仅检查是否引发异常的调用方而言，这就是一种**静默失败**：流水线记录了成功，而工作从未被执行。调用方现在必须检查该标记。
  - **`capability_dimensions` 子维度拆分为 `declared` 与 `measured`。** 原本一个 1–5 分的分值承载了两个不同的事实：*它到底能不能做*（二元布尔值，厂商声明，连接时免费获取）以及*做得有多好*（连续值，需要基准测试）。合在一起后，廉价的事实与昂贵的事实变得无法区分。`declared: false` 现在是硬性边界；`declared: true` 且缺少 `measured` 时为 `UNKNOWN`。严禁从分数推导 `supported`，且**失败的度量绝不能记录为分数**——包括不在 1–5 范围内的 `0`，它会让“我们无法度量它”看起来和“我们度量了它且表现很差”完全一样。
  - **`routing_rules` 从三种状态扩展为四种。** 此前 `UNSUPPORTED` 意味着“分数 ≤ 1 **或未注册**”，将“已度量且不可靠”与“从未度量”混为一谈。其后果是新检测到的模型在初次评估时就被排除且永远无法重新进入候选池——这与支持更多模型的目标背道而驰。`UNKNOWN` 现在是一个独立状态，表示**排队等待校准**，且两者必须**在返回结构中**可区分，而不仅仅是在日志中：调用方必须能够区分“该模型做不到”与“我尚且不知”，因为它们会导致不同的后续行动。
  - **重新度量现在拥有三个独立触发条件**：版本标识符变更、`measured.at` 早于 90 天前，以及退化检测告警（DEC-033）。版本变更是一个**充分**条件，而非必要条件——DEC-033 的存在恰恰是因为行为发生了变化而版本字符串没有改变，因此仅绑定版本变更的实现会遗漏它原本旨在捕获的整个场景。
  - **移除章节版本**（R6a）。该文件此前带有整文件版本 `1.0.1` *以及*一个标记为 `2.0.0` 的章节，且没有任何规则规定 `.ai.yaml` 的 `meta.version` 跟踪哪一个——因此“版本已同步”并非可检查的主张。现在只有一个版本字段，且规定 `.ai.yaml` 跟踪该字段的规则已写入标准中。2026-04-13 新增的能力管理章节——**此前从未记入版本历史**——现在已记录于其中。

### 新增

- **`check-model-pin-freshness` — `capability_registry` 的时钟**（XSPEC-362 R4）。DEC-031 D1 要求*记录* `pin_date`；却没有任何机制要求*读取*它。随附的示例**超过自身 90 天阈值达 120 天**，在页面上过期条目与当前有效条目毫无二致。该检查报告两种腐化：早于阈值的日期，以及**随附示例中的具体厂商模型 ID**——写入标准的模型 ID 是带有过期日期且无人负责的引用，因此示例现在使用占位符。根据 XSPEC-361 R8 对文件内不变量所度量出的误报率，其级别为 **WARN，绝不 BLOCK**；只有未完成的扫描才会以非零退出，因为“检查器损坏”和“检查器未发现任何问题”绝不能产生相同的输出。它遍历发布的文件树而非手打的标准列表，并打印其分母与排除项。`--self-test` 针对具有已知结论的测试夹具运行两个断言，因为扫描 366 个文件且无任何报告的检查器看起来与断言从未触发的检查器完全一样。接入 `pre-release-check.sh` 步骤 18.8，该步骤会打印警告而非将其吞掉——`run_check` 会隐藏任何以 0 退出的命令的输出，而该检查在设计上就是以 0 退出的。
- **针对 `model-selection` 的 Claude Code 宿主层映射**（XSPEC-362 R5）：`integrations/claude-code/model-selection-mapping.md` 及其机器可读的孪生文件、`integrations/claude-code/.claude/agents/` 下的四个参考子代理定义，以及跨仓库调度模板。该标准**在规则上**保持厂商中立——它将 `fast` / `standard` / `capable` 与 `low` … `max` 定义为标签，并声明它无法说明给定模型接受哪些 effort 级别，将这些单元格标记为 `?`。该目录针对一个宿主给出了答案，并且是整个仓库中唯一应存放具体模型标识符的地方。`core/` 保持不变，且仍包含**零个**具体模型 ID。
  - **该映射的存在是因为名称无法对齐。** UDS 的 `very-high` 在 Claude Code 中拼写为 `xhigh`——这是唯一重命名的级别。标准不会为了迎合工具而扭曲；重命名在宿主层被吸收，这正是 R5 的目的。
  - **`fast` 层级在该宿主上没有 effort 轴**，因为其模型根本不接受任何 effort 级别。这是一个对标准自身规则产生影响的硬性边界：**MS-005**（“在同一模型上提高 effort”）**在该层级无法执行**，转而采用 MS-001 并不违反顺序规则——该层级的 effort 集合从一开始就是空的。标准中单元格原本为 `?` 的网格现在已按提供商完成解析。
  - **硬性边界按 R7b 注册为 `declared`，而非分数**，且因为未运行基准测试，整个过程中缺少 `measured`——记录为 `UNKNOWN`，绝不用默认值填充。注册表还指出了在代理文件中不可见的两个边界：相同的别名在不同提供商处解析为不同的模型（在某些提供商上，`effort` 静默无效），并且后台子代理（自 v2.1.198 起为默认项）会静默丢失固定集合之外的内置工具，且不上报任何错误。
  - **R3b 引用自厂商，而非主观断言。** 宿主自己的文档指出，其最高能力模型在安全分类器触发时会引发自动回退，并且从该模型获得良好输出的方法是“描述结果，而非步骤”——这分别是从另一侧表述的 R3b 第 1 项与第 2 项。
  - **调度模板的依据经过了度量，它纠正了本仓库此前发布的一项主张。** `agent-dispatch.ai.yaml` 曾称子代理不会加载目标项目的指令且无法调用其技能。这两半句都是错的：子代理会加载 CLAUDE.md 层级结构且可以调用技能。真正的限制更窄且更容易被忽略——**它们加载的是主会话工作目录的层级结构，而非它们被派去工作的仓库的层级结构。** 于 2026-08-12 通过调度一个被禁用工具的子代理进行度量，在允许其运行 `pwd` 之前询问其上下文中包含哪些 CLAUDE.md 文件：正好两个，都不是目标仓库的文件。同仓库调度不需要模板；跨仓库调度没有其他规则来源。该说明已就地更正，附带度量结果，并明确警告不要在阅读厂商文档后删除该机制。
  - **`check-model-pin-freshness` 现在也遍历 `integrations/`。** 它的 `VENDOR` 断言在其中被抑制——具体 ID 是宿主映射中的*必需*形式——而 `STALE` 依然适用，这正是扫描该目录树的全部原因：关于模型 ID 是“带有过期日期且没有时钟的引用”这一论点，并不会因为 ID 移至合法归宿而不再成立。被抑制的命中项计入 `skipped` 而非直接丢弃，因此该例外项保留在分母中，且 `--self-test` 在**两个**方向上都增加了测试用例——仅在其抑制方向上测试的抑制机制，与吞掉一切的机制毫无区别。
- **恢复 `agent-dispatch` 机器可读标准**（XSPEC-362 R5a）：`ai/standards/agent-dispatch.ai.yaml`、自我采用副本，以及注册表 + manifest 条目。`core/agent-dispatch.md` 一直持续随 npm 软件包发布，但其 `.ai.yaml` 在 6.0.0（XSPEC-086 第 2 阶段 / DEC-049）中被移除，前提是认为 `dev-autopilot` 拥有规范的机器可读副本。**该所有者于 2026-04-28 进入维护模式**——即迁移完成的次日——而移除操作两个月后依然照常进行。此后使用 `--format ai` 安装的采用者在软件包中收到了正文文本，却在任何地方都得不到规则。在包含 `REFERENCE_ONLY` 列表的全部四个检查脚本中，`agent-dispatch` 已从该列表中移除；该批次中的其余七个标准仍为纯参考，**不在**此处处理。
  - 职责边界，以防两个标准演化出相同规则的重复副本：`agent-dispatch` 涵盖**如何调度**（并行安全、独立领域、状态协议、提示词设计）；`model-selection` 涵盖**调度给谁以及思考深度多大**。两者相互交叉引用而非重复陈述。

## [6.4.0] - 2026-08-10

### 新增

- **`class-level-fix` 标准 — 修复应针对集合，而非单个成员。** 缺陷很少单独存在：它是调度链中的一个标志、manifest 中的一个条目、`agents/` 下的一个目录。只修复向你展示的那个成员会让集合的其余部分完全保持原样，且没有任何东西预警下一个缺陷——几个月后它会作为一起新事故卷土重来，这正是此类工作让人感觉永无止境的原因。规则：在修复之前，指明缺陷所属的可枚举集合，并添加一个**遍历**该集合的检查。第三个问题决定了该检查能否存活下来——遍历从哪里读取其成员？它必须是系统自身读取的源头（CLI 定义、目录、manifest），绝不能是某人手打的列表，因为手打列表在第四个成员到来之前都是正确的，且没有任何机制会发出提示。逐个枚举会静默失败；带着排除列表遍历则会大声报错，因为排除项必须由给出合理解释的人写下。检查必须打印其分母**以及排除了什么**——“检查了 4,012 个声明”读起来像是有覆盖，而过滤器却静默跳过了每一个目录条目。并且在获得信任之前，必须证明其针对每个子集都不是空虚成立的，因为对五个列表的检查如果仅在第一个列表上测试过，实际上只是对一个列表的检查。

  标准中的每一个示例都在 2026-08-10 进行过度量。支撑该标准的是一个反面教材：本仓库在十一天前就已经针对 `--integrations-only` 修复了完全相同的缺陷，**并附有解释普遍性问题的注释**，却让其他三个分支保持原封不动。知识就在文件中，却未能传达到其同类分支。描述类别的注释并不等同于对该类别的检查。

  该标准明确指出**它没有自动化关卡**——没有任何机制能够遍历“当前正在修复的每个缺陷”——并记录了原因、由什么强制执行（代码审查，带着一个问题：*这是哪个集合的成员？*），以及怎样才能让关卡成为可能。省略这些说明本身就会让它成为其旨在防止的事物的下一个实例。

### 修复

- **`--plan` 与 `--apply` 的范围行为现在已反映在 `--help` 中。** 6.3.10 通过编辑 `docs/reference/FEATURE-REFERENCE.md`（一个生成的文件）记录了新的组合行为。只要没人重新生成，该编辑就能一直留存。该文本现在位于 `cli/bin/uds.js` 的 `.option()` 字符串中，因此它也会出现在 `uds update --help` 中，而手动编辑的副本从未做到这一点。

## [6.3.10] - 2026-08-10

### 修复

- **`--plan` 被其他四个标志丢弃，而防止破坏的那个标志正是被忽略的那个。** `uds update --plan --skills` 安装了技能；`--plan --sync-refs` 重写了集成文件和 manifest。被文档描述为“显示对齐计划而不执行（类似于 terraform plan）”的标志被静默丢弃，因为范围标志（`--skills`、`--commands`、`--integrations-only`、`--sync-refs`）排在模式标志（`--plan`、`--apply`、`--force`、`--rollback`）之前，处于每个分支都会返回的“首次匹配即胜出”链条中。`--integrations-only` 早在 2026-07-30 就已针对完全相同的问题进行了修复；其余三个被遗留下来，十一天后它们依然在执行写入。现在模式在范围之前决定，并且一个测试从 CLI 定义中枚举标志列表，而非依据手写列表——日后新增的标志即使没人记得添加也会被覆盖。正是该测试发现了第四个实例。
- **`--apply --skills` 升级了技能并静默遗留了标准，同时报告成功。** 同样的链条：`--skills` 在对齐器（reconciler）运行之前就已返回。以此方式升级真实项目会使其停留在先前的标准版本上，屏幕上没有任何提示。`--apply` 和 `--force` 现在会同时执行对齐*以及*所请求的范围。
- **无人回答的确认提示以 0 退出。** 在非交互式 shell 中，`@inquirer/prompts` 会抛出 `ExitPromptError`；该异常从未被捕获，且进程仍以退出码 0 结束——因此在 CI 中，“未写入任何内容”与“更新成功”返回了相同的值。现在它会说明未写入任何内容，指出使用 `--yes`，并以 2 退出。检测方式基于提示的实际失败，而非探测在两个方向上都可能出错的 `process.stdin.isTTY`。
- **`--rollback` 现在会说明 `--skills`/`--commands` 无法缩小其范围**，而不是接受它们却依然恢复所有内容。

## [6.3.9] - 2026-08-09

### 修复

- **标准索引通报的数字与同步检查不一致，而两者描述的是同一个 manifest。** 6.3.8 教会了检查器通过注册表解析 manifest 条目；而索引块却直接从 manifest 持续通报 `installedStandards.length`。在一个真实项目上，那是 78 对 70，两者的差异在于 `MIGRATION-v6` §2 在 6.0.0 中移除的八个机器可读标准，跨越两个大版本后依然声明在 manifest 中，因为 `uds update` 不会对其进行清理。无论检查如何，78 都是个错误的数字：它正好位于“权威列表是 `.standards/manifest.json` 的 `standards` 字段”这行字的正上方——将读者引向差异的源头，就好像这能解决问题一样——并且它告诉代理去期待八个根本不存在的文件。该区块现在仅统计能够解析为文件的条目，并在下方列出其余条目，附带一行说明解释它们为何留存，以便两个数字都呈现出来，且都不需要读者去推测。

## [6.3.8] - 2026-08-08

### 修复

- **`uds deps` 在未检查的集合上打印了绿色对勾。** 在一个没有运行时依赖且使用 pnpm lockfile 的项目上运行时，它报告 `0 runtime dependencies checked`，接着报告 `no package-lock.json — nothing to compare the registry against`，然后报告 `✓ every dependency resolves to the version you test against`，并以 0 退出。两个事实都是真的；合在一起，它们声称一个该命令无法读取的仓库已被检查且没有问题，而连接到该退出码的关卡也表示赞同。`clean` 是三个空列表的合取，这在空集上空虚成立——而覆盖它的测试正是基于分母随结论一起呈现的理由断言了这一点。分母确实呈现了，但它什么都没有改变：对勾紧随其后出现，而退出码没有任何计数的痕迹。**打印分母并不能阻止空集被读作虚假的安心保证；拒绝给出判定才能做到。** 同时修复了该信息的后半部分：该项目有一个完全正常的 `pnpm-lock.yaml`，而被告知没有 lockfile 是读者认定工具陷入混乱并不再理会它的根源。该命令现在会指明它找到的 lockfile 并说明它读取哪种格式。
- **注册表 ID 不是文件名，而有八处将其视作文件名。** manifest 的 `standards` 数组在设计上是混合的：核心标准在 v3.4.0 中变成了注册表 ID，选项条目则保留为其上游源路径，因为选项没有 ID。每个消费者都对两者执行了 `basename()`——对路径是正确的，对 ID 则是无操作。`error-code-standards` 安装为 `error-codes.ai.yaml`，`logging-standards` 安装为 `logging.ai.yaml`，`ai-agreement` 安装为 `ai-agreement-standards.ai.yaml`；大多数 ID 确实等于其 basename，这也是该问题得以留存的原因。同一个错误引发了三次失败：最小模式打印了 `.standards/<id>`，导致**真实采用者的 AGENTS.md 中七十个路径中有七个指向空无**，正好位于一行写着“你必须（MUST）阅读并遵守 `.standards/` 中的标准”的正下方；索引块通过 `.ai.yaml` 后缀进行过滤，而没有 ID 带有该后缀，因此**每个核心标准都被丢弃**，该采用者早先的区块列出了七个选项而六十三个核心标准一个都没有；任务映射表以文件名为键，因此 ID 无法匹配任何内容，导致该标准静默失去了映射。解析现在归一为一个由全部八个调用点共享的导出函数，无法解析的条目会在列表下方报告，而不是作为路径打印出来。
- **专门用于捕获此类漂移的检查也存在同样的缺陷。** 针对一个包含七十项的 manifest，`AGENTS.md Standards Sync` 报告了 `7/7`：`.ai.yaml` 过滤器只留下了七个选项条目，这七个全部存在，因此它打了勾——在升级前该区块缺失六十三个标准时如此，在升级后包含七个死路径时依然如此。对自己度量对象的百分之九十视而不见，全程绿灯。现在在同一个项目上报告 67/67，手动破坏一个路径会报告 66/67 并点名该文件。它所需的映射早在其上方一百七十行处就已构建，并附带一条指明该具体情况的注释。
- **生成器仍然将 6.0.0 中移除的路径写入采用者的指令文件中。** `MIGRATION-v6` §2 移除了八个运行时已移至采用层的机器可读标准；三行 `Reference:` 与一个 MUST 优先级的任务映射一直指向 `.standards/workflow-enforcement.ai.yaml`。人类可读的 `core/workflow-enforcement.md` 被刻意保留在上游，但采用者收到的是 `.standards/` 而非 `core/`，因此它不是替代路径——这些行已直接删除而非重定向。守卫该章节的条件匹配的是自 3.4.0 以来任何 manifest 都不再包含的文件名，因此对于仍声明该标准的两个项目，它早已静默停止触发；现在两种形式都能匹配。

## [6.3.7] - 2026-08-07

### 修复

- **`uds deps` 仅读取根清单，导致单体多包仓库（monorepo）只得到其局部的无害结论。** npm 工作区将声明分散在多个 `package.json` 中，而该命令仅检查了其中一个。在真实项目上度量：报告了 34 个依赖，实际声明了 47 个——工作区中的 13 个不可见，且其中包含一个带有高危安全通告的软件包。**脱离范围的计数与完整计数无法区分**，而这正是该命令旨在报告的失败。现在从 `workspaces` 字段展开工作区，检查每一个清单，且报告会打印包含了哪些工作区，从而使分母自带其作用范围。每个漂移行都会指明其来自哪个工作区——否则读者只知道某个软件包发生了漂移，却不知道该编辑哪个 `package.json`。
- 区分真正覆盖工作区还是貌似覆盖的三个细节：lockfile 条目可能被提升（hoist）到根目录，**或者**嵌套在工作区下，因此两者都会尝试；若只检查一种，另一种会被报告为“not present in package-lock.json”，捏造出的未知状态会被误读为检查发现。依赖同级工作区的工作区是文件链接，而非已发布的软件包，因此予以跳过而非查询——向 npm 查询会返回 404 且会被记录为不可验证。并且比末尾段带有尾随 `*` 更复杂的 `workspaces` 模式现在会**大声报错**而非匹配其子集：静默覆盖少于作者意图的范围是在新位置出现的相同缺陷。

## [6.3.6] - 2026-08-07

### 修复

- **6.3.5 称随附的标准全部通过解析。它只统计了 287 个中的 141 个。** 6.3.5 中添加的关卡明确指名了三个目录且未进行递归，因此 `ai/options/`、`locales/` 与 `skills/`——全部由 `prepack` 打包进 tarball 中——都位于其分母之外。在 6.3.5 发布后，这些目录中有十个文件依然无法解析，涉及两个中文语言包以及 `skills/`。**枚举自身范围的关卡在新增目录的那一刻就会失效**，因此它现在遍历整个仓库，检查构建与第三方路径之外的每一个 `.ai.yaml`——此处有 759 个文件，而此前声称完整的数量仅为 423 个。
- **另有八个文件通过了解析却是错误的，没有任何单纯判断能否解析的检查能发现这一点。** `{UT:70%,IT:20%}` 并不是一个映射：冒号后没有空格，YAML 会将其解析为单个纯量键 `UT:70%`，其值为空。未加引号的 `- git commit -m "feat: add model"` 会变成 `{'git commit -m "feat': 'add model"'}`。这些能通过所有语法检查，却递给代理一堆无意义的内容。关卡现在还会拒绝带有引号字符或冒号后无空格的键——这是纯量被静默解析为映射的特征指纹——且这两个分支都由对照测试覆盖，而非凭空假定。

## [6.3.5] - 2026-08-07

### 修复

- **四个随附的 `.ai.yaml` 标准无法解析。** 6.3.4 交付了 141 个机器可读标准，其中 `agent-behavior-discipline`、`container-security`、`full-coverage-testing` 和 `knowledge-graph-memory` 为语法无效的 YAML。同样的四个文件位于 `.standards/` 中，即 `uds init` 置于采用者目录下的内容。代理在读取它们时会收到异常而非空内容——而捕获该异常的下游系统会得到与“该标准没有规则”毫无二致的沉默。这四个文件均以相同的方式失败：未加引号的纯量包含 YAML 特殊字符——括号内的冒号、后接散文文本的流式序列、值中间闭合的引号、缩进与其同级不同的键。通过加引号或重新缩进予以修复，未作结构重组。

### 新增

- **`npm run check:ai-yaml` — 每个 `.ai.yaml` 都必须能解析，且该检查已接入 pre-commit 和发布流程。** 上述四个问题之所以能进入发布版本，是因为有八个脚本读取该目录，却没有一个对整个集合进行解析；`check-standards-sync.sh` 比较版本和注册表条目，无法解析的文件也能顺利通过。该检查读取 `ai/`、`.standards/` 和 `cli/bundled/`，且无条件运行而非置于路径通配符（glob）之后——窄到足以跳过该问题的通配符无异于在另一个地方重犯同样的错误。**退出码 2 保留给“检查无法运行”**：不可读的目录、不包含任何 `.ai.yaml` 的目录、缺少 YAML 库。这不算通过，并且会导致发布失败，因为“没有问题”与“无法查看”产生相同输出的检查会将未知状态转化为虚假的安心保证。

## [6.3.4] - 2026-08-07

### 修复

- **`uds deps` 点名了 npm 不会安装的版本。** resolved（解析结果）列计算为满足声明范围的最高已发布版本。那是 semver 的规则，不是 npm 的规则：只要满足条件，`npm-pick-manifest` 优先采用 `latest` dist-tag，恰恰是为了防止带有普通版本号的 `next` 或 `beta` 发布版本落到使用插入符号（caret，即 `^`）的用户头上。在发布了 `latest = 0.3.223` 和 `next = 0.3.224` 的 `@anthropic-ai/claude-agent-sdk` 上度量：该命令报告 0.3.224，而 `npm install …@^0.3` 安装的是 0.3.223。其全部目的在于说明安装会得到什么的那一列，却指名了一个任何安装都不会收到的版本。现在通过单次 `npm view` 调用读取版本和 dist-tag，并应用 npm 自身的偏好逻辑，在 `latest` 位于范围之外时回退到范围内的最大值——固定在旧大版本的项目依然能得到真实的答案。两个测试覆盖了这两个分支。
- 前两个版本更正了该命令的用词。本版本更正了其计算方式，且值得明确说明的是：早期的修复只是让错误的数据变得更容易阅读。

## [6.3.3] - 2026-08-07

### 修复

- **6.3.2 纠正了解释，却遗留了其上方坚称解释刚刚撤回的内容的标题。** 漂移部分此前以黄色标题标为 `N shipped ≠ tested`，正好位于解释已发布（shipped）与已测试（tested）是否不同取决于项目如何发布的暗色段落上方一行。对于自带 lockfile 的产物，shipped *就是* tested，因此标题在报告中最显眼的一行陈述了与事实相反的内容。这正是 1.1.0 重写 Lock Strategy（锁定策略）条目以阻止产生的形态：具有误导性的一行，并在下方附带限定说明。标题现在指明不一致的两列——`N tested ≠ resolves`——这是关于度量本身的陈述，而非关于谁收到了它的结论。有测试对其进行约束。
- **另有两处说了相同的话，包括采用者最先读到的地方。** `uds deps --help` 将该命令描述为“Compare what you test against what your users install (published packages ship no lockfile)”，而该模块自身的摘要行则问道“does what you test match what your users install?”。两者现在都改以声明范围解析结果的方式表述。这是在修复标题后通过在仓库中 grep 被撤回的措辞发现的——即我自己审查时遗漏的两个实例。

## [6.3.2] - 2026-08-06

### 修复

- **`uds deps` 断言了它无法知晓的分发渠道。** 报告末尾写有“consumers resolve the range themselves, because a published package does not ship a lockfile”，并将第三列标记为 `users get=`。对于以通过 `npm ci` 构建的容器镜像进行分发的产品而言，这两者都是错误的——其用户得到的恰恰就是 `tested=` 列的内容，而解析列实际上是下一次未加复审的 lockfile 重新生成所拉入的内容。这是通过针对一个发布 Docker 镜像且根本不发布到 npm 的闭源产品运行该命令时发现的。该列现在改为 `resolves=`，且报告陈述了两种解读方式，因为单独阅读某一行绝不能传达与事实相反的信息。这与 1.1.0 对 Lock Strategy 条目所作的更正是相同的——在具有误导性的一行下方追加“but note…”会让该行继续保持误导性，而报告就像标准表格一样，大多数时候是一行一行阅读的。现在有三个测试来锁定这些措辞；此前没有任何测试。

## [6.3.1] - 2026-08-06

### 修复

- **6.3.0 从未到达 npm——而本版本的存在正是因为它所描述的同类失败。** 发布流程运行了，其洁净室任务在 `npm ci` 时失败，报错为 `EUSAGE … Missing: @emnapi/core@1.11.3 from lock file`，导致 `Publish to npm` 被跳过。lockfile 曾由 `npm install --save semver` 重新生成，从而丢弃了 `npm ci` 所需的传递依赖条目；我在本地运行的检查接受了它，因此这种分歧直到发布作业时才显现出来——此时 tag 和 GitHub Release 已经公开。从最后一个经证实能通过 `npm ci` 的 lockfile 重新构建，仅单独添加 semver 条目，并在整个 CI 矩阵上而非单台机器上进行了验证。
- **`v6.3.0` 原地保留，并未删除，其发布说明现在声明它从未发布过。** 没有对应 npm 版本的 tag 正是编写 `uds deps` 旨在捕获的不匹配；删除它只会消除证据而非消除差异。**6.3.1 包含了 6.3.0 的全部内容**，列于下方。

## [6.3.0] - 2026-08-04

### 新增

- **`uds deps` — 你测试的内容与用户安装的内容一致吗？** 已发布的软件包不附带其 lockfile：你的 CI 测试的是 `package-lock.json` 固定的版本，而你的用户在安装时得到的是声明范围解析出的任何版本。当两者不同时，整个测试套件针对一种无人安装的组合呈现绿色，而这种绿色与真正的测试通过毫无二致。该命令针对每个运行时依赖比较全部三个数字，并且**仅报告差异**，旁边附带分母——完全一致的行构成的表格会被粗略略过，其中重要的那两行也会随之被略过。
  - **原生依赖适用更严格的规则。** 带有原生绑定的软件包在用范围声明时会被标记，**无论它当前是否发生漂移**。semver 对原生 ABI 兼容性不做任何承诺，而该生态系统曾在次版本号范围内破坏过这种兼容性。匹配恰好一个已发布版本的范围是安全的，只是因为上游尚未再次发布，而不是因为有任何机制能保证它——等待漂移出现意味着等到你的用户已经遇到问题。
  - **失败的查询绝不上报为一致。** 它会变为 `unverifiable` 并使运行失败。“一切正常”与“我查不到”外观相同的检查会将未知状态转化为虚假的安心保证。
  - `--path`、`--json`、`--concurrency`。

### 变更

- **`supply-chain-security-standards` 1.0.0 → 1.1.0 — Lock Strategy 条目是正确的，但并不完整。** 它曾写道“use lock files, always committed to Git”，读起来很完整且未给任何遵循它的人深入探究的理由——然而已提交的 lockfile 约束的是*你的*构建，根本无法触及你的任何用户。就地重写而非附加注意事项说明，因为在未作修改的规则下方追加“but note…”会让只读该行的人继续受到误导，而标准表格大多数时候是一行一行阅读的。新章节说明了该失败以及引发它的用例，为发布软件包的项目增加了四项要求，并将自身范围明确限定于发布的工件——部署的服务自带其 lockfile，不受影响。

### 备注

- 该标准的 `.ai.yaml` 仍为一个五行的存根（stub），没有任何机器可读规则——是 **141 个中的 4 个之一**，另外三个是 `design-document-standards`、`estimation-standards` 与 `privacy-standards`，因此读取 `ai/` 层的代理对它们中的任何一个都一无所获。本版本刻意没有在那里添加它的一条新规则：在原本空无一物的文件中添加单条规则会让覆盖率看起来虚高。该缺口现在已记录在文件内部。

## [6.2.8] - 2026-07-31

### 修复

- **下载的标准其中文内容损坏。** HTTPS 响应曾通过 `data += chunk` 进行累加，这会单独解码每个数据块（chunk）——因此任何字节跨越数据块边界的字符都会变成替换字符（`日期` → `日期`）。单字节拉丁文本不受影响；三字节中日韩统一表意文字（CJK）则无法幸免。过程中没有任何报错：传输完成、文件写入、操作报告成功，损坏只有在阅读文本时才可见。在单台机器上度量，**11 个项目在其安装的标准中包含约 278 个替换字符**。损坏集中在 `requirement-checklist.md`、`requirement-template.md`、`requirement-document-template.md` 以及语言包中——即已发布的软件包不随附的文件（`files` 不包含 `templates/` 或 `extensions/`），因此它们只能通过下载获取。**如果你的标准中包含 ``，请在 6.2.8 或更高版本上运行 `uds update --force`——重新下载的内容是正确的且会替换它们。**

## [6.2.7] - 2026-07-31

### 修复

- **对齐器无法从任何 npm 安装获取扩展（extensions）。** `manifest.extensions` 中的条目（语言包等）在到达执行器时没有解析出的源路径，因为已发布软件包的 `files` 列表不包含 `extensions/` 目录——导致 `uds update --force` 报告 `No source path available` 并失败，而普通的 `uds update` 却能刷新同一个文件。执行器现在通过 `copyStandard` 解析扩展，即它针对注册表条目已经使用的 bundled → repo → download 回退逻辑，也是遗留路径一直以来使用的方式。没有任何来源的条目仍会失败，理应如此。

## [6.2.6] - 2026-07-31

### 新增

- **`uds update --apply`** — 精确应用 `uds update --plan` 打印的计划。

### 修复

- **`--plan` 提示你运行的命令实际上忽略了该计划。** 它此前打印“Run `uds update` to apply these changes”，但普通的 `uds update` 根本不会调用对齐器——它运行的是遗留路径，刷新现有标准，并为此报告成功。在一次升级中，它打印了 `✓ 69 standards updated`，而上述计划中的全部 8 处删除和 2 处创建都被跳过；事后这些文件依然留在磁盘上。没有任何报错，因此输出与实际应用了计划毫无区别。`--force` 也不是解决办法：它会以 `force: true` 重新计算，生成一个重写每个受管文件的更大计划。**如果你在阅读计划后一直在运行 `uds update`，那么该计划的删除和创建操作从未被应用**——请再次运行 `uds update --plan` 查看仍有哪些操作待处理。

## [6.2.5] - 2026-07-31

### 修复

- **`uds update` 的备份目录可能会被提交到你的仓库中。** `.uds-backup-<timestamp>/` 写入在项目旁边以便对齐操作可以回滚，而没有任何规则忽略它——导致 `git add -A` 将其一并卷入。在我们自己的仓库中发生过两次，其中一次将 360 个文件和 73,992 行代码带入了一个公开仓库。备份现在通过创建时在目录内写入包含 `*` 的 `.gitignore` 来实现自身忽略：`git status` 和 `git add -A` 不再能看到它，且**你的** `.gitignore` 不会被修改。早期版本的现有备份不会被追溯隐藏——请手动删除它们或自行添加忽略规则。

## [6.2.4] - 2026-07-31

### 修复

- **`uds update` 提议删除你自己编写的技能。** 溯源逻辑在 `manifest.skillHashes` 记录了某个技能下的任何文件时，就将该技能视作 UDS 自身所有的。这只有在哈希计算器损坏时才是安全的——当时它对 78 个已安装技能仅包含 2 个条目。在 6.2.2 中修复哈希计算器后，同一个映射被技能文件夹下的全部 137 个文件填满，包括手写的技能；随后每一个都落在了从 UDS 随附内容构建的期望状态之外，并在 diff 中被判定为需要删除的孤儿技能。一个项目的计划提议删除 18 个目录，其中 14 个是其自身的运维技能。溯源现在依赖单一信号：名称存在于 UDS 自身的 `skills/` 目录树中。对于 UDS 后来移除的技能，现在会发出警告而非直接删除——磁盘上没有任何信息能将它们与你自己的工作区分开来，而留下带有警告的过时目录，比起删除某人手写的文件来说是一种更好的失败处理方式。**如果你使用的是 6.2.2 或 6.2.3 且在 UDS 技能旁保留了你自己的技能，请在应用任何更改之前运行 `uds update --plan`。**

## [6.2.3] - 2026-07-31

### 修复

- **重新选择已安装的代理会追加重复的 manifest 条目。** 四个 manifest 写入程序使用 `[...existing, ...new]` 追加安装项，因此已记录的代理每次被重新选择时都会增加一个重复条目；一个项目的 manifest 中写着 `['claude-code', 'claude-code']`。安装器本身从未受到影响——`installSkillsToMultipleAgents` 会对其输入进行去重。损坏仅限于*记录*以及遍历它的每个消费者：`checkNewFeatures`、对齐器的扫描器与期望状态计算器各自对该代理遍历了两次。实际效果上看似无害，这正是它在五次升级中悄无声息累积的原因。这四个写入程序现在使用安装器早已依赖的同一个辅助函数。

## [6.2.2] - 2026-07-31

### 修复

- **`uds check` 仅对你极小部分的文件报告了技能完整性。** 在一个安装了 **345** 个技能文件的项目上，它打印了 `✓ All skill files intact (6 files)`。`scanDirectory` 使用 `fullPath.slice(basePath.length + 1)` 派生相对路径，这假定基础路径不带尾随分隔符——而三个代理的技能路径确实带有尾随分隔符（`.claude/skills/`、`.opencode/skill/`、`.cursor/skills/`）。因此每个条目都丢失了首字符（`ac-coverage` → `c-coverage`、`.manifest.json` → `manifest.json`）；`computeDirectoryHashes` 根据被破坏的名称重建绝对路径，因找不到文件而跳过了该条目。扫描了 115 个文件，仅对 2 个计算了哈希。过程中没有任何报错——目录存在、循环完成、函数返回了一个对象，检查针对 2% 的表面打印了绿色对勾。`manifest.skillHashes` 现在能正确填充；同一个项目现在报告 345。


## [6.2.1] - 2026-07-31

### 修复

- **`uds update --locale <x> --skills` 现在会记录它安装了哪种语言区域。** `manifest.skills.locale` 曾仅由 `init` 写入一次，其他路径均未写入——这是 6.2.0 不再信任 `skills.names` 的同一种设计上必然过时的形态。将项目的技能切换为本地化变体替换了磁盘上的每个文件，却对该字段置之不理。该字段在 6.2.0 中变成了关键支撑字段，6.2.0 的区域修复逻辑优先读取 `skills.locale`，回退时读取 `display_language`：当两者不一致时——例如一个项目的显示语言为英文，但其技能安装时指定了 `--locale zh-tw`——下一次对齐会悄悄将它们全部恢复为英文。这正是 6.2.0 所修复的缺陷，却从另一扇门重新溜了进来。全部五个技能安装路径现在都会记录它们所安装的语言区域。

## [6.2.0] - 2026-07-31

> **协调器（reconciler）删除了非其安装的内容，且随后报告成功。**`uds update --plan` 曾建议从一个采用者仓库中移除 86 个文件；其中 72 个是 UDS 随附且项目正在使用的技能、命令与选项文件。共计十二处缺陷，全属同一种形式：命名格式正确却始终无法匹配，因此没有任何报错，使得计划看起来极具权威性。如果你曾经查看 `--plan` 输出并纳闷它为何要删除你的工作成果——那并不是你的问题。

### 新增

- **`CLAUDE.md` / `AGENTS.md` 中的标准索引现在声明数量并指向 manifest**，而不是按名称列出每个标准（XSPEC-358 R1）。逐项列出的清单对每个项目造成约 2 KB 始终加载的上下文开销，且与 `.standards/manifest.json` 重复，而后者才是权威且永不过期的。该区块会在下一次 `uds update` 时自行重新生成；无需任何操作。**如果你的工具会解析该枚举列表，请改为读取 `manifest.standards`。**

### 修复

- **协调器不再删除你自己编写的技能。**`isUDSManaged` 对 skills 文件夹下的每个目录都返回 true，因此任何未由当前运行的 UDS 版本附带的内容都会被提议移除。某个采用者的计划曾列出十四个手写运维技能待删除。现在溯源依据建立自 UDS 自身的 `skills/` 目录树——这也涵盖了较旧 CLI 错误拷入的非技能同级项（`_shared`、`agents`、`ai`、`tools`、`workflows`），因此这些项仍可被清理——或来自记录的哈希值。其他任何内容都只会发出警告，而不会被移除。刻意承担的代价是：UDS 后来已废弃的四个技能现在会发出警告而不是被删除，因为磁盘上没有任何标记能将它们与你自己的工作成果区分开来。
- **`manifest.skills.names` 与 `commands.names` 不再被视为期望状态。**两者都只在 `init` 时写入一次，没有任何其他代码路径会写入。某个仓库的列表在九次提交与五次 UDS 升级中一直冻结在 32 个技能，而附带的技能集已增长到 55 个，导致 40 个可用技能在 diff 中被视作“不再处于期望状态”。期望集现在以当前运行的 UDS 版本所附带的为准，这正是 `uds update` 实际安装的内容。全部 18 处安装位置现在也保持列表的真实性。
- **Gemini CLI 命令不再被提议删除。**扫描器去除了硬编码的 `.md`；而 Gemini 将命令安装为 `.toml`，因此其键名保持为 `commit.toml`，永远无法匹配期望的键名 `commit`。全部 30 个命令在 diff 中都被视为孤立项。扩展名现在来自与写入这些文件的安装器所共享的代理配置。
- **UDS 不再提议删除其自身的安装记录。**由命令安装器写入的 `.manifest.json` 曾被计为多余的命令。
- **已选选项不再被提议删除。**`calculateOptions` 遍历 `manifest.options` 时如同将其键名当作标准 ID 处理，找不到名为 `workflow` 的标准便直接跳过——导致为每个项目生成的期望选项集均为空。某个仓库的计划曾提议删除其自身 manifest 列出的全部七个选项。manifest 键名到注册表类别的映射现在维护在安装器与计算器共同读取的单张表格中。
- **语言包与其他扩展不再被提议删除。**`manifest.extensions` 在协调器中根本没有分支逻辑，导致每个已安装的扩展——语言包、语言代码风格指南、框架模式——都落到了期望状态之外，而 manifest 却继续将其列为已安装。
- **协调不再以英文重新安装每个技能。**技能安装路径遗漏了命令路径所传递的区域设置参数，导致本地化技能被静默替换为其规范的英文变体，而 `skills.locale` 却依然记录着原本的语言。
- **成功的协调现在会记录其协调到的版本。**`upstream.version` 过去从未被推进，因此 `uds check` 仍报告项目落后，任何读取该字段的陈旧监控器也会持续发出告警。
- **重写的集成区块不再报告自身已被修改。**`migrate_block` 刷新了 `integrationBlockHashes`，但没有刷新 `fileHashes`，而后者才是文件完整性检查所比对的依据。
- **协调器与 `uds update` 现在生成相同的集成区块。**两个独立的构建器此前存在漂移：协调器的构建器完全遗漏了内容类别，导致协调项目时会静默丢弃其 commit-message 区块；无论 `options.output_language` 为何，它还将输出语言默认设为英文，并且在 manifest 按文件名存储时却按工具键名查找 `integrationConfigs`。
- **索引区块中正确统计了选项文件数量。**它们此前是根据 `manifest.standards` 进行统计的，而该字段的记录并不一致——某个仓库在安装了七个选项的情况下报告“0 options”。
- **`uds check` 不再对新索引区块产生不同步的假阳性报告。**此前有两处检查通过 grep 每个标准名称来断言已停用的枚举列表，因此在升级后它们报告 `5/70` 和 `0/7` 并建议运行 `uds update`——而这又会重新生成相同的区块。两处检查现在均根据 manifest 验证声明的数量，这还能捕获名称 grep 永远无法捕获的陈旧计数。
- **`manifest.integrations` 现在对两种数据形态均兼容读取。**它曾被一条路径写成工具键名，又被另一条路径写成文件路径；在统计的 21 个仓库中有 20 个存储的是文件路径，而协调器过去仅能识别工具键名——导致它在所有这些仓库中都提议从 `CLAUDE.md` / `AGENTS.md` 中剥离 UDS 区块。
- **`uds update --plan --integrations-only` 不再写入文件。**`--integrations-only` 分支此前在 `--plan` 检查之前运行。
- 在仓库根目录运行测试套件时，**`uds init` 不再向 UDS 源码仓库安装 husky**。

### 变更

- **发布关卡恢复度量。**`pre-release-check.sh` 曾直接调用裸 `tsx`，因此在 PATH 中没有它的 shell 上，三项检查会因缺少二进制文件而报告“✗ Failed”——与真正的检查发现无法区分；现在它会解析 `tsx` 或停止执行。此外，其自举（dogfooding）关卡在运行 `uds check` 时未加 `--force`，而在本仓库内会触发 DEC-044 的自采用防护而遭拒绝——自 5.15.1 加入以来，该关卡在每次发布时都会失败。


## [6.1.1] - 2026-07-18

> **`uds check` 默默地度量了错误的对象。** 其陈旧度检查将你的标准与 CLI 自身内置的副本进行比对，而不是与 npm 比较——因此陈旧的 CLI 会产生一条倒退且毫无意义的消息，根本无法说明你的标准已经落后——而且它还将该消息淹没在每个未更改文件各占一行的输出之下。

### 修复

- **`uds check` 现在将你已安装的标准与 npm 上的最新版本进行比对，而非 CLI 自带的内置副本**（XSPEC-342）。`displayAdoptionStatus` 过去拿 `manifest.upstream.version` 去比对*正在运行的 CLI 内部*自带的标准。当 CLI 本身过期时，该内置副本比 npm 更旧——因此检查会打印出倒退的 `⚠ Update available: 6.1.0 → 5.12.1`（提示你“更新”到更*旧*的版本），并且从结构上永远无法报告你的标准已落后。现在它会向 npm 查询最新版本；当你的标准落后时，提示信息会重新措辞为 **"Your installed standards are behind the latest release"**（你安装的标准已落后于最新版本），并给出完整的两步修复方案——`npm update -g universal-dev-standards` **然后再执行** `uds update`——因为仅更新 CLI 不会触碰你项目的 `.standards/`。`--offline` 会静默跳过比对，而不再回退到误导性的内置副本检查。

### 变更

- **`uds check` 不再列出每一个未更改的文件**（XSPEC-342）。它曾对每个受跟踪文件打印一行 `✓ … (unchanged)`——约占命令输出的 70%（实测从 121 行降至 41 行）——这淹没了真正需要阅读的信息，并导致输出体积极大，使得自动化调用者（pre-commit agent）将其截断。按文件列出“未更改”的清单已被移除；数量仍保留在单行的完整性摘要中，而被修改、缺失或未计算哈希的文件仍会逐一列出。

## [6.1.0] - 2026-07-17

> **两处同形失效，一处在标准中，一处在 CLI 中**：检查运行并返回，在未度量任何内容的情况下报告了成功。`verification-evidence` 增加了命名这一现象的层级；`uds init` 不再是其反例。

### 修复

- **`uds init` 不再覆盖现有的 `prepare` 脚本**（XSPEC-341）。自 2026-02-04 起，`uds init` 会在任何没有 `.husky/` 目录的 Node 项目中调用 `npx husky init`。该命令是用于*新*项目的一次性引导程序：它无条件地设置 `"prepare": "husky"`。如果你的项目已有 `prepare`——对于已发布的包，`prepare` 通常是构建步骤——**它就会被静默替换**，而 CLI 依然报告成功。`uds init` 现在采用串联而非覆盖（`"tsup"` → `"tsup && husky"`），打印它修改的每个 `package.json` 字段，且不再丢弃 husky 的 stderr。

  > **⚠️ 如果你曾在已有 `prepare` 脚本的项目上运行过 `uds init`，请立即检查。** 此修复仅保护未来的运行；它无法恢复已经被重写的 `package.json`。其症状表现为在你预期为构建命令的地方变成了 `"prepare": "husky"`——如果你的包在发布时依赖构建产物（`files: ["dist"]`，`main` 指向 `dist/`）且没有 `prepack`/`prepublishOnly`，你的下一次 `npm publish` 将发布未构建或陈旧的目录。请通过串联来恢复它：`"prepare": "<你的原始命令> && husky"`。

- **`uds init` 不再在 `.husky/pre-commit` 中植入 `npm test`**（XSPEC-341）。那行代码来自 husky 的 init 模板，而非 UDS——它给每次提交都加上了采用者从未选择开启的完整测试套件关卡。UDS 现在仅追加自身的 `npx uds check`，并追加到现有 hook 中，而非重写它们。

- **全新的 husky hook 以 v9 格式写入**（XSPEC-341）。后备 hook 模板此前仍输出 v8 的 `#!/usr/bin/env sh` + `. "$(dirname -- "$0")/_/husky.sh"` 前置引导，这在 husky v9 中已被弃用并在 v10 中被移除——而 `uds init` 安装的是 husky `^9`。这此前是潜在的问题（过去由 husky init 写入 hook）；移除 `husky init` 将后备方案提升为主路径，因此该问题得到了修正。

### 变更

- **`verification-evidence` 1.1.0 → 1.2.0 — 证据有效性**（XSPEC-340）。该标准此前将 `exit_code` 视为基准事实：`trust_rules` 规定 "`exit_code ≠ 0` → 验证失败"，`physical_spec.checks` 询问 "is `exit_code` 0 (success)?"，并且 VE-002 对任何非零值都会触发修复循环。**现在这三者均加上了限定条件**，因为验证命令完全可能运行、返回，却不代表任何意义：
  - **新增 `evidence_validity` 层与规则 VE-007 – VE-010**：`exit_code = 0` 仅对成功时返回 0 的工具才意味着成功（VE-007）；在证明查询工具已实际执行之前，“空 / 未找到 / 0”不代表不存在（VE-008）；存在性检查不得丢弃 stderr（VE-009）；流水线的退出码不属于任何单一阶段（VE-010）。
  - **新增 `non_evidence_claims`**："Done" / "It should work now" / "I changed the code" / "The tests should pass" / "The command returned 0"。
  - 与 `anti-hallucination` 不同，后者的禁令皆属于“不要断言你未曾检查过的事物”。而这是相反的失效模式——**确实进行了检查，但检查工具静默地失效了**。`core/verification-evidence.md` 列举了八个真实案例作为证据。
- **`verification-evidence` 人类可读文档跟进至 v1.1.0。** v1.1.0 的 `environment_layer` 工作（XSPEC-204）此前已合入全部三份 `.ai.yaml` 副本，但**未合入四份 `.md` 副本中的任何一份**——人类可读文档自 2026-05-13 以来对该标准的描述一直不正确。`core/*.md` 现已记录 `environment_layer`、Environment Layers 章节以及 VE-005 / VE-006。
- **`verification-evidence` 新增了此前仅存在于 zh-TW 翻译中的三个章节**：Non-Evidence Claims、Evidence Types、Related Standards。翻译此前比源码更为完整；这些章节现已在上游英文中补齐，并在两个语言区域中均有呈现。

## [6.0.0] - 2026-07-06

> ⚠️ **主版本发布。** 包含一项破坏性重命名，并移除了 8 个已弃用的机器可读标准以及 4 个已弃用的 CLI 命令（所有这些自 5.4.0 起均带有“在 6.0.0 中移除”的通知）。**参见 [v6 迁移指南](docs/MIGRATION-v6.md)**（[繁体中文](../zh-TW/docs/MIGRATION-v6.md) | [简体中文](docs/MIGRATION-v6.md)）。

### 变更 — 破坏性变更

- **`review` 命令/技能重命名为 `code-review`**（T1）。`/review` 调用方必须迁移到 `/code-review`；flow-id `review-flow` → `code-review-flow`。详见迁移指南 §1。

### 移除 — 破坏性变更（自 5.4.0 起排定）

- **移除了 8 个已弃用的 `.ai.yaml` 标准桩**（根据 XSPEC-086/095 / DEC-049，运行时已在 5.4.0 重定向至采用层）：`agent-communication-protocol`、`agent-dispatch`、`branch-completion`、`change-batching-standards`、`execution-history`、`pipeline-integration-standards`、`workflow-enforcement`、`workflow-state-protocol`。人类可读的 `core/*.md` 文档保留作为参考（现列入 registry-check 的 REFERENCE_ONLY 清单）；注册表条目已移除。详见迁移指南 §2。
- **移除了 4 个已弃用的 CLI 命令**：`uds start` / `uds mission:*`、`uds workflow:*`、`uds flow:*`、`uds sweep`（编排是采用层的职责；`/sweep` 技能替代了 `uds sweep`）。清理了引用已移除命令的失效 i18n 键以及 CLI 内陈旧的提示（`config` 下一步、`quickstart` 配方）。详见迁移指南 §3。

### 新增 — 新标准（覆盖率路线图批次 + 旗舰标准）

- **完成领域与生命周期标准**：产品 — `prd-standards`、`product-metrics`、`user-story-mapping`（XSPEC-069）；基础设施 — `container-image`、`secret-management`、`iac-design`（XSPEC-065）；SRE — `incident-response`、`slo-sli`、`runbook`（XSPEC-063）；数据工程 — `data-pipeline`、`schema-evolution`、`data-contract`（XSPEC-068）；合规 — `audit-trail`、`pii-classification`（XSPEC-066）。
- **旗舰标准**：`verification-oracle`（XSPEC-256）、`model-provenance`（XSPEC-255）、`resource-cost-boundary`（XSPEC-277）。
- **`user-journey-testing`** 作为一等公民标准发布（ai/standards + core + zh-TW + registry）。
- **`logging-standards` 强制事件目录**（XSPEC-234）。

### 新增 — UDS 第二阶段强化（T5–T16）

- 贯穿 `acceptance-criteria-traceability` 及应用实例的**规范 AC 注解**（T5）。
- **有据可循的量化阈值**（T8）：`browser-compatibility` 95%/90% 关卡、`checkin` 代码异味、`accessibility` 会话超时、`code-review` PR 大小/响应时间 + 批量例外、`project-context-memory` 7 天陈旧度、`developer-memory` 退休淘汰、`privacy` DPIA “大规模”。
- **失败处理章节**（T7）：`git-worktree` 瞬态故障重试、`reverse-engineering` 升级上报、`forward-derivation` 恢复。
- **跨职能交接**（T16）：`security-testing` 发现项整改生命周期、`pii-classification` 发现与交接契约。
- 作为规范真实源头的**术语表术语规范化**（T6）。
- **CLI 强化**（T11/T12）：Mission `FAILED` 终态 + 恢复防线、带回滚的事务性 `init`、针对 `hitl`/`run`/`release`/config 的输入验证。

### 新增 — 迁移与重构完整性系列

- `migration-assistant` 割接后数据对账（XSPEC-284 P0）、状态机与时间对等性（XSPEC-287）；`full-coverage-testing` 迁移错误路径完整性（XSPEC-288）；`performance-standards` 迁移非功能对等性（XSPEC-286）。

### 新增 — 工具与工作流

- **适用于 `/brainstorm` v4 的 BQS v1 质量契约**（XSPEC-296）。
- `ci-cd-assistant` 技能中的 **CI 作业编排模式**——触发分离、共享资源串行化、变更检测关卡、建议性与门禁性对比、`npm ci` `EUSAGE` 排错（UDS #126 / XSPEC-300）。
- `pipeline-security-gates` 中的**部署前证明验证关卡**。
- 发布流程中的**发布前 issue/PR 分流关卡**（XSPEC-265）。
- `release verify` 现在使用记录的 manifest 校验和。
- `/journey-test` 与 `/skill-builder` 注册为正式命令。
- 可选的模型分级注解（R6，XSPEC-270 工作包 A）。
- `sync-standard` 四层同步工具；第 2 阶段内容覆盖率审计元数据。

### 新增 — 源自故障的反漂移与可测试性

- **`refactoring-standards` 语义重复与复制漂移**（#142）：指明了复制漂移（Copy-Drift）反模式（在多处重新实现领域事实，或存储派生聚合但未强制绑定到其源头——对文本重复指标隐形）以及单一真实源泉 / 派生而非复制（Derive-Don't-Duplicate）整改方案（每个事实一个单元，派生优于存储，在单一卡口重新计算存储的聚合，用黄金测试 + 架构测试锁定），以及迁移意向分歧注册表（Intentional-Divergence Registry）。
- **`mock-boundary` 可注入后台执行**（#143）：将进程内的发后不理（fire-and-forget）任务（`Task.Run`、未 await 的 Promise、`setTimeout`、goroutine、executor）视为与时钟类似的可注入接缝——生产环境保持真实的发后不理，测试调度器则内联运行并跟踪任务以实现确定性完成；增加了轮询/休眠以等待后台结果（Poll/Sleep-for-Background-Result）反模式以及禁止轮询/休眠规则。

### 变更

- **API 版本控制与废弃整合为单一真实源泉**——生产者端的 API 版本控制内容归并入 `api-design-standards`；调和了不一致的废弃时间线（XSPEC-298 R8）。
- **部署版本标识（Deployment Version Identity）**章节加入到 `versioning` 中，并附带构建元数据鉴别器警告（XSPEC-298 R1）。
- **`versioning` 构建标识与多语言版本控制**（XSPEC-298 R2/R3）：针对 .NET/JVM/多语言项目的基于 git-height 的版本控制（MinVer / Nerdbank.GitVersioning / GitVersion）；构建标识提升为强制要求——部署的服务必须通过 `/version`|`/health` 暴露 `version + commit sha + build time`，且阶段 5 验证必须断言 sha 与部署的制品匹配（#138）。

### 弃用

- **6 个工作流技能**标记为 `reference`，附带可见的弃用通知；已弃用的运行时命令标记有结构化的 `@superseded-by` 指针（XSPEC-291 §4）。

### 修复

- **`uds audit` 误报**：`options/` 文件被报告缺失（健康检查现已递归进入子目录）、CP950 控制台乱码、非 TTY 崩溃（#115）；未使用的标准检测现在按规范 ID 匹配而非按文件名匹配（#125）。
- **恢复了 Bundle ⇄ 源码对等性**——将 25 个标准同步至 `.standards/` 自采用树中。
- 大量文档/i18n 完整性修复：陈旧的标准/技能/命令计数、损坏的区域设置交叉链接、命令/技能索引重新生成、锚点别名（anchor-slugger）与表格对等路径。

## [5.17.0] - 2026-06-08

### 新增 — 可执行 SDD 一致性与 AC 格式扩展（XSPEC-262/263/264）

- **`/sdd analyze` — 跨产物一致性（XSPEC-262，`scripts/sdd-analyze.ts`）**：验收条件可追踪性 + 正向推导演变单主干的可执行面向。7 项信号——孤立测试 / 未覆盖 / 未实现（not_implemented）/ 跨规格 AC 冲突 / 孤立 .feature / 无场景 AC / 用户指南↔E2E 漂移（`T-NNN`，满足 XSPEC-260 R5）。`npm run sdd:analyze [-- --userguide docs --json]`；12 个 bats 测试。`/sdd` 技能记录了该操作与 ac-coverage 的分工。
- **EARS 记号法作为可选 AC 格式（XSPEC-263）**：`spec-driven-development` v2.2.0→v2.3.0 新增带有 5 个 EARS 模板的 AC Formats 章节；`acceptance-criteria.schema.yaml` 增加了可选的 `ears` 字段（`given/when/then` 从必填放宽，向后兼容）。GWT 仍为默认与首选。
- **结构化缺陷修复规格模板（XSPEC-264）**：`sdd-guide.md` 将缺陷决策树分为微不足道型与易回归型，并新增轻量级 `<BUG-ID>.bugfix.md` 模板（当前/预期/**未更改**行为 + 根因 + 作为 AC 的回归测试）。

> 注意：针对缺陷修复模板的 `sdd-guide` 语言包（zh-TW/zh-CN）同步推迟至 XSPEC-248 特性评审循环（此前已存在的语言包漂移）。

## [5.16.0] - 2026-06-08

### 新增 — 测试推导链延伸至用户指南（XSPEC-260）

- **`core/forward-derivation-standards.md`**：新增 `## Terminal Projection: User Guide` 章节 + `### Single-Spine Principle`。将推导流水线跨越测试延伸至用户指南——用户指南是旅程/E2E 测试通过机器验证的同一条 AC 主干的最终投影。定义了共享的 `T-NNN` 编号（用户指南步骤的 `T-NNN` 必须等于真实的旅程/E2E 测试 ID）、带保守默认值的面向用户 AC 过滤器，以及单主干原则：测试/文档源是一条 AC 主干的 N×1 投影，而不是 N×N 的并行交叉检查；制造并行的编号方案属于违规行为（VIOLATION）。
- **`ai/standards/forward-derivation-standards.ai.yaml`**：镜像 `terminal_projection` 区块 + 3 条规则（`single-spine-no-parallel-numbering`、`user-guide-shared-tnnn`、`user-facing-ac-conservative-default`）。
- **`core/acceptance-criteria-traceability.md`**：新增 `## User-Documentation Coverage` 维度——跟踪面向用户的 AC 是否记录在用户指南中。包含面向用户 AC 过滤器（保守默认值：有疑问时即视为面向用户）、复用的 ✅/⚠️/❌ 状态，以及排除非面向用户和 `not_implemented` AC 的覆盖率公式。
- **`ai/standards/acceptance-criteria-traceability.ai.yaml`**：镜像 `user_doc_coverage` 区块 + 2 条规则（`user-doc-user-facing-only`、`user-doc-shared-tnnn`）。
- **zh-TW / zh-CN 语言区域**：两个标准的两个新章节均已完全翻译。

## [5.15.0] - 2026-05-28

### 新增 — i18n 分层语言策略（XSPEC-239）

- **`core/ai-instruction-standards.md` v1.0.0 → v1.1.0**：新增 `## Internationalization (i18n)` 章节，为 SKILL.md 与根级 AI 指令文件定义 L1/L2/L3/L4 分层语言策略。**范围扩展**自仅限根级别（`CLAUDE.md`、`.cursorrules`……）扩大到涵盖技能级文件（`SKILL.md`）。定义了规范/区域语言文件结构、职责边界、防嵌合规则以及采用者安装模型。
- **`ai/standards/ai-instruction-standards.ai.yaml` v1.0.0 → v1.1.0**：镜像 `i18n:` 区块 + 4 条新规则（`i18n-canonical-english-only`、`i18n-locale-must-match-language`、`i18n-l3-template-language-controls-output`、`i18n-no-manual-canonical-edits-by-adopters`）。
- **10 个缺失的 zh-TW 区域技能变体**：`ac-coverage`、`deploy-assistant`、`dev-methodology`、`journey-test-assistant`、`orchestrate`、`plan`、`push`、`skill-builder`、`spec-derivation`、`sweep`。zh-TW 技能覆盖率现达 54/54（100%）。
- **`cli/src/lint/i18n.js` + `uds check --i18n` 命令**：强制执行 5 条防嵌合规则的 Lint 检查（`canonical:description-must-be-ascii` 错误、`locale:description-must-match-language` 错误、`locale:must-have-source-frontmatter` 错误、`canonical:l3-language-consistency` 警告、`translation-drift-warn` 警告）。出错时退出码为 1。CI 采用 `--json` 模式。
- **`scripts/generate-locale-coverage.mjs` + 自动生成的 `locales/COVERAGE.md`**：每个区域设置下针对每个技能/标准的覆盖率矩阵 + 漂移警告。npm 脚本 `docs:locale-coverage`。
- **支持 `UDS_LOCALE` 环境变量**：在 `cli/src/i18n/messages.js detectLanguage()` 与 `cli/src/commands/update.js resolveLocale()` 中读取。接受 `zh-tw`、`zh_tw`、`zh-cn`、`zh_cn`、`en`（不区分大小写）。
- **支持 `.uds/install.yaml` 的 `locale:` 字段**：`cli/src/utils/config-manager.js readInstallYaml()` 读取可选的 `locale:`，便于采用者一次性声明偏好的语言区域，无需每次都传入 `--locale`。
- **语言区域回退警告（WARN）**：当 `installSingleSkill` 从缺失的区域变体回退到英文时，安装结束处会显示单块黄色 WARN 区块列出受影响的技能。取代了此前静默回退的做法。
- **i18n 消息**：en/zh-tw/zh-cn 区域新增键 `localeFallbackTitle` / `localeFallbackHint`。

### 变更

- **CLI 语言区域解析优先级**（`cli/src/commands/update.js resolveLocale()`）：现为 6 层——`--locale` CLI 标志 > `.uds/install.yaml` `locale:` > `UDS_LOCALE` 环境变量 > manifest > `.standards/` 检测 > `'en'`。在 `init` 与 `update` 间保持一致。
- **`core/ai-instruction-standards.md` 的翻译**：zh-TW 与 zh-CN 语言区域同步至 v1.1.0，包含完整的本地化 i18n 章节。（按 XSPEC-239 O-2，zh-CN 章节标记为待评审——翻译质量策略尚未解决。）

### 修复

- **修复了 29 个规范 SKILL.md 描述嵌合体**（XSPEC-239 阶段 1B）：移除了 `adr-assistant`、`ai-collaboration-standards`、`ai-friendly-architecture`、`ai-instruction-standards`、`api-design-assistant`、`audit-assistant`、`ci-cd-assistant`、`contract-test-assistant`、`database-assistant`、`deploy-assistant`、`documentation-guide`、`error-code-guide`、`git-workflow-guide`、`incident-response-assistant`、`journey-test-assistant`、`logging-guide`、`observability-assistant`、`orchestrate`、`plan`、`pr-automation-assistant`、`project-structure-guide`、`push`、`retrospective-assistant`、`runbook-assistant`、`security-assistant`、`security-scan-assistant`、`slo-assistant`、`sweep`、`testing-guide` 的 `description:` frontmatter 中的 CJK 内容。翻译改为存放在 `locales/{lang}/skills/` 中。依赖 `.claude/skills/` 中中文描述的采用者应重新运行 `uds update --locale zh-TW`（或 `--locale zh-CN`）。
- **`skills/reverse-engineer/SKILL.md` 描述破折号（U+2014）**替换为 ASCII 连字符——按新的 lint 规则，规范描述必须纯 ASCII。
- **补全了 `locales/zh-TW/core/self-review-protocol.md` 缺失的 YAML frontmatter**（`source:`、`source_version:`、`translation_version:`、`last_synced:`、`status:`），以与其他 zh-TW 核心变体一致。

### 采用者迁移说明

本版本包含对使用 `--locale zh-TW` 或 `--locale zh-CN` 安装 UDS（或检测到 `LANG=zh_*`）的项目可能用户可见的变更：

- 升级后**重新运行 `uds update`**。此前描述包含中文的技能，现在在规范版本中将采用英文 `description:`，而在区域变体中具有完整的中文 `description:` + 正文。你的 `.claude/skills/{name}/SKILL.md` 将自动从区域变体重新安装。
- **手动编辑过规范**文件（在 `.claude/skills/` 中添加了中文描述）的采用者应将其自定义项调和到区域变体或叠加层（overlay）中——参见 `core/ai-instruction-standards.md` 中的 `XSPEC-239` 迁移章节。
- 新的 `uds check --i18n` lint 可以验证你的项目是否干净：错误会造成阻断，警告（例如 `translation-drift-warn`）会呈现在仪表板中，但默认不会使 CI 失败。

## [5.14.0] - 2026-05-27

### 新增
- **`.github/RELEASE-FLOW-TODOS.md`**：用于在自举验证期间浮现的发布流程改进项的持久跟踪文件。包含 TODO-001 ~ TODO-005（bump-version.mjs 中的自动 docs:generate-index、FB/Threads 提示词捕获习惯、下次 bootstrap 时的 `_template/` 验证、阶段 1.5 社交媒体资产硬性关卡、阶段 2 Meta API 自动发布工作流）。维护者编辑此文件以添加新项或解决已有项。

### 变更
- **`.github/workflows/release-reminder.yml`**：现在读取 `.github/RELEASE-FLOW-TODOS.md`，并在每周一 09:00 UTC 的提醒 issue 正文中展示未完成的 TODO。改进项将在各个发布周期中持续累积，而不会湮没在提交历史中。

### 修复
- **`cli/src/commands/check.js` — AI 工具集成检查中标准缺失的误报**：即使实际的 `.ai.yaml` 文件（`error-codes.ai.yaml`、`logging.ai.yaml`）在 `CLAUDE.md` 中被正确引用，`uds check` 仍错误报告 `error-code-standards` 和 `logging-standards` 缺失。根因：`migrateStandardsPathsToIds()` 将 manifest 路径条目转换为注册表 ID（例如 `ai/standards/error-codes.ai.yaml` → `error-code-standards`），但集成文件是使用实际文件名生成的。该检查现在从注册表构建 `id → aiFilename` 查找表，并在集成文件内容中未直接找到 ID 时回退到实际文件名。

## [5.13.3] - 2026-05-26

### 修复
- **`scripts/pre-release-check.sh` 步骤 22.5 逻辑升级**：原始实现（v5.13.0）仅接受通过条件 A（`[Unreleased]` 非空）。在 CHANGELOG 晋升（`[Unreleased]` → `[X.Y.Z]`）之后，该章节被正确清空，但原始检查会错误报失败并需要 `--skip-changelog` 变通绕过。新逻辑增加了**通过条件 B（晋升后）**：当最新带日期的章节与今天匹配且包含实质性条目时也判定通过。还增加了**失败条件 D**：今天的日期章节存在但仅有模板。在发布 v5.13.0 时暴露了该问题——由于该关卡当时已处于场景 B，关卡自身的 pre-release-check 回退到了 `--skip-changelog`。

### 附注（翻译补全）
- `locales/zh-TW/CHANGELOG.md` 与 `locales/zh-CN/CHANGELOG.md` 补全了在 v5.13.1 热修复提交期间遗漏的 [5.13.1] 章节（Edit 工具遇到工具状态问题阻碍了这两个翻译）。

## [5.13.2] - 2026-05-26

### 修复
- **`.github/workflows/publish.yml` 纯净环境安装测试（XSPEC-221 热修复 v2）**：将 `uds init --dry-run`（CLI 中未实现的选项）替换为 `uds init --help`，作为对 init 命令接线进行安全非破坏性验证的手段。在 v5.13.1 发布失败并提示 `error: unknown option '--dry-run'` 时暴露——v5.13.1 修复正确解析了依赖，但下一步验证步骤依赖了一个不存在的标志。这是该关卡发现的第二个自身 bug；该关卡现已得到端到端验证。

## [5.13.1] - 2026-05-26 [发布失败 — 参见 5.13.2]

### 修复
- **`.github/workflows/publish.yml` 纯净环境安装测试（XSPEC-221 热修复）**：在 alpine clean-room 作业中的 `npm install -g .` 之前增加了 `npm ci --ignore-scripts` 步骤。在 v5.13.0 发布失败并提示 `ERR_MODULE_NOT_FOUND: Cannot find package 'commander'` 时暴露——`npm install -g .` 在纯净环境中不会安装传递依赖项，要求在全局软链接之前依赖已存在。该关卡（XSPEC-221）正确阻断了损坏的发布；这修复了关卡自身的命令执行序列。

## [5.13.0] - 2026-05-26

### 新增
- **`core/self-review-protocol.md` v1.0.0**（与 `ai/standards/self-review-protocol.ai.yaml`、`locales/zh-TW/core/self-review-protocol.md` 以及 `cli/standards-registry.json` 条目配对）：新标准，强制要求在提交前对大型 Markdown 编辑（>50 行）进行自审。定义了**内部交叉引用不一致的 6 大类别**——图表/步骤不匹配、更新日志（changelog）引用错误、数量漂移、陈旧模板、错误的工具引用、占位符/规则不一致——并提供了具体的检查方法。区别于代码审查（涵盖代码）、内容自我审计（涵盖完整性）和同行评审（涵盖设计）。源自下游技能编辑中观察到的 `v1.X→v1.X.1` 补丁循环。
- **`scripts/pre-release-check.sh` 步骤 22.5 — CHANGELOG 硬闸门**：当 `CHANGELOG.md [Unreleased]` 部分为空时拒绝发布。新的 `--skip-changelog` 标志提供了一个安全阀（预期在发布提交信息中说明理由）。插入在流程闸门（步骤 22）和 dogfooding 闸门（步骤 23）之间。
- **`scripts/pre-commit.mjs` 步骤 1.5 — CHANGELOG 漂移建议**：当暂存了实质性变更（`core/`、`ai/standards/`、`cli/src`、`cli/bin`、`scripts/`、`skills/*/SKILL.md`、`.github/workflows/`）且没有配对的 `CHANGELOG.md` 更新时发出警告（非阻塞，退出码 0）。向用户指出发布时的硬闸门，以便他们理解忽略该警告的后果。
- **`.github/workflows/release-reminder.yml`**：每周一 09:00 UTC 的 cron 定时任务，在 `CHANGELOG.md [Unreleased]` 非空**且**距离最新 semver 标签已过去 ≥7 天时打开（或更新）带标签的 issue。当条件不再满足时自动关闭任何开启的提醒。根据条目内容推荐语义化版本递增启发规则（major/minor/patch）。
- **`scripts/check-skill-structural-integrity.ts`**（XSPEC-223，P1 发布闸门）：验证技能 `SKILL.md` 的结构完整性（frontmatter 字段、必需章节）。接入 `pre-release-check.sh` 步骤 18.5；若有任何技能存在结构缺陷则阻断发布。
- **`packaging-standards`**（XSPEC-233 / #112）：新增 API 迁移契约测试 fixture 章节——定义用于跨版本测试 API 迁移兼容性的 fixture 格式。
- **净室安装闸门**（XSPEC-221）位于 `.github/workflows/publish.yml`：Alpine Node 20 容器从 `cli/` 运行 `npm install -g .`，验证 `uds --version` / `uds list` / `uds init --dry-run`。若有任何步骤失败则阻断 `publish` 作业。
- **Dogfooding 闸门**（XSPEC-222）— `scripts/pre-release-check.sh` 步骤 23：在继续发布之前，新的 CLI 构建必须针对自身通过 `uds check`。

### 变更
- **`core/deployment-standards.md`**（XSPEC-231 / #110 + #113）：防御性部署配对——强制归档完整性验证 + 解压-验证-再删除模式。消除了“损坏的归档在验证前被删除”这类故障。
- **`core/logging-standards.md`**（XSPEC-232 / #111）：强制性双触发日志轮转策略——必须同时配置大小**与**时间触发器（非“或”关系）。消除了“因从未达到大小阈值而从未触发轮转”的故障模式。
- **`skills/contract-test-assistant/SKILL.md`** 和 **`skills/runbook-assistant/SKILL.md`**：支持 XSPEC-231/232/233 模式的次要更新。
- **依赖项（`cli/`）**：`lint-staged` 17.0.3→17.0.4（#107）、`@inquirer/prompts` 8.4.2→8.4.3（#106）、`eslint` 10.3.0→10.4.0（#105）、`@vitest/coverage-v8` 4.1.5→4.1.6（#103）、`vitest` 4.1.5→4.1.6（#101）、`@commitlint/cli` 21.0.0→21.0.1（#104）、`tsx` 4.21.0→4.22.3（#109）。
- **CI actions**：`actions/checkout` 4→6（#98）、`actions/setup-node` 4→6（#99）。

## [5.12.1] - 2026-05-19

### 变更
- **`full-coverage-testing.ai.yaml`**（`no-tautology-assertions` 规则，XSPEC-220）：生成未实现测试骨架的 AI 智能体必须使用 `it.todo("AC-XXX: ...")` 代替 `it() { expect(true).toBe(true) }`。任何仅包含重言式断言的 `it()` 回调均属于 `[ANTI-FAKE-001]` 违规，无论是由人类还是 AI 智能体生成。
- **`test-governance.ai.yaml`**（`gate-wiring-required` 规则，XSPEC-220）：质量检测脚本（anti-fake、stub-check、coverage ratchet）必须出现在至少一个 CI 工作流作业以及至少一个本地钩子中。存在于 `scripts/` 中但从未被 CI 调用的脚本等同于不存在，并构成治理缺口。
- **`acceptance-criteria-traceability.ai.yaml`**（`not_implemented` 状态，XSPEC-220）：扩展定义以显式将 `it.todo()` 占位符映射到 `not_implemented 🚫` 状态（排除在覆盖率分母之外），并配有区分 `not_implemented`（刻意的占位符）与 `uncovered`（遗漏）的决策树。

## [5.12.0] - 2026-05-16

### 新增
- **`docs/user/` 用户文档中心**（XSPEC-211）：镜像 VibeOps 惯例的新双轨文档结构。包含 8 个服务于首次使用者和日常用户的文件：
  - `docs/user/GETTING-STARTED.md` — 5 分钟端到端演练（安装 → `uds init` → `/sdd` → `/commit`）
  - `docs/user/SKILLS-INDEX.md` — 全部 54 个技能的自动生成索引，按层级（DEC-061）和类别组织，外加“何时使用”速查
  - `docs/user/COMMANDS-INDEX.md` — 全部 48 个斜杠命令的自动生成按字母排序列表及技能映射
  - `docs/user/FAQ.md` — 涵盖安装、技能、SDD、更新和架构的 14 个问题
  - `docs/user/GLOSSARY.md` — UDS、SDD、ATDD、BDD、TDD、XSPEC、Dual-Layer、Skill Tier、Standard、Activity、Bundle/Source、ADR、AC 的定义
  - `docs/user/TROUBLESHOOTING.md` — 问题→解决方案指南（安装、技能未显示、非 Claude-Code 工具、更新失败），并入了 `SKILL-FALLBACK-GUIDE.md`
  - `docs/user/README.md` — 面向三类受众（新用户 / 日常用户 / 维护者）的文档中心，附带文档地图
  - `docs/user/CHEATSHEET.md` — 从 `docs/` 移动而来（内容无变化）
- **`scripts/generate-skill-index.ts`** — 从 `uds-manifest.json` + `skills/*/SKILL.md` 的 frontmatter 生成 `SKILLS-INDEX.md` 和 `COMMANDS-INDEX.md`。使用 SKILL.md 的 `name` 字段作为权威命令源。运行方式：`npm run docs:generate-index`
- **`scripts/check-skill-index.ts`** — pre-commit 守卫；重新生成文档并比对差异；若陈旧则以非零退出码退出。运行方式：`npm run docs:check-index`
- **`scripts/setup-hooks.sh`** — 安装 `.git/hooks/pre-commit` 以便在每次提交时调用 `docs:check-index`
- **`.github/workflows/docs-check.yml`** — CI 作业，在 PR 中修改了 `uds-manifest.json`、`skills/*/SKILL.md` 或 `cli/standards-registry.json` 时，验证 `SKILLS-INDEX.md` 与 `COMMANDS-INDEX.md` 是否同步
- **`docs/reference/FEATURE-REFERENCE.md`** — `FEATURE-REFERENCE.md` 从 `docs/` 重新定位到 `docs/reference/`（自动生成，内容无变化）
- **`docs/archive/USER-MANUAL-2026-03-24.md`** — 已弃用用户手册的归档副本

### 变更
- **`package.json`**：新增 `docs:generate-index`（`tsx scripts/generate-skill-index.ts`）与 `docs:check-index`（`tsx scripts/check-skill-index.ts`）脚本
- **`scripts/generate-usage-docs.mjs`**：更新英文输出路径——`FEATURE-REFERENCE.md` 现在写入 `docs/reference/`，`CHEATSHEET.md` 现在写入 `docs/user/`
- **`skills/README.md`**：新增横幅，指向 `docs/user/SKILLS-INDEX.md` 和 `COMMANDS-INDEX.md` 作为主要索引技能参考
- **`README.md`**：在“快速入门（Quick Start）”章节中新增“📚 Documentation”表格，列出全部 7 个 `docs/user/` 文件及直接链接
- **`docs/USER-MANUAL.md`**：新增弃用横幅，引导用户前往 `docs/user/README.md`；归档副本保存在 `docs/archive/USER-MANUAL-2026-03-24.md`

### 移除
- **`docs/SKILL-FALLBACK-GUIDE.md`**：内容合并入 `docs/user/TROUBLESHOOTING.md`。非 Claude-Code 后备策略与技能→核心标准映射表保留在“Using UDS Without Claude Code”章节下

## [5.11.0] - 2026-05-14

### 新增
- **`spec-driven-development`** SPEC Type Agent 变体：`acceptance-criteria-traceability.ai.yaml` 和 SDD 模板增加了 `spec-type: feature | agent | infrastructure` 字段，以及一个包含五个章节的 Agent SPEC 模板（能力范围 / 决策边界 / 可观测性 / 故障模式 / 跨智能体不变量）。使得 Builder/QA/Planner 风格的 SPEC 能够与功能 SPEC 分开追踪，并通过新增的 `agent-id` 字段链接回特定智能体。（XSPEC-205）
- **`reverse-engineering-standards`** 迁移清单双向性：新的路由驱动发现方法（现已禁止使用文件系统通配符作为起点）、目标→来源双向扫描，以及针对没有对应源构件的发现项的 `[GAP]` 标记协议。与 `testing.ai.yaml` 中新增的 `migration_testing` 章节配合，要求通过 CI 闸门强制执行 3 步 schema 对等模式。关闭 UDS Issue #96 与 #97。（XSPEC-206）

### 修复
- **schema 3.x manifest 的 `uds update` 误报 "CLAUDE.md.md: 無法判斷來源" 还原失败**（`cli/src/utils/integration-generator.js`、`cli/src/commands/update.js`）：Schema 3.x 的 manifest 在 `manifest.integrations` 中存储的是**文件名**（例如 `"CLAUDE.md"`）而非工具键名。`integration-generator.js:56` 处的 `getToolFileName` 后备逻辑无条件追加了 `".md"`，导致 `getToolFilePath("CLAUDE.md")` 返回了 `"CLAUDE.md.md"`，被报告为缺失文件并还原失败（`getSourcePathFromRelative` 对该合成路径没有映射）。提交 `79532b3`（5.10.0）修复了反向情况（工具名输入），但遗漏了这种文件名变体。修复：从 `SUPPORTED_AI_TOOLS` 预先计算 `KNOWN_TOOL_FILES`，当输入为已知集成文件名或已带有已知文件扩展名（`.md`/`.yaml`/`.yml`/`.json`）时直接短路返回。在 `integration-generator.test.js` 中新增 5 个回归测试。（XSPEC-208 BUG-208-01）
- **`uds update` / `uds check` 误报 "Integration UDS Block Integrity: GEMINI.md/AGENTS.md missing" 警告**（`cli/src/commands/update.js`、`cli/src/i18n/messages.js`）：`manifest.integrationBlockHashes` 在每次安装时都会累积条目但从未修剪。当 `manifest.aiTools` 缩减时（例如 `["claude-code","gemini-cli"]` → `["claude-code"]`），GEMINI.md 的哈希仍然保留，且 `check.js:1491 checkIntegrationBlocksIntegrity` 错误地将该文件报告为缺失。修复：在集成重新生成步骤之后，从 `manifest.aiTools`（声明的配置，而非在短暂写入失败时会过度修剪的 `results.integrations`）推导出预期的文件集合，并修剪任何孤立的哈希。被修剪的文件名通过新的 i18n 键 `prunedOrphanedBlockHashes`（en / zh-TW / zh-CN）报告。在 `update.test.js` 中新增 3 个回归测试。在 machine-setup 的 `uds update` 5.1.0-beta.4 → 5.10.0 上复现；验证已在 5.10.0 → 5.11.0 中修复。（XSPEC-208 BUG-208-02）

## [5.10.0] - 2026-05-13

### 新增
- **`multi-environment-e2e-testing`**（`ai/standards/multi-environment-e2e-testing.ai.yaml`）：跨多个部署目标的 E2E 测试配置新标准。核心原则：“运行命令本身就是文档。”涵盖：BASE_URL 固化在测试框架配置中（而非 .env）；每个环境的自检运行脚本；提交至代码仓库的环境能力矩阵；CI 闸门映射；凭据处理规则。关闭 UDS Issue #95。（XSPEC-204）

### 变更
- **`mock-boundary`**（v1.0.0 → v1.1.0）：新增 Level 1 / Level 2 mock 层级区分。Level 1 = 受 STUB 规则管辖的代码级 mock。Level 2 = 受环境分层规则管辖的基础设施级 stub 服务器（WireMock、MockSoap），不受 STUB 部署阻断限制。新增 `external_dependency_testability_matrix` 模板（每个服务 × 环境标记 ✅/⚠️/❌）。新增规则：`level-2-stub-server-rules`、`no-stub-server-in-prd`。关闭 UDS Issue #94 盲点 2。（XSPEC-204）
- **`deployment-standards`**（v1.0.0 → v1.1.0）：新增 `environment_stratification_matrix` 区块——有外部依赖的项目必须在测试规划阶段构建此矩阵；模板包含 10-流程 × 3-环境网格。新增 `stub_server_cicd_rules` 区块——方案 A（sidecar 部署）/ 方案 B（PRD 冒烟推迟）；生产环境构件排除规则；PRD 禁止规则；禁止状态定义。关闭 UDS Issue #94 盲点 1 与 3。（XSPEC-204）
- **`verification-evidence`**（v1.0.0 → v1.1.0）：新增铁律（环境）：对于具有外部依赖的 AC，证据必须指定 `environment_layer`。在证据格式中新增 `environment_layer` 字段（具有外部服务依赖的功能必需）。新增规则 VE-005、VE-006。（XSPEC-204）
- **`test-completeness-dimensions`**（v1.2.0 → v1.3.0）：新增维度 11：**环境可验证性**——对于具有外部服务依赖的 AC，记录最低可验证环境层（local/UAT/PRD），追踪仅 PRD 项目，要求冒烟测试计划。更新了功能类型映射：External Integration → [1,3,7,11]；新类型 External-Dependent Workflow → [1,3,4,5,9,10,11]。更新了 use-checklist 规则。（XSPEC-204）

### 修复
- **集成工具名称的 `uds update` 误报“文件缺失”还原**：当 `manifest.integrations` 包含 AI 工具标识符（`"claude-code"`、`"opencode"`）时，更新命令直接将它们作为文件路径推入 `allTrackedFiles`，而不是通过 `getToolFilePath()` 解析它们。这导致 `existsSync("claude-code")` 返回 false，触发了误报的“⚠ N file(s) still missing after update”警告以及“✗ claude-code: 無法判斷來源”还原失败。修复：先通过 `getToolFilePath(int)` 解析每个条目；跳过无法映射到真实路径的条目。在 `uds update` 5.7.2 → 5.8.0 上复现。

## [5.9.0] - 2026-05-13

### 新增
- **`feature-discovery-standards`**（`ai/standards/feature-discovery-standards.ai.yaml`、`core/feature-discovery-standards.md`）：新标准，定义了用于老旧系统中详尽功能发现的语言无关方法论。确立了**确定性优先原则**（在发现阶段禁止 AI 仅通过推论生成功能列表）。定义了针对 7 种软件形态（web/cli/gui/daemon/library/mobile/embedded）的软件形态分类学，附带检测信号和提取工具。定义了五大静态基础（入口点 → 调用图 → 字符串挖掘 → 资源文件 → 外部接口）、动态观察协议（Linux/macOS/Windows）、人类观察协议（置信度：0.7 规则）以及跨层验证矩阵模板。管线位置：Discovery → feature-manifest → behavior-snapshot。（XSPEC-202）
- **`ai/language-packs/language-pack-php-to-csharp.ai.yaml`**：首个针对 PHP→C#（ASP.NET Core）迁移风险的 UDS 语言包。包含 7 个风险标签（SESSION_HANDLING、ORM_DIFFERENCES、TIMEZONE_HANDLING、FILE_UPLOAD_PATH、REGEX_DIFFERENCES、ARRAY_FUNCTIONS、EXCEPTION_HIERARCHY）及其详细描述。（XSPEC-203）
- **`ai/language-packs/README.md`**：语言包命名规范、使用指南与贡献说明。（XSPEC-203）

### 变更
- **`feature-manifest-standard`**（v1.0.0 → v1.1.0）：重构 `migration_risks` 为语言无关架构。移除了 `php_to_csharp` 硬编码区块（迁移至 `ai/language-packs/`）。新增了 `language_packs` 扩展点（`extension_point: true`）。新增 3 个通用风险标签：CONCURRENCY_MODEL、PACKAGE_ECOSYSTEM、TYPE_SYSTEM。（XSPEC-203）
- **`behavior-snapshot`**（v1.0.0 → v1.1.0）：从仅限 HTTP 扩展到多模态。新增 `adapter` 字段（默认：`http`，向后兼容）。新增包含 4 个具体 schema 的 `adapters` 章节：`http` / `cli` / `file` / `event`。新增 `adapter-selection` 和 `backward-compatibility` 规则。没有 `adapter` 字段的既有 HTTP 快照依然有效。（XSPEC-203）

## [5.8.0] - 2026-05-12

### 新增
- **`feature-manifest-standard`**（`ai/standards/feature-manifest-standard.ai.yaml`、`core/feature-manifest-standard.md`）：新标准，定义了用于迁移/重构项目的 FM-NNN 机器可读功能清单格式。包含置信度评分、迁移风险标签（PHP→C#）、FEATURE_STUB: 标记协议以及 Gate 1 完整性闸门。（XSPEC-200）
- **`behavior-snapshot`**（`ai/standards/behavior-snapshot.ai.yaml`、`core/behavior-snapshot.md`）：新标准，定义了用于迁移对等性验证与重构特征测试的 HTTP 金样快照格式。包含快照 schema、`ignore_fields` 指引、对等性闸门（退出码 0/1/2）以及 Gate 0 特征测试协议。（XSPEC-201）

### 变更
- **`acceptance-criteria-traceability`**：新增第 4 个 AC 状态 `not_implemented`（🚫）— 区别于 `uncovered`（代码存在但无测试）与 `not_implemented`（代码不存在）。更新覆盖率公式，将 `not_implemented` 排除在分母之外。新增 CI 闸门规则：`not_implemented_count > 0` → 阻断（独立于覆盖率百分比闸门）。新增用于状态分类的决策树。（XSPEC-199）

## [5.7.3] - 2026-05-08

### 修复
- **`uds update` 跳过陈旧 ID**（`cli/src/commands/update.js`）：四个循环（显示、复制、哈希重新计算、更新后完整性检查）现在会跳过 `manifest.standards` 中无法识别的短 ID（既不包含 `/` 也不包含 `.`，但没有匹配的注册表条目，例如陈旧的 AI 工具名 `claude-code`、`opencode`）。此前这些条目会在 `uds update` 期间导致误报的“文件缺失”警告和失败的还原尝试。

## [5.7.2] - 2026-05-08

### 修复
- **Manifest schema v3.4.0 — `standards` 路径→ID 迁移**（`cli/src/core/manifest.js`）：新增了 `migrateToV340()` 迁移步骤和 `migrateStandardsPathsToIds()` 辅助函数。`standards` 数组包含旧版路径格式条目（例如 `"ai/standards/foo.ai.yaml"`）的 manifest 在加载时会自动转换为简短的注册表 ID（例如 `"foo"`）。选项文件路径（`ai/options/…`）保持原样保留。即使 schema 版本已经匹配，`ensureRequiredFields()` 安全网也会运行，防止 manifest 出现部分写入的情况。（`cli/src/core/manifest.js`、`cli/src/reconciler/desired-state-calculator.js`）
- **`uds check` 旧版存在性检查**（`cli/src/commands/check.js`）：无哈希后备路径现在将注册表 ID 格式的标准解析为其真实的源文件名（例如 `"testing"` → `"testing.ai.yaml"`），并将选项文件路径正确路由到 `.standards/options/`。此前，ID 格式的标准会导致缺少路径的查找，从而始终报告“缺失”。
- **`uds update` 支持 ID 格式**（`cli/src/commands/update.js`）：五个代码路径（`checkNewStandards`、文件列表显示、文件复制循环、哈希重新计算、更新后完整性扫描）现在通过注册表将 ID 格式的标准解析为源路径，以便其 manifest 已迁移到 v3.4.0 的项目继续获得正确的文件操作。
- **`uds audit` 健康度/摩擦检查**（`cli/src/utils/health-checker.js`、`cli/src/utils/friction-detector.js`）：这两个工具现在在检查磁盘/CLAUDE.md 引用之前，都会先将 ID 格式的标准解析为实际文件名，从而防止在已迁移的 manifest 上出现假 OK 结果。

## [5.7.1] - 2026-05-08

### 修复
- **`cli/package-lock.json`**：同步 lock 文件以修复 GitHub Actions 上的 `npm ci` 失败（缺失 `@emnapi/core` 和 `@emnapi/runtime` 条目）。

### 移除
- **`specs/`**：移除了 4 个已作为 XSPEC 迁移到 dev-platform 的规格文件（SPEC-frontend-design-standard、SPEC-mcp-design-standards-server、superspec-borrowing-phase1-2-spec、superspec-phase4-spec）。保留了 `execution-history-spec.md`（Archived）、`schemas/` 和 `standards-effectiveness-schema.json`。
- **`docs/archive/`**：移除了 7 份过时的迁移指南与工作流分析文档。
- **`.project-context/`**：移除了 gemini-cli 自动生成的构件（内容已被 `CLAUDE.md` 覆盖）。

### 新增
- **`.npmignore`**：从 npm 包中排除 `tests/`、`scripts/`、`.github/`、`.githooks/`、`.gemini/`、`.release-readiness/`、`docs/internal/`。此前这些内容是在无意中发布的（当时不存在 `files` 字段或 `.npmignore`）。

**采用者注意**：如果您此前依赖从 npm 安装的 `tests/` 或 `scripts/` 中的任何文件，请直接从 GitHub 仓库安装它们。

## [5.7.0] - 2026-05-08

> **跨平台脚本迁移** (XSPEC-179 + XSPEC-180)：Bash 脚本正逐步替换为单一来源的 TypeScript / Node.js ESM 等效实现，无需修改即可在 macOS / Linux / Windows 上运行。遗留的 `.sh` 文件保留并带有 `DEPRECATED` 标记以确保向后兼容。

### 移除

- **README 中的生态系统部分** (`README.md`, `locales/zh-TW/README.md`, `locales/zh-CN/README.md`)：彻底移除了 `## 🌐 Ecosystem` / `## 🌐 生態系統` / `## 🌐 生态系统` 章节。UDS 是一个独立且工具无关的标准库；该小节标题暗示的“产品生态系统”在下游项目解耦（批次 1–6，2026-05-04）后已不再适用。工具兼容性列表（Claude Code / Cursor 等）仍保留在 README 的前文部分。

### 新增

- **Skill 分级与预算调优** (XSPEC-185 / DEC-061)：针对 40 多个 UDS skill 引入三级分类（Core / Advanced / Specialist），解决采用者安装额外插件时 Claude Code 的 `/doctor` 警告技能描述被截断的问题。新增产物：
  - `skills/README.md` §Skill Tiers —— 分级成员表
  - `flows/skill-tiering-rationale.md` —— 分级标准与 DEC-051 映射
  - `examples/skill-overrides-recommended.json` —— 可直接复制的 `skillOverrides` 参考配置（Tier 3 → `"name-only"`）
  - `docs/skill-budget-tuning.md` —— 采用者指南（用户/项目设置、自定义、提高预算）

  **采用者操作（可选）**：将 `examples/skill-overrides-recommended.json` 中的 `skillOverrides` 块合并到您的 `~/.claude/settings.json` 或项目 `.claude/settings.json` 中。Tier 3 的 skill 仍可通过 `/<name>` 调用 —— 仅屏蔽 Claude 的自动发现列表展示。参见 `docs/skill-budget-tuning.md`。
- **AI 工具表格覆盖度** (`README.md`, `locales/zh-TW/README.md`, `locales/zh-CN/README.md`)：新增了此前缺失的五个工具 —— GitHub Copilot、OpenAI Codex、Aider、Continue、Google Antigravity。引入了 ⚠ Minimal 状态图例项。(`1b588e1`)
- **`scripts/bump-version.mjs`** (XSPEC-179 Phase 1)：跨平台版本递增实现，功能与遗留的 `.sh` 一致。(`1a44e14`)
- **`scripts/install-hooks.mjs`** (XSPEC-179 Phase 1)：跨平台 git hooks 安装程序；在 Windows 上自动跳过 `chmod`。(`1a44e14`)
- **`scripts/pre-commit.mjs`** (XSPEC-180)：pre-commit hook 的 Node.js ESM 实现，包含平台分支判断：在 Windows 上调用 `check-translation-sync.ps1`，在其他平台上调用 `.sh`。(`1572869`)
- **7 个 TypeScript 检查脚本** (XSPEC-179 Phase 2, `0a26d14`)：从 bash 迁移至通过 `tsx` 执行的单一 TypeScript 源码：
  - `scripts/check-ai-behavior-sync.ts`
  - `scripts/check-commit-spec-reference.ts`
  - `scripts/check-flow-gate-report.ts`
  - `scripts/check-integration-commands-sync.ts`
  - `scripts/check-registry-completeness.ts`
  - `scripts/check-release-readiness-signoff.ts`
  - `scripts/check-workflow-compliance.ts`
- **`tsx@^4.20.0`** 添加至根目录 `devDependencies` (XSPEC-179 Phase 2, `0a26d14`)。
- **7 个 npm 脚本** 用于接入 TypeScript 检查 (`0a26d14`)：`check:ai-behavior`、`check:commit-spec`、`check:flow-gate`、`check:integration-commands`、`check:registry`、`check:release-signoff`、`check:workflow-compliance`。

### 变更

- **下游项目解耦** (6 个批次, `ebe716c`–`2392c0f`)：在 130 多个文件中，将所有面向公众的特定下游项目（DevAP / VibeOps）引用替换为采用层中立术语。重申 UDS 为纯粹的 MIT + CC BY 4.0 标准库，独立于任何特定采用层。关键领域：`README.md`/`CLAUDE.md`/多语言版本、`.standards/`/`ai/standards/` 的 DEPRECATED 桩代码、`core/*.md`/多语言镜像、`cli/` 源码 + 测试、`skills/*/SKILL.md`、`flows/*.flow.yaml`/`flows/README.md`、`docs/specs/`、`specs/` 根目录、`packaging-standards`、`git-worktree` 路径示例。

- **REGISTRY**：`roo-code` 集成层级从 `planned` 调整为 `partial`；在 AI 工具表格中将 Roo Code 从 Cline 行中拆分出来。(`1b588e1`)
- **`.githooks/pre-commit`** (XSPEC-180, `1572869`)：从 51 行的 bash 实现精简为 16 行的 POSIX `sh` shim，委托给 `scripts/pre-commit.mjs` 执行。
- **`scripts/bump-version.mjs`** (`19ad314`)：新增 `buildCmd()` 辅助函数，在 Windows 上调用 `check-version-sync` / `check-translation-sync` 时切换至 PowerShell + `.ps1`，恢复 Windows 上的同等支持。
- **XSPEC-179 Phase 2 策略修订** (`0a26d14`)：放弃此前 `.sh` + `.ps1` 双轨方案，转而采用**单一 TypeScript 源码**方案。单个 `.ts` 文件通过 `tsx` 在所有平台上无需修改即可运行，消除了“只能在 Windows 上验证”的反馈断层。

### 废弃

- **`scripts/bump-version.sh`** (`1a44e14`)：标记为 DEPRECATED；由 `bump-version.mjs` 取代。
- **`scripts/install-hooks.sh`** (`1a44e14`)：标记为 DEPRECATED；由 `install-hooks.mjs` 取代。
- **7 个遗留 `check-*.sh` 脚本** (`0a26d14`)：对应的 `.ts` 实现（见上文）现为权威规范实现。`.sh` 文件针对遗留 Linux/macOS 环境予以保留，但不再接收新特性。

### 移除

- **`.devap/` 目录** (`2392c0f`)：移除了孤立的 DevAP dogfooding 安装。DevAP 已于 2026-04-28 退役（XSPEC-086/095）；UDS 现原生使用 `flows/commit.flow.yaml`，并使用 `scripts/bump-version.mjs` 进行版本发布。

### 修复

- **`scripts/check-release-readiness-signoff.sh`** (`0a26d14`，在 TypeScript 移植中修复的潜在 bug)：修正了错误的 `grep -c "0\n0"` 模式（该模式从未匹配到字面量 `\n`），以便可靠检测缺失的签核信号。
- **`scripts/check-integration-commands-sync.sh`** (`0a26d14`，在 TypeScript 移植中修复的潜在 bug)：消除了 `find` 与下游消费者之间管道中断导致的 SIGPIPE 噪音。

## [5.6.0] - 2026-05-06

> **次要版本**：全覆盖测试范式（XSPEC-178）——废除金字塔阈值，转而采用行为完整性（每个公共函数的正常／边界／错误路径）、棘轮 CI、反假测试强制执行以及 STUB 标记协议。

### 新增

- **`ai/standards/full-coverage-testing.ai.yaml`** — 定义全覆盖测试范式的新标准：行为完整性模型、棘轮 CI 策略、反假测试规则（无重言式断言、不 mock 核心业务逻辑）、STUB 标记协议、`@ac` 验收条件追溯性标记，以及 `COVERAGE_EXEMPT` 豁免格式（XSPEC-178）
- **`core/full-coverage-testing.md`** — 新 YAML 标准的人类可读配套文档；pre-commit 标准同步 hook 的必需项

### 变更

- **`ai/standards/testing.ai.yaml`**：新增 `deprecated_rules` 块；金字塔阈值规则（`follow-pyramid`）自 v5.5.0 起废弃，并由指向新标准的 `follow-full-coverage` 取代
- **`ai/options/testing/unit-testing.ai.yaml`**：移除 `pyramid_percentage: 70%`；替换为 `coverage_policy: "Behaviour-completeness ratchet (XSPEC-178)"`
- **`ai/options/testing/integration-testing.ai.yaml`**：移除 `pyramid_percentage: 20%`；替换为针对所有关键集成路径的棘轮覆盖率策略
- **`cli/standards-registry.json`**：新增 `full-coverage-testing` 条目（category: `skill`, skillName: `testing-guide`）；更新 `testing` 条目描述以移除金字塔阈值百分比
- **`cli/src/commands/init.js`**：`standardOptions` 现包含默认的 `coverage_model: 'full-coverage'`
- **`cli/src/commands/update.js`**：v5.5.0 迁移块在升级时设置 `options.coverage_model = 'full-coverage'` 并打印范式转变通知
- **`cli/src/commands/check.js`**：新增 `checkFullCoverageCompliance()`——当 v5.5.0+ 项目中缺少 `full-coverage-testing.ai.yaml` 时发出警告，报告 `src/` 中的 STUB 标记数量

### 本版本其他内容（v5.5.0 后的修复）

- **`core/`**：新增 `release-readiness-gate.md` 聚合标准；扩展 `browser-compatibility-standards.md`；填补了无障碍（a11y）阈值、契约测试、跨流程回归和容量签核的覆盖缺口
- **`templates/`**：将流程测试矩阵扩展为带有 UAT 脚本列的多关卡模型；在 `requirement-template.md` 中新增流程规格小节
- **`flows/`**：将 Multi-Gate Flow 接入 RQM 和发布前流水线
- **`cli/package.json`**：升级 `@inquirer/prompts` 8.4.2、`ora` 9.4.0、`vitest` 4.1.5、`ajv` 8.20.0、`opencc-js` 1.3.0、`@commitlint` 20.5.3
- **CLAUDE.md / docs**：新增 XSPEC-176 单一事实来源优先级说明

### 从金字塔阈值迁移

从 `< 5.5.0` 升级的项目将通过 `uds update` 收到迁移通知：

```
⚠ Testing paradigm migrated to Full Coverage (XSPEC-178).
  full-coverage-testing.ai.yaml installed. Remove coverageThreshold from jest/vitest config.
```

完整的迁移检查清单见 `core/full-coverage-testing.md`（删除 `coverageThreshold`、安装 `.coverage-baseline.json`、向 CI 添加棘轮脚本）。

## [5.5.0] - 2026-05-05

> **次要版本**：17 项新标准——测试安全、LLM 输出验证、供应链完整性、发布质量。完整说明见 [GitHub Release](https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v5.5.0)。

## [5.4.0] - 2026-04-27

> **次要版本**：XSPEC-086 Phase 2 — 8 个纯流程/编排标准迁移至 DevAP（deprecated stubs 保留向后兼容）。UDS 职责回归活动定义层，流程编排交由 DevAP 负责（DEC-049）。

### 已弃用（XSPEC-086 Phase 2 — 迁移至 DevAP）

下列 8 个标准已迁移至 `dev-autopilot/standards/`，成为 DevAP canonical 位置。UDS 保留 deprecated stub 至 v6.0.0。

**`ai/standards/flow/`（已迁入 DevAP `standards/flow/`）**
- `workflow-enforcement.ai.yaml` → `dev-autopilot/standards/flow/workflow-enforcement.ai.yaml`
- `workflow-state-protocol.ai.yaml` → `dev-autopilot/standards/flow/workflow-state-protocol.ai.yaml`
- `change-batching-standards.ai.yaml` → `dev-autopilot/standards/flow/change-batching-standards.ai.yaml`
- `branch-completion.ai.yaml` → `dev-autopilot/standards/flow/branch-completion.ai.yaml`
- `pipeline-integration-standards.ai.yaml` → `dev-autopilot/standards/flow/pipeline-integration-standards.ai.yaml`

**`ai/standards/orchestration/`（已迁入 DevAP `standards/orchestration/`）**
- `agent-dispatch.ai.yaml` → `dev-autopilot/standards/orchestration/agent-dispatch.ai.yaml`
- `agent-communication-protocol.ai.yaml` → `dev-autopilot/standards/orchestration/agent-communication-protocol.ai.yaml`
- `execution-history.ai.yaml` → `dev-autopilot/standards/orchestration/execution-history.ai.yaml`

### 变更

- `cli/standards-registry.json`：8 个标准条目标记 `deprecated: true`、`deprecatedSince: "5.4.0"`、`removalVersion: "6.0.0"`、`canonicalOwner: "devap"`、`canonicalPath`
- `cli/tests/unit/core/execution-history-standards.test.js`：测试更新为验证 deprecated stub 结构（meta.deprecated + canonical_path），22 tests 通过

### 迁移指南

安装 DevAP 并加载对应标准以取得完整的流程执行能力：

```bash
npm install -g dev-autopilot
# 各標準 canonical 位置見 dev-autopilot/standards/README.md
```

UDS 5.x 仍提供 deprecated stubs（含 fallback 规则），UDS 6.0.0 将完全移除。

## [5.3.2] - 2026-04-27

> **补丁版本**：错误修复——`uds update -y` 现自动安装/更新 Skill 和 Command，而不仅是显示提示。

### 修复
- **`uds update --yes` / `-y`** (`cli/src/commands/update.js`): `--yes` 标志此前完全跳过了 Skill 和 Command 的安装，改为打印“New features available”提示。它现在与交互式路径保持一致——缺失的 Skill/Command 会立即安装，过期的则会更新。manifest 和集成文件也会相应刷新。修复了 `uds update -y` 使 `.claude/` 中的 Skill 保持不变，而交互式 `uds update` 会更新它们的回归问题。

## [5.3.1] - 2026-04-27

> **补丁版本**：错误修复——`uds update` 后 `uds check` 不再错误警告“AGENTS.md standards out of sync”。

### 修复
- **`generateAgentsMdSummary()`** (`integration-generator.js`): 移除了导致 AGENTS.md 仅列出所有已安装标准中前 30 个的 `.slice(0, 30)` 截断限制。`uds check` 会与 manifest 中的所有标准进行比对，因此该截断总是会产生错误的“out of sync”警告。生成器现列出所有已安装的 `.ai.yaml` 标准；check 顺利通过。

## [5.3.0] - 2026-04-26

> **次要版本**：四项新标准 + 一个新 Skill（XSPEC-085/064）——`no-cicd-deployment`、`rollback-standards`、`cd-deployment-strategies`、`pipeline-security-gates` 以及 `/deploy` Skill。标准总数：136。

### 新增
- **`no-cicd-deployment.ai.yaml`** (XSPEC-085 Phase 1): 无 CI/CD 环境的三层部署架构——`set -euo pipefail` + deploy.lock + 版本标签强制执行；冒烟测试 + 自动回滚；蓝绿部署 <30s 回滚。
- **`rollback-standards.ai.yaml`** (XSPEC-064 Phase 1): 回滚触发矩阵——自动（错误率 >2× 基线）、辅助（SLO 违规）、手动（延迟在 SLO 范围内）。错误预算 <10% 升级为自动。P0–P3 严重度带 SLA。
- **`cd-deployment-strategies.ai.yaml`** (XSPEC-064 Phase 1): 策略选择矩阵——蓝绿 / 金丝雀 / 滚动 / 重建决策树（流量 × 风险 × 成本）。包含无 CI/CD 兼容性说明。
- **`pipeline-security-gates.ai.yaml`** (XSPEC-064 Phase 1): CI 安全关卡位置——提交前密钥扫描、构建后 SAST、预发后 DAST、打包阶段 SCA+SBOM。Critical/High 阻断流水线；Medium 需要审批。
- **`/deploy` Skill** (`skills/deploy-assistant/`, XSPEC-085 Phase 1b): 带有 zh-TW 本地化翻译的交互式无 CI/CD 部署脚本生成器。

## [5.2.0] - 2026-04-24

> **次要版本**：三项新标准/Skill（XSPEC-080/081/082）——`/release package` 子命令、`/push` 质量关卡 Skill 以及 `agent-behavior-discipline` 标准（Karpathy 四项原则：Ask/Simple/Precision/Test）。Bundle 对齐强化。文档集中至 dev-platform。标准总数：74。

### 新增
- **`agent-behavior-discipline.ai.yaml`** (Trial，2026-10-24 到期，XSPEC-082 / DEC-048): 新的治理标准，编码了 Andrej Karpathy 的四项 AI Agent 行为原则——Ask（执行前暴露假设）、Simple（最小充分代码）、Precision（仅做精准修改）、Test（定义可验证的成功标准 + 自我纠错循环）。已集成至 `uds-manifest.json`（第 74 个条目）和 `cli/standards-registry.json`。
- **`/push` Skill** (`skills/push/`, XSPEC-081): Git push 质量关卡与协作护栏——受保护分支检测、强推防护、push 前关卡验证、push 凭据审计日志、PR 集成入口点。包含两个配置选项：`options/push/single-owner-mode.ai.yaml`（针对个人仓库的减少护栏模式）和 `options/push/team-mode.ai.yaml`（针对团队的完整护栏、需要确认模式）。
- **`/release package` sub-command** (`skills/release/`, XSPEC-080): 针对 10 种目标格式的打包指南——npm/Node.js、Python/PyPI、Go 二进制、Electron 应用、Homebrew formula（第一波）+ Rust/Cargo、Tauri 桌面端、Docker 镜像、VS Code 扩展、GitHub Release 资产（第二波）。基于探测优先的设计：在应用打包步骤前自动探测项目类型。

### 修复
- **Bundle parity** (XSPEC-072 Phase 2): 解决了 `ai/standards/` 与 `bundle/` 之间的对齐差距——全部 74 个标准现已存在于 bundle 中。CI 已加固为在任何对齐不匹配时硬失败（exit 1），防止无声的 bundle 漂移。
- **i18n NO META frontmatters** (BUG-A06): 为 36 个被标记为 `NO META` 的翻译文件添加了缺失的 YAML frontmatter——修复了翻译同步验证的误报。

### 变更
- **Docs centralization (DEC-047 Batch 2)**: 将 UDS 规划/治理文档迁移至 AsiaOstrich dev-platform 规划中心。这些文件不再随 UDS 分发：
  - `docs/AI-AGENT-ROADMAP.md` → dev-platform `cross-project/roadmap/uds-agent-roadmap.md`
  - `docs/OPERATION-WORKFLOW.md` → dev-platform `cross-project/ops/uds-operation.md`
  - `docs/internal/AGENT-PROTOCOL.md` → dev-platform `cross-project/ops/uds-agent-protocol.md`
  - `docs/internal/AI-AGENT-SYNC-SOP.md` → dev-platform `cross-project/ops/uds-ai-agent-sync-sop.md`
  - `docs/internal/INTEGRATION-SIMPLIFICATION-PROPOSAL.md` → dev-platform `cross-project/ops/uds-integration-simplification-proposal.md`
  - ROADMAP 与 OPERATION-WORKFLOW 的本地化副本（`locales/zh-TW/docs/`、`locales/zh-CN/docs/`）也一并移除。

[5.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.1...v5.2.0

## [5.1.1] - 2026-04-20

> **补丁版本**：Windows CI 修复，53 个 SKILL.md 文件添加 skill `name` 字段，三份 `.md` 源标准根据 BUG-A08 事后复盘的事故规则进行更新，zh-TW/zh-CN 翻译同步。

### 修复
- **`cli/src/utils/directory-mapper.js`**：将 `dir.split('/').pop()` 替换为 `path.basename(dir)` 以实现 Windows 跨平台兼容性——修复 Windows CI runner 上的 `directory-mapper.test.js` 失败。

### 新增
- 9 个源 `skills/*/SKILL.md` 文件与 44 个 `locales/zh-TW/skills/*/SKILL.md` 文件新增 **`name` 字段**——为技能验证工具所必需。

### 变更
- **`core/test-governance.md`** 1.0.0 → 1.1.0：新增 `test-execution-continuity` 规则（BUG-A08 事后复盘——存在 22 个测试但从未连接到 CI 执行触发器）。
- **`core/checkin-standards.md`** 1.5.0 → 1.6.0：新增遗留项目文件同步（`project-file-sync`）小节——磁盘上的每个源文件都必须在遗留项目清单文件中注册。
- **`core/testing-standards.md`** 3.1.0 → 3.2.0：新增 E2E 前置条件作用域（`e2e-precondition-scope`）小节——E2E 预检查必须验证受测的所有页面/端点，而不仅是认证入口点。
- 同步了 `test-governance.md`、`checkin-standards.md` 和 `testing-standards.md` 的 **zh-TW 和 zh-CN 翻译**。

[5.1.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0...v5.1.1

## [5.1.0] - 2026-04-20

> **稳定版本**：BUG-A06 i18n 完整性——添加 32 项缺失翻译、支持语义化版本的翻译关卡、新增 `translation-lifecycle-standards` UDS 标准。BUG-A07 shell 测试覆盖——针对 20 多个脚本的 bats 冒烟测试。BUG-A08 假通过测试审计——纠正 22 个测试。预发布批次 0：6 项标准从 Trial 晋升至 Adopt（DEC-021/025/031/035/038/040）。标准总数：106。

### 新增
- **`translation-lifecycle-standards`** (Trial，2026-10-20 到期)：新的 UDS 标准，规范化了 MISSING 与 OUTDATED 的区别、感知语义化版本的严重度分类（MISSING/MAJOR = 发布阻断项，MINOR/PATCH = 建议性）、自动化集成（pre-commit hook、发布关卡、bump-version 集成）。来源：BUG-A06 事后复盘。
- **`.githooks/pre-commit`** + **`scripts/install-hooks.sh`**：暂存 `core/*.md` 文件时的提交时提醒；显示 OUTDATED 警告且不阻断提交。通过 `./scripts/install-hooks.sh` 激活。
- **32 项 zh-TW 与 zh-CN 翻译** (BUG-A06)：所有核心标准现已拥有完整的 zh-TW 与 zh-CN 翻译，包括：`circuit-breaker`、`token-budget`、`dual-phase-output`、`failure-source-taxonomy`、`immutability-first`、`security-decision`、`capability-declaration`、`recovery-recipe-registry`、`retry-standards`、`health-check-standards`、`timeout-standards`、`skill-standard-alignment-check`、`standard-admission-criteria`、`standard-lifecycle-management`、`packaging-standards`、`frontend-design-standards`、`translation-lifecycle-standards` 等。
- **bats 冒烟测试** (BUG-A07)：`tests/scripts/`——针对 20 多个 shell 脚本的冒烟测试，覆盖 `check-translation-sync.sh`、`check-version-sync.sh`、`bump-version.sh`、`install-hooks.sh` 等。

### 变更
- **`check-translation-sync.sh`**：感知语义化版本的严重度——MAJOR 版本差异现以 1 退出（发布阻断项）；MINOR/PATCH 差异以 0 退出并附带建议性警告。新增 `semver_diff()` 函数和 `[MAJOR]` / `[MINOR]` / `[PATCH]` 严重度标签。
- **`bump-version.sh`**：在版本文件更新后自动运行 `check-translation-sync.sh`，在发布准备时提供翻译健康快照。
- **`scripts/pre-release-check.sh`**：更新为将 `check-translation-sync.sh` 作为硬性关卡调用（MISSING + MAJOR = 退出码 1）。

### 修复
- **zh-CN `anti-hallucination.md`** (BUG-A06)：从 1.5.0 → 1.5.1 更新——添加缺失的“Agent 认知校准”小节（来自 XSPEC-008 的 Answer/Ask/Abstain 框架）。自 2026-04-13 以来该小节在 zh-CN 中一直缺失。
- **22 个假通过测试** (BUG-A08)：此前在未实际测试正确行为的情况下即通过的测试，已使用真实断言进行更正。

### 晋升至 Adopt（预发布批次 0）
- `circuit-breaker`（DEC-021）：经过 6 个月 Trial 后采纳
- `token-budget`（DEC-025）：经过 6 个月 Trial 后采纳
- `dual-phase-output`（DEC-031）：经过 6 个月 Trial 后采纳
- `security-decision`（DEC-035）：经过 6 个月 Trial 后采纳
- `immutability-first`（DEC-038）：经过 6 个月 Trial 后采纳
- `failure-source-taxonomy`（DEC-040）：经过 6 个月 Trial 后采纳

[5.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.7...v5.1.0

## [5.1.0-beta.7] - 2026-04-17

> **测试版本**：DEC-043 第一波——涵盖可靠性模式与治理元框架的六项试用状态标准。

### 新增
- **可靠性包（XSPEC-067）**：三项处于试用状态的弹性模式标准。
  - `retry-standards`（`ai/standards/retry-standards.ai.yaml`、`core/retry-standards.md`）：带有指数退避、抖动和幂等防护的重试策略。
  - `timeout-standards`（`ai/standards/timeout-standards.ai.yaml`、`core/timeout-standards.md`）：分层超时预算（调用 / 请求 / 端到端）和传播规则。
  - `health-check-standards`（`ai/standards/health-check-standards.ai.yaml`、`core/health-check-standards.md`）：存活 / 就绪 / 启动探针语义。
- **治理元标准包（XSPEC-070，第一波先决条件）**：三项处于试用状态的标准，定义标准本身如何准入、管理以及与 Skill 对齐。
  - `standard-admission-criteria`：新标准提案的准入条件。
  - `standard-lifecycle-management`：Trial → Stable → Deprecated → Archived 状态转换。
  - `skill-standard-alignment-check`：Skill 与其引用的标准之间的对齐审计。
- 全部六项标准均遵循 UDS 三向同步要求：`.ai.yaml`（机器）+ `.md`（人类）+ `cli/standards-registry.json` 条目（+66 行）。

### 背景
- 由 **DEC-043**（UDS 覆盖完整性路线图）驱动。治理元标准包是解锁第 2–4 波（八个主题标准包：SRE / CI-CD / IaC / 合规 / 可靠性 / 数据工程 / 产品 / 治理——XSPEC-063~070）的第一波先决条件。
- PR: #77

[5.1.0-beta.7]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.6...v5.1.0-beta.7

## [5.1.0-beta.6] - 2026-04-13

> **测试版本**：针对 `uds init` 崩溃、E2E 测试隔离和 macOS 显示语言检测的错误修复。

### 修复
- **`uds init --yes` 崩溃** (`manifest-installer.js`): `contentMode: 'auto'` 未能通过模式验证（允许值：`minimal/index/full`），导致 init 在复制文件后未写入 `manifest.json` 便崩溃。现已在写入前将 `'auto'` 解析为 `'minimal'`。
- **macOS 显示语言被忽略** (`bin/uds.js`, `config.js`, `update.js`): 从 3.5.1 升级到 5.1.0-beta.5 后，存在三个根本原因导致 `uds config` 显示语言在英语区域设置的 macOS 上无法生效。修复了语言检测优先级链和 `display_language` 回填迁移。
- **E2E 测试隔离** (`tests/utils/cli-runner.js`): 测试继承了开发者的 `~/.udsrc` (`zh-tw`)，覆盖了语言检测并破坏了所有英文输出断言。添加了 `HOME: TEST_HOME_DIR` 隔离。
- **E2E 测试数量断言** (`tests/e2e/update-flow.test.js`): CLAUDE.md 中的 yaml 计数与包含 3 个非 yaml `.md` 模板在内的 manifest 标准总数进行了比较。在比较前过滤为仅包含 `.ai.yaml`。

### 新增
- **认知校准框架** (`core/anti-hallucination.md`, XSPEC-008): 六项校准协议——确定性梯度（CG）、证据链（EC）、不确定性分解（UD）、边界意识（BA）、校准反馈（CF）、元不确定性（MU）。
- **`/e2e-assistant` Skill**: 根据 BDD Gherkin 场景自动生成 E2E 测试骨架；框架探测（Playwright/Cypress/Puppeteer）；覆盖缺口分析。
- **`/process-to-skill` Skill**: Process-to-Skill 治理框架；三次法则；简单/复杂/增量决策树。
- **`execution-history.ai.yaml`** 与 XSPEC-003-SDD 模式同步。

## [5.1.0-beta.5] - 2026-04-10

> **Beta Release**: 大规模 CLI 扩展（SDLC Flow Engine、Standards-as-Hooks 编译器、分层 CLAUDE.md、SuperSpec Phase 4、opt-in 遥测上传）与 Skill 治理框架（/process-to-skill、DEC 评估框架）。

### Added

**新功能 — CLI & Standards**
- **opt-in 遥测上传** (SPEC-TELEMETRY-002): Hook 执行结果可选择性上传至远端分析端点；双重防护（`telemetryUpload=true` + `telemetryApiKey` 非空）；SHA-256 匿名 user_id，不含 PII
- **DEC 借镶评估框架** (XSPEC-014 Layer 1): 技术雷达（Technology Radar）、假设书（Hypothesis Document）、Reversal DEC 三大评估工具，支持借镶决策记录
- **SuperSpec Phase 4 — 收尾功能** (XSPEC-005): `uds spec archive`（归档索引）、`uds spec search`（全文搜索）、`uds spec quickstart`（快速建立）、`uds spec split`（大型 spec 拆分）
- **SuperSpec Phase 2 — 验证管线**: `spec-linter`（格式验证）、品质评分（0-100 分）、`context sync`（AC 与文档同步）
- **spec 大小闸门** (AC-3): `validateSpecSize()` — 超过 600 行触发警告，超过 1200 行阻挡提交
- **YAML 标准扩展** (AC-18): `.standards/*.ai.yaml` 格式扩展，支持 `enforcement` 区块与 `required_fields` 定义
- **SDLC Flow Engine** (SPEC-FLOW-001): 自定义 SDLC 工作流引擎，含状态机持久化（Phase 1）、可插拔品质闸门（Phase 4）、Export/Import（Phase 6-7）、交互式建立（AC-12）
- **Standards-as-Hooks 编译器** (SPEC-COMPILE-001): `uds compile` — 将 `.standards/*.ai.yaml` 的 `enforcement` 区块自动转译为 Claude Code hook 脚本
- **分层 CLAUDE.md** (SPEC-LAYERED-001): `uds init --content-layout` 支持多层目录的独立 CLAUDE.md；`directory-mapper` + `generator` 核心模块
- **Hook 整合** (SPEC-HOOKS-001): `uds init --with-hooks` 一键安装 hook 脚本（commit-msg / security / logging）；YAML enforcement 区块自动注入
- **Hook 执行遥测** (SPEC-TELEMETRY-001): 本地端 hook 执行统计（exitCode、duration_ms、hook_type），写入 `.uds/hook-stats.jsonl`
- **执行历史仓库标准** (`execution-history`): 新增 `core/execution-history.md` — AI Agent 会话跨对话持久化记忆标准，含 `@executes`/`@reads`/`@writes` 标注惯例
- **`/e2e` 斜杠命令** (SPEC-E2E-001): 从 BDD Gherkin 场景自动生成 E2E 测试骨架；支持 Playwright/Cypress/Puppeteer；AC 分析、模式识别、覆盖差距报告
- **`/process-to-skill` Skill** (XSPEC-020): Process-to-Skill 治理框架；3-Times Rule；Simple/Complex/Delta 决策树；Placement Decision（项目 vs UDS）
- **Skill 治理模板**: `templates/SKILL-CANDIDATES.md`（候选追踪）、`templates/SKILL-BRIEF-TEMPLATE.md`（Simple Skill 最小规格）
- **Integration Commands Sync** (SPEC-INTSYNC-001): `check-integration-commands-sync.sh` — 自动检测 AI 工具整合文件是否引用所有斜杠命令
- `COMMAND-INDEX.json`: 47 个 commands 的 Single Source of Truth，含 7 种分类
- `/derive` 扩展：感知 `test_levels` 配置 + AC Level Summary；支持 IT + E2E 测试推演（SPEC-DERIVE-001）
- **三个核心标准新增 `enforcement` 区块**: `commit-message-guide`、`testing-standards`、`checkin-standards`
- Pre-release 新增 Step 7.5 整合命令同步检查

**文档与规格**
- 批量归档 28 个已完成的 orphan specs 为 Archived 状态
- 归档 SPEC-TELEMETRY-001、SPEC-COMPILE-001、SPEC-LAYERED-001、SPEC-HOOKS-001、SPEC-FLOW-001、SPEC-E2E-001（共 6 份规格）
- 新增 XSPEC-005 SuperSpec 借镶规格与衍生测试工件

### Changed
- `REGISTRY.json`: 所有 tier 新增 `requiredCategories` 字段；Complete 和 Partial tier 均要求全部 command categories
- `REGISTRY.json`: Cursor 依实际能力（不支持 Workflows）从 `complete` 降为 `partial` tier
- `spec dependency tracking`：新增 `depends_on` 字段与 dual mode 支持（strict / advisory）

### Fixed
- `check-orphan-specs.sh`: 排除 traceability 文档的误判（含 `SPEC-` 前缀的参考行被误判为 orphan）
- `check-orphan-specs.sh`: 修复 orphan spec 检测 regex（支持 list 前缀和中文状态字段）

### Chore
- `.gitignore`: 新增 `.workflow-state/`（排除工作流状态 ephemeral 文件）
- 移除 11 个测试文件中过时的 `[TODO]` 标记

## [5.1.0-beta.4] - 2026-04-01

> **Beta Release**: 大规模标准扩展（+17 新标准），覆盖 SDLC 8 阶段。SDLC 覆盖率从 64% 提升至 84%。

### Added
- **Phase 1 — 监控运维标准** (5 个新 core 标准):
  - `observability-standards`: 三支柱框架（Logs/Metrics/Traces）、Golden Signals、L0-L4 成熟度模型
  - `slo-standards`: SLI 选取指南、SLO 设定方法论（5 步骤）、Error Budget 政策
  - `alerting-standards`: P1-P4 分级、Escalation 路径、SLO-based alerting、告警品质指标
  - `runbook-standards`: 标准模板（7 段落）、5 类 Runbook、演练机制、品质 6 原则
  - `postmortem-standards`: Blameless 原则、5 种 RCA 方法、Action Items 生命周期
- **Phase 2 — 编码实现标准** (3 新建 + 1 扩展):
  - `tech-debt-standards`: 6 类分类法、登记簿模板（11 字段）、预算机制、3×3 影响矩阵
  - `feature-flag-standards`: 4 类 Flag、TTL 生命周期、腐化检测、清理检查表
  - `environment-standards`: 4 环境层级、5 层配置优先级、Secret 管理、IaC 原则
  - `checkin-standards` 扩展: Linting 三级分级、Auto-fix 策略、团队一致性原则
- **Phase 3 — 部署与交付** (1 新建 + 2 扩展):
  - `containerization-standards`: Dockerfile 最佳实践、Multi-stage Build、Image 标签/安全/Registry
  - `deployment-standards` 扩展: 部署验证（成功判定、观察期、Smoke Test）
  - `environment-standards` 扩展: IaC 原则（声明式/幂等/Drift Detection）
- **Phase 4 — 测试深化** (2 新建 + 2 扩展):
  - `test-data-standards`: 3 层数据策略、匿名化规则、隔离原则、Factory Pattern
  - `chaos-engineering-standards`: 4 步骤实验流程、5 种故障注入、安全护栏、SLO 整合
  - `performance-standards` 扩展: 4 种性能测试类型、基准线管理、性能预算
  - `testing-standards` 扩展: 探索式测试 SBTM、SFDPOT 启发法
- **Phase 5 — 退役与演进** (2 个新 core 标准):
  - `deprecation-standards`: API Sunset 6 阶段、Feature Sunset 8 步清单、系统退役 7 步骤
  - `knowledge-transfer-standards`: 30 天 Onboarding 路线图、Handoff 6 步清单、Bus Factor 评估
- **Phase 6-8 — 规划/治理/品质** (4 个新 core 标准):
  - `supply-chain-security-standards`: SBOM（SPDX/CycloneDX）、SLSA L1-L4、License 合规矩阵
  - `estimation-standards`: 3 种估算方法、校准机制、5 个反模式、置信等级
  - `design-document-standards`: HLD（6 段落）/LLD（5 段落）模板、C4 架构图、设计审查
  - `privacy-standards`: Privacy by Design 7 原则、数据分类、DPIA、用户 5 项权利
- **3 个新 Skill**: `observability-assistant`、`slo-assistant`、`runbook-assistant`
- **翻译**: 17 个新标准 × zh-TW + zh-CN = 34 个翻译文件
- **同步工具**: `scripts/check-registry-completeness.sh`（core→ai.yaml→registry→.standards/ 完整性检查）
- **Pre-release 检查**: 新增 Step 18 registry completeness（总步骤 19→20）
- **SDD 工件**: 18 份规格、18 份 BDD Feature、693 个 TDD 测试（全部通过）

### Changed
- **Integration 精简化**: `uds init`/`update` 根据 AI 工具 tier 自动选择 contentMode
  - complete (Claude Code) → minimal, partial (Copilot) → full, preview (Gemini) → index
  - `ai-agent-paths.js` 新增 `tier` 字段和 `getAgentTier()` 函数
  - `integration-generator.js` 新增 `resolveContentModeForTool()` 映射函数
  - `init.js` contentMode 默认值从 `'index'` 改为 `'auto'`
- **CLAUDE.md**: Installed Standards Index 从 61 → 78 标准、核心文件数 49 → 71
- **OPERATION-WORKFLOW.md**: §8.1 新增标准同步清单从 10 步扩展为 12 步

### Added (carried from Unreleased)
- **标准自我诊断系统** (SPEC-SELFDIAG-001): 让 UDS 从被动框架升级为能自我诊断的框架
  - `uds audit --score [--self]`: 4 维度健康评分（完整度/新鲜度/一致性/覆盖度）
  - `--save / --trend`: 历史趋势追踪与退化检测
  - `--ci --threshold N`: CI 模式，以 exit code 反映健康状态
  - `--format json`: 结构化 JSON 输出
- **Hook 学习回路**: inject-standards.js 支持触发统计记录（opt-in）
  - 启用方式：在 `.uds/config.json` 设置 `{"hookStats": true}`
  - 分析工具：`node scripts/analyze-hook-stats.mjs`
  - 隐私保护：不记录 prompt 内容，仅记录匹配统计
  - 文件大小上限 1MB，自动截断旧记录
- **定时自我诊断**: `.github/workflows/scheduled-health.yml`
  - 每周一 09:00 UTC 自动执行健康评分
  - 分数低于阈值时自动创建 GitHub Issue
  - 支持 `workflow_dispatch` 手动触发
- **外部参考检查**: `scripts/check-external-references.mjs`
  - 扫描 `core/*.md` 和 `.standards/*.ai.yaml` 中的外部 URL
  - 检测失效链接（link-rot）和过期版本引用
  - 支持离线模式（`--offline`）和 JSON 输出（`--json`）
- **跨产品标准效果反馈协议**: `specs/standards-effectiveness-schema.json`
  - 定义 DevAP/VibeOps → UDS 的标准效果反馈 JSON 格式
  - 汇总工具：`scripts/aggregate-effectiveness.mjs`
- **版本清单产出**: `scripts/generate-version-manifest.mjs`
  - Release 时产出 `.standards/version-manifest.json` 供消费者检测版本漂移
- **集成冒烟测试**: `cli/tests/integration/tool-outputs.test.js`
  - 验证全部 10 个 AI 工具的 `uds init` 产出格式

### Changed
- `.gitignore`: 新增 `.uds/` 排除本地统计数据

## [5.1.0-beta.3] - 2026-03-28

> **Beta Release**: 依赖大版本升级、文档生命周期标准、CLI bug 修复。供早期用户测试。

### Added
- **文档生命周期标准** (SPEC-DOCLC-001): 新增 `core/documentation-lifecycle.md`
  - 定义文档更新触发规则表（7 种触发条件 × 6 种文档类型）
  - 定义文档检查金字塔（Commit → PR → Release 三层）
  - 区分硬检查（自动化）与软检查（人工审查）
  - 定义责任归属矩阵（角色 × 文档类型 × 时机）
- **Release Workflow 文档同步检查**: `release-workflow.md` 新增 Documentation Sync Verification 章节
- **文档可访问性标准**: `documentation-writing-standards.md` 新增 WCAG 2.1 可访问性章节
- **业界标准引用增强**: 4 个文档标准补齐 ISO 26515、Diátaxis、Conventional Comments 引用
- **新技能与标准**: `/adr`、`/retrospective`、`/contract-test`、`/metrics` 技术债量化、`/incident` 改善追踪、`/discover` 风险登记簿、`/ac-coverage` 四层追溯

### Changed
- **Commander v14**: 升级 commander 至 v14.0.0（无代码变更）
- **Inquirer → @inquirer/prompts**: 从 inquirer v9 迁移至 @inquirer/prompts v7
  - 删除不再需要的 checkbox monkey patch
  - 所有 prompt 调用改用新 API 格式（15 个 source files + 7 个 test files）

### Fixed
- **Skill-only 标准 null path**: 修正 `project-discovery` 等纯 skill 标准安装时的 path 错误
- **GitHub 429 Rate Limit**: 修正 `uds check` 在 GitHub API 响应 429 时崩溃的问题
- **AI 工具联动安装**: 新增 AI 工具时自动联动安装 Skills 和 Commands
- **Windows 路径重复**: 修正 Windows 环境下路径重复问题
- **Manifest 残留清理**: 修正移除 AI 工具时未清理 manifest 中的残留元数据

## [5.1.0-beta.2] - 2026-03-25

> **Beta Release**: `output_language` 统一语言设置、文档生态闭环。供早期用户测试。

### Added
- **文档生态闭环** (SPEC-DOCS-01): 新增 `/docs impact` 和 `/docs translate` 子命令
  - `/docs impact` — 主动分析代码变更对文档的影响，附建议命令
  - `/docs translate` — 翻译状态检查与 AI 辅助翻译同步
  - `sync-updates` 规则升级为自动 AI 行为，改完 code 自动提醒受影响文档
  - 命令建议映射表：每种文档类型对应建议的斜杠命令
- **文档三层分级制度**: bilingual 模式下文档依 L1（强制）/ L2（建议）/ L3（不影响）分级

### Changed
- **`commit_language` → `output_language`**: 统一语言设置名词，同时控制 commit message 和文档语言（74 文件重命名）
  - 与 `display_language` 形成对称：display = 显示端、output = 产出端
  - 向后兼容：manifest 自动迁移、`--commit-lang` 保留为 hidden alias
- **`/docs` 命令扩展**: 子命令从 4 个增加到 6 个（新增 `impact`、`translate`）

### Fixed
- **removeFromManifest 遗漏清理**: 修正卸载时未清理 `integrationBlockHashes` 和 `integrationConfigs` 的问题

## [5.1.0-beta.1] - 2026-03-25

> **Beta Release**: 手动打包部署 Release 模式、AI 响应导航标准。供早期用户测试。

### Added
- **手动打包部署 Release 模式** (SPEC-RELEASE-01): 为未使用 CI/CD 的项目新增 RC 制版本管理流程
  - `uds release promote` — RC → Stable 版本晋升
  - `uds release deploy` — 记录部署记录到 deployments.yaml
  - `uds release manifest` — 生成 build-manifest.json
  - `uds release verify` — 验证 manifest 与 Git 状态一致性
  - `uds init` 新增发布模式选择（ci-cd / manual / hybrid）
  - `uds config --type release_mode` 支持模式切换
  - 4 个核心工具模块：version-promote、release-config、build-manifest、deployment-tracker
  - 87 个新增测试（70 单元 + 17 集成）
- **AI 响应导航标准** (SPEC-STD-08): 统一 AI 助手响应结尾的下一步引导格式

### Fixed
- **版本更新通知触发范围** (SPEC-CLI-UPDATE-NOTIFY): `uds --version` 现在会检查并显示新版本提示；`postAction` 从白名单（仅 4 指令）改为黑名单策略（排除 `update`/`simulate`/`fix`），大幅扩大触发范围
- **`--version` 实现方式**: 使用 `configureOutput({ outputVersion })` 拦截版本输出，避免 Commander.js 的 `.option()` 覆盖导致 help 消息泄漏

### Changed
- **version-check-on-uds-operation 规则**: `context-aware-loading.ai.yaml` 中 priority 从 `optional` 提升为 `required`，AI agent 首次使用斜杠命令/Skills 时必须检查版本
- **Release Standards Skill**: 新增手动模式文档和 AI Agent 行为定义
- **/release 命令**: 新增 promote、deploy、manifest、verify 子命令路由

### Dependencies
- bump glob 13.0.1 → 13.0.6 (patch, devDependency)
- bump ora 8.2.0 → 9.3.0 (major, Node 20 required)
- bump lint-staged 15.5.2 → 16.4.0 (major, devDependency)

## [5.0.0] - 2026-03-25

> **稳定版**：v5.0.0 首个稳定版本——AI Command Behavior 标准、44 个命令完整覆盖、19 步发布前检查。

### 新增
- **AI Command Behavior 标准** (`core/ai-command-behavior.md`)：定义 AI Agent 在命令定义文件中的运行时行为结构（Entry Router、Interaction Script、Stop Points、Error Handling）
- **44 个命令完整覆盖 AI Agent Behavior**：为所有多步骤命令补齐行为定义，包含最后 6 个遗漏的命令（commit、init、config、methodology、update、check）
- **11 个新斜线命令**：`/security`、`/api-design`、`/database`、`/ci-cd`、`/incident`、`/pr`、`/scan`、`/metrics`、`/durable`、`/migrate`、`/audit`（命令总数 34→45）
- **AI Agent Behavior 覆盖率检查**：`check-ai-behavior-sync.sh` 脚本，整合至 pre-release-check.sh（Step 16，总步骤 17→19）
- **用户手册与入门教学简报** (`docs/manual/`)
- ai-command-behavior 标准的 zh-TW 和 zh-CN 翻译

### 变更
- **dev-workflow 技能更新**：纳入 11 个新命令与 2 个新场景
- **24 个交互式 SKILL.md 加入 AI Agent Behavior 引用**
- **.claude/skills SKILL.md 本地化**：6 个 SKILL.md 转为纯繁中版本，加入 source/translation frontmatter
- 移除 SKILL.md 中冗余的跨技能比较表

### 修复
- **testing-standards 重构**：以覆盖率为核心指标重构测试标准
- **3 个命令 AI 行为定义补强**：修复 4 个停止点标记
- **/commit next steps**：修正不当建议每次更新 CHANGELOG

## [5.0.0-rc.16] - 2026-03-24

> **候选发布版**：v5.0.0 的第十六个 RC，包含 10 个新技能、功能差距分析、Windows 路径缺陷修复、翻译完整性强制检查以及 AI 工具集成扩展。

### 新增
- **10 个新技能**：`/security`、`/api-design`、`/database`、`/ci-cd`、`/incident`、`/pr`、`/scan`、`/metrics`、`/durable`、`/migrate`——每个均包含 5 个平台文件（canonical + Claude + Gemini + zh-TW + zh-CN）
- **2 个新 AI 工具集成**：Aider 和 Continue.dev（AGENTS.md + README.md + REGISTRY.json）
- **翻译完整性检查**：`check-translation-sync.sh` 现在会检测缺失的技能与核心标准翻译（而不仅是过期的翻译）
- **40 个缺失翻译**：为之前未翻译的技能和核心标准回填 zh-TW（20 个文件）和 zh-CN（20 个文件）
- **技能消除歧义章节**：`/methodology` 对比 `/dev-workflow`、`/spec` 对比 `/sdd`、`/coverage` 对比 `/ac-coverage` 比较表
- **AI 技能层级**：`/ai-collaboration`、`/ai-instruction-standards`、`/ai-friendly-architecture` 中的三层系统文档
- **测试技能导航器**：`/testing` 中用于导航 6 个测试相关技能的决策树
- **补录规格**：SPEC-NEW-SKILLS-BATCH-01、SPEC-TRANSLATION-COMPLETENESS、SPEC-NEW-INTEGRATIONS-BATCH-01

### 修复
- **Windows 路径分隔符缺陷**：所有平台上的 `manifest.fileHashes` 键现已统一规范化为正斜杠（`/`）——修复了 Windows 上执行 `uds update` 后文件重复显示以及误报“已修改”的问题
  - 修复位置：`update.js`（4 处）、`check.js`（3 处）、`standards-installer.js`（1 处）、`manifest-migrator.js`（1 处）

### 变更
- **澄清 CLI 描述**：`uds check` 对比 `uds audit`，更新了 `uds spec` 的描述以交叉引用相关命令
- **UDS 技能数量**：30 → 40 个技能
- **AI 工具集成**：12 → 14 个工具

## [5.0.0-rc.15] - 2026-03-23

> **候选发布版**：v5.0.0 的第十五个 RC，包含技能版本检测修复、技能描述标准化以及 CHANGELOG 更新时机修正。

### 修复
- **技能版本检测** (SPEC-015)：`checkNewFeatures()` 现在将 null 的 `installedVersion` 视为过时，而不是跳过检查
- **技能位置推导**：更新期间 `manifest.skills.location` 现从 `installations` 数组推导，防止回退到旧版/未知状态
- **提醒多源检测**：技能更新提醒使用 installations → location → 文件系统检测链
- **命令版本检测**：相同的 null 版本修复应用于命令过时检查
- **CHANGELOG 更新时机** (SPEC-016)：`checkin-standards.md` 现正确说明 CHANGELOG 仅在预发布时更新，而非每次提交更新——与 `changelog-standards.md` 保持一致

### 变更
- **技能描述标准化**：所有 30 个已安装技能的描述统一为单行 `[UDS]` 前缀格式（中文翻译）
- **zh-TW 技能翻译**：26 个语言区域源文件同步为相同格式
- `/dev-workflow` 描述翻译为繁体中文

### 新增
- **README 致谢**：为 8 个开源灵感来源新增归属致谢章节（Superpowers、GSD、PAUL、CARL、CrewAI、LangGraph、OpenHands、DSPy）
- **发布前检查清单**：在 `OPERATION-WORKFLOW.md` §9.1 中新增技能描述格式检查
- **补录规格**：SPEC-015（更新技能版本检测）与 SPEC-016（CHANGELOG 更新时机修正）
- **内部机密文档目录**：通过 `.gitignore` 排除 `docs/internal/confidential/`
- 跨产品集成策略文档：README.md 生态定位、CLAUDE.md 标准流向说明
- SPEC-008 新增 DevAP / VibeOps CLI 集成模式规划（`--target devap/vibeops`）

## [5.0.0-rc.14] - 2026-03-19

> **候选发布版**：v5.0.0 的第十四个 RC，包含工作流强制执行架构、i18n 完整性以及 DX 改进。

### 新增
- **工作流强制执行架构** (SPEC-014)：将 UDS 工作流从文档转变为执行的四层强制体系
  - **P0 — AI 层**：`/sdd`、`/tdd`、`/bdd`、`/commit` 技能中的起飞前检查（Pre-Flight Checks）；新增 `workflow-enforcement.ai.yaml` 标准；所有 11 个 AI agent 集成模板均已更新
  - **P1 — CLI 层**：`WorkflowGate` 阶段转换验证器；`workflow-definitions.js` SDD/TDD/BDD 阶段图；会话启动工作流报告
  - **P2 — Git 层**：`check-workflow-compliance.sh` pre-commit 警告（非阻塞）；`check-commit-spec-reference.sh` commit-msg 规格建议；新增 `commit-msg` husky 钩子
  - **P3 — DX 层**：`uds check` 工作流状态显示（摘要 + 完整模式）；`/dev-workflow` 上下文感知的启动与阶段→命令映射；`pre-release-check.sh` 步骤 16 工作流合规性检查
- **核心标准**：`core/workflow-enforcement.md`——机器可强制执行的工作流关卡，具备 3 种强制模式（enforce/suggest/off）
- **i18n — 命令翻译完整性**：30 个 zh-TW + 31 个 zh-CN 斜线命令翻译；`check-translation-sync.sh` 现会验证命令翻译完整性
- **AC Coverage Assistant** 技能与 SPEC-AC-COVERAGE
- **繁体中文提交类型选项** (`.standards/options/traditional-chinese.ai.yaml`)

### 修复
- **语言切换缺陷**：`config.js` 中的 `installSkillsToMultipleAgents` 缺少 `locale` 参数——无论语言设置为何，技能始终以英文安装（影响单一语言和“all”配置流程）
- **i18n 描述前缀**：7 个已翻译的命令文件在 YAML frontmatter 的 description 字段中缺少 `[UDS]` 前缀
- **工作流合规性脚本**：整数比较错误（`grep -c` 多行输出）；对 `.workflow-state/` 和 `.standards/workflow-state/` 的双路径检测
- **test_levels 迁移**：迁移检查覆盖 5.0.0 预发布版本

### 变更
- **配置菜单**：展平配置菜单，隐藏高级设置，test_levels 迁移
- **发布前检查**：17 → 18 步（新增工作流合规性检查）
- **标准数量**：49 → 50 个核心标准（新增 workflow-enforcement）
- **技能**：重新生成为英文语言区域基线

## [5.0.0-rc.13] - 2026-03-18

> **候选发布版**：v5.0.0 的第十三个 RC，包含恢复后集成重新生成修复。

### 修复
- **恢复后集成重新生成**：修复在 `uds update` 期间恢复缺失文件后未重新生成 CLAUDE.md 的问题——在更新后完整性检查恢复之后添加 `regenerateIntegrations()` 调用，覆盖交互模式和 `--yes` 模式

### 变更
- **统计数据同步**：在 README、locales 和 uds-manifest.json 中更新核心标准数量 36→41、AI 技能数量 29→30

## [5.0.0-rc.12] - 2026-03-18

> **候选发布版**：v5.0.0 的第十二个 RC，包含新增核心标准与错误码增强。

### 新增
- **API 设计标准** (`core/api-design-standards.md`)：新的通用标准，涵盖 REST、GraphQL 和 gRPC API 设计原则、版本控制策略、分页、身份验证模式、速率限制以及 RFC 7807 错误响应（938 行）
- **数据库标准** (`core/database-standards.md`)：新的通用标准，涵盖模式设计、迁移策略、索引编制、查询优化、事务管理、SQL 与 NoSQL 决策矩阵以及敏感数据处理（828 行）
- **错误码 v1.2 — API 错误序列化**：RFC 7807 Problem Details 格式、GraphQL/gRPC 错误处理模式、重试与幂等性指引（+225 行）
- **命令 README**：补齐 9 个缺失命令以及完整的 34 个命令→技能/标准映射表
- **AC 覆盖率命令** (`/ac-coverage`)：AC 追溯矩阵与覆盖率报告生成
- **补录规格**：SPEC-STD-03（API 设计）、SPEC-STD-04（数据库）、SPEC-STD-05（错误码 v1.2）

### 变更
- **日志 YAML**：同步至 v1.2.0，包含 distributed-tracing 与 observability-pillars 规则
- **标准数量**：47 → 49 个核心标准

## [5.0.0-rc.11] - 2026-03-18

> **候选发布版**：v5.0.0 的第十一个 RC，包含 integrationConfigs 修复与模板引用路径纠正。

### 修复
- **空的 integrationConfigs**：修复 `installIntegrations()` 未返回 `manifestIntegrationConfigs`，导致 `uds update --sync-refs` 因空的 `integrationConfigs: {}` 而失败的问题
- **过期的模板引用**：在集成生成器模板和静态集成文件中，将 12 处 `.standards/commit-message-guide.md` 替换为 `.standards/commit-message.ai.yaml`

## [5.0.0-rc.10] - 2026-03-17

> **候选发布版**：v5.0.0 的第十个 RC，包含 update 命令显示修复、过期 commandHashes 清理以及端到端回归测试。

### 修复
- **选项显示路径**：修复 `uds update` 文件列表显示 `.standards/unit-testing.ai.yaml` 而非 `.standards/options/unit-testing.ai.yaml` 的问题——使用 `getStandardTargetDir()` 进行显示
- **过期 commandHashes 清理**：修复 `uds update --commands` 未清除已重命名/已删除命令的旧 commandHashes 条目的问题——添加 `replaceCommandHashesForUpdatedAgents()` 以在合并前清理过期条目

### 新增
- **端到端回归测试**：为 `uds update` 添加 2 个回归测试——选项显示路径验证、命令更新后过期 commandHashes 清理

## [5.0.0-rc.9] - 2026-03-17

> **候选发布版**：v5.0.0 的第九个 RC，包含端到端缺陷回归测试、options 子目录修复以及发布前工作流改进。

### 新增
- **端到端缺陷回归测试**：为 `uds update` 添加 5 个回归测试用例——options 子目录、extensions 类型安全、null 来源、用户内容保留、块哈希同步
- **发布前端到端步骤**：将发布前检查步骤 16 拆分为单元测试（步骤 16）+ 端到端测试（步骤 17），总检查数 16→17

### 修复
- **Options 子目录**：通过新的 `getStandardTargetDir()` 辅助函数，修复 `uds update` 将选项标准（例如 `english.ai.yaml`）安装到 `.standards/` 而非 `.standards/options/` 的问题

### 变更
- **技能同步**：将 documentation-guide 同步至 v2.1.0（Diátaxis 分类、LLM 发现、质量指标），更新 methodology SDD 阶段，扩展工作流文档
- **Gemini 同步**：将 Gemini 命令/技能清单对齐至 rc.8，扩展 `sdd.toml` 命令

## [5.0.0-rc.8] - 2026-03-17

> **候选发布版**：v5.0.0 的第八个 RC，包含 Windows 兼容性修复与 CI 稳定性改进。

### 修复
- **Windows NULL 文件**：修复 `/dev/null` 重定向在 Windows 上创建字面名为 `NULL` 的文件的问题——为 12 个脚本添加 EXIT trap 清理，并在 `.gitignore` 中加入安全防护网
- **Windows CI**：通过使用 `path.join` 替代硬编码的 Unix 路径，修复 `update-checker.test.js` 在 Windows 上的路径分隔符断言失败问题

## [5.0.0-rc.7] - 2026-03-17

> **候选发布版**：v5.0.0 的第七个 RC，包含自动更新通知、文档标准增强以及缺陷修复。

### 新增
- **自动更新通知**：CLI 命令（`init`、`list`、`add`、`config`）现会显示更新通知，并带有 24 小时节流缓存（`~/.uds/update-check.json`）
- **AI Agent 版本检查规则**：`context-aware-loading` 中新增 `version-check-on-uds-operation` 规则——AI agent 在每次会话的第一个斜线命令时检查 npm 上的 UDS 更新
- **文档标准增强**：针对文档标准的 Diátaxis 分类、LLM 友好指引、ADR 深入剖析以及质量指标

### 修复
- **Manifest Extensions 处理**：修复当 `manifest.extensions` 包含非字符串项时发生的崩溃

### 变更
- **维护文档整合**：将 `MAINTENANCE.md` 合并到 `OPERATION-WORKFLOW.md` 并归档过时文件

## [5.0.0-rc.6] - 2026-03-17

> **候选发布版**：v5.0.0 的第六个 RC，包含受 GSD、CrewAI、LangGraph、OpenHands 和 DSPy 启发的 12 项 SDD/工作流改进。

### 新增
- **Discuss 阶段**（来自 GSD）：SDD proposal 之前新的结构化讨论阶段——捕捉灰色地带、锁定范围、构建 `read_first` 清单
- **验证循环上限**（来自 GSD）：SDD verify 阶段限制为最多 3 次迭代；达到上限后强制人工介入
- **结构化任务定义**（新标准）：AI 任务定义的 4 个必填字段（`read_first`、`action`、`acceptance_criteria`、`verification`）
- **工作流状态协议**（新标准）：带有 YAML 状态文件和仅追加事件日志的 `.workflow-state/` 目录，用于跨会话持久化
- **基于波次的执行**（来自 GSD）：methodology schema 中用于并行步骤分组的可选 `wave` 字段
- **验证流水线**（来自 CrewAI/DSPy）：采用快速失败原则的双层验证（确定性 + 语义）
- **Agent 签名**（来自 DSPy）：agent 定义中用于结构化 I/O 契约的可选 `signatures` 字段
- **追溯矩阵**（来自 GSD）：SDD verify 阶段中的 REQ→AC→Test→Implementation→Commit 映射
- **上下文预算跟踪**（来自 CrewAI/GSD）：`context-aware-loading` 中的上下文窗口感知规则（60%/80% 阈值）
- **HITL 中断**（来自 LangGraph）：新的 `interrupt` 检查点强度，可暂停工作流并保存状态
- **Agent 通信协议**（来自 LangGraph/CrewAI/GSD）：三层协议（产物传递、reducer 模式、上下文隔离）
- **轨迹验证**（来自 DSPy）：跨 SDD 工作流各阶段的中间步骤质量验证

### 变更
- **SDD 工作流**：从 5 个阶段更新为 6 个阶段（Discuss → Proposal → Review → Implementation → Verification → Archive）
- **核心标准数量**：在所有 CLAUDE.md、GEMINI.md 及翻译中从 34 更新为 36
- **标准索引**：在 manifest.json、standards-registry.json、CLAUDE.md、GEMINI.md 中新增 `structured-task-definition` 与 `workflow-state-protocol`

## [5.0.0-rc.5] - 2026-03-16

> **候选发布版**：v5.0.0 的第五个 RC，包含上下文感知加载、规格跟踪以及 4 层测试金字塔。

### 新增
- **上下文感知加载**：新增 `core/context-aware-loading.md` 标准——包含 7 个领域类别以及常驻／按需加载机制（SPEC-012）
- **工作流状态跟踪**：`project-context-memory` 为跨会话状态持久化新增 `workflow-state` 类型（SPEC-013）
- **AI 驱动的规格跟踪**：`/commit` 现在会评估 `feat`/`fix` 提交的规格需求；新增用于追溯创建规格的 `/sdd-retro` 命令（SPEC-011）
- **孤儿规格检测**：`check-orphan-specs.sh/.ps1` 检测停留在非终止状态的规格（已集成至预发布第 15 步）
- **4 层测试金字塔**：从 3 层（70/20/10）升级为包含系统测试（ST）层级的 4 层（70/20/7/3）结构
- **测试治理标准**：新增包含质量目标、完成准则及环境管理的 `test-governance` 标准
- **测试模板**：新增 `test-plan-template.md` 与 `test-case-template.md`（受 ISO 29119-3 启发）

### 修复
- **命令区域设置支持**：`uds update` 现在使用项目区域设置安装斜杠命令，并以 `detectLocaleFromStandards()` 作为后备（#7）
- **Dev-Workflow 注册**：在 `AVAILABLE_COMMANDS` 中注册 `/dev-workflow` 并同步使用文档
- **双语提交正文**：将 `bilingual-body` 规则从推荐升级为必需，并附带 5 步结构指南

### 变更
- **规格引用页脚**：将提交的 `Spec References` 泛化为支持 SPEC/JIRA/FEATURE/RFC 前缀的 `Custom Reference Footers`
- **SPEC-012 清理**：移除冗余的 `activation` 字段，合并 REQ-003/004，重新对 AC 编号
- **SPEC-011 清理**：移除重复的技术设计章节，将 6 项需求合并为 4 项

## [5.0.0-rc.4] - 2026-03-05

> **候选发布版**：v5.0.0 的第四个 RC，包含新的 audit 命令、文件放置指南以及技能间互联。

### 新增
- **`uds audit` 命令**：用于 UDS 健康检查与反馈收集的新 CLI 命令（`--health`、`--patterns`、`--friction`、`--report`）
- **文件放置决策指南**：新增 `core/guides/file-placement-guide.md`——总决策树、反向查找索引（30 多种文件类型）、代码组织深度解析、开发产物生命周期
- **源代码组织术语**：在 `project-structure.md` 中为 utils/helpers/shared/lib/internal 增加概念辨析
- **配置文件放置**：为工具配置、应用配置、环境变量、CI/CD、IaC 新增标准位置
- **生成代码放置**：新增包含 gitignore 指南的 `src/generated/` 标准
- **开发产物目录**：新增具备生命周期管理的 `docs/working/` 结构（头脑风暴、RFC、调研、POC）
- **扩充文档类型矩阵**：在 `documentation-structure.md` 中提供完整的文件类型 → 目标路径映射
- **Audit Assistant 技能**：新增具备健康检查与反馈工作流的 `/audit` 技能
- **技能互联**：为 `/checkin`、`/review`、`/commit`、`/sdd` 添加指向 `/audit` 的下一步建议
- **下一步指导**：为 17 个既有技能添加下一步建议

### 修复
- **配置显示语言**：修复 `displayLanguage` 未传递至配置路径的问题
- **技能卸载程序测试**：修复测试意外删除用户级目录的问题
- **文档中的包名**：修复错误的包名引用

### 变更
- **README 结构**：提取预发布信息，并添加配置／卸载／方法论章节
- **SPEC-AUDIT-01**：重写为面向用户的规格说明，并集成头脑风暴

## [5.0.0-rc.2] - 2026-02-13

> **候选发布版**：v5.0.0 的第二个 RC，包含文档改进与 CLI 缺陷修复。

### 修复
- **斜杠命令去重**：防止为同一个智能体选择多个级别时重复安装技能
- **Update 命令**：在 `uds update` 期间检测并安装新标准

### 变更
- **README 结构**：将所有 README 重构为模块化且对 AI 优化的格式

## [5.0.0-rc.1] - 2026-02-12

> **候选发布版**：这是 v5.0.0 的第一个 RC。所有主要功能均已完成；本版本重点在于正式稳定版发布前的最终验证。

### 新增
- **三维反向工程**：将 `/reverse` 演进为涵盖逻辑、数据和运行时维度的完整系统考古（`/reverse spec`、`/reverse data`、`/reverse runtime`）

### 修复
- **技能计数**：修复 `sync-manifest.mjs`，使其仅统计包含 `SKILL.md` 的目录（原为 32 个，现修正为 27 个）
- **缺失命令注册**：在 `AVAILABLE_COMMANDS` 和技能 README 表格中注册 `/brainstorm`

### 变更
- **工作流可视化**：在 `WORKFLOW-ANALYSIS.md` 中扩展 Mermaid 图，增加三维反向工程子节点与数据流箭头

## [5.0.0-beta.12] - 2026-02-12

### 新增
- **工作流先决条件系统**：新增用于在执行前检查命令先决条件的 `workflow-prerequisites.yaml` 注册表与 `prerequisite-check.md` AI 行为协议
- **工作流分析文档**：详尽的 `docs/WORKFLOW-ANALYSIS.md`，包含流程清册、决策速查表以及采纳路线图
- **工作流缺口跟踪器**：`docs/WORKFLOW-GAPS.md`，跟踪已识别出的 12 个缺口（CI/CD、事故响应等）
- **跨命令交接指导**：`/discover`、`/reverse`、`/derive`、`/release` 现在会在完成后建议合理的下一步
- **文档生成工具**：用于自动同步 README 统计信息的 `scripts/sync-manifest.mjs` 与 `scripts/generate-docs.mjs`
- **`/brainstorm` 技能**：结构化 AI 辅助构想技能

### 变更
- **文档同步**：更新所有 README、MAINTENANCE.md、STANDARDS-MAPPING.md、FEATURE-REFERENCE.md 中的准确计数（32 个标准、26 个技能、30 个命令）
- **AI 工具支持表**：扩充以涵盖 Gemini CLI、Cursor、Cline/Roo Code、Windsurf 及其详细功能支持
- **预发布检查**：在 `pre-release-check.sh` 中增加步骤 1.5 `docs:sync`
- **技能先决条件**：`/derive` 现在声明 `spec-approved` 先决条件；`/release` 声明 `release-check` 先决条件

## [5.0.0-beta.11] - 2026-02-11

### 新增
- **显示语言设置**：`uds config` 新增用于独立于提交语言设置界面显示语言的选项

### 修复
- **语言解析缺陷**：修复 `uds config` 中的语言检测后备逻辑，以正确解析显示语言
- **发布脚本**：修复发布脚本中 README 版本更新的缺陷

### 变更
- **README**：添加测试版安装指南，并将版本显示同步至 5.0.0-beta.10

## [5.0.0-beta.10] - 2026-02-11

### 新增
- **提交语言指令**：集成文件现在包含提交信息语言说明，确保 AI 工具即使在没有 `commit-message.ai.yaml` 的情况下也始终知晓预期语言
- **配置国际化**：为 vibe coding 预设和配置偏好界面提供三语翻译（en/zh-tw/zh-cn）

### 修复
- **配置语言检测**：`uds config` 现在从项目清单自动检测界面语言，与 `uds configure` 行为一致
- **文档完整性**：在不存在 Reference 标记时跳过引用同步章节
- **失效链接**：修复 212 个文件中存在的 153 处 markdown 失效链接

### 变更
- **文档完整性检查器**：用于预发布验证的新脚本，包含 4 项子检查
- **命令同步检查器**：集成至预发布检查的新脚本

## [5.0.0-beta.9] - 2026-02-10

### 新增
- **缺失命令文件**：在 `skills/commands/` 中创建 `changelog.md`、`checkin.md`、`discover.md`、`docgen.md`，用于 Gemini CLI TOML 转换
- **注册 `/docs` 与 `/guide`**：添加至 `AVAILABLE_COMMANDS`，以便所有智能体都能发现这些命令

### 变更
- **日常工作流指南 v1.1.0**：新增第 0 阶段项目现状评估章节，更新带有 `/discover` 入口的决策树，在策略 3 中将 `/discover` + `/reverse` 作为先决条件添加，并在命令参考中扩充 `/discover`、`/reverse`、`/refactor`
- **翻译同步**：zh-TW 与 zh-CN 的 DAILY-WORKFLOW-GUIDE.md 已更新至 v1.1.0

## [5.0.0-beta.8] - 2026-02-10

### 新增
- **部署标准**：包含交叉引用的部署工作流新核心标准（`core/deployment-standards.md`）
- **`/discover` 技能**：用于评估项目就绪度的第 0 阶段项目现状评估技能
- **技能提炼 SDD**：从既有工作流中系统化提取技能的规格说明

### 变更
- **`/spec` → `/sdd` 更名**：将 `/spec` 技能更名为 `/sdd`（规格驱动开发，Spec-Driven Development），补充缺失的子命令，并同步 zh-CN 的拆分架构
- **SKILL.md 拆分架构**：技能现采用精简命令参考 + 详细指南的结构
- **`uds configure` → `uds config`**：将 `uds configure` 合并至 `uds config` 作为统一入口

### 修复
- **集成文件保留**：`uds update` 现在会保留集成文件（AGENTS.md、.cursorrules 等）中用户自定义的内容
- **翻译源路径**：修复 zh-CN 和 zh-TW 翻译文件中 143 处错误的相对路径
- **预发布检查脚本**：`check-docs-sync.sh` 现在对测试版发布正确跳过 `.claude-plugin/` 版本检查
- **范围标记**：将 `project-context-memory.md` 的作用域从 `Project-Specific (Local)` 修正为 `uds-specific`

## [5.0.0-beta.7] - 2026-02-09

### 新增
- **项目上下文记忆（PCM）**：用于捕获、检索和强制执行特定于项目的上下文、架构决策和领域知识的新核心标准（`core/project-context-memory.md`、`.standards/project-context-memory.ai.yaml`）
- **开发者持久记忆（DPM）**：将开发者持久记忆标准与常驻协议（Always-On Protocol）交付流水线集成（`core/developer-memory.md`、`.standards/developer-memory.ai.yaml`）
- **记忆采纳策略**：位于 `docs/specs/system/` 中的记忆系统采纳架构指南
- **初始项目上下文**：在 `.project-context/uds-architecture.md` 中初始化项目上下文文档

## [5.0.0-beta.6] - 2026-02-06

### 修复
- **Init → 集成标准透传**：修复 `init` 命令未将 `installedStandards` 传递给集成安装程序，导致集成文件使用硬编码默认类别的问题
- **集成类别过滤**：调整集成安装程序，根据实际安装的标准过滤所请求的类别，防止在生成的文件（AGENTS.md、GEMINI.md、.cursorrules 等）中出现孤立的 `Reference:` 行
- **AI YAML 格式识别**：在 `STANDARD_TO_CATEGORY` 映射中增加 `.ai.yaml` 格式条目，使 `uds check` 能正确识别针对 AI 优化的标准文件
- **跨格式引用比较**：重写 `compareStandardsWithReferences` 以在类别层级进行比较，正确处理 `.md` 与 `.ai.yaml` 的格式差异

### 新增
- **回归测试**：新增 7 项针对性测试，覆盖类别过滤、`.ai.yaml` 格式支持以及跨格式引用比较

## [5.0.0-beta.5] - 2026-02-06

### 修复
- **命令完整性路径解析**：修复 `checkCommandsIntegrity` 在调用 `getCommandsDirForAgent` 时未传入 `level` 参数，导致所有被跟踪命令均报告为“缺失”的问题
- **国际化技能标签**：从 `skillsProject`/`skillsGlobal` 标签中移除硬编码的 `.claude/` 路径，以正确支持多智能体显示
- **命令安装显示**：修复 `commands.installations` 对象渲染为 `[object Object]` 而非 `agent: level` 格式的问题
- **AGENTS.md 路径映射**：在 `getToolFromPath` 中为 OpenAI Codex CLI 集成检测补全缺失的 `AGENTS.md → codex` 映射

### 新增
- **回归测试**：新增 4 项针对性回归测试，覆盖上述所有缺陷修复

## [5.0.0-beta.4] - 2026-02-06

### 修复
- **集成安装程序配置解析**：修复集成安装程序中 `displayLanguage` 与 `skillsConfig` 的配置解析
  - 生成 AI 工具集成文件时，现可正确解析配置值

### 新增
- **集成内容矩阵测试**：为 `generateIntegrationContent` 新增全面的数据驱动矩阵测试
  - 覆盖生成集成内容时的所有语言 × 配置组合

## [5.0.0-beta.3] - 2026-02-06

### 修复
- **Husky Init 后备机制**：在 `husky init` 失败时增加创建 `.husky` 目录的后备逻辑
  - 确保即使在 `husky init` 遇到错误的环境中，也能正确设置 pre-commit 钩子

## [5.0.0-beta.2] - 2026-02-05

### 修复
- **E2E 测试**：针对新的 config 命令 JSON API 更新了 config-flow 测试
  - config 命令现在输出 JSON 格式而非界面标签
  - 界面语言测试因等待重新设计而跳过

## [5.0.0-beta.1] - 2026-02-05

### 新增
- **市场版本策略**：为 `.claude-plugin/` 文件实现仅更新稳定版的策略
  - 预发布版本（alpha/beta/rc）不再更新市场文件
  - 市场用户仅接收经过测试的稳定版本
  - 使用预发布检测增强了 `check-version-sync.sh` 脚本

### 修复
- **内置路径解析**：修正了技能、智能体与工作流安装程序的路径
  - 修复 `skills/claude-code/agents` → `skills/agents`
  - 修复 `skills/claude-code/workflows` → `skills/workflows`
  - 修复 `skills/claude-code` → `skills`
- **E2E 测试预期**：更新了 init-flow 测试以匹配实际的 CLI 输出格式
  - 级别格式：`Level: Level 3` 代替 `Level: 3`
  - 移除了不存在的 integrations 汇总标签

## [5.0.0-alpha.2] - 2026-02-04

### 新增
- **双层架构**：在想象层（规范指南，guidelines）旁引入物理规格（验证器，validators）
- **预测性模拟**：新增 `uds simulate` 命令以预览合规性检查
- **自动修复**：新增 `uds fix` 命令以自动解决违规项
- **Agent 就绪 API**：为 check、simulate 和 fix 命令新增 `--json` 输出模式
- **Pre-commit 集成**：`uds init` 现会自动配置 Husky hooks
- **智能定位器**：通过模糊匹配和内部 ID 验证增强标准文件解析

### 变更
- 将 `changelog`、`versioning`、`testing`、`security`、`code-review`、`commit-message`、`project-structure` 升级为带物理规格的 v2 格式

## [5.0.0-alpha.1] - 2026-01-29

### 变更
- **核心标准瘦身（Token 优化）**：大幅重构以降低 AI 上下文负载
  - **规则与指南分离**：将庞大的标准文件拆分为简洁的“规则”（供 AI 使用）与详尽的“指南”（供人类／参考使用）
  - **方法论迁移**：将纯方法论教程从 `core/` 移动至 `methodologies/guides/`
  - **新目录结构**：
    - `core/`：仅包含可操作的规则、检查清单和阈值（目标每个 < 10KB）
    - `core/guides/`：包含详细说明、教程和示例
    - `methodologies/guides/`：包含完整的方法论指南（TDD、BDD、SDD 等）
  - **显著缩减体积**：
    - `testing-standards.md`：141KB → 14KB（缩减 90%）
    - `test-driven-development.md`：54KB → ~1KB 桩代码（已移至 methodologies）
    - `git-workflow.md`：38KB → ~8KB（已拆分）
    - `core/` 目录整体体积减少约 75%

## [4.3.0-alpha.1] - 2026-01-26

> ⚠️ **Alpha 版本**：此版本为用于本地测试的内部验证版本。不建议在生产环境中使用。

### 变更
- **方法论重构**：将 SDD 从 TDD/BDD/ATDD 家族中大幅分离
  - SDD（规格驱动开发，Spec-Driven Development，2025）现定位为独立的 AI 时代方法论
  - TDD/BDD/ATDD（1999–2011）归类为传统开发方法论
  - 从所有文档中移除了错误的“ATDD → SDD → BDD → TDD”顺序
  - 在 TDD、BDD 和 ATDD 标准中新增“方法论分类”章节
  - 基于文献调研：GOOS（Freeman & Pryce）、Thoughtworks、Martin Fowler

- **SDD 增强**（v2.0.0）：
  - 新增“SDD 作为独立方法论”章节及历史背景
  - 基于 Martin Fowler 2025 新增 SDD 成熟度级别（Spec-first、Spec-anchored、Spec-as-source）
  - 新增“常见陷阱”章节及行业警告
  - 新增“验证层”章节及理论基础（契约式设计，Design by Contract；合约测试，Contract Testing）
  - 新增“SDD + 测试集成模型”及实用工作流
  - 新增参考文献：Thoughtworks、GitHub spec-kit、InfoQ、Specmatic

- **正向推演增强**（v1.1.0）：
  - 新增用于合约验证的 contract.json 输出格式
  - 新增用于模式验证（schema validation）的 schema.json 输出格式
  - 新增用于生成验证产物的 `/derive-contracts` 命令

- **传统方法论更新**：
  - TDD（v1.2.0）：新增方法论分类，将集成金字塔替换为双循环 TDD（Double-Loop TDD，GOOS）
  - BDD（v1.1.0）：新增方法论分类、双循环 TDD 说明、协作验收（Collaborative Acceptance）
  - ATDD（v1.1.0）：新增方法论分类、ATDD 作为可选协作、两种方式对比

- **测试完整性维度**：从 7 个维度更新为 8 个维度
  - 新增第 8 维度：AI 测试生成质量（变异测试、断言深度、测试目的）
  - 更新技能（skills）、AI YAML 和集成以反映 8 维度框架
- **防幻觉标准**：新增统一标签系统（Unified Tag System）
  - 确定性标签：用于分析现有内容（`[Confirmed]`、`[Inferred]`、`[Assumption]`、`[Unknown]`、`[Need Confirmation]`）
  - 推导标签：用于生成新内容（`[Source]`、`[Derived]`、`[Generated]`、`[TODO]`）
  - 工作流映射指明了每个工作流类型适用的标签类别

### 文档
- 更新技能以进行 Phase 1-4 一致性同步：
  - `test-coverage-assistant`：7→8 个维度
  - `ai-collaboration-standards`：新增统一标签系统
  - `reverse-engineer`：新增统一标签系统引用
  - `forward-derivation`：新增统一标签系统引用
- 更新 AI 标准（YAML）：
  - `test-completeness-dimensions.ai.yaml`：新增第 8 维度
  - `anti-hallucination.ai.yaml`：新增带工作流映射的统一标签系统
- 更新集成：
  - `github-copilot/copilot-instructions.md`：7→8 个维度

## [4.2.0] - 2026-01-24

### 新增
- **CLI 规格**：将 31 份 CLI 规格文档发布为稳定版（Stable）
  - Agent 命令规格（2 份文档）：概述、安装
  - Workflow 命令规格（2 份文档）：概述、安装
  - AI-Context 命令规格（2 份文档）：概述、配置生成
  - Init 命令规格（4 份文档）：概述、项目检测、配置流程、执行阶段
  - Check 命令规格（4 份文档）：概述、完整性检查、状态显示、恢复操作
  - Update 命令规格（4 份文档）：概述、版本检查、标准更新、特性检测
  - Configure 命令规格（3 份文档）：概述、选项类型、AI 工具管理
  - 共享模块规格（7 份文档）：Manifest 模式（Manifest Schema）、文件操作、哈希跟踪、集成生成、技能安装、AI Agent 路径、提示词（Prompts）
  - List 命令规格（1 份文档）
  - Skills 命令规格（1 份文档）

### 变更
- **AI Agent 路径**：更新配置以匹配官方厂商文档（2026-01-24）
  - Cline：根据[官方文档](https://docs.cline.bot/features/slash-commands/workflows)将路径从 `.cline/` 更正为 `.clinerules/`
  - Windsurf：根据[官方文档](https://docs.windsurf.com/windsurf/cascade/workflows)新增带有 `.windsurf/rules/` 路径的 workflows 支持
  - Gemini CLI：新增 `commandFormat: 'toml'` 字段以说明 TOML 格式要求
  - GitHub Copilot：将 `commands.user` 标记为不支持（仅限 VS Code IDE）

### 修复
- **CLI**：`promptCommandsInstallation` 现可妥善处理带有 `commands.user: null` 的 agent
  - 对不支持该选项的 agent（例如 GitHub Copilot CLI）跳过用户级选项

### 文档
- **Claude Code Skills/Commands 合并说明**：新增文档说明 Claude Code v2.1.3+ 已合并斜杠命令（slash commands）与技能（skills）
  - `.claude/commands/review.md` 和 `.claude/skills/review/SKILL.md` 都会创建 `/review`
  - 现有的 commands 文件继续有效
  - 其他 AI 工具（OpenCode、Roo Code、Gemini CLI）仍使用传统 commands 格式
- **新规格**：新增 [SHARED-07] AI Agent 路径更新规格（`docs/specs/cli/shared/ai-agent-paths-update.md`）

## [4.1.0] - 2026-01-21

### 新增
- **重构标准 v2.0**：结合行业最佳实践进行了增强
  - 战术策略：预备性重构（Preparatory Refactoring，Kent Beck）、童子军法则（Boy Scout Rule，Robert C. Martin）
  - 战略策略：防腐层（Anti-Corruption Layer，Eric Evans/DDD）
  - 用于快速选择策略的决策矩阵摘要
- **新 `/refactor` 命令**：带决策树的交互式重构助手
  - `/refactor decide` - 运行“重构 vs. 重写”决策树
  - `/refactor tactical` - 建议日常重构策略
  - `/refactor strategic` - 指导架构重构
  - `/refactor legacy` - 遗留代码安全策略
- **AI 工具集成**：面向非 Claude Code 工具的重构指南
  - GitHub Copilot Chat 提示词模板
  - Cursor/Windsurf rules 章节
  - Gemini CLI 指南

### 变更
- **重构标准**：重新组织为三层分类
  - 战术级（日常、分钟级操作）
  - 战略级（架构级、数周至数月周期）
  - 安全级（遗留代码保护）
- **注册表**：`refactoring-standards` 从“reference”类别升级为“skill”类别，并带有 `refactoring-assistant` 技能映射

### 文档
- 更新重构标准的繁体中文（zh-TW）翻译（v2.0.0）
- 更新重构标准的简体中文（zh-CN）翻译（v2.0.0）
- 新命令翻译：`/refactor` 的繁体中文（zh-TW）与简体中文（zh-CN）版
- 更新重构标准的 AI 优化 YAML 格式

---

## [4.0.0] - 2026-01-20

### 亮点

**双向推演系统**：v4.0 引入了完整的“规格-代码”生命周期管理系统：
- **正向推演**：从 SDD 规格生成 BDD/TDD/ATDD 产物
- **反向工程**：从现有代码提取规格
- 两者共同构成双向推演循环，用于保持“规格-代码”一致性

### 新增
- **6 项新核心标准**：
  - `behavior-driven-development.md` - BDD 方法论与标准
  - `acceptance-test-driven-development.md` - ATDD 方法论与标准
  - `reverse-engineering-standards.md` - 反向工程标准
  - `forward-derivation-standards.md` - 正向推演标准
  - `ai-instruction-standards.md` - AI 指令编写标准
  - `refactoring-standards.md` - 重构标准与模式
- **8 个新技能**（共 23 个）：
  - `forward-derivation/` - 正向推演命令（`/derive-bdd`、`/derive-tdd`、`/derive-atdd`、`/derive-all`）
  - `reverse-engineer/` - 增强的反向工程（`/reverse-sdd`、`/reverse-bdd`、`/reverse-tdd`）
  - `bdd-assistant/` - BDD 工作流助手（`/bdd`）
  - `atdd-assistant/` - ATDD 工作流助手（`/atdd`）
  - `methodology-system/` - 方法论选择（`/methodology`）
  - `refactoring-assistant/` - 重构助手
  - `checkin-assistant/` - 签入助手
  - `commands/` - 斜杠命令集合（`/checkin`、`/methodology` 等）
- **CLI 增强**：
  - 按工具级别选择（每个 AI 工具可独立选择用户级或项目级）
  - 用于故障排查的 `--debug` 标志
  - 已拒绝特性记忆
  - 增强的文件完整性跟踪
  - 对 Claude Code 的 Commands 安装路径支持

### 变更
- **方法论系统**：现已可用于生产环境（此前为实验性 🧪）
  - 完整集成 TDD/BDD/SDD/ATDD 工作流
  - 移除实验性标记
- **CLI**：统一 Skills 和 Commands 安装的提示格式
- **文档**：同步所有组件的术语

### 修复
- 市场检测可靠性
- 本地化技能中的 YAML frontmatter 语法

---

## [4.0.0-beta.2] - 2026-01-20

### 新增
- **CLI**：Claude Code Commands 路径支持（`ai-agent-paths.js`）
  - 为 Claude Code 新增 `commands.project` 和 `commands.user` 路径
  - 支持向 Claude Code 安装 Commands

### 修复
- **CLI**：市场检测现仅信任实际安装状态
  - 此前同时信任 manifest 记录与实际状态（记录可能已过时）
  - 现检查 `marketplaceInfo?.installed === true` 而非 manifest 中的 `skills.location`
  - 修复了过时的 manifest 可能导致错误的市场检测的问题
- **Skills**：`argument-hint` 字段中的 YAML frontmatter 语法错误
  - 方括号 `[]` 在 YAML 中需要加引号以避免被解析为数组
  - 已修复 `locales/zh-TW/` 和 `locales/zh-CN/` 下的 `methodology.md` 与 `bdd.md`

## [4.0.0-beta.1] - 2026-01-19

### 新增
- **核心标准**：正向推演标准 (`core/forward-derivation-standards.md`)
  - 从已批准的 SDD 规格推导 BDD 场景、TDD 测试骨架和 ATDD 验收测试
  - 与逆向工程（Reverse Engineering）相辅相成，构建双向推演系统
  - 严格的 1:1 AC 映射，符合反幻觉规范
  - 确定性框架：`[Source]`、`[Derived]`、`[Generated]`、`[TODO]` 标签
- **技能**：Claude Code 的正向推演技能 (`skills/forward-derivation/`)
  - 新命令：`/derive-bdd`、`/derive-tdd`、`/derive-atdd`、`/derive-all`
  - 多语言支持：TypeScript、Python、Java、Go
  - 支持 Given-When-Then 和列表项格式的 AC 解析器
- **规范**：核心标准创建工作流 (`docs/specs/system/core-standard-workflow.md`)
  - 定义了创建/更新核心标准的 8 阶段工作流
  - 文件检查清单与技能适用性矩阵
  - CLI 集成要求与验证检查点
- **CLI**：按工具选择 Commands 的安装层级
  - Commands 现使用 `{agent, level}` 格式（与 Skills 保持一致）
  - 用户可为每个 AI 工具选择用户层级（User Level）或项目层级（Project Level）
  - 默认勾选项目层级（Project Level）

### 变更
- **CLI**：统一了 Skills 和 Commands 安装的提示格式
  - 两者均使用 multiSelect，并提供按工具的 User/Project 层级选项
  - `update` 命令现使用与 `init` 相同的提示，以保持一致性
- **文档**：斜杠命令与 CLI 术语保持同步
  - 采用层级：Essential/Recommended/Enterprise → Starter/Professional/Complete
  - 标准范围：Minimal/Full → Lean/Complete
  - 内容模式：Index → Standard
  - Skills/Commands 安装：简单列表 → 按工具 multiSelect

### 文档
- 更新 `core/spec-driven-development.md`，新增正向推演集成章节
- 更新了正向推演和 SDD 标准的 AI YAML 文件

## [3.5.1-beta.22] - 2026-01-19

### 新增
- **CLI**：`uds update` 命令新增 `--debug` 标志
  - 显示 Skills/Commands 检测的详细调试输出
  - 帮助排查某些 AI 工具可能未出现在安装提示中的原因
  - 输出内容：aiTools 列表、已拒绝的功能、配置检查、安装状态

## [3.5.1-beta.21] - 2026-01-19

### 修复
- **CLI**：使用 `--skills-location` 选项时 Skills 安装现已能正常工作
  - Bug 修复：将属性名称从 `location` 更改为 `level`，以匹配 `installSkillsToMultipleAgents` API
  - 此前报告成功但未创建任何文件

## [3.5.1-beta.20] - 2026-01-19

### 新增
- **CLI**：`uds configure` 命令新增 `--skills-location` 选项
  - 允许在非交互模式下指定 Skills 安装层级（project/user）
  - 示例：`uds configure --type skills --ai-tool opencode --skills-location user`

### 变更
- **Commands**：`/update` 步骤 4 改写为多阶段 AskUserQuestion 流程
  - 步骤 4a：检测缺失的 Skills
  - 步骤 4b：询问要安装哪些 AI 工具（multiSelect）
  - 步骤 4c：询问安装位置（project/user）
  - 步骤 4d-e：Commands 的类似流程
  - 解决了 AskUserQuestion 选项数量限制（最多 4 个）的约束

### 文档
- **Commands**：更新 `/config` 命令，补充 `--skills-location` 选项示例

## [3.5.1-beta.19] - 2026-01-19

### 修复
- **Skills**：将斜杠命令与 CLI 行为同步
  - `/update`：添加已拒绝功能处理、过期 Skills 更新流程、项目/用户层级选择、复选框多选界面
  - `/init`：对齐步骤顺序与 CLI 一致（AI Tools → Skills → Commands → ...），扩展至 9 种 AI 工具，补充缺失的配置步骤
  - `/config`：添加 skills/commands 配置类型、用于非交互式安装的 `--ai-tool` 选项、已拒绝功能处理
  - `/check`：添加交互模式文档、Skills/Commands 完整性检查，移除已废弃的手动验证步骤

## [3.5.1-beta.18] - 2026-01-19

### 新增
- **CLI**：记住已拒绝的 Skills/Commands 选项
  - manifest 中新增 `declinedFeatures` 字段以存储已拒绝的条目
  - `uds update` 从提示中排除先前已拒绝的 Skills/Commands
  - `uds configure` 显示已拒绝条目并提供重新安装选项
  - 支持分别独立跟踪 Skills 和 Commands
- **CLI**：动态检测 Marketplace 安装
  - `uds check` 动态检测 Marketplace Skills，无论 manifest 状态如何
  - `uds configure` 在 Skills 配置中显示 Marketplace 状态
  - `uds update` 为 Claude Code 显示“(already via Marketplace)”提示
  - 检测到 Marketplace 时，基于文件的安装默认不勾选
  - 增加共存说明：基于文件和 Marketplace 可以共存工作

## [3.5.1-beta.17] - 2026-01-18

### 新增
- **CLI**：`uds config` 命令的智能应用（smart apply）功能
  - 在配置更改后自动提示重新生成集成文件
  - 用于非交互式配置更改的新增 `--yes` 标志
  - 从 update.js 中提取 `regenerateIntegrations()` 作为可复用函数
- **CLI**：E2E 测试规范的自动同步机制
  - 新的 `npm run generate:e2e-spec` 脚本从测试文件生成 E2E-TEST-CASES.md
  - 用于 CI 验证规范是否为最新的 `--check` 模式
  - 解析测试文件以提取 describe/it 块及 CLI 选项
- **CLI**：针对 Skills、Commands 和集成块的增强文件跟踪系统
  - manifest 中新增 `skillHashes` 字段跟踪各技能文件的完整性
  - manifest 中新增 `commandHashes` 字段跟踪斜杠命令文件的完整性
  - 新增 `integrationBlockHashes` 字段，将 UDS 标记块内容与用户自定义内容分开跟踪
  - `uds check` 现已验证 Skills、Commands 及集成 UDS 块的完整性
  - 用户修改 UDS 标记外部的内容不会触发警告
- **Utils**：`hasher.js` 中新增哈希计算函数
  - `computeIntegrationBlockHash()`：仅计算 UDS 标记块内容的哈希
  - `compareIntegrationBlockHash()`：比对块哈希，检测标记是否被移除
  - `computeDirectoryHashes()`：递归计算目录下所有文件的哈希
- **Tests**：全面的 E2E 测试覆盖
  - 涵盖 6 个命令（init、config、check、update、list、skills）的 73 个 E2E 测试
  - 包含选项覆盖矩阵的 E2E-TEST-CASES.md 规范文档

### 变更
- **CLI**：Manifest 版本升级至 `3.3.0` 以标记增强文件跟踪功能
- **CLI**：`writeIntegrationFile()` 现返回包含 UDS 块哈希的 `blockHashInfo`
- **CLI**：`installSkillsForAgent()` 和 `installCommandsForAgent()` 现返回 `fileHashes`
- **CLI**：`installSkillsToMultipleAgents()` 和 `installCommandsToMultipleAgents()` 在 `allFileHashes` 中聚合哈希

### 修复
- **CLI**：集成文件路径现返回相对路径以保持 manifest 一致性
- **CLI**：`uds check` 现能正确跟踪所有已安装的标准

## [3.5.1-beta.16] - 2026-01-16

### 新增
- **Commands**：为 `/check` 命令新增 Skills 验证诊断
  - 显示每个 AI 工具的实际目录内容
  - 帮助识别 Skills 安装报告中的假阳性
  - 将 `Bash(ls:*)` 添加到 allowed-tools

### 修复
- **Commands**：`/update` 现显示具体的版本类型（Alpha/Beta/RC）
  - 选项显示“更新至 Beta”而非通用的“更新至 Pre-release”
  - 在描述中包含稳定性指示器（🔴🟡🟢）

## [3.5.1-beta.15] - 2026-01-16

### 新增
- **Commands**：为 `/update` 命令添加预发布版本类型说明
  - 新章节解释 alpha、beta、rc 稳定性级别（🔴🟡🟢）
  - 包含版本比较：`alpha < beta < rc < stable`
  - 链接到 `core/versioning.md` 获取详细标准

## [3.5.1-beta.14] - 2026-01-16

### 修复
- **Commands**：`/update` 现已在 AskUserQuestion 中显示正确的版本类型
  - 稳定版本显示 "latest stable version X.Y.Z"
  - 预发布版本显示 "pre-release version X.Y.Z-tag.N"
  - 修复了具有误导性的 "stable version 3.5.1-beta.13" 描述

## [3.5.1-beta.13] - 2026-01-16

### 变更
- **Commands**：斜杠命令现使用 `AskUserQuestion` 进行交互式提示
  - `/update` 步骤 4：询问用户选择 Skills/Commands 安装选项
  - `/init` 步骤 3：询问用户选择用于安装 Skills/Commands 的 AI 工具
  - 设计原则：“CLI 提示应在斜杠命令中得到镜像体现”

### 新增
- **CLI**：`uds configure` 命令新增 `--ai-tool` 选项
  - 支持针对特定工具进行非交互式 Skills/Commands 安装
  - 用法：`uds configure --type skills --ai-tool claude-code`
  - 支持：claude-code、opencode、copilot、gemini-cli、roo-code、cursor、windsurf、cline、codex

## [3.5.1-beta.12] - 2026-01-16

### 变更
- **Commands**：更新 `/update` 命令文档
  - 在步骤 4 中体现 CLI 的自动 Skills/Commands 安装
  - 将 `uds configure` 添加到 allowed-tools 中以作为非 TTY 备用方案
  - 说明用于 AI 工具选择的复选框多选界面
  - 为非 TTY 环境提供 `uds configure` 命令

## [3.5.1-beta.11] - 2026-01-16

### 变更
- **CLI**：`check` 命令现已为只读
  - 不再提示安装缺失的 Skills/Commands
  - 显示提示："Run `uds update` to install missing Skills/Commands"
  - 遵循单一职责原则：check 负责报告，update 负责安装

### 移除
- **CLI**：从 `check` 命令中移除了安装提示
  - 移除了 `promptSkillsCommandsInstallation()` 函数
  - 清理了未使用的导入

## [3.5.1-beta.10] - 2026-01-16

### 修复
- **Commands**：为 YAML frontmatter 中的 `argument-hint` 值添加引号
  - 修复了 OpenCode 和其他严格 YAML 解析器中的 YAML 解析错误
  - 值中的方括号现已正确加上引号
  - 影响 16 个命令文件
- **CLI**：在 check 命令显示交互式提示前添加 TTY 检查
  - 防止出现 "ERR_USE_AFTER_CLOSE: readline was closed" 错误
  - check 命令现仅在 stdin/stdout 为 TTY 时进行提示
  - 修复了从非交互式环境（例如 Claude Code skills）运行时发生的崩溃

## [3.5.1-beta.9] - 2026-01-16

### 变更
- **CLI**：Skills/Commands 安装现使用复选框多选替代 yes/no
  - `uds update`：用户现可选择特定的 AI 工具来安装 Skills/Commands
  - `uds check`：在状态显示后添加了缺失 Skills/Commands 的安装提示
  - 所有选项默认勾选（opt-out 退出机制）
  - 提供带有校验的跳过选项

### 新增
- **i18n**：为英文、繁体中文和简体中文的复选框提示新增消息键
  - `selectSkillsToInstall`、`selectCommandsToInstall`
  - `skipSkillsInstallation`、`skipCommandsInstallation`
  - `skipValidationError`

## [3.5.1-beta.8] - 2026-01-16

### 修复
- **CLI**: 空的 skills 目录不再被检测为已安装
  - `getInstalledSkillsInfoForAgent` 现在会检查实际的 `SKILL.md` 文件
  - `uds update` 第 4 步正确提示为 OpenCode、GitHub Copilot 等安装 Skills
  - 解决空的 `.claude/skills/`、`.github/skills/`、`.opencode/skills/` 目录被错误报告为已安装技能的问题

### 新增
- **测试**: 针对空目录检测新增 2 个单元测试
  - 测试空的 skills 目录返回 `null`
  - 测试带有空子目录的 skills 目录返回 `null`

## [3.5.1-beta.7] - 2026-01-16

### 修复
- **CLI**: 非交互模式（`--yes`）现在可以正确将配置保存到 manifest
  - `aiTools` 字段现在填充了检测到的 AI 工具（此前为空 `[]`）
  - `options` 字段现在保存工作流、合并策略、提交语言、测试层级（此前全为 `null`）
  - 为支持基于文件的命令的代理（opencode、copilot 等）自动安装命令

### 新增
- **文档**: CLAUDE.md 中的测试工作流（Testing Workflow）章节
  - 说明何时运行测试（开发、pre-commit、pre-PR、CI/CD）
  - 列出 git hook 自动化检查项
  - 提供手动测试命令参考
- **测试**: 针对非交互模式错误修复新增 11 个测试
  - `init.test.js` 中的 8 个单元测试
  - `init-flow.test.js` 中的 3 个 E2E 测试

## [3.5.1-beta.6] - 2026-01-16

### 修复
- **CLI**: Skills 和 Commands 现在已正确打包至 npm 包中
  - 将 `skills/` 添加至 `prepack.mjs` 打包目录
  - `skills-installer.js` 现在优先使用随附打包路径而非开发路径
  - 解决“Installed commands for X AI tools”显示成功但目录实际为空的问题
- **CLI**: 在 update 命令中注册了 `--skills` 和 `--commands` 选项
  - 这些选项已在代码中实现，但此前未向用户开放
  - `uds update --skills` 与 `uds update --commands` 现在可以正常工作

## [3.5.1-beta.5] - 2026-01-16

### 变更
- **Skills**: `/update` 斜杠命令现在会提示安装 Skills/Commands
  - 新增第 4 步以在更新后检查是否已安装 Skills/Commands
  - 使用 AskUserQuestion 提示用户进行安装
  - 确保与 CLI 交互模式的行为保持一致

## [3.5.1-beta.4] - 2026-01-16

### 新增
- **CLI**: 更新期间的新功能检测
  - `uds update` 现在会检测 manifest 中尚未安装 Skills/Commands 的 AI 工具
  - 交互模式会提示用户安装缺失的功能
  - `--yes` 模式显示提示而不是自动安装（保守行为）
  - 支持所有兼容 skills 的工具：Claude Code、OpenCode、Cursor、Copilot 等

## [3.5.1-beta.3] - 2026-01-16

### 修复
- **CLI**: npm 包现在打包了标准文件
  - 添加 `prepack` 脚本以打包 `core/` 和 `locales/` 目录
  - 新增 `getSourcePath()` 函数优先使用随附打包文件而非从 GitHub 下载
  - 解决通过 npm 安装的 CLI 更新标准时的 404 错误
  - 改进了文件下载失败时的错误提示信息

## [3.5.1-beta.2] - 2026-01-16

### 新增
- **脚本**: 预发布的文档同步检查
  - 新增 `check-docs-sync.sh/.ps1` 脚本
  - 验证 CHANGELOG.md 包含当前版本的条目
  - 验证 plugin.json、marketplace.json、README.md 中的版本同步
  - 为可能需要更新的文档提供提醒清单
  - 预发布检查现在运行 8 项检查（使用 `--skip-tests` 时为 7 项）

### 移除
- **Skills**: 废弃的安装脚本
  - 移除 `skills/install.sh` 和 `install.ps1`
  - 移除 `scripts/check-install-scripts-sync.sh` 和 `.ps1`
  - Plugin Marketplace 现为主要安装方式

### 变更
- **文档**: 更新所有文档以使用 Plugin Marketplace 安装
  - 更新 README.md（en、zh-TW、zh-CN）
  - 更新所有采用指南与检查清单
  - 更新 skills 的 README 文件

## [3.5.1-beta.1] - 2026-01-15

### 新增
- **CLI**: 多代理 Skills 安装
  - 支持同时向多个 AI 代理安装 Skills
  - 目标代理的复选框选择（Claude Code、OpenCode、Cline、Roo Code 等）
  - 每个代理的用户级别与项目级别安装路径
- **CLI**: Gemini CLI TOML 命令转换
  - 自动将 Markdown 命令转换为适用于 Gemini CLI 的 TOML 格式
  - 支持命令参数的 `{{args}}` 占位符
  - 正确的 TOML 字符串转义
- **CLI**: 斜杠命令安装
  - 向支持命令的代理安装命令（OpenCode、Roo Code、Copilot、Gemini CLI）
  - `uds update --skills` 和 `uds update --commands` 选项
- **CLI**: 集中式 AI 代理路径配置
  - 新增 `src/config/ai-agent-paths.js` 模块
  - 统一管理全部 10 个受支持 AI 代理的路径
- **测试**: 全面的单元测试
  - `ai-agent-paths.test.js`（29 个测试）
  - `skills-installer.test.js`（23 个测试）
  - 共计：400 个测试通过

### 变更
- **文档**: 将 AI-AGENT-ROADMAP.md 更新至 v2.2.0
  - 在功能增强路线图（Feature Enhancement Roadmap）中添加多代理安装和 Gemini CLI TOML
- **文档**: 将 CLI-INIT-OPTIONS.md 更新至 v3.5.1
  - 新增多代理 Skills 安装章节
  - 更新所有代理的 Skills 路径表
- **文档**: 更新 README.md
  - 新增包含 Skills 和 Commands 列的 AI 工具扩展表
  - 在 What's New 中添加多代理 Skills 和 Gemini CLI TOML

## [3.5.0] - 2026-01-15

### 新增
- **i18n**: 完整的国际化支持
  - 为全部 18 个核心标准、20 多个技能、采用指南提供简体中文（zh-CN）本地化
  - CLI 国际化：`--ui-lang` 选项（`en`、`zh-tw`、`zh-cn`、`auto`）
  - 全部 6 个 CLI 命令与 8 个交互式提示支持 3 种语言
  - 环境变量检测（`LANG`、`LC_ALL`）
- **方法论系统** `[Experimental]`: 开发方法论支持
  - 内置方法论：TDD、BDD、SDD、ATDD
  - 基于 YAML 的定义与 JSON Schema 验证
  - 具备阶段跟踪功能的 `/methodology`、`/tdd`、`/bdd` 命令
  - 在 `uds init` 和 `uds configure` 中的 CLI 集成（需要 `-E` 标志）
- **CLI**: 增强的 AI 工具集成
  - 支持 9 款 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Google Antigravity、OpenAI Codex、Gemini CLI、OpenCode
  - 内容模式选择：`full`、`index`（推荐）、`minimal`
  - 自动生成标准合规说明（Standards Compliance Instructions）与标准索引（Standards Index）
- **CLI**: 增强的命令
  - `uds configure`: AI 工具、采用级别、内容模式选项
  - `uds update`: `--integrations-only`、`--standards-only`、`--sync-refs`、`--beta` 标志
  - `uds check`: AI 工具集成状态、引用同步状态、市场 Skills 版本检测
  - `uds init/configure`: 用于实验性功能的 `-E, --experimental` 标志
- **Skills**: 用于标准配置的新 `/config` 斜杠命令
- **Skills**: 用于 `/init`、`/config`、`/update` 的带 AskUserQuestion 交互模式
- **核心**: 新的 `ai-instruction-standards.md`（第 18 个核心标准）
- **文档**: 所有采用指南（33 个文件）均支持 Windows PowerShell
- **文档**: 详尽的 CLI 初始化选项指南（`docs/CLI-INIT-OPTIONS.md`）
- **文档**: 使用模式对比（`docs/USAGE-MODES-COMPARISON.md`）
- **文档**: 针对 `options/` 目录的 18 个可读 Markdown 文件
- **文档**: 用于未来 10 种语言扩展的 LOCALIZATION-ROADMAP.md
- **脚本**: 统一预发布检查（`scripts/pre-release-check.sh`）
- **脚本**: 标准一致性检查（`scripts/check-standards-sync.sh`）
- **脚本**: 版本同步检查（`scripts/check-version-sync.sh`）
- **CI**: GitHub Actions 发布工作流中的预发布验证

### 变更
- **CLI**: Manifest 版本升级至 3.2.0
  - 用于完整性检查的新 `fileHashes` 字段
  - 用于集成设置的新 `integrationConfigs` 字段
- **CLI**: 改进交互式提示描述并提供双语支持
- **CLI**: 集成文件默认使用 index 模式
- **Skills**: 斜杠命令描述简化为仅限英文
- **Skills**: 更新安装脚本以包含 methodology-system（共计 16 个 skills）

### 修复
- **CLI**: 未跟踪文件检测中的 Windows 路径分隔符问题
- **CLI**: ES Module（init.js）中的 `require()` 错误
- **CLI**: Skills 版本检测显示陈旧版本的问题
- **CLI**: `standards-registry.json` 中的版本不匹配
- **CLI**: 缺失的 AI 工具检测（现在可检测全部 9 款工具）
- **CLI**: Compact 格式下 `.ai.yaml` 文件的注册表引用

### 移除
- **CLI**: 从 `uds check` 中移除未跟踪文件扫描

## [3.4.2] - 2026-01-08

### 修复
- **插件**: 同步所有配置文件中的版本号
  - `.claude-plugin/plugin.json`: 3.3.0 → 3.4.2
  - `.claude-plugin/marketplace.json`: 3.3.0 → 3.4.2
  - `.claude-plugin/README.md`: 3.2.0 → 3.4.2
  - `adoption/standards-registry.json`: 3.2.0 → 3.4.2
- **插件**: 修复 `adoption/standards-registry.json` 仍引用已废弃的 `universal-dev-skills` 仓库的问题
  - 现在正确指向主仓库中的 `skills`

## [3.4.1] - 2026-01-08

### 修复
- **CLI**: 修复 `uds update` 建议从较新版本降级的问题
  - 增加支持预发布版本（alpha/beta/rc）的正确语义化版本比较
  - 现在能正确识别当前版本何时比注册表版本更新
  - 当用户拥有比注册表更新的版本时显示提示信息
- **CLI**: 更新 `standards-registry.json` 版本以匹配 package.json

## [3.4.0] - 2026-01-08

### 新增
- **CLI**: 为 `uds check` 增加基于哈希的文件完整性检查
  - 通过比对 SHA-256 哈希检测被修改的文件
  - 新选项：`--diff`、`--restore`、`--restore-missing`、`--no-interactive`、`--migrate`
  - 交互模式：检测到问题时提示操作（查看 diff、还原、保留、跳过）
  - 旧版 manifest 迁移：`uds check --migrate` 升级至基于哈希的跟踪
- **CLI**: 文件哈希存储于 manifest 中（版本 3.1.0）
  - `uds init` 在安装时计算并存储文件哈希
  - `uds update` 在更新文件后重新计算哈希
- **工具**: 用于 SHA-256 文件哈希计算的新 `hasher.js` 工具模块

### 变更
- **CLI**: Manifest 版本从 3.0.0 升级至 3.1.0
  - 新的 `fileHashes` 字段用于跟踪文件完整性
  - 向后兼容旧版 manifest

### 修复
- **CLI**: 修复 `uds check` 错误显示“Skills marked as installed but not found”警告的问题
  - 现在能正确识别 Plugin Marketplace 安装路径（`~/.claude/plugins/cache/`）
- **CLI**: 修复 `uds update` 命令因“undefined”错误而失败的问题
  - 为异步的 `copyStandard()` 和 `copyIntegration()` 调用补充了缺失的 `await`

## [3.3.0] - 2026-01-08

### 新增
- **技能**：新增 9 个用于手动触发工作流的斜杠命令
  - `/commit` - 生成约定式提交信息
  - `/review` - 执行系统化代码审查
  - `/release` - 引导发布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 编写用户故事与需求
  - `/sdd` - 创建规格文档
  - `/tdd` - 测试驱动开发工作流
  - `/docs` - 创建/更新文档
  - `/coverage` - 分析测试覆盖率
- **核心**：新增测试驱动开发（TDD）标准
  - 新增 `core/test-driven-development.md`，涵盖红-绿-重构循环
  - SDD + TDD 集成工作流指南
- **技能**：为 Claude Code 添加 `tdd-assistant` 技能（技能 #15）

### 变更
- **技能**：将斜杠命令格式从 `/uds:xxx` 简化为 `/xxx`
  - 移除 `uds:` 命名空间前缀，使命令调用更简洁
- **插件市场**：将市场名称从 `universal-dev-standards` 重命名为 `asia-ostrich`
  - 新的安装命令：`/plugin install universal-dev-standards@asia-ostrich`

### 修复
- **CLI**：`uds skills` 现在优先使用新的 `@asia-ostrich` 市场
- **CLI**：将 `tdd-assistant` 添加到 standards-registry.json

### 迁移
如果您是通过旧市场名称安装的，请进行迁移：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### 新增
- **技能**：新增 9 个用于手动触发工作流的斜杠命令
  - `/commit` - 生成约定式提交信息
  - `/review` - 执行系统化代码审查
  - `/release` - 引导发布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 编写用户故事与需求
  - `/sdd` - 创建规格文档
  - `/tdd` - 测试驱动开发工作流
  - `/docs` - 创建/更新文档
  - `/coverage` - 分析测试覆盖率
  - 命令 vs 技能：命令为手动触发（`/command`），技能为自动触发（基于上下文）

### 修复
- **CLI**：`uds skills` 现在优先使用新的 `@asia-ostrich` 市场
  - 检测到旧版 `@universal-dev-standards` 市场时添加迁移提示
  - 确保迁移期间的兼容性

## [3.3.0-beta.4] - 2026-01-07

### 变更
- **插件市场**：将市场名称从 `universal-dev-standards` 重命名为 `asia-ostrich`
  - 新的安装命令：`/plugin install universal-dev-standards@asia-ostrich`
  - 这与 AsiaOstrich 组织保持了更好的品牌一致性

### 迁移
如果您是通过旧市场名称安装的，请进行迁移：

```bash
# 1. Uninstall old version
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. Install new version
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### 修复
- **CLI**：将 `tdd-assistant` 添加到 standards-registry.json
  - 为 TDD 添加技能文件列表和标准条目
  - `uds skills` 现在正确显示 15/15 个技能

## [3.3.0-beta.2] - 2026-01-07

### 新增
- **核心**：新增测试驱动开发（TDD）标准
  - 新增 `core/test-driven-development.md`，涵盖红-绿-重构循环、FIRST 原则、TDD vs BDD vs ATDD
  - SDD + TDD 集成工作流指南
  - 机器学习（ML）测试边界（模型准确率 vs 数据工程）
  - 针对遗留系统的黄金母本测试（Golden Master Testing）
- **技能**：为 Claude Code 添加 `tdd-assistant` 技能（技能 #15）
  - `skills/tdd-assistant/SKILL.md` - TDD 工作流指南
  - `skills/tdd-assistant/tdd-workflow.md` - 分步 TDD 流程
  - `skills/tdd-assistant/language-examples.md` - 6 种语言示例（JS/TS、Python、C#、Go、Java、Ruby）
  - 为所有 TDD 文件提供完整的 zh-TW 翻译

### 变更
- **核心标准**：更新相关标准中的交叉引用
  - `spec-driven-development.md` - 添加 TDD 集成引用
  - `testing-standards.md` - 添加 TDD 交叉引用
  - `test-completeness-dimensions.md` - 添加 TDD 交叉引用
- **发布工作流**：通过全面的文件验证扩展发布前检查清单
  - 新增包含所有版本相关文件的版本文件检查清单
  - 重命名为文档验证检查清单，包含准确性验证
  - 新增包含 grep 命令的内容准确性验证章节
  - 对所有语言区域文件使用 `locales/*` 模式

## [3.2.2] - 2026-01-06

### 新增
- **CLI**：新增 `uds skills` 命令以列出已安装的 Claude Code 技能
  - 显示来自插件市场、用户级和项目级的安装
  - 显示每次安装的版本、路径和技能数量
  - 对已废弃的手动安装发出警告
- **CLI**：根据安装位置改进技能更新说明

### 废弃
- **技能**：通过 `install.sh` / `install.ps1` 手动安装现已废弃
  - 推荐：使用插件市场进行自动更新
  - 脚本将显示废弃警告并提示确认
  - 将在未来的主版本中移除

### 变更
- **CLI**：`uds update` 现在会对手动技能安装显示废弃警告
  - 建议迁移到插件市场
- **技能**：更新 README.md，将手动安装标记为已废弃

### 修复
- **CLI**：将 standards-registry 版本更新为 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### 新增
- **CLI**：根据安装位置改进技能更新说明
  - 市场：指导通过插件市场 UI 进行更新
  - 用户级：`cd ~/.claude/skills/... && git pull`
  - 项目级：`cd .claude/skills/... && git pull`

### 修复
- **CLI**：将 standards-registry 版本更新为 3.2.2
  - 使 `uds update` 能够检测现有项目的新版本

## [3.2.2-beta.1] - 2026-01-05

### 新增
- **技能**：新增发布工作流指南以提供全面的发布流程说明
  - 新增 `skills/release-standards/release-workflow.md`，提供分步发布说明
  - 涵盖 beta、alpha、rc 和稳定版发布工作流
  - 包含 npm dist-tag 策略、故障排除以及 AI 助手指南
  - 在 CLAUDE.md 中为 AI 助手添加发布流程章节
- **CLI**：为 AI 工具集成添加对话语言设置
  - 所有 AI 工具集成文件现在均包含对话语言指令
  - 支持英文、繁体中文和双语模式
  - 为 Claude Code 用户生成带有语言设置的 CLAUDE.md
- **CLI**：为 prompts 和 utils 模块添加全面的测试
  - 测试覆盖率从 42.78% 提升至 72.7%
  - 测试总数从 94 个增加到 210 个

### 修复
- **CLI**：仅在 Claude Code 是唯一选中的 AI 工具时提示技能安装
  - 修复了选择多个带有技能的 AI 工具可能导致其他工具遗漏完整标准的错误
- **CI/CD**：修复 npm 发布工作流以正确标记 beta/alpha/rc 版本
  - 在 `.github/workflows/publish.yml` 中添加自动版本检测
  - Beta 版本现在使用 `@beta` 标签发布，而不是 `@latest`
  - 用户现在可以使用 `npm install -g universal-dev-standards@beta` 安装 beta 版本

### 变更
- **核心标准**：向 5 份核心文档添加行业参考标准
  - `error-code-standards.md` v1.0.0 → v1.1.0：RFC 7807、RFC 9457、HTTP 状态码
  - `logging-standards.md` v1.0.0 → v1.1.0：OWASP Logging、RFC 5424、OpenTelemetry、12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0：SWEBOK v4.0 第 10 章（软件质量）
  - `checkin-standards.md` v1.2.5 → v1.3.0：SWEBOK v4.0 第 6 章（配置管理）
  - `spec-driven-development.md` v1.1.0 → v1.2.0：IEEE 830-1998、SWEBOK v4.0 第 1 章（需求）
- **测试标准**：添加 SWEBOK v4.0 参考及新章节
  - `testing-standards.md` v2.0.0 → v2.1.0：测试基础、测试相关度量、结对/数据流测试
- **文档**：使用 npm dist-tag 策略更新 MAINTENANCE.md
  - 为不同版本模式添加 dist-tag 表
  - 添加手动标签纠正命令

## [3.2.1-beta.1] - 2026-01-02

### 新增
- **CLI**：为技能安装流程添加插件市场支持
  - 在技能安装提示中新增“Plugin Marketplace (Recommended)”选项
  - CLI 在清单中跟踪通过市场安装的技能，而不尝试本地安装
  - `uds check` 命令现在显示市场安装状态

### 修复
- **CLI**：修复标准注册表中通配符路径处理导致 404 错误的问题
  - 将 `templates/requirement-*.md` 通配符替换为明确的文件路径
  - 为 requirement-checklist.md、requirement-template.md、requirement-document-template.md 添加明确条目
- **CLI**：修复执行 `uds init`、`uds configure` 和 `uds update` 命令后进程挂起的问题
  - 添加显式的 `process.exit(0)` 以防止 inquirer readline 接口阻止退出

## [3.2.0] - 2026-01-02

### 新增
- **Claude Code 插件市场支持**：支持通过插件市场进行分发
  - 添加 `.claude-plugin/plugin.json` - 带有元数据的插件清单
  - 添加 `.claude-plugin/marketplace.json` - 用于插件分发的市场配置
  - 添加 `.claude-plugin/README.md` - 插件文档与维护指南
  - 更新 `skills/README.md`，添加方法 1：市场安装（推荐）

### 优势
- 用户可以通过单条命令安装全部 14 个技能：`/plugin install universal-dev-standards@universal-dev-standards`
- 发布新版本时自动更新
- 通过 Claude Code 市场获得更好的可发现性
- 保持与脚本安装（方法 2 和方法 3）的向后兼容性

### 变更
- 在 `CLAUDE.md` 中为 AI 助手添加对话语言要求（繁体中文）

### 修复
- 修复 CLI 版本读取，使用 `package.json` 代替硬编码值

## [3.1.0] - 2025-12-30

### 新增
- **简体中文（zh-CN）翻译**：为简体中文用户提供完整的本地化
  - 新增 `locales/zh-CN/README.md` - 完整 README 翻译
  - 新增 `locales/zh-CN/CLAUDE.md` - 项目指南翻译
  - 新增 `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows 指南翻译
- 在所有 README 版本（EN、zh-TW、zh-CN）中新增语言切换链接

- **完整的 Windows 支持**：为 Windows 用户提供完整的跨平台兼容性
  - 新增 `.gitattributes` 以在各平台间实现一致的换行符
  - 新增 `scripts/check-translation-sync.ps1` - 翻译检查工具的 PowerShell 版本
  - 新增 `skills/install.ps1` - 技能安装器的 PowerShell 版本
  - 新增 `scripts/setup-husky.js` - 跨平台 Husky 设置脚本
  - 新增 `docs/WINDOWS-GUIDE.md` - 全面的 Windows 开发指南
- **5 个新的 Claude Code 技能**：将技能库从 9 个扩展到 14 个技能
  - `spec-driven-dev` - SDD 工作流指引（触发词：spec、proposal）
  - `test-coverage-assistant` - 7 维度测试完备性框架（触发词：test coverage、dimensions）
  - `changelog-guide` - 变更日志编写标准（触发词：changelog、release notes）
  - `error-code-guide` - 错误码设计模式（触发词：error code）
  - `logging-guide` - 结构化日志标准（触发词：logging、log level）
- 在 `STATIC-DYNAMIC-GUIDE.md` 中新增**混合标准**分类 - 兼具静态与动态组件的标准
- 在 `MAINTENANCE.md` 中新增**动态与静态分类**章节 - 标准分类指南
- 将 `checkin-standards` 核心规则作为静态标准新增至 `CLAUDE.md`
- 为所有 5 个新技能新增完整的 zh-TW 翻译（共 10 个文件）

### 变更
- 更新 `cli/package.json` 的 prepare 脚本以使用跨平台的 `setup-husky.js`
- 更新 `README.md`、`cli/README.md`、`CLAUDE.md`，添加 Windows 安装说明
- 将 `STATIC-DYNAMIC-GUIDE.md` 更新至 v1.1.0 - 引入混合标准概念，更新为 14 个技能
- 更新 `MAINTENANCE.md` - 新增对 `STATIC-DYNAMIC-GUIDE.md` 的交叉引用，在工作流 4 中扩展分类检查清单
- 更新 `MAINTENANCE.md` 中的技能表格，从 9 个增至 14 个技能（35 个技能文件 + 10 个共享/README 文件 = 45 个文件）
- 同步 `MAINTENANCE.md` 和 `STATIC-DYNAMIC-GUIDE.md` 的 zh-TW 翻译

## [3.0.0] - 2025-12-30

### 新增
- **AI 优化标准架构**：通过 `.ai.yaml` 文件新增双格式支持
- 新增 `ai/standards/` 目录，包含 15 个 AI 优化标准文件
- 新增 `ai/options/` 目录，包含特定语言与工作流选项
- 新增 `MAINTENANCE.md` - 包含文件结构概述的项目维护指南
- 新增 `ai/MAINTENANCE.md` - AI 标准维护工作流指南
- 新增 `STANDARDS-MAPPING.md` - 标准到技能映射矩阵
- 新增 6 个新的 AI 优化标准：
  - `anti-hallucination.ai.yaml` - AI 协作标准
  - `checkin-standards.ai.yaml` - 代码签入标准
  - `documentation-writing-standards.ai.yaml` - 文档编写指南
  - `spec-driven-development.ai.yaml` - SDD 工作流
  - `test-completeness-dimensions.ai.yaml` - 7 维度测试框架
  - `versioning.ai.yaml` - 语义化版本标准
- 为所有新标准和技能新增完整的 zh-TW 翻译（共 78 个文件）

### 变更
- 将核心标准中的版本格式统一为 `**Version**: x.x.x`
- 在所有 zh-TW 翻译 YAML front matter 中新增 `source` 字段以进行同步追踪
- 更新翻译同步脚本，改进验证逻辑

### 修复
- 修复 `core/error-code-standards.md` 与 `core/logging-standards.md` 中版本格式不一致的问题
- 修复 zh-TW 技能翻译中的源路径

## [2.3.0] - 2025-12-25

### 新增
- **多语言支持**：新增用于国际化的 `locales/` 目录结构
- 为所有文档新增繁体中文（zh-TW）翻译（44 个文件）
  - `locales/zh-TW/core/` - 13 个核心标准翻译
  - `locales/zh-TW/skills/` - 25 个技能文件翻译
  - `locales/zh-TW/adoption/` - 5 个采用指南翻译
  - `locales/zh-TW/README.md` - 完整中文 README
- 在所有英文文档文件中新增语言切换器
- 新增 `scripts/check-translation-sync.sh` - 翻译同步检查工具
- 在技能文档中新增静态与动态标准分类
- 新增 `templates/CLAUDE.md.template` - 开箱即用的静态标准模板
- 新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 详细分类指南

### 变更
- 将双语内容拆分为专用语言文件（为 AI 工具减少约 50% token）
- 英文版本现在仅包含带语言切换器的纯英文内容
- 更新 `skills/README.md` - 新增带有触发关键词的静态与动态章节

## [2.2.0] - 2025-12-24

### 新增
- 为所有技能文档新增标准章节（23 个文件）
  - 8 个 SKILL.md 文件：新增目的（Purpose）、相关标准（Related Standards）、版本历史（Version History）、许可证（License）章节
  - 15 个支持文档：新增双语标题、元数据及标准章节

### 变更
- 将技能文档格式与核心标准对齐
- 新增技能与核心文档之间的交叉引用

## [2.1.0] - 2025-12-24

### 新增
- **集成技能**：将 `universal-dev-skills` 合并到 `skills/` 目录
- 新增 `skills/` - 主仓库现已包含所有 Claude Code 技能
- 新增 `skills/_shared/` - 支持多 AI 工具的共享模板
- 为未来的 AI 工具新增占位目录：`skills/cursor/`、`skills/windsurf/`、`skills/cline/`、`skills/copilot/`

### 变更
- CLI 现在从本地 `skills/` 安装技能，而不是从远程仓库获取
- 更新 `standards-registry.json` 以反映集成技能架构

### 迁移指南
- 如果您之前单独使用 `universal-dev-skills`，现在可以使用本仓库中包含的技能
- 运行 `cd skills && ./install.sh` 从集成位置重新安装技能

## [2.0.0] - 2025-12-24

### 变更

**重大变更**：项目从 `universal-doc-standards` 更名为 `universal-dev-standards`

这反映了项目扩展的范畴，涵盖所有开发标准，而不局限于文档。

#### 迁移指南

- 从新仓库重新克隆：`git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- 如果使用全局安装，请在 CLI 目录中重新运行 `npm link`
- 使用 `npx universal-dev-standards` 代替 `npx universal-doc-standards`
- `uds` 命令保持不变

### 新增
- 新增 `extensions/languages/php-style.md` - 基于 PSR-12 的 PHP 8.1+ 代码风格指南
- 新增 `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ 开发模式

## [1.3.1] - 2025-12-19

### 新增
- 在 `testing-standards.md` 中新增 Mock 局限性章节 - 关于 Mock 何时需要集成测试的指南
- 在 `testing-standards.md` 中新增测试数据管理模式 - 区分标识符与复合键指南
- 在 `testing-standards.md` 中新增“何时需要集成测试”表格 - 6 种需要集成测试的场景

## [1.3.0] - 2025-12-16

### 新增
- 新增 `changelog-standards.md` - 全面的变更日志编写指南
- 在 `git-workflow.md` 中新增决策树和选择矩阵，用于工作流策略选择
- 在 `commit-message-guide.md` 中新增语言选择指南，用于选择提交信息语言

### 变更
- 更新 `versioning.md` - 新增对 changelog-standards.md 的交叉引用
- 更新 `git-workflow.md` - 在发布准备中新增 CHANGELOG 更新指南
- 更新 `zh-tw.md` - 为 Changelog、Release Notes、Breaking Change、Deprecate、Semantic Versioning 新增术语
- 更新 `changelog-standards.md` - 将排除规则与 versioning.md 对齐，新增交叉引用
- 更新 `checkin-standards.md` - 阐明 CHANGELOG 更新仅适用于面向用户的变更
- 更新 `code-review-checklist.md` - 将 CHANGELOG 章节与 changelog-standards.md 对齐

### 修复
- 修复 `commit-message-guide.md` 和 `documentation-writing-standards.md` 中标题格式不一致的问题
- 将交叉引用标准化为使用 markdown 链接格式，而非反引号

## [1.2.0] - 2025-12-11

### 新增
- 新增 `project-structure.md` - 项目目录规范
- 在 `documentation-structure.md` 中新增物理 DFD 层

### 变更
- 更新 `documentation-structure.md` - 阐明流程与图表的分离，改进文件命名规范
- 更新 `checkin-standards.md` - 新增目录整洁度指南
- 通过将特定于项目的示例替换为通用占位符来提高通用性

## [1.1.0] - 2025-12-05

### 新增
- 新增 `testing-standards.md` - 全面的测试金字塔（UT/IT/ST/E2E）
- 新增 `documentation-writing-standards.md` - 文档内容要求

### 变更
- 更新 `anti-hallucination.md` - 强化来源归属指引
- 更新 `zh-tw.md` - 与 commit-message-guide.md v1.2.0 保持同步

## [1.0.0] - 2025-11-12

### 新增
- 包含核心标准的初始版本
- 核心标准：`anti-hallucination.md`、`checkin-standards.md`、`commit-message-guide.md`、`git-workflow.md`、`code-review-checklist.md`、`versioning.md`、`documentation-structure.md`
- 扩展：`csharp-style.md`、`zh-tw.md`
- 模板：需求文档模板
- 集成：OpenSpec 框架

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v6.0.0...HEAD
[6.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.17.0...v6.0.0
[5.7.2]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.1...v5.7.2
[5.7.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.0...v5.7.1
[5.7.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.6.0...v5.7.0
[4.3.0-alpha.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.2.0...v4.3.0-alpha.1
[4.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.5.0...v4.0.0
[3.5.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.3.0...v3.4.0
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
