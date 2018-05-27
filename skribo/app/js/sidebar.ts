var moment = moment;


var globalLanguage = 'en';
var Followers: any = {};
var userIntercation: boolean = false;
var tabVisibilityState: string = 'hidden';


let juntasSide = {

    SidebarMode: {
        'conversation': 0,
        'navigation': 1,
        'followers': 2

    },
    SidebarUiMode: {
        'expand': 0,
        'collapse': 1,
        'float': 2

    }
}
var apiUrl = "https://www.juntason.com";

chrome.storage.sync.get({
    juntas_server: 'https://www.juntason.com'
} as any, function (items: any) {
    apiUrl = items.juntas_server;
});


if (!String.linkify) {
    String.prototype.linkify = function () {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
            .replace(urlPattern, `<a href='$&' target='_blank'>$&</a>`)
            .replace(pseudoUrlPattern, `$1<a href='http://$2' target='_blank'>$2</a>`)
            .replace(emailAddressPattern, `<a href='mailto:$&' target='_blank'>$&</a>`);
    };
}


angular.module('JuntasApp', ['JuntasGames', 'naif.base64', 'ui.bootstrap', 'ngResource', 'ngclipboard', 'dialogs.main', 'gettext', 'JuntasLanguages', 'ngSanitize'])
    .config(['$compileProvider', function ($compileProvider: ng.ICompileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);

    }]).run(function (gettextCatalog: any, $Language: juntas.ILanguageService) {
        chrome.runtime.sendMessage({ command: 'tabs:data' }, function (response) {

             
            gettextCatalog.setCurrentLanguage($Language.getCurrent(response.result._id).code);
            gettextCatalog.debug = true;
        });
    })
    .controller('JuntassidebarCtrl', function ($scope: juntas.sideBarScope, $timeout: ng.ITimeoutService, $resource: any, $filter: any, $Config: any, dialogs: any, gettextCatalog: any, $Language: juntas.ILanguageService) {
        $scope.$filter = $filter;
        $scope.$Config = $Config;
        $scope.ThemeSet = false;
        $scope.Feeds = [];
        $scope.UserInput = {};
        $scope.UImode = '';
        $scope.PageUrl = '';
        $scope.ShareUrl = '';
        $scope.EditSettings = {};
        $scope.LoaderState = { 'save_configuration': false };

        $scope.Games = [{ 'name': 'pong', 'thumb': '../games/pong/slide.png' }];
        $scope.LoadGame = function (game) {
            chrome.runtime.sendMessage({ command: 'pop game', game: game.name }, function (response) {
            });
        }

        document.onreadystatechange = (e) => {
            chrome.runtime.onMessage.addListener(
                (request, sender, sendResponse) => {
                    switch (request.command) {
                        case 'user is typing':
                            $scope.Followers.map((item) => {
                                item.isTyping = request.data[item._id];
                            });
                            break;
                        case 'focus':

                            window.focus();
                            break;
                        case 'comment_added':
                            $scope.$apply(function () {

                                $scope.Comments.push(request.data.commentObject.comment);
                            });


                            if (isHidden()) {

                                chrome.runtime.sendMessage({ command: 'spawnNotification', msg: request.data });
                            }

                            angular.element('#JuntasCtrl').scope().$apply();
                            var timeout = $timeout(() => {
                                document.getElementById('chatscroll').scrollTop = document.getElementById('chatscroll').scrollHeight + 300;
                                document.getElementById('chatscrollItem').scrollTop = document.getElementById('chatscrollItem').scrollHeight + 600;

                            }, 500);



                            chrome.runtime.sendMessage({ command: 'drawAttention' }, function (response) { });




                            break;
                        case 'video_offer':
                            try {
                                window.webrtc_offer_recieved(request.data);
                            } catch (e) { }
                            break;
                        case 'video_offer_accepted':

                            try {
                                window.webrtc_offer_accepted(request.data);

                            } catch (e) { }
                            break;
                        case 'ice_candidate':
                            try {
                                window.ice_candidate_accepted(request.data);
                            } catch (e) { }
                            break;
                        case 'update_user_states':
                            try {
                                Followers = request.data;
                                angular.element('#JuntasCtrl').scope().$apply();
                            } catch (e) { }
                            break;
                        case 'show annotations':


                            $scope.$apply(function () {

                                $scope.ActiveFeedInformation.Annotations = request.annotations.annotations;
                            });
                            break;


                        case 'game_data':
                            try {

                                Followers = request.data;
                                angular.element('#JuntasCtrl').scope().$apply();
                            } catch (e) { }
                            break;

                        case 'tabs:navigate':
                            try {
                                $scope.init();
                                $scope.History = request.data.History;
                                (angular.element('#JuntasCtrl').scope() as juntas.sideBarScope).SetActiveFeedItem(request.data.url);
                                angular.element('#JuntasCtrl').scope().$apply();
                            } catch (e) { }
                            break;

                    }


                    //return;
                });

        }


        $scope.onCopySuccess = function (element: any) {

            // element.trigger.setAttribute('class', 'btn tooltipped tooltipped-s');
            // element.trigger.setAttribute('aria-label', 'good');
            ($(element.trigger) as any).tooltip('show');
            $timeout(function () {
                ($(element.trigger) as any).tooltip('hide');
            }, 3000);


        }

        var user: any = localStorage.getItem('juntasuser');
        if (user !== null && user != 'null') {
            user = JSON.parse(user);
            $scope.notLogedIn = false;
        }
        else {
            $scope.notLogedIn = true;
        }
        $scope.User = user;
        if (user == null) {
            $scope.notLogedIn = true;
        }

        $scope.Themes = ['amelia', 'blooming', 'cerulean', 'cyborg', 'desert', 'flat', 'green', 'journal', 'Liquorice Schnitzel', 'Lumen', 'paper', 'readable', 'Rouge', 'simplex', 'spacelab', 'superhero', 'United'];
        $scope.Languages = $Language.Languages;


        $scope.$watch('Theme', function (theme_name: string, oldVal: string) {
            if (theme_name !== undefined) {
                var theme = '../css/themes/' + theme_name + '/bootstrap.min.css';
                $(`link[id='mainthemefile']`).attr('href', theme);
                $timeout(function () {
                    $scope.ThemeSet = true;
                })
                var key = 'TABCONF' + $scope.ActiveFeedInformation._id;
                var tabconfStr = localStorage.getItem(key);
                var tabconf: any;
                if (tabconfStr !== null) {
                    tabconf = JSON.parse(tabconfStr);
                    tabconf.Theme = theme_name;
                }
                else {
                    tabconf = { 'Theme': theme_name }
                }

                localStorage.setItem(key, JSON.stringify(tabconf));
            }
        });



        $scope.popVideo = function () {
            chrome.runtime.sendMessage({ command: 'pop video' }, function (response) { });
        }
        $scope.lastCount = 0;
        $scope.disconnectTab = function () {
            chrome.runtime.sendMessage({ command: 'disconnect tab' }, function (response) { });


        }



        $scope.$watch('InterfaceLanguage', function (language: juntas.ILanguage, oldVal: juntas.ILanguage) {
            if (language !== undefined && language !== null) {
                $Language.setLanguage(language, $scope.ActiveFeedInformation._id);
            }
        });



        $scope.SaveConfiguration = function () {
             
            $scope.LoaderState['save_configuration'] = true;
            var tabsResource = $resource(apiUrl + '/tabs/tabs', null, { 'update': { method: 'PUT' } });
           
            var configuration = {
                'Theme': $scope.Theme,
                'Discovery': $scope.EditSettings.Discovery,
                'Rating': $scope.EditSettings.Rating,
                'AllowPop': $scope.EditSettings.AllowPop,
                'Language': fp.maybe($scope.InterfaceLanguage).id
            };

            localStorage.setItem('TABCONF' + $scope.ActiveFeedInformation._id, JSON.stringify(configuration));

            $Language.setLanguage($Language.getCurrent($scope.ActiveFeedInformation._id), $scope.ActiveFeedInformation._id);
            var tabData = {
                '_id': $scope.ActiveFeedInformation._id,
                'Name': $scope.ActiveFeedInformation.Name,
                'Description': $scope.ActiveFeedInformation.Description,
                'Image': $scope.ActiveFeedInformation.Image,
                'Configuration': configuration,

            }

            chrome.runtime.sendMessage({ command: 'save tab configuration', configuration: tabData }, function (response) {


            });
            //tabsResource.update({
            //    '_id': $scope.ActiveFeedInformation._id,
            //    'Name': $scope.ActiveFeedInformation.Name,
            //    'Description': $scope.ActiveFeedInformation.Description,
            //    'Image': $scope.ActiveFeedInformation.Image,
            //    'Configuration': configuration,

            //}, function (data: any) {
            //    $scope.LoaderState['save_configuration'] = false;

            //}, function (error: any) {
            //    $scope.LoaderState['save_configuration'] = false;
            //    console.log(error);
            //});

        }

        $scope.CopyToClip = function () {
            var body: any = document.body;
            if (body.createControlRange) {
                var htmlContent = document.getElementById('ShareUrl');
                var controlRange: any;
                var range = body.createTextRange();
                range.moveToElementText(htmlContent);
                //Uncomment the next line if you don't want the text in the div to be selected
                range.select();
                controlRange = body.createControlRange();
                controlRange.addElement(htmlContent);
                //This line will copy the formatted text to the clipboard
                controlRange.execCommand('Copy');
                alert('Your HTML has been copied\n\r\n\rGo to Word and press Ctrl+V');
            }
        }
        $scope.FeedActive = false;
        $scope.ActiveFeedInformation = false;




        $scope.toggleCaptureNavigation = function () {

            var confKey = 'TABCONF' + $scope.ActiveFeedInformation._id;
            var confStr = localStorage.getItem(confKey);
            var conf: any;
            if (confStr !== null)
                conf = JSON.parse(confStr);

            if (conf.CaptureNavigation) {
                conf.CaptureNavigation = false;
                chrome.runtime.sendMessage({ command: 'navigation capture off' }, function (response) { });

            } else {
                conf.CaptureNavigation = true;
                chrome.runtime.sendMessage({ command: 'navigation capture on' }, function (response) { });
            }

            $scope.ActiveFeedInformation.Configuration.CaptureNavigation = conf.CaptureNavigation;
            //persist configuration
            localStorage.setItem(confKey, JSON.stringify(conf));

        }


        $scope.toggleAnnotations = function () {

            var confKey = 'TABCONF' + $scope.ActiveFeedInformation._id;
            var confStr = localStorage.getItem(confKey);
            var conf: any;
            if (confStr !== null)
                conf = JSON.parse(confStr);



            if (conf.Annotate) {
                conf.Annotate = false;
                return chrome.runtime.sendMessage({ command: 'show loader' }, function (response) {
                    return chrome.runtime.sendMessage({ command: 'hide annotations' }, function (response) {
                        return chrome.runtime.sendMessage({ command: 'hide loader' }, function (response) {
                        });
                    });
                });
            } else {

                conf.Annotate = true;
                chrome.runtime.sendMessage({ command: 'show loader' }, function (response) {
                    chrome.runtime.sendMessage({ command: 'load public annotations' }, function (response) {
                        chrome.runtime.sendMessage({ command: 'hide loader' }, function (response) { });
                    });
                });
            }



            $scope.ActiveFeedInformation.Configuration.Annotate = conf.Annotate;
            //persist configuration
            localStorage.setItem(confKey, JSON.stringify(conf));

        }



        $scope.togglecollapse = function () {
            if (!$scope.SidebarCollapseMode || $scope.SidebarCollapseMode === juntasSide.SidebarUiMode.expand.toString())
                $scope.SidebarCollapseMode = juntasSide.SidebarUiMode.collapse.toString();
            else
                $scope.SidebarCollapseMode = juntasSide.SidebarUiMode.expand.toString();

            chrome.runtime.sendMessage({ command: 'collapse sidebar', operation: $scope.SidebarCollapseMode }, function (response) { });
        }
        $scope.activeHistoryElement = null;




        $scope.init = function () {
            $scope.HeaderTimeOut = false;
            $timeout(function () {
                $scope.HeaderTimeOut = true;


                // document.getElementById('navigationscroll').scrollTop = document.getElementById('navigationscroll').scrollHeight + 300;

            }, 3000);






            $scope.SidebarMode = juntasSide.SidebarMode.navigation;


            if (localStorage.getItem('SidebarMode') !== null)
                $scope.SidebarMode = localStorage.getItem('SidebarMode');
            $scope.$watch('SidebarMode', function (newVal, oldVal) {
                localStorage.setItem('SidebarMode', $scope.SidebarMode.toString());
            }, true);


            $scope.SidebarCollapseMode = juntasSide.SidebarUiMode.expand.toString();
            if (localStorage.getItem('SidebarCollapseMode') !== null)
                $scope.SidebarCollapseMode = JSON.parse(localStorage.getItem('SidebarCollapseMode'));



            ////$scope.SidebarUiMode = '1';

            if ($scope.SidebarCollapseMode == juntasSide.SidebarUiMode.collapse.toString())
                chrome.runtime.sendMessage({ command: 'collapse sidebar', operation: juntasSide.SidebarUiMode.collapse }, function (response) { });

            $scope.$watch('SidebarCollapseMode', function (newVal, oldVal) {
                localStorage.setItem('SidebarCollapseMode', $scope.SidebarCollapseMode.toString());
            });


            chrome.runtime.sendMessage({ command: 'tabs:data' }, function (response) {
                $scope.FeedActive = false;
                var tabconfStr = localStorage.getItem('TABCONF' + response.result._id);
                var theme: string;
                var tabconf: any;
                if (tabconfStr !== null) {
                    tabconf = JSON.parse(tabconfStr);
                    for (var key in tabconf) {
                        response.result.Configuration[key] = tabconf[key];

                    }


                    theme = tabconf.Theme;
                }
                else
                    theme = localStorage.getItem('theme');

                if (theme !== null && theme !== undefined) {
                    $scope.Theme = theme;
                }
                else {
                    $scope.Theme = 'paper';
                }

                 
                if (response.result.load) {
                    chrome.runtime.sendMessage({ command: 'fill data', 'tabid': response.result._id }, function (result) {
                    });
                    //$timeout($scope.pump, 2000);
                    return true;
                }
                else {
                    $scope.construct(response);
                }
            });
            return true;
        }
        $scope.scrollToUrl = function () {
            $timeout(function () {

                var $container = $('#navigationscroll');
                var $scrollTo = $('.list-group-item-success');

                if (scrollTo !== null)
                    $container.animate({ scrollTop: $scrollTo.offset().top - ($container.offset().top + 100), scrollLeft: 0 }, 300);
                else
                    $container.animate({ scrollTop: $container.height, scrollLeft: 0 }, 300);
            }, 1000);
        }
        $scope.construct = function (response) {

            if (response.result !== null)
                $scope.FeedActive = true;
            $scope.ActiveFeedInformation = response.result;
             

            $scope.EditSettings = response.result.Configuration;
            $scope.InterfaceLanguage = $Language.getCurrent($scope.ActiveFeedInformation._id);
            localStorage.setItem('TAB' + response.result._id, JSON.stringify(response.result));
            $Config.ready(function () {
                $scope.ShareUrl = apiUrl + '/juntify/share?j=' + response.result._id + '&u=' + $scope.User._id;
            });
            if ($scope.Comments === undefined) {
                $scope.Comments = response.result.Comments;
            }

            if ($scope.History === undefined) {
                $scope.History = response.result.History;
            }

            Followers = response.result.Followers;
            $scope.Followers = [];
            for (var key in Followers) {
                $scope.Followers.push(Followers[key]);
            }
            $scope.ActiveFeedInformation.Manager = Followers[$scope.ActiveFeedInformation.UserId];
            var lastUrl = '';
            $scope.CheckComplete = true;
            // $timeout($scope.pump, 1000);
            //$timeout($scope.onlineUsers, 1000);
        }




        $scope.PopUrl = function (item, newwindow) {
            if (!newwindow)
                chrome.runtime.sendMessage({ command: 'pop url', 'url': item.Url }, function (response) { });
            else
                window.open(item.Url);
        }
        $scope.Like = function (item) {

            chrome.runtime.sendMessage({
                command: 'like url',
                'hash': item.hash
            }, function (response) { });
        }
        $scope.DeleteHistory = function (item) {
            var translate1 = gettextCatalog.getString('Remove item');
            var translate2 = gettextCatalog.getString('this will remove');
            dialogs.confirm(translate1, translate2, {}).result.then(
                function () {
                    chrome.runtime.sendMessage({ command: 'delete history', '_id': item._id }, function (response) { });
                }, function () { }
            );
        }


        $scope.onlineUsers = function () {
            var juntascontactsonline = localStorage.getItem('juntascontactsonline');
            if (juntascontactsonline !== null)
                juntascontactsonline = JSON.parse(juntascontactsonline);
            //var onlineUsersRes =  $resource(apiUrl + '/monitor/room');
            //onlineUsersRes.get({ tabid: $scope.ActiveFeedInformation._id}, function (data: any) {
            if (juntascontactsonline) {
                for (var i = 0; i < $scope.Followers.length; i++) {

                    if (juntascontactsonline.indexOf($scope.Followers[i]._id) > -1) {
                        $scope.Followers[i].online = true;
                    }
                    else {
                        $scope.Followers[i].online = false;
                    }
                }


            }
            //});
            $timeout($scope.onlineUsers, 20 * 1000);
        }

        $scope.spawnNotification = function (theBody: string, theIcon: string, theTitle: string, tabId: number, callback: Function = undefined) {
            var options = {
                body: theBody,
                icon: theIcon
            }
            var n = new Notification(theTitle, options);

            if (callback) {
                n.onclick = (x: any) => {

                    chrome.tabs.update(tabId, { highlighted: true });
                    n.close();

                    chrome.tabs.executeScript(tabId, { code: 'document.title = document.orgtitle;window.focus();' });
                    if (callback) {
                        callback(tabId);
                    }

                };
            }
            if (!callback) {

                setTimeout(n.close.bind(n), 4000);
            }

        }
        function getHiddenProp() {
            var prefixes = ['webkit', 'moz', 'ms', 'o'];

            // if 'hidden' is natively supported just return it
            if ('hidden' in document) return 'hidden';

            // otherwise loop over all the known prefixes until we find one
            for (var i = 0; i < prefixes.length; i++) {
                if ((prefixes[i] + 'Hidden') in document)
                    return prefixes[i] + 'Hidden';
            }

            // otherwise it's not supported
            return null;
        }

        function isHidden() {
            var prop = getHiddenProp();
            if (!prop) return false;

            return (document as any)[prop];
        }


        $scope.commentedItem = null;

        $scope.comment = function (commentedItem: any) {
            $scope.commentedItem = commentedItem;


        }


        $scope.pump = function () {

            //chrome.runtime.sendMessage({ command: 'get isdirty' }, function (response) {

            //    if (response.messages) {
            //        for (var i = 0; i < response.messages.length; i++) {
            //            var msg = response.messages[i];
            //            if (msg.type) {
            //                switch (msg.type) {
            //                    case 'focus':

            //                        window.focus();
            //                        break;
            //                    case 'comment_added':
            //                        $scope.$apply(function () {
            //                            $scope.Comments.push(msg.commentObject.comment);
            //                        });


            //                        if (isHidden()) {

            //                            chrome.runtime.sendMessage({ command: 'spawnNotification', msg: msg });
            //                        }

            //                        angular.element('#JuntasCtrl').scope().$apply();
            //                        var timeout = $timeout(() => {
            //                            document.getElementById('chatscroll').scrollTop = document.getElementById('chatscroll').scrollHeight + 300;
            //                            document.getElementById('chatscrollItem').scrollTop = document.getElementById('chatscrollItem').scrollHeight + 600;

            //                        }, 500);



            //                        chrome.runtime.sendMessage({ command: 'drawAttention' }, function (response) { });




            //                        break;
            //                    case 'video_offer':
            //                        try {
            //                            window.webrtc_offer_recieved(msg.data);
            //                        } catch (e) { }
            //                        break;
            //                    case 'video_offer_accepted':

            //                        try {
            //                            window.webrtc_offer_accepted(msg.data);

            //                        } catch (e) { }
            //                        break;
            //                    case 'ice_candidate':
            //                        try {
            //                            window.ice_candidate_accepted(msg.data);
            //                        } catch (e) { }
            //                        break;
            //                    case 'update_user_states':
            //                        try {
            //                            Followers = msg.data;
            //                            angular.element('#JuntasCtrl').scope().$apply();
            //                        } catch (e) { }
            //                        break;



            //                    case 'game_data':
            //                        try {

            //                            Followers = msg.data;
            //                            angular.element('#JuntasCtrl').scope().$apply();
            //                        } catch (e) { }
            //                        break;



            //                }


            //                //return;
            //            }

            //        }



            //    }



            //    (angular.element('#JuntasCtrl').scope() as juntas.sideBarScope).SetActiveFeedItem(response.url);//.PageUrl = 
            //    if (response.smalldirty) {


            //        for (var i = 0; i < $scope.Followers.length; i++) {
            //            $scope.Followers[i].isTyping = response.tab.Followers[$scope.Followers[i]._id];

            //        }

            //        for (var i = 0; i < $scope.Followers.length; i++) {
            //            $scope.Followers[i].isTyping = response.tab.Followers[$scope.Followers[i]._id];

            //        }



            //    }
            //    if (response.result) {
            //        // scroll to active
            //        $scope.init();

            //        $scope.History = response.tab.History;
            //        //if(response.tab.reloads!== undefined)
            //        //{
            //        //    var d = new Date();
            //        //    for(var x =0;x < response.tab.reloads.length;x++)
            //        //        for (var i = 0; i < $scope.History.length; i++) {
            //        //            if ($scope.History[i].Thumb == response.tab.reloads[x]){
            //        //                $scope.History[i].Thumb = $scope.History[i].Thumb + '?' + d.getTime();
            //        //                $scope.$apply($scope.History);
            //        //            }
            //        //            //$('img[src='http://juntas.zapto.org/slide_images/' + response.tab.reloads[i] + '']').src = 'http://juntas.zapto.org/slide_images/' + response.tab.reloads[i] +'?'+d.getTime();
            //        //        }
            //        //}
            //        angular.element('#JuntasCtrl').scope().$apply();

            //        if (!userIntercation) {


            //            $timeout.cancel(timeout);
            //            var timeout = $timeout(() => {


            //                document.getElementById('chatscroll').scrollTop = document.getElementById('chatscroll').scrollHeight + 300;
            //                document.getElementById('chatscrollItem').scrollTop = document.getElementById('chatscrollItem').scrollHeight + 600;


            //                // document.getElementById('navigationscroll').scrollTop = document.getElementById('navigationscroll').scrollHeight + 300;
            //            }, 500);
            //        }
            //    }

            //    //$timeout($scope.pump, 1000);
            //});
        }

        $scope.SetActiveFeedItem = function (url: string) {
            if ($scope.PageUrl !== url) {

                $scope.PageUrl = url;
                for (var i = 0; i < $scope.ActiveFeedInformation.History.length; i++) {
                    if (url === $scope.ActiveFeedInformation.History[i].Url)
                        $scope.ActiveFeedInformation.ActivePage = $scope.ActiveFeedInformation.History[i];

                }

                $timeout(function () {
                    var $container = $('#navigationscroll');
                    var $scrollTo = $('.list-group-item-success');

                    //console.debug('$scrollTo.index()', $scrollTo.index());

                    if ($scrollTo.length > 0) {
                        //console.debug('$container.offset().top', $container.offset().top);
                        //console.debug('$scrollTo.offset().top', $scrollTo.offset().top);
                        $container.animate({ scrollTop: $scrollTo.offset().top - ($container.offset().top + 100), scrollLeft: 0 }, 300);

                    }
                    else {
                        console.debug('$container.height', $container.height);

                        $container.animate({ scrollTop: $container.height, scrollLeft: 0 }, 300);

                    }
                }, 2000);
            }
        }
        $scope.historyIndex = 0;
        $scope.loadHistory = function () {
            $scope.historyIndex--;

            chrome.runtime.sendMessage({
                command: 'load history',
                message: $scope.historyIndex,

            }, function (response: any) {


                $scope.History = $scope.History.concat(response.result.History);
            });



        }

        $scope.Post = function () {

            if ($scope.UserInput.Message !== undefined && $scope.UserInput.Message !== null && $scope.UserInput.Message !== '') {
                chrome.runtime.sendMessage({
                    command: 'post message',
                    message: $scope.UserInput.Message,
                    item: $scope.commentedItem
                }, function (response) {
                    $scope.UserInput.Message = '';
                    $scope.User.isTyping = false;
                    // $scope.init();
                    //initChat();
                });
            }
        }
        $scope.PopMembers = function () {
            chrome.runtime.sendMessage({ command: 'pop member', tabid: $scope.ActiveFeedInformation._id, userid: $scope.User._id }, function (response) {
                // $scope.UserInput.Message = '';
                // $scope.init();
            });
        }
    })
    .directive('myEnter', function () {
        return function (scope: ng.IScope, element: any, attrs: any) {
            element.bind('keydown keypress', function (event: any) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    })
    .directive('setHeight', function ($window) {
        return {
            link: function (scope: any, element: any, attrs: any) {

                var navVisible = attrs.setHeight;
                $(element).height($(window).height() - navVisible);
                // $('.content-scroll-item').height($(window).height() - (navVisible + 270));
                window.onresize = function () {
                    $(element).height($(window).height() - navVisible);
                    // $('.content-scroll-item').height($(window).height() - (navVisible + 270));
                }


                // element.css('height', attrs.setHeight + 'px');
                //element.height($window.innerHeight/3);
            }
        }
    })
    .filter('displaydate', function () {
        return function (input: any) {
            var m = moment(input);
            return m.locale(globalLanguage).calendar();
        };
    })
    .directive('rtcVideo', function () {
        return {
            restrict: 'EA',
            template: `<video id='video1' autoplay muted></video><video id='video2' autoplay muted></video>
            <a id='startButton' ng-click='setup_video();' class='btn btn-primary btn-sm'>start</a>
            <a class='btn btn- primary btn-sm' id= 'callButton' ng-click='start_video(true)'>call</a>
            <a id='hangupButton' class='btn btn- primary btn-sm'>hangup</a> `,




            link: function (scope, element, attr) {




            },
            controller: function ($scope: any) {
                var peerConnection: RTCPeerConnection;
                var peerConnectionConfig: any = { 'iceServers': [{ 'url': 'stun:stun.services.mozilla.com' }, { 'url': 'stun:stun.l.google.com:19302' }] };
                var startButton: any = document.getElementById('startButton');
                var callButton: any = document.getElementById('callButton');
                var hangupButton: any = document.getElementById('hangupButton');
                callButton.disabled = true;
                hangupButton.disabled = true;
                //startButton.onclick = start;
                //callButton.onclick = call;
                //hangupButton.onclick = hangup;

                //$scope.video_start = start;
                //$scope.video_call.onclick = start(true);
                var video1: any = document.querySelector('video#video1');
                var video2: any = document.querySelector('video#video2');


                var localVideo: any = document.querySelector('video#video1');
                var remoteVideo: any = document.querySelector('video#video2');


                var constraints = {
                    video: true,
                    audio: true,
                };
                $scope.setup_video = function () {
                    if (navigator.getUserMedia) {
                        navigator.getUserMedia(constraints, function (stream: any) {
                            window.localStream = stream;
                            localVideo.src = window.URL.createObjectURL(stream);
                        }, errorHandler);
                    } else {
                        alert('Your browser does not support getUserMedia API');
                    }




                }


               

                 
              

               

  

                function gotRemoteStream(event: any) {

                    remoteVideo.src = window.URL.createObjectURL(event.stream);
                }



                function errorHandler(error: any) {
                    console.log(error);
                }










































            }
        };
    })
    .directive('imageResize', function () {
        return {
            restrict: 'EA',
            scope: { imageData: '=' },
            template: `<div class='component'><div class='overlay'><div class='overlay-inner'></div></div>
                       <img class='resize-image'  id='imagetoresize' ng-src='data:{{imageData.filetype}};base64,{{imageData.base64}}' alt='image for resizing'>
                       <button class='btn-crop js-crop'>Crop<img class='icon-crop' src='../js/imageresizer/img/crop.svg'></button>
                        </div> `,
            link: function (scope: any, element: any, attr: any) {

                // ng-if='imageData !== undefined'
                var resizeableImage = function (image_target: any) {
                    // Some variable and settings
                    var $container: any,
                        orig_src = new Image(),
                        image_target: any = (angular.element(element.children()[0]) as any).children()[1],
                        event_state: any = {},
                        constrain = false,
                        min_width = 300, // Change as required
                        min_height = 100,
                        max_width = 300, // Change as required
                        max_height = 900,
                        resize_canvas = document.createElement('canvas');

                    var init = function () {

                        // When resizing, we will always use this copy of the original as the base
                        orig_src.src = 'data:' + (scope as any).imageData.filetype + ';base64,' + (scope as any).imageData.base64;

                        //image_target.src;

                        // Wrap the image with the container and add resize handles
                        $(image_target).wrap(`<div class='resize-container'></div>`)
                            .before(`<span class='resize-handle resize-handle-nw'></span>`)
                            .before(`<span class='resize-handle resize-handle-ne'></span>`)
                            .after(`<span class='resize-handle resize-handle-se'></span>`)
                            .after(`<span class='resize-handle resize-handle-sw'></span>`);

                        // Assign the container to a variable
                        $container = $(image_target).parent('.resize-container');

                        // Add events
                        $container.on('mousedown touchstart', '.resize-handle', startResize);
                        $container.on('mousedown touchstart', 'img', startMoving);
                        $('.js-crop').on('click', crop);


                        var myimage = document.getElementById('imagetoresize');
                        if (myimage.addEventListener) {

                            // IE9, Chrome, Safari, Opera
                            myimage.addEventListener('mousewheel', MouseWheelHandler, false);
                            // Firefox
                            myimage.addEventListener('DOMMouseScroll', MouseWheelHandler, false);
                        }
                        // IE 6/7/8
                        //else myimage.attachEvent('onmousewheel', MouseWheelHandler);



                    };

                    var MouseWheelHandler = function () {

                        // cross-browser wheel delta
                        var e: any = window.event || e; // old IE support
                        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                        var height: number, width: number, left: number, top: number;


                        width = event_state.container_width - 10;
                        height = event_state.container_height - 10;
                        left = event_state.container_left + 10;
                        top = event_state.container_top + 10;


                        // Optionally maintain aspect ratio
                        if (constrain || e.shiftKey) {
                            height = width / orig_src.width * orig_src.height;
                        }
                        //&& width < max_width && height < max_height

                        if (width > min_width && height > min_height) {

                            // To improve performance you might limit how often resizeImage() is called
                            resizeImage(width, height);
                            // Without this Firefox will not re-calculate the the image dimensions until drag end
                            $container.offset({ 'left': left, 'top': top });
                        }



                    }
                    var startResize = function (e: any) {
                        e.preventDefault();
                        e.stopPropagation();
                        saveEventState(e);
                        $(document).on('mousemove touchmove', resizing);
                        $(document).on('mouseup touchend', endResize);
                    };

                    var endResize = function (e: any) {
                        e.preventDefault();
                        $(document).off('mouseup touchend', endResize);
                        $(document).off('mousemove touchmove', resizing);
                    };

                    var saveEventState = function (e: any) {
                        // Save the initial event details and container state
                        event_state.container_width = $container.width();
                        event_state.container_height = $container.height();
                        event_state.container_left = $container.offset().left;
                        event_state.container_top = $container.offset().top;
                        event_state.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
                        event_state.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

                        // This is a fix for mobile safari
                        // For some reason it does not allow a direct copy of the touches property
                        if (typeof e.originalEvent.touches !== 'undefined') {
                            event_state.touches = [];
                            $.each(e.originalEvent.touches, function (i, ob) {
                                event_state.touches[i] = {};
                                event_state.touches[i].clientX = 0 + ob.clientX;
                                event_state.touches[i].clientY = 0 + ob.clientY;
                            });
                        }
                        event_state.evnt = e;
                    };

                    var resizing = function (e: any) {
                        var mouse: any = {}, width: number, height: number, left: number, top: number, offset = $container.offset();
                        mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
                        mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

                        // Position image differently depending on the corner dragged and constraints
                        if ($(event_state.evnt.target).hasClass('resize-handle-se')) {
                            width = mouse.x - event_state.container_left;
                            height = mouse.y - event_state.container_top;
                            left = event_state.container_left;
                            top = event_state.container_top;
                        } else if ($(event_state.evnt.target).hasClass('resize-handle-sw')) {
                            width = event_state.container_width - (mouse.x - event_state.container_left);
                            height = mouse.y - event_state.container_top;
                            left = mouse.x;
                            top = event_state.container_top;
                        } else if ($(event_state.evnt.target).hasClass('resize-handle-nw')) {
                            width = event_state.container_width - (mouse.x - event_state.container_left);
                            height = event_state.container_height - (mouse.y - event_state.container_top);
                            left = mouse.x;
                            top = mouse.y;
                            if (constrain || e.shiftKey) {
                                top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
                            }
                        } else if ($(event_state.evnt.target).hasClass('resize-handle-ne')) {
                            width = mouse.x - event_state.container_left;
                            height = event_state.container_height - (mouse.y - event_state.container_top);
                            left = event_state.container_left;
                            top = mouse.y;
                            if (constrain || e.shiftKey) {
                                top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
                            }
                        }

                        // Optionally maintain aspect ratio
                        if (constrain || e.shiftKey) {
                            height = width / orig_src.width * orig_src.height;
                        }

                        if (width > min_width && height > min_height && width < max_width && height < max_height) {
                            // To improve performance you might limit how often resizeImage() is called
                            resizeImage(width, height);
                            // Without this Firefox will not re-calculate the the image dimensions until drag end
                            $container.offset({ 'left': left, 'top': top });
                        }
                    }

                    var resizeImage = function (width: number, height: number) {
                        resize_canvas.width = width;
                        resize_canvas.height = height;

                        resize_canvas.getContext('2d').drawImage(orig_src, 0, 0, width, height);
                        $(image_target).attr('src', resize_canvas.toDataURL('image/png'));
                    };

                    var startMoving = function (e: any) {
                        e.preventDefault();
                        e.stopPropagation();
                        saveEventState(e);
                        $(document).on('mousemove touchmove', moving);
                        $(document).on('mouseup touchend', endMoving);
                    };

                    var endMoving = function (e: any) {
                        e.preventDefault();
                        $(document).off('mouseup touchend', endMoving);
                        $(document).off('mousemove touchmove', moving);
                    };

                    var moving = function (e: any) {
                        var mouse: any = {}, touches: any;
                        e.preventDefault();
                        e.stopPropagation();

                        touches = e.originalEvent.touches;

                        mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft();
                        mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();
                        $container.offset({
                            'left': mouse.x - (event_state.mouse_x - event_state.container_left),
                            'top': mouse.y - (event_state.mouse_y - event_state.container_top)
                        });
                        // Watch for pinch zoom gesture while moving
                        if (event_state.touches && event_state.touches.length > 1 && touches.length > 1) {
                            var width = event_state.container_width, height = event_state.container_height;
                            var a = event_state.touches[0].clientX - event_state.touches[1].clientX;
                            a = a * a;
                            var b = event_state.touches[0].clientY - event_state.touches[1].clientY;
                            b = b * b;
                            var dist1 = Math.sqrt(a + b);

                            a = e.originalEvent.touches[0].clientX - touches[1].clientX;
                            a = a * a;
                            b = e.originalEvent.touches[0].clientY - touches[1].clientY;
                            b = b * b;
                            var dist2 = Math.sqrt(a + b);

                            var ratio = dist2 / dist1;

                            width = width * ratio;
                            height = height * ratio;
                            // To improve performance you might limit how often resizeImage() is called
                            resizeImage(width, height);
                        }
                    };

                    var crop = function () {
                        //Find the part of the image that is inside the crop box
                        var crop_canvas: any,
                            left = $('.overlay').offset().left - $container.offset().left,
                            top = $('.overlay').offset().top - $container.offset().top,
                            width = $('.overlay').width(),
                            height = $('.overlay').height();

                        crop_canvas = document.createElement('canvas');
                        crop_canvas.width = width;
                        crop_canvas.height = height;

                        crop_canvas.getContext('2d').drawImage(image_target, left, top, width, height, 0, 0, width, height);
                        window.open(crop_canvas.toDataURL('image/png'));
                    }
                    init();
                };
                if (!scope.imageData) {
                    resizeableImage($('.resize-image')[0]);
                }
                //Kick everything off with the target image


            },
            controller: function ($scope: any) {

            }
        };
    })
    .directive('imageonload', ['$timeout', function ($timeout: any) {
        return {
            restrict: 'A',
            link: function (scope: any, element: any, attrs: any) {
                scope.retries = 5;
                scope.timeout = 1000;


                element.bind('load', function () {
                    element.prev().hide();
                    element.show();
                    scope.retries = 0;
                });

                element.bind('error', function () {
                    element.prev().show();
                    element.hide();
                    if (scope.retries > 0) {
                        scope.retries--;
                        $timeout(function () {
                            element[0].src = element[0].src.split('?')[0] + '?' + new Date().getTime();
                        }, scope.timeout * ((5 - scope.retries)/2));


                    }
                    // alert('image could not be loaded');
                });
            }
        };
    }])






    .filter('picture', function () {
        return function (input: any) {
            var m = Followers[input];

            if (m !== undefined && m.Picture)
                return m.Picture.data.url;
            else
                return '';

        };
    })
    .filter('properalign', function () {
        return function (input: any) {
            var code = input.charCodeAt(0);
            if (code > 1000) {
                return `<p class='rtl'>${input.linkify()}</p>`;
            }
            else {
                return `<p class='ltr'>${input.linkify()}</p>`;
            }
        };
    })
    .filter('username', function () {
        return function (input: any) {
            var m = Followers[input];
            if (m !== undefined)
                return m.FirstName + ' ' + m.LastName;
            else
                return '...';
        };
    })
    .filter('imageurl', function ($Config: any) {
        return function (input: any, folder: any) {
            if (input !== undefined && input !== null) {
                if (input.indexOf('http') > -1)
                    return input;
                else if (input.indexOf('//') == 0)
                    return 'http:' + input;
                else {

                    return apiUrl + '/' + folder + '/' + input;
                }
            }
        };
    });

var CopyToClip = function () {
    var body: any = document.body;
    if (body.createControlRange) {
        var htmlContent = document.getElementById('ShareUrl') as any;
        var controlRange: any;
        var range = (document.body as any).createTextRange();
        range.moveToElementText(htmlContent);
        //Uncomment the next line if you don't want the text in the div to be selected
        range.select();
        controlRange = body.createControlRange();
        controlRange.addElement(htmlContent);
        //This line will copy the formatted text to the clipboard
        controlRange.execCommand('Copy');
        alert('Your HTML has been copied\n\r\n\rGo to Word and press Ctrl+V');
    }
    //var clip = new ClipboardEvent('copy');
    //clip.clipboardData.setData('text/plain', 'aaaa');
    //clip.preventDefault();
    //e.target.dispatchEvent(clip);
}


function initChat() {


    var textarea = $('#chattextbox');
    //var typingStatus: any;//= $('#typing_on');
    var lastTypedTime = new Date(0); // it's 01/01/1970, actually some time in the past
    var lastSentTime = new Date(0);
    var typingDelayMillis = 5000; // how long user can 'think about his spelling' before we show 'No one is typing -blank space.' message
    var cleanRefreshStatus: any = null;

    function refreshTypingStatus() {

        if (!textarea.is(':focus') || textarea.val() == '' || new Date().getTime() - lastTypedTime.getTime() > typingDelayMillis) {
            // typingStatus.html('No one is typing -blank space.');
            if (cleanRefreshStatus !== null) {

                clearInterval(cleanRefreshStatus);
            }

        } else {

            if (new Date().getTime() - lastSentTime.getTime() > typingDelayMillis * 4) {
                lastSentTime = new Date();

                chrome.runtime.sendMessage({ command: 'user is typing' }, function (response) { });
            }


        }
    }
    function updateLastTypedTime() {
        lastTypedTime = new Date();
    }

    setInterval(refreshTypingStatus, 100);
    textarea.keypress(updateLastTypedTime);
    textarea.blur(refreshTypingStatus);
}

function checksout(file: string) {
    alert(file);

}


$(function () {




    initChat();




})


$(function () {
    var hidden_key = 'hidden';


    // Standards:
    if ((hidden_key = 'webkitHidden') in document) {
        hidden_key = 'webkitHidden';

        document.addEventListener('webkitvisibilitychange', onchange);

    } else if (hidden_key in document) {
        hidden_key = 'visibilitychange';
        document.addEventListener('visibilitychange', onchange);
    }
    else if ((hidden_key = 'visibilitychange') in document) {
        hidden_key = 'visibilitychange';
        document.addEventListener('mozvisibilitychange', onchange);
    }

    else if ((hidden_key = 'msHidden') in document) {
        hidden_key = 'msHidden';
        document.addEventListener('msvisibilitychange', onchange);
        // IE 9 and lower:
    }
    // All others:
    else {
        window.onpageshow = window.onpagehide
            = window.onfocus = window.onblur = onchange;
    }

    function onchange(evt: any) {
        var v = 'visible', h = 'hidden',
            evtMap: any = {
                focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
            };


        evt = evt || window.event;



        if (evt.type in evtMap) {
            //document.body.className = evtMap[evt.type];
            tabVisibilityState = evtMap[evt.type];



        }
        else {

            // document.body.className = this[hidden] ? 'hidden' : 'visible';
            tabVisibilityState = this[hidden_key] ? 'hidden' : 'visible';
            this[hidden_key] = tabVisibilityState;

        }
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if ((document as any)[hidden_key] !== undefined)
        onchange({ type: (document as any)[hidden_key] ? 'blur' : 'focus' });





});