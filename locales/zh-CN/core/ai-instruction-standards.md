---
source: ../../../core/ai-instruction-standards.md
source_version: 1.1.1
translation_version: 1.1.1
last_synced: 2026-10-11
source_hash: 64bcd0b65483
status: current
---

# AI 指令文件规范

> **语言**: [English](../../../core/ai-instruction-standards.md) | [繁體中文](../../zh-TW/core/ai-instruction-standards.md) | 简体中文

**版本**: 1.1.1
**最后更新**: 2026-08-19
**适用范围**: 所有使用 AI 编码助手的项目
**范围**: partial
**行业标准**: 无（新兴 AI 工具实践）

---

## 目的

本规范定义创建和维护 AI 指令文件（又称「系统提示词文件」）的最佳实践。这些文件引导 AI 助手理解项目特定的惯例、标准和工作流程。v1.1.0 将范围扩展到 skill 层级的指令文件（SKILL.md），并新增 i18n 策略。

---

## 支持的 AI 工具

| AI 工具 | 指令文件 | 格式 | Skill 层级指令 |
|---------|---------|------|---------------|
| Claude Code | `CLAUDE.md` | Markdown | `.claude/skills/{name}/SKILL.md` |
| Cursor | `.cursorrules` | Markdown | n/a |
| Windsurf | `.windsurfrules` | Markdown | n/a |
| Cline | `.clinerules` | Markdown | n/a |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown | n/a |
| OpenCode | `.opencode/instructions.md` | Markdown | n/a |

---

## 核心原则：通用与专用分离

### 为什么要分离？

AI 指令文件通常混合两种类型的内容：
1. **通用规则**：适用于任何项目
2. **项目专用配置**：专属于你的项目

分离这些内容可以改善：
- **可携性**：通用区段可在项目间重复使用
- **可维护性**：更容易更新而不会意外「泄漏」
- **清晰性**：用户知道采用标准时需要自定义哪些部分

---

## 文件结构

### 建议的布局

```markdown
# [项目名称] - AI 指令

## 通用标准
<!-- 适用于任何项目的规则 -->
- Commit 消息格式
- 代码审查清单
- 测试标准
- 反幻觉规则

---

## 项目专用配置
<!-- 专属于本项目 - 采用时需自定义 -->

### 技术栈
[你的技术在这里]

### 快速指令
[你的构建/测试/部署指令]

### 文件结构
[你的项目结构]

### 发布流程
[你的发布工作流程]
```

---

## 内容指南

### 通用内容（不要包含项目特定细节）

| 类别 | 示例 |
|------|------|
| **Commit 标准** | Conventional Commits 格式、消息结构 |
| **代码审查** | 审查清单、注释前缀 |
| **测试** | 测试金字塔比例、命名惯例 |
| **AI 行为** | 反幻觉规则、来源标注 |
| **文档** | 写作风格、结构指南 |

**在通用区段中避免：**
- 特定指令（例如：`npm test`、`pytest`）
- 硬编码路径（例如：`cli/src/`、`/var/www/`）
- 版本号（例如：`Node.js 18`、`Python 3.11`）
- 项目名称和 URL

### 项目专用内容（明确标记这些区段）

| 类别 | 示例 |
|------|------|
| **技术栈** | 编程语言、框架、版本 |
| **指令** | 构建、测试、lint、部署指令 |
| **文件结构** | 目录布局、关键文件 |
| **发布流程** | 版本文件、部署步骤 |
| **团队惯例** | 语言偏好、命名模式 |

---

## 标记惯例

使用明确的标记来区分内容类型：

### 选项 A：区段标题

```markdown
## 通用标准
[通用内容]

## 项目专用配置
[项目专用内容]
```

### 选项 B：行内标记

```markdown
> ⚠️ **项目专用**：此区段包含专属于本项目的配置。

### 技术栈
...
```

### 选项 C：注释标注

```markdown
<!-- 通用：以下适用于所有项目 -->
### Commit 消息格式
...

<!-- 项目专用：为你的项目自定义 -->
### 快速指令
...
```

---

## 国际化（i18n）

AI 指令档常需提供多语言版本——既为了国际采用者，也为了非英语母语维护者主导的项目。本章节定义多语言指令档的组织、验证与安装规则。

### AI 指令档的范围

本标准涵盖两个层级的 AI 指令档：

