---
description: Create or update project documentation structure | 建立或更新專案文件結構
allowed-tools: Read, Write, Grep, Glob
argument-hint: [document type: readme|api|contributing | 文件類型]
---

# Documentation Assistant | 文件助手

Create and maintain well-structured project documentation.

建立和維護結構良好的專案文件。

## Workflow | 工作流程

1. **Assess current state** - Check existing documentation
2. **Identify gaps** - What documentation is missing?
3. **Generate templates** - Create appropriate document templates
4. **Fill content** - Add project-specific information
5. **Validate links** - Ensure all references work

## Document Types | 文件類型

| Type | Purpose | 用途 |
|------|---------|------|
| **README.md** | Project overview | 專案概述 |
| **CONTRIBUTING.md** | Contribution guide | 貢獻指南 |
| **CHANGELOG.md** | Version history | 版本歷史 |
| **API.md** | API documentation | API 文件 |
| **docs/** | Detailed guides | 詳細指南 |

## README Structure | README 結構

```markdown
# Project Name

Brief description.

## Features
- Feature 1
- Feature 2

## Installation
```bash
npm install package
```

## Usage
[Examples]

## Contributing
See CONTRIBUTING.md

## License
MIT
```

## Documentation Checklist | 文件檢查清單

- [ ] README has clear project description
- [ ] Installation instructions are accurate
- [ ] Usage examples are provided
- [ ] API is documented (if applicable)
- [ ] Contributing guidelines exist
- [ ] License is specified

## Usage | 使用方式

- `/uds:docs` - Audit current documentation
- `/uds:docs readme` - Generate/update README
- `/uds:docs api` - Generate API documentation

## Reference | 參考

- Full standard: [documentation-guide](../../documentation-guide/SKILL.md)
- Core guide: [documentation-standards](../../../../core/documentation-standards.md)
