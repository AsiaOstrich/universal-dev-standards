---
source: ../../../docs/AVAILABLE-STANDARDS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-07
status: current
---

# 可用标准：UDS 有发布、你的项目没有装的标准

> **语言**: [English](../../../docs/AVAILABLE-STANDARDS.md) | [繁體中文](../../zh-TW/docs/AVAILABLE-STANDARDS.md) | 简体中文

用旧版 UDS 设置的项目，只保有当时装的标准。之后 UDS 新增的标准**不会**被 `uds update --apply` 装上，
因为更新只维护项目清单（`.standards/manifest.json`）列出的东西。这个功能出现之前，没有任何命令会告诉你
它们存在。现在有三个命令会告诉你，另一个让你挑着装。

## 唯一的规则

一个标准同时符合下列三点，就是**可用但未安装**：

1. 它的类别是 `uds init` 会安装的类别（`reference` 或 `skill`，见下表），
2. 在你项目的 `format`（默认 `ai`）下有来源文件（只有技能、没有文件的条目不算），
3. `manifest.standards` 里没有同名文件。

这条规则只写在一个函数里（`getAvailableStandards`，`cli/src/utils/available-standards.js`）。`uds update` 旧的
交互路径、`uds update --plan`／`--apply`、`uds check`、`uds audit --friction` 都问它，所以不会各说各话。

## 类别

| 类别 | 列为“可用”？ | 原因 |
|---|---|---|
| `reference` | 是 | `uds init` 会把它装进 `.standards/`。 |
| `skill` | 是 | `uds init` 会把它装进 `.standards/`。 |
| `core` | **否，但会计数、可用 id 安装** | 2026 年 3 月才加进登记表，晚于安装程序“只装 reference 或 skill”的过滤（2025 年 12 月）。`uds init` 从来没装过它，所以对项目而言它从来不是“新的”。这是历史意外，不是设计决定。 |
| `testing`、`security`、`deployment`、`operations` | **否，但会计数、可用 id 安装** | 与 `core` 相同：后来才加，init 从没装过。 |
| `extension` | 否，**`--add-standard` 也不安装** | 由 init 的语言／框架／语系选项（`--lang`、`--framework`、`--locale`）安装。 |
| `integration` | 否，`--add-standard` 也不安装 | 每个 AI 工具各一个集成文件，由 init 的 AI 工具选项安装。 |
| `template` | 否，`--add-standard` 也不安装 | 要复制使用的文档模板，不是标准文件。 |

其他类别不会被悄悄丢掉：`uds update --plan` 结尾会有一行说明有几个、在哪些类别；可安装的类别都能用 id 指名安装
（见下）。它们是否该像 `reference`／`skill` 一样被**列出**，是还没决定的事（XSPEC-458 OQ1）。

## 与这件事无关的 manifest 字段

| 字段 | 状态 | 作用 |
|---|---|---|
| `level` | 死字段 | 6.11.0 写的 manifest 只在 `integrationConfigs[<文件>].level` 里留有残值。没有任何代码用它决定安装什么。登记表的“等级系统”是已弃用的空壳。 |
| `profile` | 不存在 | CLI 与任何 manifest 都没有这个字段。 |
| `contentMode` | 有作用，但与此无关 | 决定 `CLAUDE.md` 怎么生成（`minimal` 或 `index`）。它从不决定装哪些标准。 |

## 命令

```sh
uds update --plan            # 先打印计划，再打印“上游有、项目没装（N 个）”，按类别分组
uds update --apply           # 应用计划；结尾打印有几个可用、怎么装
uds update --apply --add-standard open-work-tracking     # 装一个，并记入 manifest
uds update --apply --add-standard a --add-standard b     # 装多个
uds update --plan --add-standard open-work-tracking      # 先预览
uds check                    # 一行：“上游有 N 个标准未安装”
uds audit --friction         # 一项低严重度发现（不进 --report、不影响 --score）
```

- 除了 `--add-standard`，上面全是**纯信息**：计划的动作、`uds check` 的判定与退出码、`uds audit --score`
  都与以前完全相同。`uds audit --score` 不读这项发现。
- `--add-standard` 要搭配 `--plan` 或 `--apply`。它会记入 `manifest.standards`，所以之后的 `uds update --apply`
  会保留它（manifest 没列出的文件会被当成多余的）。再跑一次 `--plan` 没有变动；`uds update --rollback` 会把它
  拿掉（manifest 一起还原）。
- 未知的 id 以非 0 退出并列出最相近的 id；已安装的 id 会说明已安装并以 0 退出；`extension`、`integration`、
  `template` 的 id 会被拒绝并说明原因。
