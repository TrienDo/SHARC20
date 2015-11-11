<?php
	require("utils.php");
    connectDB();
    $proAuthID 	= htmlspecialchars($_POST['proAuthID']);
    if(!isAuthenticate($proAuthID))
    {
        $response["success"] = -1;
		$response["message"] = '401 - Unauthorized';
        echo json_encode($response);
        return;
    }
    
	// Perform Query	    
    if($proAuthID == 7023538 || $proAuthID == 45283962 || $proAuthID == 387643271)
        $result = mysql_query("select * from projects ORDER BY proID DESC ");	
	else
        $result = mysql_query("select * from projects where proAuthID ='$proAuthID' ORDER BY proID DESC");
    
	// Check result
	// This shows the actual query sent to MySQL, and the error. Useful for debugging.
	if (!$result) {	  	
        $response["success"] = -1;
		$response["message"] = 'Invalid query: ' . mysql_error();	
	}
	else
	{
        // check for empty result
		if (mysql_num_rows($result) > 0) 
		{
			// looping through all results			
			$response["projects"] = array();
		 	while ($row = mysql_fetch_array($result)) {
				// temp user array				
				array_push($response["projects"], $row);
			}			
			$response["success"] = 1;
		} 
		else 
		{			
			$response["success"] = 0;
			$response["message"] = "No project found";
		}
	}
    echo json_encode($response);
?> 