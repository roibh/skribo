'use-strict'

function loginfacebookpopup(callback: Function) {
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
        function (popupWindow: any) {
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
                            var expiresInMatcher: RegExpMatchArray = null;
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
                                try {
                                    chrome.windows.remove(popupWindow.id);
                                } catch (err) { }
                                callback();
                            }
                            ;
                        });
                });
        });
}


function initIFrame() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {

        var expiry = new Date(parseInt(localStorage.getItem('expiryTime')));
        var now = new Date();
        if (localStorage.getItem('accessToken') && now < expiry) {
            (angular.element('#JuntasCtrl').scope() as juntas.popupScope).FacebookLogin(localStorage.getItem('accessToken'));
            //$('#facebookframe').show();
            //$('#facebookframe').attr('src',
            //  'http://juntas.zapto.org/facebook?&accessToken=' + encodeURIComponent(localStorage.accessToken));
        } else {
            // $('#facebookframe').hide();
            loginfacebookpopup(initIFrame);
        }
    });
}
var version = chrome.runtime.getManifest().version;
var apiUrl: string = '';
var macros: any = null;

chrome.storage.sync.get({
    juntas_server: 'https://www.juntason.com'
} as any, function (items: any) {
    apiUrl = items.juntas_server;
});



var JuntasApp = angular.module('JuntasApp',
    ['ui.bootstrap', 'ngResource', 'dialogs.main', 'gettext', 'JuntasLanguages', 'angular-tour']).config(
    [function () {

    }]).run(function ($Language: juntas.ILanguageService) {
        $Language.setGlobalLanguage($Language.getGlobalCurrent());
    })
    .controller('tour', function ($scope: any, gettextCatalog: any) {
        $scope.Welcome = gettextCatalog.getString('Welcome1');
    })
    .controller('JuntasCtrl', function ($scope: juntas.popupScope, $resource: any, $Config: any, gettextCatalog: any, dialogs: any, $Language: juntas.ILanguageService, $timeout: ng.ITimeoutService) {
        $scope.ActivityStatus = [];
        $scope.ActivityStatus.push('Ready.');
        $scope.InterfaceLanguage = $Language.getGlobalCurrent();
        $scope.socialLogin = true;
        $scope.LoaderState = { 'facebook': false, 'google': false, 'register': false, 'search': false, 'login': false, };
        $scope.currentTourStep = -1;
        $scope.StartTour = function () {
            $scope.currentTourStep = 0;
        }

        $Config.ready(function () {

            var followed = localStorage.getItem('juntasfollowed');
            if (followed !== null) {
                $scope.FollowedFeeds = JSON.parse(followed);
            }
            if ($scope.FollowedFeeds) {
                for (var i = 0; i < $scope.FollowedFeeds.length; i++) {

                    if (typeof ($scope.FollowedFeeds[i].Configuration) == 'string') {
                        $scope.FollowedFeeds[i].Configuration = JSON.parse($scope.FollowedFeeds[i].Configuration);

                    }
                }
            }

            // apiUrl = apiUrl;
            chrome.runtime.sendMessage({ command: 'config loaded', config: $Config.site }, function (response) { });
        });

        $scope.RegistrationInformation = {};
        $scope.LoginInformation = {};
        $scope.SearchInformation = {};
        $scope.CobrowseInformation = { 'Configuration': {} };
        $scope.Feeds = [];
        $scope.UserFeeds = [];
        //$scope.FollowedFeeds = [];
        $scope.UImode = 'Manage';
        $scope.OwnerMode = '';
        $scope.User = null;
        $scope.Version = version;
        if (localStorage.getItem('OwnerMode') !== undefined)
            $scope.UImode = localStorage.getItem('OwnerMode');

        $scope.$watch('OwnerMode', function (newVal: any, oldVal: any) {
            if (newVal === undefined || newVal === '')
                return;
            localStorage.setItem('OwnerMode', newVal);
        });

        var userStr = localStorage.getItem('juntasuser');
        var user: any;
        if (userStr !== null && userStr != 'null') {
            user = JSON.parse(userStr);
            $scope.notLogedIn = false;
        }
        else {
            $scope.notLogedIn = true;
        }
        $scope.User = user;
        if (!user) {
            $scope.notLogedIn = true;
        }
        $scope.Themes = ['amelia', 'blooming', 'cerulean', 'cyborg', 'desert', 'flat', 'green', 'journal', 'Liquorice Schnitzel', 'Lumen', 'paper', 'readable', 'Rouge', 'simplex', 'spacelab', 'superhero', 'United'];
        $scope.Languages = <Array<juntas.ILanguage>>[
            { id: 'eng', code: 'en_EN', name: 'english', 'short': 'en', },
            { id: 'heb', code: 'he_IL', name: '\u05e2\u05d1\u05e8\u05d9\u05ea', 'short': 'he', rtl: true },
            { id: 'rus', name: 'russian', 'short': 'ru', },
            { id: 'de', name: 'german', 'short': 'de', }]
        var theme = localStorage.getItem('theme');
        if (theme !== null && theme !== undefined) {
            $scope.Theme = theme;
        }
        else {
            $scope.Theme = 'paper';
        }
        $scope.$watch('Theme', function (theme_name: string, oldVal: string) {
            if (theme_name !== undefined) {
                var theme = '../css/themes/' + theme_name + '/bootstrap.min.css';
                $(`link[id='mainthemefile']`).attr('href', theme);
                localStorage.setItem('theme', theme_name);
            }
        });
        $scope.$watch('InterfaceLanguage', function (language: juntas.ILanguage, oldVal: juntas.ILanguage) {
            if (language !== undefined && language !== null) {

                $Language.setGlobalLanguage(language);

                // localStorage.setItem('language', JSON.stringify(language));

                // gettextCatalog.setCurrentLanguage(language.code);


            }
        });


        $scope.displayState = (state: string, uimode: string) => {
            if (uimode) {
                return uimode.indexOf(state) > -1;
            }
            return false;
        }
        $scope.initFacebook = function () {
            initIFrame();
        }
        $scope.FeedActive = false;
        $scope.ActiveFeedInformation = false;
        $scope.init = function () {

            //console.log('init popup');
            var userStr = localStorage.getItem('juntasuser');
            var user: any;
            if (userStr !== null && userStr != 'null') {
                user = JSON.parse(userStr);
                if (user !== null) {
                    //console.log('Load feeds');
                    $scope.LoadFeeds(user._id);
                    $scope.LoadBlogs(user._id);
                }
            }

            chrome.tabs.getSelected(function (selectedTab) {
                chrome.runtime.sendMessage({ command: 'get isactive', tab: selectedTab }, function (response) {
                    //$scope.$apply(function () {
                    $scope.FeedActive = false;
                    if (typeof (response) !== 'undefined' && response.result !== null) {
                        $scope.FeedActive = true;
                        $scope.ActiveFeedInformation = response.result;
                    }

                    // });
                });
            })
        }
        $scope.LoadFeeds = function (userid) {


            $Config.ready(() => {

                if (userid !== null) {
                    $scope.FollowedFeeds = localStorage.getItem('juntasfollowed');
                    if ($scope.FollowedFeeds)
                        $scope.FollowedFeeds = JSON.parse($scope.FollowedFeeds);


                    var followedfeedsres = $resource(apiUrl + '/tabs/followedfeeds');
                    followedfeedsres.get({ 'UserId': userid }, (data: any) => {

                        $scope.FollowedFeeds = data.items;
                        localStorage.setItem('juntasfollowed', JSON.stringify(data.items));
                        $scope.GetContacts(userid);

                        getGo();

                        chrome.runtime.sendMessage({ command: 'create menus' }, function (response) { });
                    });
                }
            });
        }


        $scope.LoadBlogs = function (user_id) {


            $Config.ready(() => {

                if (user_id !== null) {
                    $scope.FollowedBlogs = localStorage.getItem('juntasfollowedblogs');
                    if ($scope.FollowedBlogs && $scope.FollowedBlogs!== 'undefined')
                        $scope.FollowedBlogs = JSON.parse($scope.FollowedBlogs);


                    var followedblogsres = $resource(apiUrl + '/blogs/followedblogs');
                     
                    followedblogsres.query({ 'user_id': user_id }, (data: any) => {
                         
                        $scope.FollowedBlogs = data;
                        localStorage.setItem('juntasfollowedblogs', JSON.stringify(data));
                        //getGo();

                        //chrome.runtime.sendMessage({ command: 'create menus' }, function (response) { });
                    });
                }
            });
        }

        $scope.Loader = { 'contacts': false, blogs: false, groups: false };


        $scope.LoadContacts = function () {

            var contactsStr = localStorage.getItem('juntascontacts');

            var juntascontactsonline = localStorage.getItem('juntascontactsonline');
            var contacts: any;
            if (contactsStr !== null)
                contacts = JSON.parse(contactsStr);
            if (juntascontactsonline !== null)
                juntascontactsonline = JSON.parse(juntascontactsonline);

            for (var userkey in contacts) {
                contacts[userkey].online = (juntascontactsonline && juntascontactsonline.indexOf(userkey) > -1);
            }
            $scope.Contacts = objectsToArray(contacts);
            localStorage.setItem('juntascontacts', JSON.stringify(contacts));
        }

        $scope.UserSearchFeeds = [];

        $scope.LoadFeed = function (item: any) {
            if (item.feed === undefined) {
                var search = $resource(apiUrl + '/tabs/feeds');
                search.save({ 'UserId': item.UserId }, function (data: any) {

                    item.Feeds = data.items;

                    $scope.UserSearchFeeds = item;
                }, function (Error: any) {
                    item.Feeds = Error.data.error.message;
                });
            }
        }


        $scope.Search = function () {


            var contactsStr = localStorage.getItem('juntascontacts');
            var contacts: any;
            if (contactsStr !== null)
                contacts = JSON.parse(contactsStr);
            var usersObj: any = {};

            for (var key in contacts) {
                usersObj[contacts[key]._id] = contacts[key];
            }


            var search = $resource(apiUrl + '/tabs/search');
            $scope.LoaderState['search'] = true;
            search.save({ 'Name': $scope.SearchInformation.Name, 'Description': $scope.SearchInformation.Description }, function (data: any) {

                var users_for_tabs_dic: any = {};
                if (data.result.users_for_tabs) {
                    for (var i = 0; i < data.result.users_for_tabs.length; i++) {
                        users_for_tabs_dic[data.result.users_for_tabs[i].UserId] = data.result.users_for_tabs[i];
                    }
                }
                if (data.result.tabs) {
                    for (var i = 0; i < data.result.tabs.length; i++) {
                        data.result.tabs[i].User = users_for_tabs_dic[data.result.tabs[i].UserId];
                    }
                }




                $scope.SearchInformation.Results = data.result;
                $scope.LoaderState['search'] = false;


            }, function (Error: any) {
                $scope.LoaderState['search'] = false;
                $scope.SearchInformation.Error = Error.data.error.message;
            });
        }

        $scope.Register = function () {
            if (isNullOrEmpty($scope.RegistrationInformation.Email)
                || isNullOrEmpty($scope.RegistrationInformation.FirstName)
                || isNullOrEmpty($scope.RegistrationInformation.Password)
                || isNullOrEmpty($scope.RegistrationInformation.LastName)) {
                $scope.RegistrationInformation.Error = 'missing information';
                return;
            }
            if ($scope.RegistrationInformation.Password != $scope.RegistrationInformation.RepeatPassword) {
                $scope.RegistrationInformation.Error = 'password mismatch';
                return;
            }
            $scope.LoaderState['register'] = true;

            var register = $resource($Config.site.apiUrl + '/user/register');
            register.save($scope.RegistrationInformation, function (data: any) {
                if (data.error !== undefined) {
                    $scope.RegistrationInformation.Error = data.error.message;
                }
                else {
                    $scope.RegistrationInformation.Error = '';
                    localStorage.setItem('juntasuser', JSON.stringify(data));
                    $scope.User = data;
                    $scope.notLogedIn = false;
                    chrome.runtime.sendMessage({ command: 'create menus' }, function (response) { });
                }
                $scope.LoaderState['register'] = false;

            }, function (Error: any) {
                $scope.LoaderState['register'] = false;
                $scope.RegistrationInformation.Error = Error.data.error.message;
            });
        }
        $scope.Logout = function () {
            $Config.ready(function () {
                var login = $resource(apiUrl + '/user/logout');
                login.save({ 'Token': $scope.User.Token }, function (data: any) {

                    chrome.runtime.sendMessage({ command: 'logout' }, function (response) { });

                    $scope.notLogedIn = true;
                });
            });
        }
        $scope.ResetPassword = function () {
            var login = $resource(apiUrl + '/user/resetpassword');
            if (!isNullOrEmpty($scope.RemindPasswordInformation.Email)) {
                login.save({ 'Email': $scope.LoginInformation.Email }, function (data: any) {
                    $scope.RemindPasswordInformation.Error = 'Message sent';
                });
            }
        }
        $scope.Login = function () {
            $scope.LoaderState['login'] = true;
            var login = $resource(apiUrl + '/user/login');
            if (!isNullOrEmpty($scope.LoginInformation.Email) && !isNullOrEmpty($scope.LoginInformation.Password))
                login.save({ 'Email': $scope.LoginInformation.Email, 'Password': $scope.LoginInformation.Password }, function (data: any) {
                    if (data.error !== undefined) {
                        $scope.LoginInformation.Error = data.error.message;
                    }
                    else {
                        $scope.LoginInformation.Error = '';
                        localStorage.setItem('juntasuser', JSON.stringify(data));
                        $scope.User = data;
                        $scope.notLogedIn = false;
                        $scope.init();

                    }
                    $scope.LoaderState['login'] = false;
                }, function (Error: any) {
                    if (Error.data)
                        $scope.LoginInformation.Error = Error.data.error.message;

                    $scope.LoaderState['login'] = false;
                });
        }
        $scope.FacebookLogin = function (access_token) {

            $scope.LoaderState['facebook'] = true;
            var facebook = $resource('https://graph.facebook.com/me?fields=email,first_name,last_name,picture&access_token=' + access_token);
            facebook.get({}, function (data: any) {
                var login = $resource(apiUrl + '/user/facebook');

                login.save({ 'FirstName': data.first_name, 'LastName': data.last_name, 'Email': data.email, 'Password': data.id, 'Picture': data.picture, 'Uid': data.id, 'Token': access_token }, function (data: any) {
                    if (data.error !== undefined) {
                        $scope.LoginInformation.Error = data.error.message;
                    }
                    else {
                        $scope.LoginInformation.Error = '';
                        localStorage.setItem('juntasuser', JSON.stringify(data));
                        $scope.User = data;
                        $scope.notLogedIn = false;

                        $scope.init();
                        $scope.LoaderState['facebook'] = false;

                    }
                }, function (Error: any) {
                    if (Error.data)
                        $scope.LoginInformation.Error = Error.data.error.message;

                    $scope.LoaderState['facebook'] = false;
                });
            })
        }
        $scope.Oauth = function (token) {
            chrome.identity.getProfileUserInfo(function (userinfo) {
                $scope.LoaderState['google'] = true;
                $resource('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token).get(function (data: any) {
                    var login = $resource(apiUrl + '/user/oauth');
                    login.save({ 'Token': token, 'FirstName': data.given_name, 'LastName': data.family_name, 'Picture': { data: { url: data.picture } }, 'Email': data.email, 'Uid': data.id }, function (data: any) {
                        if (data.error !== undefined) {
                            $scope.LoginInformation.Error = data.error.message;
                        }
                        else {
                            $scope.LoginInformation.Error = '';
                            localStorage.setItem('juntasuser', JSON.stringify(data));
                            $scope.User = data;
                            $scope.notLogedIn = false;
                            $scope.LoaderState['google'] = false;
                            $scope.init();
                        }
                    }, function (Error: any) {
                        if (Error.data)
                            $scope.LoginInformation.Error = Error.data.error.message;

                        $scope.LoaderState['google'] = false;
                    });
                });
            });
        }
        $scope.googleLogin = function () {
            chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
                $scope.Oauth(token, function () {
                    //_gaq.push(['_trackEvent', 'btn-social', 'authenticated', 'btn-google']);
                });
            });
        }
        $scope.Unsubscribe = function (item) {

            var translate1 = gettextCatalog.getString('Remove group');
            var translate2 = gettextCatalog.getString('this will remove the group from your group list, continue?');

            dialogs.confirm(translate1, translate2, {}).result.then(
                function () {

                    item.deleting = true;
                    var followRes = $resource(apiUrl + '/tabs/unsubscribefollowers');
                    followRes.save({ '_id': item._id, 'userId': $scope.User._id }, function (data: any) {
                        $scope.FollowedFeeds.splice($scope.FollowedFeeds.indexOf(item), 1);
                        chrome.tabs.getSelected(function (selectedTab) {
                            chrome.runtime.sendMessage({ command: 'delete tab', tab: item }, function (response) {
                            });
                        });
                    });
                });
        }
        $scope.DeleteGroup = function (item) {

            var translate1 = gettextCatalog.getString('Delete group');
            var translate2 = gettextCatalog.getString('this will delete the entire group, continue?');

            dialogs.confirm(translate1, translate2, {}).result.then(
                function () {
                    var followRes = $resource(apiUrl + '/tabs/deletegroup');
                    followRes.save({ '_id': item._id, 'userId': $scope.User._id }, function (data: any) {
                        $scope.FollowedFeeds.splice($scope.FollowedFeeds.indexOf(item), 1);
                        chrome.tabs.getSelected(function (selectedTab) {
                            chrome.runtime.sendMessage({ command: 'delete tab', tab: item }, function (response) {
                            });
                        });
                    });
                }, function () { }
            );

        }
        $scope.ConnectToFeed = function (feed) {

            var followRes = $resource(apiUrl + '/tabs/subscribefollowers');
            followRes.save({ '_id': feed._id, 'userId': $scope.User._id }, function (data: any) {
                feed = { 'TabId': null, '_id': feed._id };
                chrome.tabs.getSelected(function (selectedTab) {
                    feed.TabId = selectedTab.id;
                    chrome.runtime.sendMessage({ command: 'tabs:connect', tab: feed, activeTab: selectedTab }, function (response) {
                        window.close();
                    });
                    window.close();
                });
            });
        }
        $scope.Reconnect = function (feed) {
            chrome.tabs.getSelected(function (selectedTab) {

                var followRes = $resource(apiUrl + '/tabs/fillmytab');
                followRes.get({ '_id': feed._id }, function (data: any) {


                    feed = data;
                    feed.TabId = selectedTab.id;
                    if (feed.UserId !== $scope.User._id && feed.History.length > 0) {
                        var movingUrl = '';
                        if (feed.History.length == 1)
                            movingUrl = feed.History[0].Url;
                        else
                            movingUrl = feed.History[feed.History.length - 1].Url;
                        chrome.tabs.update(selectedTab.id, { url: movingUrl }, function () { });
                    }
                    else {
                    }
                    chrome.runtime.sendMessage({ command: 'tabs:connect', tab: feed, activeTab: selectedTab }, function (response) {
                        window.close();
                    });
                    window.close();
                })
            });
        }
        $scope.InitCoBrowsing = function (invalid) {
            $scope.submitted = true;

            if (invalid)
                return;

            //get the current page url
            chrome.tabs.getSelected(function (selectedTab) {
                if (selectedTab != null) {
                    //open group and set the tabid


                    var tabsResource = $resource(apiUrl + '/tabs/tabs');
                    tabsResource.save({
                        'Name': $scope.CobrowseInformation.Name,
                        'Description': $scope.CobrowseInformation.Description,
                        'UserId': $scope.User._id,
                        'TabId': selectedTab.id,
                        'Configuration': { 'Theme': $scope.CobrowseInformation.Theme, 'Discovery': 'public', 'AllowPop': true },
                        'Date': new Date(),
                        'Comments': [{ 'Date': new Date(), 'Message': 'Welcome', 'UserId': $scope.User._id }],
                        'Followers': [$scope.User._id],
                        'History': [{ 'Date': new Date(), 'Url': selectedTab.url, 'UserId': $scope.User._id }],
                        'Map': [{ 'Url': selectedTab.url, 'Title': selectedTab.title, 'Created': new Date() }]
                    }, function (data: any) {
                        chrome.runtime.sendMessage({ command: 'tab create', tab: data, activeTab: selectedTab }, function (response) {
                            window.close();
                            $scope.LoadFeeds(user._id);
                        });
                        window.close();
                    }, function (error: any) { console.log(error) });
                }
                try {
                } catch (e) { console.log(e) }
            });
        }


        $scope.GetContacts = function (userid) {
            $scope.Loader.contacts = true;

            var contactsResource = $resource(apiUrl + '/user/contacts');

            var contact: any = { 'UserId': userid }
            contactsResource.query(contact, function (contactResult: any) {                

                var onlineUsers = localStorage.getItem('juntascontactsonline');
                if (onlineUsers !== null)
                    onlineUsers = JSON.parse(onlineUsers);



                $scope.Contacts = {};
                for (var i = 0; i < contactResult.length; i++) {
                    $scope.Contacts[contactResult[i].ContactId] = contactResult[i].User;
                }

                $scope.Loader.contacts = false;
                localStorage.setItem('juntascontacts', JSON.stringify($scope.Contacts));
            });
        }


        $scope.AddContact = function (item: any) {
            var contactsResource = $resource(apiUrl + '/user/contacts');

            var contact: any = { 'UserId': user._id, ContactId: item.UserId, isContact: true }
            contactsResource.save(contact, function (contactResult: any) {

                item.isContact = true;
                item.ContactId = contactResult._id;



                var contacts = localStorage.getItem('juntascontacts');
                if (contacts !== null)
                    contacts = JSON.parse(contacts);

                contact[item.ContactId] = item;
                localStorage.setItem('juntascontacts', JSON.stringify(contacts));
            });

        }

        $scope.RemoveContact = function (item: any) {
            var contactsResource = $resource(apiUrl + '/user/contacts');


            contactsResource.delete(item.ContactId, function () {
                item.isContact = false;

                var contacts: string | any = localStorage.getItem('juntascontacts');
                if (contacts !== null)
                    contacts = JSON.parse(contacts);

                delete contacts[item.ContactId];
                delete $scope.Contacts[item.ContactId];
                localStorage.setItem('juntascontacts', JSON.stringify(contacts));

            });

        }


        $scope.InitContactCoBrowsing = function (contact) {


            //get the current page url
            chrome.tabs.getSelected(function (selectedTab) {
                if (selectedTab != null) {
                    //open group and set the tabid


                    var tabsResource = $resource(apiUrl + '/tabs/tabs');
                    tabsResource.save({
                        'Name': $scope.User.FirstName + ' ' + $scope.User.LastName + ' - ' + contact.FirstName + ' ' + contact.LastName,
                        'UniquePair': [$scope.User._id, contact._id],
                        'Description': 'p2p call',
                        'UserId': [$scope.User._id, contact._id],
                        'TabId': selectedTab.id,
                        'Configuration': { 'Theme': $scope.CobrowseInformation.Theme, 'Discovery': 'p2p', 'AllowPop': true },
                        'Date': new Date(),
                        'Comments': [{ 'Date': new Date(), 'Message': 'Call started', 'UserId': $scope.User._id }],
                        'Followers': [$scope.User._id, contact._id],
                        'History': [{
                            'Title': selectedTab.title,
                            'Date': new Date(),
                            'UserId': $scope.User._id,
                            'Url': selectedTab.url
                        }],

                        'Map': [{ 'Url': selectedTab.url, 'Title': selectedTab.title, 'Created': new Date() }]
                    }, function (feed: any) {



                        //chrome.runtime.sendMessage({ command: 'notify party', tab: feed, activeTab: selectedTab }, function (response) {
                           
                            chrome.runtime.sendMessage({ command: 'tabs:connect', tab: feed, activeTab: selectedTab, notify: true }, function (response) {
                                 
                                window.close();
                            });
                       // });









                        //chrome.runtime.sendMessage({ command: 'tab create', tab: feed, activeTab: selectedTab }, function (response) {
                        //    window.close();
                        //});
                        window.close();
                    }, function (error: any) { console.log(error) });
                }
                try {
                } catch (e) { console.log(e) }
            });
        }




        $scope.EditSettings = {};
        $scope.ConfigureSubscription = function (item) {
            var d = localStorage.getItem('TABCONF' + item._id);
            if (d !== null)
                d = JSON.parse(d);
            else {
                if (typeof (item.Configuration) == 'string') {
                    item.Configuration = JSON.parse(item.Configuration);
                }
                d = item.Configuration;
            }
            $scope.EditSettings = d;
        };
        $scope.ConfigureGroup = function (item) {


            if (typeof (item.Configuration) == 'string') {
                item.Configuration = JSON.parse(item.Configuration);
            }
            if (item.Configuration !== undefined) {
                $scope.CurrentEditTab = item;
                $scope.EditSettings = item.Configuration;
            }
        };
        $scope.PersistConfiguration = function () {
            localStorage.setItem('TAB' + $scope.EditSettings._id, JSON.stringify($scope.EditSettings));
        }
        $scope.PersistGroupConfiguration = function () {
            //var tabsRes = $resource(apiUrl + '/tabs/tabsconfiguration');
            var tabsResource = $resource(apiUrl + '/tabs/tabs', null, { 'update': { method: 'PUT' } });

            localStorage.setItem('TABCONF' + $scope.EditSettings._id, JSON.stringify($scope.EditSettings));

            $scope.CurrentEditTab.Configuration = $scope.EditSettings;

            tabsResource.update({
                '_id': $scope.CurrentEditTab._id,
                // 'Name': $scope.EditSettings.Name,
                // 'Description': $scope.EditSettings.Description,
                //'Image': $scope.EditSettings.Image,
                'Configuration': $scope.EditSettings

            }, function (data: any) {


            }, function (error: any) { console.log(error) });


            //tabsRes.save({ 'Configuration': JSON.stringify($scope.EditSettings) }, function () {
            //})
        }



        $scope.MyGroupsCutomFilter = function (userId: any, term: string, mygroup: boolean) {
            if (term)
                term = term.toLowerCase();


            return function (item: any) {
                if (mygroup) {
                    if (item.UserId !== userId)
                        return false;
                    if (term) {
                        return (item.Name.toLowerCase().indexOf(term) > -1);
                    }
                } else {
                    if (term) {
                        return (item.Name.toLowerCase().indexOf(term) > -1);
                    }
                }
                return true;
            }
        }
    })





    .directive('bootstrapSwitch', [
        function (gettextCatalog: any) {
            return {
                restrict: 'A',
                require: '?ngModel',
                scope: {
                    ontext: '@',
                    offtext: '@',
                },
                link: function (scope: any, element: any, attrs: any, ngModel: any, gettextCatalog: any) {
                    element.bootstrapSwitch();
                    element.on('switchChange.bootstrapSwitch', function (event: any, state: any) {
                        if (ngModel) {
                            scope.$apply(function () {
                                ngModel.$setViewValue(state);
                            });
                        }
                    });
                    scope.$watch(attrs.ngModel, function (newValue: boolean, oldValue: boolean) {
                        if (newValue) {
                            element.bootstrapSwitch('state', true, true);
                        } else {
                            element.bootstrapSwitch('state', false, true);
                        }
                    });
                }
            };
        }
    ]);






