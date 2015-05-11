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

package eu.seaclouds.platform.dashboard.resources;


import eu.seaclouds.platform.dashboard.ConfigParameters;
import eu.seaclouds.platform.dashboard.utils.HttpPostRequestBuilder;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.URISyntaxException;

@Path("/sla")
@Produces(MediaType.APPLICATION_JSON)
public class SlaResource {

    @POST
    @Path("agreements")
    public Response addAgreements(@QueryParam("agreements") String agreements,
                                   @QueryParam("rules") String rules) {

        if (agreements != null && rules != null) {
            try {


                String slaResponse = new HttpPostRequestBuilder()
                        .multipartPostRequest(true)
                        .addParam("agreements", agreements)
                        .addParam("rules", rules)
                        .host(ConfigParameters.SLA_ENDPOINT)
                        .path("/sla-service/seaclouds/agreements")
                        .build();

                return Response.ok(slaResponse).build();
            } catch (URISyntaxException | IOException e) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }
    

}
