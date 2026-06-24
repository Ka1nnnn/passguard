// UI text for English / Russian / Chinese, plus helpers that format the
// strength.js output into localized strings.

export const LANGS = ['en', 'ru', 'zh'];
export const LANG_NAMES = { en: 'EN', ru: 'RU', zh: '中文' };

export const STRINGS = {
  en: {
    tagline: 'Test how strong your password is, and whether it has leaked.',
    privacy: 'Your password never leaves this browser.',
    tabCheck: 'Check',
    tabGenerate: 'Generate',
    tabEmail: 'Email',
    placeholder: 'Type a password...',
    show: 'Show',
    hide: 'Hide',
    scores: ['Very weak', 'Weak', 'Reasonable', 'Strong', 'Very strong'],
    statLength: 'Length',
    statCharset: 'Charset',
    statEntropy: 'Entropy',
    statCrack: 'Brute-force',
    symbols: 'symbols',
    bits: 'bits',
    warnings: {
      short: 'Shorter than 12 characters',
      lettersOnly: 'Letters only, add digits and symbols',
      digitsOnly: 'Digits only, easy to brute-force',
      repeat: 'Contains a repeated character run',
      sequence: 'Contains a common sequence',
    },
    breachChecking: 'Checking breach database...',
    breachPwned: (n) => `Found in ${n.toLocaleString('en-US')} breaches, do not use it`,
    breachSafe: 'Not found in any known breach',
    breachError: 'Breach check unavailable (offline?)',
    howSummary: 'How does the breach check stay private?',
    howBody:
      'PassGuard uses the k-anonymity model of the Have I Been Pwned API. Your ' +
      'password is hashed with SHA-1 locally; only the first five characters of ' +
      'that hash are sent. The server never learns which password you asked about.',
    source: 'Source on GitHub',
    instant: 'instantly',
    units: { second: 'second', minute: 'minute', hour: 'hour', day: 'day', year: 'year' },

    genHint: 'Generated below, then rated and checked for breaches.',
    optLength: 'Length',
    optLower: 'Lowercase (a-z)',
    optUpper: 'Uppercase (A-Z)',
    optDigits: 'Digits (2-9)',
    optSymbols: 'Symbols (!@#...)',
    optSuffix: 'End with a capital + "-" or "_"',
    genButton: 'Generate password',
    copy: 'Copy',
    copied: 'Copied',
    bulkTitle: 'Bulk export',
    optCount: 'How many',
    dlTxt: 'Download .txt',
    dlMd: 'Download .md',
    copyAll: 'Copy to clipboard',
    copiedAll: 'Copied',
    bulkNote: 'Up to 200 at once. Generation is fully local, no API limits are used.',
    needClass: 'Enable at least one character type.',

    emailPlaceholder: 'name@example.com',
    emailButton: 'Check email',
    emailChecking: 'Checking breaches...',
    emailInvalid: 'Enter a valid email address.',
    emailClean: 'Good news, this email was not found in any known breach.',
    emailFound: (n) => `Found in ${n} breach${n === 1 ? '' : 'es'}`,
    emailError: 'Lookup failed. Try again later.',
    emailRisk: 'Risk',
    emailRecords: 'records',
    emailExposed: 'Exposed data:',
    emailNote:
      'Powered by XposedOrNot. Unlike passwords, the email address is sent to ' +
      'their API to look it up (no k-anonymity is possible for emails).',
  },

  ru: {
    tagline: 'Проверь, насколько надёжен твой пароль и не утёк ли он.',
    privacy: 'Пароль никогда не покидает этот браузер.',
    tabCheck: 'Проверка',
    tabGenerate: 'Генерация',
    tabEmail: 'Почта',
    placeholder: 'Введите пароль...',
    show: 'Показать',
    hide: 'Скрыть',
    scores: ['Очень слабый', 'Слабый', 'Приемлемый', 'Надёжный', 'Очень надёжный'],
    statLength: 'Длина',
    statCharset: 'Алфавит',
    statEntropy: 'Энтропия',
    statCrack: 'Перебор',
    symbols: 'символов',
    bits: 'бит',
    warnings: {
      short: 'Короче 12 символов',
      lettersOnly: 'Только буквы, добавьте цифры и символы',
      digitsOnly: 'Только цифры, легко перебрать',
      repeat: 'Есть повтор одного символа подряд',
      sequence: 'Содержит распространённую последовательность',
    },
    breachChecking: 'Проверяю базу утечек...',
    breachPwned: (n) => `Найден в ${n.toLocaleString('ru-RU')} утечках, не используйте его`,
    breachSafe: 'Не найден ни в одной известной утечке',
    breachError: 'Проверка утечек недоступна (нет сети?)',
    howSummary: 'Как проверка утечек остаётся приватной?',
    howBody:
      'PassGuard использует модель k-анонимности сервиса Have I Been Pwned. Пароль ' +
      'хешируется алгоритмом SHA-1 прямо в браузере; на сервер уходят только первые ' +
      'пять символов хеша. Сервис не узнаёт, какой пароль вы проверяли.',
    source: 'Исходный код на GitHub',
    instant: 'мгновенно',
    units: { second: 'second', minute: 'minute', hour: 'hour', day: 'day', year: 'year' },

    genHint: 'Пароль создаётся ниже, затем оценивается и проверяется на утечки.',
    optLength: 'Длина',
    optLower: 'Строчные (a-z)',
    optUpper: 'Заглавные (A-Z)',
    optDigits: 'Цифры (2-9)',
    optSymbols: 'Символы (!@#...)',
    optSuffix: 'В конце заглавная + "-" или "_"',
    genButton: 'Сгенерировать пароль',
    copy: 'Копировать',
    copied: 'Скопировано',
    bulkTitle: 'Пакетный экспорт',
    optCount: 'Сколько',
    dlTxt: 'Скачать .txt',
    dlMd: 'Скачать .md',
    copyAll: 'Скопировать в буфер обмена',
    copiedAll: 'Скопировано',
    bulkNote: 'До 200 за раз. Генерация полностью локальная, лимиты API не тратятся.',
    needClass: 'Включите хотя бы один тип символов.',

    emailPlaceholder: 'name@example.com',
    emailButton: 'Проверить почту',
    emailChecking: 'Проверяю утечки...',
    emailInvalid: 'Введите корректный адрес почты.',
    emailClean: 'Хорошие новости, эта почта не найдена ни в одной известной утечке.',
    emailFound: (n) => `Найдена в ${n} утечк${ruEnding(n)}`,
    emailError: 'Не удалось проверить. Попробуйте позже.',
    emailRisk: 'Риск',
    emailRecords: 'записей',
    emailExposed: 'Что слили:',
    emailNote:
      'Работает на XposedOrNot. В отличие от паролей, адрес почты отправляется в их ' +
      'API для проверки (k-анонимность для почты невозможна).',
  },

  zh: {
    tagline: '测试你的密码有多强，以及它是否已经泄露。',
    privacy: '你的密码绝不会离开此浏览器。',
    tabCheck: '检测',
    tabGenerate: '生成',
    tabEmail: '邮箱',
    placeholder: '输入密码...',
    show: '显示',
    hide: '隐藏',
    scores: ['非常弱', '弱', '一般', '强', '非常强'],
    statLength: '长度',
    statCharset: '字符集',
    statEntropy: '熵',
    statCrack: '暴力破解',
    symbols: '个字符',
    bits: '比特',
    warnings: {
      short: '少于 12 个字符',
      lettersOnly: '仅字母，请加入数字和符号',
      digitsOnly: '仅数字，很容易被破解',
      repeat: '包含连续重复的字符',
      sequence: '包含常见的连续序列',
    },
    breachChecking: '正在查询泄露数据库...',
    breachPwned: (n) => `在 ${n.toLocaleString('en-US')} 次泄露中发现，请勿使用`,
    breachSafe: '未在任何已知泄露中发现',
    breachError: '泄露检查不可用（离线？）',
    howSummary: '泄露检查如何保护隐私？',
    howBody:
      'PassGuard 使用 Have I Been Pwned 的 k-匿名模型。你的密码在本地用 SHA-1 ' +
      '计算哈希，只有哈希的前五个字符会被发送。服务器永远不会知道你查询的是哪个密码。',
    source: '在 GitHub 查看源码',
    instant: '瞬间',
    units: { second: '秒', minute: '分钟', hour: '小时', day: '天', year: '年' },

    genHint: '密码在下方生成，并同时评分和检查泄露。',
    optLength: '长度',
    optLower: '小写字母 (a-z)',
    optUpper: '大写字母 (A-Z)',
    optDigits: '数字 (2-9)',
    optSymbols: '符号 (!@#...)',
    optSuffix: '结尾加大写字母 + "-" 或 "_"',
    genButton: '生成密码',
    copy: '复制',
    copied: '已复制',
    bulkTitle: '批量导出',
    optCount: '数量',
    dlTxt: '下载 .txt',
    dlMd: '下载 .md',
    copyAll: '复制到剪贴板',
    copiedAll: '已复制',
    bulkNote: '一次最多 200 个。生成完全在本地完成，不消耗任何 API 限额。',
    needClass: '请至少启用一种字符类型。',

    emailPlaceholder: 'name@example.com',
    emailButton: '检查邮箱',
    emailChecking: '正在检查泄露...',
    emailInvalid: '请输入有效的邮箱地址。',
    emailClean: '好消息，此邮箱未在任何已知泄露中发现。',
    emailFound: (n) => `在 ${n} 次泄露中发现`,
    emailError: '查询失败，请稍后再试。',
    emailRisk: '风险',
    emailRecords: '条记录',
    emailExposed: '泄露的数据：',
    emailNote:
      '由 XposedOrNot 提供。与密码不同，邮箱地址会被发送到其 API 进行查询' +
      '（邮箱无法使用 k-匿名）。',
  },
};

