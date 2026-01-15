---
name: changelog-guide
description: |
  依照 Keep a Changelog 格式撰写与維護 CHANGELOG.md。
  使用时机：建立变更日誌条目、准备發布、记录变更。
  关鍵字：changelog, release notes, CHANGELOG.md, keep a changelog, 变更日誌, 發布说明。
source: ../../../../../skills/claude-code/changelog-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 变更日誌指南

> **语言**: [English](../../../../../skills/claude-code/changelog-guide/SKILL.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-30
**適用範圍**: Claude Code Skills

---

## 目的

此技能幫助依照 Keep a Changelog 格式撰写与維護 CHANGELOG.md 文件，确保清楚地向使用者传达变更内容。

## 快速參考

### 文件结构

```markdown
# 变更日誌

本项目的所有重要变更都將记录在此文件中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)，
并遵循[語義化版本](https://semver.org/)。

## [未發布]

## [1.2.0] - 2025-12-15

### 新增
- 功能描述

### 变更
- 变更描述

### 修復
- 错误修復描述

[未發布]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

### 变更类别

| 类别 | 使用时机 | 範例 |
|------|----------|------|
| **新增 (Added)** | 新功能 | 新增深色模式支援 |
| **变更 (Changed)** | 現有功能的修改 | 搜尋效能提升 50% |
| **棄用 (Deprecated)** | 即將移除的功能 | 棄用 legacyParse() |
| **移除 (Removed)** | 已移除的功能 | 移除 Node.js 14 支援 |
| **修復 (Fixed)** | 错误修復 | 修復登入逾时問題 |
| **安全 (Security)** | 安全性修補 | 修復 XSS 漏洞 |

### Commit Type 对应 Changelog

| Commit Type | Changelog 类别 | 备註 |
|-------------|----------------|------|
| `feat` | **新增** | 新功能 |
| `fix` | **修復** | 错误修復 |
| `perf` | **变更** | 效能改善 |
| `security` | **安全** | 安全性修補 |
| `BREAKING CHANGE` | **变更** 或 **移除** | 加上 **BREAKING** 前綴 |
| `refactor`, `docs`, `style`, `test`, `chore` | *(通常省略)* | 对使用者無影響 |

## 条目格式

### 标准格式

```markdown
- [动作动詞] [变更内容] ([參考])
```

### 範例

```markdown
### 新增
- 新增可自订小工具的使用者儀表板 (#123)
- 新增 PostgreSQL 15 支援 (PR #456)

### 变更
- **BREAKING**: API 响应格式從 XML 改为 JSON (#789)
- 更新最低 Node.js 版本至 18.0 (#101)

### 修復
- 修復处理大型文件时的记忆体洩漏 (#112)
- 修復报表中日期格式错误 (#134)

### 安全
- 修復搜尋端点的 SQL 注入漏洞 (高風險, CVE-2025-12345)
```

## 详细指南

完整标准請參考：
- [变更日誌标准](../../../core/changelog-standards.md)

### AI 優化格式（节省 Token）

AI 助手可使用 YAML 格式文件以減少 Token 使用量：
- 基礎标准：`ai/standards/changelog.ai.yaml`

## 撰写指南

### 为使用者撰写，而非开发者

| ✅ 好 | ❌ 不好 | 原因 |
|-------|--------|------|
| 新增深色模式主題选项 | 使用 context 实作 ThemeProvider | 使用者可見的好处 |
| 修復慢速网络的登入逾时 | 修復 AuthService 中的競爭条件 | 影響描述 |
| 页面载入速度提升 40% | 使用索引優化 SQL 查詢 | 可量化的成果 |

### 破壞性变更

务必清楚標记破壞性变更：

```markdown
### 变更
- **BREAKING**: 移除已棄用的 `getUserById()` 方法，請改用 `getUser()`
- **BREAKING**: 设置檔格式從 YAML 改为 TOML

### 移除
- **BREAKING**: 移除 Node.js 14 支援
```

### 安全公告

包含嚴重程度和 CVE（如有）：

```markdown
### 安全
- 修復搜尋端点的 SQL 注入漏洞 (高風險, CVE-2025-12345)
- 修復留言區的 XSS 漏洞 (中風險)
- 更新 `lodash` 相依套件以修補原型污染 (低風險)
```

## 版本標題格式

```markdown
## [版本] - YYYY-MM-DD
```

範例：
```markdown
## [2.0.0] - 2025-12-15
## [1.5.0-beta.1] - 2025-12-01
## [未發布]
```

## 排除規則

以下**不应**记录在 CHANGELOG 中：

| 类别 | 範例 | 原因 |
|------|------|------|
| 建置输出 | `dist/`, `build/` | 产生的文件 |
| 相依套件 | `node_modules/`, lock 文件 | 自动管理 |
| 本地设置 | `.env`, `*.local.json` | 環境特定 |
| IDE 设置 | `.vscode/`, `.idea/` | 开发者偏好 |
| 內部重構 | 程序码風格、变數名称 | 对使用者無影響 |

## 常見错误

| ❌ 错误 | ✅ 正确 |
|--------|--------|
| 没有日期 | 使用 ISO 格式包含日期 |
| 缺少版本連結 | 在底部加入比較連結 |
| 內部術語 | 使用使用者友善的语言 |
| 過於技術性 | 專注於使用者影響 |
| 没有分类 | 使用标准类别 |

---

## 设置偵测

此技能支援项目特定设置。

### 偵测順序

1. 检查現有 `CHANGELOG.md` 格式
2. 检查 `CONTRIBUTING.md` 中的变更日誌指南
3. 若無找到，**预设使用 Keep a Changelog 格式**

### 首次设置

若 CHANGELOG.md 不存在：

1. 建议使用标准範本建立
2. 建议在 `CONTRIBUTING.md` 中记录指南：

```markdown
## 变更日誌指南

- 为所有使用者可見的变更更新 CHANGELOG.md
- 开发期间將条目加入 [未發布] 區段
- 使用标准类别：新增、变更、棄用、移除、修復、安全
- 引用 issue/PR 编号：`修復错误 (#123)`
- 使用 **BREAKING** 前綴標记破壞性变更
```

---

## 相关标准

- [变更日誌标准](../../../core/changelog-standards.md)
- [版本控制标准](../../../core/versioning.md)
- [提交消息指南](../../../core/commit-message-guide.md)
- [發布标准技能](../release-standards/SKILL.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-30 | 初始發布 |

---

## 授权

此技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
