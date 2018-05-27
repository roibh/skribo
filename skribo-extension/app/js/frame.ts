window.addEventListener('message', function (event) {
    chrome.tabs.getSelected(function (selectedTab) {
        chrome.runtime.sendMessage({ command: 'execute script', tab: selectedTab }, function (response) {
            console.log(response);
        });
    })
}, false);




