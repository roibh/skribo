class GroupsHandler {



    static handle(request: any, sender: any, sendResponse: Function, socket: any) {
        if (request.command.indexOf('groups:') < 0)
            return;

        switch (request.command) {
            case 'groups:subscribe':
                chrome.tabs.getSelected((selectedTab) => {
                    socket.emit('groups:subscribe', request.data, function(){
                         sendResponse({ 'result': 'ok' });
                    });                 
                });
                return true;
                 
        }
    }

}