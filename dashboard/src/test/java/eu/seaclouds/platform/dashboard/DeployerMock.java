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

package eu.seaclouds.platform.dashboard;

import java.util.concurrent.TimeUnit;
import org.mockserver.client.server.MockServerClient;
import org.mockserver.matchers.Times;
import org.mockserver.model.Delay;
import org.mockserver.model.Header;
import org.mockserver.model.HttpRequest;
import org.mockserver.model.HttpResponse;

import static javax.ws.rs.core.Response.Status.BAD_REQUEST;

public class DeployerMock {
    
    public static final String SAMPLE_YAML = "name: appserver-w-db\n" +
            "services:\n" +
            "- type: brooklyn.entity.webapp.jboss.JBoss7Server\n" +
            "  name: AppServer HelloWorld \n" +
            "  brooklyn.config:\n" +
            "    wars.root: http://search.maven.org/remotecontent?filepath=io/brooklyn/example/brooklyn-example-hello-world-sql-webapp/0.6.0/brooklyn-example-hello-world-sql-webapp-0.6.0.war\n" +
            "    http.port: 8080+\n" +
            "    java.sysprops: \n" +
            "      brooklyn.example.db.url: $brooklyn:formatString(\"jdbc:%s%s?user=%s\\\\&password=%s\",\n" +
            "         component(\"db\").attributeWhenReady(\"datastore.url\"), \"visitors\", \"brooklyn\", \"br00k11n\")\n" +
            "- type: brooklyn.entity.database.mysql.MySqlNode\n" +
            "  id: db\n" +
            "  name: DB HelloWorld Visitors\n" +
            "  brooklyn.config:\n" +
            "    datastore.creation.script.url: https://github.com/apache/incubator-brooklyn/raw/master/usage/launcher/src/test/resources/visitors-creation-script.sql\n";
    
    public void setup(){
        
        new MockServerClient("127.0.0.1", 8081)
                .when(
                        HttpRequest.request()
                                .withMethod("POST")
                                .withPath("/deployer/application")
                                .withQueryStringParameter("yaml", SAMPLE_YAML),
                        Times.exactly(1)
                )
                .respond(
                        HttpResponse.response()
                                .withStatusCode(200)
                                .withHeaders(
                                        new Header("Content-Type", "application/json; charset=utf-8"),
                                        new Header("Cache-Control", "public, max-age=86400")
                                )
                                .withBody("{ }")
                                .withDelay(new Delay(TimeUnit.SECONDS, 1))
                );
        
        new MockServerClient("127.0.0.1", 8081)
                .when(
                        HttpRequest.request()
                                .withMethod("DELETE")
                                .withPath("/deployer/application")
                                .withQueryStringParameter("id"),
                        Times.exactly(1)
                )
                .respond(
                        HttpResponse.response()
                                .withStatusCode(BAD_REQUEST.getStatusCode())
                                .withHeaders(
                                        new Header("Content-Type", "application/json; charset=utf-8"),
                                        new Header("Cache-Control", "public, max-age=86400")
                                )
                                .withBody("{ }")
                                .withDelay(new Delay(TimeUnit.SECONDS, 1))
                );
        
        
        // listApplications
        new MockServerClient("127.0.0.1", 8081)
                .when(
                        HttpRequest.request()
                                .withMethod("GET")
                                .withPath("/deployer/applications"),
                        Times.exactly(1)
                )
                .respond(
                        HttpResponse.response()
                                .withStatusCode(200)
                                .withHeaders(
                                        new Header("Content-Type", "application/json; charset=utf-8"),
                                        new Header("Cache-Control", "public, max-age=86400")
                                )
                                .withBody("[]")
                                .withDelay(new Delay(TimeUnit.SECONDS, 1))
                );
    }
}
