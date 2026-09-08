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

  // Settings view elements
  const enabledSwitch = document.getElementById('enabledSwitch');
  const liquidGlassSwitch = document.getElementById('liquidGlassSwitch');
  const durationSlider = document.getElementById('durationSlider');
  const durationValue = document.getElementById('durationValue');
  const confirmDelaySlider = document.getElementById('confirmDelaySlider');
  const confirmDelayValue = document.getElementById('confirmDelayValue');
  const ringSwitch = document.getElementById('ringSwitch');
  const savedHint = document.getElementById('savedHint');

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

  // 1. Dual View Navigation
  if (openSettingsBtn && viewsWrapper) {
    openSettingsBtn.addEventListener('click', () => {
      viewsWrapper.classList.add('show-settings');
    });
  }

  if (backToQuickBtn && viewsWrapper) {
    backToQuickBtn.addEventListener('click', () => {
      viewsWrapper.classList.remove('show-settings');
    });
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
    viewsWrapper.classList.add('show-settings');
  }
  if (urlParams.has('color')) {
    updateColorUI(urlParams.get('color'));
  }
  if (urlParams.has('classic')) {
    document.body.classList.remove('liquid-glass');
    if (liquidGlassSwitch) liquidGlassSwitch.checked = false;
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
            statusCard.className = 'status-card warn';
            statusCard.title = '暂无权限翻译当前页面（新标签页或浏览器内置页面）';
          }
          if (statusMessage) {
            statusMessage.textContent = '受限页面';
          }
        } else {
          if (statusCard) {
            statusCard.className = 'status-card ready';
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
      'customApiUrl', 'customApiKey', 'customModel', 'liquidGlass'
    ], (res) => {
      // Main switches
      const isEnabled = res.enabled !== undefined ? res.enabled : true;
      if (enabledSwitch) enabledSwitch.checked = isEnabled;
      if (quickEnabledSwitch) quickEnabledSwitch.checked = isEnabled;

      // Liquid Glass switch
      const isLiquidGlass = res.liquidGlass !== undefined ? res.liquidGlass : true;
      if (!urlParams.has('classic')) {
        document.body.classList.toggle('liquid-glass', isLiquidGlass);
        if (liquidGlassSwitch) liquidGlassSwitch.checked = isLiquidGlass;
      }

      // Language selection
      if (sourceLangSelect) {
        sourceLangSelect.value = res.sourceLang || 'auto';
      }
      if (targetLangSelect) {
        targetLangSelect.value = res.targetLang || 'zh-CN';
      }

      // Translation Service selection
      const service = res.translateService || 'google';
      if (serviceSelect) {
        serviceSelect.value = service;
        updateServiceLogo(service);
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
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ sourceLang: sourceLangSelect.value }, showSaved);
      }
    });
  }

  if (targetLangSelect) {
    targetLangSelect.addEventListener('change', () => {
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
});
