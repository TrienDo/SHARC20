<?php
	require("utils.php");
	try 
	{
		//Get data from client
        connectDB();		 
        $proAuthID	= htmlspecialchars($_POST['proAuthID']);
        $proPath 	= htmlspecialchars($_POST['proPath']);
        if(!isAuthenticate($proAuthID))
        {
            $response["success"] = -1;
    		$response["message"] = '401 - Unauthorized';
            echo json_encode($response);
            return;
        }
        if(!isAuthorised($proAuthID, $proPath))
        {
            $response["success"] = -1;
    		$response["message"] = '403 - Forbidden';
            echo json_encode($response);
            return;
        }
                
        $proAccess 	= htmlspecialchars($_POST['proAccess']);
        $proSummary = htmlspecialchars($_POST['proSummary']);
        $proDesc = htmlspecialchars($_POST['proDesc']);
        $proThumbnail = htmlspecialchars($_POST['proThumbnail']);
        $proSize = htmlspecialchars($_POST['proSize']);
        		
		//Insert meta data into with MySQL
						
		mysql_query("update projects set proAccess = '$proAccess', proDesc = '$proDesc',  proSize = '$proSize', proSummary = '$proSummary', proThumbnail = '$proThumbnail' where proPath = '$proPath'"); 
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