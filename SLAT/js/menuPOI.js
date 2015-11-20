/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Implementing menu POI functions   
*/

//This function enables creating/editing POI
//Input:    isCreating = 1 for creating a new POI, = 0 for editing
//          isFromPhoto = 1 for creating a POI from GPS tagged photo, = 0 for creating a POI from MAP
//          tdIndex = index of the selected POI for editing task
//User Interface: based on input params + database, corresponding UIs are dynamically generated.
var selectedPoiIndex = null; 
function createPOI(isCreating,isFromPhoto,tdIndex)//    
{    
    curMedia = null;
    callFrom = POI_FORM;
    $(function() {        
        //Generate UI
        $('#dialog-message').html('');        
        if(isCreating)
        {
           if(isFromPhoto)
                $('#dialog-message').dialog({ title: "Create a new POI from a GPS tagged photo" });
           else
                $('#dialog-message').dialog({ title: "Create a new POI on map" });
        }
        else
           $('#dialog-message').dialog({ title: "Edit a POI" });
            
        var content = '<input id="poi-input" class="controls" type="text" placeholder="Search Box"><div class="formLabel">POI name <input type="text" id="poiName" style="width:275px;"/> POI details (optional) <input type="text" id="poiDesc" style="width:287px;"/></div>'
                    + getTypeEventRoute()
                    + getLocationPresentation(isFromPhoto);        
        $('#dialog-message').append(content);
         	
        mapPOI = new google.maps.Map(document.getElementById('mapPOI'), null);//mapOptions = null
        mapPOI.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        //showMapWithCorrectBound(mapPOI,maxZoomLevel);
        
        //Bind event handlers
        google.maps.event.addListener(mapPOI,'click',function(event) {
		  plotPoint(event.latLng.lat(),event.latLng.lng(),'Taken point','This is where the photo was taken', null);
        });
        
        addDrawingToolForTriggerZone($('#zoneColour').val());
        addsearchBox(mapPOI,'poi-input');
        
        $('#btnEditZone').click(function() {
            if(trigerZonePOI != null && $('#btnEditZone').text() == "Edit trigger zone")
            {
                trigerZonePOI.setEditable(true);
                trigerZonePOI.setDraggable(true);
                drawingManager.setMap(mapPOI); 	
                $('#btnEditZone').text("Finish editing");
            }
            else if(trigerZonePOI != null && $('#btnEditZone').text() == "Finish editing")
            {
                trigerZonePOI.setEditable(false);
                trigerZonePOI.setDraggable(false);
                drawingManager.setMap(null); 	
                $('#btnEditZone').text("Edit trigger zone");
            }              
        });
        
        $('#zoneColour').change(function(){
            var tmpColor = $('#zoneColour').val();
    		if(trigerZonePOI != null)
                trigerZonePOI.setOptions({strokeColor:tmpColor, fillColor: tmpColor});
            drawingManager.get('polygonOptions').fillColor = tmpColor;
            drawingManager.get('polygonOptions').strokeColor = tmpColor; 	
    	});
        //Show all routes so it is easier for designer to create POI
        for(i = 0; i < allRoutePaths.length; i++)
            allRoutePaths[i].setMap(mapPOI);
            
        if(isFromPhoto)
            addGPSPhotoClickEvent();
        
        if(isCreating)
        {
            markerPOI.setMap(null);
            trigerZonePOI = null;
            showAppropriatePoiMap(mapPOI, null);
        }
        else//edit POI --> Fill current params of the POI
        {
            showAppropriatePoiMap(mapPOI, curPOI);
            $("#poiName").val(curPOI.poiDesigner.name);
            $("#poiDesc").val(curPOI.description);
            markerPOI.setPosition(curPOI.getFirstPoint());
            markerPOI.setMap(mapPOI);
            //showMapWithCorrectBound(mapPOI, maxZoomLevel);
            
            trigerZonePOI = allPOIZones[tdIndex];
            trigerZonePOI.setMap(mapPOI);
            //Color
            var tmpArr = curPOI.poiDesigner.triggerZone.split(" ");
            $('#zoneColour').val("#" + tmpArr[1]);
            drawingManager.get('polygonOptions').fillColor = "#" + tmpArr[1];
            drawingManager.get('polygonOptions').strokeColor = "#" + tmpArr[1]; 	
            
            //Associated entities
            var selectedTypes = curPOI.typeList.split(" ");
            for(var i=0; i<selectedTypes.length; i++)
                $('#poiType input[value="' + selectedTypes[i] + '"]').prop('checked', true);
            var selectedEvents = curPOI.eoiList.split(" ");
            for(var i=0; i<selectedEvents.length; i++)
                $('#poiEvent input[value="' + selectedEvents[i] + '"]').prop('checked', true);
            var selectedRoutes = curPOI.routeList.split(" ");
            for(var i=0; i<selectedRoutes.length; i++)
                $('#poiRoute input[value="' + selectedRoutes[i] + '"]').prop('checked', true);
        }
        
        //Calculate height for UI dialog
        var maxEle = Math.max(allPOITypes.length, allEOIs.length, allRoutes.length);      //Find the longest list  
        if(maxEle >=4)
            maxEle = 690;
        else if(maxEle >=3)
            maxEle = 675;
        else if(maxEle >=2)
            maxEle = 660;
        else if(maxEle >=1)
            maxEle = 645;
        else 
            maxEle = 630;
               
        $( "#dialog-message" ).dialog({
            modal: true,
            height: maxEle,
            width: 825,
            position: ['center','middle'],
            buttons: {
                Cancel: function() {
                    $( this ).dialog("close");
                    //Put all routes back to the main UI
                    for(i = 0; i < allRoutePaths.length; i++)
                        allRoutePaths[i].setMap(map);
                    if(!isCreating)
                    {
                        showAllPOIs();
                        trigerZonePOI.setMap(map);
                    }  
                },
                Save: function() {
                    var name = $.trim($("#poiName").val());
                    var desc = $.trim($("#poiDesc").val());  
                    var dataChanges = new Array();
                    var newRow = "";                  
                    if(!isValidName(name))
                    {
                        showMessage("Invalid POI name! POI name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, and space.");
                        return;
                    }
                    if(desc!="" && !isValidDescription(desc))
                    {
                        showMessage("Invalid POI description! POI description should contain only numbers, characters, hyphen, underscore, comma, period, colon, and space.");
                        return;
                    }
                    if(markerPOI.map == null)
                    {
                        showMessage("Please identify the location of the POI!");
                        return;
                    }
                    //Get type
                    var selectedTypes = [];
                    $('#poiType input:checked').each(function() {
                        selectedTypes.push($(this).val());
                    });
                    
                    //Get events
                    var selectedEvents = [];
                    $('#poiEvent input:checked').each(function() {
                        selectedEvents.push($(this).val());
                    });
                    
                    //Get routes
                    var selectedRoutes = [];
                    $('#poiRoute input:checked').each(function() {
                        selectedRoutes.push($(this).val());
                    });
                     
                    //Put all routes back to the main UI
                    for(i = 0; i < allRoutePaths.length; i++)
                        allRoutePaths[i].setMap(map);
                    
                    if(!isCreating)//only update POI
                    {                        
                        curPOI.poiDesigner.name = name;
                        curPOI.description = desc;  
                        curPOI.poiDesigner.coordinate = markerPOI.getPosition().lat() + " " + markerPOI.getPosition().lng();                                               
                        curPOI.typeList = selectedTypes.join(" ");                                               
                        curPOI.eoiList = selectedEvents.join(" ");                                      
                        curPOI.routeList = selectedRoutes.join(" ");  
                        curPOI.setTriggerZone(trigerZonePOI,$('#zoneColour').val());
                        allPOIMarkers[tdIndex].setPosition(curPOI.getFirstPoint());
                        updatePOIZone(tdIndex, trigerZonePOI);  
                        allPOIZones[tdIndex].setMap(map); 
                        allPOIZones[tdIndex].setEditable(false);
                        resfulManager.updatePoi(curPOI);                     
                    }
                    else//create new POI
                    {                    
                        var poiBank = new SharcPoiDesigner(0, name, markerPOI.getPosition().lat() + " " + markerPOI.getPosition().lng(), "", designerInfo.id);
                        curPOI = new SharcPoiExperience(curProject.id, poiBank, desc, 0, selectedTypes.join(" "),selectedEvents.join(" "), selectedRoutes.join(" "), 0, 0);
                        curPOI.setTriggerZone(trigerZonePOI,$('#zoneColour').val());
                        
                        if(isFromPhoto && $('#includeGPSPhoto').is(':checked'))//include the GPS taggged photo as the first media for POI
                        {
                            //add the GPS photo to the POI
                            curMediaType = "POI";//New media                            
                            curMediaBank = new SharcMediaDesigner((new Date()).getTime() + "", "image", "", 0, designerInfo.id); 
                            curMedia = new SharcMediaExperience(0, curMediaBank, "POI", -1, curProject.id, $("#mediaCaptionPOI").val(), "", false, true,0);//trick: if curMedia.entityId = -1 then upload media                      
                        }
                        
                        var tmpPoiMarker = new google.maps.Marker({  
    					   position: markerPOI.getPosition(), map: map, zIndex:2,visible: true,draggable: false,
    					   icon:"images/poi.png", title: curPOI.poiDesigner.name,id: allPOIMarkers.length	
    				    });
                        
                        addMarkerPOIClickEvent(tmpPoiMarker);                    
                        allPOIMarkers.push(tmpPoiMarker);
                        allPOIZones.push(trigerZonePOI);
                        allPOIZones[allPOIZones.length-1].setMap(map); 
                        allPOIZones[allPOIZones.length-1].setEditable(false);                     
                        allPOIs.push(curPOI);
                        $("#noOfPOI").text("Number of POIs: " + allPOIs.length);                        
                        resfulManager.createNewPoi(curPOI);
                    }                   
                }             
            }
        });
    });
}

