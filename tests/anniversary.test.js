import test from 'node:test';
import assert from 'node:assert/strict';
import { getDaysTogether } from '../src/anniversary.js';

test('counts elapsed days from the supplied relationship date', () => {
  assert.equal(getDaysTogether('2023-11-01', new Date('2026-10-29T04:00:00Z')), 1093);
});

test('changes the count at Manila midnight, independently of the machine timezone', () => {
  assert.equal(getDaysTogether('2023-11-01', new Date('2026-10-29T15:59:59Z')), 1093);
  assert.equal(getDaysTogether('2023-11-01', new Date('2026-10-29T16:00:00Z')), 1094);
});

test('includes leap days and treats the starting day as zero elapsed days', () => {
  assert.equal(getDaysTogether('2024-02-28', new Date('2024-03-01T00:00:00Z')), 2);
  assert.equal(getDaysTogether('2023-11-01', new Date('2023-11-01T04:00:00Z')), 0);
});

test('handles daylight-saving time by counting calendar days', () => {
  assert.equal(getDaysTogether('2024-03-09', new Date('2024-03-11T04:00:00Z'), 'America/New_York'), 2);
});

test('does not invent a count for missing, invalid, or future dates', () => {
  const now = new Date('2026-10-29T04:00:00Z');
  for (const date of [null, '', '2023-02-29', '2023-13-01', '01/11/2023', '2026-10-30']) {
    assert.equal(getDaysTogether(date, now), null);
  }
  assert.equal(getDaysTogether('2023-11-01', now, 'Invalid/Zone'), null);
});
