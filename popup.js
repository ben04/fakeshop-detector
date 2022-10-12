let bsiWarnings = document.getElementById("bsiWarnings");
let toggleLabel = document.getElementById("toggleLabel");
let about = document.getElementById("about");

toggleLabel.addEventListener("click", async () => {
  console.log("toggleLabel clicked");
  document.getElementById("toggleCb").checked = !document.getElementById("toggleCb").checked;
});

bsiWarnings.addEventListener("click", async () => {
  chrome.tabs.create({
    url: 'https://wid.cert-bund.de/portal/wid/kurzinformationen'
  });
});

about.addEventListener("click", async () => {
  chrome.runtime.openOptionsPage();
});