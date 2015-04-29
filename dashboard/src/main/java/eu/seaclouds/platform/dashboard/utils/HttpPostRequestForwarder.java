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

package eu.seaclouds.platform.dashboard.utils;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Forwards a POST HTTP request to another URL, by using Apache HttpClient.
 */
public class HttpPostRequestForwarder {

    private List<BasicNameValuePair> params;
    HttpPost requestBase;
    private ResponseHandler<String> responseHandler;
    private HttpServletRequest request;

    public HttpPostRequestForwarder params(Map<String, String[]> params){
        this.params = new ArrayList<>();
        for (String pKey : params.keySet()){
            for (String p : params.get(pKey)) {
                this.params.add(new BasicNameValuePair(pKey, p));
            }
        }
        return this;
    }

    public HttpPostRequestForwarder uri(String uri){
        requestBase = new HttpPost(uri);
        return this;
    }

    public HttpPostRequestForwarder responseHandler(ResponseHandler<String> handler){
        this.responseHandler = handler;
        return this;
    }

    public HttpPostRequestForwarder request(HttpServletRequest request) {
        this.request = request;
        this.params(request.getParameterMap());
        return this;
    }

    public String forward() throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            if (this.params != null) {
                requestBase.setEntity(new UrlEncodedFormEntity(this.params));
            }

            if (this.responseHandler == null) {
                this.responseHandler = new ResponseHandler<String>() {
                    public String handleResponse(
                            final HttpResponse response) throws IOException {
                        int status = response.getStatusLine().getStatusCode();
                        if (status >= 200 && status < 300) {
                            HttpEntity entity = response.getEntity();
                            return entity != null ? EntityUtils.toString(entity) : null;
                        } else {
                            throw new ClientProtocolException("Unexpected response status: " + status);
                        }
                    }

                };
            }

            return httpClient.execute(requestBase, responseHandler);
        }
    }
}
