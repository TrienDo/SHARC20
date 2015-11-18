/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Declaring application logic: 
                    - initialise components (e.g., map) 
                    - add events for UI elements    
*/ 
//Current version
var version = "Version 2.0";
//Variables related to main presentation
var map;                        //main map
var highlight;                  //Circle to highlight current POI - blinking when a POI is selected
var selectedPOIMarker = null;   //Create red marker to highlight the selected POI
var cloudManager;               //object to interact with cloud
var resfulManager;              //object to interact with SHARC RESTful

//Variables related to POI
var mapPOI;                     //map for creating/editing POI
var markerPOI = null;           //Marker to show the location of current POI
var curPOI = null;              //Object to store all details of current POI
var trigerZonePOI = null;       //Trigger zone of current POI (a circle or a polygon)
var allPOIs = new Array();      //Array to store details of all POI 
var allPOIMarkers = new Array();//Array to store all POI markers
var allRouteMarkers = new Array();//Array to store all Start/End markers of routes
var allPOIZones = new Array();  //Array to store all POI trigger zones

 
 
//Variables related to POI types
var allPOITypes = new Array();  //Array to store details of all POI types 
var curPOIType = null;          //Object to store details of current POI Type 

//Variables related to EOI
var allEOIs = new Array();      //Array to store details of all EOIs 
var curEOI = null;              //Object to store details of current EOI

//Variables related to Response
var allResponses = new Array();         //Array to store details of all responses
var allNewResponses = new Array();      //Array to store details of all new responses
var curResponse = null;                 //Object to store details of current response

//Variables related to Routes
var mapRoute;                   //map for creating/editing a route
var startRouteMarker = null;    //start route marker
var endRouteMarker = null;      //end route marker
var routePath = null;           //current route path
var curRoute = null;            //details of current route 
var allRoutePaths = new Array();//Array to store all routes' paths
var allPoiViz = new Array();    //Array to store all viz of POI (e.g., point, polygon, polyline) - point = null, other = polyline as polygon = polyline with same start and end
var allRoutes = new Array();    //Array to store details of all routes
var wayPoints = new Array();    //Array of LatLngs of a route extracted from KML file -> simplified later
var MAP_ROUTE_SCALE = 100000;   //To calculate epsilon when simplifing route
var MAX_POINTS_ON_ROUTE = 10000;//Dropbox limit for a record --> need limit for number of points on a route 

//Other variables
var curBrowsingType = "image";  //To store the current type of media item -> compress image NOT compress video, audio
var drawingManager = null;      //Google Drawing tool for creating trigger zones for POI and path for route
var curMediaBank = null;        //Object to store current media in the pool of designer
var curMedia = null;            //Object to store current media details for the current POI
var curMediaData = null;        //raw data of current image/audio/video media --> upload to dropbox
var maxZoomLevel = 18;          //Zoom the map to this max level
var callBackURL = "";           //As Dropbox needs an URL to redirect to after the login process, this variable enables to create a dynamic URL (for different version of SLAT) for redirection base on the original URL
 
$(document).ready(function(){
    initialize();
});

