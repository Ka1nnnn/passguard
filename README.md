# 🛡️ PassGuard

**Languages:** **English** · [Русский](README.ru.md) · [中文](README.zh.md)

[![CI](https://github.com/Ka1nnnn/passguard/actions/workflows/ci.yml/badge.svg)](https://github.com/Ka1nnnn/passguard/actions/workflows/ci.yml)
[![Deploy](https://github.com/Ka1nnnn/passguard/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ka1nnnn/passguard/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![No dependencies](https://img.shields.io/badge/dependencies-0-success)

A privacy-friendly **password toolkit** that runs entirely in your browser. Three tabs:

- **Check** - rate a password's entropy and crack time, and see if it has leaked (via k-anonymity - the password never leaves your browser).
- **Generate** - build strong passwords with a slider for length and toggles for character classes, then export up to 200 at once to `.txt`/`.md`.
- **Email** - look up an email address against known data breaches and see exactly what was exposed.

### 🔗 [Live demo](https://Ka1nnnn.github.io/passguard/)

| Check | Generate | Email |
|:--:|:--:|:--:|
| <img src="docs/screenshot-check.png" width="240"> | <img src="docs/screenshot.png" width="240"> | <img src="docs/screenshot-email.png" width="240"> |

---

## ✨ Features

- **Real-time strength meter** - entropy in bits, character-set size, and an estimated brute-force time.
- **Password breach check via k-anonymity** - uses the [Have I Been Pwned](https://haveibeenpwned.com/API/v3#PwnedPasswords) Pwned Passwords API; the password is hashed locally and only the first 5 characters of the SHA-1 hash ever leave the browser.
- **Password generator** - cryptographically secure RNG, adjustable length, selectable character classes, plus an option to end with a capital letter and `-`/`_`.
- **Bulk export** - generate up to 200 passwords at once, copy them all, or download as `.txt`/`.md` (fully local - no API limits used).
- **Email breach lookup** - checks an address against [XposedOrNot](https://xposedornot.com/) and shows the risk score plus per-breach details (date, records, exposed data classes).
- **Light/dark theme** - toggle in the header; your theme and language are remembered between visits.
- **Multilingual UI** - English, Russian and Chinese, switchable at runtime.
- **Zero dependencies** - plain HTML/CSS/JS, no build step, no backend, free static hosting.
- **Tested** - pure logic is covered by 27 unit tests and CI.

## 🔒 How the private password breach check works

Checking a password against a breach database naively would mean *sending the password to a server* - exactly what you should never do. PassGuard avoids this using the **k-anonymity** model:

1. The password is hashed with **SHA-1 in your browser**.
2. Only the **first 5 hex characters** of that hash are sent to the API.
3. The API returns **every** breached hash sharing that prefix (hundreds of them).
4. Your browser checks the remaining 35 characters **locally**.

The server therefore never learns which password - or even which full hash - you asked about.

> **Note on the email check:** an email lookup *does* send the address to the XposedOrNot API - k-anonymity is not possible for emails. The UI states this clearly. Only the password check is k-anonymous.

## 🚀 Run locally

No build tools required. Because it uses ES modules, serve it over HTTP (not `file://`):

```bash
# clone, then from the project folder:
python -m http.server 8000
# open http://localhost:8000
```

## 🧪 Tests

The strength, generator, export and email-parsing logic is dependency-free and unit-tested with Node's built-in runner:

```bash
node --test
```

## 📁 Project structure

```
passguard/
├── index.html          # markup (3 tabs)
├── styles.css          # styling
├── src/
│   ├── strength.js     # entropy, scoring, crack-time (pure, tested)
│   ├── hibp.js         # SHA-1 + k-anonymity password breach lookup
│   ├── generate.js     # CSPRNG password generator (pure, tested)
│   ├── download.js     # build & download .txt/.md exports
│   ├── email.js        # XposedOrNot email breach lookup + parsing
│   ├── i18n.js         # EN/RU/ZH strings + localized formatting
│   └── app.js          # DOM wiring
├── test/               # strength / generate / download / email tests
└── .github/workflows/  # CI + GitHub Pages deploy
```

## ⚠️ Disclaimer

PassGuard is an educational tool. The entropy figure is a theoretical estimate and a real attacker may use smarter, dictionary-based methods. Breach data comes from third-party services and may be incomplete. Use a password manager and unique passwords everywhere.

## 📄 License

[MIT](LICENSE)