function presentNewPoi(data)
{
    curPOI.id = data.id;
    //Update screen
    showMapWithCorrectBound(map, maxZoomLevel);
    $("#dialog-message").dialog("close");
    //showAllPOIs();
}

function addMarkerPOIClickEvent(marker)
{
    google.maps.event.addListener(marker, 'click', function() 
    {
        if(marker.id!=null)
        {
            openFrom = MAIN_FORM;
            curMediaType = "POI";
            curPOI = allPOIs[marker.id];
            //viewAllMediaItems(curPOI);
            resfulManager.getMediaForEntity("POI", curPOI.id);
            highlightPOI(marker.id);            
            selectedPoiIndex = marker.id;
            
            //$("#allPOIs").val(marker.id);
        }
    });
}

function updatePOIZone(tdIndex, tmpZonePOI)
{
    var tmpColor = $('#zoneColour').val();
    if(tmpZonePOI.center != null) //Triiger zone is a Circle
    {        
        if(allPOIZones[tdIndex].center == null)//previously is a polygon -> create a new Circle
        {
            allPOIZones[tdIndex].setMap(null);
            allPOIZones[tdIndex] = new google.maps.Circle({					
                                    		center: tmpZonePOI.center,
                                            radius: tmpZonePOI.radius,
                                            strokeColor: tmpColor, 
                                    		fillColor:tmpColor, 
                                            fillOpacity: 0.3,		
                                    		map: map
                                    	});
        }
        else//just update
        {            
            allPOIZones[tdIndex].setOptions({center: tmpZonePOI.center, radius: tmpZonePOI.radius, strokeColor:tmpColor, fillColor: tmpColor});
        }
    }
    else//Trigger zone is a polygon
    {
        var polyPath = tmpZonePOI.getPath();
        if(allPOIZones[tdIndex].center == null)//previously is a polygon -> update it
        {
            allPOIZones[tdIndex].setOptions({strokeColor:tmpColor, fillColor: tmpColor});        
            allPOIZones[tdIndex].setPath(polyPath);
        }
        else//create a new polygon
        {
            allPOIZones[tdIndex].setMap(null);
            allPOIZones[tdIndex] = new google.maps.Polygon({					
                                    		paths: polyPath,
                                            strokeColor: tmpColor, strokeOpacity: 1.0, strokeWeight: 2,
                                    		fillColor:tmpColor, fillOpacity: 0.3,		
                                    		map: map
                                    	});
        }
    }    
}

