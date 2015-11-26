/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Implementing functions of menu Experience   
*/ 

var hashProjects = new Array(); //For creating a new experience
var allProjects = new Array();//For managing experiences
var curProject = null;
//Create a new experience
var presentAllExperience = "";//temp call back function for presenting list of experience 1: for names only 2: all details
var showExperienceUpdateInfo = "";//temp call back function for presenting updated info of of experience 1: publish -> size, 2: unpublish: nothing
function createProject() {   
    //Create a dialog for the user to enter details about the experience
    $(function() {        
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Creating a new experience" });
        $('#dialog-message').append('<div class="formLabel">Experience name</div><div><input type="text" id="projectName" class="inputText"/></div><div class="formLabel">Experience description (optional but please consider including accessibility issues and whether this route is affected by season, weather, etc)</div><div><textarea rows="3" id="projectDesc" class="inputText"/></div>');
               
        $( "#dialog-message" ).dialog({
            modal: true,
            height: 290,
            width: 355,
            position: ['center','middle'],
            buttons: {
                Cancel: function() {
                    $( this ).dialog("close");
                },
                Create: function() {
                    var fname = $("#projectName").val();
                    fname = $.trim(fname);
                    if(!isValidProName(fname))
                    {
                        showMessage("Invalid project name! Experience name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, single quote and space.");
                        return;
                    }
                    if(hashProjects[fname]!=null)
                    {
                        showMessage("This experience name has been used. Please use another name!");
                        return;
                    }
                    var fdesc = $("#projectDesc").val();
                    fdesc = $.trim(fdesc);
                    if(fdesc!="" && !isValidDescription(fdesc))
                    {
                        showMessage("Invalid experience description! Experience description should contain only numbers, characters, hyphen, underscore, comma, period, colon, and space.");
                        return;
                    }
                    $("#projectSection").show();
                    $("#curProject").text("Current experience: " + fname);
                    $("#proDesc").text("Current experience: " + fdesc);                    
                    //Create a datastore in Dropbox and share it + add a row about the new experience to the MySQL database                    
                    curProject = new SharcExperience(0, fname, fdesc, "", "", designerInfo.id, 0, 1, "", "", "", "", 0, "");
                    resfulManager.createExperience(curProject);
                    //$(this).dialog("close");                    
                }             
            }
        });
    });
}

function startDesigningExperience(data)
{
    curProject = data;
    showMessage("You now can start designing your new experience. Please use the menus at the top to create Points Of Interest (POIs), Events of Interest (EOIs), etc.");
    $("#dialog-message").dialog("close");
    clearScreen();
}
//Open an existing experience
function openProject()
{	
     presentAllExperience = presentExperienceNames;
     resfulManager.getExperienceList();
}

function presentExperienceNames(data)
{
    //Create a dialog for the user to select an experience from a list of experiences         
    var selectList = '<div class="formLabel">Please select an experience</div><div><select id="allProjects" class="inputText">';
    selectList = selectList + '<option value = "-1">Please select</option>';
    allProjects = data;
    for (var i = 0; i < allProjects.length; i++)
	{
		selectList = selectList + '<option value = "' + allProjects[i].id + '">' + allProjects[i].name + '</option>';
	}
    selectList = selectList + '</select></div>';
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Load an experience" });
    $('#dialog-message').append(selectList);//            
    $("#dialog-message").dialog({
        modal: true,
        height: 200,
        width: 340,
        position: ['center','middle'],
        buttons: {
            Cancel: function() {
                $(this).dialog("close");
            },
            Open: function() {               
                var tmpId = $("#allProjects").val();
                if(tmpId != "-1")
                {
                    clearScreen();
                    $("#projectSection").show();
                    $("#curProject").text("Current experience: " + $("#allProjects option:selected").text());
                    //Open an experience
                    for(m=0; m < allProjects.length; m++)
                    {
                        if(allProjects[m].id == tmpId)
                            curProject = allProjects[m]; 
                    }
                    $("#proDesc").text(curProject.description);
                    resfulManager.loadExperience(tmpId);
                    $(this).dialog("close");
                }
            }             
        }
    });
}

