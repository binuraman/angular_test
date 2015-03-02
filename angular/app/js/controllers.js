'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('LogRegController', ['$scope', 'Core', 'LogRegService', function($scope, Core, LogRegService) {
        var user = LogRegService.getData('user/profile', {}, null, null, function(){
            Core.processOutput([user, $scope]);
        }, true);

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
            var user = LogRegService.userRegister($scope.master, null, null, function(){
                Core.processOutput([user, $scope], null, function (errors){
                    $scope.formResponseFailure = errors;
                }, null, function(){
                    $scope.formSubmitted = false;
                });
            });
        };

        $scope.userLogin = function() {
            var user = LogRegService.userLogin($scope.master, null, null, function(){
                Core.processOutput([user, $scope], null, function (errors){
                    $scope.formResponseFailure = errors;
                }, null, function(){
                    $scope.formSubmitted = false;
                });
            });
        };
    }])

    .controller('Dashboard', ['$scope', 'Core', 'LogRegService', function($scope, Core, LogRegService) {
        var user = LogRegService.getData('user/profile', {}, null, null, function(){
            Core.processOutput([user, $scope]);
        }, true);

        $scope.startQuistionnaire = function () {
            delete($scope.formResponseFailure);
            var quiz = LogRegService.getData('api/dashboard/questionnaire/start', {}, function(){
                Core.processOutput([quiz, $scope], function() {
                    Core.redirectTo('#/questionnaire')
                }, function (errors){
                    $scope.formResponseFailure = errors;
                });
            }, function(){
                alert('Unknown error occurred. Please retry.')
            });
        };
    }])

    .controller('QuestionnaireController', ['$scope', 'Core', 'LogRegService', function($scope, Core, LogRegService) {
        var currQuestion = 0, userResponse = Array();
        $scope.test = {value:0};
        var user = LogRegService.getData('user/profile', {}, null, null, function(){
            Core.processOutput([user, $scope]);
        }, true);

        var questions = LogRegService.getData('api/dashboard/questionnaire', {}, function(){
            Core.processOutput(questions);
            if((questions instanceof Object) && (questions.data instanceof Object) && (questions.data.dashboard instanceof Object) && (questions.data.dashboard.questionnaire instanceof Array)) {
                questions = questions.data.dashboard.questionnaire;
                for(var i=0; i<questions.length; i++){
                    userResponse.push({value:''});
                }
            }
        }, function(){
            alert('Unknown error occurred. Please try reloading the page.');
        });

        $scope.currQuest = function () {
            if(questions instanceof Array) {
                return questions[currQuestion];
            } else {
                return {};
            }
        };

        $scope.currResponse = function(){
            return userResponse[currQuestion];
        };

        $scope.isLastQuestion = function(){
            if(currQuestion < questions.length-1) return false;
            return true;
        };

        $scope.goNext = function(){
            if(currQuestion < questions.length-1) currQuestion++;
            else {
                var response = LogRegService.postData('api/dashboard/questionnaire/saveresponse', {answers: JSON.stringify(userResponse)}, {}, function(){
                    Core.processOutput([response, $scope], function () {
                        Core.redirectTo('#/scorecard');
                    });
                }, function(){
                    alert('Unknown error occurred. Please retry.')
                });
            }
        };

        $scope.questionNumber = function(){
            return currQuestion+1;
        }

        $scope.answerOptionNumber = function(answerOptionIndex){
            if(isNaN(answerOptionIndex) || answerOptionIndex < 0) answerOptionIndex = 0;
            var base = String("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), baselength = base.length, x = answerOptionIndex, y, op = Array();
            do {
                y = x % baselength;
                x = Math.floor(x / baselength);
                op.unshift(base.charAt(y));
            } while(x > 0);
            return op.join('');
        }
    }])
    .controller('ScorePageController', ['$scope', 'Core', 'LogRegService', '$routeParams', function($scope, Core, LogRegService, $routeParams) {
        var routepath = $routeParams.testid, scorecard = {};
        var user = LogRegService.getData('user/profile', {}, null, null, function(){
            Core.processOutput([user, $scope]);
        }, true);

        delete($scope.formResponseFailure);
        var scoredata = LogRegService.getData("api/dashboard/scoretable/scorecard" + (routepath?"/"+routepath:""), {}, function(){
            Core.processOutput(scoredata, function(data){
                scorecard = data.scorecard;
            }, function (errors){
                $scope.formResponseFailure = errors;
            });
        });

        $scope.scoreDetails = function(){
            return scorecard;
        };

        $scope.backHome = function () {
            Core.redirectTo('#/');
        };

        $scope.is_correct = function (questionData) {
            if((questionData.is_fib == "1" && questionData.correct_answer != "") || (questionData.is_fib == "0" && questionData.correct_answer != "0")) {
                if(questionData.user_answer == questionData.correct_answer) return true;
                return false;
            }
            return 0;
        };

        $scope.getAnswerById = function (questionData, answerId) {
            if(questionData instanceof Object) {
                if(questionData.is_fib == "1") return answerId;
                if(questionData.options instanceof Array) {
                    for(var i = 0; i < questionData.options.length; i++){
                        if(questionData.options[i].id == answerId) {
                            return answerOptionNumber(i) + ". " + questionData.options[i].answer;
                        }
                    }
                }
            }
            return "";
        };

        var answerOptionNumber = function(answerOptionIndex){
            if(isNaN(answerOptionIndex) || answerOptionIndex < 0) answerOptionIndex = 0;
            var base = String("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), baselength = base.length, x = answerOptionIndex, y, op = Array();
            do {
                y = x % baselength;
                x = Math.floor(x / baselength);
                op.unshift(base.charAt(y));
            } while(x > 0);
            return op.join('');
        }
    }])
;