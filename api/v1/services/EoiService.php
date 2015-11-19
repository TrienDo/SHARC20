<?php
 
    /**
     * This class to handle all db operations relating to a SharcEoiDesigner and SharcEoiExperience     
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
                    'experienceId' => $objEoi['experienceId'],                   
                    'eoiDesignerId' => $eoiDesigner->id,
                    'note' => $objEoi['note']                    
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
    } 
?>