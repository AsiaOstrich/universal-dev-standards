---
source: ../../../../integrations/codex/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 75de1661b8b0
status: current
---

# OpenAI Codex 集成

> **语言**: [English](../../../../integrations/codex/README.md) | [繁體中文](../../../zh-TW/integrations/codex/README.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-09

本目录提供将通用开发规范与 OpenAI Codex CLI 集成的资源。

## 概述

OpenAI Codex 是一个基于云端的 AI 编码代理，可作为 CLI、IDE 扩展或 Web 界面运行。它会在执行任务前读取 AGENTS.md 文件，因此可以轻松地自动落实项目规范。

## 资源

- **[AGENTS.md](./AGENTS.md)**（必要）：
  项目级规则文件，Codex 会自动加载。

- **[config.toml.example](../../../../integrations/codex/config.toml.example)**（可选）：
  Codex 设置的配置示例。

## 配置层级

Codex 按以下优先顺序构建指令链：

| 层级 | 文件位置 | 说明 |
|-------|--------------|-------------|
| 全局覆盖 | `~/.codex/AGENTS.override.md` | 临时的全局覆盖 |
| 全局默认 | `~/.codex/AGENTS.md` | 适用所有项目的个人规则 |
| 项目根目录 | `AGENTS.md` | 项目级规则 |
| 子目录 | `services/*/AGENTS.md` | 特定服务的规则 |
| 子目录覆盖 | `services/*/AGENTS.override.md` | 临时的服务覆盖 |

**注意**：越接近工作目录的文件优先级越高。使用 `AGENTS.override.md` 进行临时调整，无需修改基础文件。

## 快速开始

### 方式一：复制规则文件（推荐）

```bash
# 复制到项目根目录
cp integrations/codex/AGENTS.md AGENTS.md

# 可选：设置全局配置
mkdir -p ~/.codex
cp integrations/codex/config.toml.example ~/.codex/config.toml
```

### 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/codex/AGENTS.md
```

### 方式三：验证指令

设置完成后，验证 Codex 已加载你的指令：

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

## 配置选项

### ~/.codex/config.toml

```toml
# 每个 AGENTS.md 文件读取的最大字节数（默认：32768）
project_doc_max_bytes = 65536

# AGENTS.md 不存在时的备用文件名
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

**关键选项**：
- `project_doc_max_bytes`：指令文件较大时调高此值
- `project_doc_fallback_filenames`：支持替代文件名

## 规则合并行为

Codex 从根目录到工作目录逐层合并指令：

| 情况 | 行为 |
|-----------|----------|
| 全局与项目规则同时存在 | **合并**两者，项目规则优先 |
| 存在覆盖文件 | 在该层级**取代**基础文件 |
| 指令被截断 | 调高 `project_doc_max_bytes` 或拆分到子目录 |

---

## 相关规范

- [防幻觉规范](../../../../core/anti-hallucination.md)
- [Commit 消息指南](../../../../core/commit-message-guide.md)
- [代码审查清单](../../../../core/code-review-checklist.md)
- [规格驱动开发](../../../../core/spec-driven-development.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 OpenAI Codex 集成 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
