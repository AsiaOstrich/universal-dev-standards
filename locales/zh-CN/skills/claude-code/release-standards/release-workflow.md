---
source: ../../../../../skills/claude-code/release-standards/release-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 发布流程指南

> **Language**: [English](../../../../skills/claude-code/release-standards/release-workflow.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2026-01-02
**适用范围**: Universal Development Standards 专案

---

## 目的

本文件提供 Universal Development Standards 专案的完整逐步发布流程，包含版本管理、npm 发布、GitHub 发布和 dist-tag 处理。

---

## 发布类型

### 1. Beta 发布（测试版本）

**使用时机：**
- 在稳定版发布前测试新功能
- 向早期采用者收集回馈
- 在生产环境前验证错误修正

**版本模式：** `X.Y.Z-beta.N`（例如：`3.2.1-beta.1`）

**npm 标签：** `@beta`

**安装方式：** `npm install -g universal-dev-standards@beta`

---

### 2. 稳定发布（正式版本）

**使用时机：**
- 所有功能已测试并验证
- 准备好用于生产环境
- 所有测试通过

**版本模式：** `X.Y.Z`（例如：`3.2.1`）

**npm 标签：** `@latest`

**安装方式：** `npm install -g universal-dev-standards`

---

### 3. Alpha 发布（早期测试）

**使用时机：**
- 非常早期的测试，功能不稳定
- 仅限内部团队测试

**版本模式：** `X.Y.Z-alpha.N`（例如：`3.3.0-alpha.1`）

**npm 标签：** `@alpha`

**安装方式：** `npm install -g universal-dev-standards@alpha`

---

### 4. 候选发布（预发布）

**使用时机：**
- 稳定版发布前的最终测试
- 不包含新功能，仅错误修正

**版本模式：** `X.Y.Z-rc.N`（例如：`3.2.1-rc.1`）

**npm 标签：** `@rc`

**安装方式：** `npm install -g universal-dev-standards@rc`

---

## 完整发布流程

### 流程 A：Beta 发布

```bash
# 1. 确保在 main 分支并已更新
git checkout main
git pull origin main

# 2. 确保所有测试通过
cd cli
npm test
npm run lint

# 3. 更新版本号为 beta
npm version 3.2.1-beta.1

# 4. 更新 CHANGELOG.md
# - 在 [Unreleased] 区段下新增条目
# - 建立新区段：## [3.2.1-beta.1] - YYYY-MM-DD
# - 将 [Unreleased] 的变更移到新区段

# 5. 提交变更（如果手动更新了 CHANGELOG）
git add CHANGELOG.md cli/package.json cli/package-lock.json
git commit -m "chore(release): bump version to 3.2.1-beta.1"

# 6. 建立并推送 git tag
git tag v3.2.1-beta.1
git push origin main --tags

# 7. 建立 GitHub Release
# - 前往：https://github.com/AsiaOstrich/universal-dev-standards/releases/new
# - Tag：v3.2.1-beta.1
# - 标题：v3.2.1-beta.1 - [功能名称] (Beta)
# - 标记为「Pre-release」
# - 描述：使用 .github/RELEASE_v3.2.1-beta.1.md 的范本
# - 点击「Publish release」

# 8. GitHub Actions 自动发布到 npm 并标记为 @beta
# - 工作流程：.github/workflows/publish.yml
# - 自动标签侦测：版本包含 "-beta." → @beta 标签
# - 无需手动执行 npm publish

# 9. 验证 npm 发布
npm view universal-dev-standards dist-tags
# 预期：{ latest: '3.2.0', beta: '3.2.1-beta.1' }

# 10. 测试安装
npm install -g universal-dev-standards@beta
uds --version  # 应显示 3.2.1-beta.1
```

---

### 流程 B：稳定发布（从 Beta）

```bash
# 1. 确保 beta 测试完成并所有问题已解决
# 2. 确保在 main 分支并已更新
git checkout main
git pull origin main

# 3. 确保所有测试通过
cd cli
npm test
npm run lint

# 4. 更新版本号为稳定版
npm version 3.2.1

# 5. 更新 CHANGELOG.md
# - 将 [3.2.1-beta.1] 的变更移到 [3.2.1]
# - 更新日期为发布日期
# - 移除 beta 专属的注记

# 6. 提交变更
git add CHANGELOG.md cli/package.json cli/package-lock.json
git commit -m "chore(release): bump version to 3.2.1"

# 7. 建立并推送 git tag
git tag v3.2.1
git push origin main --tags

# 8. 建立 GitHub Release
# - 前往：https://github.com/AsiaOstrich/universal-dev-standards/releases/new
# - Tag：v3.2.1
# - 标题：v3.2.1 - [功能名称]
# - 标记为「Latest release」
# - 描述：最终发布说明
# - 点击「Publish release」

# 9. GitHub Actions 自动发布到 npm 并标记为 @latest
# - 工作流程：.github/workflows/publish.yml
# - 自动标签侦测：无预发布识别符 → @latest 标签
# - 无需手动执行 npm publish

# 10. 验证 npm 发布
npm view universal-dev-standards dist-tags
# 预期：{ latest: '3.2.1', beta: '3.2.1-beta.1' }

# 11. 测试安装
npm install -g universal-dev-standards
uds --version  # 应显示 3.2.1
```

---

### 流程 C：直接稳定发布（跳过 Beta）

```bash
# 仅在小幅修正或不需要 beta 测试时使用

# 1. 遵循流程 B 的步骤 1-11
# 2. 不需要 beta 版本，直接发布稳定版
```

---

## npm dist-tag 策略

专案在 `.github/workflows/publish.yml` 中使用自动标签侦测：

| 版本模式 | npm Tag | 安装指令 | 自动化？ |
|---------|---------|---------|---------|
| `X.Y.Z` | `latest` | `npm install -g universal-dev-standards` | ✅ 是 |
| `X.Y.Z-beta.N` | `beta` | `npm install -g universal-dev-standards@beta` | ✅ 是 |
| `X.Y.Z-alpha.N` | `alpha` | `npm install -g universal-dev-standards@alpha` | ✅ 是 |
| `X.Y.Z-rc.N` | `rc` | `npm install -g universal-dev-standards@rc` | ✅ 是 |

### 运作方式

GitHub Actions 工作流程会自动：

1. 从 `cli/package.json` 读取版本号
2. 使用正则表达式模式侦测版本类型
3. 使用正确的标签发布到 npm

**实作位置：** `.github/workflows/publish.yml` 第 39-60 行

---

## 疑难排解：手动修正 dist-tag

### 问题：手动 npm 发布后标签错误

如果不小心使用错误的标签发布（例如 beta 版本标记为 `@latest`）：

```bash
# 1. 登入 npm（如果尚未登入）
npm login

# 2. 修正标签
npm dist-tag add universal-dev-standards@3.2.0 latest      # 将先前的稳定版恢复为 @latest
npm dist-tag add universal-dev-standards@3.2.1-beta.1 beta # 将 beta 版本标记为 @beta

# 3. 验证修正
npm view universal-dev-standards dist-tags
# 预期：{ latest: '3.2.0', beta: '3.2.1-beta.1' }
```

### 问题：需要撤回发布

```bash
# 选项 1：弃用该版本
npm deprecate universal-dev-standards@3.2.1-beta.1 "Please use 3.2.1-beta.2 instead"

# 选项 2：取消发布（仅限 72 小时内，请谨慎使用）
npm unpublish universal-dev-standards@3.2.1-beta.1

# 选项 3：发布新的修补版本
npm version 3.2.2
# 然后遵循正常的发布流程
```

---

## CHANGELOG 更新指南

### Beta 发布格式

```markdown
## [Unreleased]

## [3.2.1-beta.1] - 2026-01-02

> ⚠️ **Beta 发布**：这是测试版本。请在稳定版发布前回报任何问题。

### Added
- **CLI**：在 Skills 安装流程中新增 Plugin Marketplace 支援

### Fixed
- **CLI**：修复 standards registry 中通配符路径处理导致 404 错误
- **CLI**：修复 init/configure/update 指令执行后程式未退出的问题

### Testing
- ✅ 所有 68 个单元测试通过
- ✅ ESLint 检查通过
```

### 稳定发布格式

```markdown
## [Unreleased]

## [3.2.1] - 2026-01-02

### Added
- **CLI**：在 Skills 安装流程中新增 Plugin Marketplace 支援
  - 在 Skills 安装提示中新增「Plugin Marketplace (推荐)」选项
  - CLI 在不尝试本地安装的情况下追踪透过 marketplace 安装的 Skills
  - `uds check` 指令显示 marketplace 安装状态

### Fixed
- **CLI**：修复下载范本时通配符路径处理导致 404 错误
- **CLI**：修复 init/configure/update 指令执行后程式未退出的问题
```

---

## 发布前准备

在开始发布流程之前，完成以下准备步骤。这些可以使用 `scripts/pre-release.sh` 自动化执行。

### 步骤 1：更新版本号

更新以下**所有**档案中的版本（共 6 个档案）：

| 档案 | 栏位 | 范例 |
|------|------|------|
| `cli/package.json` | `"version"` | `"3.3.0"` |
| `.claude-plugin/plugin.json` | `"version"` | `"3.3.0"` |
| `.claude-plugin/marketplace.json` | `"version"` | `"3.3.0"` |
| `cli/standards-registry.json` | `"version"`（3 处） | `"3.3.0"` |
| `README.md` | `**Version**:` 和 `**Last Updated**:` | `3.3.0`, `2026-01-08` |

**自动化命令：**
```bash
./scripts/pre-release.sh --version 3.3.0
```

### 步骤 2：更新 CHANGELOG.md

1. 在 `[Unreleased]` 下建立新版本区段
2. 整合所有 beta 变更（如果从 beta 发布稳定版）
3. 加入发布日期

**格式：**
```markdown
## [Unreleased]

## [3.3.0] - 2026-01-08

### 新增
- 功能描述...

### 变更
- 变更描述...

### 修复
- 修复描述...
```

### 步骤 3：翻译同步 (zh-TW)

确保所有 zh-TW 翻译已同步：

```bash
# 检查同步状态
./scripts/check-translation-sync.sh

# 需要更新的档案：
# - locales/zh-TW/README.md（版本 + 日期）
# - locales/zh-TW/CHANGELOG.md（新版本区段）
# - locales/zh-TW/CLAUDE.md（last_synced 日期）
# - 任何显示 [NO META] 或 [OUTDATED] 的档案
```

### 步骤 4：翻译同步 (zh-CN)

确保所有 zh-CN 翻译已同步：

```bash
# 检查同步状态
./scripts/check-translation-sync.sh zh-CN

# 如果 zh-TW 新增了档案，同步到 zh-CN：
# 使用 opencc 进行繁体到简体转换
uv run --with opencc-python-reimplemented python3 -c "
import opencc
converter = opencc.OpenCC('t2s')
# 转换档案...
"

# 需要更新的档案：
# - locales/zh-CN/README.md（版本 + 日期）
# - locales/zh-CN/CHANGELOG.md（新版本区段）
# - locales/zh-CN/CLAUDE.md（last_synced 日期）
```

### 步骤 5：执行验证

```bash
# 执行所有测试
cd cli && npm test

# 执行 linting
npm run lint

# 验证版本一致性
grep -r "3.3.0" cli/package.json .claude-plugin/ cli/standards-registry.json README.md

# 验证无残留 beta 版本（用于稳定版发布）
grep -r "beta" cli/package.json .claude-plugin/ cli/standards-registry.json | grep -v node_modules

# 验证翻译同步
./scripts/check-translation-sync.sh
./scripts/check-translation-sync.sh zh-CN
```

### 发布前准备脚本

使用自动化脚本进行一致的发布前准备：

```bash
# 完整准备（互动模式）
./scripts/pre-release.sh

# 指定版本
./scripts/pre-release.sh --version 3.3.0

# 跳过翻译同步（用于 beta 发布）
./scripts/pre-release.sh --version 3.3.0-beta.1 --skip-translations

# 预览模式（显示将会变更的内容）
./scripts/pre-release.sh --version 3.3.0 --dry-run
```

---

## 预发布检查清单

### 建立任何发布之前

- [ ] 所有测试通过（`npm test`）
- [ ] Linting 通过（`npm run lint`）
- [ ] CHANGELOG.md 已更新所有变更
- [ ] Git 工作目录干净（`git status`）

### 版本档案检查清单

更新并验证以下档案中的版本号：

- [ ] `cli/package.json` - 主要版本来源
- [ ] `.claude-plugin/plugin.json` - 插件版本和技能数量
- [ ] `.claude-plugin/marketplace.json` - Marketplace 版本和技能数量

**仅限稳定版本**（不适用于 beta/alpha/rc）：

- [ ] `README.md` - 标题中的版本号
- [ ] `cli/README.md` - 标题和变更日志表格中的版本号
- [ ] `cli/standards-registry.json` - 注册表版本
- [ ] `locales/*/README.md` - 标题中的版本号（所有维护中的语言版本）

### 文件验证检查清单

验证**新变更已加入**且**既有内容正确无误**：

**Skills 文件：**
- [ ] `skills/README.md` - 技能数量和清单正确
- [ ] `skills/INTEGRATION-GUIDE.md` - 技能数量正确
- [ ] `skills/claude-code/README.md` - 技能清单和安装说明正确
- [ ] `.claude-plugin/README.md` - 技能数量和清单正确

**专案文件：**
- [ ] `README.md` - 技能数量正确（见「Standards Coverage」区块）
- [ ] `CLAUDE.md` - 核心标准数量和技能数量正确
- [ ] `MAINTENANCE.md` - 档案数量和技能表格正确
- [ ] `STANDARDS-MAPPING.md` - 技能矩阵和统计正确

**本地化（所有语言版本）：**

对于每个支援的语言版本（`locales/zh-TW/`、`locales/zh-CN/` 等），验证对应翻译正确且已同步：

- [ ] `locales/*/README.md` - 技能数量正确
- [ ] `locales/*/CLAUDE.md` - 核心标准和技能数量正确
- [ ] `locales/*/MAINTENANCE.md` - 档案数量和技能表格正确
- [ ] `locales/*/STANDARDS-MAPPING.md` - 技能矩阵正确
- [ ] `locales/*/skills/claude-code/README.md` - 技能清单正确
- [ ] `locales/*/adoption/STATIC-DYNAMIC-GUIDE.md` - 技能数量正确

**内容正确性验证：**
- [ ] 搜寻过时的版本号：`grep -r "X.Y.Z" --include="*.md"`（将 X.Y.Z 替换为前一版本）
- [ ] 搜寻过时的技能数量：`grep -r "N skills" --include="*.md"`（将 N 替换为前一数量）
- [ ] 验证所有内部连结有效
- [ ] 验证统计数字和计数在所有档案中一致

**自动化验证：**
- [ ] 执行翻译同步检查：`./scripts/check-translation-sync.sh`

### Beta 发布之前

- [ ] 预发布检查清单完成
- [ ] 版本档案检查清单完成（仅 beta 版本档案）
- [ ] 文件验证检查清单完成
- [ ] 已知问题已记录在发布说明中

### 稳定发布之前

- [ ] 预发布检查清单完成
- [ ] 版本档案检查清单完成（所有档案）
- [ ] 文件验证检查清单完成
- [ ] Beta 测试完成（如适用）
- [ ] 所有 beta 回馈已处理
- [ ] 无严重或高优先级错误
- [ ] 已建立迁移指南（如有破坏性变更）

---

## 版本编号策略

遵循语义化版本：

| 变更类型 | 版本递增 | 范例 |
|---------|---------|------|
| 破坏性变更 | MAJOR | 2.9.5 → 3.0.0 |
| 新功能（向后相容） | MINOR | 3.1.5 → 3.2.0 |
| 错误修正（向后相容） | PATCH | 3.2.0 → 3.2.1 |
| Beta 发布 | 新增 `-beta.N` | 3.2.1 → 3.2.1-beta.1 |
| Alpha 发布 | 新增 `-alpha.N` | 3.3.0 → 3.3.0-alpha.1 |
| 候选发布 | 新增 `-rc.N` | 3.2.1 → 3.2.1-rc.1 |

---

## CI/CD 自动化

### GitHub Actions 工作流程

专案使用 `.github/workflows/publish.yml` 进行自动化发布：

**触发条件：** 建立 GitHub Release（任何 tag）

**步骤：**
1. Checkout 程式码
2. 设定 Node.js
3. 安装相依套件（`npm ci`）
4. 验证 CLI（`node bin/uds.js --version`）
5. **判断 npm tag**（自动版本侦测）
6. 使用正确的 tag 发布到 npm

**版本侦测逻辑：**
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

## 相关文件

- [语义化版本指南](./semantic-versioning.md)
- [Changelog 格式](./changelog-format.md)
- [MAINTENANCE.md](../../../MAINTENANCE.md) - 工作流程 6：发布新版本
- [.github/workflows/publish.yml](../../../.github/workflows/publish.yml)

---

## AI 助理指南

当被要求协助发布时，AI 助理应该：

1. **识别发布类型：** 询问这是 beta、alpha、rc 或稳定版
2. **执行预发布检查：** 测试、linting、git 状态
3. **更新版本：** 使用 `npm version` 搭配正确格式
4. **更新 CHANGELOG：** 遵循该发布类型的格式
5. **建立 git tag：** 格式 `v{VERSION}`
6. **提醒关于 GitHub Release：** 使用者必须手动建立
7. **发布后验证：** 检查 npm dist-tags
8. **绝不手动执行 `npm publish`：** GitHub Actions 会处理

### 互动范例

```
使用者：「我想发布 beta 版本」

AI：
我会协助你准备 beta 版本发布。请确认：

1. 版本号是多少？（例如：3.2.1-beta.1）
2. 主要包含哪些变更？

确认后，我会：
1. 执行测试和检查
2. 更新版本号和 CHANGELOG
3. 建立 git tag
4. 提供 GitHub Release 建立指示
5. GitHub Actions 会自动发布到 npm 并标记为 @beta
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-02 | 初始发布流程指南 |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
