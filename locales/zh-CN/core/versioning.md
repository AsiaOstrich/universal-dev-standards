---
source: ../../../core/versioning.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-06-23
status: current
---

> **语言**: [English](../../../core/versioning.md) | [简体中文](../../zh-TW/core/versioning.md) | 简体中文

# 语义化版本标准

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: 所有有版本发布的软件项目

---

## 目的

本标准定义如何使用语义化版本 (SemVer) 为软件发布编号，以清楚地向用户和维护者传达变更。

---

## 语义化版本格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

示例:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### 组成说明

| 组成 | 用途 | 递增时机 |
|------|------|---------|
| **MAJOR** | 破坏性变更 | 不兼容的 API 变更 |
| **MINOR** | 新功能 | 向后兼容的功能 |
| **PATCH** | 错误修复 | 向后兼容的修复 |
| **PRERELEASE** | 预发布标识 | Alpha、Beta、RC 版本 |
| **BUILD** | 构建元数据 | 构建号、提交哈希 |

---

## 递增规则

### MAJOR 版本 (X.0.0)

**递增时机**:
- 破坏性 API 变更
- 移除已弃用功能
- 重大架构变更
- 不兼容的行为变更

### MINOR 版本 (x.Y.0)

**递增时机**:
- 添加新功能（向后兼容）
- 弃用功能（非移除）
- 实质性内部改进
- 新的公开 API

### PATCH 版本 (x.y.Z)

**递增时机**:
- 错误修复（无新功能）
- 安全补丁
- 文档更正
- 内部重构（无 API 变更）

---

## API 版本化策略

| 策略 | 格式 | 优点 | 缺点 |
|------|------|------|------|
| URL 路径 | `/api/v1/users` | 清晰、易于路由 | URL 污染 |
| 查询参数 | `/api/users?version=1` | 可选版本 | 缓存问题 |
| 标头 | `Accept: application/vnd.api.v1+json` | URL 干净 | 不可见 |

**推荐**: 大多数 API 使用 URL 路径版本化。

---

## 弃用时间线

```
v1.0.0 - 功能引入
v1.5.0 - 添加弃用警告（至少 N-1 版本）
v2.0.0 - 移除功能（记录在迁移指南中）
```

### 弃用期限指南

| API 类型 | 最短弃用期限 |
|----------|-------------|
| 内部 API | 1 个次要版本 |
| 合作伙伴 API | 2 个次要版本 + 3 个月 |
| 公开 API | 2 个次要版本 + 6 个月 |
| 关键基础设施 | 最少 1 年 |

---

## 向后兼容性检查清单

**不要破坏（不升级主版本号）**:
- [ ] 移除公开 API 端点
- [ ] 移除必填请求字段
- [ ] 添加必填请求字段
- [ ] 更改响应字段类型
- [ ] 更改错误码含义

**安全变更（次要/补丁版本）**:
- [ ] 添加可选请求字段
- [ ] 添加新响应字段
- [ ] 添加新端点
- [ ] 添加新错误码
- [ ] 改进错误消息

---

## 预发布版本

### 预发布标识符

| 标识符 | 用途 | 稳定性 | 受众 |
|-------|------|-------|-----|
| alpha | 早期测试 | 不稳定 | 内部团队 |
| beta | 功能完成 | 基本稳定 | 早期采用者 |
| rc | 最终测试 | 稳定 | Beta 测试者 |

### 示例

```
1.0.0-alpha.1       # 第一个 alpha 版本
1.0.0-beta.1        # 第一个 beta 版本
1.0.0-rc.1          # 候选版本 1
1.0.0               # 稳定版本
```

---

## 快速参考卡

### 版本递增

| 做了什么？ | 递增 |
|-----------|-----|
| 破坏性变更 | MAJOR |
| 新功能 | MINOR |
| 错误修复 | PATCH |

### 版本格式

```
MAJOR.MINOR.PATCH
  │     │     └── 错误修复
  │     └──────── 新功能
  └────────────── 破坏性变更
```

---

## 部署版本身份

> 来源：一个反复出现的失败模式——多个行为不同的 hotfix 构建以**同一个 `X.Y.Z`** 部署，仅靠 `+sha`
> 区分，于是「prod 跑的是哪个 / 修复 X 是否真的上了」退化成 commit 考古。

### 核心不变量

**每个唯一的可部署构建 artifact MUST 带有唯一、不可变的版本身份（版本号本体 + commit sha）。**
部署、*晋升（promote）*、或*回滚（rollback）*一个**既有** artifact MUST NOT 改变其身份。

- **锚定在 artifact，而非部署动作。** 新构建（源码或依赖不同）⇒ 新版本。*同一个*构建在环境间移动
  （staging → prod，build-once-deploy-many）、重新部署（blue-green / canary）、或回滚，是**同一个**
  artifact、保留其身份——MUST NOT 重新 bump。在 promote/rollback 上重新 bump 会让版本号谎报实际在跑
  的东西。
- **绝不让两个不同的构建共用同一个 `X.Y.Z`。** `+sha` build metadata 不能替代版本 bump（工具链在优先
  序与比较中忽略 `+build`，两个仅 build metadata 不同的构建对发布工具而言无法区分，是一种治理逃逸）。

### 自动强制，而非靠纪律

此不变量 MUST 由自动机制强制，绝不单靠人为纪律（上述失败模式*正是*忘记手动 bump）。采用**二选一**：

- **git-height 衍生版本**（MinVer / Nerdbank.GitVersioning / GitVersion）：版本由 git 提交拓扑推导，
  故碰撞结构上不可能、且「忘记 bump」整类错误被消除。对 polyglot / .NET / JVM 项目 RECOMMENDED。注意
  monorepo 与 squash-merge 工作流的注意事项。
- **CI 唯一性闸**：若算出的版本已存在于 git tag 或 registry，则 release 失败。

### 不可变 artifact 与 build 身份（交叉引用）

唯一的*号码*是必要但不充分——*artifact* 本身也必须不可变且内容定址：部署 MUST 引用不可变 artifact
（例如容器 **image digest** `@sha256:…`，而非 `:latest` 之类的可变 tag）；registry MUST NOT 允许
tag/版本重用（归 **container-image-standards**）。已部署服务 SHOULD 经由**受保护**端点暴露
`version + commit sha + build time`，且 sha MUST 与已部署 artifact 相符（可验证而非自述；归
**deployment-standards** / **supply-chain-attestation**）。

---

## 相关标准

- [变更日志标准](changelog-standards.md)
- [Git 工作流程](git-workflow.md)
- [提交消息指南](commit-message-guide.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
