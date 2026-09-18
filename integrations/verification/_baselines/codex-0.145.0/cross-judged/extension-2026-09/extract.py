# 抽出 codex 最終答案並盲化：只取 `tokens used` 之後、路徑換成 <path>、拿掉嚴重度標記（僅格式，不動措辭）。
import re, sys, pathlib
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
lines = src.read_text().splitlines()
idx = [i for i, l in enumerate(lines) if l.startswith("tokens used")]
if len(idx) != 1: sys.exit(f"{src.name}: tokens used 出現 {len(idx)} 次")
ans = "\n".join(lines[idx[0] + 2:]).strip() + "\n"   # 跳過 tokens used 與其下一行的數字
ans = re.sub(r"\]\((?:/|file:)[^)\s]*\)", "](<path>)", ans)
ans = re.sub(r"/private/tmp/[^\s)`\]]*", "<path>", ans)
sev = r"(?:BLOCKING|IMPORTANT|SUGGESTION|QUESTION|NOTE)"
ans = re.sub(r"(?m)^(\s*[-*]\s*)(?:[❗⚠️💡❓📝ℹ️\s]*)\*\*" + sev + r"\*\*\s*(?:[:：—–-]\s*)?", r"\1", ans)
ans = re.sub(r"(?m)^(\s*[-*]\s*)\[" + sev + r"\]\s*", r"\1", ans)
dst.write_text(ans)
left = re.findall(sev + r"|/private/|/Users/", ans)
print(f"{src.stem}: {len(ans.splitlines())} 行，殘留標記/路徑 {len(left)}")
