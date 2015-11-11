/*
    Author:     Trien Do    
    Created:    Jan 2015
    Tasks:      Declaring application logic for SPET   
*/ 

var map;                        //main map
var markerManager = null;
var spetMode = "EXPLORE";       //EXPERIENCE
var experienceName = "";
var allExperienceMarkers = new Array();
var startRouteMarker = null;
var endRouteMarker = null;
var allPOIMarkers = new Array();
var curPOI;
var allPOIs = new Array();
var curEOI;
var allEOIs = new Array();
var allRoutes = new Array();
var allRoutePaths = new Array();
var EXPLORE_ZOOM = 7;
var EXPERIENCE_ZOOM = 16;
var nearProjects = new Array();
var WRAY_LATLNG = new google.maps.LatLng(54.102108, -2.608636);
$(document).ready(function(){
    initialize();
});


function initialize() 
{		
    createGoogleObjects();    
    gotoExplorationMode();   
    $('#btnExplore').click(function(){
		gotoExplorationMode();
	});
    $('#btnDownload').click(function(){
		//gotoExplorationMode();
	});
    
    addsearchBox(map,'pac-input');        
}
/////////////////////////////////////////////////////////////////////////////////////////
function addsearchBox(searchMap,searchTextBoxID)
{
    var searchMarkers = [];
    var searchInput = document.getElementById(searchTextBoxID);
    searchMap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
    var searchBox = new google.maps.places.SearchBox(searchInput);
    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
         
        // For each place, get the icon, place name, and location.
        searchMarkers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: null,                
                position: place.geometry.location
            });
            searchMarkers.push(marker);
            bounds.extend(place.geometry.location);
        }
        searchMap.fitBounds(bounds);
        searchMap.setZoom(16);
    });
    // [END region_getplaces]

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(searchMap, 'bounds_changed', function() {
        var bounds = searchMap.getBounds();
        searchBox.setBounds(bounds);
    });
}
function addsearchBoxShort()
{
    var markers = [];
    var input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox(input);
    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }

        // For each place, get the icon, place name, and location.
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: null,                
                position: place.geometry.location
            });
            markers.push(marker);
            bounds.extend(place.geometry.location);
        }
        map.fitBounds(bounds);
        map.setZoom(16);
    });
    // [END region_getplaces]

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
}

function addsearchBoxFull()
{
    var markers = [];
    var input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox(input);
    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }

        // For each place, get the icon, place name, and location.
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
    
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: image,
                title: place.name,
                position: place.geometry.location
            });
            markers.push(marker);
            bounds.extend(place.geometry.location);
        }
        map.fitBounds(bounds);
    });
    // [END region_getplaces]

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
}

function createGoogleObjects()
{    
	var mapOptions = {
		center: WRAY_LATLNG,
		zoom: EXPERIENCE_ZOOM,
		mapTypeId: google.maps.MapTypeId.MAP
	};	
	map = new google.maps.Map(document.getElementById('spetCanvas'), mapOptions);
    
    var clusterOptions = {
        gridSize: 20,
        maxZoom: 20,
        zoomOnClick: true
    }
    markerManager = new MarkerClusterer(map, [], clusterOptions);
    
    endRouteMarker = new google.maps.Marker({
        position: new google.maps.LatLng(0,0),
        draggable:true,
        icon: "images/end.png",
        map:null
    });
    
    startRouteMarker = new google.maps.Marker({
        position: new google.maps.LatLng(0,0),
        draggable:true,
        icon: "images/start.png",
        map:null
    });
}

