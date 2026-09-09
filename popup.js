// HoldTranslate - Modern Adaptive Dual-View Popup Script

document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const viewsWrapper = document.getElementById('viewsWrapper');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const backToQuickBtn = document.getElementById('backToQuickBtn');
  const openTestPageBtn = document.getElementById('openTestPageBtn');

  // Quick view elements
  const quickEnabledSwitch = document.getElementById('quickEnabledSwitch');
  const sourceLangSelect = document.getElementById('sourceLangSelect');
  const targetLangSelect = document.getElementById('targetLangSelect');
  const swapLangBtn = document.getElementById('swapLangBtn');
  const serviceSelect = document.getElementById('serviceSelect');
  const serviceLogo = document.getElementById('serviceLogo');
  const statusCard = document.getElementById('statusCard');
  const statusMessage = document.getElementById('statusMessage');

  // Custom Dropdowns (VisionOS Liquid Glass popovers)
  const serviceDropdown = document.getElementById('serviceDropdown');
  const serviceDropdownTrigger = document.getElementById('serviceDropdownTrigger');
  const serviceSelectedLabel = document.getElementById('serviceSelectedLabel');
  const serviceMenu = document.getElementById('serviceMenu');

  const sourceLangDropdown = document.getElementById('sourceLangDropdown');
  const sourceLangTrigger = document.getElementById('sourceLangTrigger');
  const sourceLangLabel = document.getElementById('sourceLangLabel');
  const sourceLangMenu = document.getElementById('sourceLangMenu');

  const targetLangDropdown = document.getElementById('targetLangDropdown');
  const targetLangTrigger = document.getElementById('targetLangTrigger');
  const targetLangLabel = document.getElementById('targetLangLabel');
  const targetLangMenu = document.getElementById('targetLangMenu');

  // Settings view elements
  const enabledSwitch = document.getElementById('enabledSwitch');
  const liquidGlassSwitch = document.getElementById('liquidGlassSwitch');
  const durationSlider = document.getElementById('durationSlider');
  const durationValue = document.getElementById('durationValue');
  const confirmDelaySlider = document.getElementById('confirmDelaySlider');
  const confirmDelayValue = document.getElementById('confirmDelayValue');
  const ringSwitch = document.getElementById('ringSwitch');
  const savedHint = document.getElementById('savedHint');
  const videoSubtitlesSwitch = document.getElementById('videoSubtitlesSwitch');
  const subtitleModeGroup = document.getElementById('subtitleModeGroup');

  // API Config elements
  const deepseekApiKey = document.getElementById('deepseekApiKey');
  const customApiUrl = document.getElementById('customApiUrl');
  const customApiKey = document.getElementById('customApiKey');
  const customModel = document.getElementById('customModel');

  // Color elements
  const colorPalette = document.getElementById('colorPalette');
  const paletteChip = document.getElementById('paletteChip');
  const colorPicker = document.getElementById('colorPicker');
  const colorHex = document.getElementById('colorHex');
  const previewTranslation = document.getElementById('previewTranslation');
  const previewBox = document.getElementById('previewBox');
  const previewThemeDark = document.getElementById('previewThemeDark');
  const previewThemeLight = document.getElementById('previewThemeLight');

  let currentColor = '#86a003';

  const quickView = document.getElementById('quickView');
  const settingsView = document.getElementById('settingsView');
  const subpageView = document.getElementById('subpageView');
  const subpageBackBtn = document.getElementById('subpageBackBtn');
  const subpageTitle = document.getElementById('subpageTitle');
  const subpageList = document.getElementById('subpageList');

  // 1. Dual View Navigation
  function openSettings() {
    if (!viewsWrapper || !settingsView || !quickView) return;
    if (typeof closeSubpage === 'function') closeSubpage();
    settingsView.style.display = 'flex';
    requestAnimationFrame(() => {
      viewsWrapper.classList.add('show-settings');
      setTimeout(() => {
        if (viewsWrapper.classList.contains('show-settings')) {
          quickView.style.display = 'none';
        }
      }, 360);
    });
  }

  function closeSettings() {
    if (!viewsWrapper || !settingsView || !quickView) return;
    quickView.style.display = 'flex';
    requestAnimationFrame(() => {
      viewsWrapper.classList.remove('show-settings');
      setTimeout(() => {
        if (!viewsWrapper.classList.contains('show-settings')) {
          settingsView.style.display = 'none';
        }
      }, 360);
    });
  }

  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', openSettings);
  }

  if (backToQuickBtn) {
    backToQuickBtn.addEventListener('click', closeSettings);
  }

  if (openTestPageBtn) {
    openTestPageBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: chrome.runtime.getURL('test.html') });
      }
    });
  }

  // URL query parameter support for testing / preview
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('settings') && viewsWrapper) {
    openSettings();
  } else if (settingsView) {
    settingsView.style.display = 'none';
  }
  if (urlParams.has('color')) {
    updateColorUI(urlParams.get('color'));
  }
  if (urlParams.has('classic')) {
    document.body.classList.remove('liquid-glass');
    if (liquidGlassSwitch) liquidGlassSwitch.checked = false;
  }
  if (urlParams.has('subpage') && viewsWrapper) {
    openSubpage(urlParams.get('subpage'));
  }

  // Save indication
  function showSaved() {
    if (!savedHint) return;
    savedHint.classList.add('show');
    clearTimeout(window.__savedTimer);
    window.__savedTimer = setTimeout(() => {
      savedHint.classList.remove('show');
    }, 1200);
  }

  // Update Service Logo
  function updateServiceLogo(service) {
    if (!serviceLogo) return;
    if (service === 'google') {
      serviceLogo.innerHTML = `
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      `;
    } else if (service === 'microsoft') {
      serviceLogo.innerHTML = `
        <path fill="#F25022" d="M1 1h10v10H1z"/>
        <path fill="#7FBA00" d="M13 1h10v10H13z"/>
        <path fill="#00A4EF" d="M1 13h10v10H1z"/>
        <path fill="#FFB900" d="M13 13h10v10H13z"/>
      `;
    } else if (service === 'deepseek') {
      serviceLogo.innerHTML = `
        <circle cx="12" cy="12" r="10" fill="#0284c7"/>
        <path fill="#ffffff" d="M8 13c1.5 2 6.5 2 8 0M9 9h.01M15 9h.01" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      `;
    } else {
      serviceLogo.innerHTML = `
        <circle cx="12" cy="12" r="10" fill="var(--accent-color)"/>
        <path fill="#ffffff" d="M11 7h2v6h-2zm0 8h2v2h-2z"/>
      `;
    }
  }

  // 1.5 iOS Sliding Subpage Architecture (Locked 225px Window Height)
  const SOURCE_LANGUAGES = [
    { value: 'auto', label: '自动检测' },
    { value: 'en', label: '英语' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁体中文' },
    { value: 'ja', label: '日语' },
    { value: 'ko', label: '韩语' },
    { value: 'fr', label: '法语' },
    { value: 'de', label: '德语' },
    { value: 'es', label: '西班牙语' },
    { value: 'ru', label: '俄语' }
  ];

  const TARGET_LANGUAGES = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁体中文' },
    { value: 'en', label: '英语' },
    { value: 'ja', label: '日语' },
    { value: 'ko', label: '韩语' },
    { value: 'fr', label: '法语' },
    { value: 'de', label: '德语' },
    { value: 'es', label: '西班牙语' },
    { value: 'ru', label: '俄语' },
    { value: 'auto', label: '自动选择' }
  ];

  const SERVICES = [
    {
      value: 'google',
      label: 'Google Translate',
      iconSvg: `<svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </svg>`
    },
    {
      value: 'microsoft',
      label: 'Microsoft Translator',
      iconSvg: `<svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="#F25022" d="M1 1h10v10H1z"/>
        <path fill="#7FBA00" d="M13 1h10v10H13z"/>
        <path fill="#00A4EF" d="M1 13h10v10H1z"/>
        <path fill="#FFB900" d="M13 13h10v10H13z"/>
      </svg>`
    },
    {
      value: 'deepseek',
      label: 'DeepSeek API',
      iconSvg: `<svg viewBox="0 0 24 24" width="16" height="16">
        <circle cx="12" cy="12" r="10" fill="#0284c7"/>
        <path fill="#ffffff" d="M8 13c1.5 2 6.5 2 8 0M9 9h.01M15 9h.01" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    {
      value: 'custom',
      label: 'Custom API',
      iconSvg: `<svg viewBox="0 0 24 24" width="16" height="16">
        <circle cx="12" cy="12" r="10" fill="var(--accent-color)"/>
        <path fill="#ffffff" d="M11 7h2v6h-2zm0 8h2v2h-2z"/>
      </svg>`
    }
  ];

  function syncDropdownUI(dropdownEl, selectEl, labelEl) {
    if (!selectEl) return;
    const val = selectEl.value;
    let matchedText = '';

    if (dropdownEl) {
      const items = dropdownEl.querySelectorAll('.dropdown-item');
      items.forEach((item) => {
        if (item.dataset.value === val) {
          item.classList.add('active');
          const textEl = item.querySelector('.item-text');
          if (textEl) matchedText = textEl.textContent.trim();
        } else {
          item.classList.remove('active');
        }
      });
    }

    if (!matchedText) {
      const allLists = [SOURCE_LANGUAGES, TARGET_LANGUAGES, SERVICES];
      for (const list of allLists) {
        const found = list.find((i) => i.value === val);
        if (found) {
          matchedText = found.label;
          break;
        }
      }
    }

    if (labelEl && matchedText) {
      labelEl.textContent = matchedText;
    }
  }

  let currentSubpageType = null;
  let subpageCloseTimer = null;

  function openSubpage(type) {
    if (!viewsWrapper || !subpageView || !quickView) return;
    currentSubpageType = type;
    clearTimeout(subpageCloseTimer);

    let titleText = '选择';
    let items = [];
    let currentValue = '';
    let targetSelect = null;

    if (type === 'sourceLang') {
      titleText = '选择源语言';
      items = SOURCE_LANGUAGES;
      targetSelect = sourceLangSelect;
      currentValue = sourceLangSelect ? sourceLangSelect.value : 'auto';
    } else if (type === 'targetLang') {
      titleText = '选择目标语言';
      items = TARGET_LANGUAGES;
      targetSelect = targetLangSelect;
      currentValue = targetLangSelect ? targetLangSelect.value : 'zh-CN';
    } else if (type === 'service') {
      titleText = '选择翻译服务';
      items = SERVICES;
      targetSelect = serviceSelect;
      currentValue = serviceSelect ? serviceSelect.value : 'google';
    }

    if (subpageTitle) subpageTitle.textContent = titleText;

    if (subpageList) {
      subpageList.innerHTML = items.map((item) => {
        const isActive = item.value === currentValue;
        const iconHtml = item.iconSvg ? `<span class="subpage-item-icon">${item.iconSvg}</span>` : '';
        return `
          <div class="subpage-item ${isActive ? 'active' : ''}" data-value="${item.value}" role="option" tabindex="0">
            <div class="subpage-item-left">
              ${iconHtml}
              <span class="subpage-item-text">${item.label}</span>
            </div>
            <span class="subpage-item-check">✓</span>
          </div>
        `;
      }).join('');

      // Add click listener on items with tactile 120ms auto-return
      subpageList.querySelectorAll('.subpage-item').forEach((itemEl) => {
        itemEl.addEventListener('click', () => {
          const val = itemEl.dataset.value;
          // Visual checkmark feedback
          subpageList.querySelectorAll('.subpage-item').forEach(i => i.classList.remove('active'));
          itemEl.classList.add('active');

          if (targetSelect && targetSelect.value !== val) {
            targetSelect.value = val;
            targetSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }

          if (type === 'sourceLang') {
            syncDropdownUI(sourceLangDropdown, sourceLangSelect, sourceLangLabel);
          } else if (type === 'targetLang') {
            syncDropdownUI(targetLangDropdown, targetLangSelect, targetLangLabel);
          } else if (type === 'service') {
            updateServiceLogo(val);
            syncDropdownUI(serviceDropdown, serviceSelect, serviceSelectedLabel);
          }

          // Tactile confirmation: 120ms smooth auto-slide back
          subpageCloseTimer = setTimeout(() => {
            closeSubpage();
          }, 120);
        });
      });
    }

    subpageView.style.display = 'flex';
    requestAnimationFrame(() => {
      viewsWrapper.classList.add('show-subpage');
      setTimeout(() => {
        if (viewsWrapper.classList.contains('show-subpage')) {
          quickView.style.display = 'none';
        }
      }, 340);
    });
  }

  function closeSubpage() {
    if (!viewsWrapper || !subpageView || !quickView) return;
    clearTimeout(subpageCloseTimer);
    quickView.style.display = 'flex';
    requestAnimationFrame(() => {
      viewsWrapper.classList.remove('show-subpage');
      setTimeout(() => {
        if (!viewsWrapper.classList.contains('show-subpage')) {
          subpageView.style.display = 'none';
        }
      }, 340);
    });
  }

  // Bind trigger buttons to sliding subpages
  if (sourceLangTrigger) {
    sourceLangTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openSubpage('sourceLang');
    });
  }

  if (targetLangTrigger) {
    targetLangTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openSubpage('targetLang');
    });
  }

  if (serviceDropdownTrigger) {
    serviceDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openSubpage('service');
    });
  }

  if (subpageBackBtn) {
    subpageBackBtn.addEventListener('click', closeSubpage);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (viewsWrapper && viewsWrapper.classList.contains('show-subpage')) {
        closeSubpage();
      } else if (viewsWrapper && viewsWrapper.classList.contains('show-settings')) {
        closeSettings();
      }
    }
  });

  // 2. Color UI & Logic
  function updateColorUI(hex) {
    if (!hex) return;
    currentColor = hex;

    // Dynamically apply accent color to the document root (so all switches, buttons, sliders adapt)
    document.documentElement.style.setProperty('--accent-color', hex);

    if (colorPicker) colorPicker.value = hex;
    if (colorHex) colorHex.value = hex.toUpperCase();
    if (previewTranslation) previewTranslation.style.color = hex;

    let matchedPreset = false;
    if (colorPalette) {
      const chips = colorPalette.querySelectorAll('.color-chip:not(.palette-chip)');
      chips.forEach((chip) => {
        if (chip.dataset.color && chip.dataset.color.toLowerCase() === hex.toLowerCase()) {
          chip.classList.add('active');
          matchedPreset = true;
        } else {
          chip.classList.remove('active');
        }
      });
    }

    if (paletteChip) {
      if (!matchedPreset) {
        paletteChip.classList.add('active');
        paletteChip.style.backgroundColor = hex;
      } else {
        paletteChip.classList.remove('active');
        paletteChip.style.backgroundColor = '';
      }
    }
  }

  function saveColor(hex) {
    updateColorUI(hex);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ textColor: hex }, showSaved);
    }
  }

  // 3. Slider UI
  function updateDurationUI(val) {
    const num = Math.min(800, Math.max(100, Math.round(Number(val) / 100) * 100));
    if (durationSlider) durationSlider.value = num;
    if (durationValue) durationValue.textContent = `${num} ms`;
  }

  function updateConfirmDelayUI(val) {
    const num = Number(val);
    if (confirmDelaySlider) confirmDelaySlider.value = num;
    if (confirmDelayValue) {
      confirmDelayValue.textContent = num === 0 ? '0 ms (即刻出圈)' : `${num} ms`;
    }
  }

  // 4. Current Tab Status Detection
  function detectCurrentTabStatus() {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
      return;
    }

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0] || !tabs[0].url) return;
        const url = tabs[0].url.toLowerCase();
        const isRestricted = (
          url.startsWith('chrome://') ||
          url.startsWith('chrome-extension://') ||
          url.startsWith('edge://') ||
          url.startsWith('about:') ||
          url.startsWith('view-source:') ||
          url.includes('chrome.google.com/webstore') ||
          url.includes('chromewebstore.google.com')
        );

        if (isRestricted) {
          if (statusCard) {
            statusCard.classList.remove('ready');
            statusCard.classList.add('warn');
            statusCard.title = '暂无权限翻译当前页面（新标签页或浏览器内置页面）';
          }
          if (statusMessage) {
            statusMessage.textContent = '受限页面';
          }
        } else {
          if (statusCard) {
            statusCard.classList.remove('warn');
            statusCard.classList.add('ready');
            statusCard.title = '当前页面已就绪，长按即可翻译';
          }
          if (statusMessage) {
            statusMessage.textContent = '就绪';
          }
        }
      });
    } catch (e) {
      // Ignore tab query errors
    }
  }

  detectCurrentTabStatus();

  // 5. Load Saved Settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get([
      'enabled', 'sourceLang', 'targetLang', 'pressDuration', 'confirmDelay',
      'showRing', 'textColor', 'translateService', 'deepseekApiKey',
      'customApiUrl', 'customApiKey', 'customModel', 'liquidGlass',
      'videoSubtitlesEnabled', 'subtitleMode'
    ], (res) => {
      // Main switches
      const isEnabled = res.enabled !== undefined ? res.enabled : true;
      if (enabledSwitch) enabledSwitch.checked = isEnabled;
      if (quickEnabledSwitch) quickEnabledSwitch.checked = isEnabled;

      // Video Subtitles (default true for out-of-the-box readiness)
      const isVideoSubtitles = res.videoSubtitlesEnabled !== undefined ? res.videoSubtitlesEnabled : true;
      if (videoSubtitlesSwitch) videoSubtitlesSwitch.checked = isVideoSubtitles;

      const currentSubMode = res.subtitleMode || 'bilingual';
      if (subtitleModeGroup) {
        subtitleModeGroup.querySelectorAll('.segment-btn').forEach(btn => {
          const isActive = btn.dataset.mode === currentSubMode;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
      }

      // Liquid Glass switch
      const isLiquidGlass = res.liquidGlass !== undefined ? res.liquidGlass : true;
      if (!urlParams.has('classic')) {
        document.body.classList.toggle('liquid-glass', isLiquidGlass);
        if (liquidGlassSwitch) liquidGlassSwitch.checked = isLiquidGlass;
      }

      // Language selection
      if (sourceLangSelect) {
        sourceLangSelect.value = res.sourceLang || 'auto';
        syncDropdownUI(sourceLangDropdown, sourceLangSelect, sourceLangLabel);
      }
      if (targetLangSelect) {
        targetLangSelect.value = res.targetLang || 'zh-CN';
        syncDropdownUI(targetLangDropdown, targetLangSelect, targetLangLabel);
      }

      // Translation Service selection
      const service = res.translateService || 'google';
      if (serviceSelect) {
        serviceSelect.value = service;
        updateServiceLogo(service);
        syncDropdownUI(serviceDropdown, serviceSelect, serviceSelectedLabel);
      }

      // API Config
      if (deepseekApiKey) deepseekApiKey.value = res.deepseekApiKey || '';
      if (customApiUrl) customApiUrl.value = res.customApiUrl || 'https://api.openai.com/v1';
      if (customApiKey) customApiKey.value = res.customApiKey || '';
      if (customModel) customModel.value = res.customModel || 'gpt-4o-mini';

      // Sliders & Ring
      updateDurationUI(res.pressDuration !== undefined ? res.pressDuration : 500);
      updateConfirmDelayUI(res.confirmDelay !== undefined ? res.confirmDelay : 160);
      if (ringSwitch) {
        ringSwitch.checked = res.showRing !== undefined ? res.showRing : true;
      }

      // Color
      const initColor = urlParams.get('color') || res.textColor || '#86a003';
      updateColorUI(initColor);
    });
  } else {
    const isClassic = urlParams.has('classic');
    document.body.classList.toggle('liquid-glass', !isClassic);
    if (liquidGlassSwitch) liquidGlassSwitch.checked = !isClassic;

    const initColor = urlParams.get('color') || '#86a003';
    updateColorUI(initColor);
    updateDurationUI(500);
    updateConfirmDelayUI(160);
    if (sourceLangSelect) syncDropdownUI(sourceLangDropdown, sourceLangSelect, sourceLangLabel);
    if (targetLangSelect) syncDropdownUI(targetLangDropdown, targetLangSelect, targetLangLabel);
    if (serviceSelect) syncDropdownUI(serviceDropdown, serviceSelect, serviceSelectedLabel);
  }

  // 6. Language Swapping
  if (swapLangBtn && sourceLangSelect && targetLangSelect) {
    swapLangBtn.addEventListener('click', () => {
      const currentSrc = sourceLangSelect.value;
      const currentTgt = targetLangSelect.value;

      let newSrc = currentTgt;
      let newTgt = currentSrc;

      if (currentSrc === 'auto') {
        newSrc = currentTgt;
        newTgt = currentTgt === 'zh-CN' ? 'en' : 'zh-CN';
      }

      sourceLangSelect.value = newSrc;
      targetLangSelect.value = newTgt;
      syncDropdownUI(sourceLangDropdown, sourceLangSelect, sourceLangLabel);
      syncDropdownUI(targetLangDropdown, targetLangSelect, targetLangLabel);

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({
          sourceLang: newSrc,
          targetLang: newTgt
        }, showSaved);
      }
    });
  }

  if (sourceLangSelect) {
    sourceLangSelect.addEventListener('change', () => {
      syncDropdownUI(sourceLangDropdown, sourceLangSelect, sourceLangLabel);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ sourceLang: sourceLangSelect.value }, showSaved);
      }
    });
  }

  if (targetLangSelect) {
    targetLangSelect.addEventListener('change', () => {
      syncDropdownUI(targetLangDropdown, targetLangSelect, targetLangLabel);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ targetLang: targetLangSelect.value }, showSaved);
      }
    });
  }

  // 7. Master Switch Sync
  function setMasterEnabled(checked) {
    if (enabledSwitch) enabledSwitch.checked = checked;
    if (quickEnabledSwitch) quickEnabledSwitch.checked = checked;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ enabled: checked }, showSaved);
    }
  }

  if (quickEnabledSwitch) {
    quickEnabledSwitch.addEventListener('change', () => {
      setMasterEnabled(quickEnabledSwitch.checked);
    });
  }

  if (enabledSwitch) {
    enabledSwitch.addEventListener('change', () => {
      setMasterEnabled(enabledSwitch.checked);
    });
  }

  // 8. Sliders
  if (durationSlider) {
    durationSlider.addEventListener('input', () => {
      if (durationValue) durationValue.textContent = `${durationSlider.value} ms`;
    });
    durationSlider.addEventListener('change', () => {
      const val = Number(durationSlider.value);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ pressDuration: val }, showSaved);
      }
    });
  }

  if (confirmDelaySlider) {
    confirmDelaySlider.addEventListener('input', () => {
      const num = Number(confirmDelaySlider.value);
      if (confirmDelayValue) {
        confirmDelayValue.textContent = num === 0 ? '0 ms (即刻出圈)' : `${num} ms`;
      }
    });
    confirmDelaySlider.addEventListener('change', () => {
      const val = Number(confirmDelaySlider.value);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ confirmDelay: val }, showSaved);
      }
    });
  }

  // 9. Color Palette & Pickers
  if (colorPalette) {
    colorPalette.addEventListener('click', (e) => {
      const chip = e.target.closest('.color-chip:not(.palette-chip)');
      if (chip && chip.dataset.color) {
        saveColor(chip.dataset.color);
      }
    });
  }

  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      updateColorUI(e.target.value);
    });
    colorPicker.addEventListener('change', (e) => {
      saveColor(e.target.value);
    });
  }

  if (colorHex) {
    colorHex.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        saveColor(val);
      } else {
        colorHex.value = currentColor.toUpperCase();
      }
    });
    colorHex.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        colorHex.blur();
      }
    });
  }

  // 10. Live Preview Theme Toggle
  if (previewThemeDark && previewThemeLight && previewBox) {
    previewThemeDark.addEventListener('click', () => {
      previewThemeDark.classList.add('active');
      previewThemeLight.classList.remove('active');
      previewBox.className = 'preview-box dark';
    });

    previewThemeLight.addEventListener('click', () => {
      previewThemeLight.classList.add('active');
      previewThemeDark.classList.remove('active');
      previewBox.className = 'preview-box light';
    });
  }

  // 11. Service Selection & API Config Listeners
  if (serviceSelect) {
    serviceSelect.addEventListener('change', () => {
      const service = serviceSelect.value;
      updateServiceLogo(service);
      syncDropdownUI(serviceDropdown, serviceSelect, serviceSelectedLabel);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ translateService: service }, showSaved);
      }
    });
  }

  function bindInputSave(el, key) {
    if (!el) return;
    el.addEventListener('change', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ [key]: el.value.trim() }, showSaved);
      }
    });
  }

  bindInputSave(deepseekApiKey, 'deepseekApiKey');
  bindInputSave(customApiUrl, 'customApiUrl');
  bindInputSave(customApiKey, 'customApiKey');
  bindInputSave(customModel, 'customModel');

  if (ringSwitch) {
    ringSwitch.addEventListener('change', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ showRing: ringSwitch.checked }, showSaved);
      }
    });
  }

  if (liquidGlassSwitch) {
    liquidGlassSwitch.addEventListener('change', () => {
      const isLiquidGlass = liquidGlassSwitch.checked;
      document.body.classList.toggle('liquid-glass', isLiquidGlass);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ liquidGlass: isLiquidGlass }, showSaved);
      }
    });
  }

  // 12. Video Subtitles Listeners
  if (videoSubtitlesSwitch) {
    videoSubtitlesSwitch.addEventListener('change', () => {
      const enabled = videoSubtitlesSwitch.checked;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ videoSubtitlesEnabled: enabled }, showSaved);
      }
    });
  }

  if (subtitleModeGroup) {
    subtitleModeGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.segment-btn');
      if (!btn) return;
      const mode = btn.dataset.mode;
      subtitleModeGroup.querySelectorAll('.segment-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ subtitleMode: mode }, showSaved);
      }
    });
  }
});
