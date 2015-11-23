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
                    'description' => $objPoi['description'],
                    'typeList' => $objPoi['typeList'],
                    'eoiList' => $objPoi['eoiList'],                    
                    'routeList' => $objPoi['routeList']                      
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
        
        /**
         * Update a Poi = 1 SharcPoiDesigner + 1 SharcPoiExperience
         * @param String $objPoi: a json object containing info of both Pois                  
         */
        public static function updatePoi($objPoi) {            
            $response = array();
            try{
                $poiDesigner = SharcPoiDesigner::find($objPoi['poiDesigner']['id']);
                if($poiDesigner != null) {
                
                    $poiDesigner->name = $objPoi['poiDesigner']['name'];                   
                    $poiDesigner->coordinate = $objPoi['poiDesigner']['coordinate'];
                    $poiDesigner->triggerZone = $objPoi['poiDesigner']['triggerZone'];
                    $result = $poiDesigner->save(); 
                    if (!$result){                     
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR; 
                        return $response;                
                    }
                }           
                
                $poiExperience = SharcPoiExperience::find($objPoi['id']);
                if($poiExperience != null){                    
                    $poiExperience->description = $objPoi['description'];
                    $poiExperience->typeList = $objPoi['typeList'];
                    $poiExperience->eoiList = $objPoi['eoiList'];                    
                    $poiExperience->routeList = $objPoi['routeList'];
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
                }
                //update other table e.g. route/event                
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        } 
        
        /**
         * Delete a Poi -> delete only SharcPoiExperience & SharcMediaExperience
         * @param String $objPoi: a json object containing info of both Pois                  
         */
        public static function deletePoi($objPoi) {            
            $response = array();
            try{
                //Delete media
                SharcMediaExperience::where('experienceId', $objPoi['experienceId'])->where('entityId', $objPoi['id'])->where('entityType', 'POI')->delete();
                $poiExperience = SharcPoiExperience::find($objPoi['id']);
                if($poiExperience != null){
                    $result = $poiExperience->delete(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $response["data"] = $poiExperience->toArray();
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