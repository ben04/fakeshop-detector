const bsiUrl = "https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Kampagne/Onlineshopping_SOS_Karte.pdf?__blob=publicationFile&v=5";
const fakeUrl = "https://gutesbrennholz.com/";
let allFakeshops = [];
let currentTabId;

chrome.runtime.onStartup.addListener(() => {
  loadFakeshopList();
});

chrome.runtime.onInstalled.addListener(() => {
  loadFakeshopList();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    currentTabId = tab.id;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    },
    () => { chrome.tabs.sendMessage(tab.id, tab.url); });
  }
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "openBSI") {
      chrome.tabs.create({
        //url: fakeUrl
        url: bsiUrl
      });
    } else if (request.action === "closeShop") {
      chrome.tabs.goBack().catch((error) => {
        chrome.tabs.remove(currentTabId);
      });
    } else if (request.action === "updateFakeshopList") {
      console.log("reload shops");
      loadFakeshopList();
    } else if (request.action === "showRiskIcon") {
      chrome.action.setIcon({ path: "/images/ic_risk.png" });
    } else if (request.action === "showNoRiskIcon") {
      chrome.action.setIcon({ path: "/images/ic_no_risk.png" });
    } 
  }
);

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
  allFakeshops.length = 0;
  saveFakeshopList(allFakeshops);
  for (const fakeshop of data) {
    allFakeshops.push({
      "url": fakeshop[`site_baseURL`],
      "since": fakeshop['site-added-date'].substring(0, 10)
    });
  }
  saveFakeshopListUpdateTime();
  saveFakeshopList(allFakeshops);
}

function saveFakeshopList(allFakeshops) {
  chrome.storage.local.set({ allFakeshops: allFakeshops });
}

function saveFakeshopListUpdateTime() {
  const date = new Date();
  console.log('save date: ' + date);
  console.log('save date getTime(): ' + date.getTime());
  chrome.storage.local.set({ updateTime: date.getTime() });
}

