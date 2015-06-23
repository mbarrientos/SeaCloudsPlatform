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

angular.module('seacloudsDashboard.projects.addApplicationWizard', ['ngRoute', 'angularTopologyEditor', 'ui.codemirror', 'ngFileUpload'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/add-application-wizard', {
            templateUrl: 'projects/add-application-wizard/add-application-wizard.html'
        })
    }])
    .controller('AddApplicationWizardCtrl', function ($scope, notificationService) {

        // Wizard data
        $scope.applicationName = "";
        $scope.matchmakerInput = "Please load your file here...";
        $scope.matchmakerResult = "Please click the button to get results";
        $scope.optimizerInput = "Please load your file here...";
        $scope.optimizerResult = "Please click the button to get results";
        $scope.damInput = "name: My web chat\r\nservices:\r\n- serviceType: brooklyn.entity.basic.SameServerEntity\r\n  name: Database + DataCollectors\r\n  location: aws-ec2:us-west-2\r\n  brooklyn.children:\r\n\r\n  - serviceType: brooklyn.entity.basic.VanillaSoftwareProcess\r\n    name: Data collector\r\n    id: data collector\r\n    provisioning.properties:\r\n      stopIptables: true\r\n    install.latch: $brooklyn:component(\"mysql_server\").attributeWhenReady(\"service.isUp\")\r\n    launch.command: |\r\n      export MODACLOUDS_TOWER4CLOUDS_MANAGER_IP=52.16.235.125\r\n      export MODACLOUDS_TOWER4CLOUDS_MANAGER_PORT=8170\r\n      export MODACLOUDS_TOWER4CLOUDS_DC_SYNC_PERIOD=10\r\n      export MODACLOUDS_TOWER4CLOUDS_RESOURCES_KEEP_ALIVE_PERIOD=25\r\n      export MODACLOUDS_TOWER4CLOUDS_CLOUD_PROVIDER_ID=amazon\r\n      export MODACLOUDS_TOWER4CLOUDS_CLOUD_PROVIDER_TYPE=IaaS\r\n      export MODACLOUDS_TOWER4CLOUDS_VM_ID=dbmachine\r\n      export MODACLOUDS_TOWER4CLOUDS_VM_TYPE=Database\r\n      export MODACLOUDS_TOWER4CLOUDS_INTERNAL_COMPONENT_ID=mysql\r\n      export MODACLOUDS_TOWER4CLOUDS_INTERNAL_COMPONENT_TYPE=mysqlserverdb\r\n      ( sudo apt-get install -y --allow-unauthenticated openjdk-7-jdk || sudo yum -y --nogpgcheck install java-1.7.0-openjdk-devel )\r\n      ( sudo apt-get install -y --allow-unauthenticated unzip || sudo yum -y --nogpgcheck install unzip )\r\n      wget -O data-collector-2.0-SNAPSHOT.jar \"https:\/\/www.dropbox.com\/s\/v56qizmikj8q5t2\/data-collector-2.0-SNAPSHOT.jar\"\r\n      wget -O hyperic-sigar-1.6.4.zip \"http:\/\/sourceforge.net\/projects\/sigar\/files\/sigar\/1.6\/hyperic-sigar-1.6.4.zip\/download?use_mirror=switch\"\r\n      unzip hyperic-sigar-1.6.4.zip\r\n      nohup java -Djava.library.path=.\/hyperic-sigar-1.6.4\/sigar-bin\/lib\/ -jar data-collector-2.0-SNAPSHOT.jar tower4clouds > dc.out 2>&1 &\r\n      echo $! > $PID_FILE\r\n\r\n  - serviceType: brooklyn.entity.database.mysql.MySqlNode\r\n    id: mysql_server\r\n    name: My DB\r\n    brooklyn.config:\r\n      creationScriptUrl: https:\/\/bit.ly\/brooklyn-visitors-creation-script\r\n\r\n- serviceType: brooklyn.entity.cloudfoundry.webapp.java.JavaCloudFoundryPaasWebApp\r\n  name: Web AppServer HelloWorld\r\n  id: webapp\r\n  location: cloudfoundry-instance\r\n  brooklyn.config:\r\n    application-name: web-chat\r\n    app.monitor.resource: \/db.jsp GET\r\n    application-url: https:\/\/www.dropbox.com\/s\/t020rnvaialr0b2\/brooklyn-webapp-custom-env-monitoring.war?dl=1\r\n    env: \r\n      myDbName: visitors\r\n      myDbHostName: $brooklyn:component(\"mysql_server\").attributeWhenReady(\"host.address\")\r\n      myDbUser: brooklyn\r\n      myDbPassword: br00k11n\r\n      myDbPort: 3306\r\n  brooklyn.policies:\r\n  - policyType: brooklyn.policy.autoscaling.AutoScalerPolicy\r\n    brooklyn.config:\r\n      metric: $brooklyn:sensor(\"brooklyn.entity.cloudfoundry.webapp.java.JavaCloudFoundryPaasWebApp\", \"app.jm.server.latency\")\r\n      autoscaler.resizeDownStabilizationDelay: 100000\r\n      metricLowerBound: 60\r\n      metricUpperBound: 100\r\n      minPoolSize: 1\r\n      maxPoolSize: 2";
        $scope.monitoringRulesInput = "<monitoringRules xmlns=\"http:\/\/www.modaclouds.eu\/xsd\/1.0\/monitoring_rules_schema\" xmlns:xsi=\"http:\/\/www.w3.org\/2001\/XMLSchema-instance\" xsi:schemaLocation=\"http:\/\/www.modaclouds.eu\/xsd\/1.0\/monitoring_rules_schema\">\r\n   <monitoringRule id=\"MySQLCPUUtilizationRule\" startEnabled=\"true\" timeStep=\"1\" timeWindow=\"1\">\r\n      <monitoredTargets>\r\n         <monitoredTarget class=\"VM\" type=\"Database\" \/>\r\n      <\/monitoredTargets>\r\n      <collectedMetric metricName=\"CPUUtilization\">\r\n         <parameter name=\"samplingTime\">1<\/parameter>\r\n         <parameter name=\"samplingProbability\">1<\/parameter>\r\n      <\/collectedMetric>\r\n      <actions>\r\n         <action name=\"OutputMetric\">\r\n            <parameter name=\"resourceId\">ID<\/parameter>\r\n            <parameter name=\"metric\">DatabaseCPUUtilization<\/parameter>\r\n            <parameter name=\"value\">METRIC<\/parameter>\r\n         <\/action>\r\n      <\/actions>\r\n   <\/monitoringRule>\r\n   <\/monitoringRules>";
        $scope.slaInput = "<wsag:Agreement xmlns:wsag=\"http:\/\/www.ggf.org\/namespaces\/ws-agreement\" xmlns:sla=\"http:\/\/sla.atos.eu\">\r\n\t<wsag:Name>Chat web application<\/wsag:Name>\r\n\t<wsag:Context>\r\n\t\t<wsag:AgreementInitiator>client<\/wsag:AgreementInitiator>\r\n\t\t<wsag:AgreementResponder>seaclouds<\/wsag:AgreementResponder>\r\n\t\t<wsag:ServiceProvider>AgreementResponder<\/wsag:ServiceProvider>\r\n\t\t<sla:Service xmlns:sla=\"http:\/\/sla.atos.eu\">duke<\/sla:Service>\r\n\t<\/wsag:Context>\r\n\t<wsag:Terms>\r\n\t\t<wsag:All>\r\n\t\t\t<wsag:ServiceProperties wsag:Name=\"NonFunctional\" wsag:ServiceName=\"default\">\r\n\t\t\t\t<wsag:VariableSet>\r\n\t\t\t\t\t<wsag:Variable wsag:Name=\"ResponseTime\" wsag:Metric=\"xs:double\">\r\n\t\t\t\t\t\t<wsag:Location><\/wsag:Location>\r\n\t\t\t\t\t<\/wsag:Variable>\r\n\t\t\t\t\t<wsag:Variable wsag:Name=\"AppAvailable\" wsag:Metric=\"xs:double\">\r\n\t\t\t\t\t\t<wsag:Location><\/wsag:Location>\r\n\t\t\t\t\t<\/wsag:Variable>\r\n\t\t\t\t<\/wsag:VariableSet>\r\n\t\t\t<\/wsag:ServiceProperties>\r\n\t\t\t<wsag:GuaranteeTerm wsag:Name=\"ResponseTimeGT\">\r\n\t\t\t\t<wsag:ServiceLevelObjective>\r\n\t\t\t\t\t<wsag:KPITarget>\r\n\t\t\t\t\t\t<wsag:KPIName>ResponseTime<\/wsag:KPIName>\r\n\t\t\t\t\t\t<wsag:CustomServiceLevel>{\"constraint\": \"ResponseTimeViolated NOT_EXISTS\", \"qos\" : \"ResponseTime LT 1.5\"}<\/wsag:CustomServiceLevel>\r\n\t\t\t\t\t<\/wsag:KPITarget>\r\n\t\t\t\t<\/wsag:ServiceLevelObjective>\r\n\t\t\t<\/wsag:GuaranteeTerm>\r\n\t\t\t<wsag:GuaranteeTerm wsag:Name=\"AppAvailableGT\">\r\n\t\t\t\t<wsag:ServiceLevelObjective>\r\n\t\t\t\t\t<wsag:KPITarget>\r\n\t\t\t\t\t\t<wsag:KPIName>AppAvailable<\/wsag:KPIName>\r\n\t\t\t\t\t\t<wsag:CustomServiceLevel>{\"constraint\": \"AppAvailableViolated NOT_EXISTS\", \"qos\" : \"AppAvailable GT 0.99\"}<\/wsag:CustomServiceLevel>\r\n\t\t\t\t\t<\/wsag:KPITarget>\r\n\t\t\t\t<\/wsag:ServiceLevelObjective>\r\n\t\t\t<\/wsag:GuaranteeTerm>\r\n\t\t<\/wsag:All>\r\n\t<\/wsag:Terms>\r\n<\/wsag:Agreement>";
        $scope.wizardLog = "";


        // File uploader
        $scope.matchmakerInputFile = undefined;
        $scope.optimizerInputFile = undefined;
        $scope.damInputFile = undefined;
        $scope.monitoringModelInputFile = undefined;
        $scope.monitoringRulesInputFile = undefined;
        $scope.slaInputFile = undefined;

        //TODO: Link topology with the editor
        $scope.topology = {
            "nodes": [],
            "links": []
        };

        $scope.topologyStep4 = {
            "nodes": [{
                "name": "webapp",
                "label": "Java Web Application",
                "type": "WebApplication",
                "status": "unknown",
                "properties": {"language": "JAVA"}
            }, {
                "name": "database",
                "label": "MySQL Database",
                "type": "Database",
                "status": "running",
                "properties": {"category": "mysql"}
            }, {"name": "cf", "label": "CloudFoundry Pivotal", "type": "Cloud", "properties": {}}, {
                "name": "aws","label": "Amazon EC2", "type": "Cloud", "properties": {}
            }],
            "links": [
                {"source": "webapp", "target": "database", "properties": {}}, 
                {"source": "webapp","target": "cf", "properties": {} }, 
                {"source": "database", "target": "aws", "properties": {}}
            ]
        };

        $scope.processAAM = function () {
            if (isValidYAML($scope.matchmakerInput)) {
                $scope.SeaCloudsApi.matchmake($scope.matchmakerInput).
                    success(function (adp) {
                        $scope.matchmakerResult = JSON.stringify(adp);
                        notificationService.success('The matchmaking process finished succesfully');
                    })
                    .error(function () {
                        notificationService.error('Something wrong happened');
                    });
            } else {
                notificationService.error('Syntax error, the input file must be a YAML file');
            }

        }

        $scope.processADP = function () {
            if (isValidYAML($scope.optimizerInput)) {
                $scope.SeaCloudsApi.optimize($scope.optimizerInput)
                    .success(function (dam) {
                        $scope.optimizerResult = JSON.stringify(dam);
                        notificationService.success('The optimization process finished succesfully');
                    })
                    .error(function () {
                        notificationService.error('Something wrong happened');
                    });
            } else {
                notificationService.error('Bad syntax');
            }

        }


        $scope.deployApplication = function () {

            var damSuccessCb = function () {
                $scope.wizardLog += "Starting the deployment process...";
                $scope.wizardLog += "\t Done. \n";
            }

            var damFailCb = function () {
                $scope.wizardLog += "Starting the deployment process...";
                $scope.wizardLog += "\t ERROR. \n";
            }


            var rulesSuccessCb = function () {
                $scope.wizardLog += "Installing Monitoring Rules...";
                $scope.wizardLog += "\t Done. \n";
            }

            var rulesFailCb = function () {
                $scope.wizardLog += "Installing Monitoring Rules...";
                $scope.wizardLog += "\t ERROR. \n";
            }

            var agreementSuccessCb = function () {
                $scope.wizardLog += "Installing Service Level Agreements...";
                $scope.wizardLog += "\t Done. \n";
            }

            var agreementFailCb = function () {
                $scope.wizardLog += "Installing Service Level Agreements...";
                $scope.wizardLog += "\t ERROR. \n";
            }


            $scope.SeaCloudsApi.addProject($scope.damInput, damSuccessCb, damFailCb, $scope.monitoringRulesInput, rulesSuccessCb, rulesFailCb,
                $scope.slaInput, agreementSuccessCb, agreementFailCb).
                success(function (data) {
                    $scope.wizardLog += "\n\n";
                    $scope.wizardLog += "The application deployment process was triggered succesfully*. \n";
                    $scope.wizardLog += "\n\n\n\n* Please notice that although the wizard finished the application runtime \n" +
                    "failures could happen please go to the status view in order to verify \n" +
                    "that everything is running properly."
                    $scope.$apply()
                }).
                error(function (data) {
                    $scope.wizardLog += "\n\n";
                    $scope.wizardLog += "Something wrong happened!\n";
                    $scope.wizardLog += "Please restart the process and try again\n";
                    $scope.wizardLog += "All the changes were reverted.\n";
                    $scope.$apply()
                })


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
                    return true;
                case 4:
                    return isValidYAML($scope.damInput)
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
                        }
                        r.readAsText(scope.matchmakerInputFile[0]);
                    }
                });

                scope.$watch('optimizerInputFile', function () {
                    if (scope.optimizerInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.optimizerInput = e.target.result;
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
                        }
                        r.readAsText(scope.damInputFile[0]);
                    }
                });

                scope.$watch('monitoringModelInputFile', function () {
                    if (scope.monitoringModelInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.monitoringModelInput = e.target.result;
                        }
                        r.readAsText(scope.monitoringModelInputFile[0]);
                    }
                });

                scope.$watch('monitoringRulesInputFile', function () {
                    if (scope.monitoringRulesInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.monitoringRulesInput = e.target.result;
                        }
                        r.readAsText(scope.monitoringRulesInputFile[0]);
                    }
                });

                scope.$watch('slaInputFile', function () {
                    if (scope.slaInputFile) {
                        var r = new FileReader();
                        r.onload = function (e) {
                            scope.$parent.slaInput = e.target.result;
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
