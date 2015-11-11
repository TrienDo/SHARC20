<!DOCTYPE html>
<html lang="en">
<html>
<head>
	<meta charset="UTF-8"/>    
    <title>SLAT - Sharc Locative media Authoring Tool</title>
	<link rel="shortcut icon" href="images/sharc.png"/>
    <link rel="stylesheet" type="text/css" href="css/lomak.css"/>
    <link rel="stylesheet" type="text/css" href="css/menu.css"/>
    <link rel="stylesheet" href="lib/jqueryUI.1.10.4/css/redmond/jquery-ui.css"/>    
    <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=drawing,places"></script>    
    <script src="https://apis.google.com/js/client.js"></script>
    <script src="http://www.geocodezip.com/scripts/javascript.util.js"></script>
    <script src="http://www.geocodezip.com/scripts/jsts.js"></script>
	<script src="lib/jqueryUI.1.10.4/js/jquery-1.10.2.js"></script>
    <script src="lib/jqueryUI.1.10.4/js/jquery-ui-1.10.4.custom.js"></script>
    <script src="lib/jquery.exif.js"></script>
    <script src="lib/sha.js"></script>    
    <script src="https://www.dropbox.com/static/api/dropbox-datastores-1.2-latest.js" type="text/javascript"></script>
    <script type="text/javascript" src="https://www.dropbox.com/static/api/2/dropins.js" id="dropboxjs" data-app-key="nz8hhultn33wlqu"></script>
    <script type="text/javascript" src="http://tinymce.cachefly.net/4.0/tinymce.min.js"></script>
    <script src="js/menuUser.js"></script>     
    <script src="js/sharcAuthoringLogic.js"></script>    
    <script src="js/menuExperience.js"></script>    
    <script src="js/menuPOI.js"></script>
    <script src="js/menuPOIType.js"></script>
    <script src="js/menuEOI.js"></script>    
    <script src="js/menuRoute.js"></script>
    <script src="js/menuTest.js"></script>
    <script src="js/menuResponse.js"></script>    
    <script src="js/dropbox.js"></script>
    <script src="js/googleDrive.js"> </script>
    <script src="js/definedClass.js"></script>
    <script src="js/media.js"></script>
    <script src="js/utils.js"></script>
    <script src="js/menucss.js"></script>
    <script src="js/kmlFile.js"></script>
