<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8"/>
    <title>SPET - Sharc Public Exploration Tool</title>	
    <link rel="stylesheet" type="text/css" href="css/lomak.css"/>
    <link rel="stylesheet" href="lib/jqueryUI.1.10.4/css/redmond/jquery-ui.css"/>    
  	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=drawing,places"></script>
    <script src="https://apis.google.com/js/client.js"></script>
    <script src="http://www.geocodezip.com/scripts/javascript.util.js"></script>
    <script src="http://www.geocodezip.com/scripts/jsts.js"></script>
	<script src="lib/jqueryUI.1.10.4/js/jquery-1.10.2.js"></script>
    <script src="lib/jqueryUI.1.10.4/js/jquery-ui-1.10.4.custom.js"></script>
    <script src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclustererplus/2.0.1/src/markerclusterer.js"></script>
    <script src="js/definedClass.js"></script>
    <script src="js/spetLogicWray.js"></script>
</head>
<body>
    <input id="pac-input" class="controls" type="text" placeholder="Search Box"/> <!-- search box for Google maps -->
    <div id="spetTaskpane">
        <div id="welcome">SPET</div><div id="version">Version 2.0</div>              
        <hr style="width: 90%;"/>        
        <div id="promptSection" style="padding-bottom:5px;padding-top: 5px; padding-left: 15px; padding-right: 15px;">
            <p>SPET(Sharc Public Exploration Tool) enables you to explore locative media experiences online. To enjoy experiences in-situ, please download our SMEP mobile app (Sharc Mobile Experience Player).</p> 
            <p style="text-align: center;font-weight: bold;"><a href='http://wraydisplay.lancs.ac.uk/sharc/releases/SMEP.apk' download> Click here to download SMEP</a></button></p>
        </div>
        
        <div id="exploreSection">
            <button type="button" class="longInputElm" id="btnExplore">Explore other experiences</button>
        </div>
        
        <div id="projectSection">
            <hr style="width: 90%;" />
            <div id="curProject">Current experience: Wray Cultural Heritage</div>
            <div id="noOfPOI" class="taskpaneLabel">Number of POIs: 0</div>
            <div id="noOfEOI" class="taskpaneLabel">Number of EOIs: 0</div>
            <div id="noOfROU" class="taskpaneLabel">Number of Routes: 0</div>            
            <div><button hidden="true" type="button" class="longInputElm" id="btnDownload">Download this experience</button>
        </div>
        </div>
        
    </div>
    <div id="spetCanvas"></div>
    <div id="dialog-message"></div>  
    <div id="dialog-status"></div>    
</body>
</html>