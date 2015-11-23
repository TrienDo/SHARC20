 /*
    Author:     Trien Do    
    Created:    Nov 2014
    Tasks:      Implementing menu Route functions   
*/
function createRouteFromKML()
{
    routePath = null;
    $(function() {        
         //Generate UI
        $('#dialog-message').html(''); 
        $('#dialog-message').dialog({ title: "Create a new route from a KML file" });
        
        var content = '<input id="route-input" class="controls" type="text" placeholder="Search Box"><table border="0">'    	
    		        + '<tr>'
                	+		'<td style="width:140px" class="formLabel" >Import KML file</td>'
                    +		'<td >'
                    +             '<input type="file" id="routeKMLFile" accept="application/vnd.google-earth.kml+xml" class="routeInput"/>'
                    +        '</td>'                	
                    +        '<td style="width:175px" class="formLabel" rowspan="3">' + (allPOIs.length > 0? 'Associated POI(s)': 'Currently, there are no POIs to associate with')
                    +            '<div id="poiList" style="max-height: 80px; width:150px; overflow: auto;">'
                    +                '<table border="0">';
        for(var i=0;i<allPOIs.length;i++)
            content +=                  '<tr><td style="font-weight:normal;"><input type="checkbox" class="inputCheckbox" value="' + allPOIs[i].id + '"> ' + allPOIs[i].poiDesigner.name + '</td></tr>';                    	
        content     +=                '</table>'                    
                    +            '</div>'
                    +        '</td>'                  
                    +        '<td style="width:175px" class="formLabel" rowspan="3" >' + (allEOIs.length > 0? 'Associated Event(s)': 'Currently, there are no EOIs to associate with')
                    +            '<div id="eoiList" style="max-height: 80px; width:150px; overflow: auto;">'
                    +                '<table border="0">';
        for(var i=0;i<allEOIs.length;i++)
            content +=                  '<tr><td style="font-weight:normal;"><input type="checkbox" class="inputCheckbox" value="' + allEOIs[i].id + '"> ' + allEOIs[i].eoiDesigner.name + '</td></tr>';                    	
        content     +=                '</table>'                    
                    +            '</div>'
                    +        '</td>'
                    +        '<td rowspan="3">'
                    +        '</td>'
                	+	 '</tr>'                        
                    +    '<tr>'
                	+		'<td class="formLabel">Route name</td>'
                	+		'<td >'
                    +            '<input type="text" id="routeName" class="routeInput"/>'
                    +        '</td>'
                	+	 '</tr>'
                    +    '<tr>'
                	+		'<td class="formLabel">Select colour</td>'
                    +		'<td style="width:290px" >'
                    +            '<input type="color" id="routeColour" value="#ff0000"  class="routeInput"/>'
                    +        '</td>'
                	+	'</tr>'
                    +   '<tr>'
                	+		'<td class="formLabel">Route description (optional)</td>'
                	+		'<td >'
                    +            '<textarea rows="2" id="routeDesc" class="routeInput"></textarea>'
                    +        '</td>'
                    +		'<td colspan="2">'
                    +            '<div id="epsilonValue" class="formLabel" style="color: maroon;" >Drag the slider bar to refine the route</div>'
                    +            '<div style="margin: 0px 0px 10px 5px; width:290px;" id="epsilonSlider"></div>'
                    +        '</td>'
                    +       '<td style="padding-left:10px;">'
                    +           '<button class="googleLookAndFeel" style="width:80px"  id="btnEditRoute">Edit route</button>'    
                    +        '</td>'                
                	+	'</tr>'
                	+	'<tr>'
                	+		'<td colspan="5" class="tableListColumn"><div><input type="checkbox" checked class="direction" id="direction" value="direction"/> The direction of the route is important</div><div id="mapRoute"></div></td>'    			                
                	+	'</tr>'
                    +'</table>';
        $('#dialog-message').append(content); 
        
        $("#epsilonValue").hide();
        $("#epsilonSlider").hide();
        $('#btnEditRoute').hide();
        
        //Bind event handlers      	
        mapRoute = new google.maps.Map(document.getElementById('mapRoute'), null); //mapOptions = null
        mapRoute.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        showAppropriateRouteMap(mapRoute,null); //showMapWithCorrectBound(mapRoute,maxZoomLevel);
        addsearchBox(mapRoute,'route-input');
        $('#routeColour').change(function(){
    		if(routePath != null)
                routePath.setOptions({strokeColor:$('#routeColour').val()}); 	
    	});
        
        $('#routeKMLFile').change(function(){
    		var reader = new FileReader();  // Create a FileReader object         
        	reader.readAsText(this.files[0]);           // Read the file
        	reader.onload = function() 
        	{    
        		var kmlContent = reader.result;   // This is the file contents
        	    parseAndDrawRoute(kmlContent); 
        	};    	            			
    	});
        
        //Show start and end markers
        $("#direction").click( function(){
            if( $(this).is(':checked') ) 
            {
                 showStartEnd(mapRoute); //Show start and end markers
            }
            else
            	 showStartEnd(null);
         });
        
        //simplify route
        $( "#epsilonSlider" ).slider({
            value: 10,
            min: 0,
            max: 100,
            step: 1,
            slide: function( event, ui ) {          
                if(wayPoints.length > 0)
                {
                    var nOfPoints = drawRoute(RDPsd(wayPoints,ui.value/MAP_ROUTE_SCALE),true);
                    updateSliderBar(nOfPoints);                    
                }
            }
            
        });
        
        //edit path of route
        $('#btnEditRoute').click(function(){
    		if(routePath != null && $('#btnEditRoute').text() == "Edit route")
            {
                routePath.setEditable(true); 	
                $('#btnEditRoute').text("Finish editing");
            }
            else if(routePath != null && $('#btnEditRoute').text() == "Finish editing")
            {
                routePath.setEditable(false); 	
                showStartEnd(mapRoute);
                $('#btnEditRoute').text("Edit route");
            }
    	});
                  
        $( "#dialog-message" ).dialog({
            modal: true,
            height: 700,
            width: 940,            
            buttons: {
                Cancel: function() {
                    $(this).dialog("close");                    
                },
                Save: function() {     
                    var name = $.trim($("#routeName").val());
                    var desc = $.trim($("#routeDesc").val()); 
                    //alert("Path length:" + routePath.getPath().getArray().length);                   
                    if(routePath == null)
                    {
                        showMessage("Please import a path for the route");
                        return;
                    }
                    else if(routePath.getPath().getArray().length > MAX_POINTS_ON_ROUTE)
                    {
                        showMessage("The route contains more than " + MAX_POINTS_ON_ROUTE + " points. Please drag the slider bar to refine it");
                        return;
                    }
                    else if(!isValidName(name))
                    {
                        showMessage("Invalid route name! Name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, and space.");
                        return;
                    } 
                    else if(desc!="" && !isValidDescription(desc))
                    {
                        showMessage("Invalid description! Description should contain only numbers, characters, hyphen, underscore, comma, period, colon, and space.");
                        return;
                    }                    
                    
                    //Get associated poi
                    var selectedPOIs = [];
                    $('#poiList input:checked').each(function() {
                        selectedPOIs.push($(this).val());
                    });
                    //Get associated eoi
                    var selectedEOIs = [];
                    $('#eoiList input:checked').each(function() {
                        selectedEOIs.push($(this).val());
                    });
                    
                    var directed = $('#direction').is(':checked');                    
                    curRoute = new SharcRouteExperience(0,null,curProject.id,desc,routePath.getPath(), selectedPOIs.join(" "), selectedEOIs.join(" "), 0, 0);
                    var routeBank = new SharcRouteDesigner(0,name,directed,$('#routeColour').val(), curRoute.getPolygon(), designerInfo.id);
                    curRoute.routeDesigner = routeBank;
                    
                    allRoutes.push(curRoute);
                    allRoutePaths.push(routePath);
                    routePath.setEditable(false);
                    showStartEnd(map);
                    routePath.setMap(map);
                    //Update database                                        
                    resfulManager.createNewRoute(curRoute);                                                                    
                    $(this).dialog("close");
                }             
            }
        });
    });
}     

