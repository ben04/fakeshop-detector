chrome.runtime.onMessage.addListener(function (tabUrl, sendResponse) {
  checkFakeshop(tabUrl);
});

function checkFakeshop(tabUrl) {
  let strippedTabUrl = getTabUrlHostname(tabUrl);
  chrome.storage.local.get("allFakeshops", ({ allFakeshops }) => {
    if (allFakeshops.includes(strippedTabUrl)) {
      showWarningAlert();
    } else {
      console.log("Keine Gefahr :)");
    }
  });
}

function showWarningAlert() {
  fetch(chrome.runtime.getURL('/fakeshop_banner.html')).then(r => r.text()).then(html => {
    /** CSS Injection */
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL("fakeshop_banner.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    var linkMaterialIcon = document.createElement('link');
    linkMaterialIcon.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0';
    linkMaterialIcon.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(linkMaterialIcon);

    document.body.insertAdjacentHTML('beforebegin', html);

    registerClickListener();
  });
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
  chrome.runtime.sendMessage({ clickAction: clickAction });
}

function getTabUrlHostname(tabUrl) {
  var parser = document.createElement('a');
  parser.href = tabUrl;

  return parser.hostname;
}
