---
source: ../../STANDARDS-MAPPING.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-07
status: current
---

# 标准与技能对应矩阵

本文件提供核心标准与各 AI 工具实作之间的完整对应关系。

## 覆盖摘要

| 类别 | 核心标准 | AI 标准 | Claude Code 技能 | 其他 AI 工具 |
|------|---------|--------|-----------------|-------------|
| 开发 | 14 | 16 | 10 | 4 |
| 测试 | 2 | 7 | 2 | 4 |
| 文件 | 2 | 4 | 1 | 4 |
| 流程 | 4 | 4 | 4 | 4 |

**总计**：16 个核心标准 → 16 个 AI 标准 → 15 个 Claude Code 技能 → 4 个 AI 工具整合

## 核心标准矩阵

| 核心标准 | AI 标准 | Claude Code 技能 | Cursor | Windsurf | Cline | Copilot |
|---------|--------|-----------------|--------|----------|-------|---------|
| anti-hallucination.md | ✅ | ai-collaboration-standards | ✅ | ✅ | ✅ | ✅ |
| commit-message-guide.md | ✅ commit-message.ai.yaml | commit-standards | ✅ | ✅ | ✅ | ✅ |
| code-review-guide.md | ✅ code-review.ai.yaml | code-review-assistant | ✅ | ✅ | ✅ | ✅ |
| git-workflow.md | ✅ git-workflow.ai.yaml | git-workflow-guide | ✅ | ✅ | ✅ | ✅ |
| testing-standards.md | ✅ testing.ai.yaml | testing-guide | ✅ | ✅ | ✅ | ✅ |
| versioning.md | ✅ | release-standards | ✅ | ✅ | ✅ | ✅ |
| changelog-standards.md | ✅ changelog.ai.yaml | release-standards | ✅ | ✅ | ✅ | ✅ |
| documentation-structure.md | ✅ documentation-structure.ai.yaml | documentation-guide | ✅ | ✅ | ✅ | ✅ |
| requirements-template.md | ✅ | requirement-assistant | ✅ | ✅ | ✅ | ✅ |
| project-structure.md | ✅ project-structure.ai.yaml | project-structure-guide | ✅ | ✅ | ✅ | ✅ |
| test-completeness-dimensions.md | ✅ | testing-guide | ✅ | ✅ | ✅ | ✅ |
| api-documentation-standards.md | ✅ | documentation-guide | ✅ | ✅ | ✅ | ✅ |
| logging-standards.md | ✅ logging.ai.yaml | logging-guide | ✅ | ✅ | ✅ | ✅ |
| error-code-standards.md | ✅ error-codes.ai.yaml | error-code-guide | ✅ | ✅ | ✅ | ✅ |
| test-driven-development.md | ✅ | tdd-assistant | ✅ | ✅ | ✅ | ✅ |
| spec-driven-development.md | ✅ | spec-driven-dev | ✅ | ✅ | ✅ | ✅ |

图例：✅ = 已实作 | - = 不适用作为独立技能

## AI 选项覆盖

### 测试选项

| 选项 | AI 标准 | 语言/框架 |
|-----|--------|----------|
| 单元测试 | ✅ unit-testing.ai.yaml | 全部 |
| 整合测试 | ✅ integration-testing.ai.yaml | 全部 |
| 系统测试 | ✅ system-testing.ai.yaml | 全部 |
| 端对端测试 | ✅ e2e-testing.ai.yaml | 全部 |
| 安全测试 | ✅ security-testing.ai.yaml | 全部 |
| 效能测试 | ✅ performance-testing.ai.yaml | 全部 |
| 契约测试 | ✅ contract-testing.ai.yaml | 微服务 |
| ISTQB 框架 | ✅ istqb-framework.ai.yaml | 企业级 |
| 业界金字塔 | ✅ industry-pyramid.ai.yaml | 敏捷 |

### 专案结构选项

| 语言 | AI 标准 | 框架 |
|-----|--------|------|
| Node.js | ✅ nodejs.ai.yaml | Express, NestJS, Next.js |
| Python | ✅ python.ai.yaml | Django, Flask, FastAPI |
| Java | ✅ java.ai.yaml | Spring Boot, Maven |
| .NET | ✅ dotnet.ai.yaml | ASP.NET Core |
| Go | ✅ go.ai.yaml | 标准布局 |
| Rust | ✅ rust.ai.yaml | Binary, Library, Workspace |
| Kotlin | ✅ kotlin.ai.yaml | Gradle, Android, KMP |
| PHP | ✅ php.ai.yaml | Laravel, Symfony |
| Ruby | ✅ ruby.ai.yaml | Rails, Sinatra, Gem |
| Swift | ✅ swift.ai.yaml | SPM, iOS, Vapor |

### Git 工作流程选项

| 工作流程 | AI 标准 | 最适合 |
|---------|--------|-------|
| GitHub Flow | ✅ github-flow.ai.yaml | 小团队、CI/CD |
| Git Flow | ✅ git-flow.ai.yaml | 定期发布 |
| Trunk-Based | ✅ trunk-based.ai.yaml | 高部署频率 |
| GitLab Flow | ✅ gitlab-flow.ai.yaml | 环境分支 |

