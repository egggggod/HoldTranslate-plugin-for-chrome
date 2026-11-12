(function () {
  'use strict';

  const modules = globalThis.__HOLD_TRANSLATE_MODULES__ ||= {};

  modules.createPageTranslator = function ({ config, isExtensionValid, onInvalidated }) {
    let controller = null;
    const pendingTimers = new Set();
    let holdTimer = null;
    let startX = 0;
    let startY = 0;
    let downTarget = null;
    let isLongPressTriggered = false;
    let isProcessingLongPress = false;

    const JAPANESE_KANA_REGEX = /[\u3040-\u309F\u30A0-\u30FF]/;
    const KOREAN_HANGUL_REGEX = /[\uAC00-\uD7AF]/;

    function scheduleTimeout(callback, delay) {
      const activeController = controller;
      const timer = setTimeout(() => {
        pendingTimers.delete(timer);
        if (controller !== activeController || activeController.signal.aborted) return;
        callback();
      }, delay);
      pendingTimers.add(timer);
      return timer;
    }

    function clearHoldTimer() {
      if (holdTimer !== null) {
        clearTimeout(holdTimer);
        pendingTimers.delete(holdTimer);
        holdTimer = null;
      }
    }

    function handleInvalidated(el, message) {
      if (controller && !controller.signal.aborted && el && message) {
        el.innerHTML = `<span class="__gtrans-error">（${message}）</span>`;
      }
      stop();
      onInvalidated();
    }

    function isChineseText(str) {
      if (!str || typeof str !== 'string') return false;
      const trimmed = str.trim();
      if (!trimmed) return false;
      if (JAPANESE_KANA_REGEX.test(trimmed) || KOREAN_HANGUL_REGEX.test(trimmed)) {
        return false;
      }
      const matches = trimmed.match(/[\u4e00-\u9fa5]/g);
      if (!matches) return false;
      const total = trimmed.replace(/\s+/g, '').length;
      if (total === 0) return false;
      if (total <= 4) {
        return matches.length >= 1;
      }
      return (matches.length / total) > 0.25;
    }

    function getElementTypography(targetEl, targetBlock) {
      let sourceEl = (targetEl && targetEl.nodeType === Node.TEXT_NODE ? targetEl.parentElement : targetEl) || targetBlock;

      const ytTitle = sourceEl?.closest?.('#video-title, ytd-watch-metadata h1 yt-formatted-string') ||
                      sourceEl?.querySelector?.('#video-title, yt-formatted-string') ||
                      targetBlock?.querySelector?.('#video-title, yt-formatted-string');
      if (ytTitle) {
        sourceEl = ytTitle;
      } else {
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

        const fontSize = cs.fontSize || '15px';

        let fontWeight = '400';
        if (rawWeight === 'bold' || rawWeight === 'bolder' || weightNum >= 600) {
          fontWeight = weightNum >= 700 ? '700' : '600';
        } else if (weightNum >= 500) {
          fontWeight = '600';
        } else if (isHeading) {
          fontWeight = '600';
        } else {
          fontWeight = '400';
        }

        const fontStyle = (cs.fontStyle === 'italic' || cs.fontStyle === 'oblique') ? cs.fontStyle : 'normal';

        const rawDeco = (cs.textDecorationLine || cs.textDecoration || '').toLowerCase();
        let textDecoration = 'none';
        if (rawDeco.includes('underline') && rawDeco.includes('line-through')) {
          textDecoration = 'underline line-through';
        } else if (rawDeco.includes('underline')) {
          textDecoration = 'underline';
        } else if (rawDeco.includes('line-through')) {
          textDecoration = 'line-through';
        }

        const lineHeight = cs.lineHeight && cs.lineHeight !== 'normal' ? cs.lineHeight : '1.45';

        const letterSpacing = cs.letterSpacing && cs.letterSpacing !== 'normal' ? cs.letterSpacing : null;

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
        for (const el of elems) {
          if (el === target || target.contains(el)) {
            if (/^(H[1-6]|P|SPAN|STRONG|B|EM|I|U|LI|BLOCKQUOTE|FIGCAPTION|SUMMARY)$/i.test(el.tagName)) {
              return el;
            }
          }
        }
        return target;
      }

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

    function findBestBlockElement(node) {
      let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      if (!el) return null;

      const insideSelf = el.closest?.('.__gtrans-inline-result');
      if (insideSelf) {
        return insideSelf;
      }

      const tweetBlock = el.closest?.('[data-testid="tweetText"]');
      if (tweetBlock) return tweetBlock;

      const ytTitle = el.closest?.('ytd-rich-grid-media h3, ytd-video-renderer h3, ytd-compact-video-renderer h3, #video-title-link, #title.ytd-watch-metadata');
      if (ytTitle) {
        return ytTitle.tagName === 'A' ? (ytTitle.closest('h3') || ytTitle) : ytTitle;
      }

      const semanticBlock = el.closest?.('h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, summary, dt, dd, td, th');
      if (semanticBlock) {
        return semanticBlock;
      }

      const inlineTags = new Set([
        'SPAN', 'STRONG', 'B', 'EM', 'I', 'U', 'SMALL', 'CODE',
        'MARK', 'SUB', 'SUP', 'ABBR', 'CITE', 'TIME', 'LABEL', 'IMG', 'SVG', 'FONT',
        'YT-FORMATTED-STRING'
      ]);

      while (el && inlineTags.has(el.tagName)) {
        if (el.parentElement) {
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
          if (curr !== el && curr.querySelectorAll?.('p, h1, h2, h3, h4, h5, h6').length > 1) {
            return el;
          }
          return curr;
        }
        curr = curr.parentElement;
      }

      return el || document.body;
    }

    function getAssociatedTranslationForElement(targetEl) {
      if (!targetEl) return null;

      const el = targetEl.nodeType === Node.TEXT_NODE ? targetEl.parentElement : targetEl;
      if (!el) return null;

      const directResult = el.closest?.('.__gtrans-inline-result');
      if (directResult) return directResult;

      const block = findBestBlockElement(el);
      if (!block) return null;

      const activeId = block.getAttribute?.('data-gtrans-active');
      if (activeId) {
        const root = block.getRootNode ? block.getRootNode() : document;
        const found = root.querySelector?.(`.__gtrans-inline-result[data-gtrans-target-id="${activeId}"]`);
        if (found) return found;
      }

      const anchor = findInsertionAnchor(block);
      if (anchor && anchor !== block) {
        const anchorActiveId = anchor.getAttribute?.('data-gtrans-active');
        if (anchorActiveId) {
          const root = anchor.getRootNode ? anchor.getRootNode() : document;
          const found = root.querySelector?.(`.__gtrans-inline-result[data-gtrans-target-id="${anchorActiveId}"]`);
          if (found) return found;
        }
      }

      const sib = (anchor || block).nextElementSibling;
      if (sib && sib.classList && sib.classList.contains('__gtrans-inline-result')) {
        const targetId = sib.getAttribute('data-gtrans-target-id');
        if ((activeId && targetId === activeId) || (!activeId && targetId)) {
          return sib;
        }
      }

      const child = (anchor || block).querySelector?.(':scope > .__gtrans-inline-result');
      if (child) {
        const targetId = child.getAttribute('data-gtrans-target-id');
        if (activeId && targetId === activeId) {
          return child;
        }
      }

      return null;
    }

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
      scheduleTimeout(() => {
        if (el.parentNode) {
          el.remove();
        }
      }, 180);
    }

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

    function insertTranslationElement(targetBlock, el) {
      const anchor = findInsertionAnchor(targetBlock);

      let next = anchor.nextElementSibling;
      while (next && next.classList.contains('__gtrans-inline-result')) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }

      if (['TD', 'TH', 'LI'].includes(anchor.tagName)) {
        const oldChild = anchor.querySelector(':scope > .__gtrans-inline-result');
        if (oldChild) oldChild.remove();
        anchor.appendChild(el);
      } else {
        anchor.insertAdjacentElement('afterend', el);
      }
    }

    function handleTranslationResult(el, response) {
      if (!el || !el.parentNode) return;

      if (response && response.success && response.translatedText) {
        el.textContent = response.translatedText;

        if (el.parentElement) {
          const strayResults = el.parentElement.querySelectorAll('.__gtrans-inline-result');
          strayResults.forEach((item) => {
            if (item !== el && (item.querySelector('.__gtrans-loading') || !item.textContent.trim())) {
              item.remove();
            }
          });
        }
      } else if (response && response.skipped) {
        revertTranslation(el);
      } else {
        const errMsg = (response && response.error) || '翻译失败';
        el.innerHTML = `<span class="__gtrans-error">（${errMsg}，请长按重试）</span>`;
      }
    }

    function requestTranslation(el, text) {
      const requestController = controller;
      if (!requestController || requestController.signal.aborted) return;
      if (!isExtensionValid()) {
        handleInvalidated(el, '插件已重新加载，请刷新页面 F5 后使用');
        return;
      }

      try {
        if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
          handleInvalidated(el, '插件已更新，请刷新页面 F5');
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
            const extensionValid = isExtensionValid();
            const runtimeError = extensionValid && chrome.runtime.lastError;
            if (controller !== requestController || requestController.signal.aborted) return;
            if (!extensionValid) {
              handleInvalidated(el, '插件已更新，请刷新页面 F5');
              return;
            }
            if (runtimeError) {
              handleTranslationResult(el, { success: false, error: runtimeError.message });
              return;
            }
            handleTranslationResult(el, res);
          }
        );
      } catch (err) {
        handleInvalidated(el, '插件已重新加载，请刷新页面 F5 后使用');
      }
    }

    function onLongPressTriggered(targetEl) {
      if (!isExtensionValid()) {
        handleInvalidated();
        return;
      }

      if (isProcessingLongPress) return;
      isProcessingLongPress = true;
      scheduleTimeout(() => { isProcessingLongPress = false; }, 350);

      const existingTranslation = getAssociatedTranslationForElement(targetEl);
      if (existingTranslation) {
        isLongPressTriggered = true;
        revertTranslation(existingTranslation);
        return;
      }

      const selection = window.getSelection();
      let selectedText = selection ? selection.toString().trim() : '';
      let targetBlock = null;
      let textToTranslate = '';

      if (selectedText.length > 1) {
        textToTranslate = selectedText;
        let anchorNode = selection.anchorNode;
        targetBlock = findBestBlockElement(anchorNode || targetEl);
      } else {
        targetBlock = findBestBlockElement(targetEl);
        if (targetBlock) {
          textToTranslate = targetBlock.innerText.trim();
        }
      }

      if (!targetBlock || !textToTranslate) {
        return;
      }

      if (targetBlock.classList && targetBlock.classList.contains('__gtrans-inline-result')) {
        isLongPressTriggered = true;
        revertTranslation(targetBlock);
        return;
      }

      const blockTranslation = getAssociatedTranslationForElement(targetBlock);
      if (blockTranslation) {
        isLongPressTriggered = true;
        revertTranslation(blockTranslation);
        return;
      }

      const effectiveTargetLang = config.targetLang || 'auto';
      const isTargetChinese = effectiveTargetLang === 'auto' || effectiveTargetLang === 'zh-CN' || effectiveTargetLang === 'zh-TW' || effectiveTargetLang === 'zh';
      if (isTargetChinese && isChineseText(textToTranslate)) {
        return;
      }

      isLongPressTriggered = true;

      const typo = getElementTypography(targetEl, targetBlock);

      const targetId = `gtrans-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      targetBlock.setAttribute('data-gtrans-active', targetId);
      const anchor = findInsertionAnchor(targetBlock);
      if (anchor && anchor !== targetBlock) {
        anchor.setAttribute('data-gtrans-active', targetId);
      }

      const translationEl = createTranslationElement(targetId, typo);
      insertTranslationElement(targetBlock, translationEl);

      requestTranslation(translationEl, textToTranslate);
    }

    function isMediaOrInteractiveControl(el) {
      if (!el || el === document.body || el === document.documentElement) return false;

      const tag = el.tagName ? el.tagName.toUpperCase() : '';
      if (['VIDEO', 'AUDIO', 'CANVAS', 'EMBED', 'OBJECT'].includes(tag)) {
        return true;
      }

      const mediaContainer = el.closest?.(
        'video, audio, canvas, embed, object, ' +
        '.xgplayer, [class*="xgplayer"], [class*="xg-"], ' +
        '[class*="progress"], [class*="slider"], [class*="scrub"], [class*="timeline"], [class*="seek"], ' +
        '[role="slider"], [role="progressbar"], ' +
        '.html5-video-player, #movie_player, .bpx-player-container, .dplayer, .prism-player'
      );
      if (mediaContainer) {
        if (el.closest?.('.ytp-caption-segment, .captions-text, .caption-window, .holdtranslate-yt-sub, .holdtranslate-video-subtitle-capsule')) {
          return false;
        }
        return true;
      }

      return false;
    }

    function handleMouseDown(e) {
      if (e.button !== 0) return;

      if (!isExtensionValid()) {
        handleInvalidated();
        return;
      }

      if (!config.enabled) return;

      if (e.target.closest?.('.caption-window[data-holdtranslate-draggable="true"]')) return;

      const hasSelection = window.getSelection() && window.getSelection().toString().trim().length > 0;

      const tag = e.target.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

      if (isInput && !hasSelection) {
        return;
      }

      if (!hasSelection && isMediaOrInteractiveControl(e.target)) {
        return;
      }

      startX = e.clientX;
      startY = e.clientY;
      downTarget = getTrueTargetAtPoint(e.target, startX, startY);
      isLongPressTriggered = false;

      clearHoldTimer();
      holdTimer = scheduleTimeout(() => {
        holdTimer = null;
        onLongPressTriggered(downTarget);
      }, config.pressDuration);
    }

    function handleMouseMove(e) {
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist > 16) {
        clearHoldTimer();
      }
    }

    function handleMouseUp(e) {
      clearHoldTimer();

      if (isLongPressTriggered) {
        const preventClick = (clickEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };
        window.addEventListener('click', preventClick, { capture: true, once: true, signal: controller.signal });
        scheduleTimeout(() => {
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

    function handleDragStart(e) {
      if (isMediaOrInteractiveControl(e.target)) {
        return;
      }

      if (isLongPressTriggered) {
        e.preventDefault();
        return;
      }

      clearHoldTimer();
    }

    function handleDragEnd(e) {
      clearHoldTimer();
      isLongPressTriggered = false;
    }

    function start() {
      if (controller) return;
      if (!isExtensionValid()) {
        onInvalidated();
        return;
      }
      controller = new AbortController();
      const signal = controller.signal;
      window.addEventListener('mousedown', handleMouseDown, { capture: true, signal });
      window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true, signal });
      window.addEventListener('mouseup', handleMouseUp, { capture: true, signal });
      window.addEventListener('contextmenu', handleContextMenu, { capture: true, signal });
      window.addEventListener('dragstart', handleDragStart, { capture: true, signal });
      window.addEventListener('dragend', handleDragEnd, { capture: true, signal });
    }

    function stop() {
      if (controller) {
        controller.abort();
        controller = null;
      }
      pendingTimers.forEach((timer) => clearTimeout(timer));
      pendingTimers.clear();
      holdTimer = null;
      downTarget = null;
      startX = 0;
      startY = 0;
      isLongPressTriggered = false;
      isProcessingLongPress = false;
    }

    return { start, stop };
  };
})();
