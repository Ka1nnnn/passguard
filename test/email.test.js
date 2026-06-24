// Tests for email validation and parsing of the XposedOrNot payload.
// Run with `node --test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isValidEmail, parseEmailReport, checkEmail } from '../src/email.js';

test('isValidEmail accepts and rejects sensibly', () => {
  assert.ok(isValidEmail('a@b.co'));
  assert.ok(isValidEmail('name.surname@example.com'));
  assert.ok(!isValidEmail('not-an-email'));
  assert.ok(!isValidEmail('a@b'));
  assert.ok(!isValidEmail('a @b.com'));
});

test('parseEmailReport flattens the analytics payload', () => {
  const raw = {
    BreachMetrics: { risk: [{ risk_label: 'High', risk_score: 72 }] },
    PastesSummary: { cnt: 2 },
    ExposedBreaches: {
      breaches_details: [
        {
          breach: 'Acme',
          domain: 'acme.com',
          xposed_date: '2021',
          xposed_records: '1000',
          logo: 'http://x/logo.png',
          industry: 'Retail',
          details: 'A breach happened.',
          verified: 'Yes',
          xposed_data: 'Email addresses;Passwords;Phone numbers',
        },
        {
          breach: 'Older',
          xposed_date: '2015',
          xposed_records: '5',
          xposed_data: '',
        },
      ],
    },
  };

  const r = parseEmailReport(raw);
  assert.equal(r.found, true);
  assert.equal(r.count, 2);
  assert.equal(r.riskLabel, 'High');
  assert.equal(r.riskScore, 72);
  assert.equal(r.pastes, 2);
  // Newest first.
  assert.equal(r.breaches[0].name, 'Acme');
  assert.deepEqual(r.breaches[0].data, ['Email addresses', 'Passwords', 'Phone numbers']);
  assert.equal(r.breaches[0].records, 1000);
  assert.equal(r.breaches[0].verified, true);
  assert.deepEqual(r.breaches[1].data, []);
});

test('parseEmailReport treats an empty payload as not found', () => {
  const r = parseEmailReport({ BreachMetrics: null, ExposedBreaches: null });
  assert.equal(r.found, false);
  assert.equal(r.count, 0);
  assert.equal(r.riskScore, null);
});

test('checkEmail uses the injected fetch and parses the result', async () => {
  const fakeFetch = async (url) => {
    assert.match(url, /breach-analytics\?email=a%40b\.co/);
    return {
      ok: true,
      json: async () => ({
        BreachMetrics: { risk: [{ risk_label: 'Low', risk_score: 10 }] },
        ExposedBreaches: { breaches_details: [{ breach: 'X', xposed_data: 'Email addresses' }] },
      }),
    };
  };
  const r = await checkEmail('a@b.co', fakeFetch);
  assert.equal(r.count, 1);
  assert.equal(r.breaches[0].name, 'X');
});
