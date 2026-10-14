# Homepage

Personal homepage — a single page built with Jekyll and served by GitHub Pages.

Everything the visitor reads lives in [`pages/about.md`](pages/about.md) as plain
Markdown (bio + publication lists). The shell around it is:

| Path | What it is |
| --- | --- |
| `pages/about.md` | The only content file. `permalink: /`, so it renders at the site root. |
| `_layouts/default.html` | Page shell: head, top bar, hero, content, footer. |
| `_includes/` | `head`, `nav`, `hero`, `footer`, `icon`, `contact-cards` partials. |
| `_data/settings.yml` | Name, tagline, nav items, hero buttons, contact links. |
| `assets/css/main.css` | The whole stylesheet — plain CSS, no Sass build step. |
| `assets/js/site.js` | Progressive enhancement: theme, scroll effects, publication cards and filters. |
| `favicon.svg` | The logo mark, also used in the top bar and footer. |

## Editing content

Add a publication by appending a numbered item to the right list in
`pages/about.md`, keeping the existing shape:

```markdown
1. Author One, **Peiyu Liao**, Author Two. ["Paper title"](https://doi.org/...).
   In: Conference Name (ACRONYM). City, Country, 2026, pp. 1--10.
```

`site.js` reads that structure and builds the cards — it picks up the title
(quoted, optionally linked), the authors, the venue acronym in parentheses, the
publication year, an `arXiv preprint: [link]`, and a paper marked as
`<span style="color:brown">**Best Paper Award**</span>`.

Each card follows the layout of [`cv.pdf`](../cv): a row of chips on top — the
venue, the year, a clickable `arXiv <id>` chip for any arXiv link, and an award
chip — then a bold title, the author list with your own name bolded, and the
citation with the venue name in italics and the volume, year and pages upright
beside it, exactly as biblatex sets it. The chips share one pill shape, height
and border so the row reads as a single line. The leading `In:` is dropped, as
the CV drops it; `accepted by` is kept, since it is the one signal that a paper
is accepted rather than published.

If JavaScript is disabled the page degrades to the plain Markdown lists, so
`pages/about.md` stays the single source of truth either way.

## Contact

The contact cards under `## Contact` are not written in the Markdown.
`pages/about.md` carries one line — `{% include contact-cards.html %}` — and the
include renders them at build time from the `contacts:` list in
`_data/settings.yml`, the same list that fills the nav bar and the footer. Edit
a link, a label or a `value` there once and all three places follow.

Two rules decide how an entry is drawn:

- **no `link`** — the nav bar and footer skip it, and the Contact section renders
  it as an inert card (same box, no `href`, nothing happens on click).
- **`retired: true`** — the card is drained of colour, gets a dashed border and
  a struck-through value, and spans the full width of the grid. Use it for
  details that are on the record but no longer current.

Because the include sits inside a Markdown file it is handed to kramdown, which
ends a raw HTML block at the first blank line — so the include uses Liquid
whitespace control on every tag to keep empty lines out of its output. If you
extend it, keep that in mind.

## Local rendering

Dependencies first (macOS):

```shell
brew install ruby@2.6
gem install bundler:2.2.20
```

Then, from the repository root:

```shell
bundle config set --local path 'vendor/bundle'
bundle install
bundle exec jekyll serve
```

Open <http://localhost:4000>. `bundle exec jekyll serve --livereload` reloads the
browser on every change; `bundle exec jekyll build` writes a static copy to
`_site/`.

The pinned versions matter — newer Jekyll releases may break the local render.
See the [GitHub Pages documentation](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)
for details. To publish, merge into `master`.

## Type

The stylesheet uses the system UI stack — `SF Pro Text` / `SF Pro Display` on Apple
platforms, `Segoe UI` / `Roboto` elsewhere — in the spirit of apple.com. Nothing is
downloaded over the network, so the page renders identically offline and the
first paint is not blocked on a font request. Publication titles are set a step
larger and heavier than the author and venue lines beneath them.

`favicon.svg` is generated from the [`Permanent Marker`](https://fonts.google.com/specimen/Permanent+Marker)
font; see `assets/gen-favicon`.
