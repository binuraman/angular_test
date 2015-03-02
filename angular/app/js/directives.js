'use strict';

/* Directives */


angular.module('myApp.directives', [])
    .directive('bodyWrap', function(Templates) {
        return {
            restrict: 'E,A',
            replace: true,
            transclude: true,
            controller: function($scope, $attrs, Core, Templates, LogRegService) {
                $scope.tpl = Templates;
                $scope.user = function(){
                    return Core.currentUser();
                };

                $scope.userLogout = function() {
                    var user = LogRegService.userLogout(true, null, null, function() {
                        Core.processOutput([user, $scope]);
                    });
                }
            },
            templateUrl: Templates.pageBody
        }
    })
    .directive('lazyHtml', function($compile, $parse) {
        return {
            link: function(scope, element, attr) {
                scope.$watch(attr.lazyHtml, function() {
                    element.html($parse(attr.lazyHtml)(scope));
                    $compile(element.contents())(scope);
                }, true);
            }
        }
    })
    .directive('year', [function() {
        return {
            replace: true,
            link: function(scope, elm, attrs){
                var dt = new Date();
                scope.yr = dt.getFullYear();
            },
            template: "<span>{{yr}}</span>"
        };
    }]);
