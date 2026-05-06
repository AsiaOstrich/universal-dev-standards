#!/bin/sh
# DEPRECATED: Use 'npx tsx scripts/check-commit-spec-reference.ts' instead (cross-platform).
# This script remains for legacy Linux/macOS compatibility.
#
# Commit-msg Spec Reference Suggestion — WARNING ONLY (non-blocking)
#
# For feat/fix commits, suggests adding Refs: SPEC-XXX if active specs exist.
# Designed to run as commit-msg hook. Never exits with non-zero status.
#
# Usage: ./scripts/check-commit-spec-reference.sh <commit-msg-file>

COMMIT_MSG_FILE="$1"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SPECS_DIR="$REPO_ROOT/docs/specs"

# Exit silently if no commit message file provided
[ -z "$COMMIT_MSG_FILE" ] && exit 0
[ -f "$COMMIT_MSG_FILE" ] || exit 0

COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
FIRST_LINE=$(head -1 "$COMMIT_MSG_FILE")

# Check if this is a feat or fix commit (English or Traditional Chinese types)
IS_FEAT_FIX=$(echo "$FIRST_LINE" | grep -iE "^(feat|fix|功能|修正)" || true)
[ -z "$IS_FEAT_FIX" ] && exit 0

# Check if Refs: already present
HAS_REFS=$(echo "$COMMIT_MSG" | grep -iE "^Refs:" || true)
[ -n "$HAS_REFS" ] && exit 0

# Check if active specs exist
[ -d "$SPECS_DIR" ] || exit 0
ACTIVE_SPECS=$(find "$SPECS_DIR" -name "SPEC-*.md" 2>/dev/null)
[ -z "$ACTIVE_SPECS" ] && exit 0

# List active spec IDs
SPEC_IDS=""
for spec in $ACTIVE_SPECS; do
  SPEC_ID=$(basename "$spec" .md)
  # Check if spec is in active state (not Archived)
  STATUS=$(grep -m1 "^status:" "$spec" 2>/dev/null | awk '{print $2}' || true)
  if [ "$STATUS" != "Archived" ] && [ "$STATUS" != "archived" ]; then
    SPEC_IDS="$SPEC_IDS $SPEC_ID"
  fi
done

# Trim
SPEC_IDS=$(echo "$SPEC_IDS" | xargs)
[ -z "$SPEC_IDS" ] && exit 0

echo ""
echo "[Spec Tracking] 💡 This appears to be a feat/fix commit with active specs:"
for id in $SPEC_IDS; do
  echo "  → $id"
done
echo ""
echo "Consider adding to your commit message footer:"
echo "  Refs: <SPEC-ID>"
echo ""
echo "This is a suggestion — your commit will proceed as-is."

# Always exit 0 — never block commits
exit 0
