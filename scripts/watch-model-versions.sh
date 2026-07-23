#!/bin/bash
#
# Model / tool version watch — XSPEC-357 AC-6.2
#
# The delta between "what a model does unaided" and "what UDS asks for" only moves when
# model capability moves. So the trend in integrations/verification/DELTA-TREND.md is
# refreshed on version change, not on a schedule: a monthly run in a month with no release
# measures nothing, and a routine that measures nothing is how a check quietly stops mattering.
#
# This script is the cheap half. It records the current versions and reports when one moved.
# Actually re-running the baselines is a separate, human-initiated job.
#
# Usage:
#   ./scripts/watch-model-versions.sh          # report; exit 10 if a version changed
#   ./scripts/watch-model-versions.sh --update # report and record the new versions
#
# Exit codes:
#   0  — nothing changed
#   10 — a version changed; DELTA-TREND.md is due a new data point
#   1  — could not determine a version (do NOT treat as "unchanged")

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
STATE_FILE="$ROOT_DIR/integrations/verification/.last-versions.txt"

UPDATE=false
[ "${1:-}" = "--update" ] && UPDATE=true

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

# Probe one tool. Missing tool is reported, not silently skipped — "not installed" and
# "unchanged" must never look the same.
probe() {
    local label="$1" cmd="$2"
    shift 2
    if ! command -v "$cmd" > /dev/null 2>&1; then
        echo "$label=<not-installed>"
        return 0
    fi
    local out
    if ! out=$("$@" 2>&1 | head -1 | tr -d '\r'); then
        echo "$label=<probe-failed>"
        return 1
    fi
    if [ -z "$out" ]; then
        echo "$label=<empty-output>"
        return 1
    fi
    echo "$label=$out"
}

current=""
failed=0

for spec in "codex-cli:codex:codex --version" "antigravity-cli:agy:agy --version"; do
    label="${spec%%:*}"; rest="${spec#*:}"; cmd="${rest%%:*}"; run="${rest#*:}"
    line=$(probe "$label" "$cmd" $run) || failed=1
    current="${current}${line}"$'\n'
done

# The model behind the CLI matters more than the CLI itself, and it changes independently.
if command -v codex > /dev/null 2>&1; then
    model=$(codex exec --skip-git-repo-check --ephemeral "reply OK" < /dev/null 2>&1 \
            | grep -m1 '^model:' | sed 's/^model: *//')
    if [ -n "$model" ]; then
        current="${current}codex-model=${model}"$'\n'
    else
        current="${current}codex-model=<not-reported>"$'\n'
        failed=1
    fi
fi

echo "Current:"
echo "$current" | sed '/^$/d' | sed 's/^/  /'

if [ "$failed" -ne 0 ]; then
    echo -e "\n${RED}Could not determine at least one version.${NC}"
    echo "Not recording. An unreadable probe is not evidence that nothing changed."
    exit 1
fi

if [ ! -f "$STATE_FILE" ]; then
    echo -e "\n${YELLOW}No previous record.${NC}"
    if [ "$UPDATE" = true ]; then
        mkdir -p "$(dirname "$STATE_FILE")"
        printf '%s' "$current" > "$STATE_FILE"
        echo "Recorded baseline versions."
    else
        echo "Run with --update to record these as the baseline."
    fi
    exit 0
fi

# Compare normalised: $(cat) strips trailing newlines while $current keeps one, so a raw
# comparison reports a change on every run — a watch that always cries wolf is worse than
# no watch, because the first real change looks identical to the noise.
normalise() { printf '%s' "$1" | sed '/^[[:space:]]*$/d' | sort; }

previous=$(cat "$STATE_FILE")

if [ "$(normalise "$current")" = "$(normalise "$previous")" ]; then
    echo -e "\n${GREEN}Unchanged — no new data point due.${NC}"
    exit 0
fi

echo -e "\n${YELLOW}Version change detected:${NC}"
diff <(normalise "$previous") <(normalise "$current") | grep -E '^[<>]' | sed 's/^</  was:/; s/^>/  now:/'

cat <<'EOF'

A capability change is the only thing that moves the delta, so this is when the trend is
worth re-measuring:

  1. Re-run each active probe's BASELINE only, in a scratch project with no UDS
     (see docs/reference/INTEGRATION-VERIFICATION.md §2.3)
  2. Record raw output under integrations/verification/_baselines/<tool>-<version>/
  3. Add a row to integrations/verification/DELTA-TREND.md

Before trusting a run: count tool calls. If the model read files, the answer says nothing
about what was loaded.
EOF

if [ "$UPDATE" = true ]; then
    printf '%s' "$current" > "$STATE_FILE"
    echo -e "\n${GREEN}Recorded new versions.${NC}"
else
    echo -e "\n(Run with --update once the new data point is recorded.)"
fi

exit 10
