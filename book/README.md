# Witch & Ward — the rulebook

The game is not written yet: every chapter, the cover and the art are clearly
marked PLACEHOLDERs (dashed red outline on the proofs) so nothing ships by accident.

| Path | What |
|---|---|
| `src/chapters/*.html` | The text, one file per chapter, concatenated in filename order (see `src/MARKUP.md`) |
| `src/book.css` | The print design. The palette and typefaces are PLACEHOLDERS defined as tokens at the top; art direction is undecided |
| `art/*.svg` | All illustrations (catalogue and palette in `art/README.md`; every piece must pass `art/ART-CHECKLIST.md`) |
| `tools/art-gen/` | Scripts that generate the art: `lib.mjs` (drawing primitives), `scenes/lib.mjs` (scene kit), `scenes/build.mjs` (writes the pieces), `scenes/placeholders.mjs` (an example scene module) |
| `tools/preview-art.mjs` | Renders art to PNGs plus a labelled contact sheet, and checks every SVG is well-formed |
| `tools/contact-sheet.py` | Renders a PDF's pages into one contact-sheet image for layout review |
| `tools/text-diff.py` | Word-level diff of two builds' text (to prove only intended text changed) |
| `REVIEW.md` | The log of every ruling and text change (what, where, why, source) |
| `dist/Witch_and_Ward_v0.1.pdf` | The typeset edition (digital) |
| `dist/Witch_and_Ward_v0.1_print-*.pdf` | Print-on-demand files: interior (8.75×11.25in incl. 0.125in bleed, even page count) and separate front/back covers |

```bash
npm install
npm run build:book                                   # → book/dist/Witch_and_Ward_v0.1.pdf
npm run build:book -- --print                        # → print-on-demand interior + covers (with bleed)
npm run build:book -- --draft                        # missing art becomes a labelled box instead of an error
node book/tools/art-gen/scenes/build.mjs [name …]    # regenerate art into book/art/
node book/tools/preview-art.mjs /tmp/art [name …]    # look at the art (PNG per piece + _sheet.png)
python3 book/tools/contact-sheet.py book/dist/Witch_and_Ward_v0.1.pdf /tmp/sheet 40 6   # look at every page
python3 book/tools/text-diff.py old.pdf book/dist/Witch_and_Ward_v0.1.pdf               # text check vs an earlier build
```

## What the build does
- **Two-pass Table of Contents.** Pass 1 prints with invisible markers at every part and
  chapter start; their pages feed the TOC of the final pass (markers are absolutely
  positioned, so removing them moves nothing). The build fails if pass 1 and the final
  pass paginate differently.
- **End-of-chapter spot art.** Pass 1 also measures the room left on each chapter's last
  page; `SPOTS` in `build.mjs` (empty for now) lists each chapter's preferred spot
  illustrations, and one sized to fit is placed there — never a repeat, never one that
  would move a page. Large unfilled gaps are reported as warnings.
- **Overflow guard.** Chromium silently shrinks every page when anything is wider than the
  paper; the build refuses to print instead and names the culprits.
- **Missing art fails the build** (use `--draft` while drafting).
- **`--print`:** interior with 0.125in bleed and an even page count (a blank page is
  added if needed), no covers; front and back covers as separate files with bleed.
- **Keep-with-next:** an h3/h4 is bound to its next short block so headings never strand;
  tables of 4+ columns span both columns automatically (see `src/MARKUP.md`).
- Title, author, version and output names are constants at the top of `build.mjs`.

Chromium comes from `$CHROME_PATH`, else `/opt/pw-browsers/chromium`, else Playwright's
default. Fonts (Fraunces, Alegreya, Alegreya Sans; placeholders) are SIL OFL and embedded
in the PDF, so the file can be sold. `contact-sheet.py` and `text-diff.py` need
`pip install pymupdf pillow`.

## After every build
Render a contact sheet and look at every page: no near-empty pages, odd gaps, overflow
or split tables. Run the text diff against the previous build and check every changed
span against `REVIEW.md`.
