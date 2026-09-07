// HoldTranslate - Popup Settings Script (Immersive Mode)

document.addEventListener('DOMContentLoaded', () => {
  const enabledSwitch = document.getElementById('enabledSwitch');
  const translateChineseSwitch = document.getElementById('translateChineseSwitch');
  const translateTraditionalSwitch = document.getElementById('translateTraditionalSwitch');
  const targetLangSelect = document.getElementById('targetLangSelect');
  const durationSlider = document.getElementById('durationSlider');
  const durationValue = document.getElementById('durationValue');
  const confirmDelaySlider = document.getElementById('confirmDelaySlider');
  const confirmDelayValue = document.getElementById('confirmDelayValue');
  const ringSwitch = document.getElementById('ringSwitch');
  const savedHint = document.getElementById('savedHint');

  // Color elements
  const colorPalette = document.getElementById('colorPalette');
  const colorPicker = document.getElementById('colorPicker');
  const colorHex = document.getElementById('colorHex');
  const previewTranslation = document.getElementById('previewTranslation');
  const previewBox = document.getElementById('previewBox');
  const previewThemeDark = document.getElementById('previewThemeDark');
  const previewThemeLight = document.getElementById('previewThemeLight');

  let currentColor = '#86a003';

  function showSaved() {
    savedHint.classList.add('visible');
    clearTimeout(window.__savedTimer);
    window.__savedTimer = setTimeout(() => {
      savedHint.classList.remove('visible');
    }, 1200);
  }

  function updateColorUI(hex) {
    currentColor = hex;
    colorPicker.value = hex;
    colorHex.value = hex.toUpperCase();
    previewTranslation.style.color = hex;

    // Highlight active chip if matches
    const chips = colorPalette.querySelectorAll('.color-chip');
    chips.forEach((chip) => {
      if (chip.dataset.color.toLowerCase() === hex.toLowerCase()) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  function saveColor(hex) {
    updateColorUI(hex);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ textColor: hex }, showSaved);
    }
  }

  function updateDurationUI(val) {
    const num = Math.min(800, Math.max(100, Math.round(Number(val) / 100) * 100));
    durationSlider.value = num;
    durationValue.textContent = `${num} ms`;
  }

  function updateConfirmDelayUI(val) {
    const num = Number(val);
    confirmDelaySlider.value = num;
    confirmDelayValue.textContent = num === 0 ? '0 ms (即刻出圈)' : `${num} ms`;
  }

  // Load saved settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get([
      'enabled', 'pressDuration', 'confirmDelay', 'targetLang', 'showRing', 'textColor',
      'translateChinese', 'translateTraditional'
    ], (res) => {
      if (res.enabled !== undefined) {
        enabledSwitch.checked = res.enabled;
      }
      if (res.translateChinese !== undefined) {
        translateChineseSwitch.checked = res.translateChinese;
      } else {
        translateChineseSwitch.checked = false; // 默认中文不翻译
      }
      if (res.translateTraditional !== undefined) {
        translateTraditionalSwitch.checked = res.translateTraditional;
      } else {
        translateTraditionalSwitch.checked = true; // 默认繁体转简体
      }
      if (res.targetLang !== undefined) {
        targetLangSelect.value = res.targetLang;
      }
      if (res.pressDuration !== undefined) {
        updateDurationUI(res.pressDuration);
      } else {
        updateDurationUI(500);
      }
      if (res.confirmDelay !== undefined) {
        updateConfirmDelayUI(res.confirmDelay);
      } else {
        updateConfirmDelayUI(160);
      }
      if (res.showRing !== undefined) {
        ringSwitch.checked = res.showRing;
      }
      if (res.textColor) {
        updateColorUI(res.textColor);
      } else {
        updateColorUI('#86a003');
      }
    });
  } else {
    updateColorUI('#86a003');
    updateDurationUI(500);
    updateConfirmDelayUI(160);
  }

  // Duration Slider Events
  durationSlider.addEventListener('input', () => {
    durationValue.textContent = `${durationSlider.value} ms`;
  });

  durationSlider.addEventListener('change', () => {
    const val = Number(durationSlider.value);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ pressDuration: val }, showSaved);
    }
  });

  // Confirm Delay Slider Events
  confirmDelaySlider.addEventListener('input', () => {
    const num = Number(confirmDelaySlider.value);
    confirmDelayValue.textContent = num === 0 ? '0 ms (即刻出圈)' : `${num} ms`;
  });

  confirmDelaySlider.addEventListener('change', () => {
    const val = Number(confirmDelaySlider.value);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ confirmDelay: val }, showSaved);
    }
  });

  // Palette chip click
  colorPalette.addEventListener('click', (e) => {
    const chip = e.target.closest('.color-chip');
    if (chip && chip.dataset.color) {
      saveColor(chip.dataset.color);
    }
  });

  // Native color picker input
  colorPicker.addEventListener('input', (e) => {
    updateColorUI(e.target.value);
  });
  colorPicker.addEventListener('change', (e) => {
    saveColor(e.target.value);
  });

  // Hex input
  colorHex.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      saveColor(val);
    } else {
      colorHex.value = currentColor.toUpperCase();
    }
  });

  // Preview theme toggle
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

  // Save on main switch change
  enabledSwitch.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enabledSwitch.checked }, showSaved);
  });

  // Save on Chinese translation switch change
  translateChineseSwitch.addEventListener('change', () => {
    chrome.storage.sync.set({ translateChinese: translateChineseSwitch.checked }, showSaved);
  });

  // Save on Traditional Chinese translation switch change
  translateTraditionalSwitch.addEventListener('change', () => {
    chrome.storage.sync.set({ translateTraditional: translateTraditionalSwitch.checked }, showSaved);
  });

  // Save on target language change
  targetLangSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ targetLang: targetLangSelect.value }, showSaved);
  });

  // Save on ring switch change
  ringSwitch.addEventListener('change', () => {
    chrome.storage.sync.set({ showRing: ringSwitch.checked }, showSaved);
  });
});
