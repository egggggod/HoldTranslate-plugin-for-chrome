const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const workspace = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(workspace, 'manifest.json'), 'utf8'));
const scripts = manifest.content_scripts.find(entry => entry.js.includes('content.js')).js;
const chromePath = process.env.HOLDTRANSLATE_CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find(candidate => fs.existsSync(candidate));
assert(chromePath, 'Set HOLDTRANSLATE_CHROME to a Chrome or Chromium executable');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'holdtranslate-regression-'));
const source = scripts.map(filename => {
  let code = fs.readFileSync(path.join(workspace, filename), 'utf8')
    .replaceAll('window.location', 'window.__fixtureLocation')
    .replaceAll('location.hostname', 'window.__fixtureLocation.hostname');
  if (filename === 'youtube-subtitles.js') {
    code = code.replace('return { start, stop, refresh: render };',
      'return { start, stop, refresh: render, evaluate: expression => eval(expression) };');
  }
  if (filename === 'content.js') {
    code = code.replace(/\}\)\(\);\s*$/,
      'window.__app = { config, subtitles, page, youtube, videos, applySettings, stop };\n})();');
  }
  return '<script>' + code + '</script>';
}).join('\n');

const setup = String.raw`
window.__fixtureLocation = new URL('https://www.youtube.com/watch?v=videoA');
window.__requests = [];
window.__network = [];
window.__listeners = new Set();
window.chrome = {
  runtime: { id: 'test-extension', sendMessage: (message, callback) => __requests.push({ message, callback }) },
  storage: {
    sync: { get: (keys, callback) => { window.__loadSettings = callback; } },
    onChanged: {
      addListener: listener => __listeners.add(listener),
      removeListener: listener => __listeners.delete(listener)
    }
  }
};
window.fetch = (url, options = {}) => new Promise((resolve, reject) => {
  const request = { url, options, resolve, reject };
  __network.push(request);
  options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
});
window.__clock = { time: 0.5, seeking: false, paused: true };
window.__makeVideo = video => {
  const tracks = Object.assign(new EventTarget(), {
    entries: [], [Symbol.iterator]() { return this.entries[Symbol.iterator](); }
  });
  Object.defineProperties(video, {
    currentTime: { configurable: true, get: () => __clock.time },
    seeking: { configurable: true, get: () => __clock.seeking },
    paused: { configurable: true, get: () => __clock.paused },
    ended: { configurable: true, get: () => false },
    textTracks: { configurable: true, get: () => tracks }
  });
  return tracks;
};
__makeVideo(document.querySelector('video'));
`;

