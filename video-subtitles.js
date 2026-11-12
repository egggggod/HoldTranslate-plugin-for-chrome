(() => {
  const modules = globalThis.__HOLD_TRANSLATE_MODULES__ ||= {};

  modules.createVideoSubtitles = function ({ config, subtitles }) {
    const capsuleSelector = '.holdtranslate-video-subtitle-capsule';
    const captionSelector = 'div[aria-label="Captions"], [data-testid="caption"]';
    const playerSelector = '[data-testid="videoPlayer"], [data-testid="videoComponent"]';
    const videos = new Map();
    const xObservers = new Map();
    const positionedParents = new Map();
    let controller = null;
    let bodyObserver = null;
    let scanQueued = false;

    function isActive() {
      return controller && !controller.signal.aborted && config.videoSubtitlesEnabled;
    }

    function settingsKey() {
      return JSON.stringify([config.sourceLang, config.targetLang, config.translateService]);
    }

    function isOwned(node) {
      return Boolean(node && (node.nodeType === 1 ? node : node.parentElement)?.closest(capsuleSelector));
    }

    function isOwnMutation(record) {
      if (isOwned(record.target)) return true;
      const changedNodes = [...record.addedNodes, ...record.removedNodes];
      return record.type === 'childList' && changedNodes.length > 0 && changedNodes.every(isOwned);
    }

    function setStyle(element, name, value) {
      if (element.style.getPropertyValue(name) !== value ||
          element.style.getPropertyPriority(name) !== 'important') {
        element.style.setProperty(name, value, 'important');
      }
    }

    function releaseParent(state) {
      const parent = state.capsuleParent;
      const position = positionedParents.get(parent);
      if (!position) return;
      position.states.delete(state);
      if (position.states.size) return;
      if (parent.style.getPropertyValue('position') === 'relative' &&
          parent.style.getPropertyPriority('position') === position.appliedPriority) {
        if (position.value) parent.style.setProperty('position', position.value, position.priority);
        else parent.style.removeProperty('position');
      }
      positionedParents.delete(parent);
    }

    function removeCapsule(state) {
      releaseParent(state);
      state.capsule?.remove();
      state.capsule = null;
      state.capsuleParent = null;
      state.original = null;
      state.translated = null;
    }

    function clearSnapshot(state) {
      state.revision += 1;
      state.text = '';
      state.translation = '';
      state.source = null;
      state.parent = null;
      state.settings = '';
      state.media = '';
      removeCapsule(state);
    }

    function createCapsule(state) {
      const parent = state.parent;
      let position = positionedParents.get(parent);
      if (!position && getComputedStyle(parent).position === 'static') {
        position = {
          value: parent.style.getPropertyValue('position'),
          priority: parent.style.getPropertyPriority('position'),
          appliedPriority: parent.style.getPropertyPriority('position'),
          states: new Set()
        };
        positionedParents.set(parent, position);
        parent.style.setProperty('position', 'relative', position.appliedPriority);
      }
      if (position) position.states.add(state);
      state.capsuleParent = parent;
      state.capsule = document.createElement('div');
      state.capsule.className = 'holdtranslate-video-subtitle-capsule';
      state.original = document.createElement('div');
      state.original.className = 'holdtranslate-sub-original';
      state.translated = document.createElement('div');
      state.translated.className = 'holdtranslate-sub-translated';
      state.capsule.append(state.original, state.translated);
      parent.appendChild(state.capsule);
    }

    function render(state) {
      if (!isActive() || !state.video.isConnected || !state.parent?.isConnected ||
          !state.text || (config.subtitleMode === 'monolingual' && !state.translation)) {
        removeCapsule(state);
        return;
      }
      if (state.capsule && state.capsule.parentElement !== state.parent) removeCapsule(state);
      if (!state.capsule) createCapsule(state);
      if (state.original.textContent !== state.text) state.original.textContent = state.text;
      if (state.translated.textContent !== state.translation) {
        state.translated.textContent = state.translation;
      }
      state.capsule.dataset.originalText = state.text;
      setStyle(state.capsule, 'display', 'flex');
      setStyle(state.original, 'display', config.subtitleMode === 'monolingual' ? 'none' : 'block');
      setStyle(state.translated, 'display', state.translation ? 'block' : 'none');
      setStyle(state.translated, 'color', config.textColor || '');
    }

    function findXPlayer(video) {
      return video.closest(playerSelector) ||
        (/(^|\.)(x|twitter)\.com$/.test(location.hostname) ? video.closest('.css-175oi2r') : null);
    }

    function isCaptionVisible(caption, parent) {
      for (let element = caption; element; element = element.parentElement) {
        if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
          return false;
        }
        if (element === parent) break;
      }
      return true;
    }

    function readSnapshot(state) {
      const video = state.video;
      const parent = state.xPlayer || video.parentElement;
      const media = video.currentSrc || video.getAttribute('src') || '';
      if (!video.isConnected || !parent?.isConnected || video.seeking || video.ended) {
        return { text: '', source: null, parent, media };
      }
      const caption = state.xPlayer?.querySelector(captionSelector);
      if (caption && !isOwned(caption)) {
        const text = isCaptionVisible(caption, parent) ? caption.textContent.trim() : '';
        return { text, source: caption, parent, media };
      }
      const cueTexts = [];
      let source = null;
      for (const track of Array.from(video.textTracks || [])) {
        if (track.mode !== 'showing' ||
            (track.kind && track.kind !== 'captions' && track.kind !== 'subtitles')) continue;
        if (!source) source = track;
        for (const cue of Array.from(track.activeCues || [])) {
          if (typeof cue.text === 'string') cueTexts.push(cue.text);
        }
      }
      const text = cueTexts.join(' ').replace(/<[^>]+>/g, '').trim();
      return { text, source, parent, media };
    }

    function update(state) {
      if (!isActive()) return;
      const snapshot = readSnapshot(state);
      if (!snapshot.text) {
        clearSnapshot(state);
        return;
      }
      const currentSettings = settingsKey();
      if (state.text === snapshot.text && state.source === snapshot.source &&
          state.parent === snapshot.parent && state.media === snapshot.media &&
          state.settings === currentSettings) {
        render(state);
        return;
      }
      clearSnapshot(state);
      Object.assign(state, snapshot, { settings: currentSettings });
      const revision = state.revision;
      const requestController = controller;
      const isCurrent = () => {
        if (!isActive() || requestController.signal.aborted ||
            revision !== state.revision ||
            videos.get(state.video) !== state || currentSettings !== settingsKey()) return false;
        const visible = readSnapshot(state);
        return visible.text === snapshot.text && visible.source === snapshot.source &&
          visible.parent === snapshot.parent && visible.media === snapshot.media;
      };
      const onResult = translatedText => {
        if (!isCurrent()) return;
        state.translation = typeof translatedText === 'string' ? translatedText.trim() : '';
        render(state);
      };
      const cached = subtitles.getCached(snapshot.text);
      if (typeof cached === 'string') {
        state.translation = cached.trim();
        render(state);
        return;
      }
      render(state);
      try {
        subtitles.translate(snapshot.text, onResult, () => {
          if (isCurrent()) render(state);
        });
      } catch {
        if (isCurrent()) render(state);
      }
    }

    function detachXPlayer(state) {
      const entry = xObservers.get(state.xPlayer);
      if (entry) {
        entry.states.delete(state);
        if (!entry.states.size) {
          entry.observer.disconnect();
          xObservers.delete(state.xPlayer);
        }
      }
      state.xPlayer = null;
    }

    function attachXPlayer(state) {
      const player = findXPlayer(state.video);
      if (player === state.xPlayer) return;
      detachXPlayer(state);
      clearSnapshot(state);
      state.xPlayer = player;
      if (!player) return;
      let entry = xObservers.get(player);
      if (!entry) {
        entry = { states: new Set(), observer: null };
        entry.observer = new MutationObserver(records => {
          if (!isActive() || records.every(isOwnMutation)) return;
          if (!player.isConnected) {
            queueScan();
            return;
          }
          for (const currentState of entry.states) update(currentState);
        });
        entry.observer.observe(player, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['aria-label', 'data-testid', 'aria-hidden', 'hidden', 'style', 'class']
        });
        xObservers.set(player, entry);
      }
      entry.states.add(state);
    }

    function syncTracks(state) {
      const currentTracks = new Set(Array.from(state.video.textTracks || []));
      for (const [track, trackController] of state.tracks) {
        if (currentTracks.has(track)) continue;
        trackController.abort();
        state.tracks.delete(track);
      }
      for (const track of currentTracks) {
        if (state.tracks.has(track)) continue;
        const trackController = new AbortController();
        track.addEventListener('cuechange', () => update(state), { signal: trackController.signal });
        state.tracks.set(track, trackController);
      }
    }

    function attachVideo(video) {
      const state = {
        video,
        controller: new AbortController(),
        tracks: new Map(),
        xPlayer: null,
        capsule: null,
        revision: 0
      };
      videos.set(video, state);
      clearSnapshot(state);
      const options = { signal: state.controller.signal };
      const sync = () => {
        if (!isActive()) return;
        syncTracks(state);
        update(state);
      };
      for (const eventName of ['loadedmetadata', 'loadeddata', 'seeked', 'timeupdate', 'play']) {
        video.addEventListener(eventName, sync, options);
      }
      for (const eventName of ['emptied', 'loadstart', 'seeking', 'ended']) {
        video.addEventListener(eventName, () => clearSnapshot(state), options);
      }
      if (video.textTracks) {
        for (const eventName of ['addtrack', 'removetrack', 'change']) {
          video.textTracks.addEventListener(eventName, sync, options);
        }
      }
      return state;
    }

    function detachVideo(state) {
      state.controller.abort();
      for (const trackController of state.tracks.values()) trackController.abort();
      state.tracks.clear();
      detachXPlayer(state);
      clearSnapshot(state);
      videos.delete(state.video);
    }

    function scan() {
      if (!isActive()) return;
      const currentVideos = new Set(document.querySelectorAll('video'));
      for (const [video, state] of videos) {
        if (!currentVideos.has(video)) detachVideo(state);
      }
      for (const video of currentVideos) {
        const state = videos.get(video) || attachVideo(video);
        attachXPlayer(state);
        syncTracks(state);
        update(state);
      }
    }

    function queueScan() {
      if (!isActive() || scanQueued) return;
      scanQueued = true;
      const scheduledController = controller;
      queueMicrotask(() => {
        if (scheduledController !== controller || scheduledController.signal.aborted) return;
        scanQueued = false;
        scan();
      });
    }

    function containsSource(node) {
      return node.nodeType === 1 && !isOwned(node) &&
        (node.matches('video, track, source') || Boolean(node.querySelector('video, track, source')));
    }

    function observeBody() {
      if (!isActive()) return;
      bodyObserver?.disconnect();
      const target = document.body || document.documentElement;
      if (!target) return;
      bodyObserver = new MutationObserver(records => {
        if (!isActive()) return;
        const needsScan = records.some(record => {
          if (isOwnMutation(record)) return false;
          if (record.type === 'attributes') {
            return containsSource(record.target) || Boolean(record.target.closest('video'));
          }
          return [...record.addedNodes, ...record.removedNodes].some(containsSource);
        });
        if (needsScan) queueScan();
      });
      bodyObserver.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'kind', 'srclang', 'label', 'default', 'data-testid']
      });
    }

    function start() {
      if (!config.videoSubtitlesEnabled) {
        stop();
        return;
      }
      if (controller) {
        refresh();
        return;
      }
      controller = new AbortController();
      observeBody();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          observeBody();
          scan();
        }, { once: true, signal: controller.signal });
      }
      scan();
    }

    function stop() {
      controller?.abort();
      controller = null;
      scanQueued = false;
      bodyObserver?.disconnect();
      bodyObserver = null;
      for (const state of videos.values()) detachVideo(state);
      for (const entry of xObservers.values()) entry.observer.disconnect();
      xObservers.clear();
    }

    function refresh() {
      if (!config.videoSubtitlesEnabled) {
        stop();
        return;
      }
      if (!controller) {
        start();
        return;
      }
      scan();
    }

    return { start, stop, refresh };
  };
})();