function initialize() 
{	 
    resfulManager = new SharcRestful();
    $("#version").text(version); 
    getCallbackURL();       //Get the correct version of SLAT so Dropbox can redirect to after the login process                            
    createGoogleObjects();  //Create google map object and other related objects
    hideSections();         //Hide taskpane's elements
       
        
    if(window.location.href.lastIndexOf("oauth_token")!=-1 && !logedIn) //The login process has finished (Dropbox directs back to SLAT with a token) + user has not logged in
    {
        cloudManager = new SharcDropBox();
        cloudManager.getAccessToken();
    }
    else//SLAT is just opened --> show reminder
    {    	
        showLoginDialog();        
    }
    //========================================================================================
    //Your account menu ~ menuUser.js
    $('#logIn').click(function(){
		showLoginDialog();                 
	});
     
    $('#help').click(function(){
        showHelp();            
	});
    
    $("#aboutUs").click(function(){
        showAboutUs(); 
    });
    
    //========================================================================================
    //Experience menu ~ menuExperience.js
    $('#newProject').click(function(){
		createProject();
	});
    
    $('#openProject').click(function(){
		openProject();
	});
    
    $('#manageProject').click(function(){
		manageProjects();
	});
    
    $('#viewProject').click(function(){
		viewProjectDetails();
	});
    
    
    $('#importKML').click(function(){
		importKML();
	});
    
    $('#exportKML').click(function(){
        exportToKML();     
	});
    
    $('#publishProject').click(function(){
        publishProject();     
	});
    
    $('#unPublishProject').click(function(){
        unpublishProject();     
	});    
            
    //========================================================================================
    //EOI menu ~ menuEOI.js
    $('#newEOI').click(function(){
        createNewEOI(true);//Same dialog: true = create, false = edit     
	}); 
    
    $('#manageEOIs').click(function(){
        showAllEOIs();     
	});
    
    $('#addMediaEOI').click(function(){
        showDropdownEOI();
	});
         
    $('#linkEOI').click(function(){
        linkEOIs();  //Link EOIs with POIs and Routes   
	});
    //========================================================================================
    //POI Type menu ~ menuPOITYpe.js
    $('#newPOIType').click(function(){
        createNewPOIType(true);     
	}); 
    
    $('#managePOITypes').click(function(){
        showAllPOITypes();     
	});
    //========================================================================================
    //Route menu ~ menuRoute.js
    $('#kmlRoute').click(function(){
        createRouteFromKML(true);     
	});
    
    $('#drawingRoute').click(function(){
        createRouteByDrawing(true);     
	}); 
    
    $('#addMediaRoute').click(function(){
        showDropdownRoute();
	});
    
    $('#manageRoute').click(function(){
        manageAllRoutes();     
	});
    
    $('#linkRoute').click(function(){
        linkRoutes();     
	});
    //========================================================================================
    //POI menu ~ menuPOI.js
    $('#newPOI').click(function(){
        curBrowsingType = "image";
        createPOI(true,true,0);
	});
    
    $('#newPOImap').click(function(){
        createPOI(true,false,0);
	});
    
    $('#addMediaPOI').click(function(){
        showDropdownPOI();
	});
    
    $('#managePOIs').click(function(){
        showAllPOIs();     
	});
    
    $('#linkPOI').click(function(){
        linkPOIs();     
	});		
  
    //========================================================================================
    //Test menu ~ menuTest.js
    $('#useEmulator').click(function(){
        Test_openEmulator(true);   
	}); 
    
    $('#useDevice').click(function(){
        Test_openEmulator(false);     
	});
    
    //========================================================================================
    //Response menu ~ menuResponse.js
    $('#moderate').click(function(){
        Response_showNewResponse();   
	}); 
    
    $('#manage').click(function(){
        Response_showAllResponse();     
	});	
    
    $("#jMenu").jMenu();
 
    // more complex jMenu plugin called
    $("#jMenu").jMenu({
            ulWidth : 300,
            effects : {
            effectSpeedOpen : 300,
            effectTypeClose : 'slide'
        },
        animatedText : false
    });
    showMenu(false);        //Hide menu	    
    
     //HTML editor -- http://blog.mirthlab.com/2008/11/13/dynamically-adding-and-removing-tinymce-instances-to-a-page/
    /*tinyMCE.init({
		mode : "none",
		theme : "simple"
	});*/
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createGoogleObjects()
{
	map = new google.maps.Map(document.getElementById('mapCanvas'), null);
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    
    showMapWithCorrectBound(map, maxZoomLevel);
    
    highlight = new google.maps.Circle({					
		center: new google.maps.LatLng(0,0), radius: 15,
		strokeColor: "red", strokeOpacity: 1.0, strokeWeight: 2,
		fillColor: "red", fillOpacity: 0.3,		
		map: null
	});
    
    markerPOI = new google.maps.Marker({
          position: new google.maps.LatLng(0,0),
          draggable:true,
          map:null
      });
    
    google.maps.event.addListener(markerPOI,'dragend',function(event) {
        if(trigerZonePOI.center != undefined && $('#moveTrigger').is(':checked'))
        	trigerZonePOI.setCenter(markerPOI.getPosition());
    });  
    
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
       
    
    selectedPOIMarker = new google.maps.Marker({
          position: new google.maps.LatLng(0,0),
          draggable:false,
          icon: "images/curPoi.png",
          map:null
    });
    addMarkerPOIClickEvent(selectedPOIMarker);
    addsearchBox(map,'pac-input');
}

function hideSections()
{
    $("#projectSection").hide();    //Show this section when an experience is open    
    $("#emulatorFrame").hide();     //Show this section when test an experience
}

function clearScreen()//clear data and screen before loading/creating a new exprience
{
    //Empty all arrays and viz on map
    allPOIs = [];
    allMedia = [];
    allEOIs = [];
    allRoutes = [];
    allResponses = [];
    allNewResponses = [];
    
    
    for (var i=0; i < allRouteMarkers.length; i++)
        allRouteMarkers[i].setMap(null);
    allRouteMarkers = []
    
    for (var i=0; i < allPOIMarkers.length; i++)
        allPOIMarkers[i].setMap(null);
    allPOIMarkers = [];
    
    for (var i=0; i < allPOIZones.length; i++)
        allPOIZones[i].setMap(null);
    allPOIZones = [];
    
    for (var i=0; i < allRoutePaths.length; i++)
        allRoutePaths[i].setMap(null);
    allRoutePaths = [];
    
    for (var i=0; i < allPoiViz.length; i++)
        if(allPoiViz[i] != null)
            allPoiViz[i].setMap(null);
    allPoiViz = [];
    
    $("#noOfPOI").text("Number of POIs: 0"); 
    $("#noOfEOI").text("Number of EOIs: 0");
    $("#noOfROU").text("Number of Routes: 0");
    
    highlight.setMap(null);
    selectedPOIMarker.setMap(null);
    startRouteMarker.setMap(null);
    endRouteMarker.setMap(null);
}

//Get the URL of current SLAT version
//E.g: Input : URL = http://wraydisplay.lancs.ac.uk/sharcauthoringV1_12
//     Output: wraydisplay.lancs.ac.uk/sharcauthoringV1_12 
function getCallbackURL()
{
    var fullURL = document.URL.split("/");
    callbackURL = fullURL[2] + "/" + fullURL[3] + "/" + fullURL[4];
    
}

function showWelcomeDialog(authorName)
{
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Sharc Locative media Authoring Tool"});           
    $('#dialog-message').append('<p align="center">Hello ' + authorName +'. How would you like to start?</p>');               
    $( "#dialog-message" ).dialog({
        modal: true,            
        height: 200,
        width: 450,            
        buttons: {
            "Open an exisiting experience": function() {
                $( this ).dialog("close");
                openProject();                
            },
            "Create a new experience": function() {                
           	    $( this ).dialog("close");
                createProject();                   
            }             
        }
    });     
}

function showMenu(status)
{
     //$('#sddm').hide();
     //return;
     if(status)
     {
        $('#m1').show();
        $('#m2').show();
        $('#m3').show();
        $('#m4').show();        
        $('#m5').show();
        $('#m6').show();
        $('#m7').show();
     }
     else
     {
        $('#m1').hide();
        $('#m2').hide();
        $('#m3').hide();
        $('#m4').hide();
        $('#m5').hide();
        $('#m6').hide();
        $('#m7').hide();
     }
}
 
