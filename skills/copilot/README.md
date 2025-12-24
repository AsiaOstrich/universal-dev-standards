# GitHub Copilot Instructions

GitHub Copilot-specific instructions derived from universal-dev-standards.

## Status

🚧 **Planned** - Coming soon

## Planned Features

- `copilot-instructions.md` with comprehensive development standards
- Copilot Chat custom instructions
- VS Code / JetBrains integration patterns

## Structure (Planned)

```
copilot/
├── copilot-instructions.md  # Main instructions file
├── chat-prompts/
│   ├── commit.md            # Commit message prompt
│   ├── review.md            # Code review prompt
│   └── test.md              # Test writing prompt
└── README.md
```

## Contributing

Want to help implement Copilot instructions? See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Current Alternative

Until Copilot-specific instructions are ready, you can use the integration file:

```bash
mkdir -p .github
cp integrations/github-copilot/.github/copilot-instructions.md .github/
```
