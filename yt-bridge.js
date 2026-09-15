// HoldTranslate - YouTube Main World Bridge
// Injected into YouTube page's MAIN world to bypass CSP and directly intercept timedtext streams

(function () {
  'use strict';

  if (window.__HOLDTRANSLATE_YT_BRIDGE_INITIALIZED__) return;
  window.__HOLDTRANSLATE_YT_BRIDGE_INITIALIZED__ = true;

  // Dispatch message to isolated world content script
  function sendToContentScript(type, payload) {
    try {
      window.postMessage({
        source: 'holdtranslate-bridge',
        type: type,
        payload: payload
      }, '*');
    } catch (e) {}
  }

  // 1. Intercept fetch for /api/timedtext
  const originalFetch = window.fetch;
  if (typeof originalFetch === 'function') {
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      try {
        const input = args[0];
        const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        if (url && url.includes('/api/timedtext')) {
          const clone = response.clone();
          clone.text().then((text) => {
            if (text) {
              sendToContentScript('TIMED_TEXT_INTERCEPTED', { url: url, text: text });
            }
          }).catch(() => {});
        }
      } catch (e) {}
      return response;
    };
  }

  // 2. Intercept XMLHttpRequest for /api/timedtext
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__holdtranslate_url = url;
    return origOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('load', () => {
      try {
        const url = String(this.__holdtranslate_url || '');
        if (url.includes('/api/timedtext') && this.responseText) {
          sendToContentScript('TIMED_TEXT_INTERCEPTED', { url: url, text: this.responseText });
        }
      } catch (e) {}
    });
    return origSend.apply(this, args);
  };

  // 3. Inspect player and initial response for caption tracks
  function inspectPlayerCaptionTracks() {
    try {
      const player = document.getElementById('movie_player');
      let tracks = null;

      if (player && typeof player.getOption === 'function') {
        tracks = player.getOption('captions', 'tracklist') ||
                 (player.getOption('captions', 'track') ? [player.getOption('captions', 'track')] : null);
      }

      if ((!tracks || !tracks.length) && window.ytInitialPlayerResponse && window.ytInitialPlayerResponse.captions) {
        const tracklistRenderer = window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer;
        if (tracklistRenderer && tracklistRenderer.captionTracks) {
          tracks = tracklistRenderer.captionTracks;
        }
      }

      if (tracks && tracks.length) {
        sendToContentScript('CAPTION_TRACKS_DETECTED', { tracks: tracks });
      }
    } catch (e) {}
  }

  // Periodic check until movie_player is ready, plus event hooks
  let trackCheckAttempts = 0;
  const trackCheckTimer = setInterval(() => {
    trackCheckAttempts++;
    inspectPlayerCaptionTracks();
    const player = document.getElementById('movie_player');
    if (player && typeof player.addEventListener === 'function') {
      try {
        player.addEventListener('onCaptionsTrackListChanged', inspectPlayerCaptionTracks);
        player.addEventListener('onCaptionsChange', inspectPlayerCaptionTracks);
      } catch (e) {}
    }
    if (trackCheckAttempts >= 12) {
      clearInterval(trackCheckTimer);
    }
  }, 1000);

  // Re-check on YouTube SPA navigation
  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(inspectPlayerCaptionTracks, 300);
    setTimeout(inspectPlayerCaptionTracks, 1000);
  }, { passive: true });

  // Initial check
  inspectPlayerCaptionTracks();
})();