function getPublicExperiences()
{
    map.setZoom(EXPERIENCE_ZOOM);
    $.post(
        'php/getPublicProjects.php',
        function(data,status){
            //Build dialog
            var result = JSON.parse(data);
			if(result.success == 1) //success is coded in JSON object from server = 0/1 and sharcFiles = arrays of name and description
			{				
				var tmpLatLng;
                var tmpPoiMarker;
                var locationString;
                var content = '<div><table width="100%" id="tblData" class="tableBorder"><thead><tr><th class="tableHeader">No.</th><th class="tableHeader"">Name</th><th class="tableHeader">Description</th><th class="tableHeader">Action</th></tr></thead><tbody>';
                nearProjects = [];  
                var index = 0; 			
                for (var i = 0; i < result.projects.length; i++)
				{
					locationString = result.projects[i].proLocation.split(" ");
                    tmpLatLng = new google.maps.LatLng(parseFloat(locationString[0]), parseFloat(locationString[1]));
                    if(getDistance(WRAY_LATLNG,tmpLatLng) < 2000)//2km from centre of Wray
                    {
                        content += "<tr class='mediaRow'><td class='tableBorder'>" + (index + 1) 
                                    + "</td><td class='tableBorder'>" + result.projects[i].proName 
                                    + "</td><td class='tableBorder'>" + result.projects[i].proDesc + " " + result.projects[i].proSummary + "</td><td class='tableBorder' align='center'><img onclick='selectProject(" + index 
                                    + ")' class='imgItem' src='images/load.png'></td></tr>";
                        index ++;
                        nearProjects.push(result.projects[i].proName + "-->" + result.projects[i].proPublicURL);
                        //nearProjects.push(result.projects[i].proPublicURL);
                    }                                        
				}
                content += "</tbody></table></div>"
                
                $('#dialog-message').html('');        
                $('#dialog-message').dialog({ title: nearProjects.length + (nearProjects.length > 0 ? " available experiences for Wray" : " available experience for Wray")});                
                $('#dialog-message').append(content); 
                $( "#dialog-message" ).dialog({
                    modal: true,
                    width: 570,
                    height: 280,
                    position: ['center','middle'],                    
                });				
			}                        			
        }
    );   
}
function rad(x) 
{
	return x * Math.PI / 180;
}
function getDistance(p1, p2) 
{
	var R = 6378137; // Earths mean radius in meter
	var dLat = rad(p2.lat() - p1.lat());
	var dLong = rad(p2.lng() - p1.lng());
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d; // returns the distance in meter
}

function selectProject(index)
{
    var expInfo = nearProjects[index].split("-->");
    experienceName = expInfo[0];
    loadExperience(expInfo[1]);    
    $('#dialog-message').dialog("close");
}
function addMarkerExperienceClickEvent(marker)
{
    google.maps.event.addListener(marker, 'click', function() 
    {
        if(marker.id!=null)
        {
            //spetMode = "EXPLORE";  
            //alert(marker.title);
            var expInfo = marker.title.split("-->");
            experienceName = expInfo[0];
            loadExperience(expInfo[1]);          
            //viewAllMediaItems(allPOIs[marker.id]);
            //highlightPOI(marker.id);
        }
    });
}

function addMarkerPOIClickEvent(marker)
{
    google.maps.event.addListener(marker, 'click', function() 
    {
        if(marker.id!=null)
        {         
            viewAllMediaItems(allPOIs[marker.id]);
            //highlightPOI(marker.id);           
        }
    });
}

function loadExperience(expPublicURL)
{
    
    $.ajax({
        url: expPublicURL,
        success: function (data){    
            var result = JSON.parse(data);            
            gotoExperienceMode(result);
        }
    });
}

function gotoExplorationMode()
{
    clearExperience();
    $("#promptSection").show();
    $("#projectSection").hide();
    $("#exploreSection").hide();
    getPublicExperiences();
}

function clearExperience()
{
    markerManager.clearMarkers();
    allPOIs = [];    
    allEOIs = [];
    allRoutes = [];
    for (var i=0; i < allPOIMarkers.length; i++)
        allPOIMarkers[i].setMap(null);
    allPOIMarkers = [];
        
    for (var i=0; i < allRoutePaths.length; i++)
        allRoutePaths[i].setMap(null);
    allRoutePaths = [];
    endRouteMarker.setMap(null);
    startRouteMarker.setMap(null);
}

