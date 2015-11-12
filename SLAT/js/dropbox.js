/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Interacting with Dropbox   
*/ 
var DROPBOX_APP_KEY = 'ggludz9cg3xq1lq';
var DROPBOX_APP_SECRET = '9zeykvpdfuwlzo7';
var REQUEST_HEADER = "";
var logedIn = false;
var designerInfo = null;
var projectID ="";
var databaseHandle = "";
var databaseRevision = "";
var allMedia = new Array();//Store all media items
    
function SharcDropBox()
{      
    //////////////////////AUTHENTICATION/////////////////////////////
    this.logIn = function()////Step 1 + 2 of authentication.
    {              
        if(!logedIn)
        {
            //https://www.dropbox.com/developers/blog/20/using-oauth-10-with-the-plaintext-signature-method
            //POST https://api.dropbox.com/1/oauth/request_token
            //Your HTTP request should have the following header:
            //Authorization: OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="<app-key>", oauth_signature="<app-secret>&"
            //Step 1: Obtain an OAuth request token to be used for the rest of the authentication process.
            
            $.ajax({
                type:'POST',
                url: 'https://api.dropbox.com/1/oauth/request_token',
                headers: { 'Authorization': 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ DROPBOX_APP_KEY + '", oauth_signature="'+ DROPBOX_APP_SECRET + '&"' },
                success: function(data) {                
                    var params = parseQueryString(data);
                    localStorage.setItem("oauth_token",params["oauth_token"]);
                    localStorage.setItem("oauth_token_secret",params["oauth_token_secret"]);
                    //Step 2: Applications should direct the user to /oauth/authorize.
                    window.location.href = 'https://www.dropbox.com/1/oauth/authorize?oauth_token=' + params["oauth_token"] + '&oauth_callback=http://' + callbackURL;
                }
            });
        }
        else
        {
            logedIn = false;
            $("#userAccount").text("Your account");
            $('#logIn').text("Log in");
            localStorage.setItem("oauth_token","");
            localStorage.setItem("oauth_token_secret","");            
            window.location.href = 'http://' + callbackURL;
            showMenu(false);
        }
    }
    
    this.getAccessToken = function (token)//Step 3 of authentication. After the /oauth/authorize step is complete, the application can call /oauth/access_token to acquire an access token.
    {
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/oauth/access_token',
            headers: { 'Authorization': 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ DROPBOX_APP_KEY + '", oauth_token="' + localStorage.getItem("oauth_token") + '", oauth_signature="' + DROPBOX_APP_SECRET + '&' + localStorage.getItem("oauth_token_secret")+'"' },
            success: function(data) {
                var params = parseQueryString(data);
                localStorage.setItem("oauth_token",params["oauth_token"]);
                localStorage.setItem("oauth_token_secret",params["oauth_token_secret"]);
                REQUEST_HEADER = 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ DROPBOX_APP_KEY + '", oauth_token="' + localStorage.getItem("oauth_token") + '", oauth_signature="' + DROPBOX_APP_SECRET + '&' + localStorage.getItem("oauth_token_secret")+'"';
                $('#logIn').text("Log out");
                //Get user info
                $.ajax({
                    type:'GET',
                    url: 'https://api.dropbox.com/1/account/info',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {                        
                        var result = JSON.parse(data);
                        $("#userAccount").html('Logged in as ' + result.display_name + '<img src="images/arrow.png" class="arrowMenu"/>');
                        designerInfo = new SharcUser(0, result.display_name, result.email, "", "", "Dropbox", result.uid, "");
                        logedIn = true;   
                        showMenu(true);                          
                        resfulManager.updateOrAddUser(designerInfo);                                   
                    },
                    error: function(jqXHR, textStatus, errorThrown ) {
                        showMessage("Error: " + textStatus + " because:" + errorThrown);
                    }
                });                                  
            }
        });         
    }     
     
    this.createSnapshot = function(dsID)//dump all content of an experience to a json file
    {      
        //Open a datastore
        showUploadingStatus("Please wait. Creating a snapshot...");
        var dataContent = {handle:databaseHandle};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/get_snapshot',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                        
                mDropBox.saveSnapshot(projectID + ".json",data);                        
                $("#dialog-status").dialog("close");
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                alert("Error: " + textStatus + " because:" + errorThrown);
            }
        });                   
    }
        
    this.saveSnapshot = function(filename,mdata)//save data to a file in Dropbox and share it with everyone
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',            
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);
                //Share to get public URL and update Project table
                //1. Share the file                
                $.ajax({
                    type:'POST',
                    url: 'https://api.dropbox.com/1/shares/auto' + result.path + '?short_url=false',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {
                        var rs = JSON.parse(data);
                        var url = rs.url;
                        url = url.substring(0,url.lastIndexOf("?"));
                        url = url.replace("https://www.drop","https://dl.drop");
                        //2. Update MySQL database
                        var proCenter = getExperienceBoundary().getCenter();
                        $.post(
                            'php/updateProjectURL.php',
                            {
                                proAuthID: designerInfo.id,
                                proPath: projectID,            
                                proPublicURL: url,
                                proLocation: proCenter.lat() + " " + proCenter.lng()
                            },
                            function(data,status){
                                var result = JSON.parse(data);
                                if(result.success == 1)
                                {    
                                    showMessage("A new snapshot of the current experience has been created and saved in your dropbox folder Dropbox\\Apps\\SharcAu.");
                                }
                                else
                                    showMessage("Error when creating a new snapshot of the current experience: " + result.message);
                        });
                    }
                });                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when saving file: " + textStatus + " because:" + errorThrown);
            }
        });
    }
                           
                
    this.openDatastore = function(dsID)
    {      
        //Main logic: get a snapshot of the datastore of an experience. A snap shot is json string containing all rows of the datastores.
        //             Each row contains a number of fields, one of them is the table id. This function needs to check the table id of each row
        //              to add each row to a suitable array of entity (EOI, POI, Route, Media, Response)
          
        //1. Open the datastore
        showUploadingStatus("Please wait. Loading data...");
        var dataContent = {dsid:dsID};
        projectID = dsID;//Store name of the current project
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/get_datastore',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {
               
                var result = JSON.parse(data);
                databaseHandle = result.handle;
                databaseRevision = result.rev;
                //2. Get data from all tables
                var dataContent = {handle:databaseHandle};
                $.ajax({
                    type:'POST',
                    url: 'https://api.dropbox.com/1/datastores/get_snapshot',
                    data: dataContent,
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {                        
                        var result = JSON.parse(data);
                        var tableID = "";
                        var tmpData;
                        var tmpPoiMarker;      
                        var tmpRouteMarker;
                        var tmpPoiZone;                 
                        var hashTablePOI = new Array();//For fast adding media to POI
                        var hashTableEOI = new Array();//For fast adding media to EOI
                        var hashTableRoute = new Array();//For fast adding media to Route
                        allMedia = [];//Store all media items
                        var tmpMedia = null; 
                        var tmpLatLng;
                        //3. Loop through each row                          
                        for(var i = 0; i < result.rows.length; i ++)
                        {
                            tableID = result.rows[i].tid;
                            tmpData = result.rows[i].data;
                            if(tableID == "POIs")
                            {
                                curPOI = new POI(decodeURI(tmpData.name),tmpData.type,tmpData.associatedEOI,decodeURI(tmpData.desc),tmpData.latLng,result.rows[i].rowid,tmpData.associatedRoute, tmpData.triggerZone);
                                if(tmpData.mediaOrder != undefined && tmpData.mediaOrder != "")
                                    curPOI.mediaOrder = tmpData.mediaOrder.trim().split(" ");                                     
                                
                                //Geofence
                                if(curPOI.triggerZone == null)
                                {
                                    tmpPoiZone = new google.maps.Circle({					
                                		center: tmpLatLng, radius: 20,
                                		strokeColor: "#00FF00", strokeOpacity: 1.0, strokeWeight: 2,
                                		fillColor: "#00FF00", fillOpacity: 0.3,		
                                		map: map
                                	});
                                    curPOI.triggerZone = "circle 00FF00 20" + " " + tmpLatLng.lat() + " " + tmpLatLng.lng();
                                }
                                else
                                {
                                    var fenceInfo = curPOI.triggerZone.trim().split(" ");
                                    if(fenceInfo[0]== "circle") //String format-->circle colourWithout# Radius Lat Lng
                                    {
                                        tmpPoiZone = new google.maps.Circle({					
                                    		center: new google.maps.LatLng(parseFloat(fenceInfo[3]), parseFloat(fenceInfo[4])), 
                                            radius: parseFloat(fenceInfo[2]),
                                    		strokeColor: "#" + fenceInfo[1], strokeOpacity: 1.0, strokeWeight: 2,
                                    		fillColor: "#" + fenceInfo[1], fillOpacity: 0.3,		
                                    		map: map
                                    	});
                                    }
                                    else if(fenceInfo[0]== "polygon")//String format-->polygon colourWithout# Lat1 Lng1 Lat2 Lng2
                                    {
                                        
                                        var polyPath = new Array();
                            			var k = 2;
                            			while (k < fenceInfo.length)
                            			{
                            				var tmpPoint =  new google.maps.LatLng(parseFloat(fenceInfo[k]), parseFloat(fenceInfo[k+1]));				
                            				polyPath.push(tmpPoint);
                            				k+=2;
                            			}
                                        
                                        tmpPoiZone = new google.maps.Polygon({					
                                    		paths: polyPath,
                                            strokeColor: "#" + fenceInfo[1], strokeOpacity: 1.0, strokeWeight: 2,
                                    		fillColor: "#" + fenceInfo[1], fillOpacity: 0.3,		
                                    		map: map
                                    	});
                                    }
                                }
                                allPOIZones.push(tmpPoiZone);                                
                                hashTablePOI[curPOI.id] = allPOIs.length;//key = id and value = index of POI in array --> to associate media with POI later
                                allPOIs.push(curPOI);                                                                
                            }
                            else if(tableID == "media")
                            {
                                tmpMedia = new Media(result.rows[i].rowid, decodeURI(tmpData.name),tmpData.type,decodeURI(tmpData.desc),decodeURI(tmpData.content),tmpData.noOfLike,tmpData.context,tmpData.PoIID,tmpData.attachedTo);
                                allMedia.push(tmpMedia);                                
                            }                            
                            else if(tableID == "EOIs")
                            {
                                curEOI = new EOI(result.rows[i].rowid, decodeURI(tmpData.name),decodeURI(tmpData.startDate),decodeURI(tmpData.endDate),decodeURI(tmpData.desc),tmpData.associatedPOI,tmpData.associatedRoute);
                                if(tmpData.mediaOrder != undefined && tmpData.mediaOrder != "")
                                   curEOI.mediaOrder = tmpData.mediaOrder.trim().split(" ");                                 
                                hashTableEOI[curEOI.id] = allEOIs.length;//key = id and value = index of EOI in array
                                allEOIs.push(curEOI);
                            }
                            else if(tableID == "POITypes")
                            {
                                curPOIType = new POIType(result.rows[i].rowid, decodeURI(tmpData.name),tmpData.icon,decodeURI(tmpData.desc));
                                allPOITypes.push(curPOIType);
                            }
                            else if(tableID == "Routes")
                            {
                                var directed = tmpData.directed;
                                if(directed == undefined)
                                    directed = true;
                                //get points of path
                                var allCoors = new Array();
                                if(tmpData.polygon.trim()!= "")
                                    allCoors = tmpData.polygon.split(" ");
                                
                                var tmpPath = new Array();
                                for(k = 0; k < allCoors.length; k=k+2)
                            	{		
                            		tmpPath.push(new google.maps.LatLng(allCoors[k],allCoors[k+1]));
                            	}
                                routePath = new google.maps.Polyline({ path: tmpPath,geodesic: true,editable:false, map: map, strokeColor: ("#" + tmpData.colour),strokeOpacity: 1.0,strokeWeight: 2}); 
                                allRoutePaths.push(routePath);
                                
                                //show start and end marker
                                                                
                            	
                        		var tmpR = routePath.getPath().getArray();
                                if (tmpR.length > 0)
                                {		
                            		tmpRouteMarker = new google.maps.Marker({
                                        position: new google.maps.LatLng(0,0),
                                        draggable:true,
                                        icon: "images/end.png",
                                        map:null
                                    });
                                    tmpRouteMarker.setPosition(tmpR[tmpR.length - 1]);
                            		if(directed)
                                        tmpRouteMarker.setMap(map);
                                    allRouteMarkers.push(tmpRouteMarker);
                                    
                                    tmpRouteMarker = new google.maps.Marker({
                                        position: new google.maps.LatLng(0,0),
                                        draggable:true,
                                        icon: "images/start.png",
                                        map:null
                                    });
                                    tmpRouteMarker.setPosition(tmpR[0]);
                            		if(directed)
                                        tmpRouteMarker.setMap(map);
                                    allRouteMarkers.push(tmpRouteMarker);
                                }
                            	
                                
                                curRoute = new Route(result.rows[i].rowid, decodeURI(tmpData.name), decodeURI(tmpData.desc),"#" + tmpData.colour,tmpData.associatedPOI,routePath.getPath(),tmpData.associatedEOI, directed);
                                
                                if(tmpData.mediaOrder != undefined && tmpData.mediaOrder != "")
                                   curRoute.mediaOrder = tmpData.mediaOrder.trim().split(" ");
                                 
                                hashTableRoute[curRoute.id] = allRoutes.length;//key = id and value = index of route in array
                                
                                allRoutes.push(curRoute);
                                
                            }
                            else if(tableID == "Responses")
                            {
                                curResponse = new Response(result.rows[i].rowid, tmpData.type,tmpData.desc,tmpData.content,tmpData.noOfLike,tmpData.entityType,tmpData.entityID,tmpData.consumerName,tmpData.consumerEmail,tmpData.status, tmpData.size);
                                allResponses.push(curResponse);
                            }
                        }
                        //Associate media with entities
                        for(var i = 0; i< allMedia.length; i++)
                        {
                            if(allMedia[i].attachedTo == "POI")
                            {
                                if(allPOIs[hashTablePOI[allMedia[i].PoIID]] != undefined)
                                    allPOIs[hashTablePOI[allMedia[i].PoIID]].associatedMedia[allMedia[i].id] = allMedia[i];
                            }
                            else if(allMedia[i].attachedTo == "EOI")
                            {
                                if(allEOIs[hashTableEOI[allMedia[i].PoIID]] != undefined)
                                    allEOIs[hashTableEOI[allMedia[i].PoIID]].associatedMedia[allMedia[i].id] = allMedia[i];
                            }
                            else if(allMedia[i].attachedTo == "ROUTE")
                            {
                                if(allRoutes[hashTableRoute[allMedia[i].PoIID]] != undefined)
                                    allRoutes[hashTableRoute[allMedia[i].PoIID]].associatedMedia[allMedia[i].id] = allMedia[i];
                            }
                        }
                        
                        //Associate responses with entities
                        for(var i = 0; i< allResponses.length; i++)
                        {
                            if(allResponses[i].entityType == "POI")
                            {
                                if(allPOIs[hashTablePOI[allResponses[i].entityID]] != undefined)
                                {
                                    allResponses[i].entityName = allPOIs[hashTablePOI[allResponses[i].entityID]].name;
                                    allPOIs[hashTablePOI[allResponses[i].entityID]].associatedResponses[allResponses[i].id] = allResponses[i];
                                }
                            }
                            else if(allResponses[i].entityType == "EOI")
                            {
                                if(allEOIs[hashTableEOI[allResponses[i].entityID]] != undefined)
                                {
                                    allResponses[i].entityName = allEOIs[hashTableEOI[allResponses[i].entityID]].name;
                                    allEOIs[hashTableEOI[allResponses[i].entityID]].associatedResponses[allResponses[i].id] = allResponses[i];
                                }
                            }
                            else if(allResponses[i].entityType == "ROUTE")
                            {
                                allResponses[i].entityID =  "";
                            }
                            else if(allResponses[i].entityType == "NEW")
                            {
                                //allResponses[i].entityID =  "";
                            }
                            
                            if(allResponses[i].status == "Waiting")
                                allNewResponses.push(allResponses[i]);
                        }
                        
                        //Draw POIs
                        for(var i = 0; i< allPOIs.length; i++)
                        {
                            curPOI = allPOIs[i];
                            tmpLatLng = curPOI.getLatLng();
                            var poiIcon = null;
                            if(curPOI.type == "accessibility")
                                poiIcon = "images/access.png";
                            else
                            {
                                poiIcon = getFirstImage(curPOI);
                                if(poiIcon == null)
                                    poiIcon = "images/poi.png";
                            }                         
                            tmpPoiMarker = new google.maps.Marker({  
                            			   position: tmpLatLng, map: map, zIndex:2,visible: true,draggable: false,
                            			   icon: poiIcon, title: curPOI.name,id: allPOIMarkers.length	
                            		    });
                            //markerManager.addMarker(tmpPoiMarker);
                            addMarkerPOIClickEvent(tmpPoiMarker);                                
                            allPOIMarkers.push(tmpPoiMarker);
                            
                            //Viz of POI
                            var tmpPath =  curPOI.getPoiVizPath();
                            if(tmpPath.length > 0)
                            {
                                var poiViz = new google.maps.Polyline({ path: tmpPath,geodesic: true,editable:false, map: map, strokeColor: ("#FF0000"),strokeOpacity: 1.0,strokeWeight: 2}); 
                                allPoiViz.push(poiViz);
                            }
                            else 
                                allPoiViz.push(null);
                        } 
                        
                        $("#noOfPOI").text("Number of POIs: " + allPOIs.length);
                        $("#noOfEOI").text("Number of EOIs: " + allEOIs.length);
                        $("#noOfROU").text("Number of Routes: " + allRoutes.length);
                        
                        showNotification();//Red rectangle next to the Response menu to indicate new responses    
                        showMapWithCorrectBound(map,maxZoomLevel)    
                        
                        $('.ui-dialog-titlebar').show();
                        $("#dialog-status").dialog("close");
                    },
                    error: function(jqXHR, textStatus, errorThrown ) {
                        alert("Error: " + textStatus + " because:" + errorThrown);
                    }
                });   
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });                   
    }
    //////////////////////SHARE/////////////////////////////
    this.updateCommand = function(dataChanges)//dataChanges is a string that can contains multiple CRUD statements
    {        
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:dataChanges};        
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                   
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    } 
    
    this.saveFile = function(filename,mdata)//Save data to file in Dropbox
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename +'?overwrite=false&autorename=true',
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',            
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);
                showMessage("The KML file has been saved in your Dropbox account as Dropbox\\Apps\\" + result.path.substring(1));
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when saving file: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.saveExperienceThumbnail = function(filename,mdata)//Save data to file in Dropbox
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',  
            processData: false,          
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);
                //Share to get public URL and update Project table
                //1. Share the file                
                $.ajax({
                    type:'POST',
                    url: 'https://api.dropbox.com/1/shares/auto' + result.path + '?short_url=false',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {
                        var rs = JSON.parse(data);
                        var url = rs.url;
                        url = url.substring(0,url.lastIndexOf("?"));
                        url = url.replace("https://www.drop","https://dl.drop");    
                        publish(url);                    
                    }
                });                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when publishing an experience: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    //////////////////////EOI/////////////////////////////
    this.insertEOI = function(curEOI)
    {
        var row = '[["I","EOIs",' + '"' + curEOI.id + '"' + ',{"name":"' + encodeURI(curEOI.name) + '","startDate":"' + encodeURI(curEOI.startDate) + '","endDate":"' + encodeURI(curEOI.endDate) + '","desc":"' + encodeURI(curEOI.desc) + '","associatedPOI":"' + curEOI.associatedPOI + '","associatedRoute":"' + curEOI.associatedRoute + '"}]]';
        //use databaseRevision as ID for new record
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {
                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                
                    databaseRevision = result.rev;                                     
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.deleteEOI = function(curEOI)
    {
        var row = '[["D","EOIs","' + curEOI.id + '"]]';
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    databaseRevision = result.rev;                                    
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });        
    }
    
    this.updateEOI = function(curEOI)
    {
        var row = "";        
        row = '[["U","EOIs","' + curEOI.id + '",{"name":["P","' +  encodeURI(curEOI.name) + '"],"desc":["P","' +  encodeURI(curEOI.desc) + '"],"startDate":["P","' +  encodeURI(curEOI.startDate) + '"],"endDate":["P","' +  encodeURI(curEOI.endDate) + '"],"associatedPOI":["P","' +  curEOI.associatedPOI + '"],"associatedRoute":["P","' +  curEOI.associatedRoute + '"]}]]';//["P", <value>]
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};        
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                 
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.updateEOIMediaOrder = function(tmpEOI)
    {
        var row = "";        
        row = '[["U","EOIs","' + tmpEOI.id + '",{"mediaOrder":["P","' +  tmpEOI.mediaOrder.join(" ") + '"]}]]';//["P", <value>]   
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};     
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
        
        
    //////////////////////POI/////////////////////////////
    
    this.insertPOI = function(row)
    {   
        //var row = '[["I","POIs",' + '"' + poi.id + '"' + ',{"name":"' + poi.name + '","type":"' + poi.type + '","associatedEOI":"' + poi.associatedEOI + '","associatedRoute":"' + poi.associatedRoute + '","desc":"' + poi.desc + '","latLng":"' + poi.latLng + '","mediaOrder":"' + poi.mediaOrder + '"}]]';
        //use databaseRevision as ID for new record
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {
               
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
               
                    databaseRevision = result.rev;
                    //Check if curMedia.PoiID = including --> add media when creating POI
                    if(curMedia != null && curMedia.PoIID.indexOf("including")!=-1)
                    {
                        //Upload the GPS image
                        showUploadingStatus("Please wait. Uploading data...");
                        fileName = curMedia.PoIID; 
                        fileName = fileName.substring(fileName.lastIndexOf("."));
                        curMedia.PoIID = curPOI.id;
                        mDropBox.uploadMedia(curMedia.id + fileName, curMediaData);                        
                    }
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });            
    }
    
    this.deletePOI = function (curPOI)
    {
        var row = '[["D","POIs","' + curPOI.id + '"]]';
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    databaseRevision = result.rev;                                    
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });     
    }
        
    this.updatePOI = function (curPOI)
    {
        var row = '[["U","POIs","' + curPOI.id + '",{"name":["P","' +  encodeURI(curPOI.name) + '"],"desc":["P","' +  encodeURI(curPOI.desc) + '"],"type":["P","' +  curPOI.type + '"],"associatedEOI":["P","' +  curPOI.associatedEOI + '"],"associatedRoute":["P","' +  curPOI.associatedRoute + '"],"latLng":["P","' +  curPOI.latLng+ '"]}]]';//["P", <value>]
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};        
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.updatePOIMediaOrder = function(tmpPOI)
    {
        var row = "";        
        row = '[["U","POIs","' + tmpPOI.id + '",{"mediaOrder":["P","' +  tmpPOI.mediaOrder.join(" ") + '"]}]]';//["P", <value>]   
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};     
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                  
                    databaseRevision = result.rev;
                    //update image thumbnail
                    updatePoiThumbnail(tmpPOI);
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    
    //////////////////////MEDIA/////////////////////////////
    
    this.insertTextMedia = function()
    {
        //Size of a string in UTF-8
        curMedia.context = curMedia.content.length;
        //add media to the array
        allMedia.push(curMedia);
        var row = '[["I","media",' + '"' + curMedia.id + '"' + ',{"name":"' +  encodeURI(curMedia.name) + '","type":"' + curMedia.type 
                    + '","desc":"' + encodeURI(curMedia.desc) + '","content":"' + encodeURI(curMedia.content) + '","noOfLike":"' + curMedia.noOfLike  
                    + '","context":"' + curMedia.context  + '","PoIID":"' + curMedia.PoIID + '","attachedTo":"' + curMedia.attachedTo + '"}]]';    
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};                    
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {
                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                
                    databaseRevision = result.rev;
                    //Add curMedia to the POI
                    if(curMediaType == "POI")
                    {
                        curPOI.mediaOrder.push(curMedia.id);
                        curPOI.associatedMedia[curMedia.id] = curMedia;
                        mDropBox.updatePOIMediaOrder(curPOI);       
                    }
                    else if(curMediaType == "EOI")
                    {
                        curEOI.mediaOrder.push(curMedia.id);
                        curEOI.associatedMedia[curMedia.id] = curMedia;
                        mDropBox.updateEOIMediaOrder(curEOI);
                    }
                    else if(curMediaType == "ROUTE")
                    {
                        curRoute.mediaOrder.push(curMedia.id);
                        curRoute.associatedMedia[curMedia.id] = curMedia;
                        mDropBox.updateRouteMediaOrder(curRoute);
                    }
                    goBack();             
                    //Update screen                    
                    //$('.ui-dialog-titlebar').show();
                    $("#dialog-status").dialog("close");                    
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.uploadMedia = function(filename,mdata)
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',
            processData: false,
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);  
                //Update size for media in the context field as this field has not been use!IMPORTANT
                curMedia.context = result.bytes;                
                               
                //Share data                
                $.ajax({
                    type:'POST',
                    url: 'https://api.dropbox.com/1/shares/auto' + result.path + '?short_url=false',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {
                        var rs = JSON.parse(data);
                        var url = rs.url;
                        url = url.substring(0,url.lastIndexOf("?"));
                        url = url.replace("https://www.drop","https://dl.drop");
                        curMedia.content = url;
                        //add media to the array
                        allMedia.push(curMedia);
                        //insert info to a table                                               
                        var row = '[["I","media","' + curMedia.id + '",{"name":"' +  encodeURI(curMedia.name) + '","type":"' + curMedia.type 
                                    + '","desc":"' + encodeURI(curMedia.desc) + '","content":"' + curMedia.content + '","noOfLike":"' + curMedia.noOfLike  
                                    + '","context":"' + curMedia.context  + '","PoIID":"' + curMedia.PoIID + '","attachedTo":"' + curMedia.attachedTo + '"}]]';   
                        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};                     
                        $.ajax({
                            type:'POST',
                            url: 'https://api.dropbox.com/1/datastores/put_delta',
                            data: dataContent,
                            dataType: 'html',
                            headers: { 'Authorization': REQUEST_HEADER },
                            success: function(data) {
                                
                                var result = JSON.parse(data);
                                if(result.rev != undefined)
                                {
                                
                                    databaseRevision = result.rev;
                                    //Add curMedia to the POI
                                    if(curMediaType == "POI")
                                    {
                                        curPOI.mediaOrder.push(curMedia.id);
                                        curPOI.associatedMedia[curMedia.id] = curMedia;
                                        mDropBox.updatePOIMediaOrder(curPOI);
                                    }
                                    else if(curMediaType == "EOI")
                                    {
                                        curEOI.mediaOrder.push(curMedia.id);
                                        curEOI.associatedMedia[curMedia.id] = curMedia;
                                        mDropBox.updateEOIMediaOrder(curEOI);
                                    }
                                    else if(curMediaType == "ROUTE")
                                    {
                                        curRoute.mediaOrder.push(curMedia.id);
                                        curRoute.associatedMedia[curMedia.id] = curMedia;
                                        mDropBox.updateRouteMediaOrder(curRoute);
                                    }
                                    goBack();
                                    //Update screen                                                                                                  
                                    //$('.ui-dialog-titlebar').show();
                                    $("#dialog-status").dialog("close");
                                }
                                else
                                {
                                    showMessage(data);
                                }             
                            },
                            error: function(jqXHR, textStatus, errorThrown ) {
                                showMessage("Error: " + textStatus + " because:" + errorThrown);
                            }
                        });        
                                       
                    },
                    error: function(jqXHR, textStatus, errorThrown ) {
                        showMessage("Error when sharing data: " + textStatus + " because:" + errorThrown);
                    }
                });                  
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when uploading file: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.updateMedia = function (mediaID,newName,newContent)
    {
        var row = "";
        curMedia.name = newName;
        if(curMedia.type != "text")       
            row = '[["U","media","' + curMedia.id + '",{"name":["P","' +  encodeURI(newName) + '"]}]]';//["P", <value>]
        else
        {
            row = '[["U","media","' + curMedia.id + '",{"name":["P","' +  encodeURI(newName) + '"],"content":["P","' +  encodeURI(newContent) + '"]}]]';//["P", <value>]
            curMedia.content = newContent;
        }
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.deleteMedia = function (mediaID)
    {
        var row = '[["D","media","' + mediaID + '"]]';
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta?handle=' + databaseHandle + '&rev=' + databaseRevision +'&changes='+ row,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    databaseRevision = result.rev;
                    //Remove from list                    
                    filename = curMedia.content.substring(curMedia.content.lastIndexOf("/"));                    
                    if(curMedia.type == "text")
                        return;  
                    //remove media from array
                    var delId = filename.substring(1,filename.lastIndexOf("."));
                    removeMediaFromArray(delId);
                    //Delete file on server    
                    $.ajax({
                        type:'POST',                 
                        url: 'https://api.dropbox.com/1/fileops/delete?root=auto&path=' + filename,
                        headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
                        dataType: 'html',
                        success: function(data) {                            
                            var result = JSON.parse(data);                                                                  
                        },
                        error: function(jqXHR, textStatus, errorThrown ) {
                            showMessage("Error when deleting file: " + textStatus + " because:" + errorThrown);
                        }
                    });
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });        
    }
    
    this.deleteFile = function(filename)
    {                
        //remove media from array
        var delId = filename.substring(1,filename.lastIndexOf("."));
        removeMediaFromArray(delId);
        //Delete file on server    
        $.ajax({
            type:'POST',                 
            url: 'https://api.dropbox.com/1/fileops/delete?root=auto&path=' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',
            success: function(data) {                            
                var result = JSON.parse(data);                                                                  
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when deleting file: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    //////////////////////POI TYPE/////////////////////////////
    this.insertPOIType = function(curPOIType)
    {
        var row = '[["I","POITypes",' + '"' + curPOIType.id + '"' + ',{"name":"' + encodeURI(curPOIType.name) + '","icon":"' + curPOIType.icon + '","desc":"' + encodeURI(curPOIType.desc) + '"}]]';
        //use databaseRevision as ID for new record
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {
                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {                    
                    databaseRevision = result.rev;                                     
                }
                else
                {
                    showMessage(data);
                }                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.updatePOIType = function(curPOIType)
    {
        var row = "";        
        row = '[["U","POITypes","' + curPOIType.id + '",{"name":["P","' +  encodeURI(curPOIType.name) + '"],"desc":["P","' +  encodeURI(curPOIType.desc) + '"],"icon":["P","' +  curPOIType.icon + '"]}]]';//["P", <value>]
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};        
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.deletePOIType = function(curPOIType)
    {
        var row = '[["D","POITypes","' + curPOIType.id + '"]]';
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    databaseRevision = result.rev;                                    
                }
                else
                {
                    showMessage(data);
                }                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });  
    }
    
    //////////////////////ROUTE/////////////////////////////
    this.insertRoute = function(curRoute)
    {
        var row = '[["I","Routes",' + '"' + curRoute.id + '"' + ',{"name":"' + encodeURI(curRoute.name) + '","desc":"' + encodeURI(curRoute.desc) + '","colour":"' + curRoute.colour.substring(1) + '","polygon":"' + curRoute.getPolygon() + '","associatedPOI":"' + curRoute.associatedPOI + '","associatedEOI":"' + curRoute.associatedEOI + '"}]]';
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};  
        //use databaseRevision as ID for new record
        $.ajax({
            type:'POST',            
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {
                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {                    
                    databaseRevision = result.rev;                                     
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.updateRoute = function(curRoute)
    {
        var row = "";        
        row = '[["U","Routes","' + curRoute.id + '",{"name":["P","' +  encodeURI(curRoute.name) + '"],"desc":["P","' +  encodeURI(curRoute.desc) + '"],"colour":["P","' +  curRoute.colour.substring(1) + '"],"polygon":["P","' +  curRoute.getPolygon() + '"],"associatedPOI":["P","' +  curRoute.associatedPOI + '"],"associatedEOI":["P","' +  curRoute.associatedEOI + '"]}]]';//["P", <value>]
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};        
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {   
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    } 
    
    this.deleteRoute = function (curRoute)
    {
        var row = '[["D","Routes","' + curRoute.id + '"]]';
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    databaseRevision = result.rev;                                    
                }
                else
                {
                    showMessage(data);
                }    
                //var params = parseQueryString(data);                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });  
    }
    
    
    this.updateRouteMediaOrder = function(tmpRoute)
    {
        var row = "";        
        row = '[["U","Routes","' + tmpRoute.id + '",{"mediaOrder":["P","' +  tmpRoute.mediaOrder.join(" ") + '"]}]]';//["P", <value>]
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};        
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                   
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }               
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    //////////////////////RESPONSE/////////////////////////////
    this.updateResponseStatus = function(tmpResponse)
    {
        var row = "";        
        row = '[["U","Responses","' + tmpResponse.id + '",{"status":["P","' +  tmpResponse.status + '"], "entityType":["P","' +  tmpResponse.entityType + '"],"entityID":["P","' +  tmpResponse.entityID+ '"]}]]';//["P", <value>]
        
        var dataContent = {handle:databaseHandle,rev:databaseRevision,changes:row};        
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/datastores/put_delta',
            data: dataContent,
            dataType: 'html',
            headers: { 'Authorization': REQUEST_HEADER },
            success: function(data) {                
                var result = JSON.parse(data);
                if(result.rev != undefined)
                {
                    databaseRevision = result.rev;
                }
                else
                {
                    showMessage(data);
                }
                //Send email to consumer to inform the state of their response 
                $.post(
                    'php/emailConsumer.php',
                    {            
                        proAuthID: designerInfo.id,
                        designerName: designerInfo.userName,
                        consumerName: curResponse.conName,
                        consumerEmail: curResponse.conEmail,
                        experienceName: $("#curProject").text(),
                        responseStatus: curResponse.status                      
                    },
                    function(data,status){
                        //Get all current project name - no duplication
                        //var result = JSON.parse(data);
                    }            
                );	              
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error: " + textStatus + " because:" + errorThrown);
            }
        });
    }
}

//Parse URL to get parameters
function parseQueryString(query) 
{         
    //example param1=value1&param2=value2
    var dropbox_param = {};
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) 
    {
        var pair = vars[i].split("=");
        if(pair.length > 1)
    	   dropbox_param[pair[0]] = pair[1];    	
    }
    return dropbox_param;        
}