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

import eu.seaclouds.platform.dashboard.DeployerMock;
import javax.ws.rs.core.Response;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class DeployerIntegrationTest {

    private DeployerMock deployerMock;
    private DeployerResource deployer;

    @BeforeMethod
    public void setUp(){
        deployerMock = new DeployerMock();
        deployerMock.setup();
        
        deployer = new DeployerResource();
    }
    
    @AfterMethod
    public void tearDown(){
        
    }

    @Test(groups = {"integration"})
    public void testDeployerResource(){
        
    }
    
    @Test(groups = {"integration"})
    public void testDeployerResourceWithMock(){
        Response response = deployer.addApplication(DeployerMock.SAMPLE_YAML);
        Assert.assertEquals(response, "[]");
    }

}