# Three Years, Still You ♡

A mobile-first, scroll-driven cinematic anniversary website: lakeside opening, three scrapbook chapters, interactive memories, soundtrack, love-letter vault, cinema and a grand finale.

The opening shows only the hero and **Begin Our Story**. That click starts Canon in D, sends Polaroid photographs outward, and unlocks the scrollable scrapbook. Reduced motion skips the large burst. The story opens at the overview, or at the requested chapter for a section link; a reload returns to the opening cover.

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

The normal development workflow is to validate each change, commit it, and push it to GitHub `main`. Cloudflare automatically builds and deploys that update through its Git integration. For a direct deployment with the intended Cloudflare account already authenticated, `npm run deploy` is also available. The browser suite uses Cloudflare's local Workers runtime; local tests do not publish the site.

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

All personal stories, chapter text, letters, music players and videos are in **`src/content.js`**. The cover, year-by-year photographs, camera-roll snapshots, and favorite tree use the supplied photos. The story text and letters remain editable sample copy. Canon in D is generated in the browser, and favorite songs play in embedded Spotify players within the page.

| Content | Where to edit |
| --- | --- |
| Site title and dedication | `settings` |
| Opening photo, alt text, and crop | `settings.heroImage`, `settings.heroImageAlt`, `settings.heroImagePosition` |
| Separate finale background and crop | `settings.finaleImage`, `settings.finaleImageAlt`, `settings.finaleImagePosition` |
| Days together and calendar timezone | `settings.relationshipStartDate`, `settings.timeZone` |
| Seal initials and final signature | `settings.monogram`, `settings.signature` |
| Three years and their memories | `chapters[].memories` |
| Short pauses between the years | `memoryInterludes` |
| Separate overview Polaroid image | `chapters[].overviewPhoto` |
| Separate chapter introduction photo | `chapters[].coverPhoto` |
| Extra year-two and year-three strip/snapshot photos | `chapters[].extraPhotos`, `chapters[].keepsakeIds` |
| Camera-roll Polaroids tucked into each year | `looseSnapshots` |
| Favorite tree photo, crop, caption, and note | `favoriteTree` |
| Song names, artist, and Spotify track ID | `songs` |
| Cinema videos and cover images | `films` |
| The four envelopes and secret P.S. | `letters` |
| Final love letter | `finale` |
| Tulip/sunflower bouquet illustration | `src/FlowerBouquet.jsx` |
| Scroll-triggered butterfly flights | `src/ScrollButterflies.jsx` |
| Opening photo burst | `src/StoryOpening.jsx` |
| Canon in D arrangement and playback | `src/canonScore.js`, `src/canonPlayer.js` |
| Demo photographs and memory image fallback | `demo` in `src/App.jsx` |
| Layout, colors, fonts, textures and motion | `src/styles.css` and the feature CSS files imported by `src/main.jsx` |

### Replacing a photo

The opening uses the supplied lakeside cover photo in `settings.heroImage`; the finale has its own nighttime tree photograph in `settings.finaleImage`. Their alt text and crop positions are configured separately. An empty finale image falls back to the opening image. The opening adds a warm tint, vignette, and fine film texture.

All 26 supplied photographs are used: the 16-photo ZIP, the separately uploaded tree, the newer first-meet photograph from GitHub, and all eight pictures in `8pictures.zip`. Browser-ready copies are in `public/media/photos/`, converted to WebP with a maximum edge of 1600 pixels, sRGB color, and embedded metadata removed. Originals stay outside the repository. The first-year memories read **Our First Meet → Our First Monthsary → Our First Anniversary**. The first-meet photograph remains intact, and the dressed-up mirror photograph from the original year-one cover is reserved for the anniversary card. The former third-card photo appears in the year-one overview Polaroid. The chapter introduction, later-year overview cards, photo strip, paired snapshots, cinema poster, and finale each have a separate image; the eighth extra photograph has its own camera-roll Polaroid.

Every permanent image placement is unique: 27 placements use 26 photographs and one video-frame poster. The opening animation and the 20-photo album remain alternate views of the corresponding scrapbook photographs. A chapter cover already shown in a memory opens that memory without adding a duplicate album entry.

