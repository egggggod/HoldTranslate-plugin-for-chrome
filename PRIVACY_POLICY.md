# Privacy Policy for HoldTranslate

Last updated: October 13, 2026

**HoldTranslate** ("we", "our", or "the extension") is an open-source browser extension developed by egggggod. We are firmly committed to protecting the privacy of our users. This Privacy Policy explains our data practices and outlines how information is handled when you use HoldTranslate.

---

## 1. Single Purpose & Core Functionality

HoldTranslate serves a single, narrow purpose: providing instant, inline long-press web translation and real-time video subtitle translation directly in Google Chrome.

---

## 2. Information We Do NOT Collect

HoldTranslate operates entirely on your local device. We do **NOT** collect, store, sell, or transmit any personal data:

- **No Personally Identifiable Information (PII)**: We do not collect names, emails, addresses, phone numbers, or age.
- **No Browsing History or Web Activity**: We do not track, log, or monitor the websites you visit, your search history, or your clicks.
- **No Keystroke or Input Logging**: We do not monitor forms, passwords, or keyboard inputs.
- **No Analytics or Telemetry**: There are no tracking scripts, Google Analytics, telemetry libraries, or advertising SDKs embedded in the extension.
- **No Cookies**: We do not use cookies or tracking tokens.

---

## 3. How Data Is Processed

- **User Preferences & Settings (`storage` permission)**:  
  Your custom settings (such as target language, trigger duration, font styling, and chosen translation provider) are stored strictly locally via `chrome.storage.local`. This data never leaves your device.
- **Text Translation Requests**:  
  When you intentionally perform a long-press gesture on a word, sentence, or subtitle segment, only the selected text snippet is transmitted directly to the translation provider you selected (Google Translate, Microsoft Translator, DeepSeek, or your custom API endpoint) solely to obtain the corresponding translation. We do not operate any intermediate proxy server, and we never retain or log your translated content.

---

## 4. No Remote Code Execution

HoldTranslate adheres strictly to Chrome Manifest V3 security standards. All JavaScript, CSS, and asset files are packaged locally within the extension archive. The extension does **NOT** download, load, or execute any remote scripts, WebAssembly, or dynamically evaluated code (`eval`).

---

## 5. Third-Party Services

When requesting translations, the selected text is transmitted to the translation service chosen by the user in the extension settings:
- **Google Translate**: Subject to [Google Privacy Policy](https://policies.google.com/privacy)
- **Microsoft Translator**: Subject to [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement)
- **DeepSeek API**: Subject to [DeepSeek Terms & Privacy](https://www.deepseek.com)
- **Custom Endpoints**: Subject to the user's configured provider.

---

## 6. Contact & Open Source Transparency

HoldTranslate is 100% open source under the MIT License. You can review the complete source code, audit data flows, or file inquiries at:

- **GitHub Repository**: [https://github.com/egggggod/HoldTranslate-plugin-for-chrome](https://github.com/egggggod/HoldTranslate-plugin-for-chrome)
- **Issue Tracker & Support**: [https://github.com/egggggod/HoldTranslate-plugin-for-chrome/issues](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/issues)
- **Official Website**: [https://holdtranslate.vercel.app](https://holdtranslate.vercel.app)

---

# 隐私权政策 (中文版)

更新日期：2026 年 10 月 13 日

**HoldTranslate**（以下简称“本扩展”）是一款由 egggggod 开发并开源的浏览器扩展程序。我们高度重视并严格保护每位用户的隐私。本隐私权政策旨在向您说明本扩展的数据使用与隐私保护实践。

---

## 1. 单一用途

HoldTranslate 具有明确具体的单一用途：在 Google Chrome 浏览器中为用户提供就地长按划选翻译以及 YouTube / X 视频实时双语字幕展示。

## 2. 我们不收集的数据

HoldTranslate 纯本地运行，**绝不收集、不存储、不出售、不传输**任何用户个人信息：
- **不收集个人身份信息**：不收集姓名、电子邮箱、地址、联系方式等；
- **不收集网页历史或用户活动**：不记录您访问的网址列表、浏览历史或操作行为；
- **不收集表单与击键记录**：不监控键盘按键、密码或私人通讯；
- **无追踪与分析代码**：扩展内未集成任何第三方分析代码（如 Google Analytics）、遥测追踪或广告 SDK；
- **不使用 Cookies**：不使用任何 Cookie 或设备标识符。

## 3. 数据处理与本地存储

- **用户偏好设置 (`storage` 权限)**：  
  您的目标语言、触发时长、译文字体色彩与翻译服务引擎等配置项仅通过 `chrome.storage.local` 保存在您的本地浏览器中，绝不上报远程服务器。
- **划选翻译请求**：  
  仅当您主动长按选中文本或播放开启字幕时，选中的文本片段会直接向您所选定的翻译服务商（Google 翻译、微软翻译、DeepSeek 或自定义 API）发起接口请求以获取译文。开发者未搭建任何中转服务器，亦不保留任何用户翻译内容。

## 4. 绝不使用远程代码

HoldTranslate 严格遵循 Chrome Manifest V3 安全规范，所有代码均打包在扩展本地，绝不通过外部加载任何远程 JS 脚本或 Wasm 代码。

## 5. 开源审计与联系方式

本扩展 100% 开源：
- **开源仓库**：https://github.com/egggggod/HoldTranslate-plugin-for-chrome
- **问题反馈与支持**：https://github.com/egggggod/HoldTranslate-plugin-for-chrome/issues
- **项目落地页**：https://holdtranslate.vercel.app
