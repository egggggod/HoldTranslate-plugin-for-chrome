<div align="right">
  <strong><a href="README.md">English</a></strong> | <a href="README_zh.md">简体中文</a>
</div>

# HoldTranslate

Immersive long-press instant web translation & smooth restoration for Google Chrome!

> **A super quick reminder:**  
> HoldTranslate is designed for **pure reading flow and zero visual clutter**. No giant popup cards, no intrusive Google logos, and no clunky toolbars. The translation seamlessly renders as native-like bilingual subtitles right below the original text, inheriting 100% of the surrounding typography.

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](manifest.json)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Releases](https://img.shields.io/badge/Release-v1.5.0-green.svg)](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Demo

> Works smoothly across all modern web pages, including complex responsive sites, dynamic feeds (YouTube, X/Twitter), and classic academic/news layouts (BBC, Economist, ArXiv).

Here is a demo of using the latest [HoldTranslate Chrome extension](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.5.0/holdtranslate-chrome-extension-v1.5.0.zip) (click to download v1.5.0) installed in Chrome:

### 1. Immersive Reading in Light Mode (e.g. News & Articles)
![Light Mode Demo](assets/demo-light.png)

### 2. Dark Mode & Nested Video Titles (e.g. YouTube Video Titles)
![Dark Mode Demo](assets/demo-dark.png)

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
│   └── demo-dark.png
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

- 📱 **Apple iOS Sliding Subpage Architecture (Zero Height Lengthening)**: Implemented an Apple iOS Settings-grade sliding subpage architecture for language and translation service selection. The popup window height **strictly remains locked at 225px** without any downward stretching, jitter, or overflow issues.
- ⚡ **Tactile 120ms Auto-Return Flow**: Selecting an option immediately displays an energetic green checkmark (`✓`) with instant tactile confirmation, then smoothly auto-slides back to the Quick View after 120ms. Manual navigation via the `← 返回` button and Escape key is always available.
- 🍏 **Apple 2025 Floating Island Bar & Specular Sheen**: Reconstructed the bottom bar into an Apple WWDC25 June 2025 unified floating crystal island (`.floating-island-bar`) combining `[⚙️ Settings]`, `[● 就绪 · v1.5.0]`, and `[↗ Test Page]`. Features 115° specular sheen sweeps on hover and `scale(0.97)` tactile press indentation physics.
- 🌐 **Minimalist Multi-Engine Architecture**: Clean English naming across all services (**Google Translate**, **Microsoft Translator**, **DeepSeek API**, and **Custom API**) while preserving localized Chinese for intuitive language selection.
- 🪟 **VisionOS Liquid Glass & Frosted Transparency**: High-transparency frosted glass (`backdrop-filter: blur(28px) saturate(190%)`), dynamic multi-color ambient fluid mesh glow, specular edge bevel reflections, and Obsidian dark glass mode.
- 🎛️ **Clean & Decluttered Settings Hierarchy**: Removed leading emojis from section titles, streamlined LLM cards to concise labels and placeholder demonstrations (`sk-...`, `https://api.openai.com/v1`), and provided an independent Liquid Glass switch.
- 🎯 **1:1 Typography & Rich-Text Mirroring**: Matches exact computed font sizes (including YouTube `#video-title` nested structures), automatically mirrors `bold`, `italic`, `underline`, and detects Serif vs. Sans-serif.
- 🎨 **Zero-Clipping Palette & Full-Theme Sync**: Circular 🎨 palette button with generous container breathing room ensuring the active halo indicator on the leftmost chip is perfectly rounded without clipping. Chosen color dynamically synchronizes across all colored plugin UI elements and fluid orbs.
- 🖱️ **Seamless Drag & Gesture Compatibility**: Full support for sliding/dragging hyperlinks (native drag-to-tab, Super Drag, and mouse gesture extensions like CrxMouse and smartUp) without interfering with long-press translation.
- 📋 **Dual Translation Modes**: Long-press any block for full paragraph translation, or select text first to translate specific excerpts.
- 🛡️ **Adaptive Light/Dark Theming**: Auto-detects system theme with 7 eye-care presets, custom Hex input, and live dark/light preview.

### 🚀 Quick Install Guide

1. **Manual Installation (Recommended - latest v1.5.0)**
   - Download the pre-packaged zip from our **[Releases Page](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** (or direct download: [holdtranslate-chrome-extension-v1.5.0.zip](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.5.0/holdtranslate-chrome-extension-v1.5.0.zip))
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

## Release Page & Versioning

- **Releases**: Check our **[Releases Page](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** for all version changelogs and downloadable `.zip` bundles.
- **Versioning Strategy**: This project follows [Semantic Versioning](https://semver.org/) (`vMAJOR.MINOR.PATCH`).
  - Current Version: `v1.5.0`
  - `v1.5.0`:
    - **Zero-Height-Lengthening Architecture**: Implemented Apple iOS Settings-grade horizontal sliding subpage (`#subpageView`) for selecting Source Language, Target Language, and Translation Services. The popup height strictly remains locked at 225px with zero vertical expansion or window jitter;
    - **Tactile 120ms Auto-Return**: Instant green checkmark (`✓`) confirmation upon item selection with smooth 120ms automatic slide-back to Quick View, alongside manual return via top-left button and Escape key;
    - **VisionOS Frosted Subpages**: Designed frosted glass list items with smooth hover transitions, subtle micro scrollbars, and full theme synchronization;
    - **100% Backward Compatibility**: Preserved all original select and menu DOM IDs for seamless integration with existing automated testing suites.
  - `v1.4.4`:
    - Resolved language selection popover clipping bug caused by parent card overflow restriction;
    - Preserved high-transparency Apple 2025 VisionOS Liquid Glass aesthetic with anchored left/right popovers, micro-spring transitions, and active checkmarks (`✓`);
    - Maintained compact ~225px zero-whitespace window at rest with elastic morphing to 375px when dropdowns are opened.
  - `v1.4.3`:
    - Recreated Apple WWDC25 June 2025 software redesign language: unified floating island pill bar (`.floating-island-bar`), 115° specular sheen sweep on hover, and 0.97 tactile press indentation.
    - Completely eliminated blank whitespace under "就绪", reducing closed window height from 568px to 225px.
    - Added elastic popover expansion allowing floating dropdowns to display without any bottom boundary clipping.
    - Verified with DOM (44/44 IDs) and E2E translation automated test suites.
  - `v1.4.2`:
    - Cleaned up main interface service naming to standard English (`Google Translate`, `Microsoft Translator`, `DeepSeek API`, `Custom API`).
    - Implemented Apple-grade physics: iOS view transitions, spring elongation switches (`cubic-bezier(0.34, 1.56, 0.64, 1)`), spring-popped active color chips, and tactile range slider thumb scaling.
    - Docked status badge cleanly into the bottom bar center (`● 就绪 · v1.4.2`), eliminating bottom whitespace and shrinking popup height to an ultra-compact ~220px.
    - Minimalist settings styling: removed emoji icons from section headers, removed verbose introduction text from LLM cards, retaining clean demonstration placeholders.
  - `v1.4.1`:
    - Replaced clunky OS native `<select>` dropdowns with custom Apple VisionOS Liquid Glass floating popovers for both translation service and language selectors.
    - Designed ultra-clean minimalist option layouts: colorful official brand logos (Google, Microsoft, DeepSeek, Custom API) + soft green checkmark indicators (`✓`).
    - Added backdrop-blur (28px) frosted glass depth, specular edge highlights, smooth scale-in spring animations, and automatic outside/Escape dismiss.
    - Full bidirectional synchronization between custom popovers and hidden `<select>` elements, preserving 100% backward compatibility and test coverage.
  - `v1.4.0`:
    - Implemented Apple VisionOS inspired Liquid Glass UI system with high frosted transparency (20%~38% card opacity) and specular bevel highlights.
    - Dynamic multi-color ambient fluid mesh glow behind the frosted glass with real-time theme color refraction.
    - Added dedicated Liquid Glass toggle switch in Settings (Visual Appearance) with instant fallback to classic crisp solid card mode.
    - Graphicalized and decluttered Quick View: pure icon bottom bar (⚙️ Settings + ↗ Test Page), glowing micro-pill status indicator (`● 就绪`), and section header icons (`✨/⏱️/🤖`).
  - `v1.3.0`:
    - Added Microsoft Translator and mainstream LLM API support (DeepSeek + Custom OpenAI-compatible).
    - Quick View engine switcher dropdown capsule.
    - Optimized settings layout to Visual-First hierarchy (Switch → Palette & Preview → Gestures → API Config).
    - Fixed palette container padding and overflow to completely eliminate leftmost chip halo clipping.
    - Streamlined intent confirmation delay explanation.
    - Removed mutual Chinese translation toggle and automatically skip native Chinese on Chinese pages.
  - `v1.2.0`:
    - Added circular palette button (🎨) for arbitrary custom font color picking.
    - Added breathing halo selection ring with card background spacing to prevent clipping or obscuring color chips.
    - Synchronized chosen translation color to all colored plugin UI elements (switches, buttons, slider thumbs, hover states).
  - `v1.1.0`:
    - Modern dual-view popup redesign: minimalist quick dashboard + smooth in-popup navigation to full settings.
    - 1-click dual-capsule language selection bar (`[Source] ⇄ [Target]`) with instant language swapping.
    - Added service bar and real-time tab permission / readiness status detection.
    - Full system-adaptive light and dark visual themes.
  - `v1.0.2`:
    - Fixed HTML5 `dragstart` handling on hyperlinks so links can be slid/dragged open smoothly.
    - Added graceful drag cancellation: instantly aborts pending translation timer and hides progress ring upon drag initiation.
    - `v1.0.1`:
    - Resolved stretched-link overlay issue on BBC and news cards.
    - Fixed horizontal flex container translation placement.
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