function createRouteByDrawing(isCreating)
{
    if(isCreating)
        routePath = null;
    $(function() {        
        //Generate UI
        $('#dialog-message').html(''); 
        if(isCreating)       
            $('#dialog-message').dialog({ title: "Create a new route by drawing on map" });
        else
            $('#dialog-message').dialog({ title: "Edit a route" });
        var content = '<input id="route-input" class="controls" type="text" placeholder="Search Box"><table border="0">'    	
    		        + '<tr><td colspan="4" class="formInstructionLabel">To draw a new route: Click the "Draw" button --> Click the polyline icon at the middle top of the map --> Click to points along the route to draw --> Double click to finish'
                    + '</td></tr>'
                    + '<tr>'
                 	+		'<td style="width:140px" class="formLabel" >Route name</td>'
                	+		'<td style="width:290px" >'
                    +            '<input type="text" id="routeName" class="routeInput"/>'
                    +        '</td>'
                    +        '<td style="width:175px" class="formLabel" rowspan="2">' + (allPOIs.length > 0? 'Associated POI(s)': 'Currently, there are no POIs to associate with')
                    +            '<div id="poiList" style="max-height: 80px; width:150px; overflow: auto;">'
                    +                '<table border="0">';
        for(var i=0;i<allPOIs.length;i++)
            content +=                  '<tr><td style="font-weight:normal;"><input type="checkbox" class="inputCheckbox" value="' + allPOIs[i].id + '"> ' + allPOIs[i].poiDesigner.name + '</td></tr>';                    	
        content     +=                '</table>'                    
                    +            '</div>'
                    +        '</td>'                  
                    +        '<td style="width:175px" class="formLabel" rowspan="2" >' + (allEOIs.length > 0? 'Associated Event(s)': 'Currently, there are no EOIs to associate with')
                    +            '<div id="eoiList" style="max-height: 80px; width:150px; overflow: auto;">'
                    +                '<table border="0">';
        for(var i=0;i<allEOIs.length;i++)
            content +=                  '<tr><td style="font-weight:normal;"><input type="checkbox" class="inputCheckbox" value="' + allEOIs[i].id + '"> ' + allEOIs[i].eoiDesigner.name + '</td></tr>';                    	
        content     +=                '</table>'                    
                    +            '</div>'
                    +        '</td>'                                  
                	+ '</tr>'
                    + '<tr>'
                	+		'<td class="formLabel">Route description (optional)</td>'
                	+		'<td >'
                    +            '<textarea rows="2" id="routeDesc" class="routeInput"></textarea>'
                    +        '</td>'                
                	+ '</tr>'
                    +   '<tr>'
                	+		'<td class="formLabel">Select colour</td>'
                	+		'<td >'
                    +            '<input type="color" id="routeColour" value="#ff0000"  class="routeInput"/>'
                    +        '</td>'
                    +	     '<td colspan="2">'
                    +           '<button class="googleLookAndFeel" style="width:100px" id="btnNewRoute">Draw</button>'                                    
                    +           '<button class="googleLookAndFeel" style="margin-left:10px;width:175px" id="btnEditRoute">Edit</button>' 
                    +           '<button class="googleLookAndFeel" style="margin-left:10px;width:100px" id="btnDeleteRoute">Delete</button>'
                    +        '</td>'                
                	+	'</tr>'
                	+	'<tr>'
                	+		'<td colspan="4" class="tableListColumn"><div><input type="checkbox" checked class="direction" id="direction" value="direction"/> The direction of the route is important</div><div id="mapRoute"></div></td>'    			                
                	+	'</tr>'
                    +'</table>';
        $('#dialog-message').append(content); 
        
        mapRoute = new google.maps.Map(document.getElementById('mapRoute'), null);//mapOptions = null    
        
        if(isCreating)
            showAppropriateRouteMap(mapRoute,null);
        else
            showAppropriateRouteMap(mapRoute,curRoute);
        
        addDrawingTool($('#routeColour').val());
        addsearchBox(mapRoute,'route-input');
        
        //Bind event handlers
        $('#routeColour').change(function(){
    		drawingManager.get('polylineOptions').strokeColor = $('#routeColour').val();
            if(routePath != null)
                routePath.setOptions({strokeColor:$('#routeColour').val()}); 	
    	});
        
        $('#btnEditRoute').prop('disabled', true);
        $('#btnDeleteRoute').prop('disabled', true);
               
        $('#btnNewRoute').click(function(){
    		drawingManager.setMap(mapRoute);
            $('#btnNewRoute').prop('disabled', true);
            $('#btnEditRoute').prop('disabled', false);
            $('#btnDeleteRoute').prop('disabled', false);
    	});
        
        $('#btnEditRoute').click(function(){
    		if($('#btnEditRoute').text() == "Edit" && routePath != null)
            {
                routePath.setEditable(true); 	
                $('#btnEditRoute').text("Finish editing");
                $('#btnDeleteRoute').prop('disabled', true);
                $('#btnNewRoute').prop('disabled', true);
            }
            else if($('#btnEditRoute').text() == "Finish editing")
            {
                routePath.setEditable(false); 	
                showStartEnd(mapRoute);
                $('#btnEditRoute').text("Edit");
                $('#btnDeleteRoute').prop('disabled', false);
            }            
    	});
        
        $('#btnDeleteRoute').click(function(){
    		
            //routePath.setMap(null);
            routePath.setPath([]);
            showStartEnd(null);
            $('#btnNewRoute').prop('disabled', false);
            $('#btnEditRoute').prop('disabled', true);
            $('#btnDeleteRoute').prop('disabled', true);
    	});
        
        $("#direction").click( function(){
            if( $(this).is(':checked') ) 
            {
                 showStartEnd(mapRoute); 
            }
            else
            	 showStartEnd(null);
         });
        
        if(!isCreating)
        {
            $('#btnNewRoute').prop('disabled', true);
            $('#btnEditRoute').prop('disabled', false);
            $('#btnDeleteRoute').prop('disabled', false);            
            $("#routeName").val(curRoute.routeDesigner.name);
            $("#routeDesc").val(curRoute.description);            
            $("#routeColour").val(curRoute.routeDesigner.colour);
            $('#direction').prop('checked', curRoute.routeDesigner.directed);
            
            var selectedPOIs = curRoute.poiList.split(" ");
            for(var i=0; i<selectedPOIs.length; i++)
                $('#poiList input[value="' + selectedPOIs[i] + '"]').prop('checked', true);
            var selectedEOIs = curRoute.eoiList.split(" ");
            for(var i=0; i<selectedEOIs.length; i++)
                $('#eoiList input[value="' + selectedEOIs[i] + '"]').prop('checked', true); 
                
            routePath.setMap(mapRoute);
            showStartEnd(mapRoute);
            //showMapWithCorrectBound(mapRoute,maxZoomLevel);        
        }      
        $( "#dialog-message" ).dialog({
            modal: true,
            height: 730,
            width: 940,            
            buttons: {
                Cancel: function() {
                    $(this).dialog("close");
                    if(!isCreating)
                    {                        
                        routePath.setMap(map);
                        showStartEnd(map);
                        manageAllRoutes();
                    }
                },                
                Save: function() {     
                    var name = $.trim($("#routeName").val());
                    var desc = $.trim($("#routeDesc").val());       
                    var dataChanges = new Array();
                    var newRow = "";             
                    if(routePath == null)
                    {
                        showMessage("Please draw a path for the route");
                        return;
                    }                   
                    else if(!isValidName(name))
                    {
                        showMessage("Invalid route name! Name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, and space.");
                        return;
                    } 
                    else if(desc!="" && !isValidDescription(desc))
                    {
                        showMessage("Invalid description! Description should contain only numbers, characters, hyphen, underscore, comma, period, colon, and space.");
                        return;
                    }
                    //Get associated pois
                    var selectedPOIs = [];
                    $('#poiList input:checked').each(function() {
                        selectedPOIs.push($(this).val());
                    });
                    
                    //Get associated eoi
                    var selectedEOIs = [];
                    $('#eoiList input:checked').each(function() {
                        selectedEOIs.push($(this).val());
                    });
                    
                    var directed = $('#direction').is(':checked');
                       
                    if(!isCreating)
                    {                        
                        curRoute.description = desc;
                        curRoute.poiList = selectedPOIs.join(" ");
                        curRoute.eoiList = selectedEOIs.join(" ");
                        curRoute.polygon = routePath.getPath();
                        
                        curRoute.routeDesigner.name = name;
                        curRoute.routeDesigner.directed = directed;
                        curRoute.routeDesigner.colour = $('#routeColour').val();
                        curRoute.routeDesigner.path = curRoute.getPolygon();
                        resfulManager.updateRoute(curRoute);                                                                        
                    }
                    else
                    {
                        curRoute = new SharcRouteExperience(0,null,curProject.id,desc,routePath.getPath(),selectedPOIs.join(" "), selectedEOIs.join(" "),0,0);
                        var routeBank = new SharcRouteDesigner(0,name,directed,$('#routeColour').val(), curRoute.getPolygon(), designerInfo.id);
                        curRoute.routeDesigner = routeBank;
                    
                        allRoutes.push(curRoute);
                        allRoutePaths.push(routePath);                       
                                                
                        resfulManager.createNewRoute(curRoute);        
                    }
                    routePath.setMap(map);
                    routePath.setEditable(false);
                    showStartEnd(map);  
                    $(this).dialog("close");
                }             
            }
        });
    });    
}  

