// Wires up the three tabs (Check / Generate / Email). Logic lives in the other
// modules; this file only reads inputs and updates the DOM.

import { analyze } from './strength.js';
import { pwnedCount } from './hibp.js';
import { generatePassword, generateMany } from './generate.js';
import { buildFileContent, downloadFile } from './download.js';
import { checkEmail, isValidEmail } from './email.js';
import { LANGS, LANG_NAMES, STRINGS, formatCrackTime } from './i18n.js';

const $ = (id) => document.getElementById(id);
const SCORE_COLORS = ['#e5484d', '#f76808', '#ffb224', '#46a758', '#30a46c'];
const LANG_KEY = 'pg-lang';
const THEME_KEY = 'pg-theme';

// localStorage is not always available (private mode, Node smoke test).
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

const checkEls = { fill: $('meter-fill'), label: $('label'), stats: $('stats'), warnings: $('warnings') };
const genEls = { fill: $('gen-meter-fill'), label: $('gen-label'), stats: $('gen-stats'), warnings: null };

let lang = store.get(LANG_KEY)
  || (LANGS.includes((navigator.language || 'en').slice(0, 2)) ? navigator.language.slice(0, 2) : 'en');

let lastBreach = { state: 'idle', count: 0 };
let lastGenBreach = { state: 'idle', count: 0 };
let emailState = { phase: 'idle', report: null };

const t = () => STRINGS[lang];
const localeFor = (l) => (l === 'ru' ? 'ru-RU' : l === 'zh' ? 'zh-CN' : 'en-US');
const noClass = (o) => !o.lower && !o.upper && !o.digits && !o.symbols && !o.suffix;

// ---------- theme ----------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
}
function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}
function initTheme() {
  let theme = store.get(THEME_KEY);
  if (!theme) {
    const prefersLight = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches;
    theme = prefersLight ? 'light' : 'dark';
  }
  applyTheme(theme);
}
$('theme-toggle').addEventListener('click', () => {
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  applyTheme(next);
  store.set(THEME_KEY, next);
});

// ---------- static text ----------
function applyStaticText() {
  const s = t();
  document.documentElement.lang = lang;

  $('tagline-text').textContent = s.tagline + ' ';
  $('privacy-text').textContent = s.privacy;

  $('tab-check').textContent = s.tabCheck;
  $('tab-generate').textContent = s.tabGenerate;
  $('tab-email').textContent = s.tabEmail;

  $('password').placeholder = s.placeholder;
  $('toggle').textContent = $('password').type === 'password' ? s.show : s.hide;
  $('how-summary').textContent = s.howSummary;
  $('how-body').textContent = s.howBody;
  $('source-link').textContent = s.source;

  $('gen-copy').textContent = s.copy;
  $('lbl-length').textContent = s.optLength;
  $('lbl-lower').textContent = s.optLower;
  $('lbl-upper').textContent = s.optUpper;
  $('lbl-digits').textContent = s.optDigits;
  $('lbl-symbols').textContent = s.optSymbols;
  $('lbl-suffix').textContent = s.optSuffix;
  $('gen-btn').textContent = s.genButton;
  $('bulk-title').textContent = s.bulkTitle;
  $('lbl-count').textContent = s.optCount;
  $('dl-txt').textContent = s.dlTxt;
  $('dl-md').textContent = s.dlMd;
  $('copy-all').textContent = s.copyAll;
  $('bulk-note').textContent = s.bulkNote;
  $('val-length').textContent = $('opt-length').value;
  $('val-count').textContent = $('opt-count').value;

  $('email').placeholder = s.emailPlaceholder;
  $('email-btn').textContent = s.emailButton;
  $('email-note').textContent = s.emailNote;
}

// ---------- shared render ----------
function renderStrength(els, result, s) {
  els.fill.style.width = `${(result.score + 1) * 20}%`;
  els.fill.style.background = SCORE_COLORS[result.score];
  els.label.textContent = result.length > 0 ? s.scores[result.score] : '';
  els.label.style.color = SCORE_COLORS[result.score];

  els.stats.innerHTML = '';
  if (result.length > 0) {
    addStat(els.stats, s.statLength, `${result.length}`);
    addStat(els.stats, s.statCharset, `${result.charset} ${s.symbols}`);
    addStat(els.stats, s.statEntropy, `${result.entropyBits} ${s.bits}`);
    addStat(els.stats, s.statCrack, `~${formatCrackTime(result.crackTime, lang)}`);
  }

  if (els.warnings) {
    els.warnings.innerHTML = '';
    for (const code of result.warnings) {
      const li = document.createElement('li');
      li.textContent = s.warnings[code];
      els.warnings.appendChild(li);
    }
  }
}

