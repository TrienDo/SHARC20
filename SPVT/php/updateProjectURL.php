<?php
	require("utils.php");
	try 
	{
		//Get data from client		 
        $proPath 	= htmlspecialchars($_POST['proPath']);        
        $proPublicURL 	= htmlspecialchars($_POST['proPublicURL']);
        $proLocation 	= htmlspecialchars($_POST['proLocation']);
		$proAuthID	= htmlspecialchars($_POST['proAuthID']);
		//Update meta data into with MySQL
        connectDB();
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
		mysql_query("update projects set proPublicURL = '$proPublicURL', proLocation = '$proLocation' where proPath = '$proPath'"); 
		//Display results
        $response["success"] = 1;
        $response["message"] = $proPublicURL;
		echo json_encode($response);		
	}
	catch (Exception $e) 
	{		
        $response["success"] = 0;
        $response["message"] = $e->getMessage();
		echo json_encode($response);
	}
?> 