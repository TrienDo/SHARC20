<?php
	function connectDB()
	{
		define("MYSQL_USER","root");
		define("MYSQL_PASS","c4side88");
		define("MYSQL_PORT","3306");
		define("MYSQL_DB","sharc");
        define("COOKIE_DOMAIN", "wraydisplay.lancs.ac.uk");
        define("COOKIE_PATH", "/sharcauthoring");	
		mysql_connect("localhost:".MYSQL_PORT,MYSQL_USER, MYSQL_PASS);
		mysql_select_db(MYSQL_DB);		
	}
    
    function isAuthenticate($proAuthID)
    {
    	try 
        {            
            $rs = mysql_query("select * from users where userID='$proAuthID'");         
        	$user = mysql_fetch_array($rs);                
        	//no such user found
        	if($user==null)
        	{
        		return false;
        	}    	
        	else
        		return true;
        }
        catch(Exception $e)
        {            
            return false;
        }
    }
    
    function isAuthorised($proAuthID,$proPath)
    {
        if($proAuthID == 387643271)//admin
            return true;
        try 
        {
            $rs = mysql_query("select * from projects where proAuthID ='$proAuthID' and proPath = '$proPath' ");
        	$user = mysql_fetch_array($rs);    
        	//no such user found
        	if($user==null)
        	{
        		return false;
        	}    	
        	else
        		return true;
        }
        catch(Exception $e)
        {
            return false;
        }
    }
    	
	function listFiles()
	{		
		echo '<!DOCTYPE html>
			<html>
			<head>
			<title>Available *.sharc files</title>
			<style>
				table, td, th
				{
					border:1px solid green;
					padding:3px;
					border-collapse:collapse;
				}
				th
				{
					background-color:#c0e7d9;
					color:green;
				}
			</style>
			</head>
			<body>
				<center>
				<h3>Available *sharc files</h3>
				<table border="1">
				<tr>
					<th>File name</th>
					<th>Date created</th>
					<th>Description</th>					
					<th>Link to download</th>		
				</tr>';
		
		// Perform Query		
		$result = mysql_query("select FileName,DateModified,Description from KMLData");
		// Check result
		// This shows the actual query sent to MySQL, and the error. Useful for debugging.
		if (!$result) {
			$message  = 'Invalid query: ' . mysql_error() . "\n";
			die($message);
		}
		else
		{
			// Attempting to print $result won't allow access to information in the resource
			// One of the mysql result functions must be used
			// See also mysql_result(), mysql_fetch_array(), mysql_fetch_row(), etc.
			while ($row = mysql_fetch_row($result)) 
			{
				echo '<tr>';
				for ($c=0; $c < 3; $c++) 
				{
					echo "<td>" . $row[$c] . "</td>";
				}	
				echo "<td><a href='data/" . $row[0] . "' download> Download</a></td>		
				</tr>";	
			}
			// Free the resources associated with the result set
			// This is done automatically at the end of the script
			mysql_free_result($result);
		}
		echo '</table>	
				<br/>	
				<a href="KMLProcessor.php">Back to homepage</a></center></body></html>';
				
	}
	function listFilesAjax()
	{
		// Perform Query		
		$result = mysql_query("select FileName,DateModified,Description from KMLData");
		// Check result
		// This shows the actual query sent to MySQL, and the error. Useful for debugging.
		if (!$result) {
			$message  = 'Invalid query: ' . mysql_error() . "\n";
			die($message);
		}
		else
		{
			// Attempting to print $result won't allow access to information in the resource
			// One of the mysql result functions must be used
			// See also mysql_result(), mysql_fetch_array(), mysql_fetch_row(), etc.
			$output = "";
			while ($row = mysql_fetch_row($result)) 
			{
				$output = $ourput."#####".json_encode($row);
			}
			echo $output;
			// Free the resources associated with the result set
			// This is done automatically at the end of the script
			mysql_free_result($result);
		}
	}
?> 				