<?php
	require("utils.php");
    connectDB();
	// Perform Query	
    $auID   	= htmlspecialchars($_POST['auID']);
    $auName 	= htmlspecialchars($_POST['auName']);
    $auEmail 	= htmlspecialchars($_POST['auEmail']);
    $mTime      = date('d-m-Y H:i:s');
    
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
?> 

 