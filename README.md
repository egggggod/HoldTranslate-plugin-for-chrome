<div align="right">
  <strong><a href="README.md">English</a></strong> | <a href="README_zh.md">简体中文</a>
</div>

# HoldTranslate

Immersive long-press instant web translation & smooth restoration for Google Chrome!

> **A super quick reminder:**  
> HoldTranslate is designed for **pure reading flow and zero visual clutter**. No giant popup cards, no intrusive Google logos, and no clunky toolbars. The translation seamlessly renders as native-like bilingual subtitles right below the original text, inheriting 100% of the surrounding typography.

[![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)](manifest.json)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Releases](https://img.shields.io/badge/Release-v1.0.2-green.svg)](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Demo

> Works smoothly across all modern web pages, including complex responsive sites, dynamic feeds (YouTube, X/Twitter), and classic academic/news layouts (BBC, Economist, ArXiv).

Here is a demo of using the latest [HoldTranslate Chrome extension](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.0.2/holdtranslate-chrome-extension-v1.0.2.zip) (click to download v1.0.2) installed in Chrome:

### 1. Immersive Reading in Light Mode (e.g. News & Articles)
![Light Mode Demo](assets/demo-light.png)

### 2. Dark Mode & Nested Video Titles (e.g. YouTube Video Titles)
![Dark Mode Demo](assets/demo-dark.png)

## Overview

This project consists of three core components:

1. **Precision Typography Synchronizer**: A DOM inspection engine that automatically extracts and mirrors the original font-size, font-weight (with Windows medium-weight compensation), font-style (italic), text-decorations (underline/strikethrough), and font-family (serif vs. sans-serif).
2. **Interactive Long-Press Engine**: A dual-slider timing and anti-misclick system (100ms~800ms duration slider + confirmation buffer + 16px micro-jitter tolerance) with secondary long-press instant restoration.
3. **Immersive Customizer**: Built-in 7-color eye-care palette, HTML5 color picker with Hex input, and real-time dual-mode preview.

## Project Structure

```bash
HoldTranslate-plugin-for-chrome/
├── assets/             # Demo screenshots and previews
│   ├── demo-light.png
│   └── demo-dark.png
├── icons/              # Extension icons (16x16, 48x48, 128x128)
├── manifest.json       # Chrome Manifest V3 configuration
├── background.js       # Background service worker & translation API dispatcher
├── content.js          # Core DOM observer, typography extractor, long-press engine
├── content.css         # Minimal inline translation animations and styles
├── popup.html          # Extension settings popup UI
├── popup.css           # Settings panel layout & preview styling
├── popup.js            # Settings logic, color picker & slider controls
├── test.html           # Comprehensive test suite (YouTube title, rich text, dark mode)
├── LICENSE             # MIT License
├── README.md           # English documentation
└── README_zh.md        # Chinese documentation (简体中文)
```

The project is organized cleanly without bundlers or heavy build steps—pure modern web technologies that run directly in Chrome.

## Browser Extension

The browser extension embeds bilingual translations directly beneath web text without disturbing the original DOM hierarchy.

### Features

- 🎯 **1:1 Typography & Rich-Text Mirroring**: Matches exact computed font sizes (including YouTube `#video-title` nested structures), automatically mirrors `bold`, `italic`, `underline`, and detects Serif vs. Sans-serif.
- 🔄 **Long-Press to Translate & Smooth Restore**: Long-press to reveal the translation; long-press again to smoothly fade out and restore the original page view.
- ⚡ **Adjustable Timing & Anti-Misclick Engine**: Custom sliders for trigger duration (100ms~800ms) and confirmation hover buffer to eliminate accidental clicks.
- 🪟 **Seamless Drag & Gesture Compatibility**: Full support for sliding/dragging hyperlinks (native drag-to-tab, Super Drag, and mouse gesture extensions like CrxMouse and smartUp) without interfering with long-press translation.
- 📋 **Dual Translation Modes**: Long-press any block for full paragraph translation, or select text first to translate specific excerpts.
- 🛡️ **Smart Language Filtering**: Automatically skips existing Chinese text; toggleable switch for translating Traditional Chinese to Simplified Chinese.
- 🎨 **Clean, Customizable Aesthetics**: Pure transparent background with 7 eye-care presets (defaulting to immersive olive green `#86a003`), custom Hex input, and live dark/light preview.

### 🚀 Quick Install Guide

1. **Manual Installation (Recommended - latest v1.0.2)**
   - Download the pre-packaged zip from our **[Releases Page](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** (or direct download: [holdtranslate-chrome-extension-v1.0.2.zip](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.0.2/holdtranslate-chrome-extension-v1.0.2.zip))
   - Unzip the archive
   - Open Chrome and navigate to `chrome://extensions/`
   - Turn on **"Developer mode"** (top right corner)
   - Click **"Load unpacked"** and select the unzipped directory

2. **Git Clone Installation (For Developers)**
   ```bash
   git clone https://github.com/egggggod/HoldTranslate-plugin-for-chrome.git
   ```
   - Load the cloned folder directly via `chrome://extensions/`.

### 🎉 Getting Started

Once installed, just:

1. Click on the **HoldTranslate** icon in the Chrome toolbar to customize your preferred text color, trigger duration, or confirmation buffer.
2. Visit any website (or open the included [`test.html`](test.html) in Chrome).
3. **Press and hold the left mouse button** on any text or paragraph for ~500ms.
4. The translated subtitles will smoothly slide in directly below the source text.
5. Long-press again whenever you want to restore the original view!

## Why Use HoldTranslate?

- **Zero Distraction**: No banner ads, no watermark cards, and no floating widgets cluttering your screen.
- **Visual Harmony**: The translation blends seamlessly into the webpage typography as if it was authored natively.
- **Accurate & Effortless**: Powered by high-speed Google Translate API with built-in micro-jitter tolerance.
- **Privacy & Lightweight**: Pure vanilla JavaScript without tracking, external dependencies, or telemetry.

## Release Page & Versioning

- **Releases**: Check our **[Releases Page](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** for all version changelogs and downloadable `.zip` bundles.
- **Versioning Strategy**: This project follows [Semantic Versioning](https://semver.org/) (`vMAJOR.MINOR.PATCH`).
  - Current Version: `v1.0.2`
  - `v1.0.2`:
    - Fixed HTML5 `dragstart` handling on hyperlinks so links can be slid/dragged open smoothly (supporting native drag-to-tab, drag-to-bookmark, and Super Drag / Mouse Gesture extensions like CrxMouse and smartUp).
    - Added graceful drag cancellation: instantly aborts pending translation timer and hides progress ring upon drag initiation.
  - `v1.0.1`:
    - Resolved stretched-link overlay issue on BBC and news cards (clicking article descriptions no longer mis-triggers the headline link above).
    - Fixed horizontal flex container translation placement (e.g. BBC related video links with `▶` icons now correctly display translations on their own line underneath instead of to the right).
    - Strengthened inline full-width formatting (`width: 100% !important; clear: both !important;`).
  - `v1.0.0`: Initial release with 1:1 typography mirroring, YouTube deep extraction, custom color palette, and anti-misclick sliders.
  - To upgrade an existing installation: simply download the latest release zip, replace the folder contents, and click the refresh button (⟳) in `chrome://extensions/`.

## Contributing

Contributions are warmly welcome! Feel free to:

- Submit bug reports and suggestions via [GitHub Issues](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/issues)
- Propose new features or website-specific adaptations
- Create pull requests

## License

MIT License - feel free to use and modify as needed.
