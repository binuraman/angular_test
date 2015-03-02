'use strict';
if(typeof frontEndAppPath == 'undefined') var frontEndAppPath = '';
if(typeof backEndAppPath == 'undefined') var backEndAppPath = '../../cakephp/app/';
if(typeof backEndAPIPath == 'undefined') var backEndAPIPath = '../../cakephp/api/';
if(typeof backEndCakePath == 'undefined') var backEndCakePath = '../../cakephp/';

function addRandomSeed(data) {
    if(typeof data != "object" || data == null) data = {};
    data.rand = Math.random()*10000;
    return data;
}

function reverseSanitize(data){
    if(typeof data == 'string'){
        return angular.element('<div>').html(data).text();
    } else if(data instanceof Object){
        for(var i in data){
            data[i] = reverseSanitize(data[i]);
        }
        return data;
    }
    return data;
}

// Declare app level module which depends on filters, and services
angular.module('myApp', [
        'ngRoute',
        'myApp.filters',
        'myApp.services',
        'myApp.directives',
        'myApp.controllers'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {templateUrl: frontEndAppPath+'partials/login.html', controller: 'LogRegController'});
        $routeProvider.when('/register', {templateUrl: frontEndAppPath+'partials/register.html', controller: 'LogRegController'});
        $routeProvider.when('/questionnaire', {templateUrl: frontEndAppPath+'partials/questionnaire.html', controller: 'QuestionnaireController'});
        $routeProvider.when('/scorecard', {templateUrl: frontEndAppPath+'partials/scorepage.html', controller: 'ScorePageController'});
        $routeProvider.when('/scorecard/:testid', {templateUrl: frontEndAppPath+'partials/scorepage.html', controller: 'ScorePageController'});
        $routeProvider.when('/', {templateUrl: frontEndAppPath+'partials/dashboard.html', controller: 'Dashboard'});
        $routeProvider.otherwise({redirectTo: '/'});
    }]);
