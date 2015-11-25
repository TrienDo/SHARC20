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
    require_once 'models/SharcMediaDesigner.php';
    require_once 'models/SharcMediaExperience.php';
    require_once 'models/SharcEoiDesigner.php';
    require_once 'models/SharcEoiExperience.php';
    require_once 'models/SharcRouteDesigner.php';
    require_once 'models/SharcRouteExperience.php';
    require_once 'services/UserService.php';
    require_once 'services/ExperienceService.php';
    require_once 'services/PoiService.php';
    require_once 'services/MediaService.php';
    require_once 'services/EoiService.php';
    require_once 'services/RouteService.php';
    
 
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
    
    $app->get('/users', function () use ($app) {
          
        echo UserService::all()->toJson();
                        
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
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
        
        $jsonExperience = $app->request->getBody();         
        $objExperience = json_decode($jsonExperience, true);     
        $response = ExperienceService::updateExperience($id,$objExperience,$rs['data']->id);
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
    
    $app->put('/pois', function () use ($app) {
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
        $response = PoiService::updatePoi($objPoi);
        Utils::echoResponse($response);
    });
    
    $app->delete('/pois', function () use ($app) {
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
        $response = PoiService::deletePoi($objPoi);
        Utils::echoResponse($response);
    });
    
    //RESTful for Eoi
    $app->post('/eois', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonEoi = $app->request->getBody();        
        $objEoi = json_decode($jsonEoi, true);
        $objEoi['eoiDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = EoiService::addNewEoi($objEoi);
        Utils::echoResponse($response);
    });    
    
    $app->put('/eois', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonEoi = $app->request->getBody();        
        $objEoi = json_decode($jsonEoi, true);
        $objEoi['eoiDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = EoiService::updateEoi($objEoi);
        Utils::echoResponse($response);
    });
    
    $app->delete('/eois', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonEoi = $app->request->getBody();        
        $objEoi = json_decode($jsonEoi, true);
        $objEoi['eoiDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = EoiService::deleteEoi($objEoi);
        Utils::echoResponse($response);
    });
    
    //RESTful for Route
    $app->post('/routes', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonRoute = $app->request->getBody();        
        $objRoute = json_decode($jsonRoute, true);
        $objRoute['routeDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = RouteService::addNewRoute($objRoute);
        Utils::echoResponse($response);
    });
    
    $app->put('/routes', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonRoute = $app->request->getBody();        
        $objRoute = json_decode($jsonRoute, true);
        $objRoute['routeDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = RouteService::updateRoute($objRoute);
        Utils::echoResponse($response);
    });
    
    $app->delete('/routes', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonRoute = $app->request->getBody();        
        $objRoute = json_decode($jsonRoute, true);
        $objRoute['routeDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = RouteService::deleteRoute($objRoute);
        Utils::echoResponse($response);
    });
    
    //RESTful for Media    
    $app->post('/media', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonMedia = $app->request->getBody();        
        $objMedia = json_decode($jsonMedia, true);
        $objMedia['mediaDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = MediaService::addNewMedia($objMedia);
        Utils::echoResponse($response);
    });
    
    $app->get('/media/:mediaId', function ($mediaId) use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
        $response = MediaService::getMedia($mediaId, $rs['data']->id);
        Utils::echoResponse($response);
    });
    
    $app->put('/media', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonMedia = $app->request->getBody();        
        $objMedia = json_decode($jsonMedia, true);
        $objMedia['mediaDesigner']['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = MediaService::updateMedia($objMedia);
        Utils::echoResponse($response);
    });
    
    $app->delete('/media/:mediaId', function ($mediaId) use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object                
        $objMedia['mediaId'] = $mediaId;
        $objMedia['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = MediaService::deleteMedia($objMedia);
        Utils::echoResponse($response);
    });
    
    
    $app->get('/mediaForEntity/:designerId/:experienceId/:entityId/:entityType', function ($designerId, $experienceId, $entityId, $entityType) use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
        $response = MediaService::getMediaForEntity($designerId, $experienceId, $entityId, $entityType);
        Utils::echoResponse($response);
    });
    
    $app->put('/mediaForEntity/:designerId/:experienceId/:entityId/:entityType', function ($designerId, $experienceId, $entityId, $entityType) use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonMediaOrder = $app->request->getBody();
        $objMediaOrder = json_decode($jsonMediaOrder, true);
        $response = MediaService::updateMediaForEntity($designerId, $experienceId, $entityId, $entityType, $objMediaOrder["mediaOrder"]);
        Utils::echoResponse($response);
    });
    
    //compress media
    $app->post('/mediaCompress', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonMedia = $app->request->getBody();        
        $objMedia = json_decode($jsonMedia, true);        
        $objMedia['fileName'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = MediaService::compressImage($objMedia);
        Utils::echoResponse($response);
    });
 
    $app->map('/hello', function () {
		echo "Welcome to SHARC 2.0 RESTful Web services";
	})->via('GET', 'POST');
    
    $app->map('/test/:experienceId/:entityType/:entityId', function ($experienceId, $entityType, $entityId) {
        $maxOrder = SharcMediaExperience::where('experienceId', $experienceId)->where('entityType',$entityType)->where('entityId',$entityId)->max('order');
        echo "Hey".$maxOrder."Bye";
        if($maxOrder === null)
            $maxOrder = 0;
        else
            $maxOrder = $maxOrder + 1;
        echo $maxOrder;
        
        /*$arrId = explode(" ", $list);        
        foreach ($arrId as $id ){
            $eoi = SharcEoiExperience::find($id);
            echo $eoi->poiList."\n";
            echo $eoi->routeList."\n"."\n";
        }
        */
	})->via('GET');
 
 
    $app->run();     
?>