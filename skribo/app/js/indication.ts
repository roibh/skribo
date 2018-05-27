



var globalLanguage = 'en';
var Followers: any = {};
var userIntercation: boolean = false;
var tabVisibilityState: string = 'hidden';

var apiUrl: string = '';
var macros: any = null;

chrome.storage.sync.get({
    juntas_server: 'https://www.juntason.com'
} as any, function (items: any) {
    apiUrl = items.juntas_server;
});


angular.module('JuntasApp', ['ui.bootstrap', 'ngResource', 'dialogs.main', 'gettext', 'JuntasLanguages', 'ngSanitize']).config([function () {
}]).run(function (gettextCatalog: any, $Language: juntas.ILanguageService) {
  
})
    .controller('JuntassidebarCtrl', function ($scope: juntas.indicationScope, $timeout: ng.ITimeoutService, $resource: any, $filter: any, $Config: any, dialogs: any, gettextCatalog: any, $Language: juntas.ILanguageService) {
        $scope.$filter = $filter;
        $scope.$Config = $Config;
        $scope.ThemeSet = false;
        $scope.Feeds = [];
        $scope.UserInput = {};
        $scope.UImode = '';
        $scope.PageUrl = '';
        $scope.ShareUrl = '';


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
                });
            }
        });

        $scope.init = function () {

           


            var x = document.location.href.split('#');
            if (x.length > 1) {
                if (x[1]) {

                    var data = JSON.parse(decodeURI(x[1]));
                    $scope.IndicationGroups = data.tabs;
                    $scope.AnnotationsCount = data.annotations;
                }
            }
            var theme = localStorage.getItem('theme');
            if (theme !== null && theme !== undefined) {
                $scope.Theme = theme;
            }
            else {
                $scope.Theme = 'paper';
            }
            return true;
        }

        eval(`
        var juntas = juntas || {};
        juntas.IndicationUiMode = juntas.IndicationUiMode || {};
        juntas.IndicationUiMode.collapse = 0;
        juntas.IndicationUiMode.expand = 1;
        `);


        $scope.IndicationCollapseMode = juntas.IndicationUiMode.collapse;
        $scope.Connect = function (feed) {
            var followRes = $resource(apiUrl + '/tabs/subscribefollowers');
            followRes.save({ '_id': feed._id, 'userId': $scope.User._id }, function (data: any) {
                feed = { 'TabId': null, '_id': feed._id };
                chrome.tabs.getSelected(function (selectedTab) {
                    feed.TabId = selectedTab.id;
                    chrome.runtime.sendMessage({ command: 'tabs:connect', tab: feed, activeTab: selectedTab }, function (response) {
                       
                    });
                    
                });
            });


        }
        $scope.toggleIndication = function () {

            if (!$scope.IndicationCollapseMode || $scope.IndicationCollapseMode === juntas.IndicationUiMode.collapse)
                $scope.IndicationCollapseMode = juntas.IndicationUiMode.expand;
            else
                $scope.IndicationCollapseMode = juntas.IndicationUiMode.collapse;

            chrome.runtime.sendMessage({ command: 'toggle indication', operation: $scope.IndicationCollapseMode }, function (response) { });


            if ($scope.IndicationCollapseMode === juntas.IndicationUiMode.expand)
                chrome.runtime.sendMessage({ command: 'get indication groups' }, function (response) { });

        }
        $scope.init();


        $scope.annotationState = false;
        $scope.toggleAnnotations = function () {


            if ($scope.annotationState) {
                $scope.annotationState = false;
                return chrome.runtime.sendMessage({ command: 'show loader' }, function (response) {
                    return chrome.runtime.sendMessage({ command: 'hide annotations' }, function (response) {
                        return chrome.runtime.sendMessage({ command: 'hide loader' }, function (response) {
                        });
                    });
                });
            } else {

                $scope.annotationState = true;
                chrome.runtime.sendMessage({ command: 'show loader' }, function (response) {
                    chrome.runtime.sendMessage({ command: 'load public annotations' }, function (response) {
                        chrome.runtime.sendMessage({ command: 'hide loader' }, function (response) { });
                    });
                });
            }
        }
    })


    .filter('displaydate', function () {
        return function (input: any) {
            var m = moment(input);
            return m.locale(globalLanguage).calendar();
        };
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

                    return $Config.site.apiUrl + '/' + folder + '/' + input;
                }
            }
        };
    });