function addStat(container, name, value) {
  const div = document.createElement('div');
  div.className = 'stat';
  div.innerHTML = '<span class="stat-name"></span><span class="stat-value"></span>';
  div.firstChild.textContent = name;
  div.lastChild.textContent = value;
  container.appendChild(div);
}

function renderBreachEl(el, rec, s) {
  el.className = `breach ${rec.state === 'needclass' ? 'error' : rec.state}`;
  if (rec.state === 'checking') el.textContent = s.breachChecking;
  else if (rec.state === 'pwned') el.textContent = s.breachPwned(rec.count);
  else if (rec.state === 'safe') el.textContent = s.breachSafe;
  else if (rec.state === 'error') el.textContent = s.breachError;
  else if (rec.state === 'needclass') el.textContent = s.needClass;
  else el.textContent = '';
}

// Breach lookup shared by the Check and Generate panels.
async function runBreach(value, sourceInput, el, store) {
  try {
    const count = await pwnedCount(value);
    if (sourceInput.value !== value) return; // user kept typing
    const rec = { state: count > 0 ? 'pwned' : 'safe', count };
    store(rec);
    renderBreachEl(el, rec, t());
  } catch (err) {
    const rec = { state: 'error', count: 0 };
    store(rec);
    renderBreachEl(el, rec, t());
    console.error(err);
  }
}

// ---------- check tab ----------
let breachTimer = null;
$('password').addEventListener('input', () => {
  const value = $('password').value;
  renderStrength(checkEls, analyze(value), t());
  clearTimeout(breachTimer);
  if (!value) {
    lastBreach = { state: 'idle', count: 0 };
    renderBreachEl($('breach'), lastBreach, t());
    return;
  }
  lastBreach = { state: 'checking', count: 0 };
  renderBreachEl($('breach'), lastBreach, t());
  breachTimer = setTimeout(() => runBreach(value, $('password'), $('breach'), (r) => (lastBreach = r)), 700);
});

$('toggle').addEventListener('click', () => {
  const input = $('password');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  $('toggle').textContent = isHidden ? t().hide : t().show;
  $('toggle').setAttribute('aria-pressed', String(isHidden));
});

// ---------- generate tab ----------
function readGenOptions() {
  return {
    length: Number($('opt-length').value),
    lower: $('opt-lower').checked,
    upper: $('opt-upper').checked,
    digits: $('opt-digits').checked,
    symbols: $('opt-symbols').checked,
    suffix: $('opt-suffix').checked,
  };
}

let genBreachTimer = null;
function regenerate() {
  const s = t();
  const opts = readGenOptions();

  if (noClass(opts)) {
    $('gen-pass').value = '';
    renderStrength(genEls, analyze(''), s);
    lastGenBreach = { state: 'needclass', count: 0 };
    renderBreachEl($('gen-breach'), lastGenBreach, s);
    return;
  }

  const pw = generatePassword(opts.length, opts);
  $('gen-pass').value = pw;
  renderStrength(genEls, analyze(pw), s);

  clearTimeout(genBreachTimer);
  lastGenBreach = { state: 'checking', count: 0 };
  renderBreachEl($('gen-breach'), lastGenBreach, s);
  genBreachTimer = setTimeout(
    () => runBreach(pw, $('gen-pass'), $('gen-breach'), (r) => (lastGenBreach = r)),
    500,
  );
}

$('opt-length').addEventListener('input', () => {
  $('val-length').textContent = $('opt-length').value;
  regenerate();
});
$('opt-count').addEventListener('input', () => {
  $('val-count').textContent = $('opt-count').value;
});
for (const id of ['opt-lower', 'opt-upper', 'opt-digits', 'opt-symbols', 'opt-suffix']) {
  $(id).addEventListener('change', regenerate);
}
$('gen-btn').addEventListener('click', regenerate);

async function copyText(value, button, doneLabel, idleLabel) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    button.textContent = doneLabel;
    setTimeout(() => (button.textContent = idleLabel), 1200);
  } catch (err) {
    console.error(err);
  }
}

$('gen-copy').addEventListener('click', () =>
  copyText($('gen-pass').value, $('gen-copy'), t().copied, t().copy));

$('copy-all').addEventListener('click', () => {
  const opts = readGenOptions();
  if (noClass(opts)) return;
  const list = generateMany(Number($('opt-count').value), opts.length, opts);
  copyText(list.join('\n'), $('copy-all'), t().copiedAll, t().copyAll);
});

function download(format) {
  const opts = readGenOptions();
  if (noClass(opts)) return;
  const list = generateMany(Number($('opt-count').value), opts.length, opts);
  downloadFile(`passguard-passwords.${format}`, buildFileContent(list, format, new Date().toISOString()));
}
$('dl-txt').addEventListener('click', () => download('txt'));
$('dl-md').addEventListener('click', () => download('md'));

