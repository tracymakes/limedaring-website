# Tracy Osborn’s website

The Astro rebuild of tracyosborn.com, preserving the original Cactus site's design, 84 article URLs, 17 main pages, category archives, images, fonts, and other public files. It builds static HTML; there is no database or application server to maintain in production.

## Local preview

Use a current supported Node.js LTS release (Node 22.22+ or Node 24 recommended), then:

```sh
npm ci
npm run dev
```

Open the local address Astro prints. To build and check the production output:

```sh
npm run build
npm run verify
```

Astro 7 may run the development server in the background. Use `npx astro dev stop` to stop it. If the environment prevents Astro's telemetry preferences from being written, prefix commands with `ASTRO_TELEMETRY_DISABLED=1`.

## Where to edit

- `src/content/articles/*.md`: each article's metadata and Markdown/HTML body. Keep `slug` and filename unchanged to preserve its URL. Dates use `YYYY-MM-DD`.
- `src/content/pages/*.json`: existing informational pages and their introductions, stored as HTML fragments to preserve the original formatting.
- `src/components/HomeMockup.astro`: approved story homepage (production mode at `/`); `WritingArchive.astro`: year-by-year archive and topic pages; `PageContent.astro`: retained legacy page content.
- `src/layouts/Base.astro`: shared navigation, document metadata, and footer.
- `public/static/`: published styles, images, fonts, scripts, and downloads. The existing compiled stylesheet is reused unchanged; no legacy Python/Sass compiler is required.
- `src/content/post-order.json`: original ordering for articles published on the same date. New dates sort automatically.

There is no browser CMS in this first stage. The content is now independent of Cactus and ready for a future editor or the planned portfolio update. Imported external entries retain HTML in their Markdown files to preserve their existing rich formatting; the loader renders those bodies directly when `imported` is true.

## Preservation and verification

The original `pages/`, `templates/`, `plugins/`, `static/`, and Python configuration are retained as migration sources. They are not used by Astro. The existing ignored `.build/` directory is the local preservation baseline; keep it for comparison.

`npm run verify` checks every migrated route, canonical URLs, original article text and media against `.build/` when available, imported article bodies and media counts against `scripts/external-import-manifest.json`, the original assets byte for byte, RSS, sitemap coverage, local link targets, and publishing files. The publishing workflow checks out a fixed original live-site revision and requires the baseline to be present. It reports three already-broken historical references (`/portfolio`, `/blog/veggieblog`, and `/blog/technical-co-founder-wanted-for-disrupting-the-wedding-industry`) without changing the articles.

`node scripts/check-live.mjs` performs an optional read-only comparison of all 101 content pages with the public website. It saves responses to a temporary folder and prints its path. Pass that folder as an argument to repeat the comparison offline. It normalizes whitespace and decodes Cloudflare's email obfuscation before comparing. The 19 imported entries will intentionally differ from their empty stubs on the old public site.

The one-time `python3 scripts/migrate.py` migration script is retained for provenance. **Do not rerun it after editing the migrated content**: it regenerates the migrated files from the originals. A few paragraphs use preserved HTML because the original and modern Markdown renderers interpret malformed emphasis differently.

The migration corrects canonical and sharing URLs that previously pointed at limedaring.com or hellowebapp.com. The original Segment tracking snippet and unnecessary jQuery dependency are not loaded. The category reveal and error-page behavior use small native scripts instead. External embeds and Google Fonts remain as before; their availability is controlled by their providers.

## Publishing

`npm run build` writes the deployable static site to `dist/`, including `CNAME`, `robots.txt`, `rss.xml`, `sitemap.xml`, and `404.html`. Publish that directory to a static host. There has been no change to the live domain or GitHub Pages configuration as part of this local rebuild.

The old Makefile deploys the Cactus build. Do not use it to publish the Astro version. The prepared `.github/workflows/publish.yml` builds and verifies on pushes and pull requests to `master`. Publishing requires a separate manual run with the publish checkbox selected; ordinary pushes never replace the live site. See [the publishing guide](docs/publishing.md) for the first launch, later updates, and rollback to the preserved `gh-pages` branch.

## External article archive

All 19 formerly outward-linking entries now contain their full article bodies. They retain their existing `/articles/external-…/` URLs, original titles and dates, and a footer link to the original publication. The technical-writing entry previously linked to the wrong Medium design article; its source link is corrected and its content was recovered from the existing `writing-clearly` article. Both historical entries are retained.

Four articles were recovered from their publicly readable Medium pages, fourteen from Hello Web Books (including its copies of the three design articles), and the technical-writing article from the local original. `scripts/external-import-manifest.json` records each original publication URL, retrieval source, article-text checksum, and illustration/embed counts.

All 109 article illustrations are archived under `public/static/imported/`: 76 copied from the author's local Hello Web Books images and 33 downloaded from the public originals. Imported images are lazy-loaded. Videos remain embeds from their original providers. The Kickstarter article's tweet is preserved as a local illustration, caption, and original-post link instead of requiring a Twitter widget. Medium's signup forms, tracking scripts, and image-zoom prompts are excluded.

Links to imported articles now stay local in the homepage, categories, RSS, next/previous navigation, and article bodies. Original source links in article footers stay external. `src/lib/article-links.mjs` resolves historical Hello Web App/Books and Medium URL aliases without changing the original article source files.

The scripts `fetch-external.mjs`, `fetch-design-sources.mjs`, `import-external.mjs`, and `archive-external-assets.mjs` retain the one-time import procedure. Source snapshots are temporary files, not dependencies of normal builds. Do not run the old Cactus migration over these imported bodies.

## Stage two homepage and archive

The approved story-first homepage now serves at `/`. Its current-work and writing links point to production URLs, with no mockup controls or no-index metadata. The signature, centered introduction, Cormorant Garamond headings, Lato reading text, olive links, and slim ochre strokes carry through `/articles/`, the topic archives, and individual article pages. All 84 articles remain at their existing URLs with their original bodies, images, and source attribution. `public/static/home/editorial.css` holds shared archive and reading styles; display fonts are self-hosted with their license.

The earlier no-index previews remain at `/mockups/`, `/mockups/story/`, and `/mockups/archive/` for reference and stay out of the sitemap. `scripts/homepage-sources.json` records the role information and user direction. `npm run verify` checks complete archive coverage, production navigation, preserved article bodies/assets, and existing URLs.
