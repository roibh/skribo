
var globalLanguage = 'en';
var Followers: any = {};
var hostingTab = window.location.hash.replace('#/', '');
(navigator as any).webkitGetUserMedia({ audio: true, video: true }, function () {
}, function (e) {
    console.log('webcam not ok');
});


angular.module('JuntasApp', ['ui.bootstrap', 'ngResource', 'ngClipboard', 'dialogs.main', 'gettext', 'JuntasLanguages', 'ngSanitize']).config(['ngClipProvider', function (ngClipProvider: any) {
    ngClipProvider.setPath('../js/ZeroClipboard.swf');
    ngClipProvider.setConfig({
        zIndex: 50
    })

    var languageStr = localStorage.getItem('language');
    var language: juntas.ILanguage;
    if (languageStr != null)
        language = JSON.parse(languageStr);
    else
        language =  {
            'id': 'eng', name: 'english', short: 'en'
        } as juntas.ILanguage

    if (language.id === undefined)
        language =   {
            'id': 'eng', name: 'english', short: 'en'
        }as juntas.ILanguage

    globalLanguage = language.short;

    if (language.rtl) {
        var path = '../css/bootstrap-rtl.css';
        $(`link[id='rtlfile']`).attr('href', path);
    }

}]).
    controller('JuntasvideoCtrl', function ($rootScope: ng.IRootScopeService, $scope: juntas.videoScope, $timeout: ng.ITimeoutService, $Config: any, dialogs: any) {
        $scope.$Config = $Config;
        $scope.ThemeSet = false;
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


        var dStr = localStorage.getItem('TAB' + hostingTab);
        var d: any;
        if (dStr !== null) {
            d = JSON.parse(dStr);
            if (d.Theme && d.Theme !== null)
                $scope.Theme = d.Theme;

            $scope.ActiveFeedInformation = d;
            delete $scope.ActiveFeedInformation.Followers[$scope.User._id];
            Followers = $scope.ActiveFeedInformation.Followers;
        }


        $scope.UserInput = {};
        $scope.UImode = '';
        $scope.PageUrl = '';
        $scope.ShareUrl = '';
        $scope.Copied = function () {
        }

        $scope.Themes = ['paper', 'cyborg', 'United', 'superhero', 'journal', 'Lumen'];
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
                $timeout(function () {
                    $scope.ThemeSet = true;
                })


                localStorage.setItem('theme', theme_name);
            }
        });

        $scope.AlwaysOnTopInterval = null;
        $scope.AlwaysOnTop = true;
        $scope.init = function () {
            $timeout($scope.pump, 1000);
        }
        $scope.pump = function () {
            chrome.windows.getCurrent((window: chrome.windows.Window) => {
            });
            chrome.runtime.sendMessage({ command: 'get rtc', 'hostingTab': hostingTab }, function (response) {

                if (response && response.messages) {
                    for (var i = 0; i < response.messages.length; i++) {
                        var msg = response.messages[i];
                        // console.log(msg.type);


                        if (msg.data.User && msg.data.User.length) {
                            for (var i = 0; i < msg.data.User.length; i++)
                                if (msg.data.User[i]._id !== $scope.User._id)
                                    msg.data.User = msg.data.User[i];
                        }
                        if (msg.type) {

                            switch (msg.type) {
                                case 'video_offer':

                                    try {

                                        $rootScope.$emit('webrtc_offer_recieved', msg.data);





                                        //window.webrtc_offer_recieved(msg.data);
                                    } catch (e) { console.log(e) }
                                    break;
                                case 'video_offer_accepted':

                                    try {
                                        $rootScope.$emit('webrtc_offer_accepted', msg.data);

                                        //window.webrtc_offer_accepted(msg.data);
                                    } catch (e) { console.log(e) }
                                    break;
                                case 'ice_candidate':

                                    try {

                                        $rootScope.$emit('ice_candidate_accepted', msg.data);
                                        // window.ice_candidate_accepted(msg.data);
                                    } catch (e) { console.log(e) }
                                    break;
                            }
                            //return;
                        }
                    }
                }
                $timeout($scope.pump, 1000);
            });
        }

        $scope.PopMembers = function () {
            chrome.runtime.sendMessage({ command: 'pop member', tabid: $scope.ActiveFeedInformation._id, userid: $scope.User._id }, function (response) {
                // $scope.UserInput.Message = '';
                // $scope.init();
            });
        }
    })
    .filter('picture', function () {
        return function (input: any) {
            var m = Followers[input];
            if (m !== undefined)
                return m.Picture.data.url;
        };
    })
    .filter('properalign', function () {
        return function (input: any) {
            var code = input.charCodeAt(0);
            if (code > 1000) {
                return `<p class='rtl'>${input}</p>`;
            }
            else {
                return `<p class='ltr'>${input}</p>`;
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
            if (input.indexOf('http') > -1)
                return input;
            else if (input.indexOf('//') == 0)
                return 'http:' + input;
            else {
                return 'https://www.juntason.com' + '/' + folder + '/' + input;
            }
        };
    });


