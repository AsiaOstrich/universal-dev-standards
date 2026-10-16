---
source: ../../../core/containerization-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 44899315e9d1
status: current
---

# 容器化标准

> **语言**: [English](../../../core/containerization-standards.md) | [繁體中文](../../zh-TW/core/containerization-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-31
**适用范围**: 所有使用容器的软件项目
**适用层级**: 通用
**行业标准**: OCI Image Spec, Docker Best Practices, CIS Docker Benchmark
**参考资料**: [docs.docker.com](https://docs.docker.com/), [opencontainers.org](https://opencontainers.org/)

---

## 概述

本文档定义了构建安全、高效且可重现的容器镜像标准。涵盖 Dockerfile 最佳实践、多阶段构建、镜像安全、标签策略、Registry 管理以及 `.dockerignore` 配置。

有关包含回滚、特性开关（Feature Flag）和环境管理的部署策略，请参阅[部署标准](deployment-standards.md)。

---

## Dockerfile 最佳实践

### Base Image 选择

审慎选择基础镜像（Base Image）—— 它们构成了容器安全性和体积大小的基础。

| 原则 | 说明 | 示例 |
|-----------|-------------|---------|
| **使用官方镜像** | 优先使用来自受信任来源且由官方维护的基础镜像 | `node:20-slim` 而非 `random/node` |
| **使用 slim/alpine 变体** | 选择 slim 或 alpine 变体以减少攻击面和镜像大小 | `python:3.12-slim` 而非 `python:3.12` |
| **固定确切版本** | 指定确切的版本标签以确保可重现的构建 | `golang:1.22.1` 而非 `golang:latest` |
| **定期更新** | 定期更新基础镜像以修补已知漏洞 | 建议每月审查周期 |

**决策指南：**
```
Need a language runtime?
├─ Yes → Use official slim variant (e.g., node:20-slim, python:3.12-slim)
└─ No, just need OS?
   ├─ Minimal footprint? → alpine:3.19
   └─ Compatibility needed? → debian:bookworm-slim
```

### Layer 优化

优化 Dockerfile 镜像层以最大化构建缓存效率并最小化镜像体积。

| 原则 | 说明 |
|-----------|-------------|
| **最少变动的层优先** | 顺序：系统依赖 → 应用依赖 → 源代码（充分利用构建缓存） |
| **合并 RUN 指令** | 在单个 RUN 中合并相关命令以减少层数和镜像大小 |
| **清理临时文件** | 在创建缓存和临时文件的同一 RUN 指令中将其清理 |
| **使用 .dockerignore** | 从构建上下文中排除 node_modules、.git、.env 以及其他不必要的文件 |
| **先精准 COPY 文件** | 在 `COPY . .` 之前先 `COPY package.json .` 以充分利用依赖缓存 |

**示例 —— 良好的镜像层顺序：**
```dockerfile
# Layer 1: System dependencies (rarely changes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Layer 2: Application dependencies (changes occasionally)
COPY package.json package-lock.json ./
RUN npm ci --production

# Layer 3: Source code (changes frequently)
COPY . .
```

### .dockerignore

每个使用 Docker 的项目都**必须**拥有 `.dockerignore` 文件，以从构建上下文中排除不必要的文件。

**标准 .dockerignore 模板：**

```
.git
.gitignore
node_modules
.env
.env.*
*.md
tests/
docs/
.dockerignore
Dockerfile
docker-compose*.yml
.github/
.vscode/
coverage/
.nyc_output/
```

> 上述模板包含 14 个条目。请根据项目的具体需求进行调整，但始终至少包含：`.git`、`node_modules`、`.env`、`tests/` 和 `docs/`。

---

## 多阶段构建

### 标准模式（builder → production）

使用多阶段构建将构建期依赖项与运行时镜像分离。

| 阶段 | 用途 | 包含 | 排除 |
|-------|---------|----------|----------|
| **builder** | 编译、打包、测试 | 开发工具、源代码、构建产物 | — |
| **production** | 运行应用程序 | 仅运行时、编译产物 | 源代码、开发工具、测试 |

**示例：**
```dockerfile
# Stage 1: builder
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-slim AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 开发 vs 生产镜像

为开发和生产环境维护独立的镜像配置：

| 方面 | 开发镜像 | 生产镜像 |
|--------|------------------|-----------------|
| **Base** | 包含开发工具的完整镜像 | Slim/alpine 变体 |
| **依赖** | 全部（包含 devDependencies） | 仅生产环境 |
| **工具** | 调试器、热重载、测试框架 | 无 |
| **大小** | 较大（可接受） | 最小化 |
| **用户** | 为方便起见可使用 root | **必须**使用 non-root |

---

## 镜像安全

### 安全检查清单

在将镜像推送到任何 Registry 之前，请验证以下事项：

| 检查项 | 说明 |
|-------|-------------|
| **Non-root 执行** | 使用 `USER` 指令切换到非 root 用户 |
| **无已知漏洞** | 扫描通过，Critical/High = 0 |
| **无硬编码机密** | 镜像层中无 API 密钥、密码或凭据 |
| **最小权限** | 仅暴露必要端口；避免使用 `--privileged` |
| **只读文件系统** | 在可能的情况下使用 `--read-only` 标志运行 |
| **无不必要工具** | 生产镜像绝不能包含 curl、wget、ssh 或类似工具 |

### 漏洞扫描集成

将漏洞扫描集成到您的 CI/CD 流水线中：

| 严重程度 | 操作 | 示例 |
|----------|--------|---------|
| **Critical** | **阻断** 流水线 —— 镜像**严禁**部署 | CVSS >= 9.0 的 CVE |
| **High** | **警告**并创建修复工单 —— 经批准后部署 | CVSS 7.0-8.9 的 CVE |
| **Medium/Low** | **记录**以供追踪 —— 正常部署 | CVSS < 7.0 的 CVE |

**推荐扫描工具：**
- Trivy（开源，对 CI 友好）
- Snyk Container
- Docker Scout

**流水线集成示例：**
```yaml
# GitHub Actions
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    severity: CRITICAL,HIGH
    exit-code: 1  # Fail on Critical/High
```

---

## 镜像标签策略

### 标签类型

使用一致的标签策略以确保可追溯性与可重现性：

| 标签类型 | 格式 | 用途 | 示例 |
|----------|--------|---------|---------|
| **语义化版本** | `vX.Y.Z` | 正式发布 | `myapp:v1.2.3` |
| **Commit SHA** | `sha-<short>` | 构建追溯 | `myapp:sha-a1b2c3d` |
| **分支** | `<branch-name>` | 开发/测试 | `myapp:feature-auth` |
| **环境** | `<env>-latest` | 环境追踪 | `myapp:staging-latest` |

### 生产标签要求

> **严禁**在生产部署中使用 `latest` 标签。`latest` 标签是可变的，无法提供可追溯性。

**生产规则：**
- **必须**使用固定标签：语义化版本（`vX.Y.Z`）或 Commit SHA（`sha-<short>`）
- **严禁**使用 `latest` 或任何可变标签
- **建议**同时打上语义化版本和 Commit SHA 标签，以实现最大程度的可追溯性

**示例：**
```bash
# Good: Fixed, traceable tags
docker tag myapp:build myapp:v1.2.3
docker tag myapp:build myapp:sha-a1b2c3d

# Bad: Mutable, untraceable
docker tag myapp:build myapp:latest  # PROHIBITED in production
```

---

## Registry 管理

### 清理策略

定义保留策略以管理 Registry 存储：

| 标签类型 | 保留规则 |
|----------|---------------|
| **Semantic Version 标签** | 永久保留（所有正式发布） |
| **环境标签** | 保留最近 N 个版本（例如最近 5 个） |
| **Branch 标签** | 分支删除后 7 天清理 |
| **Commit SHA 标签** | 保留 30 天 |
| **未标记（Dangling）** | 立即清理 |

### 访问控制

遵循 Registry 访问的最小权限原则：

| 角色 | 权限 | 范围 |
|------|------------|-------|
| **CI/CD** | Push + Pull | 构建 Registry |
| **开发人员** | 仅 Pull | 生产 Registry |
| **生产环境** | 仅 Pull | 生产 Registry |
| **管理员** | 完全访问权限 | 所有 Registry |

### Registry 最佳实践

- 为开发和生产镜像使用独立的 Registry（或仓库）
- 为生产镜像启用镜像签名
- 根据保留策略设置自动化清理任务
- 监控 Registry 存储使用情况并设置告警
- 对频繁拉取的基础镜像使用 Registry 镜像源

---

## 快速参考卡

### Base Image 选择
```
Official image available?     → Use official (e.g., node, python)
Need minimal size?            → Use alpine variant
Need broader compatibility?   → Use slim variant
Always                        → Pin exact version, never use latest
```

### 多阶段构建决策
```
Has build/compile step?       → Use multi-stage (builder → production)
Static files only?            → Multi-stage with nginx final stage
Interpreted language?         → Multi-stage to exclude dev deps
```

### 安全快速检查
```
Running as root?              → Add USER directive
Contains dev tools?           → Use multi-stage build
Has known CVEs?               → Update base image
Contains secrets?             → Use build args or secrets mount
```

---

## 参考资料

- [Docker Official Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) — Dockerfile 编写指南
- [OCI Image Specification](https://github.com/opencontainers/image-spec) — 容器镜像标准
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker) — 安全配置指南
- [Trivy](https://trivy.dev/) — 开源漏洞扫描器
- [Snyk Container](https://snyk.io/product/container-vulnerability-management/) — 商业漏洞扫描器

---

**相关标准：**
- [部署标准](deployment-standards.md) — 部署策略、回滚、特性标志
- [安全标准](security-standards.md) — 应用程序安全要求
- [性能标准](performance-standards.md) — 性能目标与基准

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：Dockerfile 最佳实践、多阶段构建、镜像安全、标签策略、Registry 管理、.dockerignore |

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
