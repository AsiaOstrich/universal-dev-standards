#!/bin/bash
# DEPRECATED: Use 'node scripts/install-hooks.mjs' instead (cross-platform).
# This script remains for legacy Linux/macOS compatibility.
#
# UDS Git Hooks Installer
# 安裝 Git Hooks 腳本
#
# Run once after cloning to activate UDS pre-commit checks:
#   ./scripts/install-hooks.sh
#
# What it does:
#   Configures git to use .githooks/ as the hooks directory.
#   All hooks in .githooks/ are tracked in version control.
#
# Uninstall:
#   git config --unset core.hooksPath
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$ROOT_DIR/.githooks"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  UDS Git Hooks Installer"
echo "  Git Hooks 安裝程式"
echo "=========================================="
echo ""

if [ ! -d "$HOOKS_DIR" ]; then
    echo "Error: .githooks/ directory not found at $HOOKS_DIR"
    exit 1
fi

# Set hooksPath to use .githooks/
git -C "$ROOT_DIR" config core.hooksPath .githooks
echo -e "  ${GREEN}[OK]${NC} git config core.hooksPath → .githooks/"

# Ensure all hooks are executable
chmod +x "$HOOKS_DIR"/* 2>/dev/null && \
    echo -e "  ${GREEN}[OK]${NC} chmod +x .githooks/*"

echo ""
echo "Installed hooks:"
for hook in "$HOOKS_DIR"/*; do
    [ -f "$hook" ] || continue
    echo -e "  ${GREEN}✓${NC} $(basename "$hook")"
done

echo ""
echo -e "${YELLOW}Note:${NC} Run \`git config --unset core.hooksPath\` to uninstall."
echo ""
echo "Done! | 完成！"
echo ""
