<?php
 
    /**
     * This class to handle all db operations relating to a SharcPoiType     
     *
     * @author: Trien Do  
     */
    class PoiTypeService {
     
        function __construct() {
                
        }
      
        
        /**
         * Create a new PoiType 
         * @param String $objPoiType: a json object containing info of PoiType                  
         */
        public static function addNewPoiType($objPoiType){            
            $response = array();
            try{
                $poiType = SharcPoiType::create(array(
                    'name' => $objPoiType['name'],                   
                    'description' => $objPoiType['description'],                                    
                    'designerId' => $objPoiType['designerId']
                ));                
                $result = $poiType->save();
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS;                        
                    $response["data"] = $poiType->toArray();
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
         * Update a PoiType
         * @param String $objPoiType: a json object containing info of PoiType                  
         */
        public static function updatePoiType($objPoiType) {            
            $response = array();
            try{
                $poiType = SharcPoiType::find($objPoiType['id']);
                if($poiType != null) {
                
                    $poiType->name = $objPoiType['name'];                   
                    $poiType->description = $objPoiType['description'];
                    
                    $result = $poiType->save();
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $response["data"] = $poiType->toArray();
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }                      
                }               
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }
        
        /**
         * Delete a PoiType 
         * @param String $objPoiType: a json object containing info of both PoiTypes                  
         */
        public static function deletePoiType($objPoiType) {            
            $response = array();
            try{
                //Delete media
                $poiType = SharcPoiType::find($objPoiType['id']);
                if($poiType != null){
                    $result = $poiType->delete(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $response["data"] = "";
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }                      
                }               
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }  
    } 
?>