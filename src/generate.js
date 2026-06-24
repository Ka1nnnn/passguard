// Cryptographically secure password generator.
//
// Uses crypto.getRandomValues (browsers and Node 19+) rather than Math.random,
// which is not safe for anything security-related. The function is pure given
// the injected RNG, so tests can pass a deterministic one.

const POOLS = {
  lower: 'abcdefghijkmnpqrstuvwxyz', // no l
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // no I, O
  digits: '23456789', // no 0, 1
  symbols: '!@#$%^&*-_=+?',
};

const SEPARATORS = '-_';

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
 *
 * Guarantees at least one character from each enabled class, fills the rest
 * from the combined pool, then shuffles. With `suffix` enabled the password
 * ends with an uppercase letter followed by a `-` or `_` separator — combine
 * `suffix` with only `lower` enabled to get an "all-lowercase, capital + dash
 * at the end" password.
 *
 * @param {number} [length=20]
 * @param {object} [opts]
 * @param {boolean} [opts.lower=true]
 * @param {boolean} [opts.upper=true]
 * @param {boolean} [opts.digits=true]
 * @param {boolean} [opts.symbols=true]
 * @param {boolean} [opts.suffix=false]  append "<Capital><-|_>" at the end
 * @param {(n:number)=>Uint8Array} [opts.randomBytes] RNG override (tests)
 * @returns {string}
 */
export function generatePassword(length = 20, opts = {}) {
  const {
    lower = true,
    upper = true,
    digits = true,
    symbols = true,
    suffix = false,
    randomBytes = defaultRandomBytes,
  } = opts;

  const enabled = [];
  if (lower) enabled.push(POOLS.lower);
  if (upper) enabled.push(POOLS.upper);
  if (digits) enabled.push(POOLS.digits);
  if (symbols) enabled.push(POOLS.symbols);

  if (enabled.length === 0 && !suffix) {
    throw new Error('At least one character class is required');
  }
  // If only the suffix is requested, build the body from lowercase letters.
  const bodyPools = enabled.length ? enabled : [POOLS.lower];

  // Reserve the last two positions for the suffix when it is enabled.
  let bodyLen = suffix ? length - 2 : length;
  if (bodyLen < bodyPools.length) bodyLen = bodyPools.length;

  const all = bodyPools.join('');
  const chars = [];

  // One guaranteed character from each enabled class.
  for (const pool of bodyPools) {
    chars.push(pool[randomInt(pool.length, randomBytes)]);
  }
  // Fill the remainder from the full pool.
  while (chars.length < bodyLen) {
    chars.push(all[randomInt(all.length, randomBytes)]);
  }
  // Fisher-Yates shuffle so guaranteed chars are spread out.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, randomBytes);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  let password = chars.join('');
  if (suffix) {
    password += POOLS.upper[randomInt(POOLS.upper.length, randomBytes)];
    password += SEPARATORS[randomInt(SEPARATORS.length, randomBytes)];
  }
  return password;
}

/**
 * Generate `count` independent passwords with the same options.
 * @param {number} count
 * @param {number} length
 * @param {object} [opts] same as generatePassword
 * @returns {string[]}
 */
export function generateMany(count, length, opts = {}) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(generatePassword(length, opts));
  return out;
}

function defaultRandomBytes(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}