function getTypeEventRoute()//Get associated Type/Event/Route of the POI
{
     /*curEOI = new EOI("9","Flood","2014-10-16","2014-10-02","Horrible flood");
     allEOIs.push(curEOI);
     */
     
     var content =  '<table border="0"  cellpadding="1" cellspacing="1">'                
                    +		'<tr  height="10">'
                    +			'<td width="250"  class="formLabel">' + (allPOITypes.length > 0? 'POI type(s)': 'Currently, there are no POI types to associate with')
                    +                '<div id="poiType" style="max-height: 90px; overflow: auto; width:200px;">'
                    +                    '<table border="0" cellpadding="1" cellspacing="1" >'
    
    for(var i=0;i<allPOITypes.length;i++)
        content     +=                      '<tr><td class="formText"><input type="checkbox" class="inputCheckbox" value="' + allPOITypes[i].id + '"> ' + allPOITypes[i].name + '</td></tr>';
    content = content +                  '</table>'                    
                    +               '</div>' 
                    +           '</td>'
                    +			'<td width="250" class="formLabel">' + (allEOIs.length > 0? 'Associated EOI(s)': 'Currently, there are no EOIs to associate with')
                    +            '<div id="poiEvent" style="max-height: 90px; overflow: auto;width:200px;">'
                    +                '<table border="0" cellpadding="1" cellspacing="1">';                        
    for(var i=0;i<allEOIs.length;i++)
        content     +=                      '<tr><td class="formText"><input type="checkbox" class="inputCheckbox" value="' + allEOIs[i].id + '"> ' + allEOIs[i].eoiDesigner.name + '</td></tr>';
    content = content +              '</table>'                    
                    +            '</div>' 
                    +           '</td>'
                    +			'<td width="250" class="formLabel">' + (allRoutes.length > 0? 'Associated route(s)': 'Currently, there are no routes to associate with')
                    +                '<div id="poiRoute" style="max-height: 90px; overflow: auto; width:200px;">'
                    +                    '<table border="0" cellpadding="1" cellspacing="1" >'    
    for(var i=0;i<allRoutes.length;i++)
        content     +=                      '<tr><td class="formText"><input type="checkbox" class="inputCheckbox" value="' + allRoutes[i].id + '"> ' + allRoutes[i].routeDesigner.name + '</td></tr>';
    content = content +                  '</table>'                    
                    +               '</div>' 
                    +           '</td>'                    
                    +		'</tr>'     
                    +    '</table>';
    return content;             
}

