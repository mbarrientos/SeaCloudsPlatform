/*
 *  Copyright 2014 SeaClouds
 *  Contact: SeaClouds
 *
 *      Licensed under the Apache License, Version 2.0 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

'use strict';

angular.module('seacloudsDashboard.projects.project.sla', ['jlareau.pnotify'])
    .directive('sla', function(){
        return {
            restrict: 'E',
            templateUrl: 'projects/project/sla/sla.html',
            controller : 'SlaCtrl'
        };
    })
    .controller('SlaCtrl', function($scope, notificationService){

        $scope.slaInput = "Please load your file here...";

        $scope.editorOptionsSLA = {
            mode: 'xml',
            lineNumbers: true
        };

        $scope.processSLA = function () {
            if (isValidXML($scope.slaInput)) {
                notificationService.success('Success!!!');
                $scope.slaInput = "Please load your file here...";
                $scope.showSLASettings(false);

            } else {
                notificationService.error('Bad syntax');
            }

        }

        $scope.$watch('slaInputFile', function () {
            if ($scope.slaInputFile) {
                var r = new FileReader();
                r.onload = function (e) {
                    $scope.slaInput = e.target.result;
                    $scope.$apply();
                }
                r.readAsText($scope.slaInputFile[0]);
            }
        });

        var selectedSLA = 0;

        var slaSetupActive = false;

        $scope.isSLASettingVisible = function(){
            return slaSetupActive;
        }

        $scope.showSLASettings = function(status){
            slaSetupActive = status;
        }

        $scope.viewSLA = function(index){
            selectedSLA = index;
        }

        $scope.getActiveSLAIndex = function(){
            return selectedSLA;
        }

        $scope.slaHasBeenViolated = function(index){
            return $scope.slas[index].violations.length != 0;
        }

        $scope.getCurrentSLA = function(){
            return $scope.slas[selectedSLA];
        }



        $scope.slas = [
            {
                name : "User - Nuro",
                terms : [
                    {
                        constraint : "response time < 2000ms",
                        penalties : ["5 times a day = 10% bonus discount"]
                    },
                    {
                        constraint : "day availability > 99,5% ",
                        penalties : ["2 times a month = 10% bonus discount", "4 times a month = 50% bonus discount"]
                    }
                ],
                violations : [
                    {
                        date : "26-03-2015",
                        amount : 3
                    },
                    {
                        date : "20-03-2015",
                        amount : 1
                    },
                ],
                penalties : [
                    {
                        date : "26-03-2015",
                        definition : "10% bonus discount"
                    }
                ]

            },
            {
                name : "Nuro - Amazon",
                terms : [
                    {
                        constraint : "throughput < 10 MB/s ",
                        penalties : ["2 times a day = 10% bonus discount"]
                    },
                ],
                violations : [
                ],
                penalties : [
                ]
            },
            {
                name : "Nuro - CloudFoundry",
                terms : [
                    {
                        constraint : "request per second < 1000 ",
                        penalties : ["1 times a day = 30% bonus discount"]
                    },
                    {
                        constraint : "database queries per second < 100 ",
                        penalties : ["5 times a day = 10% bonus discount"]
                    }
                ],
                violations : [
                ],
                penalties : [
                ]
            }
        ];

    });