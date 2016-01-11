<?php
    require("utils.php");
    try 
	{
        $proAuthID	= htmlspecialchars($_POST['proAuthID']);
        connectDB();
        if(!isAuthenticate($proAuthID))
        {
            $response["success"] = -1;
    		$response["message"] = '401 - Unauthorized';
            echo json_encode($response);
            return;
        }
        $conEmail 		= htmlspecialchars($_POST['consumerEmail']);        
        $conName 		= htmlspecialchars($_POST['consumerName']);		
        $proName	= htmlspecialchars($_POST['experienceName']);
        $authName	= htmlspecialchars($_POST['designerName']);
        $resStatus	= htmlspecialchars($_POST['responseStatus']);
        $to = $conEmail;
        $subject = "A new response from SMEP";
        $msg = "Dear $conName \n\nYour response to the $proName experience has been moderated by the designer $authName. Its status is: {$resStatus}. \n\nPlease do not reply to this automatic email. You can contact us at thesharcproject@gmail.com.\n\nThank you.\n\nThe SHARC project team.";
        $headers = "From: SMEP" . "\r\n" . "CC: thesharcproject@gmail.com";
        // use wordwrap() if lines are longer than 70 characters
        //$msg = wordwrap($msg,70);
        mail($to,$subject,$msg,$headers);        
    }
	catch (Exception $e) 
	{
		echo 'Caught exception: ',  $e->getMessage(), "\n";
	}    
?>