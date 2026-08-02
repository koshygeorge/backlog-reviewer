document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('open-dashboard-btn').onclick = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    } else {
      window.open('index.html', '_blank');
    }
  };

  document.getElementById('open-settings-btn').onclick = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html?settings=open') });
    } else {
      window.open('index.html?settings=open', '_blank');
    }
  };
});