function getLocationPresentation(isFromPhoto)
{
    var content = "";
    if (isFromPhoto)
    {
        content =   '<div>'         
                    +        '<table>'
                    +            '<tbody>'
                    +                '<tr>'
                    +                    '<td>'                        
                    +                		'<div id="photoBrowse">'
                    +                            '<button id="selectFile" class="googleLookAndFeel">Choose a photo file with GPS information of the POI</button>'
                    +                            '<input hidden="hidden" type="file" id="inputFile" name="inputFile" accept="image/*" class="kmlInputElement"/>'
                    +                        '</div>'
                    +                    '</td>'
                    +                    '<td>'                                           
                    +                        '<div id="notePOI" class="formInstructionLabel">Drag & drop the marker to refine the location of the POI</div>'
                    +   					 '<div><input type="checkbox" checked class="moveTrigger" id="moveTrigger" value="moveTrigger"/> Move triggerzone with POI marker</div>'
                    +                    '</td>'
                    +                '</tr>'
                    +                '<tr>'
                    +                    '<td><div id="gpsImage" class="mediaPlacehold"><img id="imgWithGPS" class="imgBox" src="images/placeholder.png"/></div></td>'
                    +                    '<td rowspan="2" class="formLabelBottom"><div id="mapPOI"></div><div class="formLabel"> Trigger zone colour <input type="color" id="zoneColour" value="#00FF00"   style="width:57px;"/> <button class="googleLookAndFeel" style="width:192px; height:27px;"  id="btnEditZone">Edit trigger zone</button></div></td>'                    
                    +                '</tr>'
                    +                '<tr>'
                    +                    '<td class="formLabel">'
                    +                        '<div id="labelAddCaptionToPOI">'
                    +                            '<input type="checkbox" checked class="inputCheckbox" id="includeGPSPhoto" value="includeGPSPhoto"/> Make this photo the first photo of the POI<br/>'
                    +                            '<div id="includeGPSCaption"> Name: <input type="text" id="mediaCaptionPOI" class="makeFistPhotoPOIInputText"/></div>'
                    +                        '</div>'
                    +                    '</td>'
                    +                    '<td></td>'                    
                    +                '</tr>'
                    +            '</tbody>'
                    +        '</table>'
                    +    '</div>';
    }
    else
    {
        content = '<div>'                                      
                    +   '<div id="notePOI" class="formInstructionLabel">Click to identify & Drag and drop the marker to refine the location of the POI</div>'
                    +   '<div><input type="checkbox" checked class="moveTrigger" id="moveTrigger" value="moveTrigger"/> Move triggerzone with POI marker</div>'
                    +   '<div style="width:768px" id="mapPOI"></div>'
                    +   '<div class="formLabel"> Trigger zone colour <input type="color" id="zoneColour" value="#00FF00"   style="width:380px"/> <button class="googleLookAndFeel" style="width:252px; height:27px;"  id="btnEditZone">Edit trigger zone</button></div>'                    
                    +   '</div>';
    }
    return content;        
}

