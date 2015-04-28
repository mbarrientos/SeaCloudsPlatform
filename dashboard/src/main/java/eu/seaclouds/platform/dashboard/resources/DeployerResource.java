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

import brooklyn.rest.client.BrooklynApi;
import brooklyn.rest.domain.ApplicationSummary;
import brooklyn.rest.domain.EntitySummary;
import brooklyn.rest.domain.LocationSummary;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import eu.seaclouds.platform.dashboard.ConfigParameters;
import eu.seaclouds.platform.dashboard.connectors.DeployerConnector;
import eu.seaclouds.platform.dashboard.utils.HttpGetRequestBuilder;
import eu.seaclouds.platform.dashboard.utils.HttpPostRequestBuilder;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/deployer")
@Produces(MediaType.APPLICATION_JSON)
public class DeployerResource {

    @POST
    @Path("addApplication")
    public Response addApplication(@QueryParam("yaml") String yaml) {
        if (yaml == null) {
            Response.status(Response.Status.NOT_FOUND).entity("Missing yaml file");
        }
        try {
            String deployerResponse = new HttpPostRequestBuilder()
                    .host(ConfigParameters.DEPLOYER_ENDPOINT)
                    .path("v1/applications")
                    .addParam("applicationSpec", yaml)
                    .build();
            
            return new Gson().fromJson(deployerResponse, Response.class);
        } catch (IOException e) {
            return Response.serverError().entity("Connection error: couldn't reach Deployer endpoint").build();
        } catch (URISyntaxException e) {
            return Response.serverError().entity("Bad request").build();
        }
    }
    
    @GET
    @Path("listApplications")
    public Response listApplications(){
        try {
            String rawApplicationsList = new HttpGetRequestBuilder()
                    .host(ConfigParameters.DEPLOYER_ENDPOINT)
                    .path("v1/applications")
                    .build();

            List<ApplicationSummary> applicationSummaries = 
                    new Gson().fromJson(
                            rawApplicationsList, 
                            new TypeToken<List<ApplicationSummary>>(){}.getType());
            
            for (ApplicationSummary application : applicationSummaries) {
                // TODO: complete
                // ....
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }

        return null;
    }
    
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        BrooklynApi BROOKLYN_API = new DeployerConnector().getConnection();
        if (BROOKLYN_API != null) {
            List<ApplicationSummary> applicationSummaries = BROOKLYN_API.getApplicationApi().list();

            Collections.sort(applicationSummaries, new Comparator<ApplicationSummary>() {
                @Override
                public int compare(ApplicationSummary s1, ApplicationSummary s2) {
                    return s1.getId().compareTo(s2.getId());
                }
            });

            JsonArray jsonResult = new JsonArray();

            for (ApplicationSummary application : applicationSummaries) {

                JsonObject jsonApplication = new JsonObject();
                jsonResult.add(jsonApplication);

                jsonApplication.addProperty("id", application.getId());
                jsonApplication.addProperty("status", application.getStatus().toString());

                JsonObject jsonSpec = new JsonObject();
                jsonApplication.add("spec", jsonSpec);

                jsonSpec.addProperty("name", application.getSpec().getName());
                jsonSpec.addProperty("type", application.getSpec().getName());

                JsonArray jsonDescendantsEntities = new JsonArray();
                jsonApplication.add("descendants", jsonDescendantsEntities);

                List<EntitySummary> descendants;
                try {
                    descendants = BROOKLYN_API.getEntityApi().list(application.getId());

                    if (descendants != null) {
                        for (EntitySummary childEntity : descendants) {
                            JsonObject jsonDescendantEntity = new JsonObject();
                            jsonDescendantsEntities.add(jsonDescendantEntity);


                            jsonDescendantEntity.addProperty("id", childEntity.getId());
                            jsonDescendantEntity.addProperty("name", childEntity.getName());
                            jsonDescendantEntity.addProperty("type", childEntity.getType());

                            JsonArray jsonArrayLocations = new JsonArray();
                            jsonDescendantEntity.add("locations", jsonArrayLocations);

                            List<LocationSummary> locations = BROOKLYN_API.getEntityApi().getLocations(application.getId(), childEntity.getId());
                            if (locations != null) {

                                for (LocationSummary locationSummary : locations) {
                                    LocationSummary locationDetails = BROOKLYN_API.getLocationApi().get(locationSummary.getId(), null);

                                    if (locationDetails != null) {
                                        JsonObject jsonLocation = new JsonObject();
                                        jsonArrayLocations.add(jsonLocation);
                                        jsonLocation.addProperty("id", locationDetails.getId());
                                        jsonLocation.addProperty("name", locationDetails.getName());
                                        jsonLocation.addProperty("type", locationDetails.getType());
                                        jsonLocation.addProperty("spec", locationDetails.getSpec());
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    // The application removed after calling getApplicationApi().list()
                    jsonResult.remove(jsonApplication);
                }
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(new Gson().toJson(jsonResult));

        } else { // Can't connect with Brooklyn endpoint
            response.sendError(500, "Connection error: couldn't reach Deployer endpoint");
        }
    }

}
