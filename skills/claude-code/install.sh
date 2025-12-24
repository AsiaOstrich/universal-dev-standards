#!/bin/bash
# Universal Dev Skills - Installation Script
# https://github.com/AsiaOstrich/universal-dev-skills

set -e

SKILLS_DIR="$HOME/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================="
echo "Universal Dev Skills Installer"
echo "=================================="
echo ""

# Create skills directory if it doesn't exist
mkdir -p "$SKILLS_DIR"

# List of available skills
SKILLS=(
    "ai-collaboration-standards"
    "commit-standards"
    "code-review-assistant"
    "testing-guide"
    "release-standards"
    "git-workflow-guide"
    "documentation-guide"
    "requirement-assistant"
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
    skill_path="$SCRIPT_DIR/skills/$skill"
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
