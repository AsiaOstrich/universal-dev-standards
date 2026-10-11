---
source: ../../../../skills/release-standards/release-workflow.md
source_version: 2.2.0
translation_version: 2.2.0
last_synced: 2026-10-11
source_hash: 77ab71c9f97f
status: current
---

# 发布流程指南

> **Language**: [English](../../../../skills/release-standards/release-workflow.md) | 简体中文

**版本**: 2.2.0
**最后更新**: 2026-01-26
**适用范围**: 所有使用语义化版本的软件项目

---

## 目的

本文档提供适用于任何软件项目的通用发布流程指南。涵盖版本管理、发布类型和标准发布流程。

> **注意**：项目特有配置（额外的版本文件、翻译同步、自定义验证脚本）请在项目的 `CLAUDE.md` 文件中定义。

---

## 发布类型

### 1. Beta 发布（测试版本）

**使用时机：**
- 在稳定版发布前测试新功能
- 向早期采用者收集反馈
- 在生产环境前验证错误修正

**版本模式：** `X.Y.Z-beta.N`（例如：`3.2.1-beta.1`）

**npm 标签：** `@beta`

---

### 2. 稳定发布（正式版本）

**使用时机：**
- 所有功能已测试并验证
- 准备好用于生产环境
- 所有测试通过

**版本模式：** `X.Y.Z`（例如：`3.2.1`）

**npm 标签：** `@latest`

---

### 3. Alpha 发布（早期测试）

**使用时机：**
- 非常早期的测试，功能不稳定
- 仅限内部团队测试

**版本模式：** `X.Y.Z-alpha.N`（例如：`3.3.0-alpha.1`）

**npm 标签：** `@alpha`

---

### 4. 候选发布（预发布）

**使用时机：**
- 稳定版发布前的最终测试
- 不包含新功能，仅错误修正

**版本模式：** `X.Y.Z-rc.N`（例如：`3.2.1-rc.1`）

**npm 标签：** `@rc`

---

## 标准发布流程

> **流程理念**：先定版本，再验证。在测试之前先更新版本，确保验证针对的正是要发布的确切版本。

### 步骤 1：准备发布分支

```bash
# 确保在 main 分支并已更新
git checkout main
git pull origin main

# 检查 git 状态（应为干净状态）
git status
```

### 步骤 2：更新版本

```bash
# npm 项目
npm version X.Y.Z --no-git-tag-version        # 稳定版
npm version X.Y.Z-beta.N --no-git-tag-version # Beta 版

# 其他项目，手动更新版本文件
# 更新所有项目特有的版本文件（参见 CLAUDE.md）
```

### 步骤 3：更新 CHANGELOG