| 层级 | 范例 | i18n 模式 |
|------|------|----------|
| **Root 层** | `CLAUDE.md`、`.cursorrules`、`.windsurfrules`、`.opencode/instructions.md` | 单档内以 inline 段落分语言（例：`## 中文` / `## English`）|
| **Skill 层** | Claude Code `.claude/skills/{name}/SKILL.md`、OpenCode plugin instructions | Canonical（英文）+ `locales/{lang}/` 变体 |

> 注意：skill 层的多档结构主要对 Claude Code 适用。其他工具是 root 单档；对它们只有下方「分层语言策略」与「Chimera 防范」规则适用。

### 分层语言策略

每份 AI 指令档概念上有 **4 层**，各层语言责任不同：

| 层 | 内容 | Canonical (en) | Locale ({lang}) | 为何分这层 |
|----|------|---------------|----------------|-----------|
| **L1 — Metadata** | YAML frontmatter `description`、`argument-hint`、`allowed-tools` | **必须英文** | **必须对应 locale 语言** | AI 触发讯号；英文 token 效率最高 + 训练语料密度高 |
| **L2 — 指令（Instructions）** | 对 AI 的命令式规则（步骤、行为、allowed-tools 的理由） | **必须英文** | 对应 locale 语言（可选；可保留英文）| AI 读英文指令最精准；只有维护者需要以自己的语言阅读指令时，locale 版才有用 |
| **L3 — 输出范本（Output Templates）** | 范例输出、回应格式、情境范本 | 英文（canonical 锁定英文）| **强制对应 locale**（mandatory）| **唯一直接影响 AI 输出语言的层**——AI 会沿用它看到的范本语言 |
| **L4 — 人类文件** | 维护者注解、操作说明、贡献者说明 | 英文 | 对应 locale 语言（强烈建议）| 给人类维护者读，AI 不读 |

**关键 insight**：L1（description）是 AI 用来决定「**是否调用**」此 skill 的触发讯号——它**不**影响 AI 之后说什么。L3（output template）才是控制 AI 输出语言的唯一开关，因为 AI 会模仿它看到的范本语言。**i18n 强制检查应该聚焦在 L3——加强 L1 的强制是常见错误，解决的是错的问题。**

### Canonical / Locale 档案结构

UDS 标准与 skill 的 locale 变体结构：

```text
core/{name}.md                              ← canonical (English) — single source of truth
core/{name}.ai.yaml                         ← canonical structured (English)
locales/{lang}/core/{name}.md               ← locale variant (matches lang)
locales/{lang}/ai/standards/{name}.ai.yaml  ← locale .ai.yaml (matches lang)
skills/{name}/SKILL.md                      ← canonical skill (English)
locales/{lang}/skills/{name}/SKILL.md       ← locale skill variant
```

**命名惯例**：使用 BCP 47 语言标签——`zh-TW`、`zh-CN`、`ja`、`ko`、`en-US` 等。

### Locale 变体 Frontmatter 必填栏位

每个 locale 变体都必须带有可追溯的 frontmatter，才能侦测漂移：

```yaml
---
name: {same name as canonical}
source: {relative path back to canonical}
source_version: {version of canonical at time of translation}
translation_version: {version of this translation}
---
```

canonical 更新（bump `source_version`）时，locale 维护者应重新同步并 bump `translation_version`。`source_version` 落后超过 2 个 minor 版本会触发 drift 警告（见「Chimera 防范」）。

### 责任边界

| 角色 | 拥有 | 必须做 |
|------|------|--------|
| **Canonical 拥有者** | `core/{name}.md`、`core/{name}.ai.yaml`、`skills/{name}/SKILL.md` | 维持 L1/L2/L3/L4 为英文；每次 breaking change 都 bump `source_version` |
| **Locale 维护者** | `locales/{lang}/...` 档案 | `translation_version` 对齐 `source_version`；翻译 L1（必）、L2（选）、L3（必）、L4（建议）|
| **采用者（下游项目）** | 自己的 `.claude/skills/`、`CLAUDE.md` 等 | 用 `uds init --locale {lang}`（首次）或 `uds update --locale {lang}`（重新同步）安装；**绝不**手动修改 canonical 档案（一律编辑 locale 变体或使用 overlay）|

### Chimera 防范

**Chimera** 指违反分层规则、混用语言的档案。常见的 chimera 模式：

