// UI wiring: reads the password input, runs the local strength analysis on
// every keystroke, queries Have I Been Pwned (debounced) on demand, and
// supports switching the interface language at runtime.
// All heavy logic lives in strength.js / hibp.js / i18n.js.

import { analyze } from './strength.js';
import { pwnedCount } from './hibp.js';
import { LANGS, LANG_NAMES, STRINGS, formatCrackTime } from './i18n.js';

const $ = (id) => document.getElementById(id);
const input = $('password');
const toggle = $('toggle');
const meterFill = $('meter-fill');
const label = $('label');
const stats = $('stats');
const warnings = $('warnings');
const breach = $('breach');
const langBar = $('langs');

const SCORE_COLORS = ['#e5484d', '#f76808', '#ffb224', '#46a758', '#30a46c'];

// Pick the starting language from the browser, falling back to English.
let lang = LANGS.includes((navigator.language || 'en').slice(0, 2))
  ? navigator.language.slice(0, 2)
  : 'en';

// Remember the latest breach result so a language switch can re-render it.
let lastBreach = { state: 'idle', count: 0 };

function t() {
  return STRINGS[lang];
}

// --- static (non-input-dependent) text ---
function applyStaticText() {
  const s = t();
  document.documentElement.lang = lang;
  $('tagline-text').textContent = s.tagline + ' ';
  $('privacy-text').textContent = s.privacy;
  input.placeholder = s.placeholder;
  toggle.textContent = input.type === 'password' ? s.show : s.hide;
  $('how-summary').textContent = s.howSummary;
  $('how-body').textContent = s.howBody;
  $('source-link').textContent = s.source;
}

function render(result) {
  const s = t();
  meterFill.style.width = `${(result.score + 1) * 20}%`;
  meterFill.style.background = SCORE_COLORS[result.score];

  label.textContent = result.length > 0 ? s.scores[result.score] : '';
  label.style.color = SCORE_COLORS[result.score];

  stats.innerHTML = '';
  if (result.length > 0) {
    addStat(s.statLength, `${result.length}`);
    addStat(s.statCharset, `${result.charset} ${s.symbols}`);
    addStat(s.statEntropy, `${result.entropyBits} ${s.bits}`);
    addStat(s.statCrack, `~${formatCrackTime(result.crackTime, lang)}`);
  }

  warnings.innerHTML = '';
  for (const code of result.warnings) {
    const li = document.createElement('li');
    li.textContent = s.warnings[code];
    warnings.appendChild(li);
  }
}

function addStat(name, value) {
  const div = document.createElement('div');
  div.className = 'stat';
  div.innerHTML = `<span class="stat-name"></span><span class="stat-value"></span>`;
  div.firstChild.textContent = name;
  div.lastChild.textContent = value;
  stats.appendChild(div);
}

function renderBreach() {
  const s = t();
  const { state, count } = lastBreach;
  breach.className = `breach ${state}`;
  if (state === 'checking') breach.textContent = s.breachChecking;
  else if (state === 'pwned') breach.textContent = s.breachPwned(count);
  else if (state === 'safe') breach.textContent = s.breachSafe;
  else if (state === 'error') breach.textContent = s.breachError;
  else breach.textContent = '';
}

function setBreach(state, count = 0) {
  lastBreach = { state, count };
  renderBreach();
}

// --- language switcher ---
function buildLangBar() {
  for (const code of LANGS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = LANG_NAMES[code];
    btn.dataset.lang = code;
    btn.addEventListener('click', () => setLang(code));
    langBar.appendChild(btn);
  }
}

function setLang(code) {
  lang = code;
  for (const btn of langBar.children) {
    btn.classList.toggle('active', btn.dataset.lang === code);
  }
  applyStaticText();
  render(analyze(input.value));
  renderBreach();
}

// --- live strength on every keystroke ---
let breachTimer = null;
input.addEventListener('input', () => {
  const value = input.value;
  render(analyze(value));

  clearTimeout(breachTimer);
  if (!value) {
    setBreach('idle');
    return;
  }
  setBreach('checking');
  breachTimer = setTimeout(() => checkBreach(value), 700);
});

async function checkBreach(value) {
  try {
    const count = await pwnedCount(value);
    if (input.value !== value) return; // user kept typing — ignore stale result
    setBreach(count > 0 ? 'pwned' : 'safe', count);
  } catch (err) {
    setBreach('error');
    console.error(err);
  }
}

toggle.addEventListener('click', () => {
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  toggle.textContent = isHidden ? t().hide : t().show;
  toggle.setAttribute('aria-pressed', String(isHidden));
});

// --- boot ---
buildLangBar();
setLang(lang);