function presentNewRoute(data, isDeleting)
{
    if(!isDeleting)
        curRoute.id = data.id;
    showMapWithCorrectBound(map, maxZoomLevel);
    $("#noOfROU").text("Number of Routes: " + allRoutes.length);
    manageAllRoutes();
}

function showStartEnd(inMap)
{
	if($('#direction').is(':checked') && routePath!= undefined)
	{
		var tmpR = routePath.getPath().getArray();		
		endRouteMarker.setPosition(tmpR[tmpR.length - 1]);
		endRouteMarker.setMap(inMap);
        startRouteMarker.setPosition(tmpR[0]);
		startRouteMarker.setMap(inMap);
	}
	else
	{
		startRouteMarker.setMap(null);
		endRouteMarker.setMap(null);
	}
}

function manageAllRoutes()
{    
    $(function() {        
        presentAllRoutes();
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allRoutes.length),
            width: 930,
            position: ['center','middle'],
            buttons: {                
                "Create a new route from a KML file": function() {
                    $(this).dialog("close"); 
                    createRouteFromKML(true);                   
                },
                "Create a new route by drawing on map": function() {
                    $(this).dialog("close");  
                    createRouteByDrawing(true);                  
                },
                Close: {
                    class: 'rightButtonCloseRoute',
                    text:"Close",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }               
            }
        });
    });
    //alert(map.getCenter().lat() + " x " + map.getCenter().lng());
}

