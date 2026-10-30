# Witch & Ward rulebook — source markup

The book is plain HTML fragments + one stylesheet, paginated by Chromium's native
CSS paged media and printed to PDF (`npm run build:book`). Every chapter is one
file in `book/src/chapters/NN-slug.html`, concatenated in filename order.

**The author decides the game.** Never add rules, numbers, names or flavour text
that Richard Moore has not approved. Text not written yet is marked
`class="placeholder"` and starts with "PLACEHOLDER —", so it shows on every proof.
Record every ruling or text change in `book/REVIEW.md`.

## File order

| Prefix | What |
|---|---|
| `00-cover.html` | Front cover (`section.cover`) |
| `01-credits.html` | Credits and legal page (`section.credits`); the Table of Contents is generated after it |
| `10-…`, `30-…` | Part title pages (`section.part`), each followed by its chapters (`11-ch01.html`, …) |
| `40-…` | Printable sheets (`section.sheet`) |
| `99-back-cover.html` | Back cover (`section.back-cover`) |

## Structure

```html
<section class="part" id="part-one">            <!-- Part title page -->
  <p class="part-kicker">Part One</p>
  <h1>Part Title</h1>
  <p class="part-lede">…</p>
  <figure class="art part-art" data-art="NAME"></figure>
</section>

<section class="chapter" id="ch-02">
  <header class="chapter-head">
    <figure class="art chapter-art" data-art="NAME"></figure>
    <p class="chapter-num">Chapter 2</p>
    <h2>Chapter Title</h2>
  </header>
  <p class="epigraph"><em>…</em></p>           <!-- optional -->
  <p class="opener">The first paragraph …</p>   <!-- gets the drop cap -->
  <h3>Section</h3>
  <p>…</p>
  <h4>Minor heading</h4>
</section>
```

- `h1` part titles, `h2` chapter titles (the TOC reads `.chapter-head h2`), `h3` sections, `h4` minor.
- Section ids: parts `part-…`, chapters `ch-NN` (the spot-art plan in `build.mjs` keys on them).
- Use real characters: — – ’ “ ” … × − (minus in "−1"), not entities.
- Italic for in-fiction asides: `<em>`. Game terms in bold: `<strong>`.
- `p.span-all` spans both columns; `.signoff` is a centred closing line.

## Boxes

```html
<aside class="box rule"><h4>…</h4><p>…</p></aside>       <!-- a key rule -->
<aside class="box example"><h4>Example</h4><p>…</p></aside>   <!-- worked example -->
<aside class="box gm"><h4>…</h4>…</aside>                <!-- advice for whoever runs the game -->
<aside class="box designer"><h4>Designer’s Note</h4>…</aside>
<aside class="box list"><h4>…</h4><ul>…</ul></aside>     <!-- checklists, tips -->
```

## Tables

```html
<table class="tbl">
  <thead><tr><th>Column</th><th>Number</th><th>Notes</th></tr></thead>
  <tbody><tr><td>…</td><td class="num">1</td><td>…</td></tr></tbody>
</table>
```
`class="num"` centres a numeric cell. Tables may break across pages; the header repeats.
Tables with 4+ columns automatically span both text columns (`wide`).
Add `flow` to let a short table split across the two columns, or `nosplit` to keep a table whole
with its heading (use sparingly — a large unsplittable table can leave a gap).
Wrap a chapter in `<div class="tight-tables">` when its tables must squeeze onto one page.

## Catalogue entries and stat blocks

Generic layouts; what goes in them is for the author to decide.

```html
<article class="entry" id="…">
  <figure class="art portrait" data-art="NAME"></figure>   <!-- or class="art badge" -->
  <h3>Entry Name</h3>
  <p class="quote">“…”</p>
  <div class="ability"><h4>…</h4><p>…</p></div>          <!-- or class="signature" -->
  <p>…</p>
  <p class="statline"><strong>Label:</strong> … <span class="sep">·</span> <strong>Label:</strong> …</p>
</article>

<article class="statblock" id="…">
  <figure class="art portrait" data-art="NAME"></figure>
  <h3>Name <span class="epithet">“…”</span></h3>
  <dl class="stats"><div><dt>Label</dt><dd>…</dd></div></dl>
  <p class="pools">…</p>
  <dl class="traits"><dt>Label</dt><dd>…</dd></dl>
</article>
```

## Sheets

```html
<section class="sheet" id="sheet">
  <h2>Sheet Title</h2>
  <p class="sheet-intro">…</p>
  <div class="field"><strong>Label</strong><span class="blank"></span></div>
  <table class="sheet-grid"><tr><th>…</th></tr><tr><td></td></tr></table>   <!-- add "tall" for taller boxes -->
  <span class="box-check"></span>  <span class="pips"><span class="pip"></span>…</span>
  <p class="sheet-note">…</p>
</section>
```

## Art

`<figure class="art …" data-art="NAME"></figure>` is replaced at build time by
`book/art/NAME.svg`, inlined. Add `<figcaption>` inside for a caption (`figure.map`
and `figure.diagram` style it). Available names are listed in `book/art/README.md`.
Spot illustrations at chapter ends are placed by the build (`SPOTS` in `build.mjs`),
never written into the chapters.
