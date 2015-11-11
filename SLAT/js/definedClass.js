/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Declaring user-defined classes   
*/  

function Experience(proID, proName, proPath, proDesc, proDate, proAuthID, proAccess, proPublicURL, proLocation, proSummary, proThumbnail, proSize)
{
    this.proID = proID;
    this.proName = proName;
    this.proPath = proPath;          
    this.proDesc = proDesc;
    this.proDate = proDate;     
    this.proAuthID = proAuthID;
    this.proAccess = proAccess;     
    this.proPublicURL = proPublicURL;        
    this.proLocation = proLocation;
    this.proSummary = proSummary; 
    this.proThumbnail = proThumbnail;
    this.proSize = proSize;   
}  
function Media(mID, mName,mType,mDesc,mContent,mNoOfLike,mContext,mPoIID,mAttachedTo)
{
    this.id = mID;
    this.name = mName;
    this.type = mType;          //(Text/Image/Audio/Video)
    this.desc = mDesc;
    this.content = mContent;    // Content (Text vs. path to media)
    this.noOfLike = mNoOfLike;
    this.context = mContext;    // time/direction/ect? - NOT IN USE
    this.PoIID = mPoIID;        //id of the associated entity 
    this.attachedTo = mAttachedTo;//Type of associated entity: POI - EOI - Route
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

function POI(mName,mType,mEvent,mDesc,mlatLng,mID,mRoute,mTriggerZone)
{
    this.id = mID;
    this.name = mName;
    this.type = mType;
    this.associatedEOI = mEvent;
    this.associatedRoute = mRoute;
    this.desc = mDesc;
    this.latLng = mlatLng;
    this.mediaOrder = new Array();
    this.mainMedia = "";                    //Not in use -> first photo
    this.associatedMedia = new Array();
    this.associatedResponses = new Array();
    this.state = "new";
    this.triggerZone = mTriggerZone;
    this.getLatLng = function()
    {
        var tmpLatLng = this.latLng.split(" ");
        return new google.maps.LatLng(parseFloat(tmpLatLng[0]), parseFloat(tmpLatLng[1]));
    }
    
    this.getPoiVizPath = function()
    {
        var tmpPath = new Array();
        var tmpLatLng = this.latLng.split(" ");
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
            this.triggerZone = "circle " + colour.substring(1) +  " " + zoneObj.radius + " " + zoneObj.center.lat() + " " + zoneObj.center.lng();
        }
        else                        //trigger zone is a polygon
        {
            var tmp = zoneObj.getPath().getArray().toString();//"(66.99025646736109, -24.36492919921875),(66.64426812270932, -12.06024169921875)"
            tmp  = tmp.replace(/\(/g,"");//Replace ( with blank
            tmp  = tmp.replace(/\)/g,"");//Replace ) with blank
            tmp = tmp.replace(/ /g,"");//Replace space with blank
            tmp = tmp.replace(/,/g," ");//Replace , with space
            this.triggerZone = "polygon " + colour.substring(1) +  " " + tmp;
        }
    }
    
    this.getLikeCount = function() //total of likes of all media associated with the POI
    {
    	var total = 0;
    	for(i=0; i < this.associatedMedia.length; i++)
		{
    		total += this.associatedMedia[i].noOfLike;
		}
    	return total;
    }
}


function EOI(mID,mName,mSDate,mEDate,mDesc,mPOI,mRoute)
{
    this.id = mID;
    this.name = mName;
    this.startDate = mSDate;
    this.endDate = mEDate;
    this.desc = mDesc;
    this.associatedMedia = new Array();
    this.mediaOrder = new Array();
    this.mainMedia = "";
    this.associatedPOI = mPOI;    
    this.associatedRoute = mRoute;
    this.state = "new";    
}

function Route(mID,mName,mDesc,mColour,mSelectedPOIs,mPolygon,mSelectedEOIs,mDirected)
{
    this.id = mID;
    this.name = mName;    
    this.desc = mDesc;
    this.directed = mDirected;
    this.colour = mColour;
    this.polygon = mPolygon; 
    this.mediaOrder = new Array();
    this.mainMedia = "";
    this.associatedMedia = new Array();       
    this.associatedPOI = mSelectedPOIs;    
    this.associatedEOI = mSelectedEOIs;
    this.state = "new"; 
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

function SharcUser(userID, userName, userEmail, cloudType, cloudAccountId)
{
    this.id = userID;
    this.username = userName;
    this.email = userEmail;    
    this.cloudType = cloudType;
    this.cloudAccountId = cloudAccountId;
}

//Model for a Placemark from KML file
function Placemark(inType,inName,inDes,inCoor)
{	
	this.type = inType;
	this.name = inName;
	this.desc = inDes;				
	this.coor = inCoor;
}