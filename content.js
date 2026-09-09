// HoldTranslate - Content Script
// Long-press left mouse button to translate or revert (Immersive Mode)

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__HOLD_TRANSLATE_INJECTED__) return;
  window.__HOLD_TRANSLATE_INJECTED__ = true;

  // Configuration
  let config = {
    enabled: true,
    pressDuration: 500, // ms
    confirmDelay: 160,  // ms, 意图确认延迟 (0-300ms)
    sourceLang: 'auto',
    targetLang: 'auto',
    showRing: true,
    textColor: '#86a003',        // Default: screenshot olive green
    translateService: 'google',
    videoSubtitlesEnabled: true,
    subtitleMode: 'bilingual'     // 'bilingual' | 'monolingual'
  };

  // Video Subtitles Engine State
  const subtitleCache = new Map();
  const MAX_SUB_CACHE = 600;
  const pendingSubRequests = new Set();
  let ytCaptionObserver = null;
  let universalVideoObserver = null;
  let activeTrackListeners = new WeakSet();
  let ytTimedTextCues = [];
  let ytCurrentTrackUrl = null;
  let ytPrefetchInterval = null;

  // Check if extension context is still valid
  function isExtensionValid() {
    try {
      return typeof chrome !== 'undefined' &&
             Boolean(chrome.runtime) &&
             Boolean(chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  // Cleanup listeners if extension is reloaded/invalidated
  function cleanupListeners() {
    try {
      window.removeEventListener('mousedown', handleMouseDown, { capture: true });
      window.removeEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
      window.removeEventListener('dragend', handleDragEnd, { capture: true });
      if (typeof stopVideoSubtitlesEngine === 'function') {
        stopVideoSubtitlesEngine();
      }
    } catch (e) {}
  }

  // Update color of all existing translations when settings change
  function updateExistingTranslationsColor(color) {
    const items = document.querySelectorAll('.__gtrans-inline-result, .holdtranslate-yt-sub, .holdtranslate-sub-translated');
    items.forEach((item) => {
      item.style.setProperty('color', color, 'important');
    });
  }

  // Load config from storage safely
  if (isExtensionValid() && chrome.storage && chrome.storage.sync) {
    try {
      chrome.storage.sync.get([
        'enabled', 'pressDuration', 'confirmDelay', 'sourceLang', 'targetLang', 'showRing', 'textColor',
        'translateService', 'videoSubtitlesEnabled', 'subtitleMode'
      ], (res) => {
        if (!isExtensionValid() || (chrome.runtime && chrome.runtime.lastError)) return;
        if (res.enabled !== undefined) config.enabled = res.enabled;
        if (res.pressDuration !== undefined) config.pressDuration = Number(res.pressDuration);
        if (res.confirmDelay !== undefined) config.confirmDelay = Number(res.confirmDelay);
        if (res.sourceLang !== undefined) config.sourceLang = res.sourceLang;
        if (res.targetLang !== undefined) config.targetLang = res.targetLang;
        if (res.showRing !== undefined) config.showRing = res.showRing;
        if (res.textColor) config.textColor = res.textColor;
        if (res.translateService) config.translateService = res.translateService;
        config.videoSubtitlesEnabled = res.videoSubtitlesEnabled !== undefined ? Boolean(res.videoSubtitlesEnabled) : true;
        if (res.subtitleMode !== undefined) config.subtitleMode = res.subtitleMode;

        if (config.videoSubtitlesEnabled && typeof initVideoSubtitlesEngine === 'function') {
          initVideoSubtitlesEngine();
        }
      });

      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (!isExtensionValid()) {
          cleanupListeners();
          return;
        }
        if (namespace === 'sync') {
          if (changes.enabled) config.enabled = changes.enabled.newValue;
          if (changes.pressDuration) config.pressDuration = Number(changes.pressDuration.newValue);
          if (changes.confirmDelay !== undefined) config.confirmDelay = Number(changes.confirmDelay.newValue);
          if (changes.sourceLang) config.sourceLang = changes.sourceLang.newValue;
          if (changes.targetLang) config.targetLang = changes.targetLang.newValue;
          if (changes.showRing) config.showRing = changes.showRing.newValue;
          if (changes.translateService) config.translateService = changes.translateService.newValue;
          if (changes.textColor) {
            config.textColor = changes.textColor.newValue;
            updateExistingTranslationsColor(config.textColor);
          }
          if (changes.videoSubtitlesEnabled !== undefined) {
            config.videoSubtitlesEnabled = changes.videoSubtitlesEnabled.newValue;
            if (config.videoSubtitlesEnabled && typeof initVideoSubtitlesEngine === 'function') {
              initVideoSubtitlesEngine();
            } else if (typeof stopVideoSubtitlesEngine === 'function') {
              stopVideoSubtitlesEngine();
            }
          }
          if (changes.subtitleMode !== undefined) {
            config.subtitleMode = changes.subtitleMode.newValue;
            if (typeof refreshAllSubtitlesDisplay === 'function') {
              refreshAllSubtitlesDisplay();
            }
          }
        }
      });
    } catch (err) {
      // Ignore storage errors
    }
  }

  // State
  let holdTimer = null;
  let ringTimer = null;
  let startX = 0;
  let startY = 0;
  let downTarget = null;
  let isLongPressTriggered = false;
  let isProcessingLongPress = false;
  let progressRingEl = null;

  // Create Progress Ring Indicator
  function createProgressIndicator() {
    if (progressRingEl) return progressRingEl;
    const ring = document.createElement('div');
    ring.className = '__gtrans-progress-indicator';
    ring.innerHTML = `
      <svg viewBox="0 0 32 32">
        <circle class="bg" cx="16" cy="16" r="14" />
        <circle class="meter" cx="16" cy="16" r="14" />
      </svg>
    `;
    document.documentElement.appendChild(ring);
    progressRingEl = ring;
    return ring;
  }

  function showProgressIndicator(x, y, duration) {
    if (!config.showRing) return;
    const ring = createProgressIndicator();
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    const meter = ring.querySelector('.meter');
    if (meter) {
      meter.style.stroke = config.textColor || '#86a003';
      meter.style.transition = 'none';
      meter.style.strokeDashoffset = '88';
      // Force reflow
      void meter.offsetHeight;
      meter.style.transition = `stroke-dashoffset ${duration}ms linear`;
      meter.style.strokeDashoffset = '0';
    }
    ring.classList.add('active');
  }

  function hideProgressIndicator() {
    if (!progressRingEl) return;
    progressRingEl.classList.remove('active');
    const meter = progressRingEl.querySelector('.meter');
    if (meter) {
      meter.style.transition = 'none';
      meter.style.strokeDashoffset = '88';
    }
  }

  // Extract font properties from original element to perfectly match typography
  function getElementTypography(targetEl, targetBlock) {
    let sourceEl = (targetEl && targetEl.nodeType === Node.TEXT_NODE ? targetEl.parentElement : targetEl) || targetBlock;

    // 1. YouTube Specific Check:
    // On YouTube, the actual title text with the true 16px/18px font-size and weight is on #video-title (yt-formatted-string)
    const ytTitle = sourceEl?.closest?.('#video-title, ytd-watch-metadata h1 yt-formatted-string') ||
                    sourceEl?.querySelector?.('#video-title, yt-formatted-string') ||
                    targetBlock?.querySelector?.('#video-title, yt-formatted-string');
    if (ytTitle) {
      sourceEl = ytTitle;
    } else {
      // 2. Generic Heading Check: If targetBlock has an inner heading with larger font
      const innerHeading = targetBlock?.querySelector?.('h1, h2, h3, h4, h5, h6');
      if (innerHeading && innerHeading !== sourceEl) {
        try {
          const csSource = window.getComputedStyle(sourceEl);
          const csHeading = window.getComputedStyle(innerHeading);
          const sizeSource = parseFloat(csSource.fontSize) || 16;
          const sizeHeading = parseFloat(csHeading.fontSize) || 16;
          if (sizeHeading > sizeSource) {
            sourceEl = innerHeading;
          }
        } catch (e) {}
      }
    }

    const ref = sourceEl || targetBlock;
    if (!ref) {
      return {
        fontSize: '15px',
        fontWeight: '400',
        fontStyle: 'normal',
        textDecoration: 'none',
        lineHeight: '1.45',
        isSerifFont: false
      };
    }

    try {
      const cs = window.getComputedStyle(ref);
      const rawWeight = cs.fontWeight || '400';
      const weightNum = parseInt(rawWeight, 10) || 400;
      const isHeading = /^H[1-6]$/i.test(ref.tagName) || !!ref.closest?.('h1, h2, h3, h4, h5, h6');

      // 1. Font Size (Exact computed match)
      const fontSize = cs.fontSize || '15px';

      // 2. Font Weight (Accurately preserve bold / medium / regular)
      let fontWeight = '400';
      if (rawWeight === 'bold' || rawWeight === 'bolder' || weightNum >= 600) {
        fontWeight = weightNum >= 700 ? '700' : '600';
      } else if (weightNum >= 500) {
        // In Roboto/Inter/Segoe UI, 500 is Medium. Map to 600 for Chinese fonts so it renders bold/medium
        fontWeight = '600';
      } else if (isHeading) {
        fontWeight = '600';
      } else {
        fontWeight = '400';
      }

      // 3. Font Style (italic / oblique / normal)
      const fontStyle = (cs.fontStyle === 'italic' || cs.fontStyle === 'oblique') ? cs.fontStyle : 'normal';

      // 4. Text Decoration (underline / line-through / none)
      const rawDeco = (cs.textDecorationLine || cs.textDecoration || '').toLowerCase();
      let textDecoration = 'none';
      if (rawDeco.includes('underline') && rawDeco.includes('line-through')) {
        textDecoration = 'underline line-through';
      } else if (rawDeco.includes('underline')) {
        textDecoration = 'underline';
      } else if (rawDeco.includes('line-through')) {
        textDecoration = 'line-through';
      }

      // 5. Line Height
      const lineHeight = cs.lineHeight && cs.lineHeight !== 'normal' ? cs.lineHeight : '1.45';

      // 6. Letter Spacing
      const letterSpacing = cs.letterSpacing && cs.letterSpacing !== 'normal' ? cs.letterSpacing : null;

      // 7. Serif vs Sans-serif category
      const isSerifFont = !!(cs.fontFamily && cs.fontFamily.toLowerCase().includes('serif') && !cs.fontFamily.toLowerCase().includes('sans-serif'));

      return {
        fontSize,
        fontWeight,
        fontStyle,
        textDecoration,
        lineHeight,
        letterSpacing,
        isSerifFont
      };
    } catch (e) {
      return {
        fontSize: '15px',
        fontWeight: '400',
        fontStyle: 'normal',
        textDecoration: 'none',
        lineHeight: '1.45',
        isSerifFont: false
      };
    }
  }

  // Resolve true target element under pointer, piercing through stretched link overlays (e.g. BBC card headline a::before)
  function getTrueTargetAtPoint(target, x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') return target;
    if (target && target.closest?.('.__gtrans-inline-result')) return target;

    const elems = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [target];
    if (!elems || elems.length <= 1) return target;

    const targetRect = target.getBoundingClientRect();
    const targetContainsPoint = (
      x >= targetRect.left && x <= targetRect.right &&
      y >= targetRect.top && y <= targetRect.bottom
    );

    if (targetContainsPoint) {
      // Even if target contains point, if target is an <a> or generic card container,
      // prefer the deeper semantic text element (H1-H6, P, SPAN, LI) under (x, y)
      for (const el of elems) {
        if (el === target || target.contains(el)) {
          if (/^(H[1-6]|P|SPAN|STRONG|B|EM|I|U|LI|BLOCKQUOTE|FIGCAPTION|SUMMARY)$/i.test(el.tagName)) {
            return el;
          }
        }
      }
      return target;
    }

    // Target bounding rect DOES NOT contain (x, y) (stretched link pseudo-element overlay!)
    for (const el of elems) {
      if (el === target || el === document.body || el === document.documentElement) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        if (/^(P|H[1-6]|LI|BLOCKQUOTE|FIGCAPTION|SUMMARY|SPAN|DIV|A)$/i.test(el.tagName)) {
          if (el.innerText && el.innerText.trim().length > 0) {
            const innerSemantic = el.querySelector?.('p, h1, h2, h3, h4, h5, h6, span');
            if (innerSemantic) {
              const innerRect = innerSemantic.getBoundingClientRect();
              if (x >= innerRect.left && x <= innerRect.right && y >= innerRect.top && y <= innerRect.bottom) {
                return innerSemantic;
              }
            }
            return el;
          }
        }
      }
    }

    return target;
  }

  // If targetBlock is inside a horizontal flex row (or inline-flex), find the outer block/anchor so translation appears below
  function findInsertionAnchor(targetBlock) {
    if (!targetBlock) return targetBlock;
    let curr = targetBlock;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      const parent = curr.parentElement;
      if (!parent) break;

      try {
        const parentStyle = window.getComputedStyle(parent);
        const isFlex = parentStyle.display === 'flex' || parentStyle.display === 'inline-flex';
        const isHorizontalFlex = isFlex && !parentStyle.flexDirection.startsWith('column');

        if (isHorizontalFlex) {
          // Check if wrapped in an <a>
          const enclosingLink = parent.closest?.('a');
          if (enclosingLink && enclosingLink !== document.body) {
            return enclosingLink;
          }
          return parent;
        }
      } catch (e) {}

      if (curr.tagName === 'LI' || curr.tagName === 'TD' || curr.tagName === 'ARTICLE') break;
      if (parent.tagName === 'DIV' || parent.tagName === 'SECTION' || parent.tagName === 'MAIN') break;
      curr = parent;
    }
    return targetBlock;
  }

  // Find the closest meaningful block container for insertion
  function findBestBlockElement(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!el) return null;

    // Avoid searching into our own UI
    const insideSelf = el.closest?.('.__gtrans-inline-result');
    if (insideSelf) {
      return insideSelf;
    }

    // Twitter/X tweet text block
    const tweetBlock = el.closest?.('[data-testid="tweetText"]');
    if (tweetBlock) return tweetBlock;

    // YouTube video titles (anchor to H3)
    const ytTitle = el.closest?.('ytd-rich-grid-media h3, ytd-video-renderer h3, ytd-compact-video-renderer h3, #video-title-link, #title.ytd-watch-metadata');
    if (ytTitle) {
      return ytTitle.tagName === 'A' ? (ytTitle.closest('h3') || ytTitle) : ytTitle;
    }

    // 1. Direct semantic content block check (highest priority: keeps headings and paragraphs isolated)
    const semanticBlock = el.closest?.('h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, summary, dt, dd, td, th');
    if (semanticBlock) {
      return semanticBlock;
    }

    // 2. Climb inline elements, but NEVER climb out into a parent that encloses sibling blocks or headings
    const inlineTags = new Set([
      'SPAN', 'STRONG', 'B', 'EM', 'I', 'U', 'SMALL', 'CODE',
      'MARK', 'SUB', 'SUP', 'ABBR', 'CITE', 'TIME', 'LABEL', 'IMG', 'SVG', 'FONT',
      'YT-FORMATTED-STRING'
    ]);

    while (el && inlineTags.has(el.tagName)) {
      if (el.parentElement) {
        // Stop if parent contains headings or paragraphs to avoid swallowing whole card
        if (el.parentElement.querySelector?.('h1, h2, h3, h4, h5, h6, p')) {
          break;
        }
        el = el.parentElement;
      } else {
        break;
      }
    }

    const blockTags = new Set([
      'P', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'PRE', 'TD', 'TH', 'DD', 'DT', 'FIGCAPTION', 'SUMMARY'
    ]);

    let curr = el;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (blockTags.has(curr.tagName)) {
        return curr;
      }
      if (curr.tagName === 'DIV' || curr.tagName === 'SECTION' || curr.tagName === 'ARTICLE') {
        // If this container has multiple paragraphs/headings, keep el as the target
        if (curr !== el && curr.querySelectorAll?.('p, h1, h2, h3, h4, h5, h6').length > 1) {
          return el;
        }
        return curr;
      }
      curr = curr.parentElement;
    }

    return el || document.body;
  }

  // Strict 1-to-1 association: Get the translation specifically belonging to this element or its own block
  function getAssociatedTranslationForElement(targetEl) {
    if (!targetEl) return null;

    const el = targetEl.nodeType === Node.TEXT_NODE ? targetEl.parentElement : targetEl;
    if (!el) return null;

    // 1. User clicked directly on a translation element -> revert this translation
    const directResult = el.closest?.('.__gtrans-inline-result');
    if (directResult) return directResult;

    // 2. User clicked on original text -> find its specific content block
    const block = findBestBlockElement(el);
    if (!block) return null;

    // A. Check data-gtrans-active specifically assigned to THIS block
    const activeId = block.getAttribute?.('data-gtrans-active');
    if (activeId) {
      const root = block.getRootNode ? block.getRootNode() : document;
      const found = root.querySelector?.(`.__gtrans-inline-result[data-gtrans-target-id="${activeId}"]`);
      if (found) return found;
    }

    // Check anchor if block is inside a flex/link structure
    const anchor = findInsertionAnchor(block);
    if (anchor && anchor !== block) {
      const anchorActiveId = anchor.getAttribute?.('data-gtrans-active');
      if (anchorActiveId) {
        const root = anchor.getRootNode ? anchor.getRootNode() : document;
        const found = root.querySelector?.(`.__gtrans-inline-result[data-gtrans-target-id="${anchorActiveId}"]`);
        if (found) return found;
      }
    }

    // B. Check if the immediate next sibling is specifically the translation for THIS block/anchor
    const sib = (anchor || block).nextElementSibling;
    if (sib && sib.classList && sib.classList.contains('__gtrans-inline-result')) {
      const targetId = sib.getAttribute('data-gtrans-target-id');
      if ((activeId && targetId === activeId) || (!activeId && targetId)) {
        return sib;
      }
    }

    // C. Check child translation inside LI or TD
    const child = (anchor || block).querySelector?.(':scope > .__gtrans-inline-result');
    if (child) {
      const targetId = child.getAttribute('data-gtrans-target-id');
      if (activeId && targetId === activeId) {
        return child;
      }
    }

    // This block has not been translated yet!
    return null;
  }

  // Revert/Remove translation
  function revertTranslation(el) {
    if (!el) return;
    const targetId = el.getAttribute('data-gtrans-target-id');
    if (targetId) {
      const root = el.getRootNode ? el.getRootNode() : document;
      const originalBlocks = root.querySelectorAll?.(`[data-gtrans-active="${targetId}"]`);
      if (originalBlocks) {
        originalBlocks.forEach((b) => b.removeAttribute('data-gtrans-active'));
      }
    }
    el.classList.add('__gtrans-fade-out');
    setTimeout(() => {
      if (el.parentNode) {
        el.remove();
      }
    }, 180);
  }

  // Create Immersive Inline Translation Element with matching typography
  function createTranslationElement(targetId, typo) {
    const el = document.createElement('div');
    el.className = '__gtrans-inline-result';
    el.setAttribute('data-gtrans-target-id', targetId);
    el.style.setProperty('color', config.textColor || '#86a003', 'important');
    if (typo) {
      if (typo.fontSize) {
        el.style.setProperty('font-size', typo.fontSize, 'important');
      }
      if (typo.fontWeight) {
        el.style.setProperty('font-weight', typo.fontWeight, 'important');
      }
      if (typo.fontStyle && typo.fontStyle !== 'normal') {
        el.style.setProperty('font-style', typo.fontStyle, 'important');
      }
      if (typo.textDecoration && typo.textDecoration !== 'none') {
        el.style.setProperty('text-decoration', typo.textDecoration, 'important');
      }
      if (typo.lineHeight) {
        el.style.setProperty('line-height', typo.lineHeight, 'important');
      }
      if (typo.letterSpacing) {
        el.style.setProperty('letter-spacing', typo.letterSpacing, 'important');
      }
      if (typo.isSerifFont) {
        el.style.setProperty(
          'font-family',
          '"Songti SC", "SimSun", "STSong", "Source Han Serif CN", Georgia, Cambria, serif',
          'important'
        );
      }
    }
    el.innerHTML = `<span class="__gtrans-loading">正在翻译...</span>`;
    return el;
  }

  // Insert translation cleanly in DOM
  function insertTranslationElement(targetBlock, el) {
    const anchor = findInsertionAnchor(targetBlock);

    // Purge any stale translation element sitting right after anchor
    let next = anchor.nextElementSibling;
    while (next && next.classList.contains('__gtrans-inline-result')) {
      const toRemove = next;
      next = next.nextElementSibling;
      toRemove.remove();
    }

    if (['TD', 'TH', 'LI'].includes(anchor.tagName)) {
      // Also purge inside LI/TD
      const oldChild = anchor.querySelector(':scope > .__gtrans-inline-result');
      if (oldChild) oldChild.remove();
      anchor.appendChild(el);
    } else {
      anchor.insertAdjacentElement('afterend', el);
    }
  }

  // Handle translation response from background
  function handleTranslationResult(el, response) {
    if (!el || !el.parentNode) return;

    if (response && response.success && response.translatedText) {
      el.textContent = response.translatedText;

      // Purge any stray loading elements under the same parent
      if (el.parentElement) {
        const strayResults = el.parentElement.querySelectorAll('.__gtrans-inline-result');
        strayResults.forEach((item) => {
          if (item !== el && (item.querySelector('.__gtrans-loading') || !item.textContent.trim())) {
            item.remove();
          }
        });
      }
    } else if (response && response.skipped) {
      // Gentle hint for Chinese / Traditional Chinese skipped
      el.innerHTML = `<span class="__gtrans-skip-hint">（${response.message || '已跳过中文翻译'}）</span>`;
      setTimeout(() => {
        revertTranslation(el);
      }, 1200);
    } else {
      const errMsg = (response && response.error) || '翻译失败';
      el.innerHTML = `<span class="__gtrans-error">（${errMsg}，请长按重试）</span>`;
    }
  }

  // Send message to background script safely
  function requestTranslation(el, text) {
    if (!isExtensionValid()) {
      cleanupListeners();
      if (el) {
        el.innerHTML = `<span class="__gtrans-error">（插件已重新加载，请刷新页面 F5 后使用）</span>`;
      }
      return;
    }

    try {
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        cleanupListeners();
        if (el) el.innerHTML = `<span class="__gtrans-error">（插件已更新，请刷新页面 F5）</span>`;
        return;
      }

      chrome.runtime.sendMessage(
        {
          action: 'TRANSLATE',
          text: text,
          sourceLang: config.sourceLang || 'auto',
          targetLang: config.targetLang,
          service: config.translateService || 'google'
        },
        (res) => {
          if (!isExtensionValid()) {
            cleanupListeners();
            if (el) el.innerHTML = `<span class="__gtrans-error">（插件已更新，请刷新页面 F5）</span>`;
            return;
          }
          if (chrome.runtime && chrome.runtime.lastError) {
            handleTranslationResult(el, { success: false, error: chrome.runtime.lastError.message });
            return;
          }
          handleTranslationResult(el, res);
        }
      );
    } catch (err) {
      cleanupListeners();
      if (el) {
        el.innerHTML = `<span class="__gtrans-error">（插件已重新加载，请刷新页面 F5 后使用）</span>`;
      }
    }
  }

  // Trigger action when long press completes
  function onLongPressTriggered(targetEl) {
    if (!isExtensionValid()) {
      cleanupListeners();
      return;
    }

    if (isProcessingLongPress) return;
    isProcessingLongPress = true;
    setTimeout(() => { isProcessingLongPress = false; }, 350);

    isLongPressTriggered = true;
    hideProgressIndicator();

    // 1. Strict Check: If the clicked paragraph (or the translation itself) is already translated -> REVERT IT!
    const existingTranslation = getAssociatedTranslationForElement(targetEl);
    if (existingTranslation) {
      revertTranslation(existingTranslation);
      return;
    }

    // 2. Determine target text to translate
    const selection = window.getSelection();
    let selectedText = selection ? selection.toString().trim() : '';
    let targetBlock = null;
    let textToTranslate = '';

    if (selectedText.length > 1) {
      // Branch A: Genuine text selection (more than 1 char)
      textToTranslate = selectedText;
      let anchorNode = selection.anchorNode;
      targetBlock = findBestBlockElement(anchorNode || targetEl);
    } else {
      // Branch B: Direct element / paragraph
      targetBlock = findBestBlockElement(targetEl);
      if (targetBlock) {
        textToTranslate = targetBlock.innerText.trim();
      }
    }

    if (!targetBlock || !textToTranslate) {
      return;
    }

    // If targetBlock is itself a translation, revert it!
    if (targetBlock.classList && targetBlock.classList.contains('__gtrans-inline-result')) {
      revertTranslation(targetBlock);
      return;
    }

    // Check if targetBlock specifically has an active translation
    const blockTranslation = getAssociatedTranslationForElement(targetBlock);
    if (blockTranslation) {
      revertTranslation(blockTranslation);
      return;
    }

    // 3. Extract typography from original text for exact font size & weight matching
    const typo = getElementTypography(targetEl, targetBlock);

    // 4. Insert immersive translation element right after/inside the target block
    const targetId = `gtrans-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    targetBlock.setAttribute('data-gtrans-active', targetId);
    const anchor = findInsertionAnchor(targetBlock);
    if (anchor && anchor !== targetBlock) {
      anchor.setAttribute('data-gtrans-active', targetId);
    }

    const translationEl = createTranslationElement(targetId, typo);
    insertTranslationElement(targetBlock, translationEl);

    // 5. Request translation
    requestTranslation(translationEl, textToTranslate);
  }

  // Global Mouse Event Listeners
  function handleMouseDown(e) {
    if (e.button !== 0) return;

    // Check if extension context is valid
    if (!isExtensionValid()) {
      cleanupListeners();
      return;
    }

    if (!config.enabled) return;

    // Ignore interactive input elements unless text is selected
    const tag = e.target.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;
    const hasSelection = window.getSelection() && window.getSelection().toString().trim().length > 0;

    if (isInput && !hasSelection) {
      return;
    }

    startX = e.clientX;
    startY = e.clientY;
    downTarget = getTrueTargetAtPoint(e.target, startX, startY);
    isLongPressTriggered = false;

    // Use user-configured confirmDelay (capped to avoid exceeding pressDuration)
    const userDelay = config.confirmDelay !== undefined ? config.confirmDelay : 160;
    const actualConfirmDelay = Math.min(userDelay, Math.max(0, config.pressDuration - 40));
    const remainingRingDuration = Math.max(60, config.pressDuration - actualConfirmDelay);

    // Delayed indicator: only display the ring once hold intention is confirmed
    if (actualConfirmDelay === 0) {
      showProgressIndicator(startX, startY, config.pressDuration);
    } else {
      if (ringTimer) clearTimeout(ringTimer);
      ringTimer = setTimeout(() => {
        ringTimer = null;
        showProgressIndicator(startX, startY, remainingRingDuration);
      }, actualConfirmDelay);
    }

    // Start timer for long press
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      holdTimer = null;
      onLongPressTriggered(downTarget);
    }, config.pressDuration);
  }

  function handleMouseMove(e) {
    // 16px tolerance threshold prevents high-DPI mouse micro-jitters from cancelling the timer
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist > 16) {
      if (ringTimer) {
        clearTimeout(ringTimer);
        ringTimer = null;
      }
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      hideProgressIndicator();
    }
  }

  function handleMouseUp(e) {
    if (ringTimer) {
      clearTimeout(ringTimer);
      ringTimer = null;
    }
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    hideProgressIndicator();

    if (isLongPressTriggered) {
      const preventClick = (clickEvent) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
      };
      window.addEventListener('click', preventClick, { capture: true, once: true });
      setTimeout(() => {
        window.removeEventListener('click', preventClick, { capture: true });
        isLongPressTriggered = false;
      }, 50);
    }
  }

  function handleContextMenu(e) {
    if (isLongPressTriggered) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // Handle HTML5 drag start (e.g. dragging a link to open in new tab, super drag, etc.)
  function handleDragStart(e) {
    if (isLongPressTriggered) {
      // Long press has already triggered and translated. Prevent unwanted drag ghost while releasing.
      e.preventDefault();
      return;
    }

    // User is dragging an element (e.g. sliding a link, dragging an image or text).
    // Cancel pending long-press translation immediately so the drag operation is smooth and unhindered.
    if (ringTimer) {
      clearTimeout(ringTimer);
      ringTimer = null;
    }
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    hideProgressIndicator();
  }

  function handleDragEnd(e) {
    if (ringTimer) {
      clearTimeout(ringTimer);
      ringTimer = null;
    }
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    hideProgressIndicator();
    isLongPressTriggered = false;
  }

  // =========================================================
  // Video Subtitles Translation Engine (YouTube & X / Universal)
  // =========================================================

  function getCachedSub(text) {
    return subtitleCache.get(text.trim());
  }

  function setCachedSub(text, trans) {
    if (subtitleCache.size >= MAX_SUB_CACHE) {
      const firstKey = subtitleCache.keys().next().value;
      subtitleCache.delete(firstKey);
    }
    subtitleCache.set(text.trim(), trans);
  }

  function translateSubtitleText(rawText, callback) {
    const text = rawText.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const cached = getCachedSub(text);
    if (cached) {
      callback(cached);
      return;
    }
    if (pendingSubRequests.has(text)) return;
    if (!isExtensionValid()) return;

    pendingSubRequests.add(text);
    try {
      chrome.runtime.sendMessage({
        action: 'TRANSLATE',
        text: text,
        sourceLang: config.sourceLang || 'auto',
        targetLang: config.targetLang,
        service: config.translateService || 'google'
      }, (res) => {
        pendingSubRequests.delete(text);
        if (chrome.runtime.lastError || !res || !res.success || !res.translatedText) return;
        setCachedSub(text, res.translatedText);
        callback(res.translatedText);
      });
    } catch (e) {
      pendingSubRequests.delete(text);
    }
  }

  // --- YouTube Subtitles Handler ---
  function mirrorSubtitleTypography(refSegment, targetEl) {
    if (!refSegment || !targetEl) return;
    try {
      const comp = window.getComputedStyle(refSegment);
      if (comp) {
        if (comp.fontFamily) targetEl.style.setProperty('font-family', comp.fontFamily, 'important');
        if (comp.fontSize) targetEl.style.setProperty('font-size', comp.fontSize, 'important');
        if (comp.fontWeight) targetEl.style.setProperty('font-weight', comp.fontWeight, 'important');
        if (comp.lineHeight && comp.lineHeight !== 'normal') {
          targetEl.style.setProperty('line-height', comp.lineHeight, 'important');
        } else {
          targetEl.style.setProperty('line-height', '1.35', 'important');
        }
        if (comp.letterSpacing) targetEl.style.setProperty('letter-spacing', comp.letterSpacing, 'important');
        if (comp.fontStyle) targetEl.style.setProperty('font-style', comp.fontStyle, 'important');
      }
    } catch (e) {}
  }

  function handleYouTubeCaptions(captionContainer) {
    if (!captionContainer) return;

    const windows = (captionContainer.matches && captionContainer.matches('.caption-window'))
      ? [captionContainer]
      : captionContainer.querySelectorAll('.caption-window');
    windows.forEach((win) => {
      // Override YouTube inline styles: enable flex stacking and visible overflow
      win.style.setProperty('overflow', 'visible', 'important');
      win.style.setProperty('height', 'auto', 'important');
      win.style.setProperty('display', 'flex', 'important');
      win.style.setProperty('flex-direction', 'column', 'important');
      win.style.setProperty('align-items', 'center', 'important');

      const segments = win.querySelectorAll('.ytp-caption-segment');
      if (!segments.length) return;

      const fullOriginalText = Array.from(segments).map(s => s.textContent).join(' ').trim();
      if (!fullOriginalText) return;

      let subEl = win.querySelector('.holdtranslate-yt-sub');
      if (!subEl) {
        subEl = document.createElement('div');
        subEl.className = 'holdtranslate-yt-sub';
        subEl.style.setProperty('color', config.textColor, 'important');
        win.appendChild(subEl);
      }

      // 1:1 Mirror typography from original native segment
      mirrorSubtitleTypography(segments[0], subEl);

      if (subEl.dataset.translatedText && subEl.dataset.originalText === fullOriginalText) {
        if (subEl.textContent !== subEl.dataset.translatedText) {
          subEl.textContent = subEl.dataset.translatedText;
        }
        applyYouTubeDisplayMode(win, segments, subEl);
        return;
      }

      const cached = getCachedSub(fullOriginalText);
      if (cached) {
        subEl.dataset.originalText = fullOriginalText;
        subEl.dataset.translatedText = cached;
        if (subEl.textContent !== cached) {
          subEl.textContent = cached;
        }
        applyYouTubeDisplayMode(win, segments, subEl);
        return;
      }

      translateSubtitleText(fullOriginalText, (translatedText) => {
        const currentSegments = win.querySelectorAll('.ytp-caption-segment');
        const currentFull = Array.from(currentSegments).map(s => s.textContent).join(' ').trim();
        if (currentFull !== fullOriginalText) return;
        subEl.dataset.originalText = fullOriginalText;
        subEl.dataset.translatedText = translatedText;
        if (subEl.textContent !== translatedText) {
          subEl.textContent = translatedText;
        }
        applyYouTubeDisplayMode(win, currentSegments, subEl);
      });
    });
  }

  function applyYouTubeDisplayMode(win, segments, subEl) {
    const isMonolingual = config.subtitleMode === 'monolingual';
    segments.forEach(s => {
      s.style.setProperty('display', isMonolingual ? 'none' : '', 'important');
    });
    const capText = win.querySelector('.captions-text');
    if (capText) {
      capText.style.setProperty('display', isMonolingual ? 'none' : '', 'important');
    }
    if (subEl && subEl.textContent) {
      subEl.style.setProperty('display', 'block', 'important');
      subEl.style.setProperty('color', config.textColor, 'important');
      if (segments.length > 0) {
        mirrorSubtitleTypography(segments[0], subEl);
      }
    }
  }

  function startYouTubeObserver() {
    const checkTarget = () => {
      const container = document.querySelector('.ytp-caption-window-container') ||
                        document.querySelector('#movie_player') ||
                        document.querySelector('.html5-video-player');
      if (container) {
        if (!ytCaptionObserver) {
          ytCaptionObserver = new MutationObserver((mutations) => {
            if (!config.videoSubtitlesEnabled) return;
            const hasExternalMutation = mutations.some(m => {
              const target = m.target;
              if (target && target.nodeType === 1 && target.classList && target.classList.contains('holdtranslate-yt-sub')) return false;
              if (target && target.parentElement && target.parentElement.classList && target.parentElement.classList.contains('holdtranslate-yt-sub')) return false;
              return true;
            });
            if (!hasExternalMutation) return;
            const capContainer = document.querySelector('.ytp-caption-window-container') || container;
            handleYouTubeCaptions(capContainer);
          });
          ytCaptionObserver.observe(container, { childList: true, subtree: true, characterData: true });
        }
        handleYouTubeCaptions(container);
      } else {
        setTimeout(checkTarget, 1000);
      }
    };

    checkTarget();

    // Recheck on SPA page navigation or fullscreen changes
    if (!window.__HOLD_TRANSLATE_YT_HOOKED__) {
      window.__HOLD_TRANSLATE_YT_HOOKED__ = true;
      window.addEventListener('yt-navigate-finish', () => setTimeout(checkTarget, 500), { passive: true });
      window.addEventListener('fullscreenchange', () => setTimeout(checkTarget, 300), { passive: true });
    }
  }

  // --- YouTube TimedText Prefetching Engine (Zero-Latency Stream) ---
  function initYouTubeTimedTextPrefetch() {
    if (!window.location.hostname.includes('youtube.com')) return;

    if (!document.getElementById('holdtranslate-yt-bridge')) {
      const script = document.createElement('script');
      script.id = 'holdtranslate-yt-bridge';
      script.textContent = `
        (function() {
          function inspectTracks() {
            try {
              var p = document.getElementById('movie_player');
              var tracks = null;
              if (p && typeof p.getOption === 'function') {
                tracks = p.getOption('captions', 'tracklist') || (p.getOption('captions', 'track') ? [p.getOption('captions', 'track')] : null);
              }
              if (!tracks && window.ytInitialPlayerResponse && window.ytInitialPlayerResponse.captions) {
                tracks = window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
              }
              if (tracks && tracks.length) {
                window.dispatchEvent(new CustomEvent('HoldTranslateTracks', { detail: JSON.stringify(tracks) }));
              }
            } catch(e) {}
          }
          inspectTracks();
          window.addEventListener('yt-navigate-finish', function() { setTimeout(inspectTracks, 600); });
          var p = document.getElementById('movie_player');
          if (p && typeof p.addEventListener === 'function') {
            p.addEventListener('onCaptionsTrackListChanged', inspectTracks);
          }
        })();
      `;
      (document.head || document.documentElement).appendChild(script);
    }

    window.addEventListener('HoldTranslateTracks', (e) => {
      try {
        const tracks = JSON.parse(e.detail);
        loadYouTubeTrack(tracks);
      } catch (err) {}
    });

    checkDOMForCaptionTracks();
  }

  function checkDOMForCaptionTracks() {
    try {
      const scripts = document.querySelectorAll('script');
      for (let s of scripts) {
        const text = s.textContent;
        if (text && text.includes('captionTracks')) {
          const match = text.match(/"captionTracks":\s*(\[.*?\])/);
          if (match) {
            const tracks = JSON.parse(match[1]);
            loadYouTubeTrack(tracks);
            break;
          }
        }
      }
    } catch (e) {}
  }

  function loadYouTubeTrack(tracks) {
    if (!Array.isArray(tracks) || !tracks.length) return;
    const track = tracks.find(t => t.languageCode === 'en' || (t.vssId && t.vssId.includes('.en'))) || tracks[0];
    if (!track || !track.baseUrl || track.baseUrl === ytCurrentTrackUrl) return;

    ytCurrentTrackUrl = track.baseUrl;
    const fetchUrl = track.baseUrl.includes('fmt=json3') ? track.baseUrl : track.baseUrl + '&fmt=json3';

    fetch(fetchUrl)
      .then(r => r.json())
      .then(data => {
        if (!data || !data.events) return;
        ytTimedTextCues = data.events.map(ev => {
          if (!ev.segs || !ev.segs.length) return null;
          const text = ev.segs.map(s => s.utf8).join('').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
          if (!text) return null;
          return {
            start: ev.tStartMs,
            end: ev.tStartMs + (ev.dDurationMs || 3000),
            text: text
          };
        }).filter(Boolean);

        // Pre-translate upcoming cues (0 to 45s)
        prefetchUpcomingCues(0, 45000);
      })
      .catch(() => {});
  }

  function prefetchUpcomingCues(fromMs, toMs) {
    if (!ytTimedTextCues || !ytTimedTextCues.length) return;
    const targetCues = ytTimedTextCues.filter(c => c.start >= fromMs - 2000 && c.start <= toMs);
    targetCues.forEach(cue => {
      if (!getCachedSub(cue.text) && !pendingSubRequests.has(cue.text)) {
        translateSubtitleText(cue.text, () => {});
      }
    });
  }

  function startTrackPrefetchMonitor() {
    if (ytPrefetchInterval) clearInterval(ytPrefetchInterval);
    ytPrefetchInterval = setInterval(() => {
      if (!config.videoSubtitlesEnabled) return;
      const video = document.querySelector('video');
      if (video && !video.paused) {
        const curMs = Math.round(video.currentTime * 1000);
        prefetchUpcomingCues(curMs, curMs + 35000);
      }
    }, 2500);
  }

  // --- X (Twitter) & Universal HTML5 Video Subtitles Handler ---
  function handleGenericVideoCaptions() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      // Check HTML5 textTracks
      if (video.textTracks && video.textTracks.length > 0) {
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          if (!activeTrackListeners.has(track)) {
            activeTrackListeners.add(track);
            track.addEventListener('cuechange', () => {
              if (!config.videoSubtitlesEnabled) return;
              processVideoCues(video, track);
            });
          }
          if (track.mode === 'showing') {
            processVideoCues(video, track);
          }
        }
      }

      // X (Twitter) custom caption container observer
      const xPlayer = video.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"], .css-175oi2r');
      if (xPlayer && !xPlayer.dataset.holdtranslateObserved) {
        xPlayer.dataset.holdtranslateObserved = 'true';
        const xObserver = new MutationObserver(() => {
          if (!config.videoSubtitlesEnabled) return;
          handleXDomCaptions(xPlayer, video);
        });
        xObserver.observe(xPlayer, { childList: true, subtree: true, characterData: true });
        handleXDomCaptions(xPlayer, video);
      }
    });
  }

  function processVideoCues(video, track) {
    const activeCues = track.activeCues;
    const playerContainer = video.parentElement || video;
    let capsule = playerContainer.querySelector('.holdtranslate-video-subtitle-capsule');

    if (!activeCues || activeCues.length === 0) {
      if (capsule) capsule.style.display = 'none';
      return;
    }

    const cueTexts = [];
    for (let j = 0; j < activeCues.length; j++) {
      cueTexts.push(activeCues[j].text);
    }
    const fullText = cueTexts.join(' ').replace(/<[^>]+>/g, '').trim();
    if (!fullText) {
      if (capsule) capsule.style.display = 'none';
      return;
    }

    if (!capsule) {
      capsule = createVideoSubtitleCapsule(playerContainer);
    }

    if (capsule.dataset.originalText === fullText) {
      updateCapsuleDisplay(capsule);
      return;
    }

    capsule.dataset.originalText = fullText;
    const origEl = capsule.querySelector('.holdtranslate-sub-original');
    if (origEl) origEl.textContent = fullText;

    translateSubtitleText(fullText, (translatedText) => {
      if (capsule.dataset.originalText !== fullText) return;
      const transEl = capsule.querySelector('.holdtranslate-sub-translated');
      if (transEl) transEl.textContent = translatedText;
      updateCapsuleDisplay(capsule);
    });
  }

  function handleXDomCaptions(playerContainer, video) {
    const captionEl = playerContainer.querySelector('div[aria-label="Captions"], [data-testid="caption"]');
    if (!captionEl) return;
    const text = captionEl.textContent.trim();
    if (!text) return;

    let capsule = playerContainer.querySelector('.holdtranslate-video-subtitle-capsule');
    if (!capsule) {
      capsule = createVideoSubtitleCapsule(playerContainer);
    }

    if (capsule.dataset.originalText === text) {
      updateCapsuleDisplay(capsule);
      return;
    }

    capsule.dataset.originalText = text;
    const origEl = capsule.querySelector('.holdtranslate-sub-original');
    if (origEl) origEl.textContent = text;

    translateSubtitleText(text, (translatedText) => {
      if (capsule.dataset.originalText !== text) return;
      const transEl = capsule.querySelector('.holdtranslate-sub-translated');
      if (transEl) transEl.textContent = translatedText;
      updateCapsuleDisplay(capsule);
    });
  }

  function createVideoSubtitleCapsule(parent) {
    const capsule = document.createElement('div');
    capsule.className = 'holdtranslate-video-subtitle-capsule';
    capsule.innerHTML = `
      <div class="holdtranslate-sub-original"></div>
      <div class="holdtranslate-sub-translated"></div>
    `;
    const computedPos = window.getComputedStyle(parent).position;
    if (computedPos === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(capsule);
    return capsule;
  }

  function updateCapsuleDisplay(capsule) {
    if (!capsule) return;
    capsule.style.display = 'flex';
    const origEl = capsule.querySelector('.holdtranslate-sub-original');
    const transEl = capsule.querySelector('.holdtranslate-sub-translated');

    if (origEl) {
      origEl.style.display = config.subtitleMode === 'monolingual' ? 'none' : 'block';
    }
    if (transEl) {
      transEl.style.display = 'block';
      transEl.style.setProperty('color', config.textColor, 'important');
    }
  }

  function refreshAllSubtitlesDisplay() {
    document.querySelectorAll('.caption-window').forEach((win) => {
      const segments = win.querySelectorAll('.ytp-caption-segment');
      const subEl = win.querySelector('.holdtranslate-yt-sub');
      if (subEl) {
        applyYouTubeDisplayMode(win, segments, subEl);
      }
    });

    document.querySelectorAll('.holdtranslate-video-subtitle-capsule').forEach((capsule) => {
      updateCapsuleDisplay(capsule);
    });
  }

  function initVideoSubtitlesEngine() {
    startYouTubeObserver();
    initYouTubeTimedTextPrefetch();
    startTrackPrefetchMonitor();
    if (!universalVideoObserver && document.body) {
      universalVideoObserver = new MutationObserver(() => {
        if (!config.videoSubtitlesEnabled) return;
        handleGenericVideoCaptions();
      });
      universalVideoObserver.observe(document.body, { childList: true, subtree: true });
    }
    handleGenericVideoCaptions();
  }

  function stopVideoSubtitlesEngine() {
    if (ytCaptionObserver) {
      ytCaptionObserver.disconnect();
      ytCaptionObserver = null;
    }
    if (ytPrefetchInterval) {
      clearInterval(ytPrefetchInterval);
      ytPrefetchInterval = null;
    }
    ytTimedTextCues = [];
    ytCurrentTrackUrl = null;
    if (universalVideoObserver) {
      universalVideoObserver.disconnect();
      universalVideoObserver = null;
    }
    document.querySelectorAll('.holdtranslate-yt-sub').forEach(el => el.remove());
    document.querySelectorAll('.holdtranslate-video-subtitle-capsule').forEach(el => el.remove());
    document.querySelectorAll('.ytp-caption-segment').forEach(el => el.style.display = '');
  }

  // Register listeners
  window.addEventListener('mousedown', handleMouseDown, { capture: true });
  window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
  window.addEventListener('mouseup', handleMouseUp, { capture: true });
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('dragstart', handleDragStart, { capture: true });
  window.addEventListener('dragend', handleDragEnd, { capture: true });

})();
