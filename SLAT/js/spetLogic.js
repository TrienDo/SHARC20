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
		center: new google.maps.LatLng(54,0),
		zoom: 7,
        mapTypeControl: true,
		mapTypeId: google.maps.MapTypeId.HYBRID;
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
    map.setZoom(EXPLORE_ZOOM);
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
                for (var i = 0; i < result.projects.length; i++)
				{
					locationString = result.projects[i].proLocation.split(" ");
                    tmpLatLng = new google.maps.LatLng(parseFloat(locationString[0]), parseFloat(locationString[1]));
                    tmpPoiMarker = new google.maps.Marker({  
					   position: tmpLatLng, map: map, zIndex:2,visible: true,draggable: false,
					   icon:"images/experience.png", title: result.projects[i].proName, proPath: result.projects[i].proPublicURL,id: allExperienceMarkers.length		
				    });
                    markerManager.addMarker(tmpPoiMarker);
                    addMarkerExperienceClickEvent(tmpPoiMarker);                                
                    allExperienceMarkers.push(tmpPoiMarker);                    
				}				
			}                        			
        }
    );   
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
    
    //Draw POIs
    for(var i = 0; i< allPOIs.length; i++)
    {
        curPOI = allPOIs[i];
        tmpLatLng = curPOI.getLatLng();
        var poiIcon = getFirstImage(curPOI);
        if(poiIcon == null)
            poiIcon = "images/poi.png";                         
        tmpPoiMarker = new google.maps.Marker({  
        			   position: tmpLatLng, map: map, zIndex:2,visible: true,draggable: false,
        			   icon: poiIcon, title: curPOI.name,id: allPOIMarkers.length	
        		    });
        markerManager.addMarker(tmpPoiMarker);
        addMarkerPOIClickEvent(tmpPoiMarker);                                
        allPOIMarkers.push(tmpPoiMarker);
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

function getFirstImage(tmpPOI)
{	
	for(var i=0; i < tmpPOI.mediaOrder.length; i++)
    {
        tmpMedia = tmpPOI.associatedMedia[tmpPOI.mediaOrder[i]];
        if(tmpMedia == undefined)
            continue;
        if(tmpMedia.type == "image")
			return new google.maps.MarkerImage(tmpMedia.content, null, null, new google.maps.Point(16,12), new google.maps.Size(32, 24));
    }
	return null;	
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
            content += '<li id="' + i + '"><div>' + tmpMedia.content.replace(/\r\n|\r|\n/g,"<br />")  + '</div>';
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
