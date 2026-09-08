# Changelog

All notable changes to the HoldTranslate extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
