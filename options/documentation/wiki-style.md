# Wiki-Style Documentation

> **Language**: English | [繁體中文](../../locales/zh-TW/options/documentation/wiki-style.md)

**Parent Standard**: [Documentation Structure](../../core/documentation-structure.md)

---

## Overview

Wiki-style documentation provides a collaborative, easily editable knowledge base. It's ideal for internal documentation, team knowledge sharing, and content that needs frequent updates from multiple contributors.

## Best For

- Large teams
- Internal documentation
- Knowledge bases
- Frequently updated content
- Cross-functional teams

## Platforms

| Platform | Vendor | Best For | Key Features |
|----------|--------|----------|--------------|
| **Confluence** | Atlassian | Enterprise teams using Jira | Rich editor, templates, spaces, permissions |
| **Notion** | Notion Labs | Startups, flexible needs | Databases, templates, nested pages, comments |
| **GitHub Wiki** | GitHub | Open source, developers | Git-backed, Markdown, free with repo |
| **GitBook** | GitBook | Public documentation | Git sync, beautiful UI, API docs support |

## Structure

### Top-Level Spaces

| Space | Content |
|-------|---------|
| **Engineering** | Architecture decisions, technical standards, runbooks |
| **Product** | Feature specs, roadmaps, user research |
| **Team** | Onboarding, processes, meeting notes |

### Page Hierarchy

1. Overview/Index page
2. Category pages
3. Detail pages
4. Related links

## Page Template

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

## Best Practices

- Create templates for common page types
- Use consistent naming conventions
- Set up redirects when moving pages
- Conduct regular content audits
- Encourage comments and questions
- Link generously between pages

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Page ownership | Assign an owner responsible for keeping content current | Required |
| Date pages | Include last updated date | Required |
| Link related | Link to related pages for discoverability | Recommended |
| Quarterly review | Review and update stale content | Recommended |
| Archive obsolete | Archive rather than delete old content | Recommended |

## Comparison with Other Approaches

| Aspect | Wiki | Markdown in Repo | External Docs Site |
|--------|------|------------------|-------------------|
| Editing | WYSIWYG/Easy | Requires Git knowledge | Varies |
| Versioning | Built-in | Git-based | Platform-dependent |
| Collaboration | Excellent | Good | Good |
| Search | Built-in | GitHub search | Varies |
| Access Control | Granular | Repo-level | Varies |
| Offline Access | Limited | Full | Limited |

## Related Options

- [API Docs](./api-docs.md) - API reference documentation
- [Markdown Docs](./markdown-docs.md) - Plain Markdown documentation

---

## References

- [Confluence](https://www.atlassian.com/software/confluence)
- [Notion](https://www.notion.so/)
- [GitBook](https://www.gitbook.com/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
