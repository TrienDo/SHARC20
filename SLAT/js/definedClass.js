/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Declaring user-defined classes   
*/  
var SUCCESS = "success";

function SharcUser(userID, userName, userEmail, registrationDate, lastOnline, cloudType, cloudAccountId, apiKey, location)
{
    this.id = userID;
    this.username = userName;
    this.email = userEmail;
    this.registrationDate = registrationDate;
    this.lastOnline = lastOnline;
    this.cloudType = cloudType;
    this.cloudAccountId = cloudAccountId;
    this.apiKey = apiKey;
    this.location = location;
}

function SharcExperience(id, name, description, createdDate, lastPublishedDate, designerId, isPublished, moderationMode, latLng, summary, snapshotPath, thumbnailPath, size, theme)
{
    this.id = id;
    this.name = name;
    this.description = description;          
    this.createdDate = createdDate;
    this.lastPublishedDate = lastPublishedDate;     
    this.designerId = designerId;
    this.isPublished = isPublished;     
    this.moderationMode = moderationMode;        
    this.latLng = latLng;
    this.summary = summary; 
    this.snapshotPath = snapshotPath;
    this.thumbnailPath = thumbnailPath;
    this.size = size;
    this.theme = theme;    
}

function SharcPoiDesigner(id, name, coordinate, triggerZone, designerID)
{
    this.id = id;
    this.name = name;    
    this.coordinate = coordinate;
    this.triggerZone = triggerZone;
    this.designerId = designerID;
}

function SharcPoiExperience(experienceId,poiDesigner,description,id, typeList, eoiList, routeList, mediaCount, responseCount)
{
    this.experienceId = experienceId;
    this.poiDesigner = poiDesigner;
    this.description = description;
    this.id = id;
    this.typeList = typeList;
    this.eoiList = eoiList;
    this.routeList = routeList;    
    this.mediaCount = mediaCount;
    this.responseCount = responseCount;
    this.getFirstPoint = function()
    {
        var tmpLatLng = this.poiDesigner.coordinate.split(" ");
        return new google.maps.LatLng(parseFloat(tmpLatLng[0]), parseFloat(tmpLatLng[1]));
    }
    this.getPoiVizPath = function()
    {
        var tmpPath = new Array();
        var tmpLatLng = this.poiDesigner.coordinate.split(" ");
        if (tmpLatLng.length > 2)
        {
            
            for(k = 0; k < tmpLatLng.length; k=k+2)
        	{		
        		tmpPath.push(new google.maps.LatLng(tmpLatLng[k],tmpLatLng[k+1]));
        	}
        }            
        return tmpPath;
    }
    
    this.setTriggerZone = function (zoneObj,colour)
    {
        if(zoneObj.center != null)  //trigger zone is a circle
        {
            this.poiDesigner.triggerZone = "circle " + colour.substring(1) +  " " + zoneObj.radius + " " + zoneObj.center.lat() + " " + zoneObj.center.lng();
        }
        else                        //trigger zone is a polygon
        {
            var tmp = zoneObj.getPath().getArray().toString();//"(66.99025646736109, -24.36492919921875),(66.64426812270932, -12.06024169921875)"
            tmp  = tmp.replace(/\(/g,"");//Replace ( with blank
            tmp  = tmp.replace(/\)/g,"");//Replace ) with blank
            tmp = tmp.replace(/ /g,"");//Replace space with blank
            tmp = tmp.replace(/,/g," ");//Replace , with space
            this.poiDesigner.triggerZone = "polygon " + colour.substring(1) +  " " + tmp;
        }
    }
}
  
function SharcMediaDesigner(id, contentType, content, size, designerId)
{
    this.id = id;    
    this.contentType = contentType;          //(Text/Image/Audio/Video)
    this.content = content;                  // Content (Text vs. path to media)   
    this.size = size;   
    this.designerId = designerId;    
}

function SharcMediaExperience(id, mediaDesigner, entityType, entityId, experienceId, caption, context, mainMedia, visible, order)
{
    this.id = id;
    this.mediaDesigner = mediaDesigner;
    this.entityType = entityType;          
    this.entityId = entityId;
    this.experienceId = experienceId;     
    this.caption = caption;
    this.context = context;     
    this.mainMedia = mainMedia;        
    this.visible = visible; 
    this.order = order;
}

