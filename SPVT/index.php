<!DOCTYPE html>
<html lang="en">
<html>
<head>
	<meta charset="UTF-8"/>    
    <title>SPVT - Sharc Post Visit Tool</title>
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
    <script src="js/sharcAuthoringLogic.js"></script>
    <script src="js/menuUser.js"></script>    
    <script src="js/menuExperience.js"></script>
    <script src="js/menuPOI.js"></script>
    <script src="js/menuPOIType.js"></script>
    <script src="js/menuEOI.js"></script>    
    <script src="js/menuRoute.js"></script>
    <script src="js/menuTest.js"></script>
    <script src="js/menuResponse.js"></script>    
    <script src="js/menuLibrary.js"></script>
    <script src="js/dropbox.js"></script>
    <script src="js/googleDrive.js"> </script>
    <script src="js/restful.js"> </script>
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
            
                <li><a id="openProject" href="#" >Open an experience</a></li>                
                
        </li> 
         
        <li  >
            <a   id="userAccount" href="#">Your account<img src="images/arrow.png" class="arrowMenu"/></a>
            <ul class="dropdown-menu">
                <li><a id="logIn" href="#">Switch account</a></li>
                <li><a id="help" href="#">Help</a></li>                
                <li><a id="aboutUs" href="#">About SPVT</a></li>
            </ul>
        </li>        
    </ul>
    </div>
    <div style="clear:both"></div>
    
    <div id="taskpane"> <!-- create left panel to summarise info about the current experience -->
        <div id="welcome">SPVT</div><div id="version"></div>              
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
    <div id="emulatorFrame" class="formBorder">        <!-- create a control for the emulator at the bottom left of screen -->
		
			<fieldset>				
				<table border="0">    					
					<tr>
						<td class="formInstructionLabel" style="font-size: 13px;" colspan="3">Emulator control</td>
					</tr>    
					<tr>
						<td class="italicText" colspan="3">You can either click the mouse on the map to simulate the "current location" or use the direction arrows below. Media items will be triggered whenever the YAH marker enters a trigger zone.</td>
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
						<td class="formInstructionLabel">Move<br/><input id="movingStep" value="10" type="number" min="1" max="50"/>(m)<br />per click</td>
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
	
    </div>    
</body>
</html>