function addGPSPhotoClickEvent()
{
    $('#selectFile').click(function() {
		$("#inputFile").trigger("click");
	});
	
     
    //Chose file button
    $('#inputFile').change(function(){
        //Get GPS info
        $(this).fileExif(function(exifObject)
            {                 
                 if(exifObject.GPSLatitude!= undefined)
                 {
                    var lat = ConvertDMSToDecimal(exifObject.GPSLatitude,exifObject.GPSLatitudeRef);                        
                    var lng = ConvertDMSToDecimal(exifObject.GPSLongitude,exifObject.GPSLongitudeRef);
                    plotPoint(lat,lng,'Taken point','This is where the photo was taken', null);
                    var myLatlng = new google.maps.LatLng(lat, lng);  
                    mapPOI.setCenter(myLatlng);
                    mapPOI.setZoom(17);
                    //alert("Image direction:" + exifObject.GPSImgDirection );                    
                 }                    
                 else
                    showMessage("The photo you've selected does not contain GPS information. Please select another photo or click on the map to identify the location of the POI");            
            }
        );
        //Show the photo
        var fr = new FileReader();
        fr.onload = function () 
        {
            document.getElementById("imgWithGPS").src = fr.result;
            //curImage.src = fr.result;
            //alert("Image size: " + curImage.width + " x " + curImage.height );
        }
        //Read photo as binary file to upload to server later
        fr.readAsDataURL(this.files[0]);
        var fname = $(this).val();
        fname = fname.substring(fname.lastIndexOf("\\")+1,fname.lastIndexOf("."));
        $("#mediaCaptionPOI").val(fname); 
        //read data as byte to upload
        readMediaFileAsBinary(this.files[0]);           			
	});
    //$("#includeGPSCaption").hide();
    $("#includeGPSPhoto").click( function(){
       if( $(this).is(':checked') ) 
       {
            $("#includeGPSCaption").show(); 
       }
       else
            $("#includeGPSCaption").hide();
    });
}
function showAllPOIs() {        
    //curPOI = new POI("Bridge","","","The main bride The main bride","54.10144805555556 -2.6044289722221947",1,"");
    //allPOIs.push(curPOI);            
    
    $(function() {        
        presentPOIs();
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allPOIs.length),
            width: 930,
            position: ['center','middle'],
            buttons: {                
                "Create a new POI from a GPS tagged photo": function() {
                    $(this).dialog("close"); 
                    curBrowsingType = "image";
                    createPOI(true,true,0);                   
                },
                "Create a new POI on map": function() {
                    $(this).dialog("close"); 
                    createPOI(true,false,0);                   
                },
                Close: {
                    class: 'rightButtonClosePOI',
                    text:"Close",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }                 
            }
        });
    });
}
 
