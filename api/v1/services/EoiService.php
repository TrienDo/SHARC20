<?php
 
    /**
     * This class to handle db operations relating to a SharcEoiDesigner and SharcEoiExperience     
     *
     * @author: Trien Do  
     */
    class EoiService {
     
        function __construct() {
                
        }
      
        
        /**
         * Create a new Eoi = 1 SharcEoiDesigner + 1 SharcEoiExperience
         * @param String $objEoi: a json object containing info of both Eois                  
         */
        public static function addNewEoi($objEoi){            
            $response = array();
            try{
                $eoiDesigner = SharcEoiDesigner::create(array(
                    'id' => $objEoi['id'],
                    'name' => $objEoi['eoiDesigner']['name'],                   
                    'description' => $objEoi['eoiDesigner']['description'],                                    
                    'designerId' => $objEoi['eoiDesigner']['designerId']
                ));                
                $result = $eoiDesigner->save(); 
                if (!$result){                     
                    $response["status"] = ERROR;
                    $response["data"] = INTERNAL_SERVER_ERROR; 
                    return $response;                
                }            
                
                $eoiExperience = SharcEoiExperience::create(array(
                    'id' => $objEoi['id'],
                    'experienceId' => $objEoi['experienceId'],                   
                    'eoiDesignerId' => $eoiDesigner->id,
                    'note' => $objEoi['note'],
                    'poiList' => $objEoi['poiList'],
                    'routeList' => $objEoi['routeList']                    
                ));
                
                
                $result = $eoiExperience->save(); 
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS;                        
                    $response["data"] = $eoiExperience->toArray();
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
         * Update a Eoi = 1 SharcEoiDesigner + 1 SharcEoiExperience
         * @param String $objEoi: a json object containing info of both Eois                  
         */
        public static function updateEoi($objEoi) {            
            $response = array();
            try{
                $eoiDesigner = SharcEoiDesigner::find($objEoi['eoiDesigner']['id']);
                if($eoiDesigner != null) {
                
                    $eoiDesigner->name = $objEoi['eoiDesigner']['name'];                   
                    $eoiDesigner->description = $objEoi['eoiDesigner']['description'];
                    
                    $result = $eoiDesigner->save(); 
                    if (!$result){                     
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR; 
                        return $response;                
                    }
                }           
                
                $eoiExperience = SharcEoiExperience::find($objEoi['id']);
                if($eoiExperience != null){                    
                    $eoiExperience->note = $objEoi['note'];                    
                    $eoiExperience->poiList = $objEoi['poiList'];                    
                    $eoiExperience->routeList = $objEoi['routeList'];
                    
                    $result = $eoiExperience->save(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $response["data"] = $eoiExperience->toArray();
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
         * Delete a Eoi -> delete only SharcEoiExperience & SharcMediaExperience
         * @param String $objEoi: a json object containing info of both Eois                  
         */
        public static function deleteEoi($objEoi) {            
            $response = array();
            try{
                //Delete media
                SharcMediaExperience::where('experienceId', $objEoi['experienceId'])->where('entityId', $objEoi['id'])->where('entityType', 'EOI')->delete();
                $eoiExperience = SharcEoiExperience::find($objEoi['id']);
                if($eoiExperience != null){
                    $result = $eoiExperience->delete(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $response["data"] = $eoiExperience->toArray();
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