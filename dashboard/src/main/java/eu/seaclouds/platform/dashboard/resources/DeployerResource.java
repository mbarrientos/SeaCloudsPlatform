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

package eu.seaclouds.platform.dashboard.resources;


import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import eu.seaclouds.platform.dashboard.config.DeployerFactory;
import eu.seaclouds.platform.dashboard.http.HttpDeleteRequestBuilder;
import eu.seaclouds.platform.dashboard.http.HttpGetRequestBuilder;
import eu.seaclouds.platform.dashboard.http.HttpPostRequestBuilder;
import org.apache.http.entity.StringEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Iterator;

@Path("/deployer")
public class DeployerResource {
    static Logger log = LoggerFactory.getLogger(DeployerResource.class);

    private final DeployerFactory deployer;

    public DeployerResource(){
        this(new DeployerFactory());
        log.warn("Using default configuration for DeployerResource");
    }

    public DeployerResource(DeployerFactory deployerFactory) {
        this.deployer = deployerFactory;
    }
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("applications/{id}")
    public Response removeApplication(@PathParam("id") String id) {
        //TODO: Remove monitoring rules and so on when the application is removed
        if (id == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        try {
            String deployerResponse = new HttpDeleteRequestBuilder()
                    .host(deployer.getEndpoint())
                    .setCredentials(deployer.getUser(), deployer.getPassword())
                    .path("/v1/applications/" + id)
                    .build();

            return Response.ok(deployerResponse).build();
        } catch (IOException | URISyntaxException e) {
            log.error(e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @POST
    @Path("applications")
    @Produces(MediaType.APPLICATION_JSON)
    public Response addApplication(String dam) {
        if (dam == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        } else {
            if (dam != null) {
                try {
                    String deployerResponse = new HttpPostRequestBuilder()
                            .entity(new StringEntity(dam))
                            .host(deployer.getEndpoint())
                            .setCredentials(deployer.getUser(), deployer.getPassword())
                            .path("/v1/applications")
                            .build();
                    return Response.ok(deployerResponse).build();
                } catch (IOException | URISyntaxException e) {
                    log.error(e.getMessage());
                    return Response.status(Response.Status.BAD_REQUEST).build();
                }
            } else {
                return Response.status(Response.Status.NOT_ACCEPTABLE).build();
            }
        }
    }

    @GET
    @Path("applications")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listApplications() {
        try {
            String deployerResponse = new HttpGetRequestBuilder()
                    .host(deployer.getEndpoint())
                    .setCredentials(deployer.getUser(), deployer.getPassword())
                    .path("/v1/applications/tree")
                    .build();

            JsonArray applicationList = new JsonParser().parse(deployerResponse).getAsJsonArray();

            //TODO: This is not recursive, it only retrieves locations in the first level of  the application topology
            for (JsonElement application : applicationList) {
                for (JsonElement entity : application.getAsJsonObject().getAsJsonArray("children")) {
                    deployerResponse = new HttpGetRequestBuilder()
                            .host(deployer.getEndpoint())
                            .setCredentials(deployer.getUser(), deployer.getPassword())
                            .path("/v1/applications/" + application.getAsJsonObject().get("id").getAsString() +
                                    "/entities/" + entity.getAsJsonObject().get("id").getAsString() + "/locations")
                            .build();
                    entity.getAsJsonObject().add("locations", new JsonParser().parse(deployerResponse));
                }
            }

            return Response.ok(applicationList.toString()).build();

        } catch (IOException | URISyntaxException e) {
            log.error(e.getMessage());
            return Response.status(Response.Status.NOT_FOUND).build();
        }

    }

    @GET
    @Path("metrics/value")
    public Response getMetric(@QueryParam("applicationId") String applicationId,
                              @QueryParam("entityId") String entityId,
                              @QueryParam("metricId") String metricId) {

        if (applicationId != null && entityId != null && metricId != null) {

            try {
                String monitorResponse = new HttpGetRequestBuilder()
                        .host(deployer.getEndpoint())
                        .setCredentials(deployer.getUser(), deployer.getPassword())
                        .path("/v1/applications/" + applicationId + "/entities/" + entityId + "/sensors/" + metricId)
                        .addParam("raw", "true")
                        .build();

                return Response.ok(monitorResponse).build();
            } catch (IOException | URISyntaxException e) {
                log.error(e.getMessage());
                return Response.status(Response.Status.NOT_FOUND).build();
            }

        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }


    private boolean isNumberType(String sensorType) {
        return sensorType.equals("java.lang.Integer")
                || sensorType.equals("java.lang.Double")
                || sensorType.equals("java.lang.Float")
                || sensorType.equals("java.lang.Long")
                || sensorType.equals("java.lang.Short")
                || sensorType.equals("java.lang.BigDecimal")
                || sensorType.equals("java.lang.BigInteger")
                || sensorType.equals("java.lang.Byte");
    }

    private JsonArray retrieveMetrics(String applicationId) throws IOException, URISyntaxException {
        String rawEntityList = new HttpGetRequestBuilder()
                .host(deployer.getEndpoint())
                .setCredentials(deployer.getUser(), deployer.getPassword())
                .path("/v1/applications/" + applicationId + "/entities")
                .build();

        JsonArray entityList = new JsonParser().parse(rawEntityList).getAsJsonArray();
        JsonArray allMetricsList = new JsonArray();
        for (JsonElement entity : entityList) {
            String entityId = entity.getAsJsonObject().getAsJsonPrimitive("id").getAsString();
            String entityName = entity.getAsJsonObject().getAsJsonPrimitive("name").getAsString();

            // Creating entity object
            JsonArray entityMetrics = retrieveMetrics(applicationId, entityId);
            JsonObject entityJson = new JsonObject();
            entityJson.addProperty("id", entityId);
            entityJson.addProperty("name", entityName);
            entityJson.add("metrics", entityMetrics);

            allMetricsList.add(entityJson);
        }

        return allMetricsList;
    }

    private JsonArray retrieveMetrics(String applicationId, String entityId) throws IOException, URISyntaxException {
        String monitorResponse = new HttpGetRequestBuilder()
                .host(deployer.getEndpoint())
                .setCredentials(deployer.getUser(), deployer.getPassword())
                .path("/v1/applications/" + applicationId + "/entities/" + entityId + "/sensors")
                .build();

        JsonArray metricList = new JsonParser().parse(monitorResponse).getAsJsonArray();

        Iterator<JsonElement> metricIterator = metricList.iterator();

        while (metricIterator.hasNext()) {
            JsonObject metric = metricIterator.next().getAsJsonObject();
            metric.remove("links");
            if (!isNumberType(metric.getAsJsonPrimitive("type").getAsString())) {
                metricIterator.remove();
            }
        }

        return metricList.getAsJsonArray();

    }

    @GET
    @Path("metrics")
    public Response availableMetrics(@QueryParam("applicationId") String applicationId) {
        if (applicationId != null) {
            try {
                JsonArray metricList = retrieveMetrics(applicationId);
                return Response.ok(metricList.toString()).build();
            } catch (IOException | URISyntaxException e) {
                log.error(e.getMessage());
                return Response.status(Response.Status.NOT_FOUND).build();
            }

        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

}