function presentPOIs()
{
    try
    {
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Manage POIs" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Name</th><th>Description</th><th>No. of linked EOIs</th><th>No. of linked routes</th><th>No. of media</th><th>Total No. of Likes</th><th>No. of responses</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
        for(var i=0; i < allPOIs.length; i++)
        {
            var name = allPOIs[i].poiDesigner.name;// + " (" + allPOIs[i].latLng + ")";
            var desc = allPOIs[i].description;
            allPOIs[i].eoiList += "";//make it a string
            var eoiCount = (allPOIs[i].eoiList == "" ? 0 : allPOIs[i].eoiList.split(" ").length);
            allPOIs[i].routeList += "";
            var routeCount = (allPOIs[i].routeList == "" ? 0: allPOIs[i].routeList.split(" ").length);
            var mediaCount = allPOIs[i].mediaCount;
            var responseCount = allPOIs[i].responseCount;
            var likeCount = 0;
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + name + '</td><td>' + desc + '</td><td style="text-align:center;">' + eoiCount + '</td><td style="text-align:center;">' + routeCount + '</td><td style="text-align:center;">' + mediaCount + '</td><td style="text-align:center;">' + likeCount + '</td><td style="text-align:center;">' + responseCount +  '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/edit.png"> Edit this POI</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Delete this POI</button> <button class="btnView googleLookAndFeel">Manage this POI\'s media</button></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnEdit").bind("click", editPOI);	
        $(".btnDelete").bind("click", deletePOI);        
        $(".btnView").bind("click", viewMediaPOI);
    }
    catch(e)
    {
        $('#dialog-message').dialog("close");
        showMessage("Error when presenting all POIs: " + e.message);
    }
}

function showDropdownPOI()
{
    try
    {
        if(allPOIs.length < 1)
        {
            showMessage("There are no available POIs. Please create POIs first!");
        }
        else
        {
            var selectList = '<div class="formLabel">Please select a POI</div><div><select id="allAvailablePOIs" class="inputText">';
            selectList = selectList + '<option value = "-1">Please select</option>';
            for(var i=0; i < allPOIs.length; i++)
			{
				selectList = selectList + '<option value = "' + i + '">' + allPOIs[i].poiDesigner.name + '</option>';
			}
            selectList = selectList + '</select></div>';
            
            $('#dialog-message').html('');        
            $('#dialog-message').dialog({ title: "Select a POI" });
            $('#dialog-message').append(selectList);            
            $("#dialog-message").dialog({
                modal: true,
                height: 200,
                width: 340,                
                buttons: {
                    Cancel: function() {
                        $(this).dialog("close");
                    },
                    "Add media": function() {                         
                        if($("#allAvailablePOIs").val()!="-1")
                        {
                            curPOI = allPOIs[$("#allAvailablePOIs").val()];                            
                            curMediaType = "POI";
                            $(this).dialog("close");
                            selectMediaType();
                        }
                        else
                            showMessage("Please select a POI from the dropdown list");
                    }             
                }
            });
        }
    }
    catch(e)
    {
        showMessage("Error when presenting all POIs in a dropdown list: " + e.message);
    }
}
 
function addMediaPOI()
{ 
    var par = $(this).parent().parent(); //get current row 
    var tdIndex = par.children("td:nth-child(1)");//get index of current row
    tdIndex =  parseInt(tdIndex.text())-1;
    curPOI = allPOIs[tdIndex];
    callFrom = POI_FORM;
    curMediaType = "POI";
    selectMediaType();    
}

function viewMediaPOI()
{ 
    var par = $(this).parent().parent(); //get current row
    var tdIndex = par.children("td:nth-child(1)");//get index of current row
    tdIndex =  parseInt(tdIndex.text())-1;
    curPOI = allPOIs[tdIndex];
    openFrom = POI_FORM;
    curMediaType = "POI";
    resfulManager.getMediaForEntity(curMediaType, curPOI.id);    
}

function editPOI()
{ 
    var par = $(this).parent().parent(); //get current row
    var tdIndex = par.children("td:nth-child(1)");//get index of current row
    tdIndex =  parseInt(tdIndex.text())-1;
    curPOI = allPOIs[tdIndex];
    trigerZonePOI = allPOIZones[tdIndex];
    createPOI(false,false,tdIndex);
}

function deletePOI()
{ 
    var par = $(this).parent().parent(); //get current row
    var tdIndex = par.children("td:nth-child(1)");//get index of current row
    tdIndex = parseInt(tdIndex.text()) - 1;
    curPOI = allPOIs[tdIndex];
    //if(curPOI.mediaOrder.length>0)
    //{
    //    showMessage("Please remove all the associated media before deleting this POI");        
    //}
    //else
    {
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Delete a POI"});           
        $('#dialog-message').append('<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This POI and its associated media will be permanently deleted and cannot be recovered. Are you sure?</p>');               
        $( "#dialog-message" ).dialog({
            modal: true,            
            height: 245,
            width: 460,            
            buttons: {             
                Cancel: function() {
                    $( this ).dialog("close");
                    showAllPOIs();
                },
                Yes: function() {                
                    $( this ).dialog("close");
                    //showUploadingStatus("Please wait! Deleting POI with its media...");
                    //Delete all media first                
                    //mDropBox.deletePOI(curPOI);
                    deleteAllMediaAndEntity(curPOI, '["D","POIs","' + curPOI.id + '"]');
                    allPOIs.splice(tdIndex,1); 
                    //Remove marker from map
                    allPOIMarkers[tdIndex].setMap(null);
                    allPOIMarkers.splice(tdIndex,1);
                    //Remove Trigger zone
                    allPOIZones[tdIndex].setMap(null);
                    allPOIZones.splice(tdIndex,1);
                    //Re assign id
                    for(var i=tdIndex; i < allPOIMarkers.length; i++)
                        allPOIMarkers[i].id = i;
                    updatePOIDropdownList();
                    showAllPOIs();                    
                }             
            }
        });
    }     
}


function linkPOIs()
{
    $(function() {        
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Edit association between POIs with EOIs and Routes" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No</th><th>Name</th><th>Description</th><th>Action</th></tr></thead><tbody></tbody></table>');
        for(var i=0; i < allPOIs.length; i++)
        {
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + allPOIs[i].poiDesigner.name + '</td><td>' + allPOIs[i].description + '</td><td nowrap style="text-align:center;"><img src="images/link.png" title="Edit association between POIs with EOIs and Routes" class="btnSave"></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnSave").bind("click", editPOI);
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allPOIs.length),
            width: 700,
            position: ['center','middle'],
            buttons: {                
                Close: function() {
                    $(this).dialog("close");                    
                }             
            }
        });
    });
}
 

