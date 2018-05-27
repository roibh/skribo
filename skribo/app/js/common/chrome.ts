class Chrome {
    public static sendMessage(tabId, message, callback?) {
        // chrome.tabs.sendMessage(tabId, { command: { ping: true } }, function (response) {          
        //     if (response && response.result.pong) { // Content script ready             
        chrome.tabs.sendMessage(tabId, message, callback);
    }
    //});
    // }
}