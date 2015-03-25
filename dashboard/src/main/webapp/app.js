/*
 * Copyright 2014 SeaClouds
 * Contact: dev@seaclouds-project.eu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var app = angular.module('dashboard', []);

app.directive('navbar', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/navbar.html'
    };
});

app.directive('wizardHeader', function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/wizard-header.html'
    };
});

app.controller('wizardController',['$scope', function($scope){

    $scope.stepTitles = [];

    $scope.currentStep = 1;

    $scope.isSelected = function(step){
        return $scope.currentStep == step;
    };

    $scope.getStepCount = function(){

        return $scope.stepTitles.length;
    };

    $scope.range = function(n) {
        return new Array(n);
    };

    $scope.previousStep = function(){
        if($scope.currentStep != 1){
            $('#panel-step-' + $scope.currentStep).addClass('hidden');
            $scope.currentStep--;
            $('#panel-step-' + $scope.currentStep).removeClass('hidden');
        }
    };

    $scope.nextStep = function(){
        if ($scope.currentStep != $scope.getStepCount()) {
            $('#panel-step-' + $scope.currentStep).addClass('hidden');
            $scope.currentStep++;
            $('#panel-step-' + $scope.currentStep).removeClass('hidden');
        }
    };

}]);
