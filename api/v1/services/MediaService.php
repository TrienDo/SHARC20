<?php
 
    /**
     * This class to handle db operations relating to a SharcMediaDesigner and SharcMediaExperience     
     *
     * @author: Trien Do  
     */
    class MediaService {
     
        function __construct() {
                
        }
        
        /**
         * Get a Media item = get SharcMediaExperience + SharcMediaDesigner
         * @param String $mediaExperienceId: id of the SharcMediaExperience                
         * @param String $designerId: id of the Designer
         */
        public static function getMedia($mediaExperienceId, $designerId) {
            $response = array();
            try{
                $mediaExperience = SharcMediaExperience::find($mediaExperienceId);
                if($mediaExperience != null){
                    $mediaDesigner = SharcMediaDesigner::where('id',$mediaExperience->mediaDesignerId)->where('designerId',$designerId)->get();
                    $mediaExperience["mediaDesigner"] = $mediaDesigner[0]->toArray();
                    $response["status"] = SUCCESS;
                    $response["data"] = $mediaExperience->toArray();
                }   
                else {  //error
                    $response["status"] = FAILED;
                    $response["data"] = MEDIA_NOT_FOUND;                                    
                }               
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }
        
        
        /**
         * Create a new Media = 1 SharcMediaDesigner + 1 SharcMediaExperience
         * @param String $objMedia: a json object containing info of both Media                  
         */
        public static function addNewMedia($objMedia) {
            $response = array();
            try{
                //'contentType', 'content', 'size', 'designerId'
                $mediaDesigner = SharcMediaDesigner::create(array(
                    'id' => $objMedia['id'],
                    'name' => $objMedia['mediaDesigner']['name'],
                    'contentType' => $objMedia['mediaDesigner']['contentType'],                   
                    'content' => $objMedia['mediaDesigner']['content'],
                    'size' => $objMedia['mediaDesigner']['size'],                   
                    'designerId' => $objMedia['mediaDesigner']['designerId'],
                    'createdDate' => date('Y-m-d'),
                    'fileId' => $objMedia['mediaDesigner']['fileId']//Google Drive needs this info to update file
                ));                
                $result = $mediaDesigner->save(); 
                if (!$result){                     
                    $response["status"] = ERROR;
                    $response["data"] = INTERNAL_SERVER_ERROR; 
                    return $response;                
                }   
                
                //if mainMedia == 1 -> reset all other media to 0 
                if($objMedia['mainMedia'] == 1)        
                    SharcMediaExperience::where('experienceId', $objMedia['experienceId'])->where('entityType',$objMedia['entityType'])->where('entityId',$objMedia['entityId'])->update(array('mainMedia' => 0));
                //calculate order = get max order + 1
                $maxOrder = SharcMediaExperience::where('experienceId', $objMedia['experienceId'])->where('entityType',$objMedia['entityType'])->where('entityId',$objMedia['entityId'])->max('order');
                if($maxOrder === null)
                    $maxOrder = 0;
                else
                    $maxOrder = $maxOrder + 1;
                $mediaExperience = SharcMediaExperience::create(array(
                    'id' => $objMedia['id'],
                    'mediaDesignerId' => $mediaDesigner->id,
                    'entityType' => $objMedia['entityType'],                  
                    'entityId' => $objMedia['entityId'],
                    'experienceId' => $objMedia['experienceId'],                    
                    'caption' => $objMedia['caption'],
                    'context' => $objMedia['context'],
                    'mainMedia' => $objMedia['mainMedia'],
                    'visible' => $objMedia['visible'],
                    'order' => $maxOrder,
                    'size' => $objMedia['mediaDesigner']['size']
                ));
                
                                
                $result = $mediaExperience->save();
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS;
                    $mediaExperience["mediaDesigner"] = $mediaDesigner->toArray();//need to return this info too for presentation          
                    $response["data"] = $mediaExperience->toArray();
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
         * Compress an Image
         * @param String $objMedia: a json object containing info of Media                  
         */
        public static function compressImage($objMedia) {
            $response = array();
            try{
                $inFile = $objMedia['fileName']; //id of designer actually
                //$imageURI 	= htmlspecialchars($_POST['imageData']);        
                $imageURI 	= $objMedia['imageData'];
                $encodedData = substr($imageURI,strpos($imageURI,",")+1);
                $encodedData = str_replace(' ','+',$encodedData);
                $decodedData = base64_decode($encodedData); 
                $inFile = $inFile.".jpg";       
                $outFile	= 'data/'.$inFile;                
                $ret = file_put_contents($outFile, $decodedData);
                if (!$ret) 
        		{			
                    $response["status"] = ERROR;
                    $response["data"] = 'Could not compress the image. ' . error_get_last();
        		}
                else
                {
                   $response["status"] = SUCCESS;
                   $response["data"] = $inFile;
                }                                
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }
        
        
        /**
         * Get all media associated with an entity
         * @param $objMediaParam: entityType, entityId, experienceId, designerId         
         */
        public static function getMediaForEntity($designerId, $experienceId, $entityId, $entityType){            
            $response = array();
            try{    
                //Get all mediaexperience
                if($designerId == ADMIN_ID){//admin
                    $ex = SharcExperience::find($experienceId);
                    $designerId = $ex->designerId;
                }
                $mediaExperience = SharcMediaExperience::where('entityId',$entityId)->where('entityType',$entityType)->where('experienceId',$experienceId)->orderBy('order')->get();
                //$mediaExperience = $mediaExperience->sortBy('order');
                $response["status"] = SUCCESS;
                //Get mediadesigner for each mediaexperience
                $i = 0;
                for ($i = 0; $i< $mediaExperience->count(); $i++) {
                    $mediaDesigner = SharcMediaDesigner::where('id',$mediaExperience[$i]->mediaDesignerId)->where('designerId',$designerId)->get();
                    $mediaExperience[$i]["mediaDesigner"] = $mediaDesigner[0]->toArray();
                }                    
                $response["data"] = $mediaExperience->toArray();
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
        
        /**
         * Get all media associated with an entity
         * @param $objMediaParam: entityType, entityId, experienceId         
         */
        public static function getMediaForEntityForSpet($experienceId, $entityId, $entityType){            
            $response = array();
            try{    
                //Get all mediaexperience                
                $mediaExperience = SharcMediaExperience::where('entityId',$entityId)->where('entityType',$entityType)->where('experienceId',$experienceId)->orderBy('order')->get();
                //$mediaExperience = $mediaExperience->sortBy('order');
                $response["status"] = SUCCESS;
                //Get mediadesigner for each mediaexperience
                $i = 0;
                for ($i = 0; $i< $mediaExperience->count(); $i++) {
                    $mediaDesigner = SharcMediaDesigner::where('id',$mediaExperience[$i]->mediaDesignerId)->get();
                    $mediaExperience[$i]["mediaDesigner"] = $mediaDesigner[0]->toArray();
                }                    
                $response["data"] = $mediaExperience->toArray();
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
        /**
         * Get all media associated with an entity
         * @param $objMediaParam: entityType, entityId, experienceId, designerId         
         */
        public static function getMediaForEntityServer($designerId, $experienceId, $entityId, $entityType){
            try{    
                //Get all mediaexperience
                $mediaExperience = SharcMediaExperience::where('entityId',$entityId)->where('entityType',$entityType)->where('experienceId',$experienceId)->orderBy('order')->get();
                $i = 0;
                for ($i = 0; $i< $mediaExperience->count(); $i++) {
                    $mediaDesigner = SharcMediaDesigner::where('id',$mediaExperience[$i]->mediaDesignerId)->where('designerId',$designerId)->get();
                    $mediaExperience[$i]["mediaDesigner"] = $mediaDesigner[0]->toArray();
                }                    
                return $mediaExperience;
            }
            catch(Exception $e){
                return null;
            }   
        }
        
        /**
         * Get experience size
         * @param $objMediaParam:  experienceId, designerId         
         */
        public static function getMediaSizeForExperience($designerId, $experienceId){
            try{    
                //Get all mediaexperience
                $mediaExperience = SharcMediaExperience::where('experienceId',$experienceId)->get();
                $i = 0;
                $size = 0;
                for ($i = 0; $i< $mediaExperience->count(); $i++) {
                    $mediaDesigner = SharcMediaDesigner::where('id',$mediaExperience[$i]->mediaDesignerId)->where('designerId',$designerId)->get();
                    $size += $mediaDesigner[0]->size;
                }   
                $size /= 1024*1024;//convert to MB                 
                return $size;
            }
            catch(Exception $e){
                return 0;
            }   
        }
        
        /**
         * Update media order of an entity
         * @param $objMediaParam: entityType, entityId, experienceId, designerId and mediaOrder        
         */
        public static function updateMediaForEntity($designerId, $experienceId, $entityId, $entityType, $objMediaOrder){
            $response = array();
            try{    
                $mediaOrderId = explode(" ", $objMediaOrder);
                $i = 0;
                for ($i = 0; $i< count($mediaOrderId); $i++) {
                    $mediaExperience = SharcMediaExperience::find($mediaOrderId[$i]);
                    if($mediaExperience != null){
                        $mediaExperience->order = $i;
                        $mediaExperience->save();
                    }
                }                    
                $response["data"] = "";
                $response["status"] = SUCCESS;
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
        /**
         * Delete a Media item = delete SharcMediaExperience only
         * @param String $objMedia: a json object containing info of Media ID and designer ID                  
         */
        public static function deleteMedia($objMedia) {
            $response = array();
            try{
                $mediaExperience = SharcMediaExperience::find($objMedia['mediaId']);
                if($mediaExperience != null){
                    //Identify permission
                    $mediaDesigner = SharcMediaDesigner::find($mediaExperience->mediaDesignerId);
                    if($mediaDesigner->designerId == $objMedia['designerId']){
                        $mediaExperience->delete();
                        $response["status"] = SUCCESS;
                        $response["data"] = $mediaExperience->toArray();
                    }
                    else{
                        $response["status"] = FAILED;
                        $response["data"] = MEDIA_NOT_AUTHORIZED;
                    }
                }   
                else {  //error
                    $response["status"] = FAILED;
                    $response["data"] = MEDIA_NOT_FOUND;                                    
                }               
            }
            catch(Exception $e) {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }    
            return $response;                 
        }
        
        /**
         * Update a Media = 1 SharcMediaDesigner + 1 SharcMediaExperience
         * @param String $objMedia: a json object containing info of both Medias                  
         */
        public static function updateMedia($objMedia) {            
            $response = array();
            try{
                $mediaDesigner = SharcMediaDesigner::find($objMedia['mediaDesigner']['id']);
                if($mediaDesigner != null) {
                
                    /*$mediaDesigner->name = $objMedia['mediaDesigner']['name'];                   
                    $mediaDesigner->directed = $objMedia['mediaDesigner']['directed'];
                    $mediaDesigner->colour = $objMedia['mediaDesigner']['colour'];
                    $mediaDesigner->path = $objMedia['mediaDesigner']['path'];
                    
                    $result = $mediaDesigner->save();
                     
                    if (!$result){                     
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR; 
                        return $response;                
                    }
                    */
                }           
                
                $mediaExperience = SharcMediaExperience::find($objMedia['id']);
                if($mediaExperience != null){                    
                    //if mainMedia == 1 -> reset all other media to 0 
                    if($objMedia['mainMedia'] == 1)        
                        SharcMediaExperience::where('experienceId', $objMedia['experienceId'])->where('entityType',$objMedia['entityType'])->where('entityId',$objMedia['entityId'])->update(array('mainMedia' => 0));
                    
                    $mediaExperience->caption = $objMedia['caption'];
                    $mediaExperience->mainMedia = $objMedia['mainMedia'];
                    $mediaExperience->visible = $objMedia['visible'];
                    $mediaExperience->order = $objMedia['order'];
                    $result = $mediaExperience->save(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;
                        $mediaExperience["mediaDesigner"] = $mediaDesigner->toArray();//need to return this info too for presentation
                        $response["data"] = $mediaExperience->toArray();
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
         * Get Media Library for a designer
         * @param int $designerId, @realId -> only authorised designer can gets all his media                  
         */
        public static function getMediaLibrary($realId, $designerId){
            $response = array();
            try{
                if($realId == $designerId){
                    $mediaDesigner = SharcMediaDesigner::where('designerId',$designerId)->get();
                    $response["status"] = SUCCESS;
                    $response["data"] = $mediaDesigner->toArray();
                }
                else{
                    $response["status"] = FAILED;
                    $response["data"] = MEDIA_NOT_AUTHORIZED;
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