### 变更日志选项

| 风格 | AI 标准 | 最适合 |
|-----|--------|-------|
| Keep a Changelog | ✅ keep-a-changelog.ai.yaml | 手动策展 |
| 自动产生 | ✅ auto-generated.ai.yaml | CI/CD 自动化 |

### 程式码审查选项

| 方式 | AI 标准 | 最适合 |
|-----|--------|-------|
| PR 审查 | ✅ pr-review.ai.yaml | 非同步团队 |
| 配对程式设计 | ✅ pair-programming.ai.yaml | 即时协作 |
| 自动化审查 | ✅ automated-review.ai.yaml | CI/CD 整合 |

### 文件选项

| 风格 | AI 标准 | 最适合 |
|-----|--------|-------|
| Markdown 文件 | ✅ markdown-docs.ai.yaml | 程式码储存库 |
| API 文件 | ✅ api-docs.ai.yaml | REST/GraphQL API |
| Wiki 风格 | ✅ wiki-style.ai.yaml | 知识库 |

## Claude Code 技能详情

| 技能 | 目录 | 档案 | 使用者可呼叫 |
|-----|-----|-----|------------|
| AI 协作标准 | ai-collaboration-standards/ | SKILL.md, anti-hallucination.md, certainty-labels.md | ✅ |
| 变更日志指南 | changelog-guide/ | SKILL.md | ✅ |
| 程式码审查助手 | code-review-assistant/ | SKILL.md, checkin-checklist.md, review-checklist.md | ✅ |
| 提交标准 | commit-standards/ | SKILL.md, conventional-commits.md, language-options.md | ✅ |
| 文件指南 | documentation-guide/ | SKILL.md, documentation-structure.md, readme-template.md | ✅ |
| 错误码指南 | error-code-guide/ | SKILL.md | ✅ |
| Git 工作流程指南 | git-workflow-guide/ | SKILL.md, branch-naming.md, git-workflow.md | ✅ |
| 日志指南 | logging-guide/ | SKILL.md | ✅ |
| 专案结构指南 | project-structure-guide/ | SKILL.md, language-patterns.md | ✅ |
| 发布标准 | release-standards/ | SKILL.md, changelog-format.md, semantic-versioning.md, release-workflow.md | ✅ |
| 需求助手 | requirement-assistant/ | SKILL.md, requirement-checklist.md, requirement-writing.md | ✅ |
| 规格驱动开发 | spec-driven-dev/ | SKILL.md | ✅ |
| TDD 助手 | tdd-assistant/ | SKILL.md, tdd-workflow.md, language-examples.md | ✅ |
| 测试覆盖助手 | test-coverage-assistant/ | SKILL.md | ✅ |
| 测试指南 | testing-guide/ | SKILL.md, testing-pyramid.md | ✅ |

## 本地化覆盖

| 语言 | 核心 | AI 标准 | AI 选项 | 技能 |
|-----|-----|--------|--------|-----|
| English | 16/16 | 16/16 | 35/35 | 15/15 |
| 繁体中文 (zh-TW) | 16/16 | 16/16 | 35/35 | 15/15 |
| 简体中文 (zh-CN) | 5/16 | 0/16 | 0/35 | 0/15 |

## AI 工具整合

| 工具 | 档案 | 格式 | 状态 |
|-----|-----|-----|-----|
| Claude Code | skills/claude-code/**/*.md | SKILL.md | ✅ 完成 |
| Cursor | skills/cursor/.cursorrules | Rules 档案 | ✅ 完成 |
| Windsurf | skills/windsurf/.windsurfrules | Rules 档案 | ✅ 完成 |
| Cline | skills/cline/.clinerules | Rules 档案 | ✅ 完成 |
| GitHub Copilot | skills/copilot/copilot-instructions.md | Markdown | ✅ 完成 |

## 统计

### 依类别

| 类别 | 数量 |
|-----|-----|
| 核心标准 (Markdown) | 16 |
| AI 标准 (YAML) | 16 |
| AI 选项 (YAML) | 35 |
| Claude Code 技能 | 15 |
| AI 工具整合 | 4 |
| 支援语言 | 10 |
| 本地化 | 3 |

### 档案类型

| 副档名 | 数量 | 用途 |
|-------|-----|-----|
| .md | ~60 | 人类可读文件 |
| .ai.yaml | ~50 | AI 优化标准 |
| .cursorrules | 1 | Cursor 规则 |
| .windsurfrules | 1 | Windsurf 规则 |
| .clinerules | 1 | Cline 规则 |

## 版本历史

| 版本 | 日期 | 变更 |
|-----|-----|-----|
| 1.1.0 | 2026-01-07 | 新增 TDD 标准和 tdd-assistant 技能，更新至 15 个技能 |
| 1.0.0 | 2025-12-30 | 初始对应矩阵 |
