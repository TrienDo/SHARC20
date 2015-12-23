<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8"/>
    <title>SHARC Emulator</title>
	<link rel="stylesheet" type="text/css" href="css/emulator.css"/>
  	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=drawing"></script>
	<script src="lib/jqueryUI.1.10.4/js/jquery-1.10.2.js"></script>
    <script src="lib/jqueryUI.1.10.4/js/jquery-ui-1.10.4.custom.js"></script>	
    <script src="js/definedClass.js"></script>	 
    <script src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclustererplus/2.0.1/src/markerclusterer.js"></script>
    <script type="text/javascript" src="js/emulatorLogic.js"></script>    
    <script type="text/javascript" src="js/utils.js"></script>
    <script src="js/restful.js"> </script>
</head>
<body id="emulatorBody" class="eBodyNexus">	
	<div id="mapEmulatorCanvas" class="eMapNexus"></div>
	<div id="centerMapButton" class="eCenterNexus"></div>
    <div id="zoomLevel" class="eZoomNexus"></div>	
	<div id="mediaTitle" class="eTitleNexus"></div>	 
	<div id="closeMediaContent" class="eCloseDivNexus"><button id="closeMediaButton" class="eCloseNexus">Close</button></div>	 
	<div id="mediaContent" class="eContentNexus"></div>	 
</body>
</html>