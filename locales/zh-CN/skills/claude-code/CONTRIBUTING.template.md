---
source: ../../../../skills/claude-code/CONTRIBUTING.template.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

> **语言**: [English](../../../../skills/claude-code/CONTRIBUTING.template.md) | 简体中文

# 貢獻指南範本

> 將此文件複制到您的项目中并命名为 `CONTRIBUTING.md`，然後根据需要进行自订。
> 此範本包含 [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) 的配置區塊。

---

## 停用的技能

<!--
所有技能预设为啟用。
取消註解并列出您想要在此项目中停用的技能。
-->

<!--
- testing-guide
- release-standards
-->

---

## 开发标准

### Commit 消息语言

此项目使用**英文** commit 类型。
<!-- 选项：English | 简体中文 | Bilingual -->

#### 允許的类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 错误修復 |
| `refactor` | 程序码重構 |
| `docs` | 文件 |
| `style` | 格式化 |
| `test` | 测试 |
| `perf` | 效能 |
| `build` | 建置系统 |
| `ci` | CI/CD 变更 |
| `chore` | 維護 |
| `revert` | 还原提交 |
| `security` | 安全性修復 |

#### 允許的範圍

- `auth` - 认证模組
- `api` - API 层
- `ui` - 使用者界面
- `db` - 数据庫
- `core` - 核心功能
<!-- 新增您项目特定的範圍 -->

---

### 确定性标签语言

此项目使用**英文**确定性标签。
<!-- 选项：English | 中文 -->

#### 标签參考

| 标签 | 使用时机 |
|------|----------|
| `[Confirmed]` | 來自程序码/文件的直接证据 |
| `[Inferred]` | 從证据进行邏辑推論 |
| `[Assumption]` | 基於常見模式 |
| `[Unknown]` | 信息不可用 |
| `[Need Confirmation]` | 需要使用者确认 |

---

### Git 工作流程

#### 分支策略

此项目使用 **GitHub Flow**。
<!-- 选项：GitFlow | GitHub Flow | Trunk-Based Development -->

#### 分支命名

格式：`<type>/<description>`

| Type | 用途 | 範例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` | 错误修復 | `fix/memory-leak` |
| `hotfix/` | 緊急修復 | `hotfix/security-patch` |
| `refactor/` | 程序码重構 | `refactor/extract-service` |
| `docs/` | 文件 | `docs/api-reference` |
| `chore/` | 維護 | `chore/update-deps` |
| `release/` | 發布准备 | `release/v1.2.0` |

#### 合併策略

- Feature 分支：**Squash Merge**
<!-- 选项：Merge Commit | Squash Merge | Rebase -->

---

## 程序码审查

### 註解前綴

| 前綴 | 需要的动作 |
|------|-----------|
| **BLOCKING** | 必須在合併前修復 |
| **IMPORTANT** | 应該修復 |
| **SUGGESTION** | 可選的改进 |
| **QUESTION** | 需要釐清 |
| **NOTE** | 信息性 |

---

## 测试

### 最低覆蓋率

| 层级 | 目標 |
|------|------|
| Unit Tests | 80% |
| Integration Tests | 60% |
| E2E Tests | 关鍵路徑 |

---

## Pull Request 流程

1. 從 `main` 建立 feature 分支
2. 进行您的变更
3. 确保所有测试通過
4. 提交 pull request
5. 处理审查意見
6. 核准後合併

---

## 授权

貢獻至此项目即表示您同意您的貢獻將依项目授权进行授权。
