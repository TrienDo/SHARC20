<?php
 
    /**
     * This class to handle all db operations relating to a SharcMediaDesigner and SharcMediaExperience     
     *
     * @author: Trien Do  
     */
    class MediaService {
     
        function __construct() {
                
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
                    'id' => $objMedia['mediaDesigner']['id'],
                    'contentType' => $objMedia['mediaDesigner']['contentType'],                   
                    'content' => $objMedia['mediaDesigner']['content'],
                    'size' => $objMedia['mediaDesigner']['size'],                   
                    'designerId' => $objMedia['mediaDesigner']['designerId']
                ));                
                $result = $mediaDesigner->save(); 
                if (!$result){                     
                    $response["status"] = ERROR;
                    $response["data"] = INTERNAL_SERVER_ERROR; 
                    return $response;                
                }   
                         
                //'mediaDesignerId', 'entityType','entityId', 'experienceId','caption', 'context', 'mainMedia', 'visible', 'order'
                //calculate order
                $rs = SharcMediaExperience::where('experienceId', $objMedia['experienceId'])->where('entityType',$objMedia['entityType'])->where('entityId',$objMedia['entityId'])->get();
                $mediaExperience = SharcMediaExperience::create(array(
                    'mediaDesignerId' => $mediaDesigner->id,
                    'entityType' => $objMedia['entityType'],                  
                    'entityId' => $objMedia['entityId'],
                    'experienceId' => $objMedia['experienceId'],                    
                    'caption' => $objMedia['caption'],
                    'context' => $objMedia['context'],
                    'mainMedia' => $objMedia['mainMedia'],
                    'visible' => $objMedia['visible'],
                    'order' => $rs->count()
                ));
                
                                
                $result = $mediaExperience->save(); 
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS; 
                    //$mediaExperience->$mediaDesigner          
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
                $mediaExperience = SharcMediaExperience::where('entityId',$entityId)->where('entityType',$entityType)->where('experienceId',$experienceId)->get();
                $mediaExperience = $mediaExperience->sortBy('order');
                $response["status"] = SUCCESS;
                //Get mediadesigner for each mediaexperience
                $i = 0;
                for ($i; $i< $mediaExperience->count(); $i++) {
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
        
    } 
?>