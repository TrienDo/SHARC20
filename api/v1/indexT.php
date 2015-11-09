<?php
	echo "100001\n";	
    
    //require "vendor/slim/slim/Slim/Slim.php";
    require 'vendor/autoload.php';
    echo "100002\n";	
	//\Slim\Slim::registerAutoloader();
    echo "100003\n";
	$app = new \Slim\Slim();
    echo "100004\n";
    	
	/*$app->get('/hello/:name', function ($name) {
		echo "Hello, $name";
	});
	*/
	$app->get('/hello', function () {
		echo "Hello kjghkh";
	});
	$app->run();
?>