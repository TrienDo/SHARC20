<?php
	require("utils.php");
    connectDB();
	// Get user info	
    $userID   	= htmlspecialchars($_POST['userID']);
    $projectID 	= htmlspecialchars($_POST['projectID']);    
    $mTime      = date('d-m-Y H:i:s');
        
    try
    {
        if(!isAuthenticate($userID))
        {
            $response["success"] = -1;
    		$response["message"] = '401 - Unauthorized';
            echo json_encode($response);
            return;
        }
        $result = mysql_query("select * from usersProjects where userID = '$userID' and projectID = '$projectID' ");	
    	
    	// Check result
    	// This shows the actual query sent to MySQL, and the error. Useful for debugging.
    	if (!$result) {
    		$message  = 'Invalid query: ' . mysql_error() . "\n";
    		die($message);
    	}
    	else
    	{
            // check for empty result --> add new user - project
    		if (mysql_num_rows($result) == 0) 
    		{			
                mysql_query("insert into usersProjects (userID,projectID,consumedDate) values('$userID','$projectID','$mTime')");
                //echo "New user added";
    		} 
    		else 
    		{
                //Update time only
                mysql_query("update usersProjects set consumedDate = '$mTime' where userID = '$userID' and projectID = '$projectID' ");
    			//echo "User already existed";
    		}
    	}        
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