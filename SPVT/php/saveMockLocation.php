<?php
	require("utils.php");
	try 
	{
		//Get data from client		
		$myLat 		= htmlspecialchars($_POST['lat']);
		$myLng 		= htmlspecialchars($_POST['lng']);		
        $locationID	= htmlspecialchars($_POST['locationID']);
		//Insert meta data into with MySQL
		connectDB();
        if(!isAuthenticate($locationID))
        {
            $response["success"] = -1;
    		$response["message"] = '401 - Unauthorized';
            echo json_encode($response);
            return;
        }
        $result = mysql_query("select * from MockLocation where LocationID = $locationID");	
	
    	// Check result
    	if (!$result) {
    		$message  = 'Invalid query: ' . mysql_error() . "\n";
    		die($message);
    	}
    	else
    	{
            // check for empty result --> add new simulator
    		if (mysql_num_rows($result) == 0) 
    		{			
                mysql_query("insert into MockLocation (LocationID,lat,lng) values($locationID,$myLat,$myLng)");
                //echo "New user added";
    		} 
    		else 
    		{
                mysql_query("update MockLocation SET lat = $myLat, lng = $myLng WHERE LocationID = $locationID");        
    		}
    	}
	}
	catch (Exception $e) 
	{
		echo 'Caught exception: ',  $e->getMessage(), "\n";
	}
?> 

