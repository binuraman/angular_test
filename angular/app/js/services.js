'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .factory('Core', function($location, $window) {
        var currUser = {data:{}};
        return {
            redirectTo: function(targetLocation, allowHistroy, forceRouteChangeOnly){
                var targetURL = String(targetLocation).trim();
                if(targetURL.substring(0, 1) == '#') {
                    $location.url(targetURL.substring(1));
                } else if (forceRouteChangeOnly){
                    $location.url(targetURL);
                } else {
                    $window.location = targetURL;
                }
                if (!allowHistroy) $location.replace();
            },
            currentUser: function(){
                return currUser.data;
            },
            processOutput: function(data, onSuccessCallback, onFailureCallback, onRedirectCallback, onCompleteCallback, scope){
                if((data instanceof Array) && data.length > 1 && !scope) {
                    scope = data[1];
                    data = data[0];
                }
                if((data instanceof Object) && (typeof data.status == 'string')){
                    if((data.data instanceof Object) && (data.data.user instanceof Object) && typeof data.data.user.id != 'undefined' && parseInt(data.data.user.id) > 0) {
                        currUser.data = data.data.user;
                        if((scope instanceof Object) && (scope.$root instanceof Object) && (typeof scope.$root.$$phase == 'string') && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') scope.$apply();
                        if(data.status != 'redirect' && ($location.path() == '/login' || $location.path() == '/register')) {
                            this.redirectTo('#/');
                        }
                    } else {
                        currUser.data = {};
                        if((scope instanceof Object) && (scope.$root instanceof Object) && (typeof scope.$root.$$phase == 'string') && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') scope.$apply();
                        if((data.status != 'redirect') && ($location.path() != '/login') && ($location.path() != '/register')) {
                            this.redirectTo('#/login');
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
                                    this.redirectTo(data.redirect.redirectURL);
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
                    currUser.data = {};
                    if((scope instanceof Object) && (scope.$root instanceof Object) && (typeof scope.$root.$$phase == 'string') && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') scope.$apply();
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
                    if(($location.path() != '/login') && ($location.path() != '/register')) {
                        this.redirectTo('#/login');
                    }
                }
            }
        };
    })
    .factory('Templates', function(){
        return {
            pageLogin: frontEndAppPath + 'partials/login.html',
            pageRegister: frontEndAppPath + 'partials/register.html',
            pageDashboard: frontEndAppPath + 'partials/dashboard.html',

            pageBody: frontEndAppPath + 'partials/body.html',
            pageHeader: frontEndAppPath + 'partials/header.html',
            pageFooter: frontEndAppPath + 'partials/footer.html',

            frontEndAppLocation: frontEndAppPath,
            backEndCakeLocation: backEndCakePath
        };
    })
    .factory('LogRegService', function($http, $q){
        var httpRequestCanceler = $q.defer();
        var cancelAndRenewRequest = function(){
            httpRequestCanceler.resolve();
            httpRequestCanceler = $q.defer();
            //console.log(httpRequestCanceler.notify());
        };
        var user = {
            userLogin: function(data, onSuccessCallback, onFailureCallback, onCompleteCallback){
                var params = addRandomSeed({});
                var result = {}, targetURL = backEndCakePath + 'user/login';
                cancelAndRenewRequest();
                $http.post(targetURL, data, {timeout: httpRequestCanceler.promise, params: params})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    });
                return result;
            },
            userLogout: function(redirectToLogin, onSuccessCallback, onFailureCallback, onCompleteCallback){
                var params = addRandomSeed({});
                var result = {}, targetURL = backEndCakePath + 'user/logout';
                if(redirectToLogin) targetURL += '/1';
                cancelAndRenewRequest();
                $http.get(targetURL, {timeout: httpRequestCanceler.promise, params: params})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    });
                return result;
            },
            userRegister: function(data, onSuccessCallback, onFailureCallback, onCompleteCallback){
                var params = addRandomSeed({});
                var result = {}, targetURL = backEndCakePath + 'user/register';
                cancelAndRenewRequest();
                $http.post(targetURL, data, {timeout: httpRequestCanceler.promise, params: params})
                    .success(function(data, status){
                        //if(data instanceof Object && typeof data.status == 'string' && data.status == 'success' && data.data instanceof Object) {
                        //    data.data = reverseSanitize(data.data);
                        //}
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    });
                return result;
            },
            getData: function(APIURL, getvars, onSuccessCallback, onFailureCallback, onCompleteCallback, autonomous){
                if(!(getvars instanceof Object)) getvars = {};
                getvars = addRandomSeed(getvars);
                var result = {}, targetURL = backEndCakePath + APIURL;
                cancelAndRenewRequest();
                $http.get(targetURL, {timeout: (autonomous?null:httpRequestCanceler.promise), params: getvars})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    });
                return result;
            },
            postData: function(APIURL, postvars, getvars, onSuccessCallback, onFailureCallback, onCompleteCallback, autonomous){
                if(!(getvars instanceof Object)) getvars = {};
                getvars = addRandomSeed(getvars);
                var result = {}, targetURL = backEndCakePath + APIURL;
                cancelAndRenewRequest();
                $http.post(targetURL, postvars, {timeout: (autonomous?null:httpRequestCanceler.promise), params: getvars})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                        if(typeof onCompleteCallback == 'function') onCompleteCallback.apply(this, arguments);
                    });
                return result;
            }
        };
        return user;
    })
;
