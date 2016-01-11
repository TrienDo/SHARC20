<?php
	require("utils.php");
    connectDB();
	// Get user info	
    $auID   	= htmlspecialchars($_POST['auID']);
    $auName 	= htmlspecialchars($_POST['auName']);
    $auEmail 	= htmlspecialchars($_POST['auEmail']);
    $mTime      = date('d-m-Y H:i:s');
    //get experience info
    $proName 	= htmlspecialchars($_POST['proName']); 
    $proPath 	= htmlspecialchars($_POST['proPath']);
    $proDesc 	= htmlspecialchars($_POST['proDesc']);
    $proAuthID 	= htmlspecialchars($_POST['proAuthID']);
    $proAccess 	= htmlspecialchars($_POST['proAccess']);
    
    try
    {
        if(!isAuthenticate($auID))
        {
            $response["success"] = -1;
    		$response["message"] = '401 - Unauthorized';
            echo json_encode($response);
            return;
        }
        
        if(!isAuthorised($auID, $proPath))
        {
            $response["success"] = -1;
    		$response["message"] = '403 - Forbidden';
            echo json_encode($response);
            return;
        }
        
        $result = mysql_query("select * from users where userID = '$auID'");	
    	
    	// Check result
    	// This shows the actual query sent to MySQL, and the error. Useful for debugging.
    	if (!$result) {
    		$message  = 'Invalid query: ' . mysql_error() . "\n";
    		die($message);
    	}
    	else
    	{
            // check for empty result --> add new user
    		if (mysql_num_rows($result) == 0) 
    		{			
                mysql_query("insert into users (userID,userName,userEmail,userLastLogin) values('$auID','$auName','$auEmail','$mTime')");
                //echo "New user added";
    		} 
    		else 
    		{
                //Update info
                mysql_query("update users set userName = '$auName', userEmail = '$auEmail', userLastLogin = '$mTime' where userID = '$auID'");
    			//echo "User already existed";
    		}
    	}
        
        //Get data from client
    	mysql_query("insert into projects (proName,proPath,proDesc,proDate,proAuthID,proAccess) values('$proName','$proPath','$proDesc','$mTime', '$proAuthID', '$proAccess')");
        $response["success"] = 1;
        $response["message"] = "OK";
		echo json_encode($response);
    }
	catch (Exception $e) 
	{
		$response["success"] = 0;
        $response["message"] = $e->getMessage();
		echo json_encode($response);        
	}  
?> 