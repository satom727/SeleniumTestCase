//from popup.js to script.js
chrome.runtime.onMessage.addListener(function( message, sender, sendResponse ) {
    var tabid = message.TabId;
    if(message.btn ==='save'){
        chrome.tabs.sendMessage(tabid,{btn: "save"});
    }
});