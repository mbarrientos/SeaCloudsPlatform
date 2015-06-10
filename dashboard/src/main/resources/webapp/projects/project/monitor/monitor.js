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

angular.module('seacloudsDashboard.projects.project.monitor', ['datatables', 'chart.js'])
    .directive('monitor', function(){
        return {
            restrict: 'E',
            templateUrl: 'projects/project/monitor/monitor.html',
            controller : 'MonitorCtrl'
        };
    })
    .controller('MonitorCtrl', function($scope){
        $scope.metrics = [
            {
                name:  "Ping",
                description : "Application latency",
                units: "Miliseconds",
                enabled : false,
                values: [90,100,80,85,95,92,90,86,90,95],
                labels: ["18:41:22", "18:41:23","18:41:24","18:41:26", "18:41:28","18:41:29", "18:41:30",
                    "18:41:31", "18:41:32","18:41:33"]
            },
            {
                name : "CPU Usage",
                description : "CPU used by the application",
                units: "Percent",
                enabled : false,
                values: [30,44,22,60,55,65,70,60,45,35],
                labels: ["18:41:22", "18:41:23","18:41:24","18:41:26", "18:41:28","18:41:29", "18:41:30",
                    "18:41:31", "18:41:32","18:41:33"]

            },
            {
                name : "Available RAM",
                description : "Available RAM for the application",
                units: "Megabytes",
                enabled : false,
                values: [330,440,220,60,30,193,260,400,800,1200],
                labels: ["18:41:22", "18:41:23","18:41:24","18:41:26", "18:41:28","18:41:29", "18:41:30",
                    "18:41:31", "18:41:32","18:41:33"]

            },
        ];


        var metricSetupActive = true;

        $scope.hasMetricsEnabled = function(){
            var hasMetricsEnabled = false;
            $scope.metrics.forEach(function(item){
                hasMetricsEnabled = hasMetricsEnabled ||  item.enabled;
            })
            return hasMetricsEnabled;
        }


        $scope.isMetricSettingVisible = function(){
            return metricSetupActive;
        }

        $scope.showMetricSettings = function(status){
            metricSetupActive = status;
        }
    });