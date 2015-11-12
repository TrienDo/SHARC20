<?php
 
    /**
     * This class to handle all db operations relating to a SharcUser     
     *
     * @author: Trien Do  
     */
    class UserService {
     
        function __construct() {
                
        }
      
        
        /**
         * Create a new user
         * @param String $objUser: a json object of SharcUser                  
         */
        public static function userLogin($objUser) {
            $user = null;
            $response = array();
            try{
                $rs = SharcUser::where('email',$objUser['email'])->where('cloudType',$objUser['cloudType'])->get();
                if ($rs->count() == 0){ //Not exists -> add a new user 
                    $user = SharcUser::create(array(
                        'username' => $objUser['username'],                   
                        'email' => $objUser['email'],
                        'registrationDate' => date('Y-m-d'),
                        'lastOnline' => date('Y-m-d'),
                        'cloudType' => $objUser['cloudType'],
                        'cloudAccountId' => $objUser['cloudAccountId'],                   
                        'apiKey' => Utils::generateApiKey()
                    ));
                    
                    $result = $user->save(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;            
                        $response["data"] = $user->toArray();    
                    }   
                    else {  //error
                        $response["status"] = ERROR;
                        $response["data"] = INTERNAL_SERVER_ERROR;                
                    }
                } 
                else {//exists -> update lastLogin and generate new apiKey
                    $user = $rs[0];
                    $user->lastOnline = date('Y-m-d');
                    //$user->apiKey = Utils::generateApiKey();//uncomment this for final version
                    
                    $result = $user->save(); 
                    if ($result){ //= 1 success
                        $response["status"] = SUCCESS;            
                        $response["data"] = $user->toArray();    
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
        
        public static function checkAuthentication($apiKey) {
            $response = array();
            try{
                $rs = SharcUser::where('apiKey',$apiKey)->get();
                if ($rs->count() == 0){ //Not exists -> add a new user
                    $response["status"] = FAILED;
                    $response["data"] = USER_NOT_AUTHENTICATED;
                }
                else {
                    $response["status"] = SUCCESS;
                    $response["data"] = $rs[0];
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