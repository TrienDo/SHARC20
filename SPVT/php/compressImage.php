<?php
    require("utils.php");
    connectDB();		
    try 
	{        
        $inFile = $_POST['fileName']; //id of designer actually        
        if(!isAuthenticate($inFile))
        {            
            $response["success"] = -1;
    		$response["message"] = '401 - Unauthorized';
            echo json_encode($response);
            return;
        }        
        $imageURI 	= htmlspecialchars($_POST['imageData']);        
        $encodedData = substr($imageURI,strpos($imageURI,",")+1);
        $encodedData = str_replace(' ','+',$encodedData);
        $decodedData = base64_decode($encodedData); 
        $inFile = $inFile.".jpg";       
        $outFile	= 'data/'.$inFile;                
        $ret = file_put_contents($outFile, $decodedData);
        if (!$ret) 
		{			
            $response["data"] = 'Could not write to file: ' . error_get_last();			
            $response["success"] = 0;
		}
        else
        {
           $response["data"] = $inFile;		 	
	       $response["success"] = 1;
        }       
    }
	catch (Exception $e) 
	{
		
        $response["data"] = 'Caught exception: '.$e->getMessage();			
        $response["success"] = 0;
	}
    // echoing JSON response
   	echo json_encode($response);
?> 