function updatePOIDropdownList()
{
    $("#noOfPOI").text("Number of POIs: " + allPOIs.length); 
    if(allPOIs.length == 0)
    {
        highlight.setMap(null);
        selectedPOIMarker.setMap(null);
    } 
}
function readMediaFileAsBinary(f) //https://github.com/josefrichter/resize/blob/master/public/preprocess.js
{	
	var reader = null;
    if(curBrowsingType != "image"){
        if(cloudManager instanceof SharcDropBox)  {//read blob for Dropbox
            reader = new FileReader({'blob': true});  // Create a FileReader object         
            reader.readAsArrayBuffer(f);           // Read the file
        }
        else{
            reader = new FileReader();
            reader.readAsBinaryString(f);
        }             
    }
    else {//image always read blob
       reader = new FileReader({'blob': true});  // Create a FileReader object         
	   reader.readAsArrayBuffer(f);           // Read the file 
    }
	
    reader.onload = function() 
	{    
		if(curBrowsingType != "image")
        {
            curMediaData = reader.result;   // This is the file contents            
        }
        else//compress and resize images
        {
            // blob stuff
            showUploadingStatus("Please wait! Analysing image...");
            var blob = new Blob([event.target.result]); // create blob...            
            window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); // and get it's URL
  
            // helper Image object
            var image = new Image();
            image.src = blobURL;
            image.onload = function() 
            {
                curMediaData = resizeImage(image);                        
                //Send image to the remote server for compression
                resfulManager.compressImage();   
            }
        }        
	};    	
}

function resizeImage(img) 
{
    var max_width = 1200;
    var max_height = 1200;
    
    var canvas = document.createElement('canvas');
    var width = img.width;
    var height = img.height;

    // calculate the width and height, constraining the proportions
    if (width > height) 
    {
        if (width > max_width) 
        {
            //height *= max_width / width;
            height = Math.round(height *= max_width / width);
            width = max_width;
        }
    } 
    else 
    {
        if (height > max_height) 
        {
            //width *= max_height / height;
            width = Math.round(width *= max_height / height);
            height = max_height;
        }
    }
  
    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg",0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)
} 

