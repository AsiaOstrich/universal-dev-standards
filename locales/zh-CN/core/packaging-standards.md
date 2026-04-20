---
source: ../../../core/packaging-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 打包标准

> **语言**: [English](../../../core/packaging-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-15
**适用性**: 使用 UDS/DevAP 工具链的项目
**范围**: 通用 (Universal)

---

## 目的

本标准定义一套基于 Recipe 的打包框架，让用户项目可在 `.devap/packaging.yaml` 中声明打包目标（target）。UDS 负责提供 Recipe 定义与内置 Recipe 库；DevAP 则在 pipeline 中执行编排。

框架的关注点分离如下：
- **用户项目**：声明「打包什么」（targets + 配置覆盖）
- **UDS**：定义「如何打包」（Recipe 结构 + 内置 Recipes）
- **DevAP**：执行「何时打包」（在 Review 与 Deploy 之间的 pipeline 阶段）

---

## 核心原则

| 原则 | 说明 |
|------|------|
| **Recipe-based** | 每个打包目标都参照一个具名 Recipe；不在 pipeline YAML 中编写临时脚本 |
| **声明式 targets** | 项目在 `.devap/packaging.yaml` 中声明 targets；DevAP 负责解析与执行 |
| **可定制** | 四个定制层允许配置覆盖、Hook 注入、自定义 Recipe 及 Escape Hatch |
| **整合至 Pipeline** | 打包作为独立阶段运行于 VibeOps pipeline 的 Review 与 Deploy 之间 |

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
| **L1 — 配置覆盖** | `.devap/packaging.yaml` 中的 `config:` 块 | 更改默认值（registry URL、tag、输出目录）|
| **L2 — Hook 注入** | `.devap/packaging.yaml` 中的 `hooks:` 块 | 在构建或发布前后执行额外命令 |
| **L3 — 自定义 Recipe** | 项目 `.devap/recipes/` 中的新 `.yaml` 文件 | 完全不同的构建流程；内置 Recipe 不适用 |
| **L4 — Escape Hatch** | target 定义中以 `script:` 替代 `recipe:` | 原始 shell 脚本，无合适的 Recipe 抽象 |

### L1 示例 — 配置覆盖

```yaml
# .devap/packaging.yaml
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
# .devap/packaging.yaml
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
# .devap/recipes/electron-app.yaml
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
# .devap/packaging.yaml
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
| `postBuild` 产出物存在 | 存在于预期路径 | 构建步骤后由 DevAP 验证 |
| Hook 命令以 exit code 0 结束 | 100% | Hook 失败会传播为步骤失败 |
| 已发布产出物可被取回 | HTTP 200 / registry 查询成功 | 由 DevAP 在发布后进行 smoke check |

### 失败处理

| 失败类型 | 行动 | 可重试？ |
|----------|------|----------|
| `requires` 文件缺失 | 立即失败，报告缺失路径 | 否 |
| 步骤非零 exit | 立即失败，若已定义则执行 `postBuild` hook | 可配置（默认：否）|
| Hook 非零 exit | 立即失败 | 否 |
| 发布无法连接 | 以指数退避重试最多 3 次 | 是（3×）|

---

## 相关标准

- [部署标准](deployment-standards.md) — 打包后的部署阶段
- [Pipeline 整合标准](pipeline-integration-standards.md) — CI/CD pipeline 配置
- [Check-in 标准](checkin-standards.md) — 打包前的质量关卡
- [版本控制标准](versioning.md) — 包产出物使用的版本号

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-15 | 初始发行 — XSPEC-034 Phase 1 |

---

## 许可证

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
