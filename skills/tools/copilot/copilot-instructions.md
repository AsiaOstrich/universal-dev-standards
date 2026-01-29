# GitHub Copilot Instructions
<!-- Source: https://github.com/AsiaOstrich/universal-dev-standards -->
<!-- Version: 1.0.0 -->

## Development Standards

Follow these standards when generating code suggestions.

### Commit Messages

Use Conventional Commits format:
```
<type>(<scope>): <subject>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance

**Examples:**
- `feat(auth): add OAuth2 login`
- `fix(api): handle null user`

### Code Quality

When generating code:
- Use descriptive variable/function names
- Follow single responsibility principle
- Avoid code duplication
- Handle errors appropriately
- Validate inputs

### Security

Always include:
- Input validation
- Parameterized queries (no SQL injection)
- Output encoding (no XSS)
- No hardcoded credentials

### Testing

Generate tests following:
- AAA pattern: Arrange → Act → Assert
- FIRST principles: Fast, Independent, Repeatable, Self-validating, Timely
- Edge case coverage

### Documentation

For public APIs:
- Include JSDoc/docstring comments
- Document parameters and return values
- Provide usage examples

### Git

Branch naming:
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent fixes

### AI Collaboration

When uncertain:
- Ask clarifying questions
- State assumptions explicitly
- Provide multiple options when applicable
