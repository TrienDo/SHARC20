<?php
 
    /**
     * This class to handle all db operations relating to SharcResponse     
     *
     * @author: Trien Do  
     */
    class ResponseService {
        
        function __construct() {
                
        }
        
         
        
        /**
         * Create a new Response = 1 SharcResponseDesigner + 1 SharcResponseExperience
         * @param String $objResponse: a json object containing info of both Response                  
         */
        public static function addNewResponse($objResponse) {
            $response = array();
            try{
                //'contentType', 'content', 'size', 'designerId'
                $sharcResponse = SharcResponse::create(array(
                    'id' => $objResponse['id'],
                    'experienceId' => $objResponse['experienceId'],
                    'userId' => $objResponse['userId'],                       
                    'contentType' => $objResponse['contentType'],                   
                    'content' => $objResponse['content'],
                    'description' => $objResponse['description'],
                    'entityType' => $objResponse['entityType'],                  
                    'entityId' => $objResponse['entityId'],
                    'status' => $objResponse['status'],
                    'size' => $objResponse['size'],
                    'submittedDate' => $objResponse['submittedDate']
                ));
                
                $experience = SharcExperience::find($sharcResponse->experienceId);
                $status = "";
                if($experience != null){//change status of response based on moderation mode
                    switch($experience->moderationMode){
                        case 0:
                            $sharcResponse->status = "accepted";
                            $status = "accepted. Other people will be able to see your response";
                            //Create a mew POI here if response is for a new location
                            if($sharcResponse->entityType == "NEW"){
                                //Create a new POI
                                $objPoi = array();
                                $objPoi['id'] = 0;
                                $objPoi['experienceId'] = $sharcResponse->experienceId;
                                $objPoi['description'] = "Created from a response";
                                $objPoi['typeList'] = "";
                                $objPoi['eoiList'] = "";
                                $objPoi['routeList'] = "";                                
                                $objPoi['poiDesigner'] = array();
                                $objPoi['poiDesigner']['id'] = 0;
                                $objPoi['poiDesigner']['name'] = $sharcResponse->description." (created by a user named $curResponse->userId)";
                                $objPoi['poiDesigner']['coordinate'] = $sharcResponse->entityId;
                                $objPoi['poiDesigner']['triggerZone'] = "circle 00ff00 20 ".$sharcResponse->entityId;
                                $objPoi['poiDesigner']['designerId'] = $experience->designerId; 
                                $response = PoiService::addNewPoi($objPoi);
                            	//Create a media
                                if($response["status"] == SUCCESS){                               
                                    $objMedia = array();
                                    $objMedia['id'] = 0;
                                    $objMedia['entityType'] = "POI";
                                    $objMedia['entityId'] = $response['data']['id'];
                                    $objMedia['experienceId'] = $sharcResponse->experienceId;                                    
                                    $objMedia['caption'] = $sharcResponse->description;                                    
                                    $objMedia['context'] = "";
                                    if($sharcResponse->contentType == "image")
                                        $objMedia['mainMedia'] = 1;
                                    else
                                        $objMedia['mainMedia'] = 0;                                        
                                    $objMedia['visible'] = 1;
                                    $objMedia['order'] = 0;                                    
                                    $objMedia['mediaDesigner'] = array();
                                    $objMedia['mediaDesigner']['id'] = $sharcResponse->id; 
                                    $objMedia['mediaDesigner']['name'] = $sharcResponse->description;
                                    $objMedia['mediaDesigner']['contentType'] = $sharcResponse->contentType;
                                    $objMedia['mediaDesigner']['content'] = $sharcResponse->content;
                                    $objMedia['mediaDesigner']['size'] = $sharcResponse->size;
                                    $objMedia['mediaDesigner']['designerId'] = $experience->designerId; 
                                    $response = MediaService::addNewMedia($objMedia);
                                }
                                $sharcResponse->status = "Made a new POI";
                            }
                            break;
                        case 1:
                            $sharcResponse->status = "waiting";
                            $status = "submitted and is waiting for moderation. We will notify you the outcome once the moderator has made a decision";
                            break;
                        case 2:
                            $sharcResponse->status = "private";
                            $status = "submitted successfully. However only you can see this response via our SPVT tool because the designer of this experience has chosen not to show responses in their experience";
                            break;                        
                    }
                }
                       
                $result = $sharcResponse->save();
                
                if ($result){ //= 1 success
                    $response["status"] = SUCCESS;
                    $response["data"] = $sharcResponse->toArray();
                    $proName	= $experience->name;
                    
                    //Get consumer info
                    $user = SharcUser::find($sharcResponse->userId);
                    $conEmail	= $user->email;
                    $conName	= $user->username;
                    
                    //Sending email to designer if moderate is needed
                    $subject = "A new response from SMEP";
                    if($experience->moderationMode == 1){
                        $user = SharcUser::find($experience->designerId);                    
                        $authEmail 		= $user->email;        
                        $authName 		= $user->username;                        
                        $msg = "Dear $authName \n\nA response has been submitted to your $proName experience by $conName. Please sign into SLAT to moderate the response. Once you have logged in, please go to menu Response -> Moderate new responses \n\nPlease do not reply to this automatic email. You can contact us at thesharcproject@gmail.com.\n\nThank you.\n\nThe SHARC project team.";
                        $headers = "From: SHARC-Authoring-Tool" . "\r\n" . "CC: thesharcproject@gmail.com";
                        // use wordwrap() if lines are longer than 70 characters //$msg = wordwrap($msg,70);
                        mail($authEmail,$subject,$msg,$headers);		
                    }
                    
                    $msg = "Dear $conName \n\nYour response to the $proName experience has been $status.\n\nPlease do not reply to this automatic email. You can contact us at thesharcproject@gmail.com.\n\nThank you.\n\nThe SHARC project team.";
                    $headers = "From: SMET" . "\r\n" . "CC: thesharcproject@gmail.com";
                    mail($conEmail,$subject,$msg,$headers);
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
        
        /**
         * Update a Response
         * @param String $objResponse: a json object containing info of a Response                  
         */
        public static function updateResponse($objResponse) {            
            $response = array();
            try{
                $sharcResponse = SharcResponse::find($objResponse['id']);
                if($sharcResponse != null){
                    $sharcResponse->entityType = $objResponse['entityType'];
                    $sharcResponse->entityId = $objResponse['entityId'];
                    $sharcResponse->status = $objResponse['status'];
                    
                    $result = $sharcResponse->save(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;                        
                        $response["data"] = $sharcResponse->toArray();
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