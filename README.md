# Three Years, Still You ♡

A cinematic, mobile-first anniversary website celebrating three years of memories, little jokes, favorite songs, love letters and the next chapter.

## Getting started

```bash
npm install
npm run dev
npm run build
```

This is a React + Vite application. Cloudflare Pages build command: `npm run build`. Output directory: `dist`.

## Customize

Edit `src/content.js` to replace all sample memories, letter copy, song links, film sources, and finale text. Dates and photographs are intentionally placeholders. Change the color palette and cinematic styling in `src/styles.css`.

**Privacy:** This repository is public at the time of initial development. Do not commit real personal photos, private letters, private video links, or identifying data to it. Even after changing GitHub visibility, previously published history may persist elsewhere. Consider private Cloudflare R2 with authenticated Worker access before uploading sensitive content.

## Current features

- Responsive cinematic prologue, chapter navigation, three story acts, nine editable memory cards
- Playful hidden confessions, soundtrack link list, film gallery with video modal
- Four interactive letters with personal P.S. reveals
- Closing scene, final love letter and story replay
- No autoplay; reduced-motion CSS; keyboard close for letters

## Remaining enhancements

- Upload approved photographs and videos to protected storage and replace placeholders
- Connect authorized music playback and remove nonfunctional local transport controls
- Add focus trapping and focus restoration to modals, improve browser testing
- Run local build and mobile Playwright checks in an environment with Node access
- Set up private deployment / Cloudflare Access for your intended recipient

## Hosting

Connect this repository in Cloudflare Pages, set framework preset **Vite**, build `npm run build`, output `dist`. Restrict site and media access before publishing personal memories.
