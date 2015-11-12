<?php

    //Database information
    $settings = array(
        'driver' => 'mysql',
        'host' => 'localhost',
        'database' => 'sharc20',
        'username' => 'sharc',
        'password' => 'Sharc2013_db',
        'charset'   => 'utf8',
        'collation' => 'utf8_general_ci',
        'prefix' => ''
    );
 
    //Define general constants
    define('SUCCESS', "success");
    define('FAILED', "failed");
    define('ERROR', "error");            
    define('INTERNAL_SERVER_ERROR', "Sorry, an error occurred on our server.");
    
    //Constants for Experience
    define('EXPERIENCE_EXIST', "This name already exists. Please use another name for your experience.");
    define('EXPERIENCE_NOT_EXIST', "Could not find any experience with the submitted id.");
    define('EXPERIENCES_NOT_FOUND', "There are no experiences at the moment.");
    //Constants for Users
    define('USER_NOT_AUTHENTICATED', "User not authenticated.");
    
    
    
        
    //Bootstrap Eloquent ORM -> https://laracasts.com/lessons/how-to-use-eloquent-outside-of-laravel
    use Illuminate\Database\Capsule\Manager as Capsule;
 
    $capsule = new Capsule; 
    $capsule->addConnection($settings);
    $capsule->setAsGlobal();
    $capsule->bootEloquent();
 
    //Each table of the sharc20 database is created by one of the blocks below. 
    //If you want to change the structure of a table:
    // 1 - Uncomment that block 
    // 2 - Make changes
    // 3 - Run the server
    // 4 - Comment the block again
    
    //Table SharcUsers  
    /*
    Capsule::schema()->dropIfExists('SharcUsers');
    Capsule::schema()->create('SharcUsers', function($table)
    {
        $table->increments('id');
        $table->string('username');        	
        $table->string('email');        
        $table->date('registrationDate');
        $table->date('lastOnline');
        $table->string('cloudType');
        $table->string('cloudAccountId');
        $table->string('apiKey');
    });
    */
    
    //Table SharcExperience  
    /*
    Capsule::schema()->dropIfExists('SharcExperiences');
    Capsule::schema()->create('SharcExperiences', function($table)
    {
        $table->increments('id');
        $table->string('name');        	
        $table->string('description');        
        $table->date('createdDate');
        $table->date('lastPublishedDate');
        $table->integer('designerId')->unsigned();
        $table->foreign('designerId')->references('id')->on('SharcUsers');
        $table->boolean('isPublished');//0 not published - 1 published
        $table->integer('moderationMode');//0: No moderation (accept all responses)- 1: Moderation - 2: Responses are not allowed
        $table->string('latLng');
        $table->string('summary');
        $table->string('snapshotPath');
        $table->string('thumbnailPath');
        $table->integer('size');
        $table->string('theme');
    });
    */
?>
