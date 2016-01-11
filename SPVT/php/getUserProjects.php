<?php
	require("utils.php");
    $proAuthID 	= htmlspecialchars($_POST['proAuthID']);
    connectDB();
    if(!isAuthenticate($proAuthID))
    {
        $response["success"] = -1;
		$response["message"] = '401 - Unauthorized';
        echo json_encode($response);
        return;
    }
	// Perform Query	
    $result = mysql_query("select * from projects join users on projects.proAuthID = users.userID where proAuthID ='$proAuthID' ORDER BY proID DESC");
    
	// Check result
	// This shows the actual query sent to MySQL, and the error. Useful for debugging.
	if (!$result) {		 
        $response["success"] = 0;
        $response["message"] = 'Error: ' . mysql_error();		
	}
	else
	{
        // check for empty result
		if (mysql_num_rows($result) > 0) 
		{
			// looping through all results
			// sharcFiles node
			$response["projects"] = array();
		 
			while ($row = mysql_fetch_array($result)) {
				// temp user array				
				array_push($response["projects"], $row);
			}
			// success
			$response["success"] = 1;		 
			// echoing JSON response
			echo json_encode($response);
		} 
		else 
		{
			// no sharcFiles found
			$response["success"] = 2;
			$response["message"] = "No projects found!";		 
			// echo no users JSON
			echo json_encode($response);
		}
	}
?> 