| 模式 | 严重度 | 侦测方式 |
|------|--------|----------|
| Canonical 的 `description` 栏位含 CJK | ❌ Error | Lint: `canonical:description-must-be-ascii` |
| Locale 变体的 `description` 栏位是纯 ASCII | ❌ Error | Lint: `locale:description-must-match-language` |
| Locale 变体缺 `source:` frontmatter | ❌ Error | Lint: `locale:must-have-source-frontmatter` |
| Canonical L3 输出范本含非英文范例回应 | ⚠️ Warn | Lint: `canonical:l3-language-consistency` |
| `.claude/skills/` 中的采用者档案与 canonical 及任何 locale 变体都不同 | ⚠️ Warn | Sync check: `adopter:must-match-installed-locale` |
| `translation_version` 落后 `source_version` 超过 2 个 minor 版本 | ⚠️ Warn | Drift check |

Pre-commit / CI lint 应强制执行 error 级规则；warn 级规则显示在仪表板上，但不阻断。

### 采用者安装

采用者通过 UDS CLI 安装指令档：

```bash
uds init --locale zh-tw     # first-time install of skills + standards in Traditional Chinese
uds update --locale zh-tw   # re-sync an existing adoption
```

**Locale 解析优先顺序**：
1. `--locale` CLI flag（最高优先）
2. `.uds/install.yaml` 的 `locale:` 栏位
3. 环境变量 `UDS_LOCALE`
4. Fallback：`en`

**Locale 不存在时的 fallback**：某个 skill 没有所请求的 locale 变体时，CLI 会：
- 安装 canonical（英文）档案
- 发出 WARN，列出改用 fallback 的 skills
- **不**阻断安装

这让 locale 覆盖不完整时，采用者仍能正常安装。采用者可查阅 `locales/COVERAGE.md`，取得哪些已翻译、哪些未翻译的权威清单。

### 迁移：已有 chimera 的采用者

若采用者已在自己的项目中手动修改过 canonical 档案（例如翻译了 `.claude/skills/` 里的 description）：

1. **辨识 chimera**：比对采用者档案与 UDS canonical 及 canonical 的 locale 变体。
2. **安装正确变体**：执行 `uds update --locale {lang}`，以 locale 变体取代 chimera 档案。
3. **保留项目级客制**：若 chimera 含有正当的项目级客制（不只是翻译），将其抽出为 overlay，或记录在采用者的客制化纪录中（例如 `UDS-CUSTOMIZATION.md`）。
4. **丢弃纯翻译**：只是翻译的 chimera 变更应丢弃——正确的 locale 变体会取代它们。

### 快速参考

| 动作 | 何时 | 工具 / 档案 |
|------|------|------------|
| 新增语言支援 | 想支援新 locale | 建立 `locales/{lang}/...`，镜射 canonical 结构 |
| 更新 canonical | 改进英文 source | Bump `source_version`；通知 locale 维护者 |
| 翻译 / 同步 locale | 新增或更新 locale 内容 | Bump `translation_version`；引用当前的 `source_version` |
| 检查覆盖率 | 定期 review | 查看自动产生的 `locales/COVERAGE.md` |
| 带 locale 安装 | 采用者初设 | `uds init --locale {lang}` |
| 带 locale 重新同步 | 既有采用 | `uds update --locale {lang}` |
| 跑 i18n lint | Commit 前 / CI | `uds check --i18n` |

---

## 维护检查清单

在提交 AI 指令文件的变更之前：

- [ ] **通用区段**：无项目特定的路径、指令或版本
- [ ] **项目专用区段**：已用标签明确标记
- [ ] **交叉引用**：指向标准文档的链接正确
- [ ] **一致性**：格式与现有区段一致

### 泄漏检测

执行此检查以找出通用区段中可能的项目特定内容泄漏：

```bash
# 示例：在通用区段中找出硬编码指令
grep -n "npm\|yarn\|pip\|cargo" CLAUDE.md | head -20
```

审查每个匹配项，确保它在项目专用区段中。

---

## 快速参考卡

### 通用 vs 项目专用

| 类型 | 包含 | 示例 |
|------|------|------|
| **通用** | 通用规则 | 「提交前执行测试」 |
| **项目专用** | 具体指令 | 「提交前执行 `npm test`」 |

### 区段标记

| 标记 | 含义 |
|------|------|
| `## 通用` | 适用于任何项目 |
| `## 项目专用` | 专属于本项目 |
| `> ⚠️ 项目专用` | 特定区段的行内警告 |

---

## 相关标准

- [文档结构](documentation-structure.md)
- [文档写作标准](documentation-writing-standards.md)
- [反幻觉指南](anti-hallucination.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-14 | 初始发布 |
| 1.1.0 | 2026-05-28 | 新增 i18n 章节；范围延伸至 skill 层级文件 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
