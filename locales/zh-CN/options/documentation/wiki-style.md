---
source: options/documentation/wiki-style.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Wiki 风格文档

> **语言**: [English](../../../../options/documentation/wiki-style.md) | 简体中文

**上层标准**: [Documentation Structure](../../core/documentation-structure.md)

---

## 概览

Wiki 风格文档提供一个可协作、易于编辑的知识库。它非常适合内部文档、团队知识分享，以及需要由多位贡献者频繁更新的内容。

## 最适用于

- 大型团队
- 内部文档
- 知识库
- 频繁更新的内容
- 跨职能团队

## 平台

| 平台 | 厂商 | 最适用于 | 主要特性 |
|----------|--------|----------|--------------|
| **Confluence** | Atlassian | 使用 Jira 的企业团队 | 丰富的编辑器、模板、空间、权限 |
| **Notion** | Notion Labs | 初创公司、灵活需求 | 数据库、模板、嵌套页面、评论 |
| **GitHub Wiki** | GitHub | 开源、开发者 | 以 Git 为后盾、Markdown、随 repo 免费 |
| **GitBook** | GitBook | 公开文档 | Git 同步、精美 UI、支持 API docs |

## 结构

### 顶层空间

| 空间 | 内容 |
|-------|---------|
| **Engineering** | 架构决策、技术标准、runbook |
| **Product** | 功能规格、roadmap、用户研究 |
| **Team** | 新人上手、流程、会议记录 |

### 页面层级

1. 概览／索引页
2. 分类页
3. 细节页
4. 相关链接

## 页面模板

```markdown
# Page Title

**Last Updated:** YYYY-MM-DD
**Owner:** @username

## Overview

Brief description of what this page covers.

## Content

Main content here...

## Related Pages

- [Related Page 1](link)
- [Related Page 2](link)

## Changelog

| Date | Author | Change |
|------|--------|--------|
| YYYY-MM-DD | @user | Initial creation |
```

## 最佳实践

- 为常见的页面类型建立模板
- 使用一致的命名约定
- 移动页面时设置重定向
- 定期进行内容审计
- 鼓励评论与提问
- 在页面之间慷慨地建立链接

## 规则

| 规则 | 描述 | 优先级 |
|------|-------------|----------|
| 页面归属 | 指派一位负责人维持内容时效性 | Required |
| 页面日期 | 标注最后更新日期 | Required |
| 链接相关内容 | 链接到相关页面以提升可发现性 | Recommended |
| 季度审查 | 审查并更新陈旧内容 | Recommended |
| 归档过时内容 | 归档而非删除旧内容 | Recommended |

## 与其他做法的比较

| 方面 | Wiki | Repo 中的 Markdown | 外部文档站点 |
|--------|------|------------------|-------------------|
| 编辑 | WYSIWYG／容易 | 需要 Git 知识 | 视情况而定 |
| 版本控制 | 内置 | 以 Git 为基础 | 视平台而定 |
| 协作 | 优异 | 良好 | 良好 |
| 搜索 | 内置 | GitHub 搜索 | 视情况而定 |
| 访问控制 | 细致 | repo 层级 | 视情况而定 |
| 离线访问 | 有限 | 完整 | 有限 |

## 相关选项

- [API Docs](./api-docs.md) - API 参考文档
- [Markdown Docs](./markdown-docs.md) - 纯 Markdown 文档

---

## 参考资料

- [Confluence](https://www.atlassian.com/software/confluence)
- [Notion](https://www.notion.so/)
- [GitBook](https://www.gitbook.com/)

---

## 许可

本文档依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
