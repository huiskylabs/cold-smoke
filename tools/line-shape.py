# How winding a ring line is, by course-setting measures (FIS/SSNZ course setting rules: giant slalom 11-18 % of the vertical drop in
# direction changes, at most 30-35 m from turning pole to turning pole; super-G 6-14 %, at most 50 m). From a tools/ring-plan.js file
# (and the height grid of tools/ring-map-grid.js for the drop): direction changes of the way (a swing of 2 m or more each way), turns per km,
# % of the vertical drop, the longest stretch without a direction change, crossings of the run (left side <-> right side), and the longest
# row of rings standing on one straight line (each within 1.2 m of the line through its row's first and last).
# python3 tools/line-shape.py <plan.json> <grid.json> [diff=b]
import json, sys, numpy as np
P = json.load(open(sys.argv[1])); G = json.load(open(sys.argv[2])); dk = sys.argv[3] if len(sys.argv) > 3 else 'b'; d = P['diffs'][dk]
xp = np.array(d['xpath'], float); s = np.arange(len(xp)) * 4.0; sEnd = d['sEnd']; m = s <= sEnd; xp, s = xp[m], s[m]
# direction changes with 2 m hysteresis
turns = []; dirn = 0; ext = xp[0]; es = s[0]
for i in range(1, len(xp)):
    if dirn == 0:
        if abs(xp[i] - xp[0]) >= 2: dirn = 1 if xp[i] > xp[0] else -1; ext, es = xp[i], s[i]
        continue
    if (xp[i] - ext) * dirn > 0: ext, es = xp[i], s[i]
    elif (ext - xp[i]) * dirn >= 2: turns.append(es); dirn = -dirn; ext, es = xp[i], s[i]
gaps = np.diff([0] + turns + [s[-1]])
GS = np.array([r['s'] for r in G]); H0 = np.array([r['h'][len(r['h']) // 2] for r in G]); HW = np.array([r['hw'] for r in G])
drop = float(np.interp(0, GS, H0) - np.interp(s[-1], GS, H0))
hw = np.interp(s, GS, HW); side = np.where(xp > hw, 1, np.where(xp < -hw, -1, 0)); cross = 0; last = 0
for v in side:
    if v != 0 and last != 0 and v != last: cross += 1
    if v != 0: last = v
R = d['rings']; pts = [(q['s'], q['u']) for q in R if not q.get('fin')]; best = 1; i = 0
for i in range(len(pts)):
    for j in range(i + 2, len(pts)):
        a, b = pts[i], pts[j]; ok = all(abs((pts[k][1] - a[1]) - (b[1] - a[1]) * (pts[k][0] - a[0]) / max(1e-6, b[0] - a[0])) < 1.2 for k in range(i + 1, j))
        if ok: best = max(best, j - i + 1)
        else: break
out = dict(len_m=round(s[-1]), drop_m=round(drop), turns=len(turns), turns_per_km=round(len(turns) / s[-1] * 1000, 1), pct_of_drop=round(100 * len(turns) / max(1, drop), 1),
           longest_no_turn_m=round(float(gaps.max())), median_turn_gap_m=round(float(np.median(gaps))), crossings=cross, longest_straight_ring_row=best, rings=len(R))
print(json.dumps(out, ensure_ascii=False))
