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
        
        /**
         * Get content of an experience
         * @param int $id: id of the SharcExperience         
         */
        public static function getExperienceContent($designerId, $experienceId){
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
                    return $response;
                }
            }
            catch(Exception $e){
                $response["status"] = ERROR;
                $response["data"] = Utils::getExceptionMessage($e);
            }
            return $response;    
        }
        
    }
 
?>