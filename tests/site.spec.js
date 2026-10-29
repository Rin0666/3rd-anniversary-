import { test as base, expect } from '@playwright/test';

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
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Three Years, Still You.' })).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const navigation = page.getByRole('navigation', { name: 'Story navigation' });
  await expect(navigation.getByRole('link')).toHaveCount(8);
  for (const link of await navigation.getByRole('link').all()) {
    const target = await link.getAttribute('href');
    await expect(page.locator(target)).toHaveCount(1);
  }
  await navigation.getByRole('link', { name: 'Year three' }).click();
  await expect(page).toHaveURL(/#chapter-three$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  await page.reload();
  await expect(page.locator('#chapter-three').getByRole('heading', { name: 'Still You', exact: true })).toBeVisible();
});

test('memory notes expand and fold away', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.memory-card')).toHaveCount(9);
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
  await page.goto('/');
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
  await page.getByRole('button', { name: "Here's to Forever" }).click();
  const finale = page.getByRole('dialog', { name: 'My Favorite Story Is Us' });
  await expect(finale).toContainText('Happy third anniversary.');
  await expect(finale.locator('.personal-signature strong')).toHaveText('R. & D.');
  await finale.getByRole('button', { name: 'Close letter' }).click();
  await expect(finale).toHaveCount(0);
});

test('both cinema placeholders open and close', async ({ page }) => {
  await page.goto('/');
  for (const title of ['Our Little Movie', 'The Bloopers']) {
    await page.getByRole('button', { name: new RegExp(title) }).click();
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('This little film is still waiting for its first scene.');
    await dialog.getByRole('button', { name: 'Close video' }).click();
    await expect(dialog).toHaveCount(0);
  }
});

test('the story works without remote media and fits the viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-photo .photo-fallback')).toBeVisible();
  for (const id of ['overview', 'chapter-one', 'chapter-two', 'chapter-three', 'soundtrack', 'letters', 'cinema', 'finale']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id} h2`).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('roses fall gently and follow the direction of scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
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
  expect(downwardSpeed).toBeGreaterThan(restingSpeed * 2);
  const upwardSpeed = await measureSpeed(40);
  expect(upwardSpeed).toBeLessThan(0);
  expect(await measureSpeed(null)).toBeGreaterThan(0);

  // The decoration must not intercept the controls underneath it.
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Story navigation' })).toBeVisible();
});

test('roses respect reduced motion and respond to preference changes', async ({ page }) => {
  await page.goto('/');
  const layer = page.locator('.falling-roses');
  await expect(layer).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(layer).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toBeHidden();
});

test('the anniversary counter uses the supplied date and updates at Manila midnight', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-29T04:00:00Z'));
  await page.goto('/');
  const counter = page.getByRole('group', { name: 'Our time together' });
  await expect(counter).toContainText('1,093 days together');
  await expect(counter.locator('time')).toHaveAttribute('datetime', '2023-11-01');
  await page.clock.setFixedTime(new Date('2026-10-29T16:00:01Z'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(counter).toContainText('1,094 days together');
});

test('Polaroid notes work with touch, keyboard, and mouse', async ({ page }, testInfo) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'A note from year 1' });
  if (testInfo.project.name === 'mobile') {
    await toggle.tap();
  } else {
    await toggle.focus();
    await toggle.press('Enter');
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#polaroid-note-one')).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await toggle.tap();
  } else {
    await toggle.press('Enter');
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#polaroid-note-one')).toBeHidden();
  if (testInfo.project.name === 'desktop') {
    await toggle.hover();
    await expect(page.locator('#polaroid-note-one')).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.locator('#polaroid-note-one')).toBeHidden();
  }
  await page.getByRole('link', { name: 'Turn to year 1' }).click();
  await expect(page).toHaveURL(/#chapter-one$/);
});

test('the envelope unfolds and the opened letter keeps keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const envelope = page.getByRole('button', { name: /When You Miss Me/ });
  await envelope.click();
  const dialog = page.getByRole('dialog', { name: 'When You Miss Me' });
  await expect(dialog.locator('.letter-modal')).toHaveCSS('opacity', '1');
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
  await page.goto('/');
  const finale = page.locator('#finale');
  await finale.scrollIntoViewIfNeeded();
  await expect(finale).toHaveClass(/has-arrived/);
  await expect(finale.locator('.finale-lights')).toHaveCSS('opacity', '1');
  await expect(finale.locator('.finale-promise')).toHaveText('I would still choose you.');
  await page.getByRole('button', { name: "Here's to Forever" }).click();
  await expect(finale).toHaveClass(/has-letter-open/);
  await page.getByRole('button', { name: 'Close letter' }).click();
  await expect(finale).not.toHaveClass(/has-letter-open/);
});

test('the photo album navigates, traps focus, and returns to its opener', async ({ page }) => {
  await page.goto('/');
  const opener = page.locator('#chapter-one .memory-card').first().getByRole('button', { name: /^View photo:/ });
  await opener.click();
  const album = page.getByRole('dialog', { name: 'Our photo album' });
  const close = album.getByRole('button', { name: 'Close photo album' });
  await expect(album.getByRole('heading')).toHaveText('The day our worlds met');
  await expect(album.getByRole('status')).toHaveText('Photo 1 of 9');
  await expect(close).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Shift+Tab');
  await expect(album.getByRole('button', { name: 'Next photo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await album.getByRole('button', { name: 'Next photo' }).click();
  await expect(album.getByRole('heading')).toHaveText('Butterflies, probably');
  await album.getByRole('button', { name: 'Previous photo' }).click();
  await expect(album.getByRole('heading')).toHaveText('The day our worlds met');
  await page.keyboard.press('ArrowLeft');
  await expect(album.getByRole('heading')).toHaveText('And here we are');
  await expect(album.getByRole('status')).toHaveText('Photo 9 of 9');
  await page.keyboard.press('ArrowRight');
  await expect(album.getByRole('status')).toHaveText('Photo 1 of 9');
  await page.keyboard.press('Escape');
  await expect(album).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('photo strips and paired snapshots open the corresponding memory', async ({ page }, testInfo) => {
  await page.goto('/');
  const stripPhoto = page.locator('.photo-booth-strip .photo-open').first();
  if (testInfo.project.name === 'mobile') await stripPhoto.tap();
  else await stripPhoto.click();
  const album = page.getByRole('dialog', { name: 'Our photo album' });
  await expect(album.getByRole('heading')).toHaveText('Anywhere, as long as it’s you');
  await expect(album.getByRole('status')).toHaveText('Photo 4 of 9');
  await album.getByRole('button', { name: 'Close photo album' }).click();
  await expect(album).toHaveCount(0);
  const pairedPhoto = page.locator('.snapshot-pair .photo-open').nth(1);
  if (testInfo.project.name === 'mobile') await pairedPhoto.tap();
  else await pairedPhoto.click();
  await expect(album.getByRole('heading')).toHaveText('Home looks a lot like you');
  await expect(album.getByRole('status')).toHaveText('Photo 8 of 9');
  await album.getByRole('button', { name: 'Close photo album' }).click();
  await expect(album).toHaveCount(0);
  await expect(pairedPhoto).toBeFocused();
});

test('ribbon bookmarks follow the chapter and navigate between years', async ({ page }) => {
  await page.goto('/');
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
