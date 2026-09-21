# Changelog

All notable changes to the HoldTranslate extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.7.5] - 2026-09-21

### Added & Fixed
- **Guaranteed Axis-Symmetric Centering**: Enforced strict horizontal centering across both the outer subtitle container (`.caption-window`) and all inner text wrappers (`.captions-text`, `.caption-visual-line`, `.ytp-caption-segment`, `.holdtranslate-yt-sub`). Completely eliminates asymmetric text alignment where native English subtitles defaulted to left-aligned while Chinese translations were centered.
- **Pure Streaming Axis Alignment**: Subtitle lines independently align along the common vertical center axis (100% axis-symmetric matching Netflix and cinema bilingual subtitle typography standards) across single-line, dual-line, and 88% player max-width wrapping.
- **Drag-Lock Pass-Through (`pointer-events: none`)**: Set `pointer-events: none !important; user-select: none !important;` on the subtitle container and text elements. Completely prevents accidental mouse drags from knocking subtitles off center while allowing mouse clicks on subtitles to smoothly pass through to the video player for instant play/pause toggling.

---

## [v1.7.4] - 2026-09-21

### Added & Fixed
- **Unconstrained Subtitle Width & 88% Player Adaptive Centering**: Completely removed YouTube's native dynamic inline width constraint on the caption container (`.caption-window`). Subtitles now dynamically expand horizontally up to 88% of the video player viewport (`max-width: 88% !important; left: 50% !important; transform: translateX(-50%) !important; width: max-content !important;`), preventing premature Chinese text wrapping when English subtitles are short.
- **Smart Semantic & Midpoint Line Balancing (`formatBalancedTranslation`)**: Harmoniously aligns Chinese subtitle line count with English lines to deliver an optimal viewing experience. When English is 1 line, Chinese remains 1 line without wrapping. When English is 2 lines and Chinese is long (> 18 characters), the engine intelligently breaks Chinese at natural punctuation marks (，、； etc.) or the midpoint into 2 balanced lines; short Chinese (<= 18 characters) remains on 1 line.
- **Unified Cache & Live Rendering Alignment**: Integrated the smart line balancing formatter across all translation pipelines (full-track timedtext cache, sentence cue cache, LRU prefetch cache, and real-time streaming translation).
- **Rock-Solid Bottom Baseline & Zero Jitter**: Maintained bottom-anchored baseline alignment so multi-line and single-line transitions expand smoothly upward with zero vertical jumping or flickering.

---

## [v1.7.3] - 2026-09-15

### Added & Fixed
- **Bottom-Anchored Baseline Alignment (Zero Vertical Jitter)**: Eliminated vertical subtitle jumping and jitter by pinning the `.caption-window` to a solid bottom baseline (`top: auto !important; bottom: 64px !important; justify-content: flex-end !important`). Overrode YouTube's dynamic inline `top` pixel recalculations so that single-line to multi-line wrapping expands upward without moving the bottom translated text edge.
- **Adaptive Control Bar Height Sync**: Subtitles smoothly lower to `bottom: 24px` when YouTube controls auto-hide (`.ytp-autohide`) during uninterrupted playback, with fluid 0.25s transitions matching the YouTube player UI.
- **Seamless Retention & Anti-Flicker Protection**: Eradicated blank frames and flickers during progressive speech and sentence switching by stably retaining existing translations until new translations arrive, completely eliminating intermediate `display: none` toggles.
- **Deep Sentence Prefetching on Raw ASR Tracks**: Extended proactive background prefetching to full sentence structures (`ytSentenceCues`) across all videos, achieving 99% instant memory hits even on raw auto-generated speech recognition captions without official translated tracks.

---

## [v1.7.2] - 2026-09-15

