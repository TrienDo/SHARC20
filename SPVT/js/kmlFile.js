var placeMarks = new Array();
function importKML()
{
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Import data from a KML file" });
    var content = '<div id="photoBrowse">'
                +      '<button id="selectKmlFile" class="googleLookAndFeel">Choose a KML file</button>'
                +      '<input hidden="hidden" type="file" id="inputKmlFile" accept="application/vnd.google-earth.kml+xml"/>'
                + '</div>'                     
                + '<div>Default radius of trigger zone<input type="text" id="triggerRadius" value="10"/>(m)</div>'
                + '<div>Default colour of trigger zone<input type="color" id="triggerColour" value="#00ff00"/></div>';
                
    $('#dialog-message').append(content);
    
    $('#selectKmlFile').click(function() {
		$("#inputKmlFile").trigger("click");
	});
    
    $('#inputKmlFile').change(function(){
		readKmlFile(this.files[0]);
    });
                       
    $( "#dialog-message" ).dialog({
        modal: true,
        height: 240,
        width: 360,
        position: ['center','middle'],
        buttons: {                
            Cancel: function(){                    
                $( this ).dialog("close");                
            },   
            Import: function() {
                var radius = parseInt($('#triggerRadius').val());
                var colour = $('#triggerColour').val();
                createPois(radius,colour);                 
                $(this).dialog("close");                    
            }             
        }
    });
}

function readKmlFile(f) 
{	
	var reader = new FileReader();  // Create a FileReader object         
	reader.readAsText(f);           // Read the file
	reader.onload = function() 
	{    
		var kmlContent = reader.result;   // This is the file contents					
        //if(allGeofences.length > 0)
		//removeAllGeofences();
        
	    parseKmlFile(kmlContent); // This is the file contents		
        //showKMLDetails($("#inputFile").val());        
	};    	
} 

function parseKmlFile(kmlContent)
{
    var xmlDoc = null;
    if (window.DOMParser)
	{
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(kmlContent,"text/xml");		
	}
	else // Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async=false;
		xmlDoc.loadXML(kmlContent);
	}
	placeMarks = [];	
	var objPM = xmlDoc.getElementsByTagName("Placemark");
	if(objPM != null) 
	{
		for (i=0; i< objPM.length; i++)
		{
			var nameObj = objPM[i].getElementsByTagName("name");					
			var name = "";
			if (nameObj.length > 0)
				name = nameObj[0].textContent;
			
			var desObj = objPM[i].getElementsByTagName("description");	
			var des = "";
			if (desObj.length > 0)
				des = desObj[0].textContent;
			
			var coorObj = objPM[i].getElementsByTagName("coordinates");	
			var coor = "";
			var type = "";
			if (coorObj.length > 0)
			{
				coor = coorObj[0];	
				type = coor.parentNode.nodeName;
				coor = coor.textContent;
			}
			else
				continue;//Some placemark donnot have coordinate but GPS
			var newPM = new Placemark(type,name,des,coor);					
			placeMarks.push(newPM);			
		}
	}
}

 

function createPois(radius,colour)
{
    var id = (new Date()).getTime();
    var newEntities = new Array();
    for(var i=0; i< placeMarks.length; i++)			
	{
		renderPoIandGeofence(newEntities, placeMarks[i],radius,colour, id++);		 							
	}
    savePoiAndMedia(newEntities);
    showMapWithCorrectBound(map, maxZoomLevel);		
}

