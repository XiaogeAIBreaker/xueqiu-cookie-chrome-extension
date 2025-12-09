// 获取DOM元素
const statusEl = document.getElementById('status');
const cookieListEl = document.getElementById('cookie-list');
const copyAllBtn = document.getElementById('copy-all');
const clearBtn = document.getElementById('clear');

let currentCookies = {};

// 初始化加载Cookie
async function loadCookies() {
  try {
    console.log('[Popup] loadCookies');
    const result = await chrome.storage.session.get(['xueqiuCookies']);
    console.log('[Popup] storage.session.get', result);
    const data = result.xueqiuCookies;
    
    if (data && data.cookies && Object.keys(data.cookies).length > 0) {
      currentCookies = data.cookies;
      renderCookies(data.cookies, data.url, data.timestamp);
    } else {
      showEmpty();
    }
  } catch (error) {
    console.error('[Popup] 加载失败', error);
    statusEl.textContent = '加载失败，请刷新页面重试';
  }
}

// 渲染Cookie列表
function renderCookies(cookies, url, timestamp) {
  console.log('[Popup] renderCookies', {
    count: Object.keys(cookies || {}).length,
    url,
    timestamp
  });
  statusEl.textContent = `来源：${new URL(url).hostname} · ${new Date(timestamp).toLocaleTimeString()}`;
  
  cookieListEl.innerHTML = '';
  Object.entries(cookies).forEach(([name, value]) => {
    const item = document.createElement('div');
    item.className = 'cookie-item';
    
    const key = document.createElement('div');
    key.className = 'cookie-key';
    key.textContent = name;
    
    const val = document.createElement('div');
    val.className = 'cookie-value';
    val.textContent = value;
    val.title = value;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-single';
    copyBtn.textContent = '复制';
    copyBtn.onclick = () => copyToClipboard(`${name}=${value}`, copyBtn);
    
    item.appendChild(key);
    item.appendChild(val);
    item.appendChild(copyBtn);
    cookieListEl.appendChild(item);
  });
}

// 空状态
function showEmpty() {
  console.log('[Popup] showEmpty');
  statusEl.textContent = '暂无Cookie，请访问雪球页面后重试';
  cookieListEl.innerHTML = '';
}

// 复制到剪贴板
async function copyToClipboard(text, triggerBtn) {
  try {
    await navigator.clipboard.writeText(text);
    if (triggerBtn) {
      const original = triggerBtn.textContent;
      triggerBtn.textContent = '已复制';
      setTimeout(() => (triggerBtn.textContent = original), 1000);
    }
    return true;
  } catch (err) {
    console.warn('[Popup] navigator.clipboard.writeText failed, fallback', err);
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        if (triggerBtn) {
          const original = triggerBtn.textContent;
          triggerBtn.textContent = '已复制';
          setTimeout(() => (triggerBtn.textContent = original), 1000);
        }
        return true;
      }
      throw new Error('execCommand copy returned false');
    } catch (e2) {
      console.error('[Popup] fallback copy failed', e2);
      alert('复制失败，请手动复制');
      return false;
    }
  }
}

// 复制全部
async function copyAll() {
  if (Object.keys(currentCookies).length === 0) {
    alert('暂无Cookie可复制');
    return;
  }
  const cookieString = Object.entries(currentCookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  await copyToClipboard(cookieString, copyAllBtn);
}

// 清除本地数据
async function clearCookies() {
  console.log('[Popup] clearCookies');
  await chrome.storage.session.remove(['xueqiuCookies']);
  currentCookies = {};
  showEmpty();
}

// 绑定事件
copyAllBtn.addEventListener('click', copyAll);
clearBtn.addEventListener('click', clearCookies);

// 页面加载时执行
loadCookies();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'session' && changes.xueqiuCookies) {
    console.log('[Popup] storage.onChanged', changes.xueqiuCookies);
    const data = changes.xueqiuCookies.newValue;
    if (data && data.cookies && Object.keys(data.cookies).length > 0) {
      currentCookies = data.cookies;
      renderCookies(data.cookies, data.url, data.timestamp);
    } else {
      showEmpty();
    }
  }
});

chrome.runtime.sendMessage({ type: 'clearBadge' });