function askToCreateNewProject()
{
    $('#dialog-confirm').html('');        
    $('#dialog-confirm').dialog({ title: "Sharc Locative media Authoring Tool"});           
    $('#dialog-confirm').append('<p>No available experiences! Would you like to create a new one?</p>');
    $("#dialog-confirm").dialog({
        modal: true,
        width: 350,
        buttons: {
            Cancel: function() {
                $( this ).dialog("close");
            },
            Ok: function() {
                $( this ).dialog( "close" );
                createProject();
            }
        }
    });    
}

function renderExperience(data)
{
    clearScreen();
    renderPOIs(data.allPois); 
    renderEOIs(data.allEois);
    renderRoutes(data.allRoutes);
    $("#noOfPOI").text("Number of POIs: " + allPOIs.length);
    $("#noOfEOI").text("Number of EOIs: " + allEOIs.length);
    $("#noOfROU").text("Number of Routes: " + allRoutes.length);
    
    //showNotification();//Red rectangle next to the Response menu to indicate new responses    
    showMapWithCorrectBound(map,maxZoomLevel)   
}

function renderPOIs(retPOIs)    
{
    for(i = 0; i < retPOIs.length; i++) {
        //Get info
        var poiDesigner = new SharcPoiDesigner(retPOIs[i].poiDesigner.id, retPOIs[i].poiDesigner.name, retPOIs[i].poiDesigner.coordinate, retPOIs[i].poiDesigner.triggerZone, retPOIs[i].poiDesigner.designerId);
        curPOI = new SharcPoiExperience(retPOIs[i].experienceId,retPOIs[i].poiDesigner,retPOIs[i].description,retPOIs[i].id, retPOIs[i].typeList, retPOIs[i].eoiList,retPOIs[i].routeList, retPOIs[i].mediaCount, retPOIs[i].responseCount);
        allPOIs.push(curPOI);
        //Vis Geofence
        var fenceInfo = curPOI.poiDesigner.triggerZone.trim().split(" ");
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
        allPOIZones.push(tmpPoiZone);                                
        //hashTablePOI[curPOI.id] = allPOIs.length;//key = id and value = index of POI in array --> to associate media with POI later
        //Viz marker        
        tmpLatLng = curPOI.getFirstPoint();
        var poiIcon = null;
        //if(curPOI.type == "accessibility")
        //    poiIcon = "images/access.png";
        //else
        //{
            //poiIcon = getFirstImage(curPOI);
            //if(poiIcon == null)
                poiIcon = "images/poi.png";
        //}
        if(retPOIs[i].thumbnail == "")
            poiIcon = "images/poi.png";
        else
            poiIcon =  getImageMarker(retPOIs[i].thumbnail);                        
        tmpPoiMarker = new google.maps.Marker({  
        			   position: tmpLatLng, map: map, zIndex:2,visible: true,draggable: false,
        			   icon: poiIcon, title: curPOI.poiDesigner.name,id: allPOIMarkers.length	
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
}

function renderEOIs(retEOIs)    
{
    for(i = 0; i < retEOIs.length; i++) {
        //Get info
        var eoiDesigner = new SharcEoiDesigner(retEOIs[i].eoiDesigner.id, retEOIs[i].eoiDesigner.name,retEOIs[i].eoiDesigner.description, retEOIs[i].eoiDesigner.designerId);
        curEOI = new SharcEoiExperience(retEOIs[i].id, eoiDesigner, retEOIs[i].experienceId,retEOIs[i].note, retEOIs[i].poiList, retEOIs[i].routeList, retEOIs[i].mediaCount, retEOIs[i].responseCount);
        allEOIs.push(curEOI);                
    }                                                             
}

function renderRoutes(retRoutes)    
{
    for(i = 0; i < retRoutes.length; i++) {
        //Get info
        var routeDesigner = new SharcRouteDesigner(retRoutes[i].routeDesigner.id, retRoutes[i].routeDesigner.name,retRoutes[i].routeDesigner.directed,retRoutes[i].routeDesigner.colour, retRoutes[i].routeDesigner.path,retRoutes[i].routeDesigner.designerId);
        //get points of path
        var allCoors = new Array();
        if(routeDesigner.path.trim()!= "")
            allCoors = routeDesigner.path.split(" ");
        
        var tmpPath = new Array();
        for(k = 0; k < allCoors.length; k=k+2)
    	{		
    		tmpPath.push(new google.maps.LatLng(allCoors[k],allCoors[k+1]));
    	}
        routePath = new google.maps.Polyline({ path: tmpPath,geodesic: true,editable:false, map: map, strokeColor: (routeDesigner.colour),strokeOpacity: 1.0,strokeWeight: 2}); 
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
    		if(routeDesigner.directed)
                tmpRouteMarker.setMap(map);
            allRouteMarkers.push(tmpRouteMarker);
            
            tmpRouteMarker = new google.maps.Marker({
                position: new google.maps.LatLng(0,0),
                draggable:true,
                icon: "images/start.png",
                map:null
            });
            tmpRouteMarker.setPosition(tmpR[0]);
    		if(routeDesigner.directed)
                tmpRouteMarker.setMap(map);
            allRouteMarkers.push(tmpRouteMarker);
        }
        curRoute = new SharcRouteExperience(retRoutes[i].id, routeDesigner, retRoutes[i].experienceId,retRoutes[i].description, routePath.getPath(), retRoutes[i].poiList, retRoutes[i].eoiList,retRoutes[i].mediaCount, retRoutes[i].responseCount);
        allRoutes.push(curRoute);                
    }                                                             
}

//Manage all experiences of the "logged in" user
function manageProjects()
{	
    presentAllExperience = presentExperiencesDetail;
    resfulManager.getExperienceList();
}

//Present information of each experience in a row of a table
function presentExperiencesDetail(projects)
{
    try
    {
        allProjects = projects; 
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Manage experiences" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Name</th><th>Description</th><th>Created date</th><th>Published</th><th>Moderation mode</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
        for(var i=0; i < projects.length; i++)
        {
            var published = projects[i].isPublished == 1 ? "Yes" : "No";
            var moderation = projects[i].moderationMode;
            if(moderation == "0")
                moderation = "No Moderation";
            else if(moderation == "1")
                moderation = "Moderation";
            else if(moderation == "2")
                moderation = "Responses are not allowed";
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + projects[i].name + '</td><td>' + projects[i].description + '</td><td style="text-align:center;">' + projects[i].createdDate + '</td><td style="text-align:center;">' + published + '</td><td style="text-align:center;">' + moderation + '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/edit.png"> Edit info of this experience</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Delete this experience</button></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnEdit").bind("click", editProject);	
        $(".btnDelete").bind("click", deleteProject);
        
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(projects.length),
            width: 930,
            position: ['center','middle'],
            buttons: {                
                Close: {
                    class: 'rightButtonClosePOI',
                    text:"Close",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }                 
            }
        });
    }
    catch(e){
        showMessage("Error when presenting all POIs: " + e.message);
    }
}

function editProject()
{ 
    var par = $(this).parent().parent(); //get current row
    var tdIndex = par.children("td:nth-child(1)");//get index of current row
    tdIndex =  parseInt(tdIndex.text())-1;
    curProject = allProjects[tdIndex];               
    showDetails(curProject, true);
}

function viewProjectDetails()
{
    showDetails(curProject, false);
}

function showDetails(tmpProject, isManaging)
{
    $('#dialog-media').html('');        
    $('#dialog-media').dialog({ title: "Edit information of an experience"});
    var content = '<div class="formLabel">Experience name<input type="text" id="proNameEdit" class="inputText"/></div>'    
                + '<div class="formLabel">Experience description (please consider including accessibility issues and whether this route is affected by season, weather, etc)</div><div><textarea rows="5" cols="42" id="proDescEdit" ></textarea></div>'
                + '<div class="formLabel">Moderation mode for responses</div><div><input type="radio" name="proModerationMode" value="0">No Moderation (accepted all responses)</input><br/><input type="radio" name="proModerationMode" value="1">Moderation</input><br/><input type="radio" name="proModerationMode" value="2">Responses are not allowed</input></div>';
    $('#dialog-media').append(content);  
    $("#proNameEdit").val(tmpProject.name); 
    $("#proDescEdit").val(tmpProject.description);
    $("input[name=proModerationMode][value=" + tmpProject.moderationMode + "]").attr('checked', 'checked');
    
    $( "#dialog-media" ).dialog({
        modal: true,
        width: 350,
        height: 430,        
        buttons: [                
            {   text: "Cancel", 
                //class: "mapPOIButton",           
                click: function() {
                    $( this ).dialog( "close" );                    
                }
            },
            {
                text: "Save",                
                click: function() {
                    tmpProject.name = $("#proNameEdit").val();
                    tmpProject.description = $("#proDescEdit").val();
                    tmpProject.moderationMode = $('input:radio[name=proModerationMode]:checked').val();
                    
                    $("#curProject").text("Current experience: " + tmpProject.name);
                    $("#proDesc").text("Current experience: " + tmpProject.description);  
                    
                    resfulManager.saveExperience(tmpProject);
                    if(isManaging)
                        presentExperiencesDetail(allProjects) 
                    $( this ).dialog( "close" );                                        
                }
            }                  
        ]      
    });
}

function deleteProject()
{
    var par = $(this).parent().parent(); //get current row
    var tdIndex = par.children("td:nth-child(1)");//get index of current row
    tdIndex =  parseInt(tdIndex.text())-1;
    curProject = allProjects[tdIndex];
    
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Delete an experience"});        
    $('#dialog-message').append('<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This experience will be permanently deleted and cannot be recovered. Are you sure?</p>');               
    $( "#dialog-message" ).dialog({
        modal: true,            
        height: 225,
        width: 460,            
        buttons: {             
            Cancel: function() {
                $( this ).dialog("close");
                presentExperiencesDetail(allProjects);
            },
            Yes: function() {                
                $( this ).dialog("close");                    
                resfulManager.deleteExperience(curProject.id);
            }             
        }
    });
}

function exportToKML()
{
    $(function() {        
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Export the experience to a KML file" });
        var fname = $("#curProject").text();
        fname = fname.substring(fname.indexOf(":") + 2);
        fname = fname.replace(/ /g,"");//Remove space from exprience name to make a file name
        $('#dialog-message').append('<div class="formLabel">KML file name (Note: the kml file extension will be automatically added when the file is saved in your Dropbox)</div><div><input type="text" id="kmlName" value="' + fname + '" style="width:300px;"/></div>');               
        $( "#dialog-message" ).dialog({
            modal: true,
            height: 230,
            width: 340,
            position: ['center','middle'],
            buttons: {
                Cancel: function() {
                    $( this ).dialog("close");
                },
                OK: function() {
                    var ffname = $("#kmlName").val();
                    ffname = $.trim(ffname);
                    if(!isValidFileName(ffname))
                    {
                        showMessage("Invalid file name! File name cannot be blank and should contain only numbers and characters (no space)");
                        return;
                    }
                    mDropBox.saveFile(ffname + ".kml",generateKMLContent(ffname));
                    $( this ).dialog("close");
                }             
            }
        });
    });
}

function generateKMLContent(fileName)
{
    var content = '<?xml version="1.0" encoding="UTF-8"?>'
                + '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">'
                + '<Document>'
                + '<name>' + fileName + '.kml</name>'
                + '<open>1</open>'; 
    //POI
    for(var i = 0; i < allPOIs.length; i++)
    {        
        content = content + '<Placemark><name>' + allPOIs[i].name + '</name><description><![CDATA[';
        content = content + getPOIMediaContent(allPOIs[i]) + ']]></description>';
        var coor = allPOIs[i].latLng.split(" ");
        content = content + '<Point><coordinates>' + coor[1] + ',' + coor[0] + ',0</coordinates></Point></Placemark>';
    }
    //Route
    for(var i = 0; i < allRoutes.length; i++)
    {        
        content = content + allRoutes[i].getKmlPath();
    }
    content += '</Document></kml>'; 
    return content;
}

function publishProject()
{
    //curProject.proSize = getProjectSize();    
    var content = '<table><tr><td>'  
        + '<div>Experience description (optional but please consider including accessibility issues and whether this route is affected by season, weather, etc)</div><br/>'
        + '<div><textarea rows="27" cols="42" id="projectDesc" >' + curProject.description + '</textarea></div><td><td>';
    if(curProject.thumbnailPath == "" || curProject.thumbnailPath == null)
    {    
        content += '<div>Please upload an square image (otherwise it will be stretched) which best represents this experience (e.g. a screenshot containing all routes and POIs)</div>';
        content += '<div><input type="file" id="imageFile" name="imageFile" accept="image/*" class="googleLookAndFeel1"/></div><div class="mediaPlacehold" style="width:350px;height:350px" id="thumbnailEx"><img id="experienceThumbnail" class="imgBox" src="images/placeholder.png"/></div></td></tr></table>';
    }
    else
    {
        content += '<div>Previously, you have submitted a representative image for this experience. If you want to replace it with a new one, please click on the "Choose file" button below to select a new square image</div>'
        content += '<div><input type="file" id="imageFile" name="imageFile" accept="image/*" class="googleLookAndFeel1"/></div><div class="mediaPlacehold" style="width:350px;height:350px" id="thumbnailEx"><img id="experienceThumbnail" class="imgBox" src="'+ curProject.thumbnailPath +'"/></div></td></tr></table>';
    }
        
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Publish the experience '" +  curProject.name + "'"});// + "' (" + curProject.size + "MB)"});
    $('#dialog-message').append(content);
    
    //Chose file button
    $('#imageFile').change(function(){        
        if($('#imageFile').val()!="")
        {        
            //Show in img box
            var imgReader = new FileReader();
            imgReader.onload = function (e) {
                $('#experienceThumbnail').attr('src', e.target.result);
            }
            imgReader.readAsDataURL(this.files[0]);
            
            curBrowsingType = "thumbnail";
            readMediaFileAsBinary(this.files[0]);
        }                 			
	});
           
    $( "#dialog-message" ).dialog({
        modal: true,
        height: 570,
        width: 715,
        position: ['center','middle'],
        buttons: {
            Cancel: function() {
                $( this ).dialog("close");
            },
            Publish: function() {                
                if($('#imageFile').val() == "")//not browse any representative photo
                {
                    if(curProject.thumbnailPath == "" || curProject.thumbnailPath == null)//never browsed before
                        showMessage("Please select an image file!");
                    else //browsed before
                    {
                        curProject.description = $("#projectDesc").val();
                        publishExperienceData(curProject.thumbnailPath);
                        $(this).dialog("close");
                    }                    
                }
                else//browse an image -> upload to cloud and save path
                {
                    cloudManager.saveExperienceThumbnail(curProject.id + ".jpg", curMediaData);
                    $( this ).dialog("close");
                }
            }             
        }
    });
}

function showExperienceSize(experienceInfo){
    showMessage("Your experience has been successfully published. The media package is " + experienceInfo.size + " MB");
}

function publishExperienceData(thumbnailURL)//Called from  mDropBox.saveExperienceThumbnail
{    
    //Make the project accessible/inaccessible by other Dropbox users: isPublic = true (1) -> ccessible, false (0) -> inaccessible
    curProject.summary = getProjectSummary();
    curProject.thumbnailPath = thumbnailURL;
    curProject.isPublished = true;
    curProject.latLng = getExperienceBoundary().getCenter().lat() + " " + getExperienceBoundary().getCenter().lng();
    resfulManager.publishExperience(curProject);
}

function unpublishProject()
{   
    curProject.isPublished = false;
    resfulManager.saveExperience(curProject);
    showMessage("Your exprience has been set to private. Consumers cannot see it online.");    
}
function getProjectSize()
{
    var proSize = 0;
    if(allMedia.length > 0)
	{
		for(var i = 0; i < allMedia.length; i++)
		{
			var size = parseFloat(allMedia[i].context);			
			if(!isNaN(size))
				proSize += size;
		}
	}
    
    if(allResponses.length > 0)
	{
		for(var i = 0; i < allResponses.length; i++)
		{
			var size = parseFloat(allResponses[i].size);			
			if(!isNaN(size))
				proSize += size;
		}
	}
    
    proSize /= 1024*1024;//convert byte to MB
    if(allMedia.length > 0 && (proSize == 0 || isNaN(proSize)))
        proSize = 40;
    return proSize.toFixed(2);
}
function getProjectSummary()
{
    var routeInfo = "";
	if(allRoutes.length > 0)
	{
		for(var i = 0; i < allRoutes.length; i++)
			routeInfo += " [Route name: " + allRoutes[i].routeDesigner.name + " (" +   allRoutes[i].getDistance() + " km). " + allRoutes[i].desc +"].";
	}
    return "This experience has " + allRoutes.length + " route(s), " + allEOIs.length + " EOI(s), and " + allPOIs.length + " POI(s)." + routeInfo;
}