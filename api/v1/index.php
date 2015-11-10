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
        $response = UserService::userLogin($objUser);
        Utils::echoResponse($response);                
    });
    
    //RESTful for SharcExperience
    $app->post('/experiences', function () use ($app) {
        //Get a user sent from client and convert it to a json object
        $jsonExperience = $app->request->getBody();
        $objExperience = json_decode($jsonExperience, true);
        $response = ExperienceService::addNewExperience($objExperience);
        Utils::echoResponse($response);
    });
    
    $app->put('/experiences/:id', function ($id) use ($app) {        
        $jsonExperience = $app->request->getBody();         
        $objExperience = json_decode($jsonExperience, true);     
        $response = ExperienceService::updateExperience($id,$objExperience);
        Utils::echoResponse($response);
    });
    
    $app->get('/experiences', function () { 
        $response = array();        
        $response = ExperienceService::getAllExperiences();
        Utils::echoResponse($response); 
    });   
    
    $app->get('/experiences/:id', function ($id) { 
        $response = array();        
        $response = ExperienceService::getExperienceFromId($id);
        Utils::echoResponse($response); 
    });
    
    $app->delete('/experiences/:id', function ($id) {
        $response = array();        
        $response = ExperienceService::deleteExperienceFromId($id);
        Utils::echoResponse($response); 
    });
    
    //RESTful for SharcExperience
 
    $app->map('/hello', function () {
		echo "Welcome to SHARC 2.0 RESTful Web services";
	})->via('GET', 'POST');
 
    $app->run();     
?>