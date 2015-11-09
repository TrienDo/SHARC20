<?php
class Utils
{    
    /**
     * Generating random Unique MD5 String for user Api key
     */
    public static function generateApiKey() {
        return md5(uniqid(rand(), true));
    }
    
    public static function echoResponse($status_code, $response) {
	    $app = \Slim\Slim::getInstance();
	    // Http response code
	    $app->status($status_code);	 
	    // setting response content type to json
	    $app->contentType('application/json');	 
	    echo json_encode($response);
	}
    
    public static function verifyRequiredParams($required_fields) {
	    $error = false;
	    $error_fields = "";
	    $request_params = array();
	    $request_params = $_REQUEST;
	    // Handling PUT request params
	    if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
	        $app = \Slim\Slim::getInstance();
	        parse_str($app->request()->getBody(), $request_params);
	    }
	    foreach ($required_fields as $field) {
	        if (!isset($request_params[$field]) || strlen(trim($request_params[$field])) <= 0) {
	            $error = true;
	            $error_fields .= $field . ', ';
	        }
	    }
	 
	    if ($error) {
	        // Required field(s) are missing or empty
	        // echo error json and stop the app
	        $response = array();
	        $app = \Slim\Slim::getInstance();
	        $response["error"] = true;
	        $response["message"] = 'Required field(s) ' . substr($error_fields, 0, -2) . ' is missing or empty';
	        Utils::echoResponse(400, $response);
	        $app->stop();
	    }
	} 
 }
 ?>