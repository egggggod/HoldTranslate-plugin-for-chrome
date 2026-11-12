(function () {
  'use strict';

  const modules = globalThis.__HOLD_TRANSLATE_MODULES__ ||= {};

  modules.createSubtitleService = function ({ config, isExtensionValid, onInvalidated }) {
    const cache = new Map();
    const pending = new Map();
    const normalize = text => (text || '').replace(/\s+/g, ' ').trim();
    const keyFor = text => JSON.stringify([
      config.sourceLang || 'auto', config.targetLang || 'auto', config.translateService || 'google', normalize(text)
    ]);

    function translate(rawText, callback, onSettled) {
      const text = normalize(rawText);
      if (!text) {
        if (onSettled) onSettled(false);
        return;
      }
      const key = keyFor(text);
      const cached = cache.get(key);
      if (cached) {
        callback(cached);
        if (onSettled) onSettled(true);
        return;
      }
      const existing = pending.get(key);
      if (existing) {
        existing.callbacks.add(callback);
        if (onSettled) existing.settled.add(onSettled);
        return;
      }
      if (!isExtensionValid()) {
        onInvalidated();
        if (onSettled) onSettled(false);
        return;
      }
      const request = {
        callbacks: new Set([callback]),
        settled: new Set(onSettled ? [onSettled] : [])
      };
      pending.set(key, request);

      function finish(response) {
        if (pending.get(key) !== request) return;
        pending.delete(key);
        const valid = isExtensionValid();
        const runtimeError = valid && chrome.runtime.lastError;
        if (!valid) onInvalidated();
        if (key !== keyFor(text)) return;
        const success = Boolean(valid && !runtimeError && response && response.success && response.translatedText);
        if (success) {
          if (cache.size >= 600 && !cache.has(key)) cache.delete(cache.keys().next().value);
          cache.set(key, response.translatedText);
        }
        try {
          if (success) request.callbacks.forEach(subscriber => subscriber(response.translatedText));
        } finally {
          request.settled.forEach(subscriber => subscriber(success));
        }
      }

      try {
        chrome.runtime.sendMessage({
          action: 'TRANSLATE',
          text,
          sourceLang: config.sourceLang || 'auto',
          targetLang: config.targetLang,
          service: config.translateService || 'google'
        }, finish);
      } catch (error) {
        finish(null);
      }
    }

    function clearPending() {
      const requests = Array.from(pending.values());
      pending.clear();
      requests.forEach(request => {
        request.settled.forEach(subscriber => subscriber(false));
      });
    }

    return {
      translate,
      getCached: text => cache.get(keyFor(text)),
      isPending: text => pending.has(keyFor(text)),
      clearPending,
      reset: () => {
        clearPending();
        cache.clear();
      }
    };
  };
})();
