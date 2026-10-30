import { test as base, expect } from '@playwright/test';

async function unlockStory(page, { resetScroll = true } = {}) {
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  // The opening has its own animation/audio coverage. Enter quietly for the
  // other feature tests, without leaving scroll momentum in the decorations.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Begin Our Story' }).click();
  await expect(page.locator('.site')).toHaveAttribute('data-story-ready', 'true');
  const music = page.locator('.background-music-toggle');
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await music.click();
  await expect(music).toHaveAttribute('aria-pressed', 'false');
  if (resetScroll) await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
}

async function enterStory(page) {
  await page.goto('/');
  await unlockStory(page);
}

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // The story must remain usable when optional remote images/fonts fail.
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin === 'http://127.0.0.1:8788') {
        return route.continue();
      }
      return route.abort();
    });
    await use(page);
    expect(errors, 'Uncaught JavaScript errors').toEqual([]);
  },
});

test('Cloudflare serves the built page, bundles, cache headers, and SPA fallback', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('<div id="root"></div>');
  expect(html).not.toContain('/src/main.jsx');

  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match => match[1]);
  expect(assets.some(asset => asset.endsWith('.js'))).toBe(true);
  expect(assets.some(asset => asset.endsWith('.css'))).toBe(true);
  for (const asset of assets) {
    const file = await request.get(asset);
    expect(file.status(), asset).toBe(200);
    expect(file.headers()['content-type']).toMatch(asset.endsWith('.js') ? /javascript/ : /text\/css/);
    expect(file.headers()['cache-control']).toContain('max-age=31536000');
    expect(file.headers()['cache-control']).toContain('immutable');
  }

  const fallback = await request.get('/shared-story');
  expect(fallback.status()).toBe(200);
  expect(await fallback.text()).toBe(html);
});

