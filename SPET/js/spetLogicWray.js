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
var endIcon = null;
var allPOIMarkers = new Array();
var allPOIZones = new Array();
var allPoiViz = new Array();    //Array to store all viz of POI (e.g., point, polygon, polyline) - point = null, other = polyline as polygon = polyline with same start and end
var curPOI;
var allPOIs = new Array();
var curEOI;
var allEOIs = new Array();
var allRoutes = new Array();
var allRoutePaths = new Array();
var allRouteMarkers = new Array();//Array to store all Start/End markers of routes
var EXPLORE_ZOOM = 7;
var EXPERIENCE_ZOOM = 16;
var experienceId = "";
var WRAY_LATLNG = new google.maps.LatLng(54.102108, -2.608636);

var apiRoot = '../api/v1/';
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
}
/////////////////////////////////////////////////////////////////////////////////////////

function createGoogleObjects()
{    
	var mapOptions = {
		center: WRAY_LATLNG,
		zoom: EXPERIENCE_ZOOM,
        mapTypeControl: true,
		mapTypeId: google.maps.MapTypeId.HYBRID
	};    	
	map = new google.maps.Map(document.getElementById('spetCanvas'), mapOptions);
    
    var clusterOptions = {
        gridSize: 20,
        maxZoom: 20,
        zoomOnClick: true
    }
    markerManager = new MarkerClusterer(map, [], clusterOptions);
    
    endIcon = {
        url: 'images/end.png',        
        size: new google.maps.Size(32, 64),        
        origin: new google.maps.Point(0, 0),        
        anchor: new google.maps.Point(16, 0)
    };
    
    endRouteMarker = new google.maps.Marker({
        position: new google.maps.LatLng(0,0),
        draggable: false,
        icon: endIcon,
        map:null
    });
    
        
    startRouteMarker = new google.maps.Marker({
        position: new google.maps.LatLng(0,0),
        draggable:true,
        icon: "images/start.png",
        map:null
    });
    addsearchBox(map,'pac-input');
}
//Add a search box for Google maps of either main UI/(POI,Route) dialog
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
function getPublicExperiences()
{
    map.setZoom(EXPERIENCE_ZOOM);        
    $.ajax({
            type:'GET',
            url: apiRoot + 'experiences',                        
            success: function(result) {                
                if(result.status == SUCCESS){
                    if(result.data.length > 0)
                        presentAllExperience(result.data);
                    else 
                        showMessage("No experiences available");
                }
                else
                    showMessage(result.data);
            },
            error: function(result) {                
                showMessage(result);
            }
    });       
}

function presentAllExperience(data){
    var tmpLatLng;
    var tmpPoiMarker;
    var locationString;
    for (var i = 0; i < data.length; i++)
	{
		locationString = data[i].latLng.split(" ");
        tmpLatLng = new google.maps.LatLng(parseFloat(locationString[0]), parseFloat(locationString[1]));
        if(getDistance(WRAY_LATLNG,tmpLatLng) < 5000)//5km from centre of Wray
        {
            tmpPoiMarker = new google.maps.Marker({  
    		   position: tmpLatLng, map: map, zIndex:2,visible: true,draggable: false,
    		   icon:"images/experience.png", title: data[i].name, proPath: data[i].id,id: allExperienceMarkers.length		
    	    });
            markerManager.addMarker(tmpPoiMarker);
            addMarkerExperienceClickEvent(tmpPoiMarker);                                
            allExperienceMarkers.push(tmpPoiMarker);                    
         }
	}		
}

function addMarkerExperienceClickEvent(marker)
{
    google.maps.event.addListener(marker, 'click', function() 
    {
        if(marker.id!=null)
        {
            experienceName = marker.title;
            loadExperience(marker.proPath);  
        }
    });
}

