var mockLocation;   //a marker show the fake current location
var shownPOIs = new Array();
var map;
var locationID;     //actually the ID of the designer to access the current location of the designer

var markerManager = null;
var allPOIMarkers = new Array();
var allPOIZones = new Array();
var curPOI;
var allPOIs = new Array();
var allRoutes = new Array();
var allRoutePaths = new Array();
var startRouteMarker = null;
var endRouteMarker = null;

//event onload of webpage
$(document).ready(function(){
    initialize();
});

function initialize() 
{
    try
	{		
		var mapOptions = {
			center: new google.maps.LatLng( 54.103,-2.609),
			zoom: 17,
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
        locationID = localStorage.getItem("designerID");
		//Load default file
		window.setTimeout("loadExperience()",1000);         
		window.setInterval("updateCurrentLocation()",2000);			
	}
	catch(e)
	{
		showMessage("initialize()", e);
	}	
}

function updateCurrentLocation()//get the current location from MySQL database and show it on map
{
	$.post(
        'php/getMockLocation.php',
        {            
            locationID: locationID,                                 
        },
        function(data,status){
            var result = JSON.parse(data);
			if(result.success == 1) //success is coded in JSON object from server = 0/1 and sharcFiles = arrays of name and description
			{				
				//alert(result.location[0].lat + " x " + result.location[0].lng);	
				var newPos = new google.maps.LatLng(result.location[0].lat,result.location[0].lng);
				mockLocation.setPosition(newPos);
				//map.setCenter(newPos);
				findTriggerPoint(newPos);	
			}
        }            
    );	
}


function findTriggerPoint(curLocation) //Identify the current POI
{
    var index = getCurrentTriggerZoneIndex(curLocation);
    if(index == -1)
        return;
	if(shownPOIs.indexOf(index)==-1)
	{
		displayInfo(allPOIs[i]);									
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
	var proPath = localStorage.getItem("projectID");	
    $.post(
        'php/getSnapshotPathFromID.php',
        {            
            proPath: proPath     
        },
        function(data,status){
            var result = JSON.parse(data);
			if(result.success == 1 && result.projects.length > 0) //success is coded in JSON object from server = 0/1 and sharcFiles = arrays of name and description
			{				
                var expPublicURL = result.projects[0].proPublicURL;
                $.ajax({
                    url: expPublicURL,
                    success: function (data){
                        var result = JSON.parse(data);
                        presentExperience(result); 
                    }
                });
            }
            else
                alert("Please make sure that you have published your project!")
        }            
    );  
}

function presentExperience(snapshot)
{
    var tableID = "";
    var tmpData;
    var tmpPoiMarker;      
    var tmpPoiZone;                 
    var hashTablePOI = new Array();//For fast adding media to POI    
    var hashTableRoute = new Array();//For fast adding media to Route
    var allMedia = new Array();//For fast adding media to POI
    var tmpMedia = null; 
    var tmpLatLng;    
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
                var fenceInfo = curPOI.triggerZone.split(" ");
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
        }
        else if(tableID == "media")
        {
            tmpMedia = new Media(snapshot.rows[i].rowid, decodeURI(tmpData.name),tmpData.type,decodeURI(tmpData.desc),tmpData.content,tmpData.noOfLike,tmpData.context,tmpData.PoIID,tmpData.attachedTo);
            allMedia.push(tmpMedia);                                
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
            curRoute = new Route(snapshot.rows[i].rowid, tmpData.name,tmpData.desc,"#" + tmpData.colour,tmpData.associatedPOI,routePath.getPath(),tmpData.associatedEOI);
            
            if(tmpData.mediaOrder != undefined)
               curRoute.mediaOrder = tmpData.mediaOrder.split(" ");
          
            hashTableRoute[curRoute.id] = allRoutes.length;//key = id and value = index of EOI in array
            
            allRoutes.push(curRoute);
            
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
    } 
    
    map.fitBounds(getExperienceBoundary());
    if(map.getZoom()>16)
        map.setZoom(16);
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

function displayInfo(tmpObject)
{
	var content = "<div>" + getPOIMediaContent(tmpObject) + "</div>";		
	$("#mediaContent").html(content);
	$("#mediaContent").show();
	$("#mediaTitle").html(tmpObject.name + ": " + tmpObject.mediaOrder.length + " media");
	$("#mediaTitle").show();
	$("#closeMediaContent").show();	
	//alert(content); 
}
 
function getPOIMediaContent(tmpPOI)
{
    var content = '<ul style="list-style:none; padding-left:0;display:table; margin:0 auto;">';
    var tmpMedia;
    for(var i=0; i < tmpPOI.mediaOrder.length; i++)
    {
        tmpMedia = tmpPOI.associatedMedia[tmpPOI.mediaOrder[i]];
        if(tmpMedia.type == "text")
            content += '<li id="' + i + '"><div>' + decodeURI(tmpMedia.content) +'</div>';
        else if(tmpMedia.type == "image")
            content += '<li id="' + i + '"><img hspace="5px" class="imgMedia" width="97%" src="' + tmpMedia.content + '"/>';        
        else if(tmpMedia.type == "audio")
            content += '<li id="' + i + '"><div style="text-align:center;"><audio width="97%" controls ><source src="' + tmpMedia.content + '" type="audio/mpeg"></audio></div>' ;
        else if(tmpMedia.type == "video")
            content += '<li id="' + i + '"><div style="text-align:center;"><video width="97%" controls> <source src="' + tmpMedia.content + '"></video></div>';
        if(tmpMedia.type == "text")
            content = '<div style="text-align:center;font-weight:bold;">' + tmpMedia.name + '</div>' + content + '<br/>';
        else
            content += '<div style="text-align:center;font-weight:bold;">' + tmpMedia.name + '</div><hr/>';
    }
    return content + '</ul>';
} 