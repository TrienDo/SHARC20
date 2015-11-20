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
    define('EXPERIENCE_NOT_EXIST', "Could not find any experience with the submitted parameters.");
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
    
    //Table SharcPoiDesigner  
    /*        
    Capsule::schema()->dropIfExists('SharcPoiDesigners');
    Capsule::schema()->create('SharcPoiDesigners', function($table)
    {
        $table->increments('id');
        $table->string('name');        	
        $table->string('coordinate');
        $table->string('triggerZone');
        $table->integer('designerId')->unsigned();
        $table->foreign('designerId')->references('id')->on('SharcUsers');        
    });
    */
    
    //Table SharcPoiExperiences   
    /*
    Capsule::schema()->dropIfExists('SharcPoiExperiences');
    Capsule::schema()->create('SharcPoiExperiences', function($table)
    {
        $table->increments('id');
        $table->integer('experienceId')->unsigned();
        $table->foreign('experienceId')->references('id')->on('SharcExperiences');        
        $table->integer('poiDesignerId')->unsigned();
        $table->foreign('poiDesignerId')->references('id')->on('SharcPoiDesigners');
        $table->string('description'); 
        $table->string('typeList');
        $table->string('eoiList');
        $table->string('routeList');                               
    });
    */
    
    /*
    //Table SharcMediaDesigner  
            
    Capsule::schema()->dropIfExists('SharcMediaDesigners');
    Capsule::schema()->create('SharcMediaDesigners', function($table)
    {
        $table->string('id');
        $table->primary('id');
        $table->string('contentType');        	
        $table->string('content');
        $table->integer('size');
        $table->integer('designerId')->unsigned();
        $table->foreign('designerId')->references('id')->on('SharcUsers');        
    });
    */
    
        
    //Table SharcMediaDesigner  
    /*        
    Capsule::schema()->dropIfExists('SharcMediaExperiences');
    Capsule::schema()->create('SharcMediaExperiences', function($table)
    {
        $table->increments('id');
        $table->string('mediaDesignerId');
        $table->foreign('mediaDesignerId')->references('id')->on('SharcMediaDesigners');
        $table->string('entityType');
        $table->integer('entityId');        	
        $table->integer('experienceId')->unsigned();
        $table->foreign('experienceId')->references('id')->on('SharcExperiences');
        $table->string('caption');
        $table->string('context');
        $table->boolean('mainMedia');
        $table->boolean('visible');
        $table->integer('order');
    });
    */
    
    
    //Table SharcEoiDesigner  
    /*        
    Capsule::schema()->dropIfExists('SharcEoiDesigners');
    Capsule::schema()->create('SharcEoiDesigners', function($table)
    {
        $table->increments('id');
        $table->string('name');        	
        $table->string('description');        
        $table->integer('designerId')->unsigned();
        $table->foreign('designerId')->references('id')->on('SharcUsers');        
    });
    */
    
    
    //Table SharcEoiExperiences   
    /*
    Capsule::schema()->dropIfExists('SharcEoiExperiences');
    Capsule::schema()->create('SharcEoiExperiences', function($table)
    {
        $table->increments('id');
        $table->integer('experienceId')->unsigned();
        $table->foreign('experienceId')->references('id')->on('SharcExperiences');        
        $table->integer('eoiDesignerId')->unsigned();
        $table->foreign('eoiDesignerId')->references('id')->on('SharcEoiDesigners');
        $table->string('note');  
        $table->string('poiList');
        $table->string('routeList');                      
    });
    */       
    
    //Table SharcRouteDesigner  
    /*        
    Capsule::schema()->dropIfExists('SharcRouteDesigners');
    Capsule::schema()->create('SharcRouteDesigners', function($table)
    {
        $table->increments('id');
        $table->string('name');        	
        $table->boolean('directed');
        $table->string('colour',10);   
        $table->text('path');           
        $table->integer('designerId')->unsigned();
        $table->foreign('designerId')->references('id')->on('SharcUsers');        
    });
    */
    
    
    //Table SharcRouteExperiences   
    /*
    Capsule::schema()->dropIfExists('SharcRouteExperiences');
    Capsule::schema()->create('SharcRouteExperiences', function($table)// , routeDesigner, , 
    {
        $table->increments('id');
        $table->integer('experienceId')->unsigned();
        $table->foreign('experienceId')->references('id')->on('SharcExperiences');        
        $table->integer('routeDesignerId')->unsigned();
        $table->foreign('routeDesignerId')->references('id')->on('SharcRouteDesigners');
        $table->string('description');                        
        $table->string('poiList');
        $table->string('eoiList');
    });
    */            
?>
