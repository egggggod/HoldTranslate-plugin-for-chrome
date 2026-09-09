<div align="right">
  <strong><a href="README.md">English</a></strong> | <a href="README_zh.md">简体中文</a>
</div>

# HoldTranslate

Immersive long-press instant web translation & smooth restoration for Google Chrome!

> **A super quick reminder:**  
> HoldTranslate is designed for **pure reading flow and zero visual clutter**. No giant popup cards, no intrusive Google logos, and no clunky toolbars. The translation seamlessly renders as native-like bilingual subtitles right below the original text, inheriting 100% of the surrounding typography.

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](manifest.json)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Releases](https://img.shields.io/badge/Release-v1.7.0-green.svg)](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Demo

> Works smoothly across all modern web pages, including complex responsive sites, dynamic feeds (YouTube, X/Twitter), and classic academic/news layouts (BBC, Economist, ArXiv).

Here is a demo of using the latest [HoldTranslate Chrome extension](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.7.0/holdtranslate-chrome-extension-v1.7.0.zip) (click to download v1.7.0) installed in Chrome:

### 1. Immersive Reading in Light Mode (e.g. News & Articles)
![Light Mode Demo](assets/demo-light.png)

### 2. Dark Mode & Nested Video Titles (e.g. YouTube Video Titles)
![Dark Mode Demo](assets/demo-dark.png)

### 3. YouTube Native Video Subtitle Translation (Zero-Latency Bilingual Display)
![YouTube Subtitles Demo](assets/demo-subtitles.png)

## Overview

This project consists of three core pillars:

1. **Precision Typography Synchronizer**: A DOM inspection engine that automatically extracts and mirrors the original font-size, font-weight (with Windows medium-weight compensation), font-style (italic), text-decorations (underline/strikethrough), and font-family (serif vs. sans-serif).
2. **Multi-Engine Intelligence & Translation Dispatcher**: Seamlessly connects to **Google Translate** (zero-config default), **Microsoft Translator** (Bing with automated session auth), **DeepSeek Official API** (`deepseek-chat`), and any **Custom OpenAI-Compatible Endpoint** (GPT-4o, Claude, SiliconFlow, Ollama, Kimi).
3. **Interactive Long-Press Engine & Visual Customizer**: A visual-first settings hierarchy featuring a zero-clipping circular palette picker, dynamic theme synchronization across all UI components, and timing sliders (100ms~800ms trigger duration + intention confirmation buffer).

## Project Structure

```bash
HoldTranslate-plugin-for-chrome/
├── assets/             # Demo screenshots and previews
│   ├── demo-light.png
│   ├── demo-dark.png
│   └── demo-subtitles.png
├── icons/              # Extension icons (16x16, 48x48, 128x128)
├── manifest.json       # Chrome Manifest V3 configuration
├── background.js       # Multi-service worker (Google, Microsoft, DeepSeek, Custom LLM)
├── content.js          # Core DOM observer, typography extractor, long-press engine
├── content.css         # Minimal inline translation animations and styles
├── popup.html          # Adaptive dual-view popup UI
├── popup.css           # Modern popup styling, palette halo spacing & cards
├── popup.js            # Dual-view navigation, engine switcher, color & API bindings
├── test.html           # Comprehensive test suite (YouTube title, rich text, dark mode)
├── LICENSE             # MIT License
├── README.md           # English documentation
└── README_zh.md        # Chinese documentation (简体中文)
```

The project is organized cleanly without bundlers or heavy build steps—pure modern web technologies that run directly in Chrome.

## Browser Extension

The browser extension embeds bilingual translations directly beneath web text without disturbing the original DOM hierarchy.

### Features

- ⚡ **Zero-Latency Subtitle Prefetching Engine**: Introduced YouTube TimedText full-track parsing and predictive lookahead prefetching. Ahead of time, the background pipeline stream-translates upcoming cues within 35 seconds into the high-performance LRU cache, guaranteeing **0ms instant display** in perfect synchronization with original subtitles; gracefully falls back to ultra-fast real-time streaming.
- 🎯 **1:1 Dynamic Subtitle Typography Mirroring**: Dynamically extracts computed font attributes (`font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`) from YouTube native caption segments and applies them directly to translated subtitles, naturally resizing across fullscreen and mini-player modes.
- 🪟 **Edge-to-Edge Native Integration (Zero Cutout Frame)**: Adopted native edge-to-edge popup architecture matching top-tier Chrome extensions. `html, body` seamlessly fill the window, letting Chrome render native OS rounded corners and drop shadows without any triangular corner artifacts, while internal components retain full Apple VisionOS liquid glass aesthetics.
- 📱 **Apple iOS Sliding Subpage Architecture (Zero Height Lengthening)**: Implemented an Apple iOS Settings-grade sliding subpage architecture for language and translation service selection. The popup window height **strictly remains locked at 225px** without any downward stretching, jitter, or overflow issues.
- ⚡ **Tactile 120ms Auto-Return Flow**: Selecting an option immediately displays an energetic green checkmark (`✓`) with instant tactile confirmation, then smoothly auto-slides back to the Quick View after 120ms. Manual navigation via the `← 返回` button and Escape key is always available.
- 🍏 **Apple 2025 Floating Island Bar & Specular Sheen**: Reconstructed the bottom bar into an Apple WWDC25 June 2025 unified floating crystal island (`.floating-island-bar`) combining `[⚙️ Settings]`, `[● 就绪 · v1.7.0]`, and `[↗ Test Page]`. Features 115° specular sheen sweeps on hover and `scale(0.97)` tactile press indentation physics.
- 🌐 **Minimalist Multi-Engine Architecture**: Clean English naming across all services (**Google Translate**, **Microsoft Translator**, **DeepSeek API**, and **Custom API**) while preserving localized Chinese for intuitive language selection.
- 🎛️ **Clean & Decluttered Settings Hierarchy**: Dedicated "🎬 视频字幕" configuration card with master switch and Apple-style segmented control (`[双语对照]` / `[仅译文]`), keeping Quick View locked at 225px.
- 🎯 **1:1 Typography & Rich-Text Mirroring**: Matches exact computed font sizes (including YouTube `#video-title` nested structures), automatically mirrors `bold`, `italic`, `underline`, and detects Serif vs. Sans-serif.
- 🎨 **Zero-Clipping Palette & Full-Theme Sync**: Circular 🎨 palette button with generous container breathing room ensuring the active halo indicator on the leftmost chip is perfectly rounded without clipping. Chosen color dynamically synchronizes across all colored plugin UI elements and fluid orbs.
- 🖱️ **Seamless Drag & Gesture Compatibility**: Full support for sliding/dragging hyperlinks (native drag-to-tab, Super Drag, and mouse gesture extensions like CrxMouse and smartUp) without interfering with long-press translation.
- 📋 **Dual Translation Modes**: Long-press any block for full paragraph translation, or select text first to translate specific excerpts.
- 🛡️ **Adaptive Light/Dark Theming**: Auto-detects system theme with 7 eye-care presets, custom Hex input, and live dark/light preview.

### 🚀 Quick Install Guide

1. **Manual Installation (Recommended - latest v1.7.0)**
   - Download the pre-packaged zip from our **[Releases Page](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** (or direct download: [holdtranslate-chrome-extension-v1.7.0.zip](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.7.0/holdtranslate-chrome-extension-v1.7.0.zip))
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

1. Click on the **HoldTranslate** icon in the Chrome toolbar to select your preferred translation engine or configure LLM API keys.
2. Visit any website (or open the included [`test.html`](test.html) in Chrome).
3. **Press and hold the left mouse button** on any text or paragraph for ~500ms.
4. The translated subtitles will smoothly slide in directly below the source text.
5. Long-press again whenever you want to restore the original view!

## Why Use HoldTranslate?

- **Zero Distraction**: No banner ads, no watermark cards, and no floating widgets cluttering your screen.
- **Visual Harmony**: The translation blends seamlessly into the webpage typography as if it was authored natively.
- **Multi-Engine Power**: Choose fast free web translation (Google/Microsoft) or cutting-edge LLM reasoning translation (DeepSeek/GPT-4o).
- **Privacy & Lightweight**: Pure vanilla JavaScript without tracking, external dependencies, or telemetry.

## Changelog

For the complete release history and detailed changelog, please refer to **[CHANGELOG.md](CHANGELOG.md)** or visit our **[GitHub Releases](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** page.

## Contributing

Contributions are warmly welcome! Feel free to:

- Submit bug reports and suggestions via [GitHub Issues](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/issues)
- Propose new features or website-specific adaptations
- Create pull requests

## License

MIT License - feel free to use and modify as needed.

## Acknowledgments

Special thanks to Gemini 3.8 Flash.

