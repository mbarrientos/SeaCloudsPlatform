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
package eu.seaclouds.platform.dashboard.servlets;

import eu.seaclouds.platform.dashboard.ConfigParameters;
import eu.seaclouds.platform.dashboard.utils.HttpPostRequestForwarder;
import org.apache.http.client.ClientProtocolException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class AddMonitoringRulesServlet extends HttpServlet {
    String INSTALL_RULES_PATH = "/monitor-api/rest/installMonitoringRules";

    String RULES_PARAM = "rules";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String rules = request.getParameter(RULES_PARAM);

        if (rules != null) {
            try {
                String fwRequest = new HttpPostRequestForwarder()
                        .request(request)
                        .uri(ConfigParameters.MONITOR_ENDPOINT + INSTALL_RULES_PATH)
                        .forward();

                response.getWriter().write(fwRequest);
            } catch (ClientProtocolException e) {
                response.sendError(500, "Internal server error");
            }
        } else {
            response.sendError(400, "Missing arguments");
        }
    }

}
