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

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

/**
 * Performs an HTTP request.
 */
public abstract class HttpRequestBuilder {
    private static final String DEFAULT_SCHEME = "http";
    protected List<NameValuePair> params;
    protected ResponseHandler<String> responseHandler;
    protected String host;
    protected String path;
    protected String scheme;

    public HttpRequestBuilder() {
        this.scheme = DEFAULT_SCHEME;
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
    
    public HttpRequestBuilder params(Map<String, String[]> params) throws UnsupportedEncodingException {
        this.params = new ArrayList<>();
        for (String pKey : params.keySet()){
            for (String p : params.get(pKey)) {
                this.params.add(new BasicNameValuePair(pKey, p));
            }
        }
        return this;
    }

    public HttpRequestBuilder addParam(String key, String value){
        if (params == null) {
            params = new ArrayList<>();
        }
        
        params.add(new BasicNameValuePair(key, value));
        return this;
    }

    public HttpRequestBuilder host(String host) {
        this.host = host;
        return this;
    }

    public HttpRequestBuilder path(String path) {
        this.path = path;
        return this;
    }
    
    public HttpRequestBuilder scheme(String scheme) {
        this.scheme = scheme;
        return this;
    }

    public HttpRequestBuilder responseHandler(ResponseHandler<String> handler){
        this.responseHandler = handler;
        return this;
    }

    public abstract String build() throws IOException, URISyntaxException;

}
