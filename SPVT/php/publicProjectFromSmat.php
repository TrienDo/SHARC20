<?php
	require("utils.php");
	try 
	{
		//Get data from client		 
        $proPath 	= htmlspecialchars($_POST['proPath']);        
        $proAccess 	= htmlspecialchars($_POST['proAccess']);
        $proSummary = htmlspecialchars($_POST['proSummary']);
        $proPublicURL 	= htmlspecialchars($_POST['proPublicURL']);
        $proLocation 	= htmlspecialchars($_POST['proLocation']);
        $proThumbnail 	= htmlspecialchars($_POST['proThumbnail']);
        $proDesc 	= htmlspecialchars($_POST['proDesc']);
        $proSize 	= htmlspecialchars($_POST['proSize']);
        
		
		//Insert meta data into with MySQL
		connectDB();
        if($proThumbnail == "")				
            mysql_query("update projects set proAccess = '$proAccess', proSize = '$proSize', proSummary = '$proSummary', proPublicURL = '$proPublicURL', proDesc = '$proDesc', proLocation = '$proLocation' where proPath = '$proPath'");
        else 
            mysql_query("update projects set proAccess = '$proAccess', proSize = '$proSize', proSummary = '$proSummary', proPublicURL = '$proPublicURL', proDesc = '$proDesc', proLocation = '$proLocation', proThumbnail = '$proThumbnail' where proPath = '$proPath'");
		//Display results
        $response["success"] = 1;
        $response["message"] = $proAccess;
		echo json_encode($response);		
	}
	catch (Exception $e) 
	{		
        $response["success"] = 0;
        $response["message"] = $e->getMessage();
		echo json_encode($response);
	}
?> 