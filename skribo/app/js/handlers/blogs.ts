class BlogsHandler {



    static handle(request: any, sender: any, sendResponse: Function, socket: any) {
        if (request.command.indexOf('blogs:') < 0)
            return;

        switch (request.command) {
            case 'blogs:navigate':
                chrome.tabs.getSelected((selectedTab) => {
                    var url = chrome.extension.getURL('app/modules/blogs/blog.html') + '#/'+request.data;
                    if (selectedTab.id === -1) {
                        chrome.tabs.create({ url: url }, () => {
                            sendResponse({ 'result': 'ok' });
                        });
                    }
                    else {
                        chrome.tabs.update(selectedTab.id, { url: url }, () => {
                            sendResponse({ 'result': 'ok' });
                        });
                    }


                });
                break;
        }
    }

}