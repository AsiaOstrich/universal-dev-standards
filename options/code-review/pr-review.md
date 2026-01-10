# Pull Request Review

> **Language**: English | [繁體中文](../../locales/zh-TW/options/code-review/pr-review.md)

**Parent Standard**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## Overview

Pull Request (PR) review is the traditional asynchronous code review process where changes are submitted for review before merging. It provides a documented audit trail and works well for distributed teams.

## Best For

- Distributed teams across time zones
- Asynchronous workflows
- Projects requiring audit trails
- Open source projects
- Compliance and regulatory requirements

## Workflow

### 1. Create Pull Request

**Author responsibilities:**
- Write clear, descriptive PR title
- Add comprehensive description
- Link related issues
- Request appropriate reviewers
- Ensure CI checks pass

### 2. Review

**Reviewer responsibilities:**
- Check functionality and correctness
- Review code quality and style
- Verify security considerations
- Run tests locally if needed
- Provide constructive feedback

### 3. Respond to Feedback

**Author responsibilities:**
- Address all feedback points
- Push fixes in new commits
- Respond to comments
- Request re-review when ready

### 4. Approve and Merge

**Final steps:**
- Get required approvals
- Ensure all checks pass
- Merge using agreed strategy
- Delete feature branch

## Review Checklist

### Functionality
- [ ] Does the code work correctly?
- [ ] Are edge cases handled?
- [ ] Is error handling appropriate?

### Code Quality
- [ ] Is the code readable?
- [ ] Are functions focused (single responsibility)?
- [ ] Is there code duplication?
- [ ] Are names descriptive?

### Security
- [ ] Any injection vulnerabilities?
- [ ] Is input validated?
- [ ] Are credentials exposed?
- [ ] Are dependencies secure?

### Testing
- [ ] Are there adequate tests?
- [ ] Do tests cover edge cases?
- [ ] Are tests readable and maintainable?

## Comment Conventions

### Prefix Style

| Prefix | Meaning | Blocking |
|--------|---------|----------|
| `[REQUIRED]` | Must fix before merge | Yes |
| `[SUGGESTION]` | Consider changing | No |
| `[QUESTION]` | Need clarification | No |
| `[NIT]` | Minor style issue | No |
| `[PRAISE]` | Good work | No |

### Emoji Style

| Emoji | Meaning |
|-------|---------|
| ❗ | Blocking issue |
| ⚠️ | Suggestion |
| 💡 | Idea |
| ❓ | Question |
| 👍 | Praise |

## PR Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
```

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Timely review | Review within 24 hours | Recommended |
| Constructive feedback | Explain why, not just what | Required |
| Test before approve | Ensure all tests pass | Required |
| Minimum reviewers | At least one approval required | Required |

## Comparison with Other Methods

| Aspect | PR Review | Pair Programming |
|--------|-----------|------------------|
| Timing | Asynchronous | Real-time |
| Feedback | Delayed | Immediate |
| Knowledge sharing | Medium | High |
| Documentation | Higher (PR comments) | Lower |
| Scalability | High | Limited |
| Remote-friendly | Easy | Challenging |

## Related Options

- [Pair Programming](./pair-programming.md) - Real-time collaborative review
- [Automated Review](./automated-review.md) - Tool-assisted review

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
