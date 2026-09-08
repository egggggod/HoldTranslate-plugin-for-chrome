# Changelog

All notable changes to the HoldTranslate extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.3.0] - 2026-09-08

### Added
- **Multi-Engine Translation Support**: Built-in support for **Google Translate** (zero-config), **Microsoft Translator** (Bing with automated session auth), **DeepSeek API** (`deepseek-chat`), and **Custom OpenAI-compatible API** (GPT-4o, Claude, SiliconFlow, Ollama, etc.).
- **Quick View Engine Switcher**: Added an interactive service dropdown capsule in the Quick Dashboard allowing instant switching between translation engines.
- **Dedicated LLM API Cards**: Clean configuration cards in Settings with secure storage for DeepSeek API Key and custom OpenAI-compatible endpoint parameters (Base URL, API Key, Model).

### Changed & Optimized
- **Visual-First Layout Ordering (视觉优先型)**: Reorganized settings controls into a clear, intuitive hierarchy: Master Switch → Visual Color Palette & Live Preview → Gestures & Delays → LLM / API Configuration.
- **Zero-Clipping Palette Spacing**: Added breathing room and visible overflow to the color chip container, ensuring the active halo indicator on the leftmost chip is perfectly rounded without clipping.
- **Streamlined Intent Delay Guidance**: Simplified explanation to `💡 鼠标按下多久后显示旋转圆圈，设为 0ms 为立即显示。`
- **Clean Chinese Text Handling**: Removed the Simplified/Traditional mutual translation switch; automatically skips native Chinese text on web pages when the target language is set to Chinese.

---

## [v1.2.0] - 2026-09-08

### Added
- **Circular Palette Color Picker (🎨)**: Integrated a circular palette button with native color picker at the end of the preset color row, allowing arbitrary custom font color selection with real-time HEX code sync.
- **Anti-Clipping Breathing Halo Selection**: Redesigned active chip indicator with double-layered shadow ring (card-color gap + dynamic theme ring), preventing any border collision or clipping of the color chip.
- **Whole-Plugin Dynamic Accent Color Sync**: The selected translation color now dynamically synchronizes across all colored plugin UI elements (switches, buttons, slider thumbs, hover states, and back arrow).
- **Simplified / Traditional Mutual Translation**: Replaced Chinese-to-English setting with a streamlined "Simplified/Traditional Mutual Translation" option (auto-translates Simplified to Traditional and Traditional to Simplified; skips Chinese text entirely when disabled).

---

## [v1.1.0] - 2026-09-08

### Added
- **Modern Dual-View Popup Redesign**: Redesigned popup UI inspired by Immersive Translate aesthetics, featuring a lightweight, compact Quick Dashboard (`#quickView`) and a full Settings Panel (`#settingsView`) with smooth in-popup slide transitions.
- **Instant Language Selector & Swap**: Prominent dual-capsule language dropdowns (`[Source Lang] ⇄ [Target Lang]`) on the quick panel, enabling 1-click source/target language selection and swapping without opening settings.
- **Service Bar & Page Status Detection**: Shows active translation service and dynamically inspects current tab permissions (indicating ready state on normal websites or restricted state on browser privileged pages).
- **System Adaptive Light/Dark Theming**: Full `@media (prefers-color-scheme: dark)` support, providing crisp, clean light styling and deep, comfortable dark styling.

---

## [v1.0.2] - 2026-09-08

### Fixed
- **Hyperlink Drag / Super Drag compatibility**: Fixed an issue where HTML5 `dragstart` on hyperlinks (`<a>`) was unintentionally blocked by `e.preventDefault()`, allowing hyperlinks to be slid/dragged open smoothly (supporting native drag-to-tab, drag-to-bookmark, and third-party Super Drag / Mouse Gesture extensions like CrxMouse and smartUp).
- **Graceful Drag Cancellation**: Seamlessly cancels any pending long-press translation timer and hides progress ring as soon as a drag operation begins, ensuring zero conflict between long-press translation and link dragging.

---

## [v1.0.1] - 2026-09-08

### Fixed
- **Stretched-link overlay bypass**: Pierced full-card pseudo-element link overlays (`a::before { inset: 0 }`, e.g. BBC headline cards) when clicking body text, correctly isolating paragraph translations.
- **Horizontal flex container positioning**: Fixed translation alignment in horizontal flex containers (such as BBC video items with play icons) so translation appears cleanly below rather than to the right.

### Changed
- Injected strict full-width and clear rules (`width: 100% !important; clear: both !important;`) on inline translated elements to guarantee consistent bottom positioning.

---

## [v1.0.0] - 2026-09-08

### Added
- **Core Long-press Engine**: Immersive long-press instant web translation and secondary long-press restoration.
- **1:1 Precision Typography**: Exact synchronization of font size, font weight (Windows medium-weight compensation), font style (italic), text decorations (underline/strikethrough), and serif vs. sans-serif families.
- **YouTube Adaptation**: Deep DOM traversal and nested extraction for `#video-title` elements.
- **Customizable Timing & Anti-Misclick**: Dual sliders for trigger duration (100ms~800ms) and confirmation buffer, with 16px mouse jitter tolerance.
- **Theme & Palette**: Built-in 7-color eye-care palette, HTML5 color picker with Hex input, and live dark/light preview card.
- **Smart Filtering**: Automatic skipping of Chinese text and optional toggle for Traditional Chinese translation.