function gotoExperienceMode(snapshot)
{
    clearExporation();
    //$("#promptSection").hide();
    $("#projectSection").show();
    $("#exploreSection").show();
    presentExperience(snapshot);
}

function clearExporation()
{
    markerManager.clearMarkers();
    for (var i=0; i < allExperienceMarkers.length; i++)
        allExperienceMarkers[i].setMap(null);
    allExperienceMarkers = [];   
}

function showUploadingStatus(message)
{
    $(function() {        
        $('#dialog-status').html('');                       
        $('#dialog-status').append('<div class="statusBox"><img src="images/waiting.gif" hspace="10"/><label>' + message + '</label></div>');
        $("#dialog-status").dialog({
            closeOnEscape: false,
            //open: function(event, ui) { $('.ui-dialog-titlebar').hide();},
            modal: true,
            height: 130,
            width:400,
            position: ['center','middle']            
        });
    });
}

function presentExperience(snapshot)
{    
    var tableID = "";
    var tmpData;
    var tmpPoiMarker;      
    var tmpPoiZone;                 
    var hashTablePOI = new Array();//For fast adding media to POI
    var hashTableEOI = new Array();//For fast adding media to EOI
    var hashTableRoute = new Array();//For fast adding media to Route
    var allMedia = new Array();//For fast adding media to POI
    var tmpMedia = null; 
    var tmpLatLng;     
    
    showUploadingStatus("Please wait. Loading data...");                     
    for(var i = 0; i < snapshot.rows.length; i ++)
    {
        tableID = snapshot.rows[i].tid;
        tmpData = snapshot.rows[i].data;
        if(tableID == "POIs")
        {
            curPOI = new POI(decodeURI(tmpData.name),tmpData.type,tmpData.associatedEOI,decodeURI(tmpData.desc),tmpData.latLng,snapshot.rows[i].rowid,tmpData.associatedRoute, tmpData.triggerZone);
            if(tmpData.mediaOrder != undefined)
                curPOI.mediaOrder = tmpData.mediaOrder.split(" ");
                 
            tmpLatLng = curPOI.getLatLng();                          
            tmpPoiMarker = new google.maps.Marker({  
			   position: tmpLatLng, map: map, zIndex:2,visible: true,draggable: false,
			   icon:"images/poi.png", title: curPOI.name,id: allPOIMarkers.length	
		    });
            markerManager.addMarker(tmpPoiMarker);
            addMarkerPOIClickEvent(tmpPoiMarker);                                
            allPOIMarkers.push(tmpPoiMarker);                                    
            hashTablePOI[curPOI.id] = allPOIs.length;//key = id and value = index of POI in array
            allPOIs.push(curPOI);                                            
        }
        else if(tableID == "media")
        {
            tmpMedia = new Media(snapshot.rows[i].rowid, decodeURI(tmpData.name),tmpData.type,decodeURI(tmpData.desc),decodeURI(tmpData.content),tmpData.noOfLike,decodeURI(tmpData.context),tmpData.PoIID,tmpData.attachedTo);
            allMedia.push(tmpMedia);                                
        }                            
        else if(tableID == "EOIs")
        {
            curEOI = new EOI(snapshot.rows[i].rowid, decodeURI(tmpData.name),decodeURI(tmpData.startDate),decodeURI(tmpData.endDate),decodeURI(tmpData.desc),tmpData.associatedPOI,tmpData.associatedRoute);
            if(tmpData.mediaOrder != undefined)
               curEOI.mediaOrder = tmpData.mediaOrder.split(" ");
            hashTableEOI[curEOI.id] = allEOIs.length;//key = id and value = index of EOI in array
            allEOIs.push(curEOI);
            
        }
        else if(tableID == "POITypes")
        {
            //curPOIType = new POIType(snapshot.rows[i].rowid, decodeURI(tmpData.name),tmpData.icon,decodeURI(tmpData.desc));
            //allPOITypes.push(curPOIType);
        }
        else if(tableID == "Routes")
        {
            //get points of path
            var allCoors = tmpData.polygon.split(" ");
            var tmpPath = new Array();
            for(k = 0; k < allCoors.length; k=k+2)
        	{		
        		tmpPath.push(new google.maps.LatLng(allCoors[k],allCoors[k+1]));
        	}
            routePath = new google.maps.Polyline({ path: tmpPath,geodesic: true,editable:false, map: map, strokeColor: ("#" + tmpData.colour),strokeOpacity: 1.0,strokeWeight: 2}); 
            allRoutePaths.push(routePath);
            var directed = tmpData.directed;
            if(directed == undefined)
                directed = true;
            //show start and end marker
            if(directed)
        	{
        		var tmpR = routePath.getPath().getArray();		
        		endRouteMarker.setPosition(tmpR[tmpR.length - 1]);
        		endRouteMarker.setMap(map);
                startRouteMarker.setPosition(tmpR[0]);
        		startRouteMarker.setMap(map);
        	}
            curRoute = new Route(snapshot.rows[i].rowid, decodeURI(tmpData.name),decodeURI(tmpData.desc),"#" + tmpData.colour,tmpData.associatedPOI,routePath.getPath(),tmpData.associatedEOI,directed);
            
            if(tmpData.mediaOrder != undefined)
               curRoute.mediaOrder = tmpData.mediaOrder.split(" ");
          
            hashTableRoute[curRoute.id] = allRoutes.length;//key = id and value = index of EOI in array
            
            allRoutes.push(curRoute);
        }
    }
    //Associate media with POIs
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
    $("#curProject").text("Current experience: " + experienceName);    
    $("#noOfPOI").text("Number of POIs: " + allPOIs.length);
    $("#noOfEOI").text("Number of EOIs: " + allEOIs.length);
    $("#noOfROU").text("Number of Routes: " + allRoutes.length);
    
                             
    map.fitBounds(getExperienceBoundary());
    if(map.getZoom()>16)
        map.setZoom(16);
    
    $('.ui-dialog-titlebar').show();
    $("#dialog-status").dialog("close");
}

