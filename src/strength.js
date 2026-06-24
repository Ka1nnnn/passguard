// Pure, dependency-free password-strength logic.
// Exported as an ES module so it can be reused both in the browser (app.js)
// and in Node for unit tests (test/strength.test.js).
//
// Note: this module is language-agnostic. It returns *codes* (for warnings)
// and *structured parts* (for crack time) rather than display strings, so the
// UI layer (i18n.js) can translate them into any language.

/**
 * Size of the character pool a password draws from. This is what an attacker
 * must brute-force per character, so it directly drives entropy.
 * @param {string} password
 * @returns {number} number of possible symbols per position
 */
export function charsetSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  // Common ASCII punctuation/symbols.
  if (/[^a-zA-Z0-9]/.test(password)) size += 33;
  return size;
}

/**
 * Shannon-style entropy estimate in bits: length * log2(charsetSize).
 * This is the theoretical work factor for a pure brute-force attack and is
 * the number security folks usually quote when rating a password.
 * @param {string} password
 * @returns {number} entropy in bits (0 for empty input)
 */
export function entropyBits(password) {
  if (!password) return 0;
  const pool = charsetSize(password);
  if (pool === 0) return 0;
  return +(password.length * Math.log2(pool)).toFixed(1);
}

/**
 * Map entropy bits to a coarse score. Thresholds follow common guidance:
 * < 28 trivial, 28-35 weak, 36-59 reasonable, 60-127 strong, 128+ very strong.
 * The matching label text lives in i18n.js, keyed by score.
 * @param {number} bits
 * @returns {0|1|2|3|4} score
 */
export function scoreFromEntropy(bits) {
  if (bits < 28) return 0;
  if (bits < 36) return 1;
  if (bits < 60) return 2;
  if (bits < 128) return 3;
  return 4;
}

/**
 * Estimate the average time to brute-force a password at a given guess rate,
 * returned as language-neutral parts so the UI can format/translate them.
 * Average is half the keyspace.
 * @param {number} bits entropy in bits
 * @param {number} [guessesPerSecond] attacker throughput (default 10 billion/s,
 *   a rough figure for an offline GPU attack against a fast hash)
 * @returns {{kind:'instant'} |
 *           {kind:'plain', value:number, unit:'second'|'minute'|'hour'|'day'|'year'} |
 *           {kind:'scaled', value:number, scale:'million'|'billion'|'trillion'|'quadrillion'|'quintillion', unit:'year'}}
 */
export function crackTimeParts(bits, guessesPerSecond = 1e10) {
  if (bits <= 0) return { kind: 'instant' };
  const seconds = Math.pow(2, bits) / 2 / guessesPerSecond;
  if (seconds < 1) return { kind: 'instant' };

  const units = [
    ['year', 60 * 60 * 24 * 365],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, size] of units) {
    if (seconds >= size) {
      const value = seconds / size;
      if (unit === 'year' && value >= 1e6) {
        const scales = [
          ['quintillion', 1e18],
          ['quadrillion', 1e15],
          ['trillion', 1e12],
          ['billion', 1e9],
          ['million', 1e6],
        ];
        for (const [scale, scaleSize] of scales) {
          if (value >= scaleSize) {
            return { kind: 'scaled', value: +(value / scaleSize).toFixed(1), scale, unit: 'year' };
          }
        }
      }
      return { kind: 'plain', value: Math.round(value), unit };
    }
  }
  return { kind: 'instant' };
}

/**
 * Cheap heuristic warnings (as codes) that catch passwords whose entropy
 * estimate overstates their real strength. Codes are translated in i18n.js.
 * @param {string} password
 * @returns {Array<'short'|'lettersOnly'|'digitsOnly'|'repeat'|'sequence'>}
 */
export function warningsFor(password) {
  const warnings = [];
  if (!password) return warnings;
  if (password.length < 12) warnings.push('short');
  if (/^[a-z]+$/i.test(password)) warnings.push('lettersOnly');
  if (/^[0-9]+$/.test(password)) warnings.push('digitsOnly');
  if (/(.)\1{2,}/.test(password)) warnings.push('repeat');
  if (/(?:0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf)/i.test(password)) {
    warnings.push('sequence');
  }
  return warnings;
}

/**
 * Full analysis of a password. The single entry point used by the UI.
 * @param {string} password
 */
export function analyze(password) {
  const bits = entropyBits(password);
  return {
    length: password.length,
    charset: charsetSize(password),
    entropyBits: bits,
    score: scoreFromEntropy(bits),
    crackTime: crackTimeParts(bits),
    warnings: warningsFor(password),
  };
}
