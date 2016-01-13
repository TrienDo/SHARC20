<?php
 
    /**
     * This class to handle db operations relating to a SharcExperience     
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
                        'id' => $objExperience['id'],
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
         * @param String $id: id of the SharcExperience
         * @param String $objExperience: a json object of SharcExperience
         * @param String $designerId: id of the designer
         */
        public static function updateExperience($id, $objExperience, $designerId) {
            $response = array();
            try{
                $experience = SharcExperience::find($id); 
                if($experience->designerId != $designerId){
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_NOT_AUTHORIZED; 
                    return $response;
                }
                           
                if ($experience != null){ 
                    $experience->name = $objExperience['name'];                   
                    $experience->description = $objExperience['description'];
                    $experience->lastPublishedDate = date('Y-m-d');
                    $experience->isPublished = $objExperience['isPublished'];                    
                    $experience->moderationMode = $objExperience['moderationMode'];
                    $experience->latLng = $objExperience['latLng'];
                    $experience->summary = $objExperience['summary'];
                    $experience->snapshotPath = $objExperience['snapshotPath'];                                       
                    $experience->thumbnailPath = $objExperience['thumbnailPath'];
                    //$experience->size = SharcMediaExperience::where('experienceId', $objExperience['experienceId'])->sum('size');
                    $experience->size = MediaService::getMediaSizeForExperience($designerId, $objExperience['id']);
                    if($experience->size == 0)
                        $experience->size = 1;
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
         * @param String $id: id of the SharcExperience         
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
         * @param String $id: id of the designer         
         */
        public static function getExperienceOfDesigner($id)
        {
            $response = array();
            try{    
                $response["status"] = SUCCESS;
                if($id == ADMIN_ID)//admin
                    $response["data"] = SharcExperience::all()->toArray();
                else            
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
         * Get experiences consumed by a user
         * @param String $id: id of the user         
         */
        public static function getExperienceOfConsumer($id)
        {
            $response = array();
            $experiences = array();            
            try{    
                $response["status"] = SUCCESS;
                if($id == ADMIN_ID)//admin
                    $experiences = SharcConsumerExperience::all();
                else            
                    $experiences = SharcConsumerExperience::where('userId',$id)->get();
                $i = 0;                  
                for ($i = 0; $i< $experiences->count(); $i++) {
                    //echo SharcExperience::find($experiences[$i]->experienceId)->toJson();
                    $experiences[$i] = SharcExperience::find($experiences[$i]->experienceId);
                }
                $response["data"] =  $experiences->toArray();   
            }
            catch(Exception $e)
            {
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;
        }
        
        /**
         * Get all published experiences
         */
        public static function getPublishedExperiences()
        {
            $response = array();
            try{                
                $response["status"] = SUCCESS;            
                $response["data"] = SharcExperience::where('isPublished',true)->get()->toArray();
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
         * @param String $experienceId: id of the SharcExperience         
         * @param String $designerId: id of the SharcUser -> experience can be deleted by its owner only
         */
        public static function deleteExperience($designerId, $experienceId)
        {
            $response = array();
            try{    
                $experience = SharcExperience::find($experienceId);                
                if($experience!=null)
                {
                    if($experience->designerId == $designerId){
                        $result = $experience->delete();
                        if ($result){ //= 1 success
                            $response["status"] = SUCCESS;            
                            $response["data"] = SharcExperience::where('designerId',$designerId)->get()->toArray();    
                        }   
                        else {  //error
                            $response["status"] = ERROR;
                            $response["data"] = INTERNAL_SERVER_ERROR;                
                        }    
                    }
                    else{
                        $response["status"] = FAILED;
                        $response["data"] = EXPERIENCE_NOT_AUTHORIZED;
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
         * Get content of an experience -> use when loading an experience from SLAT
         * @param String $experienceId: id of the SharcExperience
         * @param String $designerId: id of the designer           
         */
        public static function getExperienceContent($designerId, $experienceId){
            $response = array();
            try{    
                //Check if the designerId owns the experience
                if($designerId == ADMIN_ID){//admin
                    $ex = SharcExperience::find($experienceId);
                    $designerId = $ex->designerId;
                }
                $rs = SharcExperience::where('id',$experienceId)->where('designerId',$designerId)->get();
                if ($rs->count() == 0){ //Not exists 
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_NOT_EXIST;
                    return $response; 
                }
                else {
                    $response["status"] = SUCCESS;
                    //Get all POIs of the experience
                    $objPois = SharcPoiExperience::where('experienceId',$experienceId)->get();            
                    $tmpPois = $objPois->toArray();                    
                    $i = 0;
                    for ($i; $i< $objPois->count(); $i++) {
                        $rs = SharcPoiDesigner::where('id',$objPois[$i]->poiDesignerId)->where('designerId',$designerId)->get();
                        $tmpPois[$i]["poiDesigner"] = $rs[0]->toArray();
                        //Thumbnail
                        $media = SharcMediaExperience::where('entityId',$objPois[$i]->id)->where('entityType','POI')->where('mainMedia',1)->get();
                        if($media->count() > 0){                        
                            $mediaDesigner = SharcMediaDesigner::where('id',$media[0]->mediaDesignerId)->where('designerId',$designerId)->get();
                            if($mediaDesigner->count() > 0)
                                $tmpPois[$i]["thumbnail"] = $mediaDesigner[0]->content;
                            else
                                $tmpPois[$i]["thumbnail"] = "";
                        }
                        else
                            $tmpPois[$i]["thumbnail"] = "";
                                                        
                        $media = SharcMediaExperience::where('entityId',$objPois[$i]->id)->where('entityType','POI')->get();
                        $tmpPois[$i]["mediaCount"] = $media->count();
                        $tmpPois[$i]["responseCount"] = 0; 
                    }                    
                    $response["data"]["allPois"] = $tmpPois;
                    //Get all EOIs of the experience
                    $objEois = SharcEoiExperience::where('experienceId',$experienceId)->get();            
                    $tmpEois = $objEois->toArray();                    
                    $i = 0;
                    for ($i; $i< $objEois->count(); $i++) {
                        $rs = SharcEoiDesigner::where('id',$objEois[$i]->eoiDesignerId)->where('designerId',$designerId)->get();
                        $tmpEois[$i]["eoiDesigner"] = $rs[0]->toArray();
                        $media = SharcMediaExperience::where('entityId',$objEois[$i]->id)->where('entityType','EOI')->get();
                        $tmpEois[$i]["mediaCount"] = $media->count();
                        $tmpEois[$i]["responseCount"] = 0;
                    }                    
                    $response["data"]["allEois"] = $tmpEois;
                    //Get all Routes of the experience
                    $objRoutes = SharcRouteExperience::where('experienceId',$experienceId)->get();            
                    $tmpRoutes = $objRoutes->toArray();                    
                    $i = 0;
                    for ($i; $i< $objRoutes->count(); $i++) {
                        $rs = SharcRouteDesigner::where('id',$objRoutes[$i]->routeDesignerId)->where('designerId',$designerId)->get();
                        $tmpRoutes[$i]["routeDesigner"] = $rs[0]->toArray();
                        $media = SharcMediaExperience::where('entityId',$objRoutes[$i]->id)->where('entityType','ROUTE')->get();
                        $tmpRoutes[$i]["mediaCount"] = $media->count();
                        $tmpRoutes[$i]["responseCount"] = 0;
                    }                    
                    $response["data"]["allRoutes"] = $tmpRoutes;
                    
                    //Get all responses
                    $objResponses = SharcResponse::where('experienceId',$experienceId)->get();
                    $tmpResponse = $objResponses->toArray();                    
                    $i = 0;
                    for ($i; $i< $objResponses->count(); $i++) {
                        $rs = SharcUser::find($objResponses[$i]->userId);
                        if ($rs != null)
                        $tmpResponse[$i]["userId"] = $rs->username;
                        //get entity name as well
                        switch($objResponses[$i]->entityType){
                            case "POI":
                                $obj = SharcPoiExperience::find($objResponses[$i]->entityId);                                
                                $tmpResponse[$i]["entityId"] = SharcPoiDesigner::find($obj->poiDesignerId)->name;
                                break;
                            case "EOI":
                                $obj = SharcEoiExperience::find($objResponses[$i]->entityId);                                
                                $tmpResponse[$i]["entityId"] = SharcEoiDesigner::find($obj->eoiDesignerId)->name;
                                break;
                            case "ROUTE":
                                $obj = SharcRouteExperience::find($objResponses[$i]->entityId);                                
                                $tmpResponse[$i]["entityId"] = SharcRouteDesigner::find($obj->routeDesignerId)->name;
                                break;
                            case "media":
                                break;    
                        }
                    }             
                    $response["data"]["allResponses"] = $tmpResponse;
                    
                    //Get all PoiType of the experience
                    $objPoiTypes = SharcPoiType::where('designerId',$designerId)->get();
                    $response["data"]["allPoiTypes"] = $objPoiTypes->toArray();
                    
                    return $response;
                }
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
        /**
         * Get content of an experience
         * @param String $experienceId: id of the SharcExperience
         * @param String $designerId: id of the designer           
         */
        public static function getExperienceSnapshotForKmlSlat($designerId, $experienceId){
            $response = array();
            try{    
                //Check if the designerId owns the experience
                $rs = SharcExperience::where('id',$experienceId)->where('designerId',$designerId)->get();
                if ($rs->count() == 0){ //Not exists 
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_NOT_EXIST;
                    return $response; 
                }
                else {
                    $response = ExperienceService::getExperienceSnapshotDetails($designerId, $experienceId);
                }
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
        /**
         * Get content of an experience for SMEP
         * @param String $id: id of the SharcExperience         
         */
        public static function getExperienceSnapshotForConsumer($experienceId){
            $response = array();
            try{    
                //Check if the designerId owns the experience
                
                $rs = SharcExperience::find($experienceId);                
                if ($rs == null || $rs->isPublished == 0){ //Not exists 
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_NOT_EXIST;
                    return $response; 
                }
                else{
                    $response = ExperienceService::getExperienceSnapshotDetails($rs->designerId, $experienceId);
                }
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
        
        /**
         * Get content of an experience details - this function is called by two above funtions
         * @param String $experienceId: id of the SharcExperience
         * @param String $designerId: id of the designer           
         */
        public static function getExperienceSnapshotDetails($designerId, $experienceId){
            $response = array();
            $response["status"] = SUCCESS;                    
            //Get all POIs of the experience
            $objPois = SharcPoiExperience::where('experienceId',$experienceId)->get();            
            $tmpPois = $objPois->toArray();                    
            $i = 0;
            for ($i; $i< $objPois->count(); $i++) {
                $rs = SharcPoiDesigner::where('id',$objPois[$i]->poiDesignerId)->where('designerId',$designerId)->get();
                $tmpPois[$i]["poiDesigner"] = $rs[0]->toArray();
                //Thumbnail
                $media = SharcMediaExperience::where('entityId',$objPois[$i]->id)->where('entityType','POI')->where('mainMedia',1)->get();
                if($media->count() > 0){                        
                    $mediaDesigner = SharcMediaDesigner::where('id',$media[0]->mediaDesignerId)->where('designerId',$designerId)->get();
                    if($mediaDesigner->count() > 0)
                        $tmpPois[$i]["thumbnail"] = $mediaDesigner[0]->content;
                    else
                        $tmpPois[$i]["thumbnail"] = "";
                }
                else
                    $tmpPois[$i]["thumbnail"] = "";
                //Media for POI                                
                $media = MediaService::getMediaForEntityServer($designerId, $experienceId, $objPois[$i]->id, "POI");
                //$tmpPois[$i]["media"] = $media->toArray();
                if($media != null)
                    $tmpPois[$i]["mediaCount"] = $media->count();
                else
                    $tmpPois[$i]["mediaCount"] = 0;
                                            
                $tmpPois[$i]["responseCount"] = 0; 
            }                    
            $response["data"]["allPois"] = $tmpPois;
            //Get all EOIs of the experience
            $objEois = SharcEoiExperience::where('experienceId',$experienceId)->get();            
            $tmpEois = $objEois->toArray();                    
            $i = 0;
            for ($i; $i< $objEois->count(); $i++) {
                $rs = SharcEoiDesigner::where('id',$objEois[$i]->eoiDesignerId)->where('designerId',$designerId)->get();
                $tmpEois[$i]["eoiDesigner"] = $rs[0]->toArray();
                //Media for EOI                                
                $media = MediaService::getMediaForEntityServer($designerId, $experienceId, $objEois[$i]->id, "EOI");
                //$tmpEois[$i]["media"] = $media->toArray();
                if($media != null)
                    $tmpEois[$i]["mediaCount"] = $media->count();
                else
                    $tmpEois[$i]["mediaCount"] = 0;
                
                $tmpEois[$i]["responseCount"] = 0;
            }                    
            $response["data"]["allEois"] = $tmpEois;
            
            //Get all Routes of the experience
            $objRoutes = SharcRouteExperience::where('experienceId',$experienceId)->get();            
            $tmpRoutes = $objRoutes->toArray();                    
            $i = 0;
            for ($i; $i< $objRoutes->count(); $i++) {
                $rs = SharcRouteDesigner::where('id',$objRoutes[$i]->routeDesignerId)->where('designerId',$designerId)->get();
                $tmpRoutes[$i]["routeDesigner"] = $rs[0]->toArray();
                //Media for EOI                                
                $media = MediaService::getMediaForEntityServer($designerId, $experienceId, $objRoutes[$i]->id, "ROUTE");
                //$tmpRoutes[$i]["media"] = $media->toArray();
                if($media != null)
                    $tmpRoutes[$i]["mediaCount"] = $media->count();
                else
                    $tmpRoutes[$i]["mediaCount"] = 0;
                                        
                $tmpRoutes[$i]["responseCount"] = 0;
            }                    
            $response["data"]["allRoutes"] = $tmpRoutes;
            
            //Get all Media of the experience
            $objMedia = SharcMediaExperience::where('experienceId',$experienceId)->get();            
            $tmpMedia = $objMedia->toArray();                    
            $i = 0;
            for ($i; $i< $objMedia->count(); $i++) {
                $rs = SharcMediaDesigner::where('id',$objMedia[$i]->mediaDesignerId)->where('designerId',$designerId)->get();
                $tmpMedia[$i]["mediaDesigner"] = $rs[0]->toArray();
                //Response for media                                
                $media = SharcResponse::where('experienceId',$experienceId)->where('entityType','media')->where('entityId', $objMedia[$i]->id)->where('status','accepted')->get();
                if($media != null)
                    $tmpMedia[$i]["commentCount"] = $media->count();
                else
                    $tmpRoutes[$i]["commentCount"] = 0;                
            }             
            $response["data"]["allMedia"] = $tmpMedia;
            
            //Get all responses
            $objResponses = SharcResponse::where('experienceId',$experienceId)->where('status','accepted')->get();
            $tmpResponse = $objResponses->toArray();                    
            $i = 0;
            for ($i; $i< $objResponses->count(); $i++) {
                $rs = SharcUser::find($objResponses[$i]->userId);
                if ($rs != null)
                $tmpResponse[$i]["userId"] = $rs->username;
                //get entity name as well
            }             
            $response["data"]["allResponses"] = $tmpResponse;
                
            //Get all PoiType of the experience
            $objPoiTypes = SharcPoiType::where('designerId',$designerId)->get();
            $response["data"]["allPoiTypes"] = $objPoiTypes->toArray();
            
            return $response;
        }
        
        /**
         * Get content of an experience for SPVT
         * @param String $experienceId: id of the SharcExperience         
         * @param String $userId: id of the SharcUser
         */
        public static function getExperienceSnapshotForSpvt($experienceId, $userId){
            $response = array();
            try{    
                //Check if the designerId owns the experience                
                $rs = SharcExperience::find($experienceId);                
                if ($rs == null || $rs->isPublished == 0){ //Not exists 
                    $response["status"] = FAILED;            
                    $response["data"] = EXPERIENCE_NOT_EXIST;
                    return $response; 
                }
                else{
                    $response = ExperienceService::getSnapshotForSpvt($rs->designerId, $experienceId, $userId);
                }
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
        /**
         * Get content of an experience details - this function is called by two above funtions
         * @param String $experienceId: id of the SharcExperience
         * @param String $designerId: id of the designer 
         * @param String $userId: id of the SharcUser          
         */
        public static function getSnapshotForSpvt($designerId, $experienceId, $userId){
            $response = array();
            $response["status"] = SUCCESS;                    
            //Get all POIs of the experience
            $objPois = SharcPoiExperience::where('experienceId',$experienceId)->get();            
            $tmpPois = $objPois->toArray();                    
            $i = 0;
            for ($i; $i< $objPois->count(); $i++) {
                $rs = SharcPoiDesigner::where('id',$objPois[$i]->poiDesignerId)->where('designerId',$designerId)->get();
                $tmpPois[$i]["poiDesigner"] = $rs[0]->toArray();
                //Thumbnail
                $media = SharcMediaExperience::where('entityId',$objPois[$i]->id)->where('entityType','POI')->where('mainMedia',1)->get();
                if($media->count() > 0){                        
                    $mediaDesigner = SharcMediaDesigner::where('id',$media[0]->mediaDesignerId)->where('designerId',$designerId)->get();
                    if($mediaDesigner->count() > 0)
                        $tmpPois[$i]["thumbnail"] = $mediaDesigner[0]->content;
                    else
                        $tmpPois[$i]["thumbnail"] = "";
                }
                else
                    $tmpPois[$i]["thumbnail"] = "";
                //Media for POI                                
                $media = MediaService::getMediaForEntityServer($designerId, $experienceId, $objPois[$i]->id, "POI");
                $tmpPois[$i]["media"] = $media->toArray();
                //Responses for POI by this user
                $tmpPois[$i]["responses"] = SharcResponse::where('experienceId',$experienceId)->where('userId', $userId)->where('entityId', $objPois[$i]->id)->get()->toArray(); 
            }                    
            $response["data"]["allPois"] = $tmpPois;
                       
            //Get all Routes of the experience
            $objRoutes = SharcRouteExperience::where('experienceId',$experienceId)->get();            
            $tmpRoutes = $objRoutes->toArray();                    
            $i = 0;
            for ($i; $i< $objRoutes->count(); $i++) {
                $rs = SharcRouteDesigner::where('id',$objRoutes[$i]->routeDesignerId)->where('designerId',$designerId)->get();
                $tmpRoutes[$i]["routeDesigner"] = $rs[0]->toArray();
            }                    
            $response["data"]["allRoutes"] = $tmpRoutes;
                        
            //Get all responses                                     
            $response["data"]["allResponses"] = SharcResponse::where('experienceId',$experienceId)->where('userId', $userId)->where('entityType', 'NEW')->get()->toArray();            
            
            return $response;
        }
    }
?>