/*
    Author:     Trien Do    
    Created:    March 2015
    Tasks:      Implementing menu functions of menu Response   
*/

//Show the red square notification next to the Response menu to indicate the number of new/undecided responses   
function showNotification()
{
	if(allNewResponses.length > 0)
    {
    	$("#notification").text(allNewResponses.length);
        $("#notification").attr("class","hasNotification");
    }
    else
    {
    	$("#notification").text("");
        $("#notification").attr("class","noNotification");
    }
}

//Show new/undecided responses
function Response_showNewResponse()
{
    $(function() {        
        presentNewResponses();
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allNewResponses.length),
            width: 970,
            position: ['center','middle'],
            buttons: {                
                //"Manage all response": function() {                    
                //    $(this).dialog("close"); 
                //    Response_showAllResponse();                      
                //}, 
                Close: {
                    //class: 'rightButtonCloseEOI',
                    text:"Close",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }                
            }
        });
    });
}

//Present each response in a row of a table with the following fields: 
//      - No. (order of the response -> Easier for designers to track when scrolling the table)
//      - content (text/photo/audio/video)
//      - description/title, 
//      - associated entity
//      - name + email of user who submitted the response
//      - availble actions: Accept + Reject  
function presentNewResponses( )
{
    try
    {
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Moderate new responses" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Content</th><th>Description</th><th>Associated entity</th><th>Submitter name</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
        var count = 0;
        for(var i=0; i < allNewResponses.length; i++)
        {            
            if (allNewResponses[i].status == "waiting")
            {
                count ++;
                //$("#tblData tbody").append('<tr><td>' + count + '</td><td>' + allNewResponses[i].content + '</td><td>' + allNewResponses[i].desc + '</td><td style="text-align:center;">' + allNewResponses[i].entityID + '</td><td style="text-align:center;">' + allNewResponses[i].conName + '</td><td style="text-align:center;">' + allNewResponses[i].conEmail + '</td><td><button class="btnApprove googleLookAndFeel"><img style="vertical-align:middle" src="images/approve.png"> Approve this response</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Reject this response</button> <button class="btnView googleLookAndFeel">View this response</button></td></tr>');
                var contentString = "";
                if(allNewResponses[i].contentType == "text")
                    contentString = '<object class="textMediaBox" type="text/html" data="' + allResponses[i].content + '" ></object>';
                else if(allNewResponses[i].contentType == "image")
                    contentString = '<img style="width:100px" src="' + allNewResponses[i].content + '">';
                else if(allNewResponses[i].contentType == "audio")
                    contentString = '<audio width="100" controls ><source src="' + allNewResponses[i].content + '" type="audio/mpeg"></audio>';
                else if(allNewResponses[i].contentType == "video")
                    contentString = '<video width="100" controls> <source src="' + allNewResponses[i].content + '"></video>';
                $("#tblData tbody").append('<tr><td>' + count + '</td><td style="text-align:center;">' + contentString + '</td><td>' + allNewResponses[i].description + '</td><td style="text-align:center;">' + allNewResponses[i].entityType + " (" + allNewResponses[i].entityId + ")" + '</td><td style="text-align:center;">' + allNewResponses[i].userId + '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/approve.png"> Accept this response</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Reject this response</button><button class="btnView googleLookAndFeel"> Show response\'s details</button></td></tr>');
            }
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnEdit").bind("click", approveResponseNew);	
        $(".btnDelete").bind("click", rejectResponseNew);        
        $(".btnView").bind("click", viewResponse);
    }
    catch(e)
    {
        showMessage("Error when presenting all responses: " + e.message);
    }
} 

function approveResponseNew()
{
    var par = $(this).parent().parent(); //Get the selected row
    var tdIndex = par.children("td:nth-child(1)");//index of the selected row
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex, "accepted",true);
}

function rejectResponseNew()
{
    var par = $(this).parent().parent(); //Get the selected row
    var tdIndex = par.children("td:nth-child(1)");//index of the selected row
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex,"rejected",true);    
}

function viewResponse()
{
    var par = $(this).parent().parent(); //Get the selected row
    var tdIndex = par.children("td:nth-child(1)");//index of the selected row
    tdIndex = parseInt(tdIndex.text()) - 1;
    showResponseDetails(tdIndex);    
}

