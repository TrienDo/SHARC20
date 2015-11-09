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
            $rs = SharcUser::where('email',$objUser['email'])->get();
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
                
                $result = $user->save();//= 1 success
                if ($result)  
                    return $user;
                else  
                    return null;
            } 
            else {//exists -> update lastLogin and generate new apiKey
                $user = $rs[0];
                $user->lastOnline = date('Y-m-d');
                $user->apiKey = Utils::generateApiKey();
                $user->save();
                return $user; 
            }                 
        }
        
        public static function getAllUsers()
        {
            return SharcUser::all();
        }
     
        
        /**
         * Checking user login
         * @param String $email User login email id
         * @param String $password User login password
         * @return boolean User login status success/fail
         */
        public static function checkLogin($email, $password) {
            // fetching user by email 
            $user = User::where('email',$email)->get();
            if($user->count() > 0){ 
                $password_hash = $user[0]->password;
                if(PassHash::check_password($password_hash, $password)) {
                    //Generate new API everytime log in so old API become invalid
                    $user[0]->apiKey = Utils::generateApiKey();
                    $user[0]->save();
                    return $user[0];
                }
                else  
                    return NULL;
            } 
            else return NULL;
        }
     
       
        /**
         * Fetching user api key
         * @param String $user_id user id primary key in user table
         */
        public function getApiKeyById($user_id) {
            $stmt = $this->conn->prepare("SELECT api_key FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            if ($stmt->execute()) {
                $api_key = $stmt->get_result()->fetch_assoc();
                $stmt->close();
                return $api_key;
            } else {
                return NULL;
            }
        }
     
        /**
         * Fetching user id by api key
         * @param String $api_key user api key
         */
        public function getUserId($api_key) {
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE api_key = ?");
            $stmt->bind_param("s", $api_key);
            if ($stmt->execute()) {
                $user_id = $stmt->get_result()->fetch_assoc();
                $stmt->close();
                return $user_id;
            } else {
                return NULL;
            }
        }
     
        /**
         * Validating user api key
         * If the api key is there in db, it is a valid key
         * @param String $api_key user api key
         * @return boolean
         */
        public function isValidApiKey($api_key) {
            $stmt = $this->conn->prepare("SELECT id from users WHERE api_key = ?");
            $stmt->bind_param("s", $api_key);
            $stmt->execute();
            $stmt->store_result();
            $num_rows = $stmt->num_rows;
            $stmt->close();
            return $num_rows > 0;
        }
    }
 
?>