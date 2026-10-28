# Three Years, Still You ♡

A mobile-first, scroll-driven cinematic anniversary website: sunset opening, three scrapbook chapters, interactive memories, soundtrack, love-letter vault, cinema and a grand finale.

## Preview & local development

```bash
npm install
npm run dev
npm run build
```

Cloudflare Pages settings: **Build command** `npm run build` · **Output directory** `dist` · **Root** `/`. GitHub pushes to `main` can trigger Cloudflare deployments if already connected.

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
- Interactive hidden confessions, accessible modal close buttons and Escape handling
- Image lazy loading except the first hero image and graceful media fallbacks

## Safety and privacy

**This repository was public when the redesign was committed.** Never add identifiable or intimate photographs, original private letters, personal videos or secrets to public Git history. A password screen in React does **not** protect asset URLs or bundle content. Before personalizing: change repository visibility if desired, configure private media storage, and restrict the deployed website with Cloudflare Access or another server-side protection layer. Deleting a sensitive file from Git HEAD will not erase all historical copies.

## Validation

Run `npm run build` to validate JSX and bundling. A GitHub Actions build workflow is included for pushes and pull requests. Inspect the Cloudflare build log and test on a real phone before revealing the site to your partner.
