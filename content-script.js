console.log("content-script launched");

chrome.runtime.onMessage.addListener(function (tabUrl, sendResponse) {
  console.log(tabUrl);
  checkFakeshop(tabUrl);
});

function checkFakeshop(tabUrl) {
  console.log("content-script with function checkFakeshop() launched");
  let strippedTabUrl = getTabUrlHostname(tabUrl);
  console.log("strippedTabUrl: " + strippedTabUrl);
  chrome.storage.local.get("allFakeshops", ({ allFakeshops }) => {
    if (allFakeshops.includes(strippedTabUrl)) {
      showWarningAlert();
    } else {
      console.log("Keine Gefahr :)");
    }
  });
}

function showWarningAlert() {
  alert('Oh mein Gott, ein Fakeshop! Es funktioniert!');
}

function getTabUrlHostname(tabUrl) {
  var parser = document.createElement('a');
  parser.href = tabUrl;

  return parser.hostname;
}
