<?php
	require("utils.php");
	try 
	{
		//Get data from client
        $proAuthID	= htmlspecialchars($_POST['proAuthID']);
        $proPath 	= htmlspecialchars($_POST['proPath']);
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
        
		mysql_query("delete from projects where proPath = '$proPath'"); 
		//Display results
        $response["success"] = 1;
        $response["message"] = "A project has been deleted successfuly";
		echo json_encode($response);		
	}
	catch (Exception $e) 
	{		
        $response["success"] = 0;
        $response["message"] = $e->getMessage();
		echo json_encode($response);
	}
?> 