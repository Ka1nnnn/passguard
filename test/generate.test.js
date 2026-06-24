// Tests for the password generator. Run with `node --test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { generatePassword } from '../src/generate.js';

test('generates a password of the requested length', () => {
  assert.equal(generatePassword(20).length, 20);
  assert.equal(generatePassword(8).length, 8);
});

test('includes every enabled character class', () => {
  // Run several times since classes are placed at random positions.
  for (let i = 0; i < 50; i++) {
    const pw = generatePassword(16);
    assert.match(pw, /[a-z]/, 'has lowercase');
    assert.match(pw, /[A-Z]/, 'has uppercase');
    assert.match(pw, /[0-9]/, 'has digit');
    assert.match(pw, /[^a-zA-Z0-9]/, 'has symbol');
  }
});

test('respects disabled character classes', () => {
  const pw = generatePassword(24, { symbols: false, upper: false });
  assert.doesNotMatch(pw, /[^a-z0-9]/);
});

test('throws when no class is enabled', () => {
  assert.throws(() => generatePassword(20, {
    lower: false, upper: false, digits: false, symbols: false,
  }));
});

test('length is raised to fit all required classes', () => {
  // 4 classes enabled but length 2 -> bumped to at least 4.
  assert.ok(generatePassword(2).length >= 4);
});

test('is deterministic given a fixed RNG (no modulo-bias crash)', () => {
  // A constant RNG still terminates (exercises the rejection-sampling loop).
  const randomBytes = (n) => new Uint8Array(n).fill(7);
  const pw = generatePassword(12, { randomBytes });
  assert.equal(pw.length, 12);
});

test('two generated passwords differ', () => {
  assert.notEqual(generatePassword(20), generatePassword(20));
});
