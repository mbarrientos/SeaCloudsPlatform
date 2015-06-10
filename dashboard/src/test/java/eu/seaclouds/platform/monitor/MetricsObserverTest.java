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
package eu.seaclouds.platform.monitor;

import brooklyn.test.Asserts;
import eu.seaclouds.platform.dashboard.metrics.DashboardMetricObServer;
import eu.seaclouds.platform.dashboard.metrics.MetricsManager;
import it.polimi.modaclouds.monitoring.metrics_observer.MetricsObServer;
import it.polimi.modaclouds.monitoring.metrics_observer.MonitoringDatum;
import it.polimi.modaclouds.monitoring.metrics_observer.MonitoringDatumHandler;
import java.util.List;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MetricsObserverTest {

    @Test
    public void test1() {

        DashboardMetricObServer mo = new DashboardMetricObServer(8085, "/v1/results");
        try {
            mo.start();
        } catch (Exception e) {
            e.printStackTrace();
        }

        while(true){
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    @Test
    public void concurrencyTest() {
        final MetricsManager mm = MetricsManager.getInstance();
        final int numThreads = 10;
        final String metricKey = "singleTestMetric";
        final Thread[] threads = new Thread[numThreads];
        mm.addMetric(metricKey);
        for (int i = 0; i < numThreads; i++) {
            threads[i] = new Thread(new SingleMetricWriterThread("" + i, metricKey, mm));
            threads[i].start();
        }

        Asserts.succeedsEventually(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < numThreads; i++) {
                    try {
                        threads[i].join();
                    } catch (InterruptedException e) {
                        Assert.fail();
                    }
                }
                mm.peek(metricKey);
                Assert.assertEquals(mm.getCount(metricKey), numThreads * SingleMetricWriterThread.MAX_ITERATIONS);
                mm.consume(metricKey);
                Assert.assertEquals(mm.getCount(metricKey), numThreads * SingleMetricWriterThread.MAX_ITERATIONS - 1);
                mm.clearAll();
                Assert.assertEquals(mm.getCount(metricKey), 0);
                mm.put(metricKey, "test");
                Assert.assertEquals(mm.getCount(metricKey), 1);
                Assert.assertTrue(mm.contains(metricKey));
                mm.removeMetric(metricKey);
                Assert.assertFalse(mm.contains(metricKey));

            }
        });
    }

    public class TestMetricObServer extends MetricsObServer {

        public TestMetricObServer(int listeningPort, String observerPath) {
            super(listeningPort, observerPath, TestResultHandler.class);
        }
    }

    public class TestResultHandler extends MonitoringDatumHandler {

        String res = "";

        @Override
        public void getData(List<MonitoringDatum> list) {
            for (MonitoringDatum datum : list) {
                res += datum.getValue() + ", ";
            }
        }
    }

    public class SingleMetricWriterThread implements Runnable {

        private static final int MAX_ITERATIONS = 10;
        private final MetricsManager mm;
        private final String id;
        private final String metric;

        public SingleMetricWriterThread(String id, String metric, MetricsManager metricsManager) {
            this.id = id;
            this.metric = metric;
            this.mm = metricsManager;
        }

        @Override
        public void run() {
            for (int i = 0; i < MAX_ITERATIONS; i++) {
                mm.put(metric, String.format("%s-%s", id, i));
            }
        }
    }
}