依照 [Keep a Changelog](https://keepachangelog.com/) 格式更新 `CHANGELOG.md`：

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- 新功能描述

### Changed
- 变更描述

### Fixed
- 错误修正描述
```

Beta 版本需加上警告：

```markdown
## [X.Y.Z-beta.N] - YYYY-MM-DD

> ⚠️ **Beta 发布**：供测试使用。安装方式：`npm install <package>@beta`
```

### 步骤 4：执行所有测试

```bash
# 执行自动化测试
npm test  # 或项目的测试命令

# 执行代码检查
npm run lint  # 或项目的 lint 命令

# 执行发布前检查（如有）
./scripts/pre-release-check.sh  # 或 .\scripts\pre-release-check.ps1

# 执行文档同步检查（如有）
./scripts/check-usage-docs-sync.sh  # 或 .\scripts\check-usage-docs-sync.ps1
```

### 步骤 5：手动验证

继续之前，手动验证：

- [ ] **构建验证**：应用程序构建成功
- [ ] **冒烟测试**：核心功能按预期运作
- [ ] **版本显示**：版本号显示正确
- [ ] **Beta 版**：已知问题已记录在 CHANGELOG 中

> ⚠️ **任何验证失败时请在此停止。** 先修复问题再继续。

### 步骤 6：提交与标签

```bash
# 提交变更
git add .
git commit -m "chore(release): X.Y.Z"

# 创建并推送标签
git tag vX.Y.Z
git push origin main --tags
```

### 步骤 7：创建 Release

创建 GitHub/GitLab Release：
- Tag：`vX.Y.Z`
- 标题：`vX.Y.Z - [Release Name]`
- 若为 beta/alpha/rc，标记为 pre-release
- 从 CHANGELOG 加入发布说明

### 步骤 8：验证发布

```bash
# npm 包
npm view <package-name> dist-tags

# 测试安装
npm install -g <package-name>@<version>

# 验证版本
<command> --version  # 应显示 X.Y.Z
```

---

## npm dist-tag 策略

| 版本模式 | npm Tag | 安装命令 |
|---------|---------|---------|
| `X.Y.Z` | `latest` | `npm install <package>` |
| `X.Y.Z-beta.N` | `beta` | `npm install <package>@beta` |
| `X.Y.Z-alpha.N` | `alpha` | `npm install <package>@alpha` |
| `X.Y.Z-rc.N` | `rc` | `npm install <package>@rc` |

### 自动标签检测

用于 CI/CD 自动化，使用正则表达式检测版本类型：

```bash
VERSION=$(node -p "require('./package.json').version")

if [[ $VERSION =~ -beta\. ]]; then
  TAG=beta
elif [[ $VERSION =~ -alpha\. ]]; then
  TAG=alpha
elif [[ $VERSION =~ -rc\. ]]; then
  TAG=rc
else
  TAG=latest
fi

npm publish --tag $TAG
```

---

## CHANGELOG 格式

### Beta 发布格式

```markdown
## [X.Y.Z-beta.N] - YYYY-MM-DD

> ⚠️ **Beta 发布**：这是测试版本。

### Added
- 功能描述

### Fixed
- 错误修正描述
```

### 稳定发布格式

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- 功能描述及详情

### Changed
- 变更描述

### Fixed
- 错误修正描述
```

---

## 版本编号策略

遵循[语义化版本](https://semver.org/)：

| 变更类型 | 版本递增 | 示例 |
|---------|---------|------|
| 破坏性变更 | MAJOR | 2.9.5 → 3.0.0 |
| 新功能（向后兼容） | MINOR | 3.1.5 → 3.2.0 |
| 错误修正（向后兼容） | PATCH | 3.2.0 → 3.2.1 |
| 预发布 | 新增后缀 | 3.2.1 → 3.2.1-beta.1 |

---

## 故障排除

### npm Tag 错误

如果使用错误的标签发布：

```bash
npm dist-tag add <package>@<version> <correct-tag>
```

### 需要撤回发布

```bash
# 选项 1：弃用
npm deprecate <package>@<version> "Please use <new-version> instead"

# 选项 2：取消发布（仅限 72 小时内）
npm unpublish <package>@<version>

# 选项 3：发布补丁版本
npm version patch
```

---

## 预发布检查清单

### 通用检查（所有发布）

- [ ] 在正确的分支（稳定版用 main）
- [ ] Git 工作目录干净
- [ ] 所有必要文件中的版本已更新
- [ ] CHANGELOG 已更新发布说明
- [ ] 所有测试通过
- [ ] Linting 通过
- [ ] 构建成功
- [ ] 核心功能正常（冒烟测试）
- [ ] 生成的文档已是最新版本（如适用）

### 文档同步验证

发布前，验证文档已与源代码同步。

**硬性检查（自动化、阻塞性）：**
- 生成的文档与当前源文件一致
- 文档链接有效
- 功能数量和表格准确

**软性检查（人工审查、建议性）：**
- 发布说明准确描述变更
- README 反映新功能
- 迁移指南完整（如适用）

### Beta 发布前

- [ ] 通用检查完成
- [ ] 已知问题已记录在 CHANGELOG 中

### 稳定发布前

- [ ] 通用检查完成
- [ ] Beta 测试完成（如适用）
- [ ] 无严重错误
- [ ] 已创建迁移指南（如有破坏性变更）

---

## 项目特有配置

项目特有的发布需求请在 `CLAUDE.md` 文件中定义：

```markdown
## Release Process (Project-Specific)

### Additional Version Files
- `path/to/file1.json` - description
- `path/to/file2.json` - description

### Pre-release Scripts
# macOS / Linux
./scripts/your-pre-release-check.sh

# Windows PowerShell
.\scripts\your-pre-release-check.ps1

### Additional Verification
- Custom verification step 1
- Custom verification step 2
```

这让 AI 助手在执行 `/release` 命令时自动应用项目特有规则。

---

## AI 助手指南

协助发布时：

1. **识别发布类型：** 询问是 beta、alpha、rc 或稳定版
2. **执行预发布检查：** 测试、linting、git 状态
3. **检查项目特有规则：** 阅读 `CLAUDE.md` 获取额外需求
4. **验证文档同步：** 确保生成的文档与源文件一致
5. **更新版本：** 使用适当的版本命令
6. **更新 CHANGELOG：** 遵循标准格式
7. **创建 git tag：** 格式 `v{VERSION}`
8. **创建 release：** GitHub/GitLab release
9. **验证发布：** 检查 dist-tags 并测试安装

---

## 相关文档

- [语义化版本指南](./semantic-versioning.md)
- [Changelog 格式](./changelog-format.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.2.0 | 2026-01-26 | 简化为通用的 Beta→Stable 流程；Alpha→Beta→Stable 移至项目特有配置 |
| 2.1.0 | 2026-01-26 | 采用“先定版本”流程：更新版本 → 测试 → 验证 → 发布 |
| 2.0.0 | 2026-01-14 | 重构为通用指南，项目特有内容移至 CLAUDE.md |
| 1.0.0 | 2026-01-02 | 初始发布流程指南 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