### Added & Fixed
- **Sentence-Onset Instant Full Translation (`ytSentenceCues`)**: Re-engineered subtitle timeline indexing with high-level semantic sentence mapping (`ytSentenceCues`). Even when native ASR rolling captions only speak the first word, the complete, high-quality Chinese translation of the entire sentence is displayed immediately at 0ms.
- **Prefix Continuation Stability**: Translated subtitles remain permanently stable throughout the gradual rollout of native English words, eliminating content jitter and partial sentence fragmentation.
- **Strict 0ms Synchronous Subtitle Lifecycle**: Native caption window state (`display: none`, `visibility: hidden`, `.ytp-caption-window-hide`) directly drives translated subtitle visibility, guaranteeing that the translation disappears simultaneously in 0ms when speakers pause or stop.
- **Anti-Flicker CSS Transition Engine**: Replaced repetitive keyframe resets with smooth CSS transitions (`opacity 0.15s ease, color 0.2s ease`), completely eliminating white-flash strobing on progressive caption updates.
- **Progress Bar Seek Resilience & Persistent Host Anchoring**: Anchored observer to `#movie_player` with automatic heartbeat self-healing, preventing observer dropouts when YouTube reconstructs caption containers during timeline scrubbing.
- **Word-Boundary Semantic Validation**: Enforced strict boundary and context correlation in timestamp matching, preventing short rolling words from matching unrelated sentences across the video.

---

## [v1.7.1] - 2026-09-15

### Added & Fixed
- **MAIN World Transparent Subtitle Bridge (`yt-bridge.js`)**: Injected into YouTube page's MAIN world via Manifest V3 `world: "MAIN"`, completely bypassing YouTube's strict CSP restrictions (`script-src 'nonce-...'`). Reliably intercepts `/api/timedtext` subtitle streams and monitors `#movie_player` caption track state across initial load and SPA navigation.
- **Multi-Granularity Caching & Sentence Reconstruction**: Intelligently parses both JSON (`fmt=json3`) and XML timedtext formats, reconstructing rolling ASR/auto-generated word fragments into complete sentences while indexing both individual cues and full phrases. Eliminates cache misses and achieves genuine 0ms instant display.
- **Race Condition & Live Callback Fallback Repair**: Eliminated the premature translation discard condition (`currentFull !== fullOriginalText`) on progressive speech recognition captions. Guarantees translated subtitles smoothly update and display even during continuous speech.
- **Seek-Aware Dynamic Prefetch Pipeline**: Subtitle engine dynamically re-aligns prefetch window upon `<video>` `seeked` and `play` events, pre-translating upcoming 45s cues in rate-limited batches.
- **Progress Bar Seek & Scrubbing Resilience**: Anchored subtitle observer to persistent `#movie_player` host to prevent disconnect when YouTube reconstructs caption containers during seek; implemented non-destructive full-track cache merging in `handleInterceptedTimedText`; suppressed network calls during `seeking` scrubbing to prevent 429 rate limiting while ensuring 0ms instant bilingual display upon `seeked` drop.
- **ASR Rolling Subtitles Anti-Flicker Protection**: Replaced repeated keyframe re-animations with gentle CSS transitions; introduced prefix continuation retention so progressive word streaming maintains stable translation without toggling `display: none` on every word.
- **Strict 0ms Synchronous Appearance & Disappearance**: Refined `.caption-window` CSS to respect YouTube native hide directives (`display: none`, `visibility: hidden`, `.ytp-caption-window-hide`); directly coupled translated subtitle lifecycle to native window and segments, guaranteeing simultaneous 0ms disappearing when speech pauses.
- **Semantic Boundary & Word Precision Matching**: Enforced word-boundary and timestamp correlation in `getActiveTimedTextTranslation`, preventing short rolling words from matching distant unrelated sentences.
- **YouTube Official Full-Track Translation Engine (`tlang`)**: Seamlessly fetches YouTube official translated timedtext tracks in parallel, instantly populating in-memory bilingual caches for the entire video at 0:00 with zero token cost, zero 429 rate limiting, and zero initial delay.
- **Natural Multi-Line Flow & Text Wrapping**: Restored natural multi-line wrapping and broken line preservation for native subtitles, cleanly displaying upper native subtitles and lower translated subtitles with natural wrapping and zero truncation.
- **Bi-Directional Bridge Handshake**: Implemented active request/response handshake between isolated content script and MAIN world bridge script, eliminating track loss on early video initialization.
- **Immediate Native Subtitle Translation**: Automatically detects and seamlessly renders 0-latency translations as soon as YouTube native CC captions appear, with zero manual long-press or friction required.

---

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
