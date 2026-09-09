// HoldTranslate - Background Service Worker (Manifest V3)

// In-memory cache for translations (key -> result)
const translationCache = new Map();
const MAX_CACHE_SIZE = 300;

function getCacheKey(service, text, sourceLang, targetLang) {
  return `${service || 'google'}:::${sourceLang || 'auto'}->${targetLang}:::${text.trim()}`;
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

// LLM Language name mappings
const LLM_LANG_NAMES = {
  'zh-CN': 'Simplified Chinese (简体中文)',
  'zh-TW': 'Traditional Chinese (繁体中文)',
  'zh': 'Simplified Chinese (简体中文)',
  'en': 'English',
  'ja': 'Japanese (日本語)',
  'ko': 'Korean (한국어)',
  'fr': 'French (Français)',
  'de': 'German (Deutsch)',
  'es': 'Spanish (Español)',
  'ru': 'Russian (Русский)',
  'auto': 'Simplified Chinese (简体中文)'
};

// Bing language code mappings
const BING_LANG_MAP = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'zh': 'zh-Hans',
  'auto': 'zh-Hans'
};

// Cached Bing session token
let bingSession = null;
let bingSessionTimestamp = 0;
const BING_SESSION_TTL = 35 * 60 * 1000; // 35 minutes

/**
 * Fetch Bing translator session tokens (IG, IID, key, token)
 */
async function getBingSession() {
  const now = Date.now();
  if (bingSession && (now - bingSessionTimestamp < BING_SESSION_TTL)) {
    return bingSession;
  }

  const endpoints = [
    'https://cn.bing.com/translator',
    'https://www.bing.com/translator'
  ];

  let lastErr = null;
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (!res.ok) continue;

      const html = await res.text();
      const igMatch = html.match(/IG:"([A-Za-z0-9]+)"/);
      const iidMatch = html.match(/data-iid="([^"]+)"/);
      const tokenMatch = html.match(/\[([0-9]{10,}),"([^"]+)",[0-9]+\]/);

      if (igMatch && tokenMatch) {
        let host = 'cn.bing.com';
        try {
          host = new URL(res.url || ep).host;
        } catch (e) {}

        bingSession = {
          ig: igMatch[1],
          iid: iidMatch ? iidMatch[1] : 'translator.5023',
          key: tokenMatch[1],
          token: tokenMatch[2],
          host: host
        };
        bingSessionTimestamp = now;
        return bingSession;
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(lastErr ? `微软翻译凭证获取失败: ${lastErr.message}` : '微软翻译凭证获取失败');
}

/**
 * Perform translation using Microsoft (Bing) Translator
 */
async function handleMicrosoftTranslate(text, sourceLang, targetLang) {
  const bingTarget = BING_LANG_MAP[targetLang] || targetLang;
  const bingSource = (!sourceLang || sourceLang === 'auto') ? 'auto-detect' : (BING_LANG_MAP[sourceLang] || sourceLang);

  async function postBing(session) {
    const host = session.host || 'cn.bing.com';
    const url = `https://${host}/ttranslatev3?isVertical=1&&IG=${session.ig}&IID=${session.iid}`;
    const body = `fromLang=${encodeURIComponent(bingSource)}&text=${encodeURIComponent(text)}&to=${encodeURIComponent(bingTarget)}&key=${session.key}&token=${encodeURIComponent(session.token)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': `https://${host}/translator`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      body: body
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  }

  let session = await getBingSession();
  let data;
  try {
    data = await postBing(session);
  } catch (err) {
    // Retry once with refreshed credentials
    bingSession = null;
    session = await getBingSession();
    data = await postBing(session);
  }

  if (Array.isArray(data) && data[0] && Array.isArray(data[0].translations) && data[0].translations[0]) {
    const transObj = data[0].translations[0];
    return {
      translatedText: transObj.text,
      detectedLang: (data[0].detectedLanguage && data[0].detectedLanguage.language) || 'auto'
    };
  }

  throw new Error('微软翻译未返回有效结果');
}

/**
 * Perform translation using Google Translate API
 */
async function handleGoogleTranslate(text, sourceLang, targetLang) {
  const actualSourceLang = sourceLang || 'auto';
  const clientTypes = ['dict-chrome-ex', 'gtx'];
  let lastError = null;

  for (const client of clientTypes) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=${encodeURIComponent(
        actualSourceLang
      )}&tl=${encodeURIComponent(targetLang)}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(text)}`;

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

      if (translatedText) {
        return {
          translatedText,
          detectedLang
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Fallback endpoint
  try {
    const fallbackUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(text)}`;

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

        if (translatedText) {
          return {
            translatedText,
            detectedLang
          };
        }
      }
    }
  } catch (err) {
    lastError = err;
  }

  throw new Error(lastError ? lastError.message : '谷歌翻译服务连接失败');
}

/**
 * Retrieve configuration from chrome.storage.sync
 */
function getStorageConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([
      'deepseekApiKey',
      'customApiUrl',
      'customApiKey',
      'customModel'
    ], (res) => {
      resolve(res || {});
    });
  });
}

/**
 * Strip wrapping quotes or markdown backticks from LLM output
 */
function cleanLlmOutput(raw) {
  let text = (raw || '').trim();
  if (text.startsWith('```') && text.endsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  if ((text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'")) ||
      (text.startsWith('“') && text.endsWith('”'))) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

/**
 * Generic OpenAI-compatible chat completion translator
 */
async function handleLlmTranslate({ endpoint, apiKey, model, text, targetLang }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('未配置 API Key，请点击扩展图标进入设置页面填写');
  }

  const targetName = LLM_LANG_NAMES[targetLang] || targetLang;
  const systemPrompt = `You are a professional, accurate web translator. Translate the given text into ${targetName}. Output ONLY the pure translated text without any explanation, markdown formatting, quotation marks, notes, or preamble. Preserve original line breaks, numbers, and technical terms where appropriate.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error ? (errJson.error.message || JSON.stringify(errJson.error)) : JSON.stringify(errJson);
    } catch (e) {
      errorDetail = `HTTP ${response.status}`;
    }
    throw new Error(`API 响应失败: ${errorDetail}`);
  }

  const data = await response.json();
  if (data && Array.isArray(data.choices) && data.choices[0] && data.choices[0].message) {
    const rawContent = data.choices[0].message.content || '';
    const clean = cleanLlmOutput(rawContent);
    if (!clean) throw new Error('模型返回译文为空');
    return {
      translatedText: clean,
      detectedLang: 'auto'
    };
  }

  throw new Error('模型响应格式不符合预期');
}

/**
 * DeepSeek translation handler
 */
async function handleDeepSeekTranslate(text, targetLang) {
  const config = await getStorageConfig();
  const apiKey = (config.deepseekApiKey || '').trim();
  if (!apiKey) {
    throw new Error('未配置 DeepSeek API Key，请点击扩展图标进入设置填写');
  }
  return await handleLlmTranslate({
    endpoint: 'https://api.deepseek.com/chat/completions',
    apiKey: apiKey,
    model: 'deepseek-chat',
    text: text,
    targetLang: targetLang
  });
}

/**
 * Custom OpenAI-compatible API translation handler
 */
async function handleCustomLLMTranslate(text, targetLang) {
  const config = await getStorageConfig();
  let url = (config.customApiUrl || '').trim();
  if (!url) {
    url = 'https://api.openai.com/v1/chat/completions';
  } else {
    url = url.replace(/\/+$/, '');
    if (!url.endsWith('/chat/completions')) {
      url += '/chat/completions';
    }
  }

  const apiKey = (config.customApiKey || '').trim();
  const model = (config.customModel || '').trim() || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('未配置自定义大模型 API Key，请点击扩展图标进入设置填写');
  }

  return await handleLlmTranslate({
    endpoint: url,
    apiKey: apiKey,
    model: model,
    text: text,
    targetLang: targetLang
  });
}

/**
 * Main translation dispatcher
 */
async function translateText(text, options = {}) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('翻译内容为空');
  }

  const {
    service = 'google',
    sourceLang = 'auto',
    targetLang = 'auto'
  } = options;

  let actualTargetLang = targetLang;
  if (!actualTargetLang || actualTargetLang === 'auto') {
    actualTargetLang = 'zh-CN';
  }

  // Skip translation when input is already Chinese and target is Chinese
  if ((actualTargetLang === 'zh-CN' || actualTargetLang === 'zh-TW') && isChineseText(trimmed)) {
    return {
      success: false,
      skipped: true,
      reason: 'chinese_disabled',
      message: '检测到中文，已跳过翻译'
    };
  }

  const actualSourceLang = sourceLang || 'auto';
  const cacheKey = getCacheKey(service, trimmed, actualSourceLang, actualTargetLang);
  if (translationCache.has(cacheKey)) {
    return { ...translationCache.get(cacheKey), fromCache: true };
  }

  let resultData;
  if (service === 'microsoft') {
    resultData = await handleMicrosoftTranslate(trimmed, actualSourceLang, actualTargetLang);
  } else if (service === 'deepseek') {
    resultData = await handleDeepSeekTranslate(trimmed, actualTargetLang);
  } else if (service === 'custom') {
    resultData = await handleCustomLLMTranslate(trimmed, actualTargetLang);
  } else {
    // Default to Google Translate
    resultData = await handleGoogleTranslate(trimmed, actualSourceLang, actualTargetLang);
  }

  const finalResult = {
    success: true,
    originalText: trimmed,
    translatedText: resultData.translatedText,
    detectedLang: resultData.detectedLang || 'auto',
    targetLang: actualTargetLang,
    service: service
  };

  addToCache(cacheKey, finalResult);
  return finalResult;
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const action = (request && request.action) ? String(request.action).toUpperCase() : '';
  if (action === 'TRANSLATE') {
    translateText(request.text, {
      service: request.service || 'google',
      sourceLang: request.sourceLang,
      targetLang: request.targetLang
    })
      .then((res) => sendResponse(res))
      .catch((err) => {
        console.error('Translation error:', err);
        sendResponse({
          success: false,
          error: err.message || '翻译失败，请检查网络或配置'
        });
      });
    return true; // Async response channel
  }
});
