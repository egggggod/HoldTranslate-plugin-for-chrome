<div align="center">

# HoldTranslate

**网页沉浸式长按翻译 / 还原 Chrome 扩展**  
**Immersive Long-Press Web Translation & Restore Chrome Extension**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](manifest.json)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-red.svg)](https://www.google.com/chrome/)

[简体中文](#-简体中文) | [English](#-english)

</div>

---

## 🇨🇳 简体中文

### 📖 项目简介
**HoldTranslate** 是一款基于 Chrome Manifest V3 标准开发的**沉浸式网页长按即时翻译扩展**。

告别繁琐的复制粘贴、右键菜单和单独的翻译标签页。只需在网页任意文字或段落上**长按鼠标左键**，即可将内容快速翻译，并在原文正下方以原生字幕形式直接嵌入；再次长按即可平滑淡出还原，丝毫不破坏网页原本的版面与结构。

---

### 🌟 核心特性

1. **极致沉浸式双语排版**：
   - **无卡片、无外边框**：告别大块背景色块、突兀的卡片阴影与多余的控制条。
   - **完全透明背景**：自动融入网页原有底色，深色模式、浅色模式自适应。
   - **无多余标牌干扰**：不展示任何 Google Translate 水印或外挂图标，呈现如同原生双语字幕般的优雅阅读体验。

2. **1:1 原生排版与富文本样式智能镜像**：
   - **字号精准匹配**：严格提取原文计算字号；针对 YouTube 标题（`#video-title`）等深层嵌套结构做了深度穿透适配，解决传统翻译插件字号失真偏小的问题。
   - **字重 / 加粗自动同步**：原文加粗（`bold` / `600` / `700`+），译文自动同步加粗；针对 Windows 微软雅黑环境下 Medium（`500`）字重降级为 400 细体的问题进行了智能视觉补偿加粗。
   - **斜体与下划线完整继承**：原文包含斜体（`italic`）、下划线（`underline`）或删除线（`line-through`）时，译文 100% 对应还原。
   - **衬线体与非衬线体智能感知**：英文衬线体（学术论文、新闻刊物）智能对应优雅中文宋体；常规无衬线体对应清晰现代黑体。
   - **行高与字间距智能对齐**：杜绝文字重叠与版面拉伸。

3. **极简鼠标长按交互与防误触机制**：
   - **触发时间可调节滑块**：支持 100ms ~ 800ms（间隔 100ms）自由设定，随心掌控长按节奏。
   - **确认时间防误触滑条**：具备可调的悬停缓冲时间与 16px 鼠标微动防抖容差，日常快速浏览与点击链接绝不误触。
   - **长按即时平滑还原**：再次长按已翻译的原文段落，或直接长按译文段落，译文平滑淡出移除，瞬间还原页面。
   - **段落与划词双模式**：直接长按自动提取整段翻译；鼠标划选高亮文字后长按仅翻译选区。
   - **独立段落隔离**：点击新段落不会意外重置上一段已翻译内容，支持多段落双语对照阅读。

4. **语言智能识别与多向过滤**：
   - **中文跳过过滤**：自动识别语言，对纯中文或已翻译文本自动跳过，防止反复请求。
   - **繁体中文翻译开关**：可在设置面板中自由选择是否将繁体中文翻译为简体中文。
   - **稳定高速翻译通道**：基于 Google Translate 快速接口实现极速响应。

5. **个性化调色板与实时预览**：
   - 内置 7 款精选护眼配色（默认沉浸橄榄绿 `#86a003`、天湖蓝、琥珀金、翡翠绿、紫罗兰等）。
   - 支持 HTML5 原生色盘与 Hex 色值精准自定义。
   - 扩展设置弹窗提供深色/浅色背景双语实时预览效果。

---

### 📦 版本管理与更新记录

本项目严格遵循 [Semantic Versioning (语义化版本)](https://semver.org/lang/zh-CN/) 规范：`MAJOR.MINOR.PATCH`（主版本号.次版本号.修订号）。

* **当前版本号**：**`v1.0.0`**

#### 📋 版本历史 (Changelog)

| 版本 | 发布日期 | 更新内容 |
| :--- | :--- | :--- |
| **`v1.0.0`** | 2026-09-07 | 🎉 **初版正式发布**：<br>• Chrome Manifest V3 架构实现沉浸式长按即时翻译<br>• 长按翻译与二次长按平滑还原，支持划词与整段翻译<br>• 100ms~800ms 长按触发时间与确认响应时间双滑条配置<br>• 1:1 字号、字重（含 Windows 500 字重补偿）、斜体、下划线、衬线体样式全同步<br>• 专项深度穿透解决 YouTube 标题字号失真问题<br>• 智能语言检测：中文跳过开关、繁体中文翻译开关<br>• 7 色护眼预设调色板、自定义 Hex 颜色与深浅色模式实时预览卡片 |

#### 🔄 开发者版本更新指南 (How to Update Version)
后续功能迭代或修复 Bug 时，请按以下标准化流程更新版本：
1. **更新扩展版本号**：打开 `manifest.json`，修改 `"version": "x.y.z"` 字段；
2. **记录更新日志**：在 `README.md` 的版本历史表格中追加对应版本的更新条目；
3. **提交与推送**：
   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   git tag v1.0.1
   git push origin main --tags
   ```

---

### 🚀 安装与体验步骤

1. 克隆或下载本仓库到本地：
   ```bash
   git clone https://github.com/egggggod/HoldTranslate-plugin-for-chrome.git
   ```
2. 打开 Google Chrome 浏览器，在地址栏输入访问：`chrome://extensions/`；
3. 打开右上角的 **“开发者模式” (Developer mode)** 开关；
4. 点击左上角的 **“加载已解压的扩展程序” (Load unpacked)**；
5. 选择下载/克隆的项目根目录；
6. 打开任意网页或本地测试页 [`test.html`](test.html)，长按鼠标左键体验！

---

### 📁 项目文件结构

```text
HoldTranslate-plugin-for-chrome/
├── manifest.json       # Chrome 扩展配置文件 (Manifest V3)
├── background.js       # 后台 Service Worker，负责 Google 翻译请求分发
├── content.js          # 核心脚本：长按事件监听、排版智能提取、译文插入与还原
├── content.css         # 沉浸式译文动画与最小化基础样式
├── popup.html          # 扩展设置弹窗界面
├── popup.css           # 设置面板样式与实时预览卡片
├── popup.js            # 设置逻辑（滑块控制、调色板、开关持久化）
├── test.html           # 全功能本地测试基准页（含 YouTube 标题、斜体、下划线等测试卡片）
├── icons/              # 扩展程序图标（16x16, 48x48, 128x128）
├── LICENSE             # MIT 开源协议
└── README.md           # 中英文双语项目说明文档
```

---

## 🇺🇸 English

### 📖 Introduction
**HoldTranslate** is an **immersive web long-press instant translation Chrome extension** built with the modern Chrome Manifest V3 standard.

Say goodbye to awkward copy-pasting, context menus, and separate translation tabs. Simply **long-press the left mouse button** on any text or paragraph to instantly translate and embed native-like bilingual subtitles directly below the original text. Long-press again to smoothly restore the original layout without altering the page DOM structure.

---

### 🌟 Key Features

1. **Pure Immersive Bilingual Layout**:
   - **Zero Cards, Zero Borders**: No bulky colored boxes, heavy drop-shadows, or clunky toolbars.
   - **Fully Transparent Background**: Seamlessly inherits the host page background—adapts flawlessly to pure black, dark, and light themes.
   - **No Distracting Watermarks**: No Google Translate logos, badges, or redundant icons—delivers a clean, native subtitle reading experience.

2. **1:1 Typography & Rich-Text Mirroring**:
   - **Precise Font Size Matching**: Strictly computes the source element's font size. Features specialized deep-penetration parsing for complex nested structures like YouTube's `#video-title` to eliminate undersized translations.
   - **Font-Weight & Bold Synchronization**: Source bold text (`bold` / `600` / `700`+) is automatically rendered in matching bold weights. Includes smart visual compensation on Windows where `500` (Medium) weights otherwise downgrade to `400` thin text in Microsoft YaHei.
   - **Italic & Underline Preservation**: Full fidelity preservation of `italic` font styles, `underline` text decorations, and `line-through` strike-outs.
   - **Serif vs. Sans-serif Intelligence**: Automatically renders classic Chinese Songti for Serif sources (academic papers, journals) and clean modern Heiti for Sans-serif web interfaces.
   - **Line-Height & Letter-Spacing Alignment**: Eliminates text overlap, layout stretching, or awkward line breaks.

3. **Intuitive Long-Press & Anti-Misclick Controls**:
   - **Customizable Duration Slider**: Freely adjust the trigger duration between 100ms and 800ms (100ms steps) to match your reading speed.
   - **Confirmation Buffer Slider**: Configurable hover confirmation buffer and 16px micro-jitter tolerance prevent accidental triggers during normal browsing and link clicking.
   - **Smooth Instant Restore**: Long-press the original paragraph or the translation element to smoothly fade out and remove the translation.
   - **Dual Translation Modes**: Long-press directly to translate whole paragraphs, or select specific text first to translate excerpts.
   - **Isolated Paragraph Memory**: Clicking or translating a new paragraph never resets existing translated blocks, enabling seamless side-by-side reading.

4. **Smart Language Detection & Filtering**:
   - **Chinese Skip Filter**: Automatically detects language and skips pure Chinese or already-translated paragraphs.
   - **Traditional Chinese Switch**: Easily toggle whether to translate Traditional Chinese into Simplified Chinese.
   - **Fast & Reliable Translation**: Direct, efficient Google Translate API integration.

5. **Customizable Palette with Live Preview**:
   - 7 curated eye-care color presets (defaulting to the signature immersive olive green `#86a003`, Sky Blue, Amber Gold, Emerald Green, Violet, etc.).
   - Supports HTML5 native color picker and exact Hex input.
   - Popup offers real-time bilingual previews in both light and dark backgrounds.

---

### 📦 Versioning & Release Workflow

This project adheres to the [Semantic Versioning](https://semver.org/) specification (`MAJOR.MINOR.PATCH`).

* **Current Version**: **`v1.0.0`**

#### 📋 Version History (Changelog)

| Version | Date | Highlights |
| :--- | :--- | :--- |
| **`v1.0.0`** | 2026-09-07 | 🎉 **Initial Official Release**:<br>• Built on Chrome Manifest V3 for lightweight, zero-overhead translation<br>• Long-press to translate & secondary long-press to smoothly restore<br>• Dual sliders for 100ms~800ms trigger duration and confirmation buffer<br>• 1:1 font size, font weight (with Windows 500-weight compensation), italic, underline, and serif synchronization<br>• Deep-tree DOM penetration to resolve YouTube video title font-size discrepancies<br>• Smart language detection: skip Chinese toggle & Traditional Chinese translation toggle<br>• 7 eye-care preset colors, custom Hex input, and live dark/light preview cards |

#### 🔄 Guide for Updating Versions (For Developers)
When developing new features or bug fixes, bump the version using these steps:
1. **Update Manifest**: Edit `manifest.json` and update `"version": "x.y.z"`;
2. **Update Changelog**: Add the new version entry and release notes to `README.md`;
3. **Commit & Push**:
   ```bash
   git add .
   git commit -m "chore: release vX.Y.Z"
   git tag vX.Y.Z
   git push origin main --tags
   ```

---

### 🚀 Installation & Usage

1. Clone or download this repository:
   ```bash
   git clone https://github.com/egggggod/HoldTranslate-plugin-for-chrome.git
   ```
2. Open Google Chrome and go to `chrome://extensions/`;
3. Turn on the **"Developer mode"** toggle in the top right;
4. Click the **"Load unpacked"** button in the top left;
5. Select the project directory;
6. Open any webpage or the local [`test.html`](test.html) file, and long-press the left mouse button to test!

---

### 📁 Project Structure

```text
HoldTranslate-plugin-for-chrome/
├── manifest.json       # Chrome Extension Manifest (V3)
├── background.js       # Background service worker & Google Translate API dispatcher
├── content.js          # Core DOM observer, typography extractor, long-press engine
├── content.css         # Minimal inline translation animations and styles
├── popup.html          # Extension settings popup UI
├── popup.css           # Settings panel layout & preview styling
├── popup.js            # Settings logic, color picker & slider controls
├── test.html           # Comprehensive test suite (YouTube title, rich text, dark mode)
├── icons/              # Extension icons (16x16, 48x48, 128x128)
├── LICENSE             # MIT License
└── README.md           # Bilingual documentation & versioning guide
```

---

### 📄 License

This project is licensed under the [MIT License](LICENSE).
