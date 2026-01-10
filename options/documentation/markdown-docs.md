# Markdown Documentation

> **Language**: English | [繁體中文](../../locales/zh-TW/options/documentation/markdown-docs.md)

**Parent Standard**: [Documentation Structure](../../core/documentation-structure.md)

---

## Overview

Plain Markdown documentation is a simple, portable approach to project documentation. Files are stored directly in the repository, versioned with Git, and rendered natively on platforms like GitHub and GitLab.

## Best For

- Open source projects
- GitHub/GitLab hosted projects
- Developer-focused documentation
- Projects wanting simple, portable docs
- Small to medium-sized projects

## File Structure

### Root Files

| File | Required | Purpose |
|------|----------|---------|
| `README.md` | Yes | Project overview, quick start |
| `CONTRIBUTING.md` | No | Contribution guidelines |
| `CHANGELOG.md` | No | Version history |
| `LICENSE` | Yes | License file |

### docs/ Folder

**Location:** `docs/`
**Naming Convention:** lowercase-kebab-case

#### Common Files

- `getting-started.md`
- `installation.md`
- `configuration.md`
- `api-reference.md`
- `troubleshooting.md`
- `faq.md`

#### Subdirectories

| Directory | Purpose |
|-----------|---------|
| `guides/` | How-to guides |
| `tutorials/` | Step-by-step tutorials |
| `reference/` | API and config reference |
| `ADR/` | Architecture Decision Records |

## README Template

```markdown
# Project Name

Brief description of the project.

## Features

- Feature 1
- Feature 2

## Installation

npm install project-name

## Quick Start

import { something } from 'project-name';

## Documentation

See [docs/](./docs/) for full documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
```

## Markdown Best Practices

- Use ATX-style headers (`#`, `##`, `###`)
- Include blank lines before and after headers
- Use fenced code blocks with language specification
- Keep lines under 120 characters
- Use reference-style links for repeated URLs

## Tools

| Tool | Purpose |
|------|---------|
| markdownlint | Lint markdown files |
| markdown-link-check | Check for broken links |
| docsify | Generate documentation site |
| mkdocs | Static site generator |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Root uppercase | Use UPPERCASE for root docs (README, CONTRIBUTING) | Required |
| docs lowercase-kebab | Use lowercase-kebab-case for docs/ files | Required |
| Relative links | Use relative paths for internal links | Required |
| Include examples | Include code examples for all features | Recommended |

## Comparison with Other Approaches

| Aspect | Markdown in Repo | Wiki | External Docs Site |
|--------|------------------|------|-------------------|
| Versioning | Git-based | Built-in | Platform-dependent |
| Editing | Requires Git | WYSIWYG/Easy | Varies |
| Offline Access | Full | Limited | Limited |
| Search | GitHub search | Built-in | Varies |

## Related Options

- [API Docs](./api-docs.md) - API reference documentation
- [Wiki Style](./wiki-style.md) - Wiki-style collaborative docs

---

## References

- [CommonMark](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Docsify](https://docsify.js.org/)
- [MkDocs](https://www.mkdocs.org/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
