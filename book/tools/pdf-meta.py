"""Set the built PDFs' document properties to the book's own: title, author, subject.
   python3 book/tools/pdf-meta.py <title> <author> <subject> <pdf> [<pdf> ...]
The renderer otherwise writes its own name into Creator and Producer."""
import sys, os, pymupdf

title, author, subject, files = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
for f in files:
    if not os.path.exists(f):
        continue
    d = pymupdf.open(f)
    m = d.metadata
    d.set_metadata({"title": m.get("title") or title, "author": author, "subject": subject, "keywords": "",
                    "creator": author, "producer": author,
                    "creationDate": m.get("creationDate", ""), "modDate": m.get("modDate", "")})
    tmp = f + ".tmp"
    d.save(tmp, garbage=3, deflate=True)
    d.close()
    os.replace(tmp, f)
print(f"Set document properties on {len(files)} file(s).")