In `src/content.js`, set each memory's `image` to a valid, accessible URL, e.g. `image: "/media/my-memory.webp"` **only when the site is secured and the photo is not private**. For personal media, prefer an authenticated asset endpoint backed by private Cloudflare R2, then reference those protected URLs. For now, blank `image` values use illustrative photos, with a **SAMPLE PHOTO** label.

Memory photographs, chapter photos, the year-two photo-booth strip, and year-three paired snapshots open the shared album viewer. It uses the memory title, date label, description, and optional `memory.alt` text. The viewer supports previous/next buttons, left/right arrow keys, Escape, focus trapping, and focus restoration. Overview Polaroids keep their separate note-reveal interaction.

The **Our Favorite Tree** interlude follows year three, with the supplied nighttime photograph in a portrait frame and a ruled-paper note. The HEIC upload was converted to a 1200 × 1600 WebP at `public/media/photos/favorite-tree.webp`, with embedded metadata removed. The photo opens in the shared album. Set `favoriteTree.image` and `favoriteTree.imagePosition` to change the photo and crop; its caption and note are also editable in `src/content.js`. An empty image setting restores the labeled botanical illustration.

### Adding music

The favorite-song mixtape contains **K. — Cigarettes After Sex**, **From The Start — Laufey**, and **Itsumo — Dice & K9**, in that order. Their supplied Spotify track IDs are configured in `songs[].spotifyId`. Each Listen button opens a compact, 152-pixel Spotify player inside that song's row. The player loads only after the visitor opens it; selecting another song or closing the row removes the previous iframe, stopping its audio. The visitor presses play in Spotify's controls and can continue browsing the page. Spotify controls account requirements and full-track availability.

Canon in D is played directly by the browser from a gentle original instrumental arrangement of Pachelbel's public-domain composition, in `src/canonScore.js` and `src/canonPlayer.js`. It needs no external recording or audio download. Playback starts inside the Begin button's user gesture, never on page load. The floating music control pauses/resumes the player. Opening a favorite song pauses Canon; resuming Canon or opening a cinema film closes the song iframe to prevent overlapping audio. Opening an embedded cinema video pauses Canon as well.

### Adding videos

Both supplied YouTube Shorts are embedded in the cinema: **Our Pangasinan Trip** (`VXpxK8CZH1I`) and **A Dance Beneath Our Tree** (`9rVjghE4Sj8`). Each opens a portrait player that fits the viewport, with fullscreen support and a direct YouTube link. Opening either pauses Canon in D. The privacy-enhanced `youtube-nocookie.com` iframe loads only when a film is opened, and closing it removes the player. The dance poster comes from the uploaded clip; the original MOV and temporary MP4 are not bundled.

Set `films[].youtubeId` to a YouTube video ID, and optionally `films[].poster` and `films[].posterAlt` to a poster and description. A film without `youtubeId` can instead use an accessible MP4 URL in `films[].src`, including a public Cloudflare R2 URL. Direct videos open paused with native controls and inline playback; starting playback pauses Canon in D. A film with neither source displays a placeholder.

### Editing letters

Update `letters[].body` (array of paragraphs), `letters[].ps`, and `finale.letter`. These sample letters are intentionally generic.

The seals and final-letter signature use **R. & D.**, configured by `settings.monogram` and `settings.signature`. An empty monogram falls back to the heart seal; an empty signature uses the monogram beneath the existing `finale.signature` closing line.

### Anniversary counter

The relationship start date is **November 1, 2023**, stored as `settings.relationshipStartDate: '2023-11-01'`. The counter counts elapsed calendar days in `Asia/Manila`, includes leap days, and updates each minute and when the page becomes visible again. A missing, invalid, or future date shows “Three years & counting” rather than an invented number.

## Design decisions