test('chapter navigation survives a reload', async ({ page }) => {
  await enterStory(page);
  await expect(page.getByRole('heading', { name: 'Three Years, Still You.' })).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const navigation = page.getByRole('navigation', { name: 'Story navigation' });
  await expect(navigation.getByRole('link')).toHaveCount(9);
  for (const link of await navigation.getByRole('link').all()) {
    const target = await link.getAttribute('href');
    await expect(page.locator(target)).toHaveCount(1);
  }
  await navigation.getByRole('link', { name: 'Our favorite tree' }).click();
  await expect(page).toHaveURL(/#favorite-tree$/);
  await expect(page.getByRole('region', { name: 'Our Favorite Tree' }).getByRole('heading')).toBeInViewport();
  const tree = page.getByRole('region', { name: 'Our Favorite Tree' });
  const treePhoto = tree.getByRole('img', { name: /Our favorite tree at night/ });
  await expect(treePhoto).toBeVisible();
  await expect.poll(() => treePhoto.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const treeOpener = tree.getByRole('button', { name: /^View photo:/ });
  await treeOpener.click();
  const album = page.getByRole('dialog', { name: 'Our photo album' });
  await expect(album.getByRole('heading')).toHaveText('Our Favorite Tree');
  await expect(album.getByRole('status')).toHaveText('Photo 20 of 20');
  await expect(album.locator('.sample-tag')).toHaveCount(0);
  await expect.poll(() => album.locator('.album-photo img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(album).toHaveCount(0);
  await expect(treeOpener).toBeFocused();
  await page.getByRole('link', { name: 'A song for the way this feels' }).click();
  await expect(page).toHaveURL(/#soundtrack$/);
  await expect(page.locator('#soundtrack h2')).toBeInViewport();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await navigation.getByRole('link', { name: 'Year three' }).click();
  await expect(page).toHaveURL(/#chapter-three$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  await page.reload();
  await unlockStory(page, { resetScroll: false });
  await expect(page.locator('#chapter-three').getByRole('heading', { name: 'Still You', exact: true })).toBeVisible();
});

test('memory notes expand and fold away', async ({ page }) => {
  await enterStory(page);
  await expect(page.locator('.memory-card')).toHaveCount(9);
  await expect(page.locator('#chapter-one .memory-card h3')).toHaveText(['Our First Meet', 'Our First Monthsary', 'Our First Anniversary']);
  await expect(page.locator('#chapter-one .memory-card').nth(2).locator('img')).toHaveAttribute('src', '/media/photos/year-one-together.webp');
  const memory = page.locator('.memory-card').first();
  const toggle = memory.locator('.confession-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const note = memory.getByRole('region');
  await expect(note).toContainText('funny confession');
  await expect(note).toHaveAttribute('id', await toggle.getAttribute('aria-controls'));
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(note).toHaveCount(0);
  const darkMemory = page.locator('#chapter-two .memory-card').first();
  const darkToggle = darkMemory.locator('.confession-toggle');
  await darkToggle.focus();
  await darkToggle.press('Enter');
  await expect(darkToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(darkMemory.getByRole('region')).toBeVisible();
  await expect(memory.getByRole('region')).toHaveCount(0);
  await darkToggle.press('Enter');
  await expect(darkMemory.getByRole('region')).toHaveCount(0);
});

test('every letter and the finale open, reveal their P.S., and close', async ({ page }) => {
  await enterStory(page);
  const titles = ['When You Miss Me', 'When You’re Sad', 'When We Disagree', 'Just Because'];
  for (const title of titles) {
    const envelope = page.getByRole('button', { name: new RegExp(title) });
    await envelope.click();
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.letter-seal')).toHaveText('R. & D.');
    await expect(dialog.getByRole('button', { name: 'Close letter' })).toBeFocused();
    await dialog.getByRole('button', { name: 'P.S. One more thing...' }).click();
    await expect(dialog.locator('.postscript')).toBeVisible();
    await dialog.getByRole('button', { name: 'Hide P.S.' }).click();
    await expect(dialog.locator('.postscript')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(envelope).toBeFocused();
  }
  await page.getByRole('button', { name: 'Open our final letter' }).click();
  const finale = page.getByRole('dialog', { name: 'My Favorite Story Is Us' });
  await expect(finale).toContainText('Happy third anniversary.');
  await expect(finale.locator('.personal-signature strong')).toHaveText('R. & D.');
  await finale.getByRole('button', { name: 'Close letter' }).click();
  await expect(finale).toHaveCount(0);
});

test('both YouTube Shorts open on demand, fit the screen, and pause background music', async ({ page }) => {
  const embedRequests = [];
  // Exercise our dialogs without depending on YouTube's remote player or ads.
  await page.route('https://www.youtube-nocookie.com/embed/**', route => {
    embedRequests.push(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Video fixture</title><button>Play video</button>' });
  });
  await enterStory(page);
  expect(embedRequests).toEqual([]);
  await expect(page.locator('iframe')).toHaveCount(0);
  const music = page.locator('.background-music-toggle');
  for (const [title, id] of [['Our Pangasinan Trip', 'VXpxK8CZH1I'], ['A Dance Beneath Our Tree', '9rVjghE4Sj8']]) {
    await music.click();
    await expect(music).toHaveAttribute('aria-pressed', 'true');
    const opener = page.getByRole('button', { name: new RegExp(title) });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(music).toHaveAttribute('aria-pressed', 'false');
    const frame = dialog.locator('iframe');
    await expect(frame).toHaveAttribute('title', title);
    await expect(frame).toHaveAttribute('src', `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`);
    await expect.poll(() => embedRequests.some(url => url.includes(`/embed/${id}?`))).toBe(true);
    await expect(frame).toBeInViewport({ ratio: .99 });
    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(frame).toBeInViewport({ ratio: .99 });
    await expect(dialog.getByRole('button', { name: 'Close video' })).toBeInViewport();
    await page.setViewportSize(originalViewport);
    const watch = dialog.getByRole('link', { name: 'Watch on YouTube' });
    await expect(watch).toHaveAttribute('href', `https://www.youtube.com/shorts/${id}`);
    await page.keyboard.press('Shift+Tab');
    await expect(watch).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Close video' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Close video' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(opener).toBeFocused();
  }
});

test('favorite songs play inside the page with one player and no overlapping background music', async ({ page }) => {
  const requests = [];
  await page.route('https://open.spotify.com/embed/track/**', route => {
    requests.push(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Spotify fixture</title><button>Play song</button>' });
  });
  await enterStory(page);
  expect(requests).toEqual([]);
  const originalURL = page.url();
  const music = page.locator('.background-music-toggle');
  await music.click();
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  for (const [title, artist, id] of [
    ['K.', 'Cigarettes After Sex', '2xGjfbXZnI8uQDhukoQURQ'],
    ['From The Start', 'Laufey', '43iIQbw5hx986dUEZbr3eN'],
    ['Itsumo', 'Dice & K9', '1rPjfsagVj3yZGXglA2iP3'],
  ]) {
    const button = page.getByRole('button', { name: `Listen to ${title} by ${artist}`, exact: true });
    await button.click();
    await expect(music).toHaveAttribute('aria-pressed', 'false');
    const player = page.getByRole('region', { name: `${title} player`, exact: true });
    await expect(page.locator('.song-embed iframe')).toHaveCount(1);
    await expect(player.locator('iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/track/${id}?theme=0`);
    await expect(player.locator('iframe')).toHaveAttribute('title', `${title} by ${artist} — Spotify player`);
    await expect.poll(() => requests.some(url => url.includes(id))).toBe(true);
    await expect(player.locator('iframe')).toBeInViewport({ ratio: .99 });
    await expect(page.getByRole('button', { name: `Close ${title} player`, exact: true })).toHaveAttribute('aria-expanded', 'true');
    expect(page.url()).toBe(originalURL);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'Close Itsumo player', exact: true }).click();
  await expect(page.locator('.song-embed iframe')).toHaveCount(0);
  const first = page.getByRole('button', { name: 'Listen to K. by Cigarettes After Sex', exact: true });
  await first.click();
  await music.click();
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.song-embed iframe')).toHaveCount(0);
  await first.click();
  await page.getByRole('button', { name: /Our Pangasinan Trip/ }).click();
  await expect(page.getByRole('dialog', { name: 'Our Pangasinan Trip' })).toBeVisible();
  await expect(page.locator('.song-embed iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close video' }).click();
  expect(page.context().pages()).toHaveLength(1);
});

test('the story works without remote media and fits the viewport', async ({ page }) => {
  await enterStory(page);
  await expect(page.locator('.hero-photo img')).toBeVisible();
  await expect.poll(() => page.locator('.hero-photo img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.sample-tag')).toHaveCount(0);
  const photos = page.locator('.site .photo > img');
  await expect(photos).toHaveCount(27);
  const sources = await photos.evaluateAll(images => images.map(image => image.getAttribute('src')));
  expect(new Set(sources).size, 'Every permanent photo placement has its own image').toBe(sources.length);
  const decoded = await page.evaluate(urls => Promise.all(urls.map(url => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth > 0);
    image.onerror = () => resolve(false);
    image.src = url;
  }))), sources);
  expect(decoded.every(Boolean), 'Every distinct photograph loads from Cloudflare').toBe(true);
  for (const id of ['overview', 'chapter-one', 'chapter-two', 'chapter-three', 'favorite-tree', 'soundtrack', 'letters', 'cinema', 'finale']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id} h2`).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('roses fall gently and follow the direction of scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enterStory(page);
  const layer = page.locator('.falling-roses');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await expect(layer).toHaveCSS('pointer-events', 'none');

  // Measure actual movement over time, rather than animation implementation details.
  const measureSpeed = destination => page.evaluate(async destination => {
    const rose = document.querySelector('.falling-rose');
    const position = () => new DOMMatrixReadOnly(getComputedStyle(rose).transform).m42;
    const startY = position();
    const startTime = performance.now();
    if (destination !== null) window.scrollTo({ top: destination, behavior: 'instant' });
    await new Promise(resolve => setTimeout(resolve, 300));
    return (position() - startY) / ((performance.now() - startTime) / 1000);
  }, destination);

  const restingSpeed = await measureSpeed(null);
  expect(restingSpeed).toBeGreaterThan(0);
  const downwardSpeed = await measureSpeed(180);
  expect(downwardSpeed).toBeGreaterThan(restingSpeed * 1.05);
  expect(downwardSpeed).toBeLessThan(restingSpeed * 1.9);
  const upwardSpeed = await measureSpeed(40);
  expect(upwardSpeed).toBeLessThan(0);
  expect(await measureSpeed(null)).toBeGreaterThan(0);
  const fastScrollSpeed = await measureSpeed(1800);
  expect(fastScrollSpeed).toBeGreaterThan(restingSpeed * 1.05);
  expect(fastScrollSpeed).toBeLessThan(restingSpeed * 1.9);

  // The decoration must not intercept the controls underneath it.
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Story navigation' })).toBeVisible();
});

test('roses respect reduced motion and respond to preference changes', async ({ page }) => {
  await enterStory(page);
  const layer = page.locator('.falling-roses');
  await expect(layer).toBeHidden();
  await expect(page.locator('.scroll-butterflies')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(layer).toBeVisible();
  await expect(page.locator('.scroll-butterflies')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toBeHidden();
  await expect(page.locator('.scroll-butterflies')).toBeHidden();
});

test('the anniversary counter uses the supplied date and updates at Manila midnight', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-29T04:00:00Z'));
  await enterStory(page);
  const counter = page.getByRole('group', { name: 'Our time together' });
  await expect(counter).toContainText('1,093 days together');
  await expect(counter.locator('time')).toHaveAttribute('datetime', '2023-11-01');
  await page.clock.setFixedTime(new Date('2026-10-29T16:00:01Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(counter).toContainText('1,094 days together');
});

test('Polaroid notes work with touch, keyboard, and mouse', async ({ page }, testInfo) => {
  await enterStory(page);
  const toggle = page.getByRole('button', { name: 'A note from year 1' });
  const layoutPositions = () => page.evaluate(() => {
    // Measure document layout, independently of scrolling and decorative tilts.
    return [...document.querySelectorAll('.overview-link, .chapter-open, .overview-quote, #chapter-one')].map(node => {
      let top = 0;
      for (let current = node; current; current = current.offsetParent) top += current.offsetTop;
      return top;
    });
  });
  await toggle.scrollIntoViewIfNeeded();
  const initialLayout = await layoutPositions();
  const expectStableLayout = async () => {
    const positions = await layoutPositions();
    // offsetTop may round differently when a transformed card becomes an offset parent.
    positions.forEach((position, index) => expect(Math.abs(position - initialLayout[index])).toBeLessThanOrEqual(1));
  };
  if (testInfo.project.name === 'mobile') {
    await toggle.tap();
  } else {
    await toggle.focus();
    await toggle.press('Enter');
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#polaroid-note-one')).toBeVisible();
  await expectStableLayout();
  if (testInfo.project.name === 'mobile') {
    await toggle.tap();
  } else {
    await toggle.press('Enter');
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#polaroid-note-one')).toBeHidden();
  await expectStableLayout();
  if (testInfo.project.name === 'desktop') {
    for (const year of [1, 2, 3]) {
      const yearToggle = page.getByRole('button', { name: `A note from year ${year}` });
      await yearToggle.hover();
      const note = page.locator(`#${await yearToggle.getAttribute('aria-controls')}`);
      await expect(note).toBeVisible();
      await expectStableLayout();
      await page.mouse.move(0, 0);
      await expect(note).toBeHidden();
      await expectStableLayout();
    }
  }
  await page.getByRole('link', { name: 'Turn to year 1' }).click();
  await expect(page).toHaveURL(/#chapter-one$/);
});

test('the envelope unfolds and the opened letter keeps keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enterStory(page);
  const envelope = page.getByRole('button', { name: /When You Miss Me/ });
  await envelope.click();
  const dialog = page.getByRole('dialog', { name: 'When You Miss Me' });
  await expect(dialog.locator('.letter-modal')).toHaveCSS('opacity', '1');
  await expect(dialog.locator('.letter-modal')).toHaveCSS('clip-path', 'inset(0%)');
  await expect(dialog.locator('.wax-seal')).toHaveCSS('opacity', '0');
  await expect.poll(() => dialog.locator('.opening-envelope-flap').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m22)).toBeLessThan(-0.98);
  const close = dialog.getByRole('button', { name: 'Close letter' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  const postscript = dialog.getByRole('button', { name: 'P.S. One more thing...' });
  await expect(postscript).toBeFocused();
  await postscript.click();
  await expect(dialog.getByRole('button', { name: 'Hide P.S.' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(envelope).toBeFocused();
});

test('the finale lights warm up as the final message appears', async ({ page }) => {
  await enterStory(page);
  const finale = page.locator('#finale');
  await finale.scrollIntoViewIfNeeded();
  await expect(finale).toHaveClass(/has-arrived/);
  await expect(finale.locator('.finale-lights')).toHaveCSS('opacity', '1');
  await expect(finale.locator('.finale-promise')).toHaveText('I would still choose you.');
  await page.getByRole('button', { name: 'Open our final letter' }).click();
  await expect(finale).toHaveClass(/has-letter-open/);
  await page.getByRole('button', { name: 'Close letter' }).click();
  await expect(finale).not.toHaveClass(/has-letter-open/);
});

test('the photo album navigates, traps focus, and returns to its opener', async ({ page }) => {
  await enterStory(page);
  await expect(page.locator('#overview .polaroid img').first()).toHaveAttribute('src', '/media/photos/year-one-smile.webp');
  await expect(page.locator('#chapter-one .chapter-hero-image img')).toHaveAttribute('src', '/media/photos/year-one-garden-embrace.webp');
  await expect(page.locator('#chapter-one .memory-card img').first()).toHaveAttribute('src', '/media/photos/first-hello.webp');
  const opener = page.locator('#chapter-one .memory-card').first().getByRole('button', { name: /^View photo:/ });
  await opener.click();
  const album = page.getByRole('dialog', { name: 'Our photo album' });
  const close = album.getByRole('button', { name: 'Close photo album' });
  await expect(album.getByRole('heading')).toHaveText('Our First Meet');
  await expect(album.getByRole('status')).toHaveText('Photo 1 of 20');
  await expect(close).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Shift+Tab');
  await expect(album.getByRole('button', { name: 'Next photo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await album.getByRole('button', { name: 'Next photo' }).click();
  await expect(album.getByRole('heading')).toHaveText('Our First Monthsary');
  await album.getByRole('button', { name: 'Next photo' }).click();
  await expect(album.getByRole('heading')).toHaveText('Our First Anniversary');
  await expect(album.locator('.album-photo img')).toHaveAttribute('src', '/media/photos/year-one-together.webp');
  await album.getByRole('button', { name: 'Previous photo' }).click();
  await expect(album.getByRole('heading')).toHaveText('Our First Monthsary');
  await album.getByRole('button', { name: 'Previous photo' }).click();
  await expect(album.getByRole('heading')).toHaveText('Our First Meet');
  await page.keyboard.press('ArrowLeft');
  await expect(album.getByRole('heading')).toHaveText('Our Favorite Tree');
  await expect(album.getByRole('status')).toHaveText('Photo 20 of 20');
  await page.keyboard.press('ArrowRight');
  await expect(album.getByRole('status')).toHaveText('Photo 1 of 20');
  await page.keyboard.press('Escape');
  await expect(album).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('photo strips and paired snapshots open the corresponding memory', async ({ page }, testInfo) => {
  await enterStory(page);
  const stripPhoto = page.locator('.photo-booth-strip .photo-open').first();
  if (testInfo.project.name === 'mobile') await stripPhoto.tap();
  else await stripPhoto.click();
  const album = page.getByRole('dialog', { name: 'Our photo album' });
  await expect(album.getByRole('heading')).toHaveText('A smile worth keeping');
  await expect(album.getByRole('status')).toHaveText('Photo 12 of 20');
  await album.getByRole('button', { name: 'Close photo album' }).click();
  await expect(album).toHaveCount(0);
  const pairedPhoto = page.locator('.snapshot-pair .photo-open').nth(1);
  if (testInfo.project.name === 'mobile') await pairedPhoto.tap();
  else await pairedPhoto.click();
  await expect(album.getByRole('heading')).toHaveText('At the movies, with you');
  await expect(album.getByRole('status')).toHaveText('Photo 14 of 20');
  await album.getByRole('button', { name: 'Close photo album' }).click();
  await expect(album).toHaveCount(0);
  await expect(pairedPhoto).toBeFocused();
  for (const title of ['One more smile to keep', 'You & me', 'Still my favorite view', 'A little closer']) {
    const keepsake = page.locator('.camera-roll-keepsake').filter({ hasText: title });
    await keepsake.locator('.photo-open').click();
    await expect(album.getByRole('heading')).toHaveText(title);
    await expect(album.locator('.sample-tag')).toHaveCount(0);
    await album.getByRole('button', { name: 'Close photo album' }).click();
    await expect(album).toHaveCount(0);
  }
});

test('ribbon bookmarks follow the chapter and navigate between years', async ({ page }) => {
  await enterStory(page);
  const bookmarks = page.getByRole('navigation', { name: 'Chapter bookmarks', includeHidden: true });
  await expect(bookmarks).toBeHidden();
  await page.locator('#chapter-one').scrollIntoViewIfNeeded();
  await expect(bookmarks).toBeVisible();
  await expect(bookmarks.getByRole('link', { name: 'Chapter 1: The Beginning' })).toHaveAttribute('aria-current', 'location');
  await bookmarks.getByRole('link', { name: 'Chapter 3: Still You' }).click();
  await expect(page).toHaveURL(/#chapter-three$/);
  await expect(bookmarks.getByRole('link', { name: 'Chapter 3: Still You' })).toHaveAttribute('aria-current', 'location');
  await page.locator('#chapter-two').scrollIntoViewIfNeeded();
  await expect(bookmarks.getByRole('link', { name: 'Chapter 2: Becoming Us' })).toHaveAttribute('aria-current', 'location');
  await page.locator('#finale').scrollIntoViewIfNeeded();
  await expect(bookmarks).toBeHidden();
});

test.describe('dialog background stability', () => {
  test('photo, letter, and cinema clicks preserve the background layout and reading position', async ({ page }) => {
    await enterStory(page);
    const background = () => page.evaluate(() => ({
      width: document.querySelector('.site').getBoundingClientRect().width,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    }));
    const cases = [
      [page.locator('#chapter-one .memory-card .photo-open').first(), 'Our photo album', 'Close photo album'],
      [page.getByRole('button', { name: /When You Miss Me/ }), 'When You Miss Me', 'Close letter'],
      [page.getByRole('button', { name: /Our Pangasinan Trip/ }), 'Our Pangasinan Trip', 'Close video'],
    ];
    for (const [opener, title, closeName] of cases) {
      await opener.scrollIntoViewIfNeeded();
      await opener.focus();
      // The browser can reposition a target while Playwright waits for it to
      // settle. Measure at pointerdown, immediately before the app opens it.
      await opener.evaluate(node => {
        delete window.__beforeDialogBackground;
        node.addEventListener('pointerdown', () => {
          window.__beforeDialogBackground = {
            width: document.querySelector('.site').getBoundingClientRect().width,
            scrollX: window.scrollX, scrollY: window.scrollY,
          };
        }, { once: true });
      });
      await opener.click();
      const before = await page.evaluate(() => window.__beforeDialogBackground);
      expect(before).toBeDefined();
      const dialog = page.getByRole('dialog', { name: title, exact: true });
      await expect(dialog).toBeVisible();
      await expect.poll(background).toEqual(before);
      await dialog.getByRole('button', { name: closeName }).click();
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expect.poll(background).toEqual(before);
    }
  });

  test('popup surfaces stay opaque above the page during opening animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await enterStory(page);
    const cases = [
      [page.locator('#chapter-one .memory-card .photo-open').first(), 'Our photo album', 'Close photo album', '.photo-album'],
      [page.getByRole('button', { name: /When You Miss Me/ }), 'When You Miss Me', 'Close letter', '.letter-modal'],
      [page.getByRole('button', { name: /Our Pangasinan Trip/ }), 'Our Pangasinan Trip', 'Close video', '.cinema-modal'],
      [page.getByRole('button', { name: 'Open our final letter' }), 'My Favorite Story Is Us', 'Close letter', '.letter-modal'],
    ];
    for (const [opener, title, closeName, surfaceSelector] of cases) {
      await opener.click();
      const dialog = page.getByRole('dialog', { name: title, exact: true });
      await expect(dialog).toBeVisible();
      const samples = await dialog.evaluate(async (node, selector) => {
        const surface = node.matches(selector) ? node : node.querySelector(selector);
        const samples = [];
        for (let frame = 0; frame < 10; frame++) {
          await new Promise(resolve => requestAnimationFrame(resolve));
          let opacity = 1;
          for (let current = surface; current; current = current.parentElement) opacity *= Number(getComputedStyle(current).opacity);
          samples.push(opacity);
        }
        return { samples, portaled: node.closest('.modal-shade').parentElement === document.body };
      }, surfaceSelector);
      expect(samples.portaled).toBe(true);
      samples.samples.forEach(opacity => expect(opacity).toBe(1));
      if (title === 'My Favorite Story Is Us') {
        expect(await dialog.locator('.bouquet-art').evaluate(node => node.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
      }
      await dialog.getByRole('button', { name: closeName }).click();
      await expect(dialog).toHaveCount(0);
    }
  });
});

test('scrolling launches butterflies that fly across without blocking controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enterStory(page);
  const layer = page.locator('.scroll-butterflies');
  const butterfly = layer.locator('.scroll-butterfly').first();
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await expect(layer).toHaveCSS('pointer-events', 'none');
  await expect(butterfly).toHaveCSS('opacity', '0');
  await page.evaluate(() => window.scrollTo({ top: 360, behavior: 'instant' }));
  await expect.poll(() => butterfly.evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThan(.08);
  const distance = await butterfly.evaluate(async node => {
    const position = () => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41;
    const start = position();
    await new Promise(resolve => setTimeout(resolve, 300));
    return position() - start;
  });
  expect(distance).toBeGreaterThan(5);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Story navigation' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toBeHidden();
});

test('the sealed final envelope reveals the letter and tulip/sunflower bouquet', async ({ page }) => {
  await enterStory(page);
  const envelope = page.getByRole('button', { name: 'Open our final letter' });
  await envelope.scrollIntoViewIfNeeded();
  await expect(envelope.locator('.final-envelope-stamp')).toHaveText('R. & D.');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await envelope.click();
  const dialog = page.getByRole('dialog', { name: 'My Favorite Story Is Us' });
  await expect(dialog).toContainText('Happy third anniversary.');
  await expect(dialog.locator('.personal-signature strong')).toHaveText('R. & D.');
  const bouquet = dialog.getByRole('img', { name: /pink tulips and golden sunflowers/ });
  await expect(dialog.locator('.fitted-letter-stage')).toHaveAttribute('data-ready', 'true');
  const originalViewport = page.viewportSize();
  // Nothing should need scrolling, including after browser chrome changes the
  // available height or the phone rotates while the letter is already open.
  for (const viewport of [originalViewport, { width: 320, height: 568 }, { width: 393, height: 650 }, { width: 320, height: 400 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => dialog.evaluate(node => {
      const viewport = window.visualViewport;
      const elements = [...node.querySelectorAll('.letter-modal, .personal-signature, .bouquet-art, .modal-close')];
      const fits = elements.every(element => {
        const rect = element.getBoundingClientRect();
        return rect.top >= viewport.offsetTop && rect.left >= viewport.offsetLeft
          && rect.bottom <= viewport.offsetTop + viewport.height + .5
          && rect.right <= viewport.offsetLeft + viewport.width + .5;
      });
      const backdrop = node.closest('.modal-shade');
      return fits && node.scrollHeight <= node.clientHeight + 1
        && backdrop.scrollHeight <= backdrop.clientHeight + 1
        && node.scrollTop === 0 && backdrop.scrollTop === 0;
    }), `Entire letter and bouquet fit ${viewport.width}×${viewport.height}`).toBe(true);
    await expect(bouquet).toBeInViewport({ ratio: .99 });
  }
  await page.setViewportSize(originalViewport);
  expect(await bouquet.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  const close = dialog.getByRole('button', { name: 'Close letter' });
  await expect(close).toBeInViewport();
  const closeSize = await close.boundingBox();
  expect(closeSize.width).toBeGreaterThanOrEqual(44);
  expect(closeSize.height).toBeGreaterThanOrEqual(44);
  await close.click();
  await expect(dialog).toHaveCount(0);
  await expect(envelope).toBeFocused();
});

test('the cover locks the story until Begin Our Story is clicked', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Three Years, Still You.' })).toBeVisible();
  await expect(page.getByRole('button')).toHaveCount(1);
  await expect(page.locator('#our-story')).toHaveCount(0);
  await expect(page.locator('.site-header')).toHaveCount(0);
  await expect(page.locator('.background-music')).toHaveCount(0);
  await page.mouse.wheel(0, 900);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await unlockStory(page);
  await expect(page.locator('#our-story')).toBeVisible();
  await expect(page.locator('.site-header')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
  await page.locator('#chapter-one').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test('Begin bursts the photos outward and starts real Canon in D audio from that gesture', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const NativeContext = window.AudioContext;
    window.__musicContexts = [];
    window.AudioContext = class extends NativeContext {
      constructor(...args) { super(...args); window.__musicContexts.push(this); }
    };
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (destination, ...args) {
      if (destination instanceof AudioDestinationNode) {
        const analyser = this.context.createAnalyser();
        connect.call(this, analyser);
        window.__musicAnalyser = analyser;
      }
      return connect.call(this, destination, ...args);
    };
  });
  await page.goto('/');
  expect(await page.evaluate(() => window.__musicContexts.length)).toBe(0);
  await page.getByRole('button', { name: 'Begin Our Story' }).click();
  await expect(page.locator('.site')).toHaveAttribute('data-story-state', 'bursting');
  await expect(page.locator('.story-burst-photo')).toHaveCount(9);
  await expect(page.locator('#our-story')).toHaveCount(0);
  const burstDistance = await page.locator('.story-burst-photo').first().evaluate(async node => {
    const position = () => new DOMMatrixReadOnly(getComputedStyle(node).transform);
    const start = position();
    await new Promise(resolve => setTimeout(resolve, 180));
    const end = position();
    return Math.hypot(end.m41 - start.m41, end.m42 - start.m42);
  });
  expect(burstDistance).toBeGreaterThan(20);
  await expect.poll(() => page.evaluate(() => {
    if (!window.__musicAnalyser) return 0;
    const samples = new Float32Array(window.__musicAnalyser.fftSize);
    window.__musicAnalyser.getFloatTimeDomainData(samples);
    return Math.max(...samples.map(Math.abs));
  })).toBeGreaterThan(.0001);
  await expect(page.locator('.site')).toHaveAttribute('data-story-ready', 'true');
  const player = page.locator('.background-music-toggle');
  await expect(player).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.__musicContexts.length)).toBe(1);
  await player.click();
  await expect(player).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => page.evaluate(() => window.__musicContexts[0].state)).toBe('suspended');
  await player.click();
  await expect(player).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.__musicContexts[0].state)).toBe('running');
  expect(await page.evaluate(() => window.__musicContexts.length)).toBe(1);
  await player.click();
});
