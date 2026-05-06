#!/usr/bin/env bash
# DEPRECATED: Use 'npx tsx scripts/check-release-readiness-signoff.ts' instead (cross-platform).
# This script remains for legacy Linux/macOS compatibility.
#
# check-release-readiness-signoff.sh
# Verifies that a Release Readiness Sign-off document exists for the current release.
# Part of UDS Release Readiness Gate (core/release-readiness-gate.md).
#
# Exit codes:
#   0 — sign-off found and appears complete
#   1 — sign-off missing or incomplete (advisory warning in pre-release-check.sh)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SIGNOFF_DIR="$REPO_ROOT/.release-readiness"

# Check if sign-off directory exists
if [ ! -d "$SIGNOFF_DIR" ]; then
    echo "⚠ .release-readiness/ directory not found."
    echo "  Create one sign-off per release: .release-readiness/<version>.md"
    echo "  Template: core/release-readiness-gate.md §Release Readiness Sign-off Template"
    exit 1
fi

# Find the most recent sign-off file
latest_signoff=$(find "$SIGNOFF_DIR" -name "*.md" -type f | sort -V | tail -1)

if [ -z "$latest_signoff" ]; then
    echo "⚠ No sign-off file found in .release-readiness/"
    echo "  Expected: .release-readiness/<version>.md"
    exit 1
fi

# Check that Tier-1 gates are present and not left as FAIL
tier1_fail_count=$(grep -c "| FAIL" "$latest_signoff" 2>/dev/null || echo "0")
unchecked_go=$(grep -c "\[ \] \*\*GO\*\*" "$latest_signoff" 2>/dev/null || echo "0")

if [ "$tier1_fail_count" -gt 0 ]; then
    echo "⚠ Sign-off contains FAIL status: $latest_signoff"
    echo "  FAIL gates must be resolved before production deployment."
    grep "| FAIL" "$latest_signoff" | head -5
    exit 1
fi

if [ "$unchecked_go" -gt 0 ]; then
    echo "⚠ Sign-off GO/NO-GO decision not yet made: $latest_signoff"
    echo "  Complete the Overall Decision section before deployment."
    exit 1
fi

echo "✓ Release readiness sign-off found: $(basename "$latest_signoff")"
exit 0
