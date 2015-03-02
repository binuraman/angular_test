'use strict';

/* Filters */

angular.module('myApp.filters', [])
    .filter('regexp', [function() {
        return function(pattern, params) {
            return new RegExp(pattern, params);
        }
    }])
    .filter('replace', [function() {
        return function(subject, pattern, replaceby) {
            pattern = new RegExp(pattern);
            return String(subject).replace(pattern, replaceby);
        }
    }])
    .filter('interpolate', ['version', function(version) {
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }]);
