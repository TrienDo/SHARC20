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
         * Create a new user
         * @param String $objExperience: a json object of SharcExperience                  
         */
        public static function addNewExperience($objExperience) {
            $experience = null;
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
                
                $result = $experience->save();//= 1 success
                if ($result)  
                    return $experience;
                else  
                    return null;
            } 
            else {//exists -> update lastLogin and generate new apiKey
                return $experience; 
            }                 
        }
        
        public static function updateExperience($id, $objExperience) {
            $experience = null;
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
                                
                $result = $experience->save();//= 1 success
                if ($result)  
                    return $experience;
                else  
                    return null;
            } 
            else {//exists -> update lastLogin and generate new apiKey
                return null; 
            }                 
        }
        
        public static function getExperienceFromId($id)
        {
            return SharcExperience::find($id);
        }
        
        public static function getAllExperiences()
        {
            return SharcExperience::all();
        }
        
        public static function deleteExperienceFromId($id)
        {
            $experience = SharcExperience::find($id);
            if($experience!=null)
            {
                $result = $experience->delete();//= 1 success
                if ($result)  
                    return 1;
                else  
                    return 0;
            }
            else
                    return 0;
        }
    }
 
?>