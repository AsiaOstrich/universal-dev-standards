---
source: ../../../../skills/commit-standards/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: d20c12a0252c
status: current
description: |
  遵循約定式提交标准格式化提交消息。
  使用时机：撰写提交消息、git commit、檢视提交历史。
  关鍵字：commit、git、message、conventional、feat、fix、refactor。
---

# 提交消息标准

> **语言**: [English](../../../../skills/commit-standards/guide.md) | [繁體中文](../../../zh-TW/skills/commit-standards/guide.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

> **核心标准**: 此技能实现 [提交消息指南](../../core/commit-message-guide.md)。有关完整的方法论文档，请参阅核心标准。

## 目的

此技能确保遵循约定式提交标准，撰写一致且有意义的提交消息。

# [物理绑定]
## 现实检查
在提交提交消息之前，你必须：
1. 验证环境：运行 `uds check --standard commit-message` 以确保已配置 `commitlint`。
2. 验证内容：运行 `echo "{message}" | npx commitlint` 以验证生成的消息。
3. 若 exit_code != 0：
   - 读取错误消息。
   - 修改消息。
   - 重试验证直至通过。

## 快速参考

### 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型

| English | 使用时机 |
|---------|----------|
| `feat` | 新功能 |
| `fix` | 错误修正 |
| `refactor` | 代码重构（无功能变更） |
| `docs` | 仅文档 |
| `style` | 格式调整（无代码逻辑变更） |
| `test` | 新增或更新测试 |
| `perf` | 性能改善 |
| `build` | 构建系统或依赖项 |
| `ci` | CI/CD 流程变更 |
| `chore` | 维护任务 |
| `revert` | 还原先前的提交 |
| `security` | 安全漏洞修正 |

### 主旨行规则

1. **长度**: ≤72 字符（50 为理想）
2. **时态**: 祈使语气（使用 "Add feature" 而非 "Added feature"）
3. **大小写**: 首字母大写
4. **无句点**: 结尾不加句点

## 详细指南

完整标准请参考：
- [约定式提交指南](./conventional-commits.md)
- [语言选项](./language-options.md)

### AI 优化格式（Token 高效）

对于 AI 助手，请使用 YAML 格式文件以减少 Token 消耗：
- 基础标准: `ai/standards/commit-message.ai.yaml`
- 语言选项:
  - 英文: `ai/options/commit-message/english.ai.yaml`
  - 繁体中文: `ai/options/commit-message/traditional-chinese.ai.yaml`
  - 双语: `ai/options/commit-message/bilingual.ai.yaml`

## 示例

### ✅ 良好示例

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
```

### ❌ 不良示例

```
fixed bug                    # Too vague, no scope
feat(auth): added google login  # Past tense
Update stuff.                # Period, vague
WIP                          # Not descriptive
```

## 主体内容指南

使用主体内容说明变更的**原因（WHY）**：

```
fix(api): Resolve race condition in concurrent user updates

Why this occurred:
- Two simultaneous PUT requests could overwrite each other
- No optimistic locking implemented

What this fix does:
- Add version field to User model
- Return 409 Conflict if version mismatch

Fixes #789
```

## 破坏性变更

务必在页脚记录破坏性变更：

```
feat(api): Change user endpoint response format

BREAKING CHANGE: User API response format changed

Migration guide:
1. Update API clients to remove .data wrapper
2. Use created_at instead of createdAt
```

## 议题参照

```
Closes #123    # Automatically closes issue
Fixes #456     # Automatically closes issue
Refs #789      # Links without closing
```

---

## 语言选择决策（YAML 压缩版）

```yaml
# === LANGUAGE DECISION MATRIX ===
decision_tree:
  - q: "Open source project?"
    y: "→ English (international contributors)"
    n: next
  - q: "International/distributed team?"
    y: "→ English (common language)"
    n: next
  - q: "Single-language team?"
    y: "→ Team's primary language OR English"
    n: "→ Bilingual (subject:EN, body:local)"

recommendation_matrix:
  open_source: {lang: English, reason: "international contributors"}
  international_team: {lang: English, reason: "common language"}
  local_team_EN: {lang: English, reason: "tool compatibility, career mobility"}
  local_team_ZH: {lang: "繁體中文", reason: "clarity, team preference"}
  mixed: {lang: Bilingual, reason: "best of both worlds"}

# === TOOL COMPATIBILITY ===
tool_support:
  full_unicode:
    - GitHub/GitLab/Bitbucket
    - VS Code/JetBrains
    - SourceTree/GitKraken
  potential_issues:
    - "Some CI/CD log viewers"
    - "Legacy terminal encodings"
    - "Email notifications (rare)"

# === FORMAT BY LANGUAGE ===
english:
  types: [feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security]
  example: "feat(auth): add OAuth2 Google login support"

traditional_chinese:
  # English types (same as english), Traditional Chinese subject and body. A Chinese type is not allowed (XSPEC-475).
  types: [feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security]
  example: "feat(auth): 新增 OAuth2 Google 登入支援"

bilingual:
  format: "type(scope): English subject. 中文主旨.\n\nEnglish body\n\n中文 body\n\nfooter"
  example: |
    feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援.

    Implement Google OAuth2 authentication flow for user login.

    - Add Google OAuth2 SDK integration
    - Create callback endpoint for OAuth flow
    - Store refresh tokens securely

    實作 Google OAuth2 認證流程供使用者登入。

    - 整合 Google OAuth2 SDK
    - 建立 OAuth 流程回呼端點
    - 安全儲存更新權杖

    Closes #123
```

---

## 配置检测

此技能支持项目特定的语言配置。

### 检测顺序

1. 检查 `CONTRIBUTING.md` 中的“Output Language”部分
2. 若找到，使用指定的选项（English / Traditional Chinese / Bilingual）
3. 若未找到，**默认使用 English** 以获得最大工具兼容性

### 首次设置

若未找到配置且上下文不明确：

1. 询问用户：“此项目尚未配置提交消息语言偏好。您想使用哪个选项？(English / 中文 / Bilingual)”
2. 用户选择后，建议记录于 `CONTRIBUTING.md`：

```markdown
## Output Language

This project uses **[chosen option]** commit types.
<!-- Options: English | Traditional Chinese | Bilingual -->
```

### 配置示例

在项目的 `CONTRIBUTING.md` 中：

```markdown
## Output Language

This project uses **English** commit types.

### Allowed Types
feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security
```

---

## 双语正文规范

使用双语提交消息时，正文必须遵循以下精确结构：

```
<type>(<scope>): <English subject>. <中文主旨>.
                                                    ← blank line
<English body>                                      ← English explanation first
                                                    ← blank line
<中文本文>                                           ← Chinese explanation second
                                                    ← blank line
<footer>                                            ← BREAKING CHANGE, Fixes #, etc.
```

### 结构规则

1. **英文正文在前** — 撰写完整的英文说明（段落 + 项目符号列表，如需要）
2. **空行分隔** — 英文和中文部分之间保留一行空行
3. **中文正文在后** — 撰写完整的中文说明（对应英文内容）
4. **页脚前空行** — 在任何页脚行之前保留一行空行
5. **不混用语言** — 每个段落必须完全使用同一种语言

### 反模式

| 模式 | 问题 | 修复方法 |
|------|------|----------|
| 混合段落：`Add login 新增登入` | 单一段落中混合多种语言 | 拆分为两个段落 |
| 仅有英文正文 | 缺少中文正文 | 在英文后添加中文正文 |
| 仅有中文正文 | 缺少英文正文 | 在中文前添加英文正文 |
| 页脚夹在正文之间 | 页脚拆散了双语内容 | 将页脚移至末尾 |

---

## 相关标准

- [Commit Message Guide](../../core/commit-message-guide.md)
- [Git Workflow](../../core/git-workflow.md)
- [Changelog Standards](../../core/changelog-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准部分（目的、相关标准、版本历史、许可证） |

---

## 许可证

此技能基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
