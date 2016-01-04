<?php
 
    /**
     * This class to handle db operations relating to a ConsumerExperience     
     *
     * @author: Trien Do  
     */
    class ConsumerExperienceService {
     
        function __construct() {
                
        }
      
        
        /**
         * Create a new ConsumerExperience if not exist else update 
         * @param String $objConEx: a json object containing info of ConsumerExperience                  
         */
        public static function updateConsumerExperience($objConEx){            
            $response = array();
            $conEx = array();
            try{
                $rs = SharcConsumerExperience::where('userId',$objConEx['userId'])->where('experienceId',$objConEx['experienceId'])->get();
                if ($rs->count() == 0){ //Not exists -> add a new row 
                    $conEx = SharcConsumerExperience::create(array(
                        'id' => $objConEx['id'],
                        'userId' => $objConEx['userId'],                   
                        'experienceId' => $objConEx['experienceId'],
                        'lastVisitedDate' => date('Y-m-d'),
                    ));
                } 
                else {//exists -> update lastLogin and generate new apiKey
                    $conEx = $rs[0];
                    $conEx->lastVisitedDate = date('Y-m-d');
                }
                
                $result = $conEx->save(); 
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS;            
                    $response["data"] = $conEx->toArray();    
                }   
                else {  //error
                    $response["status"] = ERROR;
                    $response["data"] = INTERNAL_SERVER_ERROR;                
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