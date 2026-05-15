#!/bin/bash
# setup-hooks.sh — Install git hooks for UDS repo
# Run once after cloning: ./scripts/setup-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$ROOT_DIR/.git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ .git/hooks not found. Make sure you are in the UDS repo root."
  exit 1
fi

cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
# UDS pre-commit hook — checks that auto-generated docs are up to date.
# Installed by scripts/setup-hooks.sh

REPO_ROOT="$(git rev-parse --show-toplevel)"
npm run docs:check-index --prefix "$REPO_ROOT" --silent
EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo "✅ pre-commit hook installed at $HOOKS_DIR/pre-commit"
