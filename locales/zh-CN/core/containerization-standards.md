---
source: ../../../core/containerization-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# 容器化标准

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文档定义构建安全、高效且可重现的容器镜像标准。涵盖 Dockerfile 最佳实践、多阶段构建、镜像安全、标签策略、Registry 管理及 `.dockerignore` 配置。

## Dockerfile 最佳实践

### Base Image 选择

| 原则 | 说明 | 示例 |
|------|------|------|
| 使用官方镜像 | 优先使用受信任的官方维护镜像 | `node:20-slim` |
| 使用 slim/alpine 变体 | 减少攻击面和镜像大小 | `python:3.12-slim` |
| 固定版本号 | 确保可重现的构建 | `golang:1.22.1` |
| 定期更新 | 修补已知漏洞 | 建议每月审查 |

### Layer 优化

| 原则 | 说明 |
|------|------|
| 最少变动的层优先 | 顺序：系统依赖 → 应用依赖 → 源代码 |
| 合并 RUN 指令 | 减少层数和镜像大小 |
| 清理临时文件 | 在同一 RUN 指令中清理 |
| 使用 .dockerignore | 排除 node_modules、.git、.env 等 |
| 精确 COPY | 先 `COPY package.json .` 再 `COPY . .` |

## 多阶段构建

### 标准模式（builder → production）

| 阶段 | 用途 | 包含 |
|------|------|------|
| **builder** | 编译、打包、测试 | 开发工具、源代码 |
| **production** | 运行应用程序 | 仅运行环境、编译产物 |

### 开发 vs 生产镜像

| 方面 | 开发镜像 | 生产镜像 |
|------|---------|---------|
| Base | 完整镜像 | slim/alpine 变体 |
| 依赖 | 全部（含 devDependencies） | 仅生产依赖 |
| 用户 | 可使用 root | **必须**使用 non-root |

## 镜像安全

### 安全检查表

| 检查项目 | 说明 |
|---------|------|
| Non-root 执行 | 使用 `USER` 指令切换到非 root 用户 |
| 无已知漏洞 | 扫描通过，Critical/High = 0 |
| 无硬编码密钥 | 镜像层中无 API Key、密码 |
| 最小权限 | 仅暴露必要 Port，避免 `--privileged` |
| 只读文件系统 | 尽可能使用 `--read-only` |

### 漏洞扫描

| 严重性 | 动作 |
|--------|------|
| **Critical** | **阻断** Pipeline，禁止部署 |
| **High** | **警告**并创建修复工单 |
| **Medium/Low** | **记录**追踪 |

## 镜像标签策略

| 标签类型 | 格式 | 用途 |
|---------|------|------|
| Semantic Version | `vX.Y.Z` | 正式发布 |
| Commit SHA | `sha-<short>` | 构建追溯 |
| Branch | `<branch-name>` | 开发/测试 |
| Environment | `<env>-latest` | 环境追踪 |

> **生产环境禁止使用 `latest` 标签**。必须使用固定标签（Semantic Version 或 Commit SHA）。

## Registry 管理

### 清理策略

| 标签类型 | 保留规则 |
|---------|---------|
| Semantic Version 标签 | 永久保留 |
| 环境标签 | 保留最近 N 个版本 |
| Branch 标签 | 分支删除后 7 天清理 |
| Commit SHA 标签 | 保留 30 天 |
| 未标记（Dangling） | 立即清理 |

## 快速参考卡

```
有官方镜像？            → 使用官方版本
需要最小体积？          → 使用 alpine 变体
需要更广泛的兼容性？     → 使用 slim 变体
永远                   → 固定确切版本，不使用 latest
```

---

**相关标准：**
- [部署标准](deployment-standards.md)
- [安全标准](security-standards.md)
- [性能标准](performance-standards.md)

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
