// Have I Been Pwned "Pwned Passwords" lookup using the k-anonymity model.
//
// We never send the password - not even its full hash. We compute the SHA-1
// hash locally, send only the first 5 hex characters of it, and the API
// returns every breached hash that shares that prefix. We then look for the
// remaining 35 characters in that list ourselves. The server therefore never
// learns which password we asked about. This is the same technique the
// official HIBP integrations use.
//
// Docs: https://haveibeenpwned.com/API/v3#PwnedPasswords

const API_RANGE = 'https://api.pwnedpasswords.com/range/';

/**
 * Compute the uppercase hex SHA-1 of a string using the browser's Web Crypto
 * API. SHA-1 is broken for collision resistance but HIBP uses it purely as a
 * fixed-width index, so it is appropriate here.
 * @param {string} text
 * @returns {Promise<string>} 40-char uppercase hex digest
 */
export async function sha1Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Check how many times a password appears in known breaches.
 * @param {string} password
 * @returns {Promise<number>} breach count (0 means not found)
 */
export async function pwnedCount(password) {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await fetch(API_RANGE + prefix, {
    headers: { 'Add-Padding': 'true' }, // ask HIBP to pad the response so its size leaks nothing
  });
  if (!res.ok) {
    throw new Error(`HIBP request failed: ${res.status}`);
  }

  const body = await res.text();
  return parseRange(body, suffix);
}

/**
 * Parse the API's "SUFFIX:COUNT" lines and return the count for our suffix.
 * Exported so it can be unit-tested without network access.
 * @param {string} body raw response text
 * @param {string} suffix the 35-char hash suffix we are looking for
 * @returns {number}
 */
export function parseRange(body, suffix) {
  const target = suffix.toUpperCase();
  for (const line of body.split('\n')) {
    const [hashSuffix, count] = line.trim().split(':');
    if (hashSuffix === target) {
      return parseInt(count, 10) || 0;
    }
  }
  return 0;
}
