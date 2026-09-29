# Source this file. It gives bash callers the SAME isolated-HOME environment the
# node callers get from scripts/lib/isolated-home.mjs (one list of variables, in
# the .mjs, read here by running it — a second list would drift).
#
#   . "$SCRIPT_DIR/lib/isolated-home.sh"
#   uds_isolated_home_init            # creates $UDS_ISO_HOME, fills UDS_ISO_ENV
#   run_isolated node cli/bin/uds.js check --force
#   uds_isolated_home_cleanup
#
# Why: see the header of isolated-home.mjs (2026-09-29, pre-release-check wrote
# 54 skill folders into the maintainer's real ~/.claude/skills).
#
# Bash 3.2-safe (macOS): plain arrays, no mapfile.

uds_isolated_home_init() {
  local lib_dir
  lib_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  UDS_ISO_HOME="$(mktemp -d 2>/dev/null || mktemp -d -t udsiso)"
  if [ -z "$UDS_ISO_HOME" ] || [ ! -d "$UDS_ISO_HOME" ]; then
    echo "cannot create an isolated HOME" >&2
    return 1
  fi
  # Resolve symlinks (macOS /var -> /private/var) so both worlds see one path.
  UDS_ISO_HOME="$(cd "$UDS_ISO_HOME" && pwd -P)"
  UDS_ISO_ENV=()
  local line env_out
  # Into a variable first: a node that fails must not read as "no variables to set".
  env_out="$(node "$lib_dir/isolated-home.mjs" env "$UDS_ISO_HOME")" || {
    echo "isolated-home.mjs failed; refusing to run without an isolated HOME" >&2
    return 1
  }
  while IFS= read -r line; do
    [ -n "$line" ] && UDS_ISO_ENV+=("$line")
  done <<EOT
$env_out
EOT
  if [ "${#UDS_ISO_ENV[@]}" -lt 5 ]; then
    echo "isolated-home.mjs printed ${#UDS_ISO_ENV[@]} variables; expected the full list" >&2
    return 1
  fi
}

# Run a command with the isolated environment (only for that command).
run_isolated() {
  env "${UDS_ISO_ENV[@]}" "$@"
}

uds_isolated_home_cleanup() {
  [ -n "${UDS_ISO_HOME:-}" ] && [ -d "$UDS_ISO_HOME" ] && rm -rf "$UDS_ISO_HOME"
}
