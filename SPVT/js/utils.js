/*
    Author:     Trien Do    
    Created:    May 2015
    Tasks:      Declaring some common functions which are used at different places   
*/

function getIdString(){
    return (new Date().getTime() + "_" + designerInfo.cloudAccountId);
}

//Get the boundary of an experience = smallest rectangle which contains all POIs and Routes
function getExperienceBoundary()
{
    var experienceBoundary = new google.maps.LatLngBounds();
    //Get all POIs
    for(i = 0; i < allPOIMarkers.length; i++)
    {
        if(allPOIMarkers[i].position != undefined)
        	experienceBoundary.extend(allPOIMarkers[i].getPosition());
        else
        	experienceBoundary.extend(allPOIMarkers[i].getPath().getArray()[0]);

    }
    //Get all routes
    for(i = 0; i < allRoutes.length; i++)
    {
        var points = allRoutes[i].polygon.getArray();
        for(k = 0; k < points.length; k++)
            experienceBoundary.extend(points[k]);
    }
    return experienceBoundary;
}

//Get the boundary of an array of LatLng -- NOT IN USE?
function getBoundaryForArray(tmpArr)
{
    var boundary = new google.maps.LatLngBounds();    
    for(i = 0; i < tmpArr.length; i++)
        boundary.extend(tmpArr[i]);
    return boundary;
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
    /*
    return  image = 
			{
				url: tmpMedia.content,
				// This marker is 20 pixels wide by 32 pixels high.
				size: new google.maps.Size(32, 24),
				// The origin for this image is (0, 0).
				origin: new google.maps.Point(0, 0),
				// The anchor for this image is the base of the flagpole at (0, 32).
				anchor: new google.maps.Point(16, 12)
			};  
    */
}

function getImageMarker(iconPath) {
    return new google.maps.MarkerImage(iconPath, null, null, new google.maps.Point(16,12), new google.maps.Size(32, 24));
}


//Show the map with suitable zoom level to contain the whole experience
function showMapWithCorrectBound(inMap, maxZoom)//inMap can be map of main UI or of (POI, Route) dialog 
{
    experienceBoundary = getExperienceBoundary();
    if(experienceBoundary.isEmpty()) //Experience has no POI, Route
    {
        if(inMap == map) //Show the whole world if it is the main map
        {
            experienceBoundary.extend(new google.maps.LatLng(65, -45));//Top left
            experienceBoundary.extend(new google.maps.LatLng(-50, 45));//Bottom right
        }
        else //get the current map view of main map
        {
            experienceBoundary = map.getBounds();            
        }
    }   
    inMap.fitBounds(experienceBoundary);
    if(inMap.getZoom() > maxZoom)//Only one POI -> Zoom level may be too high -> show map in a threshold zoom level 
       inMap.setZoom(maxZoom);    
}

//Show appropriate area for POI dialog
//Copy the current area of main map for new POI
//Go to the current location of POI for edit 
function showAppropriatePoiMap(inMap, tmpPOI)//inMap can be map of main UI or of (POI, Route) dialog 
{
    if(tmpPOI == null)//New poi -> Copy main map
    {        
        inMap.fitBounds(map.getBounds());
        inMap.setZoom(map.getZoom());
    }
    else//edit POI -> go to the current POI with maxZome
    {
        inMap.setCenter(tmpPOI.getFirstPoint());     
        inMap.setZoom(maxZoomLevel);    
    }   
}
//Show appropriate area for Route dialog
//Copy the current area of main map for new Route
//Go to the current location of Route for edit
function showAppropriateRouteMap(inMap, tmpRoute)//inMap can be map of main UI or of (POI, Route) dialog 
{
    if(tmpRoute == null)//New route -> Copy main map
    {        
        inMap.fitBounds(map.getBounds());
        inMap.setZoom(map.getZoom());
    }
    else//edit route -> go to the current fitbound of route
    {
        var routeBoundary = new google.maps.LatLngBounds();
        var points = tmpRoute.polygon.getArray();
        for(k = 0; k < points.length; k++)
            routeBoundary.extend(points[k]);
        inMap.fitBounds(routeBoundary);    
    }   
}

//Each entity may relate to a few items of another entity
//i.e., a POI may related to 1 or more EOIs -> The dialog heigh should be dynamically calculated
function getHeightForDialog(maxEle)
{            
    if(maxEle >=5)
        return 435;
    else if(maxEle >=4)
        return 395;
    else if(maxEle >=3)
        return 355;
    else if(maxEle >=2)
        return 315;
    else if(maxEle >=1)
        return 275;
    else 
        return 200;        
}

function getIndexFromID(mArray,mID)
{
    for(i = 0; i < mArray.length; i++)
        if(mArray[i].id == mID)
            return i;
    return -1;
}


