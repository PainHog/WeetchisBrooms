"""Build the print-on-demand cover spread (back, spine, front) from the two cover files.
   python3 book/tools/cover-spread.py <distDir> <fileStem> <interiorPages>

The front and back cover PDFs carry 0.125in bleed on every edge. In the spread the
bleed stays on the outside edges only: the back cover loses its right bleed and the
front cover its left, and the spine sits between them. Spine width = pages x paper
thickness (0.002252in a page, the common figure for white interior paper; check your
printer's own figure). The spine is plain: most printers won't print spine text on a
book thinner than 0.25in; add the title (in the book's own font) once the book is that thick."""
import sys, pymupdf

dist, stem, pages = sys.argv[1], sys.argv[2], int(sys.argv[3])
PT, BLEED, PER_PAGE = 72, 0.125, 0.002252
spine = round(pages * PER_PAGE, 4)
back = pymupdf.open(f"{dist}/{stem}_print-cover-back.pdf")
front = pymupdf.open(f"{dist}/{stem}_print-cover-front.pdf")
w_in, h_in = 8.5 + BLEED, 11 + 2 * BLEED            # each cover in the spread: one side's bleed only
W, H = (2 * w_in + spine) * PT, h_in * PT

out = pymupdf.open()
pg = out.new_page(width=W, height=H)
pg.show_pdf_page(pymupdf.Rect(0, 0, w_in * PT, H), back, 0, clip=pymupdf.Rect(0, 0, w_in * PT, H))
x_spine = w_in * PT
pg.draw_rect(pymupdf.Rect(x_spine, 0, x_spine + spine * PT, H), color=None, fill=(0x22 / 255, 0x22 / 255, 0x24 / 255))
x_front = x_spine + spine * PT
pg.show_pdf_page(pymupdf.Rect(x_front, 0, x_front + w_in * PT, H), front, 0, clip=pymupdf.Rect(BLEED * PT, 0, (8.5 + 2 * BLEED) * PT, H))
f = f"{dist}/{stem}_print-cover-spread.pdf"
out.save(f, garbage=3, deflate=True)
note = " (thick enough for spine text: add the title)" if spine >= 0.25 else " (too thin for spine text)"
print(f"Built {f.split('/book/')[-1] if '/book/' in f else f} ({2 * w_in + spine:.3f}in x {h_in}in, spine {spine:.3f}in for {pages} pages{note}).")
