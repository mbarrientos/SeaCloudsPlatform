/*
 Copyright 2014 SeaClouds
 Contact: SeaClouds

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

var seacloudsDashboard = angular.module('seacloudsDashboard', [
    'ui.bootstrap',
    'jlareau.pnotify',
    'ngAnimate',
    'seacloudsDashboard.header',
    'seacloudsDashboard.footer',
    'seacloudsDashboard.signin',
    'seacloudsDashboard.about',
    'seacloudsDashboard.help',
    'seacloudsDashboard.projects',
    'seacloudsDashboard.projects.addApplicationWizard'

]);

seacloudsDashboard.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/", {redirectTo: '/projects'})
    //TODO: Create a not available view
    $routeProvider.otherwise({redirectTo: '/not-available.html'});
}]);


seacloudsDashboard.factory('Page', function () {
    var title = 'SeaClouds Dashboard';
    return {
        getTitle: function () {
            return title;
        },
        setTitle: function (newTitle) {
            title = newTitle;
        }
    };
});

seacloudsDashboard.factory('UserCredentials', function ($location) {
    var authenticatedUser = {
        id: 1337,
        username: "Manager",
        email: "admin@example.com"
    };

    return {
        getUser: function () {
            return authenticatedUser;
        },
        isUserAuthenticated: function () {
            return !(!authenticatedUser)
        },
        login: function (userCredentials) {
            authenticatedUser = {
                id: 1337,
                username: "Manager",
                email: "admin@example.com"
            };
            $location.path('/projects');
        },
        logout: function () {
            authenticatedUser = undefined;
            $location.path('/signin');
        }
    };

});

seacloudsDashboard.factory('SeaCloudsApi', function ($http) {
    return {
        getProjects: function () {
            return $http.get("/api/deployer/applications");
        },
        getProject: function (id) {
            var promise = new Promise(function (resolve, reject) {
                $http.get("/api/deployer/applications").
                    success(function (data) {
                        var project = data.filter(function (project) {
                            return project.id == id;
                        })[0];
                        resolve(project);
                    }).
                    error(function (err) {
                        reject(Error(err));
                    });
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        },
        addProject: function (dam, damSuccessCallback, damErrorCallback,
                              monitorDam, monitorDamSuccessCallback, monitorDamErrorCallback,
                              monitoringRules, monitoringRulesSuccessCallback, monitoringRulesErrorCallback,
                              agreements, agreementsSuccessCallback, agreementsErrorCallback) {


            var promise = new Promise(function (resolveParent, rejectParent) {
                var deployerResponse;

                // Start application deployment
                $http.post("/api/deployer/applications", dam).
                    success(function (response) {
                        deployerResponse = response;
                        damSuccessCallback(response)

                        // Deploy monitor model
                        $http.post("/api/monitor/model", monitorDam).
                            success(function () {
                                monitorDamSuccessCallback();

                                // Deploy monitor rules
                                $http.post("/api/monitor/rules", monitoringRules).
                                    success(function () {
                                        monitoringRulesSuccessCallback();

                                        $http.post("/api/sla/agreements", {
                                            rules: monitoringRules,
                                            agreements: agreements
                                        }).
                                            success(function (err) {
                                                agreementsSuccessCallback();
                                                resolveParent(deployerResponse);

                                            }).
                                            error(function (err) {
                                                //TODO: Rollback monitoring rules + monitor model + deployed app
                                                agreementsErrorCallback();
                                                rejectParent(err);
                                            })
                                    }).
                                    error(function (err) {
                                        //TODO: Rollback monitor model + deployed app
                                        monitoringRulesErrorCallback();
                                        rejectParent(err);
                                    })
                            }).
                            error(function (err) {
                                //TODO: Rollback deployed app
                                monitorDamErrorCallback();
                                rejectParent(err);
                            })

                    }).
                    error(function (err) {
                        damErrorCallback();
                        rejectParent(err);
                    })

            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;


        },
        removeProject: function (id) {
            return $http.delete("/api/deployer/applications/" + id);
        },
        getSensors: function (id) {
            var promise = new Promise(function (resolve, reject) {
                $http.get("/api/deployer/applications/" + id + "/sensors").
                    success(function (sensors) {
                        resolve(sensors);
                    }).
                    error(function (err) {
                        reject(Error(err));
                    });
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        },
        getAvailableMetrics: function (applicationId) {
            var promise = new Promise(function (resolve, reject) {
                $http.get("/api/deployer/applications/" + applicationId + "/metrics").
                    success(function (sensors) {
                        resolve(sensors);
                    }).
                    error(function (err) {
                        reject(Error(err));
                    });
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        },
        getMetricValue: function (applicationId, entityId, metricId) {
            var promise = new Promise(function (resolve, reject) {
                $http.get("/api/deployer/applications/" + applicationId + "/metrics/value?entityId=" + entityId + "&metricId=" + metricId).
                    success(function (value) {
                        resolve(value);
                    }).
                    error(function (err) {
                        reject(Error(err));
                    });
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        },
        matchmake: function (aam) {
            var promise = new Promise(function (resolve, reject) {
                $http.post("/api/planner/matchmake", aam)
                    .success(function (value) {
                        resolve(value);
                    })
                    .error(function (err) {
                        reject(Error(err));
                    });
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        },
        optimize: function (adp) {
            var promise = new Promise(function (resolve, reject) {
                    $http.post("/api/planner/optimize", adp)
                    .success(function (value) {
                        resolve(value);
                    })
                    .error(function (err) {
                        reject(Error(err));
                    })
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        },
        getAgreements: function (applicationId) {
            var promise = new Promise(function (resolve, reject) {
                /*$http.get("/api/sla/agreements/" + applicationId + "/status").
                 success(function (value) {
                 resolve(value);
                 }).
                 error(function (err) {
                 reject(Error(err));
                 });*/


                var fakeResponse = {
                    "agreementId": applicationId,
                    "name": "FakeAgreement",
                    "context": {
                        "agreementInitiator": "client-prueba",
                        "expirationTime": "2014-03-07T12:00:00+0100",
                        "templateId": "template02",
                        "service": "service5",
                        "serviceProvider": "AgreementResponder",
                        "agreementResponder": "provider03"
                    },
                    "terms": {
                        "allTerms": {
                            "serviceDescriptionTerm": null,
                            "serviceProperties": [
                                {
                                    "name": "ServiceProperties",
                                    "serviceName": "ServiceName",
                                    "variableSet": {
                                        "variables": [
                                            {"name": "metric1", "metric": "xs:double", "location": "metric1"},
                                            {"name": "metric2", "metric": "xs:double", "location": "metric2"},
                                            {"name": "metric3", "metric": "xs:double", "location": "metric3"},
                                            {"name": "metric4", "metric": "xs:double", "location": "metric4"}
                                        ]
                                    }
                                }
                            ],
                            "guaranteeTerms": [
                                {
                                    "name": "GTMetric1",
                                    "serviceScope": {"serviceName": "ServiceName", "value": ""},
                                    "serviceLevelObjetive": {
                                        "kpitarget": {
                                            "kpiName": "metric1",
                                            "customServiceLevel": "{\"constraint\" : \"metric1 BETWEEN (0.05, 1)\"}"
                                        }
                                    }
                                }, {
                                    "name": "GTMetric2",
                                    "serviceScope": {"serviceName": "ServiceName", "value": ""},
                                    "serviceLevelObjetive": {
                                        "kpitarget": {
                                            "kpiName": "metric2",
                                            "customServiceLevel": "{\"constraint\" : \"metric2 BETWEEN (0.1, 1)\"}"
                                        }
                                    }
                                }, {
                                    "name": "GTMetric3",
                                    "serviceScope": {"serviceName": "ServiceName", "value": ""},
                                    "serviceLevelObjetive": {
                                        "kpitarget": {
                                            "kpiName": "metric3",
                                            "customServiceLevel": "{\"constraint\" : \"metric3 BETWEEN (0.15, 1)\"}"
                                        }
                                    }
                                }, {
                                    "name": "GTMetric4",
                                    "serviceScope": {"serviceName": "ServiceName", "value": ""},
                                    "serviceLevelObjetive": {
                                        "kpitarget": {
                                            "kpiName": "metric4",
                                            "customServiceLevel": "{\"constraint\" : \"metric4 BETWEEN (0.2, 1)\"}"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };
                resolve(fakeResponse);
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        },
        getAgreementStatus: function (applicationId) {
            var promise = new Promise(function (resolve, reject) {
                /*$http.get("/api/sla/agreements/" + applicationId).
                 success(function (value) {
                 resolve(value);
                 }).
                 error(function (err) {
                 reject(Error(err));
                 });*/

                var fakeResponse = {
                    "AgreementId": applicationId,
                    "guaranteestatus": "FULFILLED",
                    "guaranteeterms": [
                        {"name": "GTMetric1", "status": "FULFILLED", "violations": []},
                        {"name": "GTMetric2", "status": "NON_DETERMINED", "violations": []},
                        {
                            "name": "GTMetric3", "status": "VIOLATED", "violations": [{
                                "uuid": "e431d68b-86ac-4c72-a6db-939e949b6c1",
                                "datetime": "2014-08-13T10:01:01CEST",
                                "contract_uuid": "agreement07",
                                "service_name": "ServiceName",
                                "service_scope": "",
                                "metric_name": "GTMetric3",
                                "actual_value": "0.021749629938806803"
                            }]
                        },
                        {"name": "GTMetric4", "status": "FULFILLED", violations: []}
                    ]
                }
                resolve(fakeResponse);
            });
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }

            return promise;
        }

    };
});


seacloudsDashboard.controller('GlobalCtrl', function ($scope, Page, UserCredentials, SeaCloudsApi) {
    $scope.Page = Page;
    $scope.UserCredentials = UserCredentials;
    $scope.SeaCloudsApi = SeaCloudsApi;

    if (!UserCredentials.isUserAuthenticated()) {
        $location.path('/access-restricted.html');
    }
});

