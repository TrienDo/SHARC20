<?php
class Utils
{    
    /**
     * Generating random Unique MD5 String for user Api key
     */
    public static function generateApiKey() {
        return md5(uniqid(rand(), true));
    }
    
    public static function getExceptionMessage($e) {
        return INTERNAL_SERVER_ERROR." ".$e->getMessage();
    }
    
    
    public static function echoResponse($response) {
	    $app = \Slim\Slim::getInstance();
        if($response["status"] == SUCCESS)        
            $app->status(201);
        else if($response["status"] == FAILED)        
            $app->status(200);
        else
            $app->status(500);
	    // setting response content type to json
	    $app->contentType('application/json');	 
	    echo json_encode($response);
	}
 }
 ?>