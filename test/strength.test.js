// Unit tests for the pure strength logic. Uses Node's built-in test runner
// (no dependencies): run with `node --test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  charsetSize,
  entropyBits,
  scoreFromEntropy,
  crackTimeParts,
  analyze,
  warningsFor,
} from '../src/strength.js';

import { formatCrackTime } from '../src/i18n.js';

test('charsetSize counts each character class once', () => {
  assert.equal(charsetSize('abc'), 26);
  assert.equal(charsetSize('abcABC'), 52);
  assert.equal(charsetSize('abc123'), 36);
  assert.equal(charsetSize('abc123!@#'), 69);
  assert.equal(charsetSize(''), 0);
});

test('entropyBits is length * log2(charset)', () => {
  // 8 lowercase letters: 8 * log2(26) ≈ 37.6
  assert.ok(Math.abs(entropyBits('abcdefgh') - 37.6) < 0.2);
  assert.equal(entropyBits(''), 0);
});

test('entropyBits rises with character variety', () => {
  assert.ok(entropyBits('aaaaaaaa') < entropyBits('aA1!aA1!'));
});

test('scoreFromEntropy maps bits to scores', () => {
  assert.equal(scoreFromEntropy(10), 0);
  assert.equal(scoreFromEntropy(30), 1);
  assert.equal(scoreFromEntropy(45), 2);
  assert.equal(scoreFromEntropy(80), 3);
  assert.equal(scoreFromEntropy(140), 4);
});

test('crackTimeParts is instant for zero entropy', () => {
  assert.deepEqual(crackTimeParts(0), { kind: 'instant' });
});

test('crackTimeParts grows with entropy', () => {
  const weak = crackTimeParts(20);
  const strong = crackTimeParts(120);
  assert.equal(weak.kind, 'instant');
  assert.equal(strong.kind, 'scaled');
  assert.equal(strong.unit, 'year');
});

test('warningsFor flags weak structures via codes', () => {
  assert.ok(warningsFor('aaa111').includes('repeat'));
  assert.ok(warningsFor('12345678').includes('sequence'));
  assert.ok(warningsFor('abc').includes('short'));
  assert.deepEqual(warningsFor(''), []);
});

test('analyze returns a complete report', () => {
  const r = analyze('Tr0ub4dour&3xtra');
  assert.equal(r.length, 16);
  assert.ok(r.entropyBits > 0);
  assert.ok(r.score >= 0 && r.score <= 4);
  assert.ok(Array.isArray(r.warnings));
  assert.ok(r.crackTime.kind);
});

test('formatCrackTime localizes units and plurals', () => {
  // English plural vs singular.
  assert.equal(formatCrackTime({ kind: 'plain', value: 1, unit: 'hour' }, 'en'), '1 hour');
  assert.equal(formatCrackTime({ kind: 'plain', value: 5, unit: 'hour' }, 'en'), '5 hours');
  // Russian three-form plural: 1 год / 2 года / 5 лет.
  assert.equal(formatCrackTime({ kind: 'plain', value: 1, unit: 'year' }, 'ru'), '1 год');
  assert.equal(formatCrackTime({ kind: 'plain', value: 2, unit: 'year' }, 'ru'), '2 года');
  assert.equal(formatCrackTime({ kind: 'plain', value: 5, unit: 'year' }, 'ru'), '5 лет');
  // Chinese: no plurals, unit word attached.
  assert.equal(formatCrackTime({ kind: 'plain', value: 3, unit: 'day' }, 'zh'), '3 天');
  // Instant.
  assert.equal(formatCrackTime({ kind: 'instant' }, 'ru'), 'мгновенно');
});