const tests = String.raw`
(async () => {
  const app = window.__app;
  const results = [];
  const caption = document.querySelector('.caption-window');
  const original = caption.querySelector('.ytp-caption-segment');
  const player = document.querySelector('#movie_player');
  const video = player.querySelector('video');
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));
  const wait = time => new Promise(resolve => setTimeout(resolve, time));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const equal = (actual, expected) => assert(actual === expected, JSON.stringify({ actual, expected }));
  const displayed = () => {
    const subtitle = document.querySelector('.holdtranslate-yt-sub');
    return subtitle && subtitle.dataset.empty !== 'true' ? subtitle.textContent : '';
  };
  const respond = (request, translatedText) => request.callback({ success: true, translatedText });
  const bridge = (type, payload) => window.dispatchEvent(new MessageEvent('message', {
    source: window, data: { source: 'holdtranslate-bridge', type, payload }
  }));
  const raw = entries => JSON.stringify({ events: entries.map(([start, duration, text]) =>
    ({ tStartMs: start, dDurationMs: duration, segs: [{ utf8: text }] })) });
  const intercept = (text, url = 'https://www.youtube.com/api/timedtext?v=videoA&lang=en') =>
    bridge('TIMED_TEXT_INTERCEPTED', { url, text, videoId: 'videoA' });
  const show = async (text, time = 0.5) => {
    __clock.time = time;
    original.textContent = text;
    await tick();
  };
  const cache = (text, translation) => {
    app.subtitles.translate(text, () => {});
    if (!app.subtitles.getCached(text)) {
      respond(__requests.findLast(request => request.message.text === text), translation);
    }
  };
  const asr = () => caption.classList.add('ytp-caption-window-rollup');
  const reset = async () => {
    app.youtube.stop();
    app.videos.stop();
    app.page.stop();
    app.subtitles.reset();
    window.__fixtureLocation = new URL('https://www.youtube.com/watch?v=videoA');
    window.__clock = { time: 0.5, seeking: false, paused: true };
    original.textContent = '';
    caption.className = 'caption-window';
    caption.removeAttribute('style');
    caption.removeAttribute('aria-hidden');
    player.removeAttribute('style');
    if (!caption.isConnected) player.appendChild(caption);
    if (!video.isConnected) player.prepend(video);
    document.querySelectorAll('.generic-fixture, .__gtrans-inline-result').forEach(element => element.remove());
    document.querySelector('#page-fixture').innerHTML =
      '<p id="paragraph" style="font-size:23px;font-weight:700;font-style:italic">An example paragraph for translation.</p>';
    getSelection().removeAllRanges();
    app.applySettings({
      enabled: true, pressDuration: 25, sourceLang: 'auto', targetLang: 'zh-CN',
      translateService: 'google', videoSubtitlesEnabled: true, subtitleMode: 'bilingual', textColor: '#86a003'
    });
    await tick();
    __requests.length = 0;
    __network.length = 0;
  };
  const test = async (name, action) => {
    try {
      await reset();
      await action();
      results.push({ name, status: 'passed' });
    } catch (error) {
      results.push({ name, status: 'failed', error: error.message, stack: error.stack });
    }
  };
  equal(__requests.length, 0);
  equal(document.querySelector('.holdtranslate-yt-sub'), null);
  __loadSettings({ targetLang: 'zh-CN', translateService: 'microsoft' });
  equal(app.config.translateService, 'microsoft');

  await test('Manual subtitles use the selected service and exact visible source', async () => {
    app.applySettings({ translateService: 'deepseek' });
    await show('Visible source.');
    equal(__requests.at(-1).message.service, 'deepseek');
    equal(__requests.at(-1).message.text, 'Visible source.');
    respond(__requests.at(-1), '当前译文。');
    equal(displayed(), '当前译文。');
  });
  await test('Late responses cannot replace a newer source snapshot', async () => {
    await show('First source.');
    const first = __requests.at(-1);
    await show('Second source.');
    const second = __requests.at(-1);
    respond(second, '第二段。');
    respond(first, '第一段。');
    equal(displayed(), '第二段。');
  });
  await test('Shared in-flight requests notify every subscriber', () => {
    const received = [];
    app.subtitles.translate('shared', text => received.push('first:' + text));
    app.subtitles.translate('shared', text => received.push('second:' + text));
    equal(__requests.length, 1);
    respond(__requests[0], '共享');
    equal(received.join('|'), 'first:共享|second:共享');
  });
  await test('A failed shared request can be retried', () => {
    let settled = null;
    app.subtitles.translate('retry', () => {}, success => { settled = success; });
    __requests.at(-1).callback({ success: false });
    equal(settled, false);
    app.subtitles.translate('retry', () => {});
    equal(__requests.length, 2);
  });
  await test('An old request cannot complete a replacement request for the same text', () => {
    let result = '';
    app.subtitles.translate('same request', text => { result = text; });
    const old = __requests.at(-1);
    app.subtitles.reset();
    app.subtitles.translate('same request', text => { result = text; });
    const current = __requests.at(-1);
    respond(old, '旧请求');
    equal(result, '');
    equal(app.subtitles.getCached('same request'), undefined);
    respond(current, '新请求');
    equal(result, '新请求');
  });
  await test('Changing service invalidates pending results and starts the new service', async () => {
    await show('Current source.');
    const old = __requests.at(-1);
    for (const listener of __listeners) listener({ translateService: { newValue: 'microsoft' } }, 'sync');
    const current = __requests.at(-1);
    equal(current.message.service, 'microsoft');
    respond(old, '旧服务。');
    equal(displayed(), '');
    respond(current, '新服务。');
    equal(displayed(), '新服务。');
  });
  await test('Cache identity includes source language, target language and provider', () => {
    cache('same text', '中文');
    equal(app.subtitles.getCached('same text'), '中文');
    app.config.targetLang = 'ja';
    equal(app.subtitles.getCached('same text'), undefined);
    app.config.targetLang = 'zh-CN';
    app.config.sourceLang = 'fr';
    equal(app.subtitles.getCached('same text'), undefined);
    app.config.sourceLang = 'auto';
    app.config.translateService = 'microsoft';
    equal(app.subtitles.getCached('same text'), undefined);
  });
  await test('Native hiding clears subtitles and blocks a late callback', async () => {
    await show('Hidden source.');
    const pending = __requests.at(-1);
    caption.classList.add('ytp-caption-window-hide');
    await tick();
    respond(pending, '隐藏字幕。');
    equal(displayed(), '');
    caption.classList.remove('ytp-caption-window-hide');
    await tick();
    equal(displayed(), '隐藏字幕。');
  });
  await test('Ancestor visibility is respected', async () => {
    cache('Ancestor source.', '祖先隐藏。');
    await show('Ancestor source.');
    player.style.visibility = 'hidden';
    await tick();
    equal(displayed(), '');
    player.style.visibility = '';
    await tick();
    equal(displayed(), '祖先隐藏。');
  });
  await test('An empty manual caption clears immediately', async () => {
    cache('Manual caption.', '人工字幕。');
    await show('Manual caption.');
    await show('');
    equal(displayed(), '');
  });
  await test('Seeking suppresses unchanged old DOM until a new source appears', async () => {
    cache('Before seek.', '跳转之前。');
    await show('Before seek.');
    __clock.seeking = true;
    video.dispatchEvent(new Event('seeking'));
    equal(displayed(), '');
    __clock.time = 20;
    __clock.seeking = false;
    video.dispatchEvent(new Event('seeked'));
    equal(displayed(), '');
    await show('After seek.', 20);
    respond(__requests.at(-1), '跳转之后。');
    equal(displayed(), '跳转之后。');
  });
  await test('Known cue timing permits recovery after a seek without a DOM change', async () => {
    intercept(raw([[0, 3000, 'Known source.']]));
    cache('Known source.', '已知字幕。');
    await show('Known source.');
    __clock.seeking = true;
    video.dispatchEvent(new Event('seeking'));
    __clock.seeking = false;
    __clock.time = 1;
    video.dispatchEvent(new Event('seeked'));
    equal(displayed(), '已知字幕。');
  });
  await test('Disabling subtitles prevents pending callbacks from resurrecting DOM', async () => {
    await show('Pending stop.');
    const pending = __requests.at(-1);
    app.applySettings({ videoSubtitlesEnabled: false });
    respond(pending, '不应显示。');
    equal(document.querySelector('.holdtranslate-yt-sub'), null);
    video.dispatchEvent(new Event('play'));
    await tick();
    equal(document.querySelector('.holdtranslate-yt-sub'), null);
  });
  await test('Monolingual display and stop restore native captions', async () => {
    app.applySettings({ subtitleMode: 'monolingual' });
    cache('Native source.', '单语字幕。');
    await show('Native source.');
    equal(original.style.display, 'none');
    equal(displayed(), '单语字幕。');
    app.applySettings({ videoSubtitlesEnabled: false });
    equal(original.style.display, '');
    equal(caption.querySelector('.captions-text').style.display, '');
  });
  await test('Official translated tracks are ignored and are never fetched', async () => {
    intercept(raw([[0, 3000, '当然，我还需要 当然，我还需要 后文。']]),
      'https://www.youtube.com/api/timedtext?v=videoA&lang=en&tlang=zh-Hans');
    equal(__network.length, 0);
    await show('And of course we need my car keys for my car bed. Okay,');
    equal(displayed(), '');
    equal(__requests.at(-1).message.text, original.textContent);
    respond(__requests.at(-1), '当然，我们需要车钥匙。好的。');
    equal(displayed(), '当然，我们需要车钥匙。好的。');
    intercept(raw([[0, 1000, 'Hello'], [1000, 1000, 'world']]));
    assert(__network.every(request => !new URL(request.url).searchParams.has('tlang')), 'Fetched an official translation');
    assert(__requests.every(request => request.message.text !== 'Hello world'), 'Assembled separate source fragments');
  });
  await test('Prefetched future source translations cannot appear under the current source', async () => {
    intercept(raw([[0, 1000, 'Hello'], [1000, 1000, 'world']]));
    const future = __requests.find(request => request.message.text === 'world');
    respond(future, '世界');
    await show('Hello', 0.5);
    equal(displayed(), '');
    respond(__requests.find(request => request.message.text === 'Hello'), '你好');
    equal(displayed(), '你好');
  });
  await test('Navigation rejects previous-video responses and aborts its track fetch', async () => {
    intercept(raw([[0, 1000, 'Old video.']]));
    await show('Old video.');
    const old = __requests.find(request => request.message.text === 'Old video.');
    const fetchRequest = __network.at(-1);
    window.dispatchEvent(new Event('yt-navigate-start'));
    assert(fetchRequest.options.signal.aborted, 'Track fetch was not aborted');
    respond(old, '旧视频。');
    equal(displayed(), '');
    await show('');
    window.__fixtureLocation = new URL('https://www.youtube.com/watch?v=videoB');
    window.dispatchEvent(new Event('yt-navigate-finish'));
    await wait(520);
    await show('New video.');
    respond(__requests.at(-1), '新视频。');
    equal(displayed(), '新视频。');
  });
  await test('The selected native track wins over the source-language preference', () => {
    bridge('CAPTION_TRACKS_DETECTED', { videoId: 'videoA',
      tracks: [
        { languageCode: 'en', vssId: '.en', baseUrl: 'https://www.youtube.com/api/timedtext?v=videoA&lang=en' },
        { languageCode: 'fr', vssId: '.fr', baseUrl: 'https://www.youtube.com/api/timedtext?v=videoA&lang=fr' }
      ], activeTrack: { languageCode: 'fr', vssId: '.fr' }
    });
    equal(new URL(__network.at(-1).url).searchParams.get('lang'), 'fr');
  });
  await test('JSON parsing preserves append snapshots, offsets and cue boundaries', () => {
    const parsed = app.youtube.evaluate('parseTimedText')(JSON.stringify({ events: [
      { tStartMs: 0, dDurationMs: 2000, wWinId: 1, segs: [{ utf8: 'Hello' }] },
      { tStartMs: 500, dDurationMs: 1500, wWinId: 1, aAppend: 1, segs: [{ utf8: ' world', tOffsetMs: 250 }] }
    ] }));
    equal(parsed.length, 2);
    equal(parsed[0].end, 500);
    equal(parsed[1].text, 'Hello world');
    equal(parsed[1].unitStart, 0);
    equal(parsed[1].segments[1].start, 750);
  });
  await test('XML captions and malformed track responses are handled safely', () => {
    const parse = app.youtube.evaluate('parseTimedText');
    const parsed = parse('<transcript><text start="1.2" dur=".8">Hello &amp; world</text></transcript>');
    equal(parsed[0].start, 1200);
    equal(parsed[0].end, 2000);
    equal(parsed[0].text, 'Hello & world');
    equal(parse('{broken').length, 0);
  });
  await test('ASR appends retain a stable display unit and replace translation atomically', async () => {
    asr();
    cache('We are', '我们');
    await show('We are', 0.2);
    const key = document.querySelector('.holdtranslate-yt-sub').dataset.displayKey;
    await show('We are testing', 0.4);
    equal(displayed(), '我们');
    equal(document.querySelector('.holdtranslate-yt-sub').dataset.displayKey, key);
    await wait(200);
    respond(__requests.at(-1), '我们正在测试');
    equal(displayed(), '我们正在测试');
  });
  await test('ASR accepts a compatible pending prefix without blanking', async () => {
    asr();
    await show('We are', 0.2);
    await wait(200);
    const prefix = __requests.at(-1);
    await show('We are testing', 0.4);
    respond(prefix, '我们');
    equal(displayed(), '我们');
    await wait(200);
    equal(__requests.at(-1).message.text, 'We are testing');
    respond(__requests.at(-1), '我们正在测试');
    equal(displayed(), '我们正在测试');
  });
  await test('ASR continuous words with slow responses remain visible after first display', async () => {
    asr();
    const sendMessage = chrome.runtime.sendMessage;
    let started = false;
    let blanks = 0;
    const monitor = new MutationObserver(() => {
      if (displayed()) started = true;
      else if (started) blanks++;
    });
    monitor.observe(caption, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-empty'] });
    chrome.runtime.sendMessage = (message, callback) => {
      __requests.push({ message, callback });
      setTimeout(() => callback({ success: true, translatedText: '译文' + message.text.split(' ').length }), 800);
    };
    try {
      const words = Array.from({ length: 30 }, (_, index) => 'word' + index);
      for (let index = 1; index <= words.length; index++) {
        await show(words.slice(0, index).join(' '), 1 + index * 0.08);
        await wait(80);
      }
      await wait(1800);
      assert(started, 'No intermediate translation appeared');
      equal(blanks, 0);
      equal(displayed(), '译文30');
      assert(__requests.length <= 5, 'Sent excessive translation requests');
    } finally {
      chrome.runtime.sendMessage = sendMessage;
      monitor.disconnect();
    }
  });
  await test('ASR corrections reject a superseded response and clear incompatible text', async () => {
    asr();
    await show('I like cats');
    await wait(200);
    const incorrect = __requests.at(-1);
    await show('I like cars', 0.7);
    respond(incorrect, '我喜欢猫');
    equal(displayed(), '');
    await wait(200);
    respond(__requests.at(-1), '我喜欢汽车');
    equal(displayed(), '我喜欢汽车');
    await show('I like trains', 0.8);
    equal(displayed(), '');
  });
  await test('ASR rolling windows retain the previous valid translation briefly', async () => {
    asr();
    cache('we are testing the captions', '我们正在测试字幕');
    await show('we are testing the captions');
    await show('testing the captions with more words', 0.8);
    equal(displayed(), '我们正在测试字幕');
    await wait(200);
    respond(__requests.at(-1), '测试包含更多单词的字幕');
    equal(displayed(), '测试包含更多单词的字幕');
  });
  await test('ASR unrelated new text clears the previous unit', async () => {
    asr();
    cache('First sentence.', '第一句。');
    await show('First sentence.');
    await show('First sentence. Next', 0.7);
    equal(displayed(), '');
  });
  await test('ASR temporary native text replacement preserves the translation', async () => {
    asr();
    cache('We are testing', '我们正在测试');
    await show('We are testing');
    const parent = original.parentElement;
    original.remove();
    await tick();
    equal(displayed(), '我们正在测试');
    await wait(60);
    parent.appendChild(original);
    await show('We are testing subtitles', 0.7);
    equal(displayed(), '我们正在测试');
    await wait(80);
    equal(displayed(), '我们正在测试');
  });
  await test('ASR persistent empty captions expire after the DOM replacement grace', async () => {
    asr();
    cache('We are testing', '我们正在测试');
    await show('We are testing');
    await show('');
    equal(displayed(), '我们正在测试');
    await wait(150);
    equal(displayed(), '');
  });
  await test('ASR native hiding skips the DOM gap grace', async () => {
    asr();
    cache('We are testing', '我们正在测试');
    await show('We are testing');
    caption.style.display = 'none';
    await tick();
    equal(displayed(), '');
  });
  await test('ASR a stale retained prefix expires and cannot reappear from cache', async () => {
    asr();
    cache('We are', '我们');
    await show('We are', 0.2);
    await show('We are testing', 0.7);
    equal(displayed(), '我们');
    await wait(1600);
    equal(displayed(), '');
    app.youtube.refresh();
    equal(displayed(), '');
  });
  await test('ASR failed requests retry the latest snapshot', async () => {
    asr();
    await show('We are testing');
    await wait(200);
    const pending = __requests.at(-1);
    await show('We are testing subtitles', 0.7);
    pending.callback({ success: false });
    await wait(520);
    equal(__requests.at(-1).message.text, 'We are testing subtitles');
    respond(__requests.at(-1), '最新译文');
    equal(displayed(), '最新译文');
  });
  await test('ASR disabling cancels pending debounce timers', async () => {
    asr();
    await show('We are testing');
    app.applySettings({ videoSubtitlesEnabled: false });
    await wait(220);
    equal(__requests.length, 0);
    equal(document.querySelector('.holdtranslate-yt-sub'), null);
  });
  await test('ASR seeking cancels pending debounce timers', async () => {
    asr();
    await show('We are testing');
    __clock.seeking = true;
    video.dispatchEvent(new Event('seeking'));
    await wait(220);
    equal(__requests.length, 0);
    equal(displayed(), '');
  });
  await test('ASR timed unit boundaries clear a similar prefix from a different unit', async () => {
    intercept(JSON.stringify({ events: [
      { tStartMs: 0, dDurationMs: 1000, wWinId: 1, segs: [{ utf8: 'We are ' }, { utf8: 'ready', tOffsetMs: 300 }] },
      { tStartMs: 1000, dDurationMs: 2000, wWinId: 1, segs: [{ utf8: 'We are ' }, { utf8: 'leaving', tOffsetMs: 700 }] }
    ] }), 'https://www.youtube.com/api/timedtext?v=videoA&lang=en&kind=asr');
    cache('We are ready', '我们准备好了');
    await show('We are ready');
    equal(displayed(), '我们准备好了');
    await show('We are', 1.1);
    equal(displayed(), '');
  });
  await test('Stopping cancels a scheduled navigation reattachment', async () => {
    window.dispatchEvent(new Event('yt-navigate-finish'));
    app.applySettings({ videoSubtitlesEnabled: false });
    await wait(550);
    await show('Stopped navigation.');
    equal(__requests.length, 0);
    equal(document.querySelector('.holdtranslate-yt-sub'), null);
    equal(app.youtube.evaluate('events'), null);
    equal(app.youtube.evaluate('observer'), null);
  });
  await test('ASR removed windows can transfer their unit to replacement DOM', async () => {
    asr();
    cache('We are testing', '我们正在测试');
    await show('We are testing');
    const key = document.querySelector('.holdtranslate-yt-sub').dataset.displayKey;
    const replacement = caption.cloneNode(true);
    replacement.querySelector('.holdtranslate-yt-sub').remove();
    replacement.querySelector('.ytp-caption-segment').textContent = 'We are testing subtitles';
    try {
      caption.remove();
      await tick();
      await wait(60);
      player.appendChild(replacement);
      await tick();
      equal(displayed(), '我们正在测试');
      equal(replacement.querySelector('.holdtranslate-yt-sub').dataset.displayKey, key);
      await wait(80);
      equal(displayed(), '我们正在测试');
    } finally {
      replacement.remove();
      player.appendChild(caption);
    }
  });
  await test('Replacing a video detaches old seeking listeners', async () => {
    cache('Replacement source.', '新播放器。');
    __clock.seeking = true;
    video.dispatchEvent(new Event('seeking'));
    __clock.seeking = false;
    const replacement = document.createElement('video');
    __makeVideo(replacement);
    video.replaceWith(replacement);
    app.youtube.evaluate('attachObserver()');
    video.dispatchEvent(new Event('seeking'));
    await show('Replacement source.');
    equal(displayed(), '新播放器。');
    replacement.replaceWith(video);
  });
  await test('ASR in-flight completion during DOM replacement does not lock subsequent updates', async () => {
    asr();
    await show('We are testing', 0.2);
    await wait(200);
    const first = __requests.at(-1);
    const replacement = caption.cloneNode(true);
    replacement.querySelector('.holdtranslate-yt-sub').remove();
    replacement.querySelector('.ytp-caption-segment').textContent = 'We are testing subtitles';
    try {
      caption.remove();
      await tick();
      respond(first, '我们正在测试');
      await wait(40);
      player.appendChild(replacement);
      await tick();
      equal(displayed(), '我们正在测试');
      await wait(220);
      equal(__requests.at(-1).message.text, 'We are testing subtitles');
      respond(__requests.at(-1), '我们正在测试字幕');
      equal(displayed(), '我们正在测试字幕');
    } finally {
      replacement.remove();
      player.appendChild(caption);
    }
  });
  await test('Switching same-language alternate tracks without baseUrl resets track session', async () => {
    intercept(raw([[0, 3000, 'Track one.']]), 'https://www.youtube.com/api/timedtext?v=videoA&lang=en&name=track1');
    bridge('CAPTION_TRACKS_DETECTED', {
      videoId: 'videoA',
      tracks: [{ languageCode: 'en', name: 'track2', vssId: '.en.track2' }],
      activeTrack: { languageCode: 'en', name: 'track2', vssId: '.en.track2' }
    });
    intercept(raw([[0, 3000, 'Track two.']]), 'https://www.youtube.com/api/timedtext?v=videoA&lang=en&name=track2');
    cache('Track two.', '第二条音轨。');
    await show('Track two.', 0.5);
    equal(displayed(), '第二条音轨。');
  });
  await test('Session reset clears in-flight requests so identical text on new video re-requests cleanly', async () => {
    await show('Shared line.');
    const oldRequest = __requests.at(-1);
    window.dispatchEvent(new Event('yt-navigate-start'));
    window.__fixtureLocation = new URL('https://www.youtube.com/watch?v=videoB');
    window.dispatchEvent(new Event('yt-navigate-finish'));
    await wait(520);
    await show('Shared line.');
    equal(__requests.length, 2);
    respond(oldRequest, '旧视频译文。');
    equal(displayed(), '');
    respond(__requests.at(-1), '新视频译文。');
    equal(displayed(), '新视频译文。');
  });
  await test('Genuine repeated words are preserved', async () => {
    await show('Very very good.');
    equal(__requests.at(-1).message.text, 'Very very good.');
    respond(__requests.at(-1), '非常非常好。');
    equal(displayed(), '非常非常好。');
  });

  function genericFixture(x = false) {
    const parent = document.createElement('section');
    parent.className = 'generic-fixture';
    if (x) parent.dataset.testid = 'videoPlayer';
    const media = document.createElement('video');
    const tracks = __makeVideo(media);
    parent.appendChild(media);
    document.body.appendChild(parent);
    const track = Object.assign(new EventTarget(), { mode: 'showing', kind: 'subtitles', activeCues: [] });
    tracks.entries.push(track);
    const nativeCaption = document.createElement('div');
    nativeCaption.dataset.testid = 'caption';
    if (x) parent.appendChild(nativeCaption);
    app.videos.refresh();
    return { parent, media, track, nativeCaption };
  }
  const genericText = parent => parent.querySelector('.holdtranslate-sub-translated')?.textContent || '';
  await test('HTML5 TextTrack captions use the shared translation path', async () => {
    const fixture = genericFixture();
    fixture.track.activeCues = [{ text: '<i>HTML5 source.</i>' }];
    fixture.track.dispatchEvent(new Event('cuechange'));
    equal(__requests.at(-1).message.text, 'HTML5 source.');
    respond(__requests.at(-1), '通用视频字幕。');
    equal(genericText(fixture.parent), '通用视频字幕。');
  });
  await test('HTML5 late callbacks cannot restore an empty caption', () => {
    const fixture = genericFixture();
    fixture.track.activeCues = [{ text: 'Pending HTML5.' }];
    fixture.track.dispatchEvent(new Event('cuechange'));
    const pending = __requests.at(-1);
    fixture.track.activeCues = [];
    fixture.track.dispatchEvent(new Event('cuechange'));
    respond(pending, '过时通用字幕。');
    equal(fixture.parent.querySelector('.holdtranslate-video-subtitle-capsule'), null);
  });
  await test('HTML5 changing snapshots never display the previous translation', () => {
    const fixture = genericFixture();
    fixture.track.activeCues = [{ text: 'First HTML5.' }];
    fixture.track.dispatchEvent(new Event('cuechange'));
    const first = __requests.at(-1);
    fixture.track.activeCues = [{ text: 'Second HTML5.' }];
    fixture.track.dispatchEvent(new Event('cuechange'));
    const second = __requests.at(-1);
    respond(second, '第二条通用字幕。');
    respond(first, '第一条通用字幕。');
    equal(genericText(fixture.parent), '第二条通用字幕。');
  });
  await test('X DOM captions are translated and native hiding clears them', async () => {
    const fixture = genericFixture(true);
    fixture.nativeCaption.textContent = 'X source.';
    await tick();
    respond(__requests.at(-1), 'X 字幕。');
    equal(genericText(fixture.parent), 'X 字幕。');
    fixture.nativeCaption.style.display = 'none';
    await tick();
    equal(fixture.parent.querySelector('.holdtranslate-video-subtitle-capsule'), null);
  });
  await test('X removed players cannot be resurrected by pending translation', async () => {
    const fixture = genericFixture(true);
    fixture.nativeCaption.textContent = 'Removed X source.';
    await tick();
    const pending = __requests.at(-1);
    fixture.parent.remove();
    await tick();
    respond(pending, '已删除播放器。');
    equal(fixture.parent.querySelector('.holdtranslate-video-subtitle-capsule'), null);
  });
  await test('Generic captions retain bilingual/monolingual mode and color changes', () => {
    const fixture = genericFixture();
    fixture.track.activeCues = [{ text: 'Styled HTML5.' }];
    fixture.track.dispatchEvent(new Event('cuechange'));
    respond(__requests.at(-1), '样式字幕。');
    app.applySettings({ subtitleMode: 'monolingual', textColor: '#ff0000' });
    equal(fixture.parent.querySelector('.holdtranslate-sub-original').style.display, 'none');
    equal(fixture.parent.querySelector('.holdtranslate-sub-translated').style.color, 'rgb(255, 0, 0)');
    equal(genericText(fixture.parent), '样式字幕。');
  });
  await test('Generic stop detaches track listeners and blocks pending results', () => {
    const fixture = genericFixture();
    fixture.track.activeCues = [{ text: 'Stopping HTML5.' }];
    fixture.track.dispatchEvent(new Event('cuechange'));
    const pending = __requests.at(-1);
    app.applySettings({ videoSubtitlesEnabled: false });
    respond(pending, '不应出现。');
    fixture.track.dispatchEvent(new Event('cuechange'));
    equal(fixture.parent.querySelector('.holdtranslate-video-subtitle-capsule'), null);
    const count = __requests.length;
    fixture.track.activeCues = [{ text: 'Disabled source.' }];
    fixture.track.dispatchEvent(new Event('cuechange'));
    equal(__requests.length, count);
  });

  async function longPress(element) {
    const rect = element.getBoundingClientRect();
    element.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true, button: 0, clientX: rect.left + 2, clientY: rect.top + 2
    }));
    await wait(35);
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
  }
  await test('Page long press translates, preserves typography and can revert', async () => {
    const paragraph = document.querySelector('#paragraph');
    await longPress(paragraph);
    equal(__requests.at(-1).message.text, paragraph.textContent);
    respond(__requests.at(-1), '页面译文。');
    const result = document.querySelector('.__gtrans-inline-result');
    equal(result.textContent, '页面译文。');
    equal(result.style.fontSize, '23px');
    equal(result.style.fontStyle, 'italic');
    await wait(360);
    await longPress(paragraph);
    await wait(200);
    equal(document.querySelector('.__gtrans-inline-result'), null);
  });
  await test('Chinese page text is skipped silently when the target is Chinese', async () => {
    const paragraph = document.querySelector('#paragraph');
    paragraph.textContent = '这是已经使用中文书写的段落，不需要翻译。';
    await longPress(paragraph);
    equal(__requests.length, 0);
    equal(document.querySelector('.__gtrans-inline-result'), null);
  });
  await test('Media controls and editable inputs are exempt from long press', async () => {
    const controls = document.createElement('div');
    controls.innerHTML = '<div class="html5-video-player"><button>Play video</button></div><input value="Do not translate">';
    document.querySelector('#page-fixture').appendChild(controls);
    await longPress(controls.querySelector('button'));
    await wait(360);
    await longPress(controls.querySelector('input'));
    equal(__requests.length, 0);
  });
  await test('Stopping page translation rejects its late response', async () => {
    await longPress(document.querySelector('#paragraph'));
    const pending = __requests.at(-1);
    app.page.stop();
    respond(pending, '迟到的页面译文。');
    assert(document.querySelector('.__gtrans-inline-result').textContent !== '迟到的页面译文。', 'Stopped page callback mutated DOM');
  });
  await test('An invalid extension context stops all modules and settings listeners', async () => {
    delete chrome.runtime.id;
    app.applySettings({ subtitleMode: 'monolingual' });
    equal(app.youtube.evaluate('events'), null);
    equal(__listeners.size, 0);
    await show('Invalid context.');
    await longPress(document.querySelector('#paragraph'));
    equal(__requests.length, 0);
    equal(document.querySelector('.holdtranslate-yt-sub'), null);
  });
  app.stop();
  document.querySelector('#result').textContent = JSON.stringify({
    passed: results.filter(result => result.status === 'passed').length,
    failed: results.filter(result => result.status === 'failed').length,
    results
  });
})().catch(error => {
  document.querySelector('#result').textContent = JSON.stringify({ fatal: error.stack });
});
`;

