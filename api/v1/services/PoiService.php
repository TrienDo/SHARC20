<?php
 
    /**
     * This class to handle all db operations relating to a SharcPoiDesigner and SharcPoiExperience     
     *
     * @author: Trien Do  
     */
    class PoiService {
     
        function __construct() {
                
        }
      
        
        /**
         * Create a new Poi = 1 SharcPoiDesigner + 1 SharcPoiExperience
         * @param String $objPoi: a json object containing info of both Pois                  
         */
        public static function addNewPoi($objPoi) {            
            $response = array();
            try{//poiDesignerId, name, coordinate, triggerZone, designerID
                $poiDesigner = SharcPoiDesigner::create(array(
                    'name' => $objPoi['poiDesigner']['name'],                   
                    'coordinate' => $objPoi['poiDesigner']['coordinate'],
                    'triggerZone' => $objPoi['poiDesigner']['triggerZone'],                   
                    'designerId' => $objPoi['poiDesigner']['designerId']
                ));                
                $result = $poiDesigner->save(); 
                if (!$result){                     
                    $response["status"] = ERROR;
                    $response["data"] = INTERNAL_SERVER_ERROR; 
                    return $response;                
                }            
                
                $poiExperience = SharcPoiExperience::create(array(
                    'experienceId' => $objPoi['experienceId'],                   
                    'poiDesignerId' => $poiDesigner->id,
                    'description' => $objPoi['description']                    
                ));
                
                //$poiExperience->sharcPoiDesigner()->associate(poiDe)
                
                $result = $poiExperience->save(); 
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS; 
                    //$poiExperience->$poiDesigner          
                    $response["data"] = $poiExperience->toArray();
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