document.addEventListener('DOMContentLoaded', function () {


    if (chrome.tabs === undefined)
        return;

    getGo();
    chrome.tabs.query({
        active: true,               // Select active tabs
        lastFocusedWindow: true     // In the current window
    }, function (array_of_Tabs) {
        // Since there can only be one active tab in one active window, 
        //  the array has only one element
        var tab = array_of_Tabs[0];
        //chrome.runtime.sendMessage({ command: 'get', tab: tab }, function (response) {
        //});
    });
});

function getGo() {
    chrome.runtime.sendMessage({ command: 'get tabs' }, function (response) {

        var arr: any = [];
        if (typeof (response) !== 'undefined') {
            for (var x in response.result)
                arr.push(response.result[x]);
        }


        setTimeout(function () {
            var $scope = (angular.element('#JuntasCtrl').scope() as juntas.popupScope);
            $scope.Feeds = arr;
        }, 1000);

    });
    chrome.runtime.sendMessage({ command: 'juntastabs' }, function (response) {
        setTimeout(function () {
            (angular.element('#JuntasCtrl').scope() as juntas.popupScope).JuntasTabs = response;
        }, 1000);
    });
}
function isNullOrEmpty(str: string) {
    return (str === '') || (str === undefined) || (str === null);
}
function objectsToArray(data: any) {
    var resarray: any = [];
    for (var i in data)
        resarray.push(data[i]);
    return resarray;
}