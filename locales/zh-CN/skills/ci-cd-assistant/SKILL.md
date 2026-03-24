---
source: ../../../../skills/ci-cd-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: |
  引导 CI/CD 管线设计、配置和优化。
  使用时机：设置管线、优化构建时间、配置部署阶段。
  关键字：CI/CD, pipeline, GitHub Actions, deployment, build, 持续集成, 持续部署。
---

# CI/CD 管线助手

> **语言**: [English](../../../../skills/ci-cd-assistant/SKILL.md) | 简体中文

引导 CI/CD 管线设计，遵循业界最佳实践与 DORA 指标。

## 管线阶段参考

```
BUILD ──► TEST ──► ANALYZE ──► DEPLOY ──► VERIFY
构建       测试      分析         部署       验证
```

| 阶段 | 用途 | 关键活动 |
|------|------|----------|
| **Build** | 编译与打包 | 安装依赖、编译、产出制品 |
| **Test** | 质量验证 | 单元、集成、端到端测试 |
| **Analyze** | 代码质量 | 代码检查、安全扫描、覆盖率 |
| **Deploy** | 发布到环境 | 预备环境 → 生产环境部署 |
| **Verify** | 部署后验证 | 冒烟测试、健康检查、监控 |

## DORA 指标快速参考

| 指标 | 精英 | 高 | 中 | 低 |
|------|------|-----|-----|-----|
| **部署频率** | 按需（每日多次） | 每周至每月 | 每月至半年 | > 6 个月 |
| **变更前置时间** | < 1 小时 | 1 天至 1 周 | 1 至 6 个月 | > 6 个月 |
| **MTTR** | < 1 小时 | < 1 天 | 1 天至 1 周 | > 6 个月 |
| **变更失败率** | 0–15% | 16–30% | 16–30% | > 30% |

## 最佳实践检查清单

- [ ] **快速失败** — 先执行最快的检查（lint → 单元 → 集成 → E2E）
- [ ] **缓存依赖** — 在运行之间缓存 `node_modules`、`.m2`、pip cache
- [ ] **并行作业** — 将测试套件分散到并行执行器
- [ ] **不可变制品** — 构建一次，将相同制品部署到所有环境
- [ ] **环境一致** — 保持预备环境与生产环境一致
- [ ] **密钥管理** — 绝不硬编码密钥；使用 vault/环境变量
- [ ] **分支保护** — 要求 CI 通过才能合并
- [ ] **回滚策略** — 部署失败时自动回滚

## 平台专属提示

| 平台 | 缓存 | 并行化 | 密钥 | 备注 |
|------|------|--------|------|------|
| **GitHub Actions** | `actions/cache` | `matrix` 策略 | `secrets.*` | 使用 reusable workflows |
| **GitLab CI** | `cache:` 关键字 | `parallel:` 关键字 | CI/CD Variables | 使用 `include:` 模块化 |
| **Jenkins** | Stash/unstash | `parallel {}` 块 | Credentials plugin | 使用 shared libraries |

## 使用方式

- `/ci-cd` - 显示完整管线指引
- `/ci-cd github-actions` - GitHub Actions 专属提示
- `/ci-cd --optimize` - 管线优化建议
- `/ci-cd build` - 构建阶段最佳实践

## 下一步引导

`/ci-cd` 完成后，AI 助手应建议：

> **管线指引已提供。建议下一步：**
> - 执行 `/deploy` 设定部署策略
> - 执行 `/security` 检查管线安全
> - 执行 `/testing` 设计测试策略
> - 执行 `/commit` 创建规范化提交

## 参考

- 核心规范：[pipeline-integration-standards.md](../../../../core/pipeline-integration-standards.md)
- 核心规范：[deployment-standards.md](../../../../core/deployment-standards.md)