function showResponseDetails(index)
{
    var response = allNewResponses[index];
    $('#dialog-media').html('');        
    $('#dialog-media').dialog({ title: "Response's details"});
    
    var entityText = "";
    if(response.entityType == "NEW")//NEW - POI - EOI - ROUTE - media - Responses
    {
        entityText = "A new location (see the map below). If you accept this response, a new POI will be created.<br/><div id='mapResponse'></div>";        
    }
    else if(response.entityType == "POI")
        entityText = "The POI: " + response.entityId + ".";
    else if(response.entityType == "EOI")
        entityText = "The EOI: " + response.entityId + ".";    
    else if(response.entityType == "ROUTE")    
        entityText = "The whole experience.";
    else
    { 
        entityText = "<br/>The a media item <br/>";
        entityText += getCodeForMedia(getMediaWithID(response.entityId), 200);
    }
        
        
    var content = '<p class="formLabel">' + response.userId + ' submitted a comment/response </p><hr/><div>' +  getCodeForMedia(response, 200) + '</div><hr/><p class="formLabel"> on </p>' + entityText;
    
    $('#dialog-media').append(content);
    
    if(response.entityType == "NEW")
    {
        //show location of new POI
        var latLngString = response.entityID.split(" ");
        var poiLatLng = new google.maps.LatLng(parseFloat(latLngString[0]), parseFloat(latLngString[1]));
        var mapResponse = new google.maps.Map(document.getElementById('mapResponse'), null);//mapOptions = null
        mapResponse.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        mapResponse.setCenter(poiLatLng);
        mapResponse.setZoom(maxZoomLevel);
        //Add marker 
        new google.maps.Marker({  
            					   position: poiLatLng, map: mapResponse, zIndex:2,visible: true,draggable: false,
            					   icon:"images/poi.png", title: "Location of the new POI"	
            				    });
        
    }
    
    $("#dialog-media").dialog({
        modal: true,
        width: 500,
        height: 600,        
        buttons: [                
            {   
                text: "Accept this response",
                click: function() {
                    setResponseStatus(index, "accepted",true);
                    $( this ).dialog( "close" );                    
                }
            },                                      
            {   
                text: "Reject this response",                
                click: function() {
                    setResponseStatus(index, "rejected",true); 
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Close",                
                click: function() {
                    $( this ).dialog( "close" );                                      
                }
            }                  
        ]      
    });
}

function getCodeForMedia(tmpMedia, height)
{
    if(tmpMedia == null)
        return "";
    var title = "";
    if(tmpMedia.name != undefined)
        title = tmpMedia.name;
    else
        title = tmpMedia.description;
        
    var contentString = "";
    if(tmpMedia.contentType == "text")
        contentString = '<object class="textMediaBox" type="text/html" data="' + tmpMedia.content + '" ></object>';
    else if(tmpMedia.contentType == "image")
        contentString = '<img style="height:' + height + 'px;" src="' + tmpMedia.content + '">';
    else if(tmpMedia.contentType == "audio")
        contentString = '<audio controls ><source src="' + tmpMedia.content + '" type="audio/mpeg"></audio>';
    else if(tmpMedia.contentType == "video")
        contentString = '<video controls style="height: 300px;"> <source src="' + tmpMedia.content + '"></video>';
        
    if(tmpMedia.contentType != "text")
        contentString += "<p style='font-weight: bold;'>" + title + "</p>";    
    return contentString;
}

function getMediaWithID(id)
{
    //retrieve from database a media
    return null;
}

//Show all responses: new - undecided - rejected - accepted
function Response_showAllResponse()
{
    $(function() {        
        presentAllResponses();
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allResponses.length),
            width: 930,
            position: ['center','middle'],
            buttons: {                
                //"Manage all response": function() {                    
                //    $(this).dialog("close"); 
                //    Response_showAllResponse();                      
                //}, 
                Close: {
                    //class: 'rightButtonCloseEOI',
                    text:"Close",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }                
            }
        });
    });
}

//Present each response in a row of a table with the following fields: 
//      - No. (order of the response -> Easier for designers to track when scrolling the table)
//      - content (text/photo/audio/video)
//      - description/title, 
//      - associated entity
//      - name + email of user who submitted the response
//      - availble actions: Accept + Reject + Reset back to waiting 
function presentAllResponses( )
{
    try
    {
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Moderate all responses" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Content</th><th>Description</th><th>Associated entity</th><th>Submitter name</th><th>Status</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');        
        for(var i=0; i < allResponses.length; i++)
        {            
            //$("#tblData tbody").append('<tr><td>' + count + '</td><td>' + allResponses[i].content + '</td><td>' + allResponses[i].desc + '</td><td style="text-align:center;">' + allResponses[i].entityID + '</td><td style="text-align:center;">' + allResponses[i].conName + '</td><td style="text-align:center;">' + allResponses[i].conEmail + '</td><td><button class="btnApprove googleLookAndFeel"><img style="vertical-align:middle" src="images/approve.png"> Approve this response</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Reject this response</button> <button class="btnView googleLookAndFeel">View this response</button></td></tr>');
            var contentString = "";
                if(allResponses[i].contentType == "text")
                    contentString = '<object class="textMediaBox" type="text/html" data="' + allResponses[i].content + '" ></object>';
                else if(allResponses[i].contentType == "image")
                    contentString = '<img style="width:100px" src="' + allResponses[i].content + '">';
                else if(allResponses[i].contentType == "audio")
                    contentString = '<audio width="100" controls ><source src="' + allResponses[i].content + '" type="audio/mpeg"></audio>';
                else if(allResponses[i].contentType == "video")
                    contentString = '<video width="100" controls> <source src="' + allResponses[i].content + '"></video>';
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td style="text-align:center;">' + contentString + '</td><td>' + allResponses[i].description + '</td><td style="text-align:center;">' + allResponses[i].entityId + '</td><td style="text-align:center;">' + allResponses[i].userId + '</td><td style="text-align:center;">' + allResponses[i].status + '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/approve.png"> Accept this response</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Reject this response</button><button class="btnView googleLookAndFeel">Set back waiting</button></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnEdit").bind("click", approveResponse);	
        $(".btnDelete").bind("click", rejectResponse);        
        $(".btnView").bind("click", resetResponse);
    }
    catch(e)
    {
        showMessage("Error when presenting all responses: " + e.message);
    }
}
function approveResponse()
{
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex,"accepted",false);    
}