//Convert lat/long from Degree Minute Second format to decimal format
function ConvertDMSToDecimal(DMS, direction) {
    var dd = DMS[0] + DMS[1]/60 + DMS[2]/(60*60);
    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } 
    return dd;
}

function plotPoint(srcLat,srcLon,title,popUpContent,markerIcon)
{
    var myLatlng = new google.maps.LatLng(srcLat, srcLon);  
    markerPOI.setPosition(myLatlng);
    markerPOI.setMap(mapPOI);    
    //showMapWithCorrectBound(mapPOI,maxZoomLevel);
    if(trigerZonePOI == null)
    {
        curColor = $('#zoneColour').val();
        trigerZonePOI = new google.maps.Circle({					
    		center: myLatlng, radius: 20,
    		strokeColor: curColor, strokeOpacity: 1.0, strokeWeight: 2,
    		fillColor: curColor, fillOpacity: 0.3,		
    		map: mapPOI
    	});
    }
    else if(trigerZonePOI.center != undefined && $('#moveTrigger').is(':checked'))
        trigerZonePOI.setCenter(myLatlng);
    //  markersArray.push(marker);                                              
}

//Called when a new media is added to a POI -> Find the fist image
function updatePoiThumbnail(tmpPOI)
{
    //Get thumbnail
    var poiIcon = null;
    if(tmpPOI.type == "accessibility")
	   poiIcon = "images/access.png";
    else
    {
	   poiIcon = getFirstImage(tmpPOI);
	   if(poiIcon == null)
		  poiIcon = "images/poi.png";
    }
    //get marker
    var markerIndex = -1;
    for(var i=0; i < allPOIs.length; i++)
    {
        if(allPOIs[i].id == tmpPOI.id)
        {
            markerIndex = i;
            break;
        }
    } 
    if(markerIndex != -1)                        
        allPOIMarkers[markerIndex].setIcon(poiIcon);
}

//Highlight a selected POI by a blinking circle
function highlightPOI(selectedPOI)
{	    
	highlight.center = allPOIMarkers[selectedPOI].getPosition();
    selectedPOIMarker.id = selectedPOI;
    selectedPOIMarker.setPosition(highlight.center);
    selectedPOIMarker.setMap(map);
	blink(highlight,5);
}
function blink(highlight, times)
{
	if(times % 2 == 0)
		highlight.setMap(null);
	else
		highlight.setMap(map);
	times--;
	if(times > 0)
		setTimeout(function(){blink(highlight,times)},500);
	else
		highlight.setMap(null);
}

function addDrawingToolForTriggerZone(color)
{
	var shapeOptions = {
		fillColor: color,
		fillOpacity: 0.1,
		strokeWeight: 2,
		strokeColor: color,
		strokeOpacity: 1.0,
		draggable: false,
		editable: false
	};
	drawingManager = new google.maps.drawing.DrawingManager({		
		drawingControl: true,
		drawingControlOptions: {
		  position: google.maps.ControlPosition.TOP_CENTER,
		  drawingModes: [
			//google.maps.drawing.OverlayType.MARKER,
			google.maps.drawing.OverlayType.CIRCLE,
			google.maps.drawing.OverlayType.POLYGON,
			//google.maps.drawing.OverlayType.POLYLINE,
			//google.maps.drawing.OverlayType.RECTANGLE
		  ]
		},
		circleOptions: shapeOptions,
		polygonOptions : shapeOptions,
		//rectangleOptions : shapeOptions
        //polylineOptions : shapeOptions
	});			
	drawingManager.setMap(null);
	
	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) 
	{
		//var buffer_shape = event.overlay;					
		//buffer_shape.id = 1;
		if (event.type == google.maps.drawing.OverlayType.POLYGON || event.type == google.maps.drawing.OverlayType.CIRCLE) 
		{			
			if(trigerZonePOI != null)
                trigerZonePOI.setMap(null);
            trigerZonePOI = event.overlay;
            //drawingManager.setMap(null);
		}    
            						
	});
}  