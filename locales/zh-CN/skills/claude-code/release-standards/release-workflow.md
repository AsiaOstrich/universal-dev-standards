---
source: ../../../../../skills/claude-code/release-standards/release-workflow.md
source_version: 2.2.0
translation_version: 2.2.0
last_synced: 2026-01-26
status: current
---

# 發布流程指南

> **Language**: [English](../../../../../skills/claude-code/release-standards/release-workflow.md) | 简体中文

**版本**: 2.2.0
**最後更新**: 2026-01-26
**適用範圍**: 所有使用語義化版本的软体项目

---

## 目的

本文件提供適用於任何软体项目的通用發布流程指南。涵蓋版本管理、發布类型和标准發布流程。

> **注意**：项目特有配置（額外的版本文件、翻譯同步、自订验证脚本）請在项目的 `CLAUDE.md` 文件中定義。

---

## 發布类型

### 1. Beta 發布（测试版本）

**使用时机：**
- 在穩定版發布前测试新功能
- 向早期採用者收集回饋
- 在生产環境前验证错误修正

**版本模式：** `X.Y.Z-beta.N`（例如：`3.2.1-beta.1`）

**npm 标签：** `@beta`

---

### 2. 穩定發布（正式版本）

**使用时机：**
- 所有功能已测试并验证
- 准备好用於生产環境
- 所有测试通過

**版本模式：** `X.Y.Z`（例如：`3.2.1`）

**npm 标签：** `@latest`

---

### 3. Alpha 發布（早期测试）

**使用时机：**
- 非常早期的测试，功能不穩定
- 僅限內部团队测试

**版本模式：** `X.Y.Z-alpha.N`（例如：`3.3.0-alpha.1`）

**npm 标签：** `@alpha`

---

### 4. 候選發布（预發布）

**使用时机：**
- 穩定版發布前的最終测试
- 不包含新功能，僅错误修正

**版本模式：** `X.Y.Z-rc.N`（例如：`3.2.1-rc.1`）

**npm 标签：** `@rc`

---

## 标准發布流程

### 步骤 1：發布前检查

```bash
# 确保在 main 分支并已更新
git checkout main
git pull origin main

# 执行测试
npm test  # 或项目的测试指令

# 执行程序码检查
npm run lint  # 或项目的 lint 指令

# 检查 git 状态
git status  # 应为乾淨状态
```

### 步骤 2：更新版本

```bash
# npm 项目
npm version X.Y.Z        # 穩定版
npm version X.Y.Z-beta.N # Beta 版

# 其他项目，手动更新版本文件
```

### 步骤 3：更新 CHANGELOG

依照 [Keep a Changelog](https://keepachangelog.com/) 格式更新 `CHANGELOG.md`：

```markdown
## [Unreleased]

## [X.Y.Z] - YYYY-MM-DD

### Added
- 新功能描述

### Changed
- 变更描述

### Fixed
- 错误修正描述
```

### 步骤 4：提交与标签

```bash
# 提交变更
git add .
git commit -m "chore(release): X.Y.Z"

# 建立并推送标签
git tag vX.Y.Z
git push origin main --tags
```

### 步骤 5：建立 Release

建立 GitHub/GitLab Release：
- Tag：`vX.Y.Z`
- 標題：`vX.Y.Z - [Release Name]`
- 若为 beta/alpha/rc，標记为 pre-release
- 從 CHANGELOG 加入發布说明

### 步骤 6：验证發布

```bash
# npm 套件
npm view <package-name> dist-tags

# 测试安裝
npm install -g <package-name>@<version>
```

---

## npm dist-tag 策略

| 版本模式 | npm Tag | 安裝指令 |
|---------|---------|---------|
| `X.Y.Z` | `latest` | `npm install <package>` |
| `X.Y.Z-beta.N` | `beta` | `npm install <package>@beta` |
| `X.Y.Z-alpha.N` | `alpha` | `npm install <package>@alpha` |
| `X.Y.Z-rc.N` | `rc` | `npm install <package>@rc` |

### 自动标签偵测

用於 CI/CD 自动化，使用正則表达式偵测版本类型：

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

### Beta 發布格式

```markdown
## [X.Y.Z-beta.N] - YYYY-MM-DD

> ⚠️ **Beta 發布**：这是测试版本。

### Added
- 功能描述

### Fixed
- 错误修正描述
```

### 穩定發布格式

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- 功能描述及詳情

### Changed
- 变更描述

### Fixed
- 错误修正描述
```

---

## 版本编号策略

遵循[語義化版本](https://semver.org/)：

| 变更类型 | 版本递增 | 範例 |
|---------|---------|------|
| 破壞性变更 | MAJOR | 2.9.5 → 3.0.0 |
| 新功能（向後相容） | MINOR | 3.1.5 → 3.2.0 |
| 错误修正（向後相容） | PATCH | 3.2.0 → 3.2.1 |
| 预發布 | 新增後綴 | 3.2.1 → 3.2.1-beta.1 |

---

## 疑難排解

### npm Tag 错误

如果使用错误的标签發布：

```bash
npm dist-tag add <package>@<version> <correct-tag>
```

### 需要撤回發布

```bash
# 选项 1：棄用
npm deprecate <package>@<version> "Please use <new-version> instead"

# 选项 2：取消發布（僅限 72 小时內）
npm unpublish <package>@<version>

# 选项 3：發布修補版本
npm version patch
```

---

## 预發布检查清单

### 通用检查

- [ ] 所有测试通過
- [ ] Linting 通過
- [ ] Git 工作目录乾淨
- [ ] CHANGELOG 已更新
- [ ] 在正确的分支（穩定版用 main）

### Beta 發布前

- [ ] 通用检查完成
- [ ] 已知問題已记录

### 穩定發布前

- [ ] 通用检查完成
- [ ] Beta 测试完成（如適用）
- [ ] 無嚴重错误
- [ ] 已建立迁移指南（如有破壞性变更）

---

## 项目特有配置

项目特有的發布需求請在 `CLAUDE.md` 中定義：

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

这讓 AI 助手在执行 `/release` 指令时自动套用项目特有規則。

---

## AI 助理指南

協助發布时：

1. **識别發布类型：** 詢問是 beta、alpha、rc 或穩定版
2. **执行预發布检查：** 测试、linting、git 状态
3. **检查项目特有規則：** 阅读 `CLAUDE.md` 取得額外需求
4. **更新版本：** 使用適當的版本指令
5. **更新 CHANGELOG：** 遵循标准格式
6. **建立 git tag：** 格式 `v{VERSION}`
7. **建立 release：** GitHub/GitLab release
8. **验证發布：** 检查 dist-tags 并测试安裝

---

## 相关文件

- [語義化版本指南](./semantic-versioning.md)
- [Changelog 格式](./changelog-format.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0.0 | 2026-01-14 | 重構为通用指南，项目特有内容移至 CLAUDE.md |
| 1.0.0 | 2026-01-02 | 初始發布流程指南 |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。
