const bsiUrl = "https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Online-Banking-Online-Shopping-und-mobil-bezahlen/Online-Shopping/online-shopping_node.html";
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
    if (request.clickAction === "openBSI") {
      chrome.tabs.create({
        url: fakeUrl//bsiUrl
      });
    } else if (request.clickAction === "closeShop") {
      chrome.tabs.goBack().catch((error) => {
        chrome.tabs.remove(currentTabId);
      });
      console.log("close shop");
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
    allFakeshops.push(fakeshop.site_baseURL);
  }
  console.log(allFakeshops);
  saveFakeshopList(allFakeshops);
}

function saveFakeshopList(allFakeshops) {
  chrome.storage.local.set({ allFakeshops: allFakeshops });
}

