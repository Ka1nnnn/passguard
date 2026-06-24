// Cryptographically secure password generator.
//
// Uses crypto.getRandomValues (available in browsers and Node 19+) rather than
// Math.random, which is not safe for anything security-related. The function is
// pure given the injected RNG, so tests can pass a deterministic one.

const POOLS = {
  lower: 'abcdefghijkmnpqrstuvwxyz', // no l
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // no I, O
  digits: '23456789', // no 0, 1
  symbols: '!@#$%^&*-_=+?',
};

/**
 * Draw an unbiased random integer in [0, max) from a CSPRNG.
 * Rejection sampling avoids the modulo bias a naive `rand % max` would add.
 * @param {number} max exclusive upper bound (1..256)
 * @param {(n:number)=>Uint8Array} randomBytes RNG (injectable for tests)
 * @returns {number}
 */
function randomInt(max, randomBytes) {
  const limit = Math.floor(256 / max) * max; // largest multiple of max <= 256
  let byte;
  do {
    byte = randomBytes(1)[0];
  } while (byte >= limit);
  return byte % max;
}

/**
 * Generate a strong random password.
 * Guarantees at least one character from each enabled class, then fills the
 * rest from the combined pool and shuffles so the guaranteed characters are
 * not stuck at the front.
 *
 * @param {number} [length=20]
 * @param {object} [opts]
 * @param {boolean} [opts.lower=true]
 * @param {boolean} [opts.upper=true]
 * @param {boolean} [opts.digits=true]
 * @param {boolean} [opts.symbols=true]
 * @param {(n:number)=>Uint8Array} [opts.randomBytes] RNG override (tests)
 * @returns {string}
 */
export function generatePassword(length = 20, opts = {}) {
  const {
    lower = true,
    upper = true,
    digits = true,
    symbols = true,
    randomBytes = defaultRandomBytes,
  } = opts;

  const enabled = [];
  if (lower) enabled.push(POOLS.lower);
  if (upper) enabled.push(POOLS.upper);
  if (digits) enabled.push(POOLS.digits);
  if (symbols) enabled.push(POOLS.symbols);

  if (enabled.length === 0) throw new Error('At least one character class is required');
  if (length < enabled.length) length = enabled.length;

  const all = enabled.join('');
  const chars = [];

  // One guaranteed character from each enabled class.
  for (const pool of enabled) {
    chars.push(pool[randomInt(pool.length, randomBytes)]);
  }
  // Fill the remainder from the full pool.
  while (chars.length < length) {
    chars.push(all[randomInt(all.length, randomBytes)]);
  }

  // Fisher-Yates shuffle so guaranteed chars are spread out.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, randomBytes);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function defaultRandomBytes(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}
