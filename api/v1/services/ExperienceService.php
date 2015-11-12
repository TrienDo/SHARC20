<?php
 
    /**
     * This class to handle all db operations relating to a SharcExperience     
     *
     * @author: Trien Do  
     */
    class ExperienceService {
     
        function __construct() {
                
        }
      
        
        /**
         * Create a new experience
         * @param String $objExperience: a json object of SharcExperience                  
         */
        public static function addNewExperience($objExperience) {
            $response = array();
            try{
                $rs = SharcExperience::where('name',$objExperience['name'])->get();
                if ($rs->count() == 0){ //Not exists -> add a new experience 
                    $experience = SharcExperience::create(array(
                        'name' => $objExperience['name'],                   
                        'description' => $objExperience['description'],
                        'createdDate' => date('Y-m-d'),
                        'lastPublishedDate' => date('Y-m-d'),
                        'designerId' => $objExperience['designerId'],
                        'isPublished' => $objExperience['isPublished'],                    
                        'moderationMode' => $objExperience['moderationMode'],
                        'latLng' => $objExperience['latLng'], 
                        'summary' => $objExperience['summary'],
                        'snapshotPath' => $objExperience['snapshotPath'],                                       
                        'thumbnailPath' => $objExperience['thumbnailPath'],
                        'size' => $objExperience['size'],
                        'theme' => $objExperience['theme'] 
                    ));
                    
                    $result = $experience->save();
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;            
                        $response["data"] = $experience->toArray();    
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }
                } 
                else {      //fail AS exists 
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_EXIST;                  
                }            
            }
            catch(Exception $e)
            {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;
        }
        
        /**
         * Update an experience
         * @param int $id: id of the SharcExperience
         * @param String $objExperience: a json object of SharcExperience
         */
        public static function updateExperience($id, $objExperience) {
            $response = array();
            try{
                $experience = SharcExperience::find($id);            
                if ($experience != null){ //Not exists -> add a new experience
                    $experience->name = $objExperience['name'];                   
                    $experience->description = $objExperience['description'];
                    $experience->lastPublishedDate = date('Y-m-d');
                    $experience->isPublished = $objExperience['isPublished'];                    
                    $experience->moderationMode = $objExperience['moderationMode'];
                    $experience->latLng = $objExperience['latLng'];
                    $experience->summary = $objExperience['summary'];
                    $experience->snapshotPath = $objExperience['snapshotPath'];                                       
                    $experience->thumbnailPath = $objExperience['thumbnailPath'];
                    $experience->size = $objExperience['size'];
                    $experience->theme = $objExperience['theme']; 
                                    
                    $result = $experience->save();
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;            
                        $response["data"] = $experience->toArray();    
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }
                } 
                else {      //fail AS cant find the experience 
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_NOT_EXIST;                  
                }
            }
            catch(Exception $e)
            {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;
        }
        
        /**
         * Get info of an experience
         * @param int $id: id of the SharcExperience         
         */
        public static function getExperienceFromId($id)
        {
            $response = array();
            try{    
                $experience = SharcExperience::find($id);                
                if ($experience != null){
                    $response["status"] = SUCCESS;            
                    $response["data"] = $experience->toArray();    
                }   
                else {  //error
                    $response["status"] = FAILED;
                    $response["data"] = EXPERIENCE_NOT_EXIST;                
                }
            }
            catch(Exception $e)
            {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;
        }
        
        
        /**
         * Get available experiences of a designer
         * @param int $id: id of the designer         
         */
        public static function getExperienceOfDesigner($id)
        {
            $response = array();
            try{    
                $response["status"] = SUCCESS;            
                $response["data"] = SharcExperience::where('designerId',$id)->get()->toArray();
            }
            catch(Exception $e)
            {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;
        }
        /**
         * Get all available experience
         * @param int $id: id of the SharcExperience         
         */
        public static function getAllExperiences()
        {
            $response = array();
            try{                
                $response["status"] = SUCCESS;            
                $response["data"] = SharcExperience::all()->toArray();
            }
            catch(Exception $e)
            {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;
        }
        
        /**
         * Delete an experience
         * @param int $id: id of the SharcExperience         
         */
        public static function deleteExperienceFromId($id)
        {
            $response = array();
            try{    
                $experience = SharcExperience::find($id);                
                if($experience!=null)
                {
                    $result = $experience->delete();//= 1 success
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;            
                        $response["data"] = null;    
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }
                } 
                else {      //fail AS cant find the experience 
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_NOT_EXIST;                  
                }
            }
            catch(Exception $e)
            {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;
        }
    }
 
?>