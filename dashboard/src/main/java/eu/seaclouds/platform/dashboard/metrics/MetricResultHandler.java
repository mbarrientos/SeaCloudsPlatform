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

package eu.seaclouds.platform.dashboard.metrics;

import it.polimi.modaclouds.monitoring.metrics_observer.MonitoringDatum;
import it.polimi.modaclouds.monitoring.metrics_observer.MonitoringDatumHandler;
import java.util.List;

public class MetricResultHandler extends MonitoringDatumHandler {

    private MetricsManager mm;

    public MetricResultHandler(){
        this.mm = MetricsManager.getInstance();
    }
    
    public MetricResultHandler(MetricsManager mm){
        if(mm != null){
            this.mm = mm;
        } else {
            this.mm = MetricsManager.getInstance();
        }
    }
    
    public void getData(List<MonitoringDatum> list) {
        System.out.println("getData: " + list);
        for (MonitoringDatum datum : list){
            String metricKey = datum.getMetric();
            if (!mm.contains(metricKey)){
                mm.addMetric(metricKey);
            }
            mm.put(metricKey, datum.getValue());
        }
    }
}
