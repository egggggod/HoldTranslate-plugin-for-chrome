(function () {
  'use strict';

  if (window.__HOLD_TRANSLATE_INJECTED__) return;
  window.__HOLD_TRANSLATE_INJECTED__ = true;

  const defaults = {
    enabled: true,
    pressDuration: 500,
    sourceLang: 'auto',
    targetLang: 'auto',
    textColor: '#86a003',
    translateService: 'google',
    videoSubtitlesEnabled: true,
    subtitleMode: 'bilingual'
  };
  const config = { ...defaults };
  const modules = globalThis.__HOLD_TRANSLATE_MODULES__;
  const options = { config, isExtensionValid, onInvalidated: stop };
  const subtitles = modules.createSubtitleService(options);
  const page = modules.createPageTranslator(options);
  const youtube = modules.createYouTubeSubtitles({ config, subtitles });
  const videos = modules.createVideoSubtitles({ config, subtitles });
  let stopped = false;

  function isExtensionValid() {
    try {
      return typeof chrome !== 'undefined' && Boolean(chrome.runtime && chrome.runtime.id);
    } catch (error) {
      return false;
    }
  }

  function applySettings(settings = {}) {
    if (stopped) return;
    if (!isExtensionValid()) {
      stop();
      return;
    }
    const restart = ['sourceLang', 'targetLang', 'translateService', 'videoSubtitlesEnabled']
      .some(key => settings[key] !== undefined && settings[key] !== config[key]);
    if (restart) {
      youtube.stop();
      videos.stop();
      subtitles.reset();
    }
    for (const key of Object.keys(defaults)) {
      if (settings[key] !== undefined) config[key] = settings[key];
    }
    config.pressDuration = Number(config.pressDuration);
    config.videoSubtitlesEnabled = Boolean(config.videoSubtitlesEnabled);
    page.start();
    if (config.videoSubtitlesEnabled) {
      youtube.start();
      videos.start();
    } else {
      youtube.stop();
      videos.stop();
    }
    document.querySelectorAll('.__gtrans-inline-result').forEach(element => {
      element.style.setProperty('color', config.textColor, 'important');
    });
  }

  function onSettingsChanged(changes, namespace) {
    if (!isExtensionValid()) {
      stop();
      return;
    }
    if (namespace !== 'sync') return;
    const settings = {};
    for (const key of Object.keys(defaults)) {
      if (changes[key]) settings[key] = changes[key].newValue ?? defaults[key];
    }
    if (Object.keys(settings).length) applySettings(settings);
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    page.stop();
    youtube.stop();
    videos.stop();
    subtitles.reset();
    try {
      chrome.storage.onChanged.removeListener(onSettingsChanged);
    } catch (error) {}
  }

  if (isExtensionValid() && chrome.storage && chrome.storage.sync) {
    chrome.storage.onChanged.addListener(onSettingsChanged);
    try {
      chrome.storage.sync.get(Object.keys(defaults), settings => {
        if (!isExtensionValid()) {
          stop();
          return;
        }
        applySettings(chrome.runtime.lastError ? {} : settings);
      });
    } catch (error) {
      applySettings();
    }
  } else {
    applySettings();
  }
})();