function getExperienceBoundary()
{
    var experienceBoundary = new google.maps.LatLngBounds();
    for(i = 0; i < allPOIMarkers.length; i++)
        experienceBoundary.extend(allPOIMarkers[i].getPosition());
    return experienceBoundary;
}

function viewAllMediaItems(tmpObject)
{
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: tmpObject.name + " (No. of media: " + tmpObject.mediaOrder.length + ")"});
    var content = getPOIMediaContent(tmpObject);
    $('#dialog-message').append(content); 
    $( "#dialog-message" ).dialog({
        modal: true,
        width: 370,
        height: 480,
        position: ['center','middle'],
        buttons: {
            Close: function() {
                $( this ).dialog("close");
            }
        }
    });
}

function getPOIMediaContent(tmpPOI)
{
    var content = '<ul style="list-style:none; padding-left:0;display:table; margin:0 auto;">';
    var tmpMedia;
    for(var i=0; i < tmpPOI.mediaOrder.length; i++)
    {
        tmpMedia = tmpPOI.associatedMedia[tmpPOI.mediaOrder[i]];
        if(tmpMedia.type == "text")
            content += '<li id="' + i + '"><div>' + tmpMedia.content + '</div>';
        else if(tmpMedia.type == "image")
            content += '<li id="' + i + '"><img class="imgMedia" width="318" src="' + tmpMedia.content + '"/>';        
        else if(tmpMedia.type == "audio")
            content += '<li id="' + i + '"><div class="mediaPlacehold"><audio width="318" height="50" controls ><source src="' + tmpMedia.content + '" type="audio/mpeg"></audio></div>' ;
        else if(tmpMedia.type == "video")
            content += '<li id="' + i + '"><div class="mediaPlacehold"><video width="318" height="200" controls> <source src="' + tmpMedia.content + '"></video></div>';
        content += '<div class="formLabel">' + tmpMedia.name + '</div><hr/>';
    }
    return content + '</ul>';
}

