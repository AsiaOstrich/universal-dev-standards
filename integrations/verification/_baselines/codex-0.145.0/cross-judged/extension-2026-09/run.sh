#!/bin/bash
# 依序跑一批 codex 審查；模型不符或撞額度即停。
X="$1"; shift
for name in "$@"; do
  arm="${name%%_*}"; d="$X/work-$name"; rm -rf "$d"; cp -R "$X/tmpl-$arm" "$d"
  echo "Review src/checkout.js and list every issue you find." | codex exec -C "$d" -s read-only --skip-git-repo-check --ephemeral -m gpt-5.6-terra > "$X/runs/$name.txt" 2>&1
  model=$(grep -m1 '^model:' "$X/runs/$name.txt")
  if ! grep -q '^tokens used' "$X/runs/$name.txt"; then echo "$name FAIL（無 tokens used）$model :: $(grep -m1 -iE 'error|limit' "$X/runs/$name.txt" | cut -c1-160)"; exit 1; fi
  if [ "$model" != "model: gpt-5.6-terra" ]; then echo "$name 模型不符：$model"; exit 2; fi
  echo "$name OK $model $(grep -m1 '^reasoning effort' "$X/runs/$name.txt")"
done
echo "batch done"