function presentAllRoutes()
{
    try
    {
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Manage routes" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Name</th><th>Description</th><th>No. of linked POIs</th><th>No. of linked EOIs</th><th>No. of media</th><th>Colour</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
        for(var i=0; i < allRoutes.length; i++)
        {
            var name = allRoutes[i].routeDesigner.name;
            var desc = allRoutes[i].description;
            allRoutes[i].poiList += "";            
            var poiCount = (allRoutes[i].poiList == "" ? 0 : allRoutes[i].poiList.split(" ").length);
            allRoutes[i].eoiList += "";
            var eoiCount = (allRoutes[i].eoiList == "" ? 0 : allRoutes[i].eoiList.split(" ").length);
            var mediaCount = allRoutes[i].mediaCount;
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + name  + '</td><td>' + desc  + '</td><td style="text-align:center;">' + poiCount  + '</td><td style="text-align:center;">' + eoiCount + '</td><td style="text-align:center;">' + mediaCount + '</td><td nowrap style="text-align:center;"><input disabled type="color" style="width:35px;" value="' + allRoutes[i].routeDesigner.colour + '"/></td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/edit.png"> Edit this route</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Delete this route</button> <button class="btnView googleLookAndFeel">Manage this route\'s media</button></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnEdit").bind("click", editRoute);	
        $(".btnDelete").bind("click", deleteRoute);        
        $(".btnView").bind("click", viewMediaRoute);
    }
    catch(e)
    {
        showMessage("Error when presenting all Routes: " + e.message);
    }
}

function showDropdownRoute()
{
    try
    {
        if(allRoutes.length < 1)
        {
            showMessage("There are no available Routes. Please create Routes first!");
        }
        else
        {
            var selectList = '<div class="formLabel">Please select a Route</div><div><select id="allAvailableRoutes" class="inputText">';
            selectList = selectList + '<option value = "-1">Please select</option>';
            for(var i=0; i < allRoutes.length; i++)
			{
				selectList = selectList + '<option value = "' + i + '">' + allRoutes[i].routeDesigner.name + '</option>';
			}
            selectList = selectList + '</select></div>';
            
            $('#dialog-message').html('');        
            $('#dialog-message').dialog({ title: "Select a Route" });
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
                        if($("#allAvailableRoutes").val()!="-1")
                        {
                            curRoute = allRoutes[$("#allAvailableRoutes").val()];                            
                            curMediaType = "ROUTE";
                            $(this).dialog("close");
                            selectMediaType();
                        }
                        else
                            showMessage("Please select a Route from the dropdown list");
                    }             
                }
            });
        }
    }
    catch(e)
    {
        showMessage("Error when presenting all Routes in a dropdown list: " + e.message);
    }
} 