function SharcEoiDesigner(id, name, description, designerId)
{
    this.id = id;
    this.name = name;
    this.description = description;
    this.designerId = designerId;
}

function SharcEoiExperience(id, eoiDesigner,experienceId, note, poiList, routeList, mediaCount, responseCount)
{
    this.id = id;
    this.eoiDesigner = eoiDesigner;
    this.experienceId = experienceId;
    this.note = note; 
    this.poiList = poiList;
    this.routeList = routeList;   
    this.mediaCount = mediaCount;
    this.responseCount = responseCount;
}

function SharcRouteDesigner(id, name, directed, colour, path, designerId)
{
    this.id = id;
    this.name = name;
    this.directed = directed;
    this.colour = colour;
    this.path = path;
    this.designerId = designerId;
}

function SharcRouteExperience(id, routeDesigner,experienceId, description, polygon, poiList, eoiList, mediaCount, responseCount)
{
    this.id = id;
    this.routeDesigner = routeDesigner;
    this.experienceId = experienceId;
    this.description = description; 
    this.polygon = polygon;
    this.poiList = poiList;
    this.eoiList = eoiList; 
    this.mediaCount = mediaCount;
    this.responseCount = responseCount;  
    this.getPolygon = function()
    {
        //Polygon = MVCArray -> Get Array() of latlng
        var tmp = this.polygon.getArray().toString();//"(66.99025646736109, -24.36492919921875),(66.64426812270932, -12.06024169921875)"
        tmp  = tmp.replace(/\(/g,"");//Replace ( with blank
        tmp  = tmp.replace(/\)/g,"");//Replace ) with blank
        tmp = tmp.replace(/ /g,"");//Replace space with blank
        tmp = tmp.replace(/,/g," ");//Replace , with space
        return tmp;
    } 
    this.getKmlPath = function()
    {
        var path = this.polygon.getArray();
        //KML colour = AABBGGRR
        var kmlPath = "<Placemark><Style><LineStyle><color>FF" + this.colour.substring(5) + this.colour.substring(3,5) + this.colour.substring(1,3) + "</color><width>3</width></LineStyle></Style><gx:MultiTrack><altitudeMode>absolute</altitudeMode><gx:interpolate>1</gx:interpolate><gx:Track>";
        for(var i = 0; i < path.length; i++)
        {
            kmlPath += "<gx:coord>" +  path[i].lng() + " " +  path[i].lat() + " 0</gx:coord>";
        }
        kmlPath += "</gx:Track></gx:MultiTrack></Placemark>";
        return kmlPath;
    } 
    this.getDistance =function()
    {
        var tmp = this.polygon.getArray();        
        var distance = 0.0;		
		for (i=1; i < tmp.length; i++)
		{			
			distance += getDistanceLong(tmp[i-1].lat(), tmp[i-1].lng(), tmp[i].lat(), tmp[i-1].lng());
		}
        distance/=1000;//to km
        return distance.toFixed(2);//get two decimal places
    }        
}

function Response(mID, mType,mDesc,mContent,mNoOfLike,mEntityType, mEntityID, mConName, mConEmail, mStatus, mSize)
{
    this.id = mID;    
    this.type = mType;              //(Text/Image/Audio/Video)
    this.desc = mDesc;
    this.content = mContent;        // Content (Text vs. path to media)
    this.noOfLike = mNoOfLike;
    this.entityType = mEntityType;  //Type of associated entity: New location - POI - EOI - Route
    this.entityID = mEntityID;      //id of the associated entity
    this.conName = mConName;        //Name of the dropbox user who submit the response
    this.conEmail = mConEmail;      //Email of the dropbox user 
    this.status = mStatus;          //Waiting - Accepted - Rejected - Made a new POI
    if(mSize == undefined)
        mSize = "0"
    this.size = mSize;
    this.entityName = "";           //Name of the entity
    this.location = "";                 
}

function POIType(mID,mName,mIcon,mDesc)
{
    this.id = mID;
    this.name = mName;
    this.icon = mIcon;          //Not in use
    this.desc = mDesc;
    this.associatedPOI = "";    //Not in use
    this.state = "new";         //Not in use
}

//Model for a Placemark from KML file
function Placemark(inType,inName,inDes,inCoor)
{	
	this.type = inType;
	this.name = inName;
	this.desc = inDes;				
	this.coor = inCoor;
}