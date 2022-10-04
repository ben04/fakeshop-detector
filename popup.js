// Initialize button with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

chrome.storage.local.get("allFakeshops", ({ allFakeshops }) => {
  console.log(allFakeshops);
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  console.log("button clicked");
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  var tabUrl = tab.url;
  console.log("tabUrl: " + tabUrl);

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: showWarningAlert(tabUrl),
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function showWarningAlert(tabUrl) {
  let strippedTabUrl = getTabUrlHostname(tabUrl);
  console.log("strippedTabUrl: " + strippedTabUrl);
  chrome.storage.local.get("allFakeshops", ({ allFakeshops }) => {
    if (allFakeshops.includes(strippedTabUrl)) {
      alert('Oh mein Gott, ein Fakeshop! Es funktioniert!');
    } else {
      alert('Keine Gefahr, aber die Extension läuft!');
    }
  });
}

function getTabUrlHostname(tabUrl) {
  var parser = document.createElement('a');
  parser.href = tabUrl;

  return parser.hostname;

  // var regex = /\/\/([^\/,\s]+\.[^\/,\s]+?)(?=\/|,|\s|$|\?|#)/g;
  // let match = regex.exec(tabUrl);

  // if (match.length == 2) {
  //   return match[1];
  // } else {
  //   return match[0];
  // }
}
