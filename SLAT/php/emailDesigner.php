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
        $authEmail 		= htmlspecialchars($_POST['authEmail']);        
        $authName 		= htmlspecialchars($_POST['authName']);		
        $proName	= htmlspecialchars($_POST['proName']);
        $conName	= htmlspecialchars($_POST['conName']);
        $conEmail	= htmlspecialchars($_POST['conEmail']);        
      
        $subject = "A new response from SMEP";
        $msg = "Dear $authName \n\nA response has been submitted to your $proName experience by $conName. Please sign into SLAT with your Dropbox account at http://wraydisplay.lancs.ac.uk/sharcauthoringV1_20 to moderate the response. Once you have logged in, please go to menu Response -> Moderate new responses \n\nPlease do not reply to this automatic email. You can contact us at thesharcproject@gmail.com.\n\nThank you.\n\nThe SHARC project team.";
        $headers = "From: SHARC-Authoring-Tool" . "\r\n" . "CC: thesharcproject@gmail.com";
        // use wordwrap() if lines are longer than 70 characters
        //$msg = wordwrap($msg,70);
        mail($authEmail,$subject,$msg,$headers);  
        $msg = "Dear $conName \n\nYour response to the $proName experience has been submitted and is waiting for moderation. We will notify you the outcome once the moderator has made a decision.\n\nPlease do not reply to this automatic email. You can contact us at thesharcproject@gmail.com.\n\nThank you.\n\nThe SHARC project team.";
        $headers = "From: SMET" . "\r\n" . "CC: thesharcproject@gmail.com";
        mail($conEmail,$subject,$msg,$headers);      
    }
	catch (Exception $e) 
	{
		echo 'Caught exception: ',  $e->getMessage(), "\n";
	}    
?>