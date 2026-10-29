# Three Years, Still You ♡

A mobile-first, scroll-driven cinematic anniversary website: sunset opening, three scrapbook chapters, interactive memories, soundtrack, love-letter vault, cinema and a grand finale.

## Preview & local development

Use Node.js **22** (the version in `.node-version`, also used by CI and Cloudflare builds).

```bash
npm ci
npm run dev
npm run build
```

`npm run build` creates the complete static site in `dist/`. No server, database, Cloudflare Functions, or application secrets are needed. Dependencies are recorded in `package-lock.json`; use `npm ci` for repeatable installs.

## Cloudflare Workers deployment

The production project is the Cloudflare Worker **`3rd-anniversary`**. `wrangler.jsonc` sets its name, compatibility date, static output directory, and single-page app fallback. It deploys the Vite build directly without requiring a Vite upgrade or server code.

Use these settings for the existing Cloudflare Workers Git integration:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Repository root |

The deploy command reads the checked-in configuration, including the required compatibility date and `dist` asset directory. Push the configuration files along with application changes. Publishing a development environment does not push changes to GitHub.

To preview the production build locally:

```bash
npm run build
npm run workers:dev
```

For a direct deployment with the intended Cloudflare account already authenticated, use `npm run deploy`. The development workflow is to validate each change and then deploy it. The browser suite uses Cloudflare's local Workers runtime; local tests do not publish the site.

## Optional Cloudflare Pages deployment

The separate `wrangler.pages.jsonc` supports Pages. To connect the GitHub repository in the Cloudflare Pages dashboard, use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Repository root (leave blank) |
| Node.js version | `22`, from `.node-version` |

The default Pages project name in `wrangler.pages.jsonc` is `three-years-still-you`. If your existing Pages project has a different name, update that field to match it. With Git integration connected, pushes to `main` trigger production builds and pull requests can create preview deployments.

To serve the production build in Cloudflare's local Pages runtime:

```bash
npm run build
npm run pages:dev
```

Pages serves the generated JavaScript and CSS directly. Navigation uses page fragments (such as `#chapter-one`), and Pages supplies the standard single-page app fallback without a custom redirect or Worker. `public/_headers` gives hashed build assets a one-year immutable cache; Vite changes their filenames when their contents change.

For a manual deployment, authenticate Wrangler with your Cloudflare account, then run:

```bash
npx wrangler login
npm run pages:deploy
```

This command builds and uploads `dist/` to the configured Pages project. Local builds and tests do not authenticate or deploy to Cloudflare. Configure any API token securely in your deployment environment rather than committing it.

Illustrative photos and fonts load from Unsplash and Google Fonts. The site still works when these services are unavailable: photographs show a fallback and fonts use local alternatives. These requests are made by the visitor's browser, independently of Cloudflare's build.

## Customize the experience

All personal stories, chapter text, letters, track links and videos are in **`src/content.js`**. The app intentionally uses sample copy and illustrative photographs until you replace them. No real anniversary images or music have been uploaded.

| Content | Where to edit |
| --- | --- |
| Site title and dedication | `settings` |
| Three years and their memories | `chapters[].memories` |
| Song names, artist, listen URL | `songs` |
| Cinema videos and cover images | `films` |
| The four envelopes and secret P.S. | `letters` |
| Final love letter | `finale` |
| Demo photographs and memory image fallback | `demo` in `src/App.jsx` |
| Layout, colors, fonts, textures and motion | `src/styles.css` |

### Replacing a photo

In `src/content.js`, set each memory's `image` to a valid, accessible URL, e.g. `image: "/media/my-memory.webp"` **only when the site is secured and the photo is not private**. For personal media, prefer an authenticated asset endpoint backed by private Cloudflare R2, then reference those protected URLs. For now, blank `image` values use illustrative photos, with a **SAMPLE PHOTO** label.

### Adding music

Set `songs[].url` to a legally available Spotify, YouTube Music, or similar share link. The soundtrack intentionally **opens that link** rather than pretending to stream audio or hosting copyrighted songs. Playback is controlled by the music provider.

### Adding videos

Set `films[].src` to an accessible video URL and optionally `films[].poster` to a poster image. Video plays in a modal with native controls only after the visitor opens it. Empty `src` displays an editable placeholder.

### Editing letters

Update `letters[].body` (array of paragraphs), `letters[].ps`, and `finale.letter`. These sample letters are intentionally generic.

## Design decisions

- Scroll-first single-column story on mobile; tasteful two-column memory grids on large screens
- Cinematic hero and finale, warm torn-paper sections, Polaroid photographs, handwritten accents
- Responsive tap targets, in-page navigation, smooth transitions, reduced-motion support
- Gently falling roses that speed up with downward scrolling and rise with upward scrolling; hidden when reduced motion is preferred
- Interactive hidden confessions, accessible modal close buttons and Escape handling
- Image lazy loading except the first hero image and graceful media fallbacks

## Safety and privacy

**This repository was public when the redesign was committed.** Never add identifiable or intimate photographs, original private letters, personal videos or secrets to public Git history. A password screen in React does **not** protect asset URLs or bundle content. Before personalizing: change repository visibility if desired, configure private media storage, and restrict the deployed website with Cloudflare Access or another server-side protection layer. Deleting a sensitive file from Git HEAD will not erase all historical copies.

## Validation

Run the production build and the browser suite against Cloudflare's local Workers runtime:

```bash
npx playwright install chromium
npm test
```

On Linux, `npx playwright install --with-deps chromium` can install the browser's system dependencies too. In a cloud environment with Chromium already installed, skip the browser download and use:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

The suite checks mobile and desktop layouts, production asset delivery and caching, the single-page app fallback, chapter links and reloads, memory notes, all four letter dialogs and their P.S. toggles, the finale, cinema placeholders, falling roses and scroll direction, reduced motion, and JavaScript errors. It deliberately blocks optional external images and fonts to check graceful fallback behavior. Personal song links and video playback require your own media in `src/content.js` and are not covered by placeholder tests.

GitHub Actions installs with `npm ci`, builds the site, runs this suite, and uploads the successful `dist/` build as the `anniversary-site` artifact. This workflow validates the site; Cloudflare's Git integration handles deployment. Inspect the real Cloudflare deployment log and test on a phone before sharing the final site.
