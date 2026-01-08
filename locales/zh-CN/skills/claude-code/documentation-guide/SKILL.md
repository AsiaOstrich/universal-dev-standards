---
source: skills/claude-code/documentation-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
name: documentation-guide
description: |
  Guide documentation structure, README content, and project documentation best practices.
  Use when: creating README, documentation, docs folder, project setup.
  Keywords: README, docs, documentation, CONTRIBUTING, CHANGELOG, 文件, 说明文件.
---

# 文件指南

> **语言**: [English](../../../../../skills/claude-code/documentation-guide/SKILL.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本 Skill 提供专案文件结构、README 内容和文件最佳实践的指导。

## 快速参考

### 必要专案档案

| 档案 | 必要性 | 用途 |
|------|:------:|------|
| `README.md` | ✅ | 专案概述、快速入门 |
| `CONTRIBUTING.md` | 建议 | 贡献指南 |
| `CHANGELOG.md` | 建议 | 版本历史 |
| `LICENSE` | ✅ (开源) | 授权资讯 |

### 文件完整性检查清单

- [ ] README.md 存在且包含必要章节
- [ ] 安装说明清楚明确
- [ ] 提供使用范例
- [ ] 贡献指南已记录
- [ ] 已指定授权

## 详细指南

完整标准请参阅：
- [文件结构](./documentation-structure.md)
- [README 范本](./readme-template.md)

## README.md 必要章节

### 最小可行 README

```markdown
# 专案名称

简短的单行描述。

## 安装

```bash
npm install your-package
```

## 使用

```javascript
const lib = require('your-package');
lib.doSomething();
```

## 授权

MIT
```

### 建议的 README 章节

1. **专案名称与描述**
2. **徽章** (CI 状态、覆盖率、npm 版本)
3. **功能** (项目符号列表)
4. **安装**
5. **快速入门 / 使用**
6. **文件** (连结至 docs/)
7. **贡献** (连结至 CONTRIBUTING.md)
8. **授权**

## docs/ 目录结构

```
docs/
├── index.md              # 文件索引
├── getting-started.md    # 快速入门指南
├── architecture.md       # 系统架构
├── api-reference.md      # API 文件
├── deployment.md         # 部署指南
└── troubleshooting.md    # 常见问题
```

## 档案命名规范

### 根目录 (大写)

```
README.md          # ✅ GitHub 自动显示
CONTRIBUTING.md    # ✅ GitHub 在 PR 中自动连结
CHANGELOG.md       # ✅ Keep a Changelog 惯例
LICENSE            # ✅ GitHub 自动侦测
```

### docs/ 目录 (小写-连字号)

```
docs/getting-started.md     # ✅ URL 友善
docs/api-reference.md       # ✅ URL 友善
docs/GettingStarted.md      # ❌ 大小写问题
docs/API_Reference.md       # ❌ 不一致
```

## 范例

### 良好的 README.md

```markdown
# MyProject

一个适用于 Node.js 的快速、轻量级 JSON 解析器。

[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm version](https://badge.fury.io/js/myproject.svg)](https://www.npmjs.com/package/myproject)

## 功能

- 比标准 JSON.parse 快 10 倍
- 支援串流
- 使用 TypeScript 类型安全

## 安装

```bash
npm install myproject
```

## 快速入门

```javascript
const { parse } = require('myproject');

const data = parse('{"name": "test"}');
console.log(data.name); // "test"
```

## 文件

完整文件请参阅 [docs/](docs/)。

## 贡献

贡献指南请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 授权

MIT - 详见 [LICENSE](LICENSE)
```

### 良好的 CHANGELOG.md

```markdown
# 变更日志

此专案的所有重要变更都将记录在此档案中。

## [未发布]

### 新增
- 新功能 X

## [1.2.0] - 2025-12-15

### 新增
- OAuth2 身份验证支援
- 新的 API 端点 `/users/profile`

### 变更
- 改进错误讯息

### 修复
- 修复 session 快取中的记忆体泄漏

## [1.1.0] - 2025-11-01

### 新增
- 初始版本
```

---

## 配置侦测

此 Skill 支援专案特定的文件配置。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 中的「停用 Skills」区段
   - 如果列出此 Skill，则此专案停用该功能
2. 检查 `CONTRIBUTING.md` 中的「文件语言」区段
3. 检查现有文件结构
4. 若未找到，**预设为英文**

### 文件稽核

审查专案时，请检查：

| 项目 | 检查方式 |
|------|----------|
| README 存在 | 根目录有档案 |
| README 完整 | 包含安装、使用、授权章节 |
| CONTRIBUTING 存在 | 档案存在 (团队专案) |
| CHANGELOG 存在 | 档案存在 (版本化专案) |
| docs/ 组织良好 | 有 index.md、逻辑结构 |
| 连结正常运作 | 内部连结正确解析 |

### 首次设定

如果缺少文件：

1. 询问使用者：「此专案没有完整的文件。应该使用哪种语言？(English / 中文)」
2. 使用者选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## 文件语言

此专案使用 **[选择的选项]** 作为文件语言。
<!-- 选项：English | 中文 -->
```

3. 从 README.md 开始 (必要)
4. 新增 LICENSE (开源专案)
5. 新增 CONTRIBUTING.md (团队专案)
6. 建立 docs/ 结构 (复杂专案)

### 配置范例

在专案的 `CONTRIBUTING.md` 中：

```markdown
## 文件语言

此专案使用 **English** 作为文件语言。
<!-- 选项：English | 中文 -->
```

---

## 相关标准

- [文件撰写标准](../../../../../core/documentation-writing-standards.md)
- [文件结构标准](../../../../../core/documentation-structure.md)
- [变更日志标准](../../../../../core/changelog-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准章节 (目的、相关标准、版本历史、授权) |

---

## 授权

本 Skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
