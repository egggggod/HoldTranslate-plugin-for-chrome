// HoldTranslate - YouTube Main World Bridge
// Injected into YouTube page's MAIN world to bypass CSP and directly intercept timedtext streams

(function () {
  'use strict';

  if (window.__HOLDTRANSLATE_YT_BRIDGE_INITIALIZED__) return;
  window.__HOLDTRANSLATE_YT_BRIDGE_INITIALIZED__ = true;

  let cachedTracks = null;
  let cachedTimedText = null;
  const hookedPlayers = new WeakSet();

  function getVideoId() {
    const pageUrl = new URL(window.location.href);
    return pageUrl.searchParams.get('v') || (pageUrl.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/) || [])[1] || '';
  }

  function publishTimedText(url, text, videoId) {
    if (!text || !videoId || videoId !== getVideoId()) return;
    const trackUrl = new URL(url, window.location.href);
    if (trackUrl.searchParams.get('v') !== videoId) return;
    cachedTimedText = { url, text, videoId };
    sendToContentScript('TIMED_TEXT_INTERCEPTED', cachedTimedText);
  }

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
      const videoId = getVideoId();
      const response = await originalFetch.apply(this, args);
      try {
        const input = args[0];
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href :
          (input && input.url ? input.url : '');
        if (url && url.includes('/api/timedtext')) {
          const clone = response.clone();
          clone.text().then((text) => {
            publishTimedText(url, text, videoId);
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
    this.__holdtranslate_video_id = getVideoId();
    return origOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('load', () => {
      try {
        const url = String(this.__holdtranslate_url || '');
        if (url.includes('/api/timedtext') && this.responseText) {
          publishTimedText(url, this.responseText, this.__holdtranslate_video_id);
        }
      } catch (e) {}
    });
    return origSend.apply(this, args);
  };

  // 3. Inspect player and initial response for caption tracks
  function inspectPlayerCaptionTracks() {
    try {
      const player = document.getElementById('movie_player');
      const videoId = getVideoId();
      if (!videoId) return;
      let tracks = null;
      let activeTrack = null;

      if (player && typeof player.getOption === 'function') {
        activeTrack = player.getOption('captions', 'track') || null;
        tracks = player.getOption('captions', 'tracklist') || (activeTrack ? [activeTrack] : null);
      }

      const currentResponse = player && typeof player.getPlayerResponse === 'function' ?
        player.getPlayerResponse() : window.ytInitialPlayerResponse;
      const playerResponse = currentResponse || window.ytInitialPlayerResponse;
      if (playerResponse && playerResponse.videoDetails &&
          playerResponse.videoDetails.videoId === videoId && playerResponse.captions) {
        const tracklistRenderer = playerResponse.captions.playerCaptionsTracklistRenderer;
        if (tracklistRenderer && tracklistRenderer.captionTracks) {
          const responseTracks = tracklistRenderer.captionTracks;
          tracks = tracks && tracks.length ? tracks.map(track => {
            const trackId = track.vssId || track.vss_id;
            const match = responseTracks.find(candidate => trackId ? candidate.vssId === trackId :
              candidate.languageCode === track.languageCode && candidate.kind === track.kind);
            return { ...match, ...track, baseUrl: track.baseUrl || (match && match.baseUrl) };
          }) : responseTracks;
        }
      }

      if (tracks && tracks.length) {
        tracks = tracks.map(track => ({ ...track, vssId: track.vssId || track.vss_id }));
        if (activeTrack) activeTrack = { ...activeTrack, vssId: activeTrack.vssId || activeTrack.vss_id };
        cachedTracks = { tracks, activeTrack, videoId };
        sendToContentScript('CAPTION_TRACKS_DETECTED', cachedTracks);
      }
      if (player && typeof player.addEventListener === 'function' && !hookedPlayers.has(player)) {
        hookedPlayers.add(player);
        player.addEventListener('onCaptionsTrackListChanged', inspectPlayerCaptionTracks);
        player.addEventListener('onCaptionsChange', inspectPlayerCaptionTracks);
      }
    } catch (e) {}
  }

  // 4. Bi-directional Handshake: Listen for requests from content script
  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.source !== 'holdtranslate-content') return;
    if (e.data.type === 'REQUEST_TRACKS') {
      if (cachedTracks && cachedTracks.videoId === getVideoId()) {
        sendToContentScript('CAPTION_TRACKS_DETECTED', cachedTracks);
      }
      if (cachedTimedText && cachedTimedText.videoId === getVideoId()) {
        sendToContentScript('TIMED_TEXT_INTERCEPTED', cachedTimedText);
      }
      inspectPlayerCaptionTracks();
    }
  });

  // Periodic check until movie_player is ready, plus event hooks
  let trackCheckAttempts = 0;
  const trackCheckTimer = setInterval(() => {
    trackCheckAttempts++;
    inspectPlayerCaptionTracks();
    if (trackCheckAttempts >= 12) {
      clearInterval(trackCheckTimer);
    }
  }, 1000);

  window.addEventListener('yt-navigate-start', () => {
    cachedTracks = null;
    cachedTimedText = null;
  }, { passive: true });

  // Re-check on YouTube SPA navigation
  window.addEventListener('yt-navigate-finish', () => {
    cachedTracks = null;
    cachedTimedText = null;
    setTimeout(inspectPlayerCaptionTracks, 300);
    setTimeout(inspectPlayerCaptionTracks, 1000);
  }, { passive: true });

  // Initial check
  inspectPlayerCaptionTracks();
})();
