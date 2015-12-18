var mockLocation;   //a marker show the fake current location
var shownPOIs = new Array();
var map;
var resfulManager;
var endIcon = null;

var markerManager = null;
var allPOIMarkers = new Array();
var allPOIZones = new Array();
var curPOI;
var allPOIs = new Array();
var allRoutes = new Array();
var allRoutePaths = new Array();
var startRouteMarker = null;
var endRouteMarker = null;
var allRouteMarkers = new Array();//Array to store all Start/End markers of routes
var allPoiViz = new Array();    //Array to store all viz of POI (e.g., point, polygon, polyline) - point = null, other = polyline as polygon = polyline with same start and end
var maxZoomLevel = 18;          //Zoom the map to this max level
var curProject = {id:1, name: ""};
var designerInfo = {id:1, apiKey: ""};
//event onload of webpage
$(document).ready(function(){
    initialize();
});

function initialize() 
{
    resfulManager = new SharcRestful();
    try
	{		
		var mapOptions = {
			center: new google.maps.LatLng( 0,0),
			zoom: 12,
			mapTypeControl: false,
			mapTypeId: google.maps.MapTypeId.MAP
		};	
		map = new google.maps.Map(document.getElementById('mapEmulatorCanvas'), mapOptions);
    		var clusterOptions = {
            gridSize: 20,
            maxZoom: 20,
            zoomOnClick: true
        }
        markerManager = new MarkerClusterer(map, [], clusterOptions);
		var image = {
			url: 'images/location.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			size: new google.maps.Size(24, 24),
			// The origin for this image is 0,0.
			origin: new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 0,32.
			anchor: new google.maps.Point(12, 12)
		  };
          
		mockLocation = new google.maps.Marker({
			map: map, 
			icon: image, 			
			visible: true,
			draggable: false}
		);
        
        endIcon = {
            url: 'images/end.png',        
            size: new google.maps.Size(32, 64),        
            origin: new google.maps.Point(0, 0),        
            anchor: new google.maps.Point(16, 0)
        };
    
        endRouteMarker = new google.maps.Marker({
            position: new google.maps.LatLng(0,0),
            draggable:true,
            icon: endIcon,
            map:null
        });
        
        startRouteMarker = new google.maps.Marker({
            position: new google.maps.LatLng(0,0),
            draggable:true,
            icon: "images/start.png",
            map:null
        });
        
        $("#mediaContent").hide();
		$("#mediaTitle").hide();
		$("#closeMediaContent").hide();
        
		$("#closeMediaButton").click(function() 
		{
			$("#mediaContent").hide();
			$("#mediaTitle").hide();
			$("#closeMediaContent").hide();			
		});
		
		$("#centerMapButton").click(function() 
		{
			map.setCenter(mockLocation.getPosition());	
		});		
        var proId = localStorage.getItem("projectID");
        var apiKey = localStorage.getItem("apiKey");
        var locationId = localStorage.getItem("designerID");
        
        proId = 1;
        locationID = 1;
        apiKey = "059f0e0bb017817db7ef9c372a7c6f69";
        
        curProject.id = proId;
        designerInfo.id = locationID;
        designerInfo.apiKey = apiKey;
         
		//Load default file
		window.setTimeout("loadExperience()",1000);         
		window.setInterval("updateCurrentLocation()",1000);			
	}
	catch(e)
	{
		showMessage("initialize()", e);
	}	
}

function updateCurrentLocation()//get the current location from MySQL database and show it on map
{
	resfulManager.getMockLocation(designerInfo.id );
}

function renderLocation(location){
    //alert(result.location[0].lat + " x " + result.location[0].lng);
    var latLng = location.split(" ");	
	var newPos = new google.maps.LatLng(parseFloat(latLng[0]),parseFloat(latLng[1]));
	mockLocation.setPosition(newPos);
	//map.setCenter(newPos);
	findTriggerPoint(newPos);
}


function findTriggerPoint(curLocation) //Identify the current POI
{
    var index = getCurrentTriggerZoneIndex(curLocation);
    if(index == -1)
        return;
	if(shownPOIs.indexOf(index)==-1)
	{
		//displayInfo(allPOIs[i]);
        curPOI = allPOIs[i];
        resfulManager.getMediaForEntity("POI", curPOI.id);									
		shownPOIs.push(index);
	}  
}

function getCurrentTriggerZoneIndex(curLocation)
{
    if(allPOIZones.length>0)
	{  
		for (i = 0; i < allPOIZones.length; i++)
		{ 
            if(allPOIZones[i].center != undefined)//"circle"
			{
				if(getDistance(curLocation,allPOIZones[i].center) < allPOIZones[i].radius)//radius of circle
					return i;
			}
			else //"polygon"
			{				
				if(isCurrentPointInsideRegion(curLocation, allPOIZones[i].getPath()))
                    return i;
			} 
		}
	}
    return -1;
}
function isCurrentPointInsideRegion(curPoint, pointArray)	
{       
	var i;
	var angle=0;
	var point1_lat;
	var point1_long;
	var point2_lat;
	var point2_long;	        
	var n = pointArray.length;   
	for (i = 0; i < n; i++) 
	{
		point1_lat = pointArray.getAt(i).lat() - curPoint.lat();
		point1_long = pointArray.getAt(i).lng() - curPoint.lng();
		point2_lat = pointArray.getAt((i+1)%n).lat() - curPoint.lat();	 
		point2_long = pointArray.getAt((i+1)%n).lng() - curPoint.lng();	  
		angle += Angle2D(point1_lat,point1_long,point2_lat,point2_long);
	}

	if (Math.abs(angle) < Math.PI)
		return false;
	else
		return true;
}

function Angle2D( y1,  x1,  y2, x2)
{
	var dtheta, theta1, theta2;
	theta1 = Math.atan2(y1,x1);
	theta2 = Math.atan2(y2,x2);
	dtheta = theta2 - theta1;
	while (dtheta > Math.PI)
		dtheta -= Math.PI * 2;
	while (dtheta < -Math.PI)
		dtheta += Math.PI * 2;
	return(dtheta);
}
 
function loadExperience()
{	
    resfulManager.getExperienceSnapshotForConsumer(curProject.id);
}

function renderExperience(data)
{
    //clearScreen();
    renderPOIs(data.allPois);    
    //renderEOIs(data.allEois);
    renderRoutes(data.allRoutes);
    showMapWithCorrectBound(map,maxZoomLevel);
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
            displayInfo(allPOIs[marker.id]);
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
            content += '<li id="' + mediaExperience[i].id + '"><img class="imgMedia" width="318" src="' + tmpMedia.content + '"/>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';        
        else if(tmpMedia.contentType == "audio")
            content += '<li id="' + mediaExperience[i].id + '"><div class="mediaPlacehold"><audio width="318" height="50" controls ><source src="' + tmpMedia.content + '" type="audio/mpeg"></audio></div>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';
        else if(tmpMedia.contentType == "video")
            content += '<li id="' + mediaExperience[i].id + '"><div class="mediaPlacehold"><video width="318" height="200" controls> <source src="' + tmpMedia.content + '"></video></div>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';
    }   
    return content + '</ul>';
}

function viewAllMediaItems(data)
{
    var content = "<div>" + getMediaContent(data) + "</div>";		
	$("#mediaContent").html(content);
	$("#mediaContent").show();
	$("#mediaTitle").html(curPOI.poiDesigner.name + ": " + data.length + " media");
	$("#mediaTitle").show();
	$("#closeMediaContent").show();	
    $('#dialog-message').html('');
}