function loadExperience(proId)
{     
    experienceId = proId;
    $.ajax({
            type:'GET',
            url: apiRoot + 'experienceSnapshot/' + proId,            
            success: function(result) {                
                if(result.status == SUCCESS)
                    gotoExperienceMode(result.data)
                else
                    showMessage(result.data);
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
    
    for (var i=0; i < allRouteMarkers.length; i++)
        allRouteMarkers[i].setMap(null);
    allRouteMarkers = [];
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


function presentExperience(data)
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
    renderPOIs(data.allPois);    
    //renderEOIs(data.allEois);
    renderRoutes(data.allRoutes);
     
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

function renderPOIs(retPOIs)    
{
    for(i = 0; i < retPOIs.length; i++) {
        //Get info
        var poiDesigner = new SharcPoiDesigner(retPOIs[i].poiDesigner.id, retPOIs[i].poiDesigner.name, retPOIs[i].poiDesigner.coordinate, retPOIs[i].poiDesigner.triggerZone, retPOIs[i].poiDesigner.designerId);
        curPOI = new SharcPoiExperience(retPOIs[i].experienceId,retPOIs[i].poiDesigner,retPOIs[i].description,retPOIs[i].id, retPOIs[i].typeList, retPOIs[i].eoiList,retPOIs[i].routeList, retPOIs[i].mediaCount, retPOIs[i].responseCount);
        allPOIs.push(curPOI);
        //Vis Geofence
        /*
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
        */                               
        //hashTablePOI[curPOI.id] = allPOIs.length;//key = id and value = index of POI in array --> to associate media with POI later
        //Viz marker        
        tmpLatLng = curPOI.getFirstPoint();
        var poiIcon = null;
        if(retPOIs[i].typeList == "accessibility")
            poiIcon = "images/access.png";
        else
        {            
            if(retPOIs[i].thumbnail == "")
                poiIcon = "images/poi.png";
            else
                poiIcon =  getImageMarker(retPOIs[i].thumbnail);
        }                        
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
                icon: endIcon,
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

function addMarkerPOIClickEvent(marker)
{
    google.maps.event.addListener(marker, 'click', function() 
    {
        if(marker.id!=null)
        {         
            curPOI = allPOIs[marker.id];
            getMediaForEntity("POI", curPOI.id);
            //highlightPOI(marker.id);           
        }
    });
}

function getMediaContent(mediaExperience)//For displaying media pane
{
    var content = '<ul id="uList" style="list-style:none; padding-left:0;display:table; margin:0 auto;">';
    var tmpMedia;
    for(var i=0; i < mediaExperience.length; i++)
    {
        tmpMedia = mediaExperience[i].mediaDesigner;
        
        if(tmpMedia.contentType == "text")
            content += '<li id="' + mediaExperience[i].id + '"><div><object class="textMediaBox" id="mediaPOI" type="text/html" data="' + tmpMedia.content + '" ></object></div>';
        else if(tmpMedia.contentType == "image")
            content += '<li id="' + mediaExperience[i].id + '"><img class="imgMedia" width="99%" src="' + tmpMedia.content + '"/>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';        
        else if(tmpMedia.contentType == "audio")
            content += '<li id="' + mediaExperience[i].id + '"><div class="mediaPlacehold"><audio width="99%"   controls ><source src="' + tmpMedia.content + '" type="audio/mpeg"></audio></div>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';
        else if(tmpMedia.contentType == "video")
            content += '<li id="' + mediaExperience[i].id + '"><div class="mediaPlacehold"><video width="99%"  controls> <source src="' + tmpMedia.content + '"></video></div>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';
    }   
    return content + '</ul>';
}

function viewAllMediaItems(data)
{
    var content = "<div>" + getMediaContent(data) + "</div>";		
	$('#dialog-message').html('');        
    //Title shows name of the entity and the number of media 
    var entityName = curPOI.poiDesigner.name;
    var count = data.length;
    $('#dialog-message').dialog({ title: entityName + " (No. of media: " + count + ")"});
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


function getImageMarker(iconPath) {
    return new google.maps.MarkerImage(iconPath, null, null, new google.maps.Point(16,12), new google.maps.Size(32, 24));
}

function getMediaForEntity(entityType, entityId){
    $.ajax({
            type:'GET', 
            url: apiRoot + 'mediaForEntityForSpet/' + experienceId + '/' + entityId  + '/' + entityType,                                 
           
            success: function(result) {                
                if(result.status == SUCCESS){
                    viewAllMediaItems(result.data);	
                }
                else {
                    showMessage(result.data);                    
                }    
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
}

function showMessage(msg){
    alert(msg);
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