function rejectResponse()
{
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex,"rejected",false);    
}
 
function resetResponse()
{
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex,"waiting",false);   
}

//Update status of a response
//If the response is for a new POI -> Create a new POI and make the response the first media of the POI
//Input - index: index of the response
//      - mStatus: status of the response
//      - isNew: whether this function is called from the "Moderate new responses" or "Moderate all responses"  
function setResponseStatus(index, mStatus, isNew)
{   
    if (isNew)
        curResponse = allNewResponses[index];
    else
        curResponse = allResponses[index];
    var oldStatus = curResponse.status; 
    curResponse.status = mStatus;
    //if the response is for new location --> Create a new POI and make the the response the first media of the POI    
    if(mStatus == "accepted" && curResponse.entityType == "NEW")
    {
        /*There maybe more than one responses for the the new location
            The first (its location is not the same as any existing POIs) will be made a new POI else make a normal response*/
        
        //Loop through all POI
        for(var i = 0; i < allPOIs.length; i++)
        {
            if(allPOIs[i].getFirstPointString() == curResponse.entityId)
            {
                curResponse.entityType = "POI";
                curResponse.entityId = allPOIs[i].id;
                allPOIs[i].responseCount ++;
                resfulManager.updateResponseStatus(curResponse);
                if(isNew)
                {
                    allNewResponses.splice(index,1);
                    Response_showNewResponse();
                    showNotification();
                }
                else{
                    Response_showAllResponse();
                    showNotification();
                }
                return;
            }
        }
        
        curResponse.status = "Made a new POI";
        var name = curResponse.description;
        if(name == "" || name == undefined || name == null)
            name = "Undefined name";
        //Create a new POI
        var poiBank = new SharcPoiDesigner(0, name + " (created by a user named " + curResponse.userId + ")", curResponse.entityId, "" ,designerInfo.id);
        curPOI = new SharcPoiExperience(curProject.id, poiBank, name, 0, "", "", "", 1, 0);
        trigerZonePOI = new google.maps.Circle({					
    		center: curPOI.getFirstPoint(), radius: 20,
    		strokeColor: "#00FF00", strokeOpacity: 1.0, strokeWeight: 2,
    		fillColor: "#00FF00", fillOpacity: 0.3,		
    		map: map
    	});
        curPOI.setTriggerZone(trigerZonePOI, "#00FF00");
        
        curMediaType = "POI";//New media                            
        curMediaBank = new SharcMediaDesigner(curResponse.id, name, curResponse.contentType, curResponse.content, curResponse.size, designerInfo.id); 
        curMedia = new SharcMediaExperience(0, curMediaBank, "POI", -2, curProject.id, name, "", false, true,0);                      
        
        var tmpPoiMarker = new google.maps.Marker({  
		   position: curPOI.getFirstPoint(), map: map, zIndex:2,visible: true,draggable: false,
		   icon:"images/poi.png", title: name,id: allPOIMarkers.length	
	    });
                
        addMarkerPOIClickEvent(tmpPoiMarker);                    
        allPOIMarkers.push(tmpPoiMarker);
        allPOIZones.push(trigerZonePOI);
        allPOIs.push(curPOI);
        resfulManager.createNewPoi(curPOI);
        resfulManager.updateResponseStatus(curResponse);
        $("#noOfPOI").text("Number of POIs: " + allPOIs.length);        
        alert("The response you have just accepted has been made a new POI named '" + name + "'. You can go to Manage POIs to edit it.");
    }
    else
        resfulManager.updateResponseStatus(curResponse);
    if(isNew)
    {
        allNewResponses.splice(index,1);
        Response_showNewResponse();
        showNotification();
    }
    else{
        if(mStatus == "waiting" && oldStatus != "waiting"){
            //if it is not in the new List -> add
            allNewResponses.push(curResponse);
        }
        Response_showAllResponse();
        showNotification();
    }
}