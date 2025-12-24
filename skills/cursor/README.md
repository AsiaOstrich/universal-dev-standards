# Cursor Rules

Cursor-specific rules derived from universal-dev-standards.

## Status

🚧 **Planned** - Coming soon

## Planned Features

- `.cursorrules` file with comprehensive development standards
- Notepads for specific topics (commit messages, code review, etc.)
- Integration with Cursor's AI features

## Structure (Planned)

```
cursor/
├── .cursorrules              # Main rules file
├── notepads/
│   ├── commit-standards.md   # Commit message notepad
│   ├── code-review.md        # Code review notepad
│   └── testing.md            # Testing notepad
└── README.md
```

## Contributing

Want to help implement Cursor rules? See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Current Alternative

Until Cursor-specific rules are ready, you can use the integration file:

```bash
cp integrations/cursor/.cursorrules .cursorrules
```
