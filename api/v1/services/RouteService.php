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
                    'description' => $objRoute['description']                    
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
    } 
?>