- Photos drift gently inside their frames as the story scrolls; chapter scenery moves at a different depth. Short interludes give each year room to settle before the next begins. Chapter headings, scrapbook photos and captions, and the final promise and envelope arrive in a soft sequence. Reduced motion shows this content immediately and disables photo/scenery movement, including when the preference changes while reading.
- Scroll-first single-column story on mobile; tasteful two-column memory grids on large screens
- Cinematic hero and finale, warm torn-paper sections, Polaroid photographs, handwritten accents
- Responsive tap targets, in-page navigation, smooth transitions, reduced-motion support
- Gently falling roses with a capped downward scroll boost (at most 1.6 times their resting speed) that fades smoothly after scrolling; upward scrolling still lifts the roses, and reduced motion hides the effect
- Scrolling launches a few softly colored butterflies across the viewport; flights finish naturally, stop when the page is hidden, and are disabled for reduced motion
- Confessions unfold from taped paper notes with handwritten headings, ruled pages, wax heart stamps, and cream/blush/sage variations; keyboard and touch interaction remain accessible
- Accessible modal close buttons and Escape handling, with stable scrollbar space and reading-position restoration when overlays open and close; dialog surfaces remain opaque while a separate backdrop fades, and portals keep overlays above decorative page layers
- Polaroids lift and reveal handwritten notes with hover, keyboard, or touch; note space stays reserved so surrounding content does not shift, and a separate link opens each chapter
- Botanical rose corners and handwritten memory labels carry the scrapbook theme through the chapters
- Letters open with an unfolding envelope, lifted wax seal, and sliding paper; reduced motion skips the sequence
- The finale gradually warms its lighting as it enters view, with an extra glow around the last letter
- A closed envelope sealed with R. & D. replaces the finale button; opening it reveals the final message and a bouquet of her favorite tulips and sunflowers, with small daisies and greenery
- The botanical bouquet has layered tulip petals, double-ring sunflower petals and seeded centers, eucalyptus, daisies, baby’s breath, folded cream tissue and kraft paper, a rose silk bow, and a monogram gift tag. The bouquet sways and its blooms move subtly; reduced motion disables these animations. It rests diagonally across the letter's lower-right edge. The complete final letter, signature, and bouquet fit the visible viewport without scrolling, adjusting to mobile browser bars and rotation; the close button keeps its full touch size
- The hero-only cover opens with 45 outward-flying photo cards in five overlapping waves, ten flowers, ten hearts, three small fireworks, and user-initiated Canon in D. The cards reuse the album photographs; the opening still takes about 1.35 seconds. Reduced motion skips the burst. Play/pause remains available while reading.
- The soundtrack is presented as a cassette sleeve and handwritten tracklist for the three favorite songs; each opens an inline Spotify player, while the floating Canon control manages the background arrangement
- Cinema cards use perforated ticket layouts, filmstrip previews, and keepsake numbers
- Year two has a vertical photo-booth strip; year three has paired, tilted snapshots
- Memory photos open in a paper-framed album with captions and accessible navigation
- Ribbon bookmarks follow the current year and link between chapters; mobile uses a compact bottom ribbon bar
- R. & D. monograms personalize the wax seals and final signature
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

On CPU-limited cloud machines, run `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test -- --workers=1` to avoid contention between browsers during the animation checks.

The suite checks mobile and desktop layouts, production asset delivery and caching, the single-page app fallback, chapter links and reloads, memory notes, Polaroid interactions, photo album navigation/focus/wrapping, photo-strip and camera-roll snapshot entry points, active chapter ribbons, monograms/signatures, letter animation and keyboard focus, finale lighting, both YouTube embed destinations and music pausing, falling roses and scroll direction, reduced motion, the anniversary counter across Manila midnight, and JavaScript errors. Date arithmetic also has Node.js tests for leap days, timezone boundaries, and invalid dates. Browser tests block optional external requests while verifying local personal images still load. A local iframe fixture verifies on-demand embeds, portrait/landscape sizing, focus, and cleanup without depending on YouTube's live player. Actual YouTube and Spotify playback is controlled by those providers.

GitHub Actions installs with `npm ci`, builds the site, runs this suite, and uploads the successful `dist/` build as the `anniversary-site` artifact. This workflow validates the site; Cloudflare's Git integration handles deployment. Inspect the real Cloudflare deployment log and test on a phone before sharing the final site.

Opening tests verify that the cover cannot scroll, the story remains hidden until Begin is clicked, photos actually move outward, and the audio graph produces a signal only after that gesture. They also check pause/resume without creating a second player. Other interaction tests enter through the reduced-motion opening and pause music during their setup.
