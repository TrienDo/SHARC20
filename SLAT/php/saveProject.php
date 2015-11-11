<?php
	require("utils.php");
	try 
	{
		//Get data from client
		$proName 	= htmlspecialchars($_POST['proName']); 
        $proPath 	= htmlspecialchars($_POST['proPath']);
        $proDesc 	= htmlspecialchars($_POST['proDesc']);
        $proAuthID 	= htmlspecialchars($_POST['proAuthID']);
        $proAccess 	= htmlspecialchars($_POST['proAccess']);
		
		//Insert meta data into with MySQL
		connectDB();
        if(!isAuthenticate($proAuthID))
        {
            $response["success"] = -1;
    		$response["message"] = '401 - Unauthorized';
            echo json_encode($response);
            return;
        }
        /*if(!isAuthorised($proAuthID, $proPath))
        {
            $response["success"] = -1;
    		$response["message"] = '403 - Forbidden';
            echo json_encode($response);
            return;
        }*/
		$mTime = date('d-m-Y H:i:s');		
		mysql_query("insert into projects (proName,proPath,proDesc,proDate,proAuthID,proAccess) values('$proName','$proPath','$proDesc','$mTime', '$proAuthID', '$proAccess')"); 
		//Display results
		echo "You've succesfully save file: ".$myFile." to our server!";
    }
	catch (Exception $e) 
	{
		echo 'Caught exception: ',  $e->getMessage(), "\n";
	}
?> 