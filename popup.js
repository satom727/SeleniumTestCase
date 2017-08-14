//to bg.js
window.addEventListener('load', function() {
  var tabid;
  chrome.tabs.query({active:true,  windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
    tabid = tabs[0].id;
  });
  document.getElementById('save').addEventListener('click', function() {
    chrome.runtime.sendMessage({ TabId:tabid,btn:'save' });
  });
}, false);