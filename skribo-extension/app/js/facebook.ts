
    function loginfacebook(callback: Function) {
        chrome.windows
            .create(
            {
                'url': 'https://www.facebook.com/dialog/oauth?'
                + 'display=popup&'
                + 'client_id=1613231555594185&'
                + 'redirect_uri=https://www.facebook.com/connect/login_success.html&'
                + 'scope=public_profile,email,user_friends&' + 'response_type=token',
                'width': 580,
                'height': 400
            },
            function (popupWindow) {
                chrome.tabs
                    .query(
                    {
                        active: true
                    },
                    function (tabs) {
                        var tabid: any = tabs[0].id;
                        chrome.tabs.onUpdated
                            .addListener(function (
                                tabid, tab) {
                                var tabUrl = tab.url;
                                var accessTokenMatcher: RegExpMatchArray = null;
                                var expiresInMatcher: RegExpMatchArray= null;
                                if (tabUrl != null) {
                                    accessTokenMatcher = tabUrl.match(/[\\?&#]access_token=([^&#])*/i);
                                    expiresInMatcher = tabUrl.match(/expires_in=.*/);
                                }
                                if (accessTokenMatcher != null) {
                                    var token: string = accessTokenMatcher[0];
                                    token = token.substring(14);
                                    var expires_in: string = expiresInMatcher[0];
                                    expires_in = expires_in.substring(11);
                                    localStorage.setItem('accessToken', token);
                                    var currentDate = new Date();
                                    var expiryTime = currentDate.getTime() + 1000 * (parseInt(expires_in) - 300);
                                    localStorage.setItem('expiryTime', expiryTime.toString());
                                    chrome.windows.remove(popupWindow.id);
                                    callback();
                                }
                                ;
                            });
                    });
            });
    }
 