function addMediaRoute()
{ 
    var par = $(this).parent().parent(); //tr 
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex =  parseInt(tdIndex.text())-1;
    curRoute = allRoutes[tdIndex];
    callFrom = ROUTE_FORM;
    curMediaType = "ROUTE";
    selectMediaType();    
}

function viewMediaRoute()
{ 
    var par = $(this).parent().parent(); //tr 
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex =  parseInt(tdIndex.text())-1;
    curRoute = allRoutes[tdIndex];
    openFrom = ROUTE_FORM;
    curMediaType = "ROUTE";
    resfulManager.getMediaForEntity(curMediaType, curRoute.id);
}

function editRoute()
{
    var par = $(this).parent().parent(); //tr 
    var tdName = par.children("td:nth-child(1)");
    var tIndex =  parseInt(tdName.text()-1);
    curRoute = allRoutes[tIndex];  
    routePath = allRoutePaths[tIndex];  
    createRouteByDrawing(false); 
}

function deleteRoute()
{
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    curRoute = allRoutes[tdIndex];
     
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Delete a route"});        
    $('#dialog-message').append('<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This route and its associated media will be permanently deleted and cannot be recovered. Are you sure?</p>');               
    $("#dialog-message" ).dialog({
        modal: true,            
        height: 225,
        width: 460,            
        buttons: {             
            Cancel: function() {
                $( this ).dialog("close");
                manageAllRoutes();
            },
            Yes: function() {                
                $( this ).dialog("close");                    
                resfulManager.deleteRoute(curRoute);
                allRoutePaths[tdIndex].setMap(null);
                allRoutePaths.splice(tdIndex,1);
                allRoutes.splice(tdIndex,1);
                showStartEnd(null);
                $("#noOfROU").text("Number of Routes: " + allRoutes.length);
            }             
        }
    });   
         
}

