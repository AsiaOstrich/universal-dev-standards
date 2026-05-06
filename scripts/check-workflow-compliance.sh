#!/bin/sh
# DEPRECATED: Use 'npx tsx scripts/check-workflow-compliance.ts' instead (cross-platform).
# This script remains for legacy Linux/macOS compatibility.
#
# Workflow Compliance Check — WARNING ONLY (non-blocking)
#
# Checks for workflow compliance issues and prints warnings.
# Designed to run in pre-commit hook. Never exits with non-zero status.
#
# Usage: ./scripts/check-workflow-compliance.sh

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
# Check both possible workflow state locations
# .workflow-state/ (workflow-state-protocol standard)
# .standards/workflow-state/ (CLI WorkflowStateManager)
WORKFLOW_STATE_DIR=""
if [ -d "$REPO_ROOT/.workflow-state" ]; then
  WORKFLOW_STATE_DIR="$REPO_ROOT/.workflow-state"
elif [ -d "$REPO_ROOT/.standards/workflow-state" ]; then
  WORKFLOW_STATE_DIR="$REPO_ROOT/.standards/workflow-state"
fi
SPECS_DIR="$REPO_ROOT/docs/specs"
WARNINGS=0

warn() {
  echo "[Workflow] ⚠️  $1"
  WARNINGS=$((WARNINGS + 1))
}

# --- Check 1: Active workflows ---
# If there are active workflow state files, remind the developer
if [ -n "$WORKFLOW_STATE_DIR" ] && [ -d "$WORKFLOW_STATE_DIR" ]; then
  ACTIVE_WORKFLOWS=$(find "$WORKFLOW_STATE_DIR" -name "*.yaml" -o -name "*.json" 2>/dev/null | head -5)
  if [ -n "$ACTIVE_WORKFLOWS" ]; then
    echo "[Workflow] Active workflows detected:"
    for wf in $ACTIVE_WORKFLOWS; do
      WF_NAME=$(basename "$wf" | sed 's/\.[^.]*$//')
      echo "  → $WF_NAME"
    done
    echo "[Workflow] Ensure your commit aligns with the active workflow phase."
    echo ""
  fi
fi

# --- Check 2: feat/fix commits without spec reference ---
# Read the staged commit message (if available via $1 in commit-msg hook)
# In pre-commit context, check staged file count for significant changes
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || true)
STAGED_COUNT=0
if [ -n "$STAGED_FILES" ]; then
  STAGED_COUNT=$(echo "$STAGED_FILES" | wc -l | tr -d ' ')
fi

# Check if this looks like a feat/fix (new files, significant changes)
NEW_FILES_LIST=$(git diff --cached --name-only --diff-filter=A 2>/dev/null || true)
NEW_FILES=0
if [ -n "$NEW_FILES_LIST" ]; then
  NEW_FILES=$(echo "$NEW_FILES_LIST" | wc -l | tr -d ' ')
fi

if [ "$STAGED_COUNT" -gt 3 ] || [ "$NEW_FILES" -gt 0 ]; then
  # Check if any specs exist
  if [ -d "$SPECS_DIR" ]; then
    ACTIVE_SPECS=$(find "$SPECS_DIR" -name "SPEC-*.md" 2>/dev/null | head -1)
    if [ -n "$ACTIVE_SPECS" ]; then
      warn "Significant change detected ($STAGED_COUNT files staged). Consider adding 'Refs: SPEC-XXX' to your commit message."
    fi
  fi
fi

# --- Check 3: Stale workflow states ---
if [ -n "$WORKFLOW_STATE_DIR" ] && [ -d "$WORKFLOW_STATE_DIR" ]; then
  STALE_THRESHOLD=$((7 * 24 * 60 * 60))  # 7 days in seconds
  NOW=$(date +%s)

  for state_file in "$WORKFLOW_STATE_DIR"/*.yaml "$WORKFLOW_STATE_DIR"/*.json; do
    [ -f "$state_file" ] || continue
    FILE_MOD=$(stat -f %m "$state_file" 2>/dev/null || stat -c %Y "$state_file" 2>/dev/null || echo "0")
    if [ "$FILE_MOD" -gt 0 ]; then
      AGE=$((NOW - FILE_MOD))
      if [ "$AGE" -gt "$STALE_THRESHOLD" ]; then
        WF_NAME=$(basename "$state_file" | sed 's/\.[^.]*$//')
        warn "Stale workflow state: $WF_NAME (last updated $(( AGE / 86400 )) days ago). Consider closing or cleaning up."
      fi
    fi
  done
fi

# --- Summary ---
if [ "$WARNINGS" -gt 0 ]; then
  echo ""
  echo "[Workflow] $WARNINGS warning(s) found. These are advisory — your commit will proceed."
fi

# Always exit 0 — warnings never block commits
exit 0
