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
  const statusCard = document.getElementById('statusCard');
  const statusMessage = document.getElementById('statusMessage');

  // Settings view elements
  const enabledSwitch = document.getElementById('enabledSwitch');
  const mutualChineseSwitch = document.getElementById('mutualChineseSwitch');
  const durationSlider = document.getElementById('durationSlider');
  const durationValue = document.getElementById('durationValue');
  const confirmDelaySlider = document.getElementById('confirmDelaySlider');
  const confirmDelayValue = document.getElementById('confirmDelayValue');
  const ringSwitch = document.getElementById('ringSwitch');
  const savedHint = document.getElementById('savedHint');

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

  // Save indication
  function showSaved() {
    if (!savedHint) return;
    savedHint.classList.add('show');
    clearTimeout(window.__savedTimer);
    window.__savedTimer = setTimeout(() => {
      savedHint.classList.remove('show');
    }, 1200);
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
          }
          if (statusMessage) {
            statusMessage.textContent = '暂无权限翻译当前页面（新标签页或浏览器特权页面）';
          }
        } else {
          if (statusCard) {
            statusCard.className = 'status-card ready';
          }
          if (statusMessage) {
            statusMessage.textContent = '当前页面已就绪，长按即可翻译';
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
      'showRing', 'textColor', 'mutualChinese'
    ], (res) => {
      // Main switches
      const isEnabled = res.enabled !== undefined ? res.enabled : true;
      if (enabledSwitch) enabledSwitch.checked = isEnabled;
      if (quickEnabledSwitch) quickEnabledSwitch.checked = isEnabled;

      // Language selection
      if (sourceLangSelect) {
        sourceLangSelect.value = res.sourceLang || 'auto';
      }
      if (targetLangSelect) {
        targetLangSelect.value = res.targetLang || 'zh-CN';
      }

      // Mutual Chinese filtering
      if (mutualChineseSwitch) {
        mutualChineseSwitch.checked = res.mutualChinese !== undefined ? res.mutualChinese : true;
      }

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

  // 11. Secondary Toggles
  if (mutualChineseSwitch) {
    mutualChineseSwitch.addEventListener('change', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ mutualChinese: mutualChineseSwitch.checked }, showSaved);
      }
    });
  }

  if (ringSwitch) {
    ringSwitch.addEventListener('change', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ showRing: ringSwitch.checked }, showSaved);
      }
    });
  }
});