function linkRoutes()
{
    $(function() {        
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Edit association between Routes with POIs and EOIs" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No</th><th>Name</th><th>Description</th><th>Colour</th><th>Action</th></tr></thead><tbody></tbody></table>');
        for(var i=0; i < allRoutes.length; i++)
        {
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + allRoutes[i].routeDesigner.name  + '</td><td>' + allRoutes[i].description  + '</td><td nowrap style="text-align:center;"><input disabled type="color" style="width:35px;" value="' + allRoutes[i].routeDesigner.colour + '"/></td><td nowrap style="text-align:center;"><img src="images/link.png" title="Edit association between Routes with POIs and EOIs" class="btnSave"></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnSave").bind("click", editRoute);	
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allRoutes.length),
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

function addDrawingTool(color)
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
			//google.maps.drawing.OverlayType.CIRCLE,
			//google.maps.drawing.OverlayType.POLYGON,
			google.maps.drawing.OverlayType.POLYLINE,
			//google.maps.drawing.OverlayType.RECTANGLE
		  ]
		},
		//circleOptions: shapeOptions,
		//polygonOptions : shapeOptions,
		//rectangleOptions : shapeOptions
        polylineOptions : shapeOptions
	});			
	drawingManager.setMap(null);
	
	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) 
	{
		//var buffer_shape = event.overlay;					
		//buffer_shape.id = 1;
		if (event.type == google.maps.drawing.OverlayType.POLYLINE) 
		{			
			routePath = event.overlay;
			showStartEnd(mapRoute);
            drawingManager.setMap(null);
		}            						
	});
}  
function parseAndDrawRoute(kmlContent)
{
    if(routePath != null)
        routePath.setMap(null);
    var xmlDoc = parseXMLStringToXMLDom(kmlContent);    
    if(getPathFromXMLDom(xmlDoc,"gx:coord") == null)
    {        
        if(getPathFromXMLDom(xmlDoc,"coord") == null)
        {
            if(parseLineString(xmlDoc) == null)
                showMessage("No routes detected! SLAT currently support routes captured by My Tracks");
            else
                showRouteRefineTool();
        }
        else
            showRouteRefineTool();
    }
    else
        showRouteRefineTool();    
} 
function showRouteRefineTool()
{
    $("#epsilonValue").show();
    $("#epsilonSlider").show();
    $('#btnEditRoute').show();
}
function parseXMLStringToXMLDom(XMLString)
{
	if (window.DOMParser)
	{
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(XMLString,"text/xml");
		return xmlDoc
	}
	else // Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async=false;
		xmlDoc.loadXML(XMLString); 
		return xmlDoc
	}
}
function getPathFromXMLDom(xmlDOM,tagName)
{
	//var path = new Array();
    wayPoints = [];
	var allPoints = xmlDOM.getElementsByTagName(tagName);
	if(allPoints == null || allPoints.length == 0)
		return null;
	for(i = 0; i < allPoints.length; i++)
	{
		var coorString = allPoints[i].textContent.split(" ");
		//path.push(new google.maps.LatLng(parseFloat(coorString[1]),parseFloat(coorString[0])));
        wayPoints.push(new Point(parseFloat(coorString[1]),parseFloat(coorString[0]))); 
	}            
    var val = $('#epsilonSlider').slider("option", "value");
    var nOfPoints = drawRoute(RDPsd(wayPoints,val/MAP_ROUTE_SCALE),false);
    updateSliderBar(nOfPoints);
    return true;        
}

