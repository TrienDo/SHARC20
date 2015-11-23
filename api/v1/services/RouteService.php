<?php
 
    /**
     * This class to handle all db operations relating to a SharcRouteDesigner and SharcRouteExperience     
     *
     * @author: Trien Do  
     */
    class RouteService {
     
        function __construct() {
                
        }
      
        
        /**
         * Create a new Route = 1 SharcRouteDesigner + 1 SharcRouteExperience
         * @param String $objRoute: a json object containing info of both Routes                  
         */
        public static function addNewRoute($objRoute){            
            $response = array();
            try{
                $routeDesigner = SharcRouteDesigner::create(array(
                    'name' => $objRoute['routeDesigner']['name'],                   
                    'directed' => $objRoute['routeDesigner']['directed'],
                    'colour' => $objRoute['routeDesigner']['colour'],    
                    'path' => $objRoute['routeDesigner']['path'],                                        
                    'designerId' => $objRoute['routeDesigner']['designerId']
                ));                
                $result = $routeDesigner->save(); 
                if (!$result){                     
                    $response["status"] = ERROR;
                    $response["data"] = INTERNAL_SERVER_ERROR; 
                    return $response;                
                }            
                
                $routeExperience = SharcRouteExperience::create(array(
                    'experienceId' => $objRoute['experienceId'],                   
                    'routeDesignerId' => $routeDesigner->id,
                    'description' => $objRoute['description'],
                    'poiList' => $objRoute['poiList'],      
                    'eoiList' => $objRoute['eoiList']                    
                ));
                
                
                $result = $routeExperience->save(); 
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS;                        
                    $response["data"] = $routeExperience->toArray();
                }   
                else {  //error
                    $response["status"] = ERROR;
                    $response["data"] = INTERNAL_SERVER_ERROR;                
                }
                //update other table e.g. route/event/media                
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }
        
        /**
         * Update a Route = 1 SharcRouteDesigner + 1 SharcRouteExperience
         * @param String $objRoute: a json object containing info of both Routes                  
         */
        public static function updateRoute($objRoute) {            
            $response = array();
            try{
                $routeDesigner = SharcRouteDesigner::find($objRoute['routeDesigner']['id']);
                if($routeDesigner != null) {
                
                    $routeDesigner->name = $objRoute['routeDesigner']['name'];                   
                    $routeDesigner->directed = $objRoute['routeDesigner']['directed'];
                    $routeDesigner->colour = $objRoute['routeDesigner']['colour'];
                    $routeDesigner->path = $objRoute['routeDesigner']['path'];
                    
                    $result = $routeDesigner->save(); 
                    if (!$result){                     
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR; 
                        return $response;                
                    }
                }           
                
                $routeExperience = SharcRouteExperience::find($objRoute['id']);
                if($routeExperience != null){                    
                    $routeExperience->description = $objRoute['description'];
                    $routeExperience->poiList = $objRoute['poiList'];
                    $routeExperience->eoiList = $objRoute['eoiList'];                    
                    
                    $result = $routeExperience->save(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $response["data"] = $routeExperience->toArray();
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }                      
                }
                //update other table e.g. poi/event                
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }
        
        /**
         * Delete a Route -> delete only SharcRouteExperience & SharcMediaExperience
         * @param String $objRoute: a json object containing info of both Routes                  
         */
        public static function deleteRoute($objRoute) {            
            $response = array();
            try{
                //Delete media
                SharcMediaExperience::where('experienceId', $objRoute['experienceId'])->where('entityId', $objRoute['id'])->where('entityType', 'POI')->delete();
                $routeExperience = SharcRouteExperience::find($objRoute['id']);
                if($routeExperience != null){
                    $result = $routeExperience->delete(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $response["data"] = $routeExperience->toArray();
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }                      
                }
                //update other table e.g. route/event                
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }  
    } 
?>