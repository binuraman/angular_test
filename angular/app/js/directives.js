'use strict';

/* Directives */


angular.module('myApp.directives', [])
    .directive('bodyWrap', function(Templates) {
        return {
            restrict: 'E,A',
            replace: true,
            transclude: true,
            controller: function($scope, $attrs, Core, Templates, LogRegService, $location, $route, $window) {
                Core.processOutput = function(data, onSuccessCallback, onFailureCallback, onRedirectCallback, onCompleteCallback) {
                    if((data instanceof Object) && (typeof data.status == 'string')){
                        if((data.data instanceof Object) && (data.data.user instanceof Object) && typeof data.data.user.id != 'undefined' && parseInt(data.data.user.id) > 0) {
                            LogRegService.curruser = data.data.user;
                            if(data.status != 'redirect' && ($location.path() == '/login' || $location.path() == '/register')) {
                                $location.path('/');
                            }
                        } else {
                            LogRegService.curruser = {};
                            if((data.status != 'redirect') && ($location.path() != '/login') && ($location.path() != '/register')) {
                                $location.path('/login');
                            }
                        }

                        switch(data.status) {
                            case 'success':
                                if(data.data instanceof Object){
                                    if(typeof onSuccessCallback == 'function') onSuccessCallback.call(this, data.data);
                                } else {
                                    if(typeof onSuccessCallback == 'function') onSuccessCallback.call(this, null);
                                }
                                break;
                            case 'redirect':
                                if(data.redirect instanceof Object){
                                    if(typeof data.redirect.redirectURL == 'string' && String(data.redirect.redirectURL).trim() != '') {
                                        if (typeof data.redirect.alertMessage == 'string') {
                                            alert(data.redirect.alertMessage);
                                        }
                                        var targetURL = String(data.redirect.redirectURL).trim();
                                        if (targetURL.substring(0, 1) == '#') {
                                            $location.url(targetURL.substring(1));
                                            $location.replace();
                                        } else {
                                            $window.location = targetURL;
                                        }
                                    }
                                    if(typeof onRedirectCallback == 'function') onRedirectCallback.call(this, data.redirect);
                                } else {
                                    if(typeof onRedirectCallback == 'function') onRedirectCallback.call(this, null);
                                }
                                break;
                            default:
                                if(data.error instanceof Object){
                                    if(typeof onFailureCallback == 'function') onFailureCallback.call(this, data.error);
                                } else {
                                    if(typeof onFailureCallback == 'function') onFailureCallback.call(this, null);
                                }
                                break;
                        }
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.call(this, data);
                    } else {
                        LogRegService.curruser = {};
                        if(data instanceof Object) {
                            if(data.error instanceof Object){
                                if(typeof onFailureCallback == 'function') onFailureCallback.call(this, data.error);
                            } else {
                                if(typeof onFailureCallback == 'function') onFailureCallback.call(this, null);
                            }
                            if(typeof onCompleteCallback == 'function') onCompleteCallback.call(this, data);
                        } else {
                            if(typeof onFailureCallback == 'function') onFailureCallback.call(this, null);
                            if(typeof onCompleteCallback == 'function') onCompleteCallback.call(this, null);
                        }
                    }
                };


                $scope.tpl = Templates;
                $scope.user = function(){
                    return LogRegService.curruser;
                };

                //var user = LogRegService.getData('user/profile', {}, function(){
                //    Core.processOutput(user);
                //}, function(){
                //    Core.processOutput(user);
                //});

                $scope.userLogout = function() {
                    var user = LogRegService.userLogout(true, function() {
                        Core.processOutput(user);
                    }, function(){
                        Core.processOutput(user);
                    });
                }
            },
            templateUrl: Templates.pageBody
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
