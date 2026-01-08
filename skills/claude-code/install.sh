#!/bin/bash
# Universal Dev Skills - Installation Script
# https://github.com/AsiaOstrich/universal-dev-standards/tree/main/skills/claude-code
#
# ⚠️  DEPRECATED: This script is deprecated and will be removed in a future version.
#     Please use the Plugin Marketplace instead:
#
#     /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md
#
#     Benefits of Plugin Marketplace:
#     - Automatic updates on Claude Code restart
#     - Better integration with Claude Code
#     - No manual git pull required
#

set -e

SKILLS_DIR="$HOME/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================="
echo "Universal Dev Skills Installer"
echo "=================================="
echo ""
echo "⚠️  DEPRECATED: This installation method is deprecated."
echo ""
echo "Recommended: Use Plugin Marketplace instead:"
echo "  /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md"
echo ""
echo "Benefits:"
echo "  • Automatic updates on Claude Code restart"
echo "  • Better integration with Claude Code"
echo "  • No manual git pull required"
echo ""
read -p "Continue with manual installation anyway? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo ""
    echo "Installation cancelled. Use Plugin Marketplace for the best experience."
    exit 0
fi
echo ""

# Create skills directory if it doesn't exist
mkdir -p "$SKILLS_DIR"

# List of available skills (15 total)
SKILLS=(
    "ai-collaboration-standards"
    "changelog-guide"
    "code-review-assistant"
    "commit-standards"
    "documentation-guide"
    "error-code-guide"
    "git-workflow-guide"
    "logging-guide"
    "project-structure-guide"
    "release-standards"
    "requirement-assistant"
    "spec-driven-dev"
    "tdd-assistant"
    "test-coverage-assistant"
    "testing-guide"
)

echo "Available skills:"
for i in "${!SKILLS[@]}"; do
    echo "  [$((i+1))] ${SKILLS[$i]}"
done
echo "  [A] All skills"
echo ""

read -p "Select skills to install (e.g., 1,2,3 or A for all): " selection

if [[ "$selection" == "A" || "$selection" == "a" ]]; then
    selected_skills=("${SKILLS[@]}")
else
    IFS=',' read -ra indices <<< "$selection"
    selected_skills=()
    for index in "${indices[@]}"; do
        index=$((index - 1))
        if [[ $index -ge 0 && $index -lt ${#SKILLS[@]} ]]; then
            selected_skills+=("${SKILLS[$index]}")
        fi
    done
fi

if [[ ${#selected_skills[@]} -eq 0 ]]; then
    echo "No valid skills selected. Exiting."
    exit 1
fi

echo ""
echo "Installing skills to: $SKILLS_DIR"
echo ""

for skill in "${selected_skills[@]}"; do
    skill_path="$SCRIPT_DIR/$skill"
    if [[ -d "$skill_path" ]]; then
        echo "  Installing: $skill"
        cp -r "$skill_path" "$SKILLS_DIR/"
    else
        echo "  Warning: $skill not found, skipping"
    fi
done

echo ""
echo "Installation complete!"
echo ""
echo "Skills installed to: $SKILLS_DIR"
echo ""
echo "To verify installation, check:"
echo "  ls -la $SKILLS_DIR"
echo ""
