<?php
	require("utils.php");
    connectDB();
	// Perform Query	
    $proPath 	= htmlspecialchars($_POST['proPath']);
    $result = mysql_query("select * from projects where proPath = '$proPath'");
    
	// Check result
	// This shows the actual query sent to MySQL, and the error. Useful for debugging.
	if (!$result) {		 
        $response["success"] = 0;
        $response["message"] = 'Invalid query: ' . mysql_error();		
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
			$response["success"] = 0;
			$response["message"] = "No projects found!";		 
			// echo no users JSON
			echo json_encode($response);
		}
	}
?> 