const fixture = path.join(directory, 'subtitles.html');
const css = fs.readFileSync(path.join(workspace, 'content.css'), 'utf8');
fs.writeFileSync(fixture, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div id="movie_player"><video></video><div class="caption-window"><div class="captions-text"><div class="caption-visual-line"><span class="ytp-caption-segment"></span></div></div></div></div>
<div id="page-fixture"></div><pre id="result">running</pre>
<script>${setup}</script>${source}<script>${tests}</script></body></html>`);
const browser = spawnSync(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--allow-file-access-from-files', '--user-data-dir=' + path.join(directory, 'chrome'),
  '--virtual-time-budget=90000', '--dump-dom', pathToFileURL(fixture).href
], { encoding: 'utf8', windowsHide: true, timeout: 60000, maxBuffer: 10 * 1024 * 1024 });
fs.writeFileSync(path.join(directory, 'browser.log'), browser.stderr || '');
fs.writeFileSync(path.join(directory, 'result.html'), browser.stdout || '');
if (browser.error) throw browser.error;
const match = browser.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/);
assert(match, 'No browser results; inspect ' + directory);
const result = JSON.parse(match[1].replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'));
assert(!result.fatal, result.fatal);
assert(Array.isArray(result.results), 'Tests did not finish; inspect ' + directory);
console.log(JSON.stringify({
  passed: result.passed, failed: result.failed,
  failures: result.results.filter(test => test.status !== 'passed'), artifacts: directory
}, null, 2));
if (result.failed) process.exitCode = 1;
