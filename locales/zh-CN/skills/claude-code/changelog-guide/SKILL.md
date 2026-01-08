---
name: changelog-guide
description: |
  依照 Keep a Changelog 格式撰写与维护 CHANGELOG.md。
  使用时机：建立变更日志条目、准备发布、记录变更。
  关键字：changelog, release notes, CHANGELOG.md, keep a changelog, 变更日志, 发布说明。
source: ../../../../../skills/claude-code/changelog-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 变更日志指南

> **语言**: [English](../../../../../skills/claude-code/changelog-guide/SKILL.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: Claude Code Skills

---

## 目的

此技能帮助依照 Keep a Changelog 格式撰写与维护 CHANGELOG.md 档案，确保清楚地向使用者传达变更内容。

## 快速参考

### 档案结构

```markdown
# 变更日志

本专案的所有重要变更都将记录在此档案中。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，
并遵循[语义化版本](https://semver.org/)。

## [未发布]

## [1.2.0] - 2025-12-15

### 新增
- 功能描述

### 变更
- 变更描述

### 修复
- 错误修复描述

[未发布]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

### 变更类别

| 类别 | 使用时机 | 范例 |
|------|----------|------|
| **新增 (Added)** | 新功能 | 新增深色模式支援 |
| **变更 (Changed)** | 现有功能的修改 | 搜寻效能提升 50% |
| **弃用 (Deprecated)** | 即将移除的功能 | 弃用 legacyParse() |
| **移除 (Removed)** | 已移除的功能 | 移除 Node.js 14 支援 |
| **修复 (Fixed)** | 错误修复 | 修复登入逾时问题 |
| **安全 (Security)** | 安全性修补 | 修复 XSS 漏洞 |

### Commit Type 对应 Changelog

| Commit Type | Changelog 类别 | 备注 |
|-------------|----------------|------|
| `feat` | **新增** | 新功能 |
| `fix` | **修复** | 错误修复 |
| `perf` | **变更** | 效能改善 |
| `security` | **安全** | 安全性修补 |
| `BREAKING CHANGE` | **变更** 或 **移除** | 加上 **BREAKING** 前缀 |
| `refactor`, `docs`, `style`, `test`, `chore` | *(通常省略)* | 对使用者无影响 |

## 条目格式

### 标准格式

```markdown
- [动作动词] [变更内容] ([参考])
```

### 范例

```markdown
### 新增
- 新增可自订小工具的使用者仪表板 (#123)
- 新增 PostgreSQL 15 支援 (PR #456)

### 变更
- **BREAKING**: API 回应格式从 XML 改为 JSON (#789)
- 更新最低 Node.js 版本至 18.0 (#101)

### 修复
- 修复处理大型档案时的记忆体泄漏 (#112)
- 修复报表中日期格式错误 (#134)

### 安全
- 修复搜寻端点的 SQL 注入漏洞 (高风险, CVE-2025-12345)
```

## 详细指南

完整标准请参考：
- [变更日志标准](../../../core/changelog-standards.md)

### AI 优化格式（节省 Token）

AI 助手可使用 YAML 格式档案以减少 Token 使用量：
- 基础标准：`ai/standards/changelog.ai.yaml`

## 撰写指南

### 为使用者撰写，而非开发者

| ✅ 好 | ❌ 不好 | 原因 |
|-------|--------|------|
| 新增深色模式主题选项 | 使用 context 实作 ThemeProvider | 使用者可见的好处 |
| 修复慢速网路的登入逾时 | 修复 AuthService 中的竞争条件 | 影响描述 |
| 页面载入速度提升 40% | 使用索引优化 SQL 查询 | 可量化的成果 |

### 破坏性变更

务必清楚标记破坏性变更：

```markdown
### 变更
- **BREAKING**: 移除已弃用的 `getUserById()` 方法，请改用 `getUser()`
- **BREAKING**: 设定档格式从 YAML 改为 TOML

### 移除
- **BREAKING**: 移除 Node.js 14 支援
```

### 安全公告

包含严重程度和 CVE（如有）：

```markdown
### 安全
- 修复搜寻端点的 SQL 注入漏洞 (高风险, CVE-2025-12345)
- 修复留言区的 XSS 漏洞 (中风险)
- 更新 `lodash` 相依套件以修补原型污染 (低风险)
```

## 版本标题格式

```markdown
## [版本] - YYYY-MM-DD
```

范例：
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [未发布]
```

## 排除规则

以下**不应**记录在 CHANGELOG 中：

| 类别 | 范例 | 原因 |
|------|------|------|
| 建置输出 | `dist/`, `build/` | 产生的档案 |
| 相依套件 | `node_modules/`, lock 档案 | 自动管理 |
| 本地设定 | `.env`, `*.local.json` | 环境特定 |
| IDE 设定 | `.vscode/`, `.idea/` | 开发者偏好 |
| 内部重构 | 程式码风格、变数名称 | 对使用者无影响 |

## 常见错误

| ❌ 错误 | ✅ 正确 |
|--------|--------|
| 没有日期 | 使用 ISO 格式包含日期 |
| 缺少版本连结 | 在底部加入比较连结 |
| 内部术语 | 使用使用者友善的语言 |
| 过于技术性 | 专注于使用者影响 |
| 没有分类 | 使用标准类别 |

---

## 设定侦测

此技能支援专案特定设定。

### 侦测顺序

1. 检查现有 `CHANGELOG.md` 格式
2. 检查 `CONTRIBUTING.md` 中的变更日志指南
3. 若无找到，**预设使用 Keep a Changelog 格式**

### 首次设定

若 CHANGELOG.md 不存在：

1. 建议使用标准范本建立
2. 建议在 `CONTRIBUTING.md` 中记录指南：

```markdown
## 变更日志指南

- 为所有使用者可见的变更更新 CHANGELOG.md
- 开发期间将条目加入 [未发布] 区段
- 使用标准类别：新增、变更、弃用、移除、修复、安全
- 引用 issue/PR 编号：`修复错误 (#123)`
- 使用 **BREAKING** 前缀标记破坏性变更
```

---

## 相关标准

- [变更日志标准](../../../core/changelog-standards.md)
- [版本控制标准](../../../core/versioning.md)
- [提交讯息指南](../../../core/commit-message-guide.md)
- [发布标准技能](../release-standards/SKILL.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-30 | 初始发布 |

---

## 授权

此技能采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
