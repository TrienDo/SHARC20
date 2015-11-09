<?php 
    /**
     * This class to provide endpoints of SHARC2.0 RESTful web services
     * Endpoints interact with database via services in the services folder     
     *
     * @author: Trien Do  
     */
 
    require ("vendor/autoload.php");    
    require_once 'include/DbConfig.php';
    require_once 'include/Utils.php';    
    require_once 'models/SharcUser.php';
    require_once 'models/SharcExperience.php';
    require_once 'services/UserService.php';
    require_once 'services/ExperienceService.php';
    
 
    $app = new \Slim\Slim(array(
        'debug' => true
    ));
 
    //RESTful for SharcUser
    $app->post('/users', function () use ($app) {
        //Get a user sent from client and convert it to a json object
        $jsonUser = $app->request->getBody();         
        $objUser = json_decode($jsonUser, true);
     
        $response = array();
        $user = UserService::userLogin($objUser);        
        $response["user"] = $user->toJson();
        
        if ($user != null) {
            $response["error"] = false;
            $response["message"] = "Successfully logged in.";            
            Utils::echoResponse(201, $response); 
        }
        else {
            $response["error"] = true;            
            $response["message"] = "An error occurred while logging in.";
            Utils::echoResponse(200, $response); 
        }
    });
 
    $app->get('/users', function () {
        /**
        * $user = User::where('email','trien.v.do@gmail.com')->get();
        *     if($user->count() > 0) 
        *         echo $user[0]->username; 
        *     else echo "not found";
        */
        echo  UserService::getAllUsers()->toJson();
            
    });
    
    $app->get('/users/:id', function ($id) {
        $response = array();
        $user = SharcUser::find($id);        
        echo $user;
        //$response["user"] = $user->getUserId();
        //Response->setStatusC("200");        
        //echo json_encode($response);
            
    });
    
    //RESTful for SharcExperience
    $app->post('/experiences', function () use ($app) {
        //Get a user sent from client and convert it to a json object
        $jsonExperience = $app->request->getBody();         
        echo $jsonExperience;
        $objExperience = json_decode($jsonExperience, true);
        
        $response = array();
        $experience = ExperienceService::addNewExperience($objExperience);        
        $response["experience"] = $experience->toJson();
        
        if ($experience != null) {
            $response["error"] = false;
            $response["message"] = "Successfully added an experience.";            
            Utils::echoResponse(201, $response); 
        }
        else {
            $response["error"] = true;            
            $response["message"] = "An error occurred while adding an experience.";
            Utils::echoResponse(200, $response); 
        }
    });
    
    $app->put('/experiences/:id', function ($id) use ($app) {
        //Get a user sent from client and convert it to a json object
        $jsonExperience = $app->request->getBody();         
        $objExperience = json_decode($jsonExperience, true);
     
        $response = array();
        $experience = ExperienceService::updateExperience($id,$objExperience);        
        $response["experience"] = $experience->toJson();
        
        if ($experience != null) {
            $response["error"] = false;
            $response["message"] = "Successfully updated an experience.";            
            Utils::echoResponse(201, $response); 
        }
        else {
            $response["error"] = true;            
            $response["message"] = "An error occurred while updating an experience.";
            Utils::echoResponse(200, $response); 
        }
    });
    
    $app->get('/experiences', function () { 
        echo  ExperienceService::getAllExperiences()->toJson(); 
    });
    
    $app->get('/experiences/:id', function ($id) { 
        echo  ExperienceService::getExperienceFromId($id)->toJson(); 
    });
    
    $app->delete('/experiences/:id', function ($id) { 
        echo  ExperienceService::deleteExperienceFromId($id); 
    });
 
    $app->map('/hello', function () {
		echo "Welcome to SHARC 2.0 RESTful Web services";
	})->via('GET', 'POST');
 
    $app->run();     
?>