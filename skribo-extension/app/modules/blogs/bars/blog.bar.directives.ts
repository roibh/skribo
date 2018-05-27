angular.module('JuntasApp')
    .directive('generalBar', function () {
        return {
            restrict: 'E',
            templateUrl: 'bars/general.html',
            link: function ($scope, element, attrs) {
            },
            controller: ($scope: any, gettextCatalog: any, $resource: any) => {
            }
        }
    })
    .directive('postBar', function () {
        return {
            restrict: 'E',
            templateUrl: 'bars/post.html',
            link: function ($scope, element, attrs) {
            },
            controller: ($scope: any, gettextCatalog: any, $resource: any) => {
            }
        }
    })