
chrome.storage.sync.get({
    juntas_server: 'https://www.juntason.com'
} as any, (items: any) => {
    TabsHandler.juntasServer = items.juntas_server;
});


interface ITab {
    Name: string;
    _id: string;
    UserId: string;
    TabId: any;
    load: boolean;
    dirty: boolean;
}


class Tabs {
    static tabs: any = {};
    public static byId(id: number) {
        for (var x in this.tabs) {
            if (this.tabs[x].TabId == id)
                return this.tabs[x];
        }
        return null;
    }

    public static byKey(key: string) {
        if (key.indexOf('TAB') !== 0)
            return this.tabs['TAB' + key];
        return this.tabs[key];
    }

    public static add(key: string, tab: ITab) {
        return this.tabs[key] = tab;
    }

    public static delete(key: string) {

        delete this.tabs[key];
    }
    public static keys() {
        return Object.keys(this.tabs);
    }
}

class TabsHandler {

    static user: any;
    static juntasServer: string;
    static juntaswindows: any[] = [];
    static handle(request: any, sender: any, sendResponse: Function, socket: any) {
        if (request.command.indexOf('tabs:') < 0)
            return;



        this.user = User.getUser();

        switch (request.command) {
            case 'tabs:connect':
                {

                    if (!User.getUser()) {
                        var url = chrome.extension.getURL('popup.html');
                        chrome.windows.create({ url: url, type: 'panel' });
                        sendResponse({ 'result': 'nouser' });
                        return true;
                    }
                    var tab = request.activeTab;
                    var tabKey = 'TAB' + request.tab._id;

                    if (sender.tab !== undefined) {
                        tab = sender.tab;
                        var prevtab = Tabs.byId(sender.tab.id)
                        if (prevtab != null) {
                            Tabs.delete('TAB' + prevtab._id);
                        }
                        request.tab.TabId = sender.tab.id;
                        Tabs.add(tabKey, request.tab);

                    }
                    else {
                        var prevtab = Tabs.byId(request.tab.TabId)
                        if (prevtab != null) {
                            Tabs.delete('TAB' + prevtab._id);
                        }
                        Tabs.add(tabKey, request.tab);

                    }

                   
                    if (!Tabs.byKey(tabKey))
                        return;

                    var xtab = Tabs.byKey(tabKey);
                    socket.emit('tabs:connect', Tabs.byKey(tabKey), this.user._id);
                    chrome.browserAction.setIcon({ path: '../icons/icon48_on.png' });


                    
                    this.fillMyTab(xtab._id, Tabs.byKey(tabKey).TabId, () => {
                        let tab = Tabs.byKey(tabKey);
                        
                        if (tab.UserId !== this.user._id) {
                            if (tab.History !== undefined && tab.History.length > 0) {
                                var movingUrl = '';
                               
                                if (tab.History.length == 1)
                                    movingUrl = tab.History[0].Url;
                                else {
                                    var arr = tab.History.sort((a: any, b: any) => {
                                        // Turn your strings into dates, and then subtract them
                                        // to get a value that is either negative, positive, or zero.
                                        a = new Date(a.Date);
                                        b = new Date(b.Date);
                                        return b - a;
                                    });


                                    movingUrl = arr[0].Url;
                                }


                                //if (movingUrl.indexOf('chrome.google.com') > -1) {
                                //    var url = chrome.extension.getURL('app/sidebar.html');
                                //    movingUrl = 'http://localhost:3030/start.html';
                                //    //url;//
                                //}


                                if (xtab.lastUrl !== movingUrl) {
                                    chrome.tabs.update(tab.TabId, { url: movingUrl }, () => {
                                        //this.fillMyTab(xtab._id, this.juntastabs[tabKey].TabId, () => {
                                        //   return sendResponse({ 'result': 'ok' });
                                        //});
                                    });
                                } else {

                                    var url = chrome.extension.getURL('app/sidebar.html');
                                    Chrome.sendMessage(tab.TabId, { command: 'show sidebar', tab: xtab }, (response) => {
                                        // responseFillData = sendResponse;
                                        return sendResponse({ 'result': 'ok' });

                                    });

                                }
                            } else {

                                //this.fillMyTab(xtab._id, tab.TabId, () => {
                                    Chrome.sendMessage(tab.TabId, { command: 'show sidebar', tab: xtab }, (response) => {
                                        // responseFillData = sendResponse;
                                       
                                        return sendResponse({ 'result': 'ok' });

                                    });
                                     
                                    //sendResponse({ 'result': 'ok' });
                               // });
                                return true;
                            }
                        }
                        else {
                            tab.lastUrl = request.activeTab.url;

                            socket.emit('tabs:navigate', { TabId: xtab._id, Url: tab.lastUrl, UserId: this.user._id });

                            if (request.notify)
                                socket.emit('notify party', { TabId: xtab._id, UserId: this.user._id });

                            this.fillMyTab(xtab._id, tab.TabId, () => {
                                var url = chrome.extension.getURL('app/sidebar.html');
                                //chrome.windows.create({ url: url, type: 'normal' });
                                //chrome.windows.create({ url: url, type: 'popup' });
                                //chrome.windows.create({ url: url, type: 'popup' });
                                //chrome.windows.create({ url: url, type: 'panel' });
                                // chrome.windows.create({ url: url, type: 'panel', state: 'docked' });

                                Chrome.sendMessage(tab.TabId, { command: 'show sidebar', tab: xtab }, (response) => {
                                    // responseFillData = sendResponse;
                                    return sendResponse({ 'result': 'ok' });

                                });


                            });
                        }


                    });

                    return true;
                }

            case 'tabs:data':
                var t = Tabs.byId(sender.tab.id);
                if (t)
                    if (this.juntaswindows.indexOf(sender.tab.windowId) < 0)
                        this.juntaswindows.push(sender.tab.windowId);
                //t.dirty = false;
                sendResponse({ 'result': t });
                break;
        }
    }




    public static fillMyTab(id: string, tabid: number, callback: Function) {

        var tabKey = 'TAB' + id;
        var r = new XMLHttpRequest();
        r.open('GET', this.juntasServer + '/tabs/fillmytab?_id=' + id, true);
        r.onreadystatechange = () => {
            if (r.readyState != 4 || r.status != 200) return;

            var tabState = localStorage.getItem('TAB' + id);


            Tabs.add(tabKey, JSON.parse(r.responseText));
            Tabs.byKey(tabKey).TabId = tabid;
            Tabs.byKey(tabKey).dirty = true;
            if (tabState) {
                var tabStateObj = JSON.parse(tabState);
                tabStateObj.Image = Tabs.byKey(tabKey).Image;
                localStorage.setItem(tabKey, JSON.stringify(tabStateObj));
            }

            chrome.browserAction.setIcon({ path: '../icons/icon48_on.png' });
            return callback();
        };
        r.send('_id=' + id);
    }

}


