 
var IUser = IUser;

class eventHandlers {
    public static socket: any;
    public static currentElement: any;
    public static imageClickHandler(e: any) {
        var user = User.getUser();
        if (user) {

            var tabid = e.menuItemId.split('_')[1];
            this.socket.emit('tabs:navigate', { TabId: tabid, Url: e.srcUrl, UserId: user._id });
        }
    };

    public static pageContactClickHandler(e: any) {
        var user = User.getUser();
        if (user) {
            chrome.tabs.getSelected((selectedTab) => {
                var contactid = e.menuItemId.split('_')[1];

                this.socket.emit('tab contact', { ToUserId: contactid, Url: selectedTab.url, UserId: user._id });
            });
        }
    };

    public static textClickHandler(e: any) {
        var user = User.getUser();
        if (user) {
            chrome.tabs.getSelected((selectedTab) => {
                chrome.tabs.executeScript(selectedTab.id, {
                    code: `scripter('${this.currentElement}')
                                                    .append('<div contenteditable class='juntas_annotation'></div>')
                                                    .on('focusout', function(){juntasInstance.annotate(this);});` }, function (data) {

                    });

            });

            //var tabid = e.menuItemId.split('_')[1];
            //chrome.tabs.getSelected((selectedTab) => {
            //    _self.socket.emit('tab annotate', { TabId: tabid, Url: selectedTab.url, UserId: user._id, Element: _self.currentElement });
            //});
        }
    };




    public static pageClickHandler(e: any) {

        var user = User.getUser();
        if (user) {
            chrome.tabs.getSelected((selectedTab) => {

                var tabid = e.menuItemId.split('_')[1];


                this.socket.emit('tabs:navigate', { TabId: tabid, Url: selectedTab.url, UserId: user._id });
            });
        }
    };
}

