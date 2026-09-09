<div align="right">
  <a href="README.md">English</a> | <strong><a href="README_zh.md">简体中文</a></strong>
</div>

# HoldTranslate

网页沉浸式长按翻译与平滑还原 Chrome 扩展！

> **极速体验备忘：**  
> HoldTranslate 专为**无感阅读与零视觉干扰**而生。没有笨重的大色块卡片，没有突兀的 Google 图标水印，更没有花哨多余的控制栏。译文如原生双语字幕般自然融入在原文正下方，100% 同步继承原文的所有排版细节。

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](manifest.json)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Releases](https://img.shields.io/badge/Release-v1.7.0-green.svg)](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 演示 (Demo)

> 完美适配绝大多数现代网页，包括复杂自适应流式页面、社交动态流（YouTube、X/Twitter）以及经典学术/新闻刊物（BBC、经济学人、ArXiv 等）。

点击直接下载最新版 [HoldTranslate Chrome 扩展安装包](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.7.0/holdtranslate-chrome-extension-v1.7.0.zip) (v1.7.0)，解压后即可在 Chrome 中体验：

### 1. 浅色模式沉浸式阅读效果（如新闻、论文长文）
![浅色模式演示](assets/demo-light.png)

### 2. 深色模式与嵌套标题适配（如 YouTube 视频标题）
![深色模式演示](assets/demo-dark.png)

### 3. YouTube 原生视频字幕实时翻译（0 延迟双语对照）
![YouTube 视频字幕演示](assets/demo-subtitles.png)

## 项目概览 (Overview)

本项目由三大核心模块构成：

1. **精准排版同步引擎 (Precision Typography Synchronizer)**：智能 DOM 分析器，1:1 提取并镜像原文的计算字号、粗体字重（针对 Windows 微软雅黑 Medium 字重做了视觉补偿）、斜体、下划线/删除线以及衬线体/非衬线体属性。
2. **多引擎智能翻译调度分发中心 (Multi-Engine Dispatcher)**：无缝集成 **Google 翻译**（免配置零门槛）、**Microsoft 微软翻译**（全自动 Session 凭证鉴权）、**DeepSeek 官方大模型 API**（`deepseek-chat`）以及任意 **自定义 OpenAI 兼容接口**（GPT-4o、Claude、硅基流动、Ollama、Kimi 等）。
3. **视觉优先设置体系与沉浸调色 (Visual-First Customizer & Timing Engine)**：采用视觉优先型层次结构，彻底解决色块边框遮挡，全域联动插件主题色，精简意图确认出圈时延说明，并支持二次长按平滑还原。

## 项目结构 (Project Structure)

```bash
HoldTranslate-plugin-for-chrome/
├── assets/             # 效果演示截图与预览素材
│   ├── demo-light.png
│   ├── demo-dark.png
│   └── demo-subtitles.png
├── icons/              # 扩展图标 (16x16, 48x48, 128x128)
├── manifest.json       # Chrome 扩展配置文件 (Manifest V3)
├── background.js       # 多服务后台 Service Worker (Google, 微软, DeepSeek, 自定义 LLM)
├── content.js          # 核心脚本：长按事件监听、排版智能提取、译文插入与还原
├── content.css         # 沉浸式译文动画与基础样式
├── popup.html          # 扩展设置双视图弹窗界面
├── popup.css           # 设置面板样式、调色盘呼吸留白与 API 配置卡片
├── popup.js            # 双视图切换、引擎选择器、调色板联动与 API 持久化
├── test.html           # 全场景本地测试基准页（含 YouTube 标题、斜体、下划线等）
├── LICENSE             # MIT 开源协议
├── README.md           # 英文主说明文档
└── README_zh.md        # 中文说明文档 (简体中文)
```

整个项目结构轻量清晰，不依赖任何第三方打包工具或重量级依赖，纯原生现代 Web 技术编写，开箱即用。

## 浏览器扩展特性 (Features)

- ⚡ **YouTube 字幕 0 延迟秒级同步引擎 (Zero-Latency Subtitle Prefetching)**：全面引入 YouTube TimedText 轨全量与流式向前预取机制，自动在后台提前将 upcoming 35 秒的字幕批次翻译存入高速 LRU 缓存池；视频播放至对应画面时直接 0ms 瞬间命中，彻底根治网络时延导致的译文与原文字幕弹出时间脱节问题；未命中自动平滑降级为极速实时流。
- 🎯 **视频字幕 1:1 动态排版镜像 (Dynamic Typography Mirroring)**：实时动态提取 YouTube 原生字幕段落的计算样式，将 `font-family`、`font-size`、`font-weight`、`line-height`、`letter-spacing` 等 1:1 动态精准赋给译文字幕，支持全屏播放与小窗缩放自适应，彻底消除字体突兀感；保持强调色高对比度呈现。
- 🪟 **边缘直通无穿帮弹窗体系 (Edge-to-Edge Native Integration)**：彻底废除外层角隅裁切与多余外框，`html, body` 采用与成熟主流扩展一致的边缘直通无感设计，由 Chrome 宿主窗口自身呈现原生圆角与系统立体投影，彻底根除“方背景下叠一层弧形”的视觉穿帮缺陷；内部卡片全面维持苹果 VisionOS 液态玻璃圆角胶囊与流体光晕。
- 📱 **Apple iOS 紧凑平滑滑动子页面架构（选择语言零变长、恒定 225px）**：采用苹果 iOS 设置级水平推拉子页面架构（`.show-subpage #subpageView`）。无论选择源语言、目标语言还是翻译服务，弹窗开窗高度**绝对严格锁定在 225px**，彻底消除界面抖动与上下拉长变形。
- ⚡ **120ms 触觉确认平滑回弹流**：点击任意语言或服务选项，立即点亮精致绿勾（`✓`）与柔和胶囊底色提供即时触觉确认，随后经 120ms 平滑滑动自动返回主面板；左上角 `← 返回` 胶囊按钮与键盘 ESC 键随时可手动返回。
- 🍏 **Apple 2025 灵动玻璃岛与光影交互 (Floating Island Bar & Specular Sheen)**：底部控制栏重构为苹果 2025 最新官方软件设计风格的统一浮动晶莹药丸岛（`.floating-island-bar`），一体化整合 `[⚙️ 设置]`、`[● 就绪 · v1.7.0]` 和 `[↗ 测试页]`；引入 115° 镜面光泽掠影（Hover Specular Sheen Sweep）与 `0.97` 触觉回弹微凹陷（Tactile Press Indentation）。
- 🌐 **极简纯英服务标识 (Minimal English Services)**：主界面翻译服务全面取消冗余中文字样，统一采用标准英文品牌名称（**Google Translate**、**Microsoft Translator**、**DeepSeek API**、**Custom API**），语言选择器保留地道中文以符合直觉。
- 🎛️ **去冗余纯净设置体系**：偏好设置内新增「🎬 视频字幕」专属配置卡片，包含总开关与 Apple 风格分段选择器（`[双语对照]` / `[仅译文]`），快捷主面板维持 225px 黄金高度不变。
- 🎯 **1:1 原生排版与富文本样式镜像**：精准匹配原文计算字号（专项穿透适配 YouTube `#video-title` 标题），自动同步加粗、斜体、下划线，智能感知衬线体（宋体）与非衬线体（黑体）。
- 🎨 **零遮挡呼吸调色盘与动态流体光晕联动**：圆形调色盘按钮（🎨）呼出系统拾色器；容器四周增加呼吸间距彻底杜绝最左侧色块贴边遮挡；切换颜色时，底层环境流体光球与界面强调色实时同步变色。
- 🖱️ **超链接滑动/手势完美兼容**：全面兼容鼠标左键滑动/拖拽超链接（支持拖拽至标签页、书签栏打开，以及 CrxMouse、smartUp 等超级拖拽插件与鼠标手势），长按翻译与滑动打开互不干扰。
- 📋 **段落与划词双模式**：直接长按翻译整段文本；先划选高亮文字再长按仅翻译选定内容。
- 🛡️ **自适应深浅双色美感**：根据系统与浏览器主题自动切换纯净浅白或沉浸深黑，内置 7 色护眼预设，支持自定义 Hex 色值与深浅色模式实时预览。

### 🚀 快速安装指南 (Quick Install Guide)

1. **直接下载安装包（推荐 - 最新 v1.7.0）**
   - 访问我们的 **[Releases 发布页面](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)**（或点击直接下载：[holdtranslate-chrome-extension-v1.7.0.zip](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.7.0/holdtranslate-chrome-extension-v1.7.0.zip)）；
   - 解压下载好的 `.zip` 文件；
   - 打开 Chrome 浏览器，在地址栏输入访问：`chrome://extensions/`；
   - 打开页面右上角的 **“开发者模式”**；
   - 点击左上角的 **“加载已解压的扩展程序”**，选择刚刚解压的文件夹。

2. **Git 克隆安装（适合开发者）**
   ```bash
   git clone https://github.com/egggggod/HoldTranslate-plugin-for-chrome.git
   ```
   - 同样在 `chrome://extensions/` 中点击“加载已解压的扩展程序”选择克隆目录即可。

### 🎉 开始使用 (Getting Started)

安装完成后：
1. 点击 Chrome 工具栏中的 **HoldTranslate** 图标，在快捷面板秒切翻译引擎，或进入设置填写大模型 API Key；
2. 访问任意英文或外语网页（也可在 Chrome 中直接打开项目内的 [`test.html`](test.html) 本地测试页）；
3. 在任意文本段落上**长按鼠标左键**约 500ms；
4. 译文将如同原生双语字幕般平滑出现在原文下方；
5. 需要恢复纯净页面时，再次长按即可平滑移除！

## 为什么选择 HoldTranslate？ (Why Use HoldTranslate?)

- **零干扰 (Zero Distraction)**：没有广告、没有水印卡片、没有阻挡视线的悬浮窗。
- **视觉浑然一体 (Visual Harmony)**：译文字号与排版与原文 100% 严密贴合，视觉体验如网页天生自带双语。
- **多引擎随心选 (Multi-Engine)**：免配置的 Google/微软高速接口与高智能大模型（DeepSeek/GPT-4o）随时切换。
- **纯净安全 (Privacy & Lightweight)**：纯原生 JavaScript 编写，无第三方打包埋点，无任何数据追踪。

## 更新日志 (Changelog)

完整版本发布历史与更新明细请参阅 **[CHANGELOG.md](CHANGELOG.md)**，或访问 **[GitHub Releases](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** 下载各版本编译安装包。

## 参与贡献 (Contributing)

非常欢迎提交 Issue 或 Pull Request：
- 通过 [GitHub Issues](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/issues) 提交反馈或建议
- 提交对更多特定网页排版的优化与适配
- 提交 PR 共同完善功能

## 开源协议 (License)

本项目基于 [MIT License](LICENSE) 开源协议。

## 致谢 (Acknowledgments)

特别致谢 Gemini 3.8 Flash。

