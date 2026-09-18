# 合併七月 9 份與本批 11 份：依臂、依評審計算平均找到數（排除缺陷 5）、逐缺陷比率、評審一致率。
import sys, pathlib, statistics as st
old, new = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
DEFS = [1,2,3,4,6,7,8]
def load_key(p): return dict(l.strip().split("=") for l in p.read_text().splitlines() if "=" in l)
def load_v(p):
    d = {}
    for l in p.read_text().splitlines():
        k, v = l.split(":"); d[int(k)] = v.strip() == "YES"
    return d if len(d) == 8 else None
rows = []  # (source, R, arm, judge, verdict)
for base, src in ((old, "2026-07"), (new, "2026-09")):
    key = load_key(base / "key.txt")
    for judge in ("gemini", "claude"):
        vd = base / f"verdicts-{judge}"
        for r, run in key.items():
            f = vd / f"{r}.txt"
            v = load_v(f) if f.exists() and f.stat().st_size else None
            rows.append((src, r, run.split("_")[0], judge, v))
def arm_name(a): return {"A": "no UDS", "B": "UDS"}[a]
print("## 每份平均找到的缺陷數（7 項，排除缺陷 5）\n")
print("| 評審 | 資料 | no UDS | UDS | 差 |"); print("|---|---|---:|---:|---:|")
for judge in ("gemini", "claude"):
    for scope in (("2026-07",), ("2026-09",), ("2026-07", "2026-09")):
        out = []
        for arm in ("A", "B"):
            xs = [sum(v[d] for d in DEFS) for s, r, a, j, v in rows if j == judge and a == arm and s in scope and v]
            out.append((st.mean(xs) if xs else float("nan"), len(xs), min(xs) if xs else 0, max(xs) if xs else 0))
        lab = "+".join(scope) if len(scope) > 1 else scope[0]
        print(f"| {judge} | {lab} | {out[0][0]:.2f} (n={out[0][1]}, {out[0][2]}–{out[0][3]}) | {out[1][0]:.2f} (n={out[1][1]}, {out[1][2]}–{out[1][3]}) | {out[1][0]-out[0][0]:+.2f} |")
print("\n## 逐缺陷找到比率（合併 20 份）\n")
print("| 缺陷 | gemini no UDS | gemini UDS | claude no UDS | claude UDS |"); print("|---|---:|---:|---:|---:|")
for d in [1,2,3,4,5,6,7,8]:
    cells = []
    for judge in ("gemini", "claude"):
        for arm in ("A", "B"):
            vs = [v[d] for s, r, a, j, v in rows if j == judge and a == arm and v]
            cells.append(f"{sum(vs)}/{len(vs)}")
    print(f"| {d}{' （已排除）' if d == 5 else ''} | " + " | ".join(cells) + " |")
print("\n## 兩位評審一致率（同一份答案、同一缺陷）\n")
for scope in ("2026-07", "2026-09"):
    agree = tot = 0
    per = {d: [0, 0] for d in range(1, 9)}
    g = {(r): v for s, r, a, j, v in rows if j == "gemini" and s == scope and v}
    c = {(r): v for s, r, a, j, v in rows if j == "claude" and s == scope and v}
    for r in g.keys() & c.keys():
        for d in range(1, 9):
            per[d][1] += 1; per[d][0] += g[r][d] == c[r][d]
    s7 = sum(per[d][0] for d in DEFS); t7 = sum(per[d][1] for d in DEFS)
    print(f"- {scope}：7 項 {s7}/{t7}；缺陷 5 為 {per[5][0]}/{per[5][1]}")
missing = [(s, r, j) for s, r, a, j, v in rows if not v]
print(f"\n缺漏或格式不符的評分：{missing if missing else '無'}")
