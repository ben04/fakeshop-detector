chrome.runtime.onMessage.addListener(function (tabUrl, sendResponse) {
  checkFakeshopListUpdateTime();
  checkFakeshop(tabUrl);
});

function checkFakeshopListUpdateTime() {
  chrome.storage.local.get("updateTime", ({ updateTime }) => {
    let now = new Date().getTime();
    if (((now - updateTime) / (60 * 60 * 1000)) > 24) {
      //last update time is older than 24 hours, thus request new update
      chrome.runtime.sendMessage({ action: 'updateFakeshopList' });
    }
  });
}

function checkFakeshop(tabUrl) {
  let strippedTabUrl = getTabUrlHostname(tabUrl);
  if (strippedTabUrl == 'www.365ersatzteile.de') {
    showBadShopAlert();
    return;
  }

  chrome.storage.local.get("allFakeshops", ({ allFakeshops }) => {

    let index = allFakeshops.findIndex((shop) => shop.url == strippedTabUrl);

    if (index != -1) {
      showWarningAlert(allFakeshops[index]['since']);
    } else {
      chrome.runtime.sendMessage({ action: 'showNoRiskIcon' });
    }
  });
}

function showWarningAlert(sinceDate) {
  chrome.runtime.sendMessage({ action: 'showRiskIcon' });

  fetch(chrome.runtime.getURL('/fakeshop_banner.html')).then(r => r.text()).then(html => {
    /** HTML: set correct date */
    html = html.replace('SINCE_DATE', parseDate(sinceDate));

    /** CSS Injection */
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL("fakeshop_banner.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    /** Icon Injection */
    var linkMaterialIcon = document.createElement('link');
    linkMaterialIcon.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0';
    linkMaterialIcon.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(linkMaterialIcon);

    document.body.insertAdjacentHTML('beforebegin', html);

    registerClickListener();
  });
}

function showBadShopAlert() {
  chrome.runtime.sendMessage({ action: 'showRiskIcon' });

  fetch(chrome.runtime.getURL('/badshop_banner.html')).then(r => r.text()).then(html => {
    /** CSS Injection */
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL("badshop_banner.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    /** Icon Injection */
    var linkMaterialIcon = document.createElement('link');
    linkMaterialIcon.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0';
    linkMaterialIcon.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(linkMaterialIcon);

    document.body.insertAdjacentHTML('beforebegin', html);

    document.getElementById("iconClose").addEventListener("click", () => document.getElementById("outerDiv").style.display = 'none', false);
  });
}

function parseDate(sinceDate) {
  var dateString = sinceDate.match(/^(\d{4})\-(\d{2})\-(\d{2})$/);
  var d = new Date(dateString[1], dateString[2] - 1, dateString[3]);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('de-DE', options);
}

function registerClickListener() {
  var bsiBtn = document.getElementById("btnBsi");
  var closeBtn = document.getElementById("btnCloseShop");
  bsiBtn.addEventListener("click", () =>
    handleClick("openBSI")
    , false);

  closeBtn.addEventListener("click", () =>
    handleClick("closeShop")
    , false);
}

function handleClick(clickAction) {
  chrome.runtime.sendMessage({ action: clickAction });
}

function getTabUrlHostname(tabUrl) {
  var parser = document.createElement('a');
  parser.href = tabUrl;

  return parser.hostname;
}
