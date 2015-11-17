<?php 
    /**
     * This class to provide endpoints of SHARC2.0 RESTful web services
     * Endpoints interact with database via services in the services folder     
     *
     * @author: Trien Do  
     */
 
    require ("vendor/autoload.php");    
    require_once 'include/Config.php';
    require_once 'include/Utils.php';    
    require_once 'models/SharcUser.php';
    require_once 'models/SharcExperience.php';
    require_once 'models/SharcPoiDesigner.php';
    require_once 'models/SharcPoiExperience.php';
    require_once 'services/UserService.php';
    require_once 'services/ExperienceService.php';
    require_once 'services/PoiService.php';
    
 
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
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonExperience = $app->request->getBody();
        $objExperience = json_decode($jsonExperience, true);
        $objExperience['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = ExperienceService::addNewExperience($objExperience);
        Utils::echoResponse($response);
    });
    
    $app->put('/experiences/:id', function ($id) use ($app) {        
        $jsonExperience = $app->request->getBody();         
        $objExperience = json_decode($jsonExperience, true);     
        $response = ExperienceService::updateExperience($id,$objExperience);
        Utils::echoResponse($response);
    });
    
    $app->get('/experiences', function () { //should be published experiences only
        $response = array();        
        $response = ExperienceService::getAllExperiences();
        Utils::echoResponse($response); 
    });   
    
    //Get all experience of a designer with id
    $app->get('/experiences/:id', function ($id) use ($app) {
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
        $response = array();   
        $id = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only     
        $response = ExperienceService::getExperienceOfDesigner($id);
        Utils::echoResponse($response); 
    });
    
    $app->delete('/experiences/:id', function ($id) {
        $response = array();        
        $response = ExperienceService::deleteExperienceFromId($id);
        Utils::echoResponse($response); 
    });
    
    //Get content of an experience
    $app->get('/experiences/:designerId/:experienceId', function ($designerId, $experienceId) use ($app) {
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
        $response = array();   
        $designerId = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only     
        $response = ExperienceService::getExperienceContent($designerId, $experienceId);
        Utils::echoResponse($response); 
    });
    
    //RESTful for Poi
    $app->post('/pois', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonPoi = $app->request->getBody();        
        $objPoi = json_decode($jsonPoi, true);
        $objPoi['poiDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = PoiService::addNewPoi($objPoi);
        Utils::echoResponse($response);
    });
 
    $app->map('/hello', function () {
		echo "Welcome to SHARC 2.0 RESTful Web services";
	})->via('GET', 'POST');
 
    $app->run();     
?>