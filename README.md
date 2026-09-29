# Zameer Ali — portfolio

Static portfolio for GitHub Pages. There is no application build or package installation step.

- `index.html`: public overview and selected projects.
- `work.html`: password page and authenticated, encrypted case-study document.
- `portfolio.css`, `work.css`, `exhibits.css`: shared layout and interactive exhibit styling.
- `portfolio.js`: case filters, deep links, comparisons, and the artifact viewer.
- `home-scene.js`: the original illustration’s one-time scroll reveal, with reduced-motion support and a visible no-JavaScript fallback.
- `staticrypt.js`: the existing StatiCrypt browser decryption engine.
- `assets/`: typefaces and images already used on the public overview.

## Preview

Serve this directory with a local static HTTP server. Serve only this repository, not a parent directory containing private source material. The password flow requires JavaScript and a secure browser context (localhost or HTTPS).

## Updating the protected work

Keep the decrypted HTML and source material **outside this repository**. Edit that private source, set `PORTFOLIO_PASSWORD` in the local environment, and run:

```text
node scripts/rebuild-work.cjs /absolute/path/to/private-source.html
```

The script authenticates the existing page before writing, retains the password and salt, and verifies the encryption round trip. Commit only the resulting encrypted `work.html` and any intended public code or assets. Do not put passwords, decrypted case studies, employer documents, or local build environments in the repository.

The protected HTML can reference the shared CSS and JavaScript. Case-study images remain inside the encrypted document. Preserve existing case IDs when editing so shared links continue to work.

Original artifacts use focused CSS views of unchanged source images. Their viewer opens the complete image with fit-to-width and actual-size modes, native keyboard focus management, and Escape to close. Captions distinguish original artifacts, reconstructed specimens, and simplified explanatory diagrams. Keep those distinctions and team credits when replacing imagery.

## Checks before publishing

Check local links and image references, JavaScript syntax, correct and incorrect passwords, remembered access and expiry, case filters, deep links, and keyboard interactions. Confirm each case distinguishes delivery status, individual contribution, and team evidence. GitHub Pages serves the existing deployment branch; a review branch does not itself publish the revision.
