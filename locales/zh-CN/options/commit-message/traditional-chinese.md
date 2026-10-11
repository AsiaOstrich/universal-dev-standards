---
source: ../../../../options/commit-message/traditional-chinese.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 9e6c32b9a52e
status: current
---

# 繁体中文 Commit 消息

> **语言**: [English](../../../../options/commit-message/traditional-chinese.md) | 简体中文

**上层标准**: [Commit 消息指南](../../../../core/commit-message-guide.md)

---

## 概述

本选项定义使用繁体中文撰写 commit 消息的标准。适合以中文为主要沟通语言的团队，使 commit 历史更易于阅读和理解。

## 适用场景

- 台湾或香港的开发团队
- 内部项目（非开源）
- 以中文为主要语言的组织
- 需要非技术人员阅读 commit 历史的项目

## 格式

### 基本结构

```
<類型>(<範圍>): <主題>

<內文>

<頁尾>
```

### 组成部分

| 组成部分 | 必填 | 说明 |
|----------|------|------|
| 类型 | 是 | 变更类别（feat、fix、docs 等） |
| 范围 | 否 | 受影响的模块或组件 |
| 主题 | 是 | 简短描述 |
| 正文 | 否 | 详细说明 |
| 页脚 | 否 | 引用链接、破坏性变更 |

## Commit 类型

| 类型 | 中文说明 | 示例 |
|------|----------|------|
| `feat` | 新功能 | `feat: 新增使用者驗證功能` |
| `fix` | 缺陷修复 | `fix: 修正登入逾時問題` |
| `docs` | 文档更新 | `docs: 更新 API 參考文件` |
| `style` | 格式调整 | `style: 修正工具模組縮排` |
| `refactor` | 代码重构 | `refactor: 簡化驗證邏輯` |
| `perf` | 性能优化 | `perf: 優化資料庫查詢` |
| `test` | 测试相关 | `test: 新增驗證模組單元測試` |
| `chore` | 维护工作 | `chore: 更新相依套件` |
| `ci` | CI/CD 变更 | `ci: 新增 GitHub Actions 工作流程` |
| `build` | 构建系统 | `build: 設定 webpack 生產環境` |

## 撰写指南

### 主题行

1. **以动词开头**：写“新增功能”而不是“功能新增”
2. **保持简洁**：50 个字符以内
3. **不加句号**：写“新增功能”而不是“新增功能。”
4. **具体明确**：写“修正用户服务空指针问题”而不是“修正错误”

### 正文

1. **每行 72 个字符**：保持在终端中的可读性
2. **说明原因**：解释为什么要做这个变更
3. **使用列表**：多项变更时使用项目符号
4. **空行分隔**：与主题行之间用空行分隔

### 页脚

1. **引用 issue**：`關閉 #123`、`修復 #456`
2. **破坏性变更**：`重大變更: 說明`
3. **共同作者**：`Co-authored-by: 姓名 <email>`

## 示例

### 简单功能

```
feat(auth): 新增密碼強度指示器

- 在密碼輸入時顯示強度條
- 輸入時顯示密碼要求
- 阻止提交弱密碼

關閉 #234
```

### 缺陷修复

```
fix(api): 處理付款閘道的空值回應

付款閘道在服務降級時偶爾會回傳 null 而非錯誤物件，
這導致結帳流程出現未處理的例外。

新增空值檢查和適當的錯誤處理，優雅地處理此邊緣案例。

修復 #567
```

### 破坏性变更

```
feat(api): 將驗證改為 JWT 權杖

重大變更：移除基於 Session 的驗證。
所有 API 客戶端必須使用 JWT 權杖進行驗證。

遷移指南：
1. 從 /auth/token 端點取得 JWT 權杖
2. 在 Authorization 標頭中包含權杖
3. 移除 session cookie 處理

關閉 #789
```

### 文档更新

```
docs(readme): 新增 Windows 安裝說明

- 新增 PowerShell 指令
- 包含 WSL 設定指南
- 新增疑難排解章節
```

### 代码重构

```
refactor(core): 將驗證抽取至獨立模組

將驗證邏輯從 UserService 移至專門的 ValidationService，
以獲得更好的關注點分離和可重用性。

無功能性變更。
```

## 反面示例

### 错误示例

```
# 太籠統
fix: 修正錯誤

# 沒有說明
更新使用者服務

# 太冗長
feat: 新增一個允許使用者上傳他們的個人頭像並自動調整大小為多種尺寸的新功能

# 無意義
進行中
雜項變更
暫存
```

### 改进示例

```
# 具體明確
fix(auth): 防止檔案上傳期間 session 逾時

# 簡潔並在內文補充細節
feat(users): 新增個人頭像上傳功能

支援 JPEG、PNG 和 WebP 格式。
圖片自動調整為 100x100、200x200 和 400x400 像素。

# 包含類型
refactor(users): 簡化服務層

# 目的清晰
feat(cache): 新增 Redis 支援 session 儲存
```

## 配置

### Git Commit 模板

创建 `~/.gitmessage`：

```
# <類型>(<範圍>): <主題>
# |<----  最多使用 50 個字元  ---->|

# 說明為什麼要做這個變更
# |<----   每行盡量限制在 72 個字元   ---->|

# 提供相關議題或 PR 的連結
# 例如：關閉 #23
```

配置 git：

```bash
git config --global commit.template ~/.gitmessage
```

### Commitlint 配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    ]
  }
};
```

## 相关选项

- [English](./english.md) - 英文 Commit 消息
- [Bilingual](./bilingual.md) - 中英双语格式

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
