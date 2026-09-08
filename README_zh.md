<div align="right">
  <a href="README.md">English</a> | <strong><a href="README_zh.md">简体中文</a></strong>
</div>

# HoldTranslate

网页沉浸式长按翻译与平滑还原 Chrome 扩展！

> **极速体验备忘：**  
> HoldTranslate 专为**无感阅读与零视觉干扰**而生。没有笨重的大色块卡片，没有突兀的 Google 图标水印，更没有花哨多余的控制栏。译文如原生双语字幕般自然融入在原文正下方，100% 同步继承原文的所有排版细节。

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](manifest.json)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Releases](https://img.shields.io/badge/Release-v1.0.0-green.svg)](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 演示 (Demo)

> 完美适配绝大多数现代网页，包括复杂自适应流式页面、社交动态流（YouTube、X/Twitter）以及经典学术/新闻刊物（BBC、经济学人、ArXiv 等）。

点击直接下载最新版 [HoldTranslate Chrome 扩展安装包](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.0.0/holdtranslate-chrome-extension-v1.0.0.zip) (v1.0.0)，解压后即可在 Chrome 中体验：

### 1. 浅色模式沉浸式阅读效果（如新闻、论文长文）
![浅色模式演示](assets/demo-light.png)

### 2. 深色模式与嵌套标题适配（如 YouTube 视频标题）
![深色模式演示](assets/demo-dark.png)

## 项目概览 (Overview)

本项目由三大核心模块构成：

1. **精准排版同步引擎 (Precision Typography Synchronizer)**：智能 DOM 分析器，1:1 提取并镜像原文的计算字号、粗体字重（针对 Windows 微软雅黑 Medium 字重做了视觉补偿）、斜体、下划线/删除线以及衬线体/非衬线体属性。
2. **交互式长按引擎 (Interactive Long-Press Engine)**：具备双滑块调节与防误触体系（100ms~800ms 触发时长 + 确认缓冲时间 + 16px 鼠标微动防抖），并支持二次长按平滑还原。
3. **沉浸式调色面板 (Immersive Customizer)**：内置 7 款经典护眼预设色彩、HTML5 原生色盘与 Hex 精准输入，并在设置弹窗中提供深/浅双色实时预览。

## 项目结构 (Project Structure)

```bash
HoldTranslate-plugin-for-chrome/
├── assets/             # 效果演示截图与预览素材
│   ├── demo-light.png
│   └── demo-dark.png
├── icons/              # 扩展图标 (16x16, 48x48, 128x128)
├── manifest.json       # Chrome 扩展配置文件 (Manifest V3)
├── background.js       # 后台 Service Worker，负责 Google 翻译请求分发
├── content.js          # 核心脚本：长按事件监听、排版智能提取、译文插入与还原
├── content.css         # 沉浸式译文动画与基础样式
├── popup.html          # 扩展设置弹窗界面
├── popup.css           # 设置面板样式与实时预览卡片
├── popup.js            # 设置面板逻辑、色盘管理与滑块控制
├── test.html           # 全场景本地测试基准页（含 YouTube 标题、斜体、下划线等）
├── LICENSE             # MIT 开源协议
├── README.md           # 英文主说明文档
└── README_zh.md        # 中文说明文档 (简体中文)
```

整个项目结构轻量清晰，不依赖任何第三方打包工具或重量级依赖，纯原生现代 Web 技术编写，开箱即用。

## 浏览器扩展特性 (Features)

- 🎯 **1:1 原生排版与富文本样式镜像**：精准匹配原文计算字号（专项穿透适配 YouTube `#video-title` 标题），自动同步加粗、斜体、下划线，智能感知衬线体（宋体）与非衬线体（黑体）。
- 🔄 **长按即时翻译 & 平滑还原**：长按任意段落即可嵌入译文，再次长按原段落或译文即可平滑淡出移除，恢复初始网页排版。
- ⚡ **滑块定制与防误触机制**：提供长按触发时间滑条（100ms~800ms）与确认时间滑条，搭配 16px 防抖容差，彻底避免浏览与点击链接时的误触发。
- 📋 **段落与划词双模式**：直接长按翻译整段文本；先划选高亮文字再长按仅翻译选定内容。
- 🛡️ **智能语言过滤**：自动跳过纯中文或已翻译内容，防止重复翻译；提供繁体中文翻译独立开关。
- 🎨 **纯净沉浸美感**：背景 100% 透明自适应，内置 7 色护眼预设（默认沉浸橄榄绿 `#86a003`），支持自定义 Hex 色值与深浅色模式实时预览。

### 🚀 快速安装指南 (Quick Install Guide)

1. **直接下载安装包（推荐 - 最新 v1.0.0）**
   - 访问我们的 **[Releases 发布页面](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)**（或点击直接下载：[holdtranslate-chrome-extension-v1.0.0.zip](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases/download/v1.0.0/holdtranslate-chrome-extension-v1.0.0.zip)）；
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
1. 点击 Chrome 工具栏中的 **HoldTranslate** 图标，打开设置面板调整您喜欢的译文颜色、触发时间或确认时间；
2. 访问任意英文或外语网页（也可在 Chrome 中直接打开项目内的 [`test.html`](test.html) 本地测试页）；
3. 在任意文本段落上**长按鼠标左键**约 500ms；
4. 译文将如同原生双语字幕般平滑出现在原文下方；
5. 需要恢复纯净页面时，再次长按即可平滑移除！

## 为什么选择 HoldTranslate？ (Why Use HoldTranslate?)

- **零干扰 (Zero Distraction)**：没有广告、没有水印卡片、没有阻挡视线的悬浮窗。
- **视觉浑然一体 (Visual Harmony)**：译文字号与排版与原文 100% 严密贴合，视觉体验如网页天生自带双语。
- **极速且精准 (Accurate & Effortless)**：调用 Google Translate 高速接口，毫秒级响应，毫秒级淡入淡出。
- **纯净安全 (Privacy & Lightweight)**：纯原生 JavaScript 编写，无第三方打包埋点，无任何数据追踪。

## 版本发布与维护 (Release Page & Versioning)

- **Release 发布页面**：请访问 **[GitHub Releases Page](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/releases)** 获取各版本的更新日志（Changelog）与编译好的打包文件。
- **版本规范**：严格遵循 [语义化版本 (SemVer)](https://semver.org/lang/zh-CN/) 规范（`vMAJOR.MINOR.PATCH`）。
  - 当前版本：`v1.0.0`
  - 后续更新：直接在 Releases 页面下载最新 zip 替换本地文件，在 `chrome://extensions/` 中点击刷新图标 (⟳) 即可无缝升级。

## 参与贡献 (Contributing)

非常欢迎提交 Issue 或 Pull Request：
- 通过 [GitHub Issues](https://github.com/egggggod/HoldTranslate-plugin-for-chrome/issues) 提交反馈或建议
- 提交对更多特定网页排版的优化与适配
- 提交 PR 共同完善功能

## 开源协议 (License)

本项目基于 [MIT License](LICENSE) 开源协议。