function parseLineString(xmlDOM)
{
    wayPoints = [];
	var allPoints = xmlDOM.getElementsByTagName("LineString");
	if(allPoints == null || allPoints.length == 0)
		return null;
	for(i = 0; i < allPoints.length - 1; i++)
	{
		var content = allPoints[i].getElementsByTagName("coordinates");
        var coorArr = content[0].textContent.split(" ");
        if(coorArr.length <= 1)
            coorArr = content[0].textContent.split("\n");
        for(j = 0; j < coorArr.length; j++)
        {        
           var coorString = coorArr[j].split(",");
           if(coorString.length > 2)		
                wayPoints.push(new Point(parseFloat(coorString[1]),parseFloat(coorString[0])));
        } 
	}    
    var val = $('#epsilonSlider').slider("option", "value");
    var nOfPoints = drawRoute(RDPsd(wayPoints,val/MAP_ROUTE_SCALE),false);
    updateSliderBar(nOfPoints);
    //drawRoute(wayPoints,false);
    return true;
}

function updateSliderBar(nOfPoints)
{
    $("#epsilonValue").html("Drag the slider bar to refine the route (" + nOfPoints + " points)");
}
function Point(mx,my)
{
    this.x = mx;
    this.y = my;
}

function drawRoute(points,redrawing)
{    
    if(routePath != null)
        routePath.setMap(null);
    var path = new Array();
    for(i = 0; i < points.length; i++)
	{		
		path.push(new google.maps.LatLng(points[i].x,points[i].y));      
	}
	//path = RDPsd(path,0.0);
    if(routePath == null)
    {
        routePath = new google.maps.Polyline({
            path: path,
            geodesic: true,
            editable:false,
            strokeColor: $('#routeColour').val(),
            strokeOpacity: 1.0,
            strokeWeight: 2
        }); 
    }
    else
        routePath.setPath(path);   
    routePath.setMap(mapRoute);
    if(!redrawing)
    {
        var boundary = getBoundaryForArray(path);
        if(!boundary.isEmpty())
            mapRoute.fitBounds(boundary);
    }
    showStartEnd(mapRoute);
    return points.length;
}

//http://karthaus.nl/rdp/
/*
*** Ramer Douglas Peucker

The Ramer-Douglas–Peucker algorithm is an algorithm for reducing the number of points in a curve that is approximated by a series of points. 
It does so by "thinking" of a line between the first and last point in a set of points that form the curve. 
It checks which point in between is farthest away from this line. 
If the point (and as follows, all other in-between points) is closer than a given distance 'epsilon', it removes all these in-between points. 
If on the other hand this 'outlier point' is farther away from our imaginary line than epsilon, the curve is split in two parts. 
The function is recursively called on both resulting curves, and the two reduced forms of the curve are put back together.

1) From the first point up to and including the outlier
2) The outlier and the remaining points.

I hope that by looking at this source code for my Ramer Douglas Peucker implementation you will be able to get a correct reduction of your dataset.

@licence Feel free to use it as you please, a mention of my name is always nice.

Marius Karthaus
http://www.LowVoice.nl

 * 
 */


