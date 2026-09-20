# Deployment

The site is a fully static export (`output: 'export'`), served from Cloudflare.

## Current state

- **Live and working.** Cloudflare builds and deploys from `main`, which is the
  configured production branch.
- **www to apex redirect is live**, set up as a zone-level Redirect Rule in the
  Cloudflare dashboard.

Nothing here is outstanding. The notes below are the reasoning behind the
configuration, kept because the two footguns took a while to find.

## Why there is no `_redirects` file

Cloudflare Workers static assets reads `_redirects` but **rejects any rule with
a hostname in it**, which Cloudflare Pages allows. A deploy carrying a
www-to-apex line in `_redirects` fails with:

```
Invalid _redirects configuration: Line 18: Only relative URLs are allowed. [code: 100324]
```

So the www redirect is a zone-level Redirect Rule rather than a file in the
build. If a genuine path-to-path redirect is ever needed — say a published
article's slug changes — it goes in `_redirects` as a relative rule, and that
is fine.

## `public/_headers`

Validation happens server-side at deploy time, so `wrangler --dry-run` never
reaches it. Two things that will fail a deploy and cannot be caught locally:

- comments must start at column 0;
- the file must be pure ASCII.

The file deliberately sets **no Content-Security-Policy**, because a CSP tight
enough to be worth having would block AdSense and GA4 when those are switched
on. HSTS is a dashboard toggle rather than a header here.

## Changing a published URL

`output: 'export'` builds only published routes, so a link to a draft is a 404
that no build will warn about. `lib/content/links.test.ts` is the guard: it
fails if any published page links to a draft article, or to a blog slug that
does not exist.

Article slugs are built from each article's target keyword. Changing the slug of
an **already-published** article needs a relative `_redirects` entry; changing a
draft's costs nothing.
