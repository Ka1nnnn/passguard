// Tests for the downloadable-file builder. Run with `node --test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildFileContent } from '../src/download.js';

test('txt format is one password per line', () => {
  const out = buildFileContent(['aaa', 'bbb', 'ccc'], 'txt');
  assert.equal(out, 'aaa\nbbb\nccc\n');
});

test('md format is a numbered code list', () => {
  const out = buildFileContent(['aaa', 'bbb'], 'md');
  assert.match(out, /^# PassGuard/);
  assert.match(out, /1\. `aaa`/);
  assert.match(out, /2\. `bbb`/);
});

test('md format includes the timestamp when given', () => {
  const out = buildFileContent(['x'], 'md', '2026-01-01T00:00:00Z');
  assert.match(out, /2026-01-01T00:00:00Z/);
});

test('handles an empty list', () => {
  assert.equal(buildFileContent([], 'txt'), '\n');
});
