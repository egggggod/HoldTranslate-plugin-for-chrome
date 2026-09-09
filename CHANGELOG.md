# Changelog

All notable changes to the HoldTranslate extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.7.0] - 2026-09-09

### Added
- **Zero-Latency Subtitle Prefetching Engine**: Introduced YouTube TimedText caption full-track parsing and forward lookahead prefetching pipeline. Automatically pre-translates upcoming subtitle cues within a 35-second window into a high-performance in-memory LRU cache, ensuring 0ms instant display synchronized with original spoken audio and eliminating network lag disconnect.
- **1:1 Dynamic Subtitle Typography Mirroring**: Dynamically extracts computed font properties (`font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`) directly from YouTube native caption segments (`.ytp-caption-segment`) and mirrors them 1:1 onto translated subtitles, adapting smoothly across fullscreen, theater, and mini-player viewports.
- **Edge-to-Edge Native Window Architecture**: Re-engineered popup root layout (`html, body`) to edge-to-edge seamless integration, letting Google Chrome render native OS rounded corners and drop shadows without outer clipping frames, while preserving internal Apple VisionOS liquid glass cards.

---

## [v1.6.2] - 2026-09-09

### Fixed
- **Remove Outer Square Frame**: Eliminated redundant 6px outer wrapper and 352px box, restoring pure 16px corner radius and unified visual aesthetics.
- **Restore Full Natural Settings Height**: Removed rigid `body { height: 225px }` constraint on Settings view (`#settingsView`), restoring full natural height expansion with comfortable 460px vertical scroll.

---

## [v1.6.1] - 2026-09-09

### Added & Fixed
- **Seamless YouTube Native Subtitle Translation**: Repaired messaging port lifecycle and communication casing mismatch (`runtime.onMessage`), ensuring reliable background translation delivery.
- **Container Line Wrapping & Flow**: Fixed text overflow and clipping in `.ytp-caption-window-bottom` with vertical Flexbox stacking. Translation appears cleanly beneath native subtitles, active out-of-the-box (`true`).

---

## [v1.6.0] - 2026-09-09

### Added
- **Real-Time Video Subtitle Translation Engine**: Built-in real-time video subtitle translation for YouTube and X (Twitter) videos.
- **Dual Display Modes**: Toggle between **Bilingual Mode** (original text on top + accent-colored translation below) and **Translation-Only Mode** via Apple-style segmented switch.
- **Dedicated Settings Subtitle Card**: Integrated dedicated video subtitles card with master toggle in Settings, preserving compact 225px Quick View.
- **LRU Video Subtitle Cache**: Integrated 600-entry in-memory cache to prevent redundant API calls during continuous video playback.

---

## [v1.5.0] - 2026-09-08

### Added
- **Constant 225px Zero-Lengthening Architecture**: Apple iOS Settings-grade horizontal sliding subpage (`#subpageView`) for selecting Source Language, Target Language, and Translation Services. Strictly locks popup height at 225px, completely eliminating downward window lengthening, jitter, and edge clipping.
- **Tactile 120ms Auto-Return Flow**: Selecting an option instantly displays an energetic green checkmark (`✓`) with soft capsule tint, smoothly auto-sliding back to Quick View after 120ms. Manual return via top-left `← 返回` capsule and keyboard `Escape` supported.
- **VisionOS Frosted Subpage Cards**: 12px rounded list cards with subtle hover micro-interactions, ultra-thin scrollbars, and dynamic accent color highlights.
- **100% Backward DOM Compatibility**: Preserved all original select and menu DOM IDs for seamless integration with existing automated testing suites.

---

## [v1.4.4] - 2026-09-08

### Fixed
- **Language Dropdown Clipping Fix**: Resolved language selection popover clipping bug caused by parent card overflow restriction; preserved high-transparency Apple 2025 VisionOS Liquid Glass aesthetic with anchored left/right popovers, micro-spring transitions, and active checkmarks (`✓`).
- **Elastic Window Morphing**: Maintained compact ~225px zero-whitespace window at rest with elastic morphing to 375px when dropdowns are opened.

---

## [v1.4.3] - 2026-09-08

### Added
- **Apple 2025 Liquid Glass & Floating Island**: Recreated Apple June 2025 software redesign language: unified floating island pill bar (`.floating-island-bar`), 115° specular sheen sweep on hover, and 0.97 tactile press indentation.
- **Whitespace Elimination**: Completely eliminated blank whitespace under "就绪", reducing closed window height from 568px to 225px.

---

## [v1.4.2] - 2026-09-08

### Changed & Optimized
- **Minimalist English Service Names**: Cleaned up main interface service naming to standard English (`Google Translate`, `Microsoft Translator`, `DeepSeek API`, `Custom API`).
- **Apple Motion Physics**: Implemented iOS view transitions, spring elongation switches (`cubic-bezier(0.34, 1.56, 0.64, 1)`), spring-popped active color chips, and tactile range slider thumb scaling.
- **Docked Status Badge**: Docked status badge cleanly into the bottom bar center (`● 就绪 · v1.4.2`), eliminating bottom whitespace.

---

## [v1.4.1] - 2026-09-08

### Added
- **VisionOS Floating Popovers**: Replaced clunky OS native `<select>` dropdowns with custom Apple VisionOS Liquid Glass floating popovers for both translation service and language selectors.
- **Bidirectional State Sync**: Full bidirectional synchronization between custom popovers and hidden `<select>` elements, preserving 100% backward compatibility.

---

## [v1.4.0] - 2026-09-08

### Added
- **Apple VisionOS Liquid Glass UI System**: High frosted transparency (20%~38% card opacity) with specular bevel highlights and dynamic ambient fluid glow.
- **Visual Appearance Toggle**: Added dedicated Liquid Glass toggle switch in Settings with instant fallback to classic crisp solid card mode.
- **Graphicalized Quick View**: Pure icon bottom bar (⚙️ Settings + ↗ Test Page) and glowing micro-pill status indicator.

---

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
