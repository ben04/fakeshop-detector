chrome.runtime.onMessage.addListener(function (tabUrl, sendResponse) {
  checkFakeshop(tabUrl);
});

function checkFakeshop(tabUrl) {
  let strippedTabUrl = getTabUrlHostname(tabUrl);
  chrome.storage.local.get("allFakeshops", ({ allFakeshops }) => {

    let index = allFakeshops.findIndex((shop) => shop.url == strippedTabUrl);

    if (index != -1) {
//    if (allFakeshops.includes(strippedTabUrl)) {
      showWarningAlert(allFakeshops[index]['since']);
    } else {
      console.log("Keine Gefahr :)");
    }
  });
}

function showWarningAlert(sinceDate) {
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

function parseDate(sinceDate) {
  var dateString = sinceDate.match(/^(\d{4})\-(\d{2})\-(\d{2})$/);
  var d = new Date(dateString[1], dateString[2]-1, dateString[3]);
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
  chrome.runtime.sendMessage({ clickAction: clickAction });
}

function getTabUrlHostname(tabUrl) {
  var parser = document.createElement('a');
  parser.href = tabUrl;

  return parser.hostname;
}