</head>
<body>
    <!-- This file defines the main UI of SLAT -->
    <!-- Events are associated with elements via jQuery in sharcAuthoringLogic.js -->
    <input id="pac-input" class="controls" type="text" placeholder="Search Box"/> <!-- search box for Google maps -->
    <div id="slatMainMenu">	<!-- create menus and menu items -->
    <ul id="jMenu">
        <li>
            <a href="#">Experience<img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="newProject" href="#" >Create a new experience</a></li>
                <li><a id="openProject" href="#" >Open an experience</a></li>                
                <li><a id="viewProject" href="#" >Edit experience details and moderation modes</a></li>
                <li><a id="exportKML" href="#" >Export to a KML file</a></li>
                <li><a id="importKML" href="#" >[Import from a KML]</a></li>
                <li><a id="publishProject" href="#" >Publish the current experience</a></li>                
                <li><a id="unPublishProject" href="#" >Unpublish the current experience</a></li>
                <li><a id="manageProject" href="#" >Manage experiences</a></li>
            </ul>
        </li>
        <li  >
            <a   href="#">Point of Interest (POI)<img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="newPOI" href="#">Create a new POI from a GPS tagged photo</a></li>
                <li><a id="newPOImap" href="#">Create a new POI on map</a></li>
                <li><a id="addMediaPOI" href="#">Add media item to POI</a></li>
                <li><a id="linkPOI" href="#">Associate POIs with EOIs and Routes</a></li>
                <li><a id="managePOIs" href="#">Manage POIs</a></li>    
                <li><a  href="#"><hr/></a></li>            
                <li><a id="newPOIType" href="#">New type of POI</a></li>
                <li><a id="managePOITypes" href="#">Manage types of POI</a></li>
            </ul>
        </li>
        <li  >
            <a   href="#">Event of Interest (EOI)<img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="newEOI" href="#">Create a new EOI</a></li>
                <li><a id="addMediaEOI" href="#">Add media item to EOI</a></li>
                <li><a id="linkEOI" href="#">Associate EOIs with POIs and Routes</a></li>                
                <li><a id="manageEOIs" href="#">Manage EOIs</a></li>                
            </ul>
        </li>
        <li  >
            <a   href="#">Route<img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="kmlRoute" href="#">Create a new route from a KML file</a></li>                
                <li><a id="drawingRoute" href="#">Create a new route by drawing on map</a></li>
                <li><a id="addMediaRoute" href="#">Add media item to Route</a></li>
                <li><a id="linkRoute" href="#">Associate Routes with POIs and EOIs</a></li>                
                <li><a id="manageRoute" href="#">Manage routes</a></li>
           </ul>
        </li>
        <li  >
            <a   href="#">Test<img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="useEmulator" href="#">Use emulator</a></li>                
                <li><a id="useDevice" href="#">Use mobile device</a></li>                
            </ul>
        </li>
        
        <li  >
            <a   href="#">Response<span id="notification" class="noNotification"></span><img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="moderate" href="#">Moderate new responses</a></li>                
                <li><a id="manage" href="#">Manage all responses</a></li>
            </ul>
        </li>
        
        <li  >
            <a   id="userAccount" href="#">Your account<img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="logIn" href="#">Log in</a></li>
                <li><a id="help" href="#">Help</a></li>                
                <li><a id="aboutUs" href="#">About SLAT</a></li>
            </ul>
        </li>        
    </ul>
    </div>
    <div style="clear:both"></div>
    
    <div id="taskpane"> <!-- create left panel to summarise info about the current experience -->
        <div id="welcome">SLAT</div><div id="version"></div>              
        <div id="projectSection">
            <hr style="width: 90%;" />
            <div id="curProject">Current project: </div>
            <div id="noOfPOI" class="taskpaneLabel">Number of POIs: 0</div>
            <div id="noOfEOI" class="taskpaneLabel">Number of EOIs: 0</div>
            <div id="noOfROU" class="taskpaneLabel">Number of Routes: 0</div>
            <div id="curProject">Description: </div>
            <div id="proDesc" class="taskpaneLabel"></div>
        </div>      
    </div>
    <div id="mapCanvas"></div>      <!-- placehold for map view -->
    <div id="dialog-message"></div> <!-- placehold for authoring dialogs of EOI, POI, Route, etc -->
    <div id="dialog-status"></div>  <!-- waiting status dialog -->    
    <div id="dialog-confirm"></div> <!-- a replacement of defaul "alert" dialog of javascript -->
    <div id="dialog-media"></div>   <!-- placehold for dialogs relating to media -->
    <div id="emulatorFrame">        <!-- create a control for the emulator at the bottom left of screen -->
		<form  class="formBorder">
			<fieldset>				
				<table border="0">    					
					<tr>
						<td class="formInstructionLabel" style="font-size: 13px;" colspan="3">Emulator control</td>
					</tr>    
					<tr>
						<td class="italicText" colspan="3">You can either click the mouse on the map to simulate the "current location" or use the direction arrows below.</td>
					</tr>
                    <tr>						
                        <td colspan="4"><hr /></td>						
					</tr>    
					<tr>						
                        <td><div id="topLeftButton"></div></td>
						<td><div id="upButton"></div></td>
						<td><div id="topRightButton"></div></td>
					</tr>    					                    					
					<tr>						
                        <td><div id="leftButton"></div></td>
						<td></td>
						<td><div id="rightButton"></div></td>
					</tr>						
					<tr>
						<td><div id="botLeftButton"></div></td>
						<td><div id="downButton"></div></td>
						<td><div id="botRightButton"></div></td>
					</tr>
                    <tr>						
                        <td colspan="4"><hr /></td>						
					</tr>
                    <tr>
                        <td colspan="3"><button type="button" class="googleLookAndFeel" style="width:210px;" id="btnStopEmulator">Close</button></td>
                    </tr>					
				</table>	
			</fieldset>	
		</form>
    </div>    
</body>
</html>