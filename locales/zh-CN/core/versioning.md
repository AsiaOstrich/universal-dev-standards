---
source: ../../../core/versioning.md
source_version: 1.5.0
translation_version: 1.5.0
last_synced: 2026-10-16
source_hash: 5c995171e2a4
status: current
---

# 语义化版本标准

> **语言**: [English](../../../core/versioning.md) | [繁體中文](../../zh-TW/core/versioning.md) | 简体中文

**版本**: 1.5.0
**最后更新**: 2026-07-01
**适用范围**: 所有具有版本发布的软件项目
**范围**: universal
**行业标准**: Semantic Versioning 2.0.0
**参考**: [semver.org](https://semver.org/)

---

## 目的

本标准定义如何使用语义化版本（SemVer）对软件发布进行版本控制，以便向用户和维护者清晰地传达变更。

---

## 语义化版本格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### 组件

| 组件 | 用途 | 递增时机 |
|-----------|---------|-------------------|
| **MAJOR** | 破坏性变更 | 不兼容的 API 变更 |
| **MINOR** | 新功能 | 向后兼容的功能 |
| **PATCH** | 错误修复 | 向后兼容的错误修复 |
| **PRERELEASE** | 预发布标识符 | Alpha、beta、rc 版本 |
| **BUILD** | 构建元数据 | 构建号、提交哈希 |

---

## 递增规则

### MAJOR 版本 (X.0.0)

**递增时机**:
- 破坏性 API 变更
- 移除已弃用功能
- 重大架构变更
- 不兼容的行为变更

**示例**:
```
1.9.5 → 2.0.0  # Remove deprecated API
3.2.1 → 4.0.0  # Change return type of public method
```

**指南**:
- 将 MINOR 和 PATCH 重置为 0
- 编写迁移指南文档
- 在先前的 MINOR 版本中提供弃用警告

---

### MINOR 版本 (x.Y.0)

**递增时机**:
- 添加新功能（向后兼容）
- 弃用功能（不移除）
- 实质性内部改进
- 新的公开 API

**示例**:
```
2.3.5 → 2.4.0  # Add new API endpoint
1.12.0 → 1.13.0  # Add optional parameter to existing function
```

**指南**:
- 将 PATCH 重置为 0
- 现有功能保持不变
- 新功能为可选启用（opt-in）

---

### PATCH 版本 (x.y.Z)

**递增时机**:
- 错误修复（无新功能）
- 安全补丁
- 文档更正
- 内部重构（无 API 变更）

**示例**:
```
3.1.2 → 3.1.3  # Fix null pointer exception
2.0.0 → 2.0.1  # Security vulnerability patch
```

**指南**:
- 无新功能
- 无 API 变更
- 可立即安全更新

---

## 预发布版本

格式: `MAJOR.MINOR.PATCH-PRERELEASE`

### 预发布标识符

| 标识符 | 用途 | 稳定性 | 受众 |
|------------|---------|-----------|----------|
| `alpha` | 早期测试 | 不稳定 | 内部团队 |
| `beta` | 功能完备 | 基本稳定 | 早期采用者 |
| `rc` (release candidate) | 最终测试 | 稳定 | Beta 测试者 |

### 示例

```
1.0.0-alpha.1       # First alpha release
1.0.0-alpha.2       # Second alpha release
1.0.0-beta.1        # First beta release
1.0.0-beta.2        # Second beta release
1.0.0-rc.1          # Release candidate 1
1.0.0               # Stable release
```

### 排序

预发布版本按字典序排序：
```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## 构建元数据

格式: `MAJOR.MINOR.PATCH+BUILD`

### 示例

```
1.0.0+20250112            # Date-based build
2.3.1+001                 # Sequential build number
3.0.0+sha.5114f85         # Git commit hash
1.2.0-beta.1+exp.sha.5114f85  # Combined pre-release and build
```

### 指南

- 构建元数据不应（SHOULD NOT）影响版本优先级
- 用于 CI/CD 跟踪
- 包含在构件中，但不用于版本比较

> **关键：构建元数据绝不能（MUST NOT）用作部署鉴别器。**
> 由于工具在优先级与比较中会忽略 `+build`（见上文），仅在构建元数据上存在差异的两个构建（`1.2.3+abc` 与 `1.2.3+def`）**对版本比较工具而言是无法区分的**——回滚目标与 `semver` 比较会将它们视为同一个发布版本。使用 `+sha` 来区分行为不同的已部署构建属于绕过治理：版本将不再是用于 changelog / SBOM / 审计 / 回滚 / SLA / CVE 范围的关联键。交付的变更必须（MUST）获得真实的版本号递增或具有唯一且不可变的构件标识（参见下方的**部署版本标识**）——`+sha` **绝非**替代品。

---

## 部署版本标识

> 来源：一种常见的故障模式——多个行为不同的热修复构建部署在同一个 `X.Y.Z` 下，仅能通过 `+sha` 进行区分，导致回答“生产环境中运行的是哪个构建 / 修复 X 到底部署了没有？”变成了提交考古。

本节规范**可部署单元**的标识——无论该单元对于项目而言是什么（容器镜像、tar 包、发布的软件包）。它是对下文[发布流程](#release-process)的补充，后者描述了一种具体的单机发布流程；此处的标识规则无论采用何种部署机制均适用。

### 核心不变量

**每个不同的可部署构建产物必须携带唯一且不可变的版本标识（正式版本号 + 提交 sha）。**部署、*晋级*或*回滚***已有**产物绝不能改变其标识。

- **锚定于产物，而非部署动作。**新的构建（不同的源码或依赖项）⇒ 新版本。在不同环境之间流转（staging → prod，一次构建多次部署）、重新部署（蓝绿 / 金丝雀）或回滚的*同一个*构建属于**同一个**产物，并保持其标识——绝不能对其重新递增版本号。在晋级/回滚时重新递增版本号会导致版本号与实际运行的内容不符。（当回滚恢复先前的产物时，它恢复的是该产物的原始标识——而不是生成一个新的标识。）
- **绝不要在同一个 `X.Y.Z` 下部署两个不同的构建。**

### 通过自动化强制执行，而非仅靠纪律

该不变量应当通过自动化机制而非仅凭人工纪律来强制执行——上述故障模式*正是*因为遗漏了手动递增版本。以下任一方式均可满足要求：

- **提交驱动的发布自动化**（`semantic-release` / `standard-version`，参见[自动化工具](#automation-tools)）：在 CI 中根据提交历史推导并递增版本号，从而避免人工遗忘递增。
- **基于 Git 拓扑深度的版本化**（MinVer / Nerdbank.GitVersioning / GitVersion）：版本号派生自 git 提交拓扑结构，因此从结构上杜绝了冲突的可能。推荐用于多语言 / .NET / JVM 项目（自动化工具一节主要针对 Node）——参见[自动化工具](#automation-tools)下的 git-height 小节。注意单一代码库（monorepo）和 squash-merge 工作流的注意事项。
- **CI 唯一性关卡**：如果计算出的版本已作为 git 标签存在或已存在于注册表中，则使发布失败。

### 不可变产物（交叉引用）

唯一的*编号*是必要的，但并不充分——*产物*本身也必须是不可变且基于内容寻址的（例如，通过 digest 而非可变标签引用的容器镜像）。产物级别的具体要求——将部署固定到内容地址并禁止复用标签/版本——**属于 container-image-standards 的范畴**，并在其中加以规定；本标准仅要求版本标识本身保持唯一且不可变。

### 构建标识可观测（要求）

**已部署的服务必须通过可查询的端点**（专用的 `/version`，或嵌入在 `/health` 中）**暴露其构建标识——`version + commit sha + build time`**，以便运维人员无需检查二进制文件或进行提交考古即可确切了解当前运行的内容。基本原理：手动版本号可能会发生冲突（如上所述），因此运维需要借由 `sha` 来区分在同一个 `X.Y.Z` 下发布的两个构建。

要求：

- 暴露的 `sha` 必须与已部署产物的 sha 一致——它是**可验证的，而非自我报告的**（从构建中派生，切勿手动输入）。
- 端点应当进行访问控制；公开的构建标识端点会泄露内部提交标识。
- 发布后验证必须断言返回的 sha 等于已部署产物的 sha（参见[阶段 5：发布后验证](#phase-5-post-release-verification)），而不仅仅验证版本号是否正确。

这是部署 / 可观测性关注点：具体的验证*机制*（如何抓取端点以及如何将断言接入关卡）**属于 deployment-standards 的范畴**（将在其中进行规定），而 **supply-chain-attestation** 已经提供出处追踪（provenance），作为“该产物源自该 sha”的密码学背书。

---

## 初始开发阶段

### 0.x.x 版本

```
0.1.0  # Initial development release
0.2.0  # Add features
0.3.0  # Add more features
...
1.0.0  # First stable release
```

**指南**：
- 主版本号为 0 表示处于开发阶段
- API 可能会频繁变动
- MINOR 版本中允许包含破坏性变更
- 当 API 趋于稳定时迁移至 1.0.0

---

## 版本生命周期

### 发布周期示例

```
Development Phase:
0.1.0 → 0.2.0 → 0.9.0

First Stable Release:
1.0.0

Feature Additions:
1.0.0 → 1.1.0 → 1.2.0

Bug Fixes:
1.2.0 → 1.2.1 → 1.2.2

Next Major Release:
1.2.2 → 2.0.0-alpha.1 → 2.0.0-beta.1 → 2.0.0-rc.1 → 2.0.0
```

---

## 变更日志集成

> **另请参阅**：有关全面的 CHANGELOG 编写指南、格式模板和示例，请参阅 [changelog-standards.md](changelog-standards.md)。

### CHANGELOG.md 快速参考

CHANGELOG 文件应遵循 [Keep a Changelog](https://keepachangelog.com/) 格式，并包含以下类别：

| 类别 | 用途 |
|----------|---------|
| `Added` | 新功能 |
| `Changed` | 现有功能的变更 |
| `Deprecated` | 未来将移除的功能 |
| `Removed` | 已移除的功能 |
| `Fixed` | 错误修复 |
| `Security` | 安全漏洞补丁 |

**破坏性变更**：添加前缀 `**BREAKING**:` 以确保可见性。

有关完整的格式模板和示例，请参阅 [changelog-standards.md](changelog-standards.md)。

### 排除规则

CHANGELOG 不应记录以下类型的变更：

#### 1. 被 `.gitignore` 排除的目录

从版本控制中排除的目录不会被提交，因此不应记录在 CHANGELOG 中。

**原则**：项目的 `.gitignore` 中列出的任何目录或文件都不应记录在 CHANGELOG 中。

**常见排除类别（示例）**：

| 类别 | 常见目录/文件 | 原因 |
|----------|-------------------------|--------|
| AI 协作工具 | `.claude/`, `.cursor/`, `.ai/` | 本地开发辅助工具，不在版本控制中 |
| 开发标准 | `.standards/` | 本地标准文档，不在版本控制中 |
| 构建输出 | `dist/`, `build/`, `out/` | 构建产物，不在版本控制中 |
| 大数据 | `data/`, `datasets/` | 数据文件，不在版本控制中 |

**验证方法**：

**macOS / Linux:**
```bash
# Before generating CHANGELOG, check project's .gitignore exclusions
cat .gitignore | grep -E "^[^#*]" | head -20
```

**Windows PowerShell:**
```powershell
# Before generating CHANGELOG, check project's .gitignore exclusions
Get-Content .gitignore | Where-Object { $_ -match "^[^#*]" } | Select-Object -First 20
```

**注意**：每个项目应根据自身的 `.gitignore` 设置确定排除项。上表仅为常见示例。

#### 2. 构建产物和临时文件

以下类型的变更也不应记录：

- `bin/`、`obj/`、`Release/`、`Debug/` 及其他构建输出
- `*.log`、`*.tmp` 及其他临时文件
- `node_modules/`、`packages/` 及其他依赖目录

#### 3. 环境与配置文件（敏感数据）

包含敏感数据的文件不应记录：

- `*.env`、`.env.*` 环境变量文件
- `*.local.json`、`*.local.yaml` 本地配置文件（例如 .NET 的 `appsettings.*.local.json`）
- `*.pem`、`*.key`、`*.p12` 密钥与证书文件
- `credentials.*`、`secrets.*` 凭据文件

### 最佳实践

生成 CHANGELOG 时，请遵循以下流程：

1. **列出变更的提交**

   **macOS / Linux / Windows (Git):**
   ```bash
   git log main..HEAD --oneline
   ```

2. **排除不需要记录的提交**
   - 包含 "gitignore"、"version control" 或 "misc(version control)" 类型的提交
   - 仅修改排除目录的提交

3. **对记录进行分类**
   - 仅记录将提交到仓库的实际代码或文档变更
   - 确保所有记录的文件路径都存在于仓库中

4. **验证记录**

   **macOS / Linux:**
   ```bash
   # Verify that recorded paths exist in the repository
   git ls-files | grep -E "path/to/file"
   ```

   **Windows PowerShell:**
   ```powershell
   # Verify that recorded paths exist in the repository
   git ls-files | Select-String -Pattern "path/to/file"
   ```

---

## 发布流程

### 概述

完整的 Release 流程包含 5 个阶段：

1. **发布前诊断** - 强制要求
2. **环境准备**
3. **包生成**
4. **部署执行**
5. **发布后验证**

### 阶段 1：发布前诊断 - 强制要求

**目的**：在生成升级包之前评估目标服务器的环境状态

**检查项**：
- 系统工具版本
- 所需驱动
- 磁盘空间
- 数据库连通性
- 应用程序版本
- 配置完整性

**通过条件**（质量门禁）：
- 已安装所有必需工具
- 磁盘空间充足（至少 500MB）
- 数据库连接正常
- 无系统级错误

**失败处理**：
- 若诊断失败，执行环境准备（阶段 2）
- 修复后重新执行诊断
- 严禁跳过诊断直接进入打包阶段

---

### 阶段 2：环境准备

**目的**：根据诊断报告结果安装缺失的工具和驱动

**验证标准**：
- 所有诊断项均通过
- 数据库连接测试成功
- 验证工具显示无错误

---

### 阶段 3：包生成

**目的**：生成包含最新版本的升级包

**执行步骤**：
```bash
# 1. Confirm current branch and version
git branch
git describe --tags

# 2. Generate upgrade package (using project-provided packaging script)
./tools/generate-upgrade-package.sh -v v1.2.1 -o ./dist

# 3. Verify upgrade package contents
tar -tzf dist/upgrade-package-*.tar.gz | head -20
```

#### 升级包命名

**格式**：`{PROJECT}-upgrade-v{VERSION}-{DATE}.tar.gz`

| 元素 | 说明 | 示例 |
|------|------|------|
| `{PROJECT}` | 项目名称（替换为实际项目名称） | `my-app`、`api-server` |
| `{VERSION}` | 版本号（与 Git tag 一致） | `1.2.1`、`2.0.0-beta.1` |
| `{DATE}` | 打包日期（YYYYMMDD） | `20251128` |

**示例**（将 `{PROJECT}` 替换为您的项目名称）：
```
{PROJECT}-upgrade-v1.2.1-20251127.tar.gz
{PROJECT}-upgrade-v2.0.0-beta.1-20251201.tar.gz
```

---

### 阶段 4：部署执行

**目的**：在目标服务器上执行升级

**执行步骤**：
```bash
# 1. Upload upgrade package to target server
scp upgrade-package-*.tar.gz user@target:/tmp/

# 2. Extract upgrade package
cd /tmp
tar -xzf upgrade-package-*.tar.gz
cd upgrade-package-*/

# 3. Dry-run test (strongly recommended)
sudo ./upgrade.sh --dry-run

# 4. Actual upgrade
sudo ./upgrade.sh
```

**部署验证**：
- 备份已创建
- 服务成功停止
- 文件成功部署
- Schema 迁移成功（如适用）
- 服务成功启动

---

### 阶段 5：发布后验证

**目的**：确认升级成功且应用程序正常运行

**检查项**：
```bash
# 1. Check service status
systemctl status your-service

# 2. Check application build identity (version + commit sha + build time)
#    Assert the returned sha matches the deployed artifact's sha — not just the version.
curl http://localhost:PORT/version    # or /health, if build identity is embedded there
# Expected: {"version": "1.2.1", "sha": "<deployed-artifact-sha>", "buildTime": "..."}

# 3. Check logs for no errors
tail -100 /path/to/app.log | grep -i error
```

**成功标准**：
- 服务运行正常
- `/version`（或 `/health`）返回正确的版本号**以及**与已部署制品匹配的
  commit sha——仅版本匹配是不够的，因为两个构建可以共享同一个
  `X.Y.Z`（参见 [Build identity is observable](#build-identity-is-observable-requirement)）
- 日志中无致命错误
- 功能验证通过

---

### 发布检查清单

**发布前（诊断与准备）**：
- [ ] 执行服务器诊断
- [ ] 诊断报告通过所有检查项
- [ ] 环境准备已完成（如有缺失）
- [ ] 环境验证工具已通过

**发布（打包与部署）**：
- [ ] 升级包生成成功
- [ ] 升级包内容验证通过
- [ ] 空运行（Dry-run）测试无异常
- [ ] 备份计划已准备
- [ ] 回滚计划已准备

**发布后（验证与监控）**：
- [ ] 服务启动成功
- [ ] 版本号正确
- [ ] 功能验证通过
- [ ] 日志无异常

---

### 质量门禁

以下检查点**必须通过**，否则无法进入下一阶段：

| 阶段 | 门禁 | 失败处理 |
|------|------|----------|
| **诊断** | 诊断报告无错误 | 环境准备 |
| **准备** | 验证工具通过 | 修复并重新验证 |
| **打包** | 升级包结构完整 | 重新打包 |
| **部署** | 空运行（Dry-run）无异常 | 分析日志并修复 |
| **验证** | 服务运行正常 | 回滚 |

---

### 回滚计划

如果升级失败，执行以下回滚步骤：

```bash
# 1. Stop service
sudo systemctl stop your-service

# 2. Restore backup
BACKUP_PATH="/path/to/backup-$(date +%Y%m%d)"
sudo rm -rf /path/to/app
sudo mv "$BACKUP_PATH" /path/to/app

# 3. Restart service
sudo systemctl start your-service

# 4. Verify rollback success
sudo systemctl status your-service
```

---

### 合规性

**强制要求**：
- 严禁跳过诊断阶段
- 严禁跳过空运行（Dry-run）测试
- 必须保留诊断报告
- 必须准备回滚计划

**审计追踪**：
- 所有 Release 文档至少保留 12 个月
- 诊断报告关联至 Git Tag
- 完整保留升级日志

---

## Git 中的版本标签

### 创建标签

```bash
# Annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0"

# Tag with detailed message
git tag -a v2.0.0 -m "Release version 2.0.0

Major changes:
- New authentication system
- Redesigned API
- Performance improvements"

# Push tag to remote
git push origin v1.2.0

# Push all tags
git push origin --tags
```

### 标签命名规范

```
v1.0.0          ✅ Recommended (with 'v' prefix)
1.0.0           ✅ Acceptable (without 'v')
version-1.0.0   ❌ Avoid (too verbose)
1.0             ❌ Avoid (incomplete version)
```

---

## 自动化工具

### standard-version (Node.js)

```bash
# Install
npm install --save-dev standard-version

# Add to package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# Create release
npm run release              # Auto-increment based on commits
npm run release -- --release-as minor  # Force minor version
npm run release -- --release-as 2.0.0  # Specific version
```

### semantic-release (Node.js)

```bash
# Install
npm install --save-dev semantic-release

# Configure in .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### 基于 Git 高度推导的版本控制（多语言：.NET / JVM / 多语言）

上述工具以 Node/npm 为中心。对于 **.NET、JVM 或多语言项目**，更推荐**基于 Git 高度推导的版本控制**，其版本是根据 Git 标签图谱加上自上一个标签以来的提交数量（“提交高度”，commit height）自动计算得出，而不是存储在手动编辑的文件中。由于版本是 Git 历史的确定性函数，**两个不同的构建绝不会在同一版本号上发生冲突**，且不会遗忘任何手动版本递增步骤——这正是它能够从结构上而非依靠自律来满足[部署版本唯一性](#deployment-version-identity)的原因。

| 工具 | 生态系统 | 说明 |
|------|-----------|-------|
| **MinVer** | .NET / MSBuild | 从最近的 Git 标签加上提交高度推导版本；无需配置文件，无需集成构建服务器 |
| **Nerdbank.GitVersioning** (nbgv) | .NET（也支持 Node 等） | 读取 `version.json`；将版本 + Git 高度 + 提交 ID 写入程序集和软件包中 |
| **GitVersion** | 多语言（.NET，外加与语言无关的 CLI） | 由分支和标签拓扑驱动的可配置版本控制模式（例如 Mainline、持续交付 / 持续部署） |

**何时使用何种工具：**

- **Node / npm 项目** → 提交驱动的自动化（见上文 `semantic-release` / `standard-version`）：版本递增由约定式提交（Conventional Commits）推导而来。
- **多语言 / .NET / JVM 项目** → 基于 Git 高度推导的工具（MinVer / Nerdbank.GitVersioning / GitVersion）：版本由 Git 标签 + 提交高度推导而来。

这两类工具都消除了容易被遗忘的手动版本递增。**注意事项：** 在 monorepo（单一代码库）中，单个全仓库范围的提交高度可能无法清晰地映射到各个软件包的版本上，且 squash-merge（压缩合并）工作流程会改变提交高度——请根据你的打标签规范验证推导出的版本。

---

## 依赖版本范围

### npm (package.json)

```json
{
  "dependencies": {
    "exact": "1.2.3",           // Exact version
    "patch": "~1.2.3",          // >=1.2.3 <1.3.0
    "minor": "^1.2.3",          // >=1.2.3 <2.0.0
    "range": ">=1.2.3 <2.0.0",  // Explicit range
    "latest": "*"               // ❌ Avoid - any version
  }
}
```

**建议**：
- 大多数依赖项使用 `^`（次要版本更新）
- 保守更新使用 `~`（仅补丁更新）
- 关键依赖项使用精确版本
- 绝不要在生产环境中使用 `*`

---

### .NET (csproj)

```xml
<ItemGroup>
  <!-- Exact version -->
  <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />

  <!-- Minimum version -->
  <PackageReference Include="Microsoft.Extensions.Logging" Version="[8.0.0,)" />

  <!-- Version range -->
  <PackageReference Include="AutoMapper" Version="[12.0.0,13.0.0)" />
</ItemGroup>
```

---

## 破坏性变更与弃用

破坏性变更是驱动 **MAJOR** 版本递增的因素（参见[递增规则](#incrementing-rules)）——这就是 SemVer 向使用者传达不兼容变更的方式。演进和退役 API 的*契约层级*细节由负责这些关注点的标准所拥有，因此每条规则都有单一事实来源：

- **API 版本化策略、向后兼容性检查清单（何为破坏性变更）、代码中的弃用注解以及迁移指南模板** → [API 设计标准](api-design-standards.md#api-versioning-strategies)
- **弃用生命周期、按 API 级别的最短通知期限、`Sunset` / `Deprecation` 标头以及使用者通知** → [弃用与下线标准](deprecation-standards.md#api-deprecation)

本标准仅保留版本编号规则：不兼容的变更必须作为 MAJOR 升级发布，且弃用应在执行移除的 MAJOR 之前的某个 MINOR 版本中公布（参见 [MAJOR 版本](#major-version-x00)指南）。

---

## 项目配置

### 在 README.md 中记录

```markdown
## Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

### Version Format
`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

### Release Cycle
- **Major releases**: Annually (breaking changes)
- **Minor releases**: Quarterly (new features)
- **Patch releases**: As needed (bug fixes)

### Support Policy
- Latest major version: Full support
- Previous major version: Security fixes only (1 year)
- Older versions: No support

### Changelog
See [CHANGELOG.md](CHANGELOG.md) for release history.
```

---

## 版本比较

### 优先级规则

```
1.0.0 < 2.0.0 < 2.1.0 < 2.1.1

1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0

1.0.0 < 1.0.0+001 (build metadata ignored in precedence)
```

### 代码中的比较

```javascript
// JavaScript (using semver package)
const semver = require('semver');

semver.gt('1.2.3', '1.2.2');  // true
semver.satisfies('1.2.3', '^1.0.0');  // true
semver.major('2.3.1');  // 2
```

---

## 常见问题

### Q: 我应该何时发布 1.0.0？

**A**: 当 API 稳定且准备好承诺向后兼容时。

---

### Q: 内部破坏性变更是否需要递增 MAJOR？

**A**: 不需要，仅在公开 API 变更时递增。内部重构属于 PATCH 或 MINOR。

---

### Q: 我可以跳过版本号吗？

**A**: 可以，但不推荐。为了清晰起见，请使用连续的版本编号。

---

### Q: 库与应用程序该如何进行版本控制？

**A**:
- **库**：严格遵循 SemVer（API 至关重要）
- **应用程序**：可以更加灵活（用户体验至关重要）

---

## 相关标准

- [变更日志标准](changelog-standards.md)
- [Git 工作流标准](git-workflow.md)
- [提交消息指南](commit-message-guide.md)
- [API 设计标准](api-design-standards.md) — API 版本化策略、向后兼容性规则、迁移指南
- [弃用与下线标准](deprecation-standards.md) — 弃用生命周期与最短通知期限

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.5.0 | 2026-07-01 | 新增：在自动化工具中为多语言 / .NET / JVM 项目添加了基于 git-height 推导的版本控制工具（MinVer / Nerdbank.GitVersioning / GitVersion）（UDS #138 R2）；将“构建标识可观测”提升为一项要求——已部署的服务必须通过可查询端点暴露 `version + commit sha + build time`——并在 Phase 5 发布后验证中添加了 commit-sha + build-time 断言（UDS #138 R3） |
| 1.4.0 | 2026-06-24 | 移出（至单一来源）：API 版本化策略（去重）、弃用时间线 + 各层级期限、向后兼容性检查清单，以及迁移指南模板——现归属于 api-design-standards / deprecation-standards；版本控制标准对其进行交叉引用（XSPEC-298 R8, UDS #126） |
| 1.3.0 | 2026-06-23 | 新增：部署版本标识章节；构建元数据作为部署区分标识的注意事项（源自 UDS #138） |
| 1.2.0 | 2025-12-30 | 新增：API 版本化策略、弃用时间线、向后兼容性检查清单 |
| 1.1.3 | 2025-12-24 | 新增：相关标准章节 |
| 1.1.2 | 2025-12-11 | 改进：升级包命名示例，使用通用占位符代替硬编码的项目名称 |
| 1.1.1 | 2025-12-04 | 重构：CHANGELOG 排除规则以使其更通用（移除了特定于项目的目录） |
| 1.1.0 | 2025-12-04 | 新增：CHANGELOG 排除规则、发布流程章节 |
| 1.0.0 | 2025-11-12 | 初始版本控制标准 |

---

## 参考资料

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Calendar Versioning](https://calver.org/)（备用方案）

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
