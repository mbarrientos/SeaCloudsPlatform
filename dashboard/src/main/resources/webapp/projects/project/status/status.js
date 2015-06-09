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


angular.module('seacloudsDashboard.projects.project.status', [])
    .directive('status', function () {
        return {
            restrict: 'E',
            scope: {projectId: '='},
            templateUrl: 'projects/project/status/status.html',
            controller: 'StatusCtrl'
        };
    })
    .controller('StatusCtrl', function ($scope) {
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

    });