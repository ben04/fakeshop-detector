let color = '#FF0000';
let allFakeshops = [];

chrome.runtime.onStartup.addListener(() => {
  loadFakeshopList();
});

chrome.runtime.onInstalled.addListener(() => {
  loadFakeshopList();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log("execute content-script");

  if (changeInfo.status == 'complete' && tab.active) {
    console.log("inject content-script now");
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    },
    () => { chrome.tabs.sendMessage(tab.id, tab.url); });
  }
})

function loadFakeshopList() {
  fetch('https://api.fakeshop.at/fake-shop-detector/api/1.2/blacklist')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then((data) => parseFakeshopData(data))
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function parseFakeshopData(data) {
  for (const fakeshop of data) {
    allFakeshops.push(fakeshop.site_baseURL);
  }
  console.log("successfully parsed fakeshop data");
  saveFakeshopList(allFakeshops);
}

function saveFakeshopList(allFakeshops) {
  chrome.storage.local.set({ allFakeshops: allFakeshops });
}

