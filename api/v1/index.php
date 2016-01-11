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
    require_once 'models/SharcPoiType.php';
    require_once 'models/SharcMediaDesigner.php';
    require_once 'models/SharcMediaExperience.php';
    require_once 'models/SharcEoiDesigner.php';
    require_once 'models/SharcEoiExperience.php';
    require_once 'models/SharcRouteDesigner.php';
    require_once 'models/SharcRouteExperience.php';
    require_once 'models/SharcResponse.php';
    require_once 'models/SharcConsumerExperience.php';
    require_once 'services/UserService.php';
    require_once 'services/ExperienceService.php';
    require_once 'services/PoiService.php';
    require_once 'services/PoiTypeService.php';
    require_once 'services/MediaService.php';
    require_once 'services/EoiService.php';
    require_once 'services/RouteService.php';
    require_once 'services/ResponseService.php';
    require_once 'services/ConsumerExperienceService.php';
    
 
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
    
    //Update user location for emulator
    $app->put('/locations', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }   
        //Get a user sent from client and convert it to a json object
        $jsonLocation = $app->request->getBody();
        $objLocation = json_decode($jsonLocation, true);
        $objLocation['id'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = UserService::updateLocation($objLocation['id'], $objLocation['location']);
        Utils::echoResponse($response);
    });
    
    //Update user location for emulator
    $app->get('/locations/:id', function ($id) use ($app) {
        //Check authentication        
        $response = UserService::getLocation($id);
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
    
    $app->post('/publishExperience/:id', function ($id) use ($app) {        
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
    
    //Get all experience of a designer with id
    $app->get('/experiences/:id', function ($id) use ($app) {
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }           
        $id = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only     
        $response = ExperienceService::getExperienceOfDesigner($id);
        Utils::echoResponse($response); 
    });
    
    $app->delete('/experiences/:designerId/:experienceId', function ($designerId, $experienceId) use ($app) {
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
           
        $designerId = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only     
        $response = ExperienceService::deleteExperience($designerId, $experienceId);
        Utils::echoResponse($response);
    });
    
    //Get content of an experience - use when loading an experience from SLAT
    $app->get('/experiences/:designerId/:experienceId', function ($designerId, $experienceId) use ($app) {
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
           
        $designerId = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = ExperienceService::getExperienceContent($designerId, $experienceId);        
        Utils::echoResponse($response); 
    });
    
    
    //Get content of an experience --> For exporting data to KML
    $app->get('/experienceSnapshot/:designerId/:experienceId', function ($designerId, $experienceId) use ($app) {
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
           
        $designerId = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only     
        $response = ExperienceService::getExperienceSnapshotForKml($designerId, $experienceId);
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
    
    //RESTful for PoiType
    $app->post('/poiTypes', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonPoiType = $app->request->getBody();        
        $objPoiType = json_decode($jsonPoiType, true);
        $objPoiType['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = PoiTypeService::addNewPoiType($objPoiType);
        Utils::echoResponse($response);
    });    
    
    $app->put('/poiTypes', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonPoiType = $app->request->getBody();        
        $objPoiType = json_decode($jsonPoiType, true);
        $objPoiType['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = PoiTypeService::updatePoiType($objPoiType);
        Utils::echoResponse($response);
    });
    
    $app->delete('/poiTypes', function () use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonPoiType = $app->request->getBody();        
        $objPoiType = json_decode($jsonPoiType, true);
        $objPoiType['designerId'] = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only
        $response = PoiTypeService::deletePoiType($objPoiType);
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
    
    //This endpoint is called by SPET so no user info
    $app->get('/mediaForEntityForSpet/:experienceId/:entityId/:entityType', function ($experienceId, $entityId, $entityType) use ($app) {
        $response = MediaService::getMediaForEntityForSpet($experienceId, $entityId, $entityType);
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
        
    $app->get('/mediaLibrary/:designerId', function ($designerId) use ($app) {
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }
        $response = MediaService::getMediaLibrary($rs['data']->id, $designerId);
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
 
    //APIs For SMEP
    //Get list of published experiences
    $app->get('/experiences', function () { //should be published experiences only
        $response = ExperienceService::getPublishedExperiences();
        Utils::echoResponse($response); 
    });  
    
    //Get content of an experience for SMEP
    $app->get('/experienceSnapshot/:experienceId', function ($experienceId) use ($app) {        
        $response = ExperienceService::getExperienceSnapshotForConsumer($experienceId);
        Utils::echoResponse($response); 
    });
    
    //Tracking who logs into SMEP and consume which experience
    $app->post('/consumerExperience',function () use ($app){
        ///:experienceId/:cloudAccountId/:username/:useremail/:cloudType
        $userId = $app->request->post('userId');
        $experienceId = $app->request->post('experienceId');     
        $cloudAccountId = $app->request->post('cloudAccountId');
        $username = $app->request->post('username');
        $useremail = $app->request->post('useremail');
        $cloudType = $app->request->post('cloudType');
        
        $response = UserService::trackConsumerExperience($userId, $experienceId, $cloudAccountId, $username, $useremail, $cloudType);
        Utils::echoResponse($response); 
    });
    
    //Submit a response
    $app->post('/responses', function () use ($app){
        $objResponse = array();
        $objResponse['apiKey'] = $app->request->post('apiKey');
        $objResponse['userId'] = $app->request->post('userId');
        
        $objResponse['id'] = $app->request->post('id');
        $objResponse['experienceId'] = $app->request->post('experienceId');
        
        $objResponse['contentType'] = $app->request->post('contentType');
        $objResponse['content'] = $app->request->post('content');
        $objResponse['description'] = $app->request->post('description');
        
        $objResponse['entityType'] = $app->request->post('entityType');
        $objResponse['entityId'] = $app->request->post('entityId');
        $objResponse['status'] = $app->request->post('status');
        
        $objResponse['size'] = $app->request->post('size');
        $objResponse['submittedDate'] = $app->request->post('submittedDate');
        $objResponse['fileId'] = $app->request->post('fileId');
        
        //Check authentication        
        $rs = UserService::checkAuthentication($objResponse['apiKey']);
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }        
        $objResponse['userId'] = $rs['data']->id;//So even with a valid apiKey, the user can access her own resources only
        $response = ResponseService::addNewResponse($objResponse);
        Utils::echoResponse($response); 
    });

    //Update a response
    $app->put('/responses', function () use ($app){
        //Check authentication        
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }    
        //Get a user sent from client and convert it to a json object
        $jsonResponse = $app->request->getBody();        
        $objResponse = json_decode($jsonResponse, true);        
        $response = ResponseService::updateResponse($objResponse);
        Utils::echoResponse($response); 
    }); 
    
    //endpoints for SPVT
    //Get experiences consumed by a user
    $app->get('/experiencesForSpvt/:userId', function ($userId) use ($app) {
        $rs = UserService::checkAuthentication($app->request->headers->get('apiKey'));
        if($rs["status"] != SUCCESS){
            Utils::echoResponse($rs);
            return;
        }           
        $userId = $rs['data']->id;//So even with a valid apiKey, the designer can access her own resources only     
        $response = ExperienceService::getExperienceOfConsumer($userId);
        Utils::echoResponse($response); 
    });      
 
    $app->map('/hello', function () {
		echo "Welcome to SHARC 2.0 RESTful Web services";
	})->via('GET', 'POST');
    
    $app->map('/test/:designerId/:experienceId', function ($designerId, $experienceId) {
        //$results = Capsule::se DB::s:select('select * from SharcUsers where id = ?', array(5));
        //echo $results->toJson();
        echo MediaService::getMediaSizeForExperience($designerId, $experienceId);       
         
	})->via('GET');
 
 
    $app->run();     
?>