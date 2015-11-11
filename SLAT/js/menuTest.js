 /*
    Author:     Trien Do    
    Created:    Feb 2014
    Tasks:      Implementing menu Test functions which let designers to test an experience 
                    with either a simple virtual emulator or with a real device. The designers can fake and change the current
                    location by mouse or a controller  
                    
*/
var Test_isTestMode = false;        //Test mode - show the fake location
var Test_mockLocation;              //A marker which represent the current fake location 
var Test_emulatorWindow = null;     //Hold a handle to the emulator window
var ANIMATION_SPEED = 500;          //Speed of Show/hide direction movement arrows
var STEP = 0.0001;                  //~ 11m - Define how far each step the current location move when the user clicks movement arrows ~ a walk

function Test_createMockLocation()
{
	Test_isTestMode = true;
    //icon for the fake current location
    var image = {
			url: 'images/location.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			size: new google.maps.Size(24, 24),
			// The origin for this image is 0,0.
			origin: new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 0,32.
			anchor: new google.maps.Point(12, 12)
		  };
	//marker representing the fake current location	  
	if(Test_mockLocation == null)
        Test_mockLocation = new google.maps.Marker({
			map: map,
			icon: image, 			
			visible: true,
			draggable: false
		});
    else
        Test_mockLocation.setVisible(true);
    
    //set the current location at the mouse' position 
    google.maps.event.addListener(map,'click',function(event) {
			if(Test_isTestMode)
			{
				Test_mockLocation.setPosition(event.latLng);
				Test_saveMockLocation(event.latLng.lat(),event.latLng.lng());				
			}
		});
            
    //Direction buttons
	$('#upButton').click(function(){
		Test_goUpLocation();
	});
	
	$('#leftButton').click(function(){
		Test_goLeftLocation();
	});
	
	$('#rightButton').click(function(){
		Test_goRightLocation();
	});
	
	$('#downButton').click(function(){
		Test_goDownLocation();
	});
    
	$('#topLeftButton').click(function(){
		Test_goUpLeftLocation();        
	});
	
	$('#topRightButton').click(function(){
	    Test_goUpRightLocation();		
	});
	
	$('#botLeftButton').click(function(){
		Test_goDownLeftLocation();        
	});
    
    $('#botRightButton').click(function(){
		Test_goDownRightLocation();        
	});
    
    //Close
    $('#btnStopEmulator').click(function(){
		Test_closeEmulator();
	});
    
    
}

function Test_openEmulator(isEmulator)//emulator or real device
{    	
	//Test_mockLocation.setVisible(Test_isTestMode);    
    if(isEmulator)//show virtual emulator
    {
        $('#dialog-confirm').html('');        
        $('#dialog-confirm').dialog({ title: "Test this experience with emulator"});           
        $('#dialog-confirm').append('<p>If you have already published this experience please click "Test" then use the pop-up Emulator control at the bottom left, otherwise please click "Cancel" then select the menu "Experience -> Publish the current experience"</p>');
        $("#dialog-confirm").dialog({
            modal: true,
            width: 420,
            buttons: {                
                Cancel: function() {
                    $( this ).dialog( "close" );
                },
                Test: function() {
                    Test_createMockLocation();    
                	Test_mockLocation.setPosition(map.getCenter());
                	Test_saveMockLocation(map.getCenter().lat(),map.getCenter().lng());
                	$("#emulatorFrame").show(ANIMATION_SPEED);	
                	localStorage.setItem("projectID",projectID);
                    localStorage.setItem("designerID",designerInfo.id);
                    Test_emulatorWindow = window.open("emulator.php", "Emulator","width=454,height=742,titlebar=no,resizable=no");
                    $( this ).dialog( "close" );
                }
            }
        });           
    }
    else//instruct designer how to use a real device to tes the experience
    {
        showMessage("1. Please load this experience into SMEP on your device (Note: you may need to publish the experience if you have not done so).\n2. Use the side menu to switch to the test mode.\n3. Enter the dialog this testing code to start: " + designerInfo.id);
        Test_createMockLocation();    
    	Test_mockLocation.setPosition(map.getCenter());
    	Test_saveMockLocation(map.getCenter().lat(),map.getCenter().lng());
    	$("#emulatorFrame").show(ANIMATION_SPEED);	
    	localStorage.setItem("projectID",projectID);
        localStorage.setItem("designerID",designerInfo.id);
    } 
}

function Test_closeEmulator()
{    	
	$("#emulatorFrame").hide(ANIMATION_SPEED);
    if(Test_mockLocation != null)
        Test_mockLocation.setVisible(false);
	if(Test_emulatorWindow != null)
        Test_emulatorWindow.close();
}

function Test_goUpLocation()
{
	var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat() + STEP;
	var lng = curPos.lng();
	Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}
function Test_goDownLocation()
{
	var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat() - STEP;
	var lng = curPos.lng();
	Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}
function Test_goLeftLocation()
{	
	var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat();
	var lng = curPos.lng() - STEP;
	Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}

function Test_goRightLocation()
{
	var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat();
	var lng = curPos.lng() + STEP;
	Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}

function Test_goUpLeftLocation()
{
    var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat() + STEP;
	var lng = curPos.lng() - STEP;
    
    Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}

function Test_goUpRightLocation()
{
    var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat() + STEP;
	var lng = curPos.lng() + STEP;
    
	Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}

function Test_goDownLeftLocation()
{
    var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat() - STEP;
	var lng = curPos.lng() - STEP;
    
	Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}

function Test_goDownRightLocation()
{
    var curPos = Test_mockLocation.getPosition();
	var lat = curPos.lat() - STEP;
	var lng = curPos.lng() + STEP;
    
	Test_mockLocation.setPosition(new google.maps.LatLng(lat,lng));
	Test_saveMockLocation(lat,lng);
}
function Test_saveMockLocation(lat,lng)
{	
    $.post(
        'php/saveMockLocation.php',
        {            
            locationID: designerInfo.id,
            lat: lat,
            lng: lng                     
        },
        function(data,status){
            //Get all current project name - no duplication
            //var result = JSON.parse(data);
        }            
    );	
}		 