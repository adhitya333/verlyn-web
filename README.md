# Verlyn Tech website

Responsive, buildless HTML, CSS and JavaScript website for Verlyn Tech, with service and industry pages, looping workflow demonstrations, and bilingual landing-page previews.

## Run locally

Requires Python 3. No npm installation or build step is needed.

```sh
python preview.py 4175
```

Open http://127.0.0.1:4175/ in your browser. On Windows, `py preview.py 4175` also works.

## Source

- `index.html`: homepage and six service previews.
- `services.html`, individual service pages, and industry pages: detailed examples.
- `site.css`, `pages.css`, `workflow.css`, `home-showcase.css`, `polish.css`: shared and page-specific styling.
- `site.js` and `assets/`: interactions, animation components and local artwork.
- `credits.html`: image and trademark credits, including AI-generated concept artwork.

## Contact form

The included preview server accepts test enquiries and keeps them in memory until it stops. It does not deliver email or create CRM records. Production form delivery requires a real backend integration.

## Motion and accessibility

Demonstrations pause when offscreen, scroll entrances run once, and motion respects the visitor's reduced-motion preference. Core navigation and page content remain available without animation.
