# 🛡️ PassGuard

**语言：** [English](README.md) · [Русский](README.ru.md) · **中文**

[![CI](https://github.com/Ka1nnnn/passguard/actions/workflows/ci.yml/badge.svg)](https://github.com/Ka1nnnn/passguard/actions/workflows/ci.yml)
[![Deploy](https://github.com/Ka1nnnn/passguard/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ka1nnnn/passguard/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![零依赖](https://img.shields.io/badge/dependencies-0-success)

一个完全在浏览器中运行、注重隐私的**密码强度与泄露检测工具**。它评估密码的熵值和破解时间，并告诉你该密码是否出现在已知的数据泄露中 —— **而且绝不会把你的密码发送到任何地方。**

### 🔗 [在线演示](https://Ka1nnnn.github.io/passguard/)

---

## ✨ 功能

- **实时强度指示器** —— 以比特表示的熵、字符集大小，以及预估的暴力破解时间。
- **基于 k-匿名的泄露检测** —— 使用 [Have I Been Pwned](https://haveibeenpwned.com/API/v3#PwnedPasswords) Pwned Passwords API。
- **真正的隐私保护** —— 密码在本地哈希，只有 SHA-1 哈希的前 5 个字符会离开浏览器。
- **多语言界面** —— 英语、俄语和中文，可即时切换。
- **零依赖** —— 纯 HTML/CSS/JS，无需构建，无后端，免费静态托管。
- **已测试** —— 纯逻辑由单元测试和 CI 覆盖。

## 🔒 隐私泄露检测的工作原理

直接用泄露数据库检查密码意味着*把密码发送到服务器* —— 这正是绝不应该做的事。PassGuard 通过 **k-匿名** 模型避免了这一点：

1. 密码在**浏览器中用 SHA-1 哈希**。
2. 只有该哈希的**前 5 个十六进制字符**被发送到 API。
3. API 返回**所有**共享该前缀的泄露哈希（数以百计）。
4. 你的浏览器在**本地**比对剩余的 35 个字符。

因此服务器永远不会知道你查询的是哪个密码 —— 甚至不知道是哪个完整哈希。

## 🚀 本地运行

无需构建工具。由于使用了 ES 模块，请通过 HTTP 提供服务（而非 `file://`）：

```bash
# 克隆仓库后，在项目目录下：
python -m http.server 8000
# 打开 http://localhost:8000
```

## 🧪 测试

强度/熵逻辑无依赖，并使用 Node 内置测试运行器进行单元测试：

```bash
node --test
```

## 📁 项目结构

```
passguard/
├── index.html          # 标记
├── styles.css          # 样式
├── src/
│   ├── strength.js     # 熵、评分、破解时间（纯逻辑，已测试）
│   ├── hibp.js         # SHA-1 + k-匿名泄露查询
│   ├── i18n.js         # EN/RU/ZH 字符串 + 本地化格式
│   └── app.js          # DOM 绑定
├── test/
│   └── strength.test.js
└── .github/workflows/  # CI + GitHub Pages 部署
```

## ⚠️ 免责声明

PassGuard 是一个教育工具。熵值是理论估计，真正的攻击者可能使用更聪明的字典方法。请在各处使用密码管理器和唯一的密码。

## 📄 许可证

[MIT](LICENSE)