//A better dialog than alert of javascript
function showMessage(msg)
{    
    $('#dialog-confirm').html('');        
    $('#dialog-confirm').dialog({ title: "Sharc Locative media Authoring Tool"});           
    $('#dialog-confirm').append('<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>' + msg + '</p>');
    $("#dialog-confirm").dialog({
        modal: true,
        width: 350,
        buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
            }
        }
    });    
}


//When an entity is associated with other entities, info of associated entities needs updating too --> many - many relationship
//Input - mID: id of the main entity
//      - mSelected: a list of associate entities
//      - mArray: array of all possible associate entities
//      - mEntity: type of associated entity such as associatedPOI, associatedEOI, associatedRoute --> use eval of JS
//      - mTable: name of the table of the datastore such as EOIs,POIs, Routes 


//For example: updateAssociatedEntity(curPOI.id,curPOI.associatedEOI,allEOIs,"associatedPOI","EOIs")
//             will update info of associated EOIs of a POI
//In this example main entity is POI, associated entity is EOIs
 
function updateAssociatedEntity(mID,mSelected,mArray,mEntity,mTable) 
{
    var changes = new Array();
    var evalExp;
    var tmpVal;
    var row = "";
    for(i = 0; i < mArray.length; i++)//Loop through each possible associated entities to update info about he main entity (remove or add) 
    {
        evalExp = "mArray[" + i + "]." + mEntity;   //example output: allEOIs[2].associatedPOI
        tmpVal = "" + eval(evalExp);                //example output: a list of POI associated with  
        if(mSelected.indexOf(mArray[i].id)!=-1)     //if the main entity is associate with this possible entity
        {
            if(tmpVal.indexOf(mID)==-1)             //if the main entity is not in the associated list of this possible entity -> add to the list
            {
                if(tmpVal == "")
                    eval(evalExp + "+=" + mID);
                else
                    eval(evalExp + "+= ' ' + " + mID);
            }
        }
        else                                        //if the main entity is NOT associate with this possible entity
        {
            if(tmpVal.indexOf(mID)!=-1)             //remove the main entity form the associated list of this entity
            {
                if(tmpVal.indexOf(mID)==0)
                {
                    var replaced = tmpVal.replace(mID + " ","");
                    if(replaced == tmpVal)          //There is only one associated entity -> no space after ID
                        eval(evalExp + "=''");
                    else
                        eval(evalExp + "=" + replaced);//First element + space
                }
                else
                    eval(evalExp + "=" + tmpVal.replace(" " + mID,""));//Space + other element
            }
        }
        row = '["U","' + mTable + '","' + mArray[i].id + '",{"' + mEntity + '":["P","' +  eval(evalExp) + '"]}]';//Update each Entity Table
        changes.push(row);
    }    
    return changes;
}

//Delete an entity and its accociate media
//Input entity = curPOI/curEOI/curRoute
//      sql = statement to delete the entity
function deleteAllMediaAndEntity(entity, sql)
{
    var changes = new Array();
    changes.push(sql);
    for(key in entity.associatedMedia)
    {
        //Create SQL
        var row = '["D","media","' + key  + '"]';
        changes.push(row);
        //Delete file
        if (entity.associatedMedia[key].type != "text")
        {
            var filename = entity.associatedMedia[key].content;
            filename = filename.substring(filename.lastIndexOf("/"));
            mDropBox.deleteFile(filename);
        }
    }
    //Join all queries
    var dataChanges = changes.join(",");
    dataChanges = "[" + dataChanges + "]";
    //Call the update command
    mDropBox.updateCommand(dataChanges); 
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

function rad(x) //Convert degree to radian
{
	return x * Math.PI / 180;
}

function getDistance(p1, p2) //Get distance between two LatLng
{
	var R = 6378137; // Earth’s mean radius in meter
	var dLat = rad(p2.lat() - p1.lat());
	var dLong = rad(p2.lng() - p1.lng());
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d; // returns the distance in meter
}

function getDistanceLong(lat1, lng1, lat2, lng2) //Get distance between two LatLng
{
	var R = 6378137; // Earth’s mean radius in meter
	var dLat = rad(lat2 - lat1);
	var dLong = rad(lng2 - lng1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d; // returns the distance in meter
}

function isValidProName(str)//Words can have space 
{    
    return (/^[\w\-_'. ]+$/.test(str));//\w is equivalent of [0-9a-zA-Z_].        
}

function isValidFileName(str) //Words cant have space
{    
    return (/^[\w]+$/.test(str));        
}

function isValidDescription(str) 
{    
    return true;
    //return (/^[\w\-_.:, ]+$/.test(str));//\w is equivalent of [0-9a-zA-Z_].        
}

function isValidName(str)//Words can have space 
{    
    return true;
    //return (/^[\w\-_. ]+$/.test(str));//\w is equivalent of [0-9a-zA-Z_].        
}

function trimSpace (str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}