// ---------- email tab ----------
async function runEmailCheck() {
  const email = $('email').value.trim();
  if (!isValidEmail(email)) {
    emailState = { phase: 'invalid', report: null };
    renderEmail();
    return;
  }
  emailState = { phase: 'checking', report: null };
  renderEmail();
  try {
    emailState = { phase: 'done', report: await checkEmail(email) };
  } catch (err) {
    emailState = { phase: 'error', report: null };
    console.error(err);
  }
  renderEmail();
}

function renderEmail() {
  const s = t();
  const status = $('email-status');
  const riskBox = $('email-risk');
  const results = $('email-results');
  riskBox.classList.add('hidden');
  riskBox.innerHTML = '';
  results.innerHTML = '';

  const { phase, report } = emailState;
  if (phase === 'idle') return void ((status.className = 'breach idle'), (status.textContent = ''));
  if (phase === 'checking') return void ((status.className = 'breach checking'), (status.textContent = s.emailChecking));
  if (phase === 'invalid') return void ((status.className = 'breach error'), (status.textContent = s.emailInvalid));
  if (phase === 'error') return void ((status.className = 'breach error'), (status.textContent = s.emailError));

  if (!report.found) {
    status.className = 'breach safe';
    status.textContent = s.emailClean;
    return;
  }

  status.className = 'breach pwned';
  status.textContent = s.emailFound(report.count);

  if (report.riskScore != null) {
    riskBox.classList.remove('hidden');
    const label = document.createElement('div');
    label.className = 'risk-label';
    label.textContent = `${s.emailRisk}: ${report.riskLabel} (${report.riskScore}/100)`;
    const bar = document.createElement('div');
    bar.className = 'risk-bar';
    const fill = document.createElement('div');
    fill.className = 'risk-fill';
    fill.style.width = `${report.riskScore}%`;
    bar.appendChild(fill);
    riskBox.append(label, bar);
  }

  for (const b of report.breaches) results.appendChild(breachCard(b, s));
}

function breachCard(b, s) {
  const card = document.createElement('div');
  card.className = 'bcard';

  const head = document.createElement('div');
  head.className = 'bcard-head';
  if (b.logo) {
    const img = document.createElement('img');
    img.className = 'bcard-logo';
    img.src = b.logo;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => img.remove();
    head.appendChild(img);
  }
  const titleWrap = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'bcard-title';
  title.textContent = b.name;
  const meta = document.createElement('div');
  meta.className = 'bcard-meta';
  const bits = [];
  if (b.date) bits.push(b.date);
  if (b.records) bits.push(`${b.records.toLocaleString(localeFor(lang))} ${s.emailRecords}`);
  if (b.industry) bits.push(b.industry);
  meta.textContent = bits.join(' · ');
  titleWrap.append(title, meta);
  head.appendChild(titleWrap);
  card.appendChild(head);

  if (b.data.length) {
    const chips = document.createElement('div');
    chips.className = 'chips';
    const lab = document.createElement('span');
    lab.className = 'chips-label';
    lab.textContent = s.emailExposed;
    chips.appendChild(lab);
    for (const d of b.data) {
      const c = document.createElement('span');
      c.className = 'chip';
      c.textContent = d;
      chips.appendChild(c);
    }
    card.appendChild(chips);
  }

  if (b.description) {
    const p = document.createElement('p');
    p.className = 'bcard-desc';
    p.textContent = b.description;
    card.appendChild(p);
  }
  return card;
}

$('email-btn').addEventListener('click', runEmailCheck);
$('email').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runEmailCheck();
});

// ---------- tabs ----------
function switchTab(name) {
  for (const tab of $('tabs').children) {
    tab.classList.toggle('active', tab.dataset.tab === name);
  }
  for (const p of ['check', 'generate', 'email']) {
    $(`panel-${p}`).classList.toggle('hidden', p !== name);
  }
  if (name === 'generate' && !$('gen-pass').value) regenerate();
}
for (const tab of $('tabs').children) {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
}

// ---------- language ----------
function buildLangBar() {
  for (const code of LANGS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = LANG_NAMES[code];
    btn.dataset.lang = code;
    btn.addEventListener('click', () => setLang(code));
    $('langs').appendChild(btn);
  }
}

function setLang(code) {
  lang = code;
  store.set(LANG_KEY, code);
  for (const btn of $('langs').children) {
    btn.classList.toggle('active', btn.dataset.lang === code);
  }
  applyStaticText();
  const s = t();
  renderStrength(checkEls, analyze($('password').value), s);
  renderBreachEl($('breach'), lastBreach, s);
  if ($('gen-pass').value || lastGenBreach.state !== 'idle') {
    renderStrength(genEls, analyze($('gen-pass').value), s);
    renderBreachEl($('gen-breach'), lastGenBreach, s);
  }
  renderEmail();
}

// ---------- boot ----------
initTheme();
buildLangBar();
setLang(lang);
