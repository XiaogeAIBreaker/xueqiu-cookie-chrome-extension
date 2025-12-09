// Cookie提取函数
function extractCookies(headers) {
  const cookieHeader = headers.find(header => 
    header.name.toLowerCase() === 'cookie'
  );
  return cookieHeader ? parseCookies(cookieHeader.value) : {};
}

// Cookie解析函数
function parseCookies(cookieString) {
  const cookies = {};
  cookieString.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(value || '');
  });
  return cookies;
}

// 监听雪球域名下的所有请求
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    try {
      console.log('[XQ] onBeforeSendHeaders', {
        url: details.url,
        type: details.type,
        tabId: details.tabId,
        requestId: details.requestId
      });
      const headerNames = (details.requestHeaders || []).map(h => h.name);
      console.log('[XQ] headerNames', headerNames);

      const cookies = extractCookies(details.requestHeaders || []);
      const cookieCount = Object.keys(cookies).length;
      console.log('[XQ] cookieCount', cookieCount);

      if (cookieCount > 0) {
        const data = {
          cookies: cookies,
          url: details.url,
          timestamp: Date.now()
        };
        chrome.storage.session.set({ xueqiuCookies: data }, () => {
          if (chrome.runtime.lastError) {
            console.error('[XQ] storage.session.set error', chrome.runtime.lastError);
          } else {
            console.log('[XQ] storage.session.set ok');
          }
        });

        chrome.action.setBadgeText({ text: '●' });
        chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
      }
    } catch (error) {
      console.error('[XQ] extract error', error);
    }
  },
  {
    urls: ["*://xueqiu.com/*", "*://*.xueqiu.com/*"]
  },
  ["requestHeaders", "extraHeaders"]
);

// 当用户点击扩展图标时清除徽章
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'clearBadge') {
    chrome.action.setBadgeText({ text: '' });
  }
});

// 安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('[XQ] installed');
});

console.log('[XQ] service worker started');

chrome.webRequest.onErrorOccurred.addListener(
  function(details) {
    console.warn('[XQ] request error', {
      url: details.url,
      error: details.error,
      type: details.type
    });
  },
  { urls: ["*://xueqiu.com/*", "*://*.xueqiu.com/*"] }
);
