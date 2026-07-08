---
source: ../../../core/packaging-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-06-10
source_hash: 69ff3afd3c1e
status: current
---

# 打包标准

> **语言**: [English](../../../core/packaging-standards.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-05-26
**适用性**: 使用 UDS-aware 工具链的项目
**范围**: 通用 (Universal)

---

## 目的

本标准定义一套基于 Recipe 的打包框架，让用户项目可在 專案 packaging 配置（路徑由採用層決定） 中声明打包目标（target）。UDS 负责提供 Recipe 定义与内置 Recipe 库；采用层 runtime 在 pipeline 中执行编排。

框架的关注点分离如下：
- **用户项目**：声明「打包什么」（targets + 配置覆盖）
- **UDS**：定义「如何打包」（Recipe 结构 + 内置 Recipes）
- **采用层 pipeline**：执行「何时打包」（在 Review 与 Deploy 之间的 pipeline 阶段）

---

## 核心原则

| 原则 | 说明 |
|------|------|
| **Recipe-based** | 每个打包目标都参照一个具名 Recipe；不在 pipeline YAML 中编写临时脚本 |
| **声明式 targets** | 项目在 專案 packaging 配置（路徑由採用層決定） 中声明 targets；采用层 runtime 负责解析与执行 |
| **可定制** | 四个定制层允许配置覆盖、Hook 注入、自定义 Recipe 及 Escape Hatch |
| **整合至 Pipeline** | 打包作为独立阶段运行于 採用層 pipeline 的 Review 与 Deploy 之间 |

---

## Recipe 结构

Recipe 是定义如何打包项目的 YAML 文件，字段定义如下：

```yaml
# Recipe: <name>.yaml
name: <string>            # 必填 — 唯一标识符（kebab-case）
description: <string>     # 选填 — 人类可读描述
requires:                 # 选填 — 执行前必须存在的文件
  - <file-path>
steps:                    # 必填 — 有序的构建/打包步骤清单
  - run: <shell-command>
    description: <string> # 选填 — 步骤描述
config:                   # 选填 — 默认配置值（可被用户项目覆盖）
  <key>: <value>
hooks:                    # 选填 — 生命周期 hooks（~ 表示不执行）
  preBuild: ~
  postBuild: ~
  prePublish: ~
  postPublish: ~
```

### 必填与选填字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 唯一标识符，kebab-case 格式 |
| `steps` | 是 | 至少需要一个步骤 |
| `description` | 否 | 人类可读描述 |
| `requires` | 否 | 前置条件文件检查 |
| `config` | 否 | 默认配置值；所有 key 均可被用户项目覆盖 |
| `hooks` | 否 | 生命周期 hook 插入点；`~` 表示不执行 |

### 步骤变量

配置值与运行时上下文可在 `run` 命令中使用 `{variable}` 占位符：

| 变量 | 来源 | 示例 |
|------|------|------|
| `{registry}` | `config.registry` | `ghcr.io` |
| `{name}` | `package.json#name` 或 `config.name` | `my-app` |
| `{version}` | `package.json#version` 或 `config.version` | `1.2.3` |
| `{platforms}` | `config.platforms` | `linux/amd64,linux/arm64` |
| `{output_dir}` | `config.output_dir` | `dist/installers` |

---

## 内置 Recipes

UDS 随附四个内置 Recipe，位于 `recipes/` 目录：

| Recipe | 文件 | 使用场景 |
|--------|------|----------|
| `npm-library` | `recipes/npm-library.yaml` | 不含执行入口的 npm 包 |
| `npm-cli` | `recipes/npm-cli.yaml` | 含 `bin` 字段的 npm 包（CLI 工具） |
| `docker-service` | `recipes/docker-service.yaml` | Docker 容器镜像构建与推送 |
| `windows-installer` | `recipes/windows-installer.yaml` | Windows 安装包（.msi / .exe）通过用户脚本 |

### 选择 Recipe 的决策流程

```
产出物是 npm 包吗？
├── 是 → package.json 是否含有 "bin" 字段？
│         ├── 是 → npm-cli
│         └── 否 → npm-library
└── 否 → 产出物是容器镜像吗？
          ├── 是 → docker-service
          └── 否 → 产出物是 Windows 安装包吗？
                    ├── 是 → windows-installer
                    └── 否 → 编写自定义 Recipe（参见定制层）
```

---

## 定制层

需要偏离内置 Recipe 默认值的项目，应使用最低适用层：

| 层级 | 机制 | 使用时机 |
|------|------|----------|
| **L1 — 配置覆盖** | 專案 packaging 配置（路徑由採用層決定） 中的 `config:` 块 | 更改默认值（registry URL、tag、输出目录）|
| **L2 — Hook 注入** | 專案 packaging 配置（路徑由採用層決定） 中的 `hooks:` 块 | 在构建或发布前后执行额外命令 |
| **L3 — 自定义 Recipe** | 项目 `.uds/recipes/` 中的新 `.yaml` 文件 | 完全不同的构建流程；内置 Recipe 不适用 |
| **L4 — Escape Hatch** | target 定义中以 `script:` 替代 `recipe:` | 原始 shell 脚本，无合适的 Recipe 抽象 |

### L1 示例 — 配置覆盖

```yaml
# .uds/packaging.yaml
targets:
  - name: publish-npm
    recipe: npm-library
    config:
      registry: https://npm.pkg.github.com
      access: restricted
      tag: beta
```

### L2 示例 — Hook 注入

```yaml
# .uds/packaging.yaml
targets:
  - name: docker-push
    recipe: docker-service
    hooks:
      postPush: |
        curl -X POST https://hooks.example.com/deploy-notify \
          -d "{\"version\": \"{version}\"}"
```

### L3 示例 — 自定义 Recipe

```yaml
# .uds/recipes/electron-app.yaml
name: electron-app
description: 构建 Electron 桌面应用程序
requires:
  - package.json
  - electron-builder.yml
steps:
  - run: npm run build
  - run: npx electron-builder --publish never
config:
  output_dir: dist
```

### L4 示例 — Escape Hatch

```yaml
# .uds/packaging.yaml
targets:
  - name: legacy-bundle
    script: |
      ./scripts/legacy-bundle.sh
      mv output/ dist/bundle/
```

---

## 打包验收标准

当以下**所有**条件均满足时，打包执行视为**成功**：

| 标准 | 阈值 | 备注 |
|------|------|------|
| 所有 `requires` 文件存在 | 100% | 在任何步骤执行前检查 |
| 所有步骤以 exit code 0 结束 | 100% | 任何非零 exit 使执行失败 |
| `postBuild` 产出物存在 | 存在于预期路径 | 构建步骤后由采用层 runtime 验证 |
| Hook 命令以 exit code 0 结束 | 100% | Hook 失败会传播为步骤失败 |
| 已发布产出物可被取回 | HTTP 200 / registry 查询成功 | 由采用层 runtime 在发布后进行 smoke check |

### 失败处理

| 失败类型 | 行动 | 可重试？ |
|----------|------|----------|
| `requires` 文件缺失 | 立即失败，报告缺失路径 | 否 |
| 步骤非零 exit | 立即失败，若已定义则执行 `postBuild` hook | 可配置（默认：否）|
| Hook 非零 exit | 立即失败 | 否 |
| 发布无法连接 | 以指数退避重试最多 3 次 | 是（3×）|

---

## 归档格式完整性

当打包步骤生成将被部署脚本使用的归档（`.zip`、`.tar.gz`、`.tar.bz2` 等）时，**真实的二进制格式必须与文件扩展名一致**。命名为 `.zip` 的文件必须是真正的 ZIP 归档（PKZip 魔数 `PK\x03\x04`），而不是改名后的 tar 归档。

> **为何必须：** 格式不匹配的归档会触发下游静默失败。PowerShell 的 `Expand-Archive` 和 `[System.IO.Compression.ZipFile]::ExtractToDirectory()` 会**不抛出任何错误地**接受 tar 改名为 `.zip` 的文件——文件被读取，但什么都不会被解压，且没有任何异常。若部署脚本的下一步是破坏性操作（例如"删除当前安装目录"），则运行中的安装将被销毁而无任何内容可替换。

### 发布前验证

每个生成归档的打包步骤**必须**在声明成功前包含格式验证。最低验证要求：

| 格式 | 验证单行命令 |
|---|---|
| `.zip` | `python -c "import zipfile; zipfile.ZipFile('out.zip').namelist()"` 必须成功 |
| `.zip`（Unix） | `file out.zip` 必须报告 `Zip archive data`，**不得**为 `POSIX tar archive` |
| `.tar.gz` | `tar -tzf out.tar.gz >/dev/null` 必须成功 |
| 任意格式 | 可选：对预期文件清单进行哈希比对 |

验证失败必须在发布前终止打包流水线。

### 各平台配置示例

**Windows — 应当使用：**

```powershell
# 选项 A：PowerShell 内置（生成真正的 ZIP）
Compress-Archive -Path "publish\*" -DestinationPath "dist\patch.zip" -Force

# 选项 B：.NET API（生成真正的 ZIP）
Add-Type -Assembly System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    "publish", "dist\patch.zip", "Optimal", $false
)
```

**Windows — 不应使用：**

```bash
# ❌ git-bash / busybox 的 tar -a -cf 在 Windows 上不可靠
# -a "按扩展名自动选择格式" 标志会生成带 .zip 扩展名的 POSIX tar 归档。
# `file patch.zip` → "POSIX tar archive (GNU)"（而非 "Zip archive data"）
cd publish && tar -a -cf "../dist/patch.zip" api/
```

**类 Unix 系统 — 应当使用：**

```bash
# 使用 'zip' 生成 ZIP 归档（BSD/Linux）
zip -r dist/patch.zip publish/

# 使用 'tar -czf'（不加 -a）生成 tar.gz 归档——明确、确定
tar -czf dist/patch.tar.gz publish/

# 发布前验证
file dist/patch.zip            # 期望 "Zip archive data"
python -c "import zipfile; zipfile.ZipFile('dist/patch.zip').namelist()"
```

### 消费者侧防御

生产者无法保证消费者会进行验证。消费者（部署脚本）**必须**在任何破坏性操作前验证归档完整性。消费者侧要求参见[部署标准 — 防御性部署排序](deployment-standards.md#防御性部署排序)。

### 失败模式参考（真实事故）

某 Windows IIS 生产部署脚本（2026-05-24）在 git-bash 中使用 `tar -a -cf patch.zip api/` 生成发布归档。消费者侧的 PowerShell 部署脚本随后执行了 `Expand-Archive`（对该 tar 改名文件静默无操作），继续对运行中的 `apiDir` 执行 `Remove-Item -Recurse`，然后从根本不存在的源路径执行 `Copy-Item`（因为什么都没有被解压）。运行中的安装被清空，AppPool 停止，生产环境中断了约 3 分钟，直到基于备份的回滚完成。

（a）生产者使用自动扩展名 tar，（b）消费者未验证解压输出——这两个因素共同造成了运行中的安装被销毁，且整个过程无任何错误被报告。

---

## 相关标准

- [部署标准](deployment-standards.md) — 打包后的部署阶段
- [Pipeline 整合标准](pipeline-integration-standards.md) — CI/CD pipeline 配置
- [Check-in 标准](checkin-standards.md) — 打包前的质量关卡
- [版本控制标准](versioning.md) — 包产出物使用的版本号
- [供应链证明标准](supply-chain-attestation.md) — 打包产出物的 SBOM / SLSA 溯源 / 签名（此处的格式完整性属于归档层级；证明则补充了从源码到产出物的溯源）

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-05-26 | 新增：归档格式完整性章节——真实格式必须与扩展名一致的规则、验证单行命令、Windows 配置 DO/DON'T 列表、真实事故参考（XSPEC-231 / 关闭 issue #113） |
| 1.0.0 | 2026-04-15 | 初始发行 — XSPEC-034 Phase 1 |

---

## 许可证

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
