'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('LogRegController', ['$scope', 'Core', 'LogRegService', function($scope, Core, LogRegService) {
        var user = LogRegService.getData('user/profile', {}, function(){
            Core.processOutput(user);
        }, function(){
            Core.processOutput(user);
        });

        $scope.logreguser = {};
        $scope.master = {
            username: '',
            password: ''
        };

        $scope.resetFormSubmittedAndErrors = function(fieldname){
            $scope.formSubmitted = false;
            if($scope.formResponseFailure instanceof Object) {
                if($scope.formResponseFailure.mainform instanceof Object) delete $scope.formResponseFailure.mainform;
                if($scope.formResponseFailure[fieldname] instanceof Object) delete $scope.formResponseFailure[fieldname];
            }
        };

        $scope.update = function(logreguser) {
            $scope.errorDisplayAllowed = true;
            $scope.master = angular.copy(logreguser);
            if($scope.logregform.$invalid) {
                $scope.formSubmitted = false;
                return false;
            } else {
                $scope.formSubmitted = true;
                return true;
            }
        };

        $scope.userRegister = function() {
            var user = LogRegService.userRegister($scope.master, function(){
                Core.processOutput(user, null, function (errors){
                    $scope.formResponseFailure = errors;
                }, null, function(){
                    $scope.formSubmitted = false;
                });
            }, function () {
                Core.processOutput(user, null, function (errors){
                    $scope.formResponseFailure = errors;
                }, null, function(){
                    $scope.formSubmitted = false;
                });
            });
        };

        $scope.userLogin = function() {
            var user = LogRegService.userLogin($scope.master, function(){
                Core.processOutput(user, null, function (errors){
                    $scope.formResponseFailure = errors;
                }, null, function(){
                    $scope.formSubmitted = false;
                });
            }, function () {
                Core.processOutput(user, null, function (errors){
                    $scope.formResponseFailure = errors;
                }, null, function(){
                    $scope.formSubmitted = false;
                });
            });
        };
    }])
    
    .controller('Dashboard', ['$scope', 'Core', 'LogRegService', function($scope, Core, LogRegService) {
        var user = LogRegService.getData('user/profile', {}, function(){
            Core.processOutput(user);
        }, function(){
            Core.processOutput(user);
        });
    }])
;