function renderPoIandGeofence(newEntities, inPM,radius,colour, id) 
{	
	var allPoints = trimSpace(inPM.coor).split(" ");
	var renderPath = new Array();
	var tmpPoint;
	var cirID;
    var location = "";
				
	for(var i=0; i< allPoints.length; i++)
	{				
		tmpPoint = allPoints[i].split(",");
		if(tmpPoint.length < 2)
			continue;
		var loCen =  new google.maps.LatLng(tmpPoint[1], tmpPoint[0]);
        location += " " + tmpPoint[1] + " " + tmpPoint[0];
		renderPath.push(loCen);
	}
	location = location.substring(1);
    
    //Render
	if(renderPath.length > 0)			
	{
		var poiColor = "#FF0000";
        var poiPath = null;
		if(inPM.type.toLowerCase() == "linestring")
		{
			poiPath =  new google.maps.Polyline({
						path: renderPath, geodesic: true,
						strokeColor: poiColor,
						strokeOpacity: 1.0,
						map: map,
                        id: allPOIMarkers.length,
						strokeWeight: 2
					});	
		}
		else if(inPM.type.toLowerCase() == "linearring")
		{
			poiPath =  new google.maps.Polygon({
				paths: renderPath, map: map,
                id: allPOIMarkers.length,
				fillColor: poiColor, fillOpacity: 0.1, strokeWeight: 1,
				strokeColor: poiColor, strokeOpacity: 1.0,
			});
		}				
	}
    
    trigerZonePOI = new google.maps.Polygon({					
    		paths: generatePolygonFromPolyline(poiPath.getPath().getArray(),radius),
    		strokeColor: colour, strokeOpacity: 1.0, strokeWeight: 2,
    		fillColor:colour, fillOpacity: 0.3,
            id: allPOIMarkers.length,		
    		map: map
    	});
        
    allPOIMarkers.push(poiPath);
    addPolylinePOIClickEvent(trigerZonePOI)    
    curPOI = new POI(inPM.name,"","","",location,id,"","");
    curPOI.setTriggerZone(trigerZonePOI,colour);
    allPOIs.push(curPOI);
    allPOIZones.push(trigerZonePOI);	
    //media
    curMedia = new Media(id,"", "text" ,"",inPM.desc,0,"",id,"POI");
    curPOI.mediaOrder.push(curMedia.id);
    curPOI.associatedMedia[curMedia.id] = curMedia;  
    //Create dropbox string for insert data
    var newPoiString = '["I","POIs",' + '"' + curPOI.id + '"' + ',{"name":"' + encodeURI(curPOI.name) + '","type":"' 
                    + curPOI.type + '","associatedEOI":"' + curPOI.associatedEOI + '","associatedRoute":"' 
                    + curPOI.associatedRoute + '","desc":"' + encodeURI(curPOI.desc) + '","triggerZone":"' 
                    + curPOI.triggerZone + '","latLng":"' + curPOI.latLng + '","mediaOrder":"' + curPOI.mediaOrder + '"}]';
    newEntities.push(newPoiString);                
    
    var newMedia = '["I","media",' + '"' + curMedia.id + '"' + ',{"name":"' +  encodeURI(curMedia.name) + '","type":"' + curMedia.type 
                    + '","desc":"' + encodeURI(curMedia.desc) + '","content":"' + encodeURI(curMedia.content) + '","noOfLike":"' + curMedia.noOfLike  
                    + '","context":"' + curMedia.context  + '","PoIID":"' + curMedia.PoIID + '","attachedTo":"' + curMedia.attachedTo + '"}]';
    newEntities.push(newMedia);      
}

function addPolylinePOIClickEvent(polyline)
{
    google.maps.event.addListener(polyline, 'click', function() 
    {
        if(polyline.id!=null)
        {
            openFrom = MAIN_FORM;
            curMediaType = "POI";
            curPOI = allPOIs[polyline.id];
            viewAllMediaItems(curPOI);                        
            selectedPoiIndex = polyline.id;            
        }
    });
}

//generatePolygonFromPolyline(routePath.getPath().getArray(),10);
function generatePolygonFromPolyline(polyline,value)
{
    var overviewPathGeo = [];
    for (var i = 0; i < polyline.length; i++) {
       overviewPathGeo.push([polyline[i].lng(), polyline[i].lat()]);
    }
    
    var distance = value / 100000, // to meter
    geoInput = {
    type: "LineString",
        coordinates: overviewPathGeo
    };
    var geoReader = new jsts.io.GeoJSONReader(),
        geoWriter = new jsts.io.GeoJSONWriter();
    var geometry = geoReader.read(geoInput).buffer(distance);
    var polygon = geoWriter.write(geometry);
    
    var oLanLng = [];
    var oCoordinates;
    oCoordinates = polygon.coordinates[0];
    for (i = 0; i < oCoordinates.length; i++) {
       var oItem;
       oItem = oCoordinates[i];
       oLanLng.push(new google.maps.LatLng(oItem[1], oItem[0]));
    }
    
    return oLanLng;
}

function savePoiAndMedia(entityArray)
{    
    var dataChanges = entityArray.join(",");
    dataChanges = "[" + dataChanges + "]";
    //Call the update command
    mDropBox.updateCommand(dataChanges);
}