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
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Content</th><th>Description</th><th>Associated entity</th><th>Submitter name</th><th>Submitter email</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
        var count = 0;
        for(var i=0; i < allNewResponses.length; i++)
        {            
            if (allNewResponses[i].status == "Waiting")
            {
                count ++;
                //$("#tblData tbody").append('<tr><td>' + count + '</td><td>' + allNewResponses[i].content + '</td><td>' + allNewResponses[i].desc + '</td><td style="text-align:center;">' + allNewResponses[i].entityID + '</td><td style="text-align:center;">' + allNewResponses[i].conName + '</td><td style="text-align:center;">' + allNewResponses[i].conEmail + '</td><td><button class="btnApprove googleLookAndFeel"><img style="vertical-align:middle" src="images/approve.png"> Approve this response</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Reject this response</button> <button class="btnView googleLookAndFeel">View this response</button></td></tr>');
                var contentString = "";
                if(allNewResponses[i].type == "text")
                    contentString = allNewResponses[i].content;
                else if(allNewResponses[i].type == "image")
                    contentString = '<img style="width:100px" src="' + allNewResponses[i].content + '">';
                else if(allNewResponses[i].type == "audio")
                    contentString = '<audio width="100" controls ><source src="' + allNewResponses[i].content + '" type="audio/mpeg"></audio>';
                else if(allNewResponses[i].type == "video")
                    contentString = '<video width="100" controls> <source src="' + allNewResponses[i].content + '"></video>';
                $("#tblData tbody").append('<tr><td>' + count + '</td><td style="text-align:center;">' + contentString + '</td><td>' + allNewResponses[i].desc + '</td><td style="text-align:center;">' + allNewResponses[i].entityType + " (" + allNewResponses[i].entityName + ")" + '</td><td style="text-align:center;">' + allNewResponses[i].conName + '</td><td style="text-align:center;">' + allNewResponses[i].conEmail + '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/approve.png"> Accept this response</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Reject this response</button><button class="btnView googleLookAndFeel"> Show response\'s details</button></td></tr>');
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
    setResponseStatus(tdIndex, "Accepted",true);
}

function rejectResponseNew()
{
    var par = $(this).parent().parent(); //Get the selected row
    var tdIndex = par.children("td:nth-child(1)");//index of the selected row
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex,"Rejected",true);    
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
        entityText = "The POI: " + response.entityName + ".";
    else if(response.entityType == "EOI")
        entityText = "The EOI: " + response.entityName + ".";    
    else if(response.entityType == "ROUTE")    
        entityText = "The whole experience.";
    else
    { 
        entityText = "<br/>The a media item <br/>";
        entityText += getCodeForMedia(getMediaWithID(response.entityID), 200);
    }
        
        
    var content = '<p class="formLabel">' + response.conName + ' submitted a comment/response </p><hr/><div>' +  getCodeForMedia(response, 200) + '</div><hr/><p class="formLabel"> on </p>' + entityText;
    
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
        height: 380,        
        buttons: [                
            {   
                text: "Accept this response",
                click: function() {
                    setResponseStatus(tdIndex, "Accepted",true);
                    $( this ).dialog( "close" );                    
                }
            },                                      
            {   
                text: "Reject this response",                
                click: function() {
                    setResponseStatus(tdIndex, "Rejected",true); 
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

function getCodeForMedia(tmpMedia, width)
{
    var title = "";
    if(tmpMedia.name != undefined)
        title = tmpMedia.name;
    else
        title = tmpMedia.desc;
        
    var contentString = "";
    if(tmpMedia.type == "text")
        contentString = tmpMedia.content;
    else if(tmpMedia.type == "image")
        contentString = '<img style="height:' + height + 'px;" src="' + tmpMedia.content + '">';
    else if(tmpMedia.type == "audio")
        contentString = '<audio controls ><source src="' + tmpMedia.content + '" type="audio/mpeg"></audio>';
    else if(tmpMedia.type == "video")
        contentString = '<video controls> <source src="' + tmpMedia.content + '"></video>';
        
    if(tmpMedia.type == "text")
        contentString = "<p style='font-weight: bold;'>" +  title + "</p>" + contentString;
    else
        contentString += "<p style='font-weight: bold;'>" + title + "</p>";    
    return contentString;
}

function getMediaWithID(id)
{
    for (var i = 0; i < allMedia.length; i++)
        if (allMedia[i].id == id)
            return allMedia[i];
    for (var i = 0; i < allResponses.length; i++)
        if (allResponses[i].id == id)
            return allResponses[i];
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
                if(allResponses[i].type == "text")
                    contentString = allResponses[i].content;
                else if(allResponses[i].type == "image")
                    contentString = '<img style="width:100px" src="' + allResponses[i].content + '">';
                else if(allResponses[i].type == "audio")
                    contentString = '<audio width="100" controls ><source src="' + allResponses[i].content + '" type="audio/mpeg"></audio>';
                else if(allResponses[i].type == "video")
                    contentString = '<video width="100" controls> <source src="' + allResponses[i].content + '"></video>';
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td style="text-align:center;">' + contentString + '</td><td>' + allResponses[i].desc + '</td><td style="text-align:center;">' + allResponses[i].entityName + '</td><td style="text-align:center;">' + allResponses[i].conName + '</td><td style="text-align:center;">' + allResponses[i].status + '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/approve.png"> Accept this response</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Reject this response</button><button class="btnView googleLookAndFeel">Set back waiting</button></td></tr>');
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
    setResponseStatus(tdIndex,"Accepted",false);    
}

function rejectResponse()
{
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex,"Rejected",false);    
}
 
function resetResponse()
{
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    setResponseStatus(tdIndex,"Waiting",false);   
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
    curResponse.status = mStatus;
    //if the response is for new location --> Create a new POI and make the the response the first media of the POI    
    if(mStatus == "Accepted" && curResponse.entityType == "NEW")
    {
        /*There maybe more than one responses for the the new location
            The first (its location is not the same as any existing POIs) will be made a new POI else make a normal response*/
        
        //Loop through all POI
        for(var i = 0; i < allPOIs.length; i++)
        {
            if(allPOIs[i].latLng == curResponse.entityID)
            {
                curResponse.entityType = "POI";
                curResponse.entityID = allPOIs[i].id;
                mDropBox.updateResponseStatus(curResponse);
                if(isNew)
                {
                    allNewResponses.splice(index,1);
                    Response_showNewResponse();
                    showNotification();
                }
                return;
            }
        }
        
        curResponse.status = "Made a new POI";
        var name = curResponse.desc;
        if(name == "" || name == undefined || name == null)
            name = "Undefined name";
        //Create a new POI    
        curPOI = new POI(name + " (created by a user named " + curResponse.conName + ")","", "", name, curResponse.entityID,(new Date()).getTime(),"",""); 
        trigerZonePOI = new google.maps.Circle({					
    		center: curPOI.getLatLng(), radius: 20,
    		strokeColor: "#00FF00", strokeOpacity: 1.0, strokeWeight: 2,
    		fillColor: "#00FF00", fillOpacity: 0.3,		
    		map: map
    	});
        curPOI.setTriggerZone(trigerZonePOI,"#00FF00");
        //Create a new media   
        curMedia = new Media(curResponse.id,name,curResponse.type,name,curResponse.content,0,"",curPOI.id,"POI");
        var tmpPoiMarker = new google.maps.Marker({  
		   position: curPOI.getLatLng(), map: map, zIndex:2,visible: true,draggable: false,
		   icon:"images/poi.png", title: curPOI.name,id: allPOIMarkers.length	
	    });
        
        addMarkerPOIClickEvent(tmpPoiMarker);                    
        allPOIMarkers.push(tmpPoiMarker);
        allPOIZones.push(trigerZonePOI);
        allPOIs.push(curPOI);
        curPOI.mediaOrder.push(curMedia.id);
        curPOI.associatedMedia[curMedia.id] = curMedia;        
        $("#noOfPOI").text("Number of POIs: " + allPOIs.length);
        
        //Create insert command for new POI
        var newRowPOI = '["I","POIs",' + '"' + curPOI.id + '"' + ',{"name":"' + encodeURI(curPOI.name) + '","type":"' + curPOI.type + '","mediaOrder":"' + curPOI.mediaOrder.join(" ") + '","associatedEOI":"' + curPOI.associatedEOI + '","associatedRoute":"' + curPOI.associatedRoute + '","desc":"' + encodeURI(curPOI.desc) + '","triggerZone":"' + curPOI.triggerZone + '","latLng":"' + curPOI.latLng + '","mediaOrder":"' + curPOI.mediaOrder + '"}]';
        //Create insert command for new media
        var newRowMedia = '["I","media","' + curMedia.id + '",{"name":"' +  encodeURI(curMedia.name) + '","type":"' + curMedia.type 
                                    + '","desc":"' + encodeURI(curMedia.desc) + '","content":"' + curMedia.content + '","noOfLike":"' + curMedia.noOfLike  
                                    + '","context":"' + encodeURI(curMedia.context)  + '","PoIID":"' + curMedia.PoIID + '","attachedTo":"' + curMedia.attachedTo + '"}]'; 
        //var updateRowResponse = '["U","Responses","' + curResponse.id + '",{"status":["P","' +  curResponse.status + '"]}]';
        //Delete the response 
        var updateRowResponse = '["D","Responses","' + curResponse.id + '"]';
        
        var dataChanges = "[" + newRowPOI + "," + newRowMedia + "," + updateRowResponse + "]";
        mDropBox.updateCommand(dataChanges);
        //Email the consumer about the action made on their response
        $.post(
            'php/emailConsumer.php',
            {            
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
        alert("The response you have just accepted has been made a new POI named " + curPOI.name.toUpperCase() + ". You can go to Manage POIs to edit it.");
    }
    else
        mDropBox.updateResponseStatus(curResponse);
    if(isNew)
    {
        allNewResponses.splice(index,1);
        Response_showNewResponse();
        showNotification();
    }
}