const SCALE_WORDS = {
  en: { million: 'million', billion: 'billion', trillion: 'trillion', quadrillion: 'quadrillion', quintillion: 'quintillion' },
  ru: { million: 'млн', billion: 'млрд', trillion: 'трлн', quadrillion: 'квдрлн', quintillion: 'квнтлн' },
  zh: { million: '百万', billion: '十亿', trillion: '万亿', quadrillion: '千万亿', quintillion: '百亿亿' },
};

// Russian has three plural forms, picked by the number.
function ruPlural(n, [one, few, many]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

// Ending for the Russian word "утечк-а/и/" after a number.
function ruEnding(n) {
  return ruPlural(n, ['е', 'ах', 'ах']);
}

const RU_FORMS = {
  second: ['секунду', 'секунды', 'секунд'],
  minute: ['минуту', 'минуты', 'минут'],
  hour: ['час', 'часа', 'часов'],
  day: ['день', 'дня', 'дней'],
  year: ['год', 'года', 'лет'],
};

const EN_PLURALS = { second: 'seconds', minute: 'minutes', hour: 'hours', day: 'days', year: 'years' };

// Format the crack-time parts from strength.js into a localized string.
export function formatCrackTime(parts, lang) {
  const t = STRINGS[lang];
  if (parts.kind === 'instant') return t.instant;

  if (parts.kind === 'scaled') {
    const scale = SCALE_WORDS[lang][parts.scale];
    const unit = unitWord(parts.unit, 2, lang); // always plural for huge numbers
    if (lang === 'zh') return `${parts.value} ${scale}${unit}`;
    return `${parts.value} ${scale} ${unit}`;
  }

  const value = parts.value.toLocaleString(lang === 'ru' ? 'ru-RU' : lang === 'zh' ? 'zh-CN' : 'en-US');
  return `${value} ${unitWord(parts.unit, parts.value, lang)}`;
}

function unitWord(unit, count, lang) {
  if (lang === 'ru') return ruPlural(count, RU_FORMS[unit]);
  if (lang === 'zh') return STRINGS.zh.units[unit];
  return count === 1 ? STRINGS.en.units[unit] : EN_PLURALS[unit];
}