// this is the implementation with shortest Distance (as of 2013-09 suggested by the wikipedia page. Thanks Edward Lee for pointing this out)
function RDPsd(points,epsilon){
    var firstPoint=points[0];
    var lastPoint=points[points.length-1];
    if (points.length<3){
        return points;
    }
    var index=-1;
    var dist=0;
    for (var i=1;i<points.length-1;i++){
        var cDist=distanceFromPointToLine(points[i],firstPoint,lastPoint);
        
        if (cDist>dist){
            dist=cDist;
            index=i;
        }
    }
    if (dist>epsilon){
        // iterate
        var l1=points.slice(0, index+1);
        var l2=points.slice(index);
        var r1=RDPsd(l1,epsilon);
        var r2=RDPsd(l2,epsilon);
        // concat r2 to r1 minus the end/startpoint that will be the same
        var rs=r1.slice(0,r1.length-1).concat(r2);
        return rs;
    }else{
        return [firstPoint,lastPoint];
    }
}


// this is the implementation with perpendicular Distance
function RDPppd(points,epsilon){
    var firstPoint=points[0];
    var lastPoint=points[points.length-1];
    if (points.length<3){
        return points;
    }
    var index=-1;
    var dist=0;
    for (var i=1;i<points.length-1;i++){
        var cDist=findPerpendicularDistance(points[i],firstPoint,lastPoint);
        if (cDist>dist){
            dist=cDist;
            index=i;
        }
    }
    if (dist>epsilon){
        // iterate
        var l1=points.slice(0, index+1);
        var l2=points.slice(index);
        var r1=RDPppd(l1,epsilon);
        var r2=RDPppd(l2,epsilon);
        // concat r2 to r1 minus the end/startpoint that will be the same
        var rs=r1.slice(0,r1.length-1).concat(r2);
        return rs;
    }else{
        return [firstPoint,lastPoint];
    }
}
    


function findPerpendicularDistance(p, p1,p2) {
    
    // if start and end point are on the same x the distance is the difference in X.
    var result;
    var slope;
    var intercept;
    if (p1[0]==p2[0]){
        result=Math.abs(p[0]-p1[0]);
    }else{
        slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
        intercept = p1[1] - (slope * p1[0]);
        result = Math.abs(slope * p[0] - p[1] + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
    }
   
    return result;
}



// code as suggested by Edward Lee

var distanceFromPointToLine = function (p,a,b){
    // convert array to object to please Edwards code;
    /*p={x:p[0],y:p[1]};
    a={x:a[0],y:a[1]};
    b={x:b[0],y:b[1]};*/
    return Math.sqrt(distanceFromPointToLineSquared(p,a,b));
}

//This is the difficult part. Commenting as we go.
var distanceFromPointToLineSquared = function (p, i, j){
	var lineLength = pointDistance(i,j);//First, we need the length of the line segment.
	if(lineLength==0){	//if it's 0, the line is actually just a point.
		return pointDistance(p,a);
	}
	var t = ((p.x-i.x)*(j.x-i.x)+(p.y-i.y)*(j.y-i.y))/lineLength; 

	//t is very important. t is a number that essentially compares the individual coordinates
	//distances between the point and each point on the line.

	if(t<0){	//if t is less than 0, the point is behind i, and closest to i.
		return pointDistance(p,i);
	}	//if greater than 1, it's closest to j.
	if(t>1){
		return pointDistance(p,j);
	}
	return pointDistance(p, { x: i.x+t*(j.x-i.x),y: i.y+t*(j.y-i.y)});
	//this figure represents the point on the line that p is closest to.
}

//returns distance between two points. Easy geometry.
var pointDistance = function (i,j){
	return sqr(i.x-j.x)+sqr(i.y-j.y);
}

//just to make the code a bit cleaner.
sqr = function (x){
	return x*x;
}