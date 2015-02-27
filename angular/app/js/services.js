'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .factory('Core', function() {
        return {processOutput: function(data, onSuccessCallback, onFailureCallback, onRedirectCallback, onCompleteCallback){}};
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
        var user = {
            curruser: {},
            cancelAndRenewRequest: function(){
                httpRequestCanceler.resolve();
                httpRequestCanceler = $q.defer()
//                console.log(httpRequestCanceler.notify());
            },
            userLogin: function(data, onSuccessCallback, onFailureCallback){
                var params = addRandomSeed({});
                var result = {}, targetURL = backEndCakePath + 'user/login';
                this.cancelAndRenewRequest();
                $http.post(targetURL, data, {timeout: httpRequestCanceler.promise, params: params})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                    });
                return result;
            },
            userLogout: function(redirectToLogin, onSuccessCallback, onFailureCallback){
                var params = addRandomSeed({});
                var result = {}, targetURL = backEndCakePath + 'user/logout';
                if(redirectToLogin) targetURL += '/1';
                this.cancelAndRenewRequest();
                $http.get(targetURL, {timeout: httpRequestCanceler.promise, params: params})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                    });
                return result;
            },
            userRegister: function(data, onSuccessCallback, onFailureCallback){
                var params = addRandomSeed({});
                var result = {}, targetURL = backEndCakePath + 'user/register';
                this.cancelAndRenewRequest();
                $http.post(targetURL, data, {timeout: httpRequestCanceler.promise, params: params})
                    .success(function(data, status){
                        //if(data instanceof Object && typeof data.status == 'string' && data.status == 'success' && data.data instanceof Object) {
                        //    data.data = reverseSanitize(data.data);
                        //}
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                    });
                return result;
            },
            getData: function(APIURL, getvars, onSuccessCallback, onFailureCallback){
                if(!(getvars instanceof Object)) getvars = {};
                getvars = addRandomSeed(getvars);
                var result = {}, targetURL = backEndCakePath + APIURL;
                this.cancelAndRenewRequest();
                $http.get(targetURL, {timeout: httpRequestCanceler.promise, params: getvars})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                    });
                return result;
            },
            postData: function(APIURL, postvars, getvars, onSuccessCallback, onFailureCallback){
                if(!(getvars instanceof Object)) getvars = {};
                getvars = addRandomSeed(getvars);
                var result = {}, targetURL = backEndCakePath + APIURL;
                this.cancelAndRenewRequest();
                $http.post(targetURL, postvars, {timeout: httpRequestCanceler.promise, params: params})
                    .success(function(data, status){
                        angular.copy(data, result);
                        if(typeof onSuccessCallback == 'function') onSuccessCallback.apply(this, arguments);
                    })
                    .error(function(data, status){
                        angular.copy(data, result);
                        if(typeof onFailureCallback == 'function') onFailureCallback.apply(this, arguments);
                    });
                return result;
            }
        };
        return user;
    })
;
