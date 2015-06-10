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

import com.google.common.collect.Maps;
import com.google.common.collect.Queues;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MetricsManager {
    static Logger log = LoggerFactory.getLogger(MetricsManager.class);

    private static MetricsManager instance;
    private MetricsManager(){}

    private Map<String, ConcurrentLinkedQueue<String>> queueMap = Maps.newConcurrentMap();
    
    public static MetricsManager getInstance(){
        if (instance == null) {
            instance = new MetricsManager();
        }
        return instance;
    }
    
    public void addMetric(String metric){
        queueMap.put(metric, Queues.<String>newConcurrentLinkedQueue());
    }
    
    public void removeMetric(String metricKey) {
        if (queueMap.remove(metricKey) == null){
            log.warn("Trying to remove metric '" + metricKey + "', which doesn't exist");
        }
    }
    
    public String consume(String metric){
        return queueMap.get(metric).poll();
    }
    
    public String peek(String metric){
        return queueMap.get(metric).peek();
    }
    
    public void put(String metric, String value){
        queueMap.get(metric).add(value);
    }
    
    public boolean contains(String metric){
        return queueMap.containsKey(metric);
    }
    
    public int getCount(String metric){
        return queueMap.get(metric).size();
    }
    
    public void clear(String metric){
        queueMap.get(metric).clear();
    }
    
    public void clearAll(){
        for (String key: queueMap.keySet()){
            queueMap.get(key).clear();
        }
    }


}
