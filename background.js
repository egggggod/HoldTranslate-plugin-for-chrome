// HoldTranslate - Background Service Worker (Manifest V3)

// In-memory cache for translations (key -> result)
const translationCache = new Map();
const MAX_CACHE_SIZE = 300;

function getCacheKey(text, targetLang) {
  return `${targetLang}:::${text.trim()}`;
}

function addToCache(key, data) {
  if (translationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }
  translationCache.set(key, data);
}

// Japanese and Korean regex
const JAPANESE_KANA_REGEX = /[\u3040-\u309F\u30A0-\u30FF]/;
const KOREAN_HANGUL_REGEX = /[\uAC00-\uD7AF]/;

// Traditional Chinese characteristic characters
const TRADITIONAL_CHARS_REGEX = /[體國學繁發與為這說時會點後個們開關對電長語讀幾應總將歡樂權實樣題愛頭車東現變經認過門氣廣萬處從進動義無聲區風寫頭帶網場際標態資構視導體際備辦聯劃優選報專創續觀歷規單類傳強參臺萬劃]/;

// Check if text is Chinese (excluding Japanese/Korean)
function isChineseText(str) {
  if (JAPANESE_KANA_REGEX.test(str) || KOREAN_HANGUL_REGEX.test(str)) {
    return false;
  }
  const matches = str.match(/[\u4e00-\u9fa5]/g);
  if (!matches) return false;
  const total = str.replace(/\s+/g, '').length;
  return matches.length >= 2 || (matches.length / total) > 0.2;
}

// Check if text is Traditional Chinese
function isTraditionalChinese(str) {
  return isChineseText(str) && TRADITIONAL_CHARS_REGEX.test(str);
}

/**
 * Perform translation using Google Translate API
 */
async function translateText(text, options = {}) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('翻译内容为空');
  }

  const {
    targetLang = 'auto',
    translateChinese = false,      // 默认中文不翻译
    translateTraditional = true    // 默认繁体中文翻译为简体中文
  } = options;

  let actualTargetLang = targetLang;

  // Language auto-detection & filtering
  if (!actualTargetLang || actualTargetLang === 'auto') {
    const isChinese = isChineseText(trimmed);
    if (isChinese) {
      const isTrad = isTraditionalChinese(trimmed);
      if (isTrad) {
        // Traditional Chinese
        if (!translateTraditional) {
          return {
            success: false,
            skipped: true,
            reason: 'traditional_disabled',
            message: '已设置繁体中文不翻译'
          };
        }
        // Translate Traditional to Simplified Chinese
        actualTargetLang = 'zh-CN';
      } else {
        // Simplified Chinese
        if (!translateChinese) {
          return {
            success: false,
            skipped: true,
            reason: 'chinese_disabled',
            message: '已设置中文不翻译'
          };
        }
        // User explicitly enabled Chinese translation -> translate to English
        actualTargetLang = 'en';
      }
    } else {
      // Non-Chinese language (English, Japanese, etc.) -> translate to Simplified Chinese
      actualTargetLang = 'zh-CN';
    }
  }

  const cacheKey = getCacheKey(trimmed, actualTargetLang);
  if (translationCache.has(cacheKey)) {
    return { ...translationCache.get(cacheKey), fromCache: true };
  }

  // Supported API clients to try
  const clientTypes = ['dict-chrome-ex', 'gtx'];
  let lastError = null;

  for (const client of clientTypes) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=auto&tl=${encodeURIComponent(
        actualTargetLang
      )}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(trimmed)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      let translatedText = '';
      let detectedLang = 'auto';

      if (data && Array.isArray(data.sentences)) {
        translatedText = data.sentences
          .map((s) => s.trans || '')
          .join('')
          .trim();
        detectedLang = data.src || 'auto';
      } else if (Array.isArray(data) && Array.isArray(data[0])) {
        translatedText = data[0]
          .filter((item) => item && typeof item[0] === 'string')
          .map((item) => item[0])
          .join('')
          .trim();
        detectedLang = data[2] || 'auto';
      }

      // Check detected source language post-API check
      if ((detectedLang === 'zh-CN' || detectedLang === 'zh') && !translateChinese && actualTargetLang === 'zh-CN') {
        return {
          success: false,
          skipped: true,
          reason: 'chinese_disabled',
          message: '检测到中文，已跳过翻译'
        };
      }
      if ((detectedLang === 'zh-TW' || detectedLang === 'zh-HK') && !translateTraditional) {
        return {
          success: false,
          skipped: true,
          reason: 'traditional_disabled',
          message: '检测到繁体中文，已跳过翻译'
        };
      }

      if (translatedText) {
        const result = {
          success: true,
          originalText: trimmed,
          translatedText,
          detectedLang,
          targetLang: actualTargetLang
        };
        addToCache(cacheKey, result);
        return result;
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Fallback single request
  try {
    const fallbackUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      actualTargetLang
    )}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const res = await fetch(fallbackUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedText = data[0]
          .filter((item) => item && typeof item[0] === 'string')
          .map((item) => item[0])
          .join('')
          .trim();
        const detectedLang = data[2] || 'auto';

        if ((detectedLang === 'zh-CN' || detectedLang === 'zh') && !translateChinese && actualTargetLang === 'zh-CN') {
          return {
            success: false,
            skipped: true,
            reason: 'chinese_disabled',
            message: '检测到中文，已跳过翻译'
          };
        }

        if (translatedText) {
          const result = {
            success: true,
            originalText: trimmed,
            translatedText,
            detectedLang,
            targetLang: actualTargetLang
          };
          addToCache(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err) {
    lastError = err;
  }

  throw new Error(lastError ? lastError.message : '翻译服务不可用，请稍后重试');
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'TRANSLATE') {
    translateText(request.text, {
      targetLang: request.targetLang,
      translateChinese: request.translateChinese,
      translateTraditional: request.translateTraditional
    })
      .then((res) => sendResponse(res))
      .catch((err) => {
        console.error('Translation error:', err);
        sendResponse({
          success: false,
          error: err.message || '翻译失败，请检查网络'
        });
      });
    return true; // Async channel
  }
});
