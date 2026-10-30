"""Word-level diff of the rulebook text: an earlier PDF vs a new build.
   python3 book/tools/text-diff.py <old.pdf> <new.pdf> [skip-pages]
skip-pages: comma-separated 1-based page numbers left out of BOTH files
(default "3": the Table of Contents, which is regenerated on every build).
Normalises case, quotes, dashes, ligatures and page furniture (the running
footer), then prints every non-equal span so each can be checked against
book/REVIEW.md."""
import sys, re, difflib, unicodedata, pymupdf

TITLE = "Witch & Ward"   # keep in step with BOOK_TITLE in book/build.mjs
FOOTER = re.compile(re.escape(TITLE.upper()).replace("'", "['’]") + r"\s*·\s*\d+", re.I)

def words(path, skip_pages=()):
    d = pymupdf.open(path)
    out = []
    for i, p in enumerate(d):
        if i + 1 in skip_pages: continue
        t = p.get_text()
        t = unicodedata.normalize("NFKC", t)
        t = FOOTER.sub(" ", t)
        t = t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
        t = t.replace("−", "-").replace("–", "-").replace("—", " — ")
        t = re.sub(r"(\w)-\n(\w)", r"\1\2", t)
        out += re.findall(r"[\w'\"+\-%./#×½≈~]+|[—:;!?()]", t.lower())
    return out

skip = tuple(int(x) for x in (sys.argv[3] if len(sys.argv) > 3 else "3").split(",") if x)
old = words(sys.argv[1], skip)
new = words(sys.argv[2], skip)
sm = difflib.SequenceMatcher(None, old, new, autojunk=False)
n = 0
for op, a1, a2, b1, b2 in sm.get_opcodes():
    if op == "equal": continue
    n += 1
    ctx = " ".join(old[max(0, a1 - 5):a1])
    print(f"{op:7} …{ctx} [{' '.join(old[a1:a2])}] → [{' '.join(new[b1:b2])}]")
print(f"\n{n} differing spans; {len(old)} words old, {len(new)} words new; ratio {sm.ratio():.4f}")
