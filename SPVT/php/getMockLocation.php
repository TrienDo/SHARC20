<?php
	require("utils.php");
	connectDB();
    $locationID	= htmlspecialchars($_POST['locationID']);
	$result = mysql_query("select * from MockLocation where LocationID = $locationID");
	// Check result
	// This shows the actual query sent to MySQL, and the error. Useful for debugging.
	if (!$result) 
	{		
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
			$response["location"] = array();
		 
			while ($row = mysql_fetch_array($result)) {
				// temp user array
				$loc = array();
				$loc["lat"] = $row["lat"];
				$loc["lng"] = $row["lng"];
				// push single product into final response array
				array_push($response["location"], $loc);
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
			$response["message"] = "No mock location found!";		 
			// echo no users JSON
			echo json_encode($response);
		}
	}	
?>