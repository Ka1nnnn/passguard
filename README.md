# 🛡️ PassGuard

**Languages:** **English** · [Русский](README.ru.md) · [中文](README.zh.md)

[![CI](https://github.com/Ka1nnnn/passguard/actions/workflows/ci.yml/badge.svg)](https://github.com/Ka1nnnn/passguard/actions/workflows/ci.yml)
[![Deploy](https://github.com/Ka1nnnn/passguard/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ka1nnnn/passguard/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![No dependencies](https://img.shields.io/badge/dependencies-0-success)

A privacy-friendly **password strength & breach checker** that runs entirely in your browser. It rates a password's entropy and crack time, and tells you whether the password has appeared in a known data breach — **without ever sending your password anywhere.**

### 🔗 [Live demo](https://Ka1nnnn.github.io/passguard/)

---

## ✨ Features

- **Real-time strength meter** — entropy in bits, character-set size, and an estimated brute-force time.
- **Breach check via k-anonymity** — uses the [Have I Been Pwned](https://haveibeenpwned.com/API/v3#PwnedPasswords) Pwned Passwords API.
- **Truly private** — the password is hashed locally; only the first 5 characters of the SHA-1 hash leave the browser.
- **Multilingual UI** — English, Russian and Chinese, switchable at runtime.
- **Zero dependencies** — plain HTML/CSS/JS, no build step, no backend, free static hosting.
- **Tested** — pure logic is covered by unit tests and CI.

## 🔒 How the private breach check works

Checking a password against a breach database naively would mean *sending the password to a server* — exactly what you should never do. PassGuard avoids this using the **k-anonymity** model:

1. The password is hashed with **SHA-1 in your browser**.
2. Only the **first 5 hex characters** of that hash are sent to the API.
3. The API returns **every** breached hash sharing that prefix (hundreds of them).
4. Your browser checks the remaining 35 characters **locally**.

The server therefore never learns which password — or even which full hash — you asked about.

## 🚀 Run locally

No build tools required. Because it uses ES modules, serve it over HTTP (not `file://`):

```bash
# clone, then from the project folder:
python -m http.server 8000
# open http://localhost:8000
```

## 🧪 Tests

The strength/entropy logic is dependency-free and unit-tested with Node's built-in runner:

```bash
node --test
```

## 📁 Project structure

```
passguard/
├── index.html          # markup
├── styles.css          # styling
├── src/
│   ├── strength.js     # entropy, scoring, crack-time (pure, tested)
│   ├── hibp.js         # SHA-1 + k-anonymity breach lookup
│   ├── i18n.js         # EN/RU/ZH strings + localized formatting
│   └── app.js          # DOM wiring
├── test/
│   └── strength.test.js
└── .github/workflows/  # CI + GitHub Pages deploy
```

## ⚠️ Disclaimer

PassGuard is an educational tool. The entropy figure is a theoretical estimate and a real attacker may use smarter, dictionary-based methods. Use a password manager and unique passwords everywhere.

## 📄 License

[MIT](LICENSE)
