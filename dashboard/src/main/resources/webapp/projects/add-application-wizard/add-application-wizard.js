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

angular.module('seacloudsDashboard.projects.addApplicationWizard', ['ngRoute', 'angularTopologyEditor', 'ui.codemirror', 'ngFileUpload', 'jlareau.pnotify'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/add-application-wizard', {
            templateUrl: 'projects/add-application-wizard/add-application-wizard.html'
        })
    }])
    .controller('AddApplicationWizardCtrl', function ($scope, notificationService) {

        // Wizard data
        $scope.matchmakerInput = "Please load your file here...";
        $scope.matchmakerResult = "Please click the button to get results";
        $scope.optimizerInput = "Please load your file here...";
        $scope.optimizerResult = "Please click the button to get results";
        $scope.damInput = "Please load your file here...";
        $scope.monitoringModelInput = "Please load your file here...";
        $scope.monitoringRulesInput = "Please load your file here...";
        $scope.slaInput = "Please load your file here...";
        $scope.deployedApp = {
            id : 1
        }
        $scope.wizardLog = "";

        // File uploader
        $scope.matchmakerInputFile = undefined;
        $scope.optimizerInputFile = undefined;
        $scope.damInputFile = undefined;
        $scope.monitoringModelInputFile = undefined;
        $scope.monitoringRulesInputFile = undefined;
        $scope.slaInputFile = undefined;


        $scope.topology = {
            "nodes": [{
                "name": "PHP Node",
                "label": "PHP",
                "type": "WebApplication",
                "status": "running",
                "properties": {"language": "PHP"}
            }, {
                "name": "Rest Component",
                "label": "rest1",
                "type": "RestService",
                "status": "onfire",
                "properties": {"language": "JAVA"}
            }, {
                "name": "Database1",
                "label": "db1",
                "type": "Database",
                "status": "running",
                "properties": {"category": "mysql"}
            }, {"name": "CloudFoundry Pivotal", "label": "CF", "type": "Cloud", "properties": {}}, {
                "name": "Heroku",
                "label": "Heroku",
                "type": "Cloud",
                "properties": {}
            }],
            "links": [{"source": "PHP Node", "target": "Rest Component", "properties": {}}, {
                "source": "Rest Component",
                "target": "Database1",
                "properties": {}
            }, {"source": "Rest Component", "target": "CloudFoundry Pivotal", "properties": {}}, {
                "source": "PHP Node",
                "target": "CloudFoundry Pivotal",
                "properties": {}
            }, {"source": "Database1", "target": "Heroku", "properties": {}}]
        };

        $scope.processAAM = function () {
            if (isValidJSON($scope.matchmakerInput)) {
                notificationService.success('Success!!!');
                $scope.matchmakerResult = "{}";

            } else {
                notificationService.error('Bad syntax');
            }

        }

        $scope.processADP = function () {
            if (isValidJSON($scope.optimizerInput)) {
                notificationService.success('Success!!!');
                $scope.optimizerResult = "{}";
            } else {
                notificationService.error('Bad syntax');
            }

        }


        $scope.deployApplication = function () {

            $scope.wizardLog += "Installing Monitoring Model...";
            $scope.wizardLog += "\t Done. \n";
            $scope.wizardLog += "Installing Monitoring Rules...";
            $scope.wizardLog += "\t Done. \n";
            $scope.wizardLog += "Installing Service Level Agreements...";
            $scope.wizardLog += "\t Done. \n";
            $scope.wizardLog += "Starting the deployment process...";
            $scope.wizardLog += "\t Done. \n";

            notificationService.success('The application was succesfully deployed');

        }

        $scope.steps = ['Application properties', 'Design topology',
            'Optimize & Plan', 'Configuration summary', 'Process Summary & Deploy'];
        $scope.currentStep = 1;
        $scope.isSelected = function (step) {
            return $scope.currentStep == step;
        };
        $scope.getStepCount = function () {

            return $scope.steps.length;
        };
        $scope.range = function (n) {
            return new Array(n);
        };
        $scope.previousStep = function () {
            if ($scope.currentStep != 1) {
                $scope.currentStep--;
            }
        };
        $scope.nextStep = function () {
            switch ($scope.currentStep) {
                case 1:
                case 2:
                case 3:
                    break;
                case 4:
                    $scope.deployApplication();
                case 5:
                default:
                    break;
            }

            if ($scope.currentStep != $scope.getStepCount()) {
                $scope.currentStep++;
            }

        };

        $scope.wizardCanRollback = function () {
            switch ($scope.currentStep) {
                case 1:
                    return false;
                case 2:
                case 3:
                    return true;
                case 5:
                    return false;
            }
        }

        $scope.wizardCanContinue = function () {
            switch ($scope.currentStep) {
                case 1:
                    return true;
                case 2:
                    return true;
                case 3:
                    return isValidJSON($scope.matchmakerResult) && isValidJSON($scope.optimizerResult)
                case 4:
                    return isValidYAML($scope.damInput) && isValidJSON($scope.monitoringModelInput)
                        && isValidXML($scope.monitoringRulesInput) && isValidXML($scope.slaInput)
                case 5:
                    return true;
            }
        }


    })
    .directive('addApplicationWizard', function () {
        return {
            restrict: 'E',
            templateUrl: 'projects/add-application-wizard/add-application-wizard.html',
            controller: 'AddApplicationWizardCtrl'
        };
    })
    .directive('wizardStep1', function () {
        return {
            restrict: 'E',
            templateUrl: 'projects/add-application-wizard/wizard-step-1.html'
            //controller: 'AddApplicationWizardCtrl'
        };
    })
    .directive('wizardStep2', function () {
        return {
            restrict: 'E',
            templateUrl: 'projects/add-application-wizard/wizard-step-2.html'
            //controller: 'AddApplicationWizardCtrl'
        };
    })
    .directive('wizardStep3', function () {
        return {
            restrict: 'E',
            templateUrl: 'projects/add-application-wizard/wizard-step-3.html',
            link: function (scope, elem, attrs) {
                scope.editorOptionsInput = {
                    mode: 'application/json',
                    lineNumbers: true,
                };

                scope.editorOptionsOutput = {
                    readOnly: 'nocursor',
                    mode: 'application/json',
                    lineNumbers: true
                };

                scope.$watch('matchmakerInputFile', function () {
                    if (scope.matchmakerInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.matchmakerInput = e.target.result;
                            scope.apply();
                        }
                        r.readAsText(scope.matchmakerInputFile[0]);
                    }
                });

                scope.$watch('optimizerInputFile', function () {
                    if (scope.optimizerInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.optimizerInput = e.target.result;
                            scope.apply();
                        }
                        r.readAsText(scope.optimizerInputFile[0]);
                    }
                });

            }
            //controller: 'AddApplicationWizardCtrl'
        };
    })
    .directive('wizardStep4', function () {
        return {
            restrict: 'E',
            templateUrl: 'projects/add-application-wizard/wizard-step-4.html',
            link: function (scope, elem, attrs) {
                scope.editorOptionsDam = {
                    mode: 'yaml',
                    lineNumbers: true
                };

                scope.editorOptionsMonitoringDam = {
                    mode: 'application/json',
                    lineNumbers: true
                };

                scope.editorOptionsMonitoringRules = {
                    mode: 'xml',
                    lineNumbers: true
                };

                scope.editorOptionsSLA = {
                    mode: 'xml',
                    lineNumbers: true
                };

                scope.$watch('damInputFile', function () {
                    if (scope.damInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.damInput = e.target.result;
                            scope.apply();
                        }
                        r.readAsText(scope.damInputFile[0]);
                    }
                });

                scope.$watch('monitoringModelInputFile', function () {
                    if (scope.damInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.monitoringModelInput = e.target.result;
                            scope.apply();
                        }
                        r.readAsText(scope.monitoringModelInputFile[0]);
                    }
                });

                scope.$watch('monitoringRulesInputFile', function () {
                    if (scope.damInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.monitoringRulesInput = e.target.result;
                            scope.apply();
                        }
                        r.readAsText(scope.monitoringRulesInputFile[0]);
                    }
                });

                scope.$watch('slaInputFile', function () {
                    if (scope.slaInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.slaInput = e.target.result;
                            scope.apply();
                        }
                        r.readAsText(scope.slaInputFile[0]);
                    }
                });

            }
            //controller: 'AddApplicationWizardCtrl
        };
    })
    .directive('wizardStep5', function () {
        return {
            scope: true,
            templateUrl: 'projects/add-application-wizard/wizard-step-5.html',
            link: function (scope, elem, attrs) {

            }
            //controller: 'AddApplicationWizardCtrl'
        };
    })