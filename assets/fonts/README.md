# Vendored fonts

`scripts/generate-pins.tsx` renders text into PNGs with satori, which needs
font files it can read directly. The site's own webfonts come from
`next/font/google` as WOFF2, which satori cannot parse, so the two faces are
vendored here as TTF instead.

Both are under the SIL Open Font License 1.1, which permits redistribution:

- **Fraunces** — https://fonts.google.com/specimen/Fraunces
- **Public Sans** — https://fonts.google.com/specimen/Public+Sans

They are used for the pin images only. Nothing on the site loads them from
here; the pages still use `next/font/google`, so there is one source of truth
